import { ref, computed, type Ref, type ComputedRef } from 'vue'

/** URL sync configuration for pagination query params */
export interface PaginationURLSyncConfig {
  /** Query param key for current page (default: 'page') */
  currentKey?: string
  /** Query param key for page size (default: 'pageSize') */
  pageSizeKey?: string
}

/** Options for the usePagination composable */
export interface UsePaginationOptions {
  /** Initial page number (default: 1) */
  defaultCurrent?: number
  /** Initial page size (default: 20) */
  defaultPageSize?: number
  /** Sync pagination state to URL query params. Pass true for defaults or config object */
  syncURL?: boolean | PaginationURLSyncConfig
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
  /** Whether current page is the first page */
  isFirstPage: ComputedRef<boolean>
  /** Whether current page is the last page */
  isLastPage: ComputedRef<boolean>
  setCurrent: (page: number) => void
  setPageSize: (size: number) => void
  setTotal: (total: number) => void
  reset: () => void
}

/** Resolve syncURL option to a normalized config or null */
function resolveURLSync(
  syncURL?: boolean | PaginationURLSyncConfig,
): PaginationURLSyncConfig | null {
  if (!syncURL) return null
  if (syncURL === true) return { currentKey: 'page', pageSizeKey: 'pageSize' }
  return {
    currentKey: syncURL.currentKey ?? 'page',
    pageSizeKey: syncURL.pageSizeKey ?? 'pageSize',
  }
}

/** Read pagination params from current URL */
function readFromURL(config: PaginationURLSyncConfig): { current?: number; pageSize?: number } {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const rawCurrent = params.get(config.currentKey!)
  const rawPageSize = params.get(config.pageSizeKey!)
  const parsedCurrent = rawCurrent ? Number(rawCurrent) : NaN
  const parsedPageSize = rawPageSize ? Number(rawPageSize) : NaN
  return {
    current: Number.isFinite(parsedCurrent) && parsedCurrent > 0 ? parsedCurrent : undefined,
    pageSize: Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : undefined,
  }
}

/** Write pagination params to URL via replaceState (no navigation) */
function writeToURL(config: PaginationURLSyncConfig, current: number, pageSize: number): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (current === 1) {
    url.searchParams.delete(config.currentKey!)
  } else {
    url.searchParams.set(config.currentKey!, String(current))
  }
  url.searchParams.set(config.pageSizeKey!, String(pageSize))
  window.history.replaceState(null, '', url.toString())
}

/** Remove pagination params from URL */
function clearURL(config: PaginationURLSyncConfig): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete(config.currentKey!)
  url.searchParams.delete(config.pageSizeKey!)
  window.history.replaceState(null, '', url.toString())
}

/**
 * Reactive pagination state management.
 * Automatically resets current page to 1 when pageSize changes.
 * Clamps current page when total shrinks below current position.
 * Optionally syncs state to URL query params.
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { defaultCurrent = 1, defaultPageSize = DEFAULT_PAGE_SIZE, onChange } = options

  const urlSync = resolveURLSync(options.syncURL)
  const urlValues = urlSync ? readFromURL(urlSync) : {}

  const current = ref(urlValues.current ?? defaultCurrent)
  const pageSize = ref(urlValues.pageSize ?? defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => {
    if (total.value <= 0) return 0
    return Math.ceil(total.value / pageSize.value)
  })

  const isFirstPage = computed(() => current.value <= 1)

  const isLastPage = computed(() => {
    if (totalPages.value === 0) return true
    return current.value >= totalPages.value
  })

  /** Notify parent of pagination change and sync URL */
  function notifyChange(): void {
    onChange?.({ current: current.value, pageSize: pageSize.value })
    if (urlSync) {
      writeToURL(urlSync, current.value, pageSize.value)
    }
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

  /** Reset pagination to initial state and clear URL params */
  function reset(): void {
    current.value = defaultCurrent
    pageSize.value = defaultPageSize
    total.value = 0
    if (urlSync) {
      clearURL(urlSync)
    }
  }

  return {
    current,
    pageSize,
    total,
    totalPages,
    isFirstPage,
    isLastPage,
    setCurrent,
    setPageSize,
    setTotal,
    reset,
  }
}
