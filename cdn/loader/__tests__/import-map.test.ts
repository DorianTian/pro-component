import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveImportMap, _internal } from '../src/import-map'
import type { ImportMapResponse, LoaderConfig } from '../src/types'
import {
  LS_IMPORT_MAP_KEY,
  LS_IMPORT_MAP_TS_KEY,
  HARDCODED_FALLBACK_IMPORT_MAP,
} from '../src/constants'

const MOCK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [],
  styles: ['https://cdn.internal/@pro/table/1.2.3/style/index.css'],
  sriHashes: {
    'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-abc123',
  },
  cache_bust: false,
}

const MOCK_CONFIG: LoaderConfig = {
  appEntry: '/src/main.ts',
  appId: 'test-app',
  userId: 'user-1',
  apiBaseUrl: 'https://platform.internal/api/v1',
  cdnBaseUrl: 'https://cdn.internal',
  fetchTimeout: 5000,
}

describe('isValidImportMapResponse', () => {
  it('returns true for valid import map response', () => {
    expect(_internal.isValidImportMapResponse(MOCK_IMPORT_MAP)).toBe(true)
  })

  it('returns false for null', () => {
    expect(_internal.isValidImportMapResponse(null)).toBe(false)
  })

  it('returns false for missing imports', () => {
    expect(_internal.isValidImportMapResponse({ preloads: [], styles: [] })).toBe(false)
  })

  it('returns false for non-array preloads', () => {
    expect(
      _internal.isValidImportMapResponse({
        imports: {},
        preloads: 'not-array',
        styles: [],
      }),
    ).toBe(false)
  })
})

describe('resolveImportMap', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value
      },
      removeItem: (key: string) => {
        Reflect.deleteProperty(mockLocalStorage, key)
      },
    })

    // Mock navigator.serviceWorker (not available)
    vi.stubGlobal('navigator', {
      serviceWorker: undefined,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns API response on success and caches to localStorage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_IMPORT_MAP),
      }),
    )

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('api')
    expect(result.importMap).toEqual(MOCK_IMPORT_MAP)

    // Verify cached to localStorage
    expect(mockLocalStorage[LS_IMPORT_MAP_KEY]).toBe(JSON.stringify(MOCK_IMPORT_MAP))
    expect(mockLocalStorage[LS_IMPORT_MAP_TS_KEY]).toBeDefined()
  })

  it('falls back to localStorage when API fails', async () => {
    // Pre-populate localStorage
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('localstorage')
    expect(result.importMap).toEqual(MOCK_IMPORT_MAP)
  })

  it('ignores expired localStorage cache', async () => {
    // Set expired cache (2 hours ago)
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now() - 2 * 60 * 60 * 1000)

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap).toEqual(HARDCODED_FALLBACK_IMPORT_MAP)
  })

  it('falls back to hardcoded when all sources fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resolveImportMap(MOCK_CONFIG)

    expect(result.source).toBe('hardcoded')
    expect(result.importMap.imports).toHaveProperty('vue')
    expect(result.importMap.imports).toHaveProperty('@pro/table')
  })

  it('sends correct API URL with appId and userId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_IMPORT_MAP),
    })
    vi.stubGlobal('fetch', mockFetch)

    await resolveImportMap(MOCK_CONFIG)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://platform.internal/api/v1/import-map?appId=test-app&userId=user-1',
      expect.objectContaining({
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('handles API non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    const result = await resolveImportMap(MOCK_CONFIG)
    // Should fall through to hardcoded (no SW, no localStorage)
    expect(result.source).toBe('hardcoded')
  })

  it('handles invalid import map response shape from API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      }),
    )

    const result = await resolveImportMap(MOCK_CONFIG)
    expect(result.source).toBe('hardcoded')
  })
})

describe('localStorage functions', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value
      },
      removeItem: (key: string) => {
        Reflect.deleteProperty(mockLocalStorage, key)
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetchFromLocalStorage returns null when empty', () => {
    const result = _internal.fetchFromLocalStorage()
    expect(result).toBeNull()
  })

  it('fetchFromLocalStorage returns parsed import map when fresh', () => {
    mockLocalStorage[LS_IMPORT_MAP_KEY] = JSON.stringify(MOCK_IMPORT_MAP)
    mockLocalStorage[LS_IMPORT_MAP_TS_KEY] = String(Date.now())

    const result = _internal.fetchFromLocalStorage()
    expect(result).toEqual(MOCK_IMPORT_MAP)
  })

  it('saveToLocalStorage persists correctly', () => {
    _internal.saveToLocalStorage(MOCK_IMPORT_MAP)

    expect(mockLocalStorage[LS_IMPORT_MAP_KEY]).toBe(JSON.stringify(MOCK_IMPORT_MAP))
    expect(parseInt(mockLocalStorage[LS_IMPORT_MAP_TS_KEY], 10)).toBeCloseTo(Date.now(), -2)
  })
})
