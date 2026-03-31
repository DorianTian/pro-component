import Router from 'koa-router'
import { getDb } from '../../db.js'
import { loadConfig } from '../../config.js'
import { logger } from '../../logger.js'
import { getCacheSize, getCacheEpoch } from '../import-map/cache.js'
import type { Context } from 'koa'

export const healthRouter = new Router()

interface CheckResult {
  status: 'pass' | 'fail'
  latencyMs: number
  message?: string
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: CheckResult
    cdnConnectivity: CheckResult
  }
  version: string
  uptime: number
  cacheSize: number
  cacheEpoch: number
}

/** GET /health — Simple liveness probe. No auth, no version prefix. */
healthRouter.get('/health', async (ctx: Context) => {
  const dbStatus = await getDb()
    .raw('SELECT 1')
    .then(() => 'connected')
    .catch(() => 'disconnected')

  ctx.body = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    db: dbStatus,
    uptime: process.uptime(),
    cacheSize: getCacheSize(),
    cacheEpoch: await getCacheEpoch(),
  }
})

/** GET /health/resolution — Deep health check with DB + CDN connectivity. */
healthRouter.get('/health/resolution', async (ctx: Context) => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'fail', latencyMs: 0 },
    cdnConnectivity: { status: 'fail', latencyMs: 0 },
  }

  checks.database = await checkDatabase()
  checks.cdnConnectivity = await checkCdnConnectivity()

  const allPass = Object.values(checks).every((c) => c.status === 'pass')
  const anyFail = Object.values(checks).some((c) => c.status === 'fail')

  const healthStatus: HealthStatus = {
    status: allPass ? 'healthy' : anyFail ? 'unhealthy' : 'degraded',
    checks,
    version: process.env.npm_package_version || '0.0.1',
    uptime: process.uptime(),
    cacheSize: getCacheSize(),
    cacheEpoch: await getCacheEpoch(),
  }

  ctx.status = healthStatus.status === 'healthy' ? 200 : 503
  ctx.body = healthStatus
})

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const db = getDb()
    await db.raw('SELECT 1 as health_check')
    return { status: 'pass', latencyMs: Date.now() - start }
  } catch (err: unknown) {
    logger.error({ err }, 'Health check: database connection failed')
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Unknown DB error',
    }
  }
}

async function checkCdnConnectivity(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const config = loadConfig()
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
    }, 5000)

    const response = await fetch(config.cdn.baseUrl, {
      method: 'HEAD',
      signal: controller.signal,
    }).catch(() => null)

    clearTimeout(timeout)

    return {
      status: response ? 'pass' : 'fail',
      latencyMs: Date.now() - start,
      message: response ? undefined : 'CDN unreachable',
    }
  } catch (err: unknown) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'CDN check failed',
    }
  }
}
