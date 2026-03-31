/**
 * Build script that programmatically invokes Rollup with TS config support.
 * Used instead of `rollup -c` to allow TS imports in rollup config files.
 *
 * Usage: tsx scripts/build-package.ts <package-dir>
 */
import { resolve } from 'node:path'
import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { rollup } from 'rollup'
import type { RollupOptions, OutputOptions } from 'rollup'

const packageDir = process.argv[2]

if (!packageDir) {
  console.error('Usage: tsx scripts/build-package.ts <package-dir>')
  process.exit(1)
}

const configPath = resolve(packageDir, 'rollup.config.ts')

/** Copy extracted CSS from ESM output dir to dist/style/ for consistent import path */
function copyStyleOutput(pkgDir: string): void {
  const esmCss = resolve(pkgDir, 'dist/esm/index.css')
  const styleDir = resolve(pkgDir, 'dist/style')

  if (existsSync(esmCss)) {
    mkdirSync(styleDir, { recursive: true })
    copyFileSync(esmCss, resolve(styleDir, 'index.css'))
  }
}

/** Run rollup build for all configs exported from a package rollup.config.ts */
async function build(): Promise<void> {
  const configModule = (await import(configPath)) as {
    default: RollupOptions | RollupOptions[]
  }
  const configs = Array.isArray(configModule.default)
    ? configModule.default
    : [configModule.default]

  for (const config of configs) {
    const bundle = await rollup({
      ...config,
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      },
    })

    const outputs = Array.isArray(config.output) ? config.output : [config.output].filter(Boolean)

    for (const output of outputs) {
      await bundle.write(output as OutputOptions)
    }

    await bundle.close()
  }

  copyStyleOutput(resolve(packageDir))
}

build().catch((err: unknown) => {
  console.error('Build failed:', err)
  process.exit(1)
})
