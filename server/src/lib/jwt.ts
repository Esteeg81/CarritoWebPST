import jwt from 'jsonwebtoken'
import { env } from './env.js'

interface TokenPayload {
  userId: number
}

export function signToken(userId: number): string {
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
