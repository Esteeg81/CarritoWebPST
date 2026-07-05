import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.routes.js'
import { productsRouter } from './routes/products.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/products', productsRouter)

  app.use(errorHandler)

  return app
}
