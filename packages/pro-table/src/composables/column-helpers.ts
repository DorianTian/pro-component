import type { TableRenderConfig } from '@pro/hooks'
import type { ValueType } from '@pro/utils'

import type { ProColumnDef, ColumnSettingItem } from '../types'
import { DEFAULT_SEARCH_ORDER } from '../constants'

/**
 * Build initial column settings from column definitions.
 * Each column gets a settings entry with visibility, fixed state, and order.
 */
export function buildColumnSettings(cols: ProColumnDef[]): ColumnSettingItem[] {
  return cols.map((col, idx) => ({
    key: col.key ?? col.dataIndex,
    title: col.title,
    visible: !col.hideInTable,
    fixed: col.fixed ?? false,
    order: idx,
  }))
}

/**
 * Build the list of visible columns, filtered and sorted by column settings.
 * Applies fixed column overrides from settings.
 */
export function buildVisibleColumns(
  cols: ProColumnDef[],
  settings: ColumnSettingItem[],
): ProColumnDef[] {
  const settingMap = new Map(settings.map((s) => [s.key, s]))

  return cols
    .filter((col) => {
      const key = col.key ?? col.dataIndex
      const setting = settingMap.get(key)
      return setting ? setting.visible : !col.hideInTable
    })
    .sort((a, b) => {
      const keyA = a.key ?? a.dataIndex
      const keyB = b.key ?? b.dataIndex
      const orderA = settingMap.get(keyA)?.order ?? DEFAULT_SEARCH_ORDER
      const orderB = settingMap.get(keyB)?.order ?? DEFAULT_SEARCH_ORDER
      return orderA - orderB
    })
    .map((col) => {
      const key = col.key ?? col.dataIndex
      const setting = settingMap.get(key)
      if (setting && setting.fixed !== false) {
        return { ...col, fixed: setting.fixed as 'left' | 'right' }
      }
      return col
    })
}

/**
 * Resolve a nested cell value from a row object using dot-separated path.
 * E.g., getCellValue(row, 'user.name') traverses row.user.name.
 */
export function getCellValue(row: Record<string, unknown>, dataIndex: string): unknown {
  const keys = dataIndex.split('.')
  let value: unknown = row
  for (const k of keys) {
    if (value === null || value === undefined) return undefined
    value = (value as Record<string, unknown>)[k]
  }
  return value
}

/**
 * Format a cell value using the column's valueEnum or valueType configuration.
 * Falls back to the text formatter for unknown types.
 */
export function formatCellValue(
  col: ProColumnDef,
  row: Record<string, unknown>,
  getTableRenderConfig: (valueType: ValueType) => TableRenderConfig,
): string {
  const value = getCellValue(row, col.dataIndex)

  if (col.valueEnum && value !== undefined && value !== null) {
    const key = typeof value === 'string' || typeof value === 'number' ? String(value) : ''
    if (key in col.valueEnum) return col.valueEnum[key].text
  }

  const renderConfig = getTableRenderConfig(col.valueType ?? 'text')
  return renderConfig.format(value)
}
