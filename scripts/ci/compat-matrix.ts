/**
 * Compatibility matrix test runner.
 * Runs tests against multiple Vue x Element Plus version combinations.
 * Quick mode (PR): 2 combos. Full mode (nightly): 9 combos.
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('compat')
const ROOT = resolve(import.meta.dirname, '../..')

interface VersionCombo {
  vue: string
  elementPlus: string
}

interface CompatResult {
  vue: string
  elementPlus: string
  status: 'pass' | 'fail'
  testOutput?: string
  duration: number
}

const QUICK_COMBOS: VersionCombo[] = [
  { vue: 'latest', elementPlus: 'latest' },
  { vue: '3.4.0', elementPlus: '2.9.0' },
]

const FULL_COMBOS: VersionCombo[] = [
  { vue: '3.4.0', elementPlus: '2.9.0' },
  { vue: '3.4.0', elementPlus: '2.10.0' },
  { vue: '3.4.0', elementPlus: 'latest' },
  { vue: '3.5.0', elementPlus: '2.9.0' },
  { vue: '3.5.0', elementPlus: '2.10.0' },
  { vue: '3.5.0', elementPlus: 'latest' },
  { vue: 'latest', elementPlus: '2.9.0' },
  { vue: 'latest', elementPlus: '2.10.0' },
  { vue: 'latest', elementPlus: 'latest' },
]

function runTestsWithVersions(combo: VersionCombo): CompatResult {
  const startTime = Date.now()

  try {
    logger.info(`\nTesting: Vue ${combo.vue} + Element Plus ${combo.elementPlus}`)

    execSync(`pnpm add -Dw vue@${combo.vue} element-plus@${combo.elementPlus} --no-lockfile`, {
      cwd: ROOT,
      stdio: 'pipe',
    })

    const output = execSync('pnpm turbo test --no-cache', {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000,
    })

    return {
      vue: combo.vue,
      elementPlus: combo.elementPlus,
      status: 'pass',
      testOutput: output.slice(-500),
      duration: Date.now() - startTime,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      vue: combo.vue,
      elementPlus: combo.elementPlus,
      status: 'fail',
      testOutput: message.slice(-500),
      duration: Date.now() - startTime,
    }
  }
}

function reportToPlatformApi(results: CompatResult[]): void {
  const platformApiUrl = process.env.PLATFORM_API_URL
  if (!platformApiUrl) return

  const ciRunUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined

  for (const result of results) {
    const payload = JSON.stringify({
      vue_version: result.vue,
      element_plus_version: result.elementPlus,
      status: result.status,
      ci_run_url: ciRunUrl,
    })

    try {
      execSync(
        `curl -sf -X POST "${platformApiUrl}/api/v1/compat/report" -H "Content-Type: application/json" -d '${payload.replace(/'/g, "'\\''")}'`,
        { stdio: 'pipe', timeout: 10000 },
      )
    } catch {
      logger.warn(`Failed to report compat result for Vue ${result.vue} + EP ${result.elementPlus}`)
    }
  }
}

function printSummary(results: CompatResult[]): void {
  logger.info('\n=== Compatibility Matrix Results ===\n')
  logger.info('| Vue | Element Plus | Status | Duration |')
  logger.info('|-----|-------------|--------|----------|')
  for (const r of results) {
    const statusIcon = r.status === 'pass' ? 'PASS' : 'FAIL'
    const duration = Math.round(r.duration / 1000)
    logger.info(`| ${r.vue} | ${r.elementPlus} | ${statusIcon} | ${duration}s |`)
  }
}

function restoreOriginalVersions(): void {
  try {
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT, stdio: 'pipe' })
  } catch {
    logger.warn('Failed to restore original lockfile versions')
  }
}

async function main(): Promise<void> {
  const mode = process.env.COMPAT_MODE ?? 'quick'
  const combos = mode === 'full' ? FULL_COMBOS : QUICK_COMBOS

  logger.info(`Running compat matrix in ${mode} mode (${combos.length} combinations)`)

  const results: CompatResult[] = []

  for (const combo of combos) {
    results.push(runTestsWithVersions(combo))
  }

  restoreOriginalVersions()
  printSummary(results)
  reportToPlatformApi(results)

  const outputPath = resolve(ROOT, 'compat-results.json')
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  logger.info(`\nResults saved to ${outputPath}`)

  const failed = results.filter((r) => r.status === 'fail')
  if (failed.length > 0) {
    logger.error(`\n${failed.length} combination(s) FAILED`)
    process.exit(1)
  }

  logger.info('\nAll combinations PASSED')
}

main()
