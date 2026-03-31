import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { SyncService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'
import type { Knex } from 'knex'
import { logger } from '../../logger.js'

export const syncRouter = new Router({ prefix: '/api/v1/versions' })

/** Payload shape for a single version sync. */
interface VersionSyncPayload {
  packageName: string
  version: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  cdnPath?: string
  changelog?: string
  breakingChanges?: string[]
  sriHashes?: Record<string, string>
}

interface SyncResult {
  packageName: string
  versionId: number
  created: boolean
}

/**
 * Sync multiple package versions atomically.
 * All inserts succeed or none do — no partial version state.
 */
async function syncVersionBatch(
  db: Knex,
  packages: VersionSyncPayload[],
  operator: string,
): Promise<SyncResult[]> {
  return db.transaction(async (trx) => {
    const results: SyncResult[] = []
    const syncService = new SyncService(trx)

    for (const pkg of packages) {
      const result = await syncService.syncVersion(
        {
          packageName: pkg.packageName,
          version: pkg.version,
          dependencies: pkg.dependencies,
          peerDependencies: pkg.peerDependencies,
          cdnPath: pkg.cdnPath,
          changelog: pkg.changelog,
          breakingChanges: pkg.breakingChanges,
          sriHashes: pkg.sriHashes,
        },
        operator,
      )

      results.push({
        packageName: pkg.packageName,
        versionId: result.versionId,
        created: result.created,
      })
    }

    return results
  })
}

/** Validate a single sync payload has required fields. */
function validateSyncPayload(pkg: VersionSyncPayload): string | null {
  if (!pkg.packageName || !pkg.version) {
    return `packageName and version are required for each package (missing in ${pkg.packageName ?? 'unknown'})`
  }
  return null
}

/** POST /api/v1/versions/sync — npm publish hook receiver (single or batch) */
syncRouter.post('/sync', auth, requirePermission('versions:sync'), async (ctx: Context) => {
  const body = ctx.request.body as VersionSyncPayload | { packages: VersionSyncPayload[] }

  if ('packages' in body && Array.isArray(body.packages)) {
    if (body.packages.length === 0) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'packages array must not be empty' }
      return
    }

    for (const pkg of body.packages) {
      const error = validateSyncPayload(pkg)
      if (error) {
        ctx.status = 400
        ctx.body = { code: 'VALIDATION_ERROR', message: error }
        return
      }
    }

    const db = getDb()
    const results = await syncVersionBatch(db, body.packages, ctx.state.user!.username)

    logger.info(
      { count: results.length, created: results.filter((r) => r.created).length },
      'Batch version sync completed',
    )

    const anyCreated = results.some((r) => r.created)
    ctx.status = anyCreated ? 201 : 200
    ctx.body = { results }
    return
  }

  const singleBody = body as VersionSyncPayload
  if (!singleBody.packageName || !singleBody.version) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'packageName and version are required' }
    return
  }

  const service = new SyncService(getDb())
  const result = await service.syncVersion(
    {
      packageName: singleBody.packageName,
      version: singleBody.version,
      dependencies: singleBody.dependencies,
      peerDependencies: singleBody.peerDependencies,
      cdnPath: singleBody.cdnPath,
      changelog: singleBody.changelog,
      breakingChanges: singleBody.breakingChanges,
      sriHashes: singleBody.sriHashes,
    },
    ctx.state.user!.username,
  )

  ctx.status = result.created ? 201 : 200
  ctx.body = result
})
