/**
 * Checks if package versions already exist on npm before publishing.
 * Makes `npm publish` idempotent — safe to re-run after partial failure.
 */
import { execSync } from 'node:child_process'
import { appendFileSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('npm-version')
const PACKAGES_DIR = resolve(import.meta.dirname, '../../packages')

interface PackageCheck {
  name: string
  version: string
  alreadyPublished: boolean
}

function checkVersionExists(name: string, version: string): boolean {
  try {
    const result = execSync(`npm view ${name}@${version} version`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    return result === version
  } catch {
    // npm view exits non-zero if version doesn't exist
    return false
  }
}

function isPublishablePackage(pkgPath: string): boolean {
  try {
    const raw = readFileSync(pkgPath, 'utf-8')
    const pkg: unknown = JSON.parse(raw)
    return (
      typeof pkg === 'object' &&
      pkg !== null &&
      !('private' in pkg && (pkg as Record<string, unknown>).private)
    )
  } catch {
    // Missing or malformed package.json -- skip this package
    return false
  }
}

function writeGitHubOutput(hasNewVersions: boolean, publishNames: string[]): void {
  const outputFile = process.env.GITHUB_OUTPUT
  if (outputFile) {
    appendFileSync(outputFile, `has-new-versions=${hasNewVersions}\n`)
    appendFileSync(outputFile, `packages=${JSON.stringify(publishNames)}\n`)
  }
}

async function main(): Promise<void> {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) => {
    const pkgPath = resolve(PACKAGES_DIR, d, 'package.json')
    return isPublishablePackage(pkgPath)
  })

  const results: PackageCheck[] = []

  for (const dir of pkgDirs) {
    const pkgPath = resolve(PACKAGES_DIR, dir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name: string; version: string }
    const alreadyPublished = checkVersionExists(pkg.name, pkg.version)
    results.push({ name: pkg.name, version: pkg.version, alreadyPublished })
  }

  const toPublish = results.filter((r) => !r.alreadyPublished)
  const alreadyPublished = results.filter((r) => r.alreadyPublished)

  if (alreadyPublished.length > 0) {
    logger.info('Already published (will skip):')
    alreadyPublished.forEach((r) => logger.info(`  ${r.name}@${r.version}`))
  }

  if (toPublish.length > 0) {
    logger.info('Will publish:')
    toPublish.forEach((r) => logger.info(`  ${r.name}@${r.version}`))
  } else {
    logger.info('All versions already published — nothing to do')
  }

  const publishNames = toPublish.map((r) => r.name)
  const hasNewVersions = toPublish.length > 0

  writeGitHubOutput(hasNewVersions, publishNames)
}

main()
