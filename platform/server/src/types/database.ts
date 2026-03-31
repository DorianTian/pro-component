/**
 * Database row types — mirrors MySQL table schemas exactly.
 * Column names use snake_case matching the DB. Application code
 * should transform to camelCase at the service layer boundary.
 */

export interface PackageRow {
  id: number
  name: string
  description: string | null
  latest_version: string | null
  created_at: Date
}

export interface VersionRow {
  id: number
  package_id: number
  version: string
  dependencies: string | null
  peer_dependencies: string | null
  cdn_path: string | null
  changelog: string | null
  breaking_changes: string | null
  sri_hashes: string | null
  status: 'published' | 'deprecated' | 'yanked'
  published_at: Date
}

export interface AppRow {
  id: number
  app_id: string
  name: string | null
  owner: string | null
  created_at: Date
}

export interface AppVersionMapRow {
  id: number
  app_id: string
  package_id: number
  pinned_version: string | null
  version_range: string | null
  resolved_version: string | null
  updated_at: Date | null
}

export interface GrayscaleRuleRow {
  id: number
  app_id: string
  package_id: number
  target_version: string
  strategy: 'user_list' | 'department' | 'percentage' | 'composite'
  rule_config: string | null
  status: 'active' | 'paused' | 'completed'
  created_at: Date
}

export interface CompatResultRow {
  id: number
  package_id: number
  version: string
  vue_version: string
  element_plus_version: string
  status: 'pass' | 'fail' | 'untested'
  ci_run_url: string | null
  tested_at: Date | null
}

export interface VersionEventRow {
  id: number
  package_id: number | null
  app_id: string | null
  action:
    | 'publish'
    | 'pin'
    | 'upgrade'
    | 'rollback'
    | 'deprecate'
    | 'grayscale_start'
    | 'grayscale_complete'
  from_version: string | null
  to_version: string | null
  operator: string
  reason: string | null
  metadata: string | null
  created_at: Date
}

export interface PlatformUserRow {
  id: number
  username: string
  role: 'viewer' | 'publisher' | 'operator' | 'admin'
  api_key_hash: string | null
  created_at: Date
}
