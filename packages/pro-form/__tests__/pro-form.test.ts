import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import ElementPlus from 'element-plus'
import ProForm from '../src/ProForm.vue'

import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
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
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } },
    },
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
      const fields: ProFieldDef[] = [{ dataIndex: 'name', title: 'Name', valueType: 'text' }]
      const wrapper = createWrapper({ fields })
      expect(wrapper.find('.el-input').exists()).toBe(true)
    })

    it('should render number field as el-input-number', () => {
      const fields: ProFieldDef[] = [{ dataIndex: 'count', title: 'Count', valueType: 'number' }]
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

    it('should render custom renderFormItem when provided', () => {
      const fields: ProFieldDef[] = [
        {
          dataIndex: 'custom',
          title: 'Custom',
          valueType: 'text',
          renderFormItem: (modelValue: unknown, onChange: (val: unknown) => void) =>
            h(
              'div',
              { class: 'custom-control', onClick: () => onChange('clicked') },
              `Value: ${modelValue}`,
            ),
        },
      ]
      const wrapper = createWrapper({ fields, initialValues: { custom: 'hello' } })
      expect(wrapper.find('.custom-control').exists()).toBe(true)
      expect(wrapper.text()).toContain('Value: hello')
    })
  })

  describe('initial values', () => {
    it('should populate form controls with initialValues', async () => {
      const fields: ProFieldDef[] = [{ dataIndex: 'name', title: 'Name', valueType: 'text' }]
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

      const input = wrapper.find('.el-input__inner')
      await input.setValue('Modified')
      expect((input.element as HTMLInputElement).value).toBe('Modified')

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
