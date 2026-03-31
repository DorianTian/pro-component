/**
 * Built-in fallback translation function for no-vue-i18n mode.
 * Resolves dot-separated keys from a nested message object
 * and interpolates `{param}` placeholders.
 */
export function resolveMessage(
  messages: Record<string, unknown>,
  key: string,
  params?: Record<string, string | number>,
): string {
  if (!key) return ''
  if (!messages) return key

  const value = key
    .split('.')
    .reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], messages)

  if (typeof value !== 'string') return key
  if (!params) return value

  return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`))
}
