import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'

describe('Grayscale Management API', () => {
  const app = createApp()
  const server = app.callback()
  const operatorToken = tokenForRole('operator')
  const viewerToken = tokenForRole('viewer')

  describe('POST /api/v1/grayscale', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .post('/api/v1/grayscale')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.grayscalePayload())

      expect(res.status).toBe(403)
    })

    it('validates required fields', async () => {
      const res = await request(server)
        .post('/api/v1/grayscale')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ appId: 'test' })

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /api/v1/grayscale/:id/pause', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .put('/api/v1/grayscale/1/pause')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('PUT /api/v1/grayscale/:id/complete', () => {
    it('requires operator role', async () => {
      const res = await request(server)
        .put('/api/v1/grayscale/1/complete')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/v1/grayscale', () => {
    it('requires appId query param', async () => {
      const res = await request(server)
        .get('/api/v1/grayscale')
        .set('Authorization', `Bearer ${viewerToken}`)

      expect(res.status).toBe(400)
    })
  })
})
