export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'processing' | 'default'

export interface ProTagProps {
  /** Preset status — maps to semantic color palette */
  status?: StatusType
  /** Custom color (overrides status) */
  color?: string
  /** Whether the tag is bordered */
  bordered?: boolean
}
