import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const productsRouter = Router()

productsRouter.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json(products)
})

productsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    throw new AppError(400, 'ID de producto inválido.')
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new AppError(404, 'Producto no encontrado.')
  }

  res.json(product)
})
