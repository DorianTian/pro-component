import { LRUCache } from 'lru-cache'
import { loadConfig } from '../../config.js'
import type { ImportMapResponse } from '../../types/api.js'
import { logger } from '../../logger.js'
import { getDb } from '../../db.js'

const IMPORT_MAP_CACHE_MAX_ENTRIES = 10_000
const IMPORT_MAP_CACHE_TTL_MS = 60_000

/** CDN edge cache header values (seconds). */
export const CDN_EDGE_MAX_AGE_S = 60
export const CDN_EDGE_SWR_S = 300

let cache: LRUCache<string, ImportMapResponse> | null = null

function getCache(): LRUCache<string, ImportMapResponse> {
  if (!cache) {
    const config = loadConfig()
    cache = new LRUCache<string, ImportMapResponse>({
      max: config.cache.importMapMaxSize || IMPORT_MAP_CACHE_MAX_ENTRIES,
      ttl: config.cache.importMapTtlMs || IMPORT_MAP_CACHE_TTL_MS,
    })
    logger.info(
      { maxSize: config.cache.importMapMaxSize, ttlMs: config.cache.importMapTtlMs },
      'Import map cache initialized',
    )
  }
  return cache
}

/** Get current cache epoch from DB (global invalidation counter). */
export async function getCacheEpoch(): Promise<number> {
  try {
    const db = getDb()
    const row = await db('cache_metadata').where('key', 'cache_epoch').first()
    return row?.value ?? 0
  } catch {
    // DB or table not available -- default to epoch 0 (no cache invalidation)
    return 0
  }
}

/** Increment cache epoch — called after version mapping or grayscale rule changes. */
export async function invalidateImportMapCache(): Promise<void> {
  try {
    const db = getDb()
    await db('cache_metadata').where('key', 'cache_epoch').increment('value', 1)
  } catch {
    logger.warn('Failed to increment cache epoch — cache_metadata table may not exist')
  }

  getCache().clear()
}

/** Build cache key from appId, userId, and version fingerprint. */
export function buildCacheKey(
  appId: string,
  userId: string | undefined,
  versionFingerprint: string,
): string {
  return `${appId}:${userId || '_anon'}:${versionFingerprint}`
}

/** Build version fingerprint from resolved versions. Deterministic: sorted by package name. */
export function buildVersionFingerprint(resolved: Map<string, string>): string {
  const entries = Array.from(resolved.entries()).sort(([a], [b]) => a.localeCompare(b))
  return entries.map(([name, ver]) => `${name}@${ver}`).join(',')
}

export function getCached(key: string): ImportMapResponse | undefined {
  return getCache().get(key)
}

export function setCached(key: string, value: ImportMapResponse): void {
  getCache().set(key, value)
}

export function clearCache(): void {
  getCache().clear()
}

export function getCacheSize(): number {
  return getCache().size
}
