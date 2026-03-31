import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import {
  calculateSriHash,
  calculateSriHashFromBuffer,
  calculateDirectorySriHashes,
  sriEntriesToMap,
} from '../src/sri'

const TEST_DIR = resolve(tmpdir(), 'pro-sri-test')

describe('calculateSriHashFromBuffer', () => {
  it('returns sha384 prefixed base64 hash', () => {
    const content = Buffer.from('console.log("hello")')
    const result = calculateSriHashFromBuffer(content)

    expect(result).toMatch(/^sha384-[A-Za-z0-9+/]+=*$/)

    // Verify against Node crypto directly
    const expected = createHash('sha384').update(content).digest('base64')
    expect(result).toBe(`sha384-${expected}`)
  })

  it('produces different hashes for different content', () => {
    const a = calculateSriHashFromBuffer(Buffer.from('file-a'))
    const b = calculateSriHashFromBuffer(Buffer.from('file-b'))
    expect(a).not.toBe(b)
  })

  it('produces identical hash for identical content', () => {
    const content = Buffer.from('identical-content-here')
    const hash1 = calculateSriHashFromBuffer(content)
    const hash2 = calculateSriHashFromBuffer(content)
    expect(hash1).toBe(hash2)
  })
})

describe('calculateSriHash (file-based)', () => {
  it('calculates hash from file path', async () => {
    await mkdir(TEST_DIR, { recursive: true })
    const filePath = resolve(TEST_DIR, 'test.mjs')
    const content = 'export const x = 42'
    await writeFile(filePath, content)

    const hash = await calculateSriHash(filePath)
    const expected = createHash('sha384').update(Buffer.from(content)).digest('base64')

    expect(hash).toBe(`sha384-${expected}`)
    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('calculateDirectorySriHashes', () => {
  it('calculates hashes for .mjs, .js, and .css files only', async () => {
    const dir = resolve(TEST_DIR, 'dist')
    await mkdir(resolve(dir, 'esm'), { recursive: true })
    await mkdir(resolve(dir, 'style'), { recursive: true })

    await writeFile(resolve(dir, 'esm/index.mjs'), 'export default {}')
    await writeFile(resolve(dir, 'style/index.css'), '.pro-table { width: 100% }')
    await writeFile(resolve(dir, 'README.md'), '# ignore this')
    await writeFile(resolve(dir, 'esm/index.d.ts'), 'declare const x: number')

    const entries = await calculateDirectorySriHashes(dir, dir)

    expect(entries).toHaveLength(2)
    expect(entries.map((e) => e.path).sort()).toEqual(['esm/index.mjs', 'style/index.css'])

    for (const entry of entries) {
      expect(entry.hash).toMatch(/^sha384-/)
      expect(entry.size).toBeGreaterThan(0)
    }

    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it('returns sorted entries', async () => {
    const dir = resolve(TEST_DIR, 'sorted')
    await mkdir(dir, { recursive: true })
    await writeFile(resolve(dir, 'z.mjs'), 'z')
    await writeFile(resolve(dir, 'a.mjs'), 'a')
    await writeFile(resolve(dir, 'm.js'), 'm')

    const entries = await calculateDirectorySriHashes(dir, dir)
    const paths = entries.map((e) => e.path)

    expect(paths).toEqual(['a.mjs', 'm.js', 'z.mjs'])

    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('sriEntriesToMap', () => {
  it('converts entries array to path->hash map', () => {
    const entries = [
      { path: 'esm/index.mjs', hash: 'sha384-abc', size: 100 },
      { path: 'style/index.css', hash: 'sha384-def', size: 50 },
    ]

    const map = sriEntriesToMap(entries)

    expect(map).toEqual({
      'esm/index.mjs': 'sha384-abc',
      'style/index.css': 'sha384-def',
    })
  })
})
