import { apiGet, apiPost, apiPut } from './client'

import type {
  App,
  CreateAppPayload,
  UpdateAppPayload,
  AppVersionMap,
  UpdateVersionMapPayload,
  PaginatedResponse,
} from './types'

/**
 * List all registered business apps.
 */
export function listApps(params?: {
  page?: number
  pageSize?: number
  keyword?: string
}): Promise<PaginatedResponse<App>> {
  return apiGet<PaginatedResponse<App>>('/apps', params)
}

/**
 * Get a single app by appId.
 */
export function getApp(appId: string): Promise<App> {
  return apiGet<App>(`/apps/${appId}`)
}

/**
 * Create a new business app.
 */
export function createApp(payload: CreateAppPayload): Promise<App> {
  return apiPost<App>('/apps', payload)
}

/**
 * Update app metadata (name, owner).
 */
export function updateApp(appId: string, payload: UpdateAppPayload): Promise<App> {
  return apiPut<App>(`/apps/${appId}`, payload)
}

/**
 * Get version mappings for a specific app.
 */
export function getAppVersions(appId: string): Promise<AppVersionMap[]> {
  return apiGet<AppVersionMap[]>(`/apps/${appId}/versions`)
}

/**
 * Update version mappings for an app.
 */
export function updateAppVersions(
  appId: string,
  payload: UpdateVersionMapPayload[],
): Promise<AppVersionMap[]> {
  return apiPut<AppVersionMap[]>(`/apps/${appId}/versions`, payload)
}
