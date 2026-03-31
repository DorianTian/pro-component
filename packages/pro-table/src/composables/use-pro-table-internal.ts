import { ref, computed, provide, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { useRequest, usePagination, useSelection, useValueType } from '@pro/hooks'

import type { RequestParams, RequestResult } from '@pro/utils'
import type {
  ProColumnDef,
  SearchConfig,
  PaginationConfig,
  RowSelectionConfig,
  DensitySize,
  ColumnSettingItem,
  UseProTableReturn,
} from '../types'
import {
  DENSITY_INJECTION_KEY,
  COLUMN_SETTING_INJECTION_KEY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGINATION_LAYOUT,
  DEFAULT_DENSITY,
} from '../constants'
import {
  buildColumnSettings as buildSettings,
  buildVisibleColumns as buildVisible,
  formatCellValue as formatCell,
} from './column-helpers'

/** Options passed from ProTable.vue props to the internal composable */
export interface UseProTableInternalOptions {
  columns: Ref<ProColumnDef[]>
  request?: (params: RequestParams) => Promise<RequestResult>
  data?: Ref<Record<string, unknown>[] | undefined>
  externalLoading?: Ref<boolean | undefined>
  rowKey: Ref<string | ((row: unknown) => string)>
  search: Ref<boolean | SearchConfig>
  initialValues: Ref<Record<string, unknown>>
  pagination: Ref<false | PaginationConfig>
  rowSelection?: Ref<RowSelectionConfig | undefined>
  beforeRequest?: (params: RequestParams) => RequestParams
  afterResponse?: (raw: unknown) => RequestResult
  onSelectionChange: (keys: string[], rows: unknown[]) => void
  onSortChange: (state: { prop: string; order: string } | null) => void
  onPageChange: (pag: { current: number; pageSize: number }) => void
  onReload: () => void
  onReset: () => void
}

/** Return type from the internal composable, consumed by ProTable.vue template */
export interface UseProTableInternalReturn {
  // External mode detection
  externalInstance: UseProTableReturn | null
  isExternalMode: ComputedRef<boolean>

  // Active resolved state
  activeData: ComputedRef<unknown[]>
  activeLoading: ComputedRef<boolean>
  activePagination: ComputedRef<{
    current: Ref<number>
    pageSize: Ref<number>
    total: Ref<number>
    totalPages: ComputedRef<number>
  }>

  // Form state
  formValues: Ref<Record<string, unknown>>
  sortState: Ref<{ prop: string; order: 'ascending' | 'descending' } | null>

  // Density
  densitySize: Ref<DensitySize>
  tableSize: ComputedRef<string>

  // Column settings
  columnSettings: Ref<ColumnSettingItem[]>
  showColumnSettingPanel: Ref<boolean>
  visibleColumns: ComputedRef<ProColumnDef[]>

  // Pagination config
  isPaginationEnabled: ComputedRef<boolean>
  pageSizes: ComputedRef<number[]>
  paginationLayout: ComputedRef<string>

  // ValueType
  formatCellValue: (col: ProColumnDef, row: Record<string, unknown>) => string

  // Selection
  handleSelectionChange: (rows: unknown[]) => void

  // Actions
  fetchData: () => Promise<void>
  handleSearch: (values: Record<string, unknown>) => void
  handleReset: () => void
  handleSortChange: (sort: { prop: string; order: string }) => void
  handlePageChange: (page: number) => void
  handleSizeChange: (size: number) => void
  handleReload: () => void
  handleToggleColumnSetting: () => void
  isFullscreen: Ref<boolean>
  tableContainerRef: Ref<HTMLElement | null>
  handleToggleFullscreen: () => void
}

/**
 * Internal composable that manages all ProTable state.
 * Extracted from ProTable.vue script setup to keep the SFC lean.
 */
// eslint-disable-next-line max-lines-per-function -- Composable orchestrator; splitting deferred to dedicated refactor
export function useProTableInternal(
  options: UseProTableInternalOptions,
  externalInstance: UseProTableReturn | null,
): UseProTableInternalReturn {
  const isExternalMode = computed(() => externalInstance !== null)

  // --- Internal state ---
  const formValues = ref({ ...options.initialValues.value })
  const sortState = ref<{ prop: string; order: 'ascending' | 'descending' } | null>(null)

  // --- Internal pagination ---
  const paginationConfig = options.pagination.value
  const internalPagination = usePagination({
    defaultCurrent: typeof paginationConfig === 'object' ? paginationConfig.defaultCurrent : 1,
    defaultPageSize:
      typeof paginationConfig === 'object' ? paginationConfig.defaultPageSize : DEFAULT_PAGE_SIZE,
    onChange(pag) {
      if (!isExternalMode.value) {
        void fetchData()
        options.onPageChange(pag)
      }
    },
  })

  // --- Internal request ---
  const internalRequest = useRequest(buildWrappedFetcher(), {
    onSuccess(result) {
      if (!isExternalMode.value) {
        internalPagination.setTotal(result.total)
      }
    },
  })

  // --- Internal selection ---
  const internalSelection = useSelection({
    rowKey: resolveRowKey(),
    crossPageSelect: options.rowSelection?.value?.crossPageSelect,
    onChange(keys, rows) {
      options.onSelectionChange(keys, rows)
      options.rowSelection?.value?.onChange?.(keys, rows)
    },
  })

  // --- Resolved active state ---
  const activeData = computed(() => {
    if (externalInstance) return externalInstance.dataSource.value
    if (options.data?.value !== undefined) return options.data.value
    return internalRequest.data.value
  })

  const activeLoading = computed(() => {
    if (externalInstance) return externalInstance.loading.value
    if (options.externalLoading?.value !== undefined) return options.externalLoading.value
    return internalRequest.loading.value
  })

  const activePagination = computed(() => {
    if (externalInstance) return externalInstance.pagination
    return {
      current: internalPagination.current,
      pageSize: internalPagination.pageSize,
      total: internalPagination.total,
      totalPages: internalPagination.totalPages,
    }
  })

  // --- Density ---
  const densitySize = ref<DensitySize>(DEFAULT_DENSITY)
  provide(DENSITY_INJECTION_KEY, { size: densitySize })

  const DENSITY_TO_EL_SIZE: Record<DensitySize, string> = {
    compact: 'small',
    default: 'default',
    relaxed: 'large',
  }
  const tableSize = computed(() => DENSITY_TO_EL_SIZE[densitySize.value] ?? 'default')

  // --- Column settings ---
  const columnSettings = ref(buildSettings(options.columns.value))

  function updateColumnSetting(key: string, updates: Partial<ColumnSettingItem>): void {
    const idx = columnSettings.value.findIndex((c) => c.key === key)
    if (idx === -1) return
    columnSettings.value[idx] = { ...columnSettings.value[idx], ...updates }
    columnSettings.value = [...columnSettings.value]
  }

  function resetColumnSettings(): void {
    columnSettings.value = buildSettings(options.columns.value)
  }

  provide(COLUMN_SETTING_INJECTION_KEY, {
    columns: columnSettings,
    updateColumn: updateColumnSetting,
    resetColumns: resetColumnSettings,
  })

  const showColumnSettingPanel = ref(false)

  const visibleColumns = computed(() => buildVisible(options.columns.value, columnSettings.value))

  // --- ValueType rendering ---
  const { getTableRenderConfig } = useValueType()

  // --- Pagination config ---
  const isPaginationEnabled = computed(() => options.pagination.value !== false)

  const pageSizes = computed(() => {
    const pag = options.pagination.value
    return typeof pag === 'object' && pag.pageSizes ? pag.pageSizes : DEFAULT_PAGE_SIZE_OPTIONS
  })

  const paginationLayout = computed(() => {
    const pag = options.pagination.value
    return typeof pag === 'object' && pag.layout ? pag.layout : DEFAULT_PAGINATION_LAYOUT
  })

  // --- Lifecycle ---
  const isRequestMode = computed(
    () =>
      !isExternalMode.value && options.request !== undefined && options.data?.value === undefined,
  )

  watch(
    () => options.data?.value,
    (newData) => {
      if (newData !== undefined && !isExternalMode.value) {
        internalPagination.setTotal(newData.length)
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (isRequestMode.value) {
      void fetchData()
    }
  })

  // --- Helper functions ---

  function resolveRowKey(): (row: unknown) => string {
    const rk = options.rowSelection?.value?.rowKey ?? options.rowKey.value
    if (typeof rk === 'function') return rk as (row: unknown) => string
    const key = rk
    return (row: unknown) => String((row as Record<string, unknown>)[key])
  }

  function buildWrappedFetcher(): (params: RequestParams) => Promise<RequestResult> {
    return async (params: RequestParams): Promise<RequestResult> => {
      if (!options.request) return { data: [], total: 0, success: true }
      const transformed = options.beforeRequest ? options.beforeRequest(params) : params
      const raw = await options.request(transformed)
      return options.afterResponse ? options.afterResponse(raw) : raw
    }
  }

  /** Format a cell value using column config and valueType rendering */
  function formatCellValue(col: ProColumnDef, row: Record<string, unknown>): string {
    return formatCell(col, row, getTableRenderConfig)
  }

  // --- Actions ---

  async function fetchData(): Promise<void> {
    if (externalInstance) {
      await externalInstance.reload()
      return
    }
    if (!options.request) return

    const params: RequestParams = {
      current: internalPagination.current.value,
      pageSize: internalPagination.pageSize.value,
      ...formValues.value,
    }

    if (sortState.value) {
      params.sortField = sortState.value.prop
      params.sortOrder = sortState.value.order
    }

    await internalRequest.run(params)
  }

  function handleSearch(values: Record<string, unknown>): void {
    if (externalInstance) {
      externalInstance.setFormValues(values)
      void externalInstance.reload(true)
      return
    }
    formValues.value = { ...values }
    internalPagination.setCurrent(1)
    void fetchData()
  }

  function handleReset(): void {
    if (externalInstance) {
      externalInstance.reset()
      return
    }
    formValues.value = { ...options.initialValues.value }
    sortState.value = null
    internalPagination.reset()
    internalSelection.clearSelection()
    void fetchData()
    options.onReset()
  }

  function handleSortChange(sort: { prop: string; order: string }): void {
    sortState.value = sort.order
      ? { prop: sort.prop, order: sort.order as 'ascending' | 'descending' }
      : null
    options.onSortChange(sortState.value)
    if (!externalInstance) {
      void fetchData()
    }
  }

  function handleSelectionChange(rows: unknown[]): void {
    if (externalInstance) {
      externalInstance.selectedRows.value = rows
      externalInstance.selectedRowKeys.value = rows.map((r) => {
        const rk = options.rowKey.value
        return typeof rk === 'function' ? rk(r) : String((r as Record<string, unknown>)[rk])
      })
      return
    }
    internalSelection.onSelectionChange(rows, activeData.value)
  }

  function handlePageChange(page: number): void {
    if (externalInstance) {
      externalInstance.pagination.current.value = page
      void externalInstance.reload()
      return
    }
    internalPagination.setCurrent(page)
  }

  function handleSizeChange(size: number): void {
    if (externalInstance) {
      externalInstance.pagination.pageSize.value = size
      externalInstance.pagination.current.value = 1
      void externalInstance.reload()
      return
    }
    internalPagination.setPageSize(size)
  }

  function handleReload(): void {
    void fetchData()
    options.onReload()
  }

  function handleToggleColumnSetting(): void {
    showColumnSettingPanel.value = !showColumnSettingPanel.value
  }

  // --- Fullscreen ---
  const isFullscreen = ref(false)
  const tableContainerRef = ref<HTMLElement | null>(null)

  function handleFullscreenChange(): void {
    isFullscreen.value = !!document.fullscreenElement
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  })

  function handleToggleFullscreen(): void {
    if (!tableContainerRef.value) return
    if (!document.fullscreenElement) {
      tableContainerRef.value.requestFullscreen().catch(() => {
        // Fullscreen API not supported or denied
      })
    } else {
      document.exitFullscreen().catch(() => {
        // Already exited
      })
    }
  }

  return {
    externalInstance,
    isExternalMode,
    activeData,
    activeLoading,
    activePagination,
    formValues,
    sortState,
    densitySize,
    tableSize,
    columnSettings,
    showColumnSettingPanel,
    visibleColumns,
    isPaginationEnabled,
    pageSizes,
    paginationLayout,
    formatCellValue,
    handleSelectionChange,
    fetchData,
    handleSearch,
    handleReset,
    handleSortChange,
    handlePageChange,
    handleSizeChange,
    handleReload,
    handleToggleColumnSetting,
    isFullscreen,
    tableContainerRef,
    handleToggleFullscreen,
  }
}
