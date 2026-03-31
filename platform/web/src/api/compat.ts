import { apiGet, apiPost } from './client'

import type { CompatResult } from './types'

/**
 * Get compatibility results for a package, optionally filtered by version.
 */
export function getCompatResults(
  packageName: string,
  params?: { version?: string },
): Promise<CompatResult[]> {
  return apiGet<CompatResult[]>(`/compat/${encodeURIComponent(packageName)}`, params)
}

/**
 * Report a compatibility test result (from CI).
 */
export function reportCompatResult(payload: {
  package_name: string
  version: string
  vue_version: string
  element_plus_version: string
  status: 'pass' | 'fail'
  ci_run_url: string
}): Promise<CompatResult> {
  return apiPost<CompatResult>('/compat/report', payload)
}
