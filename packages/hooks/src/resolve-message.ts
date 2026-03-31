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

  let current: unknown = messages
  for (const segment of key.split('.')) {
    if (current === null || current === undefined || typeof current !== 'object') {
      current = undefined
      break
    }
    current = (current as Record<string, unknown>)[segment]
  }
  const value = current

  if (typeof value !== 'string') return key
  if (!params) return value

  return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`))
}
