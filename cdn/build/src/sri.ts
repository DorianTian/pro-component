import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { relative } from 'node:path'
import { glob } from 'glob'
import type { SriEntry } from './types'

/**
 * Calculate SHA-384 SRI hash for a single file.
 * Returns the hash in standard SRI format: "sha384-<base64>"
 */
export async function calculateSriHash(filePath: string): Promise<string> {
  const content = await readFile(filePath)
  const hash = createHash('sha384').update(content).digest('base64')
  return `sha384-${hash}`
}

/**
 * Calculate SRI hash from a Buffer (used in tests or streaming).
 */
export function calculateSriHashFromBuffer(buffer: Buffer): string {
  const hash = createHash('sha384').update(buffer).digest('base64')
  return `sha384-${hash}`
}

/**
 * Calculate SRI hashes for all distributable files in a directory.
 * Only processes .mjs, .js, and .css files.
 */
export async function calculateDirectorySriHashes(
  dir: string,
  baseDir: string,
): Promise<SriEntry[]> {
  const pattern = '**/*.{mjs,js,css}'
  const files = await glob(pattern, { cwd: dir, absolute: true })

  const entries: SriEntry[] = []

  for (const filePath of files) {
    const content = await readFile(filePath)
    const hash = createHash('sha384').update(content).digest('base64')
    const relativePath = relative(baseDir, filePath)

    entries.push({
      path: relativePath,
      hash: `sha384-${hash}`,
      size: content.byteLength,
    })
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Build an SRI hash map from entries: { "path": "sha384-xxx" }
 */
export function sriEntriesToMap(entries: SriEntry[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const entry of entries) {
    map[entry.path] = entry.hash
  }
  return map
}
