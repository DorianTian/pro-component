import type { InjectionKey, Ref } from 'vue'
import type { UseProTableReturn, DensitySize, ColumnSettingItem } from '../types'

/** Injection key for useProTable composable state shared between ProTable and sub-components */
export const PRO_TABLE_INJECTION_KEY: InjectionKey<UseProTableReturn> = Symbol('pro-table')

/** Injection key for density size */
export const DENSITY_INJECTION_KEY: InjectionKey<{ size: Ref<DensitySize> }> =
  Symbol('pro-table-density')

/** Injection key for column settings */
export const COLUMN_SETTING_INJECTION_KEY: InjectionKey<{
  columns: Ref<ColumnSettingItem[]>
  updateColumn: (key: string, updates: Partial<ColumnSettingItem>) => void
  resetColumns: () => void
}> = Symbol('pro-table-column-setting')

/** Default page size for new tables */
export const DEFAULT_PAGE_SIZE = 20

/** Default page sizes for pagination selector */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** Default pagination layout */
export const DEFAULT_PAGINATION_LAYOUT = 'total, sizes, prev, pager, next, jumper'

/** Default label width in pixels for search form */
export const DEFAULT_LABEL_WIDTH = 80

/** Default debounce interval in milliseconds for search input */
export const DEFAULT_DEBOUNCE_MS = 300

/** Default density size */
export const DEFAULT_DENSITY: DensitySize = 'default'

/** Default search form span (columns per row = 24/span) */
export const DEFAULT_SEARCH_SPAN = 6

/** Sort order for unordered search columns */
export const DEFAULT_SEARCH_ORDER = 999
