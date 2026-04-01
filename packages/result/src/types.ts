export type ResultType = 'success' | 'error' | 'warning' | 'info' | '403' | '404' | '500'

export interface ProResultProps {
  /** Result type — maps to icon and default title/subtitle */
  type?: ResultType
  /** Custom title (overrides preset) */
  title?: string
  /** Custom subtitle (overrides preset) */
  subTitle?: string
}
