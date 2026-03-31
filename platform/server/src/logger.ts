import pino from 'pino'
import { loadConfig } from './config.js'

const config = loadConfig()

/** Structured logger — pino with pretty printing in dev, silent in test. */
export const logger = pino({
  level: config.env === 'test' ? 'silent' : config.env === 'production' ? 'info' : 'debug',
  transport:
    config.env === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: { service: 'pro-platform-api' },
})
