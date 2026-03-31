import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'
import type { ProLocaleKey } from '@pro/locale'
import { enUS } from '@pro/locale'
import { PRO_LOCALE_KEY } from './constants'
import { resolveMessage } from './resolve-message'

declare const __DEV__: boolean

/** Context shape provided by ProConfigProvider and consumed by all Pro Components */
export interface ProLocaleContext {
  t: (key: ProLocaleKey, params?: Record<string, string | number>) => string
  locale: ComputedRef<string>
}

/**
 * Access the locale context provided by `<ProConfigProvider>`.
 * Falls back to built-in en-US translations when no provider is present.
 *
 * All Pro Components use this composable exclusively — never import vue-i18n directly.
 */
export function useProLocale(): ProLocaleContext {
  const ctx = inject<ProLocaleContext | null>(PRO_LOCALE_KEY, null)

  if (!ctx && typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console -- Dev-only warning for missing ProConfigProvider
    console.warn(
      '[ProComponents] useProLocale() called without <ProConfigProvider>. ' +
        'Falling back to en-US defaults. Wrap your app with <ProConfigProvider> for full i18n support.',
    )
  }

  return (
    ctx ?? {
      t: (key, params) => resolveMessage(enUS as unknown as Record<string, unknown>, key, params),
      locale: computed(() => 'en-US'),
    }
  )
}
