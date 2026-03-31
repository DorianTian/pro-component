import type { InjectionKey } from 'vue'
import type { UseProFormReturn } from './types'

/** ProForm context injection key — typed Symbol, not a magic string */
export const PRO_FORM_INJECTION_KEY: InjectionKey<UseProFormReturn> = Symbol('proForm')

/**
 * ProFormField context injection key — for nested field communication.
 * Fields can inject this to access parent form context.
 */
export interface ProFormFieldContext {
  fieldPath: string
  disabled: boolean
}

export const PRO_FORM_FIELD_INJECTION_KEY: InjectionKey<ProFormFieldContext> =
  Symbol('proFormField')
