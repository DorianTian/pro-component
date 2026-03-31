import { describe, it, expect, vi } from 'vitest'
import { mountComposable } from '../src/test-utils'
import { useSelection } from '../src/use-selection'

interface TestRow {
  id: string
  name: string
}

describe('useSelection', () => {
  it('should initialize with empty selection', () => {
    const { result, unmount } = mountComposable(() => useSelection<TestRow>({ rowKey: 'id' }))

    expect(result.selectedRows.value).toEqual([])
    expect(result.selectedRowKeys.value).toEqual([])

    unmount()
  })

  it('should select rows', () => {
    const { result, unmount } = mountComposable(() => useSelection<TestRow>({ rowKey: 'id' }))

    const rows: TestRow[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]

    result.onSelectionChange(rows)

    expect(result.selectedRows.value).toEqual(rows)
    expect(result.selectedRowKeys.value).toEqual(['1', '2'])

    unmount()
  })

  it('should clear selection', () => {
    const { result, unmount } = mountComposable(() => useSelection<TestRow>({ rowKey: 'id' }))

    result.onSelectionChange([{ id: '1', name: 'Alice' }])

    result.clearSelection()

    expect(result.selectedRows.value).toEqual([])
    expect(result.selectedRowKeys.value).toEqual([])

    unmount()
  })

  it('should support cross-page persistence when enabled', () => {
    const { result, unmount } = mountComposable(() =>
      useSelection<TestRow>({ rowKey: 'id', crossPageSelect: true }),
    )

    // Page 1 selection
    result.onSelectionChange([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ])

    // Simulate page change — new page selection replaces current page rows
    // but should merge with cross-page accumulated state
    result.onSelectionChange(
      [{ id: '3', name: 'Charlie' }],
      [
        { id: '3', name: 'Charlie' },
        { id: '4', name: 'Dave' },
      ], // current page data
    )

    expect(result.selectedRowKeys.value).toContain('1')
    expect(result.selectedRowKeys.value).toContain('2')
    expect(result.selectedRowKeys.value).toContain('3')
    expect(result.selectedRowKeys.value).not.toContain('4')
    expect(result.selectedRows.value).toHaveLength(3)

    unmount()
  })

  it('should NOT persist across pages when crossPageSelect is false (default)', () => {
    const { result, unmount } = mountComposable(() => useSelection<TestRow>({ rowKey: 'id' }))

    result.onSelectionChange([{ id: '1', name: 'Alice' }])

    // New page, new selection — previous selection lost
    result.onSelectionChange([{ id: '3', name: 'Charlie' }])

    expect(result.selectedRows.value).toEqual([{ id: '3', name: 'Charlie' }])
    expect(result.selectedRowKeys.value).toEqual(['3'])

    unmount()
  })

  it('should call onChange callback when selection changes', () => {
    const onChange = vi.fn()
    const { result, unmount } = mountComposable(() =>
      useSelection<TestRow>({ rowKey: 'id', onChange }),
    )

    const rows: TestRow[] = [{ id: '1', name: 'Alice' }]
    result.onSelectionChange(rows)

    expect(onChange).toHaveBeenCalledWith(['1'], rows)

    unmount()
  })

  it('should support function-based rowKey', () => {
    const { result, unmount } = mountComposable(() =>
      useSelection<TestRow>({ rowKey: (row) => `key-${row.id}` }),
    )

    result.onSelectionChange([{ id: '1', name: 'Alice' }])
    expect(result.selectedRowKeys.value).toEqual(['key-1'])

    unmount()
  })

  it('should deselect rows from current page during cross-page mode', () => {
    const { result, unmount } = mountComposable(() =>
      useSelection<TestRow>({ rowKey: 'id', crossPageSelect: true }),
    )

    // Select all on page 1
    const page1Data: TestRow[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]
    result.onSelectionChange(page1Data, page1Data)

    // Deselect id=2 on page 1
    result.onSelectionChange([{ id: '1', name: 'Alice' }], page1Data)

    expect(result.selectedRowKeys.value).toEqual(['1'])
    expect(result.selectedRows.value).toHaveLength(1)

    unmount()
  })
})
