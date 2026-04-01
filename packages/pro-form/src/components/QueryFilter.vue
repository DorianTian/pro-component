<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElForm, ElFormItem, ElButton } from 'element-plus'
import { useProForm, QUERY_FILTER_DEFAULT_COLLAPSE_THRESHOLD } from '../composables/use-pro-form'
import { useProLocale } from '@pro/hooks'
import ProFormField from './ProFormField.vue'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'QueryFilter' })

const props = withDefaults(
  defineProps<{
    fields: ProFieldDef[]
    initialValues?: Record<string, unknown>
    formProps?: Record<string, unknown>
    labelWidth?: string | number
    /** Whether to start collapsed */
    defaultCollapsed?: boolean
    /** Number of fields to show before collapsing */
    collapseThreshold?: number
    /** Column span for each field (out of 24) */
    span?: number
  }>(),
  {
    defaultCollapsed: false,
    collapseThreshold: QUERY_FILTER_DEFAULT_COLLAPSE_THRESHOLD,
    span: 8,
  },
)

const emit = defineEmits<{
  search: [values: Record<string, unknown>]
  reset: []
}>()

const collapsed = ref(props.defaultCollapsed)

const { t } = useProLocale()

const { formValues, visibleFields, setFieldValue, resetFields, formRef } = useProForm({
  fields: props.fields,
  initialValues: props.initialValues,
})

const showCollapseToggle = computed(() => {
  return visibleFields.value.length > props.collapseThreshold
})

const displayFields = computed(() => {
  if (!collapsed.value || !showCollapseToggle.value) {
    return visibleFields.value
  }
  return visibleFields.value.slice(0, props.collapseThreshold)
})

function handleSearch() {
  emit('search', { ...formValues.value })
}

function handleReset() {
  resetFields()
  emit('reset')
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function handleFieldUpdate(dataIndex: string, value: unknown) {
  setFieldValue(dataIndex, value)
}

defineExpose({
  formValues,
  resetFields,
})
</script>

<template>
  <ElForm
    ref="formRef"
    :model="formValues"
    inline
    :label-width="labelWidth ?? '80px'"
    v-bind="formProps"
    class="pro-query-filter"
  >
    <ProFormField
      v-for="field in displayFields"
      :key="field.key ?? field.dataIndex"
      :field="field"
      :model-value="formValues[field.dataIndex]"
      :form-values="formValues"
      @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
    />

    <ElFormItem class="pro-query-filter__actions">
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
    </ElFormItem>
  </ElForm>
</template>

<style scoped>
.pro-query-filter {
  padding: var(--pro-space-5);
  background: var(--pro-bg-elevated);
  border-radius: var(--pro-radius-md);
  margin-bottom: var(--pro-space-5);
}

.pro-query-filter__actions {
  margin-left: auto;
}
</style>
