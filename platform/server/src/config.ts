/** Application configuration loaded from environment variables. */
export interface AppConfig {
  port: number
  env: 'development' | 'test' | 'production'
  db: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  cdn: {
    baseUrl: string
  }
  cache: {
    importMapMaxSize: number
    importMapTtlMs: number
  }
}

/** Load configuration from environment variables with sensible defaults. */
export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV || 'development') as AppConfig['env']

  return {
    port: parseInt(process.env.PORT || '3100', 10),
    env,
    db: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || (env === 'test' ? 'pro_platform_test' : 'pro_platform'),
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    cdn: {
      baseUrl: process.env.CDN_BASE_URL || 'https://cdn.internal',
    },
    cache: {
      importMapMaxSize: parseInt(process.env.IMPORT_MAP_CACHE_MAX || '10000', 10),
      importMapTtlMs: parseInt(process.env.IMPORT_MAP_CACHE_TTL_MS || '60000', 10),
    },
  }
}
