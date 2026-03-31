import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { GrayscaleService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'
import type { GrayscaleRuleConfig } from '../../types/grayscale.js'

export const grayscaleRouter = new Router({ prefix: '/api/v1/grayscale' })

/** POST /api/v1/grayscale — Create a grayscale rule */
grayscaleRouter.post('/', auth, requirePermission('grayscale:create'), async (ctx: Context) => {
  const body = ctx.request.body as {
    appId?: string
    packageName?: string
    targetVersion?: string
    strategy?: string
    ruleConfig?: unknown
  }

  if (
    !body.appId ||
    !body.packageName ||
    !body.targetVersion ||
    !body.strategy ||
    !body.ruleConfig
  ) {
    ctx.status = 400
    ctx.body = {
      code: 'VALIDATION_ERROR',
      message: 'appId, packageName, targetVersion, strategy, and ruleConfig are required',
    }
    return
  }

  const service = new GrayscaleService(getDb())
  const result = await service.createRule(
    {
      appId: body.appId,
      packageName: body.packageName,
      targetVersion: body.targetVersion,
      strategy: body.strategy as 'user_list' | 'department' | 'percentage' | 'composite',
      ruleConfig: body.ruleConfig as GrayscaleRuleConfig,
    },
    (ctx.state.user as { username: string }).username,
  )

  ctx.status = 201
  ctx.body = result
})

/** GET /api/v1/grayscale?appId=xxx — List grayscale rules for an app */
grayscaleRouter.get('/', auth, requirePermission('grayscale:read'), async (ctx: Context) => {
  const appId = ctx.query.appId as string
  if (!appId) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId query parameter is required' }
    return
  }

  const service = new GrayscaleService(getDb())
  ctx.body = { data: await service.listRules(appId) }
})

/** PUT /api/v1/grayscale/:id/pause — Pause a grayscale rule */
grayscaleRouter.put(
  '/:id/pause',
  auth,
  requirePermission('grayscale:pause'),
  async (ctx: Context) => {
    const service = new GrayscaleService(getDb())
    await service.pauseRule(
      parseInt(ctx.params.id, 10),
      (ctx.state.user as { username: string }).username,
    )
    ctx.status = 204
  },
)

/** PUT /api/v1/grayscale/:id/complete — Complete (promote) a grayscale rule */
grayscaleRouter.put(
  '/:id/complete',
  auth,
  requirePermission('grayscale:complete'),
  async (ctx: Context) => {
    const service = new GrayscaleService(getDb())
    await service.completeRule(
      parseInt(ctx.params.id, 10),
      (ctx.state.user as { username: string }).username,
    )
    ctx.status = 204
  },
)
