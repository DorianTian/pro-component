import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import QueryFilter from '../src/components/QueryFilter.vue'

import type { ProFieldDef } from '@pro/utils'

function createWrapper(props: Record<string, unknown> = {}) {
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
    {
      dataIndex: 'status',
      title: 'Status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } },
    },
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
      // 3 field items + 1 actions item = 4
      expect(items).toHaveLength(4)
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
    it('should emit reset event when Reset button clicked', async () => {
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

      // Should show only first 3 fields + 1 actions = 4 form-items
      const visibleItems = wrapper.findAll('.el-form-item')
      expect(visibleItems).toHaveLength(4)
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

      const toggle = wrapper.find('.pro-query-filter__collapse-toggle')
      await toggle.trigger('click')
      await nextTick()

      // All 4 fields + 1 actions = 5
      const visibleItems = wrapper.findAll('.el-form-item')
      expect(visibleItems).toHaveLength(5)
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
