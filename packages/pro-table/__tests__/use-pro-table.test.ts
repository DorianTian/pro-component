import { describe, it, expect, vi } from 'vitest'
import { mountComposable, waitForReactiveSettle } from '../../hooks/src/test-utils'
import { useProTable } from '../src/composables/use-pro-table'

import type { ProColumnDef } from '../src/types'
import type { RequestResult } from '@pro/utils'

interface TestRow {
  id: string
  name: string
  age: number
}

const columns: ProColumnDef<TestRow>[] = [
  { dataIndex: 'id', title: 'ID' },
  { dataIndex: 'name', title: 'Name', valueType: 'text' },
  { dataIndex: 'age', title: 'Age', valueType: 'number' },
]

function createMockRequest(data: TestRow[] = [], total = 0) {
  return vi.fn().mockResolvedValue({
    data,
    total,
    success: true,
  } satisfies RequestResult<TestRow>)
}

describe('useProTable', () => {
  it('should initialize with empty state', () => {
    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns }))

    expect(result.dataSource.value).toEqual([])
    expect(result.loading.value).toBe(false)
    expect(result.pagination.current.value).toBe(1)
    expect(result.pagination.pageSize.value).toBe(20)
    expect(result.selectedRows.value).toEqual([])
    expect(result.formValues.value).toEqual({})

    unmount()
  })

  it('should fetch data via request on reload', async () => {
    const mockData: TestRow[] = [
      { id: '1', name: 'Alice', age: 30 },
      { id: '2', name: 'Bob', age: 25 },
    ]
    const request = createMockRequest(mockData, 50)

    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns, request }))

    await result.reload()
    await waitForReactiveSettle()

    expect(request).toHaveBeenCalledWith({
      current: 1,
      pageSize: 20,
    })
    expect(result.dataSource.value).toEqual(mockData)
    expect(result.pagination.total.value).toBe(50)

    unmount()
  })

  it('should include formValues in request params', async () => {
    const request = createMockRequest([], 0)

    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns, request }))

    result.setFormValues({ name: 'Alice' })
    await result.reload()
    await waitForReactiveSettle()

    expect(request).toHaveBeenCalledWith({
      current: 1,
      pageSize: 20,
      name: 'Alice',
    })

    unmount()
  })

  it('should reset page to 1 when reload(true) is called', async () => {
    const request = createMockRequest([], 50)

    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns, request }))

    result.pagination.current.value = 3
    await result.reload(true)
    await waitForReactiveSettle()

    expect(result.pagination.current.value).toBe(1)
    expect(request).toHaveBeenCalledWith({
      current: 1,
      pageSize: 20,
    })

    unmount()
  })

  it('should reset all state when reset() is called', async () => {
    const request = createMockRequest([], 50)

    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns, request }))

    result.setFormValues({ name: 'search' })
    result.pagination.current.value = 3
    result.sortState.value = { prop: 'name', order: 'ascending' }

    result.reset()
    await waitForReactiveSettle()

    expect(result.formValues.value).toEqual({})
    expect(result.pagination.current.value).toBe(1)
    expect(result.sortState.value).toBeNull()

    unmount()
  })

  it('should support beforeRequest transform', async () => {
    const request = createMockRequest([], 0)
    const beforeRequest = vi.fn((params) => ({
      ...params,
      extra: 'injected',
    }))

    const { result, unmount } = mountComposable(() =>
      useProTable<TestRow>({
        columns,
        request,
        beforeRequest,
      }),
    )

    await result.reload()
    await waitForReactiveSettle()

    expect(request).toHaveBeenCalledWith({
      current: 1,
      pageSize: 20,
      extra: 'injected',
    })

    unmount()
  })

  it('should support afterResponse transform', async () => {
    const rawResponse = { items: [{ id: '1', name: 'A', age: 1 }], count: 1, ok: true }
    const request = vi.fn().mockResolvedValue(rawResponse)
    const afterResponse = vi.fn((raw: Record<string, unknown>) => ({
      data: raw.items,
      total: raw.count,
      success: raw.ok,
    }))

    const { result, unmount } = mountComposable(() =>
      useProTable<TestRow>({
        columns,
        request,
        afterResponse,
      }),
    )

    await result.reload()
    await waitForReactiveSettle()

    expect(result.dataSource.value).toEqual([{ id: '1', name: 'A', age: 1 }])
    expect(result.pagination.total.value).toBe(1)

    unmount()
  })

  it('should expose insertRow/updateRow/deleteRow', () => {
    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns }))

    result.insertRow({ id: '1', name: 'Alice', age: 30 })
    expect(result.dataSource.value).toHaveLength(1)

    result.updateRow('1', { name: 'Alicia' })
    expect(result.dataSource.value[0].name).toBe('Alicia')

    result.deleteRow('1')
    expect(result.dataSource.value).toHaveLength(0)

    unmount()
  })

  it('should compute proTableProps for binding', () => {
    const { result, unmount } = mountComposable(() => useProTable<TestRow>({ columns }))

    const props = result.proTableProps.value
    expect(props).toHaveProperty('columns')
    expect(props).toHaveProperty('loading')
    expect(props).toHaveProperty('data')

    unmount()
  })

  it('should use custom defaultPageSize', () => {
    const { result, unmount } = mountComposable(() =>
      useProTable<TestRow>({ columns, defaultPageSize: 50 }),
    )

    expect(result.pagination.pageSize.value).toBe(50)

    unmount()
  })

  it('should clear selection', () => {
    const { result, unmount } = mountComposable(() =>
      useProTable<TestRow>({ columns, rowKey: 'id' }),
    )

    // Manually push to simulate selection
    result.selectedRows.value = [{ id: '1', name: 'A', age: 1 }]
    result.selectedRowKeys.value = ['1']

    result.clearSelection()
    expect(result.selectedRows.value).toEqual([])
    expect(result.selectedRowKeys.value).toEqual([])

    unmount()
  })
})
