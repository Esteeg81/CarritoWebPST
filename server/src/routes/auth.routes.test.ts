import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

const app = createApp()

describe('POST /api/auth/register', () => {
  it('crea un usuario nuevo y devuelve token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Test User',
      email: 'test@example.com',
      telefono: '5491122334455',
      password: '1234',
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toMatchObject({
      nombre: 'Test User',
      email: 'test@example.com',
      telefono: '5491122334455',
    })
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('rechaza un email duplicado', async () => {
    await request(app).post('/api/auth/register').send({
      nombre: 'Uno',
      email: 'dup@example.com',
      telefono: '5491122334455',
      password: '1234',
    })

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Dos',
      email: 'dup@example.com',
      telefono: '5491122334455',
      password: '5678',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/ya está registrado/i)
  })

  it('rechaza contraseñas demasiado cortas', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Test',
      email: 'short@example.com',
      telefono: '5491122334455',
      password: '12',
    })

    expect(res.status).toBe(400)
  })

  it('rechaza un registro sin teléfono', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Test',
      email: 'sintelefono@example.com',
      password: '1234',
    })

    expect(res.status).toBe(400)
  })

  it('rechaza un teléfono con letras o símbolos', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Test',
      email: 'telefonomalo@example.com',
      telefono: '+54 911-2233',
      password: '1234',
    })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('loguea con credenciales correctas', async () => {
    await request(app).post('/api/auth/register').send({
      nombre: 'Login User',
      email: 'login@example.com',
      telefono: '5491122334455',
      password: '1234',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: '1234' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('rechaza contraseña incorrecta', async () => {
    await request(app).post('/api/auth/register').send({
      nombre: 'Login User',
      email: 'login2@example.com',
      telefono: '5491122334455',
      password: '1234',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'mala' })

    expect(res.status).toBe(401)
  })

  it('rechaza email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@example.com', password: '1234' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('rechaza con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido')

    expect(res.status).toBe(401)
  })

  it('devuelve el usuario con un token válido', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      nombre: 'Me User',
      email: 'me@example.com',
      telefono: '5491122334455',
      password: '1234',
    })
    const token = registerRes.body.token

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
    expect(res.body.user.telefono).toBe('5491122334455')
  })
})
