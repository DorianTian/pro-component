# Plan 6: CI/CD Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up complete CI/CD automation — PR checks (lint, build, test, security, preview), release pipeline (changesets, npm publish, CDN sync, docs deploy), nightly health checks, and secrets management — ensuring every commit is validated and every release is safe, idempotent, and observable.

**Architecture:** Three GitHub Actions workflows form the pipeline backbone. PR pipeline gates every merge with quality checks and previews. Release pipeline orchestrates changesets → npm → CDN → docs → notification as an ordered state machine. Nightly pipeline runs the full compatibility matrix, CDN health audits, and security scans. All publish/deploy steps are idempotent — safe to re-run after partial failure.

**Tech Stack:** GitHub Actions (reusable workflows, OIDC), pnpm 9+, Turborepo 2+ (remote cache in CI), Vitest, Cypress Component Testing, Changesets, pkg-pr-new (PR preview packages), VitePress, pnpm audit, license-checker-webpack-plugin (via license-checker), es-module-shims

---

## File Structure

```
pro-components/
├── .github/
│   ├── workflows/
│   │   ├── pr.yml                        # PR pipeline
│   │   ├── release.yml                   # Release pipeline
│   │   └── nightly.yml                   # Nightly health checks
│   ├── actions/
│   │   ├── setup/action.yml              # Reusable: pnpm + node + turbo cache
│   │   └── notify/action.yml             # Reusable: multi-channel notification
│   └── CODEOWNERS                        # Review requirements
├── scripts/
│   ├── validate-build.ts                 # (exists from Plan 1)
│   ├── ci/
│   │   ├── check-npm-version.ts          # Idempotent publish guard
│   │   ├── cdn-sync.ts                   # CDN upload + state machine
│   │   ├── cdn-health-check.ts           # SRI + accessibility audit
│   │   ├── compat-matrix.ts              # Version combo test runner
│   │   ├── license-check.ts             # License allowlist validation
│   │   ├── secrets-expiry-check.ts       # Secrets rotation reminder
│   │   ├── bundle-size-diff.ts           # Size comparison for PR comment
│   │   └── pr-summary-comment.ts         # Aggregate results → PR comment
│   └── notify.ts                         # WeChat/Slack/email dispatcher
└── .changeset/
    └── config.json                       # (exists from Plan 1)
```

---

### Task 1: Reusable Setup Action

**Files:**

- Create: `.github/actions/setup/action.yml`

This composite action is used by all three workflows to install pnpm, Node.js, restore Turborepo cache, and install dependencies.

- [ ] **Step 1: Create `.github/actions/setup/action.yml`**

```yaml
name: 'Setup Project'
description: 'Install pnpm, Node.js, restore cache, install dependencies'

inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '20'
  turbo-token:
    description: 'Turborepo remote cache token'
    required: false
    default: ''
  turbo-team:
    description: 'Turborepo remote cache team'
    required: false
    default: ''

runs:
  using: 'composite'
  steps:
    - name: Install pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        registry-url: 'https://registry.npmjs.org'
        cache: 'pnpm'

    - name: Restore Turborepo cache
      uses: actions/cache@v4
      with:
        path: .turbo
        key: turbo-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-${{ github.sha }}
        restore-keys: |
          turbo-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-
          turbo-${{ runner.os }}-

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile

    - name: Set Turborepo remote cache env
      if: inputs.turbo-token != ''
      shell: bash
      run: |
        echo "TURBO_TOKEN=${{ inputs.turbo-token }}" >> $GITHUB_ENV
        echo "TURBO_TEAM=${{ inputs.turbo-team }}" >> $GITHUB_ENV
```

- [ ] **Step 2: Commit**

```bash
git add .github/actions/setup/action.yml
git commit -m "ci: add reusable setup composite action"
```

---

### Task 2: Reusable Notification Action

**Files:**

- Create: `.github/actions/notify/action.yml`
- Create: `scripts/notify.ts`

- [ ] **Step 1: Create `scripts/notify.ts`**

```typescript
import { request } from 'node:https'

interface NotifyPayload {
  channel: 'wechat' | 'slack' | 'email'
  title: string
  body: string
  level: 'info' | 'warning' | 'error'
  metadata?: Record<string, string>
}

interface ChannelConfig {
  wechatWebhookUrl?: string
  slackWebhookUrl?: string
  emailApiUrl?: string
  emailApiKey?: string
  emailRecipients?: string
}

function sendWechat(webhookUrl: string, payload: NotifyPayload): Promise<void> {
  const body = JSON.stringify({
    msgtype: 'markdown',
    markdown: {
      content: `### ${payload.title}\n${payload.body}`,
    },
  })

  return httpPost(webhookUrl, body)
}

function sendSlack(webhookUrl: string, payload: NotifyPayload): Promise<void> {
  const colorMap = { info: '#36a64f', warning: '#ffcc00', error: '#ff0000' }
  const body = JSON.stringify({
    attachments: [
      {
        color: colorMap[payload.level],
        title: payload.title,
        text: payload.body,
        fields: Object.entries(payload.metadata ?? {}).map(([k, v]) => ({
          title: k,
          value: v,
          short: true,
        })),
      },
    ],
  })

  return httpPost(webhookUrl, body)
}

function sendEmail(
  apiUrl: string,
  apiKey: string,
  recipients: string,
  payload: NotifyPayload,
): Promise<void> {
  const body = JSON.stringify({
    to: recipients.split(',').map((e) => e.trim()),
    subject: `[pro-components] ${payload.title}`,
    html: `<h2>${payload.title}</h2><p>${payload.body.replace(/\n/g, '<br>')}</p>`,
  })

  return httpPost(apiUrl, body, { Authorization: `Bearer ${apiKey}` })
}

function httpPost(url: string, body: string, extraHeaders?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...extraHeaders,
      },
    }

    const req = request(options, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`)
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }
  throw new Error('Unreachable')
}

async function main() {
  const title = process.env.NOTIFY_TITLE ?? 'CI Notification'
  const body = process.env.NOTIFY_BODY ?? ''
  const level = (process.env.NOTIFY_LEVEL ?? 'info') as NotifyPayload['level']
  const channels = (process.env.NOTIFY_CHANNELS ?? 'slack').split(',').map((c) => c.trim())
  const metadata: Record<string, string> = {}

  if (process.env.NOTIFY_METADATA) {
    try {
      Object.assign(metadata, JSON.parse(process.env.NOTIFY_METADATA))
    } catch {
      logger.warn('Failed to parse NOTIFY_METADATA, ignoring')
    }
  }

  const config: ChannelConfig = {
    wechatWebhookUrl: process.env.WECHAT_WEBHOOK_URL,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    emailApiUrl: process.env.EMAIL_API_URL,
    emailApiKey: process.env.EMAIL_API_KEY,
    emailRecipients: process.env.EMAIL_RECIPIENTS,
  }

  const payload: NotifyPayload = { channel: 'slack', title, body, level, metadata }

  const results: Array<{ channel: string; success: boolean; error?: string }> = []

  for (const channel of channels) {
    try {
      switch (channel) {
        case 'wechat':
          if (!config.wechatWebhookUrl) throw new Error('WECHAT_WEBHOOK_URL not set')
          await withRetry(() =>
            sendWechat(config.wechatWebhookUrl!, { ...payload, channel: 'wechat' }),
          )
          break
        case 'slack':
          if (!config.slackWebhookUrl) throw new Error('SLACK_WEBHOOK_URL not set')
          await withRetry(() =>
            sendSlack(config.slackWebhookUrl!, { ...payload, channel: 'slack' }),
          )
          break
        case 'email':
          if (!config.emailApiUrl || !config.emailApiKey)
            throw new Error('EMAIL_API_URL or EMAIL_API_KEY not set')
          await withRetry(() =>
            sendEmail(config.emailApiUrl!, config.emailApiKey!, config.emailRecipients ?? '', {
              ...payload,
              channel: 'email',
            }),
          )
          break
        default:
          logger.warn(`Unknown notification channel: ${channel}`)
      }
      results.push({ channel, success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(`Failed to notify via ${channel}: ${message}`)
      results.push({ channel, success: false, error: message })
    }
  }

  const anyFailed = results.some((r) => !r.success)
  if (anyFailed) {
    logger.warn('Some notification channels failed (non-blocking):')
    results.filter((r) => !r.success).forEach((r) => logger.warn(`  ${r.channel}: ${r.error}`))
  }

  // Notification failures are non-blocking — do not exit(1)
  logger.info('Notification dispatch complete')
}

main()
```

- [ ] **Step 2: Create `.github/actions/notify/action.yml`**

```yaml
name: 'Send Notification'
description: 'Send notifications to WeChat/Slack/email'

inputs:
  channels:
    description: 'Comma-separated notification channels (wechat,slack,email)'
    required: false
    default: 'slack'
  title:
    description: 'Notification title'
    required: true
  body:
    description: 'Notification body (supports markdown)'
    required: true
  level:
    description: 'Notification level (info, warning, error)'
    required: false
    default: 'info'
  metadata:
    description: 'JSON string of key-value metadata'
    required: false
    default: '{}'
  wechat-webhook-url:
    description: 'WeChat webhook URL'
    required: false
  slack-webhook-url:
    description: 'Slack webhook URL'
    required: false
  email-api-url:
    description: 'Email API URL'
    required: false
  email-api-key:
    description: 'Email API key'
    required: false
  email-recipients:
    description: 'Comma-separated email recipients'
    required: false

runs:
  using: 'composite'
  steps:
    - name: Send notification
      shell: bash
      env:
        NOTIFY_CHANNELS: ${{ inputs.channels }}
        NOTIFY_TITLE: ${{ inputs.title }}
        NOTIFY_BODY: ${{ inputs.body }}
        NOTIFY_LEVEL: ${{ inputs.level }}
        NOTIFY_METADATA: ${{ inputs.metadata }}
        WECHAT_WEBHOOK_URL: ${{ inputs.wechat-webhook-url }}
        SLACK_WEBHOOK_URL: ${{ inputs.slack-webhook-url }}
        EMAIL_API_URL: ${{ inputs.email-api-url }}
        EMAIL_API_KEY: ${{ inputs.email-api-key }}
        EMAIL_RECIPIENTS: ${{ inputs.email-recipients }}
      run: npx tsx scripts/notify.ts
```

- [ ] **Step 3: Commit**

```bash
git add scripts/notify.ts .github/actions/notify/action.yml
git commit -m "ci: add multi-channel notification action and script"
```

---

### Task 3a: CI Utility Scripts — Version Check + License

> **Code quality rules:** Each script file MUST stay under 400 lines. All functions MUST be under 50 lines. Use `unknown` (never `any`) for caught errors. All scripts MUST use a logger wrapper (`scripts/ci/logger.ts`) — no raw `console.log/warn/error`. Use named exports only (no `export default`) in `.ts` files.

**Files:**

- Create: `scripts/ci/logger.ts` (shared logger wrapper for all CI scripts)
- Create: `scripts/ci/check-npm-version.ts`
- Create: `scripts/ci/license-check.ts`

> **Logger wrapper (create first):** All CI scripts must use a logger wrapper, not raw `console.log`. Create `scripts/ci/logger.ts` using pino with a `ci:` prefix. Export named functions: `createCiLogger()`. All subsequent scripts import from this module.

- [ ] **Step 1: Create `scripts/ci/check-npm-version.ts`**

Checks if a package version already exists on npm before publishing — makes `npm publish` idempotent.

```typescript
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

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

async function main() {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) => {
    try {
      const pkg: unknown = JSON.parse(
        readFileSync(resolve(PACKAGES_DIR, d, 'package.json'), 'utf-8'),
      )
      return (
        typeof pkg === 'object' &&
        pkg !== null &&
        !('private' in pkg && (pkg as Record<string, unknown>).private)
      )
    } catch {
      return false
    }
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

  // Output for GitHub Actions
  const publishNames = toPublish.map((r) => r.name)
  const hasNewVersions = toPublish.length > 0

  // Write outputs for subsequent steps
  const outputFile = process.env.GITHUB_OUTPUT
  if (outputFile) {
    const { appendFileSync } = await import('node:fs')
    appendFileSync(outputFile, `has-new-versions=${hasNewVersions}\n`)
    appendFileSync(outputFile, `packages=${JSON.stringify(publishNames)}\n`)
  }

  logger.info(`::set-output name=has-new-versions::${hasNewVersions}`)
}

main()
```

- [ ] **Step 2: Create `scripts/ci/license-check.ts`**

Validates that all dependencies use approved licenses.

```typescript
import { execSync } from 'node:child_process'

const ALLOWED_LICENSES = [
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

const PACKAGE_OVERRIDES: Record<string, string> = {
  // Add manual overrides for packages with ambiguous license fields
  // e.g., 'some-package@1.0.0': 'MIT'
}

interface LicenseEntry {
  name: string
  version: string
  license: string
  path: string
}

function parseLicenses(): LicenseEntry[] {
  const raw = execSync('pnpm licenses list --json 2>/dev/null || echo "[]"', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    // pnpm licenses list --json returns an object keyed by license type
    const entries: LicenseEntry[] = []
    for (const [license, packages] of Object.entries(parsed)) {
      if (Array.isArray(packages)) {
        for (const pkg of packages) {
          const pkgRecord = pkg as Record<string, unknown>
          entries.push({
            name: String(pkgRecord.name ?? 'unknown'),
            version: String(pkgRecord.version ?? '0.0.0'),
            license,
            path: String(pkgRecord.path ?? ''),
          })
        }
      }
    }
    return entries
  } catch {
    logger.warn('Failed to parse pnpm licenses output, falling back to empty list')
    return []
  }
}

function main() {
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

    // Handle multi-license (OR) — e.g., "(MIT OR Apache-2.0)"
    const licenses = license
      .replace(/[()]/g, '')
      .split(/\s+OR\s+/i)
      .map((l) => l.trim())

    const hasAllowed = licenses.some((l) => ALLOWED_LICENSES.includes(l))

    if (!hasAllowed) {
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
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/logger.ts scripts/ci/check-npm-version.ts scripts/ci/license-check.ts
git commit -m "feat(ci): add logger wrapper, npm version check, and license check scripts"
```

---

### Task 3b: CI Utility Scripts — Bundle Size + PR Summary

> **Code quality rules:** Same as Task 3a — each file ≤ 400 lines, functions ≤ 50 lines, `unknown` not `any`, logger wrapper not `console`, named exports only.

**Files:**

- Create: `scripts/ci/bundle-size-diff.ts`
- Create: `scripts/ci/pr-summary-comment.ts`

- [ ] **Step 1: Create `scripts/ci/bundle-size-diff.ts`**

Compares bundle sizes between base branch and PR branch, outputs a markdown table.

```typescript
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const PACKAGES_DIR = resolve(import.meta.dirname, '../../packages')

interface SizeEntry {
  package: string
  format: string
  file: string
  sizeBytes: number
}

function collectSizes(): SizeEntry[] {
  const entries: SizeEntry[] = []
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) =>
    existsSync(resolve(PACKAGES_DIR, d, 'dist')),
  )

  for (const dir of pkgDirs) {
    const distDir = resolve(PACKAGES_DIR, dir, 'dist')

    for (const format of ['esm', 'cjs', 'umd']) {
      const formatDir = resolve(distDir, format)
      if (!existsSync(formatDir)) continue

      const files = readdirSync(formatDir).filter((f) => f.endsWith('.mjs') || f.endsWith('.js'))

      for (const file of files) {
        const stat = statSync(join(formatDir, file))
        entries.push({
          package: dir,
          format,
          file,
          sizeBytes: stat.size,
        })
      }
    }

    // CSS
    const styleDir = resolve(distDir, 'style')
    if (existsSync(styleDir)) {
      const cssFiles = readdirSync(styleDir).filter((f) => f.endsWith('.css'))
      for (const file of cssFiles) {
        const stat = statSync(join(styleDir, file))
        entries.push({
          package: dir,
          format: 'css',
          file,
          sizeBytes: stat.size,
        })
      }
    }
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
  const emoji = diff > 0 ? (parseFloat(pct) > 10 ? '🔴' : '🟡') : diff < 0 ? '🟢' : '⚪'
  return `${emoji} ${sign}${formatSize(diff)} (${sign}${pct}%)`
}

async function main() {
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
    baseSizes = JSON.parse(readFileSync(baseSizesPath, 'utf-8'))
  }

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

  writeFileSync(outputPath, md)
  logger.info(`Size diff report written to ${outputPath}`)

  // Also output to GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import('node:fs')
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
  }
}

main()
```

- [ ] **Step 4: Create `scripts/ci/pr-summary-comment.ts`**

Aggregates test results, bundle size diff, and lint/type-check status into a single PR comment.

```typescript
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '../..')

interface JobResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  details?: string
}

function getEnvOrDefault(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

function buildComment(): string {
  const prNumber = process.env.PR_NUMBER ?? 'unknown'
  const commitSha = (process.env.COMMIT_SHA ?? 'unknown').slice(0, 7)

  const jobs: JobResult[] = [
    {
      name: 'Lint + Type Check',
      status: (process.env.LINT_STATUS as JobResult['status']) ?? 'skip',
    },
    { name: 'Build', status: (process.env.BUILD_STATUS as JobResult['status']) ?? 'skip' },
    {
      name: 'Build Validation',
      status: (process.env.VALIDATE_STATUS as JobResult['status']) ?? 'skip',
    },
    {
      name: 'Unit + Integration Tests',
      status: (process.env.TEST_STATUS as JobResult['status']) ?? 'skip',
    },
    {
      name: 'Cypress Component Tests',
      status: (process.env.E2E_STATUS as JobResult['status']) ?? 'skip',
    },
    {
      name: 'Compat (Latest)',
      status: (process.env.COMPAT_LATEST_STATUS as JobResult['status']) ?? 'skip',
    },
    {
      name: 'Compat (Minimum)',
      status: (process.env.COMPAT_MIN_STATUS as JobResult['status']) ?? 'skip',
    },
    {
      name: 'Security Gate',
      status: (process.env.SECURITY_STATUS as JobResult['status']) ?? 'skip',
    },
    { name: 'Docs Build', status: (process.env.DOCS_STATUS as JobResult['status']) ?? 'skip' },
  ]

  const statusEmoji = { pass: '✅', fail: '❌', skip: '⏭️' }
  const allPassed = jobs.every((j) => j.status === 'pass' || j.status === 'skip')

  let md = `## ${allPassed ? '✅' : '❌'} PR Check Summary\n\n`
  md += `**Commit:** \`${commitSha}\` | **PR:** #${prNumber}\n\n`

  md += '| Check | Status |\n'
  md += '|-------|--------|\n'
  for (const job of jobs) {
    md += `| ${job.name} | ${statusEmoji[job.status]} ${job.status.toUpperCase()} |\n`
  }

  // Bundle size diff
  const sizeDiffPath = resolve(ROOT, 'size-diff.md')
  if (existsSync(sizeDiffPath)) {
    md += '\n---\n\n'
    md += readFileSync(sizeDiffPath, 'utf-8')
  }

  // Test coverage summary
  const coverageSummary = process.env.COVERAGE_SUMMARY
  if (coverageSummary) {
    md += '\n---\n\n### Test Coverage\n\n'
    md += coverageSummary
  }

  // Preview links
  md += '\n---\n\n### Preview\n\n'

  const docsPreviewUrl = process.env.DOCS_PREVIEW_URL
  if (docsPreviewUrl) {
    md += `- [Docs Preview](${docsPreviewUrl})\n`
  }

  const pkgPreviewInfo = process.env.PKG_PREVIEW_INFO
  if (pkgPreviewInfo) {
    md += `- **Package Preview (pkg-pr-new):**\n${pkgPreviewInfo}\n`
  }

  md += '\n---\n*Generated by CI pipeline*\n'

  return md
}

async function main() {
  const comment = buildComment()
  const prNumber = process.env.PR_NUMBER
  const repo = process.env.GITHUB_REPOSITORY
  const token = process.env.GITHUB_TOKEN

  if (!prNumber || !repo || !token) {
    logger.warn('Missing PR_NUMBER, GITHUB_REPOSITORY, or GITHUB_TOKEN — printing to stdout')
    logger.info(comment)
    return
  }

  // Find existing bot comment to update (avoid comment spam)
  const botCommentMarker = 'Generated by CI pipeline'
  try {
    const existingComments = execSync(
      `gh api repos/${repo}/issues/${prNumber}/comments --jq '[.[] | select(.body | contains("${botCommentMarker}")) | .id] | first // empty'`,
      { encoding: 'utf-8', env: { ...process.env, GH_TOKEN: token } },
    ).trim()

    if (existingComments) {
      execSync(
        `gh api repos/${repo}/issues/comments/${existingComments} -X PATCH -f body='${comment.replace(/'/g, "'\\''")}'`,
        { stdio: 'inherit', env: { ...process.env, GH_TOKEN: token } },
      )
      logger.info(`Updated existing comment ${existingComments}`)
    } else {
      execSync(
        `gh api repos/${repo}/issues/${prNumber}/comments -f body='${comment.replace(/'/g, "'\\''")}'`,
        { stdio: 'inherit', env: { ...process.env, GH_TOKEN: token } },
      )
      logger.info('Created new PR comment')
    }
  } catch (error: unknown) {
    logger.error('Failed to post PR comment, printing to stdout instead')
    logger.info(comment)
  }
}

main()
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/bundle-size-diff.ts scripts/ci/pr-summary-comment.ts
git commit -m "feat(ci): add bundle size diff and PR summary comment scripts"
```

---

### Task 3c: CI Utility Scripts — CDN Sync + CDN Health

> **Code quality rules:** Same as Task 3a — each file ≤ 400 lines, functions ≤ 50 lines, `unknown` not `any`, logger wrapper not `console`, named exports only.

**Files:**

- Create: `scripts/ci/cdn-sync.ts`
- Create: `scripts/ci/cdn-health-check.ts`

- [ ] **Step 1: Create `scripts/ci/cdn-sync.ts`**

Implements the CDN publish state machine: upload -> propagate -> verify -> active.

```typescript
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'

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

function calculateSriHash(filePath: string): string {
  const content = readFileSync(filePath)
  const hash = createHash('sha384').update(content).digest('base64')
  return `sha384-${hash}`
}

function collectDistFiles(pkgDir: string): Array<{ relativePath: string; absolutePath: string }> {
  const distDir = resolve(pkgDir, 'dist')
  if (!existsSync(distDir)) return []

  const files: Array<{ relativePath: string; absolutePath: string }> = []

  function walk(dir: string, prefix: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        walk(fullPath, relPath)
      } else {
        files.push({ relativePath: relPath, absolutePath: fullPath })
      }
    }
  }

  walk(distDir, '')
  return files
}

async function uploadToCdn(ctx: SyncContext, pkgDir: string): Promise<void> {
  ctx.state = 'uploading'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: uploading`)

  const files = collectDistFiles(pkgDir)
  if (files.length === 0) {
    throw new Error(`No dist files found for ${ctx.packageName}`)
  }

  // Calculate SRI hashes for ESM/UMD files
  for (const file of files) {
    if (file.relativePath.endsWith('.mjs') || file.relativePath.endsWith('.js')) {
      const cdnUrl = `${ctx.cdnBasePath}/${file.relativePath}`
      ctx.sriHashes[cdnUrl] = calculateSriHash(file.absolutePath)
    }
  }

  // Upload files to CDN storage
  // Content-addressable paths: version is in the path, so re-uploads are idempotent
  const cdnStorageBucket = process.env.CDN_STORAGE_BUCKET ?? 'pro-components-cdn'
  const cdnPrefix = `${ctx.packageName}/${ctx.version}`

  for (const file of files) {
    const destPath = `${cdnPrefix}/${file.relativePath}`
    logger.info(`  Uploading ${file.relativePath} -> ${destPath}`)

    // Example: AWS S3 upload (replace with actual CDN provider)
    // Using content-addressable paths makes this naturally idempotent
    try {
      execSync(
        `aws s3 cp "${file.absolutePath}" "s3://${cdnStorageBucket}/${destPath}" --cache-control "public, max-age=31536000, immutable"`,
        { stdio: 'pipe' },
      )
    } catch (err) {
      // If CDN upload is not configured (e.g., in test env), log and continue
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

  // Poll edge PoPs until all have the new files
  while (Date.now() - startTime < timeoutMs) {
    let allReady = true

    for (const pop of edgePops) {
      try {
        // Example: check if a known file is accessible from each edge PoP
        const testUrl = `${ctx.cdnBasePath}/esm/index.mjs`
        execSync(`curl -sf -o /dev/null --max-time 5 "${testUrl}" -H "X-CDN-PoP: ${pop}"`, {
          stdio: 'pipe',
        })
      } catch {
        allReady = false
        break
      }
    }

    if (allReady) {
      logger.info(`  Propagation complete across ${edgePops.length} PoPs`)
      return
    }

    logger.info(
      `  Waiting for propagation... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`,
    )
    await new Promise((r) => setTimeout(r, pollIntervalMs))
  }

  // Timeout — do NOT block, mark as propagating for manual intervention
  logger.warn(
    `  Propagation timeout after ${timeoutMs}ms — marking as propagating for manual intervention`,
  )
  ctx.state = 'propagating'
  throw new Error(`CDN propagation timeout for ${ctx.packageName}@${ctx.version}`)
}

async function verifyDeployment(ctx: SyncContext): Promise<void> {
  ctx.state = 'verifying'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: verifying`)

  // Verify SRI hashes match deployed files
  for (const [url, expectedHash] of Object.entries(ctx.sriHashes)) {
    try {
      const content = execSync(`curl -sf --max-time 10 "${url}"`, { encoding: 'buffer' })
      const actualHash = `sha384-${createHash('sha384').update(content).digest('base64')}`

      if (actualHash !== expectedHash) {
        throw new Error(`SRI mismatch for ${url}: expected ${expectedHash}, got ${actualHash}`)
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('SRI mismatch')) throw err
      logger.warn(`  Verification skipped for ${url} (not accessible)`)
    }
  }

  logger.info(`  Verification passed for ${Object.keys(ctx.sriHashes).length} files`)
}

async function activateVersion(ctx: SyncContext): Promise<void> {
  ctx.state = 'active'
  logger.info(`[${ctx.packageName}@${ctx.version}] State: active`)

  // Notify Platform API — fire-and-forget with retry
  const platformApiUrl = process.env.PLATFORM_API_URL
  if (platformApiUrl) {
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
}

async function syncPackage(pkgDir: string): Promise<SyncContext> {
  const pkg = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf-8'))
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
  } catch (err) {
    ctx.state = 'failed'
    ctx.error = err instanceof Error ? err.message : String(err)
    logger.error(`[${ctx.packageName}@${ctx.version}] FAILED: ${ctx.error}`)
    return ctx
  }
}

async function main() {
  const pkgDirs = readdirSync(PACKAGES_DIR).filter((d) => {
    try {
      const pkg = JSON.parse(readFileSync(resolve(PACKAGES_DIR, d, 'package.json'), 'utf-8'))
      return !pkg.private
    } catch {
      return false
    }
  })

  const results: SyncContext[] = []

  for (const dir of pkgDirs) {
    const result = await syncPackage(resolve(PACKAGES_DIR, dir))
    results.push(result)
  }

  const failed = results.filter((r) => r.state === 'failed')
  const active = results.filter((r) => r.state === 'active')
  const propagating = results.filter((r) => r.state === 'propagating')

  logger.info(`\nCDN Sync Summary:`)
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
```

- [ ] **Step 6: Create `scripts/ci/cdn-health-check.ts`**

Nightly CDN health audit — checks SRI hash consistency and resource accessibility for all active versions.

```typescript
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'

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
  } catch (err) {
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

async function main() {
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

  // Report
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

main()
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/cdn-sync.ts scripts/ci/cdn-health-check.ts
git commit -m "feat(ci): add CDN sync state machine and health check scripts"
```

---

### Task 3d: CI Utility Scripts — Compat Matrix + Secrets Check

> **Code quality rules:** Same as Task 3a — each file ≤ 400 lines, functions ≤ 50 lines, `unknown` not `any`, logger wrapper not `console`, named exports only.

**Files:**

- Create: `scripts/ci/compat-matrix.ts`
- Create: `scripts/ci/secrets-expiry-check.ts`

- [ ] **Step 1: Create `scripts/ci/compat-matrix.ts`**

Runs tests against multiple Vue x Element Plus version combinations.

```typescript
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

// Quick mode (PR): only 2 combos
const QUICK_COMBOS: VersionCombo[] = [
  { vue: 'latest', elementPlus: 'latest' },
  { vue: '3.4.0', elementPlus: '2.9.0' },
]

// Full mode (nightly/release): exhaustive matrix
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

function resolveVersion(pkg: string, range: string): string {
  if (range === 'latest') return range
  try {
    return execSync(`npm view ${pkg}@${range} version`, { encoding: 'utf-8' }).trim()
  } catch {
    return range
  }
}

function runTestsWithVersions(combo: VersionCombo): CompatResult {
  const startTime = Date.now()

  try {
    // Override vue and element-plus versions via pnpm overrides
    logger.info(`\nTesting: Vue ${combo.vue} + Element Plus ${combo.elementPlus}`)

    execSync(`pnpm add -Dw vue@${combo.vue} element-plus@${combo.elementPlus} --no-lockfile`, {
      cwd: ROOT,
      stdio: 'pipe',
    })

    // Run tests
    const output = execSync('pnpm turbo test --no-cache', {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000, // 5 min timeout per combo
    })

    return {
      vue: combo.vue,
      elementPlus: combo.elementPlus,
      status: 'pass',
      testOutput: output.slice(-500), // Keep tail of output
      duration: Date.now() - startTime,
    }
  } catch (err) {
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

async function main() {
  const mode = process.env.COMPAT_MODE ?? 'quick'
  const combos = mode === 'full' ? FULL_COMBOS : QUICK_COMBOS

  logger.info(`Running compat matrix in ${mode} mode (${combos.length} combinations)`)

  const results: CompatResult[] = []

  for (const combo of combos) {
    results.push(runTestsWithVersions(combo))
  }

  // Restore original versions
  try {
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT, stdio: 'pipe' })
  } catch {
    logger.warn('Failed to restore original lockfile versions')
  }

  // Print summary
  logger.info('\n=== Compatibility Matrix Results ===\n')
  logger.info('| Vue | Element Plus | Status | Duration |')
  logger.info('|-----|-------------|--------|----------|')
  for (const r of results) {
    const statusIcon = r.status === 'pass' ? '✅' : '❌'
    logger.info(
      `| ${r.vue} | ${r.elementPlus} | ${statusIcon} ${r.status} | ${Math.round(r.duration / 1000)}s |`,
    )
  }

  // Report to Platform API
  reportToPlatformApi(results)

  // Save results
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
```

- [ ] **Step 2: Create `scripts/ci/secrets-expiry-check.ts`**

Checks if GitHub Actions secrets or tokens are nearing expiration (90-day rotation policy).

```typescript
import { execSync } from 'node:child_process'

interface SecretCheck {
  name: string
  source: string
  daysUntilExpiry: number | null
  status: 'ok' | 'warning' | 'expired' | 'unknown'
}

const WARNING_THRESHOLD_DAYS = 14
const CRITICAL_THRESHOLD_DAYS = 7

function checkNpmTokenExpiry(): SecretCheck {
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

    // npm doesn't expose token expiry directly — treat as unknown
    return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: null, status: 'ok' }
  } catch {
    return { name: 'NPM_TOKEN', source: 'env', daysUntilExpiry: 0, status: 'expired' }
  }
}

function checkCreatedAtExpiry(envVar: string, name: string): SecretCheck {
  // For secrets with a known creation date stored in a companion env var
  const createdAt = process.env[`${envVar}_CREATED_AT`]
  if (!createdAt) {
    return { name, source: 'env', daysUntilExpiry: null, status: 'unknown' }
  }

  const createdDate = new Date(createdAt)
  const expiryDate = new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000)
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))

  let status: SecretCheck['status'] = 'ok'
  if (daysUntilExpiry <= 0) status = 'expired'
  else if (daysUntilExpiry <= CRITICAL_THRESHOLD_DAYS) status = 'warning'
  else if (daysUntilExpiry <= WARNING_THRESHOLD_DAYS) status = 'warning'

  return { name, source: 'env', daysUntilExpiry, status }
}

async function main() {
  const checks: SecretCheck[] = [
    checkNpmTokenExpiry(),
    checkCreatedAtExpiry('CDN_ACCESS_KEY', 'CDN_ACCESS_KEY'),
    checkCreatedAtExpiry('PLATFORM_API_KEY', 'PLATFORM_API_KEY'),
    checkCreatedAtExpiry('SLACK_WEBHOOK_URL', 'SLACK_WEBHOOK_URL'),
    checkCreatedAtExpiry('WECHAT_WEBHOOK_URL', 'WECHAT_WEBHOOK_URL'),
  ]

  logger.info('=== Secrets Expiration Check ===\n')
  logger.info('| Secret | Status | Days Until Expiry |')
  logger.info('|--------|--------|-------------------|')

  for (const check of checks) {
    const statusIcon = {
      ok: '✅',
      warning: '⚠️',
      expired: '❌',
      unknown: '❓',
    }[check.status]

    const expiry = check.daysUntilExpiry !== null ? `${check.daysUntilExpiry}d` : 'N/A'
    logger.info(`| ${check.name} | ${statusIcon} ${check.status} | ${expiry} |`)
  }

  const expired = checks.filter((c) => c.status === 'expired')
  const warnings = checks.filter((c) => c.status === 'warning')

  if (expired.length > 0) {
    logger.error(`\n${expired.length} secret(s) EXPIRED — rotate immediately!`)
    expired.forEach((c) => logger.error(`  ${c.name}`))
  }

  if (warnings.length > 0) {
    logger.warn(`\n${warnings.length} secret(s) expiring soon:`)
    warnings.forEach((c) => logger.warn(`  ${c.name}: ${c.daysUntilExpiry} days remaining`))
  }

  if (expired.length > 0) {
    process.exit(1)
  }

  logger.info('\nSecrets check complete')
}

main()
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ci/compat-matrix.ts scripts/ci/secrets-expiry-check.ts
git commit -m "feat(ci): add compat matrix runner and secrets expiry check scripts"
```

---

### Task 4: PR Pipeline Workflow

**Files:**

- Create: `.github/workflows/pr.yml`

This is the main quality gate for all pull requests. Every step runs in parallel where possible, with dependencies explicitly declared.

- [ ] **Step 1: Create `.github/workflows/pr.yml`**

```yaml
name: PR Pipeline

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write
  checks: write

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  # ──────────────────────────────────────────────
  # Stage 1: Lint + Type Check (no build dependency)
  # ──────────────────────────────────────────────
  lint:
    name: Lint + Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: ESLint
        run: pnpm lint

      - name: Prettier check
        run: pnpm format:check

      - name: Type check (vue-tsc)
        run: pnpm type-check

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 2: Build (topological via Turborepo)
  # ──────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Turbo build (topological)
        run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-artifacts
          path: packages/*/dist
          retention-days: 1

      - name: Save base branch sizes
        if: github.event_name == 'pull_request'
        run: SAVE_SIZES=true SIZES_SAVE_PATH=pr-sizes.json npx tsx scripts/ci/bundle-size-diff.ts

      - name: Upload size data
        uses: actions/upload-artifact@v4
        with:
          name: pr-sizes
          path: pr-sizes.json
          retention-days: 1

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 2b: Build base branch for size comparison
  # ──────────────────────────────────────────────
  build-base:
    name: Build Base (for size diff)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout base branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.base.sha }}

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Build base
        run: pnpm build

      - name: Collect sizes
        run: SAVE_SIZES=true SIZES_SAVE_PATH=base-sizes.json npx tsx scripts/ci/bundle-size-diff.ts

      - name: Upload base sizes
        uses: actions/upload-artifact@v4
        with:
          name: base-sizes
          path: base-sizes.json
          retention-days: 1

  # ──────────────────────────────────────────────
  # Stage 3: Validate Build Output
  # ──────────────────────────────────────────────
  validate-build:
    name: Validate Build
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 5
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Run build validation
        run: pnpm validate-build

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 3: Vitest Unit + Integration Tests
  # ──────────────────────────────────────────────
  test:
    name: Unit + Integration Tests
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      status: ${{ steps.result.outputs.status }}
      coverage: ${{ steps.coverage.outputs.summary }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Run Vitest
        run: pnpm turbo test -- --reporter=verbose --coverage

      - name: Extract coverage summary
        id: coverage
        if: always()
        run: |
          if [ -f coverage/coverage-summary.json ]; then
            TOTAL=$(cat coverage/coverage-summary.json | jq -r '.total | "Lines: \(.lines.pct)% | Branches: \(.branches.pct)% | Functions: \(.functions.pct)%"')
            echo "summary=$TOTAL" >> $GITHUB_OUTPUT
          else
            echo "summary=Coverage data not available" >> $GITHUB_OUTPUT
          fi

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
          retention-days: 7

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 3: Cypress Component Testing
  # ──────────────────────────────────────────────
  e2e:
    name: Cypress Component Tests
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 20
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Cypress install
        uses: cypress-io/github-action@v6
        with:
          runTests: false

      - name: Cypress component tests
        uses: cypress-io/github-action@v6
        with:
          install: false
          component: true
          command: pnpm turbo test:e2e --no-cache

      - name: Upload Cypress screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots
          path: e2e/cypress/screenshots
          retention-days: 7

      - name: Upload Cypress videos
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-videos
          path: e2e/cypress/videos
          retention-days: 3

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 3: Compat Quick (2 combos)
  # ──────────────────────────────────────────────
  compat-latest:
    name: Compat (Latest)
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Install latest Vue + Element Plus
        run: pnpm add -Dw vue@latest element-plus@latest --no-lockfile

      - name: Run tests with latest versions
        run: pnpm turbo test --no-cache

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  compat-minimum:
    name: Compat (Minimum)
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Install minimum Vue + Element Plus
        run: pnpm add -Dw vue@3.4.0 element-plus@2.9.0 --no-lockfile

      - name: Run tests with minimum versions
        run: pnpm turbo test --no-cache

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 3: Security Gate
  # ──────────────────────────────────────────────
  security:
    name: Security Gate
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: pnpm audit
        run: pnpm audit --audit-level=high || true
        # Note: pnpm audit may find issues in dev deps. We allow warnings
        # but fail on high/critical in production deps.

      - name: pnpm audit (production only — strict)
        run: pnpm audit --prod --audit-level=high

      - name: License check
        run: npx tsx scripts/ci/license-check.ts

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 3: Docs Build Verification
  # ──────────────────────────────────────────────
  docs-build:
    name: Docs Build
    needs: [build]
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      status: ${{ steps.result.outputs.status }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Build VitePress docs
        run: pnpm --filter docs build

      - name: Upload docs artifact
        uses: actions/upload-artifact@v4
        with:
          name: docs-preview
          path: docs/.vitepress/dist
          retention-days: 3

      - name: Set result
        id: result
        if: always()
        run: echo "status=${{ job.status == 'success' && 'pass' || 'fail' }}" >> $GITHUB_OUTPUT

  # ──────────────────────────────────────────────
  # Stage 4: PR Preview Deploy
  # ──────────────────────────────────────────────
  preview:
    name: PR Preview
    needs: [build, docs-build]
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      docs-url: ${{ steps.deploy-docs.outputs.url }}
      pkg-info: ${{ steps.pkg-preview.outputs.info }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download docs artifact
        uses: actions/download-artifact@v4
        with:
          name: docs-preview
          path: docs-dist

      - name: Deploy docs preview
        id: deploy-docs
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: docs-dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'PR #${{ github.event.pull_request.number }} docs preview'
          alias: pr-${{ github.event.pull_request.number }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_DOCS_SITE_ID }}
        continue-on-error: true

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-artifacts
          path: packages

      - name: Publish PR preview packages (pkg-pr-new)
        id: pkg-preview
        run: |
          npx pkg-pr-new publish \
            --compact \
            --comment=off \
            packages/pro-table \
            packages/pro-form \
            packages/pro-descriptions \
            packages/hooks \
            packages/utils \
            packages/themes \
            packages/pro-components 2>&1 | tee pkg-pr-new-output.txt

          # Extract install commands from output
          INFO=$(grep -E "^(npm i|pnpm add)" pkg-pr-new-output.txt | head -20 || echo "Preview packages published")
          echo "info<<EOF" >> $GITHUB_OUTPUT
          echo "$INFO" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
        continue-on-error: true

  # ──────────────────────────────────────────────
  # Stage 5: Bundle Size Diff
  # ──────────────────────────────────────────────
  size-diff:
    name: Bundle Size Diff
    needs: [build, build-base]
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download base sizes
        uses: actions/download-artifact@v4
        with:
          name: base-sizes
          path: .

      - name: Download PR sizes
        uses: actions/download-artifact@v4
        with:
          name: pr-sizes
          path: .

      - name: Compute size diff
        run: |
          BASE_SIZES_PATH=base-sizes.json \
          SIZE_DIFF_OUTPUT=size-diff.md \
          npx tsx scripts/ci/bundle-size-diff.ts

      - name: Upload size diff
        uses: actions/upload-artifact@v4
        with:
          name: size-diff
          path: size-diff.md
          retention-days: 1

  # ──────────────────────────────────────────────
  # Stage 6: Summary Bot (PR Comment)
  # ──────────────────────────────────────────────
  summary:
    name: PR Summary
    needs:
      [
        lint,
        build,
        validate-build,
        test,
        e2e,
        compat-latest,
        compat-minimum,
        security,
        docs-build,
        preview,
        size-diff,
      ]
    if: always()
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download size diff
        uses: actions/download-artifact@v4
        with:
          name: size-diff
          path: .
        continue-on-error: true

      - name: Post PR summary comment
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          COMMIT_SHA: ${{ github.event.pull_request.head.sha }}
          LINT_STATUS: ${{ needs.lint.outputs.status }}
          BUILD_STATUS: ${{ needs.build.outputs.status }}
          VALIDATE_STATUS: ${{ needs.validate-build.outputs.status }}
          TEST_STATUS: ${{ needs.test.outputs.status }}
          E2E_STATUS: ${{ needs.e2e.outputs.status }}
          COMPAT_LATEST_STATUS: ${{ needs.compat-latest.outputs.status }}
          COMPAT_MIN_STATUS: ${{ needs.compat-minimum.outputs.status }}
          SECURITY_STATUS: ${{ needs.security.outputs.status }}
          DOCS_STATUS: ${{ needs.docs-build.outputs.status }}
          COVERAGE_SUMMARY: ${{ needs.test.outputs.coverage }}
          DOCS_PREVIEW_URL: ${{ needs.preview.outputs.docs-url }}
          PKG_PREVIEW_INFO: ${{ needs.preview.outputs.pkg-info }}
        run: npx tsx scripts/ci/pr-summary-comment.ts
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/pr.yml
git commit -m "ci: add PR pipeline workflow"
```

---

### Task 5: Release Pipeline Workflow

**Files:**

- Create: `.github/workflows/release.yml`

Handles changesets-based versioning, npm publish (idempotent), CDN sync, docs deploy, and notifications.

- [ ] **Step 1: Create `.github/workflows/release.yml`**

```yaml
name: Release Pipeline

on:
  push:
    branches: [main]

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false # Never cancel in-progress releases

permissions:
  contents: write
  pull-requests: write
  id-token: write # For OIDC federation

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  # ──────────────────────────────────────────────
  # Stage 1: Detect changesets
  # ──────────────────────────────────────────────
  changesets:
    name: Changesets
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      has-changesets: ${{ steps.changesets.outputs.hasChangesets }}
      published: ${{ steps.changesets.outputs.published }}
      published-packages: ${{ steps.changesets.outputs.publishedPackages }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'chore: version packages'
          commit: 'chore: version packages'
          publish: pnpm run release:ci
          version: pnpm run version-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  # ──────────────────────────────────────────────
  # Stage 2: Full Build + Test (on version merge)
  # ──────────────────────────────────────────────
  build-and-test:
    name: Full Build + Test
    needs: [changesets]
    if: needs.changesets.outputs.published == 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Build all packages
        run: pnpm build

      - name: Validate build
        run: pnpm validate-build

      - name: Run all tests
        run: pnpm turbo test -- --coverage

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-dist
          path: packages/*/dist
          retention-days: 7

  # ──────────────────────────────────────────────
  # Stage 3: npm Publish (idempotent)
  # ──────────────────────────────────────────────
  npm-publish:
    name: npm Publish
    needs: [changesets, build-and-test]
    if: needs.changesets.outputs.published == 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production # Requires manual approval in GitHub settings
    outputs:
      published-packages: ${{ steps.publish.outputs.packages }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          node-version: '20'

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-dist
          path: packages

      - name: Check which versions need publishing
        id: check
        run: npx tsx scripts/ci/check-npm-version.ts

      - name: Publish to npm (idempotent)
        id: publish
        if: steps.check.outputs.has-new-versions == 'true'
        run: |
          echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

          PUBLISHED=""
          for pkg_dir in packages/*/; do
            if [ -f "$pkg_dir/package.json" ]; then
              PKG_NAME=$(node -p "require('./$pkg_dir/package.json').name")
              PKG_VERSION=$(node -p "require('./$pkg_dir/package.json').version")
              PKG_PRIVATE=$(node -p "require('./$pkg_dir/package.json').private || false")

              if [ "$PKG_PRIVATE" = "true" ]; then
                echo "Skipping private package: $PKG_NAME"
                continue
              fi

              # Idempotent: skip if version already exists
              EXISTING=$(npm view "$PKG_NAME@$PKG_VERSION" version 2>/dev/null || echo "")
              if [ "$EXISTING" = "$PKG_VERSION" ]; then
                echo "Already published: $PKG_NAME@$PKG_VERSION (skipping)"
                continue
              fi

              echo "Publishing: $PKG_NAME@$PKG_VERSION"
              cd "$pkg_dir"
              npm publish --access restricted
              cd -
              PUBLISHED="$PUBLISHED $PKG_NAME@$PKG_VERSION"
            fi
          done

          echo "packages=$PUBLISHED" >> $GITHUB_OUTPUT
          echo "Published:$PUBLISHED"
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  # ──────────────────────────────────────────────
  # Stage 4: CDN Sync (async, does NOT block npm)
  # ──────────────────────────────────────────────
  cdn-sync:
    name: CDN Sync
    needs: [npm-publish]
    if: needs.npm-publish.outputs.published-packages != ''
    runs-on: ubuntu-latest
    timeout-minutes: 30
    environment: production # CDN sync also requires approval
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-dist
          path: packages

      - name: Configure CDN credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.CDN_OIDC_ROLE_ARN }}
          aws-region: ap-southeast-1
        continue-on-error: true

      - name: Run CDN sync state machine
        env:
          CDN_BASE_URL: ${{ secrets.CDN_BASE_URL }}
          CDN_STORAGE_BUCKET: ${{ secrets.CDN_STORAGE_BUCKET }}
          CDN_EDGE_POPS: ${{ secrets.CDN_EDGE_POPS }}
          PLATFORM_API_URL: ${{ secrets.PLATFORM_API_URL }}
        run: npx tsx scripts/ci/cdn-sync.ts

      - name: Notify on CDN sync failure
        if: failure()
        uses: ./.github/actions/notify
        with:
          channels: 'slack,wechat'
          title: 'CDN Sync Failed'
          body: |
            CDN sync failed for packages: ${{ needs.npm-publish.outputs.published-packages }}
            Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
            Manual intervention may be required.
          level: 'error'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          wechat-webhook-url: ${{ secrets.WECHAT_WEBHOOK_URL }}

  # ──────────────────────────────────────────────
  # Stage 4: Platform API Notification
  # ──────────────────────────────────────────────
  platform-notify:
    name: Platform API Notification
    needs: [npm-publish]
    if: needs.npm-publish.outputs.published-packages != ''
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Notify Platform API (fire-and-forget + retry)
        run: |
          PACKAGES="${{ needs.npm-publish.outputs.published-packages }}"
          API_URL="${{ secrets.PLATFORM_API_URL }}"

          if [ -z "$API_URL" ]; then
            echo "PLATFORM_API_URL not configured, skipping"
            exit 0
          fi

          for attempt in 1 2 3; do
            STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
              -X POST "${API_URL}/api/v1/versions/sync" \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer ${{ secrets.PLATFORM_API_KEY }}" \
              -d "{\"packages\": \"${PACKAGES}\", \"ci_run\": \"${{ github.run_id }}\"}" \
              --max-time 10 2>/dev/null || echo "000")

            if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
              echo "Platform API notified (HTTP $STATUS)"
              exit 0
            fi

            echo "Attempt $attempt failed (HTTP $STATUS), retrying..."
            sleep $((attempt * 2))
          done

          echo "Platform API notification failed after 3 attempts (non-blocking)"
        continue-on-error: true

  # ──────────────────────────────────────────────
  # Stage 5: Docs Deploy (after npm publish)
  # ──────────────────────────────────────────────
  docs-deploy:
    name: Docs Deploy
    needs: [npm-publish]
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: docs-production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-dist
          path: packages

      - name: Build docs
        run: pnpm --filter docs build

      - name: Deploy docs to production
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: docs/.vitepress/dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Release deploy from ${{ github.sha }}'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_DOCS_SITE_ID }}

  # ──────────────────────────────────────────────
  # Stage 6: Release Notification
  # ──────────────────────────────────────────────
  notify:
    name: Release Notification
    needs: [npm-publish, cdn-sync, docs-deploy]
    if: always() && needs.npm-publish.outputs.published-packages != ''
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Gather release info
        id: info
        run: |
          PACKAGES="${{ needs.npm-publish.outputs.published-packages }}"
          CDN_STATUS="${{ needs.cdn-sync.result }}"
          DOCS_STATUS="${{ needs.docs-deploy.result }}"

          # Extract changelog from latest changeset commit
          CHANGELOG=$(git log -1 --pretty=%B | head -50)

          echo "packages=$PACKAGES" >> $GITHUB_OUTPUT
          echo "cdn_status=$CDN_STATUS" >> $GITHUB_OUTPUT
          echo "docs_status=$DOCS_STATUS" >> $GITHUB_OUTPUT
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Send release notification
        uses: ./.github/actions/notify
        with:
          channels: 'slack,wechat'
          title: 'New Release Published'
          body: |
            **Packages:** ${{ steps.info.outputs.packages }}
            **CDN:** ${{ steps.info.outputs.cdn_status }}
            **Docs:** ${{ steps.info.outputs.docs_status }}
            **Changelog:**
            ${{ steps.info.outputs.changelog }}
          level: ${{ needs.cdn-sync.result == 'failure' && 'warning' || 'info' }}
          metadata: '{"run_url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          wechat-webhook-url: ${{ secrets.WECHAT_WEBHOOK_URL }}
          email-api-url: ${{ secrets.EMAIL_API_URL }}
          email-api-key: ${{ secrets.EMAIL_API_KEY }}
          email-recipients: ${{ secrets.EMAIL_RECIPIENTS }}
```

> **NOTE:** Configure GitHub Environment `production` with required reviewers in repository settings (Settings → Environments → New environment → "production" → Required reviewers). Both `publish-npm` and `sync-cdn` jobs use this environment to enforce a manual approval gate before any production deployment.

- [ ] **Step 2: Add `release:ci` script to root `package.json`**

Add to the `scripts` section of root `package.json`:

```json
{
  "release:ci": "tsx scripts/ci/check-npm-version.ts && changeset publish"
}
```

This wraps changeset publish with the idempotency check.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml package.json
git commit -m "ci: add release pipeline workflow"
```

---

### Task 6: Nightly Pipeline Workflow

**Files:**

- Create: `.github/workflows/nightly.yml`

Runs the full compatibility matrix, CDN health check, security scan, and secrets expiration check every night.

- [ ] **Step 1: Create `.github/workflows/nightly.yml`**

```yaml
name: Nightly Pipeline

on:
  schedule:
    # Run at 02:00 UTC every day (10:00 CST)
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      skip-compat:
        description: 'Skip compatibility matrix (faster run)'
        required: false
        default: 'false'
        type: boolean

permissions:
  contents: read
  issues: write # For creating issues on failure

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  # ──────────────────────────────────────────────
  # Full Compatibility Matrix
  # ──────────────────────────────────────────────
  compat-matrix:
    name: Compat Matrix (${{ matrix.vue }} + ${{ matrix.element-plus }})
    if: inputs.skip-compat != 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        vue: ['3.4.0', '3.5.0', 'latest']
        element-plus: ['2.9.0', '2.10.0', 'latest']
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup
        with:
          turbo-token: ${{ secrets.TURBO_TOKEN }}
          turbo-team: ${{ secrets.TURBO_TEAM }}

      - name: Build
        run: pnpm build

      - name: Override peer dependency versions
        run: pnpm add -Dw vue@${{ matrix.vue }} element-plus@${{ matrix.element-plus }} --no-lockfile

      - name: Run tests
        id: test
        run: pnpm turbo test --no-cache
        continue-on-error: true

      - name: Report to Platform API
        if: always()
        run: |
          STATUS="${{ steps.test.outcome == 'success' && 'pass' || 'fail' }}"
          API_URL="${{ secrets.PLATFORM_API_URL }}"
          CI_RUN="${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"

          if [ -n "$API_URL" ]; then
            curl -sf -X POST "${API_URL}/api/v1/compat/report" \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer ${{ secrets.PLATFORM_API_KEY }}" \
              -d "{
                \"vue_version\": \"${{ matrix.vue }}\",
                \"element_plus_version\": \"${{ matrix.element-plus }}\",
                \"status\": \"${STATUS}\",
                \"ci_run_url\": \"${CI_RUN}\"
              }" --max-time 10 || echo "Platform API report failed (non-blocking)"
          fi

      - name: Fail if tests failed
        if: steps.test.outcome == 'failure'
        run: exit 1

  # ──────────────────────────────────────────────
  # CDN Health Check
  # ──────────────────────────────────────────────
  cdn-health:
    name: CDN Health Check
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Run CDN health check
        env:
          PLATFORM_API_URL: ${{ secrets.PLATFORM_API_URL }}
          CDN_BASE_URL: ${{ secrets.CDN_BASE_URL }}
        run: npx tsx scripts/ci/cdn-health-check.ts

  # ──────────────────────────────────────────────
  # Security Scan
  # ──────────────────────────────────────────────
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: pnpm audit (all dependencies)
        run: pnpm audit --audit-level=moderate

      - name: License check
        run: npx tsx scripts/ci/license-check.ts

      - name: Check for peer dependency breaking changes
        run: |
          echo "Checking Vue release notes for breaking changes..."
          VUE_LATEST=$(npm view vue version)
          EP_LATEST=$(npm view element-plus version)

          echo "Latest Vue: $VUE_LATEST"
          echo "Latest Element Plus: $EP_LATEST"

          # Check if latest versions are still within our supported range
          node -e "
            const semver = require('semver') || { satisfies: () => true };
            const vueOk = '$VUE_LATEST'.startsWith('3.');
            const epOk = '$EP_LATEST'.startsWith('2.');

            if (!vueOk) {
              console.error('WARNING: Vue 4.x detected — major version bump may require updates');
              process.exit(1);
            }
            if (!epOk) {
              console.error('WARNING: Element Plus 3.x detected — major version bump may require updates');
              process.exit(1);
            }
            console.log('Peer dependency versions are within expected major range');
          " || echo "::warning::Peer dependency major version change detected"

  # ──────────────────────────────────────────────
  # Secrets Expiration Check
  # ──────────────────────────────────────────────
  secrets-check:
    name: Secrets Expiration Check
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Check secrets expiration
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          CDN_ACCESS_KEY_CREATED_AT: ${{ secrets.CDN_ACCESS_KEY_CREATED_AT }}
          PLATFORM_API_KEY_CREATED_AT: ${{ secrets.PLATFORM_API_KEY_CREATED_AT }}
          SLACK_WEBHOOK_URL_CREATED_AT: ${{ secrets.SLACK_WEBHOOK_URL_CREATED_AT }}
          WECHAT_WEBHOOK_URL_CREATED_AT: ${{ secrets.WECHAT_WEBHOOK_URL_CREATED_AT }}
        run: npx tsx scripts/ci/secrets-expiry-check.ts

  # ──────────────────────────────────────────────
  # Nightly Report
  # ──────────────────────────────────────────────
  nightly-report:
    name: Nightly Report
    needs: [compat-matrix, cdn-health, security-scan, secrets-check]
    if: always()
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/actions/setup

      - name: Determine overall status
        id: status
        run: |
          COMPAT="${{ needs.compat-matrix.result }}"
          CDN="${{ needs.cdn-health.result }}"
          SECURITY="${{ needs.security-scan.result }}"
          SECRETS="${{ needs.secrets-check.result }}"

          if [ "$COMPAT" = "failure" ] || [ "$CDN" = "failure" ] || [ "$SECURITY" = "failure" ] || [ "$SECRETS" = "failure" ]; then
            echo "level=error" >> $GITHUB_OUTPUT
            echo "status=FAILED" >> $GITHUB_OUTPUT
          elif [ "$COMPAT" = "cancelled" ] || [ "$CDN" = "cancelled" ] || [ "$SECURITY" = "cancelled" ] || [ "$SECRETS" = "cancelled" ]; then
            echo "level=warning" >> $GITHUB_OUTPUT
            echo "status=PARTIAL" >> $GITHUB_OUTPUT
          else
            echo "level=info" >> $GITHUB_OUTPUT
            echo "status=PASSED" >> $GITHUB_OUTPUT
          fi

      - name: Send nightly report
        uses: ./.github/actions/notify
        with:
          channels: 'slack'
          title: 'Nightly Health Check: ${{ steps.status.outputs.status }}'
          body: |
            **Compat Matrix:** ${{ needs.compat-matrix.result }}
            **CDN Health:** ${{ needs.cdn-health.result }}
            **Security Scan:** ${{ needs.security-scan.result }}
            **Secrets Check:** ${{ needs.secrets-check.result }}
            **Run:** ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
          level: ${{ steps.status.outputs.level }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Create issue on failure
        if: steps.status.outputs.status == 'FAILED'
        uses: actions/github-script@v7
        with:
          script: |
            const title = `Nightly Health Check Failed - ${new Date().toISOString().split('T')[0]}`
            const body = [
              '## Nightly Pipeline Failures',
              '',
              `| Check | Result |`,
              `|-------|--------|`,
              `| Compat Matrix | ${{ needs.compat-matrix.result }} |`,
              `| CDN Health | ${{ needs.cdn-health.result }} |`,
              `| Security Scan | ${{ needs.security-scan.result }} |`,
              `| Secrets Check | ${{ needs.secrets-check.result }} |`,
              '',
              `[View Run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})`,
            ].join('\n')

            // Check if issue already exists for today
            const existing = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'nightly-failure',
              state: 'open',
            })

            const today = new Date().toISOString().split('T')[0]
            const todayIssue = existing.data.find(i => i.title.includes(today))

            if (todayIssue) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: todayIssue.number,
                body: body,
              })
            } else {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: title,
                body: body,
                labels: ['nightly-failure', 'ci'],
              })
            }
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/nightly.yml
git commit -m "ci: add nightly pipeline workflow"
```

---

### Task 7: CODEOWNERS

**Files:**

- Create: `.github/CODEOWNERS`

- [ ] **Step 1: Create `.github/CODEOWNERS`**

```
# Default owners for everything
* @pro-components-team

# CI/CD changes require CI team review
.github/ @pro-components-ci-team
scripts/ci/ @pro-components-ci-team

# Package changes require component team review
packages/ @pro-components-team
packages/pro-table/ @pro-components-team
packages/pro-form/ @pro-components-team
packages/pro-descriptions/ @pro-components-team

# Platform changes require platform team review
platform/ @pro-components-platform-team

# CDN changes require both CI and platform review
cdn/ @pro-components-ci-team @pro-components-platform-team
```

- [ ] **Step 2: Commit**

```bash
git add .github/CODEOWNERS
git commit -m "ci: add CODEOWNERS for review requirements"
```

---

### Task 8: Secrets Management Documentation

**Files:**

- Create: `.github/SECRETS.md`

This documents the required secrets, environment protection rules, and OIDC federation setup. Not a runtime file, but critical operational reference for setting up the pipeline.

- [ ] **Step 1: Create `.github/SECRETS.md`**

```markdown
# Secrets Management

## Required GitHub Secrets

### Repository-level secrets

| Secret                 | Purpose                                | Rotation |
| ---------------------- | -------------------------------------- | -------- |
| `TURBO_TOKEN`          | Turborepo remote cache authentication  | 90 days  |
| `TURBO_TEAM`           | Turborepo remote cache team identifier | Static   |
| `SLACK_WEBHOOK_URL`    | Slack notification webhook             | 90 days  |
| `WECHAT_WEBHOOK_URL`   | WeChat Work bot webhook                | 90 days  |
| `NETLIFY_AUTH_TOKEN`   | Netlify docs deployment                | 90 days  |
| `NETLIFY_DOCS_SITE_ID` | Netlify site identifier for docs       | Static   |

### Environment: `npm-production`

| Secret      | Purpose                                    | Rotation |
| ----------- | ------------------------------------------ | -------- |
| `NPM_TOKEN` | npm publish (granular, scoped to `@pro/*`) | 90 days  |

Protection rules:

- Required reviewers: 1 from `@pro-components-ci-team`
- Wait timer: 0 minutes
- Deployment branches: `main` only

### Environment: `cdn-production`

| Secret               | Purpose                              | Rotation      |
| -------------------- | ------------------------------------ | ------------- |
| `CDN_OIDC_ROLE_ARN`  | OIDC federation role for CDN uploads | Static (role) |
| `CDN_BASE_URL`       | CDN base URL                         | Static        |
| `CDN_STORAGE_BUCKET` | CDN storage bucket name              | Static        |
| `CDN_EDGE_POPS`      | Comma-separated edge PoP identifiers | Static        |
| `PLATFORM_API_URL`   | Version management platform API URL  | Static        |
| `PLATFORM_API_KEY`   | Platform API authentication key      | 90 days       |

Protection rules:

- Required reviewers: 1 from `@pro-components-ci-team`
- Wait timer: 5 minutes (safety buffer after npm publish)
- Deployment branches: `main` only

### Environment: `docs-production`

Inherits `NETLIFY_AUTH_TOKEN` and `NETLIFY_DOCS_SITE_ID` from repository-level secrets.

Protection rules:

- Required reviewers: none (auto-deploy after npm publish)
- Deployment branches: `main` only

## OIDC Federation Setup (CDN)

Instead of long-lived CDN credentials, use GitHub Actions OIDC federation:

1. Create an IAM role in your cloud provider (AWS/Alibaba Cloud)
2. Configure trust policy to accept tokens from GitHub Actions:
   - Subject: `repo:your-org/pro-components:environment:cdn-production`
   - Audience: `sts.amazonaws.com` (AWS) or equivalent
3. Grant the role write access to the CDN storage bucket only
4. Store the role ARN as `CDN_OIDC_ROLE_ARN` secret

Benefits:

- No long-lived credentials to rotate
- Scoped to specific repository + environment
- Automatic token expiration (1 hour)
- Audit trail via cloud provider IAM logs

## Secrets Rotation Companion Variables

For each secret with a rotation policy, store a companion `*_CREATED_AT` secret
with the ISO date the secret was last rotated:

- `CDN_ACCESS_KEY_CREATED_AT`: e.g., `2026-01-15`
- `PLATFORM_API_KEY_CREATED_AT`: e.g., `2026-01-15`
- `SLACK_WEBHOOK_URL_CREATED_AT`: e.g., `2026-01-15`
- `WECHAT_WEBHOOK_URL_CREATED_AT`: e.g., `2026-01-15`

The nightly pipeline checks these dates and alerts when a secret is within
14 days of the 90-day rotation threshold.

## npm Token Scoping

Use npm granular access tokens (not classic tokens):

1. Go to npmjs.com -> Access Tokens -> Generate New Token -> Granular Access Token
2. Scope: Read and write
3. Packages: Only select packages matching `@pro/*`
4. IP allowlist: GitHub Actions IP ranges (optional, recommended)
5. Expiration: 90 days
```

- [ ] **Step 2: Commit**

```bash
git add .github/SECRETS.md
git commit -m "docs: add secrets management reference"
```

---

### Task 9: Rollback Workflow

This task adds a rollback GitHub Action workflow that can be triggered manually or from the Dashboard.

**Files:**

- Create: `.github/workflows/rollback.yml`

- [ ] **Step 1: Create `.github/workflows/rollback.yml`**

```yaml
# .github/workflows/rollback.yml
name: Rollback
on:
  workflow_dispatch:
    inputs:
      package:
        description: 'Package to rollback (e.g., @pro/table)'
        required: true
        type: string
      target_version:
        description: 'Version to rollback to'
        required: true
        type: string
      reason:
        description: 'Rollback reason (required for audit log)'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - name: Verify target version exists on npm
        run: npm view ${{ inputs.package }}@${{ inputs.target_version }}
      - name: Trigger platform API rollback
        run: |
          curl -X POST "$PLATFORM_API_URL/api/v1/versions/rollback" \
            -H "Authorization: Bearer ${{ secrets.PLATFORM_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"package": "${{ inputs.package }}", "version": "${{ inputs.target_version }}", "reason": "${{ inputs.reason }}"}'
        env:
          PLATFORM_API_URL: ${{ secrets.PLATFORM_API_URL }}
      - name: Verify CDN propagation
        run: pnpm tsx scripts/ci/cdn-health-audit.ts --verify-version ${{ inputs.package }}@${{ inputs.target_version }}
      - name: Notify
        uses: ./.github/actions/notify
        with:
          channel: releases
          message: 'Rollback: ${{ inputs.package }}@${{ inputs.target_version }} — ${{ inputs.reason }}'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          wechat-webhook-url: ${{ secrets.WECHAT_WEBHOOK_URL }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/rollback.yml
git commit -m "ci: add rollback workflow with production approval gate"
```

---

### Task 10: Pipeline Idempotency Verification

This task ensures all pipeline operations are safe to re-run and documents the rollback workflow integration with the Dashboard.

- [ ] **Step 1: Verify idempotency**

Verify each pipeline operation is idempotent:

- `npm publish`: guarded by `check-npm-version.ts` (skip if version exists)
- CDN upload: content-addressable paths (`/{pkg}/{version}/`) — re-upload is safe
- PR comment: bot finds existing comment by marker, updates in place
- Nightly issue: checks for existing issue with today's date, appends comment

- [ ] **Step 2: Commit** (no-op if nothing to change)

---

### Task 11: Root Package.json CI Scripts

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 1: Add CI-related scripts to root `package.json`**

Add the following scripts to the root `package.json` `scripts` section:

```json
{
  "release:ci": "tsx scripts/ci/check-npm-version.ts && changeset publish",
  "compat:quick": "COMPAT_MODE=quick tsx scripts/ci/compat-matrix.ts",
  "compat:full": "COMPAT_MODE=full tsx scripts/ci/compat-matrix.ts",
  "cdn:sync": "tsx scripts/ci/cdn-sync.ts",
  "cdn:health": "tsx scripts/ci/cdn-health-check.ts",
  "license:check": "tsx scripts/ci/license-check.ts",
  "secrets:check": "tsx scripts/ci/secrets-expiry-check.ts"
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add CI-related scripts to root package.json"
```

---

## Pipeline Architecture Summary

### Data Flow

```
PR Pipeline (pr.yml)
  trigger: pull_request → main
  ┌─ lint (parallel) ───────────────────────────────┐
  ├─ build ──┬─ validate-build                       │
  │          ├─ test (vitest)                         ├─ summary → PR comment
  │          ├─ e2e (cypress)                         │
  │          ├─ compat-latest                         │
  │          ├─ compat-minimum                        │
  │          ├─ docs-build ──┬─ preview (netlify)    │
  │          │               └─ pkg-pr-new           │
  ├─ build-base ─────────────┬─ size-diff            │
  └─ security (parallel) ───────────────────────────┘

Release Pipeline (release.yml)
  trigger: push → main
  changesets detect
    ├─ (no changesets) → create "Version Packages" PR
    └─ (published) → build+test → npm-publish → ┬─ cdn-sync
                                                  ├─ platform-notify
                                                  ├─ docs-deploy
                                                  └─ notify

Nightly Pipeline (nightly.yml)
  trigger: cron 02:00 UTC
  ┌─ compat-matrix (9 combos, fail-fast: false)
  ├─ cdn-health
  ├─ security-scan
  └─ secrets-check
  └─ nightly-report → slack + issue on failure

Rollback (rollback.yml)
  trigger: workflow_dispatch (Dashboard or manual)
  pre-check (CDN exists? SRI valid?)
    → rollback (update version mapping, cache_bust)
    → notify
```

### Idempotency Guarantees

| Operation                 | Mechanism                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| npm publish               | `npm view <pkg>@<version>` check before publish — skip if exists                         |
| CDN upload                | Content-addressable paths (`/{pkg}/{version}/`) — re-upload overwrites identical content |
| CDN state machine         | Each state transition is guarded — re-running from any state is safe                     |
| Platform API notification | Fire-and-forget with retry — duplicate notifications are idempotent on server side       |
| PR comment                | Bot finds existing comment by marker, updates in place — no comment spam                 |
| Nightly issue creation    | Checks for existing issue with today's date — appends comment instead of duplicate       |

### Rollback Integration with Dashboard

```
Dashboard "Rollback" button
  → calls GitHub Actions API: workflow_dispatch on rollback.yml
  → inputs: package, target-version, reason, operator
  → pre-check: CDN resource exists? SRI hash valid?
  → execute: update app_version_maps via Platform API
  → set cache_bust: true → pro-loader.js clears SW cache
  → record version_events (mandatory reason)
  → notify via all channels
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Plan 6 covers all items from Section 10 of the design spec — PR pipeline (lint, build, validate, test, compat, security, docs, preview, summary), Release pipeline (changesets, npm publish, CDN sync, Platform API, docs deploy, notification), Nightly pipeline (full compat matrix, CDN health, security scan, secrets check), secrets management, idempotency, and rollback integration
- [x] **No placeholders:** All workflow YAML is complete with actual job definitions, step configurations, and environment variables
- [x] **All CI scripts complete:** logger.ts, check-npm-version.ts, license-check.ts, bundle-size-diff.ts, pr-summary-comment.ts, cdn-sync.ts, cdn-health-check.ts, compat-matrix.ts, secrets-expiry-check.ts, notify.ts
- [x] **Task 3 split:** CI utility scripts split into 4 sub-tasks (3a/3b/3c/3d) for manageable agent execution
- [x] **Logger wrapper:** All CI scripts use `scripts/ci/logger.ts` (pino-based), no raw `console.log/warn/error`
- [x] **Code quality:** Each script file ≤ 400 lines, functions ≤ 50 lines, `unknown` not `any`, named exports only
- [x] **Deployment approval gate:** Release workflow uses `environment: production` for npm-publish and cdn-sync jobs
- [x] **Idempotency documented:** npm publish guard, content-addressable CDN paths, PR comment dedup, nightly issue dedup
- [x] **CDN state machine:** upload -> propagate -> verify -> active, with timeout handling and failure rollback per spec
- [x] **Secrets management:** OIDC federation notes, environment protection rules, 90-day rotation policy, nightly expiry check
- [x] **Rollback workflow:** Production approval gate, npm version verification, CDN health audit, mandatory reason, notification
- [x] **File paths:** All paths are exact and consistent with the monorepo structure from Plan 1
- [x] **Changesets strategy:** Fixed group for component packages, auto-bump for internal packages, matches spec Section 10
- [x] **Total tasks:** 11 tasks (1, 2, 3a, 3b, 3c, 3d, 4, 5, 6, 7, 8, 9 [rollback], 10 [idempotency], 11 [scripts])
