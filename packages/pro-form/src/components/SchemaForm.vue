<script setup lang="ts">
import { computed } from 'vue'
import ProForm from '../ProForm.vue'

import type { ProColumnDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'SchemaForm' })

const props = withDefaults(
  defineProps<{
    columns: ProColumnDef[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    layout?: FormLayout
    labelWidth?: string | number
    gridColumns?: number
    formProps?: Record<string, unknown>
  }>(),
  {
    layout: 'vertical',
    gridColumns: 1,
  },
)

const fields = computed(() => {
  return props.columns
    .filter((col) => !(col as Record<string, unknown>).hideInForm)
    .map((col) => ({
      dataIndex: String(col.dataIndex),
      title: col.title,
      key: col.key,
      valueType: col.valueType ?? 'text',
      valueEnum: col.valueEnum,
      rules: col.searchConfig?.rules,
      searchConfig: col.searchConfig,
    }))
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
