import { describe, it, expect } from 'vitest'
import {
  resolve,
  type VersionEntry,
  type VersionRegistry,
} from '../../src/engines/semver-resolver.js'
import { evaluateRule } from '../../src/engines/grayscale-evaluator.js'
import type { GrayscaleCondition, GrayscaleContext } from '../../src/types/grayscale.js'
import { isPrerelease } from '../../src/utils/semver-helpers.js'

/**
 * Contract tests verify the interaction between the semver resolver
 * and the grayscale evaluator in the import map generation pipeline.
 */

function createRegistry(entries: VersionEntry[]): VersionRegistry {
  return {
    getVersions(name: string) {
      return entries.filter((e) => e.name === name)
    },
    getVersion(name: string, version: string) {
      return entries.find((e) => e.name === name && e.version === version)
    },
  }
}

describe('Contract: Resolver x Grayscale Engine', () => {
  const ENTRIES: VersionEntry[] = [
    {
      name: '@pro/table',
      version: '1.2.3',
      dependencies: { '@pro/hooks': '^1.2.0' },
      peerDependencies: {},
    },
    {
      name: '@pro/form',
      version: '1.1.2',
      dependencies: { '@pro/hooks': '^1.1.0' },
      peerDependencies: {},
    },
    {
      name: '@pro/hooks',
      version: '1.2.0',
      dependencies: {},
      peerDependencies: {},
    },
    {
      name: '@pro/hooks',
      version: '1.1.0',
      dependencies: {},
      peerDependencies: {},
    },
    {
      name: '@pro/table',
      version: '2.0.0-beta.1',
      dependencies: { '@pro/hooks': '^2.0.0' },
      peerDependencies: {},
    },
    {
      name: '@pro/hooks',
      version: '2.0.0',
      dependencies: {},
      peerDependencies: {},
    },
  ]

  const registry = createRegistry(ENTRIES)

  it('grayscale target version is correctly identified as prerelease by resolver', () => {
    const grayscaleTarget = '2.0.0-beta.1'
    expect(isPrerelease(grayscaleTarget)).toBe(true)

    const result = resolve([{ name: '@pro/table', pinnedVersion: grayscaleTarget }], registry)
    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
  })

  it('grayscale-triggered canary version pulls correct dependency tree', () => {
    const result = resolve([{ name: '@pro/table', pinnedVersion: '2.0.0-beta.1' }], registry)

    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
    expect(result.conflicts).toHaveLength(0)
  })

  it('multi-package grayscale: canary table + stable form causes dependency conflict', () => {
    const result = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )

    expect(result.conflicts.length).toBeGreaterThan(0)
    const hooksConflict = result.conflicts.find((c) => c.dependency === '@pro/hooks')
    expect(hooksConflict).toBeDefined()
  })

  it('multi-package grayscale: canary table + canary form (both need hooks ^2.0.0) works', () => {
    const extendedEntries: VersionEntry[] = [
      ...ENTRIES,
      {
        name: '@pro/form',
        version: '2.0.0-beta.1',
        dependencies: { '@pro/hooks': '^2.0.0' },
        peerDependencies: {},
      },
    ]
    const extendedRegistry = createRegistry(extendedEntries)

    const result = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '2.0.0-beta.1' },
      ],
      extendedRegistry,
    )

    expect(result.conflicts).toHaveLength(0)
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
  })

  it('grayscale rule change invalidates cache scenario (simulated)', () => {
    const stableResult = resolve(
      [
        { name: '@pro/table', versionRange: '^1.0.0' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )
    const stableVersion = stableResult.resolved.get('@pro/table')

    const canaryResult = resolve(
      [
        { name: '@pro/table', pinnedVersion: '2.0.0-beta.1' },
        { name: '@pro/form', pinnedVersion: '1.1.2' },
      ],
      registry,
    )
    const canaryVersion = canaryResult.resolved.get('@pro/table')

    expect(stableVersion).not.toBe(canaryVersion)
    expect(stableVersion).toBe('1.2.3')
    expect(canaryVersion).toBe('2.0.0-beta.1')
  })

  it('end-to-end: grayscale evaluate -> resolver pipeline', () => {
    const userListRule: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-canary-1', 'uid-canary-2'],
    }

    const context: GrayscaleContext = { userId: 'uid-canary-1' }
    const isCanary = evaluateRule(userListRule, context)
    expect(isCanary).toBe(true)

    const requests = [
      {
        name: '@pro/table',
        ...(isCanary ? { pinnedVersion: '2.0.0-beta.1' } : { versionRange: '^1.0.0' }),
      },
    ]

    const result = resolve(requests, registry)
    expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    expect(result.resolved.get('@pro/hooks')).toBe('2.0.0')
  })

  it('end-to-end: non-canary user gets stable version', () => {
    const userListRule: GrayscaleCondition = {
      type: 'user_list',
      values: ['uid-canary-1'],
    }

    const context: GrayscaleContext = { userId: 'uid-regular-user' }
    const isCanary = evaluateRule(userListRule, context)
    expect(isCanary).toBe(false)

    const requests = [
      {
        name: '@pro/table',
        ...(isCanary ? { pinnedVersion: '2.0.0-beta.1' } : { versionRange: '^1.0.0' }),
      },
    ]

    const result = resolve(requests, registry)
    expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
  })
})
