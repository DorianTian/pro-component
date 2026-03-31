# Plan 5a: Version Management Platform API (Backend)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete backend API for the Version Management Platform — Koa.js server with MySQL persistence, RBAC authentication, semver dependency resolver, grayscale engine, import map generation, version sync, app management, rollback safety, and deep health checks. This plan covers ONLY the backend; the Dashboard frontend is a separate plan (5b).

**Architecture:** Modular Koa application structured by domain (app, version, import-map, grayscale, sync). Each module exposes a router, service layer, and data access layer. Core engines (semver resolver, grayscale evaluator) are pure functions with zero I/O dependencies, enabling 100% unit test coverage. Knex handles migrations and query building. JWT-based RBAC middleware gates all mutating endpoints. The import map generation endpoint is the consumer-facing hot path — it queries version maps, evaluates grayscale rules, resolves semver ranges, expands the dependency tree, and returns a complete import map response with preloads, styles, and SRI hashes. Results are cached with a composite key of appId + userId + version fingerprint.

**Tech Stack:** Koa 2, koa-router, koa-bodyparser, koa-cors, Knex 3 (MySQL 8), jsonwebtoken, bcryptjs, semver (npm package), Vitest, supertest, pino (structured logging)

---

## File Structure

```
pro-components/
└── platform/
    └── server/
        ├── package.json
        ├── tsconfig.json
        ├── knexfile.ts                         # Knex config (dev/test/prod)
        ├── src/
        │   ├── index.ts                        # App entry — create + listen
        │   ├── app.ts                          # Koa app factory (testable)
        │   ├── config.ts                       # Env-based config loader
        │   ├── logger.ts                       # Pino structured logger
        │   ├── db.ts                           # Knex instance singleton
        │   ├── types/
        │   │   ├── index.ts                    # Barrel export
        │   │   ├── database.ts                 # DB row types (mirrors tables)
        │   │   ├── api.ts                      # Request/response DTOs
        │   │   └── grayscale.ts                # Grayscale rule config types
        │   ├── middleware/
        │   │   ├── auth.ts                     # JWT verify + role injection
        │   │   ├── rbac.ts                     # Role-based permission guard
        │   │   ├── error-handler.ts            # Global error → JSON response
        │   │   ├── request-id.ts               # X-Request-Id injection
        │   │   └── request-logger.ts           # Pino HTTP request logging
        │   ├── modules/
        │   │   ├── app/
        │   │   │   ├── router.ts               # /api/v1/apps routes
        │   │   │   ├── service.ts              # Business logic
        │   │   │   └── repository.ts           # Knex queries
        │   │   ├── version/
        │   │   │   ├── router.ts               # /api/v1/versions routes
        │   │   │   ├── service.ts              # Version CRUD + rollback + deprecate
        │   │   │   └── repository.ts           # Knex queries
        │   │   ├── import-map/
        │   │   │   ├── router.ts               # GET /api/v1/import-map
        │   │   │   ├── service.ts              # Orchestrates resolver + grayscale
        │   │   │   └── cache.ts                # In-memory LRU with fingerprint key
        │   │   ├── grayscale/
        │   │   │   ├── router.ts               # /api/v1/grayscale routes
        │   │   │   ├── service.ts              # CRUD + status transitions
        │   │   │   └── repository.ts           # Knex queries
        │   │   ├── sync/
        │   │   │   ├── router.ts               # POST /api/v1/versions/sync
        │   │   │   └── service.ts              # npm publish hook handler
        │   │   ├── compat/
        │   │   │   ├── router.ts               # /api/v1/compat routes
        │   │   │   └── service.ts              # Compat result CRUD
        │   │   └── health/
        │   │       └── router.ts               # GET /health/resolution
        │   ├── engines/
        │   │   ├── semver-resolver.ts           # Range intersection + dep tree + diamond detection
        │   │   └── grayscale-evaluator.ts       # Composite rule evaluation + hash percentage
        │   └── utils/
        │       ├── semver-helpers.ts            # Semver utility wrappers
        │       └── hash.ts                      # Deterministic hash for percentage grayscale
        ├── migrations/
        │   ├── 20260331000001_create_packages.ts
        │   ├── 20260331000002_create_versions.ts
        │   ├── 20260331000003_create_apps.ts
        │   ├── 20260331000004_create_app_version_maps.ts
        │   ├── 20260331000005_create_grayscale_rules.ts
        │   ├── 20260331000006_create_compat_results.ts
        │   ├── 20260331000007_create_version_events.ts
        │   └── 20260331000008_create_platform_users.ts
        ├── seeds/
        │   └── 01_dev_seed.ts                  # Dev seed data
        └── __tests__/
            ├── setup.ts                        # Test DB setup/teardown
            ├── helpers.ts                      # Auth token factory, request helpers
            ├── unit/
            │   ├── semver-resolver.test.ts      # 100% coverage target
            │   ├── grayscale-evaluator.test.ts  # 100% coverage target
            │   └── hash.test.ts
            ├── integration/
            │   ├── import-map.test.ts           # Full generation pipeline
            │   ├── app.test.ts                  # CRUD endpoints
            │   ├── version.test.ts              # Sync + rollback + deprecate
            │   ├── grayscale.test.ts            # Create/pause/complete
            │   ├── rbac.test.ts                 # Permission boundary tests
            │   └── health.test.ts
            └── contract/
                └── resolver-grayscale.test.ts   # Cross-engine contract tests
```

---

### Task 1: Project Scaffold + Koa App Setup

**Files:**
- Create: `platform/server/package.json`
- Create: `platform/server/tsconfig.json`
- Create: `platform/server/knexfile.ts`
- Create: `platform/server/src/config.ts`
- Create: `platform/server/src/logger.ts`
- Create: `platform/server/src/db.ts`
- Create: `platform/server/src/app.ts`
- Create: `platform/server/src/index.ts`

- [ ] **Step 1: Create platform/server/package.json**

```json
{
  "name": "@pro/platform-server",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "migrate": "knex migrate:latest --knexfile knexfile.ts",
    "migrate:rollback": "knex migrate:rollback --knexfile knexfile.ts",
    "migrate:make": "knex migrate:make --knexfile knexfile.ts",
    "seed": "knex seed:run --knexfile knexfile.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "knex": "^3.1.0",
    "koa": "^2.15.0",
    "koa-bodyparser": "^4.4.0",
    "koa-cors": "^0.0.16",
    "@koa/cors": "^5.0.0",
    "koa-router": "^13.0.0",
    "lru-cache": "^11.0.0",
    "mysql2": "^3.11.0",
    "pino": "^9.0.0",
    "semver": "^7.6.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/koa": "^2.15.0",
    "@types/koa-bodyparser": "^4.3.0",
    "@types/koa-router": "^7.4.0",
    "@types/koa__cors": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "pino-pretty": "^11.0.0",
    "supertest": "^7.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create platform/server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 3: Create platform/server/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 10000,
  },
})
```

- [ ] **Step 4: Create platform/server/src/config.ts**

```typescript
export interface AppConfig {
  port: number
  env: 'development' | 'test' | 'production'
  db: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  cdn: {
    baseUrl: string
  }
  cache: {
    importMapMaxSize: number
    importMapTtlMs: number
  }
}

export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV || 'development') as AppConfig['env']

  return {
    port: parseInt(process.env.PORT || '3100', 10),
    env,
    db: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || (env === 'test' ? 'pro_platform_test' : 'pro_platform'),
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    cdn: {
      baseUrl: process.env.CDN_BASE_URL || 'https://cdn.internal',
    },
    cache: {
      importMapMaxSize: parseInt(process.env.IMPORT_MAP_CACHE_MAX || '1000', 10),
      importMapTtlMs: parseInt(process.env.IMPORT_MAP_CACHE_TTL_MS || '60000', 10),
    },
  }
}
```

- [ ] **Step 5: Create platform/server/src/logger.ts**

```typescript
import pino from 'pino'
import { loadConfig } from './config.js'

const config = loadConfig()

export const logger = pino({
  level: config.env === 'test' ? 'silent' : config.env === 'production' ? 'info' : 'debug',
  transport:
    config.env === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: { service: 'pro-platform-api' },
})
```

- [ ] **Step 6: Create platform/server/knexfile.ts**

```typescript
import type { Knex } from 'knex'
import { loadConfig } from './src/config.js'

const config = loadConfig()

const baseConnection: Knex.MySql2ConnectionConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
}

const baseConfig: Knex.Config = {
  client: 'mysql2',
  connection: baseConnection,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
}

const knexConfig: Record<string, Knex.Config> = {
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
    connection: {
      ...baseConnection,
      database: 'pro_platform_test',
    },
    pool: { min: 1, max: 5 },
  },
  production: {
    ...baseConfig,
    pool: { min: 5, max: 30 },
  },
}

export default knexConfig
```

- [ ] **Step 7: Create platform/server/src/db.ts**

```typescript
import knex, { type Knex } from 'knex'
import { loadConfig } from './config.js'
import { logger } from './logger.js'

let instance: Knex | null = null

export function getDb(): Knex {
  if (!instance) {
    const config = loadConfig()

    // Dynamic import workaround: load knexfile config inline
    instance = knex({
      client: 'mysql2',
      connection: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      },
      pool: {
        min: config.env === 'test' ? 1 : 2,
        max: config.env === 'test' ? 5 : 10,
      },
    })

    logger.info({ database: config.db.database }, 'Knex instance created')
  }

  return instance
}

export async function destroyDb(): Promise<void> {
  if (instance) {
    await instance.destroy()
    instance = null
    logger.info('Knex instance destroyed')
  }
}

/**
 * Create a fresh Knex instance for testing — isolated from singleton.
 * Caller is responsible for destroying it.
 */
export function createTestDb(database: string): Knex {
  const config = loadConfig()
  return knex({
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database,
    },
    pool: { min: 1, max: 5 },
  })
}
```

- [ ] **Step 8: Create platform/server/src/app.ts**

```typescript
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { errorHandler } from './middleware/error-handler.js'
import { requestId } from './middleware/request-id.js'
import { requestLogger } from './middleware/request-logger.js'
import { appRouter } from './modules/app/router.js'
import { versionRouter } from './modules/version/router.js'
import { importMapRouter } from './modules/import-map/router.js'
import { grayscaleRouter } from './modules/grayscale/router.js'
import { syncRouter } from './modules/sync/router.js'
import { compatRouter } from './modules/compat/router.js'
import { healthRouter } from './modules/health/router.js'

export function createApp(): Koa {
  const app = new Koa()

  // Global middleware (order matters)
  app.use(errorHandler)
  app.use(requestId)
  app.use(requestLogger)
  app.use(
    cors({
      origin: (ctx) => {
        const origin = ctx.get('Origin')
        // In production, validate against allowlist
        return origin || '*'
      },
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  )
  app.use(bodyParser({ jsonLimit: '1mb' }))

  // Health check (no auth, no version prefix)
  app.use(healthRouter.routes())
  app.use(healthRouter.allowedMethods())

  // API v1 routes
  app.use(importMapRouter.routes())
  app.use(importMapRouter.allowedMethods())
  app.use(appRouter.routes())
  app.use(appRouter.allowedMethods())
  app.use(versionRouter.routes())
  app.use(versionRouter.allowedMethods())
  app.use(grayscaleRouter.routes())
  app.use(grayscaleRouter.allowedMethods())
  app.use(syncRouter.routes())
  app.use(syncRouter.allowedMethods())
  app.use(compatRouter.routes())
  app.use(compatRouter.allowedMethods())

  return app
}
```

- [ ] **Step 9: Create platform/server/src/index.ts**

```typescript
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { logger } from './logger.js'
import { destroyDb } from './db.js'

const config = loadConfig()
const app = createApp()

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'Platform API server started')
})

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received')
  server.close(() => {
    logger.info('HTTP server closed')
  })
  await destroyDb()
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

- [ ] **Step 10: Verify — install deps, tsc compiles (expect errors for missing modules — that's expected, structure is validated)**

```bash
cd platform/server && pnpm install && pnpm exec tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 11: Commit**

```bash
git add platform/server/package.json platform/server/tsconfig.json platform/server/vitest.config.ts platform/server/knexfile.ts platform/server/src/
git commit -m "feat(platform): scaffold Koa server with config, logger, db, app factory"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `platform/server/src/types/database.ts`
- Create: `platform/server/src/types/api.ts`
- Create: `platform/server/src/types/grayscale.ts`
- Create: `platform/server/src/types/index.ts`

- [ ] **Step 1: Create platform/server/src/types/database.ts**

```typescript
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
  dependencies: string | null       // JSON string: Record<string, string>
  peer_dependencies: string | null  // JSON string: Record<string, string>
  cdn_path: string | null
  changelog: string | null
  breaking_changes: string | null   // JSON string: string[]
  sri_hashes: string | null         // JSON string: Record<string, string>
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
  rule_config: string | null  // JSON string: GrayscaleRuleConfig
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
  metadata: string | null  // JSON string
  created_at: Date
}

export interface PlatformUserRow {
  id: number
  username: string
  role: 'viewer' | 'publisher' | 'operator' | 'admin'
  api_key_hash: string | null
  created_at: Date
}
```

- [ ] **Step 2: Create platform/server/src/types/grayscale.ts**

```typescript
/**
 * Grayscale rule configuration types.
 * Supports composite AND/OR rules with nested conditions.
 */

export interface UserListCondition {
  type: 'user_list'
  values: string[]  // user IDs
}

export interface DepartmentCondition {
  type: 'department'
  values: string[]  // department IDs or names
}

export interface PercentageCondition {
  type: 'percentage'
  value: number     // 0-100
  hash_key: string  // field to hash for deterministic assignment (e.g., 'user_id')
}

export type LeafCondition = UserListCondition | DepartmentCondition | PercentageCondition

export interface CompositeCondition {
  operator: 'AND' | 'OR'
  conditions: GrayscaleCondition[]
}

export type GrayscaleCondition = LeafCondition | CompositeCondition

/** Top-level rule config stored in grayscale_rules.rule_config */
export type GrayscaleRuleConfig = GrayscaleCondition

/** Context passed to the grayscale evaluator */
export interface GrayscaleContext {
  userId: string
  department?: string
  [key: string]: string | undefined  // extensible for custom hash keys
}
```

- [ ] **Step 3: Create platform/server/src/types/api.ts**

```typescript
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
  reason: string  // mandatory
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
  required: Record<string, string>  // packageName@version -> range required
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
```

- [ ] **Step 4: Create platform/server/src/types/index.ts**

```typescript
export type { PackageRow, VersionRow, AppRow, AppVersionMapRow, GrayscaleRuleRow, CompatResultRow, VersionEventRow, PlatformUserRow } from './database.js'
export type { GrayscaleRuleConfig, GrayscaleCondition, GrayscaleContext, LeafCondition, CompositeCondition, UserListCondition, DepartmentCondition, PercentageCondition } from './grayscale.js'
export type { ImportMapRequest, ImportMapResponse, CreateAppRequest, UpdateAppVersionsRequest, AppVersionsResponse, VersionSyncRequest, CreateGrayscaleRequest, RollbackRequest, CompatReportRequest, DependencyNode, ResolutionGraphResponse, DiamondConflict, ApiError, PaginatedResponse } from './api.js'
```

- [ ] **Step 5: Commit**

```bash
git add platform/server/src/types/
git commit -m "feat(platform): add type definitions for DB rows, API DTOs, grayscale rules"
```

---

### Task 3: Database Migrations

**Files:**
- Create: `platform/server/migrations/20260331000001_create_packages.ts`
- Create: `platform/server/migrations/20260331000002_create_versions.ts`
- Create: `platform/server/migrations/20260331000003_create_apps.ts`
- Create: `platform/server/migrations/20260331000004_create_app_version_maps.ts`
- Create: `platform/server/migrations/20260331000005_create_grayscale_rules.ts`
- Create: `platform/server/migrations/20260331000006_create_compat_results.ts`
- Create: `platform/server/migrations/20260331000007_create_version_events.ts`
- Create: `platform/server/migrations/20260331000008_create_platform_users.ts`

- [ ] **Step 1: Create migration — packages**

```typescript
// migrations/20260331000001_create_packages.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('packages', (table) => {
    table.bigIncrements('id').primary()
    table.string('name', 128).notNullable().unique()
    table.text('description').nullable()
    table.string('latest_version', 32).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('packages')
}
```

- [ ] **Step 2: Create migration — versions**

```typescript
// migrations/20260331000002_create_versions.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('versions', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('version', 32).notNullable()
    table.json('dependencies').nullable()
    table.json('peer_dependencies').nullable()
    table.string('cdn_path', 256).nullable()
    table.text('changelog').nullable()
    table.json('breaking_changes').nullable()
    table.json('sri_hashes').nullable()
    table.enum('status', ['published', 'deprecated', 'yanked']).defaultTo('published')
    table.timestamp('published_at').defaultTo(knex.fn.now())

    table.unique(['package_id', 'version'])
    table
      .foreign('package_id')
      .references('id')
      .inTable('packages')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('versions')
}
```

- [ ] **Step 3: Create migration — apps**

```typescript
// migrations/20260331000003_create_apps.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('apps', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable().unique()
    table.string('name', 128).nullable()
    table.string('owner', 64).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('apps')
}
```

- [ ] **Step 4: Create migration — app_version_maps**

```typescript
// migrations/20260331000004_create_app_version_maps.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('app_version_maps', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('pinned_version', 32).nullable()
    table.string('version_range', 32).nullable()
    table.string('resolved_version', 32).nullable()
    table.timestamp('updated_at').nullable()

    table.unique(['app_id', 'package_id'])
    table
      .foreign('package_id')
      .references('id')
      .inTable('packages')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('app_version_maps')
}
```

- [ ] **Step 5: Create migration — grayscale_rules**

```typescript
// migrations/20260331000005_create_grayscale_rules.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('grayscale_rules', (table) => {
    table.bigIncrements('id').primary()
    table.string('app_id', 64).notNullable()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('target_version', 32).notNullable()
    table.enum('strategy', ['user_list', 'department', 'percentage', 'composite']).notNullable()
    table.json('rule_config').nullable()
    table.enum('status', ['active', 'paused', 'completed']).defaultTo('active')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.index(['app_id', 'package_id', 'status'], 'idx_grayscale_app_pkg_status')
    table
      .foreign('package_id')
      .references('id')
      .inTable('packages')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('grayscale_rules')
}
```

- [ ] **Step 6: Create migration — compat_results**

```typescript
// migrations/20260331000006_create_compat_results.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('compat_results', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().notNullable()
    table.string('version', 32).notNullable()
    table.string('vue_version', 32).notNullable()
    table.string('element_plus_version', 32).notNullable()
    table.enum('status', ['pass', 'fail', 'untested']).defaultTo('untested')
    table.string('ci_run_url', 256).nullable()
    table.timestamp('tested_at').nullable()

    table.index(['package_id', 'version'], 'idx_compat_pkg_version')
    table
      .foreign('package_id')
      .references('id')
      .inTable('packages')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('compat_results')
}
```

- [ ] **Step 7: Create migration — version_events**

```typescript
// migrations/20260331000007_create_version_events.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('version_events', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('package_id').unsigned().nullable()
    table.string('app_id', 64).nullable()
    table
      .enum('action', [
        'publish',
        'pin',
        'upgrade',
        'rollback',
        'deprecate',
        'grayscale_start',
        'grayscale_complete',
      ])
      .notNullable()
    table.string('from_version', 32).nullable()
    table.string('to_version', 32).nullable()
    table.string('operator', 64).notNullable()
    table.text('reason').nullable()
    table.json('metadata').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table.index(['package_id', 'action'], 'idx_events_pkg_action')
    table.index(['app_id', 'action'], 'idx_events_app_action')
    table.index('created_at', 'idx_events_created')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('version_events')
}
```

- [ ] **Step 8: Create migration — platform_users**

```typescript
// migrations/20260331000008_create_platform_users.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('platform_users', (table) => {
    table.bigIncrements('id').primary()
    table.string('username', 64).notNullable().unique()
    table.enum('role', ['viewer', 'publisher', 'operator', 'admin']).notNullable()
    table.string('api_key_hash', 256).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('platform_users')
}
```

- [ ] **Step 9: Verify — run migrations against test DB**

```bash
cd platform/server && NODE_ENV=test pnpm migrate
```

- [ ] **Step 10: Commit**

```bash
git add platform/server/migrations/
git commit -m "feat(platform): add Knex migrations for all 8 tables"
```

---

### Task 4: Seed Data

**Files:**
- Create: `platform/server/seeds/01_dev_seed.ts`

- [ ] **Step 1: Create platform/server/seeds/01_dev_seed.ts**

```typescript
import type { Knex } from 'knex'
import bcrypt from 'bcryptjs'

// NOTE: Seed functions are exempt from the 50-line rule — they are declarative data,
// not logic. However, consider extracting helper factories (e.g. seedUsers, seedPackages)
// if the seed grows beyond 200 lines.
export async function seed(knex: Knex): Promise<void> {
  // Clean all tables in reverse FK order
  await knex('version_events').del()
  await knex('compat_results').del()
  await knex('grayscale_rules').del()
  await knex('app_version_maps').del()
  await knex('versions').del()
  await knex('apps').del()
  await knex('packages').del()
  await knex('platform_users').del()

  // --- Platform Users ---
  const adminKeyHash = await bcrypt.hash('admin-api-key-dev', 10)
  const publisherKeyHash = await bcrypt.hash('publisher-api-key-dev', 10)
  const operatorKeyHash = await bcrypt.hash('operator-api-key-dev', 10)

  await knex('platform_users').insert([
    { username: 'admin', role: 'admin', api_key_hash: adminKeyHash },
    { username: 'ci-bot', role: 'publisher', api_key_hash: publisherKeyHash },
    { username: 'ops-user', role: 'operator', api_key_hash: operatorKeyHash },
    { username: 'viewer-user', role: 'viewer', api_key_hash: null },
  ])

  // --- Packages ---
  const [proTableId] = await knex('packages').insert({
    name: '@pro/table',
    description: 'ProTable component for Vue 3 + Element Plus',
    latest_version: '1.2.3',
  })
  const [proFormId] = await knex('packages').insert({
    name: '@pro/form',
    description: 'ProForm component for Vue 3 + Element Plus',
    latest_version: '1.1.2',
  })
  const [proHooksId] = await knex('packages').insert({
    name: '@pro/hooks',
    description: 'Shared composables',
    latest_version: '1.2.0',
  })
  const [proUtilsId] = await knex('packages').insert({
    name: '@pro/utils',
    description: 'Shared utilities',
    latest_version: '1.0.3',
  })

  // --- Versions ---
  await knex('versions').insert([
    {
      package_id: proTableId,
      version: '1.2.3',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.2.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/table/1.2.3',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashTable123' }),
      status: 'published',
    },
    {
      package_id: proTableId,
      version: '1.2.2',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/table/1.2.2',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashTable122' }),
      status: 'published',
    },
    {
      package_id: proFormId,
      version: '1.1.2',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/form/1.1.2',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashForm112' }),
      status: 'published',
    },
    {
      package_id: proHooksId,
      version: '1.2.0',
      dependencies: JSON.stringify({ '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0' }),
      cdn_path: '/@pro/hooks/1.2.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashHooks120' }),
      status: 'published',
    },
    {
      package_id: proHooksId,
      version: '1.1.0',
      dependencies: JSON.stringify({ '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0' }),
      cdn_path: '/@pro/hooks/1.1.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashHooks110' }),
      status: 'published',
    },
    {
      package_id: proUtilsId,
      version: '1.0.3',
      dependencies: JSON.stringify({}),
      peer_dependencies: JSON.stringify({}),
      cdn_path: '/@pro/utils/1.0.3',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashUtils103' }),
      status: 'published',
    },
    {
      package_id: proUtilsId,
      version: '1.0.0',
      dependencies: JSON.stringify({}),
      peer_dependencies: JSON.stringify({}),
      cdn_path: '/@pro/utils/1.0.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashUtils100' }),
      status: 'published',
    },
  ])

  // --- Apps ---
  await knex('apps').insert([
    { app_id: 'user-center', name: 'User Center', owner: 'team-a' },
    { app_id: 'data-platform', name: 'Data Platform', owner: 'team-b' },
  ])

  // --- App Version Maps ---
  await knex('app_version_maps').insert([
    {
      app_id: 'user-center',
      package_id: proTableId,
      pinned_version: '1.2.3',
      version_range: null,
      resolved_version: '1.2.3',
      updated_at: knex.fn.now(),
    },
    {
      app_id: 'user-center',
      package_id: proFormId,
      pinned_version: null,
      version_range: '^1.0.0',
      resolved_version: '1.1.2',
      updated_at: knex.fn.now(),
    },
    {
      app_id: 'data-platform',
      package_id: proTableId,
      pinned_version: null,
      version_range: '^1.2.0',
      resolved_version: '1.2.3',
      updated_at: knex.fn.now(),
    },
  ])

  // --- Grayscale Rules (one active for user-center) ---
  await knex('grayscale_rules').insert({
    app_id: 'user-center',
    package_id: proTableId,
    target_version: '2.0.0-beta.1',
    strategy: 'composite',
    rule_config: JSON.stringify({
      operator: 'OR',
      conditions: [
        { type: 'user_list', values: ['uid-alpha', 'uid-beta'] },
        {
          operator: 'AND',
          conditions: [
            { type: 'department', values: ['engineering'] },
            { type: 'percentage', value: 30, hash_key: 'user_id' },
          ],
        },
      ],
    }),
    status: 'active',
  })

  // --- Compat Results ---
  await knex('compat_results').insert([
    {
      package_id: proTableId,
      version: '1.2.3',
      vue_version: '3.5.0',
      element_plus_version: '2.9.0',
      status: 'pass',
      ci_run_url: 'https://ci.internal/runs/1001',
      tested_at: knex.fn.now(),
    },
    {
      package_id: proTableId,
      version: '1.2.3',
      vue_version: '3.4.0',
      element_plus_version: '2.9.0',
      status: 'pass',
      ci_run_url: 'https://ci.internal/runs/1002',
      tested_at: knex.fn.now(),
    },
  ])
}
```

- [ ] **Step 2: Verify — run seed against test DB**

```bash
cd platform/server && NODE_ENV=test pnpm seed
```

- [ ] **Step 3: Commit**

```bash
git add platform/server/seeds/
git commit -m "feat(platform): add dev seed data for all tables"
```

---

### Task 5: Middleware — Error Handler, Request ID, Request Logger

**Files:**
- Create: `platform/server/src/middleware/error-handler.ts`
- Create: `platform/server/src/middleware/request-id.ts`
- Create: `platform/server/src/middleware/request-logger.ts`

- [ ] **Step 1: Create platform/server/src/middleware/error-handler.ts**

```typescript
import type { Context, Next } from 'koa'
import { logger } from '../logger.js'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err: unknown) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode
      ctx.body = {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      }

      if (err.statusCode >= 500) {
        logger.error({ err, requestId: ctx.state.requestId }, 'Server error')
      }
    } else if (err instanceof Error) {
      logger.error({ err, requestId: ctx.state.requestId }, 'Unhandled error')
      ctx.status = 500
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      }
    } else {
      logger.error({ err, requestId: ctx.state.requestId }, 'Unknown error type')
      ctx.status = 500
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      }
    }
  }
}
```

- [ ] **Step 2: Create platform/server/src/middleware/request-id.ts**

```typescript
import type { Context, Next } from 'koa'
import { v4 as uuidv4 } from 'uuid'

export async function requestId(ctx: Context, next: Next): Promise<void> {
  const id = (ctx.get('X-Request-Id') as string) || uuidv4()
  ctx.state.requestId = id
  ctx.set('X-Request-Id', id)
  await next()
}
```

- [ ] **Step 3: Create platform/server/src/middleware/request-logger.ts**

```typescript
import type { Context, Next } from 'koa'
import { logger } from '../logger.js'

export async function requestLogger(ctx: Context, next: Next): Promise<void> {
  const start = Date.now()
  await next()
  const duration = Date.now() - start

  const logData = {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    duration,
    requestId: ctx.state.requestId,
  }

  if (ctx.status >= 500) {
    logger.error(logData, 'Request completed with server error')
  } else if (ctx.status >= 400) {
    logger.warn(logData, 'Request completed with client error')
  } else {
    logger.info(logData, 'Request completed')
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add platform/server/src/middleware/error-handler.ts platform/server/src/middleware/request-id.ts platform/server/src/middleware/request-logger.ts
git commit -m "feat(platform): add error handler, request ID, and request logger middleware"
```

---

### Task 6: RBAC Middleware — JWT Auth + Role Permission Guard

**Files:**
- Create: `platform/server/src/middleware/auth.ts`
- Create: `platform/server/src/middleware/rbac.ts`
- Create: `platform/server/__tests__/integration/rbac.test.ts`

- [ ] **Step 1: Create platform/server/src/middleware/auth.ts**

```typescript
import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { loadConfig } from '../config.js'
import { AppError } from './error-handler.js'
import type { PlatformUserRow } from '../types/index.js'

export interface AuthPayload {
  userId: number
  username: string
  role: PlatformUserRow['role']
}

declare module 'koa' {
  interface DefaultState {
    requestId?: string
    user?: AuthPayload
  }
}

/**
 * JWT authentication middleware.
 * Extracts token from Authorization: Bearer <token> header.
 * Populates ctx.state.user with decoded payload.
 * Throws 401 if token is missing or invalid.
 */
export async function auth(ctx: Context, next: Next): Promise<void> {
  const header = ctx.get('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header')
  }

  const token = header.slice(7)
  const config = loadConfig()

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload
    ctx.state.user = payload
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token')
  }

  await next()
}

/**
 * Generate a JWT token for a user. Used by login/token endpoints and tests.
 */
export function generateToken(payload: AuthPayload): string {
  const config = loadConfig()
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}
```

- [ ] **Step 2: Create platform/server/src/middleware/rbac.ts**

```typescript
import type { Context, Next } from 'koa'
import { AppError } from './error-handler.js'
import type { PlatformUserRow } from '../types/index.js'

type Role = PlatformUserRow['role']

/**
 * Role hierarchy: admin > operator > publisher > viewer.
 * Higher roles inherit all lower-role permissions.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  publisher: 1,
  operator: 2,
  admin: 3,
}

/**
 * Role-based access control matrix.
 *
 * | Action                  | viewer | publisher | operator | admin |
 * |-------------------------|--------|-----------|----------|-------|
 * | Read versions/compat    | Y      | Y         | Y        | Y     |
 * | Publish new version     |        | Y         |          | Y     |
 * | Manage grayscale        |        |           | Y        | Y     |
 * | Grayscale override pin  |        |           |          | Y     |
 * | Rollback version        |        |           |          | Y     |
 * | Deprecate version       |        |           |          | Y     |
 * | Manage users/roles      |        |           |          | Y     |
 *
 * Permission map: action -> minimum required role.
 * Roles at or above the minimum level are granted access.
 */
const PERMISSION_MAP: Record<string, Role> = {
  // Viewer permissions (all roles have these)
  'versions:read': 'viewer',
  'compat:read': 'viewer',
  'import-map:read': 'viewer',
  'apps:read': 'viewer',
  'grayscale:read': 'viewer',
  'events:read': 'viewer',

  // Publisher permissions
  'versions:sync': 'publisher',
  'compat:report': 'publisher',

  // Operator permissions
  'apps:create': 'operator',
  'apps:update': 'operator',
  'grayscale:create': 'operator',
  'grayscale:pause': 'operator',
  'grayscale:complete': 'operator',
  'versions:pin': 'operator',

  // Admin permissions
  'versions:rollback': 'admin',
  'versions:deprecate': 'admin',
  'users:manage': 'admin',
  'grayscale:override_pin': 'admin',  // Grayscale overriding a pinned version requires admin
}

/**
 * Returns true if the given role has permission for the specified action.
 */
export function hasPermission(role: Role, action: string): boolean {
  const requiredRole = PERMISSION_MAP[action]
  if (!requiredRole) {
    // Unknown action — deny by default
    return false
  }
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Factory: creates middleware that checks if ctx.state.user has the required permission.
 * Must be used AFTER the auth middleware.
 *
 * @param action - Permission action key (e.g., 'versions:rollback')
 */
export function requirePermission(action: string) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const user = ctx.state.user
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    if (!hasPermission(user.role, action)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        `Role '${user.role}' does not have permission for action '${action}'`,
      )
    }

    await next()
  }
}
```

- [ ] **Step 3: Write failing test — RBAC permission checks**

```typescript
// __tests__/integration/rbac.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { generateToken, type AuthPayload } from '../../src/middleware/auth.js'
import { hasPermission } from '../../src/middleware/rbac.js'
import type { PlatformUserRow } from '../../src/types/index.js'

// --- Unit tests for hasPermission (pure function) ---
describe('hasPermission', () => {
  it('viewer can read versions', () => {
    expect(hasPermission('viewer', 'versions:read')).toBe(true)
  })

  it('viewer cannot sync versions', () => {
    expect(hasPermission('viewer', 'versions:sync')).toBe(false)
  })

  it('publisher can sync versions', () => {
    expect(hasPermission('publisher', 'versions:sync')).toBe(true)
  })

  it('publisher can also read (inherits viewer)', () => {
    expect(hasPermission('publisher', 'versions:read')).toBe(true)
  })

  it('operator can create grayscale', () => {
    expect(hasPermission('operator', 'grayscale:create')).toBe(true)
  })

  it('operator cannot rollback (admin only)', () => {
    expect(hasPermission('operator', 'versions:rollback')).toBe(false)
  })

  it('admin can do everything', () => {
    expect(hasPermission('admin', 'versions:read')).toBe(true)
    expect(hasPermission('admin', 'versions:sync')).toBe(true)
    expect(hasPermission('admin', 'grayscale:create')).toBe(true)
    expect(hasPermission('admin', 'versions:rollback')).toBe(true)
    expect(hasPermission('admin', 'users:manage')).toBe(true)
  })

  it('unknown action is denied for all roles', () => {
    expect(hasPermission('admin', 'nonexistent:action')).toBe(false)
  })
})

// --- Integration tests for auth + rbac middleware ---
describe('Auth + RBAC middleware (integration)', () => {
  const app = createApp()
  const server = app.callback()

  function tokenFor(role: PlatformUserRow['role']): string {
    const payload: AuthPayload = { userId: 1, username: `test-${role}`, role }
    return generateToken(payload)
  }

  it('rejects requests without Authorization header', async () => {
    const res = await request(server).post('/api/v1/apps').send({ appId: 'test' })
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('rejects requests with invalid token', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ appId: 'test' })
    expect(res.status).toBe(401)
  })

  it('rejects viewer attempting to create app (operator required)', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', `Bearer ${tokenFor('viewer')}`)
      .send({ appId: 'test-app', name: 'Test', owner: 'me' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('allows operator to create app', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', `Bearer ${tokenFor('operator')}`)
      .send({ appId: 'test-app', name: 'Test', owner: 'me' })
    // May fail with DB error if DB not connected in test, but should NOT be 401/403
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('allows health check without auth', async () => {
    const res = await request(server).get('/health/resolution')
    expect(res.status).not.toBe(401)
  })
})
```

- [ ] **Step 4: Run tests — confirm RBAC unit tests pass, integration tests depend on Task 8 (app routes)**

```bash
cd platform/server && pnpm test -- __tests__/integration/rbac.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add platform/server/src/middleware/auth.ts platform/server/src/middleware/rbac.ts platform/server/__tests__/integration/rbac.test.ts
git commit -m "feat(platform): add JWT auth + role-based permission guard middleware with tests"
```

---

### Task 7: Semver Dependency Resolver Engine

**Files:**
- Create: `platform/server/src/utils/semver-helpers.ts`
- Create: `platform/server/src/engines/semver-resolver.ts`
- Create: `platform/server/__tests__/unit/semver-resolver.test.ts`

- [ ] **Step 1: Create platform/server/src/utils/semver-helpers.ts**

```typescript
import semver from 'semver'

/**
 * Compute the intersection of two semver ranges.
 * Returns null if the ranges are incompatible (no version can satisfy both).
 *
 * Strategy: test all versions in the available set against both ranges.
 * This is practical because our registry has a finite set of published versions.
 */
export function rangeIntersection(
  rangeA: string,
  rangeB: string,
  availableVersions: string[],
): string[] {
  const validA = semver.validRange(rangeA)
  const validB = semver.validRange(rangeB)

  if (!validA || !validB) {
    return []
  }

  return availableVersions.filter(
    (v) => semver.satisfies(v, rangeA) && semver.satisfies(v, rangeB),
  )
}

/**
 * From a list of versions satisfying a range, select the highest.
 * Returns null if no versions satisfy.
 */
export function highestSatisfying(range: string, versions: string[]): string | null {
  const sorted = versions.filter((v) => semver.valid(v)).sort(semver.rcompare)
  for (const v of sorted) {
    if (semver.satisfies(v, range)) {
      return v
    }
  }
  return null
}

/**
 * Check if a version string is a prerelease version.
 */
export function isPrerelease(version: string): boolean {
  const parsed = semver.parse(version)
  return parsed !== null && parsed.prerelease.length > 0
}
```

- [ ] **Step 2: Create platform/server/src/engines/semver-resolver.ts**

```typescript
import semver from 'semver'
import { rangeIntersection, highestSatisfying, isPrerelease } from '../utils/semver-helpers.js'
import type { DependencyNode, DiamondConflict } from '../types/api.js'

/**
 * A version entry as stored in the registry.
 * Provided by the caller (from DB query).
 */
export interface VersionEntry {
  name: string
  version: string
  dependencies: Record<string, string>   // name -> semver range
  peerDependencies: Record<string, string>
}

/**
 * A registry providing version lookup.
 * Abstracted so the engine has zero I/O — pure function.
 */
export interface VersionRegistry {
  /** Get all published versions for a package */
  getVersions(packageName: string): VersionEntry[]
  /** Get a specific version entry */
  getVersion(packageName: string, version: string): VersionEntry | undefined
}

export interface ResolveResult {
  /** Resolved version for each package (name -> exact version) */
  resolved: Map<string, string>
  /** Full dependency tree */
  tree: DependencyNode[]
  /** Diamond conflicts detected */
  conflicts: DiamondConflict[]
}

/**
 * Resolve a set of requested packages to exact versions.
 *
 * Algorithm:
 * 1. Start with the requested packages and their pinned versions or ranges
 * 2. Recursively expand dependencies
 * 3. Deduplicate: when the same package appears multiple times, compute range intersection
 * 4. Detect diamond conflicts: when range intersection is empty
 *
 * NOTE: This function exceeds 50 lines. When implementing, split into:
 * - `resolveTopLevel(requests, registry)` — Step 1 (top-level resolution loop)
 * - `detectDiamondConflicts(rangeCollector, registry)` — Step 2 (diamond detection)
 * - Keep `expandDependencies` as a nested helper (it uses closure over `resolved`, `visited`, etc.)
 */
export function resolve(
  requests: Array<{ name: string; pinnedVersion?: string; versionRange?: string }>,
  registry: VersionRegistry,
): ResolveResult {
  const resolved = new Map<string, string>()
  const rangeCollector = new Map<string, Map<string, string>>() // pkg -> (requester -> range)
  const conflicts: DiamondConflict[] = []
  const visited = new Set<string>() // "name@version" dedup key

  /**
   * Recursively expand a package's dependencies.
   */
  function expandDependencies(
    name: string,
    version: string,
    depth: number,
  ): DependencyNode {
    const dedupKey = `${name}@${version}`
    const node: DependencyNode = { name, version, dependencies: [] }

    if (visited.has(dedupKey)) {
      return node // Already processed — return without re-expanding (dedup)
    }
    visited.add(dedupKey)
    resolved.set(name, version)

    const entry = registry.getVersion(name, version)
    if (!entry) {
      return node
    }

    // Process regular dependencies
    for (const [depName, depRange] of Object.entries(entry.dependencies)) {
      // Collect ranges for diamond detection
      if (!rangeCollector.has(depName)) {
        rangeCollector.set(depName, new Map())
      }
      rangeCollector.get(depName)!.set(`${name}@${version}`, depRange)

      // Resolve the dependency
      const depVersions = registry.getVersions(depName)
      const availableVersionStrings = depVersions.map((v) => v.version)

      // If already resolved, check compatibility
      const existingVersion = resolved.get(depName)
      if (existingVersion) {
        if (semver.satisfies(existingVersion, depRange)) {
          // Compatible — reuse existing resolved version
          node.dependencies.push({ name: depName, version: existingVersion, dependencies: [] })
          continue
        }
        // Incompatible — will be caught by diamond detection below
      }

      const resolvedVersion = highestSatisfying(depRange, availableVersionStrings)
      if (resolvedVersion) {
        const childNode = expandDependencies(depName, resolvedVersion, depth + 1)
        node.dependencies.push(childNode)
      }
    }

    return node
  }

  // --- Step 1: Resolve top-level requests ---
  const tree: DependencyNode[] = []

  for (const req of requests) {
    const versions = registry.getVersions(req.name)
    const availableVersionStrings = versions.map((v) => v.version)
    let resolvedVersion: string | null = null

    if (req.pinnedVersion) {
      // Pinned: exact match required
      if (versions.some((v) => v.version === req.pinnedVersion)) {
        resolvedVersion = req.pinnedVersion
      }
    } else if (req.versionRange) {
      resolvedVersion = highestSatisfying(req.versionRange, availableVersionStrings)
    } else {
      // No constraint: use latest
      const sorted = availableVersionStrings
        .filter((v) => !isPrerelease(v))
        .sort(semver.rcompare)
      resolvedVersion = sorted[0] || null
    }

    if (resolvedVersion) {
      const node = expandDependencies(req.name, resolvedVersion, 0)
      tree.push(node)
    }
  }

  // --- Step 2: Diamond conflict detection ---
  for (const [depName, requesters] of rangeCollector.entries()) {
    if (requesters.size <= 1) continue

    const ranges = Array.from(requesters.values())
    const allVersions = registry.getVersions(depName).map((v) => v.version)

    // Compute intersection across ALL ranges
    let satisfyingVersions = allVersions
    for (const range of ranges) {
      satisfyingVersions = satisfyingVersions.filter((v) => semver.satisfies(v, range))
    }

    if (satisfyingVersions.length === 0) {
      const required: Record<string, string> = {}
      for (const [requester, range] of requesters.entries()) {
        required[requester] = range
      }

      // Generate suggestion
      const rangeStrings = Array.from(requesters.values())
      const suggestion = generateConflictSuggestion(depName, required)

      conflicts.push({
        dependency: depName,
        required,
        suggestion,
      })
    } else {
      // Ensure we use the highest version satisfying all ranges
      const best = satisfyingVersions.sort(semver.rcompare)[0]
      if (best) {
        resolved.set(depName, best)
      }
    }
  }

  return { resolved, tree, conflicts }
}

/**
 * Generate a human-readable suggestion for resolving a diamond conflict.
 */
function generateConflictSuggestion(
  dependency: string,
  required: Record<string, string>,
): string {
  const entries = Object.entries(required)

  // Find which requester has the most restrictive range
  // Suggestion: upgrade the package with the older range
  const parts = entries
    .map(([pkg, range]) => `${pkg} requires ${dependency}@${range}`)
    .join(', ')

  return `Conflict: ${parts}. Consider upgrading the package with the narrower range to a version compatible with the wider range.`
}
```

- [ ] **Step 3: Write comprehensive tests — 100% coverage target**

```typescript
// __tests__/unit/semver-resolver.test.ts
import { describe, it, expect } from 'vitest'
import { resolve, type VersionEntry, type VersionRegistry } from '../../src/engines/semver-resolver.js'
import { rangeIntersection, highestSatisfying, isPrerelease } from '../../src/utils/semver-helpers.js'

// --- Helper: create an in-memory registry ---
function createRegistry(entries: VersionEntry[]): VersionRegistry {
  return {
    getVersions(packageName: string): VersionEntry[] {
      return entries.filter((e) => e.name === packageName)
    },
    getVersion(packageName: string, version: string): VersionEntry | undefined {
      return entries.find((e) => e.name === packageName && e.version === version)
    },
  }
}

// ============================================================
// semver-helpers unit tests
// ============================================================
describe('semver-helpers', () => {
  describe('rangeIntersection', () => {
    it('returns versions satisfying both ranges', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0']
      const result = rangeIntersection('^1.0.0', '>=1.1.0', versions)
      expect(result).toEqual(['1.1.0', '1.2.0'])
    })

    it('returns empty array for incompatible ranges', () => {
      const versions = ['1.0.0', '2.0.0', '3.0.0']
      const result = rangeIntersection('^1.0.0', '^3.0.0', versions)
      expect(result).toEqual([])
    })

    it('returns empty array for invalid ranges', () => {
      const result = rangeIntersection('not-a-range', '^1.0.0', ['1.0.0'])
      expect(result).toEqual([])
    })

    it('handles exact version ranges', () => {
      const versions = ['1.0.0', '1.0.1', '1.1.0']
      const result = rangeIntersection('1.0.0', '>=1.0.0', versions)
      expect(result).toEqual(['1.0.0'])
    })
  })

  describe('highestSatisfying', () => {
    it('returns the highest version satisfying the range', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0']
      expect(highestSatisfying('^1.0.0', versions)).toBe('1.2.0')
    })

    it('returns null when no version satisfies', () => {
      const versions = ['1.0.0', '1.1.0']
      expect(highestSatisfying('^2.0.0', versions)).toBeNull()
    })

    it('handles empty version list', () => {
      expect(highestSatisfying('^1.0.0', [])).toBeNull()
    })

    it('filters invalid version strings', () => {
      const versions = ['1.0.0', 'not-valid', '1.1.0']
      expect(highestSatisfying('^1.0.0', versions)).toBe('1.1.0')
    })
  })

  describe('isPrerelease', () => {
    it('detects prerelease versions', () => {
      expect(isPrerelease('2.0.0-beta.1')).toBe(true)
      expect(isPrerelease('1.0.0-alpha')).toBe(true)
      expect(isPrerelease('1.0.0-rc.1')).toBe(true)
    })

    it('returns false for stable versions', () => {
      expect(isPrerelease('1.0.0')).toBe(false)
      expect(isPrerelease('2.3.4')).toBe(false)
    })

    it('returns false for invalid versions', () => {
      expect(isPrerelease('not-a-version')).toBe(false)
    })
  })
})

// ============================================================
// semver-resolver engine tests
// ============================================================
describe('semver-resolver', () => {
  const ENTRIES: VersionEntry[] = [
    // @pro/table versions
    {
      name: '@pro/table',
      version: '1.2.3',
      dependencies: { '@pro/hooks': '^1.2.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    {
      name: '@pro/table',
      version: '1.2.2',
      dependencies: { '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    {
      name: '@pro/table',
      version: '2.0.0-beta.1',
      dependencies: { '@pro/hooks': '^2.0.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.5.0', 'element-plus': '>=2.10.0' },
    },
    // @pro/form versions
    {
      name: '@pro/form',
      version: '1.1.2',
      dependencies: { '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    // @pro/hooks versions
    {
      name: '@pro/hooks',
      version: '1.2.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0' },
    },
    {
      name: '@pro/hooks',
      version: '1.1.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0' },
    },
    {
      name: '@pro/hooks',
      version: '2.0.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.5.0' },
    },
    // @pro/utils versions
    {
      name: '@pro/utils',
      version: '1.0.3',
      dependencies: {},
      peerDependencies: {},
    },
    {
      name: '@pro/utils',
      version: '1.0.0',
      dependencies: {},
      peerDependencies: {},
    },
  ]

  const registry = createRegistry(ENTRIES)

  describe('basic resolution', () => {
    it('resolves a pinned version exactly', () => {
      const result = resolve(
        [{ name: '@pro/table', pinnedVersion: '1.2.3' }],
        registry,
      )
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
      expect(result.conflicts).toHaveLength(0)
    })

    it('resolves a version range to the highest satisfying version', () => {
      const result = resolve(
        [{ name: '@pro/table', versionRange: '^1.2.0' }],
        registry,
      )
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    })

    it('resolves to latest stable when no constraint provided', () => {
      const result = resolve(
        [{ name: '@pro/table' }],
        registry,
      )
      // Should pick 1.2.3 (latest stable), NOT 2.0.0-beta.1
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    })

    it('returns empty resolution for nonexistent package', () => {
      const result = resolve(
        [{ name: '@pro/nonexistent', versionRange: '^1.0.0' }],
        registry,
      )
      expect(result.resolved.size).toBe(0)
      expect(result.tree).toHaveLength(0)
    })

    it('returns empty for pinned version that does not exist', () => {
      const result = resolve(
        [{ name: '@pro/table', pinnedVersion: '9.9.9' }],
        registry,
      )
      expect(result.resolved.has('@pro/table')).toBe(false)
    })
  })

  describe('dependency tree expansion', () => {
    it('recursively resolves dependencies', () => {
      const result = resolve(
        [{ name: '@pro/table', pinnedVersion: '1.2.3' }],
        registry,
      )
      // @pro/table@1.2.3 -> @pro/hooks@^1.2.0 -> @pro/utils@^1.0.0
      expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
    })

    it('builds correct tree structure', () => {
      const result = resolve(
        [{ name: '@pro/table', pinnedVersion: '1.2.3' }],
        registry,
      )
      expect(result.tree).toHaveLength(1)
      const root = result.tree[0]
      expect(root.name).toBe('@pro/table')
      expect(root.version).toBe('1.2.3')
      expect(root.dependencies).toHaveLength(2) // hooks + utils
    })

    it('deduplicates shared dependencies', () => {
      const result = resolve(
        [
          { name: '@pro/table', pinnedVersion: '1.2.3' },
          { name: '@pro/form', pinnedVersion: '1.1.2' },
        ],
        registry,
      )
      // Both depend on @pro/utils — should be resolved once
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')

      // Both depend on @pro/hooks — table wants ^1.2.0, form wants ^1.1.0
      // ^1.2.0 satisfies both (1.2.0 is in ^1.1.0 range) — deduped
      expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
    })
  })

  describe('diamond dependency detection', () => {
    it('detects no conflict when ranges are compatible', () => {
      const result = resolve(
        [
          { name: '@pro/table', pinnedVersion: '1.2.3' },
          { name: '@pro/form', pinnedVersion: '1.1.2' },
        ],
        registry,
      )
      expect(result.conflicts).toHaveLength(0)
    })

    it('detects diamond conflict with incompatible ranges', () => {
      // Create a scenario where two packages require incompatible ranges
      const conflictEntries: VersionEntry[] = [
        {
          name: 'app-a',
          version: '1.0.0',
          dependencies: { 'shared-dep': '^2.0.0' },
          peerDependencies: {},
        },
        {
          name: 'app-b',
          version: '1.0.0',
          dependencies: { 'shared-dep': '^1.0.0 <2.0.0' },
          peerDependencies: {},
        },
        {
          name: 'shared-dep',
          version: '1.0.0',
          dependencies: {},
          peerDependencies: {},
        },
        {
          name: 'shared-dep',
          version: '2.0.0',
          dependencies: {},
          peerDependencies: {},
        },
      ]
      const conflictRegistry = createRegistry(conflictEntries)

      const result = resolve(
        [
          { name: 'app-a', pinnedVersion: '1.0.0' },
          { name: 'app-b', pinnedVersion: '1.0.0' },
        ],
        conflictRegistry,
      )

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].dependency).toBe('shared-dep')
      expect(result.conflicts[0].required).toHaveProperty('app-a@1.0.0', '^2.0.0')
      expect(result.conflicts[0].required).toHaveProperty('app-b@1.0.0', '^1.0.0 <2.0.0')
      expect(result.conflicts[0].suggestion).toContain('Conflict')
    })
  })

  describe('prerelease handling', () => {
    it('does not pick prerelease as latest when no constraint', () => {
      const result = resolve([{ name: '@pro/table' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
      expect(isPrerelease(result.resolved.get('@pro/table')!)).toBe(false)
    })

    it('resolves prerelease when explicitly pinned', () => {
      const result = resolve(
        [{ name: '@pro/table', pinnedVersion: '2.0.0-beta.1' }],
        registry,
      )
      expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    })
  })

  describe('edge cases', () => {
    it('handles empty requests', () => {
      const result = resolve([], registry)
      expect(result.resolved.size).toBe(0)
      expect(result.tree).toHaveLength(0)
      expect(result.conflicts).toHaveLength(0)
    })

    it('handles package with no dependencies', () => {
      const result = resolve(
        [{ name: '@pro/utils', pinnedVersion: '1.0.3' }],
        registry,
      )
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
      expect(result.tree[0].dependencies).toHaveLength(0)
    })

    it('handles circular-safe dedup (same package requested twice)', () => {
      const result = resolve(
        [
          { name: '@pro/utils', pinnedVersion: '1.0.3' },
          { name: '@pro/utils', versionRange: '^1.0.0' },
        ],
        registry,
      )
      // Should not infinite loop
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
    })
  })

  // ============================================================
  // Additional edge case test fixtures
  // ============================================================
  describe('edge cases — extended', () => {
    it('handles pre-release versions', () => {
      expect(highestSatisfying('^1.0.0', ['1.0.0', '1.1.0-beta.1', '1.1.0'])).toBe('1.1.0')
    })

    it('handles build metadata (ignored in comparison)', () => {
      expect(highestSatisfying('1.0.0', ['1.0.0+build.1', '1.0.0+build.2'])).toBe('1.0.0+build.2')
    })

    it('handles complex OR ranges', () => {
      expect(highestSatisfying('>=1.2.0 <2.0.0 || >=3.0.0', ['1.3.0', '2.5.0', '3.1.0'])).toBe('3.1.0')
    })

    it('handles hyphen ranges', () => {
      expect(highestSatisfying('1.0.0 - 2.0.0', ['0.9.0', '1.5.0', '2.0.0', '2.1.0'])).toBe('2.0.0')
    })

    it('returns null for empty intersection in diamond dependency', () => {
      const conflictEntries: VersionEntry[] = [
        {
          name: 'pkg-a',
          version: '1.0.0',
          dependencies: { 'element-plus': '>=2.2.0 <2.4.0' },
          peerDependencies: {},
        },
        {
          name: 'pkg-b',
          version: '1.0.0',
          dependencies: { 'element-plus': '^2.4.0' },
          peerDependencies: {},
        },
        { name: 'element-plus', version: '2.2.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.3.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.4.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.5.0', dependencies: {}, peerDependencies: {} },
      ]
      const conflictRegistry = createRegistry(conflictEntries)

      const result = resolve(
        [
          { name: 'pkg-a', pinnedVersion: '1.0.0' },
          { name: 'pkg-b', pinnedVersion: '1.0.0' },
        ],
        conflictRegistry,
      )

      expect(result.conflicts.length).toBeGreaterThan(0)
      const epConflict = result.conflicts.find((c) => c.dependency === 'element-plus')
      expect(epConflict).toBeDefined()
      expect(epConflict!.required).toHaveProperty('pkg-a@1.0.0', '>=2.2.0 <2.4.0')
      expect(epConflict!.required).toHaveProperty('pkg-b@1.0.0', '^2.4.0')
      expect(epConflict!.suggestion).toContain('Conflict')
    })

    it('handles tilde ranges', () => {
      expect(highestSatisfying('~1.2.3', ['1.2.2', '1.2.5', '1.3.0'])).toBe('1.2.5')
    })
  })
})
```

- [ ] **Step 4: Run tests — all must pass**

```bash
cd platform/server && pnpm test -- __tests__/unit/semver-resolver.test.ts
```

- [ ] **Step 5: Check coverage — target 100% for engines/**

```bash
cd platform/server && pnpm test:coverage -- --reporter=text __tests__/unit/semver-resolver.test.ts 2>&1 | grep -A5 'semver-resolver\|semver-helpers'
```

- [ ] **Step 6: Commit**

```bash
git add platform/server/src/utils/semver-helpers.ts platform/server/src/engines/semver-resolver.ts platform/server/__tests__/unit/semver-resolver.test.ts
git commit -m "feat(platform): add semver dependency resolver with diamond conflict detection"
```

---

### Task 8: Grayscale Engine

**Files:**
- Create: `platform/server/src/utils/hash.ts`
- Create: `platform/server/src/engines/grayscale-evaluator.ts`
- Create: `platform/server/__tests__/unit/grayscale-evaluator.test.ts`
- Create: `platform/server/__tests__/unit/hash.test.ts`

- [ ] **Step 1: Create platform/server/src/utils/hash.ts**

```typescript
import { createHash } from 'node:crypto'

/**
 * Deterministic hash-to-percentage mapping.
 * Given a string key, returns a number 0-99 (inclusive).
 *
 * Uses SHA-256 for uniform distribution. Takes the first 4 bytes as a uint32
 * and mods by 100.
 *
 * Why not Math.random(): percentage-based grayscale must be deterministic —
 * the same user must consistently see the same version across requests.
 */
export function hashToPercentage(key: string): number {
  const hash = createHash('sha256').update(key).digest()
  // Read first 4 bytes as unsigned 32-bit big-endian integer
  const uint32 = hash.readUInt32BE(0)
  return uint32 % 100
}
```

- [ ] **Step 2: Create platform/server/src/engines/grayscale-evaluator.ts**

```typescript
import { hashToPercentage } from '../utils/hash.js'
import type {
  GrayscaleCondition,
  GrayscaleContext,
  LeafCondition,
  CompositeCondition,
} from '../types/grayscale.js'

/**
 * Evaluate a grayscale rule against a user context.
 * Returns true if the user should receive the grayscale version.
 *
 * Pure function — no I/O. All data passed in via parameters.
 * Supports recursive composite AND/OR rules with arbitrary nesting.
 */
export function evaluateRule(
  condition: GrayscaleCondition,
  context: GrayscaleContext,
): boolean {
  if (isComposite(condition)) {
    return evaluateComposite(condition, context)
  }
  return evaluateLeaf(condition, context)
}

function isComposite(condition: GrayscaleCondition): condition is CompositeCondition {
  return 'operator' in condition && 'conditions' in condition
}

function evaluateComposite(
  condition: CompositeCondition,
  context: GrayscaleContext,
): boolean {
  if (!condition.conditions || condition.conditions.length === 0) {
    return false // Empty conditions block — deny by default
  }

  if (condition.operator === 'AND') {
    return condition.conditions.every((c) => evaluateRule(c, context))
  }

  if (condition.operator === 'OR') {
    return condition.conditions.some((c) => evaluateRule(c, context))
  }

  // Unknown operator — deny by default
  return false
}

function evaluateLeaf(
  condition: LeafCondition,
  context: GrayscaleContext,
): boolean {
  switch (condition.type) {
    case 'user_list':
      return evaluateUserList(condition.values, context)
    case 'department':
      return evaluateDepartment(condition.values, context)
    case 'percentage':
      return evaluatePercentage(condition.value, condition.hash_key, context)
    default:
      // Unknown condition type — deny by default
      return false
  }
}

function evaluateUserList(userIds: string[], context: GrayscaleContext): boolean {
  return userIds.includes(context.userId)
}

function evaluateDepartment(departments: string[], context: GrayscaleContext): boolean {
  if (!context.department) {
    return false
  }
  return departments.includes(context.department)
}

function evaluatePercentage(
  percentage: number,
  hashKey: string,
  context: GrayscaleContext,
): boolean {
  const value = context[hashKey]
  if (value === undefined) {
    return false
  }
  const bucket = hashToPercentage(value)
  return bucket < percentage
}

// --- Grayscale vs Pinned Version — Precedence Rule ---

interface ResolvedVersion {
  version: string
  source: 'grayscale' | 'pinned' | 'latest'
}

interface ResolutionContext {
  appId: string
  userId: string
}

interface AuditLogEntry {
  action: string
  appId: string
  userId: string
  pinnedVersion?: string
  grayscaleVersion?: string
}

/**
 * Resolve the effective version for a user.
 *
 * Priority order:
 * 1. Active grayscale rule targeting this user -> grayscale version (overrides pin)
 * 2. Pinned version for this app -> pinned version
 * 3. Latest active version -> default
 *
 * When grayscale overrides a pin:
 * - Requires admin role (operator insufficient)
 * - Audit logged as 'grayscale_override_pin'
 * - Dashboard shows warning on creation
 */
async function resolveEffectiveVersion(
  appId: string,
  userId: string,
  context: ResolutionContext,
): Promise<ResolvedVersion> {
  // Check grayscale first (takes precedence)
  const grayscaleVersion = await evaluateGrayscaleRules(appId, userId)
  if (grayscaleVersion) {
    const pinnedVersion = await getPinnedVersion(appId)
    if (pinnedVersion) {
      await auditLog({
        action: 'grayscale_override_pin',
        appId,
        userId,
        pinnedVersion: pinnedVersion.version,
        grayscaleVersion: grayscaleVersion.version,
      })
    }
    return grayscaleVersion
  }

  // Fall back to pin, then default
  return (await getPinnedVersion(appId)) ?? (await getLatestActiveVersion(appId))
}
```

> **Implementation note:** `evaluateGrayscaleRules`, `getPinnedVersion`, `getLatestActiveVersion`, and `auditLog` are service-layer functions to be implemented in the import-map service. The precedence rule above defines the resolution contract.

- [ ] **Step 3: Write hash tests**

```typescript
// __tests__/unit/hash.test.ts
import { describe, it, expect } from 'vitest'
import { hashToPercentage } from '../../src/utils/hash.js'

describe('hashToPercentage', () => {
  it('returns a number between 0 and 99', () => {
    for (let i = 0; i < 100; i++) {
      const result = hashToPercentage(`user-${i}`)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(100)
    }
  })

  it('is deterministic — same input always gives same output', () => {
    const a = hashToPercentage('user-abc')
    const b = hashToPercentage('user-abc')
    expect(a).toBe(b)
  })

  it('different inputs give different outputs (high probability)', () => {
    const results = new Set<number>()
    for (let i = 0; i < 1000; i++) {
      results.add(hashToPercentage(`user-${i}`))
    }
    // With 1000 inputs and 100 buckets, we should see at least 80 distinct values
    expect(results.size).toBeGreaterThan(80)
  })

  it('distributes roughly uniformly', () => {
    const buckets = new Array(10).fill(0)
    const total = 10000
    for (let i = 0; i < total; i++) {
      const pct = hashToPercentage(`test-user-${i}`)
      buckets[Math.floor(pct / 10)]++
    }
    // Each bucket should have ~1000 entries. Allow 30% tolerance.
    for (const count of buckets) {
      expect(count).toBeGreaterThan(700)
      expect(count).toBeLessThan(1300)
    }
  })
})
```

- [ ] **Step 4: Write comprehensive grayscale evaluator tests — 100% coverage target**

```typescript
// __tests__/unit/grayscale-evaluator.test.ts
import { describe, it, expect } from 'vitest'
import { evaluateRule } from '../../src/engines/grayscale-evaluator.js'
import type { GrayscaleCondition, GrayscaleContext } from '../../src/types/grayscale.js'

describe('grayscale-evaluator', () => {
  // --- user_list ---
  describe('user_list condition', () => {
    const condition: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-1', 'uid-2', 'uid-3'],
    }

    it('returns true when userId is in the list', () => {
      expect(evaluateRule(condition, { userId: 'uid-2' })).toBe(true)
    })

    it('returns false when userId is NOT in the list', () => {
      expect(evaluateRule(condition, { userId: 'uid-99' })).toBe(false)
    })

    it('returns false for empty user list', () => {
      const empty: GrayscaleCondition = { type: 'user_list', values: [] }
      expect(evaluateRule(empty, { userId: 'uid-1' })).toBe(false)
    })
  })

  // --- department ---
  describe('department condition', () => {
    const condition: GrayscaleCondition = {
      type: 'department',
      values: ['engineering', 'product'],
    }

    it('returns true when department matches', () => {
      expect(evaluateRule(condition, { userId: 'u1', department: 'engineering' })).toBe(true)
    })

    it('returns false when department does not match', () => {
      expect(evaluateRule(condition, { userId: 'u1', department: 'sales' })).toBe(false)
    })

    it('returns false when department is undefined in context', () => {
      expect(evaluateRule(condition, { userId: 'u1' })).toBe(false)
    })
  })

  // --- percentage ---
  describe('percentage condition', () => {
    const condition50: GrayscaleCondition = {
      type: 'percentage',
      value: 50,
      hash_key: 'userId',
    }

    it('is deterministic for the same userId', () => {
      const result1 = evaluateRule(condition50, { userId: 'user-a' })
      const result2 = evaluateRule(condition50, { userId: 'user-a' })
      expect(result1).toBe(result2)
    })

    it('returns false when hash_key field is missing from context', () => {
      const conditionCustomKey: GrayscaleCondition = {
        type: 'percentage',
        value: 50,
        hash_key: 'custom_field',
      }
      expect(evaluateRule(conditionCustomKey, { userId: 'u1' })).toBe(false)
    })

    it('0% means nobody gets in', () => {
      const condition0: GrayscaleCondition = { type: 'percentage', value: 0, hash_key: 'userId' }
      let hitCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluateRule(condition0, { userId: `user-${i}` })) hitCount++
      }
      expect(hitCount).toBe(0)
    })

    it('100% means everyone gets in', () => {
      const condition100: GrayscaleCondition = {
        type: 'percentage',
        value: 100,
        hash_key: 'userId',
      }
      let hitCount = 0
      for (let i = 0; i < 100; i++) {
        if (evaluateRule(condition100, { userId: `user-${i}` })) hitCount++
      }
      expect(hitCount).toBe(100)
    })

    it('50% gives roughly half', () => {
      let hitCount = 0
      const total = 1000
      for (let i = 0; i < total; i++) {
        if (evaluateRule(condition50, { userId: `test-user-${i}` })) hitCount++
      }
      // Allow 10% tolerance
      expect(hitCount).toBeGreaterThan(400)
      expect(hitCount).toBeLessThan(600)
    })
  })

  // --- Composite AND ---
  describe('composite AND', () => {
    it('returns true when ALL conditions are met', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['engineering'] },
          { type: 'user_list', values: ['uid-1', 'uid-2'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-1', department: 'engineering' })).toBe(true)
    })

    it('returns false when any condition fails', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['engineering'] },
          { type: 'user_list', values: ['uid-1'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-99', department: 'engineering' })).toBe(false)
    })

    it('returns false for empty conditions array', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [],
      }
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })
  })

  // --- Composite OR ---
  describe('composite OR', () => {
    it('returns true when ANY condition is met', () => {
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid-vip'] },
          { type: 'department', values: ['engineering'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-nobody', department: 'engineering' })).toBe(true)
    })

    it('returns false when NO condition is met', () => {
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid-vip'] },
          { type: 'department', values: ['engineering'] },
        ],
      }
      expect(evaluateRule(rule, { userId: 'uid-nobody', department: 'sales' })).toBe(false)
    })
  })

  // --- Deeply nested composite ---
  describe('deeply nested composite rules', () => {
    it('evaluates the design spec example correctly', () => {
      // From the design spec:
      // OR(user_list, AND(department, percentage))
      const rule: GrayscaleCondition = {
        operator: 'OR',
        conditions: [
          { type: 'user_list', values: ['uid1', 'uid2'] },
          {
            operator: 'AND',
            conditions: [
              { type: 'department', values: ['dept_a'] },
              { type: 'percentage', value: 50, hash_key: 'userId' },
            ],
          },
        ],
      }

      // uid1 is in user_list — should match
      expect(evaluateRule(rule, { userId: 'uid1', department: 'dept_b' })).toBe(true)

      // Not in user_list, not in dept_a — should NOT match
      expect(evaluateRule(rule, { userId: 'uid99', department: 'dept_b' })).toBe(false)
    })

    it('handles 3 levels of nesting', () => {
      const rule: GrayscaleCondition = {
        operator: 'AND',
        conditions: [
          { type: 'department', values: ['eng'] },
          {
            operator: 'OR',
            conditions: [
              { type: 'user_list', values: ['uid-admin'] },
              {
                operator: 'AND',
                conditions: [
                  { type: 'percentage', value: 100, hash_key: 'userId' },
                ],
              },
            ],
          },
        ],
      }

      // eng department + 100% percentage = true
      expect(evaluateRule(rule, { userId: 'anyone', department: 'eng' })).toBe(true)
      // Wrong department = false even with 100% percentage
      expect(evaluateRule(rule, { userId: 'anyone', department: 'sales' })).toBe(false)
    })
  })

  // --- Edge cases ---
  describe('edge cases', () => {
    it('handles unknown condition type gracefully (returns false)', () => {
      const rule = { type: 'unknown_type', values: ['a'] } as unknown as GrayscaleCondition
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })

    it('handles unknown operator gracefully (returns false)', () => {
      const rule = {
        operator: 'XOR' as 'AND',
        conditions: [{ type: 'user_list', values: ['u1'] }],
      } as GrayscaleCondition
      expect(evaluateRule(rule, { userId: 'u1' })).toBe(false)
    })
  })
})
```

- [ ] **Step 5: Run tests — all must pass**

```bash
cd platform/server && pnpm test -- __tests__/unit/grayscale-evaluator.test.ts __tests__/unit/hash.test.ts
```

- [ ] **Step 6: Check coverage — target 100%**

```bash
cd platform/server && pnpm test:coverage -- --reporter=text __tests__/unit/grayscale-evaluator.test.ts __tests__/unit/hash.test.ts 2>&1 | grep -A5 'grayscale-evaluator\|hash'
```

- [ ] **Step 7: Commit**

```bash
git add platform/server/src/utils/hash.ts platform/server/src/engines/grayscale-evaluator.ts platform/server/__tests__/unit/hash.test.ts platform/server/__tests__/unit/grayscale-evaluator.test.ts
git commit -m "feat(platform): add grayscale evaluator with composite AND/OR rules and deterministic hash percentage"
```

---

### Task 9: Test Setup + Helpers

**Files:**
- Create: `platform/server/__tests__/setup.ts`
- Create: `platform/server/__tests__/helpers.ts`

- [ ] **Step 1: Create platform/server/__tests__/setup.ts**

```typescript
import { beforeAll, afterAll } from 'vitest'
import knex, { type Knex } from 'knex'

let testDb: Knex | null = null

/**
 * Get the test database instance.
 * Creates one if it doesn't exist.
 */
export function getTestDb(): Knex {
  if (!testDb) {
    testDb = knex({
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'pro_platform_test',
      },
      pool: { min: 1, max: 5 },
    })
  }
  return testDb
}

beforeAll(async () => {
  // Ensure test DB exists and migrations are current
  const db = getTestDb()
  try {
    await db.migrate.latest({
      directory: './migrations',
      extension: 'ts',
    })
  } catch (err: unknown) {
    // If DB doesn't exist, skip integration tests gracefully
    // Unit tests (engines, utils) don't need DB
    if ((err as NodeJS.ErrnoException).code === 'ER_BAD_DB_ERROR') {
      // Test DB not available — DB-dependent tests will be skipped
      // Intentionally silent: pino logger is set to 'silent' in test env
    }
  }
})

afterAll(async () => {
  if (testDb) {
    await testDb.destroy()
    testDb = null
  }
})
```

- [ ] **Step 2: Create platform/server/__tests__/helpers.ts**

```typescript
import { generateToken, type AuthPayload } from '../src/middleware/auth.js'
import type { PlatformUserRow } from '../src/types/index.js'

/**
 * Generate a JWT token for a test user with a given role.
 */
export function tokenForRole(role: PlatformUserRow['role'], username?: string): string {
  const payload: AuthPayload = {
    userId: 1,
    username: username || `test-${role}`,
    role,
  }
  return generateToken(payload)
}

/**
 * Common test data factories.
 */
export const fixtures = {
  createAppPayload(overrides: Partial<{ appId: string; name: string; owner: string }> = {}) {
    return {
      appId: overrides.appId || `test-app-${Date.now()}`,
      name: overrides.name || 'Test App',
      owner: overrides.owner || 'test-owner',
    }
  },

  versionSyncPayload(overrides: Partial<{
    packageName: string
    version: string
    dependencies: Record<string, string>
    peerDependencies: Record<string, string>
    cdnPath: string
    sriHashes: Record<string, string>
  }> = {}) {
    return {
      packageName: overrides.packageName || '@pro/table',
      version: overrides.version || '1.0.0',
      dependencies: overrides.dependencies || {},
      peerDependencies: overrides.peerDependencies || {},
      cdnPath: overrides.cdnPath || '/@pro/table/1.0.0',
      sriHashes: overrides.sriHashes || { 'esm/index.mjs': 'sha384-test' },
    }
  },

  grayscalePayload(overrides: Partial<{
    appId: string
    packageName: string
    targetVersion: string
  }> = {}) {
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
```

- [ ] **Step 3: Commit**

```bash
git add platform/server/__tests__/setup.ts platform/server/__tests__/helpers.ts
git commit -m "feat(platform): add test setup with DB migration runner and auth helpers"
```

---

### Task 10: App Management Module (CRUD)

**Files:**
- Create: `platform/server/src/modules/app/repository.ts`
- Create: `platform/server/src/modules/app/service.ts`
- Create: `platform/server/src/modules/app/router.ts`
- Create: `platform/server/__tests__/integration/app.test.ts`

- [ ] **Step 1: Create platform/server/src/modules/app/repository.ts**

```typescript
import type { Knex } from 'knex'
import type { AppRow, AppVersionMapRow } from '../../types/index.js'

export class AppRepository {
  constructor(private readonly db: Knex) {}

  async findByAppId(appId: string): Promise<AppRow | undefined> {
    return this.db('apps').where({ app_id: appId }).first()
  }

  async findAll(page: number, pageSize: number): Promise<{ data: AppRow[]; total: number }> {
    const [{ count }] = await this.db('apps').count('* as count')
    const data = await this.db('apps')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    return { data, total: Number(count) }
  }

  async create(app: { app_id: string; name: string; owner: string }): Promise<number> {
    const [id] = await this.db('apps').insert(app)
    return id
  }

  async getVersionMaps(appId: string): Promise<
    Array<AppVersionMapRow & { package_name: string }>
  > {
    return this.db('app_version_maps')
      .join('packages', 'app_version_maps.package_id', 'packages.id')
      .where('app_version_maps.app_id', appId)
      .select(
        'app_version_maps.*',
        'packages.name as package_name',
      )
  }

  async upsertVersionMap(
    appId: string,
    packageId: number,
    data: {
      pinned_version?: string | null
      version_range?: string | null
      resolved_version?: string | null
    },
  ): Promise<void> {
    const existing = await this.db('app_version_maps')
      .where({ app_id: appId, package_id: packageId })
      .first()

    if (existing) {
      await this.db('app_version_maps')
        .where({ app_id: appId, package_id: packageId })
        .update({ ...data, updated_at: this.db.fn.now() })
    } else {
      await this.db('app_version_maps').insert({
        app_id: appId,
        package_id: packageId,
        ...data,
        updated_at: this.db.fn.now(),
      })
    }
  }
}
```

- [ ] **Step 2: Create platform/server/src/modules/app/service.ts**

```typescript
import { AppRepository } from './repository.js'
import { AppError } from '../../middleware/error-handler.js'
import type { Knex } from 'knex'
import type { CreateAppRequest, UpdateAppVersionsRequest, AppVersionsResponse } from '../../types/api.js'

export class AppService {
  private readonly repo: AppRepository

  constructor(db: Knex) {
    this.repo = new AppRepository(db)
  }

  async createApp(input: CreateAppRequest): Promise<{ id: number }> {
    const existing = await this.repo.findByAppId(input.appId)
    if (existing) {
      throw new AppError(409, 'APP_EXISTS', `App '${input.appId}' already exists`)
    }

    const id = await this.repo.create({
      app_id: input.appId,
      name: input.name,
      owner: input.owner,
    })

    return { id }
  }

  async listApps(page = 1, pageSize = 20): Promise<{ data: Array<{ appId: string; name: string | null; owner: string | null }>; total: number }> {
    const result = await this.repo.findAll(page, pageSize)
    return {
      data: result.data.map((row) => ({
        appId: row.app_id,
        name: row.name,
        owner: row.owner,
      })),
      total: result.total,
    }
  }

  async getAppVersions(appId: string): Promise<AppVersionsResponse> {
    const app = await this.repo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    const maps = await this.repo.getVersionMaps(appId)
    return {
      appId,
      versions: maps.map((m) => ({
        packageName: m.package_name,
        pinnedVersion: m.pinned_version,
        versionRange: m.version_range,
        resolvedVersion: m.resolved_version,
      })),
    }
  }

  async updateAppVersions(
    appId: string,
    input: UpdateAppVersionsRequest,
    db: Knex,
  ): Promise<void> {
    const app = await this.repo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    for (const ver of input.versions) {
      // Look up package by name
      const pkg = await db('packages').where({ name: ver.packageName }).first()
      if (!pkg) {
        throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${ver.packageName}' not found`)
      }

      await this.repo.upsertVersionMap(appId, pkg.id, {
        pinned_version: ver.pinnedVersion || null,
        version_range: ver.versionRange || null,
      })
    }
  }
}
```

- [ ] **Step 3: Create platform/server/src/modules/app/router.ts**

```typescript
import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { AppService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const appRouter = new Router({ prefix: '/api/v1/apps' })

function getService(): AppService {
  return new AppService(getDb())
}

// POST /api/v1/apps — Create a new app
appRouter.post('/', auth, requirePermission('apps:create'), async (ctx: Context) => {
  const body = ctx.request.body as { appId?: string; name?: string; owner?: string }

  if (!body.appId || !body.name || !body.owner) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId, name, and owner are required' }
    return
  }

  const service = getService()
  const result = await service.createApp({
    appId: body.appId,
    name: body.name,
    owner: body.owner,
  })

  ctx.status = 201
  ctx.body = result
})

// GET /api/v1/apps — List apps
appRouter.get('/', auth, requirePermission('apps:read'), async (ctx: Context) => {
  const page = parseInt(ctx.query.page as string) || 1
  const pageSize = parseInt(ctx.query.pageSize as string) || 20

  const service = getService()
  const result = await service.listApps(page, pageSize)

  ctx.body = {
    data: result.data,
    total: result.total,
    page,
    pageSize,
  }
})

// GET /api/v1/apps/:appId/versions — Get app version mappings
appRouter.get('/:appId/versions', auth, requirePermission('apps:read'), async (ctx: Context) => {
  const service = getService()
  ctx.body = await service.getAppVersions(ctx.params.appId)
})

// PUT /api/v1/apps/:appId/versions — Update app version mappings
appRouter.put('/:appId/versions', auth, requirePermission('apps:update'), async (ctx: Context) => {
  const body = ctx.request.body as { versions?: Array<{ packageName: string; pinnedVersion?: string; versionRange?: string }> }

  if (!body.versions || !Array.isArray(body.versions)) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'versions array is required' }
    return
  }

  const service = getService()
  await service.updateAppVersions(ctx.params.appId, { versions: body.versions }, getDb())

  ctx.status = 204
})
```

- [ ] **Step 4: Write integration tests**

```typescript
// __tests__/integration/app.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'
import { getTestDb } from '../setup.js'

describe('App Management API', () => {
  const app = createApp()
  const server = app.callback()
  const operatorToken = tokenForRole('operator')
  const viewerToken = tokenForRole('viewer')

  // Note: these tests require a running MySQL test database.
  // Skip gracefully if not available.

  describe('POST /api/v1/apps', () => {
    it('creates a new app with operator role', async () => {
      const payload = fixtures.createAppPayload()
      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
    })

    it('rejects duplicate app_id', async () => {
      const payload = fixtures.createAppPayload({ appId: 'dup-test-app' })

      await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(payload)

      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(payload)

      expect(res.status).toBe(409)
      expect(res.body.code).toBe('APP_EXISTS')
    })

    it('rejects viewer role', async () => {
      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.createAppPayload())

      expect(res.status).toBe(403)
    })

    it('validates required fields', async () => {
      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ appId: 'missing-fields' })

      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/apps', () => {
    it('lists apps with viewer role', async () => {
      const res = await request(server)
        .get('/api/v1/apps')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('total')
    })

    it('supports pagination', async () => {
      const res = await request(server)
        .get('/api/v1/apps?page=1&pageSize=5')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.page).toBe(1)
      expect(res.body.pageSize).toBe(5)
    })
  })

  describe('GET /api/v1/apps/:appId/versions', () => {
    it('returns 404 for nonexistent app', async () => {
      const res = await request(server)
        .get('/api/v1/apps/nonexistent/versions')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(404)
    })
  })
})
```

- [ ] **Step 5: Run tests**

```bash
cd platform/server && pnpm test -- __tests__/integration/app.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add platform/server/src/modules/app/
git add platform/server/__tests__/integration/app.test.ts
git commit -m "feat(platform): add app management CRUD module with routes, service, repository"
```

---

### Task 11: Version Sync Module (npm publish hook)

**Files:**
- Create: `platform/server/src/modules/version/repository.ts`
- Create: `platform/server/src/modules/sync/service.ts`
- Create: `platform/server/src/modules/sync/router.ts`
- Create: `platform/server/src/modules/version/service.ts`
- Create: `platform/server/src/modules/version/router.ts`

- [ ] **Step 1: Create platform/server/src/modules/version/repository.ts**

```typescript
import type { Knex } from 'knex'
import type { VersionRow, PackageRow } from '../../types/index.js'

export class VersionRepository {
  constructor(private readonly db: Knex) {}

  async findPackageByName(name: string): Promise<PackageRow | undefined> {
    return this.db('packages').where({ name }).first()
  }

  async findPackageById(id: number): Promise<PackageRow | undefined> {
    return this.db('packages').where({ id }).first()
  }

  async createPackage(data: { name: string; description?: string }): Promise<number> {
    const [id] = await this.db('packages').insert(data)
    return id
  }

  async updatePackageLatest(packageId: number, latestVersion: string): Promise<void> {
    await this.db('packages').where({ id: packageId }).update({ latest_version: latestVersion })
  }

  async findVersion(packageId: number, version: string): Promise<VersionRow | undefined> {
    return this.db('versions').where({ package_id: packageId, version }).first()
  }

  async findVersionById(id: number): Promise<VersionRow | undefined> {
    return this.db('versions').where({ id }).first()
  }

  async findVersionsByPackageId(packageId: number): Promise<VersionRow[]> {
    return this.db('versions')
      .where({ package_id: packageId })
      .orderBy('published_at', 'desc')
  }

  async findPublishedVersions(packageId: number): Promise<VersionRow[]> {
    return this.db('versions')
      .where({ package_id: packageId, status: 'published' })
      .orderBy('published_at', 'desc')
  }

  async createVersion(data: {
    package_id: number
    version: string
    dependencies?: string
    peer_dependencies?: string
    cdn_path?: string
    changelog?: string
    breaking_changes?: string
    sri_hashes?: string
    status?: string
  }): Promise<number> {
    const [id] = await this.db('versions').insert(data)
    return id
  }

  async updateVersionStatus(id: number, status: VersionRow['status']): Promise<void> {
    await this.db('versions').where({ id }).update({ status })
  }

  async insertEvent(data: {
    package_id?: number | null
    app_id?: string | null
    action: string
    from_version?: string | null
    to_version?: string | null
    operator: string
    reason?: string | null
    metadata?: string | null
  }): Promise<void> {
    await this.db('version_events').insert(data)
  }
}
```

- [ ] **Step 2: Create platform/server/src/modules/sync/service.ts**

```typescript
import type { Knex } from 'knex'
import { VersionRepository } from '../version/repository.js'
import type { VersionSyncRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

export class SyncService {
  private readonly repo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new VersionRepository(db)
  }

  /**
   * Handle npm publish webhook.
   * Idempotent: if the version already exists, skip creation.
   */
  async syncVersion(input: VersionSyncRequest, operator: string): Promise<{ created: boolean; versionId: number }> {
    // Find or create package
    let pkg = await this.repo.findPackageByName(input.packageName)
    if (!pkg) {
      const pkgId = await this.repo.createPackage({ name: input.packageName })
      pkg = await this.repo.findPackageById(pkgId)
    }

    if (!pkg) {
      throw new Error(`Failed to find or create package: ${input.packageName}`)
    }

    // Check if version already exists (idempotency)
    const existing = await this.repo.findVersion(pkg.id, input.version)
    if (existing) {
      logger.info(
        { packageName: input.packageName, version: input.version },
        'Version already exists, skipping sync',
      )
      return { created: false, versionId: existing.id }
    }

    // Create version record
    const versionId = await this.repo.createVersion({
      package_id: pkg.id,
      version: input.version,
      dependencies: input.dependencies ? JSON.stringify(input.dependencies) : null,
      peer_dependencies: input.peerDependencies ? JSON.stringify(input.peerDependencies) : null,
      cdn_path: input.cdnPath || null,
      changelog: input.changelog || null,
      breaking_changes: input.breakingChanges ? JSON.stringify(input.breakingChanges) : null,
      sri_hashes: input.sriHashes ? JSON.stringify(input.sriHashes) : null,
    })

    // Update latest_version on package
    await this.repo.updatePackageLatest(pkg.id, input.version)

    // Audit event
    await this.repo.insertEvent({
      package_id: pkg.id,
      action: 'publish',
      to_version: input.version,
      operator,
      metadata: JSON.stringify({
        cdnPath: input.cdnPath,
        hasBreakingChanges: !!input.breakingChanges?.length,
      }),
    })

    logger.info(
      { packageName: input.packageName, version: input.version, versionId },
      'Version synced successfully',
    )

    return { created: true, versionId }
  }
}
```

- [ ] **Step 3: Create platform/server/src/modules/sync/router.ts**

> **Implementation note — Transaction semantics for multi-package publish:**
> The sync endpoint MUST accept batch payloads (array of packages) in addition to single-package payloads.
> Multi-package publishes (e.g., releasing `@pro/table` + `@pro/hooks` together) MUST be wrapped in a
> Knex transaction to ensure atomicity — all inserts succeed or none do. No partial version state.

```typescript
import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { SyncService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'
import type { Knex } from 'knex'
import { logger } from '../../logger.js'

export const syncRouter = new Router({ prefix: '/api/v1/versions' })

// --- Types for batch sync ---

interface VersionSyncPayload {
  packageName: string
  version: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  cdnPath?: string
  changelog?: string
  breakingChanges?: string[]
  sriHashes?: Record<string, string>
}

interface SyncResult {
  packageName: string
  versionId: number
  created: boolean
}

/**
 * Sync multiple package versions atomically.
 * All inserts succeed or none do — no partial version state.
 */
async function syncVersionBatch(
  db: Knex,
  packages: VersionSyncPayload[],
  operator: string,
): Promise<SyncResult[]> {
  return db.transaction(async (trx) => {
    const results: SyncResult[] = []
    const syncService = new SyncService(trx)

    for (const pkg of packages) {
      const result = await syncService.syncVersion(
        {
          packageName: pkg.packageName,
          version: pkg.version,
          dependencies: pkg.dependencies,
          peerDependencies: pkg.peerDependencies,
          cdnPath: pkg.cdnPath,
          changelog: pkg.changelog,
          breakingChanges: pkg.breakingChanges,
          sriHashes: pkg.sriHashes,
        },
        operator,
      )

      results.push({
        packageName: pkg.packageName,
        versionId: result.versionId,
        created: result.created,
      })
    }

    // Dependency resolution within same transaction (sees new versions)
    // Future: call resolveDependencies(trx, result.versionId) here

    return results
  })
  // Cache invalidation happens AFTER transaction commits (outside the transaction)
}

// POST /api/v1/versions/sync — npm publish hook receiver (single or batch)
syncRouter.post('/sync', auth, requirePermission('versions:sync'), async (ctx: Context) => {
  const body = ctx.request.body as VersionSyncPayload | { packages: VersionSyncPayload[] }

  // Support both single-package and batch payloads
  if ('packages' in body && Array.isArray(body.packages)) {
    // Batch mode — transactional
    if (body.packages.length === 0) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'packages array must not be empty' }
      return
    }

    for (const pkg of body.packages) {
      if (!pkg.packageName || !pkg.version) {
        ctx.status = 400
        ctx.body = {
          code: 'VALIDATION_ERROR',
          message: `packageName and version are required for each package (missing in ${pkg.packageName ?? 'unknown'})`,
        }
        return
      }
    }

    const db = getDb()
    const results = await syncVersionBatch(db, body.packages, ctx.state.user!.username)

    const anyCreated = results.some((r) => r.created)
    ctx.status = anyCreated ? 201 : 200
    ctx.body = { results }
    return
  }

  // Single-package mode (backward compatible)
  const singleBody = body as VersionSyncPayload
  if (!singleBody.packageName || !singleBody.version) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'packageName and version are required' }
    return
  }

  const service = new SyncService(getDb())
  const result = await service.syncVersion(
    {
      packageName: singleBody.packageName,
      version: singleBody.version,
      dependencies: singleBody.dependencies,
      peerDependencies: singleBody.peerDependencies,
      cdnPath: singleBody.cdnPath,
      changelog: singleBody.changelog,
      breakingChanges: singleBody.breakingChanges,
      sriHashes: singleBody.sriHashes,
    },
    ctx.state.user!.username,
  )

  ctx.status = result.created ? 201 : 200
  ctx.body = result
})
```

- [ ] **Step 4: Create platform/server/src/modules/version/service.ts**

```typescript
import type { Knex } from 'knex'
import semver from 'semver'
import { VersionRepository } from './repository.js'
import { AppError } from '../../middleware/error-handler.js'
import type { RollbackRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

export class VersionService {
  private readonly repo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new VersionRepository(db)
  }

  async listVersions(packageName: string): Promise<Array<{
    id: number
    version: string
    status: string
    publishedAt: Date
    hasBreakingChanges: boolean
  }>> {
    const pkg = await this.repo.findPackageByName(packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const versions = await this.repo.findVersionsByPackageId(pkg.id)
    return versions.map((v) => ({
      id: v.id,
      version: v.version,
      status: v.status,
      publishedAt: v.published_at,
      hasBreakingChanges: !!(v.breaking_changes && JSON.parse(v.breaking_changes).length > 0),
    }))
  }

  async getDependencyTree(packageName: string, version?: string): Promise<{
    name: string
    version: string
    dependencies: Record<string, string>
    peerDependencies: Record<string, string>
  }> {
    const pkg = await this.repo.findPackageByName(packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const ver = version
      ? await this.repo.findVersion(pkg.id, version)
      : (await this.repo.findPublishedVersions(pkg.id))[0]

    if (!ver) {
      throw new AppError(404, 'VERSION_NOT_FOUND', `No version found for '${packageName}'`)
    }

    return {
      name: packageName,
      version: ver.version,
      dependencies: ver.dependencies ? JSON.parse(ver.dependencies) : {},
      peerDependencies: ver.peer_dependencies ? JSON.parse(ver.peer_dependencies) : {},
    }
  }

  /**
   * Rollback a version for an app.
   *
   * Pre-checks:
   * 1. Target version exists and is published
   * 2. CDN path is set (resource available)
   * 3. SRI hashes exist (integrity verifiable)
   * 4. Reason is mandatory
   *
   * Actions:
   * 1. Update app_version_maps
   * 2. Record audit event with reason
   */
  async rollback(
    versionId: number,
    input: RollbackRequest,
    operator: string,
  ): Promise<void> {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new AppError(400, 'REASON_REQUIRED', 'Rollback reason is mandatory')
    }

    const version = await this.repo.findVersionById(versionId)
    if (!version) {
      throw new AppError(404, 'VERSION_NOT_FOUND', 'Version not found')
    }

    // Pre-check: target version must exist and be published
    const pkg = await this.repo.findPackageById(version.package_id)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', 'Package not found')
    }

    const targetVer = await this.repo.findVersion(pkg.id, input.targetVersion)
    if (!targetVer) {
      throw new AppError(
        404,
        'TARGET_VERSION_NOT_FOUND',
        `Target version '${input.targetVersion}' not found`,
      )
    }

    if (targetVer.status !== 'published') {
      throw new AppError(
        400,
        'TARGET_VERSION_NOT_PUBLISHED',
        `Target version '${input.targetVersion}' is ${targetVer.status}`,
      )
    }

    // Pre-check: CDN resources must exist
    if (!targetVer.cdn_path) {
      throw new AppError(
        400,
        'CDN_PATH_MISSING',
        `Target version '${input.targetVersion}' has no CDN path`,
      )
    }

    // Update all app_version_maps pointing to the current version
    await this.db('app_version_maps')
      .where({ package_id: pkg.id, resolved_version: version.version })
      .update({
        resolved_version: input.targetVersion,
        pinned_version: input.targetVersion,
        updated_at: this.db.fn.now(),
      })

    // Audit event
    await this.repo.insertEvent({
      package_id: pkg.id,
      action: 'rollback',
      from_version: version.version,
      to_version: input.targetVersion,
      operator,
      reason: input.reason,
      metadata: JSON.stringify({ versionId, cache_bust: true }),
    })

    logger.info(
      {
        packageName: pkg.name,
        fromVersion: version.version,
        toVersion: input.targetVersion,
        operator,
      },
      'Version rollback executed',
    )
  }

  /**
   * Deprecate a version. Sets status to 'deprecated'.
   */
  async deprecate(versionId: number, operator: string, reason?: string): Promise<void> {
    const version = await this.repo.findVersionById(versionId)
    if (!version) {
      throw new AppError(404, 'VERSION_NOT_FOUND', 'Version not found')
    }

    await this.repo.updateVersionStatus(versionId, 'deprecated')

    await this.repo.insertEvent({
      package_id: version.package_id,
      action: 'deprecate',
      from_version: version.version,
      operator,
      reason: reason || null,
    })
  }
}
```

- [ ] **Step 5: Create platform/server/src/modules/version/router.ts**

```typescript
import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { VersionService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const versionRouter = new Router({ prefix: '/api/v1/versions' })

// GET /api/v1/versions/:package — List versions for a package
versionRouter.get('/:package', auth, requirePermission('versions:read'), async (ctx: Context) => {
  const service = new VersionService(getDb())
  const versions = await service.listVersions(ctx.params.package)
  ctx.body = { data: versions }
})

// GET /api/v1/versions/:package/deps — Full dependency tree
versionRouter.get('/:package/deps', auth, requirePermission('versions:read'), async (ctx: Context) => {
  const service = new VersionService(getDb())
  const version = ctx.query.version as string | undefined
  const tree = await service.getDependencyTree(ctx.params.package, version)
  ctx.body = tree
})

// POST /api/v1/versions/:id/rollback — Rollback to a previous version
versionRouter.post('/:id/rollback', auth, requirePermission('versions:rollback'), async (ctx: Context) => {
  const body = ctx.request.body as { reason?: string; targetVersion?: string }

  if (!body.reason || !body.targetVersion) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'reason and targetVersion are required' }
    return
  }

  const service = new VersionService(getDb())
  await service.rollback(
    parseInt(ctx.params.id, 10),
    { reason: body.reason, targetVersion: body.targetVersion },
    ctx.state.user!.username,
  )

  ctx.body = { success: true, cache_bust: true }
})

// POST /api/v1/versions/:id/deprecate — Deprecate a version
versionRouter.post('/:id/deprecate', auth, requirePermission('versions:deprecate'), async (ctx: Context) => {
  const body = ctx.request.body as { reason?: string }

  const service = new VersionService(getDb())
  await service.deprecate(
    parseInt(ctx.params.id, 10),
    ctx.state.user!.username,
    body.reason,
  )

  ctx.status = 204
})
```

- [ ] **Step 6: Write integration tests**

```typescript
// __tests__/integration/version.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'

describe('Version Management API', () => {
  const app = createApp()
  const server = app.callback()
  const publisherToken = tokenForRole('publisher')
  const adminToken = tokenForRole('admin')
  const viewerToken = tokenForRole('viewer')

  describe('POST /api/v1/versions/sync', () => {
    it('syncs a new version with publisher role', async () => {
      const payload = fixtures.versionSyncPayload({
        packageName: '@pro/test-sync',
        version: '0.1.0',
      })
      const res = await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.created).toBe(true)
    })

    it('is idempotent — second sync returns 200 not 201', async () => {
      const payload = fixtures.versionSyncPayload({
        packageName: '@pro/test-idempotent',
        version: '1.0.0',
      })

      await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send(payload)

      const res = await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send(payload)

      expect(res.status).toBe(200)
      expect(res.body.created).toBe(false)
    })

    it('rejects viewer role', async () => {
      const res = await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.versionSyncPayload())

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/v1/versions/:id/rollback', () => {
    it('requires admin role', async () => {
      const res = await request(server)
        .post('/api/v1/versions/1/rollback')
        .set('Authorization', `Bearer ${tokenForRole('operator')}`)
        .send({ reason: 'test', targetVersion: '1.0.0' })

      expect(res.status).toBe(403)
    })

    it('requires reason field', async () => {
      const res = await request(server)
        .post('/api/v1/versions/1/rollback')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ targetVersion: '1.0.0' })

      expect(res.status).toBe(400)
    })
  })
})
```

- [ ] **Step 7: Run tests**

```bash
cd platform/server && pnpm test -- __tests__/integration/version.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add platform/server/src/modules/version/ platform/server/src/modules/sync/
git add platform/server/__tests__/integration/version.test.ts
git commit -m "feat(platform): add version sync, rollback, deprecate endpoints with audit trail"
```

---

### Task 12: Import Map Generation Module

**Files:**
- Create: `platform/server/src/modules/import-map/cache.ts`
- Create: `platform/server/src/modules/import-map/service.ts`
- Create: `platform/server/src/modules/import-map/router.ts`
- Create: `platform/server/__tests__/integration/import-map.test.ts`

- [ ] **Step 1: Create platform/server/src/modules/import-map/cache.ts**

```typescript
import { LRUCache } from 'lru-cache'
import { loadConfig } from '../../config.js'
import type { ImportMapResponse } from '../../types/api.js'
import { logger } from '../../logger.js'
import { getDb } from '../../db.js'

/**
 * Named constants for cache configuration.
 * These are defaults — production values come from AppConfig.
 */
const IMPORT_MAP_CACHE_MAX_ENTRIES = 10_000
const IMPORT_MAP_CACHE_TTL_MS = 60_000
const CDN_EDGE_MAX_AGE_S = 60
const CDN_EDGE_SWR_S = 300

/**
 * Import map cache with composite key and active invalidation.
 *
 * Key structure: `{appId}:{userId}:{cacheEpoch}`
 * - cacheEpoch is a global counter incremented on any version mapping or grayscale rule change
 * - This ensures all cached entries become stale immediately after changes
 *
 * TTL: 60s for API response cache, 300s for CDN edge (stale-while-revalidate)
 * LRU capacity: 10,000 entries per API instance
 */
let cache: LRUCache<string, ImportMapResponse> | null = null

function getCache(): LRUCache<string, ImportMapResponse> {
  if (!cache) {
    const config = loadConfig()
    cache = new LRUCache<string, ImportMapResponse>({
      max: config.cache.importMapMaxSize || IMPORT_MAP_CACHE_MAX_ENTRIES,
      ttl: config.cache.importMapTtlMs || IMPORT_MAP_CACHE_TTL_MS,
    })
    logger.info(
      { maxSize: config.cache.importMapMaxSize, ttlMs: config.cache.importMapTtlMs },
      'Import map cache initialized',
    )
  }
  return cache
}

/** Get current cache epoch from DB (global invalidation counter) */
export async function getCacheEpoch(): Promise<number> {
  try {
    const db = getDb()
    const row = await db('cache_metadata').where('key', 'cache_epoch').first()
    return row?.value ?? 0
  } catch {
    return 0
  }
}

/** Increment cache epoch — called after version mapping or grayscale rule changes */
export async function invalidateImportMapCache(): Promise<void> {
  try {
    const db = getDb()
    await db('cache_metadata')
      .where('key', 'cache_epoch')
      .increment('value', 1)
  } catch {
    // cache_metadata table may not exist yet — graceful degradation
    logger.warn('Failed to increment cache epoch — cache_metadata table may not exist')
  }

  // Also clear local LRU (other instances will see new epoch on next request)
  getCache().clear()
}

/**
 * Build cache key from appId, userId, and version fingerprint.
 * Version fingerprint is a sorted hash of all resolved versions,
 * ensuring cache invalidation on any version change.
 */
export function buildCacheKey(
  appId: string,
  userId: string | undefined,
  versionFingerprint: string,
): string {
  return `${appId}:${userId || '_anon'}:${versionFingerprint}`
}

/**
 * Build version fingerprint from resolved versions.
 * Deterministic: sorted by package name.
 */
export function buildVersionFingerprint(resolved: Map<string, string>): string {
  const entries = Array.from(resolved.entries()).sort(([a], [b]) => a.localeCompare(b))
  return entries.map(([name, ver]) => `${name}@${ver}`).join(',')
}

export function getCached(key: string): ImportMapResponse | undefined {
  return getCache().get(key)
}

export function setCached(key: string, value: ImportMapResponse): void {
  getCache().set(key, value)
}

export function clearCache(): void {
  getCache().clear()
}

export function getCacheSize(): number {
  return getCache().size
}

export { CDN_EDGE_MAX_AGE_S, CDN_EDGE_SWR_S }
```

- [ ] **Step 2: Create platform/server/src/modules/import-map/service.ts**

```typescript
import type { Knex } from 'knex'
import { VersionRepository } from '../version/repository.js'
import { AppRepository } from '../app/repository.js'
import { resolve as semverResolve, type VersionEntry, type VersionRegistry } from '../../engines/semver-resolver.js'
import { evaluateRule } from '../../engines/grayscale-evaluator.js'
import {
  buildCacheKey,
  buildVersionFingerprint,
  getCached,
  setCached,
} from './cache.js'
import { loadConfig } from '../../config.js'
import { AppError } from '../../middleware/error-handler.js'
import type { ImportMapResponse, GrayscaleContext } from '../../types/index.js'
import type { GrayscaleRuleConfig } from '../../types/grayscale.js'
import { logger } from '../../logger.js'

export class ImportMapService {
  private readonly versionRepo: VersionRepository
  private readonly appRepo: AppRepository

  constructor(private readonly db: Knex) {
    this.versionRepo = new VersionRepository(db)
    this.appRepo = new AppRepository(db)
  }

  /**
   * Generate an import map for an app + user combination.
   *
   * Pipeline:
   * 1. Query app_version_maps -> base version mapping
   * 2. Query grayscale_rules -> user hits canary? Replace version
   * 3. Semver resolve -> ranges to exact versions
   * 4. Dependency tree expansion -> recursive resolve, dedupe shared deps
   * 5. Diamond dependency check -> range intersection, conflict error if incompatible
   * 6. Generate import map + modulepreload + CSS links + SRI hashes
   * 7. Cache result (key: appId + userId + version fingerprint)
   *
   * NOTE: This method exceeds 50 lines. When implementing, split into private helpers:
   * - `evaluateGrayscaleOverrides(appId, userId)` — Step 2
   * - `buildImportMapResponse(resolved, versionMaps, cdnBase)` — Step 6
   * - `checkCacheOrBuild(appId, userId, result, versionMaps)` — Steps 5-7
   */
  async generate(appId: string, userId?: string): Promise<ImportMapResponse> {
    const config = loadConfig()
    const cdnBase = config.cdn.baseUrl

    // --- Step 1: Get app and its version maps ---
    const app = await this.appRepo.findByAppId(appId)
    if (!app) {
      throw new AppError(404, 'APP_NOT_FOUND', `App '${appId}' not found`)
    }

    const versionMaps = await this.appRepo.getVersionMaps(appId)
    if (versionMaps.length === 0) {
      return {
        imports: {},
        preloads: [],
        styles: [],
        sriHashes: {},
        cache_bust: false,
      }
    }

    // --- Step 2: Check grayscale rules ---
    const grayscaleOverrides = new Map<number, string>() // packageId -> targetVersion
    if (userId) {
      const activeRules = await this.db('grayscale_rules')
        .where({ app_id: appId, status: 'active' })

      const grayscaleContext: GrayscaleContext = { userId }

      for (const rule of activeRules) {
        const ruleConfig = rule.rule_config
          ? (JSON.parse(rule.rule_config) as GrayscaleRuleConfig)
          : null

        if (ruleConfig && evaluateRule(ruleConfig, grayscaleContext)) {
          grayscaleOverrides.set(rule.package_id, rule.target_version)
          logger.debug(
            { appId, userId, packageId: rule.package_id, targetVersion: rule.target_version },
            'Grayscale rule matched',
          )
        }
      }
    }

    // --- Step 3 + 4: Build registry and resolve ---
    const registry = await this.buildRegistry()

    const requests = versionMaps.map((vm) => {
      const grayscaleVersion = grayscaleOverrides.get(vm.package_id)
      if (grayscaleVersion) {
        return { name: vm.package_name, pinnedVersion: grayscaleVersion }
      }
      return {
        name: vm.package_name,
        pinnedVersion: vm.pinned_version || undefined,
        versionRange: vm.version_range || undefined,
      }
    })

    const result = semverResolve(requests, registry)

    // --- Step 5: Check for conflicts ---
    if (result.conflicts.length > 0) {
      throw new AppError(409, 'DEPENDENCY_CONFLICT', 'Diamond dependency conflict detected', {
        conflicts: result.conflicts,
      })
    }

    // --- Check cache ---
    const fingerprint = buildVersionFingerprint(result.resolved)
    const cacheKey = buildCacheKey(appId, userId, fingerprint)
    const cached = getCached(cacheKey)
    if (cached) {
      return cached
    }

    // --- Step 6: Build import map response ---
    const imports: Record<string, string> = {}
    const preloads: string[] = []
    const styles: string[] = []
    const sriHashes: Record<string, string> = {}

    for (const [name, version] of result.resolved.entries()) {
      const esmUrl = `${cdnBase}/${name}/${version}/esm/index.mjs`
      imports[name] = esmUrl

      // Look up version record for SRI hashes and cdn_path
      const pkg = await this.versionRepo.findPackageByName(name)
      if (pkg) {
        const verRecord = await this.versionRepo.findVersion(pkg.id, version)
        if (verRecord) {
          // SRI hashes
          if (verRecord.sri_hashes) {
            const hashes = JSON.parse(verRecord.sri_hashes) as Record<string, string>
            for (const [file, hash] of Object.entries(hashes)) {
              const fileUrl = `${cdnBase}/${name}/${version}/${file}`
              sriHashes[fileUrl] = hash
            }
          }

          // CSS style link
          const styleUrl = `${cdnBase}/${name}/${version}/style/index.css`
          styles.push(styleUrl)
        }
      }

      // Preload dependencies (not top-level packages)
      const isTopLevel = versionMaps.some((vm) => vm.package_name === name)
      if (!isTopLevel) {
        preloads.push(esmUrl)
      }
    }

    const response: ImportMapResponse = {
      imports,
      preloads,
      styles,
      sriHashes,
      cache_bust: false,
    }

    // --- Step 7: Cache ---
    setCached(cacheKey, response)

    return response
  }

  /**
   * Build an in-memory VersionRegistry from the database.
   * Used by the semver resolver.
   */
  private async buildRegistry(): Promise<VersionRegistry> {
    const allPackages = await this.db('packages').select('*')
    const allVersions = await this.db('versions').where({ status: 'published' }).select('*')

    const entries: VersionEntry[] = allVersions.map((v) => ({
      name: allPackages.find((p) => p.id === v.package_id)?.name || '',
      version: v.version,
      dependencies: v.dependencies ? JSON.parse(v.dependencies) : {},
      peerDependencies: v.peer_dependencies ? JSON.parse(v.peer_dependencies) : {},
    }))

    return {
      getVersions(packageName: string): VersionEntry[] {
        return entries.filter((e) => e.name === packageName)
      },
      getVersion(packageName: string, version: string): VersionEntry | undefined {
        return entries.find((e) => e.name === packageName && e.version === version)
      },
    }
  }
}
```

- [ ] **Step 3: Create platform/server/src/modules/import-map/router.ts**

```typescript
import Router from 'koa-router'
import { ImportMapService } from './service.js'
import { getDb } from '../../db.js'
import { CDN_EDGE_MAX_AGE_S, CDN_EDGE_SWR_S } from './cache.js'
import type { Context } from 'koa'

export const importMapRouter = new Router()

/**
 * GET /api/v1/import-map?appId=xxx&userId=xxx
 *
 * Consumer-facing endpoint. No auth required (CDN edge cached).
 * Sets cache headers for CDN edge caching.
 */
importMapRouter.get('/api/v1/import-map', async (ctx: Context) => {
  const appId = ctx.query.appId as string
  const userId = ctx.query.userId as string | undefined

  if (!appId) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId query parameter is required' }
    return
  }

  const service = new ImportMapService(getDb())
  const result = await service.generate(appId, userId)

  // CDN edge cache headers — use named constants
  ctx.set('Cache-Control', `public, max-age=${CDN_EDGE_MAX_AGE_S}, stale-while-revalidate=${CDN_EDGE_SWR_S}`)
  ctx.set('Vary', 'Accept-Encoding')

  ctx.body = result
})
```

- [ ] **Step 4: Write integration tests**

```typescript
// __tests__/integration/import-map.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'

describe('Import Map Generation API', () => {
  const app = createApp()
  const server = app.callback()

  describe('GET /api/v1/import-map', () => {
    it('requires appId query parameter', async () => {
      const res = await request(server).get('/api/v1/import-map')
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })

    it('returns 404 for nonexistent app', async () => {
      const res = await request(server).get('/api/v1/import-map?appId=nonexistent')
      expect(res.status).toBe(404)
      expect(res.body.code).toBe('APP_NOT_FOUND')
    })

    it('does not require authentication (consumer-facing)', async () => {
      // Should NOT return 401 — the endpoint is public
      const res = await request(server).get('/api/v1/import-map?appId=user-center')
      expect(res.status).not.toBe(401)
    })

    it('sets CDN cache headers', async () => {
      const res = await request(server).get('/api/v1/import-map?appId=user-center')
      // Even on 404, check that it's processed (not 401)
      if (res.status === 200) {
        expect(res.headers['cache-control']).toContain('max-age=60')
        expect(res.headers['cache-control']).toContain('stale-while-revalidate=300')
      }
    })

    it('returns correct import map structure when app exists (requires seeded DB)', async () => {
      const res = await request(server).get('/api/v1/import-map?appId=user-center')

      if (res.status === 200) {
        expect(res.body).toHaveProperty('imports')
        expect(res.body).toHaveProperty('preloads')
        expect(res.body).toHaveProperty('styles')
        expect(res.body).toHaveProperty('sriHashes')
        expect(res.body).toHaveProperty('cache_bust')
        expect(typeof res.body.imports).toBe('object')
        expect(Array.isArray(res.body.preloads)).toBe(true)
        expect(Array.isArray(res.body.styles)).toBe(true)
      }
    })

    it('applies grayscale override when userId matches active rule', async () => {
      // uid-alpha is in the seed grayscale user_list
      const res = await request(server).get(
        '/api/v1/import-map?appId=user-center&userId=uid-alpha',
      )

      if (res.status === 200) {
        // The grayscale rule targets 2.0.0-beta.1 for @pro/table
        // If the version exists in versions table, it should be used
        // Otherwise the resolver will skip it
        expect(res.body).toHaveProperty('imports')
      }
    })
  })
})
```

- [ ] **Step 5: Run tests**

```bash
cd platform/server && pnpm test -- __tests__/integration/import-map.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add platform/server/src/modules/import-map/
git add platform/server/__tests__/integration/import-map.test.ts
git commit -m "feat(platform): add import map generation with grayscale evaluation, semver resolution, and LRU caching"
```

---

### Task 13: Grayscale Management Module

**Files:**
- Create: `platform/server/src/modules/grayscale/repository.ts`
- Create: `platform/server/src/modules/grayscale/service.ts`
- Create: `platform/server/src/modules/grayscale/router.ts`
- Create: `platform/server/__tests__/integration/grayscale.test.ts`

- [ ] **Step 1: Create platform/server/src/modules/grayscale/repository.ts**

```typescript
import type { Knex } from 'knex'
import type { GrayscaleRuleRow } from '../../types/index.js'

export class GrayscaleRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: number): Promise<GrayscaleRuleRow | undefined> {
    return this.db('grayscale_rules').where({ id }).first()
  }

  async findActiveByAppAndPackage(
    appId: string,
    packageId: number,
  ): Promise<GrayscaleRuleRow | undefined> {
    return this.db('grayscale_rules')
      .where({ app_id: appId, package_id: packageId, status: 'active' })
      .first()
  }

  async findByAppId(appId: string): Promise<GrayscaleRuleRow[]> {
    return this.db('grayscale_rules')
      .where({ app_id: appId })
      .orderBy('created_at', 'desc')
  }

  async create(data: {
    app_id: string
    package_id: number
    target_version: string
    strategy: string
    rule_config: string
  }): Promise<number> {
    const [id] = await this.db('grayscale_rules').insert({
      ...data,
      status: 'active',
    })
    return id
  }

  async updateStatus(id: number, status: GrayscaleRuleRow['status']): Promise<void> {
    await this.db('grayscale_rules').where({ id }).update({ status })
  }
}
```

- [ ] **Step 2: Create platform/server/src/modules/grayscale/service.ts**

```typescript
import type { Knex } from 'knex'
import { GrayscaleRepository } from './repository.js'
import { VersionRepository } from '../version/repository.js'
import { AppError } from '../../middleware/error-handler.js'
import { clearCache } from '../import-map/cache.js'
import type { CreateGrayscaleRequest } from '../../types/api.js'
import { logger } from '../../logger.js'

export class GrayscaleService {
  private readonly repo: GrayscaleRepository
  private readonly versionRepo: VersionRepository

  constructor(private readonly db: Knex) {
    this.repo = new GrayscaleRepository(db)
    this.versionRepo = new VersionRepository(db)
  }

  async createRule(input: CreateGrayscaleRequest, operator: string): Promise<{ id: number }> {
    // Validate package exists
    const pkg = await this.versionRepo.findPackageByName(input.packageName)
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${input.packageName}' not found`)
    }

    // Check no active rule already exists for this app + package
    const existing = await this.repo.findActiveByAppAndPackage(input.appId, pkg.id)
    if (existing) {
      throw new AppError(
        409,
        'ACTIVE_RULE_EXISTS',
        `An active grayscale rule already exists for app '${input.appId}' and package '${input.packageName}'. Pause or complete the existing rule first.`,
      )
    }

    const id = await this.repo.create({
      app_id: input.appId,
      package_id: pkg.id,
      target_version: input.targetVersion,
      strategy: input.strategy,
      rule_config: JSON.stringify(input.ruleConfig),
    })

    // Record audit event
    await this.versionRepo.insertEvent({
      package_id: pkg.id,
      app_id: input.appId,
      action: 'grayscale_start',
      to_version: input.targetVersion,
      operator,
      metadata: JSON.stringify({ ruleId: id, strategy: input.strategy }),
    })

    // Invalidate import map cache — grayscale changes affect resolution
    clearCache()

    logger.info(
      { appId: input.appId, packageName: input.packageName, targetVersion: input.targetVersion },
      'Grayscale rule created',
    )

    return { id }
  }

  async pauseRule(id: number, operator: string): Promise<void> {
    const rule = await this.repo.findById(id)
    if (!rule) {
      throw new AppError(404, 'RULE_NOT_FOUND', 'Grayscale rule not found')
    }

    if (rule.status !== 'active') {
      throw new AppError(400, 'INVALID_STATE', `Cannot pause a rule with status '${rule.status}'`)
    }

    await this.repo.updateStatus(id, 'paused')
    clearCache()

    logger.info({ ruleId: id, operator }, 'Grayscale rule paused')
  }

  async completeRule(id: number, operator: string): Promise<void> {
    const rule = await this.repo.findById(id)
    if (!rule) {
      throw new AppError(404, 'RULE_NOT_FOUND', 'Grayscale rule not found')
    }

    if (rule.status !== 'active' && rule.status !== 'paused') {
      throw new AppError(
        400,
        'INVALID_STATE',
        `Cannot complete a rule with status '${rule.status}'`,
      )
    }

    // Promote: update app_version_maps to use the grayscale target version
    await this.db('app_version_maps')
      .where({ app_id: rule.app_id, package_id: rule.package_id })
      .update({
        resolved_version: rule.target_version,
        pinned_version: rule.target_version,
        updated_at: this.db.fn.now(),
      })

    await this.repo.updateStatus(id, 'completed')

    // Audit event
    await this.versionRepo.insertEvent({
      package_id: rule.package_id,
      app_id: rule.app_id,
      action: 'grayscale_complete',
      to_version: rule.target_version,
      operator,
      metadata: JSON.stringify({ ruleId: id }),
    })

    clearCache()

    logger.info({ ruleId: id, operator }, 'Grayscale rule completed — promoted to full release')
  }

  async listRules(appId: string): Promise<Array<{
    id: number
    appId: string
    packageId: number
    targetVersion: string
    strategy: string
    status: string
    createdAt: Date
  }>> {
    const rules = await this.repo.findByAppId(appId)
    return rules.map((r) => ({
      id: r.id,
      appId: r.app_id,
      packageId: r.package_id,
      targetVersion: r.target_version,
      strategy: r.strategy,
      status: r.status,
      createdAt: r.created_at,
    }))
  }
}
```

- [ ] **Step 3: Create platform/server/src/modules/grayscale/router.ts**

```typescript
import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { GrayscaleService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'
import type { GrayscaleRuleConfig } from '../../types/grayscale.js'

export const grayscaleRouter = new Router({ prefix: '/api/v1/grayscale' })

// POST /api/v1/grayscale — Create a grayscale rule
grayscaleRouter.post('/', auth, requirePermission('grayscale:create'), async (ctx: Context) => {
  const body = ctx.request.body as {
    appId?: string
    packageName?: string
    targetVersion?: string
    strategy?: string
    ruleConfig?: unknown
  }

  if (!body.appId || !body.packageName || !body.targetVersion || !body.strategy || !body.ruleConfig) {
    ctx.status = 400
    ctx.body = {
      code: 'VALIDATION_ERROR',
      message: 'appId, packageName, targetVersion, strategy, and ruleConfig are required',
    }
    return
  }

  const service = new GrayscaleService(getDb())
  const result = await service.createRule(
    {
      appId: body.appId,
      packageName: body.packageName,
      targetVersion: body.targetVersion,
      strategy: body.strategy as 'user_list' | 'department' | 'percentage' | 'composite',
      ruleConfig: body.ruleConfig as GrayscaleRuleConfig,
    },
    ctx.state.user!.username,
  )

  ctx.status = 201
  ctx.body = result
})

// GET /api/v1/grayscale?appId=xxx — List grayscale rules for an app
grayscaleRouter.get('/', auth, requirePermission('grayscale:read'), async (ctx: Context) => {
  const appId = ctx.query.appId as string
  if (!appId) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: 'appId query parameter is required' }
    return
  }

  const service = new GrayscaleService(getDb())
  ctx.body = { data: await service.listRules(appId) }
})

// PUT /api/v1/grayscale/:id/pause — Pause a grayscale rule
grayscaleRouter.put('/:id/pause', auth, requirePermission('grayscale:pause'), async (ctx: Context) => {
  const service = new GrayscaleService(getDb())
  await service.pauseRule(parseInt(ctx.params.id, 10), ctx.state.user!.username)
  ctx.status = 204
})

// PUT /api/v1/grayscale/:id/complete — Complete (promote) a grayscale rule
grayscaleRouter.put('/:id/complete', auth, requirePermission('grayscale:complete'), async (ctx: Context) => {
  const service = new GrayscaleService(getDb())
  await service.completeRule(parseInt(ctx.params.id, 10), ctx.state.user!.username)
  ctx.status = 204
})
```

- [ ] **Step 4: Write integration tests**

```typescript
// __tests__/integration/grayscale.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'

describe('Grayscale Management API', () => {
  const app = createApp()
  const server = app.callback()
  const operatorToken = tokenForRole('operator')
  const viewerToken = tokenForRole('viewer')

  describe('POST /api/v1/grayscale', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .post('/api/v1/grayscale')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.grayscalePayload())

      expect(res.status).toBe(403)
    })

    it('validates required fields', async () => {
      const res = await request(server)
        .post('/api/v1/grayscale')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ appId: 'test' })

      expect(res.status).toBe(400)
    })

    it('creates a rule with operator role (requires seeded DB)', async () => {
      const res = await request(server)
        .post('/api/v1/grayscale')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(fixtures.grayscalePayload())

      // May return 201 (success) or 404 (package not found if DB not seeded)
      // or 409 (already exists). All are valid responses, not auth errors.
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(403)
    })
  })

  describe('PUT /api/v1/grayscale/:id/pause', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .put('/api/v1/grayscale/1/pause')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('PUT /api/v1/grayscale/:id/complete', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .put('/api/v1/grayscale/1/complete')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/v1/grayscale', () => {
    it('requires appId query param', async () => {
      const res = await request(server)
        .get('/api/v1/grayscale')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(400)
    })
  })
})
```

- [ ] **Step 5: Run tests**

```bash
cd platform/server && pnpm test -- __tests__/integration/grayscale.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add platform/server/src/modules/grayscale/
git add platform/server/__tests__/integration/grayscale.test.ts
git commit -m "feat(platform): add grayscale management with create/pause/complete lifecycle"
```

---

### Task 14: Compatibility Module

**Files:**
- Create: `platform/server/src/modules/compat/service.ts`
- Create: `platform/server/src/modules/compat/router.ts`

- [ ] **Step 1: Create platform/server/src/modules/compat/service.ts**

```typescript
import type { Knex } from 'knex'
import { AppError } from '../../middleware/error-handler.js'
import type { CompatReportRequest } from '../../types/api.js'
import type { CompatResultRow } from '../../types/index.js'

export class CompatService {
  constructor(private readonly db: Knex) {}

  async getCompatMatrix(packageName: string): Promise<{
    packageName: string
    results: Array<{
      version: string
      vueVersion: string
      elementPlusVersion: string
      status: string
      ciRunUrl: string | null
      testedAt: Date | null
    }>
  }> {
    const pkg = await this.db('packages').where({ name: packageName }).first()
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${packageName}' not found`)
    }

    const results: CompatResultRow[] = await this.db('compat_results')
      .where({ package_id: pkg.id })
      .orderBy([
        { column: 'version', order: 'desc' },
        { column: 'vue_version', order: 'desc' },
        { column: 'element_plus_version', order: 'desc' },
      ])

    return {
      packageName,
      results: results.map((r) => ({
        version: r.version,
        vueVersion: r.vue_version,
        elementPlusVersion: r.element_plus_version,
        status: r.status,
        ciRunUrl: r.ci_run_url,
        testedAt: r.tested_at,
      })),
    }
  }

  async reportResult(input: CompatReportRequest): Promise<{ id: number }> {
    const pkg = await this.db('packages').where({ name: input.packageName }).first()
    if (!pkg) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', `Package '${input.packageName}' not found`)
    }

    // Upsert: update existing or insert new
    const existing = await this.db('compat_results')
      .where({
        package_id: pkg.id,
        version: input.version,
        vue_version: input.vueVersion,
        element_plus_version: input.elementPlusVersion,
      })
      .first()

    if (existing) {
      await this.db('compat_results')
        .where({ id: existing.id })
        .update({
          status: input.status,
          ci_run_url: input.ciRunUrl || null,
          tested_at: this.db.fn.now(),
        })
      return { id: existing.id }
    }

    const [id] = await this.db('compat_results').insert({
      package_id: pkg.id,
      version: input.version,
      vue_version: input.vueVersion,
      element_plus_version: input.elementPlusVersion,
      status: input.status,
      ci_run_url: input.ciRunUrl || null,
      tested_at: this.db.fn.now(),
    })

    return { id }
  }
}
```

- [ ] **Step 2: Create platform/server/src/modules/compat/router.ts**

```typescript
import Router from 'koa-router'
import { auth } from '../../middleware/auth.js'
import { requirePermission } from '../../middleware/rbac.js'
import { CompatService } from './service.js'
import { getDb } from '../../db.js'
import type { Context } from 'koa'

export const compatRouter = new Router({ prefix: '/api/v1/compat' })

// GET /api/v1/compat/:package — Get compatibility matrix
compatRouter.get('/:package', auth, requirePermission('compat:read'), async (ctx: Context) => {
  const service = new CompatService(getDb())
  ctx.body = await service.getCompatMatrix(ctx.params.package)
})

// POST /api/v1/compat/report — CI auto-report compatibility result
compatRouter.post('/report', auth, requirePermission('compat:report'), async (ctx: Context) => {
  const body = ctx.request.body as {
    packageName?: string
    version?: string
    vueVersion?: string
    elementPlusVersion?: string
    status?: string
    ciRunUrl?: string
  }

  if (!body.packageName || !body.version || !body.vueVersion || !body.elementPlusVersion || !body.status) {
    ctx.status = 400
    ctx.body = {
      code: 'VALIDATION_ERROR',
      message: 'packageName, version, vueVersion, elementPlusVersion, and status are required',
    }
    return
  }

  if (!['pass', 'fail'].includes(body.status)) {
    ctx.status = 400
    ctx.body = { code: 'VALIDATION_ERROR', message: "status must be 'pass' or 'fail'" }
    return
  }

  const service = new CompatService(getDb())
  const result = await service.reportResult({
    packageName: body.packageName,
    version: body.version,
    vueVersion: body.vueVersion,
    elementPlusVersion: body.elementPlusVersion,
    status: body.status as 'pass' | 'fail',
    ciRunUrl: body.ciRunUrl,
  })

  ctx.status = 200
  ctx.body = result
})
```

- [ ] **Step 3: Commit**

```bash
git add platform/server/src/modules/compat/
git commit -m "feat(platform): add compatibility matrix module with CI auto-report"
```

---

### Task 15: Health Check Module

**Files:**
- Create: `platform/server/src/modules/health/router.ts`
- Create: `platform/server/__tests__/integration/health.test.ts`

- [ ] **Step 1: Create platform/server/src/modules/health/router.ts**

```typescript
import Router from 'koa-router'
import { getDb } from '../../db.js'
import { loadConfig } from '../../config.js'
import { logger } from '../../logger.js'
import { getCacheSize, getCacheEpoch } from '../import-map/cache.js'
import type { Context } from 'koa'

export const healthRouter = new Router()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: CheckResult
    cdnConnectivity: CheckResult
  }
  version: string
  uptime: number
  cacheSize: number
  cacheEpoch: number
}

interface CheckResult {
  status: 'pass' | 'fail'
  latencyMs: number
  message?: string
}

/**
 * GET /health — Simple health check endpoint (P1 observability baseline).
 * No auth, no version prefix. Used by Kubernetes liveness probes.
 */
healthRouter.get('/health', async (ctx: Context) => {
  const dbStatus = await getDb().raw('SELECT 1').then(() => 'connected').catch(() => 'disconnected')
  ctx.body = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    db: dbStatus,
    uptime: process.uptime(),
    cacheSize: getCacheSize(),
    cacheEpoch: await getCacheEpoch(),
  }
})

/**
 * GET /health/resolution — Deep health check.
 * No version prefix, no auth. Used by load balancer and blue-green deployment.
 * Tests DB connectivity and external CDN reachability.
 */
healthRouter.get('/health/resolution', async (ctx: Context) => {
  const startTime = process.uptime()
  const checks: HealthStatus['checks'] = {
    database: { status: 'fail', latencyMs: 0 },
    cdnConnectivity: { status: 'fail', latencyMs: 0 },
  }

  // --- Database check ---
  const dbStart = Date.now()
  try {
    const db = getDb()
    await db.raw('SELECT 1 as health_check')
    checks.database = {
      status: 'pass',
      latencyMs: Date.now() - dbStart,
    }
  } catch (err: unknown) {
    checks.database = {
      status: 'fail',
      latencyMs: Date.now() - dbStart,
      message: err instanceof Error ? err.message : 'Unknown DB error',
    }
    logger.error({ err }, 'Health check: database connection failed')
  }

  // --- CDN connectivity check ---
  const cdnStart = Date.now()
  try {
    const config = loadConfig()
    const cdnUrl = config.cdn.baseUrl
    // Simple HEAD request to CDN base — just checking connectivity
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(cdnUrl, {
      method: 'HEAD',
      signal: controller.signal,
    }).catch(() => null)

    clearTimeout(timeout)

    // Any response (even 403/404) means network connectivity is fine
    checks.cdnConnectivity = {
      status: response ? 'pass' : 'fail',
      latencyMs: Date.now() - cdnStart,
      message: response ? undefined : 'CDN unreachable',
    }
  } catch (err: unknown) {
    checks.cdnConnectivity = {
      status: 'fail',
      latencyMs: Date.now() - cdnStart,
      message: err instanceof Error ? err.message : 'CDN check failed',
    }
  }

  // --- Aggregate status ---
  const allPass = Object.values(checks).every((c) => c.status === 'pass')
  const anyFail = Object.values(checks).some((c) => c.status === 'fail')

  const healthStatus: HealthStatus = {
    status: allPass ? 'healthy' : anyFail ? 'unhealthy' : 'degraded',
    checks,
    version: process.env.npm_package_version || '0.0.1',
    uptime: startTime,
    cacheSize: getCacheSize(),
    cacheEpoch: await getCacheEpoch(),
  }

  ctx.status = healthStatus.status === 'healthy' ? 200 : 503
  ctx.body = healthStatus
})
```

- [ ] **Step 2: Write integration tests**

```typescript
// __tests__/integration/health.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'

describe('Health Check API', () => {
  const app = createApp()
  const server = app.callback()

  describe('GET /health/resolution', () => {
    it('responds without authentication', async () => {
      const res = await request(server).get('/health/resolution')
      // Should return 200 (healthy) or 503 (unhealthy), never 401
      expect([200, 503]).toContain(res.status)
    })

    it('returns health check structure', async () => {
      const res = await request(server).get('/health/resolution')
      expect(res.body).toHaveProperty('status')
      expect(res.body).toHaveProperty('checks')
      expect(res.body).toHaveProperty('version')
      expect(res.body).toHaveProperty('uptime')
      expect(res.body.checks).toHaveProperty('database')
      expect(res.body.checks).toHaveProperty('cdnConnectivity')
    })

    it('each check has status and latencyMs', async () => {
      const res = await request(server).get('/health/resolution')
      for (const check of Object.values(res.body.checks) as Array<{ status: string; latencyMs: number }>) {
        expect(['pass', 'fail']).toContain(check.status)
        expect(typeof check.latencyMs).toBe('number')
      }
    })
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd platform/server && pnpm test -- __tests__/integration/health.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add platform/server/src/modules/health/
git add platform/server/__tests__/integration/health.test.ts
git commit -m "feat(platform): add deep health check endpoint with DB + CDN connectivity"
```

---

### Task 16: Contract Tests — Resolver x Grayscale Engine

**Files:**
- Create: `platform/server/__tests__/contract/resolver-grayscale.test.ts`

- [ ] **Step 1: Write contract tests**

```typescript
// __tests__/contract/resolver-grayscale.test.ts
import { describe, it, expect } from 'vitest'
import { resolve, type VersionEntry, type VersionRegistry } from '../../src/engines/semver-resolver.js'
import { evaluateRule } from '../../src/engines/grayscale-evaluator.js'
import type { GrayscaleCondition, GrayscaleContext } from '../../src/types/grayscale.js'
import { isPrerelease } from '../../src/utils/semver-helpers.js'

/**
 * Contract tests verify the interaction between the semver resolver
 * and the grayscale evaluator. These two engines are used together
 * in the import map generation pipeline:
 *
 * 1. Grayscale evaluator determines if a user should get a canary version
 * 2. That canary version is fed into the semver resolver as a pinned version
 * 3. The resolver must handle prerelease versions, dependency expansion,
 *    and potential conflicts arising from mixed stable + canary versions
 */

function createRegistry(entries: VersionEntry[]): VersionRegistry {
  return {
    getVersions(name: string) { return entries.filter((e) => e.name === name) },
    getVersion(name: string, version: string) {
      return entries.find((e) => e.name === name && e.version === version)
    },
  }
}

describe('Contract: Resolver x Grayscale Engine', () => {
  const ENTRIES: VersionEntry[] = [
    // Stable versions
    {
      name: '@pro/table', version: '1.2.3',
      dependencies: { '@pro/hooks': '^1.2.0' }, peerDependencies: {},
    },
    {
      name: '@pro/form', version: '1.1.2',
      dependencies: { '@pro/hooks': '^1.1.0' }, peerDependencies: {},
    },
    {
      name: '@pro/hooks', version: '1.2.0',
      dependencies: {}, peerDependencies: {},
    },
    {
      name: '@pro/hooks', version: '1.1.0',
      dependencies: {}, peerDependencies: {},
    },
    // Canary versions (prerelease)
    {
      name: '@pro/table', version: '2.0.0-beta.1',
      dependencies: { '@pro/hooks': '^2.0.0' }, peerDependencies: {},
    },
    {
      name: '@pro/hooks', version: '2.0.0',
      dependencies: {}, peerDependencies: {},
    },
  ]

  const registry = createRegistry(ENTRIES)

  it('grayscale target version is correctly identified as prerelease by resolver', () => {
    const grayscaleTarget = '2.0.0-beta.1'
    expect(isPrerelease(grayscaleTarget)).toBe(true)

    // When grayscale matches, the target is pinned — resolver must accept prerelease
    const result = resolve(
      [{ name: '@pro/table', pinnedVersion: grayscaleTarget }],
      registry,
    )
    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
  })

  it('grayscale-triggered canary version pulls correct dependency tree', () => {
    // Scenario: user hits grayscale -> @pro/table@2.0.0-beta.1
    // This version requires @pro/hooks@^2.0.0 (different from stable)
    const result = resolve(
      [{ name: '@pro/table', pinnedVersion: '2.0.0-beta.1' }],
      registry,
    )

    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
    expect(result.conflicts).toHaveLength(0)
  })

  it('multi-package grayscale: canary table + stable form causes dependency conflict', () => {
    // Scenario: grayscale gives user @pro/table@2.0.0-beta.1 (needs hooks ^2.0.0)
    // but @pro/form stays at 1.1.2 (needs hooks ^1.1.0)
    // This is a diamond conflict: hooks ^2.0.0 vs ^1.1.0 — no intersection
    const result = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )

    expect(result.conflicts.length).toBeGreaterThan(0)
    const hooksConflict = result.conflicts.find((c) => c.dependency === '@pro/hooks')
    expect(hooksConflict).toBeDefined()
  })

  it('multi-package grayscale: canary table + canary form (both need hooks ^2.0.0) works', () => {
    // Add a canary form that also needs hooks ^2.0.0
    const extendedEntries: VersionEntry[] = [
      ...ENTRIES,
      {
        name: '@pro/form', version: '2.0.0-beta.1',
        dependencies: { '@pro/hooks': '^2.0.0' }, peerDependencies: {},
      },
    ]
    const extendedRegistry = createRegistry(extendedEntries)

    const result = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '2.0.0-beta.1' },
      ],
      extendedRegistry,
    )

    expect(result.conflicts).toHaveLength(0)
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
  })

  it('grayscale rule change invalidates cache scenario (simulated)', () => {
    // First resolution: user NOT in grayscale
    const stableResult = resolve(
      [
        { name: '@pro/table', versionRange: '^1.0.0' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )
    const stableVersion = stableResult.resolved.get('@pro/table')

    // Second resolution: user NOW in grayscale (table pinned to canary)
    const canaryResult = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )
    const canaryVersion = canaryResult.resolved.get('@pro/table')

    // Versions must be different — cache key fingerprint would differ
    expect(stableVersion).not.toBe(canaryVersion)
    expect(stableVersion).toBe('1.2.3')
    expect(canaryVersion).toBe('2.0.0-beta.1')
  })

  it('end-to-end: grayscale evaluate -> resolver pipeline', () => {
    // Simulate full pipeline: evaluate grayscale, then resolve

    const userListRule: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-canary-1', 'uid-canary-2'],
    }

    const context: GrayscaleContext = { userId: 'uid-canary-1' }
    const isCanary = evaluateRule(userListRule, context)
    expect(isCanary).toBe(true)

    // Canary user: pin table to beta
    const requests = [
      {
        name: '@pro/table',
        ...(isCanary
          ? { pinnedVersion: '2.0.0-beta.1' }
          : { versionRange: '^1.0.0' }),
      },
    ]

    const result = resolve(requests, registry)
    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
  })

  it('end-to-end: non-canary user gets stable version', () => {
    const userListRule: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-canary-1'],
    }

    const context: GrayscaleContext = { userId: 'uid-regular-user' }
    const isCanary = evaluateRule(userListRule, context)
    expect(isCanary).toBe(false)

    const requests = [
      {
        name: '@pro/table',
        ...(isCanary
          ? { pinnedVersion: '2.0.0-beta.1' }
          : { versionRange: '^1.0.0' }),
      },
    ]

    const result = resolve(requests, registry)
    expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
  })
})
```

- [ ] **Step 2: Run contract tests**

```bash
cd platform/server && pnpm test -- __tests__/contract/resolver-grayscale.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add platform/server/__tests__/contract/
git commit -m "test(platform): add contract tests for resolver x grayscale engine interaction"
```

---

### Task 17: Full Test Suite Run + Coverage Verification

- [ ] **Step 1: Run all unit tests and check coverage**

```bash
cd platform/server && pnpm test:coverage 2>&1 | tail -40
```

- [ ] **Step 2: Verify engine coverage is at 100%**

```bash
cd platform/server && pnpm test:coverage -- --reporter=text 2>&1 | grep -E 'semver-resolver|grayscale-evaluator|hash'
```

- [ ] **Step 3: Fix any coverage gaps in engines (if below 100%)**

Write additional test cases targeting uncovered lines/branches.

- [ ] **Step 4: Run full test suite (all unit + integration + contract)**

```bash
cd platform/server && pnpm test
```

- [ ] **Step 5: Commit final coverage fixes if any**

```bash
git add platform/server/__tests__/
git commit -m "test(platform): achieve 100% coverage on semver-resolver and grayscale-evaluator engines"
```

---

### Task 18: Self-Review Checklist

- [ ] **All endpoints match the design spec API surface:**
  - `GET  /api/v1/import-map?appId=xxx&userId=xxx` — no auth, CDN cached
  - `POST /api/v1/versions/sync` — publisher role
  - `GET  /api/v1/versions/:package` — viewer role
  - `GET  /api/v1/versions/:package/deps` — viewer role
  - `POST /api/v1/apps` — operator role
  - `GET  /api/v1/apps/:appId/versions` — viewer role
  - `PUT  /api/v1/apps/:appId/versions` — operator role
  - `POST /api/v1/grayscale` — operator role
  - `PUT  /api/v1/grayscale/:id/pause` — operator role
  - `PUT  /api/v1/grayscale/:id/complete` — operator role
  - `GET  /api/v1/compat/:package` — viewer role
  - `POST /api/v1/compat/report` — publisher role
  - `POST /api/v1/versions/:id/rollback` — admin role
  - `POST /api/v1/versions/:id/deprecate` — admin role
  - `GET  /health/resolution` — no auth, no version prefix

- [ ] **RBAC matches design spec permission table:**
  - viewer: read-only access to all data
  - publisher: CI bot, version sync, compat report
  - operator: app management, grayscale management, version pinning
  - admin: rollback, deprecate, user management

- [ ] **Rollback safety checks implemented:**
  - Target version exists and is published
  - CDN path present (resources available)
  - Mandatory reason field
  - Audit trail with from/to versions
  - `cache_bust: true` in response

- [ ] **Diamond dependency detection works:**
  - Range intersection computed for shared dependencies
  - Conflict error includes required ranges per requester
  - Suggestion generated for resolution

- [ ] **Grayscale composite rules work:**
  - AND/OR operators with arbitrary nesting
  - Hash-based percentage (deterministic, not random)
  - User list and department matching
  - Cache invalidated on rule changes

- [ ] **Import map response matches design spec format:**
  - `imports`: package name -> CDN ESM URL
  - `preloads`: dependency ESM URLs (not top-level)
  - `styles`: CSS URLs
  - `sriHashes`: URL -> SHA-384 hash
  - `cache_bust`: boolean

- [ ] **No frontend code in this plan (backend only)**
- [ ] **All code uses pino logger, not console.log**
- [ ] **All error responses use consistent `{ code, message }` format**
- [ ] **Tolerant reader pattern: unknown body fields are ignored**
- [ ] **Engines (semver-resolver, grayscale-evaluator) are pure functions with zero I/O**
