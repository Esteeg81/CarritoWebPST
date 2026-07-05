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

async function registerAndGetToken(email: string, nombre = 'Test User') {
  const res = await request(app).post('/api/auth/register').send({
    nombre,
    email,
    password: '1234',
  })
  return res.body.token as string
}

describe('GET /api/admin/customers', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app).get('/api/admin/customers')
    expect(res.status).toBe(401)
  })

  it('rechaza a un usuario que no es admin', async () => {
    const token = await registerAndGetToken('cliente@example.com')

    const res = await request(app)
      .get('/api/admin/customers')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('devuelve los clientes con cantidad de pedidos y total gastado', async () => {
    const customerToken = await registerAndGetToken('cliente@example.com', 'Cliente Uno')
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 1, cantidad: 2 }] })
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 1, cantidad: 1 }] })

    const adminToken = await registerAndGetToken('admin@example.com', 'Dueño')

    const res = await request(app)
      .get('/api/admin/customers')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)

    const cliente = res.body.find((c: { email: string }) => c.email === 'cliente@example.com')
    expect(cliente.nombre).toBe('Cliente Uno')
    expect(cliente.role).toBe('CUSTOMER')
    expect(cliente.totalPedidos).toBe(2)
    expect(cliente.totalGastado).toBe(3000)

    const admin = res.body.find((c: { email: string }) => c.email === 'admin@example.com')
    expect(admin.role).toBe('ADMIN')
    expect(admin.totalPedidos).toBe(0)
    expect(admin.totalGastado).toBe(0)
  })
})
