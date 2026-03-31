import type { ImportMapResponse } from './types'

/** Default API base URL */
export const DEFAULT_API_BASE_URL = 'https://platform.internal/api/v1'

/** Default CDN base URL */
export const DEFAULT_CDN_BASE_URL = 'https://cdn.internal'

/** es-module-shims CDN URL */
export const ES_MODULE_SHIMS_URL =
  'https://cdn.internal/vendor/es-module-shims/1.10.0/es-module-shims.min.js'

/** Import map API fetch timeout (ms) */
export const FETCH_TIMEOUT_MS = 5000

/** Max retry attempts for API fetch */
export const MAX_RETRY_ATTEMPTS = 3

/** Retry backoff base delay (ms) */
export const RETRY_BACKOFF_MS = 1000

/** Fallback check interval for periodic revalidation (ms) */
export const FALLBACK_CHECK_INTERVAL_MS = 30000

/** Max number of import map cache groups kept in SW cache */
export const MAX_CACHE_GROUPS = 2

/** Minimum storage threshold before refusing to cache (MB) */
export const MIN_STORAGE_THRESHOLD_MB = 50

/** localStorage key for cached import map */
export const LS_IMPORT_MAP_KEY = 'pro:import-map'

/** localStorage key for cached import map timestamp */
export const LS_IMPORT_MAP_TS_KEY = 'pro:import-map:ts'

/** Max age for localStorage cached import map (ms) -- 1 hour */
export const LS_MAX_AGE_MS = 60 * 60 * 1000

/** Service Worker script path (relative to loader) */
export const SW_SCRIPT_PATH = '/pro-sw.js'

/** SW cache name */
export const SW_CACHE_NAME = 'pro-cdn-cache-v1'

/** SW cache channel name for cross-tab communication */
export const SW_CACHE_CHANNEL = 'pro-sw-channel'

/** SW message reply timeout (ms) */
export const SW_REPLY_TIMEOUT_MS = 2000

/**
 * Browser logger wrapper for loader code.
 * Info/warn only log in dev mode (__DEV__ replaced by terser in production).
 * Errors always log -- they indicate real failures.
 */
declare const __DEV__: boolean

const LOG_PREFIX = '[pro-loader]'

export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console -- dev-only diagnostic
      console.info(LOG_PREFIX, msg, ...args)
    }
  },
  warn: (msg: string, ...args: unknown[]) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console -- dev-only diagnostic
      console.warn(LOG_PREFIX, msg, ...args)
    }
  },
  error: (msg: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console -- errors always log
    console.error(LOG_PREFIX, msg, ...args)
  },
}

/**
 * Optional CDN dependencies -- included in import maps but handled gracefully
 * if unavailable. The component library's built-in fallback covers the case
 * where vue-i18n fails to load.
 */
export const OPTIONAL_DEPS = ['vue-i18n'] as const

/**
 * Hardcoded fallback import map -- absolute last resort before error page.
 * Points to known stable versions. Updated on each loader release.
 */
export const HARDCODED_FALLBACK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    'vue-i18n':
      'https://cdn.jsdelivr.net/npm/vue-i18n@11/dist/vue-i18n.runtime.esm-browser.prod.js',
    'element-plus': 'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.full.mjs',
    dayjs: 'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
    '@pro/table': 'https://cdn.internal/@pro/table/0.0.1/esm/index.mjs',
    '@pro/form': 'https://cdn.internal/@pro/form/0.0.1/esm/index.mjs',
    '@pro/descriptions': 'https://cdn.internal/@pro/descriptions/0.0.1/esm/index.mjs',
    '@pro/hooks': 'https://cdn.internal/@pro/hooks/0.0.1/esm/index.mjs',
    '@pro/utils': 'https://cdn.internal/@pro/utils/0.0.1/esm/index.mjs',
    '@pro/locale': 'https://cdn.internal/@pro/locale/0.0.1/esm/index.mjs',
  },
  preloads: [],
  styles: ['https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css'],
  sriHashes: {},
  cache_bust: false,
}
