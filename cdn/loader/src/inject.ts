import type { ImportMapResponse } from './types'

/**
 * Inject import map into the document via es-module-shims.
 *
 * es-module-shims supports dynamically injected import maps
 * using <script type="importmap-shim"> or the shimMode API.
 * We use the shim type to avoid issues with browsers that don't
 * support multiple import maps.
 */
export function injectImportMap(importMap: ImportMapResponse): void {
  const script = document.createElement('script')
  script.type = 'importmap-shim'
  script.textContent = JSON.stringify({
    imports: importMap.imports,
  })
  document.head.appendChild(script)
}

/**
 * Inject <link rel="modulepreload-shim"> for shared dependencies.
 * These are loaded in parallel with the app entry, reducing waterfall.
 *
 * SRI integrity attributes are added when available.
 */
export function injectModulePreloads(preloads: string[], sriHashes: Record<string, string>): void {
  for (const url of preloads) {
    const link = document.createElement('link')
    link.rel = 'modulepreload-shim'
    link.href = url
    link.crossOrigin = 'anonymous'

    const hash = sriHashes[url]
    if (hash) {
      link.setAttribute('integrity', hash)
    }

    document.head.appendChild(link)
  }
}

/**
 * Inject CSS <link> tags for component styles.
 * Each link has crossorigin="anonymous" for CORS CDN resources.
 * SRI integrity attributes are added when available.
 */
export function injectStylesheets(styles: string[], sriHashes: Record<string, string>): void {
  for (const url of styles) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = 'anonymous'

    const hash = sriHashes[url]
    if (hash) {
      link.setAttribute('integrity', hash)
    }

    document.head.appendChild(link)
  }
}

/**
 * Load es-module-shims polyfill.
 * Returns a Promise that resolves when the script is loaded.
 */
export function loadEsModuleShims(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if (window.importShim) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.setAttribute('async', '')
    script.src = url
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error(`Failed to load es-module-shims from ${url}`))
    }
    document.head.appendChild(script)
  })
}

/**
 * Bootstrap the consumer application by importing its entry module.
 * Uses es-module-shims' importShim() for consistent behavior.
 */
export async function bootstrapApp(appEntry: string): Promise<void> {
  const importShim = window.importShim
  if (typeof importShim !== 'function') {
    throw new Error('[pro-loader] es-module-shims not loaded — importShim is not a function')
  }

  await importShim(appEntry)
}

/**
 * Inject all resources from an import map response in the correct order:
 * 1. Import map (specifier -> URL mapping)
 * 2. Modulepreload links (parallel dependency loading)
 * 3. CSS stylesheets
 */
export function injectAll(importMap: ImportMapResponse): void {
  injectImportMap(importMap)
  injectModulePreloads(importMap.preloads, importMap.sriHashes)
  injectStylesheets(importMap.styles, importMap.sriHashes)
}
