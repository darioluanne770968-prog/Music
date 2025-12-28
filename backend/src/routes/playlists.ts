import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { asyncHandler, NotFoundError, ForbiddenError } from '../middlewares/errorHandler.js'
import { auth, optionalAuth, AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get playlist categories (must be before /:id)
router.get('/categories', asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = [
    { id: 1, name: '推荐', icon: '🎵' },
    { id: 2, name: '华语', icon: '🇨🇳' },
    { id: 3, name: '欧美', icon: '🌍' },
    { id: 4, name: '日韩', icon: '🇯🇵' },
    { id: 5, name: '电子', icon: '🎧' },
    { id: 6, name: '说唱', icon: '🎤' },
    { id: 7, name: '民谣', icon: '🎸' },
    { id: 8, name: '摇滚', icon: '🎸' },
    { id: 9, name: '古典', icon: '🎻' },
    { id: 10, name: '轻音乐', icon: '🎹' },
    { id: 11, name: '运动', icon: '🏃' },
    { id: 12, name: '学习', icon: '📚' },
    { id: 13, name: '睡眠', icon: '😴' },
    { id: 14, name: '心情', icon: '💭' },
  ]

  res.json({
    code: 200,
    message: 'success',
    data: categories,
  })
}))

// Get hot playlists (must be before /:id)
router.get('/hot', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, limit = '20' } = req.query

  const playlists = await prisma.playlist.findMany({
    where: {
      isPublic: true,
      ...(category ? { tags: { has: category as string } } : {}),
    },
    include: {
      user: {
        select: { id: true, username: true, avatar: true },
      },
    },
    orderBy: { playCount: 'desc' },
    take: parseInt(limit as string),
  })

  res.json({
    code: 200,
    message: 'success',
    data: playlists.map((p) => ({
      ...p,
      playCount: Number(p.playCount),
    })),
  })
}))

// Create playlist
router.post('/', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    cover: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  })

  const data = schema.parse(req.body)

  const playlist = await prisma.playlist.create({
    data: {
      ...data,
      userId: req.user!.id,
      tags: data.tags || [],
    },
    include: {
      user: {
        select: { id: true, username: true, avatar: true },
      },
    },
  })

  res.status(201).json({
    code: 201,
    message: '歌单创建成功',
    data: playlist,
  })
}))

// Get playlist detail
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const playlistId = parseInt(req.params.id)

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      user: {
        select: { id: true, username: true, avatar: true },
      },
      songs: {
        include: {
          song: {
            include: {
              artist: { select: { id: true, name: true } },
              album: { select: { id: true, name: true, cover: true } },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!playlist) {
    throw new NotFoundError('歌单不存在')
  }

  // Check if private and not owner
  if (!playlist.isPublic && req.user?.id !== playlist.userId) {
    throw new ForbiddenError('无权访问此歌单')
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...playlist,
      playCount: Number(playlist.playCount),
      songs: playlist.songs.map((ps) => ({
        ...ps.song,
        playCount: Number(ps.song.playCount),
        addedAt: ps.addedAt,
      })),
    },
  })
}))

// Update playlist
router.put('/:id', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const playlistId = parseInt(req.params.id)

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  if (!playlist) {
    throw new NotFoundError('歌单不存在')
  }

  if (playlist.userId !== req.user!.id) {
    throw new ForbiddenError('无权修改此歌单')
  }

  const schema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    cover: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  })

  const data = schema.parse(req.body)

  const updated = await prisma.playlist.update({
    where: { id: playlistId },
    data,
    include: {
      user: {
        select: { id: true, username: true, avatar: true },
      },
    },
  })

  res.json({
    code: 200,
    message: '歌单更新成功',
    data: updated,
  })
}))

// Delete playlist
router.delete('/:id', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const playlistId = parseInt(req.params.id)

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  if (!playlist) {
    throw new NotFoundError('歌单不存在')
  }

  if (playlist.userId !== req.user!.id) {
    throw new ForbiddenError('无权删除此歌单')
  }

  await prisma.playlist.delete({
    where: { id: playlistId },
  })

  res.json({
    code: 200,
    message: '歌单已删除',
    data: null,
  })
}))

// Add songs to playlist
router.post('/:id/songs', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const playlistId = parseInt(req.params.id)
  const { songIds } = req.body

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  if (!playlist) {
    throw new NotFoundError('歌单不存在')
  }

  if (playlist.userId !== req.user!.id) {
    throw new ForbiddenError('无权修改此歌单')
  }

  // Get current max order
  const maxOrder = await prisma.playlistSong.aggregate({
    where: { playlistId },
    _max: { sortOrder: true },
  })

  let order = (maxOrder._max.sortOrder || 0) + 1

  // Add songs
  await prisma.playlistSong.createMany({
    data: songIds.map((songId: number) => ({
      playlistId,
      songId,
      sortOrder: order++,
    })),
    skipDuplicates: true,
  })

  // Update song count
  const count = await prisma.playlistSong.count({
    where: { playlistId },
  })

  await prisma.playlist.update({
    where: { id: playlistId },
    data: { songCount: count },
  })

  res.json({
    code: 200,
    message: '歌曲已添加',
    data: null,
  })
}))

// Remove songs from playlist
router.delete('/:id/songs', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const playlistId = parseInt(req.params.id)
  const { songIds } = req.body

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  if (!playlist) {
    throw new NotFoundError('歌单不存在')
  }

  if (playlist.userId !== req.user!.id) {
    throw new ForbiddenError('无权修改此歌单')
  }

  await prisma.playlistSong.deleteMany({
    where: {
      playlistId,
      songId: { in: songIds },
    },
  })

  // Update song count
  const count = await prisma.playlistSong.count({
    where: { playlistId },
  })

  await prisma.playlist.update({
    where: { id: playlistId },
    data: { songCount: count },
  })

  res.json({
    code: 200,
    message: '歌曲已移除',
    data: null,
  })
}))

export default router
