/**
 * pro-loader.js -- CDN bootstrap loader for Pro Components.
 *
 * Consumer integration:
 *   <script>window.__PRO_USER_ID__ = 'dorian'</script>
 *   <script src="https://cdn.internal/pro-loader@1.js?appId=user-center"
 *           data-pro-entry="/src/main.ts"></script>
 *
 * Execution flow:
 *   1. Parse config from script tag attributes + URL params + window globals
 *   2. Load es-module-shims polyfill
 *   3. Fetch import map (API -> SW cache -> localStorage -> hardcoded fallback)
 *   4. Handle cache_bust if present (rollback scenario)
 *   5. Inject import map + modulepreload + CSS into document
 *   6. Register Service Worker (fire-and-forget)
 *   7. import(appEntry) to bootstrap application
 *   8. On fatal error: render inline error page with retry
 */

import type { LoaderConfig, FallbackSource } from './types'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_CDN_BASE_URL,
  ES_MODULE_SHIMS_URL,
  FETCH_TIMEOUT_MS,
  logger,
} from './constants'
import { resolveImportMap } from './import-map'
import { loadEsModuleShims, injectAll, bootstrapApp } from './inject'
import { registerServiceWorker } from './sw-register'
import { renderErrorPage } from './error-page'
import type { ErrorDiagnostics } from './error-page'

/**
 * Parse loader configuration from the script tag that loaded this file.
 * Supports:
 *   - URL search params: ?appId=xxx
 *   - data- attributes: data-pro-entry="/src/main.ts"
 *   - window globals: window.__PRO_USER_ID__
 */
function parseConfig(): LoaderConfig {
  const scriptTag = document.currentScript as HTMLScriptElement | null

  let appId = ''
  let appEntry = '/src/main.ts'
  let apiBaseUrl = DEFAULT_API_BASE_URL
  let cdnBaseUrl = DEFAULT_CDN_BASE_URL

  if (scriptTag) {
    const url = new URL(scriptTag.src, window.location.href)
    appId = url.searchParams.get('appId') ?? ''
    apiBaseUrl = url.searchParams.get('apiBaseUrl') ?? apiBaseUrl
    cdnBaseUrl = url.searchParams.get('cdnBaseUrl') ?? cdnBaseUrl

    appEntry = scriptTag.dataset.proEntry ?? appEntry
  }

  // Window globals (typed via global.d.ts declaration)
  const userId = window.__PRO_USER_ID__ ?? ''

  if (!appId) {
    logger.warn('No appId provided -- import map resolution may fail')
  }

  return {
    appEntry,
    appId,
    userId,
    apiBaseUrl,
    cdnBaseUrl,
    fetchTimeout: FETCH_TIMEOUT_MS,
  }
}

/**
 * Track which fallback sources failed for diagnostics.
 */
function trackFailedSources(source: FallbackSource): string[] {
  const failedSources: string[] = []
  if (source !== 'api') {
    failedSources.push('api')
    if (source === 'localstorage') failedSources.push('sw-cache')
    if (source === 'hardcoded') {
      failedSources.push('sw-cache', 'localstorage')
    }
  }
  return failedSources
}

/**
 * Main boot sequence -- orchestrates all loader steps.
 */
async function boot(): Promise<void> {
  const config = parseConfig()
  let failedSources: string[] = []

  try {
    // Step 1: Load es-module-shims polyfill
    await loadEsModuleShims(ES_MODULE_SHIMS_URL)

    // Step 2: Resolve import map (with fallback chain)
    const result = await resolveImportMap(config)
    const { importMap, source } = result
    failedSources = trackFailedSources(source)

    // Step 3: Inject import map + preloads + CSS
    injectAll(importMap)

    // Step 4: Register Service Worker (fire-and-forget, non-blocking)
    registerServiceWorker(importMap).catch((err: unknown) => {
      logger.warn('SW registration error (non-blocking):', err)
    })

    // Step 5: Bootstrap the consumer application
    await bootstrapApp(config.appEntry)
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))

    logger.error('Fatal boot error:', error)

    const diagnostics: ErrorDiagnostics = {
      appId: config.appId,
      userId: config.userId,
      failedSources,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }

    renderErrorPage(error, diagnostics)
  }
}

// Auto-boot when script loads
boot()
