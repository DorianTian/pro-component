import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'

describe('Health Check API', () => {
  const app = createApp()
  const server = app.callback()

  describe('GET /health/resolution', () => {
    it('responds without authentication', async () => {
      const res = await request(server).get('/health/resolution')
      // Should return 200 (healthy) or 503 (unhealthy), never 401
      expect([200, 503]).toContain(res.status)
    })

    it('returns health check structure', async () => {
      const res = await request(server).get('/health/resolution')
      expect(res.body).toHaveProperty('status')
      expect(res.body).toHaveProperty('checks')
      expect(res.body).toHaveProperty('version')
      expect(res.body).toHaveProperty('uptime')
      expect(res.body.checks).toHaveProperty('database')
      expect(res.body.checks).toHaveProperty('cdnConnectivity')
    })

    it('each check has status and latencyMs', async () => {
      const res = await request(server).get('/health/resolution')
      for (const check of Object.values(res.body.checks) as Array<{
        status: string
        latencyMs: number
      }>) {
        expect(['pass', 'fail']).toContain(check.status)
        expect(typeof check.latencyMs).toBe('number')
      }
    })
  })

  describe('GET /health', () => {
    it('responds without authentication', async () => {
      const res = await request(server).get('/health')
      expect([200, 503]).toContain(res.status)
    })

    it('returns basic health info', async () => {
      const res = await request(server).get('/health')
      expect(res.body).toHaveProperty('status')
      expect(res.body).toHaveProperty('uptime')
    })
  })
})
