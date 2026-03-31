# Pro Components Design Spec

> Vue 3 + Element Plus higher-level component library with CDN distribution and version management platform.

## 1. Project Overview

### Goals

- Build ProTable, ProForm, ProDescriptions on top of Element Plus
- Headless-first architecture: composables manage state, components manage rendering
- Dual distribution: npm packages + CDN via Import Maps (hot-update without rebuild)
- Version management platform: grayscale release, dependency resolution, compatibility matrix

### Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Vue 3 + Element Plus |
| Monorepo | Turborepo + pnpm workspace |
| Build | Rollup → ESM / CJS / UMD |
| Docs | VitePress + vitepress-plugin-demo |
| Testing | Vitest + Vue Test Utils + Cypress Component Testing |
| Publish | Changesets |
| CDN | ESM CDN + Import Maps + es-module-shims polyfill |
| Platform | Koa.js + MySQL (API) + Vue 3 + Element Plus (Dashboard) |

### Target Users

Internal teams first, later open to other teams in the company. API design must be general-purpose, not hard-coded to specific business logic.

---

## 2. Project Structure

```
pro-components/
├── packages/
│   ├── pro-table/            # @pro/table
│   ├── pro-form/             # @pro/form
│   ├── pro-descriptions/     # @pro/descriptions
│   ├── hooks/                # @pro/hooks (useRequest, usePagination...)
│   ├── utils/                # @pro/utils (type guards, formatters)
│   ├── resolvers/            # @pro/resolvers (unplugin auto-import)
│   ├── themes/               # @pro/themes (token system, CSS variables)
│   └── pro-components/       # @pro/pro-components (aggregation package)
├── cdn/
│   ├── server/               # CDN static asset service (Nginx + version routing)
│   └── build/                # ESM/UMD CDN build scripts
├── platform/
│   ├── web/                  # Dashboard (Vue 3 + Element Plus)
│   └── server/               # API (Koa + MySQL)
├── docs/                     # VitePress documentation site
├── playground/               # Vite app for integration debugging
├── e2e/                      # Cypress Component Testing
├── scripts/                  # Build / publish / codegen scripts
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Package Architecture

### Dependency Direction (unidirectional, no cycles)

```
pro-components (aggregation)
  ├── pro-table       ─┐
  ├── pro-form        ─┤── all depend on → hooks, utils, themes
  └── pro-descriptions─┘
                         hooks  ── depends on → utils
                         themes ── independent
                         resolvers ── independent (name mapping only)
```

### Per-Component Package Structure

```
packages/pro-table/
├── src/
│   ├── components/         # Sub-components (SearchForm, ToolBar, ColumnSetting...)
│   ├── composables/        # Component-private composables
│   ├── types/              # Type definitions
│   ├── constants/
│   ├── ProTable.vue        # Main component
│   └── index.ts            # Export entry
├── __tests__/              # Vitest unit + integration tests
├── demos/                  # VitePress demo .vue files
├── package.json
├── rollup.config.ts
└── tsconfig.json
```

### Package Exports Strategy

```jsonc
{
  "name": "@pro/table",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./style": "./dist/style/index.css"
  },
  "sideEffects": ["dist/style/**"],
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

### Key Decisions

- **Vue and Element Plus as peerDependencies** — not bundled, provided by consumer, avoids multi-instance issues
- **CSS exported separately** — JS and styles decoupled, supports full or on-demand import and theme customization
- **Three output formats** — ESM (modern bundlers), CJS (legacy toolchains), UMD (CDN script loading)
- **sideEffects annotation** — only style files have side effects, ensures tree-shaking safety
- **Internal packages external** — `@pro/*` packages don't bundle each other in ESM/CJS builds; UMD bundles everything except Vue/Element Plus

### Version Mismatch Mitigation

1. **Strict peer version ranges** — only declare tested minimum versions
2. **Runtime version check** — warn at install time if consumer's Vue/Element Plus version is below minimum
3. **CI matrix testing** — test against multiple version combinations
4. **Compatibility matrix in Dashboard** — visual status of tested/untested/broken combos

---

## 4. Component API Design

### Core Principle: Headless-First

Every component is split into:
- **Composable** (`useProTable`) — manages all state and logic
- **Component** (`ProTable`) — renders UI based on composable state

Two usage modes:
- **Simple mode**: `<ProTable :columns="cols" :request="fn" />` — component auto-creates composable internally
- **Composable mode**: consumer creates `useProTable()`, passes `proTableProps` to component for full state control

Detection via provide/inject — component checks if an external composable instance exists, uses it if found, otherwise creates its own.

### ProTable Props

```typescript
interface ProTableProps<T = Record<string, any>> {
  // Data source (choose one)
  request?: (params: RequestParams) => Promise<RequestResult<T>>
  data?: T[]
  loading?: boolean

  // Schema-driven
  columns: ProColumnDef<T>[]

  // Search form
  search?: boolean | SearchConfig
  initialValues?: Record<string, any>

  // Toolbar
  toolbar?: ToolbarConfig
  headerTitle?: string | VNode
  toolbarActions?: VNode[]

  // Pagination
  pagination?: false | PaginationConfig

  // Row selection
  rowSelection?: RowSelectionConfig<T>

  // Extension
  tableProps?: Partial<ElTableProps>
  beforeRequest?: (params: RequestParams) => RequestParams
  afterResponse?: (raw: any) => RequestResult<T>
}
```

### useProTable Composable

```typescript
const {
  proTableProps,        // bind to <ProTable />
  dataSource,           // Ref<T[]>
  loading,              // Ref<boolean>
  pagination,           // Reactive pagination state
  formValues,           // Ref<Record<string, any>>
  selectedRows,         // Ref<T[]>
  selectedRowKeys,      // Ref<string[]>
  clearSelection,       // () => void
  sortState,            // Ref<SortState | null>
  filterState,          // Ref<Record<string, any>>
  reload,               // (resetPage?: boolean) => Promise<void>
  reset,                // () => void
  setFormValues,        // (values: Partial<FormValues>) => void
  setDataSource,        // (data: T[]) => void
  insertRow,            // (row: T, index?: number) => void
  updateRow,            // (key: string, row: Partial<T>) => void
  deleteRow,            // (key: string) => void
} = useProTable({ columns, request, rowKey: 'id', defaultPageSize: 20 })
```

### ProColumnDef — One Schema Drives Three Scenarios

```typescript
interface ProColumnDef<T = any> {
  dataIndex: keyof T | string     // supports nested 'user.name'
  title: string
  key?: string

  // ValueType — determines rendering + search control + formatting
  valueType?: ValueType
  valueEnum?: Record<string, { text: string; status?: StatusType }>

  // Table column behavior
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  ellipsis?: boolean
  copyable?: boolean
  render?: (row: T, index: number) => VNode

  // Search form behavior
  hideInSearch?: boolean
  hideInTable?: boolean
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: any
    rules?: FormRule[]
    render?: () => VNode
  }

  // ProDescriptions behavior
  hideInDescriptions?: boolean
  descriptionsRender?: (value: any, row: T) => VNode
}
```

### ValueType System

| ValueType | Table Rendering | Search Control |
|-----------|----------------|----------------|
| text | Plain text | el-input |
| number | Formatted number | el-input-number |
| select | Tag display | el-select |
| date | Formatted date | el-date-picker |
| dateRange | — | el-date-picker range |
| dateTime | Date with time | el-date-picker datetime |
| switch | Switch status | el-switch |
| radio | Tag | el-radio-group |
| checkbox | Tags | el-checkbox-group |
| textarea | Text | el-input textarea |
| money | Currency format | el-input-number |
| percent | Percentage | el-input-number |
| progress | el-progress | — |
| image | el-image | — |
| code | Code block | — |

### ProForm

```typescript
interface ProFormProps {
  layout?: 'horizontal' | 'vertical' | 'inline'
  fields: ProFieldDef[]
  initialValues?: Record<string, any>
  onSubmit?: (values: Record<string, any>) => Promise<boolean>
  formProps?: Partial<ElFormProps>
}

// Higher-order form variants via composable + wrapper:
// ModalForm, DrawerForm, StepsForm, QueryFilter
```

ProForm's `ProFieldDef` shares the `valueType` system with ProTable, rendering logic reused via hooks package.

### ProDescriptions

Reuses the same `columns` definition from ProTable:

```vue
<ProDescriptions :columns="columns" :data="currentUser" />
```

Renders detail view based on `hideInDescriptions`, `valueType`, and `descriptionsRender`.

---

## 5. Rollup Build System

### Shared Config Architecture

```
scripts/
├── rollup.base.ts          # Shared build config
├── build.ts                # Build orchestration
└── gen-dts.ts              # dts generation (vue-tsc + rollup-plugin-dts)
```

### Build Output Per Package

```
dist/
├── esm/
│   ├── index.mjs
│   └── [chunks].mjs
├── cjs/
│   └── index.js
├── umd/
│   ├── index.js
│   └── index.min.js
├── types/
│   └── index.d.ts          # Bundled type declarations
└── style/
    ├── index.css            # Full styles
    └── components/          # Per-component split styles
```

### Key Build Strategies

- **ESM/CJS**: external all `@pro/*` internal packages + peerDependencies, CSS extracted to separate files
- **UMD**: only external Vue + Element Plus, bundle internal deps (no bundler to resolve them in CDN/script scenario), CSS injected into JS
- **dts**: `vue-tsc` generates raw `.d.ts`, `rollup-plugin-dts` bundles into single file to avoid leaking internal paths
- **Turborepo orchestration**: `"dependsOn": ["^build"]` ensures topological build order (utils → hooks → components), with caching

### Build Output Validation (CI)

- No Vue runtime bundled in any package (scan dist for `createApp`/`defineComponent`)
- `package.json` exports fields point to existing files
- `.d.ts` type declarations exist in `dist/types/`
- ESM output is valid ES modules (acorn parse)
- `sideEffects` configuration matches actual side effects
- CSS output files generated correctly

---

## 6. CDN Distribution + Import Maps

### Architecture

```
Consumer → pro-loader.js → fetch /api/import-map (CDN edge cached)
  → inject import map (via es-module-shims) → modulepreload → CSS injection
  → register Service Worker → import(appEntry)
```

### Import Map API Response

```json
{
  "imports": {
    "@pro/table": "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs",
    "@pro/form": "https://cdn.internal/@pro/form/1.1.2/esm/index.mjs",
    "@pro/hooks": "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "@pro/utils": "https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs",
    "vue": "https://cdn.internal/vue/3.5.0/dist/vue.esm-browser.prod.js",
    "element-plus": "https://cdn.internal/element-plus/2.9.0/dist/index.full.mjs"
  },
  "preloads": [
    "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs"
  ],
  "styles": [
    "https://cdn.internal/element-plus/2.9.0/dist/index.css",
    "https://cdn.internal/@pro/table/1.2.3/style/index.css",
    "https://cdn.internal/@pro/form/1.1.2/style/index.css"
  ],
  "sriHashes": {
    "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs": "sha384-abc123...",
    "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs": "sha384-def456..."
  },
  "cache_bust": false
}
```

### pro-loader.js

Consumer integration — single script tag:

```html
<script>window.__PRO_USER_ID__ = 'dorian'</script>
<script src="https://cdn.internal/pro-loader@1.js?appId=user-center" data-pro-entry="/src/main.ts"></script>
```

Loader handles:
1. Import `es-module-shims` (polyfill for dynamic import map injection)
2. Fetch import map from API (with CDN edge cache: `max-age=60, stale-while-revalidate=300`)
3. Fallback chain on failure: API → SW cache → localStorage → hardcoded fallback → inline error page with retry
4. Inject import map + modulepreload links + CSS links (with SRI integrity attributes)
5. Register/update Service Worker for offline fallback
6. `import(appEntry)` to bootstrap application

Loader itself is versioned: `/pro-loader@1.js`, with `@latest` redirect. Changes must be backward compatible.

### Import Map Generation Logic

```
Request: appId=user-center, userId=dorian
  1. Query app_version_maps → base version mapping
  2. Query grayscale_rules → user hits canary? Replace version
  3. Semver resolve → ranges to exact versions
  4. Dependency tree expansion → recursive resolve, dedupe shared deps
  5. Diamond dependency check → range intersection, conflict error if incompatible
  6. Generate import map + modulepreload + CSS links + SRI hashes
  7. Cache result (key: appId + userId + version fingerprint)
```

### CDN Caching Strategy

- **Immutable resources**: URLs include version + content hash, `Cache-Control: immutable, max-age=31536000`
- **API responses**: `max-age=60, stale-while-revalidate=300`, CDN edge cached
- **Loader script**: short cache for `@latest`, long cache for versioned (`@1`)

### Dev/Prod Alignment

Official Vite plugin `@pro/vite-plugin`:
- Excludes Vue, Element Plus, `@pro/*` from Vite's `optimizeDeps` pre-bundling
- Ensures dev mode module boundaries match CDN prod mode
- Prevents `inject() can only be used inside setup()` bugs caused by module boundary mismatch

### CORS

- CDN static assets: `Access-Control-Allow-Origin: *`
- API: whitelisted domains with `credentials: include` support

---

## 7. Version Management Platform

### Architecture

```
platform/
├── web/                    # Dashboard (Vue 3 + Element Plus)
│   └── views/
│       ├── app-manage/     # Business app management
│       ├── version-map/    # Version mapping configuration
│       ├── publish/        # Publish management & grayscale
│       ├── compat-matrix/  # Compatibility matrix
│       └── changelog/      # Changelog viewer
└── server/                 # API (Koa + MySQL)
    └── modules/
        ├── app/            # App CRUD
        ├── version/        # Version management & dependency resolution
        ├── import-map/     # Import map generation & caching
        ├── grayscale/      # Grayscale strategy engine
        └── sync/           # npm publish → CDN sync
```

### Data Model

```sql
-- Package registry
CREATE TABLE packages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  latest_version VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Version records
CREATE TABLE versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT NOT NULL,
  version VARCHAR(32) NOT NULL,
  dependencies JSON,
  peer_dependencies JSON,              -- semver ranges for conflict detection
  cdn_path VARCHAR(256),
  changelog TEXT,
  breaking_changes JSON,
  sri_hashes JSON,                     -- {"esm/index.mjs": "sha384-abc..."}
  status ENUM('published', 'deprecated', 'yanked') DEFAULT 'published',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (package_id, version)
);

-- Business apps
CREATE TABLE apps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128),
  owner VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Version mappings (which version each app uses)
CREATE TABLE app_version_maps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL,
  package_id BIGINT NOT NULL,
  pinned_version VARCHAR(32),
  version_range VARCHAR(32),
  resolved_version VARCHAR(32),
  updated_at TIMESTAMP,
  UNIQUE KEY (app_id, package_id)
);

-- Grayscale rules
CREATE TABLE grayscale_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL,
  package_id BIGINT NOT NULL,
  target_version VARCHAR(32) NOT NULL,
  strategy ENUM('user_list', 'department', 'percentage', 'composite') NOT NULL,
  rule_config JSON,                    -- supports AND/OR composite rules
  status ENUM('active', 'paused', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compatibility test results
CREATE TABLE compat_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT NOT NULL,
  version VARCHAR(32) NOT NULL,
  vue_version VARCHAR(32) NOT NULL,
  element_plus_version VARCHAR(32) NOT NULL,
  status ENUM('pass', 'fail', 'untested') DEFAULT 'untested',
  ci_run_url VARCHAR(256),
  tested_at TIMESTAMP
);

-- Audit trail
CREATE TABLE version_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  package_id BIGINT,
  app_id VARCHAR(64),
  action ENUM('publish', 'pin', 'upgrade', 'rollback', 'deprecate',
              'grayscale_start', 'grayscale_complete') NOT NULL,
  from_version VARCHAR(32),
  to_version VARCHAR(32),
  operator VARCHAR(64) NOT NULL,
  reason TEXT,                         -- mandatory for rollback
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC
CREATE TABLE platform_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  role ENUM('viewer', 'publisher', 'operator', 'admin') NOT NULL,
  api_key_hash VARCHAR(256),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### RBAC Permissions

| Role | Permissions |
|------|-------------|
| viewer | View versions, compat matrix, import maps |
| publisher | CI bot, publish new versions |
| operator | Grayscale management, version mapping changes |
| admin | Rollback, deprecate versions, user management |

### Core APIs

All API endpoints are versioned (`/api/v1/`). Tolerant reader pattern: unknown fields are ignored, not rejected.

```
# Import Map (consumer-facing, CDN edge cached)
GET  /api/v1/import-map?appId=xxx&userId=xxx

# Version Management
POST /api/v1/versions/sync              # npm publish hook
GET  /api/v1/versions/:package
GET  /api/v1/versions/:package/deps     # full dependency tree

# App Management
POST /api/v1/apps
GET  /api/v1/apps/:appId/versions
PUT  /api/v1/apps/:appId/versions

# Grayscale
POST /api/v1/grayscale
PUT  /api/v1/grayscale/:id/pause
PUT  /api/v1/grayscale/:id/complete     # promote to full release

# Compatibility
GET  /api/v1/compat/:package
POST /api/v1/compat/report              # CI auto-report

# Operations
POST /api/v1/versions/:id/rollback
POST /api/v1/versions/:id/deprecate
GET  /api/v1/apps/:id/resolution-graph  # debug dependency resolution
GET  /health/resolution                 # deep health check (no version prefix)
```

### Diamond Dependency Resolution

```
1. Collect all peer dependency ranges from requested packages
2. For each shared dependency, compute range intersection
3. Intersection exists → select latest satisfying version
4. No intersection → return conflict error with suggestion:
   { conflict: "element-plus",
     required: { "@pro/table@2.0": "^2.4.0", "@pro/form@1.5": ">=2.2.0 <2.4.0" },
     suggestion: "Upgrade @pro/form to 2.0" }
```

### Grayscale Rules (Composite Support)

```json
{
  "operator": "OR",
  "conditions": [
    { "type": "user_list", "values": ["uid1", "uid2"] },
    { "operator": "AND", "conditions": [
      { "type": "department", "values": ["dept_a"] },
      { "type": "percentage", "value": 50, "hash_key": "user_id" }
    ]}
  ]
}
```

Percentage-based rules use hash (not random) for deterministic user assignment.

### CDN Publish State Machine

```
npm publish hook →
  uploading     → Upload dist to CDN storage + calculate SHA-384 hashes
  propagating   → Wait for CDN global sync (poll 3+ edge PoPs)
  verifying     → Smoke test from edge: load artifact, verify hash, check exports
  active        → Update API version mapping (LAST step)
  failed        → Rollback, cleanup, notify publisher
```

Version mapping update is always the LAST step. No "API points to files CDN doesn't have yet."

If propagation times out: mark as `propagating`, do NOT block npm publish side, trigger alert for manual intervention.

### Rollback Safety

- Rollback also goes through grayscale — internal traffic first, then full rollback
- Pre-rollback automated check: target version CDN resources still exist? SRI hash matches?
- API response includes `cache_bust: true` — loader detects and clears SW cache
- Audit log with mandatory reason field
- CDN retention: keep last 3 major versions + all versions referenced by active apps

### Platform Deployment (Independent)

- Platform has its own CI/CD pipeline, separate from component library release
- Blue-green deployment with deep health check (DB + Redis + CDN storage connectivity)
- Database migrations via Knex/Drizzle, expand-contract pattern
- API versioned: `/api/v1/`, `/api/v2/` — tolerant reader pattern for unknown fields
- Component library release calls Platform API as fire-and-forget + retry, not blocking

---

## 8. Testing Strategy

### Three-Layer Testing

```
Layer 3: E2E (Cypress Component Testing)
  → Real browser, user interaction paths, cross-component flows

Layer 2: Integration (Vitest + Vue Test Utils)
  → Component mount, props/slots/events, composable integration

Layer 1: Unit (Vitest)
  → Pure logic: hooks, utils, semver resolver, grayscale engine
```

### Coverage Targets

| Layer | Target | Scope |
|-------|--------|-------|
| Unit (hooks/utils) | >= 90% | Pure logic, easy to test |
| Unit (version resolver/grayscale engine) | 100% | Core path, zero tolerance |
| Integration (components) | >= 80% | All props/events/slots combinations |
| E2E | Critical paths 100% | Not coverage %, but path completeness |

### Testing Infrastructure

- **Teleport stub**: `config.global.stubs = { teleport: true }` — prevents false green in ModalForm/DrawerForm tests
- **provide/inject fallback tests**: verify components don't crash when used outside provider, give meaningful warnings
- **`waitForReactiveSettle()` helper**: wraps multiple `nextTick()` cycles for watch chain completion
- **es-module-shims in test env**: for CDN distribution chain integration tests

### Dual-Mode Boundary Tests (Controlled vs Request)

- `data` and `request` both passed — priority behavior
- Controlled mode: external `data` change → pagination/sort state reset
- Request mode: rapid `params` changes → debounce/cancel, no race condition
- Runtime mode switch (prop change from request to controlled) → state consistency

### Composable Combination Tests

- `deleteRow` → pagination auto-adjusts (was on last page with 1 item)
- Row selection persistence/clearing across page changes
- `useProTable` internal composable interaction: `usePagination` + `useRequest` + `useSelection` coordination

### CDN Distribution Chain Integration Test

Using Vitest browser mode or Playwright:
- Inject import map → `import('@pro/table')` → verify component renders
- Simulate CDN failure → verify fallback chain (SW cache → localStorage → error page)
- Tampered CDN file → verify SRI rejection

### Version Resolver x Grayscale Engine Contract Tests

- Grayscale points to prerelease version → resolver correctly identifies as prerelease
- Grayscale rule change → cached resolution results invalidated
- Multi-package grayscale conflict (ProTable canary needs ProForm canary) → resolver handles

### Compatibility Matrix

- **PR**: 2 combos only — latest + minimum supported version
- **Release/Nightly**: full matrix (Vue 3.4/3.5/latest x Element Plus 2.9/2.10/latest)
- Results auto-reported to Platform API
- Pairwise testing to reduce combination explosion as packages grow

### Build Output Validation

- No Vue runtime bundled (AST scan of dist imports)
- `package.json` exports point to existing files
- `.d.ts` type declarations exist
- ESM output is valid ES modules
- SRI hashes match
- `sideEffects` configuration accurate
- CSS output files generated

---

## 9. Documentation (VitePress)

### Structure

```
docs/
├── .vitepress/
│   ├── config.ts
│   └── theme/index.ts       # Register Element Plus + Pro Components
├── guide/
│   ├── introduction.md
│   ├── getting-started.md
│   ├── cdn-mode.md           # CDN + Import Maps integration guide
│   └── migration.md
├── components/
│   ├── pro-table.md
│   ├── pro-form.md
│   └── pro-descriptions.md
├── composables/
│   ├── use-pro-table.md
│   ├── use-pro-form.md
│   └── use-pro-descriptions.md
├── platform/
│   ├── overview.md
│   ├── grayscale.md
│   └── api-reference.md
└── changelog.md              # Auto-generated from changesets
```

### Component Doc Standard

Each component page must include:
- One-line description
- Interactive demos via `vitepress-plugin-demo` (basic, request mode, composable mode, controlled mode, search, valueTypes, toolbar)
- Slots table
- API: Props, Events, Composable Returns, Type Definitions

### API Doc Auto-Generation

`vue-component-meta` (Volar) extracts Props/Events/Slots from TypeScript interfaces → generates `api.json` → VitePress renders as tables. CI check: `api.json` changed but `.md` not updated → fail.

### Demo Files

Demo `.vue` files live in each component package's `demos/` directory. VitePress references them directly. Demos are TypeScript-checked, doubling as development playground.

---

## 10. CI/CD Pipeline

### PR Pipeline

```
lint (ESLint + Prettier + vue-tsc)
  → build (turbo build, topological)
  → validate-build (externals, ESM validity, dts, sideEffects, CSS)
  → test (Vitest unit/integration + Cypress critical paths)
  → compat-quick (2 combos: latest + minimum)
  → security (pnpm audit + license check)
  → docs-build (verify compilation)
  → preview deploy (VitePress preview + pkg-pr-new temporary package)
  → summary (bundle size diff + test results → PR comment)
```

### Release Pipeline

```
changesets detect → "Version Packages" PR → merge triggers:
  1. Full build + test
  2. npm publish (changeset publish, idempotent: check if version exists first)
  3. CDN sync (state machine: upload → propagate → verify → active)
     - Async, does NOT block npm publish
     - Timeout → mark propagating, alert, manual intervention
  4. Platform API notification (fire-and-forget + retry, not blocking)
  5. Docs deploy (after npm publish success)
  6. Notification (WeChat/Slack/email: version, changelog, breaking changes, compat status)
```

### Nightly Pipeline

```
- Full compat matrix (all version combinations)
- CDN health check (all active versions accessible, SRI hash consistency)
- Security scan (pnpm audit + peer dependency breaking change detection)
- Secrets expiration check
```

### Secrets Management

- GitHub Actions environment secrets + environment protection rules
- npm: granular access tokens scoped to specific packages
- CDN: OIDC federation (GitHub Actions → AWS STS / Alibaba Cloud STS), no long-lived credentials
- 90-day rotation policy, nightly check for expiration

### Changesets Strategy

- Component packages (`@pro/table`, `@pro/form`, `@pro/descriptions`): `fixed` group, same version number
- Internal packages (`@pro/hooks`, `@pro/utils`, `@pro/resolvers`, `@pro/themes`): published to internal npm registry (required as dependencies of component packages), but not promoted as user-facing — version bumps are automatic when consumed packages change, no independent changeset required
- Aggregation package (`@pro/pro-components`): auto-bumps when any component package bumps

### Turborepo CI Configuration

```jsonc
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    },
    "build:dts": {
      "dependsOn": ["build"],
      "outputs": ["dist/types/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": [],
      "cache": false
    }
  }
}
```

Remote cache: enabled for CI, isolated from local dev cache. Test tasks cached with caution (flaky test detection via `--retry`).

### Pipeline Idempotency

- npm publish: check `npm view <pkg>@<version>` before publish
- CDN upload: content-addressable paths (hash-based), naturally idempotent
- Entire pipeline safe to re-run after partial failure

### Rollback Flow

```
Dashboard "Rollback" →
  1. Pre-check: target version CDN resources exist? SRI hash valid?
  2. Rollback goes through grayscale (internal traffic first)
  3. Update app_version_maps
  4. API response includes cache_bust: true → loader clears SW cache
  5. Record version_events (mandatory reason field)
  6. Notification: rollback executed, impact scope
```

---

## 11. Deferred Items (P2)

The following items are acknowledged but deferred to future iterations:

- Observability: metrics, alerts, audit logs visualization, tracing
- Grayscale automatic health check (error rate comparison, auto-rollback)
- Chaos testing (CDN timeout, API 500, malformed import map)
- Composable state machine exhaustive testing
- Turborepo remote cache tuning
- UMD format evaluation (keep or drop)
- Release pipeline SLO optimization
- Visual regression testing (Chromatic/Percy)
