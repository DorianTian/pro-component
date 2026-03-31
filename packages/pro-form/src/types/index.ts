import type { Ref, ComputedRef } from 'vue'
import type { ElForm } from 'element-plus'
import type { ProFieldDef, ProFormConfig, ProFormRule, StepFormDef } from '@pro/utils'

/** Return type of useProForm composable */
export interface UseProFormReturn {
  /** Current form values — reactive ref */
  formValues: Ref<Record<string, unknown>>
  /** Whether the form is currently in loading state */
  loading: Ref<boolean>
  /** Whether a submit is currently in-flight (concurrent submission guard) */
  isSubmitting: Ref<boolean>
  /** Visible fields (filtered by hideInForm, sorted by order) */
  visibleFields: ComputedRef<ProFieldDef[]>
  /** Validation rules collected from field definitions */
  validationRules: ComputedRef<Record<string, ProFormRule[]>>
  /** Whether any field value has changed from initial */
  isDirty: ComputedRef<boolean>
  /** Set a single field value */
  setFieldValue: (field: string, value: unknown) => void
  /** Set multiple field values at once (merges) */
  setFieldsValue: (values: Record<string, unknown>) => void
  /** Get a single field's current value */
  getFieldValue: (field: string) => unknown
  /** Reset all fields to initialValues */
  resetFields: () => void
  /** Trigger submit — validates via el-form, then runs onSubmit handler */
  submit: () => Promise<boolean>
  /** Ref to bind to el-form for programmatic validation */
  formRef: Ref<InstanceType<typeof ElForm> | null>
}

/** Options for useModalForm composable */
export interface UseModalFormOptions extends ProFormConfig {
  /** Dialog title */
  title?: string
  /** Dialog width */
  width?: string | number
  /** Whether to close dialog on submit success */
  closeOnSubmit?: boolean
  /** el-dialog props passthrough */
  dialogProps?: Record<string, unknown>
}

/** Return type of useModalForm */
export interface UseModalFormReturn extends UseProFormReturn {
  /** Whether the dialog is visible */
  visible: Ref<boolean>
  /** Open the dialog */
  open: (initialValues?: Record<string, unknown>) => void
  /** Close the dialog */
  close: () => void
}

/** Options for useDrawerForm composable */
export interface UseDrawerFormOptions extends ProFormConfig {
  /** Drawer title */
  title?: string
  /** Drawer width */
  width?: string | number
  /** Whether to close drawer on submit success */
  closeOnSubmit?: boolean
  /** el-drawer props passthrough */
  drawerProps?: Record<string, unknown>
}

/** Return type of useDrawerForm */
export interface UseDrawerFormReturn extends UseProFormReturn {
  /** Whether the drawer is visible */
  visible: Ref<boolean>
  /** Open the drawer */
  open: (initialValues?: Record<string, unknown>) => void
  /** Close the drawer */
  close: () => void
}

/** Options for useStepsForm composable */
export interface UseStepsFormOptions {
  /** Step definitions with their field groups */
  steps: StepFormDef[]
  /** Submit handler — receives merged values from all steps */
  onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
  /** Error handler — called when submit throws */
  onError?: (error: Error) => void
  /** Initial form values */
  initialValues?: Record<string, unknown>
  /** Element Plus form props passthrough */
  formProps?: Record<string, unknown>
  /** Label width */
  labelWidth?: string | number
}

/** Return type of useStepsForm */
export interface UseStepsFormReturn {
  /** Current step index (0-based) */
  currentStep: Ref<number>
  /** Total number of steps */
  totalSteps: ComputedRef<number>
  /** Whether currently on the first step */
  isFirstStep: ComputedRef<boolean>
  /** Whether currently on the last step */
  isLastStep: ComputedRef<boolean>
  /** Fields for the current step */
  currentFields: ComputedRef<ProFieldDef[]>
  /** Current step definition */
  currentStepDef: ComputedRef<StepFormDef>
  /** All step definitions */
  steps: StepFormDef[]
  /** Merged form values across all steps */
  formValues: Ref<Record<string, unknown>>
  /** Loading state during submit */
  loading: Ref<boolean>
  /** Whether a submit is currently in-flight (concurrent submission guard) */
  isSubmitting: Ref<boolean>
  /** Validation rules for current step fields */
  validationRules: ComputedRef<Record<string, ProFormRule[]>>
  /** Go to next step (validates current step fields via el-form first) */
  nextStep: () => Promise<boolean>
  /** Go to previous step */
  prevStep: () => void
  /** Go to a specific step */
  goToStep: (step: number) => void
  /** Submit the form (only allowed on last step) */
  submit: () => Promise<boolean>
  /** Reset all steps to initial state */
  resetFields: () => void
  /** Ref to bind to el-form */
  formRef: Ref<InstanceType<typeof ElForm> | null>
}
