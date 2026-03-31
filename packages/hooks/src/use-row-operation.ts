import { type Ref } from 'vue'

/** Options for the useRowOperation composable */
export interface UseRowOperationOptions<T = unknown> {
  /** Reactive data source array */
  dataSource: Ref<T[]>
  /** Current page number (reactive) */
  current: Ref<number>
  /** Page size (reactive) */
  pageSize: Ref<number>
  /** Total row count (reactive, will be mutated on insert/delete) */
  total: Ref<number>
  /** Row key property name or extractor function */
  rowKey: keyof T | ((row: T) => string)
  /** Callback when pagination should go back one page after delete */
  onPageBack?: () => void
}

/** Return type of the useRowOperation composable */
export interface UseRowOperationReturn<T = unknown> {
  /** Insert a row at the end or at a specific index */
  insertRow: (row: T, index?: number) => void
  /** Update a row identified by its key with partial data */
  updateRow: (key: string, data: Partial<T>) => void
  /** Delete a row identified by its key. Auto-adjusts pagination if needed. */
  deleteRow: (key: string) => void
}

/**
 * CRUD row operations on a reactive data source.
 * Automatically adjusts pagination when deleting the last item on the last page.
 */
export function useRowOperation<T = unknown>(
  options: UseRowOperationOptions<T>,
): UseRowOperationReturn<T> {
  const { dataSource, current, pageSize, total, rowKey, onPageBack } = options

  /** Extract the string key from a row */
  function getRowKey(row: T): string {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return String(row[rowKey])
  }

  /** Insert a row at the end or at a specific index */
  function insertRow(row: T, index?: number): void {
    if (index !== undefined) {
      dataSource.value.splice(index, 0, row)
    } else {
      dataSource.value.push(row)
    }
    total.value++
  }

  /** Update a row identified by its key with partial data */
  function updateRow(key: string, data: Partial<T>): void {
    const idx = dataSource.value.findIndex((row) => getRowKey(row) === key)
    if (idx === -1) return

    dataSource.value[idx] = { ...dataSource.value[idx], ...data }
    // Trigger reactivity by replacing the array
    dataSource.value = [...dataSource.value]
  }

  /** Delete a row by key, auto-adjusting pagination if the last page is now empty */
  function deleteRow(key: string): void {
    const idx = dataSource.value.findIndex((row) => getRowKey(row) === key)
    if (idx === -1) return

    dataSource.value.splice(idx, 1)
    total.value--

    const maxPage = total.value <= 0 ? 1 : Math.ceil(total.value / pageSize.value)
    if (current.value > maxPage && current.value > 1) {
      current.value = maxPage
      onPageBack?.()
    }
  }

  return {
    insertRow,
    updateRow,
    deleteRow,
  }
}
