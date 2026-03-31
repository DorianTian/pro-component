import semver from 'semver'
import { highestSatisfying, isPrerelease } from '../utils/semver-helpers.js'
import type { DependencyNode, DiamondConflict } from '../types/api.js'

/**
 * A version entry as stored in the registry.
 * Provided by the caller (from DB query).
 */
export interface VersionEntry {
  name: string
  version: string
  dependencies: Record<string, string>
  peerDependencies: Record<string, string>
}

/**
 * A registry providing version lookup.
 * Abstracted so the engine has zero I/O — pure function.
 */
export interface VersionRegistry {
  getVersions(packageName: string): VersionEntry[]
  getVersion(packageName: string, version: string): VersionEntry | undefined
}

export interface ResolveResult {
  resolved: Map<string, string>
  tree: DependencyNode[]
  conflicts: DiamondConflict[]
}

interface ResolveState {
  resolved: Map<string, string>
  rangeCollector: Map<string, Map<string, string>>
  visited: Set<string>
}

/**
 * Resolve a set of requested packages to exact versions.
 *
 * Algorithm:
 * 1. Start with the requested packages and their pinned versions or ranges
 * 2. Recursively expand dependencies
 * 3. Deduplicate: when the same package appears multiple times, compute range intersection
 * 4. Detect diamond conflicts: when range intersection is empty
 */
export function resolve(
  requests: Array<{ name: string; pinnedVersion?: string; versionRange?: string }>,
  registry: VersionRegistry,
): ResolveResult {
  const state: ResolveState = {
    resolved: new Map<string, string>(),
    rangeCollector: new Map<string, Map<string, string>>(),
    visited: new Set<string>(),
  }

  const tree = resolveTopLevel(requests, registry, state)
  const conflicts = detectDiamondConflicts(state.rangeCollector, registry, state.resolved)

  return { resolved: state.resolved, tree, conflicts }
}

/** Step 1: Resolve top-level requests and recursively expand dependencies. */
function resolveTopLevel(
  requests: Array<{ name: string; pinnedVersion?: string; versionRange?: string }>,
  registry: VersionRegistry,
  state: ResolveState,
): DependencyNode[] {
  const tree: DependencyNode[] = []

  for (const req of requests) {
    const resolvedVersion = resolveRequest(req, registry)

    if (resolvedVersion) {
      const node = expandDependencies(req.name, resolvedVersion, registry, state)
      tree.push(node)
    }
  }

  return tree
}

/** Resolve a single top-level request to an exact version string. */
function resolveRequest(
  req: { name: string; pinnedVersion?: string; versionRange?: string },
  registry: VersionRegistry,
): string | null {
  const versions = registry.getVersions(req.name)
  const availableVersionStrings = versions.map((v) => v.version)

  if (req.pinnedVersion) {
    return versions.some((v) => v.version === req.pinnedVersion) ? req.pinnedVersion : null
  }

  if (req.versionRange) {
    return highestSatisfying(req.versionRange, availableVersionStrings)
  }

  // No constraint: use latest stable
  const sorted = availableVersionStrings.filter((v) => !isPrerelease(v)).sort(semver.rcompare)
  return sorted[0] || null
}

/** Recursively expand a package's dependencies. */
function expandDependencies(
  name: string,
  version: string,
  registry: VersionRegistry,
  state: ResolveState,
): DependencyNode {
  const dedupKey = `${name}@${version}`
  const node: DependencyNode = { name, version, dependencies: [] }

  if (state.visited.has(dedupKey)) {
    return node
  }
  state.visited.add(dedupKey)
  state.resolved.set(name, version)

  const entry = registry.getVersion(name, version)
  if (!entry) {
    return node
  }

  for (const [depName, depRange] of Object.entries(entry.dependencies)) {
    collectRange(state.rangeCollector, depName, `${name}@${version}`, depRange)

    const existingVersion = state.resolved.get(depName)
    if (existingVersion && semver.satisfies(existingVersion, depRange)) {
      node.dependencies.push({ name: depName, version: existingVersion, dependencies: [] })
      continue
    }

    const depVersions = registry.getVersions(depName).map((v) => v.version)
    const resolvedVersion = highestSatisfying(depRange, depVersions)
    if (resolvedVersion) {
      const childNode = expandDependencies(depName, resolvedVersion, registry, state)
      node.dependencies.push(childNode)
    }
  }

  return node
}

/** Collect a range requirement for diamond conflict detection. */
function collectRange(
  rangeCollector: Map<string, Map<string, string>>,
  depName: string,
  requester: string,
  range: string,
): void {
  if (!rangeCollector.has(depName)) {
    rangeCollector.set(depName, new Map())
  }
  rangeCollector.get(depName)!.set(requester, range)
}

/** Step 2: Detect diamond conflicts where no version satisfies all requesters. */
function detectDiamondConflicts(
  rangeCollector: Map<string, Map<string, string>>,
  registry: VersionRegistry,
  resolved: Map<string, string>,
): DiamondConflict[] {
  const conflicts: DiamondConflict[] = []

  for (const [depName, requesters] of rangeCollector.entries()) {
    if (requesters.size <= 1) continue

    const ranges = Array.from(requesters.values())
    const allVersions = registry.getVersions(depName).map((v) => v.version)

    let satisfyingVersions = allVersions
    for (const range of ranges) {
      satisfyingVersions = satisfyingVersions.filter((v) => semver.satisfies(v, range))
    }

    if (satisfyingVersions.length === 0) {
      const required: Record<string, string> = {}
      for (const [requester, range] of requesters.entries()) {
        required[requester] = range
      }

      conflicts.push({
        dependency: depName,
        required,
        suggestion: generateConflictSuggestion(depName, required),
      })
    } else {
      const best = satisfyingVersions.sort(semver.rcompare)[0]
      if (best) {
        resolved.set(depName, best)
      }
    }
  }

  return conflicts
}

/** Generate a human-readable suggestion for resolving a diamond conflict. */
function generateConflictSuggestion(dependency: string, required: Record<string, string>): string {
  const parts = Object.entries(required)
    .map(([pkg, range]) => `${pkg} requires ${dependency}@${range}`)
    .join(', ')

  return `Conflict: ${parts}. Consider upgrading the package with the narrower range to a version compatible with the wider range.`
}
