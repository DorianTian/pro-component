import type { InjectionKey } from 'vue'
import type { ProLocaleContext } from './use-pro-locale'

/** Injection key for the Pro Components locale context provided by ProConfigProvider */
export const PRO_LOCALE_KEY: InjectionKey<ProLocaleContext> = Symbol('pro-locale')
