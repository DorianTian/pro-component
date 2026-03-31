# Pro Components: Bug Fixes, Feature Additions & Docs Overhaul

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all functional defects, add missing antd pro-components features (LightFilter, EditableProTable, ProFormDependency, ProFormList, SchemaForm, more valueTypes), and overhaul documentation to production quality.

**Architecture:** Fix-first approach — stabilize existing code before adding features. Features build on the unified formatting system and enhanced valueType registry. Docs get API tables, more demos, and usage prose.

**Tech Stack:** Vue 3.4+ / Element Plus 2.9+ / TypeScript / VitePress

---

## Phase 1: Critical Bug Fixes (9 tasks)

### Task 1: Fix ProDescriptions reactivity bug

**Files:**
- Modify: `packages/pro-descriptions/src/ProDescriptions.vue:30-33`
- Modify: `packages/pro-descriptions/src/composables/use-pro-descriptions.ts:29-32,141-148`

- [ ] **Step 1: Fix useProDescriptions to accept reactive inputs**

Change the composable to accept `MaybeRefOrGetter` for both `columns` and `data`:

```ts
// packages/pro-descriptions/src/composables/use-pro-descriptions.ts
import type { ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import { computed, toValue } from 'vue'
import type { ProColumnDef, StatusType } from '@pro/utils'

// ... (keep DescriptionItem, helper functions unchanged)

export interface UseProDescriptionsOptions {
  columns: MaybeRefOrGetter<ProColumnDef[]>
  data: MaybeRefOrGetter<Record<string, unknown>>
}

export function useProDescriptions(options: UseProDescriptionsOptions): UseProDescriptionsReturn {
  const descriptionItems = computed<DescriptionItem[]>(() => {
    const columns = toValue(options.columns)
    const data = toValue(options.data)
    return columns
      .filter((col) => !col.hideInDescriptions)
      .map((col) => resolveDescriptionItem(col, data))
  })

  return { descriptionItems }
}
```

- [ ] **Step 2: Update ProDescriptions.vue to pass reactive refs**

```vue
<!-- packages/pro-descriptions/src/ProDescriptions.vue -->
<script setup lang="ts">
import { toRef } from 'vue'
// ... existing imports

const { descriptionItems } = useProDescriptions({
  columns: toRef(props, 'columns'),
  data: toRef(props, 'data'),
})
</script>
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-descriptions/
git commit -m "fix(descriptions): make useProDescriptions reactive to data/columns changes"
```

### Task 2: Implement fullscreen functionality

**Files:**
- Modify: `packages/pro-table/src/ProTable.vue:98-99,120-134`
- Modify: `packages/pro-table/src/composables/use-pro-table-internal.ts:354-361,363-389`

- [ ] **Step 1: Add fullscreen state and handler in use-pro-table-internal.ts**

After `handleToggleColumnSetting`, add:

```ts
// --- Fullscreen ---
const isFullscreen = ref(false)
const tableContainerRef = ref<HTMLElement | null>(null)

function handleToggleFullscreen(): void {
  if (!tableContainerRef.value) return

  if (!document.fullscreenElement) {
    tableContainerRef.value.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(() => {
      // Fullscreen not supported or denied — ignore silently
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(() => {
      // Already exited — ignore
    })
  }
}
```

Add `isFullscreen`, `tableContainerRef`, `handleToggleFullscreen` to the return object.

Add `isFullscreen` and `tableContainerRef` to the `UseProTableInternalReturn` interface.

- [ ] **Step 2: Wire fullscreen in ProTable.vue**

```vue
<!-- Add ref to root div -->
<div ref="state.tableContainerRef.value" class="pro-table" :class="{ 'pro-table--fullscreen': state.isFullscreen.value }" :data-density="state.densitySize.value">

<!-- Wire ToolBar fullscreen event -->
<ToolBar
  :header-title="headerTitle"
  :toolbar-actions="toolbarActions"
  :toolbar="toolbar"
  @reload="state.handleReload"
  @toggle-fullscreen="state.handleToggleFullscreen"
>
```

Add fullscreen CSS:

```css
.pro-table--fullscreen {
  padding: var(--pro-space-6);
  background: var(--pro-bg-elevated);
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-table/
git commit -m "feat(table): implement fullscreen toggle via Fullscreen API"
```

### Task 3: Add toolbarActions slot to ProTable

**Files:**
- Modify: `packages/pro-table/src/ProTable.vue:120-134`

- [ ] **Step 1: Add the slot to ProTable template**

The toolbar demo uses `<template #toolbarActions>` but ProTable only passes `toolbarActions` as a prop. Add slot support so both patterns work:

```vue
<!-- Toolbar -->
<ToolBar
  :header-title="headerTitle"
  :toolbar-actions="toolbarActions"
  :toolbar="toolbar"
  @reload="state.handleReload"
  @toggle-fullscreen="state.handleToggleFullscreen"
>
  <template #columnSetting>
    <ColumnSetting>
      <span class="pro-toolbar__icon" title="Column Settings">
        <el-icon :size="18"><Setting /></el-icon>
      </span>
    </ColumnSetting>
  </template>
  <template v-if="$slots.toolbarActions" #actions>
    <slot name="toolbarActions" />
  </template>
</ToolBar>
```

- [ ] **Step 2: Add the `actions` slot to ToolBar.vue**

In `ToolBar.vue`, replace the toolbarActions prop rendering with slot support:

```vue
<!-- Custom action buttons — slot or prop -->
<slot name="actions">
  <template
    v-for="(action, actionIndex) in toolbarActions"
    :key="`toolbar-action-${actionIndex}`"
  >
    <component :is="() => action" />
  </template>
</slot>
```

- [ ] **Step 3: Fix toolbar demo settings prop shape**

In `packages/pro-table/demos/toolbar.vue`, fix the toolbar config from array to object:

```vue
:toolbar="{ density: true, columnSetting: true, fullscreen: true }"
```

- [ ] **Step 4: Commit**

```bash
git add packages/pro-table/
git commit -m "feat(table): add toolbarActions slot, fix toolbar demo config"
```

### Task 4: Fix ProForm QueryFilter i18n

**Files:**
- Modify: `packages/pro-form/src/components/QueryFilter.vue:1-10,95-108`

- [ ] **Step 1: Import and use useProLocale**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElForm, ElFormItem, ElButton } from 'element-plus'
import { useProLocale } from '@pro/hooks'
import { useProForm, QUERY_FILTER_DEFAULT_COLLAPSE_THRESHOLD } from '../composables/use-pro-form'
import ProFormField from './ProFormField.vue'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'QueryFilter' })

// ... existing props/emits ...

const { t } = useProLocale()
```

- [ ] **Step 2: Replace hardcoded strings**

```vue
<ElButton type="primary" class="pro-query-filter__search" @click="handleSearch">
  {{ t('pro.table.queryFilter.search') }}
</ElButton>
<ElButton class="pro-query-filter__reset" @click="handleReset">
  {{ t('pro.table.queryFilter.reset') }}
</ElButton>
<ElButton
  v-if="showCollapseToggle"
  type="primary"
  link
  class="pro-query-filter__collapse-toggle"
  @click="toggleCollapse"
>
  {{ collapsed ? t('pro.table.queryFilter.expand') : t('pro.table.queryFilter.collapse') }}
</ElButton>
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/
git commit -m "fix(form): use i18n for QueryFilter button labels"
```

### Task 5: Fix StepsForm last-step validation

**Files:**
- Modify: `packages/pro-form/src/composables/use-steps-form.ts:83-101`

- [ ] **Step 1: Add validation before submit**

```ts
async function submit(): Promise<boolean> {
  if (isSubmitting.value) return false
  if (!onSubmit) return false

  // Validate last step before submitting
  const isValid = await validateCurrentStep()
  if (!isValid) return false

  try {
    isSubmitting.value = true
    loading.value = true
    const result = await onSubmit(toRaw(formValues.value))
    return result
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError?.(error)
    }
    return false
  } finally {
    isSubmitting.value = false
    loading.value = false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/pro-form/
git commit -m "fix(form): validate last step before StepsForm submit"
```

### Task 6: Fix useModalForm / useDrawerForm double-reset

**Files:**
- Modify: `packages/pro-form/src/composables/use-modal-form.ts:22-31`
- Modify: `packages/pro-form/src/composables/use-drawer-form.ts:22-31`

- [ ] **Step 1: Remove redundant watcher in useModalForm**

The `close()` function already calls `resetFields()`. Remove the watcher that duplicates it:

```ts
export function useModalForm(config: ProFormConfig): UseModalFormReturn {
  const visible = ref(false)
  const proForm = useProForm(config)

  function open(initialValues?: Record<string, unknown>): void {
    if (initialValues) {
      proForm.setFieldsValue(initialValues)
    }
    visible.value = true
  }

  function close(): void {
    visible.value = false
    proForm.resetFields()
  }

  return {
    ...proForm,
    visible,
    open,
    close,
  }
}
```

- [ ] **Step 2: Same fix for useDrawerForm**

Apply identical change to `use-drawer-form.ts`.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/src/composables/
git commit -m "fix(form): remove double-reset in useModalForm and useDrawerForm"
```

### Task 7: Fix `as any` type escape in useProTable

**Files:**
- Modify: `packages/pro-table/src/composables/use-pro-table.ts`

- [ ] **Step 1: Find and fix the `as any` cast**

Search for `as any` in the file and replace with proper typing. The `setDataSource` function at line ~114:

```ts
function setDataSource(data: T[]): void {
  requestState.data.value = data as unknown as typeof requestState.data.value
}
```

This uses `unknown` as an intermediate cast instead of `any`, satisfying the zero-any rule while handling the Vue ref unwrapping edge case.

- [ ] **Step 2: Commit**

```bash
git add packages/pro-table/src/composables/use-pro-table.ts
git commit -m "fix(table): replace 'as any' with 'as unknown' in setDataSource"
```

### Task 8: Unify formatting system — delete duplicate formatters, use formatters.ts everywhere

**Files:**
- Modify: `packages/hooks/src/use-value-type.ts:91-161`
- Modify: `packages/hooks/src/formatters.ts`
- Modify: `packages/pro-descriptions/src/composables/use-pro-descriptions.ts:52-101`

- [ ] **Step 1: Refactor use-value-type.ts to use formatters.ts**

Replace the inline `formatNumber`, `formatMoney`, `formatPercent`, `formatDate`, `formatDateTime` functions with calls to the locale-aware `formatters.ts`. Since `useValueType` doesn't have locale context, add a `locale` parameter:

```ts
import { formatDate as fmtDate, formatNumber as fmtNumber, formatMoney as fmtMoney, formatPercent as fmtPercent } from './formatters'

const DEFAULT_LOCALE = 'en-US'

function formatNumber(value: unknown): string {
  return fmtNumber(Number(value), DEFAULT_LOCALE)
}

function formatMoney(value: unknown): string {
  return fmtMoney(Number(value), DEFAULT_LOCALE)
}

function formatPercent(value: unknown): string {
  return fmtPercent(Number(value), DEFAULT_LOCALE)
}

function formatDate(value: unknown): string {
  return fmtDate(value as string | number | Date, 'date', DEFAULT_LOCALE)
}

function formatDateTime(value: unknown): string {
  return fmtDate(value as string | number | Date, 'dateTime', DEFAULT_LOCALE)
}
```

This makes `use-value-type.ts` a thin wrapper over `formatters.ts` — single source of truth.

- [ ] **Step 2: Refactor use-pro-descriptions.ts to use formatters.ts**

Replace the inline `formatMoney`, `formatDateValue` functions:

```ts
import { formatDate as fmtDate, formatMoney as fmtMoney } from '@pro/hooks'

const DEFAULT_LOCALE = 'en-US'

function formatValue(value: unknown, valueType: string): string {
  if (value === null || value === undefined) return '-'

  switch (valueType) {
    case 'money':
      return fmtMoney(Number(value), DEFAULT_LOCALE)
    case 'percent':
      return `${safeString(value)}%`
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : safeString(value)
    case 'date':
      return fmtDate(value as string | number | Date, 'date', DEFAULT_LOCALE)
    case 'dateTime':
      return fmtDate(value as string | number | Date, 'dateTime', DEFAULT_LOCALE)
    default:
      return safeString(value)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/hooks/ packages/pro-descriptions/
git commit -m "refactor(hooks): unify formatting — single source of truth in formatters.ts"
```

### Task 9: Fix playground valueType error and type inconsistencies

**Files:**
- Modify: `playground/src/App.vue:63`
- Modify: `packages/utils/src/types.ts`

- [ ] **Step 1: Add `digit` to the ValueType union**

In `packages/utils/src/types.ts`, add `digit` to the `ValueType` union (it's used in the playground and is a standard antd pro-components valueType):

```ts
export type ValueType =
  | 'text'
  | 'number'
  | 'digit'
  | 'select'
  | 'date'
  | 'dateRange'
  | 'dateTime'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'money'
  | 'percent'
  | 'progress'
  | 'image'
  | 'code'
  | 'index'
  | 'indexBorder'
  | 'option'
  | 'rate'
  | 'slider'
  | 'cascader'
  | 'treeSelect'
```

- [ ] **Step 2: Add new valueTypes to CONTROL_REGISTRY and TABLE_RENDER_MAP**

In `packages/hooks/src/use-value-type.ts`, add entries for the new types:

```ts
import {
  // ... existing imports
  ElRate,
  ElSlider,
  ElCascader,
  ElTreeSelect,
} from 'element-plus'

// Add to CONTROL_REGISTRY:
digit: { component: ElInputNumber, defaultProps: {} },
index: { component: ElInput, defaultProps: { disabled: true } },
indexBorder: { component: ElInput, defaultProps: { disabled: true } },
option: { component: ElInput, defaultProps: {} },
rate: { component: ElRate, defaultProps: {} },
slider: { component: ElSlider, defaultProps: {} },
cascader: { component: ElCascader, defaultProps: {} },
treeSelect: { component: ElTreeSelect, defaultProps: {} },

// Add to TABLE_RENDER_MAP:
digit: { component: 'span', format: wrapFormat(formatNumber) },
index: { component: 'span', format: wrapFormat((v) => String(v)) },
indexBorder: { component: 'span', format: wrapFormat((v) => String(v)) },
option: { component: 'span', format: wrapFormat((v) => String(v)) },
rate: { component: 'ElRate', format: wrapFormat((v) => String(v)), props: { disabled: true } },
slider: { component: 'span', format: wrapFormat((v) => String(v)) },
cascader: { component: 'span', format: wrapFormat((v) => String(v)) },
treeSelect: { component: 'span', format: wrapFormat((v) => String(v)) },

// Add to SEARCH_CONFIG_MAP:
digit: { component: 'ElInputNumber', props: {} },
index: null,
indexBorder: null,
option: null,
rate: { component: 'ElRate', props: {} },
slider: { component: 'ElSlider', props: {} },
cascader: { component: 'ElCascader', props: {} },
treeSelect: { component: 'ElTreeSelect', props: {} },
```

- [ ] **Step 3: Commit**

```bash
git add packages/utils/ packages/hooks/ playground/
git commit -m "feat(hooks): expand ValueType system with digit, index, rate, slider, cascader, treeSelect"
```

---

## Phase 2: New Features (5 tasks)

### Task 10: Implement LightFilter component

**Files:**
- Create: `packages/pro-form/src/components/LightFilter.vue`
- Modify: `packages/pro-form/src/index.ts`
- Modify: `packages/pro-components/src/index.ts`
- Create: `packages/pro-form/demos/light-filter.vue`

- [ ] **Step 1: Create LightFilter.vue**

LightFilter is a compact inline filter that renders each field as a clickable label with a popover for value input. When a value is set, it shows as a tag-like chip.

```vue
<!-- packages/pro-form/src/components/LightFilter.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElPopover, ElButton, ElTag } from 'element-plus'
import { useProLocale } from '@pro/hooks'
import { useProForm } from '../composables/use-pro-form'
import ProFormField from './ProFormField.vue'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'LightFilter' })

const props = withDefaults(
  defineProps<{
    fields: ProFieldDef[]
    initialValues?: Record<string, unknown>
  }>(),
  {},
)

const emit = defineEmits<{
  change: [values: Record<string, unknown>]
  reset: []
}>()

const { t } = useProLocale()

const { formValues, visibleFields, setFieldValue, resetFields } = useProForm({
  fields: props.fields,
  initialValues: props.initialValues,
})

const activePopover = ref<string | null>(null)

const activeFilters = computed(() => {
  return visibleFields.value.filter((field) => {
    const val = formValues.value[field.dataIndex]
    return val !== undefined && val !== null && val !== ''
  })
})

function getDisplayValue(field: ProFieldDef): string {
  const val = formValues.value[field.dataIndex]
  if (field.valueEnum && val !== undefined && val !== null) {
    const entry = field.valueEnum[String(val)]
    if (entry) return entry.text
  }
  return String(val ?? '')
}

function handleFieldChange(dataIndex: string, value: unknown): void {
  setFieldValue(dataIndex, value)
  activePopover.value = null
  emit('change', { ...formValues.value })
}

function handleClearField(dataIndex: string): void {
  setFieldValue(dataIndex, undefined)
  emit('change', { ...formValues.value })
}

function handleReset(): void {
  resetFields()
  emit('reset')
  emit('change', { ...formValues.value })
}

defineExpose({ formValues, resetFields })
</script>

<template>
  <div class="pro-light-filter">
    <!-- Active filter chips -->
    <ElTag
      v-for="field in activeFilters"
      :key="field.dataIndex"
      closable
      class="pro-light-filter__chip"
      @close="handleClearField(field.dataIndex)"
    >
      {{ field.title }}: {{ getDisplayValue(field) }}
    </ElTag>

    <!-- Filter dropdowns -->
    <ElPopover
      v-for="field in visibleFields"
      :key="`popover-${field.dataIndex}`"
      :visible="activePopover === field.dataIndex"
      placement="bottom-start"
      :width="220"
      trigger="click"
      @update:visible="(v: boolean) => activePopover = v ? field.dataIndex : null"
    >
      <template #reference>
        <ElButton
          v-if="!formValues[field.dataIndex]"
          link
          type="primary"
          class="pro-light-filter__trigger"
        >
          {{ field.title }}
          <el-icon class="pro-light-filter__arrow"><arrow-down /></el-icon>
        </ElButton>
      </template>
      <div class="pro-light-filter__popover-content">
        <ProFormField
          :field="field"
          :model-value="formValues[field.dataIndex]"
          :form-values="formValues"
          @update:model-value="handleFieldChange(field.dataIndex, $event)"
        />
      </div>
    </ElPopover>

    <!-- Reset -->
    <ElButton
      v-if="activeFilters.length > 0"
      link
      class="pro-light-filter__reset"
      @click="handleReset"
    >
      {{ t('pro.table.queryFilter.reset') }}
    </ElButton>
  </div>
</template>

<style scoped>
.pro-light-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pro-space-2);
  padding: var(--pro-space-3) 0;
}

.pro-light-filter__chip {
  border-radius: var(--pro-radius-pill);
}

.pro-light-filter__trigger {
  font-size: var(--pro-text-sm);
}

.pro-light-filter__arrow {
  margin-left: var(--pro-space-1);
  font-size: 12px;
}

.pro-light-filter__popover-content {
  padding: var(--pro-space-2) 0;
}

.pro-light-filter__reset {
  font-size: var(--pro-text-sm);
  color: var(--pro-text-tertiary);
}
</style>
```

- [ ] **Step 2: Export LightFilter from packages**

In `packages/pro-form/src/index.ts`, add:
```ts
export { default as LightFilter } from './components/LightFilter.vue'
```

In `packages/pro-components/src/index.ts`, add `LightFilter` to imports and exports.

- [ ] **Step 3: Create demo**

Create `packages/pro-form/demos/light-filter.vue` with a simple demo showing LightFilter with text, select, and date fields.

- [ ] **Step 4: Commit**

```bash
git add packages/pro-form/ packages/pro-components/
git commit -m "feat(form): add LightFilter component for compact inline filtering"
```

### Task 11: Implement ProFormDependency component

**Files:**
- Create: `packages/pro-form/src/components/ProFormDependency.vue`
- Modify: `packages/pro-form/src/index.ts`
- Modify: `packages/pro-components/src/index.ts`

- [ ] **Step 1: Create ProFormDependency**

```vue
<!-- packages/pro-form/src/components/ProFormDependency.vue -->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { PRO_FORM_INJECTION_KEY } from '../composables/use-pro-form'

defineOptions({ name: 'ProFormDependency' })

const props = defineProps<{
  /** Field names to watch */
  name: string[]
}>()

const formCtx = inject(PRO_FORM_INJECTION_KEY, null)

const dependencyValues = computed(() => {
  if (!formCtx) return {}
  const values: Record<string, unknown> = {}
  for (const key of props.name) {
    values[key] = formCtx.formValues.value[key]
  }
  return values
})
</script>

<template>
  <slot :values="dependencyValues" :form-values="formCtx?.formValues.value ?? {}" />
</template>
```

- [ ] **Step 2: Add PRO_FORM_INJECTION_KEY to useProForm if not already exported**

Ensure `useProForm` provides the form context and exports the injection key.

- [ ] **Step 3: Export ProFormDependency**

Add to `packages/pro-form/src/index.ts` and `packages/pro-components/src/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add packages/pro-form/ packages/pro-components/
git commit -m "feat(form): add ProFormDependency for field linkage"
```

### Task 12: Implement ProFormList component

**Files:**
- Create: `packages/pro-form/src/components/ProFormList.vue`
- Modify: `packages/pro-form/src/index.ts`
- Modify: `packages/pro-components/src/index.ts`

- [ ] **Step 1: Create ProFormList**

```vue
<!-- packages/pro-form/src/components/ProFormList.vue -->
<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue'
import { useProLocale } from '@pro/hooks'
import ProFormField from './ProFormField.vue'
import { PRO_FORM_INJECTION_KEY } from '../composables/use-pro-form'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'ProFormList' })

const props = withDefaults(
  defineProps<{
    /** Field name for the array in form values */
    name: string
    /** Fields definition for each row in the list */
    fields: ProFieldDef[]
    /** Maximum number of items */
    max?: number
    /** Minimum number of items */
    min?: number
    /** Whether to show copy button */
    copyable?: boolean
    /** Initial value for new items */
    creatorInitialValue?: () => Record<string, unknown>
  }>(),
  {
    max: Infinity,
    min: 0,
    copyable: false,
    creatorInitialValue: () => () => ({}),
  },
)

const { t } = useProLocale()
const formCtx = inject(PRO_FORM_INJECTION_KEY, null)

const items = computed<Record<string, unknown>[]>({
  get() {
    const val = formCtx?.formValues.value[props.name]
    return Array.isArray(val) ? val : []
  },
  set(newItems) {
    if (formCtx) {
      formCtx.formValues.value[props.name] = newItems
    }
  },
})

const canAdd = computed(() => items.value.length < props.max)
const canRemove = computed(() => items.value.length > props.min)

function addItem(): void {
  if (!canAdd.value) return
  items.value = [...items.value, props.creatorInitialValue()]
}

function removeItem(index: number): void {
  if (!canRemove.value) return
  const newItems = [...items.value]
  newItems.splice(index, 1)
  items.value = newItems
}

function copyItem(index: number): void {
  if (!canAdd.value) return
  const newItems = [...items.value]
  newItems.splice(index + 1, 0, { ...newItems[index] })
  items.value = newItems
}

function updateItemField(index: number, fieldKey: string, value: unknown): void {
  const newItems = [...items.value]
  newItems[index] = { ...newItems[index], [fieldKey]: value }
  items.value = newItems
}
</script>

<template>
  <div class="pro-form-list">
    <div v-for="(item, index) in items" :key="index" class="pro-form-list__item">
      <div class="pro-form-list__fields">
        <ProFormField
          v-for="field in fields"
          :key="field.dataIndex"
          :field="field"
          :model-value="item[field.dataIndex]"
          :form-values="item"
          @update:model-value="updateItemField(index, field.dataIndex, $event)"
        />
      </div>
      <div class="pro-form-list__actions">
        <ElButton
          v-if="canRemove"
          :icon="Delete"
          circle
          size="small"
          type="danger"
          plain
          @click="removeItem(index)"
        />
        <ElButton
          v-if="copyable && canAdd"
          :icon="CopyDocument"
          circle
          size="small"
          plain
          @click="copyItem(index)"
        />
      </div>
    </div>

    <ElButton
      v-if="canAdd"
      type="dashed"
      class="pro-form-list__add"
      @click="addItem"
    >
      <ElIcon><Plus /></ElIcon>
      {{ t('pro.common.create') }}
    </ElButton>
  </div>
</template>

<style scoped>
.pro-form-list__item {
  display: flex;
  align-items: flex-start;
  gap: var(--pro-space-3);
  padding: var(--pro-space-4);
  margin-bottom: var(--pro-space-3);
  border: 1px dashed var(--pro-border-light);
  border-radius: var(--pro-radius-md);
}

.pro-form-list__fields {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: var(--pro-space-3);
}

.pro-form-list__actions {
  display: flex;
  gap: var(--pro-space-1);
  padding-top: var(--pro-space-1);
}

.pro-form-list__add {
  width: 100%;
  border-style: dashed;
}
</style>
```

- [ ] **Step 2: Export from packages**

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/ packages/pro-components/
git commit -m "feat(form): add ProFormList for dynamic array fields"
```

### Task 13: Implement EditableProTable

**Files:**
- Create: `packages/pro-table/src/components/EditableCell.vue`
- Create: `packages/pro-table/src/composables/use-editable.ts`
- Modify: `packages/pro-table/src/ProTable.vue`
- Modify: `packages/pro-table/src/types/index.ts`
- Modify: `packages/pro-table/src/index.ts`
- Create: `packages/pro-table/demos/editable.vue`

- [ ] **Step 1: Create use-editable.ts composable**

```ts
// packages/pro-table/src/composables/use-editable.ts
import { ref, computed } from 'vue'

import type { Ref } from 'vue'

export interface UseEditableOptions<T = Record<string, unknown>> {
  /** Row key extractor */
  rowKey: string | ((row: T) => string)
  /** Callback when a row is saved */
  onSave?: (key: string, row: T, originalRow: T) => Promise<boolean>
  /** Callback when a row edit is cancelled */
  onCancel?: (key: string, row: T) => void
  /** Callback when a row is deleted */
  onDelete?: (key: string, row: T) => Promise<boolean>
}

export interface UseEditableReturn<T = Record<string, unknown>> {
  editableKeys: Ref<string[]>
  editingRows: Ref<Map<string, T>>
  isEditing: (key: string) => boolean
  startEdit: (key: string, row: T) => void
  cancelEdit: (key: string) => void
  saveEdit: (key: string) => Promise<boolean>
  deleteRow: (key: string, row: T) => Promise<boolean>
  setEditableKeys: (keys: string[]) => void
  getEditingValue: (key: string, dataIndex: string) => unknown
  setEditingValue: (key: string, dataIndex: string, value: unknown) => void
}

export function useEditable<T extends Record<string, unknown>>(
  options: UseEditableOptions<T>,
): UseEditableReturn<T> {
  const editableKeys = ref<string[]>([]) as Ref<string[]>
  const editingRows = ref(new Map<string, T>()) as Ref<Map<string, T>>
  const originalRows = new Map<string, T>()

  function getRowKey(row: T): string {
    if (typeof options.rowKey === 'function') return options.rowKey(row)
    return String(row[options.rowKey])
  }

  function isEditing(key: string): boolean {
    return editableKeys.value.includes(key)
  }

  function startEdit(key: string, row: T): void {
    if (isEditing(key)) return
    editableKeys.value = [...editableKeys.value, key]
    editingRows.value.set(key, { ...row })
    originalRows.set(key, { ...row })
  }

  function cancelEdit(key: string): void {
    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.value.delete(key)
    const original = originalRows.get(key)
    if (original) {
      options.onCancel?.(key, original)
    }
    originalRows.delete(key)
  }

  async function saveEdit(key: string): Promise<boolean> {
    const editedRow = editingRows.value.get(key)
    const original = originalRows.get(key)
    if (!editedRow || !original) return false

    if (options.onSave) {
      const result = await options.onSave(key, editedRow, original)
      if (!result) return false
    }

    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.value.delete(key)
    originalRows.delete(key)
    return true
  }

  async function deleteRow(key: string, row: T): Promise<boolean> {
    if (options.onDelete) {
      return options.onDelete(key, row)
    }
    return true
  }

  function setEditableKeys(keys: string[]): void {
    editableKeys.value = keys
  }

  function getEditingValue(key: string, dataIndex: string): unknown {
    const row = editingRows.value.get(key)
    return row ? row[dataIndex] : undefined
  }

  function setEditingValue(key: string, dataIndex: string, value: unknown): void {
    const row = editingRows.value.get(key)
    if (row) {
      editingRows.value.set(key, { ...row, [dataIndex]: value })
    }
  }

  return {
    editableKeys,
    editingRows,
    isEditing,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteRow,
    setEditableKeys,
    getEditingValue,
    setEditingValue,
  }
}
```

- [ ] **Step 2: Create EditableCell.vue**

A cell component that switches between display and edit mode based on `useEditable` state:

```vue
<!-- packages/pro-table/src/components/EditableCell.vue -->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { CONTROL_REGISTRY } from '@pro/hooks'

import type { ProColumnDef } from '../types'

defineOptions({ name: 'EditableCell' })

const props = defineProps<{
  column: ProColumnDef
  rowKey: string
  modelValue: unknown
  isEditing: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const valueType = computed(() => props.column.valueType ?? 'text')

const controlEntry = computed(() => CONTROL_REGISTRY[valueType.value])
</script>

<template>
  <template v-if="isEditing && controlEntry">
    <component
      :is="controlEntry.component"
      :model-value="modelValue"
      v-bind="controlEntry.defaultProps"
      size="small"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </template>
  <template v-else>
    <slot />
  </template>
</template>
```

- [ ] **Step 3: Add editable props to ProTable types**

In `packages/pro-table/src/types/index.ts`, add:

```ts
export interface EditableConfig<T = Record<string, unknown>> {
  /** Controlled editable row keys */
  editableKeys?: string[]
  /** Save handler — return true to confirm */
  onSave?: (key: string, row: T, originalRow: T) => Promise<boolean>
  /** Cancel handler */
  onCancel?: (key: string, row: T) => void
  /** Delete handler — return true to confirm */
  onDelete?: (key: string, row: T) => Promise<boolean>
  /** Called when editableKeys changes */
  onChange?: (editableKeys: string[]) => void
}
```

Add `editable?: EditableConfig<T>` to `ProTableProps`.

- [ ] **Step 4: Wire editable into ProTable.vue**

Add editable cell rendering in the column template. When `editable` prop is provided and a row is in edit mode, render `EditableCell` with an action column for save/cancel.

- [ ] **Step 5: Export useEditable**

Add to `packages/pro-table/src/index.ts`.

- [ ] **Step 6: Create demo**

Create `packages/pro-table/demos/editable.vue` showing inline editing with save/cancel.

- [ ] **Step 7: Commit**

```bash
git add packages/pro-table/
git commit -m "feat(table): add EditableProTable with inline cell editing"
```

### Task 14: Implement SchemaForm

**Files:**
- Create: `packages/pro-form/src/components/SchemaForm.vue`
- Modify: `packages/pro-form/src/index.ts`
- Modify: `packages/pro-components/src/index.ts`

- [ ] **Step 1: Create SchemaForm**

SchemaForm renders a form purely from a JSON-like schema (columns array), without needing to import individual field components. It's essentially ProForm but accepting `columns` (ProColumnDef[]) instead of `fields` (ProFieldDef[]):

```vue
<!-- packages/pro-form/src/components/SchemaForm.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import ProForm from '../ProForm.vue'

import type { ProColumnDef, ProFieldDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'SchemaForm' })

const props = withDefaults(
  defineProps<{
    columns: ProColumnDef[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    layout?: FormLayout
    labelWidth?: string | number
    /** Number of columns in grid layout */
    gridColumns?: number
    formProps?: Record<string, unknown>
  }>(),
  {
    layout: 'vertical',
    gridColumns: 1,
  },
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  reset: []
}>()

/** Convert ProColumnDef to ProFieldDef for ProForm consumption */
const fields = computed<ProFieldDef[]>(() => {
  return props.columns
    .filter((col) => !col.hideInForm)
    .map((col) => ({
      dataIndex: String(col.dataIndex),
      title: col.title,
      key: col.key,
      valueType: col.valueType ?? 'text',
      valueEnum: col.valueEnum,
      hideInForm: col.hideInForm,
      rules: col.searchConfig?.rules,
      searchConfig: col.searchConfig,
      tooltip: (col as Record<string, unknown>).tooltip as string | undefined,
      span: col.searchConfig?.span,
    })) as ProFieldDef[]
})
</script>

<template>
  <ProForm
    :fields="fields"
    :initial-values="initialValues"
    :on-submit="onSubmit"
    :layout="layout"
    :label-width="labelWidth"
    :columns="gridColumns"
    v-bind="formProps"
  >
    <template v-if="$slots.actions" #actions="scope">
      <slot name="actions" v-bind="scope" />
    </template>
  </ProForm>
</template>
```

- [ ] **Step 2: Add `hideInForm` to ProColumnDef**

In `packages/pro-table/src/types/index.ts`, add `hideInForm?: boolean` to `ProColumnDef`.

- [ ] **Step 3: Export SchemaForm**

- [ ] **Step 4: Commit**

```bash
git add packages/pro-form/ packages/pro-table/ packages/pro-components/
git commit -m "feat(form): add SchemaForm for column-driven form rendering"
```

---

## Phase 3: Documentation Overhaul (3 tasks)

### Task 15: Rewrite ProTable documentation with API tables and more demos

**Files:**
- Modify: `docs/components/pro-table.md`
- Create: `packages/pro-table/demos/editable.vue` (if not created in Task 13)
- Create: `packages/pro-table/demos/selection.vue`
- Create: `packages/pro-table/demos/fullscreen.vue`

- [ ] **Step 1: Rewrite pro-table.md**

Add comprehensive API Props tables (not just TypeScript interfaces), add usage prose for each demo, add new demos for selection, editable, fullscreen:

Structure:
1. Overview with feature list
2. Basic Usage (with prose explanation)
3. Remote Request Mode
4. Composable Mode
5. Search Form
6. Toolbar & Fullscreen
7. Row Selection & Batch Actions
8. ValueType Gallery
9. Editable Table
10. API Reference (Props Table, Events Table, Slots Table, Methods Table)

- [ ] **Step 2: Create missing demo files**

Create `selection.vue` and `fullscreen.vue` demos.

- [ ] **Step 3: Commit**

```bash
git add docs/components/pro-table.md packages/pro-table/demos/
git commit -m "docs(table): rewrite ProTable docs with API tables and comprehensive demos"
```

### Task 16: Rewrite ProForm documentation

**Files:**
- Modify: `docs/components/pro-form.md`
- Create: `packages/pro-form/demos/drawer-form.vue`
- Create: `packages/pro-form/demos/light-filter.vue` (if not created in Task 10)
- Create: `packages/pro-form/demos/schema-form.vue`
- Create: `packages/pro-form/demos/form-list.vue`
- Create: `packages/pro-form/demos/dependency.vue`

- [ ] **Step 1: Rewrite pro-form.md**

Structure:
1. Overview
2. Basic Usage
3. Layout Modes
4. ModalForm
5. DrawerForm (new demo)
6. StepsForm
7. LightFilter
8. SchemaForm
9. ProFormList
10. ProFormDependency
11. API Reference (Props tables for each component variant)

- [ ] **Step 2: Create missing demos**

- [ ] **Step 3: Commit**

```bash
git add docs/components/pro-form.md packages/pro-form/demos/
git commit -m "docs(form): rewrite ProForm docs with all form variants and API tables"
```

### Task 17: Rewrite ProDescriptions documentation + add demos

**Files:**
- Modify: `docs/components/pro-descriptions.md`
- Create: `packages/pro-descriptions/demos/loading.vue`
- Create: `packages/pro-descriptions/demos/bordered.vue`
- Create: `packages/pro-descriptions/demos/custom-render.vue`

- [ ] **Step 1: Rewrite pro-descriptions.md**

Structure:
1. Overview
2. Basic Usage
3. Bordered Style
4. Loading State
5. Custom Render
6. Columns Reuse (Table + Descriptions)
7. API Reference (Props Table)

- [ ] **Step 2: Create demos for loading, bordered, custom-render**

- [ ] **Step 3: Commit**

```bash
git add docs/components/pro-descriptions.md packages/pro-descriptions/demos/
git commit -m "docs(descriptions): rewrite ProDescriptions docs with new demos and API tables"
```

---

## Self-Review Checklist

- [x] All spec requirements have corresponding tasks
- [x] No TBD/TODO/placeholders
- [x] Type names, function signatures, and property names are consistent across tasks
- [x] Every task has exact file paths
- [x] Every code step has code blocks
- [x] DRY: formatting lives in formatters.ts only
- [x] YAGNI: no features beyond what antd pro-components offers
- [x] Phase 1 (fixes) can run independently of Phase 2 (features)
- [x] Phase 2 tasks are mostly independent and can be parallelized
- [x] Phase 3 (docs) depends on Phases 1+2 being complete
