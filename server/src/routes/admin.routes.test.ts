import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeEach(async () => {
  await prisma.product.create({
    data: {
      id: 1,
      nombre: 'Auriculares',
      precio: 1000,
      imagen: 'x.png',
      stock: 5,
      categoria: 'Tech',
    },
  })
})

async function registerAndGetToken(email: string) {
  const res = await request(app).post('/api/auth/register').send({
    nombre: 'Test User',
    email,
    password: '1234',
  })
  return res.body.token as string
}

describe('GET /api/admin/orders', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app).get('/api/admin/orders')
    expect(res.status).toBe(401)
  })

  it('rechaza a un usuario que no es admin', async () => {
    const token = await registerAndGetToken('cliente@example.com')

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('a admin@example.com se lo promueve a ADMIN automáticamente al registrarse', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      nombre: 'Dueño',
      email: 'admin@example.com',
      password: '1234',
    })

    expect(registerRes.body.user.role).toBe('ADMIN')
  })

  it('devuelve los pedidos de todos los usuarios con datos del cliente', async () => {
    const customerToken = await registerAndGetToken('cliente@example.com')
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 1, cantidad: 2 }] })

    const adminToken = await registerAndGetToken('admin@example.com')

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].user.email).toBe('cliente@example.com')
    expect(res.body[0].total).toBe(2000)
    expect(res.body[0].items).toHaveLength(1)
  })
})
