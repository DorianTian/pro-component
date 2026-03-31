import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { useProForm } from '../src/composables/use-pro-form'

import type { ProFieldDef } from '@pro/utils'

function createTestFields(): ProFieldDef[] {
  return [
    {
      dataIndex: 'name',
      title: 'Name',
      valueType: 'text',
      rules: [{ required: true, message: 'Name is required' }],
    },
    { dataIndex: 'age', title: 'Age', valueType: 'number' },
    { dataIndex: 'email', title: 'Email', valueType: 'text' },
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } },
    },
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
      await submit()
      expect(loading.value).toBe(false)
    })

    it('should skip submit when no onSubmit handler provided', async () => {
      const { submit } = useProForm({ fields: createTestFields() })
      const result = await submit()
      expect(result).toBe(false)
    })

    it('should reject concurrent submit calls — second call returns false while first is in-flight', async () => {
      let resolveSubmit: (value: boolean) => void
      const onSubmit = vi.fn().mockReturnValue(
        new Promise<boolean>((resolve) => {
          resolveSubmit = resolve
        }),
      )
      const { submit, setFieldValue } = useProForm({
        fields: createTestFields(),
        onSubmit,
      })
      setFieldValue('name', 'Test')

      const firstPromise = submit()
      await nextTick()

      const secondResult = await submit()
      expect(secondResult).toBe(false)
      expect(onSubmit).toHaveBeenCalledTimes(1)

      resolveSubmit!(true)
      await firstPromise
    })

    it('should call onError handler when submit throws', async () => {
      const testError = new Error('Server error')
      const onSubmit = vi.fn().mockRejectedValue(testError)
      const onError = vi.fn()
      const { submit, setFieldValue } = useProForm({
        fields: createTestFields(),
        onSubmit,
        onError,
      })
      setFieldValue('name', 'Test')
      const result = await submit()
      expect(result).toBe(false)
      expect(onError).toHaveBeenCalledWith(testError)
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
