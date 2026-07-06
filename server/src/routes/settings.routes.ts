import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

export const settingsRouter = Router()

settingsRouter.get('/', async (_req: Request, res: Response) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  res.json(settings)
})
