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
      tsconfig: resolve(import.meta.dirname, 'tsconfig.sw.json'),
      declaration: false,
      sourceMap: true,
    }),
    terser({
      format: { comments: false },
    }),
  ],
}

export default [loaderConfig, swConfig]
