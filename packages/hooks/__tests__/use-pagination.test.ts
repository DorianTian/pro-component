import { describe, it, expect, vi } from 'vitest'
import { mountComposable } from '../src/test-utils'
import { usePagination } from '../src/use-pagination'

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result, unmount } = mountComposable(() => usePagination())

    expect(result.current.value).toBe(1)
    expect(result.pageSize.value).toBe(20)
    expect(result.total.value).toBe(0)
    expect(result.totalPages.value).toBe(0)

    unmount()
  })

  it('should accept custom initial values', () => {
    const { result, unmount } = mountComposable(() =>
      usePagination({ defaultCurrent: 3, defaultPageSize: 50 }),
    )

    expect(result.current.value).toBe(3)
    expect(result.pageSize.value).toBe(50)

    unmount()
  })

  it('should compute totalPages correctly', () => {
    const { result, unmount } = mountComposable(() => usePagination({ defaultPageSize: 10 }))

    result.setTotal(95)
    expect(result.totalPages.value).toBe(10)

    result.setTotal(100)
    expect(result.totalPages.value).toBe(10)

    result.setTotal(0)
    expect(result.totalPages.value).toBe(0)

    unmount()
  })

  it('should update current page', () => {
    const { result, unmount } = mountComposable(() => usePagination())

    result.setCurrent(5)
    expect(result.current.value).toBe(5)

    unmount()
  })

  it('should update page size and reset current to 1', () => {
    const { result, unmount } = mountComposable(() => usePagination())

    result.setCurrent(5)
    result.setPageSize(50)

    expect(result.pageSize.value).toBe(50)
    expect(result.current.value).toBe(1)

    unmount()
  })

  it('should reset pagination to initial state', () => {
    const { result, unmount } = mountComposable(() =>
      usePagination({ defaultCurrent: 1, defaultPageSize: 20 }),
    )

    result.setCurrent(5)
    result.setPageSize(50)
    result.setTotal(200)

    result.reset()

    expect(result.current.value).toBe(1)
    expect(result.pageSize.value).toBe(20)
    expect(result.total.value).toBe(0)

    unmount()
  })

  it('should call onChange callback when current or pageSize changes', () => {
    const onChange = vi.fn()
    const { result, unmount } = mountComposable(() => usePagination({ onChange }))

    result.setCurrent(3)
    expect(onChange).toHaveBeenCalledWith({ current: 3, pageSize: 20 })

    result.setPageSize(50)
    expect(onChange).toHaveBeenCalledWith({ current: 1, pageSize: 50 })

    unmount()
  })

  it('should clamp current page when total shrinks', () => {
    const { result, unmount } = mountComposable(() => usePagination({ defaultPageSize: 10 }))

    result.setTotal(50)
    result.setCurrent(5) // last page

    result.setTotal(30) // now only 3 pages
    expect(result.current.value).toBe(3)

    unmount()
  })

  it('should not go below page 1 when clamping', () => {
    const { result, unmount } = mountComposable(() => usePagination({ defaultPageSize: 10 }))

    result.setTotal(5)
    result.setCurrent(1)

    result.setTotal(0)
    expect(result.current.value).toBe(1)

    unmount()
  })
})
