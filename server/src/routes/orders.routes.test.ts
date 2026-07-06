import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { sendAdminNotification } from '../lib/mailer.js'
import { sendAdminWhatsApp } from '../lib/whatsapp.js'

vi.mock('../lib/mailer.js', () => ({
  sendAdminNotification: vi.fn(),
}))

vi.mock('../lib/whatsapp.js', () => ({
  sendAdminWhatsApp: vi.fn(),
}))

const app = createApp()

beforeEach(async () => {
  vi.mocked(sendAdminNotification).mockReset()
  vi.mocked(sendAdminWhatsApp).mockReset()
  await prisma.product.createMany({
    data: [
      {
        id: 1,
        nombre: 'Auriculares',
        precio: 1000,
        imagen: 'x.png',
        stock: 5,
        categoria: 'Tech',
      },
      {
        id: 2,
        nombre: 'Mochila',
        precio: 500,
        imagen: 'y.png',
        stock: 5,
        categoria: 'Accesorios',
      },
    ],
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

describe('POST /api/orders', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, cantidad: 1 }] })

    expect(res.status).toBe(401)
  })

  it('crea un pedido calculando el total desde el precio real del producto', async () => {
    const token = await registerAndGetToken('cliente@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: 1, cantidad: 2 },
          { productId: 2, cantidad: 1 },
        ],
      })

    expect(res.status).toBe(201)
    expect(res.body.order.total).toBe(2500)
    expect(res.body.order.items).toHaveLength(2)
    expect(sendAdminNotification).toHaveBeenCalledWith(
      `Nuevo pedido #${res.body.order.id}`,
      expect.stringContaining('$2500'),
    )
    expect(sendAdminWhatsApp).toHaveBeenCalledWith(
      expect.stringContaining(`Nuevo pedido #${res.body.order.id}`),
    )
  })

  it('avisa por mail y whatsapp si algún producto se queda sin stock', async () => {
    const token = await registerAndGetToken('sinstock@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 1, cantidad: 5 }] })

    expect(res.status).toBe(201)
    expect(sendAdminNotification).toHaveBeenCalledWith(
      'Productos sin stock',
      expect.stringContaining('Auriculares'),
    )
    expect(sendAdminWhatsApp).toHaveBeenCalledWith(expect.stringContaining('Auriculares'))
  })

  it('no avisa de stock agotado si queda stock disponible', async () => {
    const token = await registerAndGetToken('conStock@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 1, cantidad: 1 }] })

    expect(res.status).toBe(201)
    expect(sendAdminNotification).not.toHaveBeenCalledWith(
      'Productos sin stock',
      expect.anything(),
    )
    expect(sendAdminWhatsApp).toHaveBeenCalledTimes(1)
  })

  it('ignora el precio que mande el cliente y usa el de la base', async () => {
    const token = await registerAndGetToken('cliente2@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: 1, cantidad: 1, precio: 1 }],
      })

    expect(res.status).toBe(201)
    expect(res.body.order.total).toBe(1000)
  })

  it('rechaza un producto inexistente', async () => {
    const token = await registerAndGetToken('cliente3@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 999, cantidad: 1 }] })

    expect(res.status).toBe(400)
  })

  it('rechaza un pedido vacío', async () => {
    const token = await registerAndGetToken('cliente4@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [] })

    expect(res.status).toBe(400)
  })

  it('descuenta el stock real del producto al confirmar el pedido', async () => {
    const token = await registerAndGetToken('cliente5@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 1, cantidad: 2 }] })

    expect(res.status).toBe(201)

    const product = await prisma.product.findUnique({ where: { id: 1 } })
    expect(product?.stock).toBe(3)
  })

  it('rechaza el pedido si no hay stock suficiente', async () => {
    const token = await registerAndGetToken('cliente6@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 1, cantidad: 10 }] })

    expect(res.status).toBe(409)

    const product = await prisma.product.findUnique({ where: { id: 1 } })
    expect(product?.stock).toBe(5)
  })

  it('no descuenta stock de ningún ítem si uno de ellos falla', async () => {
    const token = await registerAndGetToken('cliente7@example.com')

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: 1, cantidad: 1 },
          { productId: 2, cantidad: 10 },
        ],
      })

    expect(res.status).toBe(409)

    const auriculares = await prisma.product.findUnique({ where: { id: 1 } })
    expect(auriculares?.stock).toBe(5)
  })

  it('previene condiciones de carrera cuando dos pedidos compiten por el último stock', async () => {
    await prisma.product.update({ where: { id: 1 }, data: { stock: 1 } })
    const token1 = await registerAndGetToken('race1@example.com')
    const token2 = await registerAndGetToken('race2@example.com')

    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token1}`)
        .send({ items: [{ productId: 1, cantidad: 1 }] }),
      request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token2}`)
        .send({ items: [{ productId: 1, cantidad: 1 }] }),
    ])

    const statuses = [res1.status, res2.status].sort()
    expect(statuses).toEqual([201, 409])

    const product = await prisma.product.findUnique({ where: { id: 1 } })
    expect(product?.stock).toBe(0)
  })
})

describe('GET /api/orders/me', () => {
  it('rechaza sin autenticación', async () => {
    const res = await request(app).get('/api/orders/me')

    expect(res.status).toBe(401)
  })

  it('devuelve solo los pedidos del usuario autenticado', async () => {
    const tokenA = await registerAndGetToken('miscompras@example.com')
    const tokenB = await registerAndGetToken('otrocliente@example.com')

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ items: [{ productId: 1, cantidad: 1 }] })
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ items: [{ productId: 2, cantidad: 1 }] })

    const res = await request(app)
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].items[0].nombre).toBe('Auriculares')
  })

  it('devuelve los pedidos ordenados del más reciente al más antiguo', async () => {
    const token = await registerAndGetToken('variospedidos@example.com')

    const first = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 1, cantidad: 1 }] })
    const second = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 2, cantidad: 1 }] })

    const res = await request(app)
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].id).toBe(second.body.order.id)
    expect(res.body[1].id).toBe(first.body.order.id)
  })
})
