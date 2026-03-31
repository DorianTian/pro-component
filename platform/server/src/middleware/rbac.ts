import type { Context, Next } from 'koa'
import { AppError } from './error-handler.js'
import type { PlatformUserRow } from '../types/index.js'

type Role = PlatformUserRow['role']

/**
 * Role hierarchy: admin > operator > publisher > viewer.
 * Higher roles inherit all lower-role permissions.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  publisher: 1,
  operator: 2,
  admin: 3,
}

/**
 * Permission map: action -> minimum required role.
 * Roles at or above the minimum level are granted access.
 */
const PERMISSION_MAP: Partial<Record<string, Role>> = {
  // Viewer permissions (all roles have these)
  'versions:read': 'viewer',
  'compat:read': 'viewer',
  'import-map:read': 'viewer',
  'apps:read': 'viewer',
  'grayscale:read': 'viewer',
  'events:read': 'viewer',

  // Publisher permissions
  'versions:sync': 'publisher',
  'compat:report': 'publisher',

  // Operator permissions
  'apps:create': 'operator',
  'apps:update': 'operator',
  'grayscale:create': 'operator',
  'grayscale:pause': 'operator',
  'grayscale:complete': 'operator',
  'versions:pin': 'operator',

  // Admin permissions
  'versions:rollback': 'admin',
  'versions:deprecate': 'admin',
  'users:manage': 'admin',
  'grayscale:override_pin': 'admin',
}

/** Returns true if the given role has permission for the specified action. */
export function hasPermission(role: Role, action: string): boolean {
  const requiredRole = PERMISSION_MAP[action]
  if (!requiredRole) {
    return false
  }
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Factory: creates middleware that checks if ctx.state.user has the required permission.
 * Must be used AFTER the auth middleware.
 */
export function requirePermission(action: string) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const user = ctx.state.user
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    if (!hasPermission(user.role, action)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        `Role '${user.role}' does not have permission for action '${action}'`,
      )
    }

    await next()
  }
}
