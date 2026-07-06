import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'
import { sendAdminNotification } from '../lib/mailer.js'
import { sendAdminWhatsApp } from '../lib/whatsapp.js'

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

const orderStatusSchema = z.object({
  status: z.enum(['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']),
})

adminRouter.patch('/orders/:id/status', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    throw new AppError(400, 'ID de pedido inválido.')
  }

  const parsed = orderStatusSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'Pedido no encontrado.')
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      items: true,
      user: { select: { id: true, nombre: true, email: true } },
    },
  })
  res.json(order)
})

adminRouter.get('/customers', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      role: true,
      createdAt: true,
      orders: { select: { total: true } },
    },
  })

  const customers = users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    role: user.role,
    createdAt: user.createdAt,
    totalPedidos: user.orders.length,
    totalGastado: user.orders.reduce((sum, order) => sum + order.total, 0),
  }))

  res.json(customers)
})

const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  precio: z.number().positive('El precio debe ser mayor a 0.'),
  imagen: z.string().min(1, 'La imagen es obligatoria.'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo.'),
  categoria: z.string().min(1, 'La categoría es obligatoria.'),
  destacado: z.boolean().optional().default(false),
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

  if (existing.stock !== 0 && product.stock === 0) {
    const sinStockMsg = `El producto "${product.nombre}" se quedó sin stock.`
    await sendAdminNotification('Producto sin stock', sinStockMsg)
    await sendAdminWhatsApp(sinStockMsg)
  }

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

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Los colores deben ser un código hexadecimal, ej: #1e293b.')

const settingsSchema = z
  .object({
    fontFamily: z.string().min(1, 'La tipografía es obligatoria.'),
    textColor: hexColor,
    headerBg: hexColor,
    footerBg: hexColor,
    mainBg: hexColor,
  })
  .partial()

adminRouter.patch('/settings', async (req: Request, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0].message)
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  })
  res.json(settings)
})
