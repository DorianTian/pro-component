import type { VNode } from 'vue'

/** Standard request params passed to ProTable/ProForm request functions */
export interface RequestParams {
  current: number
  pageSize: number
  [key: string]: unknown
}

/** Standard response format from request functions */
export interface RequestResult<T = unknown> {
  data: T[]
  total: number
  success: boolean
}

/** Status type for valueEnum rendering */
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

/** ValueType determines rendering + search control + formatting */
export type ValueType =
  | 'text'
  | 'number'
  | 'digit'
  | 'select'
  | 'date'
  | 'dateRange'
  | 'dateTime'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'money'
  | 'percent'
  | 'progress'
  | 'image'
  | 'code'
  | 'index'
  | 'indexBorder'
  | 'option'
  | 'rate'
  | 'slider'
  | 'cascader'
  | 'treeSelect'

/**
 * Column definition for ProTable and shared across ProDescriptions.
 * Placeholder until Plan 2a provides the full implementation.
 */
export interface ProColumnDef {
  /** Data field key */
  dataIndex: string | string[]
  /** Display title */
  title: string
  /** Unique key (defaults to dataIndex) */
  key?: string
  /** ValueType for rendering/editing */
  valueType?: ValueType
  /** Enum map for select/radio/checkbox */
  valueEnum?: Record<string, { text: string; status?: StatusType; disabled?: boolean }>
  /** Hide in table view */
  hideInTable?: boolean
  /** Hide in search/filter form */
  hideInSearch?: boolean
  /** Hide in descriptions view */
  hideInDescriptions?: boolean
  /** Hide in form */
  hideInForm?: boolean
  /** Search config */
  searchConfig?: { span?: number }
  /** Custom render for descriptions view */
  descriptionsRender?: (value: unknown, row: Record<string, unknown>) => VNode | string
}

/** Form layout direction */
export type FormLayout = 'horizontal' | 'vertical' | 'inline'

/** Validation rule compatible with Element Plus FormRule */
export interface ProFormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ('blur' | 'change')[]
  min?: number
  max?: number
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
  pattern?: RegExp
  validator?: (rule: unknown, value: unknown, callback: (error?: Error) => void) => void
}

/**
 * Field definition for ProForm.
 * Shares the valueType system with ProColumnDef but adds form-specific config.
 */
export interface ProFieldDef {
  /** Field name — used as form model key and validation key */
  dataIndex: string
  /** Display label */
  title: string
  /** Unique key (defaults to dataIndex) */
  key?: string

  /** Determines which Element Plus form control to render */
  valueType?: ValueType
  /** Options for select/radio/checkbox valueTypes */
  valueEnum?: Record<string, { text: string; status?: StatusType }>

  /** Element Plus form-item props passthrough */
  fieldProps?: Record<string, unknown>
  /** Form item wrapper props (label-width, etc.) */
  formItemProps?: Record<string, unknown>

  /** Grid span (out of 24) for responsive layout */
  span?: number
  /** Sort order in form layout */
  order?: number

  /** Validation rules */
  rules?: ProFormRule[]
  /** Default value */
  defaultValue?: unknown

  /** Hide this field in the form */
  hideInForm?: boolean

  /** Custom render function — overrides valueType rendering */
  renderFormItem?: (modelValue: unknown, onChange: (val: unknown) => void) => VNode

  /** Placeholder text */
  placeholder?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is readonly */
  readonly?: boolean

  /** Tooltip help text shown next to label */
  tooltip?: string

  /** Dependencies — re-render when these fields change */
  dependencies?: string[]

  /**
   * Dynamic field props — compute props based on current form values.
   * Return partial fieldProps merged over static fieldProps.
   */
  getFieldProps?: (formValues: Record<string, unknown>) => Record<string, unknown>
}

/** Step definition for StepsForm */
export interface StepFormDef {
  /** Step title shown in el-steps */
  title: string
  /** Optional step description */
  description?: string
  /** Optional step icon */
  icon?: string
  /** Fields for this step */
  fields: ProFieldDef[]
}

/**
 * ProForm props interface.
 * Used by ProForm.vue component and useProForm composable.
 */
export interface ProFormConfig {
  /** Form layout direction */
  layout?: FormLayout
  /** Field definitions */
  fields: ProFieldDef[]
  /** Initial form values */
  initialValues?: Record<string, unknown>
  /** Submit handler — receives validated form values */
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
  /** Error handler — called when submit throws */
  onError?: (error: Error) => void
  /** Element Plus form props passthrough */
  formProps?: Record<string, unknown>
  /** Label width */
  labelWidth?: string | number
  /** Whether to show action buttons (submit/reset) */
  showActions?: boolean
  /** Submit button text */
  submitText?: string
  /** Reset button text */
  resetText?: string
  /** Number of columns in grid layout */
  columns?: number
}
