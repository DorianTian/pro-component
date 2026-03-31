import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import DrawerForm from '../src/components/DrawerForm.vue'

import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(DrawerForm, {
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

describe('DrawerForm', () => {
  describe('visibility', () => {
    it('should not render drawer content when closed', () => {
      const wrapper = createWrapper({ fields: basicFields() })
      const overlay = document.querySelector('.el-overlay') as HTMLElement | null
      if (overlay) {
        expect(overlay.style.display).toBe('none')
      } else {
        expect(overlay).toBeNull()
      }
      wrapper.unmount()
    })

    it('should render drawer when modelValue is true', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      await nextTick()
      const drawer = document.querySelector('.el-drawer')
      expect(drawer).not.toBeNull()
      wrapper.unmount()
    })

    it('should render form inside drawer when visible', async () => {
      const wrapper = createWrapper({ fields: basicFields(), modelValue: true })
      await nextTick()
      await nextTick()
      const form = document.querySelector('.el-form')
      expect(form).not.toBeNull()
      wrapper.unmount()
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
      await nextTick()
      const header = document.querySelector('.el-drawer__header')
      expect(header?.textContent).toContain('Edit Record')
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

    it('should NOT close drawer when onSubmit returns false', async () => {
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

  describe('width', () => {
    it('should pass width to el-drawer', async () => {
      const wrapper = createWrapper({
        fields: basicFields(),
        modelValue: true,
        width: '600px',
      })
      await nextTick()
      await nextTick()
      const drawer = document.querySelector('.el-drawer')
      expect(drawer).not.toBeNull()
      wrapper.unmount()
    })
  })
})
