import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma, syncProductIdSequence } from '../lib/prisma.js'

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
  await syncProductIdSequence()
})

async function getAdminToken() {
  const res = await request(app).post('/api/auth/register').send({
    nombre: 'Dueño',
    email: 'admin@example.com',
    password: '1234',
  })
  return res.body.token as string
}

async function getCustomerToken() {
  const res = await request(app).post('/api/auth/register').send({
    nombre: 'Cliente',
    email: 'cliente@example.com',
    password: '1234',
  })
  return res.body.token as string
}

describe('POST /api/admin/products', () => {
  it('rechaza a un usuario que no es admin', async () => {
    const token = await getCustomerToken()

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nuevo', precio: 100, imagen: 'y.png', stock: 3, categoria: 'X' })

    expect(res.status).toBe(403)
  })

  it('crea un producto nuevo', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Mate',
        precio: 4999,
        imagen: 'mate.png',
        stock: 10,
        categoria: 'Hogar',
      })

    expect(res.status).toBe(201)
    expect(res.body.nombre).toBe('Mate')
    expect(res.body.destacado).toBe(false)

    const listado = await request(app).get('/api/products')
    expect(listado.body).toHaveLength(2)
  })

  it('crea un producto destacado cuando se lo indica', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Mate',
        precio: 4999,
        imagen: 'mate.png',
        stock: 10,
        categoria: 'Hogar',
        destacado: true,
      })

    expect(res.status).toBe(201)
    expect(res.body.destacado).toBe(true)
  })

  it('rechaza un precio negativo', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Mate', precio: -10, imagen: 'x.png', stock: 10, categoria: 'Hogar' })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/admin/products/:id', () => {
  it('actualiza el stock de un producto existente', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/products/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 20 })

    expect(res.status).toBe(200)
    expect(res.body.stock).toBe(20)
    expect(res.body.nombre).toBe('Auriculares')
  })

  it('devuelve 404 si el producto no existe', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/products/999')
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 20 })

    expect(res.status).toBe(404)
  })

  it('marca un producto como destacado', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .patch('/api/admin/products/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ destacado: true })

    expect(res.status).toBe(200)
    expect(res.body.destacado).toBe(true)
  })
})

describe('DELETE /api/admin/products/:id', () => {
  it('elimina un producto existente', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .delete('/api/admin/products/1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)

    const listado = await request(app).get('/api/products')
    expect(listado.body).toHaveLength(0)
  })

  it('devuelve 404 si el producto no existe', async () => {
    const token = await getAdminToken()

    const res = await request(app)
      .delete('/api/admin/products/999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
