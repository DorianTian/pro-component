import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { VersionService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const versionRouter = new Router({ prefix: '/api/v1/versions' })

/** GET /api/v1/versions/:package — List versions for a package */
versionRouter.get('/:package', auth, requirePermission('versions:read'), async (ctx: Context) => {
  const service = new VersionService(getDb())
  const versions = await service.listVersions(ctx.params.package)
  ctx.body = { data: versions }
})

/** GET /api/v1/versions/:package/deps — Full dependency tree */
versionRouter.get(
  '/:package/deps',
  auth,
  requirePermission('versions:read'),
  async (ctx: Context) => {
    const service = new VersionService(getDb())
    const version = ctx.query.version as string | undefined
    const tree = await service.getDependencyTree(ctx.params.package, version)
    ctx.body = tree
  },
)

/** POST /api/v1/versions/:id/rollback — Rollback to a previous version */
versionRouter.post(
  '/:id/rollback',
  auth,
  requirePermission('versions:rollback'),
  async (ctx: Context) => {
    const body = ctx.request.body as { reason?: string; targetVersion?: string }

    if (!body.reason || !body.targetVersion) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'reason and targetVersion are required' }
      return
    }

    const service = new VersionService(getDb())
    await service.rollback(
      parseInt(ctx.params.id, 10),
      { reason: body.reason, targetVersion: body.targetVersion },
      ctx.state.user!.username,
    )

    ctx.body = { success: true, cache_bust: true }
  },
)

/** POST /api/v1/versions/:id/deprecate — Deprecate a version */
versionRouter.post(
  '/:id/deprecate',
  auth,
  requirePermission('versions:deprecate'),
  async (ctx: Context) => {
    const body = ctx.request.body as { reason?: string }

    const service = new VersionService(getDb())
    await service.deprecate(parseInt(ctx.params.id, 10), ctx.state.user!.username, body.reason)

    ctx.status = 204
  },
)
