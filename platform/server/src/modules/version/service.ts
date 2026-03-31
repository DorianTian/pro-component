import type { Knex } from 'knex'
import { VersionRepository } from './repository.js'
import { AppError } from '../../middleware/error-handler.js'
import type { RollbackRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

/** Business logic for version management — list, rollback, deprecate. */
export class VersionService {
  private readonly repo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new VersionRepository(db)
  }

  async listVersions(packageName: string): Promise<
    Array<{
      id: number
      version: string
      status: string
      publishedAt: Date
      hasBreakingChanges: boolean
    }>
  > {
    const pkg = await this.repo.findPackageByName(packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const versions = await this.repo.findVersionsByPackageId(pkg.id)
    return versions.map((v) => ({
      id: v.id,
      version: v.version,
      status: v.status,
      publishedAt: v.published_at,
      hasBreakingChanges: hasBreaking(v.breaking_changes),
    }))
  }

  async getDependencyTree(
    packageName: string,
    version?: string,
  ): Promise<{
    name: string
    version: string
    dependencies: Record<string, string>
    peerDependencies: Record<string, string>
  }> {
    const pkg = await this.repo.findPackageByName(packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const ver = version
      ? await this.repo.findVersion(pkg.id, version)
      : (await this.repo.findPublishedVersions(pkg.id))[0]

    if (!ver) {
      throw new AppError(404, 'VERSION_NOT_FOUND', `No version found for '${packageName}'`)
    }

    return {
      name: packageName,
      version: ver.version,
      dependencies: ver.dependencies ? JSON.parse(ver.dependencies) : {},
      peerDependencies: ver.peer_dependencies ? JSON.parse(ver.peer_dependencies) : {},
    }
  }

  /**
   * Rollback a version for an app.
   *
   * Pre-checks:
   * 1. Target version exists and is published
   * 2. CDN path is set (resource available)
   * 3. Reason is mandatory
   */
  async rollback(versionId: number, input: RollbackRequest, operator: string): Promise<void> {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new AppError(400, 'REASON_REQUIRED', 'Rollback reason is mandatory')
    }

    const version = await this.repo.findVersionById(versionId)
    if (!version) {
      throw new AppError(404, 'VERSION_NOT_FOUND', 'Version not found')
    }

    const pkg = await this.repo.findPackageById(version.package_id)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', 'Package not found')
    }

    const targetVer = await this.repo.findVersion(pkg.id, input.targetVersion)
    if (!targetVer) {
      throw new AppError(
        404,
        'TARGET_VERSION_NOT_FOUND',
        `Target version '${input.targetVersion}' not found`,
      )
    }

    validateRollbackTarget(targetVer.status, targetVer.cdn_path, input.targetVersion)

    await this.db('app_version_maps')
      .where({ package_id: pkg.id, resolved_version: version.version })
      .update({
        resolved_version: input.targetVersion,
        pinned_version: input.targetVersion,
        updated_at: this.db.fn.now(),
      })

    await this.repo.insertEvent({
      package_id: pkg.id,
      action: 'rollback',
      from_version: version.version,
      to_version: input.targetVersion,
      operator,
      reason: input.reason,
      metadata: JSON.stringify({ versionId, cache_bust: true }),
    })

    logger.info(
      {
        packageName: pkg.name,
        fromVersion: version.version,
        toVersion: input.targetVersion,
        operator,
      },
      'Version rollback executed',
    )
  }

  /** Deprecate a version. Sets status to 'deprecated'. */
  async deprecate(versionId: number, operator: string, reason?: string): Promise<void> {
    const version = await this.repo.findVersionById(versionId)
    if (!version) {
      throw new AppError(404, 'VERSION_NOT_FOUND', 'Version not found')
    }

    await this.repo.updateVersionStatus(versionId, 'deprecated')

    await this.repo.insertEvent({
      package_id: version.package_id,
      action: 'deprecate',
      from_version: version.version,
      operator,
      reason: reason || null,
    })
  }
}

/** Check if a version has breaking changes. */
function hasBreaking(breakingChanges: string | null): boolean {
  if (!breakingChanges) return false
  try {
    return JSON.parse(breakingChanges).length > 0
  } catch {
    return false
  }
}

/** Validate rollback target version meets safety criteria. */
function validateRollbackTarget(
  status: string,
  cdnPath: string | null,
  targetVersion: string,
): void {
  if (status !== 'published') {
    throw new AppError(
      400,
      'TARGET_VERSION_NOT_PUBLISHED',
      `Target version '${targetVersion}' is ${status}`,
    )
  }

  if (!cdnPath) {
    throw new AppError(400, 'CDN_PATH_MISSING', `Target version '${targetVersion}' has no CDN path`)
  }
}
