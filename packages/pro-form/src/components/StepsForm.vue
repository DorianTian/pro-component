<script setup lang="ts">
import { ElSteps, ElStep, ElForm, ElButton, ElRow, ElCol } from 'element-plus'
import { useStepsForm } from '../composables/use-steps-form'
import { useProLocale } from '@pro/hooks'
import { GRID_GUTTER } from '../composables/use-pro-form'
import ProFormField from './ProFormField.vue'

import type { StepFormDef, FormLayout } from '@pro/utils'

defineOptions({ name: 'StepsForm' })

const { t } = useProLocale()

const props = withDefaults(
  defineProps<{
    steps: StepFormDef[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    onError?: (error: Error) => void
    formProps?: Record<string, unknown>
    labelWidth?: string | number
    layout?: FormLayout
  }>(),
  {
    layout: 'horizontal',
  },
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  stepChange: [step: number]
}>()

const {
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  currentFields,
  currentStepDef,
  steps: stepDefs,
  formValues,
  loading,
  validationRules,
  nextStep,
  prevStep,
  submit,
  resetFields,
  formRef,
} = useStepsForm({
  steps: props.steps,
  initialValues: props.initialValues,
  onSubmit: props.onSubmit,
  onError: props.onError,
  formProps: props.formProps,
  labelWidth: props.labelWidth,
})

async function handleNext() {
  const ok = await nextStep()
  if (ok) {
    emit('stepChange', currentStep.value)
  }
}

function handlePrev() {
  prevStep()
  emit('stepChange', currentStep.value)
}

async function handleSubmit() {
  const success = await submit()
  if (success) {
    emit('submit', { ...formValues.value })
  }
}

function handleFieldUpdate(dataIndex: string, value: unknown) {
  formValues.value = { ...formValues.value, [dataIndex]: value }
}

defineExpose({
  currentStep,
  formValues,
  loading,
  nextStep,
  prevStep,
  submit,
  resetFields,
})
</script>

<template>
  <div class="pro-steps-form">
    <ElSteps :active="currentStep" finish-status="success" class="pro-steps-form__steps">
      <ElStep
        v-for="(step, index) in stepDefs"
        :key="index"
        :title="step.title"
        :description="step.description"
      />
    </ElSteps>

    <ElForm
      ref="formRef"
      :model="formValues"
      :rules="validationRules"
      :label-position="layout === 'vertical' ? 'top' : 'right'"
      :label-width="labelWidth ?? '80px'"
      v-bind="formProps"
      class="pro-steps-form__form"
    >
      <ElRow :gutter="GRID_GUTTER">
        <ElCol
          v-for="field in currentFields"
          :key="field.key ?? field.dataIndex"
          :span="field.span ?? 24"
        >
          <ProFormField
            :field="field"
            :model-value="formValues[field.dataIndex]"
            :form-values="formValues"
            @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
          />
        </ElCol>
      </ElRow>

      <div class="pro-steps-form__actions">
        <ElButton v-if="!isFirstStep" class="pro-steps-form__prev" @click="handlePrev">
          {{ t('pro.form.steps.prev') }}
        </ElButton>
        <ElButton
          v-if="!isLastStep"
          type="primary"
          class="pro-steps-form__next"
          @click="handleNext"
        >
          {{ t('pro.form.steps.next') }}
        </ElButton>
        <ElButton
          v-if="isLastStep"
          type="primary"
          :loading="loading"
          class="pro-steps-form__submit"
          @click="handleSubmit"
        >
          {{ t('pro.form.steps.submit') }}
        </ElButton>
      </div>
    </ElForm>
  </div>
</template>

<style scoped>
.pro-steps-form__steps {
  margin-bottom: var(--pro-spacing-lg, 24px);
}

.pro-steps-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--pro-spacing-sm, 8px);
  padding-top: var(--pro-spacing-md, 16px);
}
</style>
