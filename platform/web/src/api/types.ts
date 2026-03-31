/**
 * API response envelope -- all endpoints return this shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// --- Package & Version ---

export interface Package {
  id: number
  name: string
  description: string | null
  latest_version: string | null
  created_at: string
}

export type VersionStatus = 'published' | 'deprecated' | 'yanked'

export interface Version {
  id: number
  package_id: number
  version: string
  dependencies: Record<string, string> | null
  peer_dependencies: Record<string, string> | null
  cdn_path: string | null
  changelog: string | null
  breaking_changes: BreakingChange[] | null
  sri_hashes: Record<string, string> | null
  status: VersionStatus
  published_at: string
}

export interface BreakingChange {
  description: string
  migration?: string
}

export interface DependencyNode {
  package: string
  version: string
  dependencies: DependencyNode[]
}

export interface DependencyConflict {
  conflict: string
  required: Record<string, string>
  suggestion: string
}

export interface DependencyResolution {
  tree: DependencyNode
  conflicts: DependencyConflict[]
}

// --- App ---

export interface App {
  id: number
  app_id: string
  name: string
  owner: string
  created_at: string
}

export interface CreateAppPayload {
  app_id: string
  name: string
  owner: string
}

export interface UpdateAppPayload {
  name?: string
  owner?: string
}

// --- App Version Map ---

export interface AppVersionMap {
  id: number
  app_id: string
  package_id: number
  package_name: string
  pinned_version: string | null
  version_range: string | null
  resolved_version: string | null
  updated_at: string | null
}

export interface UpdateVersionMapPayload {
  package_id: number
  pinned_version?: string | null
  version_range?: string | null
}

// --- Grayscale ---

export type GrayscaleStrategy = 'user_list' | 'department' | 'percentage' | 'composite'
export type GrayscaleStatus = 'active' | 'paused' | 'completed'

export interface GrayscaleCondition {
  type: 'user_list' | 'department' | 'percentage'
  values?: string[]
  value?: number
  hash_key?: string
}

export interface CompositeRule {
  operator: 'AND' | 'OR'
  conditions: Array<GrayscaleCondition | CompositeRule>
}

export interface GrayscaleRule {
  id: number
  app_id: string
  package_id: number
  package_name: string
  target_version: string
  strategy: GrayscaleStrategy
  rule_config: GrayscaleCondition | CompositeRule
  status: GrayscaleStatus
  created_at: string
}

export interface CreateGrayscalePayload {
  app_id: string
  package_id: number
  target_version: string
  strategy: GrayscaleStrategy
  rule_config: GrayscaleCondition | CompositeRule
}

// --- Compatibility ---

export type CompatStatus = 'pass' | 'fail' | 'untested'

export interface CompatResult {
  id: number
  package_id: number
  version: string
  vue_version: string
  element_plus_version: string
  status: CompatStatus
  ci_run_url: string | null
  tested_at: string | null
}

// --- CDN Publish State Machine ---

export type CdnPublishState = 'uploading' | 'propagating' | 'verifying' | 'active' | 'failed'

export interface CdnPublishStatus {
  package_name: string
  version: string
  state: CdnPublishState
  started_at: string
  updated_at: string
  error_message?: string
}

// --- Version Events (Audit Log) ---

export type EventAction =
  | 'publish'
  | 'pin'
  | 'upgrade'
  | 'rollback'
  | 'deprecate'
  | 'grayscale_start'
  | 'grayscale_complete'

export interface VersionEvent {
  id: number
  package_id: number | null
  app_id: string | null
  action: EventAction
  from_version: string | null
  to_version: string | null
  operator: string
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// --- Rollback ---

export interface RollbackPreCheck {
  cdn_resources_exist: boolean
  sri_hash_valid: boolean
  target_version: string
  affected_apps: string[]
  warnings: string[]
}

export interface RollbackPayload {
  target_version: string
  reason: string
}

// --- RBAC ---

export type UserRole = 'viewer' | 'publisher' | 'operator' | 'admin'

export interface PlatformUser {
  id: number
  username: string
  role: UserRole
  created_at: string
}

// --- Resolution Graph (debug) ---

export interface ResolutionGraphNode {
  id: string
  label: string
  version: string
  type: 'app' | 'package'
}

export interface ResolutionGraphEdge {
  source: string
  target: string
  version_range: string
  resolved_version: string
}

export interface ResolutionGraph {
  nodes: ResolutionGraphNode[]
  edges: ResolutionGraphEdge[]
}

// --- Health ---

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  db: boolean
  redis: boolean
  cdn_storage: boolean
  timestamp: string
}
