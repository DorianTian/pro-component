import { apiGet, apiPost } from './client'

import type {
  Package,
  Version,
  DependencyResolution,
  VersionEvent,
  CdnPublishStatus,
  PaginatedResponse,
  ResolutionGraph,
} from './types'

/**
 * List all registered packages.
 */
export function listPackages(): Promise<Package[]> {
  return apiGet<Package[]>('/versions')
}

/**
 * Get all versions for a package.
 */
export function getPackageVersions(packageName: string): Promise<Version[]> {
  return apiGet<Version[]>(`/versions/${encodeURIComponent(packageName)}`)
}

/**
 * Get full dependency tree for a package version.
 */
export function getPackageDeps(packageName: string): Promise<DependencyResolution> {
  return apiGet<DependencyResolution>(`/versions/${encodeURIComponent(packageName)}/deps`)
}

/**
 * Trigger npm publish hook (sync to CDN).
 */
export function syncVersion(payload: {
  package_name: string
  version: string
}): Promise<CdnPublishStatus> {
  return apiPost<CdnPublishStatus>('/versions/sync', payload)
}

/**
 * Get CDN publish status for all recent publishes.
 */
export function listPublishStatuses(params?: {
  page?: number
  pageSize?: number
  state?: string
}): Promise<PaginatedResponse<CdnPublishStatus>> {
  return apiGet<PaginatedResponse<CdnPublishStatus>>('/versions/publish-status', params)
}

/**
 * Get version event history (audit log).
 */
export function getVersionEvents(params?: {
  package_id?: number
  app_id?: string
  action?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<VersionEvent>> {
  return apiGet<PaginatedResponse<VersionEvent>>('/versions/events', params)
}

/**
 * Get the resolution graph for an app (debug endpoint).
 */
export function getResolutionGraph(appId: string): Promise<ResolutionGraph> {
  return apiGet<ResolutionGraph>(`/apps/${appId}/resolution-graph`)
}
