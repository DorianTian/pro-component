import type { VNode, Ref, ComputedRef } from 'vue'
import type { RequestParams, RequestResult, ValueType, StatusType } from '@pro/utils'
import type { FormItemRule } from 'element-plus'

/** Column definition -- one schema drives table, search form, and descriptions */
export interface ProColumnDef<T = Record<string, unknown>> {
  /** Field name, supports nested paths like 'user.name' */
  dataIndex: keyof T | string
  /** Column header text */
  title: string
  /** Unique key, defaults to dataIndex */
  key?: string

  // ValueType system
  /** Determines rendering in table + search control + formatting */
  valueType?: ValueType
  /** Enum values for select/radio/checkbox types */
  valueEnum?: Record<string, { text: string; status?: StatusType }>

  // Table column behavior
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  /**
   * NOTE: Per code standards, boolean props should use is/has/can/should prefix.
   * These are kept as `ellipsis`/`copyable` for Element Plus API compatibility
   * (maps directly to el-table-column show-overflow-tooltip and custom copy behavior).
   * If wrapping in a new API layer, prefer `isEllipsis` / `isCopyable`.
   */
  ellipsis?: boolean
  copyable?: boolean
  /** Custom table cell render function */
  render?: (row: T, index: number) => VNode

  // Search form behavior
  hideInSearch?: boolean
  hideInTable?: boolean
  hideInForm?: boolean
  searchConfig?: {
    order?: number
    span?: number
    defaultValue?: unknown
    rules?: FormItemRule[]
    /** Custom search control render function */
    render?: () => VNode
  }

  // Descriptions behavior
  hideInDescriptions?: boolean
  /** Number of columns this item spans in ProDescriptions layout */
  descriptionsSpan?: number
  descriptionsRender?: (value: unknown, row: T) => VNode

  // Editable behavior
  /** Column-level edit control. false = always read-only, function = dynamic per-row */
  editable?: boolean | ((row: T, index: number) => boolean)
  /** Extra props passed to the edit control component */
  fieldProps?: Record<string, unknown> | ((row: T, index: number) => Record<string, unknown>)
  /** Validation rules for this column when editing */
  formItemProps?:
    | { rules?: FormItemRule[] }
    | ((row: T, config: { rowIndex: number }) => { rules?: FormItemRule[] })
}

/** Configuration options for the QueryFilter search form */
export interface SearchConfig {
  /** Number of columns in the search form layout */
  span?: number
  /** Whether search form is collapsed by default */
  defaultCollapsed?: boolean
  /** Label width */
  labelWidth?: string | number
}

/** Toolbar configuration */
export interface ToolbarConfig {
  /** Show density selector */
  density?: boolean
  /** Show column settings button */
  columnSetting?: boolean
  /** Show fullscreen button */
  fullscreen?: boolean
}

/** Configuration options for the table pagination bar */
export interface PaginationConfig {
  defaultCurrent?: number
  defaultPageSize?: number
  pageSizes?: number[]
  layout?: string
}

/** Row selection configuration */
export interface RowSelectionConfig<T = unknown> {
  /** Row key property or extractor function */
  rowKey?: keyof T | ((row: T) => string)
  /** Enable cross-page selection persistence */
  crossPageSelect?: boolean
  /** Callback when selection changes */
  onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void
}

/** Structured error for request failures */
export class ProRequestError extends Error {
  /** HTTP status code, if applicable */
  statusCode?: number
  /** Raw response body, if available */
  responseBody?: unknown

  constructor(
    message: string,
    options?: { statusCode?: number; responseBody?: unknown; cause?: unknown },
  ) {
    super(message, { cause: options?.cause })
    this.name = 'ProRequestError'
    this.statusCode = options?.statusCode
    this.responseBody = options?.responseBody
  }
}

/** Table density size */
export type DensitySize = 'compact' | 'default' | 'relaxed'

/** Column setting item for the column setting panel */
export interface ColumnSettingItem {
  key: string
  title: string
  visible: boolean
  fixed?: 'left' | 'right' | false
  order: number
}

/** Action config passed to editable actionRender callback */
export interface EditableActionConfig<T = Record<string, unknown>> {
  editableKeys: string[]
  recordKey: string
  index: number
  isNewRow: boolean
  /** Default save button VNode */
  save: VNode
  /** Default cancel button VNode */
  cancel: VNode
  /** Default delete button VNode */
  delete: VNode
}

/** Configuration for new row creation button */
export interface RecordCreatorProps<T = Record<string, unknown>> {
  /** Template for new row — static object or factory function */
  record: T | ((index: number, dataSource: T[]) => T)
  /** Where to insert: 'top' | 'bottom' */
  position?: 'top' | 'bottom'
  /** Button text (overrides i18n default) */
  creatorButtonText?: string
  /** 'cache' = row removed on cancel; 'dataSource' = persisted immediately */
  newRecordType?: 'cache' | 'dataSource'
}

/** Configuration for editable table rows */
export interface EditableConfig<T = Record<string, unknown>> {
  /** Editing mode: 'single' = one row at a time, 'multiple' = concurrent editing */
  type?: 'single' | 'multiple'
  /** Controlled editable row keys */
  editableKeys?: string[]
  /** Called when editableKeys change — provides both keys and corresponding row data */
  onChange?: (editableKeys: string[], editableRows: T[]) => void
  /** Fires on every cell value change during editing (real-time sync) */
  onValuesChange?: (record: T, dataSource: T[]) => void
  /** Save handler — return false to prevent save */
  onSave?: (key: string, row: T, originalRow: T, isNewRow: boolean) => Promise<boolean | void>
  /** Cancel handler */
  onCancel?: (key: string, row: T, originRow: T, isNewRow: boolean) => void
  /** Delete handler — return false to prevent deletion */
  onDelete?: (key: string, row: T) => Promise<boolean | void>
  /** Custom action column renderer */
  actionRender?: (row: T, config: EditableActionConfig<T>) => VNode[]
  /** New row creation button config. false = hidden */
  recordCreatorProps?: RecordCreatorProps<T> | false
  /** Max rows — hides add button when reached */
  maxLength?: number
  /** Delete confirmation text */
  deleteConfirmText?: string
  /** Override button text (falls back to i18n) */
  saveText?: string
  cancelText?: string
  editText?: string
  deleteText?: string
  addText?: string
}

/** ProTable component props */
export interface ProTableProps<T = Record<string, unknown>> {
  /** Async data fetcher. Mutually exclusive with controlled mode (data prop). */
  request?: (params: RequestParams) => Promise<RequestResult<T>>
  /** Controlled data source. Used without request for client-side data. */
  data?: T[]
  /** External loading state (controlled mode) */
  loading?: boolean

  /** Column definitions -- the single schema driving table, search, and descriptions */
  columns: ProColumnDef<T>[]

  /** Row key for selection and keyed rendering */
  rowKey?: string | ((row: T) => string)

  /** Search form: true=auto, false=disabled, object=custom config */
  search?: boolean | SearchConfig
  /** Initial search form values */
  initialValues?: Record<string, unknown>

  /** Toolbar config */
  toolbar?: ToolbarConfig
  /** Table header title */
  headerTitle?: string | VNode
  /** Custom toolbar action buttons */
  toolbarActions?: VNode[]

  /** Pagination: false to disable, object for custom config */
  pagination?: false | PaginationConfig

  /** Row selection config */
  rowSelection?: RowSelectionConfig<T>

  /** Editable table configuration */
  editable?: EditableConfig<T>

  /** Pass-through props to underlying el-table */
  tableProps?: Record<string, unknown>
  /** Transform request params before sending */
  beforeRequest?: (params: RequestParams) => RequestParams
  /** Transform raw response into standard format */
  afterResponse?: (raw: unknown) => RequestResult<T>

  /** Enable virtual scrolling via ElTableV2 for large datasets. Disables editable mode. */
  virtual?: boolean
  /** Virtual table viewport height in px (only when virtual: true, default: 500) */
  virtualHeight?: number
}

/** useProTable configuration options */
export interface UseProTableOptions<T = unknown> {
  columns: ProColumnDef<T>[]
  request?: (params: RequestParams) => Promise<RequestResult<T>>
  rowKey?: string | ((row: T) => string)
  defaultPageSize?: number
  defaultCurrent?: number
  crossPageSelect?: boolean
  debounceMs?: number
  beforeRequest?: (params: RequestParams) => RequestParams
  afterResponse?: (raw: unknown) => RequestResult<T>
}

/** Editable API exposed on UseProTableReturn for programmatic control */
export interface UseEditableApi<T = Record<string, unknown>> {
  editableKeys: Ref<string[]>
  isEditing: (key: string) => boolean
  isNewRow: (key: string) => boolean
  startEdit: (key: string, row?: T) => boolean
  cancelEdit: (key: string) => void
  saveEdit: (key: string) => Promise<boolean>
  deleteRow: (key: string) => Promise<boolean>
  addEditRecord: (row: T, options?: { position?: 'top' | 'bottom' }) => void
  setEditableKeys: (keys: string[]) => void
  getRowData: (key: string) => T | undefined
  getRowsData: () => T[]
  setRowData: (key: string, partial: Partial<T>) => void
}

/** useProTable return type */
export interface UseProTableReturn<T = unknown> {
  /** Bind this to <ProTable v-bind="proTableProps" /> */
  proTableProps: ComputedRef<Record<string, unknown>>
  dataSource: Ref<T[]>
  loading: Ref<boolean>
  pagination: {
    current: Ref<number>
    pageSize: Ref<number>
    total: Ref<number>
    totalPages: ComputedRef<number>
  }
  formValues: Ref<Record<string, unknown>>
  selectedRows: Ref<T[]>
  selectedRowKeys: Ref<string[]>
  clearSelection: () => void
  sortState: Ref<{ prop: string; order: 'ascending' | 'descending' | null } | null>
  filterState: Ref<Record<string, unknown>>
  /** Re-fetch data. resetPage=true resets to page 1. */
  reload: (resetPage?: boolean) => Promise<void>
  /** Reset all state: form, pagination, sort, filter, selection */
  reset: () => void
  setFormValues: (values: Partial<Record<string, unknown>>) => void
  setDataSource: (data: T[]) => void
  insertRow: (row: T, index?: number) => void
  updateRow: (key: string, row: Partial<T>) => void
  deleteRow: (key: string) => void
  /** Editable API — null when editable is not configured */
  editable: UseEditableApi<T> | null
}
