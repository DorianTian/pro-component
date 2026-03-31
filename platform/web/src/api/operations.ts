import { apiGet, apiPost } from './client'

import type { RollbackPreCheck, RollbackPayload, Version, HealthStatus } from './types'

/**
 * Run pre-rollback checks.
 */
export function rollbackPreCheck(
  versionId: number,
  targetVersion: string,
): Promise<RollbackPreCheck> {
  return apiGet<RollbackPreCheck>(`/versions/${versionId}/rollback/pre-check`, {
    target_version: targetVersion,
  })
}

/**
 * Execute rollback.
 */
export function executeRollback(versionId: number, payload: RollbackPayload): Promise<Version> {
  return apiPost<Version>(`/versions/${versionId}/rollback`, payload)
}

/**
 * Deprecate a version.
 */
export function deprecateVersion(versionId: number): Promise<Version> {
  return apiPost<Version>(`/versions/${versionId}/deprecate`)
}

/**
 * Deep health check.
 */
export function getHealthStatus(): Promise<HealthStatus> {
  return apiGet<HealthStatus>('/health/resolution')
}
