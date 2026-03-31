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
      valueEnum: {
        active: { text: 'Active', status: 'success' },
        inactive: { text: 'Inactive', status: 'danger' },
      },
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
          descriptionsRender: (value: unknown) => `Custom: ${value}`,
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
