import { describe, it, expect } from 'vitest'
import {
  resolve,
  type VersionEntry,
  type VersionRegistry,
} from '../../src/engines/semver-resolver.js'
import {
  rangeIntersection,
  highestSatisfying,
  isPrerelease,
} from '../../src/utils/semver-helpers.js'

function createRegistry(entries: VersionEntry[]): VersionRegistry {
  return {
    getVersions(packageName: string): VersionEntry[] {
      return entries.filter((e) => e.name === packageName)
    },
    getVersion(packageName: string, version: string): VersionEntry | undefined {
      return entries.find((e) => e.name === packageName && e.version === version)
    },
  }
}

// ============================================================
// semver-helpers unit tests
// ============================================================
describe('semver-helpers', () => {
  describe('rangeIntersection', () => {
    it('returns versions satisfying both ranges', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0']
      const result = rangeIntersection('^1.0.0', '>=1.1.0', versions)
      expect(result).toEqual(['1.1.0', '1.2.0'])
    })

    it('returns empty array for incompatible ranges', () => {
      const versions = ['1.0.0', '2.0.0', '3.0.0']
      const result = rangeIntersection('^1.0.0', '^3.0.0', versions)
      expect(result).toEqual([])
    })

    it('returns empty array for invalid ranges', () => {
      const result = rangeIntersection('not-a-range', '^1.0.0', ['1.0.0'])
      expect(result).toEqual([])
    })

    it('handles exact version ranges', () => {
      const versions = ['1.0.0', '1.0.1', '1.1.0']
      const result = rangeIntersection('1.0.0', '>=1.0.0', versions)
      expect(result).toEqual(['1.0.0'])
    })
  })

  describe('highestSatisfying', () => {
    it('returns the highest version satisfying the range', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0']
      expect(highestSatisfying('^1.0.0', versions)).toBe('1.2.0')
    })

    it('returns null when no version satisfies', () => {
      const versions = ['1.0.0', '1.1.0']
      expect(highestSatisfying('^2.0.0', versions)).toBeNull()
    })

    it('handles empty version list', () => {
      expect(highestSatisfying('^1.0.0', [])).toBeNull()
    })

    it('filters invalid version strings', () => {
      const versions = ['1.0.0', 'not-valid', '1.1.0']
      expect(highestSatisfying('^1.0.0', versions)).toBe('1.1.0')
    })
  })

  describe('isPrerelease', () => {
    it('detects prerelease versions', () => {
      expect(isPrerelease('2.0.0-beta.1')).toBe(true)
      expect(isPrerelease('1.0.0-alpha')).toBe(true)
      expect(isPrerelease('1.0.0-rc.1')).toBe(true)
    })

    it('returns false for stable versions', () => {
      expect(isPrerelease('1.0.0')).toBe(false)
      expect(isPrerelease('2.3.4')).toBe(false)
    })

    it('returns false for invalid versions', () => {
      expect(isPrerelease('not-a-version')).toBe(false)
    })
  })
})

// ============================================================
// semver-resolver engine tests
// ============================================================
describe('semver-resolver', () => {
  const ENTRIES: VersionEntry[] = [
    {
      name: '@pro/table',
      version: '1.2.3',
      dependencies: { '@pro/hooks': '^1.2.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    {
      name: '@pro/table',
      version: '1.2.2',
      dependencies: { '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    {
      name: '@pro/table',
      version: '2.0.0-beta.1',
      dependencies: { '@pro/hooks': '^2.0.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.5.0', 'element-plus': '>=2.10.0' },
    },
    {
      name: '@pro/form',
      version: '1.1.2',
      dependencies: { '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0', 'element-plus': '>=2.9.0' },
    },
    {
      name: '@pro/hooks',
      version: '1.2.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0' },
    },
    {
      name: '@pro/hooks',
      version: '1.1.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.4.0' },
    },
    {
      name: '@pro/hooks',
      version: '2.0.0',
      dependencies: { '@pro/utils': '^1.0.0' },
      peerDependencies: { vue: '>=3.5.0' },
    },
    {
      name: '@pro/utils',
      version: '1.0.3',
      dependencies: {},
      peerDependencies: {},
    },
    {
      name: '@pro/utils',
      version: '1.0.0',
      dependencies: {},
      peerDependencies: {},
    },
  ]

  const registry = createRegistry(ENTRIES)

  describe('basic resolution', () => {
    it('resolves a pinned version exactly', () => {
      const result = resolve([{ name: '@pro/table', pinnedVersion: '1.2.3' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
      expect(result.conflicts).toHaveLength(0)
    })

    it('resolves a version range to the highest satisfying version', () => {
      const result = resolve([{ name: '@pro/table', versionRange: '^1.2.0' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    })

    it('resolves to latest stable when no constraint provided', () => {
      const result = resolve([{ name: '@pro/table' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
    })

    it('returns empty resolution for nonexistent package', () => {
      const result = resolve([{ name: '@pro/nonexistent', versionRange: '^1.0.0' }], registry)
      expect(result.resolved.size).toBe(0)
      expect(result.tree).toHaveLength(0)
    })

    it('returns empty for pinned version that does not exist', () => {
      const result = resolve([{ name: '@pro/table', pinnedVersion: '9.9.9' }], registry)
      expect(result.resolved.has('@pro/table')).toBe(false)
    })
  })

  describe('dependency tree expansion', () => {
    it('recursively resolves dependencies', () => {
      const result = resolve([{ name: '@pro/table', pinnedVersion: '1.2.3' }], registry)
      expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
    })

    it('builds correct tree structure', () => {
      const result = resolve([{ name: '@pro/table', pinnedVersion: '1.2.3' }], registry)
      expect(result.tree).toHaveLength(1)
      const root = result.tree[0]
      expect(root.name).toBe('@pro/table')
      expect(root.version).toBe('1.2.3')
      expect(root.dependencies).toHaveLength(2)
    })

    it('deduplicates shared dependencies', () => {
      const result = resolve(
        [
          { name: '@pro/table', pinnedVersion: '1.2.3' },
          { name: '@pro/form', pinnedVersion: '1.1.2' },
        ],
        registry,
      )
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
      expect(result.resolved.get('@pro/hooks')).toBe('1.2.0')
    })
  })

  describe('diamond dependency detection', () => {
    it('detects no conflict when ranges are compatible', () => {
      const result = resolve(
        [
          { name: '@pro/table', pinnedVersion: '1.2.3' },
          { name: '@pro/form', pinnedVersion: '1.1.2' },
        ],
        registry,
      )
      expect(result.conflicts).toHaveLength(0)
    })

    it('detects diamond conflict with incompatible ranges', () => {
      const conflictEntries: VersionEntry[] = [
        {
          name: 'app-a',
          version: '1.0.0',
          dependencies: { 'shared-dep': '^2.0.0' },
          peerDependencies: {},
        },
        {
          name: 'app-b',
          version: '1.0.0',
          dependencies: { 'shared-dep': '^1.0.0 <2.0.0' },
          peerDependencies: {},
        },
        {
          name: 'shared-dep',
          version: '1.0.0',
          dependencies: {},
          peerDependencies: {},
        },
        {
          name: 'shared-dep',
          version: '2.0.0',
          dependencies: {},
          peerDependencies: {},
        },
      ]
      const conflictRegistry = createRegistry(conflictEntries)

      const result = resolve(
        [
          { name: 'app-a', pinnedVersion: '1.0.0' },
          { name: 'app-b', pinnedVersion: '1.0.0' },
        ],
        conflictRegistry,
      )

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].dependency).toBe('shared-dep')
      expect(result.conflicts[0].required).toHaveProperty('app-a@1.0.0', '^2.0.0')
      expect(result.conflicts[0].required).toHaveProperty('app-b@1.0.0', '^1.0.0 <2.0.0')
      expect(result.conflicts[0].suggestion).toContain('Conflict')
    })
  })

  describe('prerelease handling', () => {
    it('does not pick prerelease as latest when no constraint', () => {
      const result = resolve([{ name: '@pro/table' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('1.2.3')
      expect(isPrerelease(result.resolved.get('@pro/table')!)).toBe(false)
    })

    it('resolves prerelease when explicitly pinned', () => {
      const result = resolve([{ name: '@pro/table', pinnedVersion: '2.0.0-beta.1' }], registry)
      expect(result.resolved.get('@pro/table')).toBe('2.0.0-beta.1')
    })
  })

  describe('edge cases', () => {
    it('handles empty requests', () => {
      const result = resolve([], registry)
      expect(result.resolved.size).toBe(0)
      expect(result.tree).toHaveLength(0)
      expect(result.conflicts).toHaveLength(0)
    })

    it('handles package with no dependencies', () => {
      const result = resolve([{ name: '@pro/utils', pinnedVersion: '1.0.3' }], registry)
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
      expect(result.tree[0].dependencies).toHaveLength(0)
    })

    it('handles circular-safe dedup (same package requested twice)', () => {
      const result = resolve(
        [
          { name: '@pro/utils', pinnedVersion: '1.0.3' },
          { name: '@pro/utils', versionRange: '^1.0.0' },
        ],
        registry,
      )
      expect(result.resolved.get('@pro/utils')).toBe('1.0.3')
    })
  })

  describe('edge cases — extended', () => {
    it('handles pre-release versions', () => {
      expect(highestSatisfying('^1.0.0', ['1.0.0', '1.1.0-beta.1', '1.1.0'])).toBe('1.1.0')
    })

    it('handles build metadata (ignored in comparison)', () => {
      // Build metadata is ignored in precedence — both are equal to 1.0.0
      const result = highestSatisfying('1.0.0', ['1.0.0+build.1', '1.0.0+build.2'])
      expect(result).toMatch(/^1\.0\.0\+build\.\d$/)
    })

    it('handles complex OR ranges', () => {
      expect(highestSatisfying('>=1.2.0 <2.0.0 || >=3.0.0', ['1.3.0', '2.5.0', '3.1.0'])).toBe(
        '3.1.0',
      )
    })

    it('handles hyphen ranges', () => {
      expect(highestSatisfying('1.0.0 - 2.0.0', ['0.9.0', '1.5.0', '2.0.0', '2.1.0'])).toBe('2.0.0')
    })

    it('returns null for empty intersection in diamond dependency', () => {
      const conflictEntries: VersionEntry[] = [
        {
          name: 'pkg-a',
          version: '1.0.0',
          dependencies: { 'element-plus': '>=2.2.0 <2.4.0' },
          peerDependencies: {},
        },
        {
          name: 'pkg-b',
          version: '1.0.0',
          dependencies: { 'element-plus': '^2.4.0' },
          peerDependencies: {},
        },
        { name: 'element-plus', version: '2.2.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.3.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.4.0', dependencies: {}, peerDependencies: {} },
        { name: 'element-plus', version: '2.5.0', dependencies: {}, peerDependencies: {} },
      ]
      const conflictRegistry = createRegistry(conflictEntries)

      const result = resolve(
        [
          { name: 'pkg-a', pinnedVersion: '1.0.0' },
          { name: 'pkg-b', pinnedVersion: '1.0.0' },
        ],
        conflictRegistry,
      )

      expect(result.conflicts.length).toBeGreaterThan(0)
      const epConflict = result.conflicts.find((c) => c.dependency === 'element-plus')
      expect(epConflict).toBeDefined()
      expect(epConflict!.required).toHaveProperty('pkg-a@1.0.0', '>=2.2.0 <2.4.0')
      expect(epConflict!.required).toHaveProperty('pkg-b@1.0.0', '^2.4.0')
      expect(epConflict!.suggestion).toContain('Conflict')
    })

    it('handles tilde ranges', () => {
      expect(highestSatisfying('~1.2.3', ['1.2.2', '1.2.5', '1.3.0'])).toBe('1.2.5')
    })
  })
})
