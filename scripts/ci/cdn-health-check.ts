/**
 * Nightly CDN health audit.
 * Checks SRI hash consistency and resource accessibility
 * for all active versions fetched from Platform API.
 */
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('cdn-health')

interface HealthCheckResult {
  url: string
  accessible: boolean
  sriValid: boolean | null
  expectedSri?: string
  actualSri?: string
  latencyMs: number
  error?: string
}

interface VersionInfo {
  packageName: string
  version: string
  cdnBasePath: string
  sriHashes: Record<string, string>
}

async function fetchActiveVersions(): Promise<VersionInfo[]> {
  const platformApiUrl = process.env.PLATFORM_API_URL
  if (!platformApiUrl) {
    logger.warn('PLATFORM_API_URL not set — using empty version list')
    return []
  }

  try {
    const result = execSync(
      `curl -sf --max-time 10 "${platformApiUrl}/api/v1/versions?status=active"`,
      { encoding: 'utf-8' },
    )
    return JSON.parse(result) as VersionInfo[]
  } catch {
    logger.error('Failed to fetch active versions from Platform API')
    return []
  }
}

async function checkResource(url: string, expectedSri?: string): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    const content = execSync(`curl -sf --max-time 15 "${url}"`, { encoding: 'buffer' })
    const latencyMs = Date.now() - startTime

    let sriValid: boolean | null = null
    let actualSri: string | undefined

    if (expectedSri) {
      actualSri = `sha384-${createHash('sha384').update(content).digest('base64')}`
      sriValid = actualSri === expectedSri
    }

    return { url, accessible: true, sriValid, expectedSri, actualSri, latencyMs }
  } catch (err: unknown) {
    return {
      url,
      accessible: false,
      sriValid: null,
      expectedSri,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

function printReport(results: HealthCheckResult[]): void {
  const inaccessible = results.filter((r) => !r.accessible)
  const sriMismatch = results.filter((r) => r.sriValid === false)
  const slowResponses = results.filter((r) => r.accessible && r.latencyMs > 5000)

  logger.info('\n=== CDN Health Check Report ===')
  logger.info(`Total resources checked: ${results.length}`)
  logger.info(`Accessible: ${results.filter((r) => r.accessible).length}`)
  logger.info(`Inaccessible: ${inaccessible.length}`)
  logger.info(`SRI mismatches: ${sriMismatch.length}`)
  logger.info(`Slow responses (>5s): ${slowResponses.length}`)

  if (inaccessible.length > 0) {
    logger.error('\nINACCESSIBLE RESOURCES:')
    inaccessible.forEach((r) => logger.error(`  ${r.url}: ${r.error}`))
  }

  if (sriMismatch.length > 0) {
    logger.error('\nSRI HASH MISMATCHES (CRITICAL):')
    sriMismatch.forEach((r) =>
      logger.error(`  ${r.url}\n    Expected: ${r.expectedSri}\n    Actual:   ${r.actualSri}`),
    )
  }

  if (slowResponses.length > 0) {
    logger.warn('\nSLOW RESPONSES:')
    slowResponses.forEach((r) => logger.warn(`  ${r.url}: ${r.latencyMs}ms`))
  }

  if (inaccessible.length > 0 || sriMismatch.length > 0) {
    process.exit(1)
  }

  logger.info('\nCDN Health Check PASSED')
}

async function main(): Promise<void> {
  const versions = await fetchActiveVersions()

  if (versions.length === 0) {
    logger.info('No active versions to check')
    return
  }

  const results: HealthCheckResult[] = []

  for (const version of versions) {
    logger.info(`\nChecking ${version.packageName}@${version.version}...`)

    // Check ESM entry
    const esmUrl = `${version.cdnBasePath}/esm/index.mjs`
    const esmSri = version.sriHashes[esmUrl]
    results.push(await checkResource(esmUrl, esmSri))

    // Check CSS
    const cssUrl = `${version.cdnBasePath}/style/index.css`
    results.push(await checkResource(cssUrl))

    // Check all SRI-hashed resources
    for (const [url, sri] of Object.entries(version.sriHashes)) {
      if (url !== esmUrl) {
        results.push(await checkResource(url, sri))
      }
    }
  }

  printReport(results)
}

main()
