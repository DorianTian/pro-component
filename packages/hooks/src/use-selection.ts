import { ref, type Ref } from 'vue'

/** Options for the useSelection composable */
export interface UseSelectionOptions<T = unknown> {
  /** Property name to extract row key, or a function that returns it */
  rowKey: keyof T | ((row: T) => string)
  /** Enable cross-page selection persistence (default: false) */
  crossPageSelect?: boolean
  /** Callback when selection changes */
  onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void
}

/** Return type of the useSelection composable */
export interface UseSelectionReturn<T = unknown> {
  selectedRows: Ref<T[]>
  selectedRowKeys: Ref<string[]>
  /** Clear all selected rows */
  clearSelection: () => void
  /**
   * Handle selection change event from el-table.
   * @param selectedOnPage - Currently selected rows as reported by el-table
   * @param currentPageData - All rows on the current page (required for cross-page mode deselection)
   */
  onSelectionChange: (selectedOnPage: T[], currentPageData?: T[]) => void
}

/**
 * Row selection management with optional cross-page persistence.
 *
 * In cross-page mode, selections from previous pages are preserved.
 * Deselection only affects rows on the current page -- rows from other pages remain selected.
 */
export function useSelection<T = unknown>(options: UseSelectionOptions<T>): UseSelectionReturn<T> {
  const { rowKey, crossPageSelect = false, onChange } = options

  const selectedRows: Ref<T[]> = ref([]) as Ref<T[]>
  const selectedRowKeys: Ref<string[]> = ref([])

  /** Extract the string key from a row */
  function getRowKey(row: T): string {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return String(row[rowKey])
  }

  /** Clear all selected rows */
  function clearSelection(): void {
    selectedRows.value = []
    selectedRowKeys.value = []
  }

  /** Handle selection change, with optional cross-page merge logic */
  function onSelectionChange(selectedOnPage: T[], currentPageData?: T[]): void {
    if (!crossPageSelect) {
      selectedRows.value = [...selectedOnPage]
      selectedRowKeys.value = selectedOnPage.map(getRowKey)
      onChange?.(selectedRowKeys.value, selectedRows.value)
      return
    }

    // Cross-page mode: merge selections from different pages
    if (currentPageData) {
      const currentPageKeys = new Set(currentPageData.map(getRowKey))

      // Preserve existing selections that are NOT on the current page
      const preserved = selectedRows.value.filter((row) => !currentPageKeys.has(getRowKey(row)))

      // Add currently selected rows from this page
      selectedRows.value = [...preserved, ...selectedOnPage]
    } else {
      // No currentPageData provided -- just merge new selections by key
      const existingKeySet = new Set(selectedRowKeys.value)
      const newRows = selectedOnPage.filter((row) => !existingKeySet.has(getRowKey(row)))
      selectedRows.value = [...selectedRows.value, ...newRows]
    }

    selectedRowKeys.value = selectedRows.value.map(getRowKey)
    onChange?.(selectedRowKeys.value, selectedRows.value)
  }

  return {
    selectedRows,
    selectedRowKeys,
    clearSelection,
    onSelectionChange,
  }
}
