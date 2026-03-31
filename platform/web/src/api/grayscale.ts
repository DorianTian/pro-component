import { apiGet, apiPost, apiPut } from './client'

import type { GrayscaleRule, CreateGrayscalePayload, PaginatedResponse } from './types'

/**
 * List all grayscale rules, optionally filtered by app.
 */
export function listGrayscaleRules(params?: {
  app_id?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<GrayscaleRule>> {
  return apiGet<PaginatedResponse<GrayscaleRule>>('/grayscale', params)
}

/**
 * Get a single grayscale rule by ID.
 */
export function getGrayscaleRule(id: number): Promise<GrayscaleRule> {
  return apiGet<GrayscaleRule>(`/grayscale/${id}`)
}

/**
 * Create a new grayscale rule.
 */
export function createGrayscaleRule(payload: CreateGrayscalePayload): Promise<GrayscaleRule> {
  return apiPost<GrayscaleRule>('/grayscale', payload)
}

/**
 * Pause a grayscale rule.
 */
export function pauseGrayscaleRule(id: number): Promise<GrayscaleRule> {
  return apiPut<GrayscaleRule>(`/grayscale/${id}/pause`)
}

/**
 * Complete (promote to full release) a grayscale rule.
 */
export function completeGrayscaleRule(id: number): Promise<GrayscaleRule> {
  return apiPut<GrayscaleRule>(`/grayscale/${id}/complete`)
}

/**
 * Resume a paused grayscale rule.
 */
export function resumeGrayscaleRule(id: number): Promise<GrayscaleRule> {
  return apiPut<GrayscaleRule>(`/grayscale/${id}/resume`)
}
