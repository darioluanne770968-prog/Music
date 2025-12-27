import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { asyncHandler, BadRequestError, ConflictError, UnauthorizedError } from '../middlewares/errorHandler.js'
import { generateTokens, auth, AuthRequest } from '../middlewares/auth.js'
import { authRateLimiter } from '../middlewares/rateLimiter.js'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  account: z.string(), // username, email, or phone
  password: z.string(),
})

// Register
router.post('/register', authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { username, password, email, phone } = registerSchema.parse(req.body)

  // Check if username exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
  })

  if (existingUser) {
    throw new ConflictError('用户名、邮箱或手机号已被使用')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      email,
      phone,
      settings: {
        create: {},
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      avatar: true,
      level: true,
      vipLevel: true,
      createdAt: true,
    },
  })

  // Generate tokens
  const tokens = generateTokens({ userId: user.id, username: user.username })

  res.status(201).json({
    code: 201,
    message: '注册成功',
    data: {
      user,
      ...tokens,
    },
  })
}))

// Login
router.post('/login', authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { account, password } = loginSchema.parse(req.body)

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: account },
        { email: account },
        { phone: account },
      ],
    },
  })

  if (!user) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isValidPassword) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  // Generate tokens
  const tokens = generateTokens({ userId: user.id, username: user.username })

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        level: user.level,
        exp: user.exp,
        vipLevel: user.vipLevel,
        vipExpireAt: user.vipExpireAt,
        createdAt: user.createdAt,
      },
      ...tokens,
    },
  })
}))

// Logout
router.post('/logout', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a real app, you might want to blacklist the token
  res.json({
    code: 200,
    message: '已退出登录',
    data: null,
  })
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new BadRequestError('缺少刷新令牌')
  }

  // Verify refresh token (in real app, check against stored refresh tokens)
  try {
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(
      refreshToken,
      (process.env.JWT_SECRET || 'your-secret-key') + '-refresh'
    ) as { userId: number; username: string }

    const tokens = generateTokens({ userId: decoded.userId, username: decoded.username })

    res.json({
      code: 200,
      message: '令牌刷新成功',
      data: tokens,
    })
  } catch {
    throw new UnauthorizedError('刷新令牌无效或已过期')
  }
}))

// Get current user
router.get('/me', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      level: true,
      exp: true,
      vipLevel: true,
      vipExpireAt: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          playlists: true,
        },
      },
    },
  })

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...user,
      followerCount: user?._count.followers,
      followingCount: user?._count.following,
      playlistCount: user?._count.playlists,
    },
  })
}))

export default router
