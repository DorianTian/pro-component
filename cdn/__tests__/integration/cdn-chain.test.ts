/**
 * @vitest-environment jsdom
 *
 * Integration test: full CDN bootstrap chain.
 *
 * Verifies: API fetch -> import map injection -> modulepreload -> CSS injection -> app bootstrap
 *
 * Note: In CI, run with Vitest browser mode (--browser.name=chromium) for full
 * es-module-shims + real ESM import verification. The jsdom version tests the
 * DOM injection and fallback chain logic.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ImportMapResponse } from '../../loader/src/types'
import { resolveImportMap } from '../../loader/src/import-map'
import { injectAll } from '../../loader/src/inject'

const FULL_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    '@pro/form': 'https://cdn.internal/@pro/form/1.1.2/esm/index.mjs',
    '@pro/hooks': 'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
    '@pro/utils': 'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    'element-plus': 'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.full.mjs',
  },
  preloads: [
    'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs',
    'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs',
  ],
  styles: [
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css',
    'https://cdn.internal/@pro/form/1.1.2/style/index.css',
  ],
  sriHashes: {
    'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-tableHash',
    'https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs': 'sha384-hooksHash',
    'https://cdn.internal/@pro/utils/1.0.3/esm/index.mjs': 'sha384-utilsHash',
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css': 'sha384-epCssHash',
  },
  cache_bust: false,
}

describe('CDN Chain Integration', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = '<div id="app"></div>'
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

    vi.stubGlobal('navigator', { serviceWorker: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('API success -> injects complete import map + preloads + CSS', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(FULL_IMPORT_MAP),
      }),
    )

    // Step 1: Resolve import map
    const result = await resolveImportMap({
      appEntry: '/src/main.ts',
      appId: 'user-center',
      userId: 'dorian',
      apiBaseUrl: 'https://platform.internal/api/v1',
      cdnBaseUrl: 'https://cdn.internal',
      fetchTimeout: 5000,
    })

    expect(result.source).toBe('api')

    // Step 2: Inject everything
    injectAll(result.importMap)

    // Verify import map
    const importMapScript = document.querySelector('script[type="importmap-shim"]')
    expect(importMapScript).not.toBeNull()
    const parsed = JSON.parse(importMapScript!.textContent!)
    expect(Object.keys(parsed.imports)).toHaveLength(6)
    expect(parsed.imports['@pro/table']).toContain('1.2.3')

    // Verify modulepreloads
    const preloadLinks = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(preloadLinks).toHaveLength(2)

    // Verify CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]')
    expect(cssLinks).toHaveLength(3)

    // Verify SRI integrity on preloads
    const hooksPreload = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"]',
    )
    expect(hooksPreload?.getAttribute('integrity')).toBe('sha384-hooksHash')

    // Verify SRI integrity on CSS
    const epCss = document.querySelector(
      'link[href="https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css"]',
    )
    expect(epCss?.getAttribute('integrity')).toBe('sha384-epCssHash')
  })

  it('maintains correct injection order: import map -> preloads -> CSS', () => {
    injectAll(FULL_IMPORT_MAP)

    const headChildren = Array.from(document.head.children)

    const importMapIdx = headChildren.findIndex(
      (el) => el.tagName === 'SCRIPT' && el.getAttribute('type') === 'importmap-shim',
    )
    const firstPreloadIdx = headChildren.findIndex(
      (el) => el.tagName === 'LINK' && el.getAttribute('rel') === 'modulepreload-shim',
    )
    const firstCssIdx = headChildren.findIndex(
      (el) => el.tagName === 'LINK' && el.getAttribute('rel') === 'stylesheet',
    )

    // Import map must come before preloads, preloads before CSS
    expect(importMapIdx).toBeLessThan(firstPreloadIdx)
    expect(firstPreloadIdx).toBeLessThan(firstCssIdx)
  })

  it('caches API response to localStorage after successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(FULL_IMPORT_MAP),
      }),
    )

    await resolveImportMap({
      appEntry: '/src/main.ts',
      appId: 'test',
      userId: 'user',
      apiBaseUrl: 'https://platform.internal/api/v1',
      cdnBaseUrl: 'https://cdn.internal',
      fetchTimeout: 5000,
    })

    const cached = JSON.parse(mockLocalStorage['pro:import-map'])
    expect(cached.imports['@pro/table']).toBe(FULL_IMPORT_MAP.imports['@pro/table'])
  })
})
