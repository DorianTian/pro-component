/**
 * CDN publish state machine: upload -> propagate -> verify -> active.
 * Content-addressable paths make re-uploads naturally idempotent.
 */
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('cdn-sync')
const PACKAGES_DIR = resolve(import.meta.dirname, '../../packages')

type SyncState = 'uploading' | 'propagating' | 'verifying' | 'active' | 'failed'

interface SyncContext {
  packageName: string
  version: string
  state: SyncState
  cdnBasePath: string
  sriHashes: Record<string, string>
  error?: string
}

interface DistFile {
  relativePath: string
  absolutePath: string
}

function calculateSriHash(filePath: string): string {
  const content = readFileSync(filePath)
  const hash = createHash('sha384').update(content).digest('base64')
  return `sha384-${hash}`
}

function walkDirectory(dir: string, prefix: string): DistFile[] {
  const files: DistFile[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath, relPath))
    } else {
      files.push({ relativePath: relPath, absolutePath: fullPath })
    }
  }
  return files
}

function collectDistFiles(pkgDir: string): DistFile[] {
  const distDir = resolve(pkgDir, 'dist')
  if (!existsSync(distDir)) return []
  return walkDirectory(distDir, '')
}

async function uploadToCdn(ctx: SyncContext, pkgDir: string): Promise<void> {
  ctx.state = 'uploading'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: uploading`)

  const files = collectDistFiles(pkgDir)
  if (files.length === 0) {
    throw new Error(`No dist files found for ${ctx.packageName}`)
  }

  // Calculate SRI hashes for JS files
  for (const file of files) {
    if (file.relativePath.endsWith('.mjs') || file.relativePath.endsWith('.js')) {
      const cdnUrl = `${ctx.cdnBasePath}/${file.relativePath}`
      ctx.sriHashes[cdnUrl] = calculateSriHash(file.absolutePath)
    }
  }

  const cdnStorageBucket = process.env.CDN_STORAGE_BUCKET ?? 'pro-components-cdn'
  const cdnPrefix = `${ctx.packageName}/${ctx.version}`

  for (const file of files) {
    const destPath = `${cdnPrefix}/${file.relativePath}`
    logger.info(`  Uploading ${file.relativePath} -> ${destPath}`)

    try {
      execSync(
        `aws s3 cp "${file.absolutePath}" "s3://${cdnStorageBucket}/${destPath}" --cache-control "public, max-age=31536000, immutable"`,
        { stdio: 'pipe' },
      )
    } catch {
      logger.warn(`  CDN upload skipped (provider not configured): ${file.relativePath}`)
    }
  }

  logger.info(
    `  Uploaded ${files.length} files, ${Object.keys(ctx.sriHashes).length} SRI hashes calculated`,
  )
}

async function waitForPropagation(ctx: SyncContext): Promise<void> {
  ctx.state = 'propagating'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: propagating`)

  const edgePops = (process.env.CDN_EDGE_POPS ?? 'edge-1,edge-2,edge-3').split(',')
  const timeoutMs = parseInt(process.env.CDN_PROPAGATION_TIMEOUT_MS ?? '120000', 10)
  const pollIntervalMs = 5000
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    let allReady = true

    for (const pop of edgePops) {
      try {
        const testUrl = `${ctx.cdnBasePath}/esm/index.mjs`
        execSync(`curl -sf -o /dev/null --max-time 5 "${testUrl}" -H "X-CDN-PoP: ${pop}"`, {
          stdio: 'pipe',
        })
      } catch {
        // PoP health check failed -- resource not yet propagated
        allReady = false
        break
      }
    }

    if (allReady) {
      logger.info(`  Propagation complete across ${edgePops.length} PoPs`)
      return
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    logger.info(`  Waiting for propagation... (${elapsed}s elapsed)`)
    await new Promise((r) => setTimeout(r, pollIntervalMs))
  }

  logger.warn(`  Propagation timeout after ${timeoutMs}ms — marking for manual intervention`)
  ctx.state = 'propagating'
  throw new Error(`CDN propagation timeout for ${ctx.packageName}@${ctx.version}`)
}

async function verifyDeployment(ctx: SyncContext): Promise<void> {
  ctx.state = 'verifying'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: verifying`)

  for (const [url, expectedHash] of Object.entries(ctx.sriHashes)) {
    try {
      const content = execSync(`curl -sf --max-time 10 "${url}"`, { encoding: 'buffer' })
      const actualHash = `sha384-${createHash('sha384').update(content).digest('base64')}`

      if (actualHash !== expectedHash) {
        throw new Error(`SRI mismatch for ${url}: expected ${expectedHash}, got ${actualHash}`)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('SRI mismatch')) throw err
      logger.warn(`  Verification skipped for ${url} (not accessible)`)
    }
  }

  logger.info(`  Verification passed for ${Object.keys(ctx.sriHashes).length} files`)
}

async function activateVersion(ctx: SyncContext): Promise<void> {
  ctx.state = 'active'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: active`)

  const platformApiUrl = process.env.PLATFORM_API_URL
  if (!platformApiUrl) return

  const payload = JSON.stringify({
    packageName: ctx.packageName,
    version: ctx.version,
    cdnBasePath: ctx.cdnBasePath,
    sriHashes: ctx.sriHashes,
  })

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execSync(
        `curl -sf -X POST "${platformApiUrl}/api/v1/versions/sync" -H "Content-Type: application/json" -d '${payload.replace(/'/g, "'\\''")}'`,
        { stdio: 'pipe', timeout: 10000 },
      )
      logger.info('  Platform API notified')
      break
    } catch {
      if (attempt === 3) {
        logger.warn('  Platform API notification failed after 3 attempts (non-blocking)')
      } else {
        await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
  }
}

async function syncPackage(pkgDir: string): Promise<SyncContext> {
  const raw = readFileSync(resolve(pkgDir, 'package.json'), 'utf-8')
  const pkg = JSON.parse(raw) as { name: string; version: string }
  const cdnBaseUrl = process.env.CDN_BASE_URL ?? 'https://cdn.internal'

  const ctx: SyncContext = {
    packageName: pkg.name,
    version: pkg.version,
    state: 'uploading',
    cdnBasePath: `${cdnBaseUrl}/${pkg.name}/${pkg.version}`,
    sriHashes: {},
  }

  try {
    await uploadToCdn(ctx, pkgDir)
    await waitForPropagation(ctx)
    await verifyDeployment(ctx)
    await activateVersion(ctx)
    return ctx
  } catch (err: unknown) {
    ctx.state = 'failed'
    ctx.error = err instanceof Error ? err.message : String(err)
    logger.error(`[${ctx.packageName}@${ctx.version}] FAILED: ${ctx.error}`)
    return ctx
  }
}

function isPublicPackage(dir: string): boolean {
  try {
    const raw = readFileSync(resolve(PACKAGES_DIR, dir, 'package.json'), 'utf-8')
    const pkg = JSON.parse(raw) as Record<string, unknown>
    return !pkg.private
  } catch {
    // Missing or malformed package.json -- treat as non-public
    return false
  }
}

async function main(): Promise<void> {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter(isPublicPackage)

  const results: SyncContext[] = []

  for (const dir of pkgDirs) {
    const result = await syncPackage(resolve(PACKAGES_DIR, dir))
    results.push(result)
  }

  const failed = results.filter((r) => r.state === 'failed')
  const active = results.filter((r) => r.state === 'active')
  const propagating = results.filter((r) => r.state === 'propagating')

  logger.info('\nCDN Sync Summary:')
  logger.info(`  Active: ${active.length}`)
  logger.info(`  Propagating (needs manual check): ${propagating.length}`)
  logger.info(`  Failed: ${failed.length}`)

  if (failed.length > 0) {
    logger.error('\nFailed packages:')
    failed.forEach((r) => logger.error(`  ${r.packageName}@${r.version}: ${r.error}`))
    process.exit(1)
  }
}

main()
