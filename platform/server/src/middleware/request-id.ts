import type { Context, Next } from 'koa'
import { v4 as uuidv4 } from 'uuid'

/** Inject X-Request-Id header — use client-provided value or generate a new UUID. */
export async function requestId(ctx: Context, next: Next): Promise<void> {
  const id = ctx.get('X-Request-Id') || uuidv4()
  ctx.state.requestId = id
  ctx.set('X-Request-Id', id)
  await next()
}
