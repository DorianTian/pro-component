<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { ElForm, ElButton, ElRow, ElCol, ElCollapse, ElCollapseItem } from 'element-plus'
import { useProForm, GRID_GUTTER, DEFAULT_LABEL_WIDTH } from './composables/use-pro-form'
import { useProLocale } from '@pro/hooks'
import { PRO_FORM_INJECTION_KEY } from './injection-keys'
import ProFormField from './components/ProFormField.vue'

import type { ProFieldDef, ProFieldGroup, ProFormItem, FormLayout } from '@pro/utils'

defineOptions({ name: 'ProForm' })

const { t } = useProLocale()

const props = withDefaults(
  defineProps<{
    layout?: FormLayout
    fields: ProFormItem[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    onError?: (error: Error) => void
    formProps?: Record<string, unknown>
    labelWidth?: string | number
    showActions?: boolean
    submitText?: string
    resetText?: string
    columns?: number
  }>(),
  {
    layout: 'horizontal',
    showActions: true,
    submitText: undefined,
    resetText: undefined,
    columns: 1,
  },
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  reset: []
}>()

// ─── Helpers: flatten groups into flat field list ────────────────────
function isGroup(item: ProFormItem): item is ProFieldGroup {
  return 'type' in item && item.type === 'group'
}

function flattenFields(items: ProFormItem[]): ProFieldDef[] {
  const result: ProFieldDef[] = []
  for (const item of items) {
    if (isGroup(item)) {
      result.push(...item.children)
    } else {
      result.push(item)
    }
  }
  return result
}

/** All flat fields for composable (validation, visibility, etc.) */
const allFields = computed(() => flattenFields(props.fields))

// ─── Form state composable (works with flat fields) ────────────────
const formState = useProForm({
  layout: props.layout,
  fields: allFields.value,
  initialValues: props.initialValues,
  onSubmit: props.onSubmit,
  onError: props.onError,
  formProps: props.formProps,
  labelWidth: props.labelWidth,
  showActions: props.showActions,
  submitText: props.submitText,
  resetText: props.resetText,
  columns: props.columns,
})

const {
  formValues,
  loading,
  isSubmitting,
  visibleFields,
  validationRules,
  isDirty,
  setFieldValue,
  setFieldsValue,
  getFieldValue,
  resetFields,
  submit,
  formRef,
} = formState

provide(PRO_FORM_INJECTION_KEY, formState)

// ─── Layout: compute column span for a field ────────────────────────
function getFieldSpan(field: ProFieldDef, columns: number): number {
  // Explicit raw span (legacy, out of 24)
  if (field.span != null) return field.span
  // colSpan: logical columns
  if (field.colSpan === 'full') return 24
  if (typeof field.colSpan === 'number') {
    return Math.min(Math.floor((24 / columns) * field.colSpan), 24)
  }
  return Math.floor(24 / columns)
}

// ─── Collapsible groups ─────────────────────────────────────────────
const collapsedGroups = ref<Set<string>>(new Set())

// Initialize collapsed state from group defaults
for (const item of props.fields) {
  if (isGroup(item) && item.collapsible && item.defaultCollapsed) {
    collapsedGroups.value.add(item.key ?? item.title)
  }
}

function toggleGroup(key: string): void {
  if (collapsedGroups.value.has(key)) {
    collapsedGroups.value.delete(key)
  } else {
    collapsedGroups.value.add(key)
  }
  // Trigger reactivity
  collapsedGroups.value = new Set(collapsedGroups.value)
}

function isGroupCollapsed(group: ProFieldGroup): boolean {
  return collapsedGroups.value.has(group.key ?? group.title)
}

// ─── Structured items for template rendering ────────────────────────
interface RenderBlock {
  type: 'fields'
  fields: ProFieldDef[]
  columns: number
}

interface RenderGroup {
  type: 'group'
  group: ProFieldGroup
  fields: ProFieldDef[]
  columns: number
}

type RenderItem = RenderBlock | RenderGroup

const renderItems = computed<RenderItem[]>(() => {
  const visibleSet = new Set(visibleFields.value.map((f) => f.dataIndex))
  const items: RenderItem[] = []
  let pendingFields: ProFieldDef[] = []

  function flushPending(): void {
    if (pendingFields.length > 0) {
      items.push({ type: 'fields', fields: pendingFields, columns: props.columns })
      pendingFields = []
    }
  }

  for (const item of props.fields) {
    if (isGroup(item)) {
      flushPending()
      const groupFields = item.children.filter((f) => visibleSet.has(f.dataIndex))
      if (groupFields.length > 0) {
        items.push({
          type: 'group',
          group: item,
          fields: groupFields,
          columns: item.columns ?? props.columns,
        })
      }
    } else {
      if (visibleSet.has(item.dataIndex)) {
        pendingFields.push(item)
      }
    }
  }
  flushPending()
  return items
})

// ─── Dependency reset ───────────────────────────────────────────────
function handleFieldUpdate(dataIndex: string, value: unknown): void {
  setFieldValue(dataIndex, value)

  // Check if any field has resetOnDependencyChange for this field
  for (const field of allFields.value) {
    if (
      field.resetOnDependencyChange &&
      field.dependencies?.includes(dataIndex) &&
      field.dataIndex !== dataIndex
    ) {
      setFieldValue(field.dataIndex, field.defaultValue ?? undefined)
    }
  }
}

// ─── Actions ────────────────────────────────────────────────────────
async function handleSubmit(): Promise<void> {
  const success = await submit()
  if (success) {
    emit('submit', { ...formValues.value })
  }
}

function handleReset(): void {
  resetFields()
  emit('reset')
}

defineExpose({
  formValues,
  loading,
  isSubmitting,
  isDirty,
  setFieldValue,
  setFieldsValue,
  getFieldValue,
  resetFields,
  submit,
  formRef,
})
</script>

<template>
  <ElForm
    ref="formRef"
    :model="formValues"
    :rules="validationRules"
    :label-position="layout === 'vertical' ? 'top' : 'right'"
    :label-width="layout === 'vertical' ? undefined : (labelWidth ?? DEFAULT_LABEL_WIDTH)"
    v-bind="formProps"
    class="pro-form"
    :class="[`pro-form--${layout}`]"
  >
    <template v-for="(block, idx) in renderItems" :key="idx">
      <!-- Standalone fields (no group) -->
      <ElRow v-if="block.type === 'fields'" :gutter="GRID_GUTTER">
        <ElCol
          v-for="field in block.fields"
          :key="field.key ?? field.dataIndex"
          :span="getFieldSpan(field, block.columns)"
        >
          <ProFormField
            :field="field"
            :model-value="formValues[field.dataIndex]"
            :form-values="formValues"
            @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
          />
        </ElCol>
      </ElRow>

      <!-- Field group with section header -->
      <div v-else class="pro-form__group">
        <div
          class="pro-form__group-header"
          :class="{ 'pro-form__group-header--collapsible': block.group.collapsible }"
          @click="block.group.collapsible && toggleGroup(block.group.key ?? block.group.title)"
        >
          <span class="pro-form__group-title">{{ block.group.title }}</span>
          <svg
            v-if="block.group.collapsible"
            class="pro-form__group-arrow"
            :class="{ 'pro-form__group-arrow--collapsed': isGroupCollapsed(block.group) }"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div v-show="!isGroupCollapsed(block.group)" class="pro-form__group-body">
          <ElRow :gutter="GRID_GUTTER">
            <ElCol
              v-for="field in block.fields"
              :key="field.key ?? field.dataIndex"
              :span="getFieldSpan(field, block.columns)"
            >
              <ProFormField
                :field="field"
                :model-value="formValues[field.dataIndex]"
                :form-values="formValues"
                @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
              />
            </ElCol>
          </ElRow>
        </div>
      </div>
    </template>

    <div v-if="showActions" class="pro-form__actions">
      <slot name="actions" :loading="loading" :submit="handleSubmit" :reset="handleReset">
        <ElButton type="primary" :loading="loading" class="pro-form__submit" @click="handleSubmit">
          {{ submitText ?? t('pro.form.submit') }}
        </ElButton>
        <ElButton class="pro-form__reset" @click="handleReset">
          {{ resetText ?? t('pro.form.reset') }}
        </ElButton>
      </slot>
    </div>
  </ElForm>
</template>

<style>
.pro-form {
  width: 100%;
}

/* ─── Force form controls to fill column width ───────────────────── */
.pro-form .el-form-item__content > .el-input,
.pro-form .el-form-item__content > .el-select,
.pro-form .el-form-item__content > .el-date-editor,
.pro-form .el-form-item__content > .el-input-number,
.pro-form .el-form-item__content > .el-cascader,
.pro-form .el-form-item__content > .el-tree-select {
  width: 100%;
}

/* ─── Inline mode: compact spacing, no label-width ───────────────── */
.pro-form--inline .el-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
}

/* ─── Actions ─────────────────────────────────────────────────────── */
.pro-form .pro-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--pro-space-3);
  padding-top: var(--pro-space-5);
  margin-top: var(--pro-space-5);
  border-top: 1px solid var(--pro-border-light);
}

/* ─── Field Groups ────────────────────────────────────────────────── */
.pro-form .pro-form__group {
  margin-bottom: var(--pro-space-2);
}

.pro-form .pro-form__group-header {
  display: flex;
  align-items: center;
  gap: var(--pro-space-2);
  padding: var(--pro-space-3) 0;
  margin-bottom: var(--pro-space-3);
  border-bottom: 1px solid var(--pro-border-light);
  user-select: none;
}

.pro-form .pro-form__group-header--collapsible {
  cursor: pointer;
}

.pro-form .pro-form__group-header--collapsible:hover .pro-form__group-title {
  color: var(--pro-color-primary);
}

.pro-form .pro-form__group-title {
  font-size: var(--pro-text-base);
  font-weight: var(--pro-font-weight-semibold);
  color: var(--pro-text-primary);
  transition: color var(--pro-transition-fast);
}

.pro-form .pro-form__group-arrow {
  width: 14px;
  height: 14px;
  color: var(--pro-text-tertiary);
  transition: transform var(--pro-transition-fast);
  margin-left: auto;
}

.pro-form .pro-form__group-arrow--collapsed {
  transform: rotate(-90deg);
}

.pro-form .pro-form__group-body {
  padding-left: var(--pro-space-1);
}
</style>
