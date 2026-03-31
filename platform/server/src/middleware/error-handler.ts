import type { Context, Next } from 'koa'
import { logger } from '../logger.js'

/** Application-level error with HTTP status code and error code. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/** Global error handler middleware — catches all errors and returns JSON. */
export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err: unknown) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode
      ctx.body = {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      }

      if (err.statusCode >= 500) {
        logger.error({ err, requestId: ctx.state.requestId }, 'Server error')
      }
    } else if (err instanceof Error) {
      logger.error({ err, requestId: ctx.state.requestId }, 'Unhandled error')
      ctx.status = 500
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      }
    } else {
      logger.error({ err, requestId: ctx.state.requestId }, 'Unknown error type')
      ctx.status = 500
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      }
    }
  }
}
