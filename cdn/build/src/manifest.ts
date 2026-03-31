import { calculateDirectorySriHashes, sriEntriesToMap } from './sri'
import type { CdnManifest } from './types'

/**
 * Generate a CDN manifest for a built package version.
 *
 * @param name       Package name, e.g. "@pro/table"
 * @param version    Semver version, e.g. "1.2.3"
 * @param versionDir Absolute path to the built version directory
 * @param cdnBaseUrl CDN base URL, e.g. "https://cdn.internal"
 */
export async function generateManifest(
  name: string,
  version: string,
  versionDir: string,
  cdnBaseUrl: string,
): Promise<CdnManifest> {
  const entries = await calculateDirectorySriHashes(versionDir, versionDir)
  const sriHashes = sriEntriesToMap(entries)

  const cdnPrefix = `${cdnBaseUrl}/${name}/${version}`

  const esmEntry = `${cdnPrefix}/esm/index.mjs`
  const umdEntry = `${cdnPrefix}/umd/index.min.js`

  const cssFile = entries.find((e) => e.path.endsWith('.css'))
  const cssEntry = cssFile ? `${cdnPrefix}/${cssFile.path}` : null

  // Convert local paths to CDN URLs in sriHashes
  const cdnSriHashes: Record<string, string> = {}
  for (const [path, hash] of Object.entries(sriHashes)) {
    cdnSriHashes[`${cdnPrefix}/${path}`] = hash
  }

  // ESM size = sum of all .mjs files
  const esmSize = entries.filter((e) => e.path.endsWith('.mjs')).reduce((sum, e) => sum + e.size, 0)

  // Preloads: all .mjs chunk files (not the entry)
  const preloads = entries
    .filter((e) => e.path.endsWith('.mjs') && e.path !== 'esm/index.mjs')
    .map((e) => `${cdnPrefix}/${e.path}`)

  return {
    name,
    version,
    esmEntry,
    umdEntry,
    cssEntry,
    sriHashes: cdnSriHashes,
    preloads,
    esmSize,
    builtAt: new Date().toISOString(),
  }
}

/**
 * Merge multiple package manifests into a combined import map response
 * matching the Platform API format (Section 6 of design spec).
 */
export function mergeManifestsToImportMap(manifests: CdnManifest[]): {
  imports: Record<string, string>
  preloads: string[]
  styles: string[]
  sriHashes: Record<string, string>
} {
  const imports: Record<string, string> = {}
  const preloads: string[] = []
  const styles: string[] = []
  const sriHashes: Record<string, string> = {}

  for (const manifest of manifests) {
    imports[manifest.name] = manifest.esmEntry
    preloads.push(...manifest.preloads)

    if (manifest.cssEntry) {
      styles.push(manifest.cssEntry)
    }

    Object.assign(sriHashes, manifest.sriHashes)
  }

  return { imports, preloads, styles, sriHashes }
}
