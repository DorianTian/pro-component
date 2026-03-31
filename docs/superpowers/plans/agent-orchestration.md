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

1. Read the plan: docs/superpowers/plans/2026-03-31-plan-1-monorepo-foundation.md
2. Read the project CLAUDE.md for code standards
3. Execute all 14 tasks sequentially
4. Apply code standards fixes as you implement (the plan has known violations — see below)
5. After each task: run relevant validation, commit

Known violations to fix during implementation:
- ESLint config: use flat config (eslint.config.js) not .eslintrc.cjs (ESLint 9+)
- ESLint rules: add no-explicit-any: error, consistent-type-imports: error, no-floating-promises: error, prefer-const: error, no-var: error, eqeqeq: error, max-lines: 400, max-lines-per-function: 50, max-params: 4, complexity: 10, max-depth: 4
- Replace all `any` with `unknown` or specific types
- Remove all `export default` from .ts files
- Remove commented-out code
- Add JSDoc to all exported functions/interfaces
- createRollupConfig: split into createEsmConfig/createCjsConfig/createUmdConfig (under 50 lines each)
- version-check.ts: use logger wrapper instead of console.warn

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
- Magic numbers: extract DEFAULT_PAGE_SIZE, DEFAULT_LABEL_WIDTH etc to constants
- Boolean props: ellipsis → isEllipsis, copyable → isCopyable (or document exemption)
- All test files: use .test.ts not .spec.ts

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
- renderControl() in ProFormField.vue: refactor to strategy map pattern (CONTROL_RENDERERS Record), keep under 50 lines
- Remove all `export default` from .ts files
- Provide key: use `InjectionKey<T>` symbol, not magic string 'proForm'
- catch (error) → catch (error: unknown)
- Magic numbers: extract GRID_TOTAL_COLUMNS=24, GRID_GUTTER=16
- Import order: import type at end as separate group
- All test files: .test.ts not .spec.ts
- One assertion concept per test (split multi-assertion tests)

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
6. Report findings. Fix any issues found.
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

CRITICAL fix: bundle.ts uses require() in ESM module — will crash at runtime. Use import instead.

Known violations to fix:
- ALL `(window as any)` → extend Window interface in global.d.ts
- API response: add runtime validation (type guard) before using
- SW handleCacheImportMap: validate importMap shape before caching
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

Then dispatch Reviewer Agent (same pattern as Phase 2).

---

### Phase 4: CI/CD

**Mode**: Single agent
**Dependencies**: Phase 3 must be complete

```
Coordinator dispatch prompt:

You are Implementer Agent 6. Your scope is CI/CD pipelines.

1. Read: docs/superpowers/plans/2026-03-31-plan-6-cicd-pipeline.md
2. Read: CLAUDE.md for code standards
3. Execute all 10 tasks
4. You own: .github/, scripts/ci/
5. DO NOT touch: packages/*/src/, platform/*/src/

After completion:
- Verify YAML syntax: yamllint .github/workflows/*.yml
- Verify scripts: pnpm type-check
- Dry run: act -l (if act installed) to validate workflow structure
```

**Phase 4 completion gate**: All workflows valid, scripts type-check.

Final Reviewer dispatch covers the entire project.

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
