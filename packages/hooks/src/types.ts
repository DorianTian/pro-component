/**
 * Minimal interface for vue-i18n detection.
 * Used by ProConfigProvider to optionally integrate with vue-i18n
 * without requiring it as a hard dependency.
 */
export interface I18nLike {
  global: {
    locale: { value: string }
    t: (key: string, params?: Record<string, unknown>) => string
    mergeLocaleMessage: (locale: string, messages: Record<string, unknown>) => void
  }
}
