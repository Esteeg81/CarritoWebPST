import bcrypt from 'bcrypt'
import { prisma } from '../src/lib/prisma.js'
import productsData from '../../src/data/products.json' with { type: 'json' }

interface SeedProduct {
  id: number
  nombre: string
  precio: number
  imagen: string
  stock: number
  categoria: string
}

const products = productsData as SeedProduct[]

async function main() {
  console.log('Sembrando productos...')
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
        stock: p.stock,
        categoria: p.categoria,
      },
      create: {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
        stock: p.stock,
        categoria: p.categoria,
      },
    })
  }

  console.log('Sembrando usuarios de prueba...')
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const mockUsers = [
    { nombre: 'Juan Pérez', email: 'juan@example.com', password: '1234' },
    { nombre: 'Ana Gómez', email: 'ana@example.com', password: 'abcd' },
  ]
  for (const u of mockUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10)
    const role = adminEmail === u.email.toLowerCase() ? 'ADMIN' : 'CUSTOMER'
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role },
      create: { nombre: u.nombre, email: u.email, passwordHash, role },
    })
  }

  if (adminEmail) {
    await prisma.user.updateMany({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    })
  }

  console.log('Listo.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
