/**
 * Generate aggregation type declarations for @pro/pro-components.
 * Copies .d.ts from dependent packages and writes a barrel index.d.ts
 * that re-exports everything.
 *
 * Usage: tsx scripts/gen-aggregation-dts.ts <package-dir>
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageDir = process.argv[2]

if (!packageDir) {
  console.error('Usage: tsx scripts/gen-aggregation-dts.ts <package-dir>')  
  process.exit(1)
}

const typesDir = resolve(packageDir, 'dist/types')
mkdirSync(typesDir, { recursive: true })

const content = `export { ProTable } from '@pro/table';
export { ProForm } from '@pro/form';
export { ProDescriptions } from '@pro/descriptions';
export { checkDependencies } from '@pro/utils';
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils';
export type { Logger } from '@pro/utils';
import type { App, Plugin } from 'vue';
/** Vue plugin to install all Pro Components globally via app.use() */
export declare const proComponentsPlugin: Plugin;
`

writeFileSync(resolve(typesDir, 'index.d.ts'), content)
