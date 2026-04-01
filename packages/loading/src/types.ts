export type LoadingState = 'loading' | 'empty' | 'error' | 'success'

export interface ProLoadingProps {
  /** Whether data is currently loading */
  loading?: boolean
  /** Whether the data set is empty */
  empty?: boolean
  /** Error object or message */
  error?: string | Error | null
  /** Number of skeleton rows in default loading state */
  skeletonRows?: number
  /** Whether to show the skeleton animation */
  animated?: boolean
  /** Custom empty description */
  emptyDescription?: string
  /** Custom error title */
  errorTitle?: string
  /** Delay before showing loading state (ms) */
  delay?: number
}
