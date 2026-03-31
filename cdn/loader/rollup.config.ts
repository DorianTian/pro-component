import { resolve } from 'node:path'
import esbuild from 'rollup-plugin-esbuild'
import terser from '@rollup/plugin-terser'

const loaderConfig = {
  input: resolve(import.meta.dirname, 'src/pro-loader.ts'),
  output: {
    file: resolve(import.meta.dirname, 'dist/pro-loader@1.js'),
    format: 'iife',
    name: 'ProLoader',
    sourcemap: true,
  },
  plugins: [
    esbuild({
      tsconfig: resolve(import.meta.dirname, 'tsconfig.json'),
      target: 'es2022',
      sourceMap: true,
    }),
    terser({
      format: { comments: false },
      compress: { passes: 2 },
    }),
  ],
}

const swConfig = {
  input: resolve(import.meta.dirname, 'pro-sw.ts'),
  output: {
    file: resolve(import.meta.dirname, 'dist/pro-sw.js'),
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    esbuild({
      tsconfig: resolve(import.meta.dirname, 'tsconfig.sw.json'),
      target: 'es2022',
      sourceMap: true,
    }),
    terser({
      format: { comments: false },
    }),
  ],
}

export default [loaderConfig, swConfig]
