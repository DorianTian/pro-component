<script setup lang="ts">
import { computed, inject } from 'vue'
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
  const arr = items.value
  if (arr[index]) {
    arr[index][fieldKey] = value
  }
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
  align-items: flex-start;
  gap: var(--pro-space-4);
  padding: var(--pro-space-4) var(--pro-space-5);
  margin-bottom: var(--pro-space-3);
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0 var(--pro-space-4);
  min-width: 0;
}

/* Force labels above controls inside list items for compact layout */
.pro-form-list__fields :deep(.el-form-item) {
  margin-bottom: var(--pro-space-2);
}

.pro-form-list__fields :deep(.el-form-item__label) {
  float: none;
  display: block;
  text-align: left;
  padding-bottom: 4px;
  line-height: 1.4;
  font-size: var(--pro-text-xs);
  color: var(--pro-text-secondary);
}

.pro-form-list__fields :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.pro-form-list__actions {
  display: flex;
  flex-direction: column;
  gap: var(--pro-space-1);
  padding-top: 20px; /* align with input (below label) */
  flex-shrink: 0;
}

.pro-form-list__add {
  width: 100%;
  border-style: dashed;
}
</style>
