import { ref, watch } from 'vue'
import { useProForm } from './use-pro-form'

import type { ProFormConfig } from '@pro/utils'
import type { UseModalFormReturn } from '../types'

/**
 * Composable for modal (dialog) form pattern.
 * Wraps useProForm with open/close state and auto-reset on close.
 */
export function useModalForm(config: ProFormConfig): UseModalFormReturn {
  const visible = ref(false)
  const proForm = useProForm(config)

  function open(initialValues?: Record<string, unknown>): void {
    if (initialValues) {
      proForm.setFieldsValue(initialValues)
    }
    visible.value = true
  }

  function close(): void {
    visible.value = false
    proForm.resetFields()
  }

  watch(visible, (val) => {
    if (!val) {
      proForm.resetFields()
    }
  })

  return {
    ...proForm,
    visible,
    open,
    close,
  }
}
