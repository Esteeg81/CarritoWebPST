import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/orders', async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  precio: z.number().positive('El precio debe ser mayor a 0.'),
  imagen: z.string().min(1, 'La imagen es obligatoria.'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo.'),
  categoria: z.string().min(1, 'La categoría es obligatoria.'),
})

const updateProductSchema = productSchema.partial()

adminRouter.post('/products', async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const product = await prisma.product.create({ data: parsed.data })
  res.status(201).json(product)
})

adminRouter.patch('/products/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    throw new AppError(400, 'ID de producto inválido.')
  }

  const parsed = updateProductSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'Producto no encontrado.')
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data })
  res.json(product)
})

adminRouter.delete('/products/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    throw new AppError(400, 'ID de producto inválido.')
  }

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'Producto no encontrado.')
  }

  await prisma.product.delete({ where: { id } })
  res.status(204).send()
})
