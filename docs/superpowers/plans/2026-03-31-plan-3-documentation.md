# Plan 3: VitePress Documentation Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the complete VitePress documentation site within the monorepo — custom theme with Element Plus + Pro Components registered globally, interactive demos via `vitepress-demo-plugin`, auto-generated API docs from TypeScript types via `vue-component-meta`, guide/component/composable/platform doc pages, and changelog generation from changesets.

**Architecture:** VitePress lives in `docs/` as a workspace package. A custom theme extends VitePress's default theme to globally register Element Plus and all Pro Components so demos render correctly. Demo `.vue` files live alongside each component package in `packages/*/demos/` and are referenced from markdown via `<demo vue="..." />`. API tables are generated at build time by a script that extracts props/events/slots from TypeScript interfaces using `vue-component-meta`, outputting JSON consumed by custom Vue components in the docs theme.

**Tech Stack:** VitePress 1.6+, vitepress-demo-plugin 1.5+, vue-component-meta 3.2+, Element Plus 2.9+, @changesets/cli (changelog extraction)

---

## File Structure

```
pro-components/
├── docs/
│   ├── package.json
│   ├── .vitepress/
│   │   ├── config.ts                    # VitePress config (nav, sidebar, plugins)
│   │   └── theme/
│   │       ├── index.ts                 # Custom theme: register EP + Pro Components
│   │       ├── style.css                # Doc site custom styles
│   │       └── components/
│   │           ├── ApiTable.vue         # Renders auto-generated API JSON as table
│   │           └── TypeBlock.vue        # Renders TypeScript type definitions
│   ├── guide/
│   │   ├── introduction.md
│   │   ├── getting-started.md
│   │   ├── cdn-mode.md
│   │   └── migration.md
│   ├── components/
│   │   ├── pro-table.md
│   │   ├── pro-form.md
│   │   └── pro-descriptions.md
│   ├── composables/
│   │   ├── use-pro-table.md
│   │   ├── use-pro-form.md
│   │   └── use-pro-descriptions.md
│   ├── platform/
│   │   ├── overview.md
│   │   ├── grayscale.md
│   │   └── api-reference.md
│   ├── changelog.md
│   └── index.md                         # Landing page
├── packages/
│   ├── pro-table/demos/
│   │   ├── basic.vue
│   │   ├── request.vue
│   │   ├── composable.vue
│   │   ├── search.vue
│   │   ├── value-types.vue
│   │   └── toolbar.vue
│   ├── pro-form/demos/
│   │   ├── basic.vue
│   │   ├── layout.vue
│   │   ├── modal-form.vue
│   │   └── steps-form.vue
│   └── pro-descriptions/demos/
│       ├── basic.vue
│       └── columns-reuse.vue
└── scripts/
    ├── gen-api-doc.ts                   # vue-component-meta → api.json
    └── gen-changelog.ts                 # changesets → changelog.md
```

---

### Task 1: Docs Package Setup

**Files:**
- Create: `docs/package.json`
- Create: `docs/.vitepress/config.ts`
- Create: `docs/.vitepress/theme/style.css`
- Create: `docs/.vitepress/theme/index.ts`

- [ ] **Step 1: Create docs/package.json**

```json
{
  "name": "docs",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "pnpm gen:api && vitepress build",
    "preview": "vitepress preview",
    "gen:api": "tsx ../scripts/gen-api-doc.ts",
    "gen:changelog": "tsx ../scripts/gen-changelog.ts"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.9.0",
    "@pro/table": "workspace:*",
    "@pro/form": "workspace:*",
    "@pro/descriptions": "workspace:*",
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*",
    "@pro/pro-components": "workspace:*"
  },
  "devDependencies": {
    "vitepress": "^1.6.4",
    "vitepress-demo-plugin": "^1.5.1",
    "vue-component-meta": "^3.2.6",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create docs/.vitepress/config.ts**

```typescript
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { resolve } from 'node:path'

export default defineConfig({
  title: 'Pro Components',
  description: 'Vue 3 + Element Plus higher-level component library',
  lang: 'zh-CN',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: '组件', link: '/components/pro-table', activeMatch: '/components/' },
      { text: 'Composables', link: '/composables/use-pro-table', activeMatch: '/composables/' },
      { text: '平台', link: '/platform/overview', activeMatch: '/platform/' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速上手', link: '/guide/getting-started' },
            { text: 'CDN 模式', link: '/guide/cdn-mode' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'ProTable 高级表格', link: '/components/pro-table' },
            { text: 'ProForm 高级表单', link: '/components/pro-form' },
            { text: 'ProDescriptions 定义列表', link: '/components/pro-descriptions' },
          ],
        },
      ],
      '/composables/': [
        {
          text: 'Composables',
          items: [
            { text: 'useProTable', link: '/composables/use-pro-table' },
            { text: 'useProForm', link: '/composables/use-pro-form' },
            { text: 'useProDescriptions', link: '/composables/use-pro-descriptions' },
          ],
        },
      ],
      '/platform/': [
        {
          text: '版本管理平台',
          items: [
            { text: '概览', link: '/platform/overview' },
            { text: '灰度发布', link: '/platform/grayscale' },
            { text: 'API 参考', link: '/platform/api-reference' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/pro-components' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present',
    },
  },

  vite: {
    resolve: {
      alias: {
        '@pro/table': resolve(__dirname, '../../packages/pro-table/src'),
        '@pro/form': resolve(__dirname, '../../packages/pro-form/src'),
        '@pro/descriptions': resolve(__dirname, '../../packages/pro-descriptions/src'),
        '@pro/hooks': resolve(__dirname, '../../packages/hooks/src'),
        '@pro/utils': resolve(__dirname, '../../packages/utils/src'),
        '@pro/themes': resolve(__dirname, '../../packages/themes/src'),
        '@pro/pro-components': resolve(__dirname, '../../packages/pro-components/src'),
      },
    },
    ssr: {
      noExternal: ['element-plus'],
    },
  },

  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin)
    },
  },
})
```

- [ ] **Step 3: Create docs/.vitepress/theme/style.css**

```css
/**
 * VitePress custom theme styles for Pro Components docs.
 * Overrides default theme tokens to align with Element Plus design language.
 */

:root {
  --vp-c-brand-1: #409eff;
  --vp-c-brand-2: #337ecc;
  --vp-c-brand-3: #266eb3;
  --vp-c-brand-soft: rgba(64, 158, 255, 0.14);
  --vp-button-brand-border: transparent;
  --vp-button-brand-text: #fff;
  --vp-button-brand-bg: #409eff;
  --vp-button-brand-hover-border: transparent;
  --vp-button-brand-hover-text: #fff;
  --vp-button-brand-hover-bg: #66b1ff;
  --vp-button-brand-active-border: transparent;
  --vp-button-brand-active-text: #fff;
  --vp-button-brand-active-bg: #337ecc;
}

/* Demo container overrides */
.vitepress-demo-plugin {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.vitepress-demo-plugin__preview {
  padding: 24px;
}

.vitepress-demo-plugin__code {
  border-top: 1px solid var(--vp-c-divider);
}

/* API table styles */
.api-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

.api-table th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
  text-align: left;
  padding: 10px 16px;
  border-bottom: 2px solid var(--vp-c-divider);
}

.api-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

.api-table .prop-name {
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.api-table .prop-type {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.api-table .prop-default {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

/* Type definition block */
.type-block {
  margin: 12px 0;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.type-block pre {
  margin: 0;
  font-size: 13px;
}
```

- [ ] **Step 4: Create docs/.vitepress/theme/index.ts**

```typescript
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ApiTable from './components/ApiTable.vue'
import TypeBlock from './components/TypeBlock.vue'
import './style.css'

/**
 * Type guard: checks whether a value is a Vue component (SFC or object component).
 */
function isVueComponent(value: unknown): value is Component {
  return (
    typeof value === 'object' &&
    value !== null &&
    (typeof (value as Record<string, unknown>).setup === 'function' ||
     typeof (value as Record<string, unknown>).render === 'function' ||
     typeof (value as Record<string, unknown>).template === 'string')
  )
}

/**
 * Custom VitePress theme that registers Element Plus and all Pro Components
 * globally so interactive demos render correctly within doc pages.
 */
const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register Element Plus globally for all demos
    app.use(ElementPlus)

    // Register Pro Components globally
    // Components are imported from workspace source via Vite aliases
    // so no build step required during docs dev
    try {
      // Dynamic import allows graceful degradation if packages not yet built
      const proComponents = import.meta.glob(
        '../../packages/pro-*/src/index.ts',
        { eager: true },
      )
      for (const [, mod] of Object.entries(proComponents)) {
        const module = mod as Record<string, unknown>
        // Each package exports named components — register them all
        for (const [exportName, exportValue] of Object.entries(module)) {
          if (isVueComponent(exportValue)) {
            app.component(exportName, exportValue)
          }
        }
      }
    } catch {
      // Pro Components packages may not exist yet during initial docs setup
      // eslint-disable-next-line no-console -- docs-only warning, not production code
      console.warn('[docs] Pro Components not found — demos will not render')
    }

    // Register doc helper components
    app.component('ApiTable', ApiTable)
    app.component('TypeBlock', TypeBlock)
  },
}

// VitePress requires a default export from the theme entry file.
// This is a framework constraint — theme/index.ts is exempt from the named-export rule.
export default theme
```

- [ ] **Step 5: Commit**

```bash
git add docs/package.json docs/.vitepress/
git commit -m "feat(docs): scaffold VitePress docs package with custom theme"
```

---

### Task 2: API Doc Helper Components

**Files:**
- Create: `docs/.vitepress/theme/components/ApiTable.vue`
- Create: `docs/.vitepress/theme/components/TypeBlock.vue`

- [ ] **Step 1: Create docs/.vitepress/theme/components/ApiTable.vue**

```vue
<script setup lang="ts">
interface PropDef {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

interface EventDef {
  name: string
  type: string
  description: string
}

interface SlotDef {
  name: string
  type: string
  description: string
}

interface ApiData {
  props: PropDef[]
  events: EventDef[]
  slots: SlotDef[]
}

const props = defineProps<{
  /** Path to the generated api.json file, relative to docs root */
  src: string
}>()

const apiData = defineModel<ApiData>()

// Load api data from JSON
const modules = import.meta.glob('/api-data/**/*.json', { eager: true })
const key = Object.keys(modules).find((k) => k.includes(props.src))
if (key) {
  apiData.value = modules[key] as unknown as ApiData
}
</script>

<template>
  <div v-if="apiData" class="api-doc">
    <!-- Props Table -->
    <div v-if="apiData.props?.length" class="api-section">
      <h3 id="props">
        Props
        <a class="header-anchor" href="#props" aria-label="Permalink to Props" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>属性名</th>
            <th>说明</th>
            <th>类型</th>
            <th>默认值</th>
            <th>必填</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in apiData.props" :key="prop.name">
            <td class="prop-name">{{ prop.name }}</td>
            <td>{{ prop.description }}</td>
            <td class="prop-type">{{ prop.type }}</td>
            <td class="prop-default">{{ prop.default || '—' }}</td>
            <td>{{ prop.required ? '是' : '否' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Events Table -->
    <div v-if="apiData.events?.length" class="api-section">
      <h3 id="events">
        Events
        <a class="header-anchor" href="#events" aria-label="Permalink to Events" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>说明</th>
            <th>类型</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in apiData.events" :key="event.name">
            <td class="prop-name">{{ event.name }}</td>
            <td>{{ event.description }}</td>
            <td class="prop-type">{{ event.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Slots Table -->
    <div v-if="apiData.slots?.length" class="api-section">
      <h3 id="slots">
        Slots
        <a class="header-anchor" href="#slots" aria-label="Permalink to Slots" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>插槽名</th>
            <th>说明</th>
            <th>作用域参数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in apiData.slots" :key="slot.name">
            <td class="prop-name">{{ slot.name }}</td>
            <td>{{ slot.description }}</td>
            <td class="prop-type">{{ slot.type || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="api-doc-empty">
    <p>API data not found for <code>{{ src }}</code>. Run <code>pnpm gen:api</code> to generate.</p>
  </div>
</template>

<style scoped>
.api-section {
  margin: 24px 0;
}

.api-doc-empty {
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  color: var(--vp-c-text-2);
}
</style>
```

- [ ] **Step 2: Create docs/.vitepress/theme/components/TypeBlock.vue**

```vue
<script setup lang="ts">
defineProps<{
  /** Type definition title */
  title: string
  /** TypeScript code to display */
  code: string
}>()
</script>

<template>
  <div class="type-block">
    <div class="type-block__header">
      <code class="type-block__title">{{ title }}</code>
    </div>
    <div class="type-block__body">
      <div class="language-typescript vp-adaptive-theme">
        <pre><code>{{ code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-block {
  margin: 12px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.type-block__header {
  padding: 8px 16px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.type-block__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.type-block__body {
  padding: 0;
}

.type-block__body pre {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add docs/.vitepress/theme/components/
git commit -m "feat(docs): add ApiTable and TypeBlock helper components"
```

---

### Task 3: API Doc Auto-Generation Script

**Files:**
- Create: `scripts/gen-api-doc.ts`

- [ ] **Step 1: Create scripts/gen-api-doc.ts**

```typescript
import { createComponentMetaChecker } from 'vue-component-meta'
import { resolve, join } from 'node:path'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_DIR = resolve(ROOT, 'docs/api-data')

/** CLI logger wrapper — keeps raw console calls out of script body */
const log = {
  ok: (msg: string) => process.stdout.write(`[OK] ${msg}\n`),
  skip: (msg: string) => process.stdout.write(`[SKIP] ${msg}\n`),
  fail: (msg: string) => process.stderr.write(`[FAIL] ${msg}\n`),
  error: (msg: string) => process.stderr.write(`${msg}\n`),
  info: (msg: string) => process.stdout.write(`${msg}\n`),
}

interface PropDoc {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

interface EventDoc {
  name: string
  type: string
  description: string
}

interface SlotDoc {
  name: string
  type: string
  description: string
}

interface ComponentApiDoc {
  props: PropDoc[]
  events: EventDoc[]
  slots: SlotDoc[]
}

/**
 * Component packages to extract API documentation from.
 * Each entry maps a component name to its source file path.
 */
const COMPONENTS: Record<string, string> = {
  ProTable: 'packages/pro-table/src/ProTable.vue',
  ProForm: 'packages/pro-form/src/ProForm.vue',
  ProDescriptions: 'packages/pro-descriptions/src/ProDescriptions.vue',
}

interface TagDef {
  name: string
  description: string
  type: string
  default?: string
  required?: boolean
  values?: string[]
  text?: string
}

interface ComponentMeta {
  props: TagDef[]
  events: TagDef[]
  slots: TagDef[]
  exposed: TagDef[]
}

function cleanTypeString(raw: string): string {
  // Simplify complex union types for readability
  return raw
    .replace(/\s+/g, ' ')
    .replace(/import\([^)]+\)\./g, '')
    .trim()
}

function extractDescription(tags: TagDef[] | undefined): string {
  if (!tags || tags.length === 0) return ''
  const descTag = tags.find(
    (t: TagDef) => t.name === 'description' || t.name === 'desc',
  )
  return descTag?.text ?? ''
}

function extractApi(
  checker: ReturnType<typeof createComponentMetaChecker>,
  componentPath: string,
): ComponentApiDoc {
  const meta = checker.getComponentMeta(componentPath)

  const props: PropDoc[] = meta.props
    .filter((p) => !p.global) // Exclude global Vue props (class, style, key, ref)
    .map((p) => ({
      name: p.name,
      type: cleanTypeString(p.type),
      required: p.required,
      default: p.default ?? '',
      description: p.description || extractDescription(p.tags),
    }))

  const events: EventDoc[] = meta.events.map((e) => ({
    name: e.name,
    type: cleanTypeString(e.type),
    description: e.description || '',
  }))

  const slots: SlotDoc[] = meta.slots.map((s) => ({
    name: s.name,
    type: cleanTypeString(s.type),
    description: s.description || '',
  }))

  return { props, events, slots }
}

function main() {
  const tsConfigPath = resolve(ROOT, 'tsconfig.json')

  if (!existsSync(tsConfigPath)) {
    log.error('tsconfig.json not found at project root')
    process.exit(1)
  }

  const checker = createComponentMetaChecker(tsConfigPath)

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true })

  let hasErrors = false

  for (const [name, relativePath] of Object.entries(COMPONENTS)) {
    const fullPath = resolve(ROOT, relativePath)

    if (!existsSync(fullPath)) {
      log.skip(`${name}: source file not found at ${relativePath}`)
      continue
    }

    try {
      const api = extractApi(checker, fullPath)
      const outputFile = join(OUTPUT_DIR, `${name}.json`)
      writeFileSync(outputFile, JSON.stringify(api, null, 2), 'utf-8')
      log.ok(`${name} → ${outputFile} (${api.props.length} props, ${api.events.length} events, ${api.slots.length} slots)`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      log.fail(`${name}: ${message}`)
      hasErrors = true
    }
  }

  checker.dispose()

  if (hasErrors) {
    log.error('\nAPI doc generation completed with errors')
    process.exit(1)
  }

  log.info('\nAPI doc generation completed successfully')
}

main()
```

- [ ] **Step 2: Add api-data/ to .gitignore**

Append to the root `.gitignore`:

```
# Generated API docs
docs/api-data/
```

- [ ] **Step 3: Commit**

```bash
git add scripts/gen-api-doc.ts .gitignore
git commit -m "feat(docs): add vue-component-meta API doc generation script"
```

---

### Task 4: Changelog Auto-Generation Script

**Files:**
- Create: `scripts/gen-changelog.ts`

- [ ] **Step 1: Create scripts/gen-changelog.ts**

```typescript
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
 * Read all existing version changelogs from each package's CHANGELOG.md.
 * Changesets generates these when running `changeset version`.
 */
function readPackageChangelogs(): string[] {
  const packageDirs = [
    'packages/pro-table',
    'packages/pro-form',
    'packages/pro-descriptions',
    'packages/pro-components',
    'packages/hooks',
    'packages/utils',
    'packages/themes',
    'packages/resolvers',
  ]

  const sections: string[] = []

  for (const dir of packageDirs) {
    const changelogPath = resolve(ROOT, dir, 'CHANGELOG.md')
    if (!existsSync(changelogPath)) continue

    const content = readFileSync(changelogPath, 'utf-8')
    const pkgJsonPath = resolve(ROOT, dir, 'package.json')
    const pkgName = existsSync(pkgJsonPath)
      ? JSON.parse(readFileSync(pkgJsonPath, 'utf-8')).name
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

  const files = readdirSync(CHANGESET_DIR).filter(
    (f) => f.endsWith('.md') && f !== 'README.md',
  )

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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/gen-changelog.ts
git commit -m "feat(docs): add changelog auto-generation script from changesets"
```

---

### Task 5: Landing Page

**Files:**
- Create: `docs/index.md`

- [ ] **Step 1: Create docs/index.md**

```markdown
---
layout: home
hero:
  name: Pro Components
  text: Vue 3 + Element Plus 高级组件库
  tagline: 基于 headless-first 架构，一套 Schema 驱动表格、表单、详情三种场景
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: 组件文档
      link: /components/pro-table
    - theme: alt
      text: GitHub
      link: https://github.com/your-org/pro-components

features:
  - icon: 📊
    title: ProTable 高级表格
    details: Schema 驱动的数据表格，内置搜索表单、分页、列设置、工具栏。支持 request 自动请求和 composable 受控模式。
  - icon: 📝
    title: ProForm 高级表单
    details: 基于 ValueType 体系自动生成表单控件，支持 ModalForm、DrawerForm、StepsForm 等高阶变体。
  - icon: 📋
    title: ProDescriptions 定义列表
    details: 复用 ProTable 的 columns 定义渲染详情视图，一份 Schema 同时驱动表格和详情展示。
  - icon: 🧩
    title: Headless-First 架构
    details: 每个组件拆分为 Composable（状态逻辑）+ Component（渲染），支持简单模式和完全受控模式。
  - icon: 🌐
    title: CDN 热更新
    details: 通过 Import Maps 实现 CDN 分发，无需重新构建即可升级组件版本，支持灰度发布。
  - icon: 🎨
    title: ValueType 体系
    details: 15+ 内置 ValueType（text、date、select、money 等），自动适配表格渲染和搜索控件。
---
```

- [ ] **Step 2: Commit**

```bash
git add docs/index.md
git commit -m "feat(docs): add landing page"
```

---

### Task 6: Guide Pages

**Files:**
- Create: `docs/guide/introduction.md`
- Create: `docs/guide/getting-started.md`
- Create: `docs/guide/cdn-mode.md`
- Create: `docs/guide/migration.md`

- [ ] **Step 1: Create docs/guide/introduction.md**

```markdown
# 介绍

Pro Components 是基于 [Vue 3](https://vuejs.org/) + [Element Plus](https://element-plus.org/) 构建的高级组件库，提供开箱即用的中后台场景组件。

## 设计理念

### Schema 驱动

通过统一的 `columns` 定义同时驱动 **表格列**、**搜索表单** 和 **详情展示** 三种场景，一份 Schema 多处复用：

```typescript
const columns: ProColumnDef[] = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
  },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
  {
    dataIndex: 'createdAt',
    title: '创建时间',
    valueType: 'dateTime',
    hideInSearch: true,
  },
]
```

### Headless-First 架构

每个 Pro Component 都拆分为两部分：

- **Composable**（如 `useProTable`）— 管理所有状态和逻辑
- **Component**（如 `<ProTable />`）— 基于 composable 状态渲染 UI

支持两种使用模式：

| 模式 | 适用场景 | 示例 |
|------|---------|------|
| **简单模式** | 大多数 CRUD 场景 | `<ProTable :columns="cols" :request="fn" />` |
| **Composable 模式** | 需要外部控制状态 | `const { proTableProps, reload } = useProTable(opts)` |

### ValueType 体系

内置 15+ ValueType，自动决定表格渲染方式和搜索控件类型：

| ValueType | 表格渲染 | 搜索控件 |
|-----------|---------|---------|
| `text` | 纯文本 | `el-input` |
| `number` | 格式化数字 | `el-input-number` |
| `select` | Tag 展示 | `el-select` |
| `date` | 格式化日期 | `el-date-picker` |
| `dateRange` | — | `el-date-picker` range |
| `money` | 货币格式 | `el-input-number` |
| `percent` | 百分比 | `el-input-number` |
| `progress` | `el-progress` | — |
| `image` | `el-image` | — |

## 包结构

| 包名 | 说明 |
|------|------|
| `@pro/table` | ProTable 高级表格 |
| `@pro/form` | ProForm 高级表单 |
| `@pro/descriptions` | ProDescriptions 定义列表 |
| `@pro/hooks` | 共享 composables（useRequest、usePagination 等） |
| `@pro/utils` | 工具函数和类型定义 |
| `@pro/themes` | 主题 token 和 CSS 变量 |
| `@pro/resolvers` | unplugin 自动导入解析器 |
| `@pro/pro-components` | 聚合包，一次导入所有组件 |

## 兼容性

- Vue >= 3.4.0
- Element Plus >= 2.9.0
- 现代浏览器（Chrome、Firefox、Safari、Edge 最新两个版本）
```

- [ ] **Step 2: Create docs/guide/getting-started.md**

```markdown
# 快速上手

## 安装

::: code-group

```bash [pnpm]
pnpm add @pro/pro-components element-plus
```

```bash [npm]
npm install @pro/pro-components element-plus
```

```bash [yarn]
yarn add @pro/pro-components element-plus
```

:::

## 完整引入

在入口文件中全量注册：

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import ProComponents from '@pro/pro-components'
import 'element-plus/dist/index.css'
import '@pro/pro-components/style'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(ProComponents)
app.mount('#app')
```

## 按需引入

每个组件独立发包，可以单独安装和引入：

```bash
pnpm add @pro/table
```

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { ProTable } from '@pro/table'
import 'element-plus/dist/index.css'
import '@pro/table/style'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.component('ProTable', ProTable)
app.mount('#app')
```

## 自动导入（推荐）

配合 [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) 实现自动按需导入：

```bash
pnpm add -D unplugin-vue-components @pro/resolvers
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ProComponentsResolver } from '@pro/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ProComponentsResolver()],
    }),
  ],
})
```

配置后可直接在模板中使用 `<ProTable />`，无需手动 import。

## 最小示例

```vue
<script setup lang="ts">
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'id', title: 'ID', valueType: 'text' },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'status', title: '状态', valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const request = async (params: { current: number; pageSize: number }) => {
  const res = await fetch(`/api/users?page=${params.current}&size=${params.pageSize}`)
  const data = await res.json()
  return { data: data.list, total: data.total, success: true }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="用户管理"
    row-key="id"
  />
</template>
```

## TypeScript 支持

Pro Components 使用 TypeScript 编写，提供完整的类型定义。所有类型从 `@pro/utils` 导出：

```typescript
import type {
  ProColumnDef,
  RequestParams,
  RequestResult,
  ValueType,
  StatusType,
} from '@pro/utils'
```

## 下一步

- [ProTable 组件文档](/components/pro-table) — 完整 API 和交互示例
- [CDN 模式](/guide/cdn-mode) — 无需构建直接在浏览器使用
- [Composable 模式](/composables/use-pro-table) — 完全控制组件状态
```

- [ ] **Step 3: Create docs/guide/cdn-mode.md**

```markdown
# CDN 模式

Pro Components 支持通过 CDN + Import Maps 在浏览器中直接使用，无需构建工具。这使得组件版本可以独立于业务应用进行热更新。

## 工作原理

```
浏览器 → pro-loader.js → 请求 /api/import-map
  → 注入 import map（通过 es-module-shims）
  → modulepreload + CSS 注入
  → import(appEntry) 启动应用
```

## 快速集成

在 HTML 中添加一行 script 即可：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>My App</title>
</head>
<body>
  <div id="app"></div>

  <!-- 配置 -->
  <script>window.__PRO_USER_ID__ = 'your-user-id'</script>

  <!-- 一行接入 -->
  <script
    src="https://cdn.internal/pro-loader@1.js?appId=your-app-id"
    data-pro-entry="/src/main.ts"
  ></script>
</body>
</html>
```

## Loader 加载流程

1. 加载 `es-module-shims` polyfill（支持动态 import map 注入）
2. 从 API 获取 import map（CDN 边缘缓存：`max-age=60, stale-while-revalidate=300`）
3. 失败时走降级链：API → Service Worker 缓存 → localStorage → 硬编码兜底 → 错误页面（带重试）
4. 注入 import map + modulepreload links + CSS links（含 SRI 完整性校验）
5. 注册/更新 Service Worker 用于离线兜底
6. `import(appEntry)` 启动应用

## Import Map 结构

API 返回的 import map 示例：

```json
{
  "imports": {
    "@pro/table": "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs",
    "@pro/form": "https://cdn.internal/@pro/form/1.1.2/esm/index.mjs",
    "@pro/hooks": "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "vue": "https://cdn.internal/vue/3.5.0/dist/vue.esm-browser.prod.js",
    "element-plus": "https://cdn.internal/element-plus/2.9.0/dist/index.full.mjs"
  },
  "preloads": [
    "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"
  ],
  "styles": [
    "https://cdn.internal/element-plus/2.9.0/dist/index.css",
    "https://cdn.internal/@pro/table/1.2.3/style/index.css"
  ]
}
```

## 开发环境对齐

CDN 模式下模块边界和 Vite 开发模式可能不一致，导致 `inject() can only be used inside setup()` 等问题。使用官方 Vite 插件解决：

```bash
pnpm add -D @pro/vite-plugin
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { proPlugin } from '@pro/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    proPlugin(),
  ],
})
```

插件作用：
- 将 Vue、Element Plus、`@pro/*` 排除在 Vite 的 `optimizeDeps` 预打包之外
- 确保开发模式的模块边界与 CDN 生产模式一致

## 灰度发布

CDN 模式支持按用户、部门、百分比进行灰度发布。详见 [灰度发布指南](/platform/grayscale)。

## 缓存策略

| 资源类型 | Cache-Control | 说明 |
|---------|--------------|------|
| 版本化静态资源 | `immutable, max-age=31536000` | URL 包含版本号 + 内容 hash |
| API 响应 | `max-age=60, stale-while-revalidate=300` | CDN 边缘缓存 |
| Loader 脚本（版本化） | 长缓存 | `/pro-loader@1.js` |
| Loader 脚本（latest） | 短缓存 | `/pro-loader@latest.js` |

## 安全性

- 所有 CDN 资源附带 SRI（Subresource Integrity）hash 校验
- CDN 静态资源：`Access-Control-Allow-Origin: *`
- API 接口：白名单域名 + `credentials: include`
```

- [ ] **Step 4: Create docs/guide/migration.md**

```markdown
# 迁移指南

## 从 Element Plus 原生迁移到 ProTable

### Before: 手动组装表格 + 搜索 + 分页

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const pagination = reactive({ current: 1, pageSize: 20 })
const searchForm = reactive({ name: '', status: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await fetch(
      `/api/users?page=${pagination.current}&size=${pagination.pageSize}&name=${searchForm.name}&status=${searchForm.status}`
    )
    const data = await res.json()
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  fetchData()
}

function handleReset() {
  searchForm.name = ''
  searchForm.status = ''
  pagination.current = 1
  fetchData()
}

function handlePageChange(page: number) {
  pagination.current = page
  fetchData()
}

fetchData()
</script>

<template>
  <!-- 搜索表单 -->
  <el-form :model="searchForm" inline>
    <el-form-item label="姓名">
      <el-input v-model="searchForm.name" />
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="searchForm.status">
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>

  <!-- 表格 -->
  <el-table :data="tableData" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页 -->
  <el-pagination
    :current-page="pagination.current"
    :page-size="pagination.pageSize"
    :total="total"
    @current-change="handlePageChange"
  />
</template>
```

### After: ProTable 一体化

```vue
<script setup lang="ts">
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const request = async (params: { current: number; pageSize: number; name?: string; status?: string }) => {
  const query = new URLSearchParams({
    page: String(params.current),
    size: String(params.pageSize),
    ...(params.name && { name: params.name }),
    ...(params.status && { status: params.status }),
  })
  const res = await fetch(`/api/users?${query}`)
  const data = await res.json()
  return { data: data.list, total: data.total, success: true }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="用户管理"
    row-key="id"
    :search="true"
  />
</template>
```

**减少了什么：**
- 无需手动管理 `loading`、`pagination`、`searchForm` 状态
- 搜索表单从 `columns` 定义自动生成
- 分页组件内置，页码变化自动重新请求
- `valueEnum` 同时控制表格 Tag 渲染和搜索下拉选项

## 迁移检查清单

- [ ] 替换 `<el-table>` + 手动分页/搜索为 `<ProTable :columns :request />`
- [ ] 将列定义从 `<el-table-column>` 模板迁移为 `ProColumnDef[]` 数组
- [ ] 用 `valueType` + `valueEnum` 替代手动的渲染模板
- [ ] 需要外部状态控制时，切换到 `useProTable` composable 模式
- [ ] 替换 `<el-form>` 手动表单为 `<ProForm :fields />` 或 ProTable 内置搜索
- [ ] 详情展示从 `<el-descriptions>` 迁移为 `<ProDescriptions :columns :data />`，复用表格的 columns 定义
```

- [ ] **Step 5: Commit**

```bash
git add docs/guide/
git commit -m "feat(docs): add guide pages (introduction, getting-started, cdn-mode, migration)"
```

---

### Task 7: ProTable Demo Files

**Files:**
- Create: `packages/pro-table/demos/basic.vue`
- Create: `packages/pro-table/demos/request.vue`
- Create: `packages/pro-table/demos/composable.vue`
- Create: `packages/pro-table/demos/search.vue`
- Create: `packages/pro-table/demos/value-types.vue`
- Create: `packages/pro-table/demos/toolbar.vue`

- [ ] **Step 1: Create packages/pro-table/demos/basic.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface UserRecord {
  id: number
  name: string
  age: number
  email: string
  status: string
}

const columns: ProColumnDef<UserRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'age', title: '年龄', valueType: 'number', width: 100 },
  { dataIndex: 'email', title: '邮箱', valueType: 'text', ellipsis: true, copyable: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const data: UserRecord[] = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com', status: 'active' },
  { id: 3, name: '王五', age: 24, email: 'wangwu@example.com', status: 'disabled' },
  { id: 4, name: '赵六', age: 36, email: 'zhaoliu@example.com', status: 'active' },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="基础用法"
    row-key="id"
    :search="false"
  />
</template>
```

- [ ] **Step 2: Create packages/pro-table/demos/request.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface ArticleRecord {
  id: number
  title: string
  author: string
  status: string
  createdAt: string
  views: number
}

const columns: ProColumnDef<ArticleRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80 },
  { dataIndex: 'title', title: '标题', valueType: 'text', ellipsis: true },
  { dataIndex: 'author', title: '作者', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      draft: { text: '草稿', status: 'default' },
      published: { text: '已发布', status: 'success' },
      archived: { text: '已归档', status: 'info' },
    },
  },
  { dataIndex: 'views', title: '浏览量', valueType: 'number', hideInSearch: true, sortable: true },
  { dataIndex: 'createdAt', title: '创建时间', valueType: 'dateTime', hideInSearch: true },
]

/**
 * Simulates a remote API request with pagination and filtering.
 */
async function request(params: RequestParams): Promise<RequestResult<ArticleRecord>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const allData: ArticleRecord[] = Array.from({ length: 86 }, (_, i) => ({
    id: i + 1,
    title: `文章标题 ${i + 1}`,
    author: ['张三', '李四', '王五'][i % 3],
    status: ['draft', 'published', 'archived'][i % 3],
    createdAt: new Date(2026, 0, 1 + i).toISOString(),
    views: Math.floor(Math.random() * 10000),
  }))

  // Apply filters
  let filtered = allData
  if (params.title) {
    filtered = filtered.filter((item) => item.title.includes(params.title))
  }
  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status)
  }

  // Paginate
  const start = (params.current - 1) * params.pageSize
  const end = start + params.pageSize

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    success: true,
  }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="远程请求模式"
    row-key="id"
    :search="true"
    :pagination="{ pageSize: 10 }"
  />
</template>
```

- [ ] **Step 3: Create packages/pro-table/demos/composable.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import { useProTable } from '@pro/hooks'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'
import { ElButton, ElMessage } from 'element-plus'

interface OrderRecord {
  id: string
  product: string
  amount: number
  status: string
}

const columns: ProColumnDef<OrderRecord>[] = [
  { dataIndex: 'id', title: '订单号', valueType: 'text' },
  { dataIndex: 'product', title: '商品', valueType: 'text' },
  { dataIndex: 'amount', title: '金额', valueType: 'money' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      pending: { text: '待支付', status: 'warning' },
      paid: { text: '已支付', status: 'success' },
      cancelled: { text: '已取消', status: 'danger' },
    },
  },
]

async function request(params: RequestParams): Promise<RequestResult<OrderRecord>> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const data: OrderRecord[] = Array.from({ length: 30 }, (_, i) => ({
    id: `ORD-${String(i + 1).padStart(6, '0')}`,
    product: `商品 ${i + 1}`,
    amount: Math.floor(Math.random() * 10000) / 100,
    status: ['pending', 'paid', 'cancelled'][i % 3],
  }))
  const start = (params.current - 1) * params.pageSize
  return {
    data: data.slice(start, start + params.pageSize),
    total: data.length,
    success: true,
  }
}

const {
  proTableProps,
  selectedRows,
  selectedRowKeys,
  clearSelection,
  reload,
  deleteRow,
} = useProTable({
  columns,
  request,
  rowKey: 'id',
  defaultPageSize: 5,
})

function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  for (const key of selectedRowKeys.value) {
    deleteRow(key)
  }
  clearSelection()
  ElMessage.success(`已删除 ${selectedRowKeys.value.length} 条订单`)
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <ElButton type="primary" @click="reload(true)">刷新数据</ElButton>
    <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
      批量删除 ({{ selectedRows.length }})
    </ElButton>
  </div>

  <ProTable
    v-bind="proTableProps"
    header-title="Composable 受控模式"
    :row-selection="{ type: 'checkbox' }"
  />
</template>
```

- [ ] **Step 4: Create packages/pro-table/demos/search.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'

interface EmployeeRecord {
  id: number
  name: string
  department: string
  role: string
  joinDate: string
  salary: number
}

const columns: ProColumnDef<EmployeeRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
    searchConfig: { order: 1, span: 8 },
  },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
      marketing: { text: '市场部' },
    },
    searchConfig: { order: 2, span: 8 },
  },
  {
    dataIndex: 'role',
    title: '职位',
    valueType: 'text',
    searchConfig: { order: 3, span: 8 },
  },
  {
    dataIndex: 'joinDate',
    title: '入职日期',
    valueType: 'date',
    searchConfig: { order: 4, span: 8 },
  },
  {
    dataIndex: 'salary',
    title: '薪资',
    valueType: 'money',
    hideInSearch: true,
  },
]

async function request(params: RequestParams): Promise<RequestResult<EmployeeRecord>> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const allData: EmployeeRecord[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: ['张三', '李四', '王五', '赵六', '钱七'][i % 5],
    department: ['engineering', 'product', 'design', 'marketing'][i % 4],
    role: ['前端工程师', '后端工程师', '产品经理', 'UI 设计师'][i % 4],
    joinDate: new Date(2023, i % 12, 1 + (i % 28)).toISOString().split('T')[0],
    salary: 15000 + Math.floor(Math.random() * 30000),
  }))

  let filtered = allData
  if (params.name) filtered = filtered.filter((r) => r.name.includes(params.name))
  if (params.department) filtered = filtered.filter((r) => r.department === params.department)
  if (params.role) filtered = filtered.filter((r) => r.role.includes(params.role))

  const start = (params.current - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    success: true,
  }
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="搜索表单"
    row-key="id"
    :search="{ labelWidth: 80, defaultCollapsed: false }"
  />
</template>
```

- [ ] **Step 5: Create packages/pro-table/demos/value-types.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface ValueTypeRecord {
  id: number
  text: string
  number: number
  money: number
  percent: number
  date: string
  dateTime: string
  status: string
  switch: boolean
  progress: number
  image: string
  code: string
}

const columns: ProColumnDef<ValueTypeRecord>[] = [
  { dataIndex: 'text', title: 'text', valueType: 'text' },
  { dataIndex: 'number', title: 'number', valueType: 'number' },
  { dataIndex: 'money', title: 'money', valueType: 'money' },
  { dataIndex: 'percent', title: 'percent', valueType: 'percent' },
  { dataIndex: 'date', title: 'date', valueType: 'date' },
  { dataIndex: 'dateTime', title: 'dateTime', valueType: 'dateTime' },
  {
    dataIndex: 'status',
    title: 'select',
    valueType: 'select',
    valueEnum: {
      open: { text: 'Open', status: 'success' },
      closed: { text: 'Closed', status: 'danger' },
      processing: { text: 'Processing', status: 'warning' },
    },
  },
  { dataIndex: 'switch', title: 'switch', valueType: 'switch' },
  { dataIndex: 'progress', title: 'progress', valueType: 'progress', width: 200 },
  { dataIndex: 'image', title: 'image', valueType: 'image', width: 100 },
  { dataIndex: 'code', title: 'code', valueType: 'code' },
]

const data: ValueTypeRecord[] = [
  {
    id: 1,
    text: 'Hello World',
    number: 12345,
    money: 9999.99,
    percent: 0.856,
    date: '2026-03-30',
    dateTime: '2026-03-30T14:30:00',
    status: 'open',
    switch: true,
    progress: 75,
    image: 'https://via.placeholder.com/80x80',
    code: 'const x = 1',
  },
  {
    id: 2,
    text: 'Pro Components',
    number: 67890,
    money: 1234.56,
    percent: 0.423,
    date: '2026-01-15',
    dateTime: '2026-01-15T09:00:00',
    status: 'closed',
    switch: false,
    progress: 100,
    image: 'https://via.placeholder.com/80x80',
    code: 'return true',
  },
  {
    id: 3,
    text: 'ValueType Demo',
    number: 42,
    money: 0.01,
    percent: 1.0,
    date: '2026-06-01',
    dateTime: '2026-06-01T18:45:00',
    status: 'processing',
    switch: true,
    progress: 30,
    image: 'https://via.placeholder.com/80x80',
    code: 'npm run dev',
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="ValueType 展示"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
```

- [ ] **Step 6: Create packages/pro-table/demos/toolbar.vue**

```vue
<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef, RequestParams, RequestResult } from '@pro/utils'
import { ElButton, ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

interface ProjectRecord {
  id: number
  name: string
  owner: string
  status: string
  updatedAt: string
}

const columns: ProColumnDef<ProjectRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true },
  { dataIndex: 'name', title: '项目名称', valueType: 'text' },
  { dataIndex: 'owner', title: '负责人', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '进行中', status: 'success' },
      paused: { text: '已暂停', status: 'warning' },
      completed: { text: '已完成', status: 'info' },
    },
  },
  { dataIndex: 'updatedAt', title: '更新时间', valueType: 'dateTime', hideInSearch: true },
]

async function request(params: RequestParams): Promise<RequestResult<ProjectRecord>> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const data: ProjectRecord[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `项目 ${String.fromCharCode(65 + (i % 26))}`,
    owner: ['Alice', 'Bob', 'Charlie'][i % 3],
    status: ['active', 'paused', 'completed'][i % 3],
    updatedAt: new Date(2026, 2, 30 - i).toISOString(),
  }))
  const start = (params.current - 1) * params.pageSize
  return { data: data.slice(start, start + params.pageSize), total: data.length, success: true }
}

function handleCreate() {
  ElMessage.info('打开创建对话框')
}

function handleExport() {
  ElMessage.info('导出数据')
}
</script>

<template>
  <ProTable
    :columns="columns"
    :request="request"
    header-title="项目管理"
    row-key="id"
    :search="true"
    :toolbar="{ settings: ['density', 'columnSetting', 'fullScreen'] }"
  >
    <template #toolbarActions>
      <ElButton type="primary" @click="handleCreate">新建项目</ElButton>
      <ElDropdown>
        <ElButton>更多操作</ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="handleExport">导出数据</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </template>
  </ProTable>
</template>
```

- [ ] **Step 7: Commit**

```bash
git add packages/pro-table/demos/
git commit -m "feat(docs): add ProTable demo files (basic, request, composable, search, valueTypes, toolbar)"
```

---

### Task 8: ProForm Demo Files

**Files:**
- Create: `packages/pro-form/demos/basic.vue`
- Create: `packages/pro-form/demos/layout.vue`
- Create: `packages/pro-form/demos/modal-form.vue`
- Create: `packages/pro-form/demos/steps-form.vue`

- [ ] **Step 1: Create packages/pro-form/demos/basic.vue**

```vue
<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'

const fields = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text' as const,
    searchConfig: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    valueType: 'text' as const,
    searchConfig: {
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email' as const, message: '请输入有效的邮箱地址' },
      ],
    },
  },
  {
    dataIndex: 'role',
    title: '角色',
    valueType: 'select' as const,
    valueEnum: {
      admin: { text: '管理员' },
      editor: { text: '编辑' },
      viewer: { text: '访客' },
    },
  },
  {
    dataIndex: 'birthday',
    title: '生日',
    valueType: 'date' as const,
  },
  {
    dataIndex: 'bio',
    title: '简介',
    valueType: 'textarea' as const,
  },
]

interface BasicFormValues {
  name: string
  email: string
  role: string
  birthday: string
  bio: string
}

async function handleSubmit(values: BasicFormValues) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success(`提交成功: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm
    :fields="fields"
    :on-submit="handleSubmit"
    :initial-values="{ role: 'editor' }"
  />
</template>
```

- [ ] **Step 2: Create packages/pro-form/demos/layout.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

type LayoutType = 'horizontal' | 'vertical' | 'inline'
const layout = ref<LayoutType>('horizontal')

const fields = [
  { dataIndex: 'firstName', title: '名', valueType: 'text' as const },
  { dataIndex: 'lastName', title: '姓', valueType: 'text' as const },
  { dataIndex: 'phone', title: '手机号', valueType: 'text' as const },
  {
    dataIndex: 'gender',
    title: '性别',
    valueType: 'radio' as const,
    valueEnum: {
      male: { text: '男' },
      female: { text: '女' },
    },
  },
]

interface LayoutFormValues {
  firstName: string
  lastName: string
  phone: string
  gender: string
}

async function handleSubmit(_values: LayoutFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}
</script>

<template>
  <div style="margin-bottom: 24px">
    <span style="margin-right: 12px">布局模式：</span>
    <ElRadioGroup v-model="layout">
      <ElRadioButton value="horizontal">水平</ElRadioButton>
      <ElRadioButton value="vertical">垂直</ElRadioButton>
      <ElRadioButton value="inline">行内</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProForm
    :layout="layout"
    :fields="fields"
    :on-submit="handleSubmit"
  />
</template>
```

- [ ] **Step 3: Create packages/pro-form/demos/modal-form.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ModalForm } from '@pro/form'
import { ElButton, ElMessage } from 'element-plus'

const visible = ref(false)

const fields = [
  {
    dataIndex: 'taskName',
    title: '任务名称',
    valueType: 'text' as const,
    searchConfig: {
      rules: [{ required: true, message: '请输入任务名称' }],
    },
  },
  {
    dataIndex: 'priority',
    title: '优先级',
    valueType: 'select' as const,
    valueEnum: {
      high: { text: '高', status: 'danger' },
      medium: { text: '中', status: 'warning' },
      low: { text: '低', status: 'info' },
    },
  },
  {
    dataIndex: 'deadline',
    title: '截止日期',
    valueType: 'date' as const,
  },
  {
    dataIndex: 'description',
    title: '描述',
    valueType: 'textarea' as const,
  },
]

interface ModalFormValues {
  taskName: string
  priority: string
  deadline: string
  description: string
}

async function handleSubmit(_values: ModalFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success('任务创建成功')
  return true
}
</script>

<template>
  <ElButton type="primary" @click="visible = true">新建任务</ElButton>

  <ModalForm
    v-model:visible="visible"
    title="新建任务"
    :fields="fields"
    :on-submit="handleSubmit"
  />
</template>
```

- [ ] **Step 4: Create packages/pro-form/demos/steps-form.vue**

```vue
<script setup lang="ts">
import { StepsForm } from '@pro/form'
import { ElMessage } from 'element-plus'

const steps = [
  {
    title: '基本信息',
    fields: [
      {
        dataIndex: 'companyName',
        title: '公司名称',
        valueType: 'text' as const,
        searchConfig: { rules: [{ required: true, message: '请输入公司名称' }] },
      },
      {
        dataIndex: 'industry',
        title: '行业',
        valueType: 'select' as const,
        valueEnum: {
          tech: { text: '科技' },
          finance: { text: '金融' },
          healthcare: { text: '医疗' },
          education: { text: '教育' },
        },
      },
    ],
  },
  {
    title: '联系方式',
    fields: [
      {
        dataIndex: 'contactName',
        title: '联系人',
        valueType: 'text' as const,
        searchConfig: { rules: [{ required: true, message: '请输入联系人' }] },
      },
      {
        dataIndex: 'contactPhone',
        title: '电话',
        valueType: 'text' as const,
      },
      {
        dataIndex: 'contactEmail',
        title: '邮箱',
        valueType: 'text' as const,
        searchConfig: {
          rules: [{ type: 'email' as const, message: '请输入有效邮箱' }],
        },
      },
    ],
  },
  {
    title: '补充信息',
    fields: [
      {
        dataIndex: 'notes',
        title: '备注',
        valueType: 'textarea' as const,
      },
    ],
  },
]

interface StepsFormValues {
  companyName: string
  industry: string
  contactName: string
  contactPhone: string
  contactEmail: string
  notes: string
}

async function handleSubmit(values: StepsFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success(`注册完成: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <StepsForm
    :steps="steps"
    :on-submit="handleSubmit"
  />
</template>
```

- [ ] **Step 5: Commit**

```bash
git add packages/pro-form/demos/
git commit -m "feat(docs): add ProForm demo files (basic, layout, modal-form, steps-form)"
```

---

### Task 9: ProDescriptions Demo Files

**Files:**
- Create: `packages/pro-descriptions/demos/basic.vue`
- Create: `packages/pro-descriptions/demos/columns-reuse.vue`

- [ ] **Step 1: Create packages/pro-descriptions/demos/basic.vue**

```vue
<script setup lang="ts">
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'age', title: '年龄', valueType: 'number' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text', copyable: true },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
  { dataIndex: 'salary', title: '薪资', valueType: 'money' },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date' },
  { dataIndex: 'bio', title: '简介', valueType: 'textarea' },
]

const data = {
  name: '张三',
  age: 28,
  email: 'zhangsan@example.com',
  status: 'active',
  salary: 25000,
  joinDate: '2023-06-15',
  bio: '资深前端工程师，专注于 Vue 生态和组件库开发。',
}
</script>

<template>
  <ProDescriptions
    title="员工详情"
    :columns="columns"
    :data="data"
  />
</template>
```

- [ ] **Step 2: Create packages/pro-descriptions/demos/columns-reuse.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ProTable } from '@pro/table'
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'
import { ElDrawer } from 'element-plus'

interface UserRecord {
  id: number
  name: string
  role: string
  department: string
  status: string
  joinDate: string
}

/**
 * Same columns definition drives both the table and the descriptions panel.
 * Fields hidden in each view are controlled via hideInTable / hideInDescriptions.
 */
const columns: ProColumnDef<UserRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, hideInSearch: true, hideInDescriptions: true },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'role', title: '职位', valueType: 'text', hideInSearch: true },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
  },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date', hideInSearch: true },
]

const drawerVisible = ref(false)
const selectedUser = ref<UserRecord | null>(null)

const tableData: UserRecord[] = [
  { id: 1, name: '张三', role: '前端工程师', department: 'engineering', status: 'active', joinDate: '2023-06-15' },
  { id: 2, name: '李四', role: '产品经理', department: 'product', status: 'active', joinDate: '2022-03-01' },
  { id: 3, name: '王五', role: 'UI 设计师', department: 'design', status: 'resigned', joinDate: '2021-09-20' },
]

function handleRowClick(row: UserRecord) {
  selectedUser.value = row
  drawerVisible.value = true
}
</script>

<template>
  <ProTable
    :columns="columns"
    :data="tableData"
    header-title="Columns 复用示例"
    row-key="id"
    :search="false"
    :table-props="{ highlightCurrentRow: true }"
    @row-click="handleRowClick"
  />

  <ElDrawer v-model="drawerVisible" title="用户详情" size="40%">
    <ProDescriptions
      v-if="selectedUser"
      :columns="columns"
      :data="selectedUser"
    />
  </ElDrawer>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-descriptions/demos/
git commit -m "feat(docs): add ProDescriptions demo files (basic, columns-reuse)"
```

---

### Task 10: Component Doc Pages

**Files:**
- Create: `docs/components/pro-table.md`
- Create: `docs/components/pro-form.md`
- Create: `docs/components/pro-descriptions.md`

- [ ] **Step 1: Create docs/components/pro-table.md**

````markdown
---
outline: deep
---

# ProTable 高级表格

Schema 驱动的数据表格，内置搜索表单、分页、列设置、工具栏。一份 `columns` 定义同时描述表格列、搜索控件和详情字段。

## 基础用法

使用静态 `data` 直接渲染表格。

<demo vue="../../packages/pro-table/demos/basic.vue" />

## 远程请求模式

通过 `request` 函数自动管理加载状态、分页和搜索参数。

<demo vue="../../packages/pro-table/demos/request.vue" />

## Composable 受控模式

使用 `useProTable` 获得完整状态控制，将 `proTableProps` 绑定到组件。

<demo vue="../../packages/pro-table/demos/composable.vue" />

## 搜索表单

根据 `columns` 中的 `valueType` 和 `searchConfig` 自动生成搜索表单，支持配置列宽、排序和折叠。

<demo vue="../../packages/pro-table/demos/search.vue" />

## ValueType 展示

展示所有内置 ValueType 的渲染效果。

<demo vue="../../packages/pro-table/demos/value-types.vue" />

## 工具栏

配置 `toolbar` 开启密度切换、列设置、全屏功能。通过 `#toolbarActions` 插槽添加自定义操作按钮。

<demo vue="../../packages/pro-table/demos/toolbar.vue" />

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| `toolbarActions` | 工具栏右侧操作区 | — |
| `toolbarTitle` | 自定义标题区域 | — |
| `headerCell` | 自定义表头单元格 | `{ column, index }` |
| `bodyCell` | 自定义表体单元格 | `{ column, row, index, text }` |
| `expandedRow` | 展开行内容 | `{ row, index }` |
| `summary` | 表格底部合计行 | `{ data }` |
| `empty` | 空状态 | — |

## API

<ApiTable src="ProTable" />

### ProColumnDef

```typescript
interface ProColumnDef<T = Record<string, unknown>> {
  dataIndex: keyof T | string
  title: string
  key?: string
  valueType?: ValueType
  valueEnum?: Record<string, { text: string; status?: StatusType }>
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  ellipsis?: boolean
  copyable?: boolean
  render?: (row: T, index: number) => VNode
  hideInSearch?: boolean
  hideInTable?: boolean
  hideInDescriptions?: boolean
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: unknown
    rules?: FormRule[]
    render?: () => VNode
  }
  descriptionsRender?: (value: unknown, row: T) => VNode
}
```

### RequestParams

```typescript
interface RequestParams {
  current: number
  pageSize: number
  [key: string]: unknown
}
```

### RequestResult

```typescript
interface RequestResult<T = Record<string, unknown>> {
  data: T[]
  total: number
  success: boolean
}
```
````

- [ ] **Step 2: Create docs/components/pro-form.md**

````markdown
---
outline: deep
---

# ProForm 高级表单

基于 ValueType 体系自动生成表单控件，支持水平/垂直/行内三种布局。提供 ModalForm、DrawerForm、StepsForm 等高阶变体。

## 基础用法

通过 `fields` 定义表单字段，`valueType` 自动决定控件类型。

<demo vue="../../packages/pro-form/demos/basic.vue" />

## 布局模式

支持 `horizontal`（水平）、`vertical`（垂直）、`inline`（行内）三种布局。

<demo vue="../../packages/pro-form/demos/layout.vue" />

## 弹窗表单 ModalForm

将表单包裹在 `el-dialog` 中，适合新建/编辑场景。

<demo vue="../../packages/pro-form/demos/modal-form.vue" />

## 分步表单 StepsForm

多步骤表单，每步独立验证，最后统一提交。

<demo vue="../../packages/pro-form/demos/steps-form.vue" />

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| `submitter` | 自定义提交按钮区域 | `{ submit, reset, loading }` |
| `[field.dataIndex]` | 自定义单个字段的渲染 | `{ value, onChange, field }` |

## API

<ApiTable src="ProForm" />

### ProFormProps

```typescript
interface ProFormProps {
  layout?: 'horizontal' | 'vertical' | 'inline'
  fields: ProFieldDef[]
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
  formProps?: Partial<ElFormProps>
}
```

### ProFieldDef

`ProFieldDef` 复用 `ProColumnDef` 中与表单相关的字段，核心属性包括：

```typescript
interface ProFieldDef {
  dataIndex: string
  title: string
  valueType: ValueType
  valueEnum?: Record<string, { text: string; status?: StatusType }>
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: unknown
    rules?: FormRule[]
    render?: () => VNode
  }
}
```

### ModalForm Props

```typescript
interface ModalFormProps extends ProFormProps {
  visible: boolean
  title: string
  width?: string | number
  modalProps?: Partial<ElDialogProps>
}
```

### StepsForm Props

```typescript
interface StepsFormProps {
  steps: Array<{
    title: string
    fields: ProFieldDef[]
  }>
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
}
```
````

- [ ] **Step 3: Create docs/components/pro-descriptions.md**

````markdown
---
outline: deep
---

# ProDescriptions 定义列表

复用 ProTable 的 `columns` 定义渲染详情视图。一份 Schema 同时驱动表格列展示和详情页展示。

## 基础用法

传入 `columns` 和 `data` 渲染详情列表，`valueType` 控制值的格式化方式。

<demo vue="../../packages/pro-descriptions/demos/basic.vue" />

## Columns 复用

同一份 `columns` 定义同时驱动 ProTable 和 ProDescriptions，点击表格行在抽屉中展示详情。

<demo vue="../../packages/pro-descriptions/demos/columns-reuse.vue" />

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| `title` | 自定义标题 | — |
| `extra` | 右上角操作区 | — |
| `[column.dataIndex]` | 自定义单个字段的渲染 | `{ value, data, column }` |

## API

<ApiTable src="ProDescriptions" />

### ProDescriptionsProps

```typescript
interface ProDescriptionsProps<T = Record<string, unknown>> {
  title?: string
  columns: ProColumnDef<T>[]
  data: T
  column?: number                    // 一行展示几列，默认 3
  border?: boolean
  size?: 'large' | 'default' | 'small'
  descriptionsProps?: Partial<ElDescriptionsProps>
}
```

### 字段可见性控制

```typescript
// ProColumnDef 中控制各场景可见性的字段：
{
  hideInTable: boolean        // true 时不在 ProTable 中展示
  hideInSearch: boolean       // true 时不生成搜索控件
  hideInDescriptions: boolean // true 时不在 ProDescriptions 中展示
}
```
````

- [ ] **Step 4: Commit**

```bash
git add docs/components/
git commit -m "feat(docs): add component doc pages (ProTable, ProForm, ProDescriptions)"
```

---

### Task 11: Composable Doc Pages

**Files:**
- Create: `docs/composables/use-pro-table.md`
- Create: `docs/composables/use-pro-form.md`
- Create: `docs/composables/use-pro-descriptions.md`

- [ ] **Step 1: Create docs/composables/use-pro-table.md**

````markdown
---
outline: deep
---

# useProTable

`useProTable` 是 ProTable 的核心 composable，管理表格的全部状态和逻辑。当需要从组件外部控制表格行为时（如外部按钮触发刷新、跨组件共享选中状态），使用 composable 模式。

## 基本用法

```typescript
import { useProTable } from '@pro/hooks'

const {
  proTableProps,        // 绑定到 <ProTable /> 的 props
  dataSource,           // Ref<T[]> — 当前页数据
  loading,              // Ref<boolean> — 加载状态
  pagination,           // Reactive — 分页状态
  formValues,           // Ref<Record<string, unknown>> — 搜索表单值
  selectedRows,         // Ref<T[]> — 选中行数据
  selectedRowKeys,      // Ref<string[]> — 选中行 key
  clearSelection,       // () => void — 清空选中
  sortState,            // Ref<SortState | null> — 排序状态
  filterState,          // Ref<Record<string, unknown>> — 筛选状态
  reload,               // (resetPage?: boolean) => Promise<void> — 重新请求
  reset,                // () => void — 重置所有状态
  setFormValues,        // (values) => void — 设置搜索表单值
  setDataSource,        // (data: T[]) => void — 直接设置数据
  insertRow,            // (row: T, index?: number) => void — 插入行
  updateRow,            // (key: string, row: Partial<T>) => void — 更新行
  deleteRow,            // (key: string) => void — 删除行
} = useProTable({
  columns,
  request,
  rowKey: 'id',
  defaultPageSize: 20,
})
```

## 与组件绑定

将 `proTableProps` 展开绑定到 `<ProTable />`：

```vue
<template>
  <ProTable v-bind="proTableProps" header-title="表格标题" />
</template>
```

组件通过 provide/inject 检测外部 composable 实例是否存在。如果存在，使用外部实例；否则内部自动创建。

## Options

```typescript
interface UseProTableOptions<T = Record<string, unknown>> {
  /** 列定义 */
  columns: ProColumnDef<T>[]

  /** 数据请求函数 */
  request?: (params: RequestParams) => Promise<RequestResult<T>>

  /** 行唯一标识字段名 */
  rowKey?: string

  /** 默认分页大小 */
  defaultPageSize?: number

  /** 默认搜索表单值 */
  defaultFormValues?: Record<string, unknown>

  /** 请求前参数处理 */
  beforeRequest?: (params: RequestParams) => RequestParams

  /** 响应后数据处理 */
  afterResponse?: (raw: unknown) => RequestResult<T>

  /** 是否组件挂载时自动发起首次请求，默认 true */
  immediate?: boolean

  /** 防抖间隔（毫秒），默认 300 */
  debounceInterval?: number
}
```

## 返回值

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `proTableProps` | `ComputedRef<ProTableProps>` | 绑定到 ProTable 组件的 props 对象 |
| `dataSource` | `Ref<T[]>` | 当前页数据 |
| `loading` | `Ref<boolean>` | 加载状态 |
| `pagination` | `Reactive<PaginationState>` | 分页状态（current、pageSize、total） |
| `formValues` | `Ref<Record<string, unknown>>` | 搜索表单当前值 |
| `selectedRows` | `Ref<T[]>` | 当前选中的行数据 |
| `selectedRowKeys` | `Ref<string[]>` | 当前选中行的 key 数组 |
| `sortState` | `Ref<SortState \| null>` | 当前排序状态 |
| `filterState` | `Ref<Record<string, unknown>>` | 当前筛选状态 |
| `clearSelection` | `() => void` | 清空行选中 |
| `reload` | `(resetPage?: boolean) => Promise<void>` | 重新请求，resetPage=true 时回到第一页 |
| `reset` | `() => void` | 重置所有状态（表单、分页、排序、筛选） |
| `setFormValues` | `(values: Partial<FormValues>) => void` | 设置搜索表单值并触发请求 |
| `setDataSource` | `(data: T[]) => void` | 直接设置表格数据（受控模式） |
| `insertRow` | `(row: T, index?: number) => void` | 在指定位置插入行 |
| `updateRow` | `(key: string, row: Partial<T>) => void` | 按 key 更新行数据 |
| `deleteRow` | `(key: string) => void` | 按 key 删除行 |

## 内部 Composable 协作

`useProTable` 内部由多个细粒度 composable 组合而成：

```
useProTable
  ├── useRequest      — 管理请求生命周期（loading, debounce, cancel）
  ├── usePagination   — 管理分页状态和联动
  ├── useSelection    — 管理行选中状态和跨页保持
  ├── useSort         — 管理排序状态
  ├── useFilter       — 管理筛选状态
  └── useRowOps       — 管理行级 CRUD（insert, update, delete）
```

这些内部 composable 也从 `@pro/hooks` 导出，可以独立使用：

```typescript
import { useRequest, usePagination } from '@pro/hooks'
```
````

- [ ] **Step 2: Create docs/composables/use-pro-form.md**

````markdown
---
outline: deep
---

# useProForm

`useProForm` 是 ProForm 的核心 composable，管理表单状态、验证和提交逻辑。

## 基本用法

```typescript
import { useProForm } from '@pro/hooks'

const {
  proFormProps,         // 绑定到 <ProForm /> 的 props
  formValues,           // Ref<Record<string, unknown>> — 表单值
  loading,              // Ref<boolean> — 提交中状态
  setFieldValue,        // (field: string, value: unknown) => void
  setFieldsValue,       // (values: Record<string, unknown>) => void
  getFieldValue,        // (field: string) => unknown
  getFieldsValue,       // () => Record<string, unknown>
  validateFields,       // (fields?: string[]) => Promise<boolean>
  resetFields,          // () => void — 重置为初始值
  submit,               // () => Promise<boolean> — 触发验证 + 提交
  clearValidation,      // (fields?: string[]) => void — 清除验证状态
} = useProForm({
  fields,
  initialValues: { role: 'editor' },
  onSubmit: async (values) => {
    await api.createUser(values)
    return true
  },
})
```

## Options

```typescript
interface UseProFormOptions {
  /** 表单字段定义 */
  fields: ProFieldDef[]

  /** 初始值 */
  initialValues?: Record<string, unknown>

  /** 提交回调，返回 true 表示成功 */
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>

  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline'
}
```

## 返回值

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `proFormProps` | `ComputedRef<ProFormProps>` | 绑定到 ProForm 组件的 props 对象 |
| `formValues` | `Ref<Record<string, unknown>>` | 当前表单值 |
| `loading` | `Ref<boolean>` | 提交中状态 |
| `setFieldValue` | `(field: string, value: unknown) => void` | 设置单个字段值 |
| `setFieldsValue` | `(values: Record<string, unknown>) => void` | 批量设置字段值 |
| `getFieldValue` | `(field: string) => unknown` | 获取单个字段值 |
| `getFieldsValue` | `() => Record<string, unknown>` | 获取所有字段值 |
| `validateFields` | `(fields?: string[]) => Promise<boolean>` | 验证指定字段（不传则全部验证） |
| `resetFields` | `() => void` | 重置为初始值 |
| `submit` | `() => Promise<boolean>` | 触发验证并调用 onSubmit |
| `clearValidation` | `(fields?: string[]) => void` | 清除验证错误提示 |

## 与 ModalForm / DrawerForm 配合

高阶表单变体（ModalForm、DrawerForm）内部使用 `useProForm`。如果需要外部控制，同样可以使用 composable 模式：

```typescript
const { proFormProps, submit, resetFields } = useProForm({ fields, onSubmit })

// 外部按钮触发提交
async function handleOk() {
  const success = await submit()
  if (success) dialogVisible.value = false
}
```
````

- [ ] **Step 3: Create docs/composables/use-pro-descriptions.md**

````markdown
---
outline: deep
---

# useProDescriptions

`useProDescriptions` 管理 ProDescriptions 的数据加载和格式化逻辑。

## 基本用法

```typescript
import { useProDescriptions } from '@pro/hooks'

const {
  proDescriptionsProps,   // 绑定到 <ProDescriptions /> 的 props
  data,                   // Ref<T> — 详情数据
  loading,                // Ref<boolean> — 加载状态
  reload,                 // () => Promise<void> — 重新加载数据
  setData,                // (data: T) => void — 直接设置数据
} = useProDescriptions({
  columns,
  request: async () => {
    const res = await fetch('/api/user/1')
    return res.json()
  },
})
```

## Options

```typescript
interface UseProDescriptionsOptions<T = Record<string, unknown>> {
  /** 列定义，复用 ProColumnDef */
  columns: ProColumnDef<T>[]

  /** 数据请求函数 */
  request?: () => Promise<T>

  /** 静态数据（与 request 二选一） */
  data?: T

  /** 是否挂载时自动请求，默认 true */
  immediate?: boolean
}
```

## 返回值

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `proDescriptionsProps` | `ComputedRef<ProDescriptionsProps>` | 绑定到 ProDescriptions 组件的 props 对象 |
| `data` | `Ref<T>` | 当前详情数据 |
| `loading` | `Ref<boolean>` | 加载状态 |
| `reload` | `() => Promise<void>` | 重新请求数据 |
| `setData` | `(data: T) => void` | 直接设置详情数据 |

## 典型场景

### 与 ProTable 联动

点击表格行查看详情，共用同一份 `columns`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProDescriptions } from '@pro/hooks'

const columns = [/* 共用的 columns 定义 */]

const { proDescriptionsProps, setData } = useProDescriptions({
  columns,
  immediate: false,
})

// 从表格行点击事件获取数据
function handleRowClick(row: unknown) {
  setData(row)
  drawerVisible.value = true
}
</script>
```
````

- [ ] **Step 4: Commit**

```bash
git add docs/composables/
git commit -m "feat(docs): add composable doc pages (useProTable, useProForm, useProDescriptions)"
```

---

### Task 12: Platform Doc Pages

**Files:**
- Create: `docs/platform/overview.md`
- Create: `docs/platform/grayscale.md`
- Create: `docs/platform/api-reference.md`

- [ ] **Step 1: Create docs/platform/overview.md**

```markdown
---
outline: deep
---

# 版本管理平台

版本管理平台是 Pro Components CDN 分发体系的控制中心，提供版本管理、灰度发布、兼容性矩阵和审计追踪功能。

## 架构

```
platform/
├── web/            # Dashboard（Vue 3 + Element Plus）
│   └── views/
│       ├── app-manage/       # 业务应用管理
│       ├── version-map/      # 版本映射配置
│       ├── publish/          # 发布管理 & 灰度
│       ├── compat-matrix/    # 兼容性矩阵
│       └── changelog/        # 变更日志查看
└── server/         # API（Koa + MySQL）
    └── modules/
        ├── app/              # 应用 CRUD
        ├── version/          # 版本管理 & 依赖解析
        ├── import-map/       # Import Map 生成 & 缓存
        ├── grayscale/        # 灰度策略引擎
        └── sync/             # npm publish → CDN 同步
```

## 核心功能

### 应用管理

每个接入 CDN 分发的业务应用注册为一个 App，配置其依赖的 Pro Components 版本。

### 版本映射

控制每个 App 使用的各个 `@pro/*` 包版本。支持：
- **固定版本**（pin）：`1.2.3`
- **版本范围**（range）：`^1.2.0`
- **自动解析**：根据范围自动选择最新满足的版本

### 兼容性矩阵

CI 自动测试 Pro Components 与不同版本 Vue / Element Plus 的兼容性，结果上报至平台并可视化展示。

| 状态 | 含义 |
|------|------|
| 通过 | 全部测试通过 |
| 失败 | 存在测试不通过 |
| 未测试 | 尚未执行测试 |

### 审计追踪

所有版本操作（发布、固定、升级、回滚、灰度）记录在 `version_events` 表中，包含操作人、时间、原因（回滚操作强制填写）。

## RBAC 权限

| 角色 | 权限范围 |
|------|---------|
| viewer | 查看版本、兼容性矩阵、import map |
| publisher | CI 机器人，发布新版本 |
| operator | 灰度管理、版本映射变更 |
| admin | 回滚、废弃版本、用户管理 |

## 依赖解析

平台在生成 Import Map 时执行完整的依赖解析：

1. 收集请求包的所有 peer dependency 范围
2. 对每个共享依赖计算范围交集
3. 交集存在 → 选择最新满足版本
4. 无交集 → 返回冲突错误和升级建议

### 钻石依赖检测

当两个包依赖同一个包的不兼容版本时，平台会报错并提供升级建议：

```json
{
  "conflict": "element-plus",
  "required": {
    "@pro/table@2.0": "^2.4.0",
    "@pro/form@1.5": ">=2.2.0 <2.4.0"
  },
  "suggestion": "Upgrade @pro/form to 2.0"
}
```

## CDN 发布状态机

```
npm publish hook →
  uploading     → 上传 dist 到 CDN 存储 + 计算 SHA-384 hash
  propagating   → 等待 CDN 全球同步（轮询 3+ 边缘节点）
  verifying     → 从边缘节点加载并验证 hash 和 exports
  active        → 更新 API 版本映射（最后一步）
  failed        → 回滚、清理、通知发布者
```

版本映射更新始终是最后一步，确保 API 不会指向 CDN 上还不存在的文件。

## 部署

- 独立 CI/CD 管线，与组件库发布分离
- 蓝绿部署 + 深度健康检查（DB + Redis + CDN 存储连通性）
- 数据库迁移使用 expand-contract 模式
- API 版本化：`/api/v1/`, `/api/v2/`
```

- [ ] **Step 2: Create docs/platform/grayscale.md**

```markdown
---
outline: deep
---

# 灰度发布

灰度发布允许将新版本逐步推送给部分用户，在确认稳定后再全量发布。

## 策略类型

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| `user_list` | 指定用户 ID 列表 | 内部测试人员 |
| `department` | 按部门推送 | 团队级试用 |
| `percentage` | 按百分比推送 | 逐步放量 |
| `composite` | 组合策略（AND/OR） | 复杂场景 |

## 组合规则

支持 AND / OR 嵌套的复合规则：

```json
{
  "operator": "OR",
  "conditions": [
    { "type": "user_list", "values": ["uid1", "uid2"] },
    {
      "operator": "AND",
      "conditions": [
        { "type": "department", "values": ["engineering"] },
        { "type": "percentage", "value": 50, "hash_key": "user_id" }
      ]
    }
  ]
}
```

上面的规则含义：**uid1 或 uid2 命中灰度**，或者 **engineering 部门中 50% 的用户命中灰度**。

### 百分比策略的确定性

百分比策略使用 hash（而非随机数）确定用户分组：

```
hash(user_id + rule_id) % 100 < percentage → 命中灰度
```

同一用户在同一规则下每次请求都得到相同结果，避免页面刷新后版本跳变。

## 灰度流程

```
创建灰度规则 → active 状态
  ↓
观察期（监控错误率、性能指标）
  ↓
确认稳定 → 调用 complete 接口 → 全量发布
  ↓ 或
发现问题 → 调用 pause 接口 → 暂停灰度
  ↓
问题修复后 → 重新激活 或 新建灰度规则
```

## Dashboard 操作

在平台 Dashboard 的「发布管理」页面：

1. 选择目标应用和包
2. 选择要灰度的新版本
3. 配置灰度策略
4. 启动灰度
5. 在监控面板观察灰度用户的错误率和性能
6. 确认稳定后点击「全量发布」

## 回滚安全

回滚操作也走灰度流程 — 先对内部用户回滚，确认无问题后全量回滚：

1. 发起回滚前自动检查：目标版本的 CDN 资源是否仍存在？SRI hash 是否匹配？
2. 创建灰度规则，目标版本为回滚版本
3. API 响应包含 `cache_bust: true`，loader 检测到后清除 Service Worker 缓存
4. 审计日志记录回滚原因（必填）

## API 接口

```
POST /api/v1/grayscale                   # 创建灰度规则
PUT  /api/v1/grayscale/:id/pause         # 暂停灰度
PUT  /api/v1/grayscale/:id/complete      # 全量发布（灰度完成）
GET  /api/v1/apps/:appId/versions        # 查看应用版本映射
```

详细 API 参数见 [API 参考](/platform/api-reference)。
```

- [ ] **Step 3: Create docs/platform/api-reference.md**

````markdown
---
outline: deep
---

# API 参考

版本管理平台所有 API 均以 `/api/v1/` 为前缀，遵循 RESTful 规范。采用容错读取模式（tolerant reader）：未知字段忽略，不拒绝。

## Import Map（消费端）

### GET /api/v1/import-map

获取指定应用的 import map，CDN 边缘缓存。

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appId | string | 是 | 应用 ID |
| userId | string | 否 | 用户 ID，用于灰度命中判断 |

**响应示例：**

```json
{
  "imports": {
    "@pro/table": "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs",
    "@pro/hooks": "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "vue": "https://cdn.internal/vue/3.5.0/dist/vue.esm-browser.prod.js",
    "element-plus": "https://cdn.internal/element-plus/2.9.0/dist/index.full.mjs"
  },
  "preloads": [
    "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"
  ],
  "styles": [
    "https://cdn.internal/element-plus/2.9.0/dist/index.css",
    "https://cdn.internal/@pro/table/1.2.3/style/index.css"
  ],
  "sriHashes": {
    "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs": "sha384-abc123..."
  },
  "cache_bust": false
}
```

## 版本管理

### POST /api/v1/versions/sync

npm publish hook 触发的版本同步。

**Request Body：**

```json
{
  "package": "@pro/table",
  "version": "1.2.3",
  "dependencies": { "@pro/hooks": "^1.2.0", "@pro/utils": "^1.0.0" },
  "peerDependencies": { "vue": ">=3.4.0", "element-plus": ">=2.9.0" },
  "changelog": "feat: add column pinning support",
  "breakingChanges": []
}
```

### GET /api/v1/versions/:package

获取包的所有版本列表。

### GET /api/v1/versions/:package/deps

获取包的完整依赖树。

## 应用管理

### POST /api/v1/apps

注册新应用。

```json
{
  "appId": "user-center",
  "name": "用户中心",
  "owner": "dorian"
}
```

### GET /api/v1/apps/:appId/versions

获取应用的版本映射。

### PUT /api/v1/apps/:appId/versions

更新应用的版本映射。

```json
{
  "versions": [
    { "package": "@pro/table", "versionRange": "^1.2.0" },
    { "package": "@pro/form", "pinnedVersion": "1.1.2" }
  ]
}
```

## 灰度管理

### POST /api/v1/grayscale

创建灰度规则。

```json
{
  "appId": "user-center",
  "packageId": 1,
  "targetVersion": "1.3.0-beta.1",
  "strategy": "composite",
  "ruleConfig": {
    "operator": "OR",
    "conditions": [
      { "type": "user_list", "values": ["uid1", "uid2"] },
      { "type": "percentage", "value": 10, "hash_key": "user_id" }
    ]
  }
}
```

### PUT /api/v1/grayscale/:id/pause

暂停灰度规则。

### PUT /api/v1/grayscale/:id/complete

灰度完成，提升为全量发布。

## 兼容性

### GET /api/v1/compat/:package

获取包的兼容性矩阵。

### POST /api/v1/compat/report

CI 自动上报测试结果。

```json
{
  "package": "@pro/table",
  "version": "1.2.3",
  "vueVersion": "3.5.0",
  "elementPlusVersion": "2.9.0",
  "status": "pass",
  "ciRunUrl": "https://github.com/your-org/pro-components/actions/runs/12345"
}
```

## 运维操作

### POST /api/v1/versions/:id/rollback

回滚版本。需要 admin 权限。

```json
{
  "targetVersion": "1.1.0",
  "reason": "v1.2.0 causes table pagination regression"
}
```

### POST /api/v1/versions/:id/deprecate

标记版本为废弃。

### GET /api/v1/apps/:id/resolution-graph

调试用：查看应用的依赖解析图。

## 健康检查

### GET /health/resolution

深度健康检查（无版本前缀）：DB + Redis + CDN 存储连通性。

```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "cdnStorage": "ok"
  },
  "timestamp": "2026-03-30T14:30:00Z"
}
```
````

- [ ] **Step 4: Commit**

```bash
git add docs/platform/
git commit -m "feat(docs): add platform doc pages (overview, grayscale, api-reference)"
```

---

### Task 13: Changelog Page

**Files:**
- Create: `docs/changelog.md`

- [ ] **Step 1: Create docs/changelog.md**

The initial changelog is a placeholder that will be overwritten by `gen-changelog.ts`:

```markdown
---
outline: deep
---

# 更新日志

> 本页由 changesets 自动生成，请勿手动编辑。

暂无更新记录。首次发布后将自动生成更新日志。
```

- [ ] **Step 2: Commit**

```bash
git add docs/changelog.md
git commit -m "feat(docs): add changelog placeholder page"
```

---

### Task 14: Root Config Updates

**Files:**
- Modify: `turbo.json` (add docs task)
- Modify: root `package.json` (add docs scripts)

- [ ] **Step 1: Add docs tasks to turbo.json**

Add the following tasks to `turbo.json` under `"tasks"`:

```json
{
  "tasks": {
    "docs:dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "docs:build": {
      "outputs": ["docs/.vitepress/dist/**"],
      "dependsOn": ["^build"],
      "inputs": [
        "docs/**",
        "packages/*/demos/**",
        "packages/*/src/**"
      ]
    }
  }
}
```

- [ ] **Step 2: Add docs scripts to root package.json**

Add to `scripts` in root `package.json`:

```json
{
  "docs:dev": "pnpm --filter docs dev",
  "docs:build": "pnpm --filter docs build",
  "docs:preview": "pnpm --filter docs preview",
  "gen:api": "pnpm --filter docs gen:api",
  "gen:changelog": "pnpm --filter docs gen:changelog"
}
```

- [ ] **Step 3: Add docs to root tsconfig.json references**

Add to `references` array in root `tsconfig.json`:

```json
{ "path": "docs" }
```

- [ ] **Step 4: Create docs/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@pro/table": ["../packages/pro-table/src"],
      "@pro/form": ["../packages/pro-form/src"],
      "@pro/descriptions": ["../packages/pro-descriptions/src"],
      "@pro/hooks": ["../packages/hooks/src"],
      "@pro/utils": ["../packages/utils/src"],
      "@pro/themes": ["../packages/themes/src"],
      "@pro/pro-components": ["../packages/pro-components/src"]
    }
  },
  "include": [
    ".vitepress/**/*.ts",
    ".vitepress/**/*.vue"
  ],
  "exclude": [
    ".vitepress/dist",
    ".vitepress/cache"
  ]
}
```

- [ ] **Step 5: Add VitePress cache/dist to .gitignore**

Append to root `.gitignore`:

```
# VitePress
docs/.vitepress/dist/
docs/.vitepress/cache/
```

- [ ] **Step 6: Commit**

```bash
git add turbo.json package.json tsconfig.json docs/tsconfig.json .gitignore
git commit -m "chore: integrate docs package into monorepo build pipeline"
```

---

### Task 15: Verify Docs Build

- [ ] **Step 1: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 2: Run docs dev server**

```bash
pnpm docs:dev
```

Verify in browser:
- Landing page renders with hero section and feature cards
- Navigation works: Guide, Components, Composables, Platform, Changelog
- Guide pages render markdown content correctly
- Component pages show demo containers (demos may show errors until component packages are fully implemented — the `<demo />` tags and demo files should parse without build errors)
- Sidebar navigation is correct for all sections

- [ ] **Step 3: Run docs build**

```bash
pnpm docs:build
```

Verify:
- Build completes without errors
- Output in `docs/.vitepress/dist/` contains all expected HTML pages
- Static assets are generated

- [ ] **Step 4: Preview built site**

```bash
pnpm docs:preview
```

Verify the production build serves correctly.

---

## Self-Review Checklist

- [x] **Spec coverage:** Plan 3 covers all items from Section 9 of the design spec — VitePress structure, custom theme, vitepress-plugin-demo integration, vue-component-meta API generation, guide/component/composable/platform pages, changelog, demo files in packages
- [x] **No placeholders:** All steps contain complete code — every `.md`, `.vue`, `.ts`, `.css`, and `.json` file is written out in full
- [x] **Demo files in packages:** Demo `.vue` files are placed in `packages/*/demos/` directories as specified in the design spec (Section 3 package structure)
- [x] **File paths consistent:** All paths match the file structure map and are referenced consistently across VitePress config (sidebar, nav), markdown pages (`<demo />` tags), and build scripts
- [x] **vitepress-demo-plugin usage:** Uses `vitepress-demo-plugin` (v1.5+) with `<demo vue="..." />` syntax per its API
- [x] **vue-component-meta integration:** `gen-api-doc.ts` script uses `createComponentMetaChecker` to extract Props/Events/Slots from TypeScript interfaces, outputs JSON consumed by `<ApiTable />` component
- [x] **Changelog pipeline:** `gen-changelog.ts` reads both pending changesets and released CHANGELOG.md files, generating the unified `docs/changelog.md`
- [x] **Theme registers dependencies:** Custom theme registers Element Plus globally and auto-discovers Pro Components via `import.meta.glob`, with graceful fallback
- [x] **Monorepo integration:** docs workspace package added to `pnpm-workspace.yaml` (via Plan 1), turbo.json tasks added, root scripts added, tsconfig references updated
- [x] **TypeScript checked demos:** Demo files import from `@pro/*` packages with proper type annotations, serving as both documentation and development playground
