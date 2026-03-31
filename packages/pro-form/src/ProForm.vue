<script setup lang="ts">
import { computed, provide } from 'vue'
import { ElForm, ElButton, ElRow, ElCol } from 'element-plus'
import { useProForm, GRID_GUTTER, DEFAULT_LABEL_WIDTH } from './composables/use-pro-form'
import { PRO_FORM_INJECTION_KEY } from './injection-keys'
import ProFormField from './components/ProFormField.vue'

import type { ProFieldDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'ProForm' })

const props = withDefaults(
  defineProps<{
    layout?: FormLayout
    fields: ProFieldDef[]
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
    submitText: 'Submit',
    resetText: 'Reset',
    columns: 1,
  },
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  reset: []
}>()

const formState = useProForm({
  layout: props.layout,
  fields: props.fields,
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

const colSpan = computed(() => Math.floor(24 / props.columns))

async function handleSubmit() {
  const success = await submit()
  if (success) {
    emit('submit', { ...formValues.value })
  }
}

function handleReset() {
  resetFields()
  emit('reset')
}

function handleFieldUpdate(dataIndex: string, value: unknown) {
  setFieldValue(dataIndex, value)
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
    :inline="layout === 'inline'"
    :label-position="layout === 'vertical' ? 'top' : 'right'"
    :label-width="labelWidth ?? DEFAULT_LABEL_WIDTH"
    v-bind="formProps"
    class="pro-form"
  >
    <ElRow :gutter="GRID_GUTTER">
      <ElCol
        v-for="field in visibleFields"
        :key="field.key ?? field.dataIndex"
        :span="field.span ?? colSpan"
      >
        <ProFormField
          :field="field"
          :model-value="formValues[field.dataIndex]"
          :form-values="formValues"
          @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
        />
      </ElCol>
    </ElRow>

    <div v-if="showActions" class="pro-form__actions">
      <slot name="actions" :loading="loading" :submit="handleSubmit" :reset="handleReset">
        <ElButton type="primary" :loading="loading" class="pro-form__submit" @click="handleSubmit">
          {{ submitText }}
        </ElButton>
        <ElButton class="pro-form__reset" @click="handleReset">
          {{ resetText }}
        </ElButton>
      </slot>
    </div>
  </ElForm>
</template>

<style scoped>
.pro-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--pro-spacing-sm, 8px);
  padding-top: var(--pro-spacing-md, 16px);
}
</style>
