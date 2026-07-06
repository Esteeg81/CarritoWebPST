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
    telefono: '5491122334455',
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
      telefono: '5491122334455',
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
    expect(res.body[0].status).toBe('PENDIENTE')
  })
})

describe('PATCH /api/admin/orders/:id/status', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app).patch('/api/admin/orders/1/status').send({
      status: 'CONFIRMADO',
    })

    expect(res.status).toBe(401)
  })

  it('rechaza a un usuario que no es admin', async () => {
    const token = await registerAndGetToken('cliente@example.com')

    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADO' })

    expect(res.status).toBe(403)
  })

  it('actualiza el estado de un pedido', async () => {
    const customerToken = await registerAndGetToken('cliente@example.com')
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 1, cantidad: 1 }] })

    const adminToken = await registerAndGetToken('admin@example.com')

    const res = await request(app)
      .patch(`/api/admin/orders/${orderRes.body.order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ENVIADO' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ENVIADO')
  })

  it('rechaza un estado inválido', async () => {
    const adminToken = await registerAndGetToken('admin@example.com')

    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INEXISTENTE' })

    expect(res.status).toBe(400)
  })

  it('devuelve 404 si el pedido no existe', async () => {
    const adminToken = await registerAndGetToken('admin@example.com')

    const res = await request(app)
      .patch('/api/admin/orders/999/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMADO' })

    expect(res.status).toBe(404)
  })
})
