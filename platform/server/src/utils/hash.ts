import { createHash } from 'node:crypto'

/**
 * Deterministic hash-to-percentage mapping.
 * Given a string key, returns a number 0-99 (inclusive).
 *
 * Uses SHA-256 for uniform distribution. Takes the first 4 bytes as a uint32
 * and mods by 100.
 *
 * Why not Math.random(): percentage-based grayscale must be deterministic —
 * the same user must consistently see the same version across requests.
 */
export function hashToPercentage(key: string): number {
  const hash = createHash('sha256').update(key).digest()
  const uint32 = hash.readUInt32BE(0)
  return uint32 % 100
}
