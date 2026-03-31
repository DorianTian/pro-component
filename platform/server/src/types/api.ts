/**
 * API request/response DTOs.
 * Tolerant reader: unknown fields ignored at parse, not rejected.
 */

import type { GrayscaleRuleConfig } from './grayscale.js'

// --- Import Map ---

export interface ImportMapRequest {
  appId: string
  userId?: string
}

export interface ImportMapResponse {
  imports: Record<string, string>
  preloads: string[]
  styles: string[]
  sriHashes: Record<string, string>
  cache_bust: boolean
}

// --- App Management ---

export interface CreateAppRequest {
  appId: string
  name: string
  owner: string
}

export interface UpdateAppVersionsRequest {
  versions: Array<{
    packageName: string
    pinnedVersion?: string
    versionRange?: string
  }>
}

export interface AppVersionsResponse {
  appId: string
  versions: Array<{
    packageName: string
    pinnedVersion: string | null
    versionRange: string | null
    resolvedVersion: string | null
  }>
}

// --- Version Sync ---

export interface VersionSyncRequest {
  packageName: string
  version: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  cdnPath?: string
  changelog?: string
  breakingChanges?: string[]
  sriHashes?: Record<string, string>
}

// --- Grayscale ---

export interface CreateGrayscaleRequest {
  appId: string
  packageName: string
  targetVersion: string
  strategy: 'user_list' | 'department' | 'percentage' | 'composite'
  ruleConfig: GrayscaleRuleConfig
}

// --- Rollback ---

export interface RollbackRequest {
  reason: string
  targetVersion: string
}

// --- Compat ---

export interface CompatReportRequest {
  packageName: string
  version: string
  vueVersion: string
  elementPlusVersion: string
  status: 'pass' | 'fail'
  ciRunUrl?: string
}

// --- Dependency Resolution ---

export interface DependencyNode {
  name: string
  version: string
  dependencies: DependencyNode[]
}

export interface ResolutionGraphResponse {
  root: string
  nodes: DependencyNode[]
  conflicts: DiamondConflict[]
}

export interface DiamondConflict {
  dependency: string
  required: Record<string, string>
  suggestion: string
}

// --- Generic ---

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
