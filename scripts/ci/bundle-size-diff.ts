/**
 * Bundle size diff reporter for PR pipelines.
 * Compares bundle sizes between base branch and PR branch,
 * outputs a markdown table for the PR comment.
 */
import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'

import { createCiLogger } from './logger.js'

const logger = createCiLogger('size-diff')
const PACKAGES_DIR = resolve(import.meta.dirname, '../../packages')

interface SizeEntry {
  package: string
  format: string
  file: string
  sizeBytes: number
}

function collectFormatSizes(distDir: string, dir: string, format: string): SizeEntry[] {
  const entries: SizeEntry[] = []
  const formatDir = resolve(distDir, format)
  if (!existsSync(formatDir)) return entries

  const files = readdirSync(formatDir).filter((f) => f.endsWith('.mjs') || f.endsWith('.js'))
  for (const file of files) {
    const stat = statSync(join(formatDir, file))
    entries.push({ package: dir, format, file, sizeBytes: stat.size })
  }
  return entries
}

function collectCssSizes(distDir: string, dir: string): SizeEntry[] {
  const entries: SizeEntry[] = []
  const styleDir = resolve(distDir, 'style')
  if (!existsSync(styleDir)) return entries

  const cssFiles = readdirSync(styleDir).filter((f) => f.endsWith('.css'))
  for (const file of cssFiles) {
    const stat = statSync(join(styleDir, file))
    entries.push({ package: dir, format: 'css', file, sizeBytes: stat.size })
  }
  return entries
}

function collectSizes(): SizeEntry[] {
  const entries: SizeEntry[] = []
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) =>
    existsSync(resolve(PACKAGES_DIR, d, 'dist')),
  )

  for (const dir of pkgDirs) {
    const distDir = resolve(PACKAGES_DIR, dir, 'dist')
    for (const format of ['esm', 'cjs', 'umd']) {
      entries.push(...collectFormatSizes(distDir, dir, format))
    }
    entries.push(...collectCssSizes(distDir, dir))
  }

  return entries
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} kB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatDiff(base: number, current: number): string {
  if (base === 0) return 'NEW'
  const diff = current - base
  const pct = ((diff / base) * 100).toFixed(1)
  const sign = diff > 0 ? '+' : ''
  const icon = diff > 0 ? (parseFloat(pct) > 10 ? '!!' : '!') : diff < 0 ? 'v' : '-'
  return `${icon} ${sign}${formatSize(diff)} (${sign}${pct}%)`
}

function buildMarkdownReport(currentSizes: SizeEntry[], baseSizes: SizeEntry[]): string {
  const baseMap = new Map<string, number>()
  for (const entry of baseSizes) {
    baseMap.set(`${entry.package}/${entry.format}/${entry.file}`, entry.sizeBytes)
  }

  let md = '### Bundle Size Report\n\n'
  md += '| Package | Format | File | Size | Diff |\n'
  md += '|---------|--------|------|------|------|\n'

  let totalBase = 0
  let totalCurrent = 0

  for (const entry of currentSizes) {
    const key = `${entry.package}/${entry.format}/${entry.file}`
    const baseSize = baseMap.get(key) ?? 0
    totalBase += baseSize
    totalCurrent += entry.sizeBytes
    md += `| ${entry.package} | ${entry.format} | ${entry.file} | ${formatSize(entry.sizeBytes)} | ${formatDiff(baseSize, entry.sizeBytes)} |\n`
  }

  md += `\n**Total:** ${formatSize(totalCurrent)}`
  if (totalBase > 0) {
    md += ` (${formatDiff(totalBase, totalCurrent)})`
  }
  md += '\n'

  return md
}

async function main(): Promise<void> {
  const baseSizesPath = process.env.BASE_SIZES_PATH
  const outputPath =
    process.env.SIZE_DIFF_OUTPUT ?? resolve(import.meta.dirname, '../../size-diff.md')

  const currentSizes = collectSizes()

  // Save current sizes for base branch job to pick up
  if (process.env.SAVE_SIZES === 'true') {
    const savePath = process.env.SIZES_SAVE_PATH ?? resolve(import.meta.dirname, '../../sizes.json')
    writeFileSync(savePath, JSON.stringify(currentSizes, null, 2))
    logger.info(`Sizes saved to ${savePath}`)
    return
  }

  // Compare with base sizes
  let baseSizes: SizeEntry[] = []
  if (baseSizesPath && existsSync(baseSizesPath)) {
    baseSizes = JSON.parse(readFileSync(baseSizesPath, 'utf-8')) as SizeEntry[]
  }

  const md = buildMarkdownReport(currentSizes, baseSizes)
  writeFileSync(outputPath, md)
  logger.info(`Size diff report written to ${outputPath}`)

  // Also output to GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
  }
}

main()
