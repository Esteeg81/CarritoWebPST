import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'

const app = createApp()

describe('CORS', () => {
  it('permite requests desde un origen permitido', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173')

    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('rechaza requests desde un origen no permitido', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://sitio-malicioso.com')

    expect(res.status).toBe(403)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('permite requests sin header Origin (no-browser, ej. curl)', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
  })
})
