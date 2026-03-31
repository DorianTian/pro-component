import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { requestId } from './middleware/request-id.js'
import { errorHandler } from './middleware/error-handler.js'
import { requestLogger } from './middleware/request-logger.js'
import { appRouter } from './modules/app/router.js'
import { versionRouter } from './modules/version/router.js'
import { importMapRouter } from './modules/import-map/router.js'
import { grayscaleRouter } from './modules/grayscale/router.js'
import { syncRouter } from './modules/sync/router.js'
import { compatRouter } from './modules/compat/router.js'
import { healthRouter } from './modules/health/router.js'

/**
 * Create and configure the Koa application.
 * Middleware order: requestId → errorHandler → requestLogger → cors → bodyParser → routes → 404
 */
export function createApp(): Koa {
  const app = new Koa()

  // Global middleware (order matters)
  app.use(requestId)
  app.use(errorHandler)
  app.use(requestLogger)
  app.use(
    cors({
      origin: (ctx) => {
        const origin = ctx.get('Origin')
        return origin || '*'
      },
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  )
  app.use(bodyParser({ jsonLimit: '1mb' }))

  // Health check (no auth, no version prefix)
  app.use(healthRouter.routes())
  app.use(healthRouter.allowedMethods())

  // API v1 routes
  app.use(importMapRouter.routes())
  app.use(importMapRouter.allowedMethods())
  app.use(appRouter.routes())
  app.use(appRouter.allowedMethods())
  app.use(versionRouter.routes())
  app.use(versionRouter.allowedMethods())
  app.use(grayscaleRouter.routes())
  app.use(grayscaleRouter.allowedMethods())
  app.use(syncRouter.routes())
  app.use(syncRouter.allowedMethods())
  app.use(compatRouter.routes())
  app.use(compatRouter.allowedMethods())

  return app
}
