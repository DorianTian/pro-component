# i18n Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add zh-CN / en-US internationalization across the component library, platform dashboard, VitePress docs, and translate planning docs to Chinese.

**Architecture:** vue-i18n as optional peerDependency with built-in fallback. ProConfigProvider is the single locale entry point, syncing vue-i18n + Element Plus + dayjs. Standalone `@pro/locale` package holds all message definitions.

**Tech Stack:** vue-i18n 9+, dayjs (date formatting), Intl API (number/currency), VitePress native locales

**Design Spec:** `docs/superpowers/specs/2026-03-31-pro-components-i18n-design.md`

---

## Execution Timeline

This plan is **additive** to existing Plans 1–6. Tasks are grouped by phase and indicate which existing plan they augment.

| Phase | Tasks | Augments | Can Parallel With |
|-------|-------|----------|-------------------|
| 1 | 1–3 | Plan 1 (Foundation) | — |
| 2 | 4–10 | Plan 2a, 2b, 5b | Existing Plan 2a/2b/5b agents |
| 3 | 11–13 | Plan 3, 4 | Existing Plan 3/4 agents |
| Any | 14 | Standalone | Any phase |

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `packages/locale/package.json` | @pro/locale package manifest |
| `packages/locale/tsconfig.json` | TypeScript config extending base |
| `packages/locale/rollup.config.ts` | Build config for locale package |
| `packages/locale/src/index.ts` | Public exports: enUS, zhCN, ProLocaleKey type |
| `packages/locale/src/lang/en-US.ts` | English messages (~60 keys) |
| `packages/locale/src/lang/zh-CN.ts` | Chinese messages (~60 keys) |
| `packages/hooks/src/use-pro-locale.ts` | useProLocale composable |
| `packages/hooks/src/resolve-message.ts` | Fallback translation function |
| `packages/hooks/src/resolve-message.test.ts` | resolveMessage unit tests |
| `packages/hooks/src/use-pro-locale.test.ts` | useProLocale unit tests |
| `platform/web/src/locale/en-US.ts` | Dashboard English messages |
| `platform/web/src/locale/zh-CN.ts` | Dashboard Chinese messages |
| `platform/web/src/locale/index.ts` | Dashboard locale exports |

### Modified Files

| File | Change |
|------|--------|
| `pnpm-workspace.yaml` | Add `platform/*` glob |
| `packages/pro-components/package.json` | Add vue-i18n optional peerDep |
| `packages/hooks/package.json` | Add @pro/locale dependency |
| `packages/hooks/src/index.ts` | Export useProLocale, resolveMessage |
| `packages/hooks/src/constants.ts` | Add PRO_LOCALE_KEY symbol |
| `packages/hooks/src/use-value-type.ts` | Locale-aware formatters |
| `packages/pro-components/src/pro-config-provider.vue` | Locale detection + sync |
| `scripts/rollup.base.ts` | Add vue-i18n + dayjs to externals |
| `cdn/loader/src/pro-loader.ts` | Add vue-i18n to import map |
| `docs/.vitepress/config.ts` | Add locales config |
| `platform/web/src/main.ts` | Add vue-i18n instance setup |

---

## Phase 1: Foundation (augments Plan 1)

### Task 1: Create @pro/locale Package

**Files:**
- Create: `packages/locale/package.json`
- Create: `packages/locale/tsconfig.json`
- Create: `packages/locale/rollup.config.ts`
- Create: `packages/locale/src/lang/en-US.ts`
- Create: `packages/locale/src/lang/zh-CN.ts`
- Create: `packages/locale/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@pro/locale",
  "version": "0.0.0",
  "description": "Locale messages for Pro Components (zh-CN, en-US)",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {},
  "dependencies": {},
  "devDependencies": {}
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create rollup.config.ts**

```ts
import { createBaseConfig } from '../../scripts/rollup.base'

export default createBaseConfig({
  input: 'src/index.ts',
  packageName: 'ProLocale',
})
```

- [ ] **Step 4: Create en-US.ts**

```ts
// packages/locale/src/lang/en-US.ts

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
} as const
```

- [ ] **Step 5: Create zh-CN.ts**

```ts
// packages/locale/src/lang/zh-CN.ts

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
        showing: '显示 {start}\u2013{end}，共 {total} 条',
      },
      empty: '暂无数据',
      loading: '加载中\u2026',
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
        placeholder: '请选择\u2026',
      },
      date: {
        placeholder: '选择日期',
      },
    },
    descriptions: {
      empty: '\u2014',
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
      loading: '加载中\u2026',
      aria: {
        expand: '展开',
        collapse: '收起',
        required: '必填字段',
        error: '错误：{message}',
        close: '关闭',
      },
    },
  },
} as const
```

- [ ] **Step 6: Create index.ts with type-safe keys**

```ts
// packages/locale/src/index.ts

export { enUS } from './lang/en-US'
export { zhCN } from './lang/zh-CN'

type NestedKeyOf<T, P extends string = ''> =
  T extends Record<string, unknown>
    ? { [K in keyof T & string]:
        T[K] extends Record<string, unknown>
          ? NestedKeyOf<T[K], `${P}${K}.`>
          : `${P}${K}`
      }[keyof T & string]
    : never

import type { enUS } from './lang/en-US'

export type ProLocaleKey = NestedKeyOf<typeof enUS>
```

- [ ] **Step 7: Verify build**

Run: `cd packages/locale && pnpm build`
Expected: dist/ contains index.mjs, index.cjs, index.d.ts

- [ ] **Step 8: Commit**

```bash
git add packages/locale/
git commit -m "feat(locale): add @pro/locale package with zh-CN and en-US messages"
```

---

### Task 2: Update Workspace Config

**Files:**
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Add platform glob to workspace**

In `pnpm-workspace.yaml`, add `"platform/*"` to the packages list:

```yaml
packages:
  - "packages/*"
  - "platform/*"
  - "playground"
  - "docs"
```

- [ ] **Step 2: Verify workspace recognizes new packages**

Run: `pnpm ls --depth 0 --filter @pro/locale`
Expected: @pro/locale listed

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml
git commit -m "chore(build): add platform/* to workspace config"
```

---

### Task 3: Add vue-i18n Optional Peer Dependency

**Files:**
- Modify: `packages/pro-components/package.json`
- Modify: `packages/hooks/package.json`
- Modify: `scripts/rollup.base.ts`

- [ ] **Step 1: Add optional peerDep to @pro/pro-components**

In `packages/pro-components/package.json`, add to peerDependencies:

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

- [ ] **Step 2: Add @pro/locale as dependency of @pro/hooks**

In `packages/hooks/package.json`, add to dependencies:

```json
{
  "dependencies": {
    "@pro/locale": "workspace:*"
  }
}
```

- [ ] **Step 3: Add vue-i18n and dayjs to Rollup externals**

In `scripts/rollup.base.ts`, update the externals array:

```ts
const EXTERNAL_DEPS = [
  'vue',
  'vue-i18n',
  'element-plus',
  'dayjs',
  'dayjs/plugin/relativeTime',
  'dayjs/locale/zh-cn',
  /^element-plus\//,
  /^@pro\//,
]

// In UMD output config, add globals:
const UMD_GLOBALS: Record<string, string> = {
  'vue': 'Vue',
  'vue-i18n': 'VueI18n',
  'element-plus': 'ElementPlus',
  'dayjs': 'dayjs',
}
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install`
Expected: lockfile updated, no errors

- [ ] **Step 5: Commit**

```bash
git add packages/pro-components/package.json packages/hooks/package.json scripts/rollup.base.ts pnpm-lock.yaml
git commit -m "chore(build): add vue-i18n optional peer dep and locale package dependency"
```

---

## Phase 2: Core i18n Utilities (augments Plan 2a)

### Task 4: Implement resolveMessage Utility

**Files:**
- Create: `packages/hooks/src/resolve-message.ts`
- Create: `packages/hooks/src/resolve-message.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/hooks/src/resolve-message.test.ts
import { describe, expect, it } from 'vitest'
import { resolveMessage } from './resolve-message'

const messages = {
  pro: {
    table: {
      empty: 'No Data',
      pagination: {
        showing: 'Showing {start}\u2013{end} of {total}',
      },
    },
  },
}

describe('resolveMessage', () => {
  it('resolves nested key', () => {
    expect(resolveMessage(messages, 'pro.table.empty')).toBe('No Data')
  })

  it('resolves deeply nested key', () => {
    expect(resolveMessage(messages, 'pro.table.pagination.showing')).toBe(
      'Showing {start}\u2013{end} of {total}',
    )
  })

  it('returns key when not found', () => {
    expect(resolveMessage(messages, 'pro.table.nonexistent')).toBe('pro.table.nonexistent')
  })

  it('interpolates params', () => {
    expect(
      resolveMessage(messages, 'pro.table.pagination.showing', {
        start: 1,
        end: 20,
        total: 128,
      }),
    ).toBe('Showing 1\u201320 of 128')
  })

  it('preserves unmatched param placeholders', () => {
    expect(
      resolveMessage(messages, 'pro.table.pagination.showing', { start: 1 }),
    ).toBe('Showing 1\u2013{end} of {total}')
  })

  it('returns empty string for empty key', () => {
    expect(resolveMessage(messages, '')).toBe('')
  })

  it('returns key when messages is null-ish', () => {
    expect(resolveMessage(null as unknown as Record<string, unknown>, 'any.key')).toBe('any.key')
    expect(resolveMessage(undefined as unknown as Record<string, unknown>, 'any.key')).toBe('any.key')
  })

  it('returns key when value is not a string', () => {
    expect(resolveMessage(messages, 'pro.table')).toBe('pro.table')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/hooks && pnpm vitest run src/resolve-message.test.ts`
Expected: FAIL — cannot find module './resolve-message'

- [ ] **Step 3: Implement resolveMessage**

```ts
// packages/hooks/src/resolve-message.ts

export function resolveMessage(
  messages: Record<string, unknown>,
  key: string,
  params?: Record<string, string | number>,
): string {
  if (!key) return ''
  if (!messages) return key

  const value = key.split('.').reduce<unknown>(
    (obj, k) => (obj as Record<string, unknown>)?.[k],
    messages,
  )

  if (typeof value !== 'string') return key
  if (!params) return value

  return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/hooks && pnpm vitest run src/resolve-message.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/hooks/src/resolve-message.ts packages/hooks/src/resolve-message.test.ts
git commit -m "feat(hooks): add resolveMessage i18n fallback utility"
```

---

### Task 5: Implement useProLocale Composable

**Files:**
- Modify: `packages/hooks/src/constants.ts`
- Create: `packages/hooks/src/use-pro-locale.ts`
- Create: `packages/hooks/src/use-pro-locale.test.ts`
- Modify: `packages/hooks/src/index.ts`

- [ ] **Step 1: Add PRO_LOCALE_KEY to constants**

In `packages/hooks/src/constants.ts`, add:

```ts
import type { InjectionKey } from 'vue'
import type { ProLocaleContext } from './use-pro-locale'

export const PRO_LOCALE_KEY: InjectionKey<ProLocaleContext> = Symbol('pro-locale')
```

- [ ] **Step 2: Write failing tests**

```ts
// packages/hooks/src/use-pro-locale.test.ts
import { computed, defineComponent, h, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useProLocale } from './use-pro-locale'
import { PRO_LOCALE_KEY } from './constants'
import type { ProLocaleContext } from './use-pro-locale'

describe('useProLocale', () => {
  it('returns fallback en-US when no provider', () => {
    let result: ProLocaleContext | undefined

    const Comp = defineComponent({
      setup() {
        result = useProLocale()
        return () => h('div')
      },
    })

    mount(Comp)

    expect(result).toBeDefined()
    expect(result!.locale.value).toBe('en-US')
    expect(result!.t('pro.table.empty')).toBe('No Data')
  })

  it('returns injected context when provider exists', () => {
    let result: ProLocaleContext | undefined

    const mockCtx: ProLocaleContext = {
      t: (key) => `mock:${key}`,
      locale: computed(() => 'zh-CN'),
    }

    const Child = defineComponent({
      setup() {
        result = useProLocale()
        return () => h('div')
      },
    })

    const Parent = defineComponent({
      setup() {
        provide(PRO_LOCALE_KEY, mockCtx)
        return () => h(Child)
      },
    })

    mount(Parent)

    expect(result!.locale.value).toBe('zh-CN')
    expect(result!.t('pro.table.empty')).toBe('mock:pro.table.empty')
  })

  it('warns in dev mode when no provider', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const Comp = defineComponent({
      setup() {
        useProLocale()
        return () => h('div')
      },
    })

    mount(Comp)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProComponents]'),
    )

    warnSpy.mockRestore()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd packages/hooks && pnpm vitest run src/use-pro-locale.test.ts`
Expected: FAIL — cannot find module './use-pro-locale'

- [ ] **Step 4: Implement useProLocale**

```ts
// packages/hooks/src/use-pro-locale.ts

import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'
import type { ProLocaleKey } from '@pro/locale'
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
      '[ProComponents] useProLocale() called without <ProConfigProvider>. '
      + 'Falling back to en-US defaults. Wrap your app with <ProConfigProvider> for full i18n support.',
    )
  }

  return ctx ?? {
    t: (key, params) => resolveMessage(enUS as unknown as Record<string, unknown>, key, params),
    locale: computed(() => 'en-US'),
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/hooks && pnpm vitest run src/use-pro-locale.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 6: Export from @pro/hooks index**

In `packages/hooks/src/index.ts`, add:

```ts
export { useProLocale } from './use-pro-locale'
export type { ProLocaleContext } from './use-pro-locale'
export { resolveMessage } from './resolve-message'
export { PRO_LOCALE_KEY } from './constants'
```

- [ ] **Step 7: Verify build**

Run: `cd packages/hooks && pnpm build && pnpm type-check`
Expected: Build succeeds, no type errors

- [ ] **Step 8: Commit**

```bash
git add packages/hooks/src/constants.ts packages/hooks/src/use-pro-locale.ts packages/hooks/src/use-pro-locale.test.ts packages/hooks/src/index.ts
git commit -m "feat(hooks): add useProLocale composable with fallback support"
```

---

### Task 6: Add Locale-Aware Formatting to useValueType

**Files:**
- Modify: `packages/hooks/src/use-value-type.ts`
- Create: `packages/hooks/src/formatters.ts`
- Create: `packages/hooks/src/formatters.test.ts`

- [ ] **Step 1: Write failing tests for formatters**

```ts
// packages/hooks/src/formatters.test.ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { formatDate, formatRelativeTime, formatNumber, formatMoney, formatPercent } from './formatters'

dayjs.extend(relativeTime)

describe('formatDate', () => {
  it('formats date in en-US', () => {
    expect(formatDate('2026-03-15', 'date', 'en-US')).toBe('03/15/2026')
  })

  it('formats date in zh-CN', () => {
    expect(formatDate('2026-03-15', 'date', 'zh-CN')).toBe('2026-03-15')
  })

  it('formats dateTime in en-US', () => {
    const result = formatDate('2026-03-15T14:30:00', 'dateTime', 'en-US')
    expect(result).toBe('03/15/2026 2:30:00 PM')
  })

  it('formats dateTime in zh-CN', () => {
    const result = formatDate('2026-03-15T14:30:00', 'dateTime', 'zh-CN')
    expect(result).toBe('2026-03-15 14:30:00')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => { dayjs.locale('en') })
  afterEach(() => { dayjs.locale('en') })

  it('returns relative time in English', () => {
    const twoHoursAgo = dayjs().subtract(2, 'hour').toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('returns relative time in Chinese when dayjs locale is zh-cn', () => {
    dayjs.locale('zh-cn')
    const twoHoursAgo = dayjs().subtract(2, 'hour').toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 小时前')
  })
})

describe('formatNumber', () => {
  it('formats with locale grouping', () => {
    expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
  })
})

describe('formatMoney', () => {
  it('formats USD by default for en-US', () => {
    expect(formatMoney(1234.5, 'en-US')).toBe('$1,234.50')
  })

  it('formats CNY by default for zh-CN', () => {
    const result = formatMoney(1234.5, 'zh-CN')
    expect(result).toContain('1,234.50')
  })

  it('allows custom currency', () => {
    expect(formatMoney(1234.5, 'en-US', 'EUR')).toContain('1,234.50')
  })
})

describe('formatPercent', () => {
  it('formats as percentage', () => {
    expect(formatPercent(0.856, 'en-US')).toBe('85.6%')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/hooks && pnpm vitest run src/formatters.test.ts`
Expected: FAIL — cannot find module './formatters'

- [ ] **Step 3: Implement formatters**

```ts
// packages/hooks/src/formatters.ts

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

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatMoney(
  value: number,
  locale: string,
  currency?: string,
): string {
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/hooks && pnpm vitest run src/formatters.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Wire formatters into useValueType**

In `packages/hooks/src/use-value-type.ts`, import and use the locale-aware formatters. Replace any hardcoded `toLocaleString('en-US')` calls:

```ts
// At top of file
import { useProLocale } from './use-pro-locale'
import { formatDate, formatRelativeTime, formatNumber, formatMoney, formatPercent } from './formatters'

// Inside useValueType composable
const { locale } = useProLocale()

// In the render/format logic, replace hardcoded formatting:
// BEFORE: value.toLocaleString('en-US')
// AFTER:
function renderValue(value: unknown, valueType: ValueType): string {
  switch (valueType) {
    case 'date':
    case 'dateTime':
      return formatDate(value as Date | string | number, valueType, locale.value)
    case 'money':
      return formatMoney(value as number, locale.value)
    case 'percent':
      return formatPercent(value as number, locale.value)
    case 'number':
      return formatNumber(value as number, locale.value)
    default:
      return String(value ?? '')
  }
}
```

- [ ] **Step 6: Run all hooks tests**

Run: `cd packages/hooks && pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add packages/hooks/src/formatters.ts packages/hooks/src/formatters.test.ts packages/hooks/src/use-value-type.ts
git commit -m "feat(hooks): add locale-aware date/number/currency formatters"
```

---

### Task 7: Implement ProConfigProvider Locale Logic

**Files:**
- Modify: `packages/pro-components/src/pro-config-provider.vue`
- Modify: `packages/hooks/src/types.ts`

- [ ] **Step 1: Add I18nLike type**

In `packages/hooks/src/types.ts`, add:

```ts
export interface I18nLike {
  global: {
    locale: { value: string }
    t: (key: string, params?: Record<string, unknown>) => string
    mergeLocaleMessage: (locale: string, messages: Record<string, unknown>) => void
  }
}
```

- [ ] **Step 2: Implement ProConfigProvider locale setup**

Update `packages/pro-components/src/pro-config-provider.vue`:

```vue
<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, provide, watch } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { enUS, zhCN } from '@pro/locale'
import { PRO_LOCALE_KEY, resolveMessage } from '@pro/hooks'
import type { I18nLike } from '@pro/hooks'
import type { ProLocaleContext } from '@pro/hooks'

interface Props {
  locale?: string
  density?: 'compact' | 'default' | 'relaxed'
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-US',
  density: 'default',
  theme: 'light',
})

const currentLocale = computed(() => props.locale)
const messages = computed<Record<string, unknown>>(
  () => currentLocale.value === 'zh-CN' ? zhCN as unknown as Record<string, unknown> : enUS as unknown as Record<string, unknown>,
)

// --- Element Plus locale map ---
const EL_LOCALE_MAP = { 'zh-CN': zhCn, 'en-US': en } as const
const elLocale = computed(() => EL_LOCALE_MAP[currentLocale.value as keyof typeof EL_LOCALE_MAP] ?? en)

// --- vue-i18n detection (optional peer dependency) ---
let i18n: I18nLike | null = null
try {
  const instance = getCurrentInstance()
  i18n = (instance?.appContext.config.globalProperties.$i18n as I18nLike) ?? null
} catch {
  i18n = null
}

// --- Mount: merge all locale messages once (idempotent) ---
if (i18n) {
  onMounted(() => {
    i18n!.global.mergeLocaleMessage('en-US', enUS as unknown as Record<string, unknown>)
    i18n!.global.mergeLocaleMessage('zh-CN', zhCN as unknown as Record<string, unknown>)
  })
}

// --- Watch locale changes: sync vue-i18n, dayjs ---
watch(currentLocale, (loc) => {
  if (i18n) {
    i18n.global.locale.value = loc
  }
  dayjs.locale(loc === 'zh-CN' ? 'zh-cn' : 'en')
}, { immediate: true })

// --- Provide locale context ---
const t: ProLocaleContext['t'] = i18n
  ? (key, params) => i18n!.global.t(key, (params ?? {}) as Record<string, unknown>)
  : (key, params) => resolveMessage(messages.value, key, params)

provide(PRO_LOCALE_KEY, {
  t,
  locale: currentLocale,
})
</script>

<template>
  <ElConfigProvider :locale="elLocale">
    <slot />
  </ElConfigProvider>
</template>
```

- [ ] **Step 3: Verify type-check and build**

Run: `cd packages/pro-components && pnpm type-check && pnpm build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/pro-components/src/pro-config-provider.vue packages/hooks/src/types.ts
git commit -m "feat(pro-components): add locale detection and sync to ProConfigProvider"
```

---

### Task 8: Wire ProTable Internal Text to t() Calls

**Files:**
- Modify: `packages/pro-table/src/components/QueryFilter.vue`
- Modify: `packages/pro-table/src/components/Toolbar.vue`
- Modify: `packages/pro-table/src/components/ColumnSetting.vue`
- Modify: `packages/pro-table/src/ProTable.vue`

- [ ] **Step 1: Update QueryFilter buttons**

In `packages/pro-table/src/components/QueryFilter.vue`, replace hardcoded strings:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <!-- Replace hardcoded button text -->
  <!-- BEFORE: <el-button type="primary">Search</el-button> -->
  <!-- AFTER: -->
  <el-button type="primary">{{ t('pro.table.queryFilter.search') }}</el-button>
  <el-button>{{ t('pro.table.queryFilter.reset') }}</el-button>
  <el-button type="text">
    {{ isExpanded ? t('pro.table.queryFilter.collapse') : t('pro.table.queryFilter.expand') }}
  </el-button>
</template>
```

- [ ] **Step 2: Update Toolbar density labels**

In `packages/pro-table/src/components/Toolbar.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()

const densityOptions = computed(() => [
  { label: t('pro.table.density.compact'), value: 'compact' },
  { label: t('pro.table.density.default'), value: 'default' },
  { label: t('pro.table.density.relaxed'), value: 'relaxed' },
])
</script>
```

- [ ] **Step 3: Update ColumnSetting labels**

In `packages/pro-table/src/components/ColumnSetting.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <div class="pro-column-setting">
    <div class="pro-column-setting__header">{{ t('pro.table.columnSetting.title') }}</div>
    <!-- Pin actions use: t('pro.table.columnSetting.pinLeft'), etc. -->
  </div>
</template>
```

- [ ] **Step 4: Update ProTable empty and loading states**

In `packages/pro-table/src/ProTable.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <!-- Empty state -->
  <template #empty>
    <slot name="empty">{{ t('pro.table.empty') }}</slot>
  </template>

  <!-- Pagination showing text -->
  <span class="pro-table__pagination-info">
    {{ t('pro.table.pagination.showing', { start, end, total }) }}
  </span>
</template>
```

- [ ] **Step 5: Verify build**

Run: `cd packages/pro-table && pnpm type-check && pnpm build`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/pro-table/src/
git commit -m "feat(table): wire all internal text to i18n t() calls"
```

---

### Task 9: Wire ProForm and ProDescriptions to t() Calls

**Files:**
- Modify: `packages/pro-form/src/ProForm.vue`
- Modify: `packages/pro-form/src/components/StepsForm.vue`
- Modify: `packages/pro-descriptions/src/ProDescriptions.vue`

- [ ] **Step 1: Update ProForm button defaults**

In `packages/pro-form/src/ProForm.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <el-button type="primary" @click="handleSubmit">
    {{ props.submitText ?? t('pro.form.submit') }}
  </el-button>
  <el-button @click="handleReset">
    {{ props.resetText ?? t('pro.form.reset') }}
  </el-button>
</template>
```

- [ ] **Step 2: Update StepsForm navigation**

In `packages/pro-form/src/components/StepsForm.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <el-button @click="handlePrev" :disabled="currentStep === 0">
    {{ t('pro.form.steps.prev') }}
  </el-button>
  <el-button type="primary" @click="handleNext">
    {{ isLastStep ? t('pro.form.steps.submit') : t('pro.form.steps.next') }}
  </el-button>
  <span :aria-label="t('pro.form.steps.stepOf', { current: currentStep + 1, total: steps.length })">
    {{ t('pro.form.steps.stepOf', { current: currentStep + 1, total: steps.length }) }}
  </span>
</template>
```

- [ ] **Step 3: Update ProDescriptions empty state**

In `packages/pro-descriptions/src/ProDescriptions.vue`:

```vue
<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

const { t } = useProLocale()
</script>

<template>
  <!-- Empty value display -->
  <span v-if="value == null" class="pro-descriptions__empty">
    {{ t('pro.descriptions.empty') }}
  </span>
</template>
```

- [ ] **Step 4: Verify build for both packages**

Run: `cd packages/pro-form && pnpm type-check && pnpm build && cd ../pro-descriptions && pnpm type-check && pnpm build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/pro-form/src/ packages/pro-descriptions/src/
git commit -m "feat(form,descriptions): wire all internal text to i18n t() calls"
```

---

### Task 10: Platform Dashboard vue-i18n Setup (augments Plan 5b)

**Files:**
- Create: `platform/web/src/locale/en-US.ts`
- Create: `platform/web/src/locale/zh-CN.ts`
- Create: `platform/web/src/locale/index.ts`
- Modify: `platform/web/src/main.ts`
- Modify: `platform/web/package.json`

- [ ] **Step 1: Add vue-i18n dependency to dashboard**

In `platform/web/package.json`, add:

```json
{
  "dependencies": {
    "vue-i18n": "^11.0.0",
    "@pro/locale": "workspace:*"
  }
}
```

Run: `pnpm install`

- [ ] **Step 2: Create dashboard en-US messages**

```ts
// platform/web/src/locale/en-US.ts

export const enUS = {
  dashboard: {
    nav: {
      home: 'Dashboard',
      versions: 'Version Management',
      grayscale: 'Grayscale Rules',
      compatibility: 'Compatibility Matrix',
      settings: 'Settings',
    },
    stats: {
      totalPackages: 'Total Packages',
      activeVersions: 'Active Versions',
      recentReleases: 'Recent Releases',
      compatibilityIssues: 'Compatibility Issues',
    },
    table: {
      package: 'Package',
      version: 'Version',
      status: 'Status',
      published: 'Published',
      actions: 'Actions',
      ruleType: 'Rule Type',
      coverage: 'Coverage',
      targetVersion: 'Target Version',
    },
    status: {
      active: 'Active',
      grayscale: 'Grayscale',
      deprecated: 'Deprecated',
      yanked: 'Yanked',
      uploading: 'Uploading',
      propagating: 'Propagating',
      verifying: 'Verifying',
      failed: 'Failed',
    },
    actions: {
      publishNew: 'Publish New',
      createRule: 'Create Rule',
      saveRule: 'Save Rule',
      confirmRollback: 'Confirm Rollback',
      rollbackMessage: 'Are you sure you want to rollback to version {version}?',
      currentVersion: 'Current Active Version: {version}',
      appsAffected: 'Apps Affected: {count}',
    },
    ruleTypes: {
      userList: 'User List',
      department: 'Department',
      percentage: 'Percentage',
      composite: 'Composite',
    },
    compatibility: {
      compatible: 'Compatible',
      incompatible: 'Incompatible',
      untested: 'Untested',
      testing: 'Testing\u2026',
    },
    debug: {
      appId: 'App ID',
      userId: 'User ID (optional)',
      resolvedImportMap: 'Resolved Import Map',
      resolutionTrace: 'Resolution Trace',
      before: 'Before',
      after: 'After',
    },
  },
} as const
```

- [ ] **Step 3: Create dashboard zh-CN messages**

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
    table: {
      package: '包名',
      version: '版本',
      status: '状态',
      published: '发布时间',
      actions: '操作',
      ruleType: '规则类型',
      coverage: '覆盖率',
      targetVersion: '目标版本',
    },
    status: {
      active: '活跃',
      grayscale: '灰度中',
      deprecated: '已废弃',
      yanked: '已撤回',
      uploading: '上传中',
      propagating: '传播中',
      verifying: '校验中',
      failed: '失败',
    },
    actions: {
      publishNew: '发布新版本',
      createRule: '创建规则',
      saveRule: '保存规则',
      confirmRollback: '确认回滚',
      rollbackMessage: '确定要回滚到版本 {version} 吗？',
      currentVersion: '当前活跃版本：{version}',
      appsAffected: '受影响应用：{count} 个',
    },
    ruleTypes: {
      userList: '用户列表',
      department: '部门',
      percentage: '百分比',
      composite: '组合规则',
    },
    compatibility: {
      compatible: '兼容',
      incompatible: '不兼容',
      untested: '未测试',
      testing: '测试中\u2026',
    },
    debug: {
      appId: '应用 ID',
      userId: '用户 ID（可选）',
      resolvedImportMap: '解析后的 Import Map',
      resolutionTrace: '解析链路',
      before: '变更前',
      after: '变更后',
    },
  },
} as const
```

- [ ] **Step 4: Create locale index**

```ts
// platform/web/src/locale/index.ts

export { enUS } from './en-US'
export { zhCN } from './zh-CN'
```

- [ ] **Step 5: Set up vue-i18n in main.ts**

In `platform/web/src/main.ts`, add before `app.mount()`:

```ts
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

- [ ] **Step 6: Verify dashboard builds**

Run: `cd platform/web && pnpm build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add platform/web/src/locale/ platform/web/src/main.ts platform/web/package.json pnpm-lock.yaml
git commit -m "feat(platform-web): add vue-i18n setup with zh-CN and en-US messages"
```

---

## Phase 3: Docs & CDN (augments Plans 3 & 4)

### Task 11: VitePress i18n Configuration (augments Plan 3)

**Files:**
- Modify: `docs/.vitepress/config.ts`
- Create: `docs/en/guide/i18n.md`
- Create: `docs/zh/guide/i18n.md`
- Create: `docs/en/api/locale.md`
- Create: `docs/zh/api/locale.md`

- [ ] **Step 1: Update VitePress config with locales**

In `docs/.vitepress/config.ts`, add locales config:

```ts
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
          '/en/guide/': [
            { text: 'Getting Started', link: '/en/guide/getting-started' },
            { text: 'CDN Mode', link: '/en/guide/cdn-mode' },
            { text: 'Internationalization', link: '/en/guide/i18n' },
          ],
          '/en/components/': [
            { text: 'ProTable', link: '/en/components/pro-table' },
            { text: 'ProForm', link: '/en/components/pro-form' },
            { text: 'ProDescriptions', link: '/en/components/pro-descriptions' },
          ],
          '/en/api/': [
            { text: 'Locale', link: '/en/api/locale' },
          ],
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
          '/zh/guide/': [
            { text: '快速开始', link: '/zh/guide/getting-started' },
            { text: 'CDN 模式', link: '/zh/guide/cdn-mode' },
            { text: '国际化', link: '/zh/guide/i18n' },
          ],
          '/zh/components/': [
            { text: 'ProTable', link: '/zh/components/pro-table' },
            { text: 'ProForm', link: '/zh/components/pro-form' },
            { text: 'ProDescriptions', link: '/zh/components/pro-descriptions' },
          ],
          '/zh/api/': [
            { text: 'Locale', link: '/zh/api/locale' },
          ],
        },
      },
    },
  },
})
```

- [ ] **Step 2: Create English i18n guide**

```md
<!-- docs/en/guide/i18n.md -->
# Internationalization

Pro Components supports **zh-CN** and **en-US** out of the box.

## Basic Usage

Wrap your app with `ProConfigProvider` and set the `locale` prop:

\`\`\`vue
<template>
  <ProConfigProvider locale="zh-CN">
    <App />
  </ProConfigProvider>
</template>
\`\`\`

This single prop synchronizes three systems:
- Pro Components internal text
- Element Plus component text (DatePicker, Pagination, etc.)
- dayjs date formatting locale

## With vue-i18n (recommended)

If your app uses vue-i18n, Pro Components automatically detects it and merges its messages into the global scope:

\`\`\`ts
import { createI18n } from 'vue-i18n'
import { enUS, zhCN } from '@pro/locale'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'en-US': { ...enUS, ...yourAppMessages },
    'zh-CN': { ...zhCN, ...yourAppMessages },
  },
})

app.use(i18n)
\`\`\`

### Benefits with vue-i18n
- Consumer message overrides via `mergeLocaleMessage()`
- Pluralization support
- `<i18n-t>` component for complex interpolation

## Without vue-i18n

Components work without vue-i18n using a built-in fallback translator. All basic translation and template interpolation works. You do not need to install vue-i18n if you only need simple locale support.

## Overriding Messages

With vue-i18n, you can override any Pro Components message:

\`\`\`ts
i18n.global.mergeLocaleMessage('en-US', {
  pro: {
    table: {
      empty: 'Nothing here yet!',
    },
  },
})
\`\`\`

## Message Keys

All Pro Components messages are under the `pro.` namespace. See the [Locale API](/en/api/locale) for the complete key list.
```

- [ ] **Step 3: Create Chinese i18n guide**

```md
<!-- docs/zh/guide/i18n.md -->
# 国际化

Pro Components 开箱支持 **简体中文** 和 **English** 两种语言。

## 基础用法

用 `ProConfigProvider` 包裹应用，设置 `locale` prop：

\`\`\`vue
<template>
  <ProConfigProvider locale="zh-CN">
    <App />
  </ProConfigProvider>
</template>
\`\`\`

一个 prop 同步三套系统：
- Pro Components 内部文案
- Element Plus 组件文案（DatePicker、Pagination 等）
- dayjs 日期格式化 locale

## 配合 vue-i18n（推荐）

如果你的应用使用 vue-i18n，Pro Components 会自动检测并将消息合并到 global scope：

\`\`\`ts
import { createI18n } from 'vue-i18n'
import { enUS, zhCN } from '@pro/locale'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'en-US': { ...enUS, ...yourAppMessages },
    'zh-CN': { ...zhCN, ...yourAppMessages },
  },
})

app.use(i18n)
\`\`\`

### vue-i18n 模式额外能力
- 通过 `mergeLocaleMessage()` 覆盖组件库默认文案
- 复数（pluralization）支持
- `<i18n-t>` 组件实现复杂插值

## 不使用 vue-i18n

组件库内置了 fallback 翻译器，无需安装 vue-i18n 即可正常工作。基础翻译和模板插值功能完整可用。

## 覆盖默认文案

配合 vue-i18n，你可以覆盖任何 Pro Components 的默认文案：

\`\`\`ts
i18n.global.mergeLocaleMessage('zh-CN', {
  pro: {
    table: {
      empty: '这里什么都没有~',
    },
  },
})
\`\`\`

## 消息 Key 列表

所有 Pro Components 消息都在 `pro.` 命名空间下。完整 key 列表见 [Locale API](/zh/api/locale)。
```

- [ ] **Step 4: Create locale API reference (en + zh)**

Create `docs/en/api/locale.md` and `docs/zh/api/locale.md` documenting all message keys, the ProLocaleKey type, and the useProLocale composable API.

- [ ] **Step 5: Verify docs build**

Run: `cd docs && pnpm build`
Expected: VitePress builds successfully with both locales

- [ ] **Step 6: Commit**

```bash
git add docs/
git commit -m "docs(guide): add i18n guide and locale API reference (en + zh)"
```

---

### Task 12: Update CDN Import Map for vue-i18n (augments Plan 4)

**Files:**
- Modify: `cdn/loader/src/pro-loader.ts`
- Modify: `cdn/build/import-map-template.json` (or equivalent)

- [ ] **Step 1: Add vue-i18n to import map template**

In the import map template/generator, add vue-i18n entry:

```json
{
  "imports": {
    "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.runtime.esm-browser.prod.js",
    "vue-i18n": "https://cdn.jsdelivr.net/npm/vue-i18n@11/dist/vue-i18n.runtime.esm-browser.prod.js",
    "element-plus": "https://cdn.jsdelivr.net/npm/element-plus/dist/index.full.min.mjs",
    "element-plus/": "https://cdn.jsdelivr.net/npm/element-plus/"
  }
}
```

- [ ] **Step 2: Update CDN loader to handle vue-i18n as optional**

In `cdn/loader/src/pro-loader.ts`, ensure vue-i18n is included in the import map but handled gracefully if the CDN is unavailable (since vue-i18n is optional):

```ts
// In the import map construction logic, add vue-i18n alongside other dependencies
const OPTIONAL_DEPS = ['vue-i18n'] as const

// When building the final import map, include vue-i18n
// The component library's fallback handles the case where vue-i18n fails to load
```

- [ ] **Step 3: Verify CDN build**

Run: `cd cdn && pnpm build`
Expected: Build succeeds, import map includes vue-i18n

- [ ] **Step 4: Commit**

```bash
git add cdn/
git commit -m "feat(loader): add vue-i18n to CDN import map"
```

---

### Task 13: Update Rollup Externals Globally

**Files:**
- Modify: `scripts/rollup.base.ts`

- [ ] **Step 1: Verify Rollup base config has all externals**

Ensure `scripts/rollup.base.ts` includes these in the externals (may have been partially done in Task 3):

```ts
const EXTERNAL_DEPS = [
  'vue',
  'vue-i18n',
  'element-plus',
  'dayjs',
  'dayjs/plugin/relativeTime',
  'dayjs/locale/zh-cn',
  /^element-plus\//,
  /^@pro\//,
]

const UMD_GLOBALS: Record<string, string> = {
  'vue': 'Vue',
  'vue-i18n': 'VueI18n',
  'element-plus': 'ElementPlus',
  'dayjs': 'dayjs',
}
```

- [ ] **Step 2: Run full monorepo build**

Run: `pnpm build`
Expected: All packages build successfully

- [ ] **Step 3: Commit (if changes needed)**

```bash
git add scripts/rollup.base.ts
git commit -m "chore(build): ensure vue-i18n and dayjs in Rollup externals"
```

---

## Standalone: Planning Docs Translation

### Task 14: Translate Planning Docs to Chinese

**Files:**
- Create: 13 new `-zh.md` files (see list below)

This task can run in parallel with any phase. It is purely documentation work with no code dependencies.

- [ ] **Step 1: Translate design specs**

Create Chinese versions of:
- `docs/superpowers/specs/2026-03-31-pro-components-design-zh.md`
- `docs/superpowers/specs/2026-03-31-pro-components-ui-design-zh.md`
- `docs/superpowers/specs/2026-03-31-pro-components-i18n-design-zh.md`

Translation rules:
- Code blocks: keep English
- File paths: keep English
- Variable names: keep English
- Technical terms: keep English (composable, provide/inject, tree-shake, etc.)
- Table structure preserved, translate description columns
- First occurrence of key technical terms: English + Chinese explanation in parentheses

- [ ] **Step 2: Translate implementation plans**

Create Chinese versions of:
- `docs/superpowers/plans/2026-03-31-plan-1-monorepo-foundation-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-2a-hooks-and-protable-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-2b-proform-and-prodescriptions-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-3-documentation-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-4-cdn-distribution-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-5a-platform-api-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-5b-platform-dashboard-zh.md`
- `docs/superpowers/plans/2026-03-31-plan-6-cicd-pipeline-zh.md`

- [ ] **Step 3: Translate orchestration docs**

Create Chinese versions of:
- `docs/superpowers/plans/agent-orchestration-zh.md`
- `docs/superpowers/plans/supervisor-agent-zh.md`

- [ ] **Step 4: Commit all translations**

```bash
git add docs/superpowers/specs/*-zh.md docs/superpowers/plans/*-zh.md
git commit -m "docs: add Chinese translations for all specs and plans"
```

---

## Validation Checklist

After all tasks are complete, run this full verification:

```bash
# Type-check entire monorepo
pnpm type-check

# Lint
pnpm lint

# Full build
pnpm build

# All tests
pnpm test

# VitePress docs build
cd docs && pnpm build

# Platform dashboard build
cd platform/web && pnpm build
```

All commands must pass with zero errors before considering i18n implementation complete.
