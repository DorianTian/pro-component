import type { Context, Next } from 'koa'
import { logger } from '../logger.js'

/** Log HTTP requests with method, URL, status, duration, and request ID. */
export async function requestLogger(ctx: Context, next: Next): Promise<void> {
  const start = Date.now()
  await next()
  const duration = Date.now() - start

  const logData = {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    duration,
    requestId: ctx.state.requestId,
  }

  if (ctx.status >= 500) {
    logger.error(logData, 'Request completed with server error')
  } else if (ctx.status >= 400) {
    logger.warn(logData, 'Request completed with client error')
  } else {
    logger.info(logData, 'Request completed')
  }
}
