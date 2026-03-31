import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { generateToken, type AuthPayload } from '../../src/middleware/auth.js'
import { hasPermission } from '../../src/middleware/rbac.js'
import type { PlatformUserRow } from '../../src/types/index.js'

// --- Unit tests for hasPermission (pure function) ---
describe('hasPermission', () => {
  it('viewer can read versions', () => {
    expect(hasPermission('viewer', 'versions:read')).toBe(true)
  })

  it('viewer cannot sync versions', () => {
    expect(hasPermission('viewer', 'versions:sync')).toBe(false)
  })

  it('publisher can sync versions', () => {
    expect(hasPermission('publisher', 'versions:sync')).toBe(true)
  })

  it('publisher can also read (inherits viewer)', () => {
    expect(hasPermission('publisher', 'versions:read')).toBe(true)
  })

  it('operator can create grayscale', () => {
    expect(hasPermission('operator', 'grayscale:create')).toBe(true)
  })

  it('operator cannot rollback (admin only)', () => {
    expect(hasPermission('operator', 'versions:rollback')).toBe(false)
  })

  it('admin can do everything', () => {
    expect(hasPermission('admin', 'versions:read')).toBe(true)
    expect(hasPermission('admin', 'versions:sync')).toBe(true)
    expect(hasPermission('admin', 'grayscale:create')).toBe(true)
    expect(hasPermission('admin', 'versions:rollback')).toBe(true)
    expect(hasPermission('admin', 'users:manage')).toBe(true)
  })

  it('unknown action is denied for all roles', () => {
    expect(hasPermission('admin', 'nonexistent:action')).toBe(false)
  })
})

// --- Integration tests for auth + rbac middleware ---
describe('Auth + RBAC middleware (integration)', () => {
  const app = createApp()
  const server = app.callback()

  function tokenFor(role: PlatformUserRow['role']): string {
    const payload: AuthPayload = { userId: 1, username: `test-${role}`, role }
    return generateToken(payload)
  }

  it('rejects requests without Authorization header', async () => {
    const res = await request(server).post('/api/v1/apps').send({ appId: 'test' })
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('rejects requests with invalid token', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ appId: 'test' })
    expect(res.status).toBe(401)
  })

  it('rejects viewer attempting to create app (operator required)', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', `Bearer ${tokenFor('viewer')}`)
      .send({ appId: 'test-app', name: 'Test', owner: 'me' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('allows operator to create app', async () => {
    const res = await request(server)
      .post('/api/v1/apps')
      .set('Authorization', `Bearer ${tokenFor('operator')}`)
      .send({ appId: 'test-app', name: 'Test', owner: 'me' })
    // May fail with DB error if DB not connected, but should NOT be 401/403
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('allows health check without auth', async () => {
    const res = await request(server).get('/health/resolution')
    expect(res.status).not.toBe(401)
  })
})
