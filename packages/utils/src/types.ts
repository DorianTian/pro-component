/** Standard request params passed to ProTable/ProForm request functions */
export interface RequestParams {
  current: number
  pageSize: number
  [key: string]: unknown
}

/** Standard response format from request functions */
export interface RequestResult<T = unknown> {
  data: T[]
  total: number
  success: boolean
}

/** Status type for valueEnum rendering */
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

/** ValueType determines rendering + search control + formatting */
export type ValueType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'dateRange'
  | 'dateTime'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'money'
  | 'percent'
  | 'progress'
  | 'image'
  | 'code'
