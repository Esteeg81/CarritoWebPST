import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  ADMIN_EMAIL: z.string().email().optional(),
  CORS_ORIGIN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
