import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'

import type { ProColumnDef, ValueType } from '@pro/utils'

/**
 * Verify that a single columns definition works correctly across
 * ProForm (as QueryFilter fields) and ProDescriptions.
 */

import QueryFilter from '../src/components/QueryFilter.vue'
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
      rawValue: unknown
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

    valueTypeCases.forEach(
      ({ valueType, rawValue, expectedSearchControl, expectedDescriptionContains }) => {
        it(`${valueType}: should render correct search control and description format`, () => {
          const columns: ProColumnDef[] = [
            {
              dataIndex: 'field',
              title: 'Field',
              valueType: valueType as ValueType,
            },
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
      },
    )
  })
})
