/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  injectImportMap,
  injectModulePreloads,
  injectStylesheets,
  injectAll,
  loadEsModuleShims,
  bootstrapApp,
} from '../src/inject'
import type { ImportMapResponse } from '../src/types'

const MOCK_IMPORT_MAP: ImportMapResponse = {
  imports: {
    '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
    vue: 'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
  },
  preloads: [
    'https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs',
    'https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs',
  ],
  styles: [
    'https://cdn.internal/vendor/element-plus/2.9.0/dist/index.css',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css',
  ],
  sriHashes: {
    'https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs': 'sha384-hookhash',
    'https://cdn.internal/@pro/table/1.2.3/style/index.css': 'sha384-csshash',
  },
  cache_bust: false,
}

describe('injectImportMap', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates a script[type="importmap-shim"] in document head', () => {
    injectImportMap(MOCK_IMPORT_MAP)

    const script = document.querySelector('script[type="importmap-shim"]')
    expect(script).not.toBeNull()

    const parsed = JSON.parse(script!.textContent!)
    expect(parsed.imports['@pro/table']).toBe('https://cdn.internal/@pro/table/1.2.3/esm/index.mjs')
    expect(parsed.imports.vue).toBe(
      'https://cdn.internal/vendor/vue/3.5.0/dist/vue.esm-browser.prod.js',
    )
  })
})

describe('injectModulePreloads', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates modulepreload-shim links for each preload URL', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    expect(links).toHaveLength(2)

    const hrefs = Array.from(links).map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs')
    expect(hrefs).toContain('https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs')
  })

  it('adds SRI integrity attribute when hash is available', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const hookLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs"]',
    )
    expect(hookLink?.getAttribute('integrity')).toBe('sha384-hookhash')
  })

  it('omits integrity when no hash available', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const utilsLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs"]',
    )
    expect(utilsLink?.getAttribute('integrity')).toBeNull()
  })

  it('sets crossorigin="anonymous" on all links', () => {
    injectModulePreloads(MOCK_IMPORT_MAP.preloads, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="modulepreload-shim"]')
    for (const link of links) {
      expect(link.getAttribute('crossorigin')).toBe('anonymous')
    }
  })
})

describe('injectStylesheets', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('creates stylesheet links for each CSS URL', () => {
    injectStylesheets(MOCK_IMPORT_MAP.styles, MOCK_IMPORT_MAP.sriHashes)

    const links = document.querySelectorAll('link[rel="stylesheet"]')
    expect(links).toHaveLength(2)
  })

  it('adds SRI integrity when hash available', () => {
    injectStylesheets(MOCK_IMPORT_MAP.styles, MOCK_IMPORT_MAP.sriHashes)

    const tableLink = document.querySelector(
      'link[href="https://cdn.internal/@pro/table/1.2.3/style/index.css"]',
    )
    expect(tableLink?.getAttribute('integrity')).toBe('sha384-csshash')
  })
})

describe('injectAll', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('injects import map, preloads, and styles in one call', () => {
    injectAll(MOCK_IMPORT_MAP)

    expect(document.querySelector('script[type="importmap-shim"]')).not.toBeNull()
    expect(document.querySelectorAll('link[rel="modulepreload-shim"]')).toHaveLength(2)
    expect(document.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(2)
  })
})

describe('loadEsModuleShims', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    window.importShim = undefined
  })

  it('resolves immediately if importShim already exists', async () => {
    window.importShim = vi.fn() as (specifier: string) => Promise<unknown>

    await expect(
      loadEsModuleShims('https://cdn.internal/es-module-shims.js'),
    ).resolves.toBeUndefined()

    // Should NOT add a new script tag
    expect(document.querySelector('script[src]')).toBeNull()
  })

  it('creates a script tag with the given URL', () => {
    // Don't await -- we're just checking DOM injection
    loadEsModuleShims('https://cdn.internal/es-module-shims.js').catch(() => {
      // expected: script never fires onload in test
    })

    const script = document.querySelector('script[src="https://cdn.internal/es-module-shims.js"]')
    expect(script).not.toBeNull()
    expect(script?.getAttribute('async')).toBe('')
  })
})

describe('bootstrapApp', () => {
  it('throws if importShim is not available', async () => {
    window.importShim = undefined

    await expect(bootstrapApp('/src/main.ts')).rejects.toThrow('importShim is not a function')
  })

  it('calls importShim with app entry', async () => {
    const mockImportShim = vi.fn().mockResolvedValue(undefined)
    window.importShim = mockImportShim

    await bootstrapApp('/src/main.ts')

    expect(mockImportShim).toHaveBeenCalledWith('/src/main.ts')
  })
})
