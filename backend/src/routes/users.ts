import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js'
import { auth, optionalAuth, AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Update user profile
router.put('/me', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const updateSchema = z.object({
    username: z.string().min(2).max(50).optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
  })

  const data = updateSchema.parse(req.body)

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
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
    },
  })

  res.json({
    code: 200,
    message: '更新成功',
    data: user,
  })
}))

// Get user settings
router.get('/me/settings', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: req.user!.id },
  })

  res.json({
    code: 200,
    message: 'success',
    data: settings,
  })
}))

// Update user settings
router.put('/me/settings', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user!.id },
    update: req.body,
    create: {
      userId: req.user!.id,
      ...req.body,
    },
  })

  res.json({
    code: 200,
    message: '设置已更新',
    data: settings,
  })
}))

// Get user profile by ID
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      level: true,
      vipLevel: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          playlists: { where: { isPublic: true } },
        },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('用户不存在')
  }

  // Check if current user is following
  let isFollowing = false
  if (req.user) {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    })
    isFollowing = !!follow
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...user,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      playlistCount: user._count.playlists,
      isFollowing,
    },
  })
}))

// Get user's playlists
router.get('/:id/playlists', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id)
  const { page = '1', limit = '20' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const isOwner = req.user?.id === userId

  const [playlists, total] = await Promise.all([
    prisma.playlist.findMany({
      where: {
        userId,
        ...(isOwner ? {} : { isPublic: true }),
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.playlist.count({
      where: {
        userId,
        ...(isOwner ? {} : { isPublic: true }),
      },
    }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: playlists,
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get user's followers
router.get('/:id/followers', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id)
  const { page = '1', limit = '20' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [followers, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true, avatar: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.userFollow.count({ where: { followingId: userId } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: followers.map((f) => f.follower),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get user's following
router.get('/:id/following', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id)
  const { page = '1', limit = '20' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [following, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, username: true, avatar: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: following.map((f) => f.following),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Follow user
router.post('/:id/follow', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = parseInt(req.params.id)

  if (targetUserId === req.user!.id) {
    throw new Error('不能关注自己')
  }

  await prisma.userFollow.create({
    data: {
      followerId: req.user!.id,
      followingId: targetUserId,
    },
  })

  res.json({
    code: 200,
    message: '关注成功',
    data: null,
  })
}))

// Unfollow user
router.delete('/:id/follow', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = parseInt(req.params.id)

  await prisma.userFollow.delete({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: targetUserId,
      },
    },
  })

  res.json({
    code: 200,
    message: '已取消关注',
    data: null,
  })
}))

// Get user's liked songs
router.get('/me/likes', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50' } = req.query
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [likes, total] = await Promise.all([
    prisma.userLike.findMany({
      where: { userId: req.user!.id },
      include: {
        song: {
          include: {
            artist: { select: { id: true, name: true, avatar: true } },
            album: { select: { id: true, name: true, cover: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.userLike.count({ where: { userId: req.user!.id } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: likes.map((l) => ({ ...l.song, isLiked: true })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get play history
router.get('/me/history', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50' } = req.query
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [history, total] = await Promise.all([
    prisma.playHistory.findMany({
      where: { userId: req.user!.id },
      include: {
        song: {
          include: {
            artist: { select: { id: true, name: true } },
            album: { select: { id: true, name: true, cover: true } },
          },
        },
      },
      orderBy: { playedAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.playHistory.count({ where: { userId: req.user!.id } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: history.map((h) => ({
        ...h.song,
        playedAt: h.playedAt,
      })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

export default router
