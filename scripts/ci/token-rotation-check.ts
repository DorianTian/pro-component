/**
 * Token/credential rotation checker for nightly pipeline.
 * Checks if GitHub Actions credentials are nearing
 * expiration based on a 90-day rotation policy.
 *
 * Referenced in workflows as: scripts/ci/token-rotation-check.ts
 * (Plan originally named this secrets-expiry-check.ts)
 */
import { execSync } from 'node:child_process'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('rotation-check')

const ROTATION_PERIOD_DAYS = 90
const WARNING_THRESHOLD_DAYS = 14
const CRITICAL_THRESHOLD_DAYS = 7

type CheckStatus = 'ok' | 'warning' | 'expired' | 'unknown'

interface CredentialCheck {
  name: string
  source: string
  daysUntilExpiry: number | null
  status: CheckStatus
}

const STATUS_ICON: Record<CheckStatus, string> = {
  ok: 'OK',
  warning: 'WARN',
  expired: 'EXPIRED',
  unknown: '?',
}

function checkNpmTokenExpiry(): CredentialCheck {
  const token = process.env.NPM_TOKEN
  if (!token) {
    return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: null, status: 'unknown' }
  }

  try {
    const result = execSync('npm whoami 2>&1', {
      encoding: 'utf-8',
      env: { ...process.env, NPM_CONFIG_REGISTRY: 'https://registry.npmjs.org' },
    })

    if (result.includes('ENEEDAUTH') || result.includes('401')) {
      return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: 0, status: 'expired' }
    }

    // npm doesn't expose token expiry directly
    return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: null, status: 'ok' }
  } catch {
    // npm whoami failed -- token is invalid or expired
    return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: 0, status: 'expired' }
  }
}

function computeExpiryStatus(daysUntilExpiry: number): CheckStatus {
  if (daysUntilExpiry <= 0) return 'expired'
  if (daysUntilExpiry <= CRITICAL_THRESHOLD_DAYS) return 'warning'
  if (daysUntilExpiry <= WARNING_THRESHOLD_DAYS) return 'warning'
  return 'ok'
}

function checkCreatedAtExpiry(envVar: string, name: string): CredentialCheck {
  const createdAt = process.env[`${envVar}_CREATED_AT`]
  if (!createdAt) {
    return { name, source: 'env', daysUntilExpiry: null, status: 'unknown' }
  }

  const createdDate = new Date(createdAt)
  const expiryDate = new Date(createdDate.getTime() + ROTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  const status = computeExpiryStatus(daysUntilExpiry)

  return { name, source: 'env', daysUntilExpiry, status }
}

function printResults(checks: CredentialCheck[]): void {
  logger.info('=== Credential Rotation Check ===\n')
  logger.info('| Name | Status | Days Until Expiry |')
  logger.info('|------|--------|-------------------|')

  for (const check of checks) {
    const icon = STATUS_ICON[check.status]
    const expiry = check.daysUntilExpiry !== null ? `${check.daysUntilExpiry}d` : 'N/A'
    logger.info(`| ${check.name} | ${icon} | ${expiry} |`)
  }
}

async function main(): Promise<void> {
  const checks: CredentialCheck[] = [
    checkNpmTokenExpiry(),
    checkCreatedAtExpiry('CDN_ACCESS_KEY', 'CDN_ACCESS_KEY'),
    checkCreatedAtExpiry('PLATFORM_API_KEY', 'PLATFORM_API_KEY'),
    checkCreatedAtExpiry('SLACK_WEBHOOK_URL', 'SLACK_WEBHOOK_URL'),
    checkCreatedAtExpiry('WECHAT_WEBHOOK_URL', 'WECHAT_WEBHOOK_URL'),
  ]

  printResults(checks)

  const expired = checks.filter((c) => c.status === 'expired')
  const warnings = checks.filter((c) => c.status === 'warning')

  if (expired.length > 0) {
    logger.error(`\n${expired.length} credential(s) EXPIRED — rotate immediately!`)
    expired.forEach((c) => logger.error(`  ${c.name}`))
  }

  if (warnings.length > 0) {
    logger.warn(`\n${warnings.length} credential(s) expiring soon:`)
    warnings.forEach((c) => logger.warn(`  ${c.name}: ${c.daysUntilExpiry} days remaining`))
  }

  if (expired.length > 0) {
    process.exit(1)
  }

  logger.info('\nRotation check complete')
}

main()
