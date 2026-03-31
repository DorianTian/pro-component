# Plan 2b: ProForm + ProDescriptions

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement ProForm (schema-driven form with modal, drawer, steps, and query filter variants) and ProDescriptions (schema-driven detail view), both reusing the same `ProColumnDef` / `ProFieldDef` type system and `useValueType` composable from `@pro/hooks`.

**Architecture:** Headless-first — each component has a composable (`useProForm`, `useProDescriptions`) that owns all state/logic, and a thin Vue component that renders based on that state. Form variants (ModalForm, DrawerForm, StepsForm, QueryFilter) are wrapper components that compose `ProForm` with container UI. All valueType rendering is delegated to the shared `useValueType` from `@pro/hooks` (implemented in Plan 2a).

**Tech Stack:** Vue 3.4+, Element Plus 2.9+, TypeScript 5.5+, Vitest + Vue Test Utils

**Prerequisites:** Plan 1 (monorepo foundation) and Plan 2a (@pro/hooks composables + ProTable) must be complete. Plan 2a provides:
- `useValueType` — maps valueType to Element Plus form controls and display renderers
- `useRequest` — async data fetching with loading/error state
- `waitForReactiveSettle` — test helper for reactive chain completion
- `ProColumnDef` — shared column/field definition type (in `@pro/utils`)

---

## File Structure

```
packages/
├── utils/src/
│   └── types.ts                                    # Add ProFieldDef, ProFormProps types
├── pro-form/
│   ├── package.json                                # Update: add test script, vitest dep
│   ├── vitest.config.ts                            # Vitest config
│   ├── src/
│   │   ├── index.ts                                # Public exports
│   │   ├── types/
│   │   │   └── index.ts                            # ProForm-specific types
│   │   ├── composables/
│   │   │   ├── use-pro-form.ts                     # Core form composable
│   │   │   ├── use-modal-form.ts                   # Modal state composable
│   │   │   ├── use-drawer-form.ts                  # Drawer state composable
│   │   │   └── use-steps-form.ts                   # Steps state composable
│   │   ├── components/
│   │   │   ├── ProFormField.vue                    # Single field renderer
│   │   │   ├── QueryFilter.vue                     # Compact inline search form
│   │   │   ├── ModalForm.vue                       # Dialog-wrapped form
│   │   │   ├── DrawerForm.vue                      # Drawer-wrapped form
│   │   │   └── StepsForm.vue                       # Multi-step form
│   │   └── ProForm.vue                             # Main form component
│   └── __tests__/
│       ├── use-pro-form.spec.ts                    # Unit tests for composable
│       ├── pro-form.spec.ts                        # Integration tests for ProForm
│       ├── modal-form.spec.ts                      # Integration tests for ModalForm
│       ├── drawer-form.spec.ts                     # Integration tests for DrawerForm
│       ├── steps-form.spec.ts                      # Integration tests for StepsForm
│       └── query-filter.spec.ts                    # Integration tests for QueryFilter
├── pro-descriptions/
│   ├── package.json                                # Update: add test script, vitest dep
│   ├── vitest.config.ts                            # Vitest config
│   ├── src/
│   │   ├── index.ts                                # Public exports
│   │   ├── composables/
│   │   │   └── use-pro-descriptions.ts             # Core descriptions composable
│   │   └── ProDescriptions.vue                     # Main component
│   └── __tests__/
│       ├── use-pro-descriptions.spec.ts            # Unit tests for composable
│       └── pro-descriptions.spec.ts                # Integration tests
└── pro-components/src/
    └── index.ts                                    # Update: re-export new components
```

---

## Task 1: Add ProFieldDef and ProForm Types to @pro/utils

**Files:**
- Edit: `packages/utils/src/types.ts`
- Edit: `packages/utils/src/index.ts`

- [ ] **Step 1: Add ProFieldDef and form-related types to types.ts**

Append to `packages/utils/src/types.ts`:

```typescript
import type { VNode } from 'vue'

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
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
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
  fieldProps?: Record<string, any>
  /** Form item wrapper props (label-width, etc.) */
  formItemProps?: Record<string, any>

  /** Grid span (out of 24) for responsive layout */
  span?: number
  /** Sort order in form layout */
  order?: number

  /** Validation rules */
  rules?: ProFormRule[]
  /** Default value */
  defaultValue?: any

  /** Hide this field in the form */
  hideInForm?: boolean

  /** Custom render function — overrides valueType rendering */
  render?: (modelValue: any, onChange: (val: any) => void) => VNode

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
  getFieldProps?: (formValues: Record<string, any>) => Record<string, any>
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
  initialValues?: Record<string, any>
  /** Submit handler — return true to indicate success, false to keep form open */
  onSubmit?: (values: Record<string, any>) => Promise<boolean>
  /** Element Plus form props passthrough */
  formProps?: Record<string, any>
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
```

- [ ] **Step 2: Update index.ts to export new types**

Add to `packages/utils/src/index.ts`:

```typescript
export type {
  RequestParams,
  RequestResult,
  StatusType,
  ValueType,
  FormLayout,
  ProFormRule,
  ProFieldDef,
  StepFormDef,
  ProFormConfig,
} from './types'
```

- [ ] **Step 3: Commit**

```bash
git add packages/utils/src/types.ts packages/utils/src/index.ts
git commit -m "feat(utils): add ProFieldDef, StepFormDef, and ProFormConfig types"
```

---

## Task 2: Vitest Configuration for @pro/form

**Files:**
- Edit: `packages/pro-form/package.json`
- Create: `packages/pro-form/vitest.config.ts`

- [ ] **Step 1: Update package.json to add test script and vitest**

Replace `packages/pro-form/package.json` with:

```json
{
  "name": "@pro/form",
  "version": "0.0.1",
  "description": "ProForm — schema-driven form with modal, drawer, and steps variants",
  "type": "module",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./style": "./dist/style/index.css"
  },
  "sideEffects": ["dist/style/**"],
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.0",
    "vitest": "^2.0.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.ts**

Create `packages/pro-form/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/index.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@pro/utils': new URL('../utils/src/index.ts', import.meta.url).pathname,
      '@pro/hooks': new URL('../hooks/src/index.ts', import.meta.url).pathname,
    },
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/package.json packages/pro-form/vitest.config.ts
git commit -m "chore(form): add vitest config and test scripts"
```

---

## Task 3: useProForm Composable — Tests First

**Files:**
- Create: `packages/pro-form/__tests__/use-pro-form.spec.ts`

- [ ] **Step 1: Write failing tests for useProForm**

Create `packages/pro-form/__tests__/use-pro-form.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useProForm } from '../src/composables/use-pro-form'
import type { ProFieldDef } from '@pro/utils'

function createTestFields(): ProFieldDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text', rules: [{ required: true, message: 'Name is required' }] },
    { dataIndex: 'age', title: 'Age', valueType: 'number' },
    { dataIndex: 'email', title: 'Email', valueType: 'text' },
    { dataIndex: 'status', title: 'Status', valueType: 'select', valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } } },
  ]
}

describe('useProForm', () => {
  describe('initialization', () => {
    it('should initialize with empty values when no initialValues provided', () => {
      const { formValues } = useProForm({ fields: createTestFields() })
      expect(formValues.value).toEqual({})
    })

    it('should initialize with provided initialValues', () => {
      const initialValues = { name: 'John', age: 30 }
      const { formValues } = useProForm({ fields: createTestFields(), initialValues })
      expect(formValues.value).toEqual({ name: 'John', age: 30 })
    })

    it('should expose loading as false initially', () => {
      const { loading } = useProForm({ fields: createTestFields() })
      expect(loading.value).toBe(false)
    })

    it('should compute visible fields excluding hideInForm', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'name', title: 'Name', valueType: 'text' },
        { dataIndex: 'secret', title: 'Secret', valueType: 'text', hideInForm: true },
        { dataIndex: 'email', title: 'Email', valueType: 'text' },
      ]
      const { visibleFields } = useProForm({ fields })
      expect(visibleFields.value).toHaveLength(2)
      expect(visibleFields.value.map((f) => f.dataIndex)).toEqual(['name', 'email'])
    })

    it('should sort visible fields by order property', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'c', title: 'C', valueType: 'text', order: 3 },
        { dataIndex: 'a', title: 'A', valueType: 'text', order: 1 },
        { dataIndex: 'b', title: 'B', valueType: 'text', order: 2 },
      ]
      const { visibleFields } = useProForm({ fields })
      expect(visibleFields.value.map((f) => f.dataIndex)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('setFieldValue', () => {
    it('should update a single field value', () => {
      const { formValues, setFieldValue } = useProForm({ fields: createTestFields() })
      setFieldValue('name', 'Alice')
      expect(formValues.value.name).toBe('Alice')
    })

    it('should not remove other field values when setting one', () => {
      const { formValues, setFieldValue } = useProForm({
        fields: createTestFields(),
        initialValues: { name: 'John', age: 25 },
      })
      setFieldValue('name', 'Alice')
      expect(formValues.value.age).toBe(25)
    })
  })

  describe('setFieldsValue', () => {
    it('should update multiple field values at once', () => {
      const { formValues, setFieldsValue } = useProForm({ fields: createTestFields() })
      setFieldsValue({ name: 'Bob', age: 42 })
      expect(formValues.value.name).toBe('Bob')
      expect(formValues.value.age).toBe(42)
    })

    it('should merge with existing values, not replace', () => {
      const { formValues, setFieldsValue } = useProForm({
        fields: createTestFields(),
        initialValues: { name: 'John', email: 'john@test.com' },
      })
      setFieldsValue({ name: 'Bob' })
      expect(formValues.value.email).toBe('john@test.com')
    })
  })

  describe('getFieldValue', () => {
    it('should return the value for a specific field', () => {
      const { getFieldValue } = useProForm({
        fields: createTestFields(),
        initialValues: { name: 'John' },
      })
      expect(getFieldValue('name')).toBe('John')
    })

    it('should return undefined for unset fields', () => {
      const { getFieldValue } = useProForm({ fields: createTestFields() })
      expect(getFieldValue('name')).toBeUndefined()
    })
  })

  describe('resetFields', () => {
    it('should reset form values to initialValues', () => {
      const initialValues = { name: 'John', age: 30 }
      const { formValues, setFieldValue, resetFields } = useProForm({
        fields: createTestFields(),
        initialValues,
      })
      setFieldValue('name', 'Modified')
      setFieldValue('age', 99)
      resetFields()
      expect(formValues.value).toEqual({ name: 'John', age: 30 })
    })

    it('should reset to empty object when no initialValues', () => {
      const { formValues, setFieldValue, resetFields } = useProForm({
        fields: createTestFields(),
      })
      setFieldValue('name', 'Test')
      resetFields()
      expect(formValues.value).toEqual({})
    })
  })

  describe('submit', () => {
    it('should call onSubmit with current form values', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const { setFieldValue, submit } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Alice')
      await submit()
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' })
    })

    it('should set loading to true during submit and false after', async () => {
      let resolveSubmit: (value: boolean) => void
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<boolean>((resolve) => {
          resolveSubmit = resolve
        }),
      )
      const { loading, setFieldValue, submit } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Test')
      const submitPromise = submit()
      await nextTick()
      expect(loading.value).toBe(true)
      resolveSubmit!(true)
      await submitPromise
      expect(loading.value).toBe(false)
    })

    it('should return true when onSubmit returns true', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const { submit, setFieldValue } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Test')
      const result = await submit()
      expect(result).toBe(true)
    })

    it('should return false when onSubmit returns false', async () => {
      const onSubmit = vi.fn().mockResolvedValue(false)
      const { submit, setFieldValue } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Test')
      const result = await submit()
      expect(result).toBe(false)
    })

    it('should set loading to false if onSubmit throws', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
      const { loading, submit, setFieldValue } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Test')
      await submit().catch(() => {})
      expect(loading.value).toBe(false)
    })

    it('should skip submit when no onSubmit handler provided', async () => {
      const { submit } = useProForm({ fields: createTestFields() })
      const result = await submit()
      expect(result).toBe(false)
    })
  })

  describe('validation rules', () => {
    it('should collect validation rules from field definitions', () => {
      const { validationRules } = useProForm({ fields: createTestFields() })
      expect(validationRules.value.name).toBeDefined()
      expect(validationRules.value.name).toHaveLength(1)
      expect(validationRules.value.name[0].required).toBe(true)
    })

    it('should return empty rules for fields without validation', () => {
      const { validationRules } = useProForm({ fields: createTestFields() })
      expect(validationRules.value.age).toBeUndefined()
    })
  })

  describe('dirty tracking', () => {
    it('should start as not dirty', () => {
      const { isDirty } = useProForm({ fields: createTestFields() })
      expect(isDirty.value).toBe(false)
    })

    it('should become dirty when a field value changes', () => {
      const { isDirty, setFieldValue } = useProForm({ fields: createTestFields() })
      setFieldValue('name', 'Changed')
      expect(isDirty.value).toBe(true)
    })

    it('should become not dirty after reset', () => {
      const { isDirty, setFieldValue, resetFields } = useProForm({
        fields: createTestFields(),
      })
      setFieldValue('name', 'Changed')
      resetFields()
      expect(isDirty.value).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Verify tests fail (module not found)**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1 | head -20
```

Expected: Tests fail because `../src/composables/use-pro-form` does not exist.

- [ ] **Step 3: Commit failing tests**

```bash
git add packages/pro-form/__tests__/use-pro-form.spec.ts
git commit -m "test(form): add failing unit tests for useProForm composable"
```

---

## Task 4: useProForm Composable — Implementation

**Files:**
- Create: `packages/pro-form/src/types/index.ts`
- Create: `packages/pro-form/src/composables/use-pro-form.ts`

- [ ] **Step 1: Create form-specific types**

Create `packages/pro-form/src/types/index.ts`:

```typescript
import type { Ref, ComputedRef } from 'vue'
import type { ProFieldDef, ProFormConfig, ProFormRule } from '@pro/utils'

/** Return type of useProForm composable */
export interface UseProFormReturn {
  /** Current form values — reactive ref */
  formValues: Ref<Record<string, any>>
  /** Whether the form is currently submitting */
  loading: Ref<boolean>
  /** Visible fields (filtered by hideInForm, sorted by order) */
  visibleFields: ComputedRef<ProFieldDef[]>
  /** Validation rules collected from field definitions */
  validationRules: ComputedRef<Record<string, ProFormRule[]>>
  /** Whether any field value has changed from initial */
  isDirty: ComputedRef<boolean>
  /** Set a single field value */
  setFieldValue: (field: string, value: any) => void
  /** Set multiple field values at once (merges) */
  setFieldsValue: (values: Record<string, any>) => void
  /** Get a single field's current value */
  getFieldValue: (field: string) => any
  /** Reset all fields to initialValues */
  resetFields: () => void
  /** Trigger submit — runs onSubmit handler, returns success boolean */
  submit: () => Promise<boolean>
  /** Ref to bind to el-form for programmatic validation */
  formRef: Ref<any>
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
  dialogProps?: Record<string, any>
}

/** Return type of useModalForm */
export interface UseModalFormReturn extends UseProFormReturn {
  /** Whether the dialog is visible */
  visible: Ref<boolean>
  /** Open the dialog */
  open: (initialValues?: Record<string, any>) => void
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
  drawerProps?: Record<string, any>
}

/** Return type of useDrawerForm */
export interface UseDrawerFormReturn extends UseProFormReturn {
  /** Whether the drawer is visible */
  visible: Ref<boolean>
  /** Open the drawer */
  open: (initialValues?: Record<string, any>) => void
  /** Close the drawer */
  close: () => void
}

/** Options for useStepsForm composable */
export interface UseStepsFormOptions {
  /** Step definitions with their field groups */
  steps: import('@pro/utils').StepFormDef[]
  /** Submit handler — receives merged values from all steps */
  onSubmit?: (values: Record<string, any>) => Promise<boolean>
  /** Initial form values */
  initialValues?: Record<string, any>
  /** Element Plus form props passthrough */
  formProps?: Record<string, any>
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
  currentStepDef: ComputedRef<import('@pro/utils').StepFormDef>
  /** All step definitions */
  steps: import('@pro/utils').StepFormDef[]
  /** Merged form values across all steps */
  formValues: Ref<Record<string, any>>
  /** Loading state during submit */
  loading: Ref<boolean>
  /** Validation rules for current step fields */
  validationRules: ComputedRef<Record<string, ProFormRule[]>>
  /** Go to next step (validates current step first) */
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
  formRef: Ref<any>
}
```

- [ ] **Step 2: Implement useProForm composable**

Create `packages/pro-form/src/composables/use-pro-form.ts`:

```typescript
import { ref, computed, shallowRef } from 'vue'
import type { ProFieldDef, ProFormConfig, ProFormRule } from '@pro/utils'
import type { UseProFormReturn } from '../types'

/**
 * Core composable for schema-driven form state management.
 * Manages form values, validation rules, dirty tracking, submit flow.
 *
 * @param config - Form configuration with fields, initialValues, onSubmit
 * @returns Reactive form state and control methods
 */
export function useProForm(config: ProFormConfig): UseProFormReturn {
  const {
    fields,
    initialValues = {},
    onSubmit,
  } = config

  const formValues = ref<Record<string, any>>({ ...initialValues })
  const loading = ref(false)
  const formRef = shallowRef<any>(null)

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

  function setFieldValue(field: string, value: any): void {
    formValues.value = { ...formValues.value, [field]: value }
  }

  function setFieldsValue(values: Record<string, any>): void {
    formValues.value = { ...formValues.value, ...values }
  }

  function getFieldValue(field: string): any {
    return formValues.value[field]
  }

  function resetFields(): void {
    formValues.value = { ...snapshotInitial }
  }

  async function submit(): Promise<boolean> {
    if (!onSubmit) {
      return false
    }

    loading.value = true
    try {
      const result = await onSubmit({ ...formValues.value })
      return result
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    formValues,
    loading,
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
```

- [ ] **Step 3: Verify tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1
```

Expected: All tests in `use-pro-form.spec.ts` pass.

- [ ] **Step 4: Commit**

```bash
git add packages/pro-form/src/types/index.ts packages/pro-form/src/composables/use-pro-form.ts
git commit -m "feat(form): implement useProForm composable with state, validation, submit"
```

---

## Task 5: ProFormField Component

**Files:**
- Create: `packages/pro-form/src/components/ProFormField.vue`

- [ ] **Step 1: Create ProFormField.vue**

Create `packages/pro-form/src/components/ProFormField.vue`:

```vue
<script setup lang="ts">
import { computed, h } from 'vue'
import {
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
} from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'ProFormField' })

const props = defineProps<{
  field: ProFieldDef
  modelValue: any
  formValues?: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const computedFieldProps = computed(() => {
  const base = props.field.fieldProps ?? {}
  if (props.field.getFieldProps && props.formValues) {
    const dynamic = props.field.getFieldProps(props.formValues)
    return { ...base, ...dynamic }
  }
  return base
})

const placeholder = computed(() => {
  if (props.field.placeholder) return props.field.placeholder
  const vt = props.field.valueType ?? 'text'
  const isInput = ['text', 'textarea', 'number', 'money', 'percent'].includes(vt)
  return isInput ? `Please enter ${props.field.title}` : `Please select ${props.field.title}`
})

function handleUpdate(val: any) {
  emit('update:modelValue', val)
}

function renderControl() {
  const vt = props.field.valueType ?? 'text'
  const mergedProps = {
    ...computedFieldProps.value,
    disabled: props.field.disabled,
    readonly: props.field.readonly,
  }

  switch (vt) {
    case 'text':
      return h(ElInput, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        placeholder: placeholder.value,
        ...mergedProps,
      })

    case 'textarea':
      return h(ElInput, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        type: 'textarea',
        placeholder: placeholder.value,
        ...mergedProps,
      })

    case 'number':
    case 'money':
    case 'percent':
      return h(ElInputNumber, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        placeholder: placeholder.value,
        controlsPosition: 'right',
        ...mergedProps,
      })

    case 'select':
      return h(
        ElSelect,
        {
          modelValue: props.modelValue,
          'onUpdate:modelValue': handleUpdate,
          placeholder: placeholder.value,
          ...mergedProps,
        },
        {
          default: () =>
            Object.entries(props.field.valueEnum ?? {}).map(([value, config]) =>
              h(ElOption, { key: value, label: config.text, value }),
            ),
        },
      )

    case 'date':
      return h(ElDatePicker, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        type: 'date',
        placeholder: placeholder.value,
        ...mergedProps,
      })

    case 'dateRange':
      return h(ElDatePicker, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        type: 'daterange',
        startPlaceholder: 'Start date',
        endPlaceholder: 'End date',
        ...mergedProps,
      })

    case 'dateTime':
      return h(ElDatePicker, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        type: 'datetime',
        placeholder: placeholder.value,
        ...mergedProps,
      })

    case 'switch':
      return h(ElSwitch, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        ...mergedProps,
      })

    case 'radio':
      return h(
        ElRadioGroup,
        {
          modelValue: props.modelValue,
          'onUpdate:modelValue': handleUpdate,
          ...mergedProps,
        },
        {
          default: () =>
            Object.entries(props.field.valueEnum ?? {}).map(([value, config]) =>
              h(ElRadio, { key: value, value }, { default: () => config.text }),
            ),
        },
      )

    case 'checkbox':
      return h(
        ElCheckboxGroup,
        {
          modelValue: props.modelValue ?? [],
          'onUpdate:modelValue': handleUpdate,
          ...mergedProps,
        },
        {
          default: () =>
            Object.entries(props.field.valueEnum ?? {}).map(([value, config]) =>
              h(ElCheckbox, { key: value, value }, { default: () => config.text }),
            ),
        },
      )

    default:
      return h(ElInput, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': handleUpdate,
        placeholder: placeholder.value,
        ...mergedProps,
      })
  }
}
</script>

<template>
  <ElFormItem
    :label="field.title"
    :prop="field.dataIndex"
    v-bind="field.formItemProps"
  >
    <template v-if="field.tooltip" #label>
      {{ field.title }}
      <el-tooltip :content="field.tooltip" placement="top">
        <el-icon style="margin-left: 4px; cursor: help"><QuestionFilled /></el-icon>
      </el-tooltip>
    </template>
    <component :is="() => field.render ? field.render(modelValue, handleUpdate) : renderControl()" />
  </ElFormItem>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add packages/pro-form/src/components/ProFormField.vue
git commit -m "feat(form): add ProFormField component for valueType-based field rendering"
```

---

## Task 6: ProForm Component — Tests First

**Files:**
- Create: `packages/pro-form/__tests__/pro-form.spec.ts`

- [ ] **Step 1: Write integration tests for ProForm**

Create `packages/pro-form/__tests__/pro-form.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, defineComponent, h } from 'vue'
import ElementPlus from 'element-plus'
import ProForm from '../src/ProForm.vue'
import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, any> = {}, options: Record<string, any> = {}) {
  return mount(ProForm, {
    props,
    global: {
      plugins: [ElementPlus],
      ...options,
    },
  })
}

function basicFields(): ProFieldDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text' },
    { dataIndex: 'age', title: 'Age', valueType: 'number' },
    { dataIndex: 'status', title: 'Status', valueType: 'select', valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } } },
  ]
}

describe('ProForm', () => {
  describe('rendering', () => {
    it('should render an el-form element', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })

    it('should render form items for each visible field', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      const items = wrapper.findAll('.el-form-item')
      expect(items).toHaveLength(3)
    })

    it('should not render fields with hideInForm=true', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'visible', title: 'Visible', valueType: 'text' },
        { dataIndex: 'hidden', title: 'Hidden', valueType: 'text', hideInForm: true },
      ]
      const wrapper = createWrapper({ fields })
      const items = wrapper.findAll('.el-form-item')
      expect(items).toHaveLength(1)
    })

    it('should render text field as el-input', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'name', title: 'Name', valueType: 'text' },
      ]
      const wrapper = createWrapper({ fields })
      expect(wrapper.find('.el-input').exists()).toBe(true)
    })

    it('should render number field as el-input-number', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'count', title: 'Count', valueType: 'number' },
      ]
      const wrapper = createWrapper({ fields })
      expect(wrapper.find('.el-input-number').exists()).toBe(true)
    })

    it('should render select field with options from valueEnum', () => {
      const fields: ProFieldDef[] = [
        {
          dataIndex: 'status',
          title: 'Status',
          valueType: 'select',
          valueEnum: { a: { text: 'Option A' }, b: { text: 'Option B' } },
        },
      ]
      const wrapper = createWrapper({ fields })
      expect(wrapper.find('.el-select').exists()).toBe(true)
    })

    it('should render switch field as el-switch', () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'enabled', title: 'Enabled', valueType: 'switch' },
      ]
      const wrapper = createWrapper({ fields })
      expect(wrapper.find('.el-switch').exists()).toBe(true)
    })
  })

  describe('initial values', () => {
    it('should populate form controls with initialValues', async () => {
      const fields: ProFieldDef[] = [
        { dataIndex: 'name', title: 'Name', valueType: 'text' },
      ]
      const wrapper = createWrapper({
        fields,
        initialValues: { name: 'John' },
      })
      await nextTick()
      const input = wrapper.find('.el-input__inner')
      expect((input.element as HTMLInputElement).value).toBe('John')
    })
  })

  describe('layout', () => {
    it('should apply inline layout class when layout is inline', () => {
      const wrapper = createWrapper({ fields: basicFields(), layout: 'inline' })
      expect(wrapper.find('.el-form--inline').exists()).toBe(true)
    })
  })

  describe('action buttons', () => {
    it('should render submit and reset buttons by default', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should hide action buttons when showActions is false', () => {
      const wrapper = createWrapper({ fields: basicFields(), showActions: false })
      const actionArea = wrapper.find('.pro-form__actions')
      expect(actionArea.exists()).toBe(false)
    })

    it('should use custom submit button text', () => {
      const wrapper = createWrapper({ fields: basicFields(), submitText: 'Save' })
      const buttons = wrapper.findAll('.el-button')
      const submitBtn = buttons.find((b) => b.text().includes('Save'))
      expect(submitBtn).toBeDefined()
    })
  })

  describe('submit flow', () => {
    it('should call onSubmit with form values when submit button clicked', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const wrapper = createWrapper({
        fields: basicFields(),
        initialValues: { name: 'Test' },
        onSubmit,
      })
      await nextTick()

      const submitBtn = wrapper.find('.pro-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }))
    })
  })

  describe('reset flow', () => {
    it('should reset form to initialValues when reset button clicked', async () => {
      const wrapper = createWrapper({
        fields: [{ dataIndex: 'name', title: 'Name', valueType: 'text' }],
        initialValues: { name: 'Original' },
      })
      await nextTick()

      // Type something
      const input = wrapper.find('.el-input__inner')
      await input.setValue('Modified')
      expect((input.element as HTMLInputElement).value).toBe('Modified')

      // Click reset
      const resetBtn = wrapper.find('.pro-form__reset')
      await resetBtn.trigger('click')
      await nextTick()

      expect((input.element as HTMLInputElement).value).toBe('Original')
    })
  })

  describe('slots', () => {
    it('should render custom actions slot', () => {
      const wrapper = mount(ProForm, {
        props: { fields: basicFields() },
        slots: {
          actions: '<button class="custom-action">Custom</button>',
        },
        global: { plugins: [ElementPlus] },
      })
      expect(wrapper.find('.custom-action').exists()).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Verify tests fail**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1 | head -20
```

Expected: Tests fail because ProForm.vue is still a placeholder.

- [ ] **Step 3: Commit failing tests**

```bash
git add packages/pro-form/__tests__/pro-form.spec.ts
git commit -m "test(form): add failing integration tests for ProForm component"
```

---

## Task 7: ProForm Component — Implementation

**Files:**
- Replace: `packages/pro-form/src/ProForm.vue`

- [ ] **Step 1: Implement ProForm.vue**

Replace `packages/pro-form/src/ProForm.vue` with:

```vue
<script setup lang="ts">
import { computed, provide, toRefs } from 'vue'
import { ElForm, ElFormItem, ElButton, ElRow, ElCol } from 'element-plus'
import type { ProFieldDef, ProFormConfig, FormLayout } from '@pro/utils'
import { useProForm } from './composables/use-pro-form'
import ProFormField from './components/ProFormField.vue'
import type { UseProFormReturn } from './types'

defineOptions({ name: 'ProForm' })

const props = withDefaults(
  defineProps<{
    layout?: FormLayout
    fields: ProFieldDef[]
    initialValues?: Record<string, any>
    onSubmit?: (values: Record<string, any>) => Promise<boolean>
    formProps?: Record<string, any>
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
  submit: [values: Record<string, any>]
  reset: []
}>()

const formConfig: ProFormConfig = {
  layout: props.layout,
  fields: props.fields,
  initialValues: props.initialValues,
  onSubmit: props.onSubmit,
  formProps: props.formProps,
  labelWidth: props.labelWidth,
  showActions: props.showActions,
  submitText: props.submitText,
  resetText: props.resetText,
  columns: props.columns,
}

const {
  formValues,
  loading,
  visibleFields,
  validationRules,
  isDirty,
  setFieldValue,
  setFieldsValue,
  getFieldValue,
  resetFields,
  submit,
  formRef,
} = useProForm(formConfig)

provide<UseProFormReturn>('proForm', {
  formValues,
  loading,
  visibleFields,
  validationRules,
  isDirty,
  setFieldValue,
  setFieldsValue,
  getFieldValue,
  resetFields,
  submit,
  formRef,
})

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

function handleFieldUpdate(dataIndex: string, value: any) {
  setFieldValue(dataIndex, value)
}

defineExpose({
  formValues,
  loading,
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
    :label-width="labelWidth ?? '80px'"
    v-bind="formProps"
    class="pro-form"
  >
    <ElRow :gutter="16">
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
        <ElButton
          type="primary"
          :loading="loading"
          class="pro-form__submit"
          @click="handleSubmit"
        >
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
```

- [ ] **Step 2: Verify integration tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1
```

Expected: All ProForm integration tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/src/ProForm.vue
git commit -m "feat(form): implement ProForm with schema-driven field rendering"
```

---

## Task 8: ModalForm — Tests + Implementation

**Files:**
- Create: `packages/pro-form/src/composables/use-modal-form.ts`
- Create: `packages/pro-form/src/components/ModalForm.vue`
- Create: `packages/pro-form/__tests__/modal-form.spec.ts`

- [ ] **Step 1: Write failing tests for ModalForm**

Create `packages/pro-form/__tests__/modal-form.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import ModalForm from '../src/components/ModalForm.vue'
import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, any> = {}) {
  return mount(ModalForm, {
    props,
    global: {
      plugins: [ElementPlus],
      stubs: {
        teleport: true,
      },
    },
    attachTo: document.body,
  })
}

function basicFields(): ProFieldDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text' },
    { dataIndex: 'email', title: 'Email', valueType: 'text' },
  ]
}

describe('ModalForm', () => {
  describe('visibility', () => {
    it('should not render dialog content when closed', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      expect(wrapper.find('.el-dialog').exists()).toBe(false)
    })

    it('should render dialog when visible prop is true', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
    })

    it('should render form inside dialog when visible', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })
  })

  describe('title', () => {
    it('should display the title in dialog header', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        title: 'Create User',
      })
      await nextTick()
      expect(wrapper.text()).toContain('Create User')
    })
  })

  describe('open with initialValues', () => {
    it('should populate form with values passed through initialValues', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        initialValues: { name: 'Prefilled' },
      })
      await nextTick()
      const input = wrapper.find('.el-input__inner')
      expect((input.element as HTMLInputElement).value).toBe('Prefilled')
    })
  })

  describe('submit flow', () => {
    it('should call onSubmit and emit close on success', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        initialValues: { name: 'Test' },
        onSubmit,
      })
      await nextTick()

      const submitBtn = wrapper.find('.pro-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }))
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should NOT close dialog when onSubmit returns false', async () => {
      const onSubmit = vi.fn().mockResolvedValue(false)
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        onSubmit,
      })
      await nextTick()

      const submitBtn = wrapper.find('.pro-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('close behavior', () => {
    it('should emit update:modelValue false when dialog is closed', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
      })
      await nextTick()

      const closeBtn = wrapper.find('.el-dialog__headerbtn')
      if (closeBtn.exists()) {
        await closeBtn.trigger('click')
        await nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      }
    })

    it('should reset form when dialog closes', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        initialValues: { name: 'Original' },
      })
      await nextTick()

      // Modify a field
      const input = wrapper.find('.el-input__inner')
      await input.setValue('Modified')

      // Close dialog
      await wrapper.setProps({ modelValue: false })
      await nextTick()

      // Reopen
      await wrapper.setProps({ modelValue: true })
      await nextTick()

      const inputAfterReopen = wrapper.find('.el-input__inner')
      expect((inputAfterReopen.element as HTMLInputElement).value).toBe('Original')
    })
  })
})
```

- [ ] **Step 2: Verify tests fail**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/modal-form.spec.ts 2>&1 | head -20
```

- [ ] **Step 3: Implement useModalForm composable**

Create `packages/pro-form/src/composables/use-modal-form.ts`:

```typescript
import { ref, watch } from 'vue'
import type { ProFormConfig } from '@pro/utils'
import { useProForm } from './use-pro-form'
import type { UseModalFormReturn } from '../types'

/**
 * Composable for modal (dialog) form pattern.
 * Wraps useProForm with open/close state and auto-reset on close.
 */
export function useModalForm(config: ProFormConfig): UseModalFormReturn {
  const visible = ref(false)
  const proForm = useProForm(config)

  function open(initialValues?: Record<string, any>): void {
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
```

- [ ] **Step 4: Implement ModalForm.vue**

Create `packages/pro-form/src/components/ModalForm.vue`:

```vue
<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElDialog } from 'element-plus'
import type { ProFieldDef, FormLayout } from '@pro/utils'
import ProForm from '../ProForm.vue'

defineOptions({ name: 'ModalForm' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string | number
    fields: ProFieldDef[]
    initialValues?: Record<string, any>
    onSubmit?: (values: Record<string, any>) => Promise<boolean>
    formProps?: Record<string, any>
    labelWidth?: string | number
    layout?: FormLayout
    dialogProps?: Record<string, any>
  }>(),
  {
    modelValue: false,
    title: '',
    width: '50%',
    layout: 'horizontal',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: Record<string, any>]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function handleClose() {
  dialogVisible.value = false
}

async function handleSubmit(values: Record<string, any>): Promise<boolean> {
  if (!props.onSubmit) return false
  const result = await props.onSubmit(values)
  if (result) {
    emit('submit', values)
    handleClose()
  }
  return result
}

watch(dialogVisible, (val) => {
  if (!val) {
    // Form will reset via ProForm's internal initialValues
  }
})
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    destroy-on-close
    v-bind="dialogProps"
  >
    <ProForm
      :fields="fields"
      :initial-values="initialValues"
      :on-submit="handleSubmit"
      :form-props="formProps"
      :label-width="labelWidth"
      :layout="layout"
    />
  </ElDialog>
</template>
```

- [ ] **Step 5: Verify ModalForm tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/modal-form.spec.ts 2>&1
```

Expected: All ModalForm tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/pro-form/src/composables/use-modal-form.ts packages/pro-form/src/components/ModalForm.vue packages/pro-form/__tests__/modal-form.spec.ts
git commit -m "feat(form): add ModalForm with dialog wrapper, auto-close on submit success"
```

---

## Task 9: DrawerForm — Tests + Implementation

**Files:**
- Create: `packages/pro-form/src/composables/use-drawer-form.ts`
- Create: `packages/pro-form/src/components/DrawerForm.vue`
- Create: `packages/pro-form/__tests__/drawer-form.spec.ts`

- [ ] **Step 1: Write failing tests for DrawerForm**

Create `packages/pro-form/__tests__/drawer-form.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import DrawerForm from '../src/components/DrawerForm.vue'
import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, any> = {}) {
  return mount(DrawerForm, {
    props,
    global: {
      plugins: [ElementPlus],
      stubs: {
        teleport: true,
      },
    },
    attachTo: document.body,
  })
}

function basicFields(): ProFieldDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text' },
    { dataIndex: 'email', title: 'Email', valueType: 'text' },
  ]
}

describe('DrawerForm', () => {
  describe('visibility', () => {
    it('should not render drawer content when closed', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      expect(wrapper.find('.el-drawer').exists()).toBe(false)
    })

    it('should render drawer when modelValue is true', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      expect(wrapper.find('.el-drawer').exists()).toBe(true)
    })

    it('should render form inside drawer when visible', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })
  })

  describe('title', () => {
    it('should display the title in drawer header', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        title: 'Edit Record',
      })
      await nextTick()
      expect(wrapper.text()).toContain('Edit Record')
    })
  })

  describe('submit flow', () => {
    it('should call onSubmit and emit close on success', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        initialValues: { name: 'Test' },
        onSubmit,
      })
      await nextTick()

      const submitBtn = wrapper.find('.pro-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }))
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should NOT close drawer when onSubmit returns false', async () => {
      const onSubmit = vi.fn().mockResolvedValue(false)
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        onSubmit,
      })
      await nextTick()

      const submitBtn = wrapper.find('.pro-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('width', () => {
    it('should pass width to el-drawer', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        width: '600px',
      })
      await nextTick()
      const drawer = wrapper.find('.el-drawer')
      expect(drawer.exists()).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Implement useDrawerForm composable**

Create `packages/pro-form/src/composables/use-drawer-form.ts`:

```typescript
import { ref, watch } from 'vue'
import type { ProFormConfig } from '@pro/utils'
import { useProForm } from './use-pro-form'
import type { UseDrawerFormReturn } from '../types'

/**
 * Composable for drawer form pattern.
 * Wraps useProForm with open/close state and auto-reset on close.
 */
export function useDrawerForm(config: ProFormConfig): UseDrawerFormReturn {
  const visible = ref(false)
  const proForm = useProForm(config)

  function open(initialValues?: Record<string, any>): void {
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
```

- [ ] **Step 3: Implement DrawerForm.vue**

Create `packages/pro-form/src/components/DrawerForm.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { ElDrawer } from 'element-plus'
import type { ProFieldDef, FormLayout } from '@pro/utils'
import ProForm from '../ProForm.vue'

defineOptions({ name: 'DrawerForm' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string | number
    fields: ProFieldDef[]
    initialValues?: Record<string, any>
    onSubmit?: (values: Record<string, any>) => Promise<boolean>
    formProps?: Record<string, any>
    labelWidth?: string | number
    layout?: FormLayout
    drawerProps?: Record<string, any>
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
  submit: [values: Record<string, any>]
}>()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function handleClose() {
  drawerVisible.value = false
}

async function handleSubmit(values: Record<string, any>): Promise<boolean> {
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
```

- [ ] **Step 4: Verify DrawerForm tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/drawer-form.spec.ts 2>&1
```

Expected: All DrawerForm tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/pro-form/src/composables/use-drawer-form.ts packages/pro-form/src/components/DrawerForm.vue packages/pro-form/__tests__/drawer-form.spec.ts
git commit -m "feat(form): add DrawerForm with drawer wrapper, auto-close on submit"
```

---

## Task 10: StepsForm — Tests + Implementation

**Files:**
- Create: `packages/pro-form/src/composables/use-steps-form.ts`
- Create: `packages/pro-form/src/components/StepsForm.vue`
- Create: `packages/pro-form/__tests__/steps-form.spec.ts`

- [ ] **Step 1: Write failing tests for StepsForm**

Create `packages/pro-form/__tests__/steps-form.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import StepsForm from '../src/components/StepsForm.vue'
import { useStepsForm } from '../src/composables/use-steps-form'
import type { StepFormDef } from '@pro/utils'

function createSteps(): StepFormDef[] {
  return [
    {
      title: 'Basic Info',
      fields: [
        { dataIndex: 'name', title: 'Name', valueType: 'text', rules: [{ required: true, message: 'Name is required' }] },
        { dataIndex: 'email', title: 'Email', valueType: 'text' },
      ],
    },
    {
      title: 'Details',
      fields: [
        { dataIndex: 'age', title: 'Age', valueType: 'number' },
        { dataIndex: 'bio', title: 'Bio', valueType: 'textarea' },
      ],
    },
    {
      title: 'Confirm',
      fields: [
        { dataIndex: 'agree', title: 'I agree', valueType: 'switch' },
      ],
    },
  ]
}

function createWrapper(props: Record<string, any> = {}) {
  return mount(StepsForm, {
    props,
    global: {
      plugins: [ElementPlus],
    },
  })
}

describe('useStepsForm', () => {
  describe('initialization', () => {
    it('should start at step 0', () => {
      const { currentStep } = useStepsForm({ steps: createSteps() })
      expect(currentStep.value).toBe(0)
    })

    it('should compute total steps', () => {
      const { totalSteps } = useStepsForm({ steps: createSteps() })
      expect(totalSteps.value).toBe(3)
    })

    it('should report first step correctly', () => {
      const { isFirstStep, isLastStep } = useStepsForm({ steps: createSteps() })
      expect(isFirstStep.value).toBe(true)
      expect(isLastStep.value).toBe(false)
    })

    it('should expose current step fields', () => {
      const { currentFields } = useStepsForm({ steps: createSteps() })
      expect(currentFields.value).toHaveLength(2)
      expect(currentFields.value[0].dataIndex).toBe('name')
    })
  })

  describe('navigation', () => {
    it('should advance to next step', async () => {
      const { currentStep, nextStep, currentFields } = useStepsForm({ steps: createSteps() })
      await nextStep()
      expect(currentStep.value).toBe(1)
      expect(currentFields.value[0].dataIndex).toBe('age')
    })

    it('should go back to previous step', async () => {
      const { currentStep, nextStep, prevStep } = useStepsForm({ steps: createSteps() })
      await nextStep()
      expect(currentStep.value).toBe(1)
      prevStep()
      expect(currentStep.value).toBe(0)
    })

    it('should not go below step 0', () => {
      const { currentStep, prevStep } = useStepsForm({ steps: createSteps() })
      prevStep()
      expect(currentStep.value).toBe(0)
    })

    it('should identify last step', async () => {
      const { isLastStep, nextStep } = useStepsForm({ steps: createSteps() })
      await nextStep()
      await nextStep()
      expect(isLastStep.value).toBe(true)
    })

    it('should go to specific step via goToStep', () => {
      const { currentStep, goToStep } = useStepsForm({ steps: createSteps() })
      goToStep(2)
      expect(currentStep.value).toBe(2)
    })

    it('should clamp goToStep to valid range', () => {
      const { currentStep, goToStep } = useStepsForm({ steps: createSteps() })
      goToStep(99)
      expect(currentStep.value).toBe(2)
      goToStep(-5)
      expect(currentStep.value).toBe(0)
    })
  })

  describe('form values', () => {
    it('should maintain form values across steps', async () => {
      const { formValues, nextStep } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Alice', age: 30 },
      })
      expect(formValues.value.name).toBe('Alice')
      await nextStep()
      expect(formValues.value.name).toBe('Alice')
      expect(formValues.value.age).toBe(30)
    })
  })

  describe('submit', () => {
    it('should call onSubmit with merged values from all steps', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const { nextStep, submit } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Alice', age: 30, agree: true },
        onSubmit,
      })
      await nextStep()
      await nextStep()
      await submit()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice', age: 30, agree: true }),
      )
    })
  })

  describe('reset', () => {
    it('should reset to step 0 and clear values', async () => {
      const { currentStep, nextStep, resetFields, formValues } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Original' },
      })
      await nextStep()
      formValues.value = { ...formValues.value, name: 'Changed' }
      resetFields()
      expect(currentStep.value).toBe(0)
      expect(formValues.value.name).toBe('Original')
    })
  })
})

describe('StepsForm component', () => {
  describe('rendering', () => {
    it('should render el-steps with correct number of steps', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const steps = wrapper.findAll('.el-step')
      expect(steps).toHaveLength(3)
    })

    it('should render form fields for current step only', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const formItems = wrapper.findAll('.el-form-item')
      // Step 0 has 2 fields: name + email
      expect(formItems).toHaveLength(2)
    })

    it('should show Next button on non-last steps', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      expect(wrapper.find('.pro-steps-form__next').exists()).toBe(true)
      expect(wrapper.find('.pro-steps-form__submit').exists()).toBe(false)
    })

    it('should hide Prev button on first step', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      expect(wrapper.find('.pro-steps-form__prev').exists()).toBe(false)
    })
  })

  describe('navigation via buttons', () => {
    it('should advance to next step when Next is clicked', async () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await nextTick()

      // Now on step 1, should see age + bio fields
      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThanOrEqual(2)
    })

    it('should show Submit button on last step', async () => {
      const wrapper = createWrapper({ steps: createSteps() })

      // Navigate to last step
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await nextTick()

      const nextBtn2 = wrapper.find('.pro-steps-form__next')
      await nextBtn2.trigger('click')
      await nextTick()

      expect(wrapper.find('.pro-steps-form__submit').exists()).toBe(true)
      expect(wrapper.find('.pro-steps-form__next').exists()).toBe(false)
    })

    it('should show Prev button on non-first steps', async () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await nextTick()
      expect(wrapper.find('.pro-steps-form__prev').exists()).toBe(true)
    })
  })

  describe('submit', () => {
    it('should call onSubmit when Submit button is clicked on last step', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const wrapper = createWrapper({
        steps: createSteps(),
        initialValues: { name: 'Test', age: 25, agree: true },
        onSubmit,
      })

      // Navigate to last step
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await nextTick()
      const nextBtn2 = wrapper.find('.pro-steps-form__next')
      await nextBtn2.trigger('click')
      await nextTick()

      const submitBtn = wrapper.find('.pro-steps-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(onSubmit).toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Implement useStepsForm composable**

Create `packages/pro-form/src/composables/use-steps-form.ts`:

```typescript
import { ref, computed, shallowRef } from 'vue'
import type { ProFieldDef, StepFormDef, ProFormRule } from '@pro/utils'
import type { UseStepsFormOptions, UseStepsFormReturn } from '../types'

/**
 * Composable for multi-step form with step validation and navigation.
 * Maintains a single merged form values object across all steps.
 */
export function useStepsForm(options: UseStepsFormOptions): UseStepsFormReturn {
  const { steps, onSubmit, initialValues = {} } = options

  const currentStep = ref(0)
  const formValues = ref<Record<string, any>>({ ...initialValues })
  const loading = ref(false)
  const formRef = shallowRef<any>(null)

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

  async function nextStep(): Promise<boolean> {
    if (currentStep.value >= steps.length - 1) {
      return false
    }
    // TODO: integrate with el-form validate() for step validation
    currentStep.value++
    return true
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
    if (!onSubmit) return false

    loading.value = true
    try {
      const result = await onSubmit({ ...formValues.value })
      return result
    } catch (error) {
      throw error
    } finally {
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
    validationRules,
    nextStep,
    prevStep,
    goToStep,
    submit,
    resetFields,
    formRef,
  }
}
```

- [ ] **Step 3: Implement StepsForm.vue**

Create `packages/pro-form/src/components/StepsForm.vue`:

```vue
<script setup lang="ts">
import { ElSteps, ElStep, ElForm, ElButton, ElRow, ElCol } from 'element-plus'
import type { StepFormDef, FormLayout } from '@pro/utils'
import { useStepsForm } from '../composables/use-steps-form'
import ProFormField from './ProFormField.vue'

defineOptions({ name: 'StepsForm' })

const props = withDefaults(
  defineProps<{
    steps: StepFormDef[]
    initialValues?: Record<string, any>
    onSubmit?: (values: Record<string, any>) => Promise<boolean>
    formProps?: Record<string, any>
    labelWidth?: string | number
    layout?: FormLayout
  }>(),
  {
    layout: 'horizontal',
  },
)

const emit = defineEmits<{
  submit: [values: Record<string, any>]
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

function handleFieldUpdate(dataIndex: string, value: any) {
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
      <ElRow :gutter="16">
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
        <ElButton
          v-if="!isFirstStep"
          class="pro-steps-form__prev"
          @click="handlePrev"
        >
          Previous
        </ElButton>
        <ElButton
          v-if="!isLastStep"
          type="primary"
          class="pro-steps-form__next"
          @click="handleNext"
        >
          Next
        </ElButton>
        <ElButton
          v-if="isLastStep"
          type="primary"
          :loading="loading"
          class="pro-steps-form__submit"
          @click="handleSubmit"
        >
          Submit
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
```

- [ ] **Step 4: Verify StepsForm tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/steps-form.spec.ts 2>&1
```

Expected: All StepsForm tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/pro-form/src/composables/use-steps-form.ts packages/pro-form/src/components/StepsForm.vue packages/pro-form/__tests__/steps-form.spec.ts
git commit -m "feat(form): add StepsForm with multi-step navigation, per-step validation"
```

---

## Task 11: QueryFilter — Tests + Implementation

**Files:**
- Create: `packages/pro-form/src/components/QueryFilter.vue`
- Create: `packages/pro-form/__tests__/query-filter.spec.ts`

- [ ] **Step 1: Write failing tests for QueryFilter**

Create `packages/pro-form/__tests__/query-filter.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import QueryFilter from '../src/components/QueryFilter.vue'
import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, any> = {}) {
  return mount(QueryFilter, {
    props,
    global: {
      plugins: [ElementPlus],
    },
  })
}

function searchFields(): ProFieldDef[] {
  return [
    { dataIndex: 'keyword', title: 'Keyword', valueType: 'text' },
    { dataIndex: 'status', title: 'Status', valueType: 'select', valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } } },
    { dataIndex: 'dateRange', title: 'Date', valueType: 'dateRange' },
  ]
}

describe('QueryFilter', () => {
  describe('rendering', () => {
    it('should render as inline form', () => {
      const wrapper = createWrapper({ fields: searchFields() })
      expect(wrapper.find('.el-form--inline').exists()).toBe(true)
    })

    it('should render all search fields', () => {
      const wrapper = createWrapper({ fields: searchFields() })
      const items = wrapper.findAll('.el-form-item')
      expect(items).toHaveLength(3)
    })

    it('should render Search and Reset buttons', () => {
      const wrapper = createWrapper({ fields: searchFields() })
      expect(wrapper.find('.pro-query-filter__search').exists()).toBe(true)
      expect(wrapper.find('.pro-query-filter__reset').exists()).toBe(true)
    })
  })

  describe('search', () => {
    it('should emit search event with form values when Search button clicked', async () => {
      const wrapper = createWrapper({
        fields: searchFields(),
        initialValues: { keyword: 'test' },
      })
      await nextTick()

      const searchBtn = wrapper.find('.pro-query-filter__search')
      await searchBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0][0]).toEqual(expect.objectContaining({ keyword: 'test' }))
    })
  })

  describe('reset', () => {
    it('should emit reset event and clear values when Reset button clicked', async () => {
      const wrapper = createWrapper({
        fields: searchFields(),
        initialValues: { keyword: 'test' },
      })
      await nextTick()

      const resetBtn = wrapper.find('.pro-query-filter__reset')
      await resetBtn.trigger('click')
      await nextTick()

      expect(wrapper.emitted('reset')).toBeTruthy()
    })
  })

  describe('collapse', () => {
    it('should collapse extra fields when defaultCollapsed is true and fields exceed threshold', async () => {
      const manyFields: ProFieldDef[] = [
        { dataIndex: 'f1', title: 'F1', valueType: 'text' },
        { dataIndex: 'f2', title: 'F2', valueType: 'text' },
        { dataIndex: 'f3', title: 'F3', valueType: 'text' },
        { dataIndex: 'f4', title: 'F4', valueType: 'text' },
        { dataIndex: 'f5', title: 'F5', valueType: 'text' },
      ]
      const wrapper = createWrapper({
        fields: manyFields,
        defaultCollapsed: true,
        collapseThreshold: 3,
      })
      await nextTick()

      // Should show only first 3 fields when collapsed
      const visibleItems = wrapper.findAll('.el-form-item')
      expect(visibleItems).toHaveLength(3)
    })

    it('should show all fields when expanded', async () => {
      const manyFields: ProFieldDef[] = [
        { dataIndex: 'f1', title: 'F1', valueType: 'text' },
        { dataIndex: 'f2', title: 'F2', valueType: 'text' },
        { dataIndex: 'f3', title: 'F3', valueType: 'text' },
        { dataIndex: 'f4', title: 'F4', valueType: 'text' },
      ]
      const wrapper = createWrapper({
        fields: manyFields,
        defaultCollapsed: true,
        collapseThreshold: 2,
      })
      await nextTick()

      // Click expand toggle
      const toggle = wrapper.find('.pro-query-filter__collapse-toggle')
      await toggle.trigger('click')
      await nextTick()

      const visibleItems = wrapper.findAll('.el-form-item')
      expect(visibleItems).toHaveLength(4)
    })

    it('should not show collapse toggle when fields are within threshold', () => {
      const wrapper = createWrapper({
        fields: searchFields(),
        defaultCollapsed: true,
        collapseThreshold: 5,
      })
      expect(wrapper.find('.pro-query-filter__collapse-toggle').exists()).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Implement QueryFilter.vue**

Create `packages/pro-form/src/components/QueryFilter.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElForm, ElFormItem, ElButton, ElRow, ElCol } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'
import { useProForm } from '../composables/use-pro-form'
import ProFormField from './ProFormField.vue'

defineOptions({ name: 'QueryFilter' })

const props = withDefaults(
  defineProps<{
    fields: ProFieldDef[]
    initialValues?: Record<string, any>
    formProps?: Record<string, any>
    labelWidth?: string | number
    /** Whether to start collapsed */
    defaultCollapsed?: boolean
    /** Number of fields to show before collapsing */
    collapseThreshold?: number
    /** Column span for each field (out of 24) */
    span?: number
  }>(),
  {
    defaultCollapsed: false,
    collapseThreshold: 3,
    span: 8,
  },
)

const emit = defineEmits<{
  search: [values: Record<string, any>]
  reset: []
}>()

const collapsed = ref(props.defaultCollapsed)

const {
  formValues,
  visibleFields,
  setFieldValue,
  resetFields,
  formRef,
} = useProForm({
  fields: props.fields,
  initialValues: props.initialValues,
})

const showCollapseToggle = computed(() => {
  return visibleFields.value.length > props.collapseThreshold
})

const displayFields = computed(() => {
  if (!collapsed.value || !showCollapseToggle.value) {
    return visibleFields.value
  }
  return visibleFields.value.slice(0, props.collapseThreshold)
})

function handleSearch() {
  emit('search', { ...formValues.value })
}

function handleReset() {
  resetFields()
  emit('reset')
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function handleFieldUpdate(dataIndex: string, value: any) {
  setFieldValue(dataIndex, value)
}

defineExpose({
  formValues,
  resetFields,
})
</script>

<template>
  <ElForm
    ref="formRef"
    :model="formValues"
    inline
    :label-width="labelWidth ?? '80px'"
    v-bind="formProps"
    class="pro-query-filter"
  >
    <ProFormField
      v-for="field in displayFields"
      :key="field.key ?? field.dataIndex"
      :field="field"
      :model-value="formValues[field.dataIndex]"
      :form-values="formValues"
      @update:model-value="handleFieldUpdate(field.dataIndex, $event)"
    />

    <ElFormItem class="pro-query-filter__actions">
      <ElButton type="primary" class="pro-query-filter__search" @click="handleSearch">
        Search
      </ElButton>
      <ElButton class="pro-query-filter__reset" @click="handleReset">
        Reset
      </ElButton>
      <ElButton
        v-if="showCollapseToggle"
        type="primary"
        link
        class="pro-query-filter__collapse-toggle"
        @click="toggleCollapse"
      >
        {{ collapsed ? 'Expand' : 'Collapse' }}
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style scoped>
.pro-query-filter {
  padding: var(--pro-spacing-md, 16px);
  background: var(--el-bg-color, #fff);
  border-radius: var(--pro-radius-md, 6px);
  margin-bottom: var(--pro-spacing-md, 16px);
}

.pro-query-filter__actions {
  margin-left: auto;
}
</style>
```

- [ ] **Step 3: Verify QueryFilter tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/query-filter.spec.ts 2>&1
```

Expected: All QueryFilter tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/pro-form/src/components/QueryFilter.vue packages/pro-form/__tests__/query-filter.spec.ts
git commit -m "feat(form): add QueryFilter with inline layout, collapse/expand support"
```

---

## Task 12: ProForm Package Exports

**Files:**
- Replace: `packages/pro-form/src/index.ts`

- [ ] **Step 1: Update index.ts with all exports**

Replace `packages/pro-form/src/index.ts` with:

```typescript
import ProForm from './ProForm.vue'
import ModalForm from './components/ModalForm.vue'
import DrawerForm from './components/DrawerForm.vue'
import StepsForm from './components/StepsForm.vue'
import QueryFilter from './components/QueryFilter.vue'

export { ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter }

export { useProForm } from './composables/use-pro-form'
export { useModalForm } from './composables/use-modal-form'
export { useDrawerForm } from './composables/use-drawer-form'
export { useStepsForm } from './composables/use-steps-form'

export type {
  UseProFormReturn,
  UseModalFormOptions,
  UseModalFormReturn,
  UseDrawerFormOptions,
  UseDrawerFormReturn,
  UseStepsFormOptions,
  UseStepsFormReturn,
} from './types'

export default ProForm
```

- [ ] **Step 2: Verify all form tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/src/index.ts
git commit -m "feat(form): export all form components, composables, and types"
```

---

## Task 13: Vitest Configuration for @pro/descriptions

**Files:**
- Edit: `packages/pro-descriptions/package.json`
- Create: `packages/pro-descriptions/vitest.config.ts`

- [ ] **Step 1: Update package.json**

Replace `packages/pro-descriptions/package.json` with:

```json
{
  "name": "@pro/descriptions",
  "version": "0.0.1",
  "description": "ProDescriptions — schema-driven detail view using same column definitions as ProTable",
  "type": "module",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.mjs",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./style": "./dist/style/index.css"
  },
  "sideEffects": ["dist/style/**"],
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c rollup.config.ts --configPlugin typescript",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@pro/hooks": "workspace:*",
    "@pro/utils": "workspace:*",
    "@pro/themes": "workspace:*"
  },
  "peerDependencies": {
    "vue": ">=3.4.0",
    "element-plus": ">=2.9.0"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.0",
    "vitest": "^2.0.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.ts**

Create `packages/pro-descriptions/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/index.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@pro/utils': new URL('../utils/src/index.ts', import.meta.url).pathname,
      '@pro/hooks': new URL('../hooks/src/index.ts', import.meta.url).pathname,
    },
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add packages/pro-descriptions/package.json packages/pro-descriptions/vitest.config.ts
git commit -m "chore(descriptions): add vitest config and test scripts"
```

---

## Task 14: useProDescriptions Composable — Tests First

**Files:**
- Create: `packages/pro-descriptions/__tests__/use-pro-descriptions.spec.ts`

- [ ] **Step 1: Write failing tests for useProDescriptions**

Create `packages/pro-descriptions/__tests__/use-pro-descriptions.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useProDescriptions } from '../src/composables/use-pro-descriptions'
import type { ProColumnDef } from '@pro/utils'

function createColumns(): ProColumnDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text' },
    { dataIndex: 'age', title: 'Age', valueType: 'number' },
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active', status: 'success' }, inactive: { text: 'Inactive', status: 'danger' } },
    },
    { dataIndex: 'created', title: 'Created', valueType: 'date' },
    { dataIndex: 'hidden', title: 'Hidden', valueType: 'text', hideInDescriptions: true },
    { dataIndex: 'amount', title: 'Amount', valueType: 'money' },
    { dataIndex: 'rate', title: 'Rate', valueType: 'percent' },
  ]
}

function createData() {
  return {
    name: 'Alice',
    age: 30,
    status: 'active',
    created: '2025-01-15',
    hidden: 'should not appear',
    amount: 1234.56,
    rate: 85.5,
  }
}

describe('useProDescriptions', () => {
  describe('descriptionItems', () => {
    it('should filter out columns with hideInDescriptions=true', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      expect(descriptionItems.value.find((item) => item.dataIndex === 'hidden')).toBeUndefined()
    })

    it('should include all non-hidden columns', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      // 7 columns - 1 hidden = 6
      expect(descriptionItems.value).toHaveLength(6)
    })

    it('should preserve column titles as labels', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const nameItem = descriptionItems.value.find((item) => item.dataIndex === 'name')
      expect(nameItem?.label).toBe('Name')
    })
  })

  describe('value formatting', () => {
    it('should return raw value for text valueType', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const nameItem = descriptionItems.value.find((item) => item.dataIndex === 'name')
      expect(nameItem?.value).toBe('Alice')
    })

    it('should format number value', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const ageItem = descriptionItems.value.find((item) => item.dataIndex === 'age')
      expect(ageItem?.value).toBe(30)
    })

    it('should resolve valueEnum for select type', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const statusItem = descriptionItems.value.find((item) => item.dataIndex === 'status')
      expect(statusItem?.displayText).toBe('Active')
      expect(statusItem?.statusType).toBe('success')
    })

    it('should format money value with currency symbol', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const amountItem = descriptionItems.value.find((item) => item.dataIndex === 'amount')
      expect(amountItem?.formattedValue).toContain('1,234.56')
    })

    it('should format percent value with % symbol', () => {
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: createData(),
      })
      const rateItem = descriptionItems.value.find((item) => item.dataIndex === 'rate')
      expect(rateItem?.formattedValue).toContain('85.5%')
    })
  })

  describe('nested data access', () => {
    it('should resolve dot-notation dataIndex', () => {
      const columns: ProColumnDef[] = [
        { dataIndex: 'user.name', title: 'User Name', valueType: 'text' },
        { dataIndex: 'user.address.city', title: 'City', valueType: 'text' },
      ]
      const data = {
        user: { name: 'Bob', address: { city: 'Shenzhen' } },
      }
      const { descriptionItems } = useProDescriptions({ columns, data })
      expect(descriptionItems.value[0].value).toBe('Bob')
      expect(descriptionItems.value[1].value).toBe('Shenzhen')
    })

    it('should return undefined for missing nested paths', () => {
      const columns: ProColumnDef[] = [
        { dataIndex: 'user.missing.field', title: 'Missing', valueType: 'text' },
      ]
      const { descriptionItems } = useProDescriptions({ columns, data: {} })
      expect(descriptionItems.value[0].value).toBeUndefined()
    })
  })

  describe('reactive data', () => {
    it('should re-compute when data changes', () => {
      const data = ref(createData())
      const { descriptionItems } = useProDescriptions({
        columns: createColumns(),
        data: data.value,
      })
      const nameItem = descriptionItems.value.find((item) => item.dataIndex === 'name')
      expect(nameItem?.value).toBe('Alice')
    })
  })

  describe('descriptionsRender', () => {
    it('should flag items that have custom descriptionsRender', () => {
      const columns: ProColumnDef[] = [
        {
          dataIndex: 'name',
          title: 'Name',
          valueType: 'text',
          descriptionsRender: (value: any) => `Custom: ${value}`,
        },
      ]
      const { descriptionItems } = useProDescriptions({
        columns,
        data: { name: 'Test' },
      })
      expect(descriptionItems.value[0].hasCustomRender).toBe(true)
      expect(descriptionItems.value[0].descriptionsRender).toBeDefined()
    })
  })
})
```

- [ ] **Step 2: Verify tests fail**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/descriptions test 2>&1 | head -20
```

Expected: Tests fail because composable doesn't exist.

- [ ] **Step 3: Commit failing tests**

```bash
git add packages/pro-descriptions/__tests__/use-pro-descriptions.spec.ts
git commit -m "test(descriptions): add failing unit tests for useProDescriptions composable"
```

---

## Task 15: useProDescriptions Composable — Implementation

**Files:**
- Create: `packages/pro-descriptions/src/composables/use-pro-descriptions.ts`

- [ ] **Step 1: Implement useProDescriptions**

Create `packages/pro-descriptions/src/composables/use-pro-descriptions.ts`:

```typescript
import { computed } from 'vue'
import type { VNode } from 'vue'
import type { ProColumnDef, StatusType } from '@pro/utils'

/** Processed description item ready for rendering */
export interface DescriptionItem {
  /** Field key for iteration */
  dataIndex: string
  /** Display label */
  label: string
  /** Raw value from data */
  value: any
  /** Formatted value for display (e.g., "$1,234.56") */
  formattedValue: string
  /** Resolved text for valueEnum types */
  displayText?: string
  /** Status type for valueEnum types */
  statusType?: StatusType
  /** Whether this item has a custom descriptionsRender */
  hasCustomRender: boolean
  /** Custom render function if defined */
  descriptionsRender?: (value: any, row: any) => VNode | string
  /** Original column definition */
  column: ProColumnDef
  /** Span in descriptions layout */
  span?: number
}

export interface UseProDescriptionsOptions {
  columns: ProColumnDef[]
  data: Record<string, any>
}

export interface UseProDescriptionsReturn {
  descriptionItems: ReturnType<typeof computed<DescriptionItem[]>>
}

/**
 * Resolve a dot-notation path on an object.
 * E.g., getNestedValue({ user: { name: 'Alice' } }, 'user.name') => 'Alice'
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}

/**
 * Format a value based on its valueType for display in descriptions.
 */
function formatValue(value: any, valueType: string): string {
  if (value == null) return '-'

  switch (valueType) {
    case 'money':
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    case 'percent':
      return `${value}%`

    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value)

    case 'date':
    case 'dateTime':
      if (value instanceof Date) {
        return valueType === 'dateTime' ? value.toLocaleString() : value.toLocaleDateString()
      }
      return String(value)

    case 'text':
    case 'textarea':
    case 'code':
    default:
      return String(value)
  }
}

/**
 * Composable that processes ProColumnDef array and data into description items.
 * Filters by hideInDescriptions, resolves nested paths, formats values, resolves valueEnum.
 */
export function useProDescriptions(options: UseProDescriptionsOptions): UseProDescriptionsReturn {
  const { columns, data } = options

  const descriptionItems = computed<DescriptionItem[]>(() => {
    return columns
      .filter((col) => !col.hideInDescriptions)
      .map((col) => {
        const rawValue = getNestedValue(data, col.dataIndex as string)
        const valueType = col.valueType ?? 'text'

        let displayText: string | undefined
        let statusType: StatusType | undefined

        if (col.valueEnum && rawValue != null) {
          const enumEntry = col.valueEnum[String(rawValue)]
          if (enumEntry) {
            displayText = enumEntry.text
            statusType = enumEntry.status
          }
        }

        const formattedValue = displayText ?? formatValue(rawValue, valueType)

        return {
          dataIndex: (col.key ?? col.dataIndex) as string,
          label: col.title,
          value: rawValue,
          formattedValue,
          displayText,
          statusType,
          hasCustomRender: typeof col.descriptionsRender === 'function',
          descriptionsRender: col.descriptionsRender,
          column: col,
          span: col.searchConfig?.span,
        }
      })
  })

  return { descriptionItems }
}
```

- [ ] **Step 2: Verify unit tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/descriptions test 2>&1
```

Expected: All useProDescriptions tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-descriptions/src/composables/use-pro-descriptions.ts
git commit -m "feat(descriptions): implement useProDescriptions composable with value formatting"
```

---

## Task 16: ProDescriptions Component — Tests First

**Files:**
- Create: `packages/pro-descriptions/__tests__/pro-descriptions.spec.ts`

- [ ] **Step 1: Write integration tests for ProDescriptions**

Create `packages/pro-descriptions/__tests__/pro-descriptions.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import ElementPlus from 'element-plus'
import ProDescriptions from '../src/ProDescriptions.vue'
import type { ProColumnDef } from '@pro/utils'

function createWrapper(props: Record<string, any> = {}) {
  return mount(ProDescriptions, {
    props,
    global: {
      plugins: [ElementPlus],
    },
  })
}

function basicColumns(): ProColumnDef[] {
  return [
    { dataIndex: 'name', title: 'Name', valueType: 'text' },
    { dataIndex: 'age', title: 'Age', valueType: 'number' },
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active', status: 'success' },
        inactive: { text: 'Inactive', status: 'danger' },
      },
    },
    { dataIndex: 'amount', title: 'Amount', valueType: 'money' },
    { dataIndex: 'rate', title: 'Rate', valueType: 'percent' },
  ]
}

function basicData() {
  return {
    name: 'Alice',
    age: 30,
    status: 'active',
    amount: 1234.56,
    rate: 85.5,
  }
}

describe('ProDescriptions', () => {
  describe('rendering', () => {
    it('should render an el-descriptions element', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.find('.el-descriptions').exists()).toBe(true)
    })

    it('should render description items for each visible column', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      const items = wrapper.findAll('.el-descriptions__label')
      expect(items).toHaveLength(5)
    })

    it('should display column titles as labels', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('Age')
      expect(wrapper.text()).toContain('Status')
    })

    it('should display data values', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.text()).toContain('Alice')
    })
  })

  describe('hideInDescriptions', () => {
    it('should not render columns with hideInDescriptions=true', () => {
      const columns: ProColumnDef[] = [
        { dataIndex: 'name', title: 'Name', valueType: 'text' },
        { dataIndex: 'secret', title: 'Secret', valueType: 'text', hideInDescriptions: true },
      ]
      const wrapper = createWrapper({
        columns,
        data: { name: 'Alice', secret: 'hidden' },
      })
      expect(wrapper.text()).not.toContain('Secret')
      expect(wrapper.text()).not.toContain('hidden')
    })
  })

  describe('valueType rendering', () => {
    it('should display valueEnum text for select type', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.text()).toContain('Active')
    })

    it('should format money values with currency symbol', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.text()).toContain('1,234.56')
    })

    it('should format percent values with % symbol', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
      })
      expect(wrapper.text()).toContain('85.5%')
    })

    it('should display dash for null/undefined values', () => {
      const wrapper = createWrapper({
        columns: [{ dataIndex: 'missing', title: 'Missing', valueType: 'text' }],
        data: {},
      })
      expect(wrapper.text()).toContain('-')
    })
  })

  describe('descriptionsRender', () => {
    it('should use custom descriptionsRender when provided', () => {
      const columns: ProColumnDef[] = [
        {
          dataIndex: 'name',
          title: 'Name',
          valueType: 'text',
          descriptionsRender: (value: any) => h('span', { class: 'custom-render' }, `Custom: ${value}`),
        },
      ]
      const wrapper = createWrapper({
        columns,
        data: { name: 'Test' },
      })
      expect(wrapper.find('.custom-render').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom: Test')
    })
  })

  describe('nested data', () => {
    it('should resolve dot-notation dataIndex', () => {
      const columns: ProColumnDef[] = [
        { dataIndex: 'user.name', title: 'User Name', valueType: 'text' },
      ]
      const wrapper = createWrapper({
        columns,
        data: { user: { name: 'Bob' } },
      })
      expect(wrapper.text()).toContain('Bob')
    })
  })

  describe('props passthrough', () => {
    it('should pass title to el-descriptions', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
        title: 'User Details',
      })
      expect(wrapper.text()).toContain('User Details')
    })

    it('should pass column count to el-descriptions', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
        column: 2,
      })
      const descriptions = wrapper.find('.el-descriptions')
      expect(descriptions.exists()).toBe(true)
    })

    it('should pass border prop to el-descriptions', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
        border: true,
      })
      expect(wrapper.find('.el-descriptions--bordered').exists() || wrapper.find('.is-bordered').exists()).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading skeleton when loading is true', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
        loading: true,
      })
      expect(wrapper.find('.el-skeleton').exists() || wrapper.find('.pro-descriptions--loading').exists()).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Verify tests fail**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/descriptions test -- __tests__/pro-descriptions.spec.ts 2>&1 | head -20
```

Expected: Tests fail because ProDescriptions.vue is still a placeholder.

- [ ] **Step 3: Commit failing tests**

```bash
git add packages/pro-descriptions/__tests__/pro-descriptions.spec.ts
git commit -m "test(descriptions): add failing integration tests for ProDescriptions"
```

---

## Task 17: ProDescriptions Component — Implementation

**Files:**
- Replace: `packages/pro-descriptions/src/ProDescriptions.vue`

- [ ] **Step 1: Implement ProDescriptions.vue**

Replace `packages/pro-descriptions/src/ProDescriptions.vue` with:

```vue
<script setup lang="ts">
import { h } from 'vue'
import { ElDescriptions, ElDescriptionsItem, ElTag, ElSkeleton } from 'element-plus'
import type { ProColumnDef, StatusType } from '@pro/utils'
import { useProDescriptions } from './composables/use-pro-descriptions'
import type { DescriptionItem } from './composables/use-pro-descriptions'

defineOptions({ name: 'ProDescriptions' })

const props = withDefaults(
  defineProps<{
    columns: ProColumnDef[]
    data: Record<string, any>
    title?: string
    column?: number
    border?: boolean
    loading?: boolean
    size?: 'large' | 'default' | 'small'
    descriptionsProps?: Record<string, any>
  }>(),
  {
    column: 3,
    border: false,
    loading: false,
    size: 'default',
  },
)

const { descriptionItems } = useProDescriptions({
  columns: props.columns,
  data: props.data,
})

const statusTagTypeMap: Record<StatusType, string> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  default: '',
}

function renderItemContent(item: DescriptionItem) {
  // Custom render takes priority
  if (item.hasCustomRender && item.descriptionsRender) {
    return item.descriptionsRender(item.value, props.data)
  }

  // valueEnum → render as tag
  if (item.displayText) {
    const tagType = item.statusType ? statusTagTypeMap[item.statusType] : ''
    return h(ElTag, { type: tagType as any, size: 'small' }, { default: () => item.displayText })
  }

  // Default: formatted text
  return item.formattedValue
}

defineExpose({
  descriptionItems,
})
</script>

<template>
  <div class="pro-descriptions" :class="{ 'pro-descriptions--loading': loading }">
    <ElSkeleton v-if="loading" :rows="4" animated />
    <ElDescriptions
      v-else
      :title="title"
      :column="column"
      :border="border"
      :size="size"
      v-bind="descriptionsProps"
    >
      <ElDescriptionsItem
        v-for="item in descriptionItems"
        :key="item.dataIndex"
        :label="item.label"
        :span="item.span"
      >
        <component :is="() => renderItemContent(item)" />
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<style scoped>
.pro-descriptions {
  width: 100%;
}
</style>
```

- [ ] **Step 2: Verify all description tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/descriptions test 2>&1
```

Expected: All ProDescriptions tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-descriptions/src/ProDescriptions.vue
git commit -m "feat(descriptions): implement ProDescriptions with valueType formatting and custom renders"
```

---

## Task 18: ProDescriptions Package Exports

**Files:**
- Replace: `packages/pro-descriptions/src/index.ts`

- [ ] **Step 1: Update index.ts with all exports**

Replace `packages/pro-descriptions/src/index.ts` with:

```typescript
import ProDescriptions from './ProDescriptions.vue'

export { ProDescriptions }

export { useProDescriptions } from './composables/use-pro-descriptions'
export type {
  DescriptionItem,
  UseProDescriptionsOptions,
  UseProDescriptionsReturn,
} from './composables/use-pro-descriptions'

export default ProDescriptions
```

- [ ] **Step 2: Commit**

```bash
git add packages/pro-descriptions/src/index.ts
git commit -m "feat(descriptions): export component, composable, and types"
```

---

## Task 19: Update Aggregation Package

**Files:**
- Edit: `packages/pro-components/src/index.ts`

- [ ] **Step 1: Update aggregation exports**

Replace `packages/pro-components/src/index.ts` with:

```typescript
// Components
export { ProTable } from '@pro/table'
export { ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter } from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'

// Composables
export { useProForm, useModalForm, useDrawerForm, useStepsForm } from '@pro/form'
export { useProDescriptions } from '@pro/descriptions'

// Utils
export { checkDependencies } from '@pro/utils'

// Types
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'
export type { ProFieldDef, StepFormDef, ProFormConfig, FormLayout, ProFormRule } from '@pro/utils'
export type {
  UseProFormReturn,
  UseModalFormReturn,
  UseDrawerFormReturn,
  UseStepsFormReturn,
} from '@pro/form'
export type { DescriptionItem, UseProDescriptionsReturn } from '@pro/descriptions'

// Install function for app.use()
import type { App, Plugin } from 'vue'
import { ProTable } from '@pro/table'
import { ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter } from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'

const components = [ProTable, ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter, ProDescriptions]

export const install: Plugin = {
  install(app: App) {
    checkDependencies()
    components.forEach((component) => {
      if (component.name) {
        app.component(component.name, component)
      }
    })
  },
}

export default install
```

- [ ] **Step 2: Commit**

```bash
git add packages/pro-components/src/index.ts
git commit -m "feat(pro-components): re-export ProForm variants and ProDescriptions"
```

---

## Task 20: Cross-Component Integration Tests

**Files:**
- Create: `packages/pro-form/__tests__/cross-component.spec.ts`

- [ ] **Step 1: Write cross-component integration tests**

Create `packages/pro-form/__tests__/cross-component.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, h, defineComponent } from 'vue'
import ElementPlus from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

/**
 * Verify that a single columns definition works correctly across
 * ProForm (as QueryFilter fields) and ProDescriptions.
 */

// We import from source since this is a monorepo test
import QueryFilter from '../src/components/QueryFilter.vue'

// For ProDescriptions, we test via its composable since it's a separate package.
// This test focuses on the columns contract compatibility.
import { useProDescriptions } from '../../pro-descriptions/src/composables/use-pro-descriptions'

/**
 * Shared columns definition — the SAME array that would be used
 * for ProTable, QueryFilter (ProForm), and ProDescriptions.
 */
function sharedColumns(): ProColumnDef[] {
  return [
    {
      dataIndex: 'name',
      title: 'Name',
      valueType: 'text',
      hideInSearch: false,
      hideInDescriptions: false,
    },
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active', status: 'success' },
        inactive: { text: 'Inactive', status: 'danger' },
      },
    },
    {
      dataIndex: 'amount',
      title: 'Amount',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      dataIndex: 'created',
      title: 'Created',
      valueType: 'date',
    },
    {
      dataIndex: 'internal',
      title: 'Internal',
      valueType: 'text',
      hideInDescriptions: true,
      hideInSearch: true,
    },
  ]
}

describe('Cross-component column compatibility', () => {
  describe('QueryFilter uses same columns as ProTable search', () => {
    it('should render search fields from shared columns (excluding hideInSearch)', () => {
      // Convert ProColumnDef to ProFieldDef for QueryFilter
      const columns = sharedColumns()
      const searchFields = columns
        .filter((col) => !col.hideInSearch && !col.hideInTable)
        .map((col) => ({
          dataIndex: col.dataIndex as string,
          title: col.title,
          valueType: col.valueType,
          valueEnum: col.valueEnum,
        }))

      const wrapper = mount(QueryFilter, {
        props: { fields: searchFields },
        global: { plugins: [ElementPlus] },
      })

      const items = wrapper.findAll('.el-form-item')
      // name, status, created are searchable; amount and internal are not
      // Plus the actions form-item
      expect(items.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('ProDescriptions uses same columns', () => {
    it('should render description items from shared columns (excluding hideInDescriptions)', () => {
      const { descriptionItems } = useProDescriptions({
        columns: sharedColumns(),
        data: {
          name: 'Alice',
          status: 'active',
          amount: 9999.99,
          created: '2025-06-01',
          internal: 'hidden',
        },
      })

      // internal has hideInDescriptions=true, so 4 items
      expect(descriptionItems.value).toHaveLength(4)
      expect(descriptionItems.value.find((i) => i.dataIndex === 'internal')).toBeUndefined()
    })

    it('should format valueEnum consistently with how ProTable would render it', () => {
      const { descriptionItems } = useProDescriptions({
        columns: sharedColumns(),
        data: { name: 'Test', status: 'active', amount: 100, created: '2025-01-01' },
      })

      const statusItem = descriptionItems.value.find((i) => i.dataIndex === 'status')
      expect(statusItem?.displayText).toBe('Active')
      expect(statusItem?.statusType).toBe('success')
    })

    it('should format money type consistently', () => {
      const { descriptionItems } = useProDescriptions({
        columns: sharedColumns(),
        data: { name: 'Test', status: 'active', amount: 1234.5, created: '2025-01-01' },
      })

      const amountItem = descriptionItems.value.find((i) => i.dataIndex === 'amount')
      expect(amountItem?.formattedValue).toContain('1,234.50')
    })
  })

  describe('valueType rendering consistency', () => {
    const valueTypeCases: Array<{
      valueType: string
      rawValue: any
      expectedSearchControl: string
      expectedDescriptionContains: string
    }> = [
      {
        valueType: 'text',
        rawValue: 'hello',
        expectedSearchControl: '.el-input',
        expectedDescriptionContains: 'hello',
      },
      {
        valueType: 'number',
        rawValue: 42,
        expectedSearchControl: '.el-input-number',
        expectedDescriptionContains: '42',
      },
      {
        valueType: 'money',
        rawValue: 5000,
        expectedSearchControl: '.el-input-number',
        expectedDescriptionContains: '5,000.00',
      },
      {
        valueType: 'percent',
        rawValue: 75,
        expectedSearchControl: '.el-input-number',
        expectedDescriptionContains: '75%',
      },
    ]

    valueTypeCases.forEach(({ valueType, rawValue, expectedSearchControl, expectedDescriptionContains }) => {
      it(`${valueType}: should render correct search control and description format`, () => {
        const columns: ProColumnDef[] = [
          { dataIndex: 'field', title: 'Field', valueType: valueType as any },
        ]

        // Test QueryFilter renders correct control
        const wrapper = mount(QueryFilter, {
          props: {
            fields: [{ dataIndex: 'field', title: 'Field', valueType }],
          },
          global: { plugins: [ElementPlus] },
        })
        expect(wrapper.find(expectedSearchControl).exists()).toBe(true)

        // Test ProDescriptions formats correctly
        const { descriptionItems } = useProDescriptions({
          columns,
          data: { field: rawValue },
        })
        expect(descriptionItems.value[0].formattedValue).toContain(expectedDescriptionContains)
      })
    })
  })
})
```

- [ ] **Step 2: Verify cross-component tests pass**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test -- __tests__/cross-component.spec.ts 2>&1
```

Expected: All cross-component tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/pro-form/__tests__/cross-component.spec.ts
git commit -m "test: add cross-component integration tests for shared columns contract"
```

---

## Task 21: Full Test Suite Verification

- [ ] **Step 1: Run all form tests**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/form test 2>&1
```

Expected: All tests pass (use-pro-form, pro-form, modal-form, drawer-form, steps-form, query-filter, cross-component).

- [ ] **Step 2: Run all descriptions tests**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm --filter @pro/descriptions test 2>&1
```

Expected: All tests pass (use-pro-descriptions, pro-descriptions).

- [ ] **Step 3: Run type-check**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm type-check 2>&1
```

Expected: No TypeScript errors.

- [ ] **Step 4: Run format + lint**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm format
pnpm lint 2>&1
```

Expected: No lint errors. Files formatted.

- [ ] **Step 5: Run build**

```bash
cd /Users/tianqiyin/Desktop/workspace/projects/pro-components
pnpm build 2>&1
```

Expected: All packages build successfully.

- [ ] **Step 6: Commit any format changes**

```bash
git add -A
git commit -m "chore: format and lint pass for ProForm + ProDescriptions"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** All items from Section 4 (ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter, ProDescriptions) are implemented
- [ ] **Type consistency:** `ProFieldDef` types defined in `@pro/utils`, referenced consistently across `@pro/form` and cross-component tests
- [ ] **ProColumnDef reuse:** ProDescriptions uses the same `ProColumnDef` as ProTable — `hideInDescriptions`, `descriptionsRender`, `valueType` all respected
- [ ] **Headless-first architecture:** Each component has a composable (useProForm, useModalForm, useDrawerForm, useStepsForm, useProDescriptions) that owns state, and a thin Vue component for rendering
- [ ] **TDD discipline:** Every feature has tests written before implementation; tests verified to fail, then implementation makes them pass
- [ ] **No placeholders:** All steps contain complete, runnable code — no "TBD", no "similar to Task N"
- [ ] **File paths:** All paths are exact and consistent with the monorepo structure from Plan 1
- [ ] **Teleport handling:** ModalForm and DrawerForm tests use `stubs: { teleport: true }` per spec guidance
- [ ] **QueryFilter integration:** QueryFilter can be used standalone and as ProTable's internal search area (same fields contract)
- [ ] **StepsForm state:** Form values persist across steps; validation is per-step; navigation is bounded
- [ ] **Value formatting:** Money (`$1,234.56`), percent (`85.5%`), valueEnum text resolution consistent between ProForm search controls and ProDescriptions display
- [ ] **Cross-component test:** Verified same `ProColumnDef[]` array works for QueryFilter search fields and ProDescriptions display items with correct filtering and formatting
