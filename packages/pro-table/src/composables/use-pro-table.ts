import { ref, computed, provide, type Ref, type ComputedRef } from 'vue'
import { useRequest, usePagination, useSelection, useRowOperation } from '@pro/hooks'

import type { RequestParams, RequestResult } from '@pro/utils'
import type { UseProTableOptions, UseProTableReturn } from '../types'
import { PRO_TABLE_INJECTION_KEY, DEFAULT_PAGE_SIZE } from '../constants'

/**
 * Orchestrator composable for ProTable.
 * Combines useRequest + usePagination + useSelection + useRowOperation
 * into a single cohesive API.
 *
 * Provides the instance via Vue's provide/inject so ProTable component
 * can auto-detect an external composable.
 */
// eslint-disable-next-line max-lines-per-function -- Composable orchestrator; splitting deferred to dedicated refactor
export function useProTable<T = Record<string, unknown>>(
  options: UseProTableOptions<T>,
): UseProTableReturn<T> {
  const {
    columns,
    request: requestFn,
    rowKey = 'id',
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultCurrent = 1,
    crossPageSelect = false,
    debounceMs = 0,
    beforeRequest,
    afterResponse,
  } = options

  const formValues: Ref<Record<string, unknown>> = ref({})
  const sortState: Ref<{ prop: string; order: 'ascending' | 'descending' | null } | null> =
    ref(null)
  const filterState: Ref<Record<string, unknown>> = ref({})

  const paginationState = usePagination({ defaultCurrent, defaultPageSize })

  const requestState = useRequest<T>(buildWrappedFetcher(), {
    debounceMs,
    onSuccess: handleRequestSuccess,
  })

  const selectionState = useSelection<T>({
    rowKey: rowKey as keyof T | ((row: T) => string),
    crossPageSelect,
  })

  const rowOps = useRowOperation<T>({
    dataSource: requestState.data,
    current: paginationState.current,
    pageSize: paginationState.pageSize,
    total: paginationState.total,
    rowKey: rowKey as keyof T | ((row: T) => string),
    onPageBack: () => {
      void reload(false)
    },
  })

  /** Build the wrapped fetcher that applies beforeRequest/afterResponse transforms */
  function buildWrappedFetcher(): (params: RequestParams) => Promise<RequestResult<T>> {
    return async (params: RequestParams): Promise<RequestResult<T>> => {
      if (!requestFn) {
        return { data: [], total: 0, success: true }
      }
      const transformedParams = beforeRequest ? beforeRequest(params) : params
      const raw = await requestFn(transformedParams)
      return afterResponse ? afterResponse(raw) : raw
    }
  }

  /** Handle successful request by updating pagination total */
  function handleRequestSuccess(result: RequestResult<T>): void {
    paginationState.setTotal(result.total)
  }

  /** Reload data, optionally resetting to page 1 */
  async function reload(resetPage = false): Promise<void> {
    if (resetPage) {
      paginationState.setCurrent(1)
    }

    const params: RequestParams = {
      current: paginationState.current.value,
      pageSize: paginationState.pageSize.value,
      ...formValues.value,
    }

    if (sortState.value) {
      params.sortField = sortState.value.prop
      params.sortOrder = sortState.value.order
    }

    await requestState.run(params)
  }

  /** Reset all state: form, pagination, sort, filter, selection */
  function reset(): void {
    formValues.value = {}
    sortState.value = null
    filterState.value = {}
    paginationState.reset()
    selectionState.clearSelection()
  }

  /** Merge new values into the form state */
  function setFormValues(values: Partial<Record<string, unknown>>): void {
    formValues.value = { ...formValues.value, ...values }
  }

  /** Replace the data source directly (for controlled/client-side mode) */
  function setDataSource(data: T[]): void {
    requestState.data.value = data as unknown as typeof requestState.data.value
  }

  const proTableProps: ComputedRef<Record<string, unknown>> = computed(() => ({
    columns,
    data: requestState.data.value,
    loading: requestState.loading.value,
    rowKey,
  }))

  const instance: UseProTableReturn<T> = {
    proTableProps,
    dataSource: requestState.data,
    loading: requestState.loading,
    pagination: {
      current: paginationState.current,
      pageSize: paginationState.pageSize,
      total: paginationState.total,
      totalPages: paginationState.totalPages,
    },
    formValues,
    selectedRows: selectionState.selectedRows,
    selectedRowKeys: selectionState.selectedRowKeys,
    clearSelection: selectionState.clearSelection,
    sortState,
    filterState,
    reload,
    reset,
    setFormValues,
    setDataSource,
    insertRow: rowOps.insertRow,
    updateRow: rowOps.updateRow,
    deleteRow: rowOps.deleteRow,
    editable: null,
  }

  provide(PRO_TABLE_INJECTION_KEY, instance as UseProTableReturn)

  return instance
}
