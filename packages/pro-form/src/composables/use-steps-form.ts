import { ref, computed, shallowRef, toRaw } from 'vue'
import type { ElForm } from 'element-plus'

import type { ProFieldDef, StepFormDef, ProFormRule } from '@pro/utils'
import type { UseStepsFormOptions, UseStepsFormReturn } from '../types'

/**
 * Composable for multi-step form with step validation and navigation.
 * Maintains a single merged form values object across all steps.
 * Validates current step fields via el-form.validateField() before advancing.
 */
// eslint-disable-next-line max-lines-per-function -- Step form orchestrator; splitting deferred to dedicated refactor
export function useStepsForm(options: UseStepsFormOptions): UseStepsFormReturn {
  const { steps, onSubmit, onError, initialValues = {} } = options

  const currentStep = ref(0)
  const formValues = ref({ ...initialValues })
  const loading = ref(false)
  const isSubmitting = ref(false)
  const formRef = shallowRef<InstanceType<typeof ElForm> | null>(null)

  const snapshotInitial = { ...initialValues }

  const totalSteps = computed(() => steps.length)

  const isFirstStep = computed(() => currentStep.value === 0)

  const isLastStep = computed(() => currentStep.value === steps.length - 1)

  const currentStepDef = computed<StepFormDef>(() => steps[currentStep.value])

  const currentFields = computed<ProFieldDef[]>(() => {
    return currentStepDef.value.fields.filter((f) => !f.hideInForm)
  })

  const validationRules = computed<Record<string, ProFormRule[]>>(() => {
    const rules: Record<string, ProFormRule[]> = {}
    for (const field of currentFields.value) {
      if (field.rules && field.rules.length > 0) {
        rules[field.dataIndex] = field.rules
      }
    }
    return rules
  })

  /**
   * Validate current step fields via el-form.validateField().
   * Returns true if all current step fields pass validation.
   */
  async function validateCurrentStep(): Promise<boolean> {
    if (!formRef.value) return true
    const currentFieldKeys = steps[currentStep.value].fields.map((f) => f.dataIndex)
    try {
      await formRef.value.validateField(currentFieldKeys)
      return true
    } catch {
      // el-form.validateField rejects on validation failure -- treat as invalid
      return false
    }
  }

  async function nextStep(): Promise<boolean> {
    const isValid = await validateCurrentStep()
    if (!isValid) return false

    if (currentStep.value < steps.length - 1) {
      currentStep.value++
      return true
    }
    return false
  }

  function prevStep(): void {
    if (currentStep.value <= 0) return
    currentStep.value--
  }

  function goToStep(step: number): void {
    const clamped = Math.max(0, Math.min(step, steps.length - 1))
    currentStep.value = clamped
  }

  async function submit(): Promise<boolean> {
    if (isSubmitting.value) return false
    if (!onSubmit) return false

    try {
      isSubmitting.value = true
      loading.value = true
      const result = await onSubmit(toRaw(formValues.value))
      return result
    } catch (error: unknown) {
      if (error instanceof Error) {
        onError?.(error)
      }
      return false
    } finally {
      isSubmitting.value = false
      loading.value = false
    }
  }

  function resetFields(): void {
    currentStep.value = 0
    formValues.value = { ...snapshotInitial }
  }

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    currentFields,
    currentStepDef,
    steps,
    formValues,
    loading,
    isSubmitting,
    validationRules,
    nextStep,
    prevStep,
    goToStep,
    submit,
    resetFields,
    formRef,
  }
}
