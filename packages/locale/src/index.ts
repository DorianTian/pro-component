export { enUS } from './lang/en-US'
export { zhCN } from './lang/zh-CN'

import type { enUS } from './lang/en-US'

/**
 * Recursively extracts dot-separated key paths from a nested object type.
 * Used to provide type-safe translation key auto-completion.
 *
 * @example
 * NestedKeyOf<{ a: { b: 'x' } }> => 'a.b'
 */
type NestedKeyOf<T, P extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? NestedKeyOf<T[K], `${P}${K}.`>
          : `${P}${K}`
      }[keyof T & string]
    : never

/** Union of all valid translation key paths, derived from en-US message structure */
export type ProLocaleKey = NestedKeyOf<typeof enUS>
