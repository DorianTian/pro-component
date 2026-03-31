const PREFIX = '[@pro]'

declare const __DEV__: boolean

/** Logger interface for structured, scoped log output */
export interface Logger {
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
}

/**
 * Create a scoped logger that only emits warn/info in dev mode.
 * Error messages are always emitted regardless of environment.
 */
export function createLogger(scope: string): Logger {
  const tag = `${PREFIX}[${scope}]`
  return {
    warn: (message: string, ...args: unknown[]) => {
      if (__DEV__) console.warn(tag, message, ...args) // eslint-disable-line no-console
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(tag, message, ...args) // eslint-disable-line no-console
    },
    info: (message: string, ...args: unknown[]) => {
      if (__DEV__) console.info(tag, message, ...args) // eslint-disable-line no-console
    },
  }
}
