import knex, { type Knex } from 'knex'
import { loadConfig } from './config.js'
import { logger } from './logger.js'

let instance: Knex | null = null

/** Get the singleton Knex database instance. Creates one if it doesn't exist. */
export function getDb(): Knex {
  if (!instance) {
    const config = loadConfig()

    instance = knex({
      client: 'mysql2',
      connection: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      },
      pool: {
        min: config.env === 'test' ? 1 : 2,
        max: config.env === 'test' ? 5 : 10,
      },
    })

    logger.info({ database: config.db.database }, 'Knex instance created')
  }

  return instance
}

/** Destroy the singleton Knex instance and release connections. */
export async function destroyDb(): Promise<void> {
  if (instance) {
    await instance.destroy()
    instance = null
    logger.info('Knex instance destroyed')
  }
}

/**
 * Create a fresh Knex instance for testing — isolated from singleton.
 * Caller is responsible for destroying it.
 */
export function createTestDb(database: string): Knex {
  const config = loadConfig()
  return knex({
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database,
    },
    pool: { min: 1, max: 5 },
  })
}
