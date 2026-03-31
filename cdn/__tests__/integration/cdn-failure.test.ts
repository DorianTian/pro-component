/**
 * @vitest-environment jsdom
 *
 * Integration test: CDN failure simulation.
 *
 * Verifies the fallback chain behavior when various sources fail:
 *   API fail -> SW cache -> localStorage -> hardcoded fallback -> error page
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ImportMapResponse } from '../../loader/src/types'
import { resolveImportMap } from '../../loader/src/import-map'
import {
  HARDCODED_FALLBACK_IMPORT_MAP,
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
} from '../../loader/src/constants'

const CACHED_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.0.0/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [],
  styles: [],
  sriHashes: {},
  cache_bust: false,
}

const BASE_CONFIG = {
  appEntry: '/src/main.ts',
  appId: 'test-app',
  userId: 'user-1',
  apiBaseUrl: 'https://platform.internal/api/v1',
  cdnBaseUrl: 'https://cdn.internal',
  fetchTimeout: 5000,
}

describe('CDN Failure Simulation', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key]
      },
    })

    vi.stubGlobal('navigator', { serviceWorker: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('API timeout -> falls through to localStorage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))

    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('localstorage')
    expect(result.importMap.imports['@pro/table']).toBe(CACHED_IMPORT_MAP.imports['@pro/table'])
  })

  it('API 500 -> falls through to localStorage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('localstorage')
  })

  it('API fail + expired localStorage -> hardcoded fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    // Expired cache (2 hours ago)
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(CACHED_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now() - 2 * 60 * 60 * 1000)

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap).toEqual(HARDCODED_FALLBACK_IMPORT_MAP)
  })

  it('all sources fail -> hardcoded fallback (last resort before error page)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')))

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap.imports).toHaveProperty('vue')
    expect(result.importMap.imports).toHaveProperty('@pro/table')
  })

  it('API returns malformed JSON -> falls through to fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    )

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
  })

  it('localStorage parse error -> treated as empty, falls to hardcoded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')))

    mockLocalStorage[LS_IMPORT_MAP_KEY] = '{invalid json'
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = await resolveImportMap(BASE_CONFIG)

    expect(result.source).toBe('hardcoded')
  })
})
