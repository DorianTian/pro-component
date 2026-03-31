import type { ComputedRef, MaybeRefOrGetter, VNode } from 'vue'
import { computed, toValue } from 'vue'
import type { ProColumnDef, StatusType } from '@pro/utils'
import { formatDate as fmtDate, formatMoney as fmtMoney } from '@pro/hooks'

/** Processed description item ready for rendering */
export interface DescriptionItem {
  /** Field key for iteration */
  dataIndex: string
  /** Display label */
  label: string
  /** Raw value from data */
  value: unknown
  /** Formatted value for display (e.g., "$1,234.56") */
  formattedValue: string
  /** Resolved text for valueEnum types */
  displayText?: string
  /** Status type for valueEnum types */
  statusType?: StatusType
  /** Whether this item has a custom descriptionsRender */
  hasCustomRender: boolean
  /** Custom render function if defined */
  descriptionsRender?: (value: unknown, row: Record<string, unknown>) => VNode | string
  /** Original column definition */
  column: ProColumnDef
  /** Span in descriptions layout */
  span?: number
}

export interface UseProDescriptionsOptions {
  columns: MaybeRefOrGetter<ProColumnDef[]>
  data: MaybeRefOrGetter<Record<string, unknown>>
}

export interface UseProDescriptionsReturn {
  descriptionItems: ComputedRef<DescriptionItem[]>
}

/**
 * Resolve a dot-notation path on an object.
 * E.g., getNestedValue({ user: { name: 'Alice' } }, 'user.name') => 'Alice'
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/** Safely convert unknown value to string */
function safeString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  const json = JSON.stringify(value)
  return typeof json === 'string' ? json : ''
}

const DEFAULT_LOCALE = 'en-US'

/**
 * Format a value based on its valueType for display in descriptions.
 */
function formatValue(value: unknown, valueType: string): string {
  if (value === null || value === undefined) return '-'

  switch (valueType) {
    case 'money':
      return fmtMoney(Number(value), DEFAULT_LOCALE)
    case 'percent':
      return `${safeString(value)}%`
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : safeString(value)
    case 'date':
      return fmtDate(value as string | number | Date, 'date', DEFAULT_LOCALE)
    case 'dateTime':
      return fmtDate(value as string | number | Date, 'dateTime', DEFAULT_LOCALE)
    default:
      return safeString(value)
  }
}

/** Resolve enum display text and status from column valueEnum */
function resolveEnumEntry(
  col: ProColumnDef,
  rawValue: unknown,
): { displayText?: string; statusType?: StatusType } {
  if (!col.valueEnum || rawValue === null || rawValue === undefined) return {}
  const enumKey =
    typeof rawValue === 'string' || typeof rawValue === 'number' ? String(rawValue) : ''
  if (!(enumKey in col.valueEnum)) return {}
  return { displayText: col.valueEnum[enumKey].text, statusType: col.valueEnum[enumKey].status }
}

/** Resolve a single column definition into a DescriptionItem */
function resolveDescriptionItem(col: ProColumnDef, data: Record<string, unknown>): DescriptionItem {
  const dataIndexStr = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
  const rawValue = getNestedValue(data, dataIndexStr)
  const valueType = col.valueType ?? 'text'
  const { displayText, statusType } = resolveEnumEntry(col, rawValue)
  const formattedValue = displayText ?? formatValue(rawValue, valueType)

  return {
    dataIndex: col.key ?? dataIndexStr,
    label: col.title,
    value: rawValue,
    formattedValue,
    displayText,
    statusType,
    hasCustomRender: typeof col.descriptionsRender === 'function',
    descriptionsRender: col.descriptionsRender,
    column: col,
    span: col.searchConfig?.span,
  }
}

/**
 * Composable that processes ProColumnDef array and data into description items.
 * Filters by hideInDescriptions, resolves nested paths, formats values, resolves valueEnum.
 */
export function useProDescriptions(options: UseProDescriptionsOptions): UseProDescriptionsReturn {
  const descriptionItems = computed<DescriptionItem[]>(() => {
    const columns = toValue(options.columns)
    const data = toValue(options.data)
    return columns
      .filter((col) => !col.hideInDescriptions)
      .map((col) => resolveDescriptionItem(col, data))
  })

  return { descriptionItems }
}
