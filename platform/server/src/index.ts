import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { logger } from './logger.js'
import { destroyDb } from './db.js'

const config = loadConfig()
const app = createApp()

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'Platform API server started')
})

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received')
  server.close(() => {
    logger.info('HTTP server closed')
  })
  await destroyDb()
  process.exit(0)
}

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM')
})
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT')
})
