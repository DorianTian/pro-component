import { ref, computed, type Ref, type ComputedRef } from 'vue'

/** Options for the usePagination composable */
export interface UsePaginationOptions {
  /** Initial page number (default: 1) */
  defaultCurrent?: number
  /** Initial page size (default: 20) */
  defaultPageSize?: number
  /** Callback fired when current or pageSize changes */
  onChange?: (pagination: { current: number; pageSize: number }) => void
}

/** Default page size when none is specified */
const DEFAULT_PAGE_SIZE = 20

/** Return type of the usePagination composable */
export interface UsePaginationReturn {
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  totalPages: ComputedRef<number>
  setCurrent: (page: number) => void
  setPageSize: (size: number) => void
  setTotal: (total: number) => void
  reset: () => void
}

/**
 * Reactive pagination state management.
 * Automatically resets current page to 1 when pageSize changes.
 * Clamps current page when total shrinks below current position.
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { defaultCurrent = 1, defaultPageSize = DEFAULT_PAGE_SIZE, onChange } = options

  const current = ref(defaultCurrent)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => {
    if (total.value <= 0) return 0
    return Math.ceil(total.value / pageSize.value)
  })

  /** Notify parent of pagination change */
  function notifyChange(): void {
    onChange?.({ current: current.value, pageSize: pageSize.value })
  }

  /** Set current page and notify */
  function setCurrent(page: number): void {
    current.value = page
    notifyChange()
  }

  /** Set page size, reset to page 1, and notify */
  function setPageSize(size: number): void {
    pageSize.value = size
    current.value = 1
    notifyChange()
  }

  /** Set total count, clamping current page if it now exceeds total pages */
  function setTotal(newTotal: number): void {
    total.value = newTotal
    const maxPage = newTotal <= 0 ? 1 : Math.ceil(newTotal / pageSize.value)
    if (current.value > maxPage) {
      current.value = maxPage
    }
  }

  /** Reset pagination to initial state */
  function reset(): void {
    current.value = defaultCurrent
    pageSize.value = defaultPageSize
    total.value = 0
  }

  return {
    current,
    pageSize,
    total,
    totalPages,
    setCurrent,
    setPageSize,
    setTotal,
    reset,
  }
}
