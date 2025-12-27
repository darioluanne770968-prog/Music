import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { UnauthorizedError, ForbiddenError } from './errorHandler.js'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JwtPayload {
  userId: number
  username: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    email?: string
    phone?: string
    vipLevel: number
  }
}

// Generate tokens
export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  const refreshToken = jwt.sign(payload, JWT_SECRET + '-refresh', { expiresIn: '30d' })

  return { accessToken, refreshToken }
}

// Verify token
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

// Auth middleware - requires authentication
export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('请先登录')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        vipLevel: true,
      },
    })

    if (!user) {
      throw new UnauthorizedError('用户不存在')
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error)
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('登录已过期，请重新登录'))
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('无效的登录凭证'))
    } else {
      next(error)
    }
  }
}

// Optional auth - doesn't require but parses if present
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          vipLevel: true,
        },
      })

      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Ignore token errors in optional auth
    next()
  }
}

// VIP required middleware
export const vipRequired = (minLevel: number = 1) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('请先登录')
      }

      if (req.user.vipLevel < minLevel) {
        throw new ForbiddenError('此功能需要VIP会员')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Admin required middleware
export const adminRequired = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('请先登录')
    }

    // Check if user is admin (you might want to add an isAdmin field to User model)
    // For now, we'll just check if it's a specific user ID
    const adminIds = (process.env.ADMIN_IDS || '1').split(',').map(Number)

    if (!adminIds.includes(req.user.id)) {
      throw new ForbiddenError('需要管理员权限')
    }

    next()
  } catch (error) {
    next(error)
  }
}
