import type { ImportMapResponse, LoaderConfig, FallbackSource } from './types'
import {
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
  LS_MAX_AGE_MS,
  HARDCODED_FALLBACK_IMPORT_MAP,
  SW_REPLY_TIMEOUT_MS,
  logger,
} from './constants'

interface ImportMapResult {
  importMap: ImportMapResponse
  source: FallbackSource
}

/**
 * Runtime validation guard for import map API responses.
 * Ensures the response has the expected shape before use.
 */
function isValidImportMapResponse(data: unknown): data is ImportMapResponse {
  if (typeof data !== 'object' || data === null) return false

  const record = data as Record<string, unknown>

  const hasImports =
    'imports' in record && typeof record.imports === 'object' && record.imports !== null

  const hasPreloads = 'preloads' in record && Array.isArray(record.preloads)

  const hasStyles = 'styles' in record && Array.isArray(record.styles)

  return hasImports && hasPreloads && hasStyles
}

/**
 * Fetch import map from Platform API with AbortController timeout.
 */
async function fetchFromApi(config: LoaderConfig): Promise<ImportMapResponse> {
  const url = `${config.apiBaseUrl}/import-map?appId=${encodeURIComponent(config.appId)}&userId=${encodeURIComponent(config.userId)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.fetchTimeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`)
    }

    const data: unknown = await response.json()
    if (!isValidImportMapResponse(data)) {
      throw new Error('Invalid import map response shape')
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Try to read cached import map from Service Worker via MessageChannel.
 * SW stores the last successful API response in Cache Storage.
 */
async function fetchFromSwCache(): Promise<ImportMapResponse | null> {
  const sw = navigator?.serviceWorker
  if (!sw?.controller) {
    return null
  }

  return new Promise<ImportMapResponse | null>((resolve) => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => resolve(null), SW_REPLY_TIMEOUT_MS)

    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      if (
        event.data?.type === 'IMPORT_MAP_CACHED' &&
        isValidImportMapResponse(event.data.importMap)
      ) {
        resolve(event.data.importMap as ImportMapResponse)
      } else {
        resolve(null)
      }
    }

    // sw and sw.controller are guaranteed non-null by the guard above
    sw.controller!.postMessage({ type: 'GET_CACHED_IMPORT_MAP' }, [channel.port2])
  })
}

/**
 * Try to read cached import map from localStorage.
 * Expires after LS_MAX_AGE_MS.
 */
function fetchFromLocalStorage(): ImportMapResponse | null {
  try {
    const tsRaw = localStorage.getItem(LS_IMPORT_MAP_TS_KEY)
    if (!tsRaw) return null

    const ts = parseInt(tsRaw, 10)
    if (Date.now() - ts > LS_MAX_AGE_MS) {
      localStorage.removeItem(LS_IMPORT_MAP_KEY)
      localStorage.removeItem(LS_IMPORT_MAP_TS_KEY)
      return null
    }

    const raw = localStorage.getItem(LS_IMPORT_MAP_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isValidImportMapResponse(parsed)) return null

    return parsed
  } catch {
    // JSON parse failure or localStorage unavailable in iframe/private browsing
    return null
  }
}

/**
 * Persist import map to localStorage for offline fallback.
 */
function saveToLocalStorage(importMap: ImportMapResponse): void {
  try {
    localStorage.setItem(LS_IMPORT_MAP_KEY, JSON.stringify(importMap))
    localStorage.setItem(LS_IMPORT_MAP_TS_KEY, String(Date.now()))
  } catch {
    // localStorage may be full, disabled, or unavailable in iframe/private browsing
  }
}

/**
 * Notify SW to cache the import map response.
 * Safely handles environments where serviceWorker is undefined.
 */
function notifySwToCache(importMap: ImportMapResponse): void {
  try {
    const sw = navigator?.serviceWorker
    if (sw?.controller) {
      sw.controller.postMessage({
        type: 'CACHE_IMPORT_MAP',
        importMap,
      })
    }
  } catch {
    // SW notification is best-effort -- never block the main flow
  }
}

/**
 * Resolve import map using the fallback chain:
 *   1. API fetch (with timeout)
 *   2. Service Worker cache
 *   3. localStorage cache (with expiry)
 *   4. Hardcoded fallback
 *
 * On success from API, caches result to SW + localStorage for future fallback.
 * Returns the import map and which source it came from (for diagnostics).
 */
export async function resolveImportMap(config: LoaderConfig): Promise<ImportMapResult> {
  // 1. Try API
  try {
    const importMap = await fetchFromApi(config)
    saveToLocalStorage(importMap)
    notifySwToCache(importMap)
    return { importMap, source: 'api' }
  } catch (apiError: unknown) {
    logger.warn('API fetch failed, trying SW cache:', apiError)
  }

  // 2. Try Service Worker cache
  try {
    const cached = await fetchFromSwCache()
    if (cached) {
      return { importMap: cached, source: 'sw-cache' }
    }
  } catch {
    // SW cache unavailable -- continue to next fallback
    logger.warn('SW cache unavailable')
  }

  // 3. Try localStorage
  const lsCached = fetchFromLocalStorage()
  if (lsCached) {
    logger.warn('Using localStorage cached import map')
    return { importMap: lsCached, source: 'localstorage' }
  }

  // 4. Hardcoded fallback
  logger.warn('All sources failed, using hardcoded fallback')
  return { importMap: HARDCODED_FALLBACK_IMPORT_MAP, source: 'hardcoded' }
}

// Export internal functions for testing
export const _internal = {
  fetchFromApi,
  fetchFromSwCache,
  fetchFromLocalStorage,
  saveToLocalStorage,
  isValidImportMapResponse,
}
