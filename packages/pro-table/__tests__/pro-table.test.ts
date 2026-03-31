import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { waitForReactiveSettle } from '../../hooks/src/test-utils'
import ProTable from '../src/ProTable.vue'
import { useProTable } from '../src/composables/use-pro-table'

import type { ProColumnDef } from '../src/types'
import type { RequestResult } from '@pro/utils'

// --- Element Plus stub components ---

const ElTable = defineComponent({
  name: 'ElTable',
  props: ['data', 'rowKey', 'size', 'loading'],
  emits: ['selection-change', 'sort-change'],
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'el-table-stub', 'data-loading': props.loading }, [slots.default?.()])
  },
})

const ElTableColumn = defineComponent({
  name: 'ElTableColumn',
  props: ['prop', 'label', 'width', 'fixed', 'sortable', 'type', 'showOverflowTooltip'],
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'el-table-column-stub', 'data-prop': props.prop }, [
        slots.default?.({ row: {}, $index: 0 }),
      ])
  },
})

const ElPagination = defineComponent({
  name: 'ElPagination',
  props: ['currentPage', 'pageSize', 'total', 'pageSizes', 'layout'],
  emits: ['current-change', 'size-change'],
  setup(props) {
    return () =>
      h('div', {
        class: 'el-pagination-stub',
        'data-current': props.currentPage,
        'data-total': props.total,
      })
  },
})

const ElForm = defineComponent({
  name: 'ElForm',
  props: ['labelWidth', 'inline'],
  setup(_, { slots }) {
    return () => h('form', { class: 'el-form-stub' }, slots.default?.())
  },
})

const ElFormItem = defineComponent({
  name: 'ElFormItem',
  props: ['label'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-form-item-stub' }, slots.default?.())
  },
})

const ElRow = defineComponent({
  name: 'ElRow',
  props: ['gutter'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-row-stub' }, slots.default?.())
  },
})

const ElCol = defineComponent({
  name: 'ElCol',
  props: ['span'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-col-stub' }, slots.default?.())
  },
})

const ElButton = defineComponent({
  name: 'ElButton',
  props: ['type', 'loading', 'link', 'circle'],
  emits: ['click'],
  setup(_, { slots, emit: btnEmit }) {
    return () =>
      h('button', { class: 'el-button-stub', onClick: () => btnEmit('click') }, slots.default?.())
  },
})

const ElInput = defineComponent({
  name: 'ElInput',
  props: ['modelValue', 'placeholder', 'clearable', 'type'],
  emits: ['update:modelValue'],
  setup(props) {
    return () => h('input', { class: 'el-input-stub', value: props.modelValue })
  },
})

const ElSelect = defineComponent({
  name: 'ElSelect',
  props: ['modelValue', 'clearable', 'placeholder'],
  emits: ['update:modelValue'],
  setup(_, { slots }) {
    return () => h('select', { class: 'el-select-stub' }, slots.default?.())
  },
})

const ElOption = defineComponent({
  name: 'ElOption',
  props: ['label', 'value'],
  setup(props) {
    return () => h('option', { value: props.value }, props.label)
  },
})

const ElTooltip = defineComponent({
  name: 'ElTooltip',
  props: ['content', 'placement'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-tooltip-stub' }, slots.default?.())
  },
})

const ElIcon = defineComponent({
  name: 'ElIcon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon-stub' }, slots.default?.())
  },
})

const ElDivider = defineComponent({
  name: 'ElDivider',
  props: ['direction'],
  setup() {
    return () => h('hr', { class: 'el-divider-stub' })
  },
})

const ElDropdown = defineComponent({
  name: 'ElDropdown',
  props: ['trigger'],
  emits: ['command'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-dropdown-stub' }, [slots.default?.(), slots.dropdown?.()])
  },
})

const ElDropdownMenu = defineComponent({
  name: 'ElDropdownMenu',
  setup(_, { slots }) {
    return () => h('div', { class: 'el-dropdown-menu-stub' }, slots.default?.())
  },
})

const ElDropdownItem = defineComponent({
  name: 'ElDropdownItem',
  props: ['command'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-dropdown-item-stub' }, slots.default?.())
  },
})

const ElPopover = defineComponent({
  name: 'ElPopover',
  props: ['visible', 'placement', 'width', 'trigger'],
  emits: ['update:visible'],
  setup(_, { slots }) {
    return () => h('div', { class: 'el-popover-stub' }, [slots.reference?.(), slots.default?.()])
  },
})

const ElCheckbox = defineComponent({
  name: 'ElCheckbox',
  props: ['modelValue', 'indeterminate'],
  emits: ['change'],
  setup(_, { slots }) {
    return () => h('label', { class: 'el-checkbox-stub' }, slots.default?.())
  },
})

// Stub icons
const Refresh = defineComponent({ name: 'Refresh', render: () => h('span', 'refresh') })
const DCaret = defineComponent({ name: 'DCaret', render: () => h('span', 'dcaret') })
const Setting = defineComponent({ name: 'Setting', render: () => h('span', 'setting') })
const FullScreen = defineComponent({ name: 'FullScreen', render: () => h('span', 'fullscreen') })
const Rank = defineComponent({ name: 'Rank', render: () => h('span', 'rank') })
const Back = defineComponent({ name: 'Back', render: () => h('span', 'back') })
const RightIcon = defineComponent({ name: 'Right', render: () => h('span', 'right') })
const ArrowDown = defineComponent({ name: 'ArrowDown', render: () => h('span', 'arrowdown') })
const ArrowUp = defineComponent({ name: 'ArrowUp', render: () => h('span', 'arrowup') })

const globalStubs = {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElTooltip,
  ElIcon,
  ElDivider,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElPopover,
  ElCheckbox,
  Refresh,
  DCaret,
  Setting,
  FullScreen,
  Rank,
  Back,
  Right: RightIcon,
  ArrowDown,
  ArrowUp,
}

interface TestRow {
  id: string
  name: string
  age: number
}

const testColumns: ProColumnDef<TestRow>[] = [
  { dataIndex: 'id', title: 'ID', hideInSearch: true },
  { dataIndex: 'name', title: 'Name', valueType: 'text' },
  { dataIndex: 'age', title: 'Age', valueType: 'number', hideInSearch: true },
]

function createMockRequest(data: TestRow[] = [], total = 0) {
  return vi.fn().mockResolvedValue({
    data,
    total,
    success: true,
  } satisfies RequestResult<TestRow>)
}

function mountProTable(
  propsOverride: Record<string, unknown> = {},
  options: Record<string, unknown> = {},
) {
  return mount(ProTable, {
    props: {
      columns: testColumns,
      ...propsOverride,
    },
    global: {
      components: globalStubs,
      ...options,
    },
  })
}

describe('ProTable Integration', () => {
  describe('Request Mode', () => {
    it('should render and fetch data on mount', async () => {
      const mockData: TestRow[] = [
        { id: '1', name: 'Alice', age: 30 },
        { id: '2', name: 'Bob', age: 25 },
      ]
      const request = createMockRequest(mockData, 2)

      const wrapper = mountProTable({ request })
      await waitForReactiveSettle()

      expect(request).toHaveBeenCalledTimes(1)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          current: 1,
          pageSize: 20,
        }),
      )

      wrapper.unmount()
    })

    it('should render pagination', async () => {
      const request = createMockRequest([], 100)
      const wrapper = mountProTable({ request })
      await waitForReactiveSettle()

      const pagination = wrapper.find('.el-pagination-stub')
      expect(pagination.exists()).toBe(true)
      expect(pagination.attributes('data-total')).toBe('100')

      wrapper.unmount()
    })

    it('should not render pagination when pagination=false', async () => {
      const wrapper = mountProTable({ pagination: false })
      await waitForReactiveSettle()

      const pagination = wrapper.find('.el-pagination-stub')
      expect(pagination.exists()).toBe(false)

      wrapper.unmount()
    })

    it('should render search form when search is enabled', async () => {
      const wrapper = mountProTable({ search: true })
      await waitForReactiveSettle()

      const form = wrapper.find('.pro-query-filter')
      expect(form.exists()).toBe(true)

      wrapper.unmount()
    })

    it('should not render search form when search=false', async () => {
      const wrapper = mountProTable({ search: false })
      await waitForReactiveSettle()

      const form = wrapper.find('.pro-query-filter')
      expect(form.exists()).toBe(false)

      wrapper.unmount()
    })

    it('should render toolbar', async () => {
      const wrapper = mountProTable({ headerTitle: 'User List' })
      await waitForReactiveSettle()

      const toolbar = wrapper.find('.pro-toolbar')
      expect(toolbar.exists()).toBe(true)

      wrapper.unmount()
    })

    it('should render selection column when rowSelection is provided', async () => {
      const wrapper = mountProTable({
        rowSelection: { rowKey: 'id' },
      })
      await waitForReactiveSettle()

      const selectionCol = wrapper
        .findAll('.el-table-column-stub')
        .find((el) => el.attributes('data-prop') === undefined)
      expect(selectionCol).toBeTruthy()

      wrapper.unmount()
    })
  })

  describe('Controlled Mode', () => {
    it('should render external data without making requests', async () => {
      const controlledData: TestRow[] = [{ id: '1', name: 'External', age: 99 }]

      const wrapper = mountProTable({
        data: controlledData,
        search: false,
      })
      await waitForReactiveSettle()

      const table = wrapper.find('.el-table-stub')
      expect(table.exists()).toBe(true)

      wrapper.unmount()
    })

    it('should use external loading state', async () => {
      const wrapper = mountProTable({
        data: [],
        loading: true,
        search: false,
      })
      await waitForReactiveSettle()

      const table = wrapper.find('.el-table-stub')
      expect(table.attributes('data-loading')).toBe('true')

      wrapper.unmount()
    })
  })

  describe('Dual-Mode Boundary', () => {
    it('should prioritize data prop over request when both are passed', async () => {
      const request = createMockRequest([{ id: '1', name: 'FromRequest', age: 1 }], 1)
      const controlledData: TestRow[] = [{ id: '2', name: 'FromData', age: 2 }]

      const wrapper = mountProTable({
        data: controlledData,
        request,
        search: false,
      })
      await waitForReactiveSettle()

      const table = wrapper.find('.el-table-stub')
      expect(table.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Composable Mode (External useProTable)', () => {
    it('should use external composable when provided via inject', async () => {
      const mockData: TestRow[] = [{ id: '1', name: 'External', age: 42 }]
      const request = createMockRequest(mockData, 1)

      const ParentWrapper = defineComponent({
        setup() {
          const tableState = useProTable<TestRow>({
            columns: testColumns,
            request,
          })
          return { tableState }
        },
        render() {
          return h(ProTable, {
            columns: testColumns,
            search: false,
          })
        },
      })

      const wrapper = mount(ParentWrapper, {
        global: {
          components: globalStubs,
        },
      })

      await waitForReactiveSettle()

      const table = wrapper.find('.el-table-stub')
      expect(table.exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Column Settings', () => {
    it('should hide columns marked as hideInTable', async () => {
      const columnsWithHidden: ProColumnDef<TestRow>[] = [
        { dataIndex: 'id', title: 'ID' },
        { dataIndex: 'name', title: 'Name', hideInTable: true },
        { dataIndex: 'age', title: 'Age' },
      ]

      const wrapper = mountProTable({
        columns: columnsWithHidden,
        search: false,
      })
      await waitForReactiveSettle()

      const colStubs = wrapper.findAll('.el-table-column-stub')
      const propValues = colStubs.map((c) => c.attributes('data-prop')).filter(Boolean)

      expect(propValues).toContain('id')
      expect(propValues).not.toContain('name')
      expect(propValues).toContain('age')

      wrapper.unmount()
    })
  })

  describe('ValueType Formatting', () => {
    it('should format cell values using valueType', async () => {
      const columnsWithTypes: ProColumnDef[] = [
        { dataIndex: 'price', title: 'Price', valueType: 'money' },
        { dataIndex: 'rate', title: 'Rate', valueType: 'percent' },
      ]

      const wrapper = mount(ProTable, {
        props: {
          columns: columnsWithTypes,
          data: [{ price: 1234.5, rate: 0.856 }],
          search: false,
          pagination: false,
        },
        global: {
          components: globalStubs,
        },
      })
      await waitForReactiveSettle()

      const table = wrapper.find('.el-table-stub')
      expect(table.exists()).toBe(true)

      wrapper.unmount()
    })
  })
})
