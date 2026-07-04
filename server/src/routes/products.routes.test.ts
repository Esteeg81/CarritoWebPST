import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeEach(async () => {
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
        stock: 0,
        categoria: 'Accesorios',
      },
    ],
  })
})

describe('GET /api/products', () => {
  it('devuelve la lista de productos', async () => {
    const res = await request(app).get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].nombre).toBe('Auriculares')
  })
})

describe('GET /api/products/:id', () => {
  it('devuelve un producto existente', async () => {
    const res = await request(app).get('/api/products/1')

    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('Auriculares')
  })

  it('devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/products/999')

    expect(res.status).toBe(404)
  })

  it('devuelve 400 si el id no es numérico', async () => {
    const res = await request(app).get('/api/products/abc')

    expect(res.status).toBe(400)
  })
})
