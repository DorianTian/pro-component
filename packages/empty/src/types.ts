export type EmptyType = 'no-data' | 'no-result' | 'error' | 'no-permission' | 'custom'

export interface ProEmptyProps {
  /** Preset empty type */
  type?: EmptyType
  /** Custom description (overrides preset) */
  description?: string
  /** Custom image URL */
  image?: string
  /** Image size in pixels */
  imageSize?: number
  /** Show retry button for error type */
  showRetry?: boolean
}
