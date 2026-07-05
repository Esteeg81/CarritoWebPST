import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const ordersRouter = Router()

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
      }),
    )
    .min(1, 'El pedido no puede estar vacío.'),
})

ordersRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, 'No autenticado.')
  }

  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const productIds = parsed.data.items.map((item) => item.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productMap = new Map(products.map((product) => [product.id, product]))

  const orderItemsData = parsed.data.items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) {
      throw new AppError(400, `Producto ${item.productId} no encontrado.`)
    }
    return {
      productId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: item.cantidad,
    }
  })

  const total = orderItemsData.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0,
  )

  const order = await prisma.order.create({
    data: {
      userId: req.userId,
      total,
      items: { create: orderItemsData },
    },
    include: { items: true },
  })

  res.status(201).json({ order })
})
