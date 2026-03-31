import { SW_SCRIPT_PATH, logger } from './constants'
import type { ImportMapResponse } from './types'

/**
 * Get the active, installing, or waiting worker from a registration.
 */
function getActiveWorker(registration: ServiceWorkerRegistration): ServiceWorker | null {
  return registration.active ?? registration.installing ?? registration.waiting
}

/**
 * Send cache_bust command to SW -- clears all cached CDN resources.
 * Used during rollback when stale cached versions must be purged.
 */
function notifyCacheBust(registration: ServiceWorkerRegistration): void {
  const worker = getActiveWorker(registration)
  if (!worker) return

  worker.postMessage({ type: 'CACHE_BUST' })
  logger.info('Sent CACHE_BUST to Service Worker')
}

/**
 * Send the list of URLs from the import map to SW for pre-caching.
 */
function notifyPrecache(
  registration: ServiceWorkerRegistration,
  importMap: ImportMapResponse,
): void {
  const worker = getActiveWorker(registration)
  if (!worker) return

  const urls = [...Object.values(importMap.imports), ...importMap.preloads, ...importMap.styles]

  worker.postMessage({ type: 'PRECACHE', urls })
}

/**
 * Register or update the pro-sw.js Service Worker.
 *
 * SW is responsible for:
 * - Caching CDN resources (ESM modules, CSS)
 * - Providing offline fallback for cached resources
 * - Handling cache_bust signals (clearing cache on rollback)
 *
 * Registration is fire-and-forget -- it should not block app bootstrap.
 */
export async function registerServiceWorker(
  importMap: ImportMapResponse,
  swPath?: string,
): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker not supported in this browser')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath ?? SW_SCRIPT_PATH, {
      scope: '/',
    })

    // If cache_bust is true (rollback scenario), tell SW to clear cache
    if (importMap.cache_bust) {
      notifyCacheBust(registration)
    }

    // Pass the current import map URLs to SW for pre-caching
    notifyPrecache(registration, importMap)

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            logger.info('Service Worker updated and activated')
          }
        })
      }
    })
  } catch (err: unknown) {
    // SW registration failure is non-critical -- app will work without caching
    logger.warn('Service Worker registration failed:', err)
  }
}
