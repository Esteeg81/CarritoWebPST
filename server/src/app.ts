import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.routes.js'
import { productsRouter } from './routes/products.routes.js'
import { ordersRouter } from './routes/orders.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { settingsRouter } from './routes/settings.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { AppError } from './lib/errors.js'
import { env } from './lib/env.js'

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5183']

const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : DEFAULT_DEV_ORIGINS

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        // Sin header Origin: request no-browser (curl, server-to-server, apps móviles).
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(new AppError(403, 'No permitido por CORS'))
      },
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/settings', settingsRouter)
  app.use('/api/admin', adminRouter)

  app.use(errorHandler)

  return app
}
