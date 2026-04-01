# Base Components Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete enterprise SaaS component library with 32 independently-published packages that wrap Element Plus with shadcn-vue styling and preserve full Element Plus API.

**Architecture:** Two-tier component system — Base Layer (thin wrappers with enterprise defaults, no `Pro` prefix) + Pro Layer (functionally enhanced components with `Pro` prefix). Each component is its own `@pro/<name>` npm package. Styles live in `@pro/themes` (shared design tokens + global overrides). Base wrappers use `defineComponent` + `h()` render function pattern for clean passthrough. Pro components use SFC `.vue` files.

**Tech Stack:** Vue 3.4+, Element Plus 2.9+, TypeScript, Rollup 4, Turborepo, pnpm workspace

---

## Component Registry

### Base Wrappers (no Pro prefix) — 26 packages

| Package              | Export                                    | Element Plus                                    | Default Overrides                                                                 |
| -------------------- | ----------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `@pro/input`         | `Input`                                   | `ElInput`                                       | `clearable: true`                                                                 |
| `@pro/input-number`  | `InputNumber`                             | `ElInputNumber`                                 | `controlsPosition: 'right'`                                                       |
| `@pro/select`        | `Select`                                  | `ElSelect`                                      | `clearable: true, filterable: true`                                               |
| `@pro/cascader`      | `Cascader`                                | `ElCascader`                                    | `clearable: true, filterable: true`                                               |
| `@pro/tree-select`   | `TreeSelect`                              | `ElTreeSelect`                                  | `clearable: true, filterable: true`                                               |
| `@pro/date-picker`   | `DatePicker`                              | `ElDatePicker`                                  | `clearable: true, valueFormat: 'YYYY-MM-DD'`                                      |
| `@pro/time-picker`   | `TimePicker`                              | `ElTimePicker`                                  | `clearable: true`                                                                 |
| `@pro/switch`        | `Switch`                                  | `ElSwitch`                                      | —                                                                                 |
| `@pro/radio`         | `Radio, RadioGroup, RadioButton`          | `ElRadio, ElRadioGroup, ElRadioButton`          | —                                                                                 |
| `@pro/checkbox`      | `Checkbox, CheckboxGroup, CheckboxButton` | `ElCheckbox, ElCheckboxGroup, ElCheckboxButton` | —                                                                                 |
| `@pro/rate`          | `Rate`                                    | `ElRate`                                        | —                                                                                 |
| `@pro/slider`        | `Slider`                                  | `ElSlider`                                      | —                                                                                 |
| `@pro/upload`        | `Upload`                                  | `ElUpload`                                      | —                                                                                 |
| `@pro/color-picker`  | `ColorPicker`                             | `ElColorPicker`                                 | —                                                                                 |
| `@pro/auto-complete` | `AutoComplete`                            | `ElAutocomplete`                                | —                                                                                 |
| `@pro/dialog`        | `Dialog`                                  | `ElDialog`                                      | `appendToBody: true, draggable: true`                                             |
| `@pro/drawer`        | `Drawer`                                  | `ElDrawer`                                      | `appendToBody: true`                                                              |
| `@pro/popover`       | `Popover`                                 | `ElPopover`                                     | —                                                                                 |
| `@pro/tooltip`       | `Tooltip`                                 | `ElTooltip`                                     | `showAfter: 300`                                                                  |
| `@pro/popconfirm`    | `Popconfirm`                              | `ElPopconfirm`                                  | —                                                                                 |
| `@pro/badge`         | `Badge`                                   | `ElBadge`                                       | —                                                                                 |
| `@pro/statistic`     | `Statistic`                               | `ElStatistic`                                   | —                                                                                 |
| `@pro/pagination`    | `Pagination`                              | `ElPagination`                                  | `layout: 'total, sizes, prev, pager, next, jumper', pageSizes: [10, 20, 50, 100]` |
| `@pro/breadcrumb`    | `Breadcrumb, BreadcrumbItem`              | `ElBreadcrumb, ElBreadcrumbItem`                | `separator: '/'`                                                                  |
| `@pro/steps`         | `Steps, Step`                             | `ElSteps, ElStep`                               | —                                                                                 |
| `@pro/divider`       | `Divider`                                 | `ElDivider`                                     | —                                                                                 |

### Pro Components (functional enhancements) — 6 packages

| Package        | Export       | Base       | Enhancement                                                                                         |
| -------------- | ------------ | ---------- | --------------------------------------------------------------------------------------------------- |
| `@pro/loading` | `ProLoading` | Custom     | State machine: loading/empty/error/success with slots                                               |
| `@pro/tag`     | `ProTag`     | `ElTag`    | Preset color palette, status mapping, closable confirm                                              |
| `@pro/empty`   | `ProEmpty`   | `ElEmpty`  | Preset types (no-data/no-result/error/no-permission), action slot                                   |
| `@pro/result`  | `ProResult`  | `ElResult` | Preset types (success/error/warning/info/403/404/500), action slot                                  |
| `@pro/tree`    | `ProTree`    | `ElTree`   | Search/filter, expand/collapse, selected highlight, count badge (shadcn style from metrics project) |
| `@pro/tabs`    | `ProTabs`    | `ElTabs`   | Route integration, closable with confirm, card variant                                              |

---

## Wrapper Pattern

### Base wrapper (`.ts` render function)

```ts
// packages/<name>/src/<name>.ts
import { defineComponent, h, mergeProps } from 'vue'
import { El<Name> } from 'element-plus'

export const <Name> = defineComponent({
  name: '<Name>',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    // mergeProps: defaults first, attrs second (user overrides defaults)
    return () => h(El<Name>, mergeProps({ /* enterprise defaults */ }, attrs), slots)
  },
})
```

### Index barrel

```ts
// packages/<name>/src/index.ts
export { <Name> } from './<name>'
// Re-export Element Plus types for consumers
export type { <Name>Props, <Name>Emits, <Name>Instance } from 'element-plus'
```

### Pro component (`.vue` SFC)

Pro components use `<script setup>` with full template, own styles importing theme tokens.

---

## File Structure

Each package follows identical structure:

```
packages/<name>/
  package.json
  tsconfig.json
  rollup.config.ts
  src/
    <name>.ts          (base wrapper) or <Name>.vue (Pro component)
    index.ts           (barrel export)
```

---

## Task 1: Scaffolding Infrastructure

**Files:**

- Create: `scripts/scaffold-component.ts`

- [ ] **Step 1:** Create scaffold script that generates a complete package from a config

- [ ] **Step 2:** Run scaffold for all 32 packages

- [ ] **Step 3:** Update `pnpm-workspace.yaml` (already covers `packages/*` — verify)

- [ ] **Step 4:** Run `pnpm install` to link new packages

- [ ] **Step 5:** Commit: `chore: scaffold 32 base component packages`

---

## Task 2: Form Control Wrappers (15 packages)

**Packages:** input, input-number, select, cascader, tree-select, date-picker, time-picker, switch, radio, checkbox, rate, slider, upload, color-picker, auto-complete

- [ ] **Step 1:** Implement all 15 form control wrappers (render function pattern)

- [ ] **Step 2:** Verify each package builds: `pnpm --filter @pro/input build` (sample)

- [ ] **Step 3:** Commit: `feat: implement 15 form control wrapper packages`

---

## Task 3: Feedback Components (6 packages)

**Packages:** dialog, drawer, popover, tooltip, popconfirm, loading

- [ ] **Step 1:** Implement 5 thin wrappers (dialog, drawer, popover, tooltip, popconfirm)

- [ ] **Step 2:** Implement ProLoading state machine component (SFC)

ProLoading provides a declarative loading/empty/error state wrapper:

```vue
<ProLoading :loading="isLoading" :empty="data.length === 0" :error="error">
  <template #loading>skeleton/spinner</template>
  <template #empty>no data illustration</template>
  <template #error="{ error }">error message + retry</template>
  <slot>actual content</slot>
</ProLoading>
```

- [ ] **Step 3:** Commit: `feat: implement feedback component packages`

---

## Task 4: Display Components (6 packages)

**Packages:** tag, empty, result, badge, statistic, pagination

- [ ] **Step 1:** Implement 3 thin wrappers (badge, statistic, pagination)

- [ ] **Step 2:** Implement ProTag (preset color palette + status mapping)

- [ ] **Step 3:** Implement ProEmpty (preset types with SVG illustrations)

- [ ] **Step 4:** Implement ProResult (preset types: success/error/warning/403/404/500)

- [ ] **Step 5:** Commit: `feat: implement display component packages`

---

## Task 5: ProTree + ProTabs

- [ ] **Step 1:** Implement ProTree SFC
  - Built-in search input with debounce filtering
  - Expand/collapse all controls
  - Selected node highlight (blue bg + left border — shadcn metrics style)
  - Node count badges
  - Props: `data, searchable, defaultExpandAll, highlightCurrent`
  - Preserves all ElTree props/slots/events via passthrough

- [ ] **Step 2:** Implement ProTabs SFC
  - Closable tabs with optional confirm dialog
  - Card variant styling
  - Route integration via `v-model` + optional `router` prop
  - Preserves all ElTabs props/slots/events

- [ ] **Step 3:** Commit: `feat: implement ProTree and ProTabs enhanced components`

---

## Task 6: Layout/Navigation (3 packages)

**Packages:** breadcrumb, steps, divider

- [ ] **Step 1:** Implement 3 thin wrappers

- [ ] **Step 2:** Commit: `feat: implement layout/navigation component packages`

---

## Task 7: Integration

- [ ] **Step 1:** Migrate CONTROL_REGISTRY in `packages/hooks/src/use-value-type.ts`
  - Change imports from `element-plus` to `@pro/*` packages
  - e.g., `ElInput` → `Input` from `@pro/input`

- [ ] **Step 2:** Update `@pro/pro-components` aggregate package
  - Add all 32 new packages as dependencies
  - Re-export all components and types from `src/index.ts`
  - Update `proComponentsPlugin.install()` to register all components

- [ ] **Step 3:** Run full validation
  - `pnpm install`
  - `pnpm build`
  - `pnpm type-check`
  - `pnpm lint`

- [ ] **Step 4:** Commit: `feat: integrate base components into ecosystem`

---

## Execution Notes

- Base wrappers rely on `@pro/themes` for visual styling (no duplicate CSS)
- Pro components have their own scoped styles using theme tokens (CSS custom properties)
- ProTree visual style references: `~/Desktop/workspace/projects/metrics/metrics-platform-web/packages/client/src/components/metrics/domain-tree-sidebar.tsx`
- All packages use the shared `scripts/rollup.base.ts` build factory
- `pnpm-workspace.yaml` already includes `packages/*` glob — new packages auto-discovered
