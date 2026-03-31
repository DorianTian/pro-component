import Router from 'koa-router'
import { ImportMapService } from './service.js'
import { getDb } from '../../db.js'
import { CDN_EDGE_MAX_AGE_S, CDN_EDGE_SWR_S } from './cache.js'
import type { Context } from 'koa'

export const importMapRouter = new Router()

/**
 * GET /api/v1/import-map?appId=xxx&userId=xxx
 *
 * Consumer-facing endpoint. No auth required (CDN edge cached).
 * Sets cache headers for CDN edge caching.
 */
importMapRouter.get('/api/v1/import-map', async (ctx: Context) => {
  const appId = ctx.query.appId as string
  const userId = ctx.query.userId as string | undefined

  if (!appId) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId query parameter is required' }
    return
  }

  const service = new ImportMapService(getDb())
  const result = await service.generate(appId, userId)

  ctx.set(
    'Cache-Control',
    `public, max-age=${String(CDN_EDGE_MAX_AGE_S)}, stale-while-revalidate=${String(CDN_EDGE_SWR_S)}`,
  )
  ctx.set('Vary', 'Accept-Encoding')

  ctx.body = result
})
