import { describe, it, expect } from 'vitest'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { generateManifest, mergeManifestsToImportMap } from '../src/manifest'
import type { CdnManifest } from '../src/types'

const TEST_DIR = resolve(tmpdir(), 'pro-manifest-test')

describe('generateManifest', () => {
  it('generates manifest with correct CDN URLs and SRI hashes', async () => {
    const versionDir = resolve(TEST_DIR, 'gen-manifest')
    await mkdir(resolve(versionDir, 'esm'), { recursive: true })
    await mkdir(resolve(versionDir, 'umd'), { recursive: true })
    await mkdir(resolve(versionDir, 'style'), { recursive: true })

    await writeFile(resolve(versionDir, 'esm/index.mjs'), 'export const ProTable = {}')
    await writeFile(resolve(versionDir, 'umd/index.min.js'), '!function(){}()')
    await writeFile(resolve(versionDir, 'style/index.css'), '.pro-table{}')

    const manifest = await generateManifest(
      '@pro/table',
      '1.2.3',
      versionDir,
      'https://cdn.internal',
    )

    expect(manifest.name).toBe('@pro/table')
    expect(manifest.version).toBe('1.2.3')
    expect(manifest.esmEntry).toBe('https://cdn.internal/@pro/table/1.2.3/esm/index.mjs')
    expect(manifest.umdEntry).toBe('https://cdn.internal/@pro/table/1.2.3/umd/index.min.js')
    expect(manifest.cssEntry).toBe('https://cdn.internal/@pro/table/1.2.3/style/index.css')

    // SRI hashes use full CDN URLs as keys
    const sriKeys = Object.keys(manifest.sriHashes)
    expect(sriKeys).toContain('https://cdn.internal/@pro/table/1.2.3/esm/index.mjs')
    expect(sriKeys).toContain('https://cdn.internal/@pro/table/1.2.3/style/index.css')

    // All hash values are sha384-prefixed
    for (const hash of Object.values(manifest.sriHashes)) {
      expect(hash).toMatch(/^sha384-/)
    }

    expect(manifest.esmSize).toBeGreaterThan(0)
    expect(manifest.builtAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it('sets cssEntry to null when no CSS exists', async () => {
    const versionDir = resolve(TEST_DIR, 'no-css')
    await mkdir(resolve(versionDir, 'esm'), { recursive: true })
    await writeFile(resolve(versionDir, 'esm/index.mjs'), 'export const x = 1')

    const manifest = await generateManifest(
      '@pro/utils',
      '1.0.0',
      versionDir,
      'https://cdn.internal',
    )

    expect(manifest.cssEntry).toBeNull()

    await rm(TEST_DIR, { recursive: true, force: true })
  })
})

describe('mergeManifestsToImportMap', () => {
  it('merges multiple manifests into import map format', () => {
    const manifests: CdnManifest[] = [
      {
        name: '@pro/table',
        version: '1.2.3',
        esmEntry: 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/table/1.2.3/umd/index.min.js',
        cssEntry: 'https://cdn.internal/@pro/table/1.2.3/style/index.css',
        sriHashes: {
          'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-aaa',
        },
        preloads: ['https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs'],
        esmSize: 5000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
      {
        name: '@pro/form',
        version: '1.1.0',
        esmEntry: 'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/form/1.1.0/umd/index.min.js',
        cssEntry: 'https://cdn.internal/@pro/form/1.1.0/style/index.css',
        sriHashes: {
          'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs': 'sha384-bbb',
        },
        preloads: [],
        esmSize: 3000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const result = mergeManifestsToImportMap(manifests)

    expect(result.imports).toEqual({
      '@pro/table': 'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs',
      '@pro/form': 'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs',
    })

    expect(result.styles).toEqual([
      'https://cdn.internal/@pro/table/1.2.3/style/index.css',
      'https://cdn.internal/@pro/form/1.1.0/style/index.css',
    ])

    expect(result.preloads).toEqual(['https://cdn.internal/@pro/hooks/1.0.0/esm/index.mjs'])

    expect(result.sriHashes).toEqual({
      'https://cdn.internal/@pro/table/1.2.3/esm/index.mjs': 'sha384-aaa',
      'https://cdn.internal/@pro/form/1.1.0/esm/index.mjs': 'sha384-bbb',
    })
  })

  it('handles manifests with no CSS', () => {
    const manifests: CdnManifest[] = [
      {
        name: '@pro/utils',
        version: '1.0.0',
        esmEntry: 'https://cdn.internal/@pro/utils/1.0.0/esm/index.mjs',
        umdEntry: 'https://cdn.internal/@pro/utils/1.0.0/umd/index.min.js',
        cssEntry: null,
        sriHashes: {},
        preloads: [],
        esmSize: 1000,
        builtAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const result = mergeManifestsToImportMap(manifests)
    expect(result.styles).toEqual([])
  })
})
