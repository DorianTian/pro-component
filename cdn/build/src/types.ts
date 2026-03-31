/** Per-file SRI hash entry */
export interface SriEntry {
  /** Relative path from CDN root, e.g. "@pro/table/1.2.3/esm/index.mjs" */
  path: string
  /** SHA-384 hash in SRI format: "sha384-<base64>" */
  hash: string
  /** File size in bytes */
  size: number
}

/** CDN manifest for a single package version */
export interface CdnManifest {
  /** Package name, e.g. "@pro/table" */
  name: string
  /** Exact semver version */
  version: string
  /** ESM entry relative to CDN root */
  esmEntry: string
  /** UMD entry relative to CDN root (minified) */
  umdEntry: string
  /** CSS file relative to CDN root */
  cssEntry: string | null
  /** SRI hashes for all files */
  sriHashes: Record<string, string>
  /** Files to modulepreload (dependencies) */
  preloads: string[]
  /** Total bundle size in bytes (ESM) */
  esmSize: number
  /** Build timestamp ISO 8601 */
  builtAt: string
}

/** Rollup CDN build options */
export interface CdnBuildOptions {
  /** Absolute path to packages/ directory */
  packagesDir: string
  /** Absolute path to CDN output directory */
  outputDir: string
  /** CDN base URL, e.g. "https://cdn.internal" */
  cdnBaseUrl: string
  /** Packages to build (default: all) */
  packages?: string[]
}
