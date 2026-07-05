import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import { AppError } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const authRouter = Router()

const registerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres.'),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

function toSafeUser(user: { id: number; nombre: string; email: string }) {
  return { id: user.id, nombre: user.nombre, email: user.email }
}

authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }
  const { nombre, email, password } = parsed.data

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existing) {
    throw new AppError(409, 'Ese email ya está registrado.')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { nombre, email: email.toLowerCase(), passwordHash },
  })

  const token = signToken(user.id)
  res.status(201).json({ token, user: toSafeUser(user) })
})

authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (!user) {
    throw new AppError(401, 'Email o contraseña incorrectos.')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new AppError(401, 'Email o contraseña incorrectos.')
  }

  const token = signToken(user.id)
  res.json({ token, user: toSafeUser(user) })
})

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, 'No autenticado.')
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado.')
  }

  res.json({ user: toSafeUser(user) })
})
