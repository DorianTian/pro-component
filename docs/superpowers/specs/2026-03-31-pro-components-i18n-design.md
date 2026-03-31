# Pro Components — i18n Design Spec

> Date: 2026-03-31
> Status: Approved
> Scope: Component library locale system, VitePress docs i18n, Platform Dashboard i18n, planning docs Chinese translations

## 1. Overview

Add internationalization (i18n) support across the entire Pro Components project:

- **Component library** (`@pro/locale`, `@pro/hooks`, `ProConfigProvider`): All user-facing text supports zh-CN and en-US
- **Platform Dashboard** (`platform/web`): Full UI text i18n via vue-i18n
- **VitePress docs** (`docs/`): Dual-language documentation site
- **Planning docs**: Independent `-zh.md` Chinese translations of all specs and plans

### Design Decisions

| Decision                   | Choice                                             | Rationale                                                     |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| i18n library               | vue-i18n 9+                                        | Unified approach across component library and dashboard       |
| vue-i18n dependency        | `peerDependencies` + `optional: true`              | Consumer may already have vue-i18n; avoid duplicate instances |
| Fallback (no vue-i18n)     | Built-in `resolveMessage()`                        | Components work without vue-i18n, zero-dependency default     |
| Element Plus bridge        | Wrap `ElConfigProvider` inside `ProConfigProvider` | Single `locale` prop syncs vue-i18n + Element Plus + dayjs    |
| Translation loading        | Bundled (all languages in bundle)                  | ~10KB gzip total, no async loading overhead                   |
| Date formatting            | dayjs + locale plugins                             | Flexible relative time, Element Plus already uses dayjs       |
| Number/currency formatting | Native `Intl` API                                  | Zero dependency, browser-native, sufficient coverage          |
| Message key structure      | Nested `pro.{component}.{feature}.{key}`           | Readable, namespaced, auto-complete friendly                  |
| vue-i18n scope             | Global scope (`useScope: 'global'`)                | Component library messages must sync with consumer's i18n     |
| Docs i18n                  | VitePress native locales (`en/`, `zh/`)            | Built-in support, directory-based, no plugins needed          |
| Planning docs              | Independent `-zh.md` files                         | English for agent execution, Chinese for human review         |

## 2. Architecture

```
Consumer App
  └─ createI18n({ messages: { ... } })          ← consumer creates instance
      └─ app.use(i18n)
          └─ <ProConfigProvider locale="zh-CN">  ← single entry point
                ├─ detect vue-i18n → merge pro messages (once at mount)
                ├─ sync locale → i18n.global.locale.value
                ├─ sync ElConfigProvider locale → element-plus locale object
                ├─ sync dayjs.locale()
                └─ provide(PRO_LOCALE_KEY, { t, locale })
                    ├─ <ProTable>        → useProLocale() → t('pro.table.empty')
                    ├─ <ProForm>         → useProLocale() → t('pro.form.submit')
                    └─ <ProDescriptions> → useProLocale() → t('pro.descriptions.empty')

Without vue-i18n:
  └─ <ProConfigProvider locale="zh-CN">
        └─ provide(PRO_LOCALE_KEY, builtinTranslator)  ← fallback
```

### Core Principle

**ProConfigProvider is the single locale entry point.** One `locale` prop synchronizes three systems:

1. **vue-i18n** global locale (if present)
2. **Element Plus** locale object (via wrapped `ElConfigProvider`)
3. **dayjs** locale

### Two Operating Modes

| Capability                      |      With vue-i18n       | Without vue-i18n (fallback) |
| ------------------------------- | :----------------------: | :-------------------------: |
| Basic translation `t()`         |            Y             |              Y              |
| Template interpolation `{name}` |            Y             |              Y              |
| Runtime locale switching        |       Y (reactive)       |        Y (reactive)         |
| Consumer message overrides      | Y (`mergeLocaleMessage`) |              N              |
| Pluralization                   |            Y             |              N              |
| `<i18n-t>` component            |            Y             |              N              |

This distinction is a **public API contract** — documented explicitly so consumers understand the capability difference.

## 3. Package Structure

### New Package: `@pro/locale`

```
packages/
  locale/
    src/
      lang/
        en-US.ts           ← English messages (~150 keys)
        zh-CN.ts           ← Chinese messages (~150 keys)
      index.ts             ← export { enUS, zhCN, type ProLocaleKey }
    package.json           ← @pro/locale
```

Locale is an independent package (not inside `@pro/utils`) because:

- Translation files update frequently; isolated changeset is cleaner
- Allows future tree-shaking per language if needed
- Clear ownership boundary in monorepo

### Package Dependencies

```
@pro/locale          ← message definitions, zero dependencies
@pro/hooks           ← useProLocale() composable, depends on @pro/locale
@pro/pro-components  ← ProConfigProvider, peerDep on vue-i18n (optional)
platform/web         ← imports @pro/locale + own dashboard messages
```

### `@pro/locale` package.json

```json
{
  "name": "@pro/locale",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {},
  "dependencies": {}
}
```

### `@pro/pro-components` peerDependencies

```json
{
  "peerDependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.9.0",
    "vue-i18n": "^9.9.0 || ^10.0.0 || ^11.0.0"
  },
  "peerDependenciesMeta": {
    "vue-i18n": {
      "optional": true
    }
  }
}
```

## 4. Locale System Implementation

### 4.1 useProLocale Composable

```ts
// packages/hooks/src/use-pro-locale.ts

import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'
import { enUS } from '@pro/locale'
import { PRO_LOCALE_KEY } from './constants'
import { resolveMessage } from './resolve-message'

export interface ProLocaleContext {
  t: (key: ProLocaleKey, params?: Record<string, string | number>) => string
  locale: ComputedRef<string>
}

export function useProLocale(): ProLocaleContext {
  const ctx = inject<ProLocaleContext | null>(PRO_LOCALE_KEY, null)

  if (!ctx && __DEV__) {
    console.warn(
      '[ProComponents] useProLocale() called without <ProConfigProvider>. ' +
        'Falling back to en-US defaults. Wrap your app with <ProConfigProvider> for full i18n support.',
    )
  }

  return (
    ctx ?? {
      t: (key, params) => resolveMessage(enUS, key, params),
      locale: computed(() => 'en-US'),
    }
  )
}
```

**All components use `useProLocale()` exclusively** — never import vue-i18n directly.

### 4.2 resolveMessage Fallback

Built-in translation function for no-vue-i18n mode:

```ts
// packages/hooks/src/resolve-message.ts

export function resolveMessage(
  messages: Record<string, unknown>,
  key: string,
  params?: Record<string, string | number>,
): string {
  if (!key) return ''
  if (!messages) return key

  const value = key
    .split('.')
    .reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], messages)

  if (typeof value !== 'string') return key
  if (!params) return value

  return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`))
}
```

### 4.3 ProConfigProvider Locale Logic

```ts
// packages/pro-components/src/pro-config-provider.ts (setup)

import { computed, onMounted, provide, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { enUS, zhCN } from '@pro/locale'
import { PRO_LOCALE_KEY } from '@pro/hooks'
import { resolveMessage } from '@pro/hooks'

const EL_LOCALE_MAP: Record<string, Language> = {
  'zh-CN': zhCn,
  'en-US': en,
}

const PRO_MESSAGES_MAP: Record<string, Record<string, unknown>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

interface ProConfigProviderProps {
  locale?: string // default: 'en-US'
  density?: 'compact' | 'default' | 'relaxed'
  theme?: 'light' | 'dark'
}

function setup(props: ProConfigProviderProps) {
  const currentLocale = computed(() => props.locale ?? 'en-US')
  const messages = computed(() => PRO_MESSAGES_MAP[currentLocale.value] ?? enUS)

  // --- vue-i18n detection (optional peer dependency) ---
  let i18n: I18nLike | null = null
  try {
    const instance = getCurrentInstance()
    i18n = instance?.appContext.config.globalProperties.$i18n ?? null
  } catch {
    i18n = null
  }

  // --- Mount: merge all locale messages once ---
  if (i18n) {
    onMounted(() => {
      i18n!.global.mergeLocaleMessage('en-US', enUS)
      i18n!.global.mergeLocaleMessage('zh-CN', zhCN)
    })
  }

  // --- Sync Element Plus locale ---
  const elLocale = computed(() => EL_LOCALE_MAP[currentLocale.value] ?? en)

  // --- Watch locale changes ---
  watch(
    currentLocale,
    (loc) => {
      // Sync vue-i18n global locale (switch only, no re-merge)
      if (i18n) {
        i18n.global.locale.value = loc
      }
      // Sync dayjs locale
      dayjs.locale(loc === 'zh-CN' ? 'zh-cn' : 'en')
    },
    { immediate: true },
  )

  // --- Provide locale context ---
  const t = i18n
    ? (key: string, params?: Record<string, string | number>) => i18n!.global.t(key, params ?? {})
    : (key: string, params?: Record<string, string | number>) =>
        resolveMessage(messages.value, key, params)

  provide(PRO_LOCALE_KEY, {
    t,
    locale: currentLocale,
  })

  return { elLocale }
}
```

Template wraps `ElConfigProvider`:

```vue
<template>
  <ElConfigProvider :locale="elLocale">
    <slot />
  </ElConfigProvider>
</template>
```

### 4.4 I18nLike Type

Since vue-i18n is optional, define a minimal interface for detection:

```ts
// packages/hooks/src/types.ts

interface I18nLike {
  global: {
    locale: { value: string }
    t: (key: string, params?: Record<string, unknown>) => string
    mergeLocaleMessage: (locale: string, messages: Record<string, unknown>) => void
  }
}
```

## 5. Message Keys

### 5.1 Complete Key Namespace

```
pro.
  table.
    queryFilter.{search, reset, expand, collapse}
    pagination.{showing}
    empty
    loading
    columnSetting.{title, pinLeft, pinRight, unpin}
    density.{compact, default, relaxed}
  form.
    {submit, reset, cancel}
    steps.{prev, next, submit, stepOf}
    validation.{required, email, minLength, maxLength}
    select.{placeholder}
    date.{placeholder}
  descriptions.
    {empty}
  common.
    {confirm, close, edit, delete, view, create, update, save}
    {success, networkError, timeout}
    {required, noResults, loading}
    aria.{expand, collapse, required, error, close}
```

### 5.2 Type-Safe Keys

```ts
// packages/locale/src/index.ts

type NestedKeyOf<T, P extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? NestedKeyOf<T[K], `${P}${K}.`>
          : `${P}${K}`
      }[keyof T & string]
    : never

export type ProLocaleKey = NestedKeyOf<typeof enUS>
```

This provides full auto-complete and typo detection for all `t()` calls within the component library.

### 5.3 Full Message Files

#### en-US.ts

```ts
export const enUS = {
  pro: {
    table: {
      queryFilter: {
        search: 'Search',
        reset: 'Reset',
        expand: 'Expand',
        collapse: 'Collapse',
      },
      pagination: {
        showing: 'Showing {start}\u2013{end} of {total}',
      },
      empty: 'No Data',
      loading: 'Loading\u2026',
      columnSetting: {
        title: 'Columns',
        pinLeft: 'Pin Left',
        pinRight: 'Pin Right',
        unpin: 'Unpin',
      },
      density: {
        compact: 'Compact',
        default: 'Default',
        relaxed: 'Relaxed',
      },
    },
    form: {
      submit: 'Submit',
      reset: 'Reset',
      cancel: 'Cancel',
      steps: {
        prev: 'Previous',
        next: 'Next',
        submit: 'Submit',
        stepOf: 'Step {current} of {total}',
      },
      validation: {
        required: '{field} is required',
        email: 'Invalid email format',
        minLength: 'Minimum {min} characters',
        maxLength: 'Maximum {max} characters',
      },
      select: {
        placeholder: 'Please select\u2026',
      },
      date: {
        placeholder: 'Select date',
      },
    },
    descriptions: {
      empty: '\u2014',
    },
    common: {
      confirm: 'Confirm',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      create: 'Create',
      update: 'Update',
      save: 'Save',
      success: 'Operation successful',
      networkError: 'Network error, please try again',
      timeout: 'Request timeout',
      required: 'Required',
      noResults: 'No results found',
      loading: 'Loading\u2026',
      aria: {
        expand: 'Expand',
        collapse: 'Collapse',
        required: 'Required field',
        error: 'Error: {message}',
        close: 'Close',
      },
    },
  },
}
```

#### zh-CN.ts

```ts
export const zhCN = {
  pro: {
    table: {
      queryFilter: {
        search: '查询',
        reset: '重置',
        expand: '展开',
        collapse: '收起',
      },
      pagination: {
        showing: '显示 {start}–{end}，共 {total} 条',
      },
      empty: '暂无数据',
      loading: '加载中…',
      columnSetting: {
        title: '列设置',
        pinLeft: '固定到左侧',
        pinRight: '固定到右侧',
        unpin: '取消固定',
      },
      density: {
        compact: '紧凑',
        default: '默认',
        relaxed: '宽松',
      },
    },
    form: {
      submit: '提交',
      reset: '重置',
      cancel: '取消',
      steps: {
        prev: '上一步',
        next: '下一步',
        submit: '提交',
        stepOf: '第 {current} 步，共 {total} 步',
      },
      validation: {
        required: '{field} 为必填项',
        email: '邮箱格式不正确',
        minLength: '最少 {min} 个字符',
        maxLength: '最多 {max} 个字符',
      },
      select: {
        placeholder: '请选择…',
      },
      date: {
        placeholder: '选择日期',
      },
    },
    descriptions: {
      empty: '—',
    },
    common: {
      confirm: '确认',
      close: '关闭',
      edit: '编辑',
      delete: '删除',
      view: '查看',
      create: '新建',
      update: '更新',
      save: '保存',
      success: '操作成功',
      networkError: '网络错误，请重试',
      timeout: '请求超时',
      required: '必填',
      noResults: '无匹配结果',
      loading: '加载中…',
      aria: {
        expand: '展开',
        collapse: '收起',
        required: '必填字段',
        error: '错误：{message}',
        close: '关闭',
      },
    },
  },
}
```

## 6. Formatting

### 6.1 Date/Time — dayjs

```ts
// packages/hooks/src/use-value-type.ts (formatting section)

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)

const DATE_FORMATS: Record<string, Record<string, string>> = {
  'zh-CN': {
    date: 'YYYY-MM-DD',
    dateTime: 'YYYY-MM-DD HH:mm:ss',
  },
  'en-US': {
    date: 'MM/DD/YYYY',
    dateTime: 'MM/DD/YYYY h:mm:ss A',
  },
}

export function formatDate(
  value: Date | string | number,
  valueType: 'date' | 'dateTime',
  locale: string,
): string {
  const fmt = DATE_FORMATS[locale]?.[valueType] ?? DATE_FORMATS['en-US'][valueType]
  return dayjs(value).format(fmt)
}

export function formatRelativeTime(value: Date | string | number): string {
  return dayjs(value).fromNow()
}
```

dayjs locale is synced by ProConfigProvider's `watch(currentLocale, ...)`, so `fromNow()` automatically returns locale-appropriate text.

### 6.2 Number / Currency / Percent — Intl

```ts
// packages/hooks/src/use-value-type.ts (formatting section)

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatMoney(value: number, locale: string, currency?: string): string {
  const cur = currency ?? (locale === 'zh-CN' ? 'CNY' : 'USD')
  return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(value)
}

export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value)
}
```

### 6.3 Integration Point

All formatters are called from `useValueType` composable, which obtains the current locale via `useProLocale()`:

```ts
const { locale } = useProLocale()

function renderValue(value: unknown, valueType: ValueType): string {
  switch (valueType) {
    case 'date':
    case 'dateTime':
      return formatDate(value as Date, valueType, locale.value)
    case 'money':
      return formatMoney(value as number, locale.value)
    case 'percent':
      return formatPercent(value as number, locale.value)
    case 'number':
      return formatNumber(value as number, locale.value)
    // ... other valueTypes
  }
}
```

Consumers can always override via `ProColumnDef.render()` custom render function.

## 7. Platform Dashboard i18n

Dashboard is a standalone app using vue-i18n directly.

### Message Location

```
platform/
  web/
    src/
      locale/
        en-US.ts     ← dashboard-specific messages
        zh-CN.ts
        index.ts
```

Dashboard messages cover:

- Navigation labels (Dashboard, Version Management, Grayscale Rules, etc.)
- Stat card headers (Total Packages, Active Versions, etc.)
- Table column headers
- Status tags (Active, Grayscale, Deprecated, Yanked)
- Dialog titles and messages (Confirm Rollback, etc.)
- Form labels and placeholders

### i18n Instance Setup

```ts
// platform/web/src/main.ts
import { createI18n } from 'vue-i18n'
import { enUS as proEnUS, zhCN as proZhCN } from '@pro/locale'
import { enUS as dashEnUS, zhCN as dashZhCN } from './locale'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': { ...proEnUS, ...dashEnUS },
    'zh-CN': { ...proZhCN, ...dashZhCN },
  },
})

app.use(i18n)
```

With this setup, `ProConfigProvider`'s `onMounted` merge is a no-op (keys already exist from `createI18n`). The merge is idempotent — harmless when messages are already in place.

Dashboard messages use a `dashboard.` namespace to avoid collision with `pro.` namespace:

```ts
// platform/web/src/locale/zh-CN.ts
export const zhCN = {
  dashboard: {
    nav: {
      home: '仪表盘',
      versions: '版本管理',
      grayscale: '灰度规则',
      compatibility: '兼容性矩阵',
      settings: '设置',
    },
    stats: {
      totalPackages: '总包数',
      activeVersions: '活跃版本',
      recentReleases: '近期发布',
      compatibilityIssues: '兼容性问题',
    },
    // ... (complete messages defined during Plan 5b implementation)
  },
}
```

## 8. VitePress Docs i18n

### Directory Structure

```
docs/
  .vitepress/
    config.ts
  en/
    guide/
      getting-started.md
      cdn-mode.md
      i18n.md              ← i18n usage guide for consumers
    components/
      pro-table.md
      pro-form.md
      pro-descriptions.md
    api/
      locale.md
  zh/
    guide/
      getting-started.md
      cdn-mode.md
      i18n.md
    components/
      pro-table.md
      pro-form.md
      pro-descriptions.md
    api/
      locale.md
```

### VitePress Config

```ts
// docs/.vitepress/config.ts
export default defineConfig({
  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Components', link: '/en/components/pro-table' },
          { text: 'API', link: '/en/api/locale' },
        ],
        sidebar: {
          /* ... */
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: '组件', link: '/zh/components/pro-table' },
          { text: 'API', link: '/zh/api/locale' },
        ],
        sidebar: {
          /* ... */
        },
      },
    },
  },
})
```

### Translation Rules

- Code blocks: never translate
- File paths: never translate
- Technical terms: keep English (composable, provide/inject, tree-shake, etc.)
- API table descriptions: translate
- Prose text: translate
- Demo component code: never translate (code is code)

## 9. Planning Docs Chinese Translations

### File Naming Convention

```
{original-filename}.md       ← English original (unchanged)
{original-filename}-zh.md    ← Chinese translation
```

### Files to Translate

| English Original                                          | Chinese Version                                              |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `specs/2026-03-31-pro-components-design.md`               | `specs/2026-03-31-pro-components-design-zh.md`               |
| `specs/2026-03-31-pro-components-ui-design.md`            | `specs/2026-03-31-pro-components-ui-design-zh.md`            |
| `specs/2026-03-31-pro-components-i18n-design.md`          | `specs/2026-03-31-pro-components-i18n-design-zh.md`          |
| `plans/2026-03-31-plan-1-monorepo-foundation.md`          | `plans/2026-03-31-plan-1-monorepo-foundation-zh.md`          |
| `plans/2026-03-31-plan-2a-hooks-and-protable.md`          | `plans/2026-03-31-plan-2a-hooks-and-protable-zh.md`          |
| `plans/2026-03-31-plan-2b-proform-and-prodescriptions.md` | `plans/2026-03-31-plan-2b-proform-and-prodescriptions-zh.md` |
| `plans/2026-03-31-plan-3-documentation.md`                | `plans/2026-03-31-plan-3-documentation-zh.md`                |
| `plans/2026-03-31-plan-4-cdn-distribution.md`             | `plans/2026-03-31-plan-4-cdn-distribution-zh.md`             |
| `plans/2026-03-31-plan-5a-platform-api.md`                | `plans/2026-03-31-plan-5a-platform-api-zh.md`                |
| `plans/2026-03-31-plan-5b-platform-dashboard.md`          | `plans/2026-03-31-plan-5b-platform-dashboard-zh.md`          |
| `plans/2026-03-31-plan-6-cicd-pipeline.md`                | `plans/2026-03-31-plan-6-cicd-pipeline-zh.md`                |
| `plans/agent-orchestration.md`                            | `plans/agent-orchestration-zh.md`                            |
| `plans/supervisor-agent.md`                               | `plans/supervisor-agent-zh.md`                               |

### Translation Rules for Planning Docs

Same rules as VitePress docs translation:

- Code blocks, file paths, variable names: keep English
- Table structure preserved, translate description columns only
- Technical terms keep English with Chinese explanation on first occurrence where helpful
- English originals remain the source of truth for agent execution
- Chinese versions are for human review

## 10. UMD / CDN Build Handling

### Rollup Configuration

vue-i18n must be externalized in all build formats:

```ts
// scripts/rollup.base.ts (additions for i18n)
{
  external: ['vue', 'vue-i18n', 'element-plus', 'dayjs'],
  output: [
    {
      format: 'esm',
      // vue-i18n resolved via import map in CDN mode
    },
    {
      format: 'cjs',
      // vue-i18n resolved via require() in Node
    },
    {
      format: 'umd',
      globals: {
        'vue': 'Vue',
        'vue-i18n': 'VueI18n',
        'element-plus': 'ElementPlus',
        'dayjs': 'dayjs',
      },
    },
  ],
}
```

### CDN Import Map

```json
{
  "imports": {
    "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.runtime.esm-browser.prod.js",
    "vue-i18n": "https://cdn.jsdelivr.net/npm/vue-i18n@11/dist/vue-i18n.runtime.esm-browser.prod.js",
    "element-plus": "https://cdn.jsdelivr.net/npm/element-plus/dist/index.full.min.mjs"
  }
}
```

vue-i18n is included in the CDN import map as an external dependency, consistent with how vue and element-plus are handled.

## 11. Integration with Existing Plans

### Impact on Plan 1 (Foundation)

- Add `packages/locale/` to monorepo workspace
- Add `@pro/locale` package scaffold (package.json, tsconfig, rollup config)
- Add `platform/*` glob to `pnpm-workspace.yaml` (future-proofing)
- Add `dayjs` and `dayjs/locale/zh-cn` as dependency
- Add `vue-i18n` as optional peerDependency in `@pro/pro-components`

### Impact on Plan 2a (Hooks + ProTable)

- `useProLocale()` composable added to `@pro/hooks`
- `useValueType` formatting functions receive locale parameter
- ProTable internal text uses `t('pro.table.xxx')` calls
- `resolveMessage()` utility in `@pro/hooks`

### Impact on Plan 2b (ProForm + ProDescriptions)

- ProForm internal text uses `t('pro.form.xxx')` calls
- ProDescriptions internal text uses `t('pro.descriptions.xxx')` calls
- ProConfigProvider implementation (locale detection, Element Plus bridge, dayjs sync)

### Impact on Plan 3 (Documentation)

- VitePress config adds `locales` for en/zh
- All doc pages duplicated under `en/` and `zh/` directories
- New `i18n.md` guide page for consumers
- New `locale.md` API reference page

### Impact on Plan 4 (CDN)

- Import map template includes vue-i18n CDN URL
- Rollup externals include vue-i18n
- CDN loader handles vue-i18n optional loading

### Impact on Plan 5b (Platform Dashboard)

- Dashboard creates vue-i18n instance with merged messages
- Dashboard-specific messages under `dashboard.` namespace
- All UI text uses `t('dashboard.xxx')` calls

### Impact on Plan 6 (CI/CD)

- No direct impact (i18n is build-time, not CI-specific)

## 12. SSR Considerations

SSR is **not in scope** for the current release. ProConfigProvider is designed for client-side rendering.

If SSR support is needed in the future (e.g., Nuxt integration):

- Replace `onMounted` message merge with synchronous merge in `setup()`
- Ensure locale is set synchronously before first render
- Serialize initial locale state in HTML for hydration
- Guard `watch({ immediate: true })` with SSR-awareness

This is documented here for future reference but will not be implemented in the initial release.
