import type { Knex } from 'knex'
import { VersionRepository } from '../version/repository.js'
import { AppRepository } from '../app/repository.js'
import {
  resolve as semverResolve,
  type VersionEntry,
  type VersionRegistry,
} from '../../engines/semver-resolver.js'
import { evaluateRule } from '../../engines/grayscale-evaluator.js'
import { buildCacheKey, buildVersionFingerprint, getCached, setCached } from './cache.js'
import { loadConfig } from '../../config.js'
import { AppError } from '../../middleware/error-handler.js'
import type { ImportMapResponse, GrayscaleContext } from '../../types/index.js'
import type { GrayscaleRuleConfig } from '../../types/grayscale.js'
import { logger } from '../../logger.js'

/** Orchestrates import map generation: grayscale evaluation, semver resolution, caching. */
export class ImportMapService {
  private readonly versionRepo: VersionRepository
  private readonly appRepo: AppRepository

  constructor(private readonly db: Knex) {
    this.versionRepo = new VersionRepository(db)
    this.appRepo = new AppRepository(db)
  }

  /** Generate an import map for an app + user combination. */
  async generate(appId: string, userId?: string): Promise<ImportMapResponse> {
    const config = loadConfig()
    const cdnBase = config.cdn.baseUrl

    const app = await this.appRepo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    const versionMaps = await this.appRepo.getVersionMaps(appId)
    if (versionMaps.length === 0) {
      return { imports: {}, preloads: [], styles: [], sriHashes: {}, cache_bust: false }
    }

    const grayscaleOverrides = await this.evaluateGrayscaleOverrides(appId, userId)
    const registry = await this.buildRegistry()
    const requests = this.buildResolveRequests(versionMaps, grayscaleOverrides)
    const result = semverResolve(requests, registry)

    if (result.conflicts.length > 0) {
      throw new AppError(409, 'DEPENDENCY_CONFLICT', 'Diamond dependency conflict detected', {
        conflicts: result.conflicts,
      })
    }

    const fingerprint = buildVersionFingerprint(result.resolved)
    const cacheKey = buildCacheKey(appId, userId, fingerprint)
    const cached = getCached(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.buildImportMapResponse(result.resolved, versionMaps, cdnBase)
    setCached(cacheKey, response)

    return response
  }

  /** Evaluate active grayscale rules for the given app and user. */
  private async evaluateGrayscaleOverrides(
    appId: string,
    userId: string | undefined,
  ): Promise<Map<number, string>> {
    const overrides = new Map<number, string>()
    if (!userId) return overrides

    const activeRules = await this.db('grayscale_rules').where({
      app_id: appId,
      status: 'active',
    })

    const grayscaleContext: GrayscaleContext = { userId }

    for (const rule of activeRules) {
      const ruleConfig = rule.rule_config
        ? (JSON.parse(rule.rule_config) as GrayscaleRuleConfig)
        : null

      if (ruleConfig && evaluateRule(ruleConfig, grayscaleContext)) {
        overrides.set(rule.package_id, rule.target_version)
        logger.debug(
          { appId, userId, packageId: rule.package_id, targetVersion: rule.target_version },
          'Grayscale rule matched',
        )
      }
    }

    return overrides
  }

  /** Build resolve requests, applying grayscale overrides where applicable. */
  private buildResolveRequests(
    versionMaps: Array<{
      package_id: number
      package_name: string
      pinned_version: string | null
      version_range: string | null
    }>,
    grayscaleOverrides: Map<number, string>,
  ): Array<{ name: string; pinnedVersion?: string; versionRange?: string }> {
    return versionMaps.map((vm) => {
      const grayscaleVersion = grayscaleOverrides.get(vm.package_id)
      if (grayscaleVersion) {
        return { name: vm.package_name, pinnedVersion: grayscaleVersion }
      }
      return {
        name: vm.package_name,
        pinnedVersion: vm.pinned_version || undefined,
        versionRange: vm.version_range || undefined,
      }
    })
  }

  /** Build the full import map response from resolved versions. */
  private async buildImportMapResponse(
    resolved: Map<string, string>,
    versionMaps: Array<{ package_name: string }>,
    cdnBase: string,
  ): Promise<ImportMapResponse> {
    const imports: Record<string, string> = {}
    const preloads: string[] = []
    const styles: string[] = []
    const sriHashes: Record<string, string> = {}

    for (const [name, version] of resolved.entries()) {
      const esmUrl = `${cdnBase}/${name}/${version}/esm/index.mjs`
      imports[name] = esmUrl

      await this.collectVersionMetadata({ name, version, cdnBase, sriHashes, styles })

      const isTopLevel = versionMaps.some((vm) => vm.package_name === name)
      if (!isTopLevel) {
        preloads.push(esmUrl)
      }
    }

    return { imports, preloads, styles, sriHashes, cache_bust: false }
  }

  /** Collect SRI hashes and style URLs for a resolved version. */
  private async collectVersionMetadata(opts: {
    name: string
    version: string
    cdnBase: string
    sriHashes: Record<string, string>
    styles: string[]
  }): Promise<void> {
    const { name, version, cdnBase, sriHashes, styles } = opts
    const pkg = await this.versionRepo.findPackageByName(name)
    if (!pkg) return

    const verRecord = await this.versionRepo.findVersion(pkg.id, version)
    if (!verRecord) return

    if (verRecord.sri_hashes) {
      const hashes = JSON.parse(verRecord.sri_hashes) as Record<string, string>
      for (const [file, hash] of Object.entries(hashes)) {
        const fileUrl = `${cdnBase}/${name}/${version}/${file}`
        sriHashes[fileUrl] = hash
      }
    }

    styles.push(`${cdnBase}/${name}/${version}/style/index.css`)
  }

  /** Build an in-memory VersionRegistry from the database. */
  private async buildRegistry(): Promise<VersionRegistry> {
    const allPackages = await this.db('packages').select('*')
    const allVersions = await this.db('versions').where({ status: 'published' }).select('*')

    const entries: VersionEntry[] = allVersions.map((v) => ({
      name: allPackages.find((p: { id: number }) => p.id === v.package_id)?.name || '',
      version: v.version,
      dependencies: v.dependencies ? JSON.parse(v.dependencies) : {},
      peerDependencies: v.peer_dependencies ? JSON.parse(v.peer_dependencies) : {},
    }))

    return {
      getVersions(packageName: string): VersionEntry[] {
        return entries.filter((e) => e.name === packageName)
      },
      getVersion(packageName: string, version: string): VersionEntry | undefined {
        return entries.find((e) => e.name === packageName && e.version === version)
      },
    }
  }
}
