<script setup lang="ts">
import { computed } from 'vue'
import { ElDialog } from 'element-plus'
import ProForm from '../ProForm.vue'

import type { ProFieldDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'ModalForm' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string | number
    fields: ProFieldDef[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    formProps?: Record<string, unknown>
    labelWidth?: string | number
    layout?: FormLayout
    dialogProps?: Record<string, unknown>
  }>(),
  {
    modelValue: false,
    title: '',
    width: '50%',
    layout: 'horizontal',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: Record<string, unknown>]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emit('update:modelValue', val)
  },
})

function handleClose() {
  dialogVisible.value = false
}

async function handleSubmit(values: Record<string, unknown>): Promise<boolean> {
  if (!props.onSubmit) return false
  const result = await props.onSubmit(values)
  if (result) {
    emit('submit', values)
    handleClose()
  }
  return result
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    destroy-on-close
    v-bind="dialogProps"
  >
    <ProForm
      :fields="fields"
      :initial-values="initialValues"
      :on-submit="handleSubmit"
      :form-props="formProps"
      :label-width="labelWidth"
      :layout="layout"
    />
  </ElDialog>
</template>
