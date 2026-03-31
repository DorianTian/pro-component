import { ref, computed, shallowRef, toRaw } from 'vue'
import type { ElForm } from 'element-plus'

import type { ProFieldDef, ProFormConfig, ProFormRule } from '@pro/utils'
import type { UseProFormReturn } from '../types'

/** Grid layout total columns for form row spans */
export const GRID_TOTAL_COLUMNS = 24
/** Default gutter between form grid columns (px) */
export const GRID_GUTTER = 16
/** Default label width for form items */
export const DEFAULT_LABEL_WIDTH = '100px'
/** Default field count threshold before QueryFilter collapses */
export const QUERY_FILTER_DEFAULT_COLLAPSE_THRESHOLD = 3

/**
 * Core composable for schema-driven form state management.
 * Manages form values, validation rules, dirty tracking, submit flow.
 * Integrates with el-form.validate() for Element Plus native validation.
 *
 * @param config - Form configuration with fields, initialValues, onSubmit, onError
 * @returns Reactive form state and control methods
 */
// eslint-disable-next-line max-lines-per-function -- Form orchestrator composable; splitting deferred to dedicated refactor
export function useProForm(config: ProFormConfig): UseProFormReturn {
  const { fields, initialValues = {}, onSubmit, onError } = config

  const formValues = ref({ ...initialValues })
  const isSubmitting = ref(false)
  const loading = ref(false)
  const formRef = shallowRef<InstanceType<typeof ElForm> | null>(null)

  const snapshotInitial = { ...initialValues }

  const visibleFields = computed<ProFieldDef[]>(() => {
    const visible = fields.filter((f) => !f.hideInForm)
    return visible.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  })

  const validationRules = computed<Record<string, ProFormRule[]>>(() => {
    const rules: Record<string, ProFormRule[]> = {}
    for (const field of fields) {
      if (field.rules && field.rules.length > 0) {
        rules[field.dataIndex] = field.rules
      }
    }
    return rules
  })

  const isDirty = computed<boolean>(() => {
    const current = formValues.value
    const initial = snapshotInitial
    const allKeys = new Set([...Object.keys(current), ...Object.keys(initial)])
    for (const key of allKeys) {
      if (current[key] !== initial[key]) {
        return true
      }
    }
    return false
  })

  function setFieldValue(field: string, value: unknown): void {
    formValues.value = { ...formValues.value, [field]: value }
  }

  function setFieldsValue(values: Record<string, unknown>): void {
    formValues.value = { ...formValues.value, ...values }
  }

  function getFieldValue(field: string): unknown {
    return formValues.value[field]
  }

  function resetFields(): void {
    formValues.value = { ...snapshotInitial }
  }

  async function submit(): Promise<boolean> {
    if (isSubmitting.value) {
      return false
    }

    if (!onSubmit) {
      return false
    }

    try {
      isSubmitting.value = true
      loading.value = true

      // Validate via Element Plus form if ref is available
      if (formRef.value) {
        const isValid = await formRef.value.validate().catch(() => false)
        if (!isValid) {
          return false
        }
      }

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

  return {
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
  }
}
