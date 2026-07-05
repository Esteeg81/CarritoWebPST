import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/jwt.js'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw new AppError(401, 'No autenticado.')
  }

  try {
    const payload = verifyToken(token)
    req.userId = payload.userId
    next()
  } catch {
    throw new AppError(401, 'Token inválido o expirado.')
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.userId) {
    throw new AppError(401, 'No autenticado.')
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user || user.role !== 'ADMIN') {
    throw new AppError(403, 'No autorizado.')
  }

  next()
}
