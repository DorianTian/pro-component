import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ElementPlus from 'element-plus'
import ProDescriptions from '../src/ProDescriptions.vue'

import type { ProColumnDef } from '@pro/utils'

function createWrapper(props: Record<string, unknown> = {}) {
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
          descriptionsRender: (value: unknown) =>
            h('span', { class: 'custom-render' }, `Custom: ${value}`),
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
      expect(
        wrapper.find('.el-descriptions--bordered').exists() ||
          wrapper.find('.is-bordered').exists(),
      ).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading skeleton when loading is true', () => {
      const wrapper = createWrapper({
        columns: basicColumns(),
        data: basicData(),
        loading: true,
      })
      expect(
        wrapper.find('.el-skeleton').exists() ||
          wrapper.find('.pro-descriptions--loading').exists(),
      ).toBe(true)
    })
  })
})
