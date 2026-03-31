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
  set: (val: boolean) => {
    emit('update:modelValue', val)
  },
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
    custom-class="pro-drawer-form"
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

<style>
.pro-drawer-form {
  box-shadow: var(--pro-shadow-lg);
}

.pro-drawer-form .el-drawer__header {
  padding: var(--pro-space-6) var(--pro-space-7) var(--pro-space-5);
  margin-bottom: 0;
}

.pro-drawer-form .el-drawer__title {
  font-size: var(--pro-text-lg);
  font-weight: var(--pro-font-weight-semibold);
  color: var(--pro-text-primary);
}

.pro-drawer-form .el-drawer__close-btn {
  width: 28px;
  height: 28px;
}

.pro-drawer-form .el-drawer__body {
  padding: 0 var(--pro-space-7) var(--pro-space-7);
}

.pro-drawer-form .pro-form__actions {
  padding-top: var(--pro-space-5);
  margin-top: var(--pro-space-5);
}
</style>
