# Agent Orchestration Guide

> How to execute all implementation plans using multi-agent parallel execution.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  COORDINATOR                     │
│         (Main conversation thread)               │
│                                                  │
│  Responsibilities:                               │
│  - Dispatch implementer agents per phase         │
│  - Monitor completion, handle timeouts           │
│  - Dispatch reviewer after each phase            │
│  - Gate phase transitions (phase N done → N+1)   │
│  - Resolve cross-agent conflicts                 │
│  - Final integration verification                │
└──────────┬───────────────────┬───────────────────┘
           │                   │
    ┌──────▼──────┐    ┌──────▼──────┐
    │ IMPLEMENTER │    │  REVIEWER   │
    │  (per plan) │    │ (per phase) │
    │             │    │             │
    │ - Read plan │    │ - git diff  │
    │ - Write code│    │ - Standards │
    │ - Run tests │    │ - Spec check│
    │ - Commit    │    │ - Fix issues│
    └─────────────┘    └─────────────┘
```

## Phase Execution

### Phase 1: Foundation

**Mode**: Single agent (sequential)
**Estimated tasks**: 14
**Dependencies**: None

```
Coordinator prompt:

You are executing Phase 1 of the pro-components project.

IMPORTANT PREREQUISITES:
- Verify Node.js >= 18 and pnpm >= 9 before starting (node -v, pnpm -v)
- IGNORE hard-coded paths in the plan — use the actual working directory

1. Read the plan: docs/superpowers/plans/2026-03-31-plan-1-monorepo-foundation.md
2. Read the project CLAUDE.md for code standards
3. Execute all 14 tasks sequentially
4. Apply code standards fixes as you implement (the plan has known violations — see below)
5. After each task: run relevant validation, commit

Known violations to fix during implementation:
- ESLint: flat config format (eslint.config.js), NOT .eslintrc.cjs (ESLint 9+ requires flat config)
- ESLint mandatory rules: @typescript-eslint/no-explicit-any: error, @typescript-eslint/consistent-type-imports: error, @typescript-eslint/no-floating-promises: error, prefer-const: error, no-var: error, eqeqeq: [error, always], max-lines: [error, { max: 400 }], max-lines-per-function: [error, { max: 50 }], max-params: [error, { max: 4 }], complexity: [error, { max: 10 }], max-depth: [error, { max: 4 }], no-console: error
- Replace all `any` with `unknown` or specific types
- Remove all `export default` from .ts files
- Remove commented-out code
- Add JSDoc to all exported functions/interfaces
- createRollupConfig: split into createEsmConfig/createCjsConfig/createUmdConfig (under 50 lines each)
- validate-build.ts: add CSS output validation (verify .css files exist in dist/style/)
- version-check.ts: use logger wrapper instead of console.warn
- Add acorn to root devDependencies (needed for AST validation in build scripts)
- Fix changesets config: update placeholder repo name to actual repository name
- Fix .changeset/config.json "linked" and "fixed" groups to match actual package names

After all tasks complete, run full verification:
  pnpm build && pnpm type-check && pnpm lint && pnpm validate-build
```

**Phase 1 completion gate**: All packages build successfully, type-check passes, lint passes.

---

### Phase 2: Core Components + Platform (Parallel)

**Mode**: 4 agents in parallel
**Dependencies**: Phase 1 must be complete

**IMPORTANT**: Before dispatching Phase 2 agents, the coordinator must verify Phase 1 is complete:
```bash
pnpm build       # all packages build
pnpm type-check  # no TS errors
pnpm lint        # no lint errors
```

#### Agent 2a: Hooks + ProTable

```
Coordinator dispatch prompt:

You are Implementer Agent 2a. Your scope is @pro/hooks and @pro/table.

1. Read: docs/superpowers/plans/2026-03-31-plan-2a-hooks-and-protable.md
2. Read: CLAUDE.md for code standards
3. Execute all 16 tasks in order
4. You own: packages/hooks/, packages/pro-table/, packages/utils/ (type additions only)
5. DO NOT touch: packages/pro-form/, packages/pro-descriptions/, platform/, cdn/, docs/

Known violations to fix:
- ALL generic defaults `T = any` → `T = unknown`
- ALL `Record<string, any>` → `Record<string, unknown>` or specific interface
- ProTable.vue: must stay under 400 lines. Split internal logic into useProTableInternal composable
- ProTable.vue script setup: split into composables, keep setup under 50 lines of orchestration
- Remove `export default ProTable` from index.ts, named export only
- Test utilities: do NOT export from @pro/hooks main entry. Use separate export path `@pro/hooks/test-utils`
- ToolBar.vue: don't use array index as v-for key
- Magic numbers: extract DEFAULT_PAGE_SIZE, DEFAULT_LABEL_WIDTH etc to named constants (no magic numbers/strings)
- Boolean props: use is/has/can/should prefix (ellipsis → isEllipsis, copyable → isCopyable, or document exemption)
- All test files: use .test.ts not .spec.ts

CRITICAL cross-plan dependency:
- useValueType MUST export CONTROL_REGISTRY map for Plan 2b (ProForm) reuse — ProFormField imports this registry instead of implementing its own control switch
- ColumnSetting: add optional `persistKey` prop for localStorage persistence of column visibility/order

Additional:
- Add ProRequestError structured error type (extends Error, includes statusCode, response body)
- Verify all catch blocks use (error: unknown) + instanceof narrowing

After completion: pnpm --filter @pro/hooks test && pnpm --filter @pro/table test && pnpm build
```

#### Agent 2b: ProForm + ProDescriptions

```
Coordinator dispatch prompt:

You are Implementer Agent 2b. Your scope is @pro/form and @pro/descriptions.

1. Read: docs/superpowers/plans/2026-03-31-plan-2b-proform-and-prodescriptions.md
2. Read: CLAUDE.md for code standards
3. Execute all 21 tasks in order
4. You own: packages/pro-form/, packages/pro-descriptions/
5. After Agent 2a completes, you also update: packages/pro-components/src/index.ts (aggregation)
6. DO NOT touch: packages/hooks/, packages/pro-table/ (read-only dependency), platform/, cdn/, docs/

Known violations to fix:
- ALL `any` → `unknown` or specific types. formRef: use `InstanceType<typeof ElForm> | null` not `any`
- ProFormField MUST import CONTROL_REGISTRY from @pro/hooks, NOT implement its own switch. Use resolveControl() function with the shared registry
- Remove all `export default` from .ts files
- InjectionKey: use Symbol(), not magic string 'proForm' — `const PRO_FORM_KEY: InjectionKey<ProFormContext> = Symbol('proForm')`
- catch (error) → catch (error: unknown) + instanceof narrowing
- Magic numbers: extract GRID_TOTAL_COLUMNS=24, GRID_GUTTER=16
- Import order: import type at end as separate group
- All test files: .test.ts not .spec.ts
- One assertion concept per test (split multi-assertion tests)

CRITICAL integration requirements:
- useProForm MUST integrate el-form.validate() — not optional. The submit() function must call formRef.value?.validate() before executing submit handler
- StepsForm must validate current step via formRef.validateField() before advancing to next step
- Add concurrent submission guard: `const isSubmitting = ref(false)` — prevent double-submit

After completion: pnpm --filter @pro/form test && pnpm --filter @pro/descriptions test && pnpm build
```

#### Agent 5a: Platform API

```
Coordinator dispatch prompt:

You are Implementer Agent 5a. Your scope is the version management platform backend.

1. Read: docs/superpowers/plans/2026-03-31-plan-5a-platform-api.md
2. Read: CLAUDE.md for code standards
3. Execute all 18 tasks in order
4. You own: platform/server/
5. DO NOT touch: packages/, cdn/, docs/, platform/web/

Known violations to fix:
- ALL `any` → `unknown` or specific types
- SQL: all queries MUST use parameterized queries (Knex handles this, but verify raw queries)
- Koa middleware order: requestId → error handler → security → cors → bodyParser → logging → auth → routes → 404
- Use pino for structured logging, not console
- All functions <= 50 lines
- DB connection pooling (Knex pool config)
- Graceful shutdown: handle SIGTERM/SIGINT
- catch (error: unknown) everywhere
- Validate all external input with zod schemas
- Test files: .test.ts

CRITICAL architecture requirements:
- Multi-package publish: wrap in Knex transaction — all packages in a release must be committed atomically, rollback on any failure
- Cache: composite key with cacheEpoch counter, TTL 60s, LRU 10k entries. Cache invalidation must bump epoch, not just flush
- Grayscale takes precedence over pinned versions (admin role required for override). Resolution order: grayscale rules → pinned → semver resolve
- Semver tests: add pre-release (1.0.0-alpha.1), build metadata (1.0.0+build.1), complex OR ranges (>=1.2.0 || <0.2.0), hyphen ranges (1.0.0 - 2.0.0), tilde ranges (~1.2.3)
- Add /health endpoint with DB status (knex.raw('SELECT 1')), uptime, cache size, version info

After completion: cd platform/server && pnpm test && pnpm build
```

#### Agent 5b: Platform Dashboard

```
Coordinator dispatch prompt:

You are Implementer Agent 5b. Your scope is the version management platform frontend.

1. Read: docs/superpowers/plans/2026-03-31-plan-5b-platform-dashboard.md
2. Read: CLAUDE.md for code standards
3. Execute all 13 tasks in order
4. You own: platform/web/
5. DO NOT touch: packages/, cdn/, docs/, platform/server/

Known violations to fix:
- ALL `any` → `unknown` or specific interface
- No default exports in .ts files (Vue SFC exempt)
- All components under 400 lines
- API client: validate response shapes at runtime (type guard or zod)
- Magic numbers/strings → named constants
- Import order: external → internal → relative → import type

CRITICAL architecture requirements:
- Add Pinia stores for grayscale, compat, version (not just auth + app) — each domain gets its own store
- Implement usePermission composable for role-based UI: `const { hasPermission, isAdmin } = usePermission()`
- Hide unauthorized actions with v-if, not disabled — users should not see actions they cannot perform
- Add global API error handler: 401 → auto-logout + redirect to login, 403 → permission denied toast, 500+ → retry message with exponential backoff

After completion: cd platform/web && pnpm type-check && pnpm build
```

**Phase 2 completion gate**: All 4 agents done + coordinator runs:
```bash
pnpm build                    # full monorepo build
pnpm type-check               # all packages
pnpm test                     # all unit/integration tests pass
pnpm validate-build           # build output validation
```

Then dispatch **Reviewer Agent**:

```
Coordinator review dispatch:

You are the Code Review Agent for Phase 2.

1. Run: git diff main..HEAD --stat (see all changed files)
2. Read: CLAUDE.md for code standards
3. Read: docs/superpowers/specs/2026-03-31-pro-components-design.md (Section 4: API Design)
4. For each package changed, verify:
   a. Type safety: grep for `any` in src/ — should be zero occurrences
   b. File lengths: no file over 400 lines
   c. Function lengths: no function over 50 lines
   d. Exports: no default exports in .ts files
   e. Tests exist and pass for all exported functions
   f. JSDoc on all exported interfaces/functions
   g. No console.log/warn/error in src/ (only in test files)
5. Run: pnpm lint — must pass with zero warnings
6. Cross-check critical integration points:
   a. ProFormField uses CONTROL_REGISTRY from @pro/hooks (no hardcoded switch/case)
   b. useProForm calls el-form.validate() in submit() — validation is mandatory, not skippable
   c. Grayscale evaluator has precedence over pinned versions in semver resolver
   d. All catch blocks use (error: unknown) + instanceof narrowing — no bare catch(e)
   e. Verify: No `any` in any src/ files (grep -r 'any' packages/*/src/ platform/*/src/)
7. Report findings. Fix any issues found.
```

---

### Phase 3: Docs + CDN (Parallel)

**Mode**: 2 agents in parallel
**Dependencies**: Phase 2 must be complete

#### Agent 3: VitePress Documentation

```
Coordinator dispatch prompt:

You are Implementer Agent 3. Your scope is the VitePress documentation site.

1. Read: docs/superpowers/plans/2026-03-31-plan-3-documentation.md
2. Read: CLAUDE.md for code standards
3. Execute all 15 tasks
4. You own: docs/ (VitePress), packages/*/demos/
5. DO NOT touch: packages/*/src/, platform/, cdn/

Known violations to fix:
- theme/index.ts: use type guard for Vue component detection, not `as any`
- gen-api-doc.ts: define TagDef interface instead of Record<string, any>
- Export naming: use `proVitePlugin` consistently (match Plan 4 implementation)
- Demo files: define typed interfaces for form values, not Record<string, any>
- Remove unused imports (h, ref in demo files)

After completion: pnpm docs:build (verify docs compile)
```

#### Agent 4: CDN Distribution

```
Coordinator dispatch prompt:

You are Implementer Agent 4. Your scope is CDN distribution (loader, SW, Vite plugin).

1. Read: docs/superpowers/plans/2026-03-31-plan-4-cdn-distribution.md
2. Read: CLAUDE.md for code standards
3. Execute all 14 tasks
4. You own: cdn/, packages/vite-plugin/
5. DO NOT touch: packages/*/src/ (read-only), platform/, docs/

CRITICAL fix: bundle.ts uses require() in ESM module — will crash at runtime. Replace with fs.readFile + JSON.parse (not import).

Known violations to fix:
- ALL `(window as any)` → extend Window interface in global.d.ts instead of casting
- API response: add runtime validation (type guard) before using — create isValidImportMapResponse type guard function
- SW handleCacheImportMap: validate importMap shape before caching
- SW cache: atomic cache groups — all resources for a version must be cached together or none (use Cache.addAll, not individual Cache.put)
- buildErrorPageHtml: split into helper functions (under 50 lines each)
- Magic numbers: extract timeouts to named constants
- Use logger wrapper for console calls in browser code
- Empty catch blocks: add explanatory comments

After completion: pnpm --filter cdn test && pnpm --filter @pro/vite-plugin build
```

**Phase 3 completion gate**:
```bash
pnpm build
pnpm docs:build
pnpm test
```

Then dispatch Reviewer Agent (same pattern as Phase 2, plus these Phase 3 cross-checks):

```
Additional Phase 3 reviewer cross-checks:
- Cross-check: ProFormField uses CONTROL_REGISTRY from @pro/hooks (no hardcoded switch)
- Cross-check: useProForm calls el-form.validate() in submit()
- Cross-check: Grayscale evaluator has precedence over pinned versions
- Cross-check: All catch blocks use (error: unknown) + instanceof
- Verify: No `any` in any src/ files
- CDN-specific: bundle.ts does NOT use require() — uses fs.readFile + JSON.parse
- CDN-specific: (window as any) replaced with extended Window interface in global.d.ts
- CDN-specific: SW uses atomic cache groups (Cache.addAll not individual Cache.put)
- CDN-specific: isValidImportMapResponse type guard exists and is used
```

---

### Phase 4: CI/CD

**Mode**: Single agent
**Dependencies**: Phase 3 must be complete

```
Coordinator dispatch prompt:

You are Implementer Agent 6. Your scope is CI/CD pipelines.

1. Read: docs/superpowers/plans/2026-03-31-plan-6-cicd-pipeline.md
2. Read: CLAUDE.md for code standards
3. Execute all tasks (Task 1, 2, 3a, 3b, 3c, 3d, 4, 5, 6, 7, 8, 9, 10, 11)
4. You own: .github/, scripts/ci/
5. DO NOT touch: packages/*/src/, platform/*/src/

CRITICAL implementation notes:
- Task 3 is split into 4 sub-tasks (3a/3b/3c/3d) — execute sequentially
- Create scripts/ci/logger.ts FIRST (Task 3a) — all other CI scripts import from it
- Add rollback workflow (.github/workflows/rollback.yml) in Task 9
- Release workflow: both npm-publish and cdn-sync jobs use `environment: production` for approval gate
- All CI scripts must use logger wrapper, not raw console.log/warn/error
- Each script file <= 400 lines, functions <= 50 lines
- No `any` — use `unknown` or specific types
- No `export default` in .ts files

After completion:
- Verify YAML syntax: yamllint .github/workflows/*.yml
- Verify scripts: pnpm type-check
- Dry run: act -l (if act installed) to validate workflow structure
```

**Phase 4 completion gate**: All workflows valid, scripts type-check.

Final Reviewer dispatch covers the entire project with these mandatory cross-checks:

```
Final Reviewer cross-checks (ALL phases):
- Cross-check: ProFormField uses CONTROL_REGISTRY from @pro/hooks (no hardcoded switch)
- Cross-check: useProForm calls el-form.validate() in submit()
- Cross-check: Grayscale evaluator has precedence over pinned versions
- Cross-check: All catch blocks use (error: unknown) + instanceof
- Verify: No `any` in any src/ files (grep -rn 'any' packages/*/src/ platform/*/src/ cdn/src/ scripts/)
- Verify: No `export default` in .ts files (grep -rn 'export default' --include='*.ts' --exclude='*.vue')
- Verify: No raw console.log/warn/error in production code
- Verify: All CI scripts import from scripts/ci/logger.ts
- Verify: rollback.yml uses environment: production
- Verify: release.yml npm-publish and cdn-sync use environment: production
```

---

## i18n Integration (Plan i18n-support)

The i18n plan (`2026-03-31-plan-i18n-support.md`) adds tasks that interleave with existing phases. A dedicated **i18n Agent** handles all i18n-specific work.

### i18n Agent Dispatch Per Phase

**Phase 1** — After Plan 1 Agent completes, dispatch i18n Agent:

```
You are the i18n Implementer Agent. Your scope is i18n foundation.

1. Read: docs/superpowers/plans/2026-03-31-plan-i18n-support.md (Tasks 1–3)
2. Read: docs/superpowers/specs/2026-03-31-pro-components-i18n-design.md
3. Read: CLAUDE.md for code standards
4. Execute Tasks 1–3 (Phase 1 section of i18n plan)
5. You own: packages/locale/, pnpm-workspace.yaml (platform/* addition only)
6. You may modify: packages/pro-components/package.json (peerDeps), packages/hooks/package.json (deps), scripts/rollup.base.ts (externals)

After completion: pnpm install && pnpm --filter @pro/locale build && pnpm type-check
```

**Phase 2** — Dispatch i18n Agent in parallel with 2a/2b/5a/5b:

```
You are the i18n Implementer Agent. Your scope is i18n core utilities and component wiring.

1. Read: docs/superpowers/plans/2026-03-31-plan-i18n-support.md (Tasks 4–10)
2. Read: docs/superpowers/specs/2026-03-31-pro-components-i18n-design.md
3. Read: CLAUDE.md for code standards
4. Execute Tasks 4–10 (Phase 2 section of i18n plan)
5. You own: packages/hooks/src/resolve-message.ts, packages/hooks/src/use-pro-locale.ts, packages/hooks/src/formatters.ts and their test files
6. You share with Agent 2a/2b: packages/hooks/src/index.ts, packages/hooks/src/constants.ts (add exports only, don't modify existing)
7. You share with Agent 2b: packages/pro-components/src/pro-config-provider.vue (add locale logic)
8. Component wiring (Tasks 8–9): coordinate with Agent 2a/2b — wire t() calls AFTER their components exist
9. Dashboard i18n (Task 10): coordinate with Agent 5b — add vue-i18n setup AFTER dashboard scaffold exists

DEPENDENCY ORDER:
- Tasks 4–6: can run immediately (pure utilities)
- Task 7: after Plan 2b creates ProConfigProvider skeleton
- Tasks 8–9: after Plan 2a/2b create component files
- Task 10: after Plan 5b creates dashboard scaffold

After completion: pnpm test && pnpm build && pnpm type-check
```

**Phase 3** — Dispatch i18n Agent in parallel with Agent 3/4:

```
You are the i18n Implementer Agent. Your scope is docs i18n and CDN updates.

1. Read: docs/superpowers/plans/2026-03-31-plan-i18n-support.md (Tasks 11–13)
2. Execute Tasks 11–13 (Phase 3 section)
3. You share with Agent 3: docs/.vitepress/config.ts (add locales config)
4. You share with Agent 4: cdn/ import map templates

After completion: pnpm docs:build && pnpm --filter cdn build
```

**Standalone** — Dispatch Translation Agent anytime (background):

```
You are the Translation Agent. Translate all planning docs to Chinese.

1. Read: docs/superpowers/plans/2026-03-31-plan-i18n-support.md (Task 14)
2. For each file in docs/superpowers/specs/ and docs/superpowers/plans/, create a -zh.md Chinese translation
3. Translation rules: keep code blocks, file paths, variable names in English. Translate prose and table descriptions. Technical terms keep English.
4. DO NOT touch any non-documentation files

After completion: git add docs/superpowers/**/*-zh.md && git commit
```

### i18n Reviewer Cross-Checks

Add these to ALL reviewer agent prompts:

```
i18n-specific checks:
- Verify: useProLocale() is used in ALL components, never direct vue-i18n import
- Verify: ProConfigProvider wraps ElConfigProvider with locale sync
- Verify: No hardcoded user-facing strings in component templates (grep for English text in .vue template sections)
- Verify: @pro/locale messages are complete (en-US and zh-CN have identical key structure)
- Verify: resolveMessage handles empty key, null messages, missing keys
- Verify: __DEV__ guard on console.warn in useProLocale
- Verify: vue-i18n listed as optional peerDependency, not regular dependency
```

---

## Coordinator Cheat Sheet

Copy-paste these commands to run the full orchestration:

### Start Phase 1
```
Read docs/superpowers/plans/agent-orchestration.md Phase 1 section.
Execute Plan 1 following the coordinator prompt.
```

### Start Phase 2 (after Phase 1 verified)
```
Read docs/superpowers/plans/agent-orchestration.md Phase 2 section.
Dispatch 4 background agents with the prompts shown.
Wait for all to complete.
Dispatch reviewer agent.
```

### Start Phase 3 (after Phase 2 verified)
```
Read docs/superpowers/plans/agent-orchestration.md Phase 3 section.
Dispatch 2 background agents with the prompts shown.
Wait for all to complete.
Dispatch reviewer agent.
```

### Start Phase 4 (after Phase 3 verified)
```
Read docs/superpowers/plans/agent-orchestration.md Phase 4 section.
Execute Plan 6 following the coordinator prompt.
Dispatch final reviewer.
```

---

## Timeout Handling

If an agent times out (> 15 minutes on a task):

1. Check what was completed: `git log --oneline -10`
2. Read the plan to find where it stopped
3. Dispatch a new agent starting from the incomplete task:
   ```
   Continue from Task N of Plan X. Previous tasks 1-(N-1) are committed.
   Read the plan file and CLAUDE.md, then resume from Task N.
   ```

If an agent consistently times out on a specific task, split that task:
- Extract the test-writing steps into one agent
- Extract the implementation steps into another

---

## Conflict Resolution

If two agents accidentally modify the same file:

1. Coordinator checks `git status` for conflicts
2. The agent whose plan "owns" that file path (see CLAUDE.md Package Scope Map) takes priority
3. The other agent's changes are reviewed and manually merged by coordinator

---

## Final Integration Verification

After all 4 phases complete, coordinator runs:

```bash
# Full build
pnpm build

# Type safety
pnpm type-check

# Lint
pnpm lint

# All tests
pnpm test

# Build validation
pnpm validate-build

# Docs
pnpm docs:build

# Playground smoke test
pnpm dev:playground
# Manually verify: components render, no console errors

# Platform (if DB available)
cd platform/server && pnpm test
cd platform/web && pnpm build
```

Zero errors across all checks = project ready for first release.
