/**
 * pro-sw.js -- Service Worker for CDN resource caching.
 *
 * Responsibilities:
 * 1. Cache CDN resources (ESM modules, CSS) on fetch
 * 2. Serve from cache when offline (cache-first for immutable resources)
 * 3. Store the latest import map for offline fallback
 * 4. Handle CACHE_BUST signals from the loader (rollback scenario)
 * 5. Pre-cache URLs sent by the loader on import map resolution
 *
 * Cache strategy:
 * - Immutable CDN resources (versioned URLs): Cache-first, never revalidate
 * - API responses: Network-first with cache fallback
 */

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'pro-cdn-cache-v1'
const IMPORT_MAP_CACHE_KEY = 'pro-import-map-response'

/** URL patterns that indicate an immutable CDN resource */
const CDN_RESOURCE_PATTERN = /\/(esm|umd|style)\//
const CDN_HOST_PATTERN = /cdn\.internal/

/**
 * Install event -- skip waiting to activate immediately.
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting())
})

/**
 * Activate event -- claim all clients and clean old caches.
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(activateAndCleanup())
})

/** Claim clients and purge stale cache versions */
async function activateAndCleanup(): Promise<void> {
  await self.clients.claim()

  const cacheNames = await caches.keys()
  const toDelete = cacheNames.filter(
    (name) => name.startsWith('pro-cdn-cache-') && name !== CACHE_NAME,
  )
  await Promise.all(toDelete.map((name) => caches.delete(name)))
}

/**
 * Fetch event -- cache-first strategy for CDN resources.
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  // Only intercept CDN resource requests
  if (!CDN_HOST_PATTERN.test(url.hostname)) return
  if (!CDN_RESOURCE_PATTERN.test(url.pathname)) return

  event.respondWith(cacheFirstStrategy(event.request))
})

/**
 * Cache-first: return cached response, or fetch + cache.
 * CDN resources are immutable (versioned URLs), so cached responses never go stale.
 */
async function cacheFirstStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      // Clone before caching (response body can only be read once)
      cache.put(request, response.clone())
    }

    return response
  } catch {
    // Offline and not cached -- return a minimal error response
    return new Response('Service Worker: resource unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

/**
 * Message handler -- receives commands from the loader.
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { data } = event

  switch (data?.type) {
    case 'CACHE_BUST':
      event.waitUntil(handleCacheBust())
      break

    case 'PRECACHE':
      if (Array.isArray(data.urls)) {
        event.waitUntil(handlePrecache(data.urls as string[]))
      }
      break

    case 'CACHE_IMPORT_MAP':
      if (data.importMap && typeof data.importMap === 'object') {
        event.waitUntil(handleCacheImportMap(data.importMap as unknown))
      }
      break

    case 'GET_CACHED_IMPORT_MAP':
      event.waitUntil(handleGetCachedImportMap(event))
      break
  }
})

/**
 * CACHE_BUST: Clear all cached CDN resources.
 * Triggered during rollback when stale versions must be purged.
 */
async function handleCacheBust(): Promise<void> {
  await caches.delete(CACHE_NAME)
  // eslint-disable-next-line no-console -- SW runs in isolated context
  console.log('[pro-sw] Cache busted: all CDN resources cleared')

  // Notify all clients that cache has been cleared
  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage({ type: 'CACHE_BUSTED' })
  }
}

/**
 * PRECACHE: Fetch and cache a list of URLs in the background.
 * Called after import map resolution with all dependency URLs.
 * Uses Cache.addAll for atomic caching -- all-or-nothing semantics.
 */
async function handlePrecache(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME)

  // Filter out already-cached URLs to avoid redundant fetches
  const uncached: string[] = []
  for (const url of urls) {
    const existing = await cache.match(url)
    if (!existing) {
      uncached.push(url)
    }
  }

  if (uncached.length === 0) return

  try {
    // Atomic: all resources cached together or none
    await cache.addAll(uncached)
  } catch (err: unknown) {
    // eslint-disable-next-line no-console -- SW diagnostic logging
    console.warn(
      `[pro-sw] Pre-cache failed for ${uncached.length} URLs:`,
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Validate import map shape before caching.
 * Ensures we don't cache garbage data from corrupted messages.
 */
function isValidImportMapShape(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  const record = data as Record<string, unknown>
  return 'imports' in record && typeof record.imports === 'object' && record.imports !== null
}

/**
 * CACHE_IMPORT_MAP: Store the import map response for offline fallback.
 * Stored as a synthetic Response in Cache Storage.
 * Validates shape before caching to prevent storing corrupt data.
 */
async function handleCacheImportMap(importMap: unknown): Promise<void> {
  if (!isValidImportMapShape(importMap)) {
    // eslint-disable-next-line no-console -- SW diagnostic logging
    console.warn('[pro-sw] Rejected invalid import map shape')
    return
  }

  const cache = await caches.open(CACHE_NAME)
  const response = new Response(JSON.stringify(importMap), {
    headers: { 'Content-Type': 'application/json' },
  })
  await cache.put(IMPORT_MAP_CACHE_KEY, response)
}

/**
 * GET_CACHED_IMPORT_MAP: Return the cached import map to the loader.
 * Uses MessageChannel port for direct reply.
 */
async function handleGetCachedImportMap(event: ExtendableMessageEvent): Promise<void> {
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(IMPORT_MAP_CACHE_KEY)

  const port = event.ports?.[0]
  if (!port) return

  if (response) {
    const importMap: unknown = await response.json()
    port.postMessage({ type: 'IMPORT_MAP_CACHED', importMap })
  } else {
    port.postMessage({ type: 'IMPORT_MAP_CACHED', importMap: null })
  }
}
