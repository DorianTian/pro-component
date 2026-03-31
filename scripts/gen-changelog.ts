import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CHANGESET_DIR = resolve(ROOT, '.changeset')
const OUTPUT_FILE = resolve(ROOT, 'docs/changelog.md')

interface ChangesetEntry {
  id: string
  summary: string
  releases: Array<{ name: string; type: 'major' | 'minor' | 'patch' }>
}

/**
 * Parse a single changeset markdown file.
 *
 * Format:
 * ---
 * "@pro/table": minor
 * "@pro/form": patch
 * ---
 *
 * Summary text here.
 */
function parseChangeset(content: string, filename: string): ChangesetEntry | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/)
  if (!match) return null

  const header = match[1].trim()
  const summary = match[2].trim()

  const releases: ChangesetEntry['releases'] = []
  for (const line of header.split('\n')) {
    const lineMatch = line.match(/^["']?(@?[\w/.-]+)["']?\s*:\s*(major|minor|patch)\s*$/)
    if (lineMatch) {
      releases.push({ name: lineMatch[1], type: lineMatch[2] as 'major' | 'minor' | 'patch' })
    }
  }

  if (releases.length === 0) return null

  return {
    id: filename.replace('.md', ''),
    summary,
    releases,
  }
}

/**
 * Package directories to collect CHANGELOG.md from.
 */
const PACKAGE_DIRS = [
  'packages/pro-table',
  'packages/pro-form',
  'packages/pro-descriptions',
  'packages/pro-components',
  'packages/hooks',
  'packages/utils',
  'packages/themes',
  'packages/resolvers',
]

/**
 * Read all existing version changelogs from each package's CHANGELOG.md.
 * Changesets generates these when running `changeset version`.
 */
function readPackageChangelogs(): string[] {
  const sections: string[] = []

  for (const dir of PACKAGE_DIRS) {
    const changelogPath = resolve(ROOT, dir, 'CHANGELOG.md')
    if (!existsSync(changelogPath)) continue

    const content = readFileSync(changelogPath, 'utf-8')
    const pkgJsonPath = resolve(ROOT, dir, 'package.json')
    const pkgName = existsSync(pkgJsonPath)
      ? (JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as { name: string }).name
      : dir

    // Extract version sections (## x.y.z)
    const versionSections = content.split(/^## /m).slice(1)
    for (const section of versionSections) {
      const lines = section.split('\n')
      const versionLine = lines[0].trim()
      const body = lines.slice(1).join('\n').trim()
      if (versionLine && body) {
        sections.push(`### ${pkgName}@${versionLine}\n\n${body}`)
      }
    }
  }

  return sections
}

/**
 * Read pending (unreleased) changesets from .changeset/ directory.
 */
function readPendingChangesets(): ChangesetEntry[] {
  if (!existsSync(CHANGESET_DIR)) return []

  const files = readdirSync(CHANGESET_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md')

  const entries: ChangesetEntry[] = []

  for (const file of files) {
    const content = readFileSync(join(CHANGESET_DIR, file), 'utf-8')
    const entry = parseChangeset(content, file)
    if (entry) entries.push(entry)
  }

  return entries
}

function main() {
  const pending = readPendingChangesets()
  const released = readPackageChangelogs()

  const lines: string[] = [
    '---',
    'outline: deep',
    '---',
    '',
    '# 更新日志',
    '',
    '> 本页由 changesets 自动生成，请勿手动编辑。',
    '',
  ]

  // Unreleased section
  if (pending.length > 0) {
    lines.push('## 未发布', '')
    for (const entry of pending) {
      const packages = entry.releases.map((r) => `\`${r.name}\` (${r.type})`).join(', ')
      lines.push(`- ${entry.summary} — ${packages}`)
    }
    lines.push('')
  }

  // Released versions
  if (released.length > 0) {
    lines.push('## 已发布版本', '')
    for (const section of released) {
      lines.push(section, '')
    }
  }

  // Fallback if nothing exists yet
  if (pending.length === 0 && released.length === 0) {
    lines.push('暂无更新记录。首次发布后将自动生成更新日志。', '')
  }

  writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf-8')
  process.stdout.write(`Changelog generated → ${OUTPUT_FILE}\n`)
}

main()
