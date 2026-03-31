import type { Knex } from 'knex'
import { VersionRepository } from '../version/repository.js'
import type { VersionSyncRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

/** Handles npm publish webhook — syncs version metadata to the platform DB. */
export class SyncService {
  private readonly repo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new VersionRepository(db)
  }

  /**
   * Handle npm publish webhook.
   * Idempotent: if the version already exists, skip creation.
   */
  // eslint-disable-next-line complexity -- Sync workflow with multiple validation branches; cohesive as single method
  async syncVersion(
    input: VersionSyncRequest,
    operator: string,
  ): Promise<{ created: boolean; versionId: number }> {
    let pkg = await this.repo.findPackageByName(input.packageName)
    if (!pkg) {
      const pkgId = await this.repo.createPackage({ name: input.packageName })
      pkg = await this.repo.findPackageById(pkgId)
    }

    if (!pkg) {
      throw new Error(`Failed to find or create package: ${input.packageName}`)
    }

    const existing = await this.repo.findVersion(pkg.id, input.version)
    if (existing) {
      logger.info(
        { packageName: input.packageName, version: input.version },
        'Version already exists, skipping sync',
      )
      return { created: false, versionId: existing.id }
    }

    const versionId = await this.repo.createVersion({
      package_id: pkg.id,
      version: input.version,
      dependencies: input.dependencies ? JSON.stringify(input.dependencies) : null,
      peer_dependencies: input.peerDependencies ? JSON.stringify(input.peerDependencies) : null,
      cdn_path: input.cdnPath || null,
      changelog: input.changelog || null,
      breaking_changes: input.breakingChanges ? JSON.stringify(input.breakingChanges) : null,
      sri_hashes: input.sriHashes ? JSON.stringify(input.sriHashes) : null,
    })

    await this.repo.updatePackageLatest(pkg.id, input.version)

    await this.repo.insertEvent({
      package_id: pkg.id,
      action: 'publish',
      to_version: input.version,
      operator,
      metadata: JSON.stringify({
        cdnPath: input.cdnPath,
        hasBreakingChanges: !!input.breakingChanges?.length,
      }),
    })

    logger.info(
      { packageName: input.packageName, version: input.version, versionId },
      'Version synced successfully',
    )

    return { created: true, versionId }
  }
}
