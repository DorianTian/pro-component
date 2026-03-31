import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { readdir, mkdir, cp } from 'node:fs/promises'
import { rollup } from 'rollup'
import vue from 'rollup-plugin-vue'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import terser from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'

interface PackageJson {
  name: string
  version: string
  private?: boolean
}

/** Discovered package metadata for CDN build */
export interface PackageInfo {
  name: string
  version: string
  dir: string
  inputPath: string
  hasStyles: boolean
}

/**
 * Read and parse a package.json file using fs (ESM-safe, no require()).
 */
function readPackageJson(pkgJsonPath: string): PackageJson {
  const raw = readFileSync(pkgJsonPath, 'utf-8')
  return JSON.parse(raw) as PackageJson
}

/**
 * Discover all publishable packages in the workspace.
 */
export async function discoverPackages(
  packagesDir: string,
  filter?: string[],
): Promise<PackageInfo[]> {
  const dirEntries = await readdir(packagesDir, { withFileTypes: true })
  const dirs = dirEntries.filter((d) => d.isDirectory()).map((d) => d.name)

  const packages: PackageInfo[] = []

  for (const dir of dirs) {
    const pkgJsonPath = resolve(packagesDir, dir, 'package.json')
    if (!existsSync(pkgJsonPath)) continue

    const pkg = readPackageJson(pkgJsonPath)
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
 * Build ESM bundle for a single package (CDN distribution).
 * External: Vue, Element Plus, all @pro/* deps.
 */
async function buildEsmBundle(pkg: PackageInfo, versionDir: string): Promise<void> {
  const esmBundle = await rollup({
    input: pkg.inputPath,
    external: ['vue', 'vue-i18n', 'element-plus', 'dayjs', /^dayjs\//, /^@pro\//, /^@vue\//],
    plugins: [
      vue(),
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      esbuild({ target: 'es2022', loaders: { '.vue': 'ts' } }),
      postcss({
        extract: 'style.css',
        minimize: true,
      }),
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
}

/**
 * Derive UMD global name from package name.
 * E.g. "@pro/table" -> "ProTable", "@pro/pro-form" -> "ProProForm"
 */
function deriveUmdName(packageName: string): string {
  return packageName
    .replace('@pro/', 'Pro')
    .replace(/(^|-)(\w)/g, (_, _prefix: string, char: string) => char.toUpperCase())
}

/**
 * Build UMD bundle for a single package (CDN distribution).
 * External: only Vue + Element Plus; bundles @pro/* deps.
 */
async function buildUmdBundle(pkg: PackageInfo, versionDir: string): Promise<void> {
  const umdBundle = await rollup({
    input: pkg.inputPath,
    external: ['vue', 'vue-i18n', 'element-plus', 'dayjs'],
    plugins: [
      vue(),
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      esbuild({ target: 'es2022', sourceMap: true, loaders: { '.vue': 'ts' } }),
      postcss({ inject: true, minimize: true }),
      terser({ format: { comments: false } }),
    ],
  })

  await umdBundle.write({
    format: 'umd',
    file: resolve(versionDir, 'umd/index.min.js'),
    name: deriveUmdName(pkg.name),
    globals: {
      vue: 'Vue',
      'vue-i18n': 'VueI18n',
      'element-plus': 'ElementPlus',
      dayjs: 'dayjs',
    },
    exports: 'named',
    sourcemap: true,
  })
  await umdBundle.close()
}

/**
 * Build a single package for CDN distribution.
 * Produces ESM (minified) and UMD (minified) bundles.
 * Output path: <outputDir>/<name>/<version>/
 */
export async function buildPackageForCdn(pkg: PackageInfo, outputDir: string): Promise<string> {
  const versionDir = resolve(outputDir, pkg.name, pkg.version)
  await mkdir(resolve(versionDir, 'esm'), { recursive: true })
  await mkdir(resolve(versionDir, 'umd'), { recursive: true })

  await buildEsmBundle(pkg, versionDir)
  await buildUmdBundle(pkg, versionDir)

  // Copy pre-built CSS if exists (from the regular Rollup build)
  if (pkg.hasStyles) {
    const srcCss = resolve(pkg.dir, 'dist/style/index.css')
    const destCss = resolve(versionDir, 'style/index.css')
    await mkdir(resolve(versionDir, 'style'), { recursive: true })
    await cp(srcCss, destCss)
  }

  return versionDir
}
