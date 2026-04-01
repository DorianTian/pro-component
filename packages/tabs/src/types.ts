export interface ProTabsProps {
  /** Active tab name (v-model) */
  modelValue?: string
  /** Tab variant */
  variant?: 'line' | 'card' | 'border-card'
  /** Whether tabs are closable */
  closable?: boolean
  /** Show confirm dialog before closing */
  confirmClose?: boolean
  /** Confirm dialog message */
  confirmMessage?: string
  /** Confirm dialog title */
  confirmTitle?: string
}
