import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

async function getAdminToken() {
  const res = await request(app).post('/api/auth/register').send({
    nombre: 'Dueño',
    email: 'admin@example.com',
    telefono: '5491122334455',
    password: '1234',
  })
  return res.body.token as string
}

async function getCustomerToken() {
  const res = await request(app).post('/api/auth/register').send({
    nombre: 'Cliente',
    email: 'cliente@example.com',
    telefono: '5491122334455',
    password: '1234',
  })
  return res.body.token as string
}

describe('GET /api/settings', () => {
  it('devuelve null si todavía no se configuró nada', async () => {
    const res = await request(app).get('/api/settings')

    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  it('no requiere autenticación', async () => {
    const token = await getAdminToken()
    await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ textColor: '#ff0000' })

    const res = await request(app).get('/api/settings')

    expect(res.status).toBe(200)
    expect(res.body.textColor).toBe('#ff0000')
  })
})

describe('PATCH /api/admin/settings', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app).patch('/api/admin/settings').send({
      textColor: '#ff0000',
    })

    expect(res.status).toBe(401)
  })

  it('rechaza a un usuario que no es admin', async () => {
    const token = await getCustomerToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ textColor: '#ff0000' })

    expect(res.status).toBe(403)
  })

  it('actualiza la configuración del sitio', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fontFamily: 'serif',
        textColor: '#111111',
        headerBg: '#222222',
        footerBg: '#333333',
        mainBg: '#444444',
      })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      fontFamily: 'serif',
      textColor: '#111111',
      headerBg: '#222222',
      footerBg: '#333333',
      mainBg: '#444444',
    })
  })

  it('permite actualizar un solo campo', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ headerBg: '#abcdef' })

    expect(res.status).toBe(200)
    expect(res.body.headerBg).toBe('#abcdef')
  })

  it('rechaza un color con formato inválido', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ textColor: 'no-es-un-color' })

    expect(res.status).toBe(400)
  })

  it('actualiza la plantilla de whatsapp de pedidos', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ whatsappOrderTemplate: 'Pedido #{pedido} de {cliente}' })

    expect(res.status).toBe(200)
    expect(res.body.whatsappOrderTemplate).toBe('Pedido #{pedido} de {cliente}')
  })

  it('rechaza una plantilla de whatsapp vacía', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ whatsappOrderTemplate: '' })

    expect(res.status).toBe(400)
  })
})
