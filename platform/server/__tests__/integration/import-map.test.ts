import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'

describe('Import Map Generation API', () => {
  const app = createApp()
  const server = app.callback()

  describe('GET /api/v1/import-map', () => {
    it('requires appId query parameter', async () => {
      const res = await request(server).get('/api/v1/import-map')
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })

    it('does not require authentication (consumer-facing)', async () => {
      const res = await request(server).get('/api/v1/import-map?appId=user-center')
      // Should NOT return 401 — the endpoint is public
      expect(res.status).not.toBe(401)
    })
  })
})
