import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { loadConfig } from '../config.js'
import { AppError } from './error-handler.js'
import type { PlatformUserRow } from '../types/index.js'

/** JWT payload stored in ctx.state.user after authentication. */
export interface AuthPayload {
  userId: number
  username: string
  role: PlatformUserRow['role']
}

declare module 'koa' {
  interface DefaultState {
    requestId?: string
    user?: AuthPayload
  }
}

/**
 * JWT authentication middleware.
 * Extracts token from Authorization: Bearer <token> header.
 * Populates ctx.state.user with decoded payload.
 * Throws 401 if token is missing or invalid.
 */
export async function auth(ctx: Context, next: Next): Promise<void> {
  const header = ctx.get('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header')
  }

  const token = header.slice(7)
  const config = loadConfig()

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload
    ctx.state.user = payload
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token')
  }

  await next()
}

/** Generate a JWT token for a user. Used by login/token endpoints and tests. */
export function generateToken(payload: AuthPayload): string {
  const config = loadConfig()
  // jwt.sign expiresIn accepts string values like "24h" at runtime;
  // the type definition uses a branded StringValue from `ms`, so we cast.
  return jwt.sign(
    { ...payload },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
  )
}
