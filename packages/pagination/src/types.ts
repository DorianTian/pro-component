/** Props for the Pro Pagination component */
export interface ProPaginationProps {
  /** Total number of items */
  total?: number
  /** Current page number (v-model:current-page) */
  currentPage?: number
  /** Items per page (v-model:page-size) */
  pageSize?: number
  /** Available page size options */
  pageSizes?: number[]
  /** Hide pagination when total fits in one page */
  autoHide?: boolean
  /** Compact mode — only shows prev/pager/next */
  compact?: boolean
  /** Show the quick jumper input (default: true) */
  showQuickJumper?: boolean
  /** Show the page size selector (default: true) */
  showSizeChanger?: boolean
  /** Show total count (default: true) */
  showTotal?: boolean
  /** Custom total display formatter. Receives total and current range [start, end] */
  totalFormatter?: (total: number, range: [number, number]) => string
  /** Disable all pagination interactions */
  disabled?: boolean
  /** Show background on pager buttons */
  background?: boolean
  /** Raw layout string override — bypasses semantic props when set */
  layout?: string
}

/** Emits for the Pro Pagination component */
export interface ProPaginationEmits {
  (e: 'update:current-page', page: number): void
  (e: 'update:page-size', size: number): void
  (e: 'change', pagination: { current: number; pageSize: number }): void
}
