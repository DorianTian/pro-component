import { version as vueVersion } from 'vue'
import { createLogger } from './logger'

const logger = createLogger('version-check')

const MIN_VUE_VERSION = '3.4.0'

/** Compare two semver strings, returns true if current >= minimum */
function compareVersions(current: string, minimum: string): boolean {
  const cur = current.split('.').map(Number)
  const min = minimum.split('.').map(Number)
  const SEMVER_PARTS = 3

  for (let i = 0; i < SEMVER_PARTS; i++) {
    const c = cur[i] ?? 0
    const m = min[i] ?? 0
    if (c > m) return true
    if (c < m) return false
  }
  return true
}

/**
 * Check runtime dependencies meet minimum version requirements.
 * Call once during component library install.
 */
export function checkDependencies(): void {
  if (!compareVersions(vueVersion, MIN_VUE_VERSION)) {
    logger.warn(
      `Vue ${vueVersion} detected, minimum required ${MIN_VUE_VERSION}. ` +
        'Some features may not work correctly.',
    )
  }
}
