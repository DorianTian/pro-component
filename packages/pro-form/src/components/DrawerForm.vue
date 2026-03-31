<script setup lang="ts">
import { computed } from 'vue'
import { ElDrawer } from 'element-plus'
import ProForm from '../ProForm.vue'

import type { ProFieldDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'DrawerForm' })

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
    drawerProps?: Record<string, unknown>
  }>(),
  {
    modelValue: false,
    title: '',
    width: '30%',
    layout: 'horizontal',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: Record<string, unknown>]
}>()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function handleClose() {
  drawerVisible.value = false
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
  <ElDrawer
    v-model="drawerVisible"
    :title="title"
    :size="width"
    destroy-on-close
    v-bind="drawerProps"
  >
    <ProForm
      :fields="fields"
      :initial-values="initialValues"
      :on-submit="handleSubmit"
      :form-props="formProps"
      :label-width="labelWidth"
      :layout="layout"
    />
  </ElDrawer>
</template>
