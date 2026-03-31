import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mountComposable } from '../src/test-utils'
import { useRowOperation } from '../src/use-row-operation'

interface TestRow {
  id: string
  name: string
}

describe('useRowOperation', () => {
  function createDeps() {
    const dataSource = ref<TestRow[]>([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ])
    const current = ref(1)
    const pageSize = ref(2)
    const total = ref(3)

    return { dataSource, current, pageSize, total }
  }

  it('should insert a row at the end by default', () => {
    const deps = createDeps()
    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
      }),
    )

    result.insertRow({ id: '4', name: 'Dave' })

    expect(deps.dataSource.value).toHaveLength(4)
    expect(deps.dataSource.value[3]).toEqual({ id: '4', name: 'Dave' })
    expect(deps.total.value).toBe(4)

    unmount()
  })

  it('should insert a row at a specific index', () => {
    const deps = createDeps()
    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
      }),
    )

    result.insertRow({ id: '4', name: 'Dave' }, 1)

    expect(deps.dataSource.value[1]).toEqual({ id: '4', name: 'Dave' })
    expect(deps.dataSource.value).toHaveLength(4)

    unmount()
  })

  it('should update a row by key', () => {
    const deps = createDeps()
    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
      }),
    )

    result.updateRow('2', { name: 'Bobby' })

    expect(deps.dataSource.value[1]).toEqual({ id: '2', name: 'Bobby' })

    unmount()
  })

  it('should delete a row by key', () => {
    const deps = createDeps()
    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
      }),
    )

    result.deleteRow('2')

    expect(deps.dataSource.value).toHaveLength(2)
    expect(deps.dataSource.value.map((r) => r.id)).toEqual(['1', '3'])
    expect(deps.total.value).toBe(2)

    unmount()
  })

  it('should auto-adjust pagination when deleting last item on last page', () => {
    const deps = createDeps()
    // 3 items, pageSize=2 -> 2 pages. Set current to page 2 (has 1 item: Charlie).
    deps.current.value = 2
    const onPageBack = vi.fn()

    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
        onPageBack,
      }),
    )

    result.deleteRow('3') // Delete the only item on page 2

    expect(deps.current.value).toBe(1)
    expect(onPageBack).toHaveBeenCalled()

    unmount()
  })

  it('should NOT adjust pagination when items remain on current page', () => {
    const deps = createDeps()
    deps.current.value = 1

    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: 'id',
      }),
    )

    result.deleteRow('1') // Page 1 still has Bob

    expect(deps.current.value).toBe(1)

    unmount()
  })

  it('should handle function-based rowKey', () => {
    const deps = createDeps()
    const { result, unmount } = mountComposable(() =>
      useRowOperation<TestRow>({
        dataSource: deps.dataSource,
        current: deps.current,
        pageSize: deps.pageSize,
        total: deps.total,
        rowKey: (row) => row.id,
      }),
    )

    result.updateRow('1', { name: 'Alicia' })
    expect(deps.dataSource.value[0].name).toBe('Alicia')

    result.deleteRow('1')
    expect(deps.dataSource.value).toHaveLength(2)

    unmount()
  })
})
