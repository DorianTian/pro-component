import { generateToken, type AuthPayload } from '../src/middleware/auth.js'
import type { PlatformUserRow } from '../src/types/index.js'

/** Generate a JWT token for a test user with a given role. */
export function tokenForRole(role: PlatformUserRow['role'], username?: string): string {
  const payload: AuthPayload = {
    userId: 1,
    username: username || `test-${role}`,
    role,
  }
  return generateToken(payload)
}

/** Common test data factories. */
export const fixtures = {
  createAppPayload(overrides: Partial<{ appId: string; name: string; owner: string }> = {}) {
    return {
      appId: overrides.appId || `test-app-${Date.now()}`,
      name: overrides.name || 'Test App',
      owner: overrides.owner || 'test-owner',
    }
  },

  versionSyncPayload(
    overrides: Partial<{
      packageName: string
      version: string
      dependencies: Record<string, string>
      peerDependencies: Record<string, string>
      cdnPath: string
      sriHashes: Record<string, string>
    }> = {},
  ) {
    return {
      packageName: overrides.packageName || '@pro/table',
      version: overrides.version || '1.0.0',
      dependencies: overrides.dependencies || {},
      peerDependencies: overrides.peerDependencies || {},
      cdnPath: overrides.cdnPath || '/@pro/table/1.0.0',
      sriHashes: overrides.sriHashes || { 'esm/index.mjs': 'sha384-test' },
    }
  },

  grayscalePayload(
    overrides: Partial<{
      appId: string
      packageName: string
      targetVersion: string
    }> = {},
  ) {
    return {
      appId: overrides.appId || 'test-app',
      packageName: overrides.packageName || '@pro/table',
      targetVersion: overrides.targetVersion || '2.0.0-beta.1',
      strategy: 'user_list' as const,
      ruleConfig: {
        type: 'user_list' as const,
        values: ['uid-1', 'uid-2'],
      },
    }
  },
}
