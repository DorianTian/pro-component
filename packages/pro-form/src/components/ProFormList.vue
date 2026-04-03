<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue'
import { useProLocale } from '@pro/hooks'
import { PRO_FORM_INJECTION_KEY } from '../injection-keys'
import ProFormField from './ProFormField.vue'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'ProFormList' })

const props = withDefaults(
  defineProps<{
    name: string
    fields: ProFieldDef[]
    max?: number
    min?: number
    copyable?: boolean
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
      formCtx.setFieldValue(props.name, newItems)
    }
  },
})

/** Stable key counter for v-for — avoids index-based keying anti-pattern */
let keyCounter = 0
const itemKeys = ref<number[]>([])

// Initialize keys for existing items
function ensureKeys(): void {
  while (itemKeys.value.length < items.value.length) {
    itemKeys.value.push(keyCounter++)
  }
  if (itemKeys.value.length > items.value.length) {
    itemKeys.value = itemKeys.value.slice(0, items.value.length)
  }
}

const canAdd = computed(() => items.value.length < props.max)
const canRemove = computed(() => items.value.length > props.min)

function addItem(): void {
  if (!canAdd.value) return
  items.value = [...items.value, props.creatorInitialValue()]
  itemKeys.value = [...itemKeys.value, keyCounter++]
}

function removeItem(index: number): void {
  if (!canRemove.value) return
  const newItems = [...items.value]
  newItems.splice(index, 1)
  items.value = newItems
  const newKeys = [...itemKeys.value]
  newKeys.splice(index, 1)
  itemKeys.value = newKeys
}

function copyItem(index: number): void {
  if (!canAdd.value) return
  const newItems = [...items.value]
  newItems.splice(index + 1, 0, { ...newItems[index] })
  items.value = newItems
  const newKeys = [...itemKeys.value]
  newKeys.splice(index + 1, 0, keyCounter++)
  itemKeys.value = newKeys
}

function updateItemField(index: number, fieldKey: string, value: unknown): void {
  // Create new item + array reference so the computed re-evaluates
  // and v-for re-renders with updated model-value bindings
  const newItems = [...items.value]
  newItems[index] = { ...newItems[index], [fieldKey]: value }
  items.value = newItems
}

/** Build the full prop path for EP validation: e.g. "members.0.name" */
function fieldProp(index: number, dataIndex: string): string {
  return `${props.name}.${index}.${dataIndex}`
}
</script>

<template>
  <div class="pro-form-list">
    <div
      v-for="(item, index) in (ensureKeys(), items)"
      :key="itemKeys[index]"
      class="pro-form-list__item"
    >
      <div class="pro-form-list__fields">
        <ProFormField
          v-for="field in fields"
          :key="field.dataIndex"
          :field="field"
          :prop="fieldProp(index, field.dataIndex)"
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

    <ElButton v-if="canAdd" type="primary" plain class="pro-form-list__add" @click="addItem">
      <ElIcon><Plus /></ElIcon>
      {{ t('pro.common.create') }}
    </ElButton>
  </div>
</template>

<style scoped>
.pro-form-list {
  margin-bottom: var(--pro-space-4);
}

.pro-form-list__item {
  display: flex;
  align-items: center;
  gap: var(--pro-space-3);
  padding: var(--pro-space-3) var(--pro-space-4);
  margin-bottom: var(--pro-space-2);
  border: 1px solid var(--pro-border-light);
  border-radius: var(--pro-radius-md);
  background: var(--pro-bg-sunken);
  transition: border-color var(--pro-transition-fast);
}

.pro-form-list__item:hover {
  border-color: var(--pro-border-default);
}

.pro-form-list__fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0 var(--pro-space-3);
  min-width: 0;
}

/*
 * Force label-top inside list rows.
 * EP injects inline label-width via el-form — override with flex-column
 * so the inline `width` on el-form-item__label becomes irrelevant.
 */
.pro-form-list__fields :deep(.el-form-item) {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.pro-form-list__fields :deep(.el-form-item__label) {
  width: auto !important;
  float: none;
  display: block;
  text-align: left;
  padding: 0 0 4px;
  line-height: 1.4;
  font-size: 12px;
  color: var(--pro-text-secondary);
  height: auto;
}

.pro-form-list__fields :deep(.el-form-item__content) {
  margin-left: 0 !important;
  flex: none;
}

.pro-form-list__actions {
  display: flex;
  gap: var(--pro-space-1);
  flex-shrink: 0;
  /* Offset for label height so buttons center-align with inputs, not with label+input */
  padding-top: 21px;
}

.pro-form-list__add {
  width: 100%;
  border-style: dashed;
}
</style>
