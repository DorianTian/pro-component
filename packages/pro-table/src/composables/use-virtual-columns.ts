/**
 * Adapter: converts ProColumnDef[] to ElTableV2 Column[] format.
 *
 * ElTableV2 uses a data-driven column model instead of slot-based rendering.
 * This adapter bridges ProTable's ProColumnDef schema to V2's Column shape,
 * preserving custom render functions via cellRenderer.
 */
import { h, computed, type Ref, type ComputedRef, type VNode } from 'vue'
import { TableV2FixedDir, ElCheckbox } from 'element-plus'

import type { ProColumnDef } from '../types'

/** Default column width when not specified */
const DEFAULT_COLUMN_WIDTH = 150

/** Selection column width */
const SELECTION_COLUMN_WIDTH = 50

/** ElTableV2 column definition */
export interface V2Column {
  key: string
  dataKey: string
  title: string
  width: number
  minWidth?: number
  maxWidth?: number
  fixed?: true | typeof TableV2FixedDir.LEFT | typeof TableV2FixedDir.RIGHT
  sortable?: boolean
  hidden?: boolean
  cellRenderer?: (params: {
    cellData: unknown
    rowData: Record<string, unknown>
    rowIndex: number
    column: V2Column
    columns: V2Column[]
    columnIndex: number
  }) => VNode | string
  headerCellRenderer?: (params: {
    column: V2Column
    columns: V2Column[]
    columnIndex: number
    headerIndex: number
  }) => VNode | string
}

/**
 * Convert a single ProColumnDef to an ElTableV2 column definition.
 */
function convertColumn(
  col: ProColumnDef,
  formatCellValue: (col: ProColumnDef, row: Record<string, unknown>) => string,
): V2Column {
  const key = col.key ?? String(col.dataIndex)
  const dataKey = String(col.dataIndex)

  const v2Col: V2Column = {
    key,
    dataKey,
    title: col.title,
    width: typeof col.width === 'number' ? col.width : DEFAULT_COLUMN_WIDTH,
    sortable: !!col.sortable,
  }

  if (col.minWidth) {
    v2Col.minWidth =
      typeof col.minWidth === 'number' ? col.minWidth : parseInt(String(col.minWidth), 10)
  }

  // Fixed positioning
  if (col.fixed === 'left') {
    v2Col.fixed = TableV2FixedDir.LEFT
  } else if (col.fixed === 'right') {
    v2Col.fixed = TableV2FixedDir.RIGHT
  }

  // Hidden in table
  if (col.hideInTable) {
    v2Col.hidden = true
  }

  // Cell renderer: custom render function takes priority, then format
  if (col.render) {
    const renderFn = col.render
    v2Col.cellRenderer = ({ rowData, rowIndex }) => {
      return renderFn(rowData as Record<string, unknown>, rowIndex)
    }
  } else {
    v2Col.cellRenderer = ({ rowData }) => {
      return h('span', formatCellValue(col, rowData))
    }
  }

  return v2Col
}

/**
 * Build a selection column for ElTableV2.
 */
function buildSelectionColumn(
  rowKeyField: string,
  selectedRowKeys: Ref<Set<string>>,
  allRowKeys: ComputedRef<string[]>,
  onSelectRow: (key: string, checked: boolean) => void,
  onSelectAll: (checked: boolean) => void,
): V2Column {
  return {
    key: '__selection__',
    dataKey: '__selection__',
    title: '',
    width: SELECTION_COLUMN_WIDTH,
    fixed: TableV2FixedDir.LEFT,
    headerCellRenderer: () => {
      const allSelected =
        allRowKeys.value.length > 0 && allRowKeys.value.every((k) => selectedRowKeys.value.has(k))
      const indeterminate =
        !allSelected && allRowKeys.value.some((k) => selectedRowKeys.value.has(k))

      return h(ElCheckbox, {
        modelValue: allSelected,
        indeterminate,
        onChange: (val: unknown) => onSelectAll(!!val),
      })
    },
    cellRenderer: ({ rowData }) => {
      const key = String((rowData as Record<string, unknown>)[rowKeyField] ?? '')
      return h(ElCheckbox, {
        modelValue: selectedRowKeys.value.has(key),
        onChange: (val: unknown) => onSelectRow(key, !!val),
      })
    },
  }
}

export interface UseVirtualColumnsOptions {
  columns: Ref<ProColumnDef[]>
  visibleColumns: ComputedRef<ProColumnDef[]>
  formatCellValue: (col: ProColumnDef, row: Record<string, unknown>) => string
  /** Row key field name for selection */
  rowKeyField: ComputedRef<string>
  hasRowSelection: ComputedRef<boolean>
  selectedRowKeys: Ref<Set<string>>
  allRowKeys: ComputedRef<string[]>
  onSelectRow: (key: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
}

export interface UseVirtualColumnsReturn {
  v2Columns: ComputedRef<V2Column[]>
}

/**
 * Composable that converts ProColumnDef[] → ElTableV2 Column[].
 * Handles selection column, custom renderers, and fixed positioning.
 */
export function useVirtualColumns(options: UseVirtualColumnsOptions): UseVirtualColumnsReturn {
  const v2Columns = computed<V2Column[]>(() => {
    const cols: V2Column[] = []

    // Selection column first
    if (options.hasRowSelection.value) {
      cols.push(
        buildSelectionColumn(
          options.rowKeyField.value,
          options.selectedRowKeys,
          options.allRowKeys,
          options.onSelectRow,
          options.onSelectAll,
        ),
      )
    }

    // Data columns
    for (const col of options.visibleColumns.value) {
      cols.push(convertColumn(col, options.formatCellValue))
    }

    return cols
  })

  return { v2Columns }
}
