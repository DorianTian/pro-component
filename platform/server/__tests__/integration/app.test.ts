import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'

describe('App Management API', () => {
  const app = createApp()
  const server = app.callback()
  const operatorToken = tokenForRole('operator')
  const viewerToken = tokenForRole('viewer')

  describe('POST /api/v1/apps', () => {
    it('rejects viewer role', async () => {
      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.createAppPayload())

      expect(res.status).toBe(403)
    })

    it('validates required fields', async () => {
      const res = await request(server)
        .post('/api/v1/apps')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ appId: 'missing-fields' })

      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/apps', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(server).get('/api/v1/apps')
      expect(res.status).toBe(401)
    })
  })
})
