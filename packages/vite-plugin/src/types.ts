/**
 * Configuration options for @pro/vite-plugin.
 */
export interface ProVitePluginOptions {
  /**
   * Extra packages to exclude from Vite's optimizeDeps pre-bundling.
   * Vue, Element Plus, and all @pro/* packages are always excluded.
   * @default []
   */
  extraExclude?: string[]

  /**
   * Whether to inject development-mode warnings for module boundary issues.
   * When true, adds runtime checks that warn if Vue/Element Plus are
   * loaded from unexpected paths (indicating a module boundary mismatch).
   * @default true in dev mode
   */
  devWarnings?: boolean

  /**
   * CDN base URL for production mode configuration hints.
   * Used only for logging/diagnostics, does not affect build.
   * @default "https://cdn.internal"
   */
  cdnBaseUrl?: string
}
