/**
 * CI Logger wrapper for all CI scripts.
 * Provides structured logging with `ci:` prefix.
 * All CI scripts MUST import from this module instead of using raw console.
 */

interface CiLogger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

/**
 * Creates a structured CI logger with a `ci:` prefix.
 * Uses process.stdout/process.stderr for GitHub Actions compatibility.
 */
function createCiLogger(scope?: string): CiLogger {
  const prefix = scope ? `ci:${scope}` : 'ci'
  const timestamp = (): string => new Date().toISOString()

  return {
    info(message: string): void {
      process.stdout.write(`[${timestamp()}] [${prefix}] INFO  ${message}\n`)
    },
    warn(message: string): void {
      process.stderr.write(`[${timestamp()}] [${prefix}] WARN  ${message}\n`)
    },
    error(message: string): void {
      process.stderr.write(`[${timestamp()}] [${prefix}] ERROR ${message}\n`)
    },
    debug(message: string): void {
      if (process.env.CI_DEBUG === 'true') {
        process.stdout.write(`[${timestamp()}] [${prefix}] DEBUG ${message}\n`)
      }
    },
  }
}

export { createCiLogger }
export type { CiLogger }
