# Pro Components — Project CLAUDE.md

## Project Overview

Vue 3 + Element Plus higher-level component library (ProTable, ProForm, ProDescriptions) with CDN distribution and version management platform.

- **Design Spec**: `docs/superpowers/specs/2026-03-31-pro-components-design.md`
- **Implementation Plans**: `docs/superpowers/plans/2026-03-31-plan-*.md`
- **Orchestration Guide**: `docs/superpowers/plans/agent-orchestration.md`
- **Knowledge Base**: `~/Knowledge/09-Projects/pro-components/`

## Tech Stack

- **Framework**: Vue 3.4+ / Element Plus 2.9+
- **Monorepo**: Turborepo + pnpm workspace
- **Build**: Rollup 4 → ESM / CJS / UMD
- **Docs**: VitePress + vitepress-plugin-demo
- **Testing**: Vitest + Vue Test Utils + Cypress Component Testing
- **Publish**: Changesets (fixed version group for component packages)
- **CDN**: ESM CDN + Import Maps + es-module-shims
- **Platform API**: Koa.js + MySQL + Knex migrations
- **Platform Dashboard**: Vue 3 + Element Plus + Pinia + Vue Router
- **CI/CD**: GitHub Actions

## Code Standards (Enforced)

Implementation MUST comply with `/code-standards` skill. Key hard rules:

### Type Safety
- **Never `any`** — use `unknown` + type guards. `Record<string, any>` → `Record<string, unknown>` or specific interface
- `interface` for object shapes, `type` for unions/intersections
- `import type` for type-only imports, separate group at end
- `strict: true` in all tsconfig files
- No `const enum`, no `namespace`

### Functions & Files
- Max **50 lines** per function. Split into smaller functions if exceeded
- Max **4 positional parameters** — use options object beyond that
- Cyclomatic complexity **<= 10**, nesting depth **<= 4**
- Files **<= 400 lines** (TS/JS). Split when exceeded

### Exports & Naming
- **No default exports** in `.ts` files. Vue SFC `.vue` files are exempt (framework constraint)
- Named exports only: `export { ProTable }` not `export default ProTable`
- Booleans: `is/has/can/should` prefix
- Files: `kebab-case.ts`, components: `PascalCase.vue`
- No magic numbers/strings — extract to named constants

### Error Handling
- `catch (error: unknown)` + `instanceof` narrowing
- No empty catch blocks. At minimum, add comment explaining why ignored
- `throw new Error(...)` not `throw 'string'`

### Logging
- No `console.log/warn/error` in production code — use pino logger
- CLI scripts: create a logger wrapper, don't scatter raw console calls
- Browser loader code: use prefixed wrapper, strip in production via terser

### Imports
- Order: external libs → internal absolute (`@pro/*`) → relative → side-effect → `import type` (separate group)
- No circular imports

### Testing
- Files: `*.test.ts` (not `.spec.ts`)
- AAA pattern (Arrange-Act-Assert)
- One assertion concept per test
- 100% coverage for: semver resolver, grayscale engine
- >= 90% coverage for: hooks, utils
- >= 80% coverage for: component integration tests

### Node.js Backend (Platform API)
- ESM: `"type": "module"`
- Koa middleware order: requestId → error handler → security → cors → bodyParser → logging → auth → routes → 404
- Parameterized queries ALWAYS — never string concat for SQL
- Connection pooling — never single DB connections
- Graceful shutdown on SIGTERM/SIGINT

## Multi-Agent Execution Architecture

This project uses a phased multi-agent approach. See `docs/superpowers/plans/agent-orchestration.md` for full details.

### Quick Start

```
# Phase 1: Foundation (single agent, must complete first)
Read agent-orchestration.md, execute Phase 1

# Phase 2: Core + Platform (4 parallel agents)
Read agent-orchestration.md, execute Phase 2

# Phase 3: Docs + CDN (2 parallel agents)
Read agent-orchestration.md, execute Phase 3

# Phase 4: CI/CD (single agent)
Read agent-orchestration.md, execute Phase 4
```

### Agent Roles

| Role | Description |
|------|-------------|
| **Coordinator** | Main thread. Dispatches agents, monitors progress, resolves conflicts, gates phase transitions |
| **Implementer** | Background agent. Executes one plan (or plan chunk). Writes code, runs tests, commits |
| **Reviewer** | Background agent. Reviews completed phase output against code standards + design spec |

### Rules for All Agents

1. **Read the plan before writing code** — every task has exact file paths and code
2. **Apply code standards fixes inline** — the plans have known violations (documented in review). Fix as you implement, don't follow plan code blindly
3. **Run validation after each task** — `pnpm type-check`, `pnpm lint`, tests
4. **Commit after each task** — conventional commit format
5. **Don't modify files outside your plan scope** — if you need changes in another package, note it for the coordinator
6. **Format before commit** — `pnpm format` (or package-level format command)

## Package Scope Map

Which agent owns which directories (for parallel execution):

| Package Path | Owner Plan |
|-------------|-----------|
| `packages/utils/` | Plan 2a |
| `packages/hooks/` | Plan 2a |
| `packages/themes/` | Plan 2a |
| `packages/resolvers/` | Plan 2a |
| `packages/pro-table/` | Plan 2a |
| `packages/pro-form/` | Plan 2b |
| `packages/pro-descriptions/` | Plan 2b |
| `packages/pro-components/` | Plan 2b (after 2a completes) |
| `platform/server/` | Plan 5a |
| `platform/web/` | Plan 5b |
| `cdn/` | Plan 4 |
| `docs/` | Plan 3 |
| `.github/workflows/` | Plan 6 |
| `scripts/` | Plan 1 (foundation), then shared |
| Root config files | Plan 1 only |

## Commit Convention

```
feat(table): add useProTable composable
feat(platform-api): add semver dependency resolver
fix(loader): handle import map fetch timeout
test(hooks): add usePagination boundary tests
chore(build): configure Rollup shared base config
docs(guide): add CDN mode integration guide
```

Scope values: `table`, `form`, `descriptions`, `hooks`, `utils`, `themes`, `resolvers`, `loader`, `platform-api`, `platform-web`, `docs`, `build`, `ci`
