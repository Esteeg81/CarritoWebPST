import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { env } from './env.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })

/**
 * Postgres no avanza la secuencia de autoincremento cuando se inserta un id
 * explícito (como hace el seed). Sin esto, el próximo INSERT sin id
 * (ej. crear un producto desde el admin) puede intentar reusar un id ya
 * ocupado y fallar por violación de unicidad.
 */
export async function syncProductIdSequence() {
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), COALESCE((SELECT MAX(id) FROM "Product"), 1))`
}
