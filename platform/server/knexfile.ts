import type { Knex } from 'knex'
import { loadConfig } from './src/config.js'

const config = loadConfig()

const baseConnection: Knex.MySql2ConnectionConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
}

const baseConfig: Knex.Config = {
  client: 'mysql2',
  connection: baseConnection,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
}

const knexConfig: Record<string, Knex.Config> = {
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
    connection: {
      ...baseConnection,
      database: 'pro_platform_test',
    },
    pool: { min: 1, max: 5 },
  },
  production: {
    ...baseConfig,
    pool: { min: 5, max: 30 },
  },
}

export default knexConfig
