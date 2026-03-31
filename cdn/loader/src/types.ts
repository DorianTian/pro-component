/**
 * Import Map API response from Platform server.
 * Matches the format defined in design spec Section 6.
 */
export interface ImportMapResponse {
  /** Import map specifier -> URL mapping */
  imports: Record<string, string>
  /** URLs to modulepreload (shared dependencies) */
  preloads: string[]
  /** CSS stylesheet URLs to inject */
  styles: string[]
  /** SRI hashes: URL -> "sha384-<base64>" */
  sriHashes: Record<string, string>
  /** When true, loader must clear SW cache (rollback scenario) */
  cache_bust: boolean
}

/** Parsed attributes from the loader script tag */
export interface LoaderConfig {
  /** Consumer app entry point, e.g. "/src/main.ts" */
  appEntry: string
  /** App ID for import map resolution */
  appId: string
  /** User ID for grayscale matching */
  userId: string
  /** Platform API base URL */
  apiBaseUrl: string
  /** CDN base URL for es-module-shims */
  cdnBaseUrl: string
  /** Import map API fetch timeout in ms */
  fetchTimeout: number
}

/** Fallback source identifier for diagnostics */
export type FallbackSource = 'api' | 'sw-cache' | 'localstorage' | 'hardcoded' | 'error-page'

/**
 * Augment the global Window interface for loader globals.
 * This eliminates all `(window as any)` casts in loader code.
 */
declare global {
  interface Window {
    __PRO_IMPORT_MAP__?: ImportMapResponse
    __PRO_LOADER_CONFIG__?: LoaderConfig
    __PRO_SW_REGISTRATION__?: ServiceWorkerRegistration
    __PRO_USER_ID__?: string
    importShim?: (specifier: string) => Promise<unknown>
  }
}

export {}
