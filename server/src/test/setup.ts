import { afterEach } from 'vitest'
import { prisma } from '../lib/prisma.js'

afterEach(async () => {
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
})
