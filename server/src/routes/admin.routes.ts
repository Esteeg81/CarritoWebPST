import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'

export const adminRouter = Router()

adminRouter.get(
  '/orders',
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  },
)
