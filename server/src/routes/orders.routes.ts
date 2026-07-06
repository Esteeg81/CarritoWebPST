import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { sendAdminNotification } from '../lib/mailer.js'
import { sendAdminWhatsApp } from '../lib/whatsapp.js'
import {
  DEFAULT_WHATSAPP_ORDER_TEMPLATE,
  renderWhatsappOrderTemplate,
} from '../lib/whatsappTemplate.js'

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

  const sinStockProducts: string[] = []

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

      if (product.stock - item.cantidad === 0) {
        sinStockProducts.push(product.nombre)
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
      include: {
        items: true,
        user: { select: { nombre: true, email: true, telefono: true } },
      },
    })
  })

  const nuevoPedidoMsg = `${order.user.nombre} (${order.user.email}) generó un pedido por un total de $${order.total}.`
  await sendAdminNotification(`Nuevo pedido #${order.id}`, nuevoPedidoMsg)

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const itemsList = order.items
    .map((item) => `- ${item.nombre} x${item.cantidad}: $${item.precio * item.cantidad}`)
    .join('\n')
  const whatsappMsg = renderWhatsappOrderTemplate(
    settings?.whatsappOrderTemplate ?? DEFAULT_WHATSAPP_ORDER_TEMPLATE,
    {
      pedido: order.id,
      cliente: order.user.nombre,
      telefono: order.user.telefono,
      items: itemsList,
      total: order.total,
    },
  )
  await sendAdminWhatsApp(whatsappMsg)

  if (sinStockProducts.length > 0) {
    const sinStockMsg = `Los siguientes productos se quedaron sin stock: ${sinStockProducts.join(', ')}.`
    await sendAdminNotification('Productos sin stock', sinStockMsg)
    await sendAdminWhatsApp(sinStockMsg)
  }

  res.status(201).json({ order })
})
