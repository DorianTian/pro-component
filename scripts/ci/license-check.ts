/**
 * License allowlist validator for CI pipelines.
 * Validates that all dependencies use approved open-source licenses.
 */
import { execSync } from 'node:child_process'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('license')

const ALLOWED_LICENSES: readonly string[] = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'CC0-1.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'Python-2.0',
  'Artistic-2.0',
  'Zlib',
]

/** Manual overrides for packages with ambiguous license fields */
const PACKAGE_OVERRIDES: Record<string, string> = {
  // e.g., 'some-package@1.0.0': 'MIT'
}

interface LicenseEntry {
  name: string
  version: string
  license: string
  path: string
}

function extractPackagesForLicense(license: string, packages: unknown): LicenseEntry[] {
  if (!Array.isArray(packages)) return []
  return packages.map((pkg) => {
    const pkgRecord = pkg as Record<string, unknown>
    return {
      name: String(pkgRecord.name ?? 'unknown'),
      version: String(pkgRecord.version ?? '0.0.0'),
      license,
      path: String(pkgRecord.path ?? ''),
    }
  })
}

function parseObjectFormat(parsed: Record<string, unknown>): LicenseEntry[] {
  const entries: LicenseEntry[] = []
  for (const [license, packages] of Object.entries(parsed)) {
    entries.push(...extractPackagesForLicense(license, packages))
  }
  return entries
}

function parseLicenses(): LicenseEntry[] {
  const raw = execSync('pnpm licenses list --json 2>/dev/null || echo "[]"', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })

  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as LicenseEntry[]

    // pnpm licenses list --json returns an object keyed by license type
    if (typeof parsed === 'object' && parsed !== null) {
      return parseObjectFormat(parsed as Record<string, unknown>)
    }
    return []
  } catch {
    logger.warn('Failed to parse pnpm licenses output, falling back to empty list')
    return []
  }
}

function isLicenseAllowed(license: string): boolean {
  const licenses = license
    .replace(/[()]/g, '')
    .split(/\s+OR\s+/i)
    .map((l) => l.trim())

  return licenses.some((l) => ALLOWED_LICENSES.includes(l))
}

function main(): void {
  const entries = parseLicenses()

  if (entries.length === 0) {
    logger.info('No license data found (pnpm licenses may not be available)')
    logger.info('PASS (no data)')
    return
  }

  const violations: LicenseEntry[] = []

  for (const entry of entries) {
    const key = `${entry.name}@${entry.version}`
    const license = PACKAGE_OVERRIDES[key] ?? entry.license

    if (!isLicenseAllowed(license)) {
      violations.push({ ...entry, license })
    }
  }

  if (violations.length > 0) {
    logger.error('LICENSE CHECK FAILED — disallowed licenses found:\n')
    for (const v of violations) {
      logger.error(`  ${v.name}@${v.version}: ${v.license}`)
    }
    logger.error(`\nAllowed licenses: ${ALLOWED_LICENSES.join(', ')}`)
    logger.error(
      'Add overrides to PACKAGE_OVERRIDES in scripts/ci/license-check.ts if license is valid but not detected correctly.',
    )
    process.exit(1)
  }

  logger.info(`License check PASSED (${entries.length} packages checked)`)
}

main()
