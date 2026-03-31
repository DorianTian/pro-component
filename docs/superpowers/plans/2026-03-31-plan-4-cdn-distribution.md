# Plan 4: CDN Distribution

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete CDN distribution chain — from `pro-loader.js` bootstrapping consumer apps via Import Maps, through Service Worker caching and offline fallback, to the build scripts that produce CDN-optimized bundles with SRI hashes. Also deliver the `@pro/vite-plugin` for dev/prod module boundary alignment and integration tests for the full chain.

**Architecture:** Consumer HTML includes a single `<script>` tag pointing to `pro-loader.js`. The loader fetches an import map from the Platform API (CDN edge cached), injects it via `es-module-shims`, adds `<link rel="modulepreload">` and CSS `<link>` tags with SRI integrity, registers a Service Worker for caching/offline, then `import()`s the consumer's app entry. On failure, a cascading fallback chain ensures resilience: API -> SW cache -> localStorage -> hardcoded fallback -> inline error page with retry.

**Tech Stack:** es-module-shims 1.x, Service Worker API, SubtleCrypto (SRI), Rollup 4 (CDN build scripts), Vitest browser mode (integration tests), Vite plugin API (`@pro/vite-plugin`)

---

## File Structure

```
pro-components/
├── cdn/
│   ├── build/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                  # CLI entry: build all packages for CDN
│   │   │   ├── bundle.ts                 # Rollup CDN bundle generation
│   │   │   ├── sri.ts                    # SHA-384 SRI hash calculation
│   │   │   ├── manifest.ts              # CDN manifest generation
│   │   │   └── types.ts                  # Shared types
│   │   └── __tests__/
│   │       ├── sri.test.ts
│   │       └── manifest.test.ts
│   ├── loader/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── pro-loader.ts            # Main loader entry
│   │   │   ├── import-map.ts            # Import map fetch + fallback chain
│   │   │   ├── inject.ts                # DOM injection (import map, preloads, CSS)
│   │   │   ├── sw-register.ts           # Service Worker registration
│   │   │   ├── error-page.ts            # Inline error page renderer
│   │   │   ├── constants.ts             # Default CDN URLs, timeouts
│   │   │   └── types.ts                 # ImportMapResponse type
│   │   ├── pro-sw.ts                    # Service Worker source
│   │   └── __tests__/
│   │       ├── import-map.test.ts
│   │       ├── inject.test.ts
│   │       └── error-page.test.ts
│   └── __tests__/
│       └── integration/
│           ├── cdn-chain.test.ts         # Full chain: import map -> import -> render
│           ├── cdn-failure.test.ts        # CDN failure simulation
│           └── sri-rejection.test.ts      # Tampered file SRI rejection
├── packages/
│   └── vite-plugin/
│       ├── package.json
│       ├── tsconfig.json
│       ├── rollup.config.ts
│       ├── src/
│       │   ├── index.ts                  # Plugin factory
│       │   └── types.ts                  # Plugin options type
│       └── __tests__/
│           └── vite-plugin.test.ts
```

---

### Task 1: CDN Build Scripts — Types + SRI Hash Calculation

**Files:**
- Create: `cdn/build/package.json`
- Create: `cdn/build/tsconfig.json`
- Create: `cdn/build/src/types.ts`
- Create: `cdn/build/src/sri.ts`
- Create: `cdn/build/__tests__/sri.test.ts`

- [ ] **Step 1: Create cdn/build/package.json**

```json
{
  "name": "@pro/cdn-build",
  "version": "0.0.1",
  "private": true,
  "description": "CDN build scripts — generate ESM/UMD bundles with SRI hashes",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsx src/index.ts",
    "test": "vitest run",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "@rollup/plugin-typescript": "^12.0.0",
    "rollup-plugin-vue": "^6.0.0",
    "rollup-plugin-postcss": "^4.0.0",
    "glob": "^11.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create cdn/build/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": "."
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create cdn/build/src/types.ts**

```typescript
/** Per-file SRI hash entry */
export interface SriEntry {
  /** Relative path from CDN root, e.g. "@pro/table/1.2.3/esm/index.mjs" */
  path: string
  /** SHA-384 hash in SRI format: "sha384-<base64>" */
  hash: string
  /** File size in bytes */
  size: number
}

/** CDN manifest for a single package version */
export interface CdnManifest {
  /** Package name, e.g. "@pro/table" */
  name: string
  /** Exact semver version */
  version: string
  /** ESM entry relative to CDN root */
  esmEntry: string
  /** UMD entry relative to CDN root (minified) */
  umdEntry: string
  /** CSS file relative to CDN root */
  cssEntry: string | null
  /** SRI hashes for all files */
  sriHashes: Record<string, string>
  /** Files to modulepreload (dependencies) */
  preloads: string[]
  /** Total bundle size in bytes (ESM) */
  esmSize: number
  /** Build timestamp ISO 8601 */
  builtAt: string
}

/** Rollup CDN build options */
export interface CdnBuildOptions {
  /** Absolute path to packages/ directory */
  packagesDir: string
  /** Absolute path to CDN output directory */
  outputDir: string
  /** CDN base URL, e.g. "https://cdn.internal" */
  cdnBaseUrl: string
  /** Packages to build (default: all) */
  packages?: string[]
}
```

- [ ] **Step 4: Create cdn/build/src/sri.ts**

```typescript
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { glob } from 'glob'
import type { SriEntry } from './types'

/**
 * Calculate SHA-384 SRI hash for a single file.
 * Returns the hash in standard SRI format: "sha384-<base64>"
 */
export async function calculateSriHash(filePath: string): Promise<string> {
  const content = await readFile(filePath)
  const hash = createHash('sha384').update(content).digest('base64')
  return `sha384-${hash}`
}

/**
 * Calculate SRI hashes for a buffer (used in tests or streaming).
 */
export function calculateSriHashFromBuffer(buffer: Buffer): string {
  const hash = createHash('sha384').update(buffer).digest('base64')
  return `sha384-${hash}`
}

/**
 * Calculate SRI hashes for all distributable files in a directory.
 * Only processes .mjs, .js, and .css files.
 */
export async function calculateDirectorySriHashes(
  dir: string,
  baseDir: string,
): Promise<SriEntry[]> {
  const pattern = '**/*.{mjs,js,css}'
  const files = await glob(pattern, { cwd: dir, absolute: true })

  const entries: SriEntry[] = []

  for (const filePath of files) {
    const content = await readFile(filePath)
    const hash = createHash('sha384').update(content).digest('base64')
    const relativePath = relative(baseDir, filePath)

    entries.push({
      path: relativePath,
      hash: `sha384-${hash}`,
      size: content.byteLength,
    })
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Build an SRI hash map from entries: { "path": "sha384-xxx" }
 */
export function sriEntriesToMap(entries: SriEntry[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const entry of entries) {
    map[entry.path] = entry.hash
  }
  return map
}
```

- [ ] **Step 5: Create cdn/build/__tests__/sri.test.ts (TDD)**

```typescript
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import {
  calculateSriHash,
  calculateSriHashFromBuffer,
  calculateDirectorySriHashes,
  sriEntriesToMap,
} from '../src/sri'

const TEST_DIR = resolve(tmpdir(), 'pro-sri-test')

describe('calculateSriHashFromBuffer', () => {
  it('returns sha384 prefixed base64 hash', () => {
    const content = Buffer.from('console.log("hello")')
    const result = calculateSriHashFromBuffer(content)

    expect(result).toMatch(/^sha384-[A-Za-z0-9+/]+=*$/)

    // Verify against Node crypto directly
    const expected = createHash('sha384').update(content).digest('base64')
    expect(result).toBe(`sha384-${expected}`)
  })

  it('produces different hashes for different content', () => {
    const a = calculateSriHashFromBuffer(Buffer.from('file-a'))
    const b = calculateSriHashFromBuffer(Buffer.from('file-b'))
    expect(a).not.toBe(b)
  })

  it('produces identical hash for identical content', () => {
    const content = Buffer.from('identical-content-here')
    const hash1 = calculateSriHashFromBuffer(content)
    const hash2 = calculateSriHashFromBuffer(content)
    expect(hash1).toBe(hash2)
  })
})

describe('calculateSriHash (file-based)', () => {
  it('calculates hash from file path', async () => {
    await mkdir(TEST_DIR, { recursive: true })
    const filePath = resolve(TEST_DIR, 'test.mjs')
    const content = 'export const x = 42'
    await writeFile(filePath, content)

    const hash = await calculateSriHash(filePath)
    const expected = createHash('sha384').update(Buffer.from(content)).digest('base64')

    expect(hash).toBe(`sha384-${expected}`)
    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('calculateDirectorySriHashes', () => {
  it('calculates hashes for .mjs, .js, and .css files only', async () => {
    const dir = resolve(TEST_DIR, 'dist')
    await mkdir(resolve(dir, 'esm'), { recursive: true })
    await mkdir(resolve(dir, 'style'), { recursive: true })

    await writeFile(resolve(dir, 'esm/index.mjs'), 'export default {}')
    await writeFile(resolve(dir, 'style/index.css'), '.pro-table { width: 100% }')
    await writeFile(resolve(dir, 'README.md'), '# ignore this')
    await writeFile(resolve(dir, 'esm/index.d.ts'), 'declare const x: number')

    const entries = await calculateDirectorySriHashes(dir, dir)

    expect(entries).toHaveLength(2)
    expect(entries.map((e) => e.path).sort()).toEqual([
      'esm/index.mjs',
      'style/index.css',
    ])

    for (const entry of entries) {
      expect(entry.hash).toMatch(/^sha384-/)
      expect(entry.size).toBeGreaterThan(0)
    }

    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it('returns sorted entries', async () => {
    const dir = resolve(TEST_DIR, 'sorted')
    await mkdir(dir, { recursive: true })
    await writeFile(resolve(dir, 'z.mjs'), 'z')
    await writeFile(resolve(dir, 'a.mjs'), 'a')
    await writeFile(resolve(dir, 'm.js'), 'm')

    const entries = await calculateDirectorySriHashes(dir, dir)
    const paths = entries.map((e) => e.path)

    expect(paths).toEqual(['a.mjs', 'm.js', 'z.mjs'])

    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('sriEntriesToMap', () => {
  it('converts entries array to path->hash map', () => {
    const entries = [
      { path: 'esm/index.mjs', hash: 'sha384-abc', size: 100 },
      { path: 'style/index.css', hash: 'sha384-def', size: 50 },
    ]

    const map = sriEntriesToMap(entries)

    expect(map).toEqual({
      'esm/index.mjs': 'sha384-abc',
      'style/index.css': 'sha384-def',
    })
  })
})
```

- [ ] **Step 6: Commit**

```bash
git add cdn/build/
git commit -m "feat(cdn): add SRI hash calculation with tests"
```

---

### Task 2: CDN Build Scripts — Bundle Generation + Manifest

**Files:**
- Create: `cdn/build/src/bundle.ts`
- Create: `cdn/build/src/manifest.ts`
- Create: `cdn/build/src/index.ts`
- Create: `cdn/build/__tests__/manifest.test.ts`

- [ ] **Step 1: Create cdn/build/src/bundle.ts**

```typescript
import { resolve, join } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { mkdir, cp } from 'node:fs/promises'
import { rollup } from 'rollup'
import vue from 'rollup-plugin-vue'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import type { CdnBuildOptions } from './types'

interface PackageInfo {
  name: string
  version: string
  dir: string
  inputPath: string
  hasStyles: boolean
}

/**
 * Discover all publishable packages in the workspace.
 */
export function discoverPackages(
  packagesDir: string,
  filter?: string[],
): PackageInfo[] {
  const { readdirSync } = require('node:fs')
  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((d: any) => d.isDirectory())
    .map((d: any) => d.name)

  const packages: PackageInfo[] = []

  for (const dir of dirs) {
    const pkgJsonPath = resolve(packagesDir, dir, 'package.json')
    if (!existsSync(pkgJsonPath)) continue

    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
    if (pkg.private) continue
    if (filter && !filter.includes(pkg.name)) continue

    const inputPath = resolve(packagesDir, dir, 'src/index.ts')
    if (!existsSync(inputPath)) continue

    const hasStyles = existsSync(resolve(packagesDir, dir, 'dist/style/index.css'))

    packages.push({
      name: pkg.name,
      version: pkg.version,
      dir: resolve(packagesDir, dir),
      inputPath,
      hasStyles,
    })
  }

  return packages
}

/**
 * Build a single package for CDN distribution.
 * Produces ESM (minified) and UMD (minified) bundles.
 * Output path: <outputDir>/<name>/<version>/
 */
export async function buildPackageForCdn(
  pkg: PackageInfo,
  outputDir: string,
  cdnBaseUrl: string,
): Promise<string> {
  const versionDir = resolve(outputDir, pkg.name, pkg.version)
  await mkdir(resolve(versionDir, 'esm'), { recursive: true })
  await mkdir(resolve(versionDir, 'umd'), { recursive: true })

  // ESM build — external Vue, Element Plus, all @pro/* deps
  const esmBundle = await rollup({
    input: pkg.inputPath,
    external: [
      'vue',
      'element-plus',
      /^@pro\//,
      /^@vue\//,
    ],
    plugins: [
      vue(),
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      typescript({
        tsconfig: resolve(pkg.dir, 'tsconfig.json'),
        declaration: false,
        sourceMap: false,
      }),
      postcss({ extract: resolve(versionDir, 'style/index.css'), minimize: true }),
      terser({ format: { comments: false } }),
    ],
  })

  await esmBundle.write({
    format: 'esm',
    dir: resolve(versionDir, 'esm'),
    entryFileNames: 'index.mjs',
    chunkFileNames: '[name]-[hash].mjs',
  })
  await esmBundle.close()

  // UMD build — only external Vue + Element Plus, bundle @pro/* deps
  const umdBundle = await rollup({
    input: pkg.inputPath,
    external: ['vue', 'element-plus'],
    plugins: [
      vue(),
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      typescript({
        tsconfig: resolve(pkg.dir, 'tsconfig.json'),
        declaration: false,
        sourceMap: true,
      }),
      postcss({ inject: true, minimize: true }),
      terser({ format: { comments: false } }),
    ],
  })

  await umdBundle.write({
    format: 'umd',
    file: resolve(versionDir, 'umd/index.min.js'),
    name: pkg.name.replace('@pro/', 'Pro').replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase()),
    globals: { vue: 'Vue', 'element-plus': 'ElementPlus' },
    exports: 'named',
    sourcemap: true,
  })
  await umdBundle.close()

  // Copy pre-built CSS if exists (from the regular Rollup build)
  if (pkg.hasStyles) {
    const srcCss = resolve(pkg.dir, 'dist/style/index.css')
    const destCss = resolve(versionDir, 'style/index.css')
    await mkdir(resolve(versionDir, 'style'), { recursive: true })
    await cp(srcCss, destCss)
  }

  return versionDir
}
```

- [ ] **Step 2: Create cdn/build/src/manifest.ts**

```typescript
import { resolve } from 'node:path'
import { calculateDirectorySriHashes, sriEntriesToMap } from './sri'
import type { CdnManifest, SriEntry } from './types'

/**
 * Generate a CDN manifest for a built package version.
 *
 * @param name       Package name, e.g. "@pro/table"
 * @param version    Semver version, e.g. "1.2.3"
 * @param versionDir Absolute path to the built version directory
 * @param cdnBaseUrl CDN base URL, e.g. "https://cdn.internal"
 */
export async function generateManifest(
  name: string,
  version: string,
  versionDir: string,
  cdnBaseUrl: string,
): Promise<CdnManifest> {
  const entries = await calculateDirectorySriHashes(versionDir, versionDir)
  const sriHashes = sriEntriesToMap(entries)

  const cdnPrefix = `${cdnBaseUrl}/${name}/${version}`

  const esmEntry = `${cdnPrefix}/esm/index.mjs`
  const umdEntry = `${cdnPrefix}/umd/index.min.js`

  const cssFile = entries.find((e) => e.path.endsWith('.css'))
  const cssEntry = cssFile ? `${cdnPrefix}/${cssFile.path}` : null

  // Convert local paths to CDN URLs in sriHashes
  const cdnSriHashes: Record<string, string> = {}
  for (const [path, hash] of Object.entries(sriHashes)) {
    cdnSriHashes[`${cdnPrefix}/${path}`] = hash
  }

  // ESM size = sum of all .mjs files
  const esmSize = entries
    .filter((e) => e.path.endsWith('.mjs'))
    .reduce((sum, e) => sum + e.size, 0)

  // Preloads: all .mjs chunk files (not the entry)
  const preloads = entries
    .filter((e) => e.path.endsWith('.mjs') && e.path !== 'esm/index.mjs')
    .map((e) => `${cdnPrefix}/${e.path}`)

  return {
    name,
    version,
    esmEntry,
    umdEntry,
    cssEntry,
    sriHashes: cdnSriHashes,
    preloads,
    esmSize,
    builtAt: new Date().toISOString(),
  }
}

/**
 * Merge multiple package manifests into a combined import map response
 * matching the Platform API format (Section 6 of design spec).
 */
export function mergeManifestsToImportMap(
  manifests: CdnManifest[],
): {
  imports: Record<string, string>
  preloads: string[]
  styles: string[]
  sriHashes: Record<string, string>
} {
  const imports: Record<string, string> = {}
  const preloads: string[] = []
  const styles: string[] = []
  const sriHashes: Record<string, string> = {}

  for (const manifest of manifests) {
    imports[manifest.name] = manifest.esmEntry
    preloads.push(...manifest.preloads)

    if (manifest.cssEntry) {
      styles.push(manifest.cssEntry)
    }

    Object.assign(sriHashes, manifest.sriHashes)
  }

  return { imports, preloads, styles, sriHashes }
}
```

- [ ] **Step 3: Create cdn/build/src/index.ts**

```typescript
import { resolve } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { discoverPackages, buildPackageForCdn } from './bundle'
import { generateManifest } from './manifest'
import type { CdnBuildOptions, CdnManifest } from './types'

/**
 * Build all packages for CDN distribution.
 *
 * Usage:
 *   tsx cdn/build/src/index.ts [--packages @pro/table,@pro/form] [--output cdn/dist] [--base-url https://cdn.internal]
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  const packagesDir = resolve(import.meta.dirname, '../../packages')
  const outputDir = resolve(import.meta.dirname, '../dist')
  const cdnBaseUrl = getArg(args, '--base-url') ?? 'https://cdn.internal'
  const packageFilter = getArg(args, '--packages')?.split(',')

  const options: CdnBuildOptions = {
    packagesDir,
    outputDir,
    cdnBaseUrl,
    packages: packageFilter,
  }

  console.log(`[cdn-build] Discovering packages in ${options.packagesDir}`)
  const packages = discoverPackages(options.packagesDir, options.packages)

  if (packages.length === 0) {
    console.warn('[cdn-build] No packages found to build')
    process.exit(1)
  }

  console.log(`[cdn-build] Building ${packages.length} packages for CDN`)

  const manifests: CdnManifest[] = []

  for (const pkg of packages) {
    console.log(`[cdn-build] Building ${pkg.name}@${pkg.version}`)

    const versionDir = await buildPackageForCdn(pkg, options.outputDir, options.cdnBaseUrl)
    const manifest = await generateManifest(pkg.name, pkg.version, versionDir, options.cdnBaseUrl)

    manifests.push(manifest)

    // Write per-package manifest
    const manifestPath = resolve(versionDir, 'manifest.json')
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`[cdn-build]   -> ${manifestPath}`)
  }

  // Write combined manifest
  const combinedPath = resolve(options.outputDir, 'cdn-manifest.json')
  await mkdir(resolve(options.outputDir), { recursive: true })
  await writeFile(combinedPath, JSON.stringify(manifests, null, 2))
  console.log(`[cdn-build] Combined manifest: ${combinedPath}`)

  // Print summary
  console.log('\n[cdn-build] Summary:')
  for (const m of manifests) {
    const sriCount = Object.keys(m.sriHashes).length
    console.log(`  ${m.name}@${m.version} — ESM: ${formatBytes(m.esmSize)}, SRI: ${sriCount} files`)
  }
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx >= 0 ? args[idx + 1] : undefined
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

main().catch((err) => {
  console.error('[cdn-build] Fatal error:', err)
  process.exit(1)
})
```

- [ ] **Step 4: Create cdn/build/__tests__/manifest.test.ts (TDD)**

```typescript
import { describe, it, expect } from 'vitest'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { generateManifest } from '../src/manifest'
import { mergeManifestsToImportMap } from '../src/manifest'
import type { CdnManifest } from '../src/types'

const TEST_DIR = resolve(tmpdir(), 'pro-manifest-test')

describe('generateManifest', () => {
  it('generates manifest with correct CDN URLs and SRI hashes', async () => {
    const versionDir = resolve(TEST_DIR, 'gen-manifest')
    await mkdir(resolve(versionDir, 'esm'), { recursive: true })
    await mkdir(resolve(versionDir, 'umd'), { recursive: true })
    await mkdir(resolve(versionDir, 'style'), { recursive: true })

    await writeFile(resolve(versionDir, 'esm/index.mjs'), 'export const ProTable = {}')
    await writeFile(resolve(versionDir, 'umd/index.min.js'), '!function(){}()')
    await writeFile(resolve(versionDir, 'style/index.css'), '.pro-table{}')

    const manifest = await generateManifest(
      '@pro/table',
      '1.2.3',
      versionDir,
      'https://cdn.internal',
    )

    expect(manifest.name).toBe('@pro/table')
    expect(manifest.version).toBe('1.2.3')
    expect(manifest.esmEntry).toBe('https://cdn.internal/@pro/table/1.2.3/esm/index.mjs')
    expect(manifest.umdEntry).toBe('https://cdn.internal/@pro/table/1.2.3/umd/index.min.js')
    expect(manifest.cssEntry).toBe('https://cdn.internal/@pro/table/1.2.3/style/index.css')

    // SRI hashes use full CDN URLs as keys
    const sriKeys = Object.keys(manifest.sriHashes)
    expect(sriKeys).toContain('https://cdn.internal/@pro/table/1.2.3/esm/index.mjs')
    expect(sriKeys).toContain('https://cdn.internal/@pro/table/1.2.3/style/index.css')

    // All hash values are sha384-prefixed
    for (const hash of Object.values(manifest.sriHashes)) {
      expect(hash).toMatch(/^sha384-/)
    }

    expect(manifest.esmSize).toBeGreaterThan(0)
    expect(manifest.builtAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it('sets cssEntry to null when no CSS exists', async () => {
    const versionDir = resolve(TEST_DIR, 'no-css')
    await mkdir(resolve(versionDir, 'esm'), { recursive: true })
    await writeFile(resolve(versionDir, 'esm/index.mjs'), 'export const x = 1')

    const manifest = await generateManifest(
      '@pro/utils',
      '1.0.0',
      versionDir,
      'https://cdn.internal',
    )

    expect(manifest.cssEntry).toBeNull()

    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('mergeManifestsToImportMap', () => {
  it('merges multiple manifests into import map format', () => {
    const manifests: CdnManifest[] = [
      {
        name: '@pro/table',
        version: '1.2.3',
        esmEntry: 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/table/1.2.3/umd/index.min.js',
        cssEntry: 'https://cdn.internal/@pro/table/1.2.3/style/index.css',
        sriHashes: {
          'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-aaa',
        },
        preloads: ['https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs'],
        esmSize: 5000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
      {
        name: '@pro/form',
        version: '1.1.0',
        esmEntry: 'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/form/1.1.0/umd/index.min.js',
        cssEntry: 'https://cdn.internal/@pro/form/1.1.0/style/index.css',
        sriHashes: {
          'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs': 'sha384-bbb',
        },
        preloads: [],
        esmSize: 3000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const result = mergeManifestsToImportMap(manifests)

    expect(result.imports).toEqual({
      '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
      '@pro/form': 'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs',
    })

    expect(result.styles).toEqual([
      'https://cdn.internal/@pro/table/1.2.3/style/index.css',
      'https://cdn.internal/@pro/form/1.1.0/style/index.css',
    ])

    expect(result.preloads).toEqual([
      'https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs',
    ])

    expect(result.sriHashes).toEqual({
      'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-aaa',
      'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs': 'sha384-bbb',
    })
  })

  it('handles manifests with no CSS', () => {
    const manifests: CdnManifest[] = [
      {
        name: '@pro/utils',
        version: '1.0.0',
        esmEntry: 'https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/utils/1.0.0/umd/index.min.js',
        cssEntry: null,
        sriHashes: {},
        preloads: [],
        esmSize: 1000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const result = mergeManifestsToImportMap(manifests)
    expect(result.styles).toEqual([])
  })
})
```

- [ ] **Step 5: Commit**

```bash
git add cdn/build/
git commit -m "feat(cdn): add bundle generation and manifest with tests"
```

---

### Task 3: Loader Types + Constants

**Files:**
- Create: `cdn/loader/package.json`
- Create: `cdn/loader/tsconfig.json`
- Create: `cdn/loader/src/types.ts`
- Create: `cdn/loader/src/constants.ts`

- [ ] **Step 1: Create cdn/loader/package.json**

```json
{
  "name": "@pro/cdn-loader",
  "version": "0.0.1",
  "private": true,
  "description": "pro-loader.js — CDN bootstrap loader with Import Maps, SW, and fallback chain",
  "type": "module",
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "test": "vitest run",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "@rollup/plugin-typescript": "^12.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2: Create cdn/loader/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"]
  },
  "include": ["src/**/*.ts", "pro-sw.ts"]
}
```

- [ ] **Step 3: Create cdn/loader/src/types.ts**

```typescript
/**
 * Import Map API response from Platform server.
 * Matches the format defined in design spec Section 6.
 */
export interface ImportMapResponse {
  /** Import map specifier -> URL mapping */
  imports: Record<string, string>
  /** URLs to modulepreload (shared dependencies) */
  preloads: string[]
  /** CSS stylesheet URLs to inject */
  styles: string[]
  /** SRI hashes: URL -> "sha384-<base64>" */
  sriHashes: Record<string, string>
  /** When true, loader must clear SW cache (rollback scenario) */
  cache_bust: boolean
}

/** Parsed attributes from the loader script tag */
export interface LoaderConfig {
  /** Consumer app entry point, e.g. "/src/main.ts" */
  appEntry: string
  /** App ID for import map resolution */
  appId: string
  /** User ID for grayscale matching */
  userId: string
  /** Platform API base URL */
  apiBaseUrl: string
  /** CDN base URL for es-module-shims */
  cdnBaseUrl: string
  /** Import map API fetch timeout in ms */
  fetchTimeout: number
}

/** Fallback source identifier for diagnostics */
export type FallbackSource =
  | 'api'
  | 'sw-cache'
  | 'localstorage'
  | 'hardcoded'
  | 'error-page'
```

- [ ] **Step 4: Create cdn/loader/src/constants.ts**

```typescript
import type { ImportMapResponse } from './types'

/** Default API base URL */
export const DEFAULT_API_BASE_URL = 'https://platform.internal/api/v1'

/** Default CDN base URL */
export const DEFAULT_CDN_BASE_URL = 'https://cdn.internal'

/** es-module-shims CDN URL */
export const ES_MODULE_SHIMS_URL =
  'https://cdn.internal/vendor/es-module-shims/1.10.0/es-module-shims.min.js'

/** Import map API fetch timeout (ms) */
export const FETCH_TIMEOUT_MS = 5000

/** localStorage key for cached import map */
export const LS_IMPORT_MAP_KEY = 'pro:import-map'

/** localStorage key for cached import map timestamp */
export const LS_IMPORT_MAP_TS_KEY = 'pro:import-map:ts'

/** Max age for localStorage cached import map (ms) — 1 hour */
export const LS_MAX_AGE_MS = 60 * 60 * 1000

/** Service Worker script path (relative to loader) */
export const SW_SCRIPT_PATH = '/pro-sw.js'

/** SW cache name */
export const SW_CACHE_NAME = 'pro-cdn-cache-v1'

/** SW cache channel name for cross-tab communication */
export const SW_CACHE_CHANNEL = 'pro-sw-channel'

/**
 * Hardcoded fallback import map — absolute last resort before error page.
 * Points to known stable versions. Updated on each loader release.
 */
export const HARDCODED_FALLBACK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    'element-plus':
      'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.full.mjs',
    '@pro/table': 'https://cdn.internal/@pro/table/0.0.1/esm/index.mjs',
    '@pro/form': 'https://cdn.internal/@pro/form/0.0.1/esm/index.mjs',
    '@pro/descriptions':
      'https://cdn.internal/@pro/descriptions/0.0.1/esm/index.mjs',
    '@pro/hooks': 'https://cdn.internal/@pro/hooks/0.0.1/esm/index.mjs',
    '@pro/utils': 'https://cdn.internal/@pro/utils/0.0.1/esm/index.mjs',
  },
  preloads: [],
  styles: [
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css',
  ],
  sriHashes: {},
  cache_bust: false,
}
```

- [ ] **Step 5: Commit**

```bash
git add cdn/loader/
git commit -m "feat(cdn): add loader types and constants"
```

---

### Task 4: Import Map Fetch + Fallback Chain

**Files:**
- Create: `cdn/loader/src/import-map.ts`
- Create: `cdn/loader/__tests__/import-map.test.ts`

- [ ] **Step 1: Create cdn/loader/src/import-map.ts**

```typescript
import type { ImportMapResponse, LoaderConfig, FallbackSource } from './types'
import {
  FETCH_TIMEOUT_MS,
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
  LS_MAX_AGE_MS,
  HARDCODED_FALLBACK_IMPORT_MAP,
} from './constants'

interface ImportMapResult {
  importMap: ImportMapResponse
  source: FallbackSource
}

/**
 * Fetch import map from Platform API with AbortController timeout.
 */
async function fetchFromApi(config: LoaderConfig): Promise<ImportMapResponse> {
  const url = `${config.apiBaseUrl}/import-map?appId=${encodeURIComponent(config.appId)}&userId=${encodeURIComponent(config.userId)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.fetchTimeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`)
    }

    const data: ImportMapResponse = await response.json()
    return data
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Try to read cached import map from Service Worker via MessageChannel.
 * SW stores the last successful API response in Cache Storage.
 */
async function fetchFromSwCache(): Promise<ImportMapResponse | null> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return null
  }

  return new Promise<ImportMapResponse | null>((resolve) => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => resolve(null), 2000)

    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      if (event.data?.type === 'IMPORT_MAP_CACHED' && event.data.importMap) {
        resolve(event.data.importMap as ImportMapResponse)
      } else {
        resolve(null)
      }
    }

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_CACHED_IMPORT_MAP' },
      [channel.port2],
    )
  })
}

/**
 * Try to read cached import map from localStorage.
 * Expires after LS_MAX_AGE_MS.
 */
function fetchFromLocalStorage(): ImportMapResponse | null {
  try {
    const tsRaw = localStorage.getItem(LS_IMPORT_MAP_TS_KEY)
    if (!tsRaw) return null

    const ts = parseInt(tsRaw, 10)
    if (Date.now() - ts > LS_MAX_AGE_MS) {
      localStorage.removeItem(LS_IMPORT_MAP_KEY)
      localStorage.removeItem(LS_IMPORT_MAP_TS_KEY)
      return null
    }

    const raw = localStorage.getItem(LS_IMPORT_MAP_KEY)
    if (!raw) return null

    return JSON.parse(raw) as ImportMapResponse
  } catch {
    return null
  }
}

/**
 * Persist import map to localStorage for offline fallback.
 */
function saveToLocalStorage(importMap: ImportMapResponse): void {
  try {
    localStorage.setItem(LS_IMPORT_MAP_KEY, JSON.stringify(importMap))
    localStorage.setItem(LS_IMPORT_MAP_TS_KEY, String(Date.now()))
  } catch {
    // localStorage full or disabled — non-critical
  }
}

/**
 * Notify SW to cache the import map response.
 */
function notifySwToCache(importMap: ImportMapResponse): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_IMPORT_MAP',
      importMap,
    })
  }
}

/**
 * Resolve import map using the fallback chain:
 *   1. API fetch (with timeout)
 *   2. Service Worker cache
 *   3. localStorage cache (with expiry)
 *   4. Hardcoded fallback
 *
 * On success from API, caches result to SW + localStorage for future fallback.
 * Returns the import map and which source it came from (for diagnostics).
 */
export async function resolveImportMap(config: LoaderConfig): Promise<ImportMapResult> {
  // 1. Try API
  try {
    const importMap = await fetchFromApi(config)
    // Cache for future fallback
    saveToLocalStorage(importMap)
    notifySwToCache(importMap)
    return { importMap, source: 'api' }
  } catch (apiError) {
    console.warn('[pro-loader] API fetch failed, trying SW cache:', apiError)
  }

  // 2. Try Service Worker cache
  try {
    const cached = await fetchFromSwCache()
    if (cached) {
      return { importMap: cached, source: 'sw-cache' }
    }
  } catch {
    console.warn('[pro-loader] SW cache unavailable')
  }

  // 3. Try localStorage
  const lsCached = fetchFromLocalStorage()
  if (lsCached) {
    console.warn('[pro-loader] Using localStorage cached import map')
    return { importMap: lsCached, source: 'localstorage' }
  }

  // 4. Hardcoded fallback
  console.warn('[pro-loader] All sources failed, using hardcoded fallback')
  return { importMap: HARDCODED_FALLBACK_IMPORT_MAP, source: 'hardcoded' }
}

// Export internal functions for testing
export const _internal = {
  fetchFromApi,
  fetchFromSwCache,
  fetchFromLocalStorage,
  saveToLocalStorage,
}
```

- [ ] **Step 2: Create cdn/loader/__tests__/import-map.test.ts (TDD)**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveImportMap, _internal } from '../src/import-map'
import type { ImportMapResponse, LoaderConfig } from '../src/types'
import {
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
  HARDCODED_FALLBACK_IMPORT_MAP,
} from '../src/constants'

const MOCK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [],
  styles: ['https://cdn.internal/@pro/table/1.2.3/style/index.css'],
  sriHashes: {
    'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-abc123',
  },
  cache_bust: false,
}

const MOCK_CONFIG: LoaderConfig = {
  appEntry: '/src/main.ts',
  appId: 'test-app',
  userId: 'user-1',
  apiBaseUrl: 'https://platform.internal/api/v1',
  cdnBaseUrl: 'https://cdn.internal',
  fetchTimeout: 5000,
}

describe('resolveImportMap', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
    })

    // Mock navigator.serviceWorker (not available)
    vi.stubGlobal('navigator', {
      serviceWorker: undefined,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns API response on success and caches to localStorage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_IMPORT_MAP),
    }))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('api')
    expect(result.importMap).toEqual(MOCK_IMPORT_MAP)

    // Verify cached to localStorage
    expect(mockLocalStorage[LS_IMPORT_MAP_KEY]).toBe(JSON.stringify(MOCK_IMPORT_MAP))
    expect(mockLocalStorage[LS_IMPORT_MAP_TS_KEY]).toBeDefined()
  })

  it('falls back to localStorage when API fails', async () => {
    // Pre-populate localStorage
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('localstorage')
    expect(result.importMap).toEqual(MOCK_IMPORT_MAP)
  })

  it('ignores expired localStorage cache', async () => {
    // Set expired cache (2 hours ago)
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now() - 2 * 60 * 60 * 1000)

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap).toEqual(HARDCODED_FALLBACK_IMPORT_MAP)
  })

  it('falls back to hardcoded when all sources fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap.imports).toHaveProperty('vue')
    expect(result.importMap.imports).toHaveProperty('@pro/table')
  })

  it('sends correct API URL with appId and userId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_IMPORT_MAP),
    })
    vi.stubGlobal('fetch', mockFetch)

    await resolveImportMap(MOCK_CONFIG)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://platform.internal/api/v1/import-map?appId=test-app&userId=user-1',
      expect.objectContaining({
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('handles API non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }))

    const result = await resolveImportMap(MOCK_CONFIG)
    // Should fall through to hardcoded (no SW, no localStorage)
    expect(result.source).toBe('hardcoded')
  })
})

describe('localStorage functions', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetchFromLocalStorage returns null when empty', () => {
    const result = _internal.fetchFromLocalStorage()
    expect(result).toBeNull()
  })

  it('fetchFromLocalStorage returns parsed import map when fresh', () => {
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = _internal.fetchFromLocalStorage()
    expect(result).toEqual(MOCK_IMPORT_MAP)
  })

  it('saveToLocalStorage persists correctly', () => {
    _internal.saveToLocalStorage(MOCK_IMPORT_MAP)

    expect(mockLocalStorage[LS_IMPORT_MAP_KEY]).toBe(JSON.stringify(MOCK_IMPORT_MAP))
    expect(parseInt(mockLocalStorage[LS_IMPORT_MAP_TS_KEY], 10)).toBeCloseTo(Date.now(), -2)
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add cdn/loader/
git commit -m "feat(cdn): implement import map fetch with fallback chain and tests"
```

---

### Task 5: DOM Injection — Import Map, Preloads, CSS

**Files:**
- Create: `cdn/loader/src/inject.ts`
- Create: `cdn/loader/__tests__/inject.test.ts`

- [ ] **Step 1: Create cdn/loader/src/inject.ts**

```typescript
import type { ImportMapResponse } from './types'

/**
 * Inject import map into the document via es-module-shims.
 *
 * es-module-shims supports dynamically injected import maps
 * using <script type="importmap-shim"> or the shimMode API.
 * We use the shim type to avoid issues with browsers that don't
 * support multiple import maps.
 */
export function injectImportMap(importMap: ImportMapResponse): void {
  const script = document.createElement('script')
  script.type = 'importmap-shim'
  script.textContent = JSON.stringify({
    imports: importMap.imports,
  })
  document.head.appendChild(script)
}

/**
 * Inject <link rel="modulepreload-shim"> for shared dependencies.
 * These are loaded in parallel with the app entry, reducing waterfall.
 *
 * SRI integrity attributes are added when available.
 */
export function injectModulePreloads(
  preloads: string[],
  sriHashes: Record<string, string>,
): void {
  for (const url of preloads) {
    const link = document.createElement('link')
    link.rel = 'modulepreload-shim'
    link.href = url
    link.crossOrigin = 'anonymous'

    const hash = sriHashes[url]
    if (hash) {
      link.integrity = hash
    }

    document.head.appendChild(link)
  }
}

/**
 * Inject CSS <link> tags for component styles.
 * Each link has crossorigin="anonymous" for CORS CDN resources.
 * SRI integrity attributes are added when available.
 */
export function injectStylesheets(
  styles: string[],
  sriHashes: Record<string, string>,
): void {
  for (const url of styles) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = 'anonymous'

    const hash = sriHashes[url]
    if (hash) {
      link.integrity = hash
    }

    document.head.appendChild(link)
  }
}

/**
 * Load es-module-shims polyfill.
 * Returns a Promise that resolves when the script is loaded.
 */
export function loadEsModuleShims(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if ((window as any).importShim) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = url
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load es-module-shims from ${url}`))
    document.head.appendChild(script)
  })
}

/**
 * Bootstrap the consumer application by importing its entry module.
 * Uses es-module-shims' importShim() for consistent behavior.
 */
export async function bootstrapApp(appEntry: string): Promise<void> {
  const importShim = (window as any).importShim
  if (typeof importShim !== 'function') {
    throw new Error('[pro-loader] es-module-shims not loaded — importShim is not a function')
  }

  await importShim(appEntry)
}

/**
 * Inject all resources from an import map response in the correct order:
 * 1. Import map (specifier -> URL mapping)
 * 2. Modulepreload links (parallel dependency loading)
 * 3. CSS stylesheets
 */
export function injectAll(importMap: ImportMapResponse): void {
  injectImportMap(importMap)
  injectModulePreloads(importMap.preloads, importMap.sriHashes)
  injectStylesheets(importMap.styles, importMap.sriHashes)
}
```

- [ ] **Step 2: Create cdn/loader/__tests__/inject.test.ts (TDD)**

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  injectImportMap,
  injectModulePreloads,
  injectStylesheets,
  injectAll,
  loadEsModuleShims,
  bootstrapApp,
} from '../src/inject'
import type { ImportMapResponse } from '../src/types'

const MOCK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [
    'https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs',
    'https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs',
  ],
  styles: [
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css',
  ],
  sriHashes: {
    'https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs': 'sha384-hookhash',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css': 'sha384-csshash',
  },
  cache_bust: false,
}

describe('injectImportMap', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates a script[type="importmap-shim"] in document head', () => {
    injectImportMap(MOCK_IMPORT_MAP)

    const script = document.querySelector('script[type="importmap-shim"]')
    expect(script).not.toBeNull()

    const parsed = JSON.parse(script!.textContent!)
    expect(parsed.imports['@pro/table']).toBe(
      'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    )
    expect(parsed.imports.vue).toBe(
      'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    )
  })
})

describe('injectModulePreloads', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates modulepreload-shim links for each preload URL', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(links).toHaveLength(2)

    const hrefs = Array.from(links).map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs')
    expect(hrefs).toContain('https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs')
  })

  it('adds SRI integrity attribute when hash is available', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const hookLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs"]',
    )
    expect(hookLink?.getAttribute('integrity')).toBe('sha384-hookhash')
  })

  it('omits integrity when no hash available', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const utilsLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs"]',
    )
    expect(utilsLink?.getAttribute('integrity')).toBeNull()
  })

  it('sets crossorigin="anonymous" on all links', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    for (const link of links) {
      expect(link.getAttribute('crossorigin')).toBe('anonymous')
    }
  })
})

describe('injectStylesheets', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates stylesheet links for each CSS URL', () => {
    injectStylesheets(MOCK_IMPORT_MAP.styles, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="stylesheet"]')
    expect(links).toHaveLength(2)
  })

  it('adds SRI integrity when hash available', () => {
    injectStylesheets(MOCK_IMPORT_MAP.styles, MOCK_IMPORT_MAP.sriHashes)

    const tableLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/table/1.2.3/style/index.css"]',
    )
    expect(tableLink?.getAttribute('integrity')).toBe('sha384-csshash')
  })
})

describe('injectAll', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('injects import map, preloads, and styles in one call', () => {
    injectAll(MOCK_IMPORT_MAP)

    expect(document.querySelector('script[type="importmap-shim"]')).not.toBeNull()
    expect(document.querySelectorAll('link[rel="modulepreload-shim"]')).toHaveLength(2)
    expect(document.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(2)
  })
})

describe('loadEsModuleShims', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    delete (window as any).importShim
  })

  it('resolves immediately if importShim already exists', async () => {
    ;(window as any).importShim = vi.fn()

    await expect(loadEsModuleShims('https://cdn.internal/es-module-shims.js')).resolves.toBeUndefined()

    // Should NOT add a new script tag
    expect(document.querySelector('script[src]')).toBeNull()
  })

  it('creates a script tag with the given URL', () => {
    // Don't await — we're just checking DOM injection
    loadEsModuleShims('https://cdn.internal/es-module-shims.js').catch(() => {})

    const script = document.querySelector('script[src="https://cdn.internal/es-module-shims.js"]')
    expect(script).not.toBeNull()
    expect(script?.getAttribute('async')).toBe('')
  })
})

describe('bootstrapApp', () => {
  it('throws if importShim is not available', async () => {
    delete (window as any).importShim

    await expect(bootstrapApp('/src/main.ts')).rejects.toThrow('importShim is not a function')
  })

  it('calls importShim with app entry', async () => {
    const mockImportShim = vi.fn().mockResolvedValue(undefined)
    ;(window as any).importShim = mockImportShim

    await bootstrapApp('/src/main.ts')

    expect(mockImportShim).toHaveBeenCalledWith('/src/main.ts')
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add cdn/loader/src/inject.ts cdn/loader/__tests__/inject.test.ts
git commit -m "feat(cdn): implement DOM injection for import map, preloads, and CSS"
```

---

### Task 6: Error Page + Service Worker Registration

**Files:**
- Create: `cdn/loader/src/error-page.ts`
- Create: `cdn/loader/src/sw-register.ts`
- Create: `cdn/loader/__tests__/error-page.test.ts`

- [ ] **Step 1: Create cdn/loader/src/error-page.ts**

```typescript
/**
 * Render an inline error page when all fallback sources fail
 * and the app cannot bootstrap.
 *
 * The error page is self-contained HTML/CSS injected into document.body.
 * It includes a retry button and diagnostic info.
 */
export function renderErrorPage(error: Error, diagnostics: ErrorDiagnostics): void {
  const html = buildErrorPageHtml(error, diagnostics)
  document.body.innerHTML = html

  // Bind retry button
  const retryBtn = document.getElementById('pro-error-retry')
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      window.location.reload()
    })
  }
}

export interface ErrorDiagnostics {
  appId: string
  userId: string
  failedSources: string[]
  timestamp: string
  userAgent: string
}

/**
 * Build self-contained error page HTML.
 * No external dependencies — all CSS is inline.
 */
export function buildErrorPageHtml(error: Error, diagnostics: ErrorDiagnostics): string {
  return `
<div id="pro-error-container" style="
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
">
  <div style="
    max-width: 520px;
    width: 100%;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    padding: 40px 32px;
    text-align: center;
  ">
    <div style="font-size: 48px; margin-bottom: 16px;">&#9888;&#65039;</div>
    <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
      Application Failed to Load
    </h1>
    <p style="font-size: 14px; color: #666; margin: 0 0 24px; line-height: 1.6;">
      We were unable to load the required resources. This may be a temporary network issue.
    </p>
    <button id="pro-error-retry" style="
      display: inline-block;
      padding: 10px 32px;
      background-color: #409eff;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    " onmouseover="this.style.backgroundColor='#337ecc'"
       onmouseout="this.style.backgroundColor='#409eff'">
      Retry
    </button>
    <details style="
      margin-top: 24px;
      text-align: left;
      font-size: 12px;
      color: #999;
    ">
      <summary style="cursor: pointer; margin-bottom: 8px;">Diagnostic Info</summary>
      <pre style="
        background: #f9f9f9;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        font-size: 11px;
        line-height: 1.5;
      ">${escapeHtml(JSON.stringify({
        error: error.message,
        appId: diagnostics.appId,
        userId: diagnostics.userId,
        failedSources: diagnostics.failedSources,
        timestamp: diagnostics.timestamp,
        userAgent: diagnostics.userAgent,
      }, null, 2))}</pre>
    </details>
  </div>
</div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
```

- [ ] **Step 2: Create cdn/loader/src/sw-register.ts**

```typescript
import { SW_SCRIPT_PATH } from './constants'
import type { ImportMapResponse } from './types'

/**
 * Register or update the pro-sw.js Service Worker.
 *
 * SW is responsible for:
 * - Caching CDN resources (ESM modules, CSS)
 * - Providing offline fallback for cached resources
 * - Handling cache_bust signals (clearing cache on rollback)
 *
 * Registration is fire-and-forget — it should not block app bootstrap.
 */
export async function registerServiceWorker(
  importMap: ImportMapResponse,
  swPath?: string,
): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[pro-loader] Service Worker not supported in this browser')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath ?? SW_SCRIPT_PATH, {
      scope: '/',
    })

    // If cache_bust is true (rollback scenario), tell SW to clear cache
    if (importMap.cache_bust) {
      await notifyCacheBust(registration)
    }

    // Pass the current import map URLs to SW for pre-caching
    await notifyPrecache(registration, importMap)

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('[pro-loader] Service Worker updated and activated')
          }
        })
      }
    })
  } catch (err) {
    // SW registration failure is non-critical
    console.warn('[pro-loader] Service Worker registration failed:', err)
  }
}

/**
 * Send cache_bust command to SW — clears all cached CDN resources.
 * Used during rollback when stale cached versions must be purged.
 */
async function notifyCacheBust(registration: ServiceWorkerRegistration): Promise<void> {
  const worker = registration.active ?? registration.installing ?? registration.waiting
  if (!worker) return

  worker.postMessage({ type: 'CACHE_BUST' })
  console.log('[pro-loader] Sent CACHE_BUST to Service Worker')
}

/**
 * Send the list of URLs from the import map to SW for pre-caching.
 */
async function notifyPrecache(
  registration: ServiceWorkerRegistration,
  importMap: ImportMapResponse,
): Promise<void> {
  const worker = registration.active ?? registration.installing ?? registration.waiting
  if (!worker) return

  const urls = [
    ...Object.values(importMap.imports),
    ...importMap.preloads,
    ...importMap.styles,
  ]

  worker.postMessage({ type: 'PRECACHE', urls })
}
```

- [ ] **Step 3: Create cdn/loader/__tests__/error-page.test.ts (TDD)**

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { buildErrorPageHtml, renderErrorPage } from '../src/error-page'
import type { ErrorDiagnostics } from '../src/error-page'

const MOCK_DIAGNOSTICS: ErrorDiagnostics = {
  appId: 'user-center',
  userId: 'dorian',
  failedSources: ['api', 'sw-cache', 'localstorage'],
  timestamp: '2026-03-30T12:00:00.000Z',
  userAgent: 'Mozilla/5.0 Test',
}

describe('buildErrorPageHtml', () => {
  it('includes error message in diagnostic output', () => {
    const html = buildErrorPageHtml(new Error('Network timeout'), MOCK_DIAGNOSTICS)
    expect(html).toContain('Network timeout')
  })

  it('includes appId and userId in diagnostics', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('user-center')
    expect(html).toContain('dorian')
  })

  it('includes retry button', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('id="pro-error-retry"')
    expect(html).toContain('Retry')
  })

  it('escapes HTML in error messages', () => {
    const html = buildErrorPageHtml(new Error('<script>alert("xss")</script>'), MOCK_DIAGNOSTICS)
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;')
  })

  it('includes all inline styles (no external CSS dependencies)', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('style="')
    // Should not reference any external stylesheet
    expect(html).not.toContain('href=')
    expect(html).not.toContain('.css')
  })

  it('includes failed sources list', () => {
    const html = buildErrorPageHtml(new Error('test'), MOCK_DIAGNOSTICS)
    expect(html).toContain('api')
    expect(html).toContain('sw-cache')
    expect(html).toContain('localstorage')
  })
})

describe('renderErrorPage', () => {
  it('replaces document.body with error page', () => {
    document.body.innerHTML = '<div id="app">existing content</div>'

    renderErrorPage(new Error('Render test'), MOCK_DIAGNOSTICS)

    expect(document.body.innerHTML).toContain('pro-error-container')
    expect(document.body.innerHTML).not.toContain('existing content')
  })

  it('binds retry button to window.location.reload', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    })

    renderErrorPage(new Error('test'), MOCK_DIAGNOSTICS)

    const retryBtn = document.getElementById('pro-error-retry')
    expect(retryBtn).not.toBeNull()

    retryBtn!.click()
    expect(reloadMock).toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add cdn/loader/src/error-page.ts cdn/loader/src/sw-register.ts cdn/loader/__tests__/error-page.test.ts
git commit -m "feat(cdn): add error page renderer and SW registration"
```

---

### Task 7: Service Worker (pro-sw.js)

**Files:**
- Create: `cdn/loader/pro-sw.ts`

- [ ] **Step 1: Create cdn/loader/pro-sw.ts**

```typescript
/**
 * pro-sw.js — Service Worker for CDN resource caching.
 *
 * Responsibilities:
 * 1. Cache CDN resources (ESM modules, CSS) on fetch
 * 2. Serve from cache when offline (cache-first for immutable resources)
 * 3. Store the latest import map for offline fallback
 * 4. Handle CACHE_BUST signals from the loader (rollback scenario)
 * 5. Pre-cache URLs sent by the loader on import map resolution
 *
 * Cache strategy:
 * - Immutable CDN resources (versioned URLs): Cache-first, never revalidate
 * - API responses: Network-first with cache fallback
 */

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'pro-cdn-cache-v1'
const IMPORT_MAP_CACHE_KEY = 'pro-import-map-response'

/** URL patterns that indicate an immutable CDN resource */
const CDN_RESOURCE_PATTERN = /\/(esm|umd|style)\//
const CDN_HOST_PATTERN = /cdn\.internal/

/**
 * Install event — skip waiting to activate immediately.
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting())
})

/**
 * Activate event — claim all clients and clean old caches.
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim()

      // Clean up old cache versions
      const cacheNames = await caches.keys()
      const toDelete = cacheNames.filter(
        (name) => name.startsWith('pro-cdn-cache-') && name !== CACHE_NAME,
      )
      await Promise.all(toDelete.map((name) => caches.delete(name)))
    })(),
  )
})

/**
 * Fetch event — cache-first strategy for CDN resources.
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  // Only intercept CDN resource requests
  if (!CDN_HOST_PATTERN.test(url.hostname)) return
  if (!CDN_RESOURCE_PATTERN.test(url.pathname)) return

  event.respondWith(cacheFirstStrategy(event.request))
})

/**
 * Cache-first: return cached response, or fetch + cache.
 * CDN resources are immutable (versioned URLs), so cached responses never go stale.
 */
async function cacheFirstStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      // Clone before caching (response body can only be read once)
      cache.put(request, response.clone())
    }

    return response
  } catch (err) {
    // Offline and not cached — return a minimal error response
    return new Response('Service Worker: resource unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

/**
 * Message handler — receives commands from the loader.
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { data } = event

  switch (data?.type) {
    case 'CACHE_BUST':
      event.waitUntil(handleCacheBust())
      break

    case 'PRECACHE':
      if (Array.isArray(data.urls)) {
        event.waitUntil(handlePrecache(data.urls))
      }
      break

    case 'CACHE_IMPORT_MAP':
      if (data.importMap) {
        event.waitUntil(handleCacheImportMap(data.importMap))
      }
      break

    case 'GET_CACHED_IMPORT_MAP':
      event.waitUntil(handleGetCachedImportMap(event))
      break
  }
})

/**
 * CACHE_BUST: Clear all cached CDN resources.
 * Triggered during rollback when stale versions must be purged.
 */
async function handleCacheBust(): Promise<void> {
  await caches.delete(CACHE_NAME)
  console.log('[pro-sw] Cache busted: all CDN resources cleared')

  // Notify all clients that cache has been cleared
  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage({ type: 'CACHE_BUSTED' })
  }
}

/**
 * PRECACHE: Fetch and cache a list of URLs in the background.
 * Called after import map resolution with all dependency URLs.
 */
async function handlePrecache(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME)

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      // Skip if already cached
      const existing = await cache.match(url)
      if (existing) return

      const response = await fetch(url, { mode: 'cors' })
      if (response.ok) {
        await cache.put(url, response)
      }
    }),
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length > 0) {
    console.warn(`[pro-sw] Pre-cache: ${failed.length}/${urls.length} URLs failed`)
  }
}

/**
 * CACHE_IMPORT_MAP: Store the import map response for offline fallback.
 * Stored as a synthetic Response in Cache Storage.
 */
async function handleCacheImportMap(importMap: unknown): Promise<void> {
  const cache = await caches.open(CACHE_NAME)
  const response = new Response(JSON.stringify(importMap), {
    headers: { 'Content-Type': 'application/json' },
  })
  await cache.put(IMPORT_MAP_CACHE_KEY, response)
}

/**
 * GET_CACHED_IMPORT_MAP: Return the cached import map to the loader.
 * Uses MessageChannel port for direct reply.
 */
async function handleGetCachedImportMap(event: ExtendableMessageEvent): Promise<void> {
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(IMPORT_MAP_CACHE_KEY)

  const port = event.ports?.[0]
  if (!port) return

  if (response) {
    const importMap = await response.json()
    port.postMessage({ type: 'IMPORT_MAP_CACHED', importMap })
  } else {
    port.postMessage({ type: 'IMPORT_MAP_CACHED', importMap: null })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add cdn/loader/pro-sw.ts
git commit -m "feat(cdn): implement Service Worker with cache-first strategy and cache_bust"
```

---

### Task 8: pro-loader.ts — Main Loader Entry

**Files:**
- Create: `cdn/loader/src/pro-loader.ts`

- [ ] **Step 1: Create cdn/loader/src/pro-loader.ts**

```typescript
/**
 * pro-loader.js — CDN bootstrap loader for Pro Components.
 *
 * Consumer integration:
 *   <script>window.__PRO_USER_ID__ = 'dorian'</script>
 *   <script src="https://cdn.internal/pro-loader@1.js?appId=user-center" data-pro-entry="/src/main.ts"></script>
 *
 * Execution flow:
 *   1. Parse config from script tag attributes + URL params + window globals
 *   2. Load es-module-shims polyfill
 *   3. Fetch import map (API -> SW cache -> localStorage -> hardcoded fallback)
 *   4. Handle cache_bust if present (rollback scenario)
 *   5. Inject import map + modulepreload + CSS into document
 *   6. Register Service Worker (fire-and-forget)
 *   7. import(appEntry) to bootstrap application
 *   8. On fatal error: render inline error page with retry
 */

import type { LoaderConfig, FallbackSource } from './types'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_CDN_BASE_URL,
  ES_MODULE_SHIMS_URL,
  FETCH_TIMEOUT_MS,
} from './constants'
import { resolveImportMap } from './import-map'
import { loadEsModuleShims, injectAll, bootstrapApp } from './inject'
import { registerServiceWorker } from './sw-register'
import { renderErrorPage } from './error-page'
import type { ErrorDiagnostics } from './error-page'

/**
 * Parse loader configuration from the script tag that loaded this file.
 * Supports:
 *   - URL search params: ?appId=xxx
 *   - data- attributes: data-pro-entry="/src/main.ts"
 *   - window globals: window.__PRO_USER_ID__
 */
function parseConfig(): LoaderConfig {
  const scriptTag = document.currentScript as HTMLScriptElement | null

  let appId = ''
  let appEntry = '/src/main.ts'
  let apiBaseUrl = DEFAULT_API_BASE_URL
  let cdnBaseUrl = DEFAULT_CDN_BASE_URL

  if (scriptTag) {
    // Parse URL search params
    const url = new URL(scriptTag.src, window.location.href)
    appId = url.searchParams.get('appId') ?? ''
    apiBaseUrl = url.searchParams.get('apiBaseUrl') ?? apiBaseUrl
    cdnBaseUrl = url.searchParams.get('cdnBaseUrl') ?? cdnBaseUrl

    // Parse data- attributes
    appEntry = scriptTag.dataset.proEntry ?? appEntry
  }

  // Window globals
  const userId = (window as any).__PRO_USER_ID__ ?? ''

  if (!appId) {
    console.warn('[pro-loader] No appId provided — import map resolution may fail')
  }

  return {
    appEntry,
    appId,
    userId,
    apiBaseUrl,
    cdnBaseUrl,
    fetchTimeout: FETCH_TIMEOUT_MS,
  }
}

/**
 * Main boot sequence — orchestrates all loader steps.
 */
async function boot(): Promise<void> {
  const config = parseConfig()
  const failedSources: string[] = []
  let source: FallbackSource = 'api'

  try {
    // Step 1: Load es-module-shims polyfill
    await loadEsModuleShims(ES_MODULE_SHIMS_URL)

    // Step 2: Resolve import map (with fallback chain)
    const result = await resolveImportMap(config)
    source = result.source
    const { importMap } = result

    if (source !== 'api') {
      failedSources.push('api')
      if (source === 'localstorage') failedSources.push('sw-cache')
      if (source === 'hardcoded') {
        failedSources.push('sw-cache', 'localstorage')
      }
    }

    // Step 3: Handle cache_bust (rollback scenario)
    // cache_bust is handled inside registerServiceWorker

    // Step 4: Inject import map + preloads + CSS
    injectAll(importMap)

    // Step 5: Register Service Worker (fire-and-forget, non-blocking)
    registerServiceWorker(importMap).catch((err) => {
      console.warn('[pro-loader] SW registration error (non-blocking):', err)
    })

    // Step 6: Bootstrap the consumer application
    await bootstrapApp(config.appEntry)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))

    console.error('[pro-loader] Fatal boot error:', error)

    const diagnostics: ErrorDiagnostics = {
      appId: config.appId,
      userId: config.userId,
      failedSources,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }

    renderErrorPage(error, diagnostics)
  }
}

// Auto-boot when script loads
boot()
```

- [ ] **Step 2: Commit**

```bash
git add cdn/loader/src/pro-loader.ts
git commit -m "feat(cdn): implement pro-loader.ts main boot sequence"
```

---

### Task 9: @pro/vite-plugin — Dev/Prod Module Boundary Alignment

**Files:**
- Create: `packages/vite-plugin/package.json`
- Create: `packages/vite-plugin/tsconfig.json`
- Create: `packages/vite-plugin/rollup.config.ts`
- Create: `packages/vite-plugin/src/types.ts`
- Create: `packages/vite-plugin/src/index.ts`
- Create: `packages/vite-plugin/__tests__/vite-plugin.test.ts`

- [ ] **Step 1: Create packages/vite-plugin/package.json**

```json
{
  "name": "@pro/vite-plugin",
  "version": "0.0.1",
  "description": "Vite plugin for dev/prod module boundary alignment with CDN distribution",
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
    "test": "vitest run",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "vite": ">=5.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create packages/vite-plugin/tsconfig.json**

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

- [ ] **Step 3: Create packages/vite-plugin/rollup.config.ts**

```typescript
import { createRollupConfig } from '../../scripts/rollup.base'

export default createRollupConfig({
  packageDir: import.meta.dirname,
  extraExternal: ['vite'],
})
```

- [ ] **Step 4: Create packages/vite-plugin/src/types.ts**

```typescript
/**
 * Configuration options for @pro/vite-plugin.
 */
export interface ProVitePluginOptions {
  /**
   * Extra packages to exclude from Vite's optimizeDeps pre-bundling.
   * Vue, Element Plus, and all @pro/* packages are always excluded.
   * @default []
   */
  extraExclude?: string[]

  /**
   * Whether to inject development-mode warnings for module boundary issues.
   * When true, adds runtime checks that warn if Vue/Element Plus are
   * loaded from unexpected paths (indicating a module boundary mismatch).
   * @default true in dev mode
   */
  devWarnings?: boolean

  /**
   * CDN base URL for production mode configuration hints.
   * Used only for logging/diagnostics, does not affect build.
   * @default "https://cdn.internal"
   */
  cdnBaseUrl?: string
}
```

- [ ] **Step 5: Create packages/vite-plugin/src/index.ts**

```typescript
import type { Plugin, UserConfig } from 'vite'
import type { ProVitePluginOptions } from './types'

export type { ProVitePluginOptions }

/**
 * Packages that must NOT be pre-bundled by Vite.
 *
 * Why: In CDN prod mode, Vue, Element Plus, and @pro/* are loaded as
 * separate ESM modules via Import Maps. If Vite pre-bundles them in dev,
 * the module boundaries differ between dev and prod, causing:
 * - `inject() can only be used inside setup()` — Vue's provide/inject
 *   relies on a single Vue runtime instance. Pre-bundling creates a
 *   separate copy, breaking the dependency chain.
 * - Different component instances across module boundaries.
 *
 * By excluding them from optimizeDeps, dev mode preserves the same
 * module boundaries that CDN prod mode uses.
 */
const ALWAYS_EXCLUDE = [
  'vue',
  'element-plus',
  '@pro/table',
  '@pro/form',
  '@pro/descriptions',
  '@pro/hooks',
  '@pro/utils',
  '@pro/themes',
  '@pro/pro-components',
]

/**
 * @pro/vite-plugin — ensures dev/prod module boundary alignment.
 *
 * Usage:
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import vue from '@vitejs/plugin-vue'
 * import { proVitePlugin } from '@pro/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [vue(), proVitePlugin()],
 * })
 * ```
 */
export function proVitePlugin(options: ProVitePluginOptions = {}): Plugin {
  const { extraExclude = [], devWarnings = true, cdnBaseUrl = 'https://cdn.internal' } = options

  const excludeList = [...ALWAYS_EXCLUDE, ...extraExclude]

  return {
    name: 'pro-vite-plugin',
    enforce: 'pre',

    config(userConfig: UserConfig, { command }) {
      const isDev = command === 'serve'

      if (isDev) {
        console.log(
          '[pro-vite-plugin] Excluding from optimizeDeps:',
          excludeList.join(', '),
        )
      }

      return {
        optimizeDeps: {
          exclude: excludeList,
        },
        resolve: {
          // Dedupe Vue and Element Plus to prevent multiple instances
          dedupe: ['vue', 'element-plus'],
        },
        // Ensure Vue is resolved to the ESM browser build in dev
        // This matches what CDN serves in prod
        ...(isDev
          ? {
              define: {
                __VUE_OPTIONS_API__: JSON.stringify(true),
                __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
              },
            }
          : {}),
      }
    },

    configResolved(resolvedConfig) {
      const isDev = resolvedConfig.command === 'serve'

      if (isDev && devWarnings) {
        // Verify that our exclude list is not being overridden
        const currentExclude = resolvedConfig.optimizeDeps?.exclude ?? []
        const missing = excludeList.filter((pkg) => !currentExclude.includes(pkg))

        if (missing.length > 0) {
          console.warn(
            '[pro-vite-plugin] WARNING: The following packages were re-included in optimizeDeps ' +
              'by another plugin or config. This may cause module boundary mismatch in CDN mode:',
            missing.join(', '),
          )
        }
      }
    },

    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        // Dev mode: inject a small diagnostic script
        if (devWarnings) {
          return {
            html,
            tags: [
              {
                tag: 'script',
                attrs: { type: 'module' },
                children: `
                  // [pro-vite-plugin] Dev module boundary check
                  import('vue').then(m => {
                    if (!m.version) {
                      console.warn('[pro-vite-plugin] Vue module loaded without version — possible module boundary issue')
                    }
                  }).catch(() => {})
                `,
                injectTo: 'head',
              },
            ],
          }
        }
      }
      return html
    },
  }
}
```

- [ ] **Step 6: Create packages/vite-plugin/__tests__/vite-plugin.test.ts (TDD)**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { proVitePlugin } from '../src/index'
import type { Plugin, UserConfig, ResolvedConfig } from 'vite'

describe('proVitePlugin', () => {
  it('returns a plugin with correct name', () => {
    const plugin = proVitePlugin()
    expect(plugin.name).toBe('pro-vite-plugin')
    expect(plugin.enforce).toBe('pre')
  })

  describe('config hook', () => {
    it('excludes Vue, Element Plus, and @pro/* from optimizeDeps', () => {
      const plugin = proVitePlugin()
      const configHook = (plugin as any).config

      const result = configHook({}, { command: 'serve' })

      expect(result.optimizeDeps.exclude).toContain('vue')
      expect(result.optimizeDeps.exclude).toContain('element-plus')
      expect(result.optimizeDeps.exclude).toContain('@pro/table')
      expect(result.optimizeDeps.exclude).toContain('@pro/form')
      expect(result.optimizeDeps.exclude).toContain('@pro/descriptions')
      expect(result.optimizeDeps.exclude).toContain('@pro/hooks')
      expect(result.optimizeDeps.exclude).toContain('@pro/utils')
      expect(result.optimizeDeps.exclude).toContain('@pro/themes')
      expect(result.optimizeDeps.exclude).toContain('@pro/pro-components')
    })

    it('includes extraExclude packages', () => {
      const plugin = proVitePlugin({ extraExclude: ['lodash-es', 'dayjs'] })
      const configHook = (plugin as any).config

      const result = configHook({}, { command: 'serve' })

      expect(result.optimizeDeps.exclude).toContain('lodash-es')
      expect(result.optimizeDeps.exclude).toContain('dayjs')
    })

    it('dedupes Vue and Element Plus in resolve config', () => {
      const plugin = proVitePlugin()
      const configHook = (plugin as any).config

      const result = configHook({}, { command: 'serve' })

      expect(result.resolve.dedupe).toContain('vue')
      expect(result.resolve.dedupe).toContain('element-plus')
    })

    it('defines Vue feature flags in dev mode', () => {
      const plugin = proVitePlugin()
      const configHook = (plugin as any).config

      const devResult = configHook({}, { command: 'serve' })
      expect(devResult.define.__VUE_OPTIONS_API__).toBe(JSON.stringify(true))

      const buildResult = configHook({}, { command: 'build' })
      expect(buildResult.define).toBeUndefined()
    })
  })

  describe('configResolved hook', () => {
    it('warns when exclude list is overridden', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const plugin = proVitePlugin({ devWarnings: true })
      const hook = (plugin as any).configResolved

      // Simulate resolved config where vue was removed from exclude
      hook({
        command: 'serve',
        optimizeDeps: { exclude: ['element-plus', '@pro/table'] },
      } as unknown as ResolvedConfig)

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('re-included in optimizeDeps'),
        expect.stringContaining('vue'),
      )

      warnSpy.mockRestore()
    })

    it('does not warn when devWarnings is false', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const plugin = proVitePlugin({ devWarnings: false })
      const hook = (plugin as any).configResolved

      hook({
        command: 'serve',
        optimizeDeps: { exclude: [] },
      } as unknown as ResolvedConfig)

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('transformIndexHtml hook', () => {
    it('injects dev diagnostic script in serve mode', () => {
      const plugin = proVitePlugin()
      const hook = (plugin as any).transformIndexHtml

      const result = hook('<html></html>', { server: true })

      expect(result.tags).toHaveLength(1)
      expect(result.tags[0].tag).toBe('script')
      expect(result.tags[0].children).toContain('pro-vite-plugin')
    })

    it('returns raw html in build mode (no server)', () => {
      const plugin = proVitePlugin()
      const hook = (plugin as any).transformIndexHtml

      const result = hook('<html></html>', {})
      expect(result).toBe('<html></html>')
    })
  })
})
```

- [ ] **Step 7: Commit**

```bash
git add packages/vite-plugin/
git commit -m "feat: add @pro/vite-plugin for dev/prod module boundary alignment"
```

---

### Task 10: Loader Build Config (Rollup)

**Files:**
- Create: `cdn/loader/rollup.config.ts`

- [ ] **Step 1: Create cdn/loader/rollup.config.ts**

This produces two output files:
- `pro-loader@1.js` — versioned loader (long cache)
- `pro-sw.js` — Service Worker script

```typescript
import { resolve } from 'node:path'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import type { RollupOptions } from 'rollup'

const loaderConfig: RollupOptions = {
  input: resolve(import.meta.dirname, 'src/pro-loader.ts'),
  output: {
    file: resolve(import.meta.dirname, 'dist/pro-loader@1.js'),
    format: 'iife',
    name: 'ProLoader',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: resolve(import.meta.dirname, 'tsconfig.json'),
      declaration: false,
      sourceMap: true,
    }),
    terser({
      format: { comments: false },
      compress: { passes: 2 },
    }),
  ],
}

const swConfig: RollupOptions = {
  input: resolve(import.meta.dirname, 'pro-sw.ts'),
  output: {
    file: resolve(import.meta.dirname, 'dist/pro-sw.js'),
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: resolve(import.meta.dirname, 'tsconfig.json'),
      declaration: false,
      sourceMap: true,
    }),
    terser({
      format: { comments: false },
    }),
  ],
}

export default [loaderConfig, swConfig]
```

- [ ] **Step 2: Add build script to cdn/loader/package.json**

Update `cdn/loader/package.json` scripts:

```json
{
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "test": "vitest run",
    "type-check": "tsc --noEmit"
  }
}
```

(Already present from Task 3 Step 1 — verify no changes needed.)

- [ ] **Step 3: Commit**

```bash
git add cdn/loader/rollup.config.ts
git commit -m "feat(cdn): add Rollup build config for pro-loader and pro-sw"
```

---

### Task 11: CDN Caching Strategy — Nginx Configuration Reference

**Files:**
- Create: `cdn/server/nginx-cdn.conf`

This task provides the Nginx reference config for CDN caching headers. Not a deployable config — a reference for the ops team.

- [ ] **Step 1: Create cdn/server/nginx-cdn.conf**

```nginx
# Pro Components CDN — Nginx caching and CORS configuration
# Reference config — adapt for actual deployment environment.

server {
    listen 443 ssl http2;
    server_name cdn.internal;

    root /var/www/cdn;

    # ──────────────────────────────────────────────
    # CORS — Allow all origins for static CDN assets
    # ──────────────────────────────────────────────
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept" always;
    add_header Access-Control-Max-Age 86400 always;

    # Preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # ──────────────────────────────────────────────
    # Immutable versioned resources
    # URL pattern: /@pro/table/1.2.3/esm/index.mjs
    # These never change — cache forever.
    # ──────────────────────────────────────────────
    location ~ ^/@pro/[^/]+/[0-9]+\.[0-9]+\.[0-9]+/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Access-Control-Allow-Origin "*" always;

        # Enable gzip/brotli for JS and CSS
        gzip on;
        gzip_types application/javascript text/css application/json;
        gzip_min_length 256;

        try_files $uri =404;
    }

    # ──────────────────────────────────────────────
    # Vendor resources (Vue, Element Plus)
    # Also versioned and immutable.
    # ──────────────────────────────────────────────
    location ~ ^/vendor/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Access-Control-Allow-Origin "*" always;

        gzip on;
        gzip_types application/javascript text/css;
        gzip_min_length 256;

        try_files $uri =404;
    }

    # ──────────────────────────────────────────────
    # Versioned loader: /pro-loader@1.js
    # Long cache — updated only on major version bump.
    # ──────────────────────────────────────────────
    location ~ ^/pro-loader@[0-9]+\.js {
        add_header Cache-Control "public, max-age=86400" always;
        add_header Access-Control-Allow-Origin "*" always;

        try_files $uri =404;
    }

    # ──────────────────────────────────────────────
    # @latest redirect: /pro-loader@latest.js -> /pro-loader@1.js
    # Short cache so latest always resolves correctly.
    # ──────────────────────────────────────────────
    location = /pro-loader@latest.js {
        add_header Cache-Control "public, max-age=300" always;
        return 302 /pro-loader@1.js;
    }

    # ──────────────────────────────────────────────
    # Service Worker
    # Short cache — must update quickly.
    # ──────────────────────────────────────────────
    location = /pro-sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate" always;
        add_header Service-Worker-Allowed "/" always;
        add_header Access-Control-Allow-Origin "*" always;

        try_files $uri =404;
    }
}

# ──────────────────────────────────────────────
# Platform API — CORS with credentials
# ──────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name platform.internal;

    location /api/ {
        # Whitelisted origins (not wildcard — credentials require specific origin)
        set $cors_origin "";
        if ($http_origin ~* "^https://(app1|app2|localhost:5173)\.internal$") {
            set $cors_origin $http_origin;
        }

        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Max-Age 86400 always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # Import map API — CDN edge caching
        location = /api/v1/import-map {
            add_header Cache-Control "public, max-age=60, stale-while-revalidate=300" always;
            proxy_pass http://platform-backend;
        }

        # Other API endpoints — no cache
        proxy_pass http://platform-backend;
        add_header Cache-Control "no-store" always;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add cdn/server/nginx-cdn.conf
git commit -m "docs(cdn): add Nginx CDN caching and CORS reference config"
```

---

### Task 12: Integration Tests — Full CDN Chain

**Files:**
- Create: `cdn/__tests__/integration/cdn-chain.test.ts`
- Create: `cdn/__tests__/integration/cdn-failure.test.ts`
- Create: `cdn/__tests__/integration/sri-rejection.test.ts`

These tests use Vitest with jsdom environment to simulate the full import map -> import -> render chain. In a real CI environment, these would run in Vitest browser mode with Playwright for full fidelity.

- [ ] **Step 1: Create cdn/__tests__/integration/cdn-chain.test.ts**

```typescript
/**
 * @vitest-environment jsdom
 *
 * Integration test: full CDN bootstrap chain.
 *
 * Verifies: API fetch -> import map injection -> modulepreload -> CSS injection -> app bootstrap
 *
 * Note: In CI, run with Vitest browser mode (--browser.name=chromium) for full
 * es-module-shims + real ESM import verification. The jsdom version tests the
 * DOM injection and fallback chain logic.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ImportMapResponse } from '../../loader/src/types'
import { resolveImportMap } from '../../loader/src/import-map'
import { injectAll, injectImportMap, injectModulePreloads, injectStylesheets } from '../../loader/src/inject'

const FULL_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    '@pro/form': 'https://cdn.internal/@pro/form/1.1.2/esm/index.mjs',
    '@pro/hooks': 'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
    '@pro/utils': 'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    'element-plus': 'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.full.mjs',
  },
  preloads: [
    'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
    'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
  ],
  styles: [
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css',
    'https://cdn.internal/@pro/form/1.1.2/style/index.css',
  ],
  sriHashes: {
    'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-tableHash',
    'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs': 'sha384-hooksHash',
    'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs': 'sha384-utilsHash',
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css': 'sha384-epCssHash',
  },
  cache_bust: false,
}

describe('CDN Chain Integration', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = '<div id="app"></div>'
    mockLocalStorage = {}

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
    })

    vi.stubGlobal('navigator', { serviceWorker: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('API success -> injects complete import map + preloads + CSS', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(FULL_IMPORT_MAP),
    }))

    // Step 1: Resolve import map
    const result = await resolveImportMap({
      appEntry: '/src/main.ts',
      appId: 'user-center',
      userId: 'dorian',
      apiBaseUrl: 'https://platform.internal/api/v1',
      cdnBaseUrl: 'https://cdn.internal',
      fetchTimeout: 5000,
    })

    expect(result.source).toBe('api')

    // Step 2: Inject everything
    injectAll(result.importMap)

    // Verify import map
    const importMapScript = document.querySelector('script[type="importmap-shim"]')
    expect(importMapScript).not.toBeNull()
    const parsed = JSON.parse(importMapScript!.textContent!)
    expect(Object.keys(parsed.imports)).toHaveLength(6)
    expect(parsed.imports['@pro/table']).toContain('1.2.3')

    // Verify modulepreloads
    const preloadLinks = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(preloadLinks).toHaveLength(2)

    // Verify CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]')
    expect(cssLinks).toHaveLength(3)

    // Verify SRI integrity on preloads
    const hooksPreload = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"]',
    )
    expect(hooksPreload?.getAttribute('integrity')).toBe('sha384-hooksHash')

    // Verify SRI integrity on CSS
    const epCss = document.querySelector(
      'link[href="https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css"]',
    )
    expect(epCss?.getAttribute('integrity')).toBe('sha384-epCssHash')
  })

  it('maintains correct injection order: import map -> preloads -> CSS', () => {
    injectAll(FULL_IMPORT_MAP)

    const headChildren = Array.from(document.head.children)

    const importMapIdx = headChildren.findIndex(
      (el) => el.tagName === 'SCRIPT' && el.getAttribute('type') === 'importmap-shim',
    )
    const firstPreloadIdx = headChildren.findIndex(
      (el) => el.tagName === 'LINK' && el.getAttribute('rel') === 'modulepreload-shim',
    )
    const firstCssIdx = headChildren.findIndex(
      (el) => el.tagName === 'LINK' && el.getAttribute('rel') === 'stylesheet',
    )

    // Import map must come before preloads, preloads before CSS
    expect(importMapIdx).toBeLessThan(firstPreloadIdx)
    expect(firstPreloadIdx).toBeLessThan(firstCssIdx)
  })

  it('caches API response to localStorage after successful fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(FULL_IMPORT_MAP),
    }))

    await resolveImportMap({
      appEntry: '/src/main.ts',
      appId: 'test',
      userId: 'user',
      apiBaseUrl: 'https://platform.internal/api/v1',
      cdnBaseUrl: 'https://cdn.internal',
      fetchTimeout: 5000,
    })

    const cached = JSON.parse(mockLocalStorage['pro:import-map'])
    expect(cached.imports['@pro/table']).toBe(FULL_IMPORT_MAP.imports['@pro/table'])
  })
})
```

- [ ] **Step 2: Create cdn/__tests__/integration/cdn-failure.test.ts**

```typescript
/**
 * @vitest-environment jsdom
 *
 * Integration test: CDN failure simulation.
 *
 * Verifies the fallback chain behavior when various sources fail:
 *   API fail -> SW cache -> localStorage -> hardcoded fallback -> error page
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ImportMapResponse } from '../../loader/src/types'
import { resolveImportMap } from '../../loader/src/import-map'
import {
  HARDCODED_FALLBACK_IMPORT_MAP,
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
} from '../../loader/src/constants'

const CACHED_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.0.0/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [],
  styles: [],
  sriHashes: {},
  cache_bust: false,
}

const BASE_CONFIG = {
  appEntry: '/src/main.ts',
  appId: 'test-app',
  userId: 'user-1',
  apiBaseUrl: 'https://platform.internal/api/v1',
  cdnBaseUrl: 'https://cdn.internal',
  fetchTimeout: 5000,
}

describe('CDN Failure Simulation', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
    })

    vi.stubGlobal('navigator', { serviceWorker: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('API timeout -> falls through to localStorage', async () => {
    // API will abort (simulate timeout via rejection)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))

    // Pre-populate localStorage with cached map
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('localstorage')
    expect(result.importMap.imports['@pro/table']).toBe(CACHED_IMPORT_MAP.imports['@pro/table'])
  })

  it('API 500 -> falls through to localStorage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }))

    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('localstorage')
  })

  it('API fail + expired localStorage -> hardcoded fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    // Expired cache (2 hours ago)
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now() - 2 * 60 * 60 * 1000)

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap).toEqual(HARDCODED_FALLBACK_IMPORT_MAP)
  })

  it('all sources fail -> hardcoded fallback (last resort before error page)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')))
    // No localStorage, no SW

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
    // Hardcoded fallback must contain Vue and at least one @pro package
    expect(result.importMap.imports).toHaveProperty('vue')
    expect(result.importMap.imports).toHaveProperty('@pro/table')
  })

  it('API returns malformed JSON -> falls through to fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }))

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
  })

  it('localStorage parse error -> treated as empty, falls to hardcoded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')))

    mockLocalStorage[LS_IMPORT_MAP_KEY] = '{invalid json'
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
  })
})
```

- [ ] **Step 3: Create cdn/__tests__/integration/sri-rejection.test.ts**

```typescript
/**
 * @vitest-environment jsdom
 *
 * Integration test: SRI integrity verification.
 *
 * Verifies that SRI hashes are correctly applied to DOM elements.
 * Actual SRI rejection (browser refusing to load tampered files) requires
 * a real browser — these tests verify the integrity attributes are set
 * correctly in the DOM for the browser to enforce.
 *
 * In CI with Vitest browser mode, add tests that actually load resources
 * with wrong SRI and verify the browser blocks them.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { injectModulePreloads, injectStylesheets } from '../../loader/src/inject'
import type { ImportMapResponse } from '../../loader/src/types'

describe('SRI Integrity Attributes', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('sets correct integrity attribute on modulepreload links', () => {
    const preloads = [
      'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
      'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
    ]

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs':
        'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
      'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs':
        'sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEb2VAf',
    }

    injectModulePreloads(preloads, sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(links).toHaveLength(2)

    const hooksLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"]',
    ) as HTMLLinkElement

    expect(hooksLink.integrity).toBe(
      'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
    )
    expect(hooksLink.crossOrigin).toBe('anonymous')
  })

  it('sets correct integrity attribute on CSS links', () => {
    const styles = [
      'https://cdn.internal/@pro/table/1.2.3/style/index.css',
    ]

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/@pro/table/1.2.3/style/index.css':
        'sha384-Xq0n1H/N8FNLkXdG+FZ9O0lmQnE3cP3pREiKbm7fE0agORRhgUqjkNH+pYH/6Xj',
    }

    injectStylesheets(styles, sriHashes)

    const link = document.querySelector(
      'link[href="https://cdn.internal/@pro/table/1.2.3/style/index.css"]',
    ) as HTMLLinkElement

    expect(link.integrity).toBe(
      'sha384-Xq0n1H/N8FNLkXdG+FZ9O0lmQnE3cP3pREiKbm7fE0agORRhgUqjkNH+pYH/6Xj',
    )
    expect(link.crossOrigin).toBe('anonymous')
  })

  it('omits integrity attribute when hash is not in sriHashes map', () => {
    const preloads = [
      'https://cdn.internal/@pro/unknown/1.0.0/esm/index.mjs',
    ]

    injectModulePreloads(preloads, {})

    const link = document.querySelector(
      'link[href="https://cdn.internal/@pro/unknown/1.0.0/esm/index.mjs"]',
    ) as HTMLLinkElement

    // integrity should not be set (null attribute)
    expect(link.getAttribute('integrity')).toBeNull()
    // crossOrigin should still be set (needed for CORS)
    expect(link.crossOrigin).toBe('anonymous')
  })

  it('handles SHA-384 hash format correctly', () => {
    const styles = ['https://cdn.internal/test.css']
    const validHash = 'sha384-' + 'A'.repeat(64) // Valid base64 length for SHA-384

    injectStylesheets(styles, { 'https://cdn.internal/test.css': validHash })

    const link = document.querySelector('link[href="https://cdn.internal/test.css"]') as HTMLLinkElement
    expect(link.integrity).toBe(validHash)
    expect(link.integrity).toMatch(/^sha384-[A-Za-z0-9+/=]+$/)
  })

  it('applies SRI to multiple resources independently', () => {
    const styles = [
      'https://cdn.internal/a.css',
      'https://cdn.internal/b.css',
      'https://cdn.internal/c.css',
    ]

    const sriHashes: Record<string, string> = {
      'https://cdn.internal/a.css': 'sha384-hashA',
      // b.css intentionally missing — should have no integrity
      'https://cdn.internal/c.css': 'sha384-hashC',
    }

    injectStylesheets(styles, sriHashes)

    const linkA = document.querySelector('link[href="https://cdn.internal/a.css"]') as HTMLLinkElement
    const linkB = document.querySelector('link[href="https://cdn.internal/b.css"]') as HTMLLinkElement
    const linkC = document.querySelector('link[href="https://cdn.internal/c.css"]') as HTMLLinkElement

    expect(linkA.integrity).toBe('sha384-hashA')
    expect(linkB.getAttribute('integrity')).toBeNull()
    expect(linkC.integrity).toBe('sha384-hashC')
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add cdn/__tests__/
git commit -m "test(cdn): add integration tests for CDN chain, failure simulation, and SRI"
```

---

### Task 13: Wire Up Root Config — pnpm-workspace + Turborepo

**Files:**
- Update: `pnpm-workspace.yaml`
- Update: `turbo.json`
- Update: `tsconfig.json`

- [ ] **Step 1: Update pnpm-workspace.yaml to include CDN and vite-plugin**

Add CDN packages to workspace:

```yaml
packages:
  - "packages/*"
  - "cdn/build"
  - "cdn/loader"
  - "playground"
  - "docs"
```

- [ ] **Step 2: Update turbo.json to include CDN build tasks**

Add to `turbo.json` tasks:

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
    "build:cdn": {
      "dependsOn": ["build"],
      "outputs": ["cdn/dist/**"],
      "cache": true
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
      "inputs": ["src/**", "*.cjs", "*.ts"]
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

- [ ] **Step 3: Update tsconfig.json to include new packages**

Add references for vite-plugin:

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
    { "path": "packages/vite-plugin" },
    { "path": "cdn/build" },
    { "path": "cdn/loader" },
    { "path": "playground" }
  ]
}
```

- [ ] **Step 4: Add CDN scripts to root package.json**

Add to root `package.json` scripts:

```json
{
  "build:cdn": "turbo build:cdn",
  "test:cdn": "vitest run --project cdn"
}
```

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml turbo.json tsconfig.json package.json
git commit -m "chore: wire CDN packages into monorepo workspace and Turborepo"
```

---

### Task 14: Verify Full Build + Tests

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm install
```

Expected: lockfile updated, CDN package dependencies resolved.

- [ ] **Step 2: Build CDN loader**

```bash
cd cdn/loader && pnpm build
```

Expected: `cdn/loader/dist/pro-loader@1.js` and `cdn/loader/dist/pro-sw.js` generated.

- [ ] **Step 3: Run CDN tests**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/cdn-build test
pnpm --filter @pro/cdn-loader test
pnpm --filter @pro/vite-plugin test
```

Expected: All tests pass — SRI, manifest, import-map fallback, inject, error-page, vite-plugin.

- [ ] **Step 4: Run integration tests**

```bash
cd cdn && npx vitest run __tests__/integration/
```

Expected: CDN chain, failure simulation, and SRI rejection tests all pass.

- [ ] **Step 5: Build vite-plugin**

```bash
pnpm --filter @pro/vite-plugin build
```

Expected: `packages/vite-plugin/dist/` contains ESM and CJS outputs.

- [ ] **Step 6: Type check**

```bash
pnpm type-check
```

Expected: No TypeScript errors across all packages including new CDN and vite-plugin packages.

- [ ] **Step 7: Format + lint**

```bash
pnpm format
pnpm lint
```

Expected: No lint errors, all files formatted.

- [ ] **Step 8: Commit lockfile and format changes**

```bash
git add pnpm-lock.yaml .
git commit -m "chore: verify CDN distribution build and tests"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Plan 4 covers all items from Section 6 of the design spec — pro-loader.js, es-module-shims integration, import map injection, modulepreload, CSS injection with SRI, Service Worker registration/caching/cache_bust, CDN build scripts with SRI hash calculation, @pro/vite-plugin for dev/prod alignment, Nginx caching/CORS reference, loader versioning (@1 + @latest), and integration tests
- [x] **No placeholders:** All steps contain complete, runnable code
- [x] **Fallback chain:** API -> SW cache -> localStorage -> hardcoded fallback -> error page — all 5 levels implemented and tested
- [x] **SRI:** SHA-384 calculation in build scripts, integrity attributes on modulepreload and CSS links, tested independently
- [x] **Service Worker:** Cache-first for immutable CDN resources, CACHE_BUST handling for rollback, PRECACHE for background loading, import map caching for offline
- [x] **Vite plugin:** Excludes Vue/Element Plus/@pro/* from optimizeDeps, dedupes to prevent multi-instance, dev warnings for boundary mismatch detection
- [x] **CDN caching:** Nginx reference config with immutable 1-year cache for versioned resources, short cache for API/loader, no-cache for SW
- [x] **CORS:** Wildcard for CDN static assets, whitelisted origins with credentials for API
- [x] **File paths:** All paths are exact and consistent with Plan 1 structure
- [x] **TDD flow:** Tests written alongside implementation for SRI, manifest, import-map fallback, inject, error-page, vite-plugin, and integration tests
- [x] **Type consistency:** ImportMapResponse type shared across loader, build, and test code
- [x] **Loader versioning:** Rollup config outputs `pro-loader@1.js`, Nginx config handles `@latest` redirect
