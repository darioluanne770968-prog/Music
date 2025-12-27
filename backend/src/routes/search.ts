import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { optionalAuth, AuthRequest } from '../middlewares/auth.js'
import { searchRateLimiter } from '../middlewares/rateLimiter.js'

const router = Router()
const prisma = new PrismaClient()

// Combined search
router.get('/', searchRateLimiter, optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, limit = '10' } = req.query

  if (!q || typeof q !== 'string') {
    return res.json({
      code: 200,
      message: 'success',
      data: { songs: [], artists: [], albums: [], playlists: [], users: [] },
    })
  }

  const limitNum = Math.min(parseInt(limit as string), 50)

  const [songs, artists, albums, playlists, users] = await Promise.all([
    prisma.song.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, name: true, cover: true } },
      },
      take: limitNum,
    }),
    prisma.artist.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: limitNum,
    }),
    prisma.album.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: {
        artist: { select: { id: true, name: true } },
      },
      take: limitNum,
    }),
    prisma.playlist.findMany({
      where: {
        isPublic: true,
        name: { contains: q, mode: 'insensitive' },
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      take: limitNum,
    }),
    prisma.user.findMany({
      where: { username: { contains: q, mode: 'insensitive' } },
      select: { id: true, username: true, avatar: true, bio: true },
      take: limitNum,
    }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      songs: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
      artists,
      albums,
      playlists: playlists.map((p) => ({ ...p, playCount: Number(p.playCount) })),
      users,
    },
  })
}))

// Search songs only
router.get('/songs', searchRateLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, page = '1', limit = '30' } = req.query

  if (!q) {
    return res.json({ code: 200, message: 'success', data: { items: [], total: 0 } })
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where: { name: { contains: q as string, mode: 'insensitive' } },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, name: true, cover: true } },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.song.count({
      where: { name: { contains: q as string, mode: 'insensitive' } },
    }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get search suggestions
router.get('/suggest', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query

  if (!q || typeof q !== 'string' || q.length < 1) {
    return res.json({ code: 200, message: 'success', data: [] })
  }

  // Get song and artist names that match
  const [songs, artists] = await Promise.all([
    prisma.song.findMany({
      where: { name: { startsWith: q, mode: 'insensitive' } },
      select: { name: true },
      take: 5,
    }),
    prisma.artist.findMany({
      where: { name: { startsWith: q, mode: 'insensitive' } },
      select: { name: true },
      take: 5,
    }),
  ])

  const suggestions = [
    ...songs.map((s) => ({ keyword: s.name, type: 'song' })),
    ...artists.map((a) => ({ keyword: a.name, type: 'artist' })),
  ]

  res.json({
    code: 200,
    message: 'success',
    data: suggestions.slice(0, 10),
  })
}))

// Get hot searches
router.get('/hot', asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a real app, this would be based on actual search statistics
  const hotSearches = [
    { keyword: '周杰伦', score: 100, iconType: 'hot' },
    { keyword: '起风了', score: 95, iconType: 'up' },
    { keyword: '孤勇者', score: 90, iconType: 'hot' },
    { keyword: '稻香', score: 85 },
    { keyword: '漠河舞厅', score: 80, iconType: 'new' },
    { keyword: '陈奕迅', score: 75 },
    { keyword: '薛之谦', score: 70 },
    { keyword: '林俊杰', score: 65 },
    { keyword: '邓紫棋', score: 60 },
    { keyword: '华晨宇', score: 55 },
  ]

  res.json({
    code: 200,
    message: 'success',
    data: hotSearches,
  })
}))

export default router
