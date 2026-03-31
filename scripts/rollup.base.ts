import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RollupOptions, Plugin } from 'rollup'
import vue from 'rollup-plugin-vue'
import esbuild from 'rollup-plugin-esbuild'
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

/** Resolved context shared across ESM/CJS/UMD build configs */
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

/** Collect external dependencies from package.json deps + peerDeps */
function collectExternals(pkg: Record<string, unknown>): string[] {
  const deps = pkg.dependencies as Record<string, string> | undefined
  const peerDeps = pkg.peerDependencies as Record<string, string> | undefined
  return [...Object.keys(deps ?? {}), ...Object.keys(peerDeps ?? {})]
}

/** Resolve shared build context (input, externals, base plugins) from config */
function resolveBuildContext(config: PackageConfig): ResolvedBuildContext {
  const { packageDir, extraExternal = [], extraPlugins = [] } = config
  const pkg = readPkg(packageDir)

  return {
    input: resolve(packageDir, 'src/index.ts'),
    external: ['vue', 'element-plus', /^@pro\//, ...collectExternals(pkg), ...extraExternal],
    basePlugins: [
      vue() as Plugin,
      nodeResolve({ extensions: ['.ts', '.tsx', '.vue', '.js'] }),
      commonjs(),
      esbuild({ target: 'es2022', loaders: { '.vue': 'ts' } }),
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
      sourcemap: true,
    },
    external: ctx.external,
    plugins: [...ctx.basePlugins, postcss({ extract: 'index.css', minimize: true })],
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
      sourcemap: true,
    },
    external: ctx.external,
    plugins: [...ctx.basePlugins, postcss({ inject: false })],
  }
}

/** Create UMD build configurations (standard + minified) */
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
    plugins: [...ctx.basePlugins, postcss({ inject: true, minimize: true }), terser()],
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
