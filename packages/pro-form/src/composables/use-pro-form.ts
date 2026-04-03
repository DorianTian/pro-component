import { ref, computed, shallowRef, toRaw } from 'vue'
import type { ElForm } from 'element-plus'

import type {
  ProFieldDef,
  ProFieldGroup,
  ProFormItem,
  ProFormConfig,
  ProFormRule,
} from '@pro/utils'
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
/** Check if an item is a field group */
function isGroup(item: ProFormItem): item is ProFieldGroup {
  return 'type' in item && item.type === 'group'
}

/** Flatten ProFormItem[] (fields + groups) into a flat ProFieldDef[] */
function flattenItems(items: ProFormItem[]): ProFieldDef[] {
  const result: ProFieldDef[] = []
  for (const item of items) {
    if (isGroup(item)) {
      result.push(...item.children)
    } else {
      result.push(item)
    }
  }
  return result
}

export function useProForm(config: ProFormConfig): UseProFormReturn {
  const { fields: rawFields, initialValues = {}, onSubmit, onError } = config

  /** Resolve fields reactively — accepts plain array or computed ref */
  const resolveRawFields = (): ProFormItem[] => {
    if (Array.isArray(rawFields)) return rawFields
    return (rawFields as { value: ProFormItem[] }).value
  }

  const fields = computed(() => flattenItems(resolveRawFields()))

  const formValues = ref({ ...initialValues })
  const isSubmitting = ref(false)
  const loading = ref(false)
  const formRef = shallowRef<InstanceType<typeof ElForm> | null>(null)

  const snapshotInitial = { ...initialValues }

  const visibleFields = computed<ProFieldDef[]>(() => {
    const visible = fields.value.filter((f) => {
      if (f.hideInForm) return false
      if (f.visible && !f.visible(formValues.value)) return false
      return true
    })
    return visible.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  })

  const validationRules = computed<Record<string, ProFormRule[]>>(() => {
    const rules: Record<string, ProFormRule[]> = {}
    for (const field of fields.value) {
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
      const a = current[key]
      const b = initial[key]
      // Deep comparison for objects/arrays, strict for primitives
      if (a !== b && JSON.stringify(a) !== JSON.stringify(b)) {
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
