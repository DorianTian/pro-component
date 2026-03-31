import { computed } from 'vue'

import type { VNode } from 'vue'
import type { ProColumnDef, StatusType } from '@pro/utils'

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
  columns: ProColumnDef[]
  data: Record<string, unknown>
}

export interface UseProDescriptionsReturn {
  descriptionItems: ReturnType<typeof computed<DescriptionItem[]>>
}

/**
 * Resolve a dot-notation path on an object.
 * E.g., getNestedValue({ user: { name: 'Alice' } }, 'user.name') => 'Alice'
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/**
 * Format a value based on its valueType for display in descriptions.
 */
function formatValue(value: unknown, valueType: string): string {
  if (value == null) return '-'

  switch (valueType) {
    case 'money':
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    case 'percent':
      return `${value}%`

    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value)

    case 'date':
    case 'dateTime':
      if (value instanceof Date) {
        return valueType === 'dateTime' ? value.toLocaleString() : value.toLocaleDateString()
      }
      return String(value)

    case 'text':
    case 'textarea':
    case 'code':
    default:
      return String(value)
  }
}

/**
 * Composable that processes ProColumnDef array and data into description items.
 * Filters by hideInDescriptions, resolves nested paths, formats values, resolves valueEnum.
 */
export function useProDescriptions(options: UseProDescriptionsOptions): UseProDescriptionsReturn {
  const { columns, data } = options

  const descriptionItems = computed<DescriptionItem[]>(() => {
    return columns
      .filter((col) => !col.hideInDescriptions)
      .map((col) => {
        const dataIndexStr = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
        const rawValue = getNestedValue(data, dataIndexStr)
        const valueType = col.valueType ?? 'text'

        let displayText: string | undefined
        let statusType: StatusType | undefined

        if (col.valueEnum && rawValue != null) {
          const enumEntry = col.valueEnum[String(rawValue)]
          if (enumEntry) {
            displayText = enumEntry.text
            statusType = enumEntry.status
          }
        }

        const formattedValue = displayText ?? formatValue(rawValue, valueType)

        return {
          dataIndex: (col.key ?? dataIndexStr) as string,
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
      })
  })

  return { descriptionItems }
}
