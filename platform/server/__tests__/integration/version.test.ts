import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { tokenForRole, fixtures } from '../helpers.js'

describe('Version Management API', () => {
  const app = createApp()
  const server = app.callback()
  const publisherToken = tokenForRole('publisher')
  const adminToken = tokenForRole('admin')
  const viewerToken = tokenForRole('viewer')

  describe('POST /api/v1/versions/sync', () => {
    it('rejects viewer role', async () => {
      const res = await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(fixtures.versionSyncPayload())

      expect(res.status).toBe(403)
    })

    it('validates required fields', async () => {
      const res = await request(server)
        .post('/api/v1/versions/sync')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send({ packageName: 'test' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/versions/:id/rollback', () => {
    it('requires admin role', async () => {
      const res = await request(server)
        .post('/api/v1/versions/1/rollback')
        .set('Authorization', `Bearer ${tokenForRole('operator')}`)
        .send({ reason: 'test', targetVersion: '1.0.0' })

      expect(res.status).toBe(403)
    })

    it('requires reason field', async () => {
      const res = await request(server)
        .post('/api/v1/versions/1/rollback')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ targetVersion: '1.0.0' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/versions/:id/deprecate', () => {
    it('requires admin role', async () => {
      const res = await request(server)
        .post('/api/v1/versions/1/deprecate')
        .set('Authorization', `Bearer ${tokenForRole('operator')}`)
        .send({})

      expect(res.status).toBe(403)
    })
  })
})
