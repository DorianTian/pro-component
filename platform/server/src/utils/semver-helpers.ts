import semver from 'semver'

/**
 * Compute the intersection of two semver ranges.
 * Returns versions from the available set that satisfy both ranges.
 * Returns empty array if ranges are incompatible or invalid.
 */
export function rangeIntersection(
  rangeA: string,
  rangeB: string,
  availableVersions: string[],
): string[] {
  const validA = semver.validRange(rangeA)
  const validB = semver.validRange(rangeB)

  if (!validA || !validB) {
    return []
  }

  return availableVersions.filter((v) => semver.satisfies(v, rangeA) && semver.satisfies(v, rangeB))
}

/**
 * From a list of versions satisfying a range, select the highest.
 * Returns null if no versions satisfy.
 */
export function highestSatisfying(range: string, versions: string[]): string | null {
  const sorted = versions.filter((v) => semver.valid(v)).sort(semver.rcompare)
  for (const v of sorted) {
    if (semver.satisfies(v, range)) {
      return v
    }
  }
  return null
}

/** Check if a version string is a prerelease version. */
export function isPrerelease(version: string): boolean {
  const parsed = semver.parse(version)
  return parsed !== null && parsed.prerelease.length > 0
}
