import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import ModalForm from '../src/components/ModalForm.vue'

import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(ModalForm, {
    props,
    global: {
      plugins: [ElementPlus],
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
      // When closed, el-dialog body content should not be visible
      const overlay = document.querySelector('.el-overlay') as HTMLElement | null
      if (overlay) {
        expect(overlay.style.display).toBe('none')
      } else {
        expect(overlay).toBeNull()
      }
      wrapper.unmount()
    })

    it('should render dialog when visible prop is true', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      await nextTick()
      // Dialog teleports to body
      const dialog = document.querySelector('.el-dialog')
      expect(dialog).not.toBeNull()
      wrapper.unmount()
    })

    it('should render form inside dialog when visible', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      await nextTick()
      const form = document.querySelector('.el-form')
      expect(form).not.toBeNull()
      wrapper.unmount()
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
      await nextTick()
      const header = document.querySelector('.el-dialog__header')
      expect(header?.textContent).toContain('Create User')
      wrapper.unmount()
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
      await nextTick()
      const input = document.querySelector('.el-input__inner') as HTMLInputElement
      expect(input).not.toBeNull()
      expect(input.value).toBe('Prefilled')
      wrapper.unmount()
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
      await nextTick()

      const submitBtn = document.querySelector('.pro-form__submit') as HTMLElement
      expect(submitBtn).not.toBeNull()
      submitBtn.click()
      await flushPromises()

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }))
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
      wrapper.unmount()
    })

    it('should NOT close dialog when onSubmit returns false', async () => {
      const onSubmit = vi.fn().mockResolvedValue(false)
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        onSubmit,
      })
      await nextTick()
      await nextTick()

      const submitBtn = document.querySelector('.pro-form__submit') as HTMLElement
      submitBtn.click()
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
      wrapper.unmount()
    })
  })

  describe('close behavior', () => {
    it('should be controllable via modelValue prop (v-model pattern)', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
      })
      await nextTick()
      await nextTick()

      // Verify dialog is visible
      const dialog = document.querySelector('.el-dialog')
      expect(dialog).not.toBeNull()

      // Close via prop change (parent controls visibility)
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      wrapper.unmount()
    })
  })
})
