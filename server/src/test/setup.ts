import { afterEach } from 'vitest'
import { prisma } from '../lib/prisma.js'

afterEach(async () => {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
})
