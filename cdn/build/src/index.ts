import { resolve } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { discoverPackages, buildPackageForCdn } from './bundle'
import { generateManifest } from './manifest'
import type { CdnBuildOptions, CdnManifest } from './types'

/** CLI logger wrapper — structured output for build scripts */
const log = {
  info: (msg: string) => process.stdout.write(`${msg}\n`),
  warn: (msg: string) => process.stderr.write(`[warn] ${msg}\n`),
  error: (msg: string) => process.stderr.write(`[error] ${msg}\n`),
}

/** Parse a named CLI argument: --flag value */
function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx >= 0 ? args[idx + 1] : undefined
}

/** Format byte count to human-readable string */
function formatBytes(bytes: number): string {
  const KB = 1024
  const MB = KB * KB
  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

/** Print build summary table */
function printSummary(manifests: CdnManifest[]): void {
  log.info('\n[cdn-build] Summary:')
  for (const m of manifests) {
    const sriCount = Object.keys(m.sriHashes).length
    log.info(`  ${m.name}@${m.version} — ESM: ${formatBytes(m.esmSize)}, SRI: ${sriCount} files`)
  }
}

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

  log.info(`[cdn-build] Discovering packages in ${options.packagesDir}`)
  const packages = await discoverPackages(options.packagesDir, options.packages)

  if (packages.length === 0) {
    log.warn('[cdn-build] No packages found to build')
    process.exit(1)
  }

  log.info(`[cdn-build] Building ${packages.length} packages for CDN`)

  const manifests: CdnManifest[] = []

  for (const pkg of packages) {
    log.info(`[cdn-build] Building ${pkg.name}@${pkg.version}`)

    const versionDir = await buildPackageForCdn(pkg, options.outputDir)
    const manifest = await generateManifest(pkg.name, pkg.version, versionDir, options.cdnBaseUrl)

    manifests.push(manifest)

    // Write per-package manifest
    const manifestPath = resolve(versionDir, 'manifest.json')
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    log.info(`[cdn-build]   -> ${manifestPath}`)
  }

  // Write combined manifest
  const combinedPath = resolve(options.outputDir, 'cdn-manifest.json')
  await mkdir(resolve(options.outputDir), { recursive: true })
  await writeFile(combinedPath, JSON.stringify(manifests, null, 2))
  log.info(`[cdn-build] Combined manifest: ${combinedPath}`)

  printSummary(manifests)
}

main().catch((err: unknown) => {
  log.error(`[cdn-build] Fatal error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
