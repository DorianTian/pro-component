# Plan 5b: Version Management Platform Dashboard (Frontend)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Version Management Platform Dashboard as a standalone Vue 3 + Element Plus SPA. This covers all CRUD views (apps, version mapping, publish, grayscale, compatibility matrix, changelog) and operational workflows (rollback, dependency graph visualization). The dashboard consumes the backend API defined in Plan 5a — no backend implementation here.

**Architecture:** Single-page application with Vue Router, Pinia state management, and a typed HTTP client wrapping axios. Layout uses Element Plus sidebar + header + breadcrumb. Each feature area is a route module with its own views, composables, and API layer.

**Tech Stack:** Vue 3.4+, Element Plus 2.9+, Vite 6+, Vue Router 4, Pinia 2, axios, @vueuse/core, TypeScript 5.5+, @dagrejs/dagre (dependency graph layout)

**Relationship to other plans:**
- Plan 1 (Monorepo Foundation): provides workspace context — this app lives at `platform/web/`
- Plan 5a (Platform API): provides the backend endpoints this dashboard consumes
- `pnpm-workspace.yaml` already includes `platform/**` via the workspace glob `packages/*` does NOT cover this — workspace config must include `platform/web` explicitly

---

## File Structure

```
platform/web/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html
├── env.d.ts
├── .env.development
├── .env.production
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   └── app.ts
│   ├── api/
│   │   ├── client.ts                    # Typed axios instance + interceptors
│   │   ├── types.ts                     # All API request/response types
│   │   ├── apps.ts                      # /api/v1/apps endpoints
│   │   ├── versions.ts                  # /api/v1/versions endpoints
│   │   ├── grayscale.ts                 # /api/v1/grayscale endpoints
│   │   ├── compat.ts                    # /api/v1/compat endpoints
│   │   └── operations.ts               # rollback, deprecate, health
│   ├── layouts/
│   │   └── DashboardLayout.vue
│   ├── components/
│   │   ├── Breadcrumb.vue
│   │   ├── StatusBadge.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── DependencyGraph.vue
│   │   └── StateMachineViz.vue
│   └── views/
│       ├── app-manage/
│       │   ├── AppList.vue
│       │   └── AppForm.vue
│       ├── version-map/
│       │   ├── VersionMapList.vue
│       │   └── VersionEditDialog.vue
│       ├── publish/
│       │   ├── PublishList.vue
│       │   └── PublishTimeline.vue
│       ├── grayscale/
│       │   ├── GrayscaleList.vue
│       │   ├── GrayscaleRuleBuilder.vue
│       │   └── GrayscaleForm.vue
│       ├── compat-matrix/
│       │   └── CompatMatrix.vue
│       ├── changelog/
│       │   └── ChangelogView.vue
│       └── rollback/
│           └── RollbackDialog.vue
```

---

### Task 1: Project Scaffold + Vite Config

**Files:**
- Create: `platform/web/package.json`
- Create: `platform/web/tsconfig.json`
- Create: `platform/web/tsconfig.node.json`
- Create: `platform/web/vite.config.ts`
- Create: `platform/web/index.html`
- Create: `platform/web/env.d.ts`
- Create: `platform/web/.env.development`
- Create: `platform/web/.env.production`
- Modify: `pnpm-workspace.yaml` (add `platform/web`)

- [ ] **Step 1: Update pnpm-workspace.yaml to include platform**

Add `platform/*` to the workspace packages list:

```yaml
packages:
  - "packages/*"
  - "platform/*"
  - "playground"
  - "docs"
```

- [ ] **Step 2: Create platform/web/package.json**

```json
{
  "name": "@pro/platform-web",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint src --ext .ts,.vue"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.4.0",
    "pinia": "^2.2.0",
    "element-plus": "^2.9.0",
    "@element-plus/icons-vue": "^2.3.0",
    "axios": "^1.7.0",
    "@vueuse/core": "^11.0.0",
    "@dagrejs/dagre": "^1.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^6.0.0",
    "typescript": "^5.5.0",
    "vue-tsc": "^2.0.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0"
  }
}
```

- [ ] **Step 3: Create platform/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "env.d.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create platform/web/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create platform/web/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3200,
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

- [ ] **Step 6: Create platform/web/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pro Components Platform</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Create platform/web/env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 8: Create platform/web/.env.development**

```ini
VITE_API_BASE_URL=/api/v1
```

- [ ] **Step 9: Create platform/web/.env.production**

```ini
VITE_API_BASE_URL=/api/v1
```

- [ ] **Step 10: Commit**

```bash
git add platform/web/package.json platform/web/tsconfig.json platform/web/tsconfig.node.json \
  platform/web/vite.config.ts platform/web/index.html platform/web/env.d.ts \
  platform/web/.env.development platform/web/.env.production pnpm-workspace.yaml
git commit -m "feat(platform): scaffold dashboard app with Vite + Vue 3 + Element Plus"
```

---

### Task 2: API Types + HTTP Client

**Files:**
- Create: `platform/web/src/api/types.ts`
- Create: `platform/web/src/api/client.ts`

- [ ] **Step 1: Create platform/web/src/api/types.ts**

All types mirror the database schema and API contracts from the design spec Section 7.

```typescript
/**
 * API response envelope — all endpoints return this shape.
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

// ─── Package & Version ───────────────────────────────────────────────

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

// ─── App ─────────────────────────────────────────────────────────────

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

// ─── App Version Map ─────────────────────────────────────────────────

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

// ─── Grayscale ───────────────────────────────────────────────────────

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

// ─── Compatibility ───────────────────────────────────────────────────

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

// ─── CDN Publish State Machine ───────────────────────────────────────

export type CdnPublishState = 'uploading' | 'propagating' | 'verifying' | 'active' | 'failed'

export interface CdnPublishStatus {
  package_name: string
  version: string
  state: CdnPublishState
  started_at: string
  updated_at: string
  error_message?: string
}

// ─── Version Events (Audit Log) ──────────────────────────────────────

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

// ─── Rollback ────────────────────────────────────────────────────────

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

// ─── RBAC ────────────────────────────────────────────────────────────

export type UserRole = 'viewer' | 'publisher' | 'operator' | 'admin'

export interface PlatformUser {
  id: number
  username: string
  role: UserRole
  created_at: string
}

// ─── Resolution Graph (debug) ────────────────────────────────────────

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

// ─── Health ──────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  db: boolean
  redis: boolean
  cdn_storage: boolean
  timestamp: string
}
```

- [ ] **Step 2: Create platform/web/src/api/client.ts**

```typescript
import axios from 'axios'
import type { ApiResponse } from './types'
import { ElMessage } from 'element-plus'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pro_platform_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      if (status === 401) {
        localStorage.removeItem('pro_platform_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (status === 403) {
        ElMessage.error('Permission denied for this operation')
        return Promise.reject(error)
      }

      ElMessage.error(`Request failed: ${message}`)
    }

    return Promise.reject(error)
  },
)

/**
 * Typed GET request — unwraps the ApiResponse envelope.
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params })
  return response.data.data
}

/**
 * Typed POST request — unwraps the ApiResponse envelope.
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data)
  return response.data.data
}

/**
 * Typed PUT request — unwraps the ApiResponse envelope.
 */
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data)
  return response.data.data
}

/**
 * Typed DELETE request — unwraps the ApiResponse envelope.
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url)
  return response.data.data
}

export { apiClient }
```

- [ ] **Step 3: Commit**

```bash
git add platform/web/src/api/types.ts platform/web/src/api/client.ts
git commit -m "feat(platform): add typed API client and full type definitions"
```

---

### Task 3: API Service Modules

**Files:**
- Create: `platform/web/src/api/apps.ts`
- Create: `platform/web/src/api/versions.ts`
- Create: `platform/web/src/api/grayscale.ts`
- Create: `platform/web/src/api/compat.ts`
- Create: `platform/web/src/api/operations.ts`

- [ ] **Step 1: Create platform/web/src/api/apps.ts**

```typescript
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
```

- [ ] **Step 2: Create platform/web/src/api/versions.ts**

```typescript
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
```

- [ ] **Step 3: Create platform/web/src/api/grayscale.ts**

```typescript
import { apiGet, apiPost, apiPut } from './client'
import type {
  GrayscaleRule,
  CreateGrayscalePayload,
  PaginatedResponse,
} from './types'

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
```

- [ ] **Step 4: Create platform/web/src/api/compat.ts**

```typescript
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
```

- [ ] **Step 5: Create platform/web/src/api/operations.ts**

```typescript
import { apiGet, apiPost } from './client'
import type {
  RollbackPreCheck,
  RollbackPayload,
  Version,
  HealthStatus,
} from './types'

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
export function executeRollback(
  versionId: number,
  payload: RollbackPayload,
): Promise<Version> {
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
```

- [ ] **Step 6: Commit**

```bash
git add platform/web/src/api/apps.ts platform/web/src/api/versions.ts \
  platform/web/src/api/grayscale.ts platform/web/src/api/compat.ts \
  platform/web/src/api/operations.ts
git commit -m "feat(platform): add all API service modules"
```

---

### Task 4: Router + Pinia Stores + App Entry

**Files:**
- Create: `platform/web/src/router/index.ts`
- Create: `platform/web/src/stores/auth.ts`
- Create: `platform/web/src/stores/app.ts`
- Create: `platform/web/src/main.ts`
- Create: `platform/web/src/App.vue`

- [ ] **Step 1: Create platform/web/src/router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    redirect: '/apps',
    children: [
      {
        path: 'apps',
        name: 'AppManage',
        component: () => import('@/views/app-manage/AppList.vue'),
        meta: { title: 'App Management', icon: 'Grid' },
      },
      {
        path: 'version-map',
        name: 'VersionMap',
        component: () => import('@/views/version-map/VersionMapList.vue'),
        meta: { title: 'Version Mapping', icon: 'Connection' },
      },
      {
        path: 'publish',
        name: 'Publish',
        component: () => import('@/views/publish/PublishList.vue'),
        meta: { title: 'Publish Management', icon: 'Upload' },
      },
      {
        path: 'grayscale',
        name: 'Grayscale',
        component: () => import('@/views/grayscale/GrayscaleList.vue'),
        meta: { title: 'Grayscale Strategy', icon: 'DataAnalysis' },
      },
      {
        path: 'compat',
        name: 'CompatMatrix',
        component: () => import('@/views/compat-matrix/CompatMatrix.vue'),
        meta: { title: 'Compatibility Matrix', icon: 'Checked' },
      },
      {
        path: 'changelog',
        name: 'Changelog',
        component: () => import('@/views/changelog/ChangelogView.vue'),
        meta: { title: 'Changelog', icon: 'Document' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'Pro Components Platform'
  document.title = `${title} - Pro Components`
})

export { router }
```

- [ ] **Step 2: Create platform/web/src/stores/auth.ts**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlatformUser, UserRole } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PlatformUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('pro_platform_token'))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username ?? '')
  const role = computed<UserRole | null>(() => user.value?.role ?? null)

  const ROLE_HIERARCHY: Record<UserRole, number> = {
    viewer: 0,
    publisher: 1,
    operator: 2,
    admin: 3,
  }

  function hasPermission(requiredRole: UserRole): boolean {
    if (!role.value) return false
    return ROLE_HIERARCHY[role.value] >= ROLE_HIERARCHY[requiredRole]
  }

  function setAuth(userData: PlatformUser, authToken: string) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('pro_platform_token', authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('pro_platform_token')
  }

  return {
    user,
    token,
    isLoggedIn,
    username,
    role,
    hasPermission,
    setAuth,
    clearAuth,
  }
})
```

- [ ] **Step 3: Create platform/web/src/stores/app.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { App, Package } from '@/api/types'
import { listApps } from '@/api/apps'
import { listPackages } from '@/api/versions'

export const useAppStore = defineStore('app', () => {
  const apps = ref<App[]>([])
  const packages = ref<Package[]>([])
  const appsLoading = ref(false)
  const packagesLoading = ref(false)
  const sidebarCollapsed = ref(false)

  async function fetchApps() {
    appsLoading.value = true
    try {
      const result = await listApps({ page: 1, pageSize: 100 })
      apps.value = result.items
    } finally {
      appsLoading.value = false
    }
  }

  async function fetchPackages() {
    packagesLoading.value = true
    try {
      packages.value = await listPackages()
    } finally {
      packagesLoading.value = false
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    apps,
    packages,
    appsLoading,
    packagesLoading,
    sidebarCollapsed,
    fetchApps,
    fetchPackages,
    toggleSidebar,
  }
})
```

- [ ] **Step 4: Create platform/web/src/main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

- [ ] **Step 5: Create platform/web/src/App.vue**

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.fetchApps()
  appStore.fetchPackages()
})
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
}
</style>
```

- [ ] **Step 6: Commit**

```bash
git add platform/web/src/router/index.ts platform/web/src/stores/auth.ts \
  platform/web/src/stores/app.ts platform/web/src/main.ts platform/web/src/App.vue
git commit -m "feat(platform): add router, Pinia stores, and app entry"
```

---

### Task 5: Dashboard Layout

**Files:**
- Create: `platform/web/src/layouts/DashboardLayout.vue`
- Create: `platform/web/src/components/Breadcrumb.vue`

- [ ] **Step 1: Create platform/web/src/layouts/DashboardLayout.vue**

```vue
<template>
  <el-container class="dashboard-layout">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-header">
        <el-icon :size="24" color="#409eff"><Box /></el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="sidebar-title">Pro Components</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="appStore.sidebarCollapsed"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#409eff"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon>
            <component :is="route.meta?.icon" />
          </el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="dashboard-header">
        <div class="header-left">
          <el-icon
            class="collapse-trigger"
            :size="20"
            @click="appStore.toggleSidebar()"
          >
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <AppBreadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="28" icon="UserFilled" />
              <span class="username">{{ authStore.username || 'Guest' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-tag size="small" :type="roleTagType">{{ authStore.role }}</el-tag>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="dashboard-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import AppBreadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

const menuRoutes = computed(() => {
  const dashboardRoute = router.getRoutes().find((r) => r.path === '/')
  return dashboardRoute?.children ?? []
})

const roleTagType = computed(() => {
  const map: Record<string, string> = {
    admin: 'danger',
    operator: 'warning',
    publisher: 'success',
    viewer: 'info',
  }
  return map[authStore.role ?? 'viewer'] ?? 'info'
})

function handleLogout() {
  authStore.clearAuth()
  window.location.href = '/login'
}
</script>

<style scoped>
.dashboard-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #ffffff1a;
}

.sidebar-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-trigger {
  cursor: pointer;
  color: #606266;
}

.collapse-trigger:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.username {
  font-size: 14px;
}

.dashboard-main {
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/components/Breadcrumb.vue**

```vue
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  path: string
  title: string
}

const route = useRoute()

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((r) => r.meta?.title)
  return matched.map((r) => ({
    path: r.path,
    title: r.meta.title as string,
  }))
})
</script>
```

- [ ] **Step 3: Commit**

```bash
git add platform/web/src/layouts/DashboardLayout.vue platform/web/src/components/Breadcrumb.vue
git commit -m "feat(platform): add dashboard layout with sidebar and breadcrumb"
```

---

### Task 6: Shared Components (StatusBadge, ConfirmDialog)

**Files:**
- Create: `platform/web/src/components/StatusBadge.vue`
- Create: `platform/web/src/components/ConfirmDialog.vue`

- [ ] **Step 1: Create platform/web/src/components/StatusBadge.vue**

```vue
<template>
  <el-tag :type="tagType" :size="size" :effect="effect" round>
    <span class="status-dot" :style="{ backgroundColor: dotColor }" />
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface StatusConfig {
  type: StatusVariant
  color: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  active: { type: 'success', color: '#67c23a' },
  pass: { type: 'success', color: '#67c23a' },
  published: { type: 'success', color: '#67c23a' },
  verifying: { type: 'primary', color: '#409eff' },
  propagating: { type: 'warning', color: '#e6a23c' },
  uploading: { type: 'warning', color: '#e6a23c' },
  paused: { type: 'warning', color: '#e6a23c' },
  deprecated: { type: 'info', color: '#909399' },
  untested: { type: 'info', color: '#909399' },
  completed: { type: 'info', color: '#909399' },
  failed: { type: 'danger', color: '#f56c6c' },
  fail: { type: 'danger', color: '#f56c6c' },
  yanked: { type: 'danger', color: '#f56c6c' },
}

const props = withDefaults(
  defineProps<{
    status: string
    size?: 'default' | 'small' | 'large'
    effect?: 'dark' | 'light' | 'plain'
  }>(),
  {
    size: 'small',
    effect: 'light',
  },
)

const config = computed<StatusConfig>(() => STATUS_MAP[props.status] ?? { type: 'info', color: '#909399' })
const tagType = computed(() => config.value.type)
const dotColor = computed(() => config.value.color)
const label = computed(() => props.status.charAt(0).toUpperCase() + props.status.slice(1))
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/components/ConfirmDialog.vue**

```vue
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon v-if="type === 'warning'" :size="48" color="#e6a23c"><WarningFilled /></el-icon>
      <el-icon v-else-if="type === 'danger'" :size="48" color="#f56c6c"><CircleCloseFilled /></el-icon>
      <el-icon v-else :size="48" color="#409eff"><InfoFilled /></el-icon>
      <p class="confirm-message">{{ message }}</p>
      <slot />
    </div>
    <template #footer>
      <el-button @click="handleClose">Cancel</el-button>
      <el-button
        :type="type === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    message?: string
    confirmText?: string
    type?: 'info' | 'warning' | 'danger'
    width?: string
    loading?: boolean
  }>(),
  {
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    type: 'warning',
    width: '420px',
    loading: false,
  },
)

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  confirm: []
  close: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  text-align: center;
}

.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add platform/web/src/components/StatusBadge.vue platform/web/src/components/ConfirmDialog.vue
git commit -m "feat(platform): add StatusBadge and ConfirmDialog shared components"
```

---

### Task 7: App Management Page

**Files:**
- Create: `platform/web/src/views/app-manage/AppList.vue`
- Create: `platform/web/src/views/app-manage/AppForm.vue`

- [ ] **Step 1: Create platform/web/src/views/app-manage/AppList.vue**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>App Management</h2>
      <el-button
        v-if="authStore.hasPermission('operator')"
        type="primary"
        :icon="Plus"
        @click="showCreateForm = true"
      >
        New App
      </el-button>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="Search by app ID or name..."
          clearable
          :prefix-icon="Search"
          style="width: 300px"
          @input="debouncedSearch"
        />
        <el-button :icon="Refresh" @click="loadApps">Refresh</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="apps"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="app_id" label="App ID" width="180" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="owner" label="Owner" width="150" />
        <el-table-column prop="created_at" label="Created" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="authStore.hasPermission('operator')"
              size="small"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="goToVersions(row.app_id)"
            >
              Versions
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="loadApps"
        />
      </div>
    </el-card>

    <AppForm
      v-model="showCreateForm"
      :editing-app="editingApp"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { listApps } from '@/api/apps'
import type { App } from '@/api/types'
import AppForm from './AppForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const apps = ref<App[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showCreateForm = ref(false)
const editingApp = ref<App | null>(null)

async function loadApps() {
  loading.value = true
  try {
    const result = await listApps({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    })
    apps.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  loadApps()
}, 300)

function handleEdit(app: App) {
  editingApp.value = app
  showCreateForm.value = true
}

function handleSaved() {
  showCreateForm.value = false
  editingApp.value = null
  loadApps()
}

function goToVersions(appId: string) {
  router.push({ path: '/version-map', query: { appId } })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadApps)
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/views/app-manage/AppForm.vue**

```vue
<template>
  <el-dialog
    v-model="visible"
    :title="isEditing ? 'Edit App' : 'Create App'"
    width="500px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="App ID" prop="app_id">
        <el-input
          v-model="formData.app_id"
          :disabled="isEditing"
          placeholder="e.g. user-center"
        />
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="formData.name" placeholder="Display name" />
      </el-form-item>
      <el-form-item label="Owner" prop="owner">
        <el-input v-model="formData.owner" placeholder="Owner username" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEditing ? 'Save' : 'Create' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createApp, updateApp } from '@/api/apps'
import type { App } from '@/api/types'

const props = defineProps<{
  editingApp: App | null
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEditing = computed(() => !!props.editingApp)

const formData = ref({
  app_id: '',
  name: '',
  owner: '',
})

const formRules: FormRules = {
  app_id: [
    { required: true, message: 'App ID is required', trigger: 'blur' },
    {
      pattern: /^[a-z0-9-]+$/,
      message: 'Only lowercase letters, numbers, and hyphens',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  owner: [{ required: true, message: 'Owner is required', trigger: 'blur' }],
}

watch(
  () => props.editingApp,
  (app) => {
    if (app) {
      formData.value = {
        app_id: app.app_id,
        name: app.name,
        owner: app.owner,
      }
    }
  },
)

function resetForm() {
  formData.value = { app_id: '', name: '', owner: '' }
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEditing.value) {
      await updateApp(formData.value.app_id, {
        name: formData.value.name,
        owner: formData.value.owner,
      })
      ElMessage.success('App updated')
    } else {
      await createApp(formData.value)
      ElMessage.success('App created')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 3: Commit**

```bash
git add platform/web/src/views/app-manage/AppList.vue platform/web/src/views/app-manage/AppForm.vue
git commit -m "feat(platform): add App Management page (list + create/edit)"
```

---

### Task 8: Version Mapping Page + Dependency Graph

**Files:**
- Create: `platform/web/src/views/version-map/VersionMapList.vue`
- Create: `platform/web/src/views/version-map/VersionEditDialog.vue`
- Create: `platform/web/src/components/DependencyGraph.vue`

- [ ] **Step 1: Create platform/web/src/views/version-map/VersionMapList.vue**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Version Mapping</h2>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="App">
          <el-select
            v-model="selectedAppId"
            placeholder="Select an app"
            filterable
            style="width: 240px"
            @change="loadVersionMaps"
          >
            <el-option
              v-for="app in appStore.apps"
              :key="app.app_id"
              :label="`${app.name} (${app.app_id})`"
              :value="app.app_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="loadVersionMaps">Refresh</el-button>
          <el-button
            type="primary"
            :icon="View"
            :disabled="!selectedAppId"
            @click="showDepGraph = true"
          >
            Dependency Graph
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="selectedAppId" shadow="never" style="margin-top: 16px">
      <el-table
        v-loading="loading"
        :data="versionMaps"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="package_name" label="Package" width="200" />
        <el-table-column label="Pinned Version" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.pinned_version" type="success" size="small">
              {{ row.pinned_version }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column label="Version Range" width="160">
          <template #default="{ row }">
            <code v-if="row.version_range">{{ row.version_range }}</code>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column label="Resolved Version" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.resolved_version" size="small">
              {{ row.resolved_version }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="Updated" width="180">
          <template #default="{ row }">
            {{ row.updated_at ? formatDate(row.updated_at) : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="Dependencies" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              :icon="Connection"
              @click="showDepsForPackage(row.package_name)"
            >
              Deps
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="authStore.hasPermission('operator')"
              size="small"
              type="primary"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-else description="Select an app to view version mappings" />

    <VersionEditDialog
      v-model="showEditDialog"
      :version-map="editingMap"
      @saved="handleSaved"
    />

    <el-dialog
      v-model="showDepGraph"
      title="Dependency Resolution Graph"
      width="80%"
      top="5vh"
    >
      <DependencyGraph v-if="showDepGraph && selectedAppId" :app-id="selectedAppId" />
    </el-dialog>

    <el-dialog
      v-model="showPackageDeps"
      :title="`Dependencies: ${depsPackageName}`"
      width="60%"
    >
      <div v-loading="depsLoading">
        <el-alert
          v-for="conflict in depsResult?.conflicts ?? []"
          :key="conflict.conflict"
          type="error"
          :closable="false"
          style="margin-bottom: 12px"
        >
          <template #title>
            Conflict: <strong>{{ conflict.conflict }}</strong>
          </template>
          <div>
            <div v-for="(range, pkg) in conflict.required" :key="pkg">
              {{ pkg }} requires <code>{{ range }}</code>
            </div>
            <div style="margin-top: 8px">
              Suggestion: {{ conflict.suggestion }}
            </div>
          </div>
        </el-alert>

        <el-tree
          v-if="depsResult?.tree"
          :data="[depsTreeData]"
          :props="{ children: 'children', label: 'label' }"
          default-expand-all
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Refresh, View, Connection } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { getAppVersions } from '@/api/apps'
import { getPackageDeps } from '@/api/versions'
import type { AppVersionMap, DependencyResolution, DependencyNode } from '@/api/types'
import VersionEditDialog from './VersionEditDialog.vue'
import DependencyGraph from '@/components/DependencyGraph.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const selectedAppId = ref('')
const versionMaps = ref<AppVersionMap[]>([])
const loading = ref(false)
const showEditDialog = ref(false)
const editingMap = ref<AppVersionMap | null>(null)
const showDepGraph = ref(false)

const showPackageDeps = ref(false)
const depsPackageName = ref('')
const depsLoading = ref(false)
const depsResult = ref<DependencyResolution | null>(null)

interface TreeNode {
  label: string
  children: TreeNode[]
}

const depsTreeData = ref<TreeNode>({ label: '', children: [] })

async function loadVersionMaps() {
  if (!selectedAppId.value) return
  loading.value = true
  try {
    versionMaps.value = await getAppVersions(selectedAppId.value)
  } finally {
    loading.value = false
  }
}

function handleEdit(map: AppVersionMap) {
  editingMap.value = map
  showEditDialog.value = true
}

function handleSaved() {
  showEditDialog.value = false
  editingMap.value = null
  loadVersionMaps()
}

function depNodeToTree(node: DependencyNode): TreeNode {
  return {
    label: `${node.package}@${node.version}`,
    children: node.dependencies.map(depNodeToTree),
  }
}

async function showDepsForPackage(packageName: string) {
  depsPackageName.value = packageName
  showPackageDeps.value = true
  depsLoading.value = true
  depsResult.value = null
  try {
    const result = await getPackageDeps(packageName)
    depsResult.value = result
    if (result.tree) {
      depsTreeData.value = depNodeToTree(result.tree)
    }
  } finally {
    depsLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  const queryAppId = route.query.appId as string
  if (queryAppId) {
    selectedAppId.value = queryAppId
    loadVersionMaps()
  }
})
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.text-muted {
  color: #c0c4cc;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/views/version-map/VersionEditDialog.vue**

```vue
<template>
  <el-dialog
    v-model="visible"
    title="Edit Version Mapping"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="versionMap" class="edit-content">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px">
        <el-descriptions-item label="Package">{{ versionMap.package_name }}</el-descriptions-item>
        <el-descriptions-item label="Current Resolved">
          {{ versionMap.resolved_version || '--' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
      >
        <el-form-item label="Mode">
          <el-radio-group v-model="versionMode">
            <el-radio value="pinned">Pin Exact Version</el-radio>
            <el-radio value="range">Semver Range</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="versionMode === 'pinned'"
          label="Pinned Version"
          prop="pinned_version"
        >
          <el-select
            v-model="formData.pinned_version"
            placeholder="Select version"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="v in availableVersions"
              :key="v.version"
              :label="v.version"
              :value="v.version"
            >
              <span>{{ v.version }}</span>
              <StatusBadge :status="v.status" style="margin-left: 8px" />
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="versionMode === 'range'"
          label="Version Range"
          prop="version_range"
        >
          <el-input
            v-model="formData.version_range"
            placeholder="e.g. ^1.2.0 or >=1.0.0 <2.0.0"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        Save
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { updateAppVersions } from '@/api/apps'
import { getPackageVersions } from '@/api/versions'
import type { AppVersionMap, Version } from '@/api/types'
import StatusBadge from '@/components/StatusBadge.vue'

const props = defineProps<{
  versionMap: AppVersionMap | null
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const versionMode = ref<'pinned' | 'range'>('pinned')
const availableVersions = ref<Version[]>([])

const formData = ref({
  pinned_version: '',
  version_range: '',
})

const formRules: FormRules = {
  pinned_version: [{ required: true, message: 'Select a version', trigger: 'change' }],
  version_range: [
    { required: true, message: 'Enter a semver range', trigger: 'blur' },
    {
      pattern: /^[\^~>=<\s0-9.*|-]+$/,
      message: 'Invalid semver range format',
      trigger: 'blur',
    },
  ],
}

watch(
  () => props.versionMap,
  async (map) => {
    if (!map) return

    if (map.pinned_version) {
      versionMode.value = 'pinned'
      formData.value.pinned_version = map.pinned_version
    } else if (map.version_range) {
      versionMode.value = 'range'
      formData.value.version_range = map.version_range
    }

    try {
      availableVersions.value = await getPackageVersions(map.package_name)
    } catch {
      availableVersions.value = []
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.versionMap) return

  submitting.value = true
  try {
    const payload = {
      package_id: props.versionMap.package_id,
      pinned_version: versionMode.value === 'pinned' ? formData.value.pinned_version : null,
      version_range: versionMode.value === 'range' ? formData.value.version_range : null,
    }
    await updateAppVersions(props.versionMap.app_id, [payload])
    ElMessage.success('Version mapping updated')
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.edit-content {
  padding: 8px 0;
}
</style>
```

- [ ] **Step 3: Create platform/web/src/components/DependencyGraph.vue**

Renders the resolution graph (nodes = apps + packages, edges = dependency relations) using SVG and dagre for layout.

```vue
<template>
  <div class="dep-graph-container" ref="containerRef">
    <div v-if="loading" class="graph-loading">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>Loading dependency graph...</span>
    </div>
    <div v-else-if="error" class="graph-error">
      <el-result icon="error" :sub-title="error">
        <template #extra>
          <el-button @click="loadGraph">Retry</el-button>
        </template>
      </el-result>
    </div>
    <svg
      v-else
      ref="svgRef"
      :width="svgWidth"
      :height="svgHeight"
      class="dep-graph-svg"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#909399" />
        </marker>
      </defs>

      <g :transform="`translate(${margin}, ${margin})`">
        <line
          v-for="(edge, i) in layoutEdges"
          :key="`edge-${i}`"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          stroke="#c0c4cc"
          stroke-width="1.5"
          marker-end="url(#arrowhead)"
        />

        <g
          v-for="node in layoutNodes"
          :key="node.id"
          :transform="`translate(${node.x - nodeWidth / 2}, ${node.y - nodeHeight / 2})`"
          class="graph-node"
        >
          <rect
            :width="nodeWidth"
            :height="nodeHeight"
            rx="6"
            :fill="node.type === 'app' ? '#ecf5ff' : '#f0f9eb'"
            :stroke="node.type === 'app' ? '#409eff' : '#67c23a'"
            stroke-width="1.5"
          />
          <text
            :x="nodeWidth / 2"
            :y="nodeHeight / 2 - 4"
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            fill="#303133"
          >
            {{ node.label }}
          </text>
          <text
            :x="nodeWidth / 2"
            :y="nodeHeight / 2 + 12"
            text-anchor="middle"
            font-size="10"
            fill="#909399"
          >
            {{ node.version }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import dagre from '@dagrejs/dagre'
import { getResolutionGraph } from '@/api/versions'
import type { ResolutionGraph } from '@/api/types'

const props = defineProps<{
  appId: string
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const graphData = ref<ResolutionGraph | null>(null)

const nodeWidth = 160
const nodeHeight = 50
const margin = 40

interface LayoutNode {
  id: string
  label: string
  version: string
  type: 'app' | 'package'
  x: number
  y: number
}

interface LayoutEdge {
  x1: number
  y1: number
  x2: number
  y2: number
}

const layoutNodes = ref<LayoutNode[]>([])
const layoutEdges = ref<LayoutEdge[]>([])

const svgWidth = computed(() => {
  if (layoutNodes.value.length === 0) return 600
  const maxX = Math.max(...layoutNodes.value.map((n) => n.x))
  return maxX + nodeWidth / 2 + margin * 2
})

const svgHeight = computed(() => {
  if (layoutNodes.value.length === 0) return 400
  const maxY = Math.max(...layoutNodes.value.map((n) => n.y))
  return maxY + nodeHeight / 2 + margin * 2
})

function computeLayout(data: ResolutionGraph) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of data.nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  }

  for (const edge of data.edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))

  layoutNodes.value = data.nodes.map((n) => {
    const pos = g.node(n.id)
    return {
      id: n.id,
      label: n.label,
      version: n.version,
      type: n.type,
      x: pos.x,
      y: pos.y,
    }
  })

  layoutEdges.value = data.edges.map((e) => {
    const sourcePos = g.node(e.source)
    const targetPos = g.node(e.target)
    return {
      x1: sourcePos.x,
      y1: sourcePos.y + nodeHeight / 2,
      x2: targetPos.x,
      y2: targetPos.y - nodeHeight / 2,
    }
  })
}

async function loadGraph() {
  loading.value = true
  error.value = null
  try {
    const data = await getResolutionGraph(props.appId)
    graphData.value = data
    computeLayout(data)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load graph'
  } finally {
    loading.value = false
  }
}

onMounted(loadGraph)
</script>

<style scoped>
.dep-graph-container {
  min-height: 400px;
  overflow: auto;
}

.graph-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 400px;
  color: #909399;
}

.graph-error {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dep-graph-svg {
  display: block;
}

.graph-node {
  cursor: default;
}

.graph-node:hover rect {
  filter: brightness(0.95);
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add platform/web/src/views/version-map/VersionMapList.vue \
  platform/web/src/views/version-map/VersionEditDialog.vue \
  platform/web/src/components/DependencyGraph.vue
git commit -m "feat(platform): add Version Mapping page with dependency graph"
```

---

### Task 9: Publish Management Page

**Files:**
- Create: `platform/web/src/components/StateMachineViz.vue`
- Create: `platform/web/src/views/publish/PublishList.vue`
- Create: `platform/web/src/views/publish/PublishTimeline.vue`

- [ ] **Step 1: Create platform/web/src/components/StateMachineViz.vue**

Renders the CDN publish state machine: uploading -> propagating -> verifying -> active / failed.

```vue
<template>
  <div class="state-machine">
    <div
      v-for="(step, index) in steps"
      :key="step.state"
      class="state-step"
    >
      <div
        class="state-node"
        :class="{
          'state-current': step.state === currentState,
          'state-completed': isCompleted(step.state),
          'state-failed': step.state === 'failed' && currentState === 'failed',
          'state-pending': isPending(step.state),
        }"
      >
        <el-icon v-if="isCompleted(step.state)" :size="20"><CircleCheckFilled /></el-icon>
        <el-icon v-else-if="step.state === currentState && currentState !== 'failed'" :size="20" class="is-loading"><Loading /></el-icon>
        <el-icon v-else-if="step.state === 'failed' && currentState === 'failed'" :size="20"><CircleCloseFilled /></el-icon>
        <span v-else class="state-number">{{ index + 1 }}</span>
      </div>
      <span class="state-label">{{ step.label }}</span>
      <div v-if="index < steps.length - 1" class="state-connector" :class="{ completed: isCompleted(step.state) }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CdnPublishState } from '@/api/types'

const STATE_ORDER: CdnPublishState[] = ['uploading', 'propagating', 'verifying', 'active']

const steps = [
  { state: 'uploading' as const, label: 'Uploading' },
  { state: 'propagating' as const, label: 'Propagating' },
  { state: 'verifying' as const, label: 'Verifying' },
  { state: 'active' as const, label: 'Active' },
  { state: 'failed' as const, label: 'Failed' },
]

const props = defineProps<{
  currentState: CdnPublishState
}>()

function stateIndex(state: CdnPublishState): number {
  return STATE_ORDER.indexOf(state)
}

function isCompleted(state: CdnPublishState): boolean {
  if (state === 'failed') return false
  const current = stateIndex(props.currentState)
  const target = stateIndex(state)
  if (current === -1) return false
  return target < current || (state === 'active' && props.currentState === 'active')
}

function isPending(state: CdnPublishState): boolean {
  if (props.currentState === 'failed') return state !== 'failed'
  const current = stateIndex(props.currentState)
  const target = stateIndex(state)
  return target > current
}
</script>

<style scoped>
.state-machine {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 16px 0;
}

.state-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 100px;
}

.state-node {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #dcdfe6;
  background: #fff;
  color: #c0c4cc;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.state-node.state-current {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.state-node.state-completed {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #67c23a;
}

.state-node.state-failed {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #f56c6c;
}

.state-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.state-number {
  font-size: 12px;
}

.state-connector {
  position: absolute;
  top: 18px;
  left: calc(50% + 18px);
  width: calc(100% - 36px);
  height: 2px;
  background: #dcdfe6;
}

.state-connector.completed {
  background: #67c23a;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/views/publish/PublishList.vue**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Publish Management</h2>
      <el-button :icon="Refresh" @click="loadStatuses">Refresh</el-button>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="stateFilter"
          placeholder="Filter by state"
          clearable
          style="width: 200px"
          @change="loadStatuses"
        >
          <el-option label="All" value="" />
          <el-option label="Uploading" value="uploading" />
          <el-option label="Propagating" value="propagating" />
          <el-option label="Verifying" value="verifying" />
          <el-option label="Active" value="active" />
          <el-option label="Failed" value="failed" />
        </el-select>
        <el-switch
          v-model="autoRefresh"
          active-text="Auto-refresh"
          inactive-text=""
          style="margin-left: 12px"
          @change="toggleAutoRefresh"
        />
      </div>

      <el-table
        v-loading="loading"
        :data="statuses"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="package_name" label="Package" width="200" />
        <el-table-column prop="version" label="Version" width="120" />
        <el-table-column label="State" width="400">
          <template #default="{ row }">
            <StateMachineViz :current-state="row.state" />
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.state" />
          </template>
        </el-table-column>
        <el-table-column prop="started_at" label="Started" width="180">
          <template #default="{ row }">
            {{ formatDate(row.started_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Error" min-width="200">
          <template #default="{ row }">
            <el-text v-if="row.error_message" type="danger" size="small">
              {{ row.error_message }}
            </el-text>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="loadStatuses"
        />
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <template #header>
        <span>Version Timeline</span>
      </template>
      <PublishTimeline />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { listPublishStatuses } from '@/api/versions'
import type { CdnPublishStatus } from '@/api/types'
import StateMachineViz from '@/components/StateMachineViz.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import PublishTimeline from './PublishTimeline.vue'

const statuses = ref<CdnPublishStatus[]>([])
const loading = ref(false)
const stateFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const autoRefresh = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function loadStatuses() {
  loading.value = true
  try {
    const result = await listPublishStatuses({
      page: page.value,
      pageSize: pageSize.value,
      state: stateFilter.value || undefined,
    })
    statuses.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function toggleAutoRefresh(enabled: boolean) {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (enabled) {
    refreshTimer = setInterval(loadStatuses, 5000)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(loadStatuses)

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 3: Create platform/web/src/views/publish/PublishTimeline.vue**

```vue
<template>
  <div v-loading="loading">
    <el-empty v-if="!loading && events.length === 0" description="No version events yet" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="event in events"
        :key="event.id"
        :timestamp="formatDate(event.created_at)"
        :type="eventType(event.action)"
        :hollow="event.action === 'rollback'"
        placement="top"
      >
        <el-card shadow="hover" class="timeline-card">
          <div class="timeline-header">
            <StatusBadge :status="event.action" />
            <span class="operator">by {{ event.operator }}</span>
          </div>
          <div class="timeline-body">
            <span v-if="event.from_version" class="version-change">
              {{ event.from_version }} <el-icon><Right /></el-icon> {{ event.to_version }}
            </span>
            <span v-else-if="event.to_version" class="version-change">
              {{ event.to_version }}
            </span>
            <el-text v-if="event.reason" type="info" size="small" class="event-reason">
              Reason: {{ event.reason }}
            </el-text>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @change="loadEvents"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Right } from '@element-plus/icons-vue'
import { getVersionEvents } from '@/api/versions'
import type { VersionEvent, EventAction } from '@/api/types'
import StatusBadge from '@/components/StatusBadge.vue'

const events = ref<VersionEvent[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)

function eventType(action: EventAction): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<EventAction, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    publish: 'success',
    pin: 'primary',
    upgrade: 'primary',
    rollback: 'danger',
    deprecate: 'warning',
    grayscale_start: 'info',
    grayscale_complete: 'success',
  }
  return map[action] ?? 'info'
}

async function loadEvents() {
  loading.value = true
  try {
    const result = await getVersionEvents({
      page: page.value,
      pageSize,
    })
    events.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadEvents)
</script>

<style scoped>
.timeline-card {
  max-width: 500px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #909399;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.event-reason {
  margin-top: 4px;
  font-style: italic;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add platform/web/src/components/StateMachineViz.vue \
  platform/web/src/views/publish/PublishList.vue \
  platform/web/src/views/publish/PublishTimeline.vue
git commit -m "feat(platform): add Publish Management with state machine and timeline"
```

---

### Task 10: Grayscale Strategy Page

**Files:**
- Create: `platform/web/src/views/grayscale/GrayscaleList.vue`
- Create: `platform/web/src/views/grayscale/GrayscaleRuleBuilder.vue`
- Create: `platform/web/src/views/grayscale/GrayscaleForm.vue`

- [ ] **Step 1: Create platform/web/src/views/grayscale/GrayscaleList.vue**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Grayscale Strategy</h2>
      <el-button
        v-if="authStore.hasPermission('operator')"
        type="primary"
        :icon="Plus"
        @click="showForm = true"
      >
        New Strategy
      </el-button>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Active" :value="activeCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Paused" :value="pausedCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Completed" :value="completedCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <el-statistic title="Total" :value="total" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="appFilter"
          placeholder="Filter by App"
          clearable
          style="width: 200px"
          @change="loadRules"
        >
          <el-option
            v-for="app in appStore.apps"
            :key="app.app_id"
            :label="app.name"
            :value="app.app_id"
          />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="Filter by Status"
          clearable
          style="width: 160px"
          @change="loadRules"
        >
          <el-option label="Active" value="active" />
          <el-option label="Paused" value="paused" />
          <el-option label="Completed" value="completed" />
        </el-select>
        <el-button :icon="Refresh" @click="loadRules">Refresh</el-button>
      </div>

      <el-table v-loading="loading" :data="rules" stripe style="width: 100%">
        <el-table-column prop="app_id" label="App" width="150" />
        <el-table-column prop="package_name" label="Package" width="180" />
        <el-table-column prop="target_version" label="Target Version" width="140" />
        <el-table-column prop="strategy" label="Strategy" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ row.strategy }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Created" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Rule Preview" min-width="200">
          <template #default="{ row }">
            <RulePreview :rule-config="row.rule_config" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="authStore.hasPermission('operator')"
          label="Actions"
          width="220"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              size="small"
              type="warning"
              @click="handlePause(row.id)"
            >
              Pause
            </el-button>
            <el-button
              v-if="row.status === 'paused'"
              size="small"
              type="success"
              @click="handleResume(row.id)"
            >
              Resume
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              size="small"
              type="primary"
              @click="handleComplete(row.id)"
            >
              Complete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="loadRules"
        />
      </div>
    </el-card>

    <GrayscaleForm
      v-model="showForm"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import {
  listGrayscaleRules,
  pauseGrayscaleRule,
  resumeGrayscaleRule,
  completeGrayscaleRule,
} from '@/api/grayscale'
import type { GrayscaleRule, GrayscaleCondition, CompositeRule } from '@/api/types'
import StatusBadge from '@/components/StatusBadge.vue'
import GrayscaleForm from './GrayscaleForm.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const rules = ref<GrayscaleRule[]>([])
const loading = ref(false)
const appFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showForm = ref(false)

const activeCount = computed(() => rules.value.filter((r) => r.status === 'active').length)
const pausedCount = computed(() => rules.value.filter((r) => r.status === 'paused').length)
const completedCount = computed(() => rules.value.filter((r) => r.status === 'completed').length)

async function loadRules() {
  loading.value = true
  try {
    const result = await listGrayscaleRules({
      app_id: appFilter.value || undefined,
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    rules.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

async function handlePause(id: number) {
  await ElMessageBox.confirm('Pause this grayscale rule?', 'Confirm')
  await pauseGrayscaleRule(id)
  ElMessage.success('Rule paused')
  loadRules()
}

async function handleResume(id: number) {
  await ElMessageBox.confirm('Resume this grayscale rule?', 'Confirm')
  await resumeGrayscaleRule(id)
  ElMessage.success('Rule resumed')
  loadRules()
}

async function handleComplete(id: number) {
  await ElMessageBox.confirm(
    'Complete this grayscale rule and promote to full release?',
    'Confirm Promotion',
    { type: 'warning' },
  )
  await completeGrayscaleRule(id)
  ElMessage.success('Promoted to full release')
  loadRules()
}

function handleSaved() {
  showForm.value = false
  loadRules()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Inline rule preview component */
const RulePreview = {
  props: {
    ruleConfig: { type: Object, required: true },
  },
  setup(props: { ruleConfig: GrayscaleCondition | CompositeRule }) {
    function describe(rule: GrayscaleCondition | CompositeRule): string {
      if ('operator' in rule) {
        const parts = rule.conditions.map(describe)
        return `(${parts.join(` ${rule.operator} `)})`
      }
      if (rule.type === 'user_list') {
        return `users: [${rule.values?.join(', ')}]`
      }
      if (rule.type === 'department') {
        return `dept: [${rule.values?.join(', ')}]`
      }
      if (rule.type === 'percentage') {
        return `${rule.value}% traffic`
      }
      return JSON.stringify(rule)
    }

    return () => h('code', { style: 'font-size: 12px; word-break: break-all' }, describe(props.ruleConfig))
  },
}

onMounted(loadRules)
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 2: Create platform/web/src/views/grayscale/GrayscaleRuleBuilder.vue**

Visual AND/OR composite rule builder. Supports recursive nesting.

```vue
<template>
  <div class="rule-builder" :class="{ nested: depth > 0 }">
    <div v-if="isComposite" class="composite-rule">
      <div class="composite-header">
        <el-radio-group
          :model-value="compositeOperator"
          size="small"
          @update:model-value="updateOperator"
        >
          <el-radio-button value="AND">AND</el-radio-button>
          <el-radio-button value="OR">OR</el-radio-button>
        </el-radio-group>
        <el-button
          v-if="depth > 0"
          size="small"
          type="danger"
          text
          @click="emit('remove')"
        >
          Remove Group
        </el-button>
      </div>

      <div class="conditions-list">
        <div
          v-for="(condition, index) in compositeConditions"
          :key="index"
          class="condition-item"
        >
          <GrayscaleRuleBuilder
            :model-value="condition"
            :depth="depth + 1"
            @update:model-value="updateCondition(index, $event)"
            @remove="removeCondition(index)"
          />
        </div>
      </div>

      <div class="add-buttons">
        <el-button size="small" @click="addSimpleCondition">
          + Add Condition
        </el-button>
        <el-button size="small" @click="addCompositeGroup">
          + Add Group
        </el-button>
      </div>
    </div>

    <div v-else class="simple-rule">
      <el-form inline size="small">
        <el-form-item label="Type">
          <el-select
            :model-value="simpleType"
            style="width: 140px"
            @update:model-value="updateSimpleType"
          >
            <el-option label="User List" value="user_list" />
            <el-option label="Department" value="department" />
            <el-option label="Percentage" value="percentage" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="simpleType === 'user_list'" label="Users">
          <el-select
            :model-value="simpleValues"
            multiple
            filterable
            allow-create
            placeholder="Enter user IDs"
            style="width: 280px"
            @update:model-value="updateSimpleValues"
          />
        </el-form-item>

        <el-form-item v-else-if="simpleType === 'department'" label="Departments">
          <el-select
            :model-value="simpleValues"
            multiple
            filterable
            allow-create
            placeholder="Enter department IDs"
            style="width: 280px"
            @update:model-value="updateSimpleValues"
          />
        </el-form-item>

        <el-form-item v-else-if="simpleType === 'percentage'" label="Percentage">
          <el-slider
            :model-value="simplePercentage"
            :min="1"
            :max="100"
            :format-tooltip="(v: number) => `${v}%`"
            style="width: 200px"
            @update:model-value="updateSimplePercentage"
          />
          <span style="margin-left: 8px">{{ simplePercentage }}%</span>
        </el-form-item>

        <el-form-item>
          <el-button
            v-if="depth > 0"
            size="small"
            type="danger"
            text
            :icon="Delete"
            @click="emit('remove')"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { GrayscaleCondition, CompositeRule } from '@/api/types'

type RuleNode = GrayscaleCondition | CompositeRule

const props = withDefaults(
  defineProps<{
    modelValue: RuleNode
    depth?: number
  }>(),
  { depth: 0 },
)

const emit = defineEmits<{
  'update:modelValue': [value: RuleNode]
  remove: []
}>()

const isComposite = computed(() => 'operator' in props.modelValue)

const compositeOperator = computed(() =>
  'operator' in props.modelValue ? props.modelValue.operator : 'AND',
)

const compositeConditions = computed(() =>
  'operator' in props.modelValue ? props.modelValue.conditions : [],
)

const simpleType = computed(() =>
  'type' in props.modelValue ? props.modelValue.type : 'user_list',
)

const simpleValues = computed(() =>
  'type' in props.modelValue && props.modelValue.values ? props.modelValue.values : [],
)

const simplePercentage = computed(() =>
  'type' in props.modelValue && props.modelValue.type === 'percentage'
    ? props.modelValue.value ?? 10
    : 10,
)

function updateOperator(op: string | number | boolean) {
  if (!isComposite.value) return
  emit('update:modelValue', {
    operator: op as 'AND' | 'OR',
    conditions: [...compositeConditions.value],
  })
}

function updateCondition(index: number, value: RuleNode) {
  if (!isComposite.value) return
  const conditions = [...compositeConditions.value]
  conditions[index] = value
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function removeCondition(index: number) {
  if (!isComposite.value) return
  const conditions = compositeConditions.value.filter((_, i) => i !== index)
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function addSimpleCondition() {
  if (!isComposite.value) return
  const conditions: RuleNode[] = [
    ...compositeConditions.value,
    { type: 'user_list' as const, values: [] },
  ]
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function addCompositeGroup() {
  if (!isComposite.value) return
  const conditions: RuleNode[] = [
    ...compositeConditions.value,
    {
      operator: 'AND' as const,
      conditions: [{ type: 'user_list' as const, values: [] }],
    },
  ]
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function updateSimpleType(type: string | number | boolean) {
  const t = type as 'user_list' | 'department' | 'percentage'
  if (t === 'percentage') {
    emit('update:modelValue', { type: t, value: 10, hash_key: 'user_id' })
  } else {
    emit('update:modelValue', { type: t, values: [] })
  }
}

function updateSimpleValues(values: string[]) {
  emit('update:modelValue', { type: simpleType.value, values })
}

function updateSimplePercentage(value: number) {
  emit('update:modelValue', {
    type: 'percentage' as const,
    value,
    hash_key: 'user_id',
  })
}
</script>

<style scoped>
.rule-builder.nested {
  margin-left: 20px;
  border-left: 2px solid #409eff;
  padding-left: 16px;
}

.composite-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.simple-rule {
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
```

- [ ] **Step 3: Create platform/web/src/views/grayscale/GrayscaleForm.vue**

```vue
<template>
  <el-dialog
    v-model="visible"
    title="Create Grayscale Strategy"
    width="700px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-form-item label="App" prop="app_id">
        <el-select
          v-model="formData.app_id"
          placeholder="Select app"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="app in appStore.apps"
            :key="app.app_id"
            :label="`${app.name} (${app.app_id})`"
            :value="app.app_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Package" prop="package_id">
        <el-select
          v-model="formData.package_id"
          placeholder="Select package"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="pkg in appStore.packages"
            :key="pkg.id"
            :label="pkg.name"
            :value="pkg.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Target Version" prop="target_version">
        <el-select
          v-model="formData.target_version"
          placeholder="Select target version"
          filterable
          style="width: 100%"
          :disabled="!selectedPackage"
        >
          <el-option
            v-for="v in availableVersions"
            :key="v.version"
            :label="v.version"
            :value="v.version"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Strategy Type" prop="strategy">
        <el-radio-group v-model="formData.strategy" @change="handleStrategyChange">
          <el-radio value="user_list">User List</el-radio>
          <el-radio value="department">Department</el-radio>
          <el-radio value="percentage">Percentage</el-radio>
          <el-radio value="composite">Composite</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Rule Configuration">
        <GrayscaleRuleBuilder
          v-model="ruleConfig"
          :depth="0"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        Create
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { createGrayscaleRule } from '@/api/grayscale'
import { getPackageVersions } from '@/api/versions'
import type { Version, GrayscaleStrategy, GrayscaleCondition, CompositeRule } from '@/api/types'
import GrayscaleRuleBuilder from './GrayscaleRuleBuilder.vue'

type RuleNode = GrayscaleCondition | CompositeRule

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const appStore = useAppStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const availableVersions = ref<Version[]>([])

const formData = ref({
  app_id: '',
  package_id: null as number | null,
  target_version: '',
  strategy: 'user_list' as GrayscaleStrategy,
})

const ruleConfig = ref<RuleNode>({
  type: 'user_list',
  values: [],
})

const formRules: FormRules = {
  app_id: [{ required: true, message: 'App is required', trigger: 'change' }],
  package_id: [{ required: true, message: 'Package is required', trigger: 'change' }],
  target_version: [{ required: true, message: 'Target version is required', trigger: 'change' }],
  strategy: [{ required: true, message: 'Strategy is required', trigger: 'change' }],
}

const selectedPackage = computed(() =>
  appStore.packages.find((p) => p.id === formData.value.package_id),
)

watch(
  () => formData.value.package_id,
  async (pkgId) => {
    formData.value.target_version = ''
    if (!pkgId) {
      availableVersions.value = []
      return
    }
    const pkg = appStore.packages.find((p) => p.id === pkgId)
    if (!pkg) return
    try {
      availableVersions.value = await getPackageVersions(pkg.name)
    } catch {
      availableVersions.value = []
    }
  },
)

function handleStrategyChange(strategy: GrayscaleStrategy) {
  if (strategy === 'composite') {
    ruleConfig.value = {
      operator: 'OR',
      conditions: [{ type: 'user_list', values: [] }],
    }
  } else if (strategy === 'percentage') {
    ruleConfig.value = { type: 'percentage', value: 10, hash_key: 'user_id' }
  } else {
    ruleConfig.value = { type: strategy, values: [] }
  }
}

function resetForm() {
  formData.value = {
    app_id: '',
    package_id: null,
    target_version: '',
    strategy: 'user_list',
  }
  ruleConfig.value = { type: 'user_list', values: [] }
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || formData.value.package_id === null) return

  submitting.value = true
  try {
    await createGrayscaleRule({
      app_id: formData.value.app_id,
      package_id: formData.value.package_id,
      target_version: formData.value.target_version,
      strategy: formData.value.strategy,
      rule_config: ruleConfig.value,
    })
    ElMessage.success('Grayscale strategy created')
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 4: Commit**

```bash
git add platform/web/src/views/grayscale/GrayscaleList.vue \
  platform/web/src/views/grayscale/GrayscaleRuleBuilder.vue \
  platform/web/src/views/grayscale/GrayscaleForm.vue
git commit -m "feat(platform): add Grayscale Strategy page with visual rule builder"
```

---

### Task 11: Compatibility Matrix Page

**Files:**
- Create: `platform/web/src/views/compat-matrix/CompatMatrix.vue`

- [ ] **Step 1: Create platform/web/src/views/compat-matrix/CompatMatrix.vue**

Matrix grid showing Vue versions x Element Plus versions, with colored cells (pass/fail/untested).

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Compatibility Matrix</h2>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="Package">
          <el-select
            v-model="selectedPackage"
            placeholder="Select package"
            filterable
            style="width: 240px"
            @change="loadMatrix"
          >
            <el-option
              v-for="pkg in appStore.packages"
              :key="pkg.name"
              :label="pkg.name"
              :value="pkg.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Version">
          <el-select
            v-model="selectedVersion"
            placeholder="Select version"
            filterable
            style="width: 160px"
            :disabled="!selectedPackage"
            @change="loadMatrix"
          >
            <el-option
              v-for="v in packageVersions"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="loadMatrix">Refresh</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="selectedPackage && selectedVersion" shadow="never" style="margin-top: 16px">
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot pass" />Pass
        </span>
        <span class="legend-item">
          <span class="legend-dot fail" />Fail
        </span>
        <span class="legend-item">
          <span class="legend-dot untested" />Untested
        </span>
      </div>

      <div v-loading="loading" class="matrix-wrapper">
        <table class="compat-table">
          <thead>
            <tr>
              <th class="corner-cell">Vue \ EP</th>
              <th v-for="ep in epVersions" :key="ep">{{ ep }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vue in vueVersions" :key="vue">
              <td class="row-header">{{ vue }}</td>
              <td
                v-for="ep in epVersions"
                :key="`${vue}-${ep}`"
                class="matrix-cell"
                :class="getCellClass(vue, ep)"
                @click="handleCellClick(vue, ep)"
              >
                <el-tooltip
                  :content="getCellTooltip(vue, ep)"
                  placement="top"
                >
                  <span class="cell-content">
                    <el-icon v-if="getCellStatus(vue, ep) === 'pass'" color="#67c23a"><CircleCheckFilled /></el-icon>
                    <el-icon v-else-if="getCellStatus(vue, ep) === 'fail'" color="#f56c6c"><CircleCloseFilled /></el-icon>
                    <el-icon v-else color="#c0c4cc"><QuestionFilled /></el-icon>
                  </span>
                </el-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>

    <el-empty v-else description="Select a package and version to view the compatibility matrix" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { getCompatResults } from '@/api/compat'
import { getPackageVersions } from '@/api/versions'
import type { CompatResult, CompatStatus } from '@/api/types'

const appStore = useAppStore()

const selectedPackage = ref('')
const selectedVersion = ref('')
const loading = ref(false)
const results = ref<CompatResult[]>([])
const packageVersions = ref<string[]>([])

const vueVersions = computed(() => {
  const versions = new Set(results.value.map((r) => r.vue_version))
  return [...versions].sort()
})

const epVersions = computed(() => {
  const versions = new Set(results.value.map((r) => r.element_plus_version))
  return [...versions].sort()
})

watch(
  () => selectedPackage.value,
  async (pkg) => {
    selectedVersion.value = ''
    packageVersions.value = []
    if (!pkg) return
    try {
      const versions = await getPackageVersions(pkg)
      packageVersions.value = versions.map((v) => v.version)
    } catch {
      packageVersions.value = []
    }
  },
)

function getResultKey(vueVersion: string, epVersion: string): string {
  return `${vueVersion}::${epVersion}`
}

const resultMap = computed(() => {
  const map = new Map<string, CompatResult>()
  for (const r of results.value) {
    map.set(getResultKey(r.vue_version, r.element_plus_version), r)
  }
  return map
})

function getCellStatus(vueVersion: string, epVersion: string): CompatStatus {
  return resultMap.value.get(getResultKey(vueVersion, epVersion))?.status ?? 'untested'
}

function getCellClass(vueVersion: string, epVersion: string): string {
  return `cell-${getCellStatus(vueVersion, epVersion)}`
}

function getCellTooltip(vueVersion: string, epVersion: string): string {
  const result = resultMap.value.get(getResultKey(vueVersion, epVersion))
  if (!result) return `Vue ${vueVersion} x EP ${epVersion}: Untested`
  const date = result.tested_at ? new Date(result.tested_at).toLocaleDateString() : 'unknown'
  return `Vue ${vueVersion} x EP ${epVersion}: ${result.status.toUpperCase()} (${date})`
}

function handleCellClick(vueVersion: string, epVersion: string) {
  const result = resultMap.value.get(getResultKey(vueVersion, epVersion))
  if (result?.ci_run_url) {
    window.open(result.ci_run_url, '_blank')
  }
}

async function loadMatrix() {
  if (!selectedPackage.value || !selectedVersion.value) return
  loading.value = true
  try {
    results.value = await getCompatResults(selectedPackage.value, {
      version: selectedVersion.value,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.pass {
  background: #f0f9eb;
  border: 1px solid #67c23a;
}

.legend-dot.fail {
  background: #fef0f0;
  border: 1px solid #f56c6c;
}

.legend-dot.untested {
  background: #f4f4f5;
  border: 1px solid #c0c4cc;
}

.matrix-wrapper {
  overflow-x: auto;
}

.compat-table {
  border-collapse: collapse;
  width: auto;
}

.compat-table th,
.compat-table td {
  border: 1px solid #ebeef5;
  padding: 12px 16px;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
}

.corner-cell {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.compat-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.row-header {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
  text-align: left;
}

.matrix-cell {
  cursor: pointer;
  transition: background 0.2s;
  min-width: 60px;
}

.matrix-cell:hover {
  filter: brightness(0.95);
}

.cell-pass {
  background: #f0f9eb;
}

.cell-fail {
  background: #fef0f0;
}

.cell-untested {
  background: #f4f4f5;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add platform/web/src/views/compat-matrix/CompatMatrix.vue
git commit -m "feat(platform): add Compatibility Matrix page with colored grid"
```

---

### Task 12: Changelog Page

**Files:**
- Create: `platform/web/src/views/changelog/ChangelogView.vue`

- [ ] **Step 1: Create platform/web/src/views/changelog/ChangelogView.vue**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Changelog</h2>
    </div>

    <el-card shadow="never">
      <div class="filter-bar">
        <el-select
          v-model="selectedPackage"
          placeholder="Select package"
          filterable
          style="width: 240px"
          @change="loadVersions"
        >
          <el-option
            v-for="pkg in appStore.packages"
            :key="pkg.name"
            :label="pkg.name"
            :value="pkg.name"
          />
        </el-select>
        <el-checkbox v-model="breakingOnly" @change="filterVersions">
          Breaking changes only
        </el-checkbox>
      </div>

      <div v-loading="loading">
        <el-empty v-if="!loading && filteredVersions.length === 0" description="No versions found" />

        <div v-for="version in filteredVersions" :key="version.id" class="version-entry">
          <div class="version-header">
            <div class="version-left">
              <h3 class="version-number">{{ version.version }}</h3>
              <StatusBadge :status="version.status" />
              <el-tag
                v-if="hasBreakingChanges(version)"
                type="danger"
                size="small"
                effect="dark"
              >
                BREAKING
              </el-tag>
            </div>
            <span class="version-date">{{ formatDate(version.published_at) }}</span>
          </div>

          <div v-if="version.changelog" class="changelog-content">
            <p>{{ version.changelog }}</p>
          </div>

          <div v-if="hasBreakingChanges(version)" class="breaking-changes">
            <h4 class="breaking-title">
              <el-icon color="#f56c6c"><Warning /></el-icon>
              Breaking Changes
            </h4>
            <ul>
              <li
                v-for="(change, i) in version.breaking_changes"
                :key="i"
                class="breaking-item"
              >
                <div class="breaking-description">{{ change.description }}</div>
                <div v-if="change.migration" class="migration-hint">
                  <strong>Migration:</strong> {{ change.migration }}
                </div>
              </li>
            </ul>
          </div>

          <div v-if="version.dependencies" class="deps-section">
            <el-collapse>
              <el-collapse-item title="Dependencies">
                <div class="deps-list">
                  <el-tag
                    v-for="(depVersion, depName) in version.dependencies"
                    :key="depName as string"
                    size="small"
                    type="info"
                  >
                    {{ depName }}@{{ depVersion }}
                  </el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <el-divider />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { getPackageVersions } from '@/api/versions'
import type { Version } from '@/api/types'
import StatusBadge from '@/components/StatusBadge.vue'

const appStore = useAppStore()

const selectedPackage = ref('')
const loading = ref(false)
const allVersions = ref<Version[]>([])
const breakingOnly = ref(false)

const filteredVersions = computed(() => {
  if (!breakingOnly.value) return allVersions.value
  return allVersions.value.filter(hasBreakingChanges)
})

function hasBreakingChanges(version: Version): boolean {
  return !!version.breaking_changes && version.breaking_changes.length > 0
}

function filterVersions() {
  // Reactivity handles this via filteredVersions computed
}

async function loadVersions() {
  if (!selectedPackage.value) {
    allVersions.value = []
    return
  }
  loading.value = true
  try {
    const versions = await getPackageVersions(selectedPackage.value)
    allVersions.value = versions.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.version-entry {
  padding: 4px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.version-date {
  font-size: 13px;
  color: #909399;
}

.changelog-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.changelog-content p {
  margin: 0;
  white-space: pre-wrap;
}

.breaking-changes {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.breaking-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #f56c6c;
}

.breaking-changes ul {
  margin: 0;
  padding-left: 20px;
}

.breaking-item {
  margin-bottom: 8px;
}

.breaking-description {
  color: #303133;
  font-size: 13px;
}

.migration-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
  background: #fff;
  padding: 4px 8px;
  border-radius: 2px;
}

.deps-section {
  margin-top: 8px;
}

.deps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add platform/web/src/views/changelog/ChangelogView.vue
git commit -m "feat(platform): add Changelog page with breaking changes highlight"
```

---

### Task 13: Rollback Dialog

**Files:**
- Create: `platform/web/src/views/rollback/RollbackDialog.vue`

- [ ] **Step 1: Create platform/web/src/views/rollback/RollbackDialog.vue**

Reusable rollback dialog with target version selection, mandatory reason, pre-check results, and two-step confirmation.

```vue
<template>
  <el-dialog
    v-model="visible"
    title="Rollback Version"
    width="600px"
    :close-on-click-modal="false"
    @close="resetState"
  >
    <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 24px">
      <el-step title="Configure" />
      <el-step title="Pre-check" />
      <el-step title="Confirm" />
    </el-steps>

    <!-- Step 0: Configure -->
    <div v-show="currentStep === 0">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
      >
        <el-form-item label="Current Version">
          <el-tag>{{ currentVersion }}</el-tag>
        </el-form-item>
        <el-form-item label="Target Version" prop="target_version">
          <el-select
            v-model="formData.target_version"
            placeholder="Select rollback target"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="v in rollbackTargets"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="Mandatory: explain why this rollback is needed"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 1: Pre-check -->
    <div v-show="currentStep === 1">
      <div v-loading="preCheckLoading" class="precheck-results">
        <template v-if="preCheckResult">
          <el-result
            :icon="preCheckPassed ? 'success' : 'warning'"
            :title="preCheckPassed ? 'Pre-check passed' : 'Pre-check has warnings'"
          />

          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="CDN Resources Exist">
              <el-tag :type="preCheckResult.cdn_resources_exist ? 'success' : 'danger'" size="small">
                {{ preCheckResult.cdn_resources_exist ? 'Yes' : 'No' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="SRI Hash Valid">
              <el-tag :type="preCheckResult.sri_hash_valid ? 'success' : 'danger'" size="small">
                {{ preCheckResult.sri_hash_valid ? 'Yes' : 'No' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Target Version">
              {{ preCheckResult.target_version }}
            </el-descriptions-item>
            <el-descriptions-item label="Affected Apps">
              <el-tag
                v-for="app in preCheckResult.affected_apps"
                :key="app"
                size="small"
                style="margin-right: 4px"
              >
                {{ app }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-alert
            v-for="(warning, i) in preCheckResult.warnings"
            :key="i"
            :title="warning"
            type="warning"
            :closable="false"
            style="margin-top: 8px"
          />
        </template>
      </div>
    </div>

    <!-- Step 2: Confirm -->
    <div v-show="currentStep === 2">
      <div class="confirm-summary">
        <el-alert type="error" :closable="false" show-icon>
          <template #title>
            <strong>You are about to roll back from {{ currentVersion }} to {{ formData.target_version }}</strong>
          </template>
          This action will update version mappings for all affected apps.
          The rollback will go through grayscale (internal traffic first).
        </el-alert>

        <el-descriptions :column="1" border size="small" style="margin-top: 16px">
          <el-descriptions-item label="From">{{ currentVersion }}</el-descriptions-item>
          <el-descriptions-item label="To">{{ formData.target_version }}</el-descriptions-item>
          <el-descriptions-item label="Reason">{{ formData.reason }}</el-descriptions-item>
          <el-descriptions-item label="Affected Apps">
            {{ preCheckResult?.affected_apps.join(', ') || '--' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-checkbox v-model="finalConfirmation" style="margin-top: 16px">
          I understand the impact and want to proceed with this rollback
        </el-checkbox>
      </div>
    </div>

    <template #footer>
      <el-button v-if="currentStep > 0" @click="currentStep--">Back</el-button>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button
        v-if="currentStep === 0"
        type="primary"
        @click="handleNextToPreCheck"
      >
        Run Pre-check
      </el-button>
      <el-button
        v-else-if="currentStep === 1"
        type="primary"
        :disabled="!preCheckPassed"
        @click="currentStep = 2"
      >
        Next
      </el-button>
      <el-button
        v-else
        type="danger"
        :loading="executing"
        :disabled="!finalConfirmation"
        @click="handleExecute"
      >
        Execute Rollback
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { rollbackPreCheck, executeRollback } from '@/api/operations'
import type { RollbackPreCheck } from '@/api/types'

const props = defineProps<{
  versionId: number
  currentVersion: string
  rollbackTargets: string[]
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  rolledBack: []
}>()

const formRef = ref<FormInstance>()
const currentStep = ref(0)
const preCheckLoading = ref(false)
const preCheckResult = ref<RollbackPreCheck | null>(null)
const executing = ref(false)
const finalConfirmation = ref(false)

const formData = ref({
  target_version: '',
  reason: '',
})

const formRules: FormRules = {
  target_version: [{ required: true, message: 'Target version is required', trigger: 'change' }],
  reason: [
    { required: true, message: 'Reason is mandatory for rollback', trigger: 'blur' },
    { min: 10, message: 'Reason must be at least 10 characters', trigger: 'blur' },
  ],
}

const preCheckPassed = computed(() => {
  if (!preCheckResult.value) return false
  return preCheckResult.value.cdn_resources_exist && preCheckResult.value.sri_hash_valid
})

async function handleNextToPreCheck() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  currentStep.value = 1
  preCheckLoading.value = true
  preCheckResult.value = null

  try {
    preCheckResult.value = await rollbackPreCheck(
      props.versionId,
      formData.value.target_version,
    )
  } catch (err: unknown) {
    ElMessage.error('Pre-check failed')
    currentStep.value = 0
  } finally {
    preCheckLoading.value = false
  }
}

async function handleExecute() {
  if (!finalConfirmation.value) return

  executing.value = true
  try {
    await executeRollback(props.versionId, {
      target_version: formData.value.target_version,
      reason: formData.value.reason,
    })
    ElMessage.success('Rollback initiated — going through grayscale')
    visible.value = false
    emit('rolledBack')
  } finally {
    executing.value = false
  }
}

function resetState() {
  currentStep.value = 0
  preCheckResult.value = null
  finalConfirmation.value = false
  formData.value = { target_version: '', reason: '' }
  formRef.value?.resetFields()
}
</script>

<style scoped>
.precheck-results {
  min-height: 200px;
}

.confirm-summary {
  padding: 8px 0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add platform/web/src/views/rollback/RollbackDialog.vue
git commit -m "feat(platform): add Rollback dialog with pre-check and two-step confirmation"
```

---

## Self-Review Checklist

- [ ] All file paths are complete and consistent with the file structure map
- [ ] Every `.vue` file is a complete SFC with `<template>`, `<script setup lang="ts">`, and `<style scoped>`
- [ ] API client uses typed generics — no `any` leakage in consumer code
- [ ] All API types match the database schema from the design spec Section 7
- [ ] Router guards set page title
- [ ] RBAC is enforced in the UI via `authStore.hasPermission()` — operator for mutations, admin for rollback
- [ ] Rollback dialog enforces mandatory reason field (minimum 10 characters)
- [ ] Rollback flows through pre-check before execution
- [ ] CDN publish state machine covers all 5 states: uploading -> propagating -> verifying -> active / failed
- [ ] Grayscale rule builder supports recursive AND/OR composite rules matching the spec's JSON structure
- [ ] Compatibility matrix renders as a grid with Vue x Element Plus axes
- [ ] Changelog page highlights breaking changes with red background and migration hints
- [ ] Dependency graph uses dagre for layout, renders as SVG
- [ ] Auto-refresh polling on publish page uses `setInterval` with proper cleanup in `onUnmounted`
- [ ] No backend implementation — all data flows through the typed API client
- [ ] Element Plus components used: ElTable, ElForm, ElDialog, ElSelect, ElTag, ElTimeline, ElSteps, ElTree, ElStatistic, ElPagination, ElBreadcrumb, ElMenu, ElDropdown
- [ ] No `console.log` in production code — errors handled via `ElMessage`
- [ ] TypeScript strict mode — no `any` types, proper `unknown` + narrowing for error handling
- [ ] Vite dev server proxies `/api` to backend at port 3100
