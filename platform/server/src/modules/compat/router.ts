import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { CompatService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const compatRouter = new Router({ prefix: '/api/v1/compat' })

/** GET /api/v1/compat/:package — Get compatibility matrix */
compatRouter.get('/:package', auth, requirePermission('compat:read'), async (ctx: Context) => {
  const service = new CompatService(getDb())
  ctx.body = await service.getCompatMatrix(ctx.params.package)
})

/** POST /api/v1/compat/report — CI auto-report compatibility result */
compatRouter.post('/report', auth, requirePermission('compat:report'), async (ctx: Context) => {
  const body = ctx.request.body as {
    packageName?: string
    version?: string
    vueVersion?: string
    elementPlusVersion?: string
    status?: string
    ciRunUrl?: string
  }

  if (
    !body.packageName ||
    !body.version ||
    !body.vueVersion ||
    !body.elementPlusVersion ||
    !body.status
  ) {
    ctx.status = 400
    ctx.body = {
      code: 'VALIDATION_ERROR',
      message: 'packageName, version, vueVersion, elementPlusVersion, and status are required',
    }
    return
  }

  if (!['pass', 'fail'].includes(body.status)) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: "status must be 'pass' or 'fail'" }
    return
  }

  const service = new CompatService(getDb())
  const result = await service.reportResult({
    packageName: body.packageName,
    version: body.version,
    vueVersion: body.vueVersion,
    elementPlusVersion: body.elementPlusVersion,
    status: body.status as 'pass' | 'fail',
    ciRunUrl: body.ciRunUrl,
  })

  ctx.status = 200
  ctx.body = result
})
