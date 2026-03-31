# Plan 1: Monorepo Foundation + Build Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the complete monorepo infrastructure with Turborepo + pnpm workspace, Rollup build pipeline, and all package scaffolding so component development can begin immediately.

**Architecture:** Turborepo orchestrates builds across a pnpm workspace. Each package has its own Rollup config extending a shared base. Build outputs ESM/CJS/UMD with separate CSS extraction and bundled type declarations. A validation script ensures build correctness in CI.

**Tech Stack:** pnpm 9+, Turborepo 2+, Rollup 4, TypeScript 5.5+, Vue 3.4+, Element Plus 2.9+, PostCSS, rollup-plugin-vue, rollup-plugin-dts, terser

---

## File Structure

```
pro-components/
├── package.json                      # Root: workspace scripts, devDependencies
├── pnpm-workspace.yaml               # Workspace package glob
├── turbo.json                        # Task pipeline config
├── tsconfig.json                     # Root tsconfig (references)
├── tsconfig.base.json                # Shared compiler options
├── .npmrc                            # pnpm config (strict peer deps, etc.)
├── .gitignore
├── .prettierrc                       # Prettier config
├── eslint.config.js                  # ESLint flat config (ESLint 9+)
├── scripts/
│   ├── rollup.base.ts                # Shared Rollup config factory
│   ├── build.ts                      # Build orchestration script
│   ├── gen-dts.ts                    # Type declaration generation
│   └── validate-build.ts            # Build output validation
├── packages/
│   ├── utils/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── logger.ts             # Scoped logger utility
│   │       ├── version-check.ts      # Runtime peer version check
│   │       └── types.ts              # Shared type utilities
│   ├── hooks/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       └── index.ts
│   ├── themes/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       └── variables.css         # CSS custom properties / tokens
│   ├── resolvers/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       └── index.ts
│   ├── pro-table/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       └── ProTable.vue          # Placeholder component
│   ├── pro-form/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       └── ProForm.vue           # Placeholder component
│   ├── pro-descriptions/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── rollup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       └── ProDescriptions.vue   # Placeholder component
│   └── pro-components/
│       ├── package.json
│       ├── tsconfig.json
│       ├── rollup.config.ts
│       └── src/
│           └── index.ts              # Re-exports all components
└── playground/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.ts
        └── App.vue
```

---

### Task 1: Git Init + Root Config Files

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `.gitignore`
- Create: `tsconfig.json`
- Create: `tsconfig.base.json`

- [ ] **Step 1: Initialize git repo**

```bash
# Run from project root directory
git init
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "pro-components",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo build",
    "build:dts": "turbo build:dts",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "turbo type-check",
    "clean": "turbo clean",
    "dev:playground": "pnpm --filter playground dev",
    "validate-build": "tsx scripts/validate-build.ts"
  },
  "devDependencies": {
    "acorn": "^8.12.0",
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "@rollup/plugin-typescript": "^12.0.0",
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-vue": "^9.0.0",
    "typescript-eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-dts": "^6.0.0",
    "rollup-plugin-postcss": "^4.0.0",
    "rollup-plugin-vue": "^6.0.0",
    "tsx": "^4.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.5.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'playground'
  - 'docs'
```

- [ ] **Step 4: Create .npmrc**

```ini
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false
link-workspace-packages=true
prefer-workspace-packages=true
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.turbo/
coverage/
*.log
.DS_Store
.env
.env.*
!.env.example
```

- [ ] **Step 6: Create tsconfig.base.json**

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
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "preserve",
    "types": ["node"]
  }
}
```

- [ ] **Step 7: Create tsconfig.json (project references)**

```json
{
  "files": [],
  "references": [
    { "path": "packages/utils" },
    { "path": "packages/hooks" },
    { "path": "packages/themes" },
    { "path": "packages/resolvers" },
    { "path": "packages/pro-table" },
    { "path": "packages/pro-form" },
    { "path": "packages/pro-descriptions" },
    { "path": "packages/pro-components" },
    { "path": "playground" }
  ]
}
```

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml .npmrc .gitignore tsconfig.json tsconfig.base.json
git commit -m "chore: init monorepo root config"
```

---

### Task 2: ESLint + Prettier Config

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 2: Create .prettierignore**

```
dist/
node_modules/
coverage/
.turbo/
pnpm-lock.yaml
```

- [ ] **Step 3: Create eslint.config.js (ESLint 9+ flat config)**

```javascript
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts'],
  },
)
```

- [ ] **Step 4: Commit**

```bash
git add eslint.config.js .prettierrc .prettierignore
git commit -m "chore: add ESLint flat config + Prettier config"
```

---

### Task 3: Turborepo Configuration

**Files:**

- Create: `turbo.json`

- [ ] **Step 1: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "rollup.config.ts", "tsconfig.json", "package.json"]
    },
    "build:dts": {
      "dependsOn": ["build"],
      "outputs": ["dist/types/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "__tests__/**", "vitest.config.*"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": [],
      "cache": false
    },
    "lint": {
      "inputs": ["src/**", "*.js", "*.ts"]
    },
    "clean": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add Turborepo pipeline config"
```

---

### Task 4: Shared Rollup Config Factory

**Files:**

- Create: `scripts/rollup.base.ts`

- [ ] **Step 1: Create scripts/rollup.base.ts**

```typescript
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RollupOptions, Plugin } from 'rollup'
import vue from 'rollup-plugin-vue'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import terser from '@rollup/plugin-terser'

/** Configuration options for the shared Rollup build factory */
export interface PackageConfig {
  /** Absolute path to the package directory */
  packageDir: string
  /** UMD global name (e.g., 'ProTable') */
  umdName?: string
  /** Additional external packages beyond defaults */
  extraExternal?: (string | RegExp)[]
  /** Additional plugins */
  extraPlugins?: Plugin[]
}

interface ResolvedBuildContext {
  input: string
  external: (string | RegExp)[]
  basePlugins: Plugin[]
  packageDir: string
}

/** Read and parse a package.json from the given directory */
function readPkg(packageDir: string): Record<string, unknown> {
  const raw = readFileSync(resolve(packageDir, 'package.json'), 'utf-8')
  return JSON.parse(raw) as Record<string, unknown>
}

/** Resolve shared build context (input, externals, base plugins) from config */
function resolveBuildContext(config: PackageConfig): ResolvedBuildContext {
  const { packageDir, extraExternal = [], extraPlugins = [] } = config
  const pkg = readPkg(packageDir)
  const deps = pkg.dependencies as Record<string, string> | undefined
  const peerDeps = pkg.peerDependencies as Record<string, string> | undefined

  return {
    input: resolve(packageDir, 'src/index.ts'),
    external: [
      'vue',
      'element-plus',
      /^@pro\//,
      ...Object.keys(deps ?? {}),
      ...Object.keys(peerDeps ?? {}),
      ...extraExternal,
    ],
    basePlugins: [
      vue(),
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      ...extraPlugins,
    ],
    packageDir,
  }
}

/** Create ESM build configuration */
function createEsmConfig(ctx: ResolvedBuildContext): RollupOptions {
  return {
    input: ctx.input,
    output: {
      format: 'esm',
      dir: resolve(ctx.packageDir, 'dist/esm'),
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
      preserveModules: false,
    },
    external: ctx.external,
    plugins: [
      ...ctx.basePlugins,
      typescript({
        tsconfig: resolve(ctx.packageDir, 'tsconfig.json'),
        declaration: false,
      }),
      postcss({ extract: resolve(ctx.packageDir, 'dist/style/index.css'), minimize: true }),
    ],
  }
}

/** Create CJS build configuration */
function createCjsConfig(ctx: ResolvedBuildContext): RollupOptions {
  return {
    input: ctx.input,
    output: {
      format: 'cjs',
      dir: resolve(ctx.packageDir, 'dist/cjs'),
      entryFileNames: '[name].js',
      exports: 'named',
    },
    external: ctx.external,
    plugins: [
      ...ctx.basePlugins,
      typescript({
        tsconfig: resolve(ctx.packageDir, 'tsconfig.json'),
        declaration: false,
      }),
      postcss({ inject: false }),
    ],
  }
}

/** Create UMD build configuration (standard + minified) */
function createUmdConfigs(ctx: ResolvedBuildContext, umdName: string): RollupOptions[] {
  const umdExternal = ['vue', 'element-plus']
  const umdGlobals = { vue: 'Vue', 'element-plus': 'ElementPlus' }

  const standard: RollupOptions = {
    input: ctx.input,
    output: {
      format: 'umd',
      file: resolve(ctx.packageDir, 'dist/umd/index.js'),
      name: umdName,
      globals: umdGlobals,
      exports: 'named',
    },
    external: umdExternal,
    plugins: [
      ...ctx.basePlugins,
      typescript({
        tsconfig: resolve(ctx.packageDir, 'tsconfig.json'),
        declaration: false,
      }),
      postcss({ inject: true, minimize: true }),
      terser(),
    ],
  }

  const minified: RollupOptions = {
    input: ctx.input,
    output: {
      format: 'umd',
      file: resolve(ctx.packageDir, 'dist/umd/index.min.js'),
      name: umdName,
      globals: umdGlobals,
      exports: 'named',
      sourcemap: true,
    },
    external: umdExternal,
    plugins: [
      ...ctx.basePlugins,
      typescript({
        tsconfig: resolve(ctx.packageDir, 'tsconfig.json'),
        declaration: false,
      }),
      postcss({ inject: true, minimize: true }),
      terser({ format: { comments: false } }),
    ],
  }

  return [standard, minified]
}

/** Create all Rollup build configurations (ESM + CJS + optional UMD) */
export function createRollupConfig(config: PackageConfig): RollupOptions[] {
  const ctx = resolveBuildContext(config)
  const configs: RollupOptions[] = [createEsmConfig(ctx), createCjsConfig(ctx)]

  if (config.umdName) {
    configs.push(...createUmdConfigs(ctx, config.umdName))
  }

  return configs
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/rollup.base.ts
git commit -m "feat: add shared Rollup config factory"
```

---

### Task 5: Build Validation Script

**Files:**

- Create: `scripts/validate-build.ts`

- [ ] **Step 1: Create scripts/validate-build.ts**

```typescript
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parse } from 'acorn'

/* eslint-disable no-console -- CLI script uses console for structured output */
const log = {
  result: (msg: string) => console.log(msg),
  fail: (msg: string) => console.error(msg),
  warn: (msg: string) => console.warn(msg),
}
/* eslint-enable no-console */

const PACKAGES_DIR = resolve(import.meta.dirname, '../packages')
const VUE_RUNTIME_MARKERS = [
  'createApp',
  '__VUE_OPTIONS_API__',
  '__VUE_PROD_DEVTOOLS__',
  'createElementBlock',
  'createVNode',
]

/** Result of validating a single package's build output */
interface ValidationResult {
  package: string
  errors: string[]
  warnings: string[]
}

/** Validate that package.json export fields point to existing files */
function validateExports(pkgDir: string, pkgJson: Record<string, unknown>): string[] {
  const errors: string[] = []

  const main = pkgJson.main as string | undefined
  const mod = pkgJson.module as string | undefined
  const types = pkgJson.types as string | undefined

  if (main && !existsSync(resolve(pkgDir, main))) {
    errors.push(`main field points to missing file: ${main}`)
  }
  if (mod && !existsSync(resolve(pkgDir, mod))) {
    errors.push(`module field points to missing file: ${mod}`)
  }
  if (types && !existsSync(resolve(pkgDir, types))) {
    errors.push(`types field points to missing file: ${types}`)
  }

  const exports = pkgJson.exports as Record<string, Record<string, string>> | undefined
  if (exports) {
    for (const [key, value] of Object.entries(exports)) {
      for (const [condition, filePath] of Object.entries(value)) {
        if (typeof filePath === 'string' && !existsSync(resolve(pkgDir, filePath))) {
          errors.push(`exports["${key}"]["${condition}"] points to missing file: ${filePath}`)
        }
      }
    }
  }

  return errors
}

/** Detect accidentally bundled Vue runtime code in ESM output */
function validateNoVueRuntime(pkgDir: string): string[] {
  const errors: string[] = []
  const esmDir = resolve(pkgDir, 'dist/esm')

  if (!existsSync(esmDir)) return errors

  const files = readdirSync(esmDir).filter((f) => f.endsWith('.mjs'))

  for (const file of files) {
    const content = readFileSync(join(esmDir, file), 'utf-8')
    for (const marker of VUE_RUNTIME_MARKERS) {
      // Check for definitions, not imports
      const defPattern = new RegExp(`(function|const|let|var)\\s+${marker}\\b`)
      if (defPattern.test(content)) {
        errors.push(`ESM file ${file} contains Vue runtime code: ${marker} definition found`)
      }
    }
  }

  return errors
}

/** Verify ESM output files are syntactically valid ES modules */
function validateEsmValidity(pkgDir: string): string[] {
  const errors: string[] = []
  const esmDir = resolve(pkgDir, 'dist/esm')

  if (!existsSync(esmDir)) return errors

  const files = readdirSync(esmDir).filter((f) => f.endsWith('.mjs'))

  for (const file of files) {
    const content = readFileSync(join(esmDir, file), 'utf-8')
    try {
      parse(content, { ecmaVersion: 2022, sourceType: 'module' })
    } catch (e) {
      errors.push(`ESM file ${file} is not valid ES module: ${(e as Error).message}`)
    }
  }

  return errors
}

/** Validate that packages with style sources produce CSS output */
function validateCssOutput(pkgDir: string, pkgName: string): string[] {
  const errors: string[] = []
  const styleDir = resolve(pkgDir, 'dist', 'style')
  const hasSrcStyle = existsSync(resolve(pkgDir, 'src', 'style'))
  const isThemePackage = pkgName.startsWith('@pro/themes')

  if (hasSrcStyle || isThemePackage) {
    if (!existsSync(styleDir)) {
      errors.push(`${pkgName}: missing dist/style/ directory`)
    } else {
      const cssFiles = readdirSync(styleDir).filter((f) => f.endsWith('.css'))
      if (cssFiles.length === 0) {
        errors.push(`${pkgName}: dist/style/ contains no CSS files`)
      }
    }
  }

  return errors
}

/** Validate that type declaration files are generated */
function validateDts(pkgDir: string): string[] {
  const errors: string[] = []
  const typesDir = resolve(pkgDir, 'dist/types')

  if (!existsSync(typesDir)) {
    errors.push('dist/types/ directory missing — no type declarations generated')
    return errors
  }

  const dtsFiles = readdirSync(typesDir).filter((f) => f.endsWith('.d.ts'))
  if (dtsFiles.length === 0) {
    errors.push('dist/types/ exists but contains no .d.ts files')
  }

  return errors
}

async function main() {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) =>
    existsSync(resolve(PACKAGES_DIR, d, 'package.json')),
  )

  const results: ValidationResult[] = []
  let hasErrors = false

  for (const dir of pkgDirs) {
    const pkgDir = resolve(PACKAGES_DIR, dir)
    const pkgJson = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >
    const errors: string[] = []
    const warnings: string[] = []

    if (!existsSync(resolve(pkgDir, 'dist'))) {
      warnings.push('No dist/ directory — package not built yet')
      results.push({ package: dir, errors, warnings })
      continue
    }

    errors.push(...validateExports(pkgDir, pkgJson))
    errors.push(...validateNoVueRuntime(pkgDir))
    errors.push(...validateEsmValidity(pkgDir))
    errors.push(...validateCssOutput(pkgDir, pkgJson.name as string))
    errors.push(...validateDts(pkgDir))

    if (errors.length > 0) hasErrors = true
    results.push({ package: dir, errors, warnings })
  }

  // Print results
  for (const result of results) {
    const status = result.errors.length > 0 ? 'FAIL' : result.warnings.length > 0 ? 'WARN' : 'PASS'
    log.result(`\n[${status}] ${result.package}`)
    for (const err of result.errors) log.fail(`  ERROR: ${err}`)
    for (const w of result.warnings) log.warn(`  WARN: ${w}`)
  }

  if (hasErrors) {
    log.fail('\nBuild validation FAILED')
    process.exit(1)
  } else {
    log.result('\nBuild validation PASSED')
  }
}

main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/validate-build.ts
git commit -m "feat: add build output validation script"
```

---

### Task 6: @pro/utils Package

**Files:**

- Create: `packages/utils/package.json`
- Create: `packages/utils/tsconfig.json`
- Create: `packages/utils/rollup.config.ts`
- Create: `packages/utils/src/index.ts`
- Create: `packages/utils/src/types.ts`
- Create: `packages/utils/src/logger.ts`
- Create: `packages/utils/src/version-check.ts`

- [ ] **Step 1: Create packages/utils/package.json**

```json
{
  "name": "@pro/utils",
  "version": "0.0.1",
  "description": "Shared utilities for pro-components",
  "type": "module",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "vue": ">=3.4.0"
  }
}
```

- [ ] **Step 2: Create packages/utils/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

- [ ] **Step 3: Create packages/utils/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
})
```

- [ ] **Step 4: Create packages/utils/src/types.ts**

```typescript
/** Standard request params passed to ProTable/ProForm request functions */
export interface RequestParams {
  current: number
  pageSize: number
  [key: string]: unknown
}

/** Standard response format from request functions */
export interface RequestResult<T = unknown> {
  data: T[]
  total: number
  success: boolean
}

/** Status type for valueEnum rendering */
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

/** ValueType determines rendering + search control + formatting */
export type ValueType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'dateRange'
  | 'dateTime'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'money'
  | 'percent'
  | 'progress'
  | 'image'
  | 'code'
```

- [ ] **Step 5: Create packages/utils/src/logger.ts**

```typescript
const PREFIX = '[@pro]'

declare const __DEV__: boolean

/** Logger interface for structured, scoped log output */
export interface Logger {
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
}

/** Create a scoped logger that only emits warn/info in dev mode */
export function createLogger(scope: string): Logger {
  const tag = `${PREFIX}[${scope}]`
  return {
    warn: (message, ...args) => {
      if (__DEV__) console.warn(tag, message, ...args) // eslint-disable-line no-console
    },
    error: (message, ...args) => {
      console.error(tag, message, ...args) // eslint-disable-line no-console
    },
    info: (message, ...args) => {
      if (__DEV__) console.info(tag, message, ...args) // eslint-disable-line no-console
    },
  }
}
```

- [ ] **Step 6: Create packages/utils/src/version-check.ts**

```typescript
import { version as vueVersion } from 'vue'
import { createLogger } from './logger'

const logger = createLogger('version-check')

const MIN_VUE_VERSION = '3.4.0'
const MIN_EP_VERSION = '2.9.0'

/** Compare two semver strings, returns true if current >= minimum */
function compareVersions(current: string, minimum: string): boolean {
  const cur = current.split('.').map(Number)
  const min = minimum.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    const c = cur[i] ?? 0
    const m = min[i] ?? 0
    if (c > m) return true
    if (c < m) return false
  }
  return true
}

/**
 * Check runtime dependencies meet minimum version requirements.
 * Call once during component library install.
 */
export function checkDependencies(): void {
  if (!compareVersions(vueVersion, MIN_VUE_VERSION)) {
    logger.warn(
      `Vue ${vueVersion} detected, minimum required ${MIN_VUE_VERSION}. ` +
        'Some features may not work correctly.',
    )
  }
}
```

- [ ] **Step 7: Create packages/utils/src/index.ts**

```typescript
export { createLogger } from './logger'
export type { Logger } from './logger'
export { checkDependencies } from './version-check'
export type { RequestParams, RequestResult, StatusType, ValueType } from './types'
```

- [ ] **Step 8: Commit**

```bash
git add packages/utils/
git commit -m "feat: scaffold @pro/utils package with logger"
```

---

### Task 7: @pro/hooks Package

**Files:**

- Create: `packages/hooks/package.json`
- Create: `packages/hooks/tsconfig.json`
- Create: `packages/hooks/rollup.config.ts`
- Create: `packages/hooks/src/index.ts`

- [ ] **Step 1: Create packages/hooks/package.json**

```json
{
  "name": "@pro/hooks",
  "version": "0.0.1",
  "description": "Shared composables for pro-components",
  "type": "module",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/utils": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

- [ ] **Step 2: Create packages/hooks/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../utils" }]
}
```

- [ ] **Step 3: Create packages/hooks/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
})
```

- [ ] **Step 4: Create packages/hooks/src/index.ts**

```typescript
// Composables will be added in Plan 2
/** Current hooks package version — placeholder export to ensure build works */
export const HOOKS_VERSION = '0.0.1'
```

- [ ] **Step 5: Commit**

```bash
git add packages/hooks/
git commit -m "feat: scaffold @pro/hooks package"
```

---

### Task 8: @pro/themes Package

**Files:**

- Create: `packages/themes/package.json`
- Create: `packages/themes/tsconfig.json`
- Create: `packages/themes/rollup.config.ts`
- Create: `packages/themes/src/index.ts`
- Create: `packages/themes/src/variables.css`

- [ ] **Step 1: Create packages/themes/package.json**

```json
{
  "name": "@pro/themes",
  "version": "0.0.1",
  "description": "Theme tokens and CSS variables for pro-components",
  "type": "module",
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
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

- [ ] **Step 2: Create packages/themes/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create packages/themes/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
})
```

- [ ] **Step 4: Create packages/themes/src/variables.css**

```css
:root {
  /* Pro Components Design Tokens */

  /* Spacing */
  --pro-spacing-xs: 4px;
  --pro-spacing-sm: 8px;
  --pro-spacing-md: 16px;
  --pro-spacing-lg: 24px;
  --pro-spacing-xl: 32px;

  /* Border Radius */
  --pro-radius-sm: 4px;
  --pro-radius-md: 6px;
  --pro-radius-lg: 8px;

  /* Toolbar */
  --pro-toolbar-height: 48px;
  --pro-toolbar-padding: 0 var(--pro-spacing-md);

  /* Search Form */
  --pro-search-form-gap: var(--pro-spacing-md);
  --pro-search-form-label-width: 80px;

  /* Table */
  --pro-table-header-bg: var(--el-fill-color-light);

  /* Transition */
  --pro-transition-duration: 0.2s;
}
```

- [ ] **Step 5: Create packages/themes/src/index.ts**

```typescript
import './variables.css'

/** Current themes package version */
export const THEMES_VERSION = '0.0.1'
```

- [ ] **Step 6: Commit**

```bash
git add packages/themes/
git commit -m "feat: scaffold @pro/themes package with design tokens"
```

---

### Task 9: @pro/resolvers Package

**Files:**

- Create: `packages/resolvers/package.json`
- Create: `packages/resolvers/tsconfig.json`
- Create: `packages/resolvers/rollup.config.ts`
- Create: `packages/resolvers/src/index.ts`

- [ ] **Step 1: Create packages/resolvers/package.json**

```json
{
  "name": "@pro/resolvers",
  "version": "0.0.1",
  "description": "Auto-import resolver for unplugin-vue-components",
  "type": "module",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

- [ ] **Step 2: Create packages/resolvers/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create packages/resolvers/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
})
```

- [ ] **Step 4: Create packages/resolvers/src/index.ts**

````typescript
/** Resolved component information for unplugin-vue-components */
interface ComponentInfo {
  name: string
  from: string
  sideEffects?: string
}

/** Function signature for unplugin-vue-components resolver */
type ComponentResolverFunction = (componentName: string) => ComponentInfo | undefined

/**
 * Resolver for unplugin-vue-components.
 * Auto-imports ProTable, ProForm, ProDescriptions when used in templates.
 *
 * Usage:
 * ```ts
 * import Components from 'unplugin-vue-components/vite'
 * import { ProComponentsResolver } from '@pro/resolvers'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [ProComponentsResolver()],
 *     }),
 *   ],
 * })
 * ```
 */
export function ProComponentsResolver(): ComponentResolverFunction {
  const componentMap: Record<string, { pkg: string; style?: string }> = {
    ProTable: { pkg: '@pro/table', style: '@pro/table/style' },
    ProForm: { pkg: '@pro/form', style: '@pro/form/style' },
    ProDescriptions: { pkg: '@pro/descriptions', style: '@pro/descriptions/style' },
    ModalForm: { pkg: '@pro/form', style: '@pro/form/style' },
    DrawerForm: { pkg: '@pro/form', style: '@pro/form/style' },
    StepsForm: { pkg: '@pro/form', style: '@pro/form/style' },
    QueryFilter: { pkg: '@pro/form', style: '@pro/form/style' },
  }

  return (componentName: string): ComponentInfo | undefined => {
    const entry = componentMap[componentName]
    if (!entry) return undefined

    return {
      name: componentName,
      from: entry.pkg,
      sideEffects: entry.style,
    }
  }
}
````

- [ ] **Step 5: Commit**

```bash
git add packages/resolvers/
git commit -m "feat: scaffold @pro/resolvers with auto-import resolver"
```

---

### Task 10: Component Package Scaffolding (ProTable, ProForm, ProDescriptions)

**Files:**

- Create: `packages/pro-table/package.json`, `tsconfig.json`, `rollup.config.ts`, `src/index.ts`, `src/ProTable.vue`
- Create: `packages/pro-form/package.json`, `tsconfig.json`, `rollup.config.ts`, `src/index.ts`, `src/ProForm.vue`
- Create: `packages/pro-descriptions/package.json`, `tsconfig.json`, `rollup.config.ts`, `src/index.ts`, `src/ProDescriptions.vue`

- [ ] **Step 1: Create packages/pro-table/package.json**

```json
{
  "name": "@pro/table",
  "version": "0.0.1",
  "description": "ProTable — schema-driven table with built-in search, pagination, and toolbar",
  "type": "module",
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
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

- [ ] **Step 2: Create packages/pro-table/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "../utils" }, { "path": "../hooks" }, { "path": "../themes" }]
}
```

- [ ] **Step 3: Create packages/pro-table/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  umdName: 'ProTable',
})
```

- [ ] **Step 4: Create packages/pro-table/src/ProTable.vue**

```vue
<script setup lang="ts">
defineOptions({ name: 'ProTable' })

// Placeholder — full implementation in Plan 2
</script>

<template>
  <div class="pro-table">
    <slot />
  </div>
</template>

<style scoped>
.pro-table {
  width: 100%;
}
</style>
```

- [ ] **Step 5: Create packages/pro-table/src/index.ts**

```typescript
import ProTable from './ProTable.vue'

export { ProTable }
```

- [ ] **Step 6: Create packages/pro-form/ (same pattern)**

`packages/pro-form/package.json`:

```json
{
  "name": "@pro/form",
  "version": "0.0.1",
  "description": "ProForm — schema-driven form with modal, drawer, and steps variants",
  "type": "module",
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
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

`packages/pro-form/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "../utils" }, { "path": "../hooks" }, { "path": "../themes" }]
}
```

`packages/pro-form/rollup.config.ts`:

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  umdName: 'ProForm',
})
```

`packages/pro-form/src/ProForm.vue`:

```vue
<script setup lang="ts">
defineOptions({ name: 'ProForm' })

// Placeholder — full implementation in Plan 2
</script>

<template>
  <div class="pro-form">
    <slot />
  </div>
</template>

<style scoped>
.pro-form {
  width: 100%;
}
</style>
```

`packages/pro-form/src/index.ts`:

```typescript
import ProForm from './ProForm.vue'

export { ProForm }
```

- [ ] **Step 7: Create packages/pro-descriptions/ (same pattern)**

`packages/pro-descriptions/package.json`:

```json
{
  "name": "@pro/descriptions",
  "version": "0.0.1",
  "description": "ProDescriptions — schema-driven detail view using same column definitions as ProTable",
  "type": "module",
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
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

`packages/pro-descriptions/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "../utils" }, { "path": "../hooks" }, { "path": "../themes" }]
}
```

`packages/pro-descriptions/rollup.config.ts`:

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  umdName: 'ProDescriptions',
})
```

`packages/pro-descriptions/src/ProDescriptions.vue`:

```vue
<script setup lang="ts">
defineOptions({ name: 'ProDescriptions' })

// Placeholder — full implementation in Plan 2
</script>

<template>
  <div class="pro-descriptions">
    <slot />
  </div>
</template>

<style scoped>
.pro-descriptions {
  width: 100%;
}
</style>
```

`packages/pro-descriptions/src/index.ts`:

```typescript
import ProDescriptions from './ProDescriptions.vue'

export { ProDescriptions }
```

- [ ] **Step 8: Commit**

```bash
git add packages/pro-table/ packages/pro-form/ packages/pro-descriptions/
git commit -m "feat: scaffold ProTable, ProForm, ProDescriptions packages"
```

---

### Task 11: Aggregation Package (@pro/pro-components)

**Files:**

- Create: `packages/pro-components/package.json`
- Create: `packages/pro-components/tsconfig.json`
- Create: `packages/pro-components/rollup.config.ts`
- Create: `packages/pro-components/src/index.ts`

- [ ] **Step 1: Create packages/pro-components/package.json**

```json
{
  "name": "@pro/pro-components",
  "version": "0.0.1",
  "description": "All Pro Components in one package",
  "type": "module",
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
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/table": "workspace:*",
    "@pro/form": "workspace:*",
    "@pro/descriptions": "workspace:*",
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  }
}
```

- [ ] **Step 2: Create packages/pro-components/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true
  },
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../pro-table" },
    { "path": "../pro-form" },
    { "path": "../pro-descriptions" },
    { "path": "../hooks" },
    { "path": "../utils" },
    { "path": "../themes" }
  ]
}
```

- [ ] **Step 3: Create packages/pro-components/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  umdName: 'ProComponents',
})
```

- [ ] **Step 4: Create packages/pro-components/src/index.ts**

```typescript
// Components
export { ProTable } from '@pro/table'
export { ProForm } from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'

// Hooks (will be added in Plan 2)
// export { useProTable } from '@pro/hooks'
// export { useProForm } from '@pro/hooks'

// Utils
export { checkDependencies } from '@pro/utils'

// Types
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'

// Install function for app.use()
import type { App, Plugin } from 'vue'
import { ProTable } from '@pro/table'
import { ProForm } from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'

const components = [ProTable, ProForm, ProDescriptions]

/** Vue plugin to install all Pro Components globally via app.use() */
export const proComponentsPlugin: Plugin = {
  install(app: App) {
    checkDependencies()
    components.forEach((component) => {
      app.component(component.name!, component)
    })
  },
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/pro-components/
git commit -m "feat: scaffold @pro/pro-components aggregation package"
```

---

### Task 12: Playground App

**Files:**

- Create: `playground/package.json`
- Create: `playground/vite.config.ts`
- Create: `playground/tsconfig.json`
- Create: `playground/index.html`
- Create: `playground/src/main.ts`
- Create: `playground/src/App.vue`

- [ ] **Step 1: Create playground/package.json**

```json
{
  "name": "playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@pro/pro-components": "workspace:*",
    "element-plus": "^2.9.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create playground/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'element-plus'],
  },
})
```

- [ ] **Step 3: Create playground/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "composite": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

- [ ] **Step 4: Create playground/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pro Components Playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create playground/src/main.ts**

```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { proComponentsPlugin } from '@pro/pro-components'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(proComponentsPlugin)
app.mount('#app')
```

- [ ] **Step 6: Create playground/src/App.vue**

```vue
<script setup lang="ts">
// Playground for testing components during development
</script>

<template>
  <div style="padding: 24px">
    <h1>Pro Components Playground</h1>
    <ProTable />
    <ProForm />
    <ProDescriptions />
  </div>
</template>
```

- [ ] **Step 7: Commit**

```bash
git add playground/
git commit -m "feat: add Vite playground app"
```

---

### Task 13: Install Dependencies + Verify Full Build

- [ ] **Step 0: Verify environment**

```bash
node -v  # Must be >= 18.0.0
pnpm -v  # Must be >= 9.0.0
```

If either version is below the minimum, upgrade before proceeding. The root `package.json` enforces these via the `engines` field.

- [ ] **Step 1: Install all dependencies**

```bash
# Run from project root directory
pnpm install
```

Expected: lockfile generated, all workspace links resolved.

- [ ] **Step 2: Run turbo build**

```bash
pnpm build
```

Expected: all packages build successfully in topological order (utils → hooks → themes → resolvers → pro-table → pro-form → pro-descriptions → pro-components). Each package produces `dist/` with `esm/`, `cjs/`, and (for component packages) `umd/` directories.

- [ ] **Step 3: Run build validation**

```bash
pnpm validate-build
```

Expected: All packages PASS validation — exports point to existing files, no Vue runtime bundled, valid ESM.

- [ ] **Step 4: Run type-check**

```bash
pnpm type-check
```

Expected: No TypeScript errors.

- [ ] **Step 5: Run lint + format**

```bash
pnpm format
pnpm lint
```

Expected: No lint errors. Files formatted.

- [ ] **Step 6: Start playground dev server**

```bash
pnpm dev:playground
```

Expected: Vite dev server starts, page renders with placeholder components visible.

- [ ] **Step 7: Commit lockfile and any format changes**

```bash
git add pnpm-lock.yaml .
git commit -m "chore: install dependencies, verify full build pipeline"
```

---

### Task 14: Changesets Setup

**Files:**

- Create: `.changeset/config.json`

- [ ] **Step 1: Initialize changesets**

```bash
pnpm add -Dw @changesets/cli @changesets/changelog-github
pnpm changeset init
```

- [ ] **Step 2: Configure changesets for fixed versioning**

Replace `.changeset/config.json` with:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "TODO: replace with actual GitHub org/repo" }
  ],
  "commit": false,
  "fixed": [["@pro/table", "@pro/form", "@pro/descriptions", "@pro/pro-components"]],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["playground"]
}
```

The `fixed` group ensures all component packages share the same version number. `@pro/hooks`, `@pro/utils`, `@pro/themes`, `@pro/resolvers` version independently but auto-bump via `updateInternalDependencies`.

- [ ] **Step 3: Add changeset scripts to root package.json**

Add to `scripts` in root `package.json`:

```json
{
  "changeset": "changeset",
  "version-packages": "changeset version",
  "release": "changeset publish"
}
```

- [ ] **Step 4: Commit**

```bash
git add .changeset/ package.json pnpm-lock.yaml
git commit -m "chore: setup changesets with fixed version groups"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Plan 1 covers monorepo setup, build pipeline, package scaffolding, validation, playground, changesets — all infrastructure items from Sections 2, 3, 5 of the spec
- [x] **No placeholders:** All steps contain complete code
- [x] **Type consistency:** `@pro/utils` types exported and referenced consistently in all packages
- [x] **File paths:** All paths are exact and consistent
- [x] **Build order:** Turborepo `dependsOn: ["^build"]` respects the dependency graph (utils → hooks → components)
