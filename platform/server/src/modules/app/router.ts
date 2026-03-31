import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { AppService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const appRouter = new Router({ prefix: '/api/v1/apps' })

function getService(): AppService {
  return new AppService(getDb())
}

/** POST /api/v1/apps — Create a new app */
appRouter.post('/', auth, requirePermission('apps:create'), async (ctx: Context) => {
  const body = ctx.request.body as { appId?: string; name?: string; owner?: string }

  if (!body.appId || !body.name || !body.owner) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId, name, and owner are required' }
    return
  }

  const service = getService()
  const result = await service.createApp({
    appId: body.appId,
    name: body.name,
    owner: body.owner,
  })

  ctx.status = 201
  ctx.body = result
})

/** GET /api/v1/apps — List apps */
appRouter.get('/', auth, requirePermission('apps:read'), async (ctx: Context) => {
  const page = parseInt(ctx.query.page as string) || 1
  const pageSize = parseInt(ctx.query.pageSize as string) || 20

  const service = getService()
  const result = await service.listApps(page, pageSize)

  ctx.body = {
    data: result.data,
    total: result.total,
    page,
    pageSize,
  }
})

/** GET /api/v1/apps/:appId/versions — Get app version mappings */
appRouter.get('/:appId/versions', auth, requirePermission('apps:read'), async (ctx: Context) => {
  const service = getService()
  ctx.body = await service.getAppVersions(ctx.params.appId)
})

/** PUT /api/v1/apps/:appId/versions — Update app version mappings */
appRouter.put('/:appId/versions', auth, requirePermission('apps:update'), async (ctx: Context) => {
  const body = ctx.request.body as {
    versions?: Array<{ packageName: string; pinnedVersion?: string; versionRange?: string }>
  }

  if (!body.versions || !Array.isArray(body.versions)) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'versions array is required' }
    return
  }

  const service = getService()
  await service.updateAppVersions(ctx.params.appId, { versions: body.versions })

  ctx.status = 204
})
