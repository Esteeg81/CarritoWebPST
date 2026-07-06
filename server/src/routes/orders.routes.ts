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

ordersRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, 'No autenticado.')
  }

  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(orders)
})

ordersRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, 'No autenticado.')
  }

  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const userId = req.userId
  const { items } = parsed.data

  const order = await prisma.$transaction(async (tx) => {
    const orderItemsData = []

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        throw new AppError(400, `Producto ${item.productId} no encontrado.`)
      }

      // updateMany + condición en el where evita la condición de carrera de
      // "leer stock, decidir, escribir": si otro pedido decrementó el stock
      // entre el findUnique y este update, count da 0 y abortamos.
      const decremented = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.cantidad } },
        data: { stock: { decrement: item.cantidad } },
      })
      if (decremented.count === 0) {
        throw new AppError(
          409,
          `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}.`,
        )
      }

      orderItemsData.push({
        productId: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: item.cantidad,
      })
    }

    const total = orderItemsData.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    )

    return tx.order.create({
      data: {
        userId,
        total,
        items: { create: orderItemsData },
      },
      include: { items: true },
    })
  })

  res.status(201).json({ order })
})
