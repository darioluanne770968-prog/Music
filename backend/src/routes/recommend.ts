import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { auth, optionalAuth, AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get personalized song recommendations
router.get('/songs', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '30' } = req.query
  const limitNum = parseInt(limit as string)

  let songs

  if (req.user) {
    // Get user's listening history to understand preferences
    const history = await prisma.playHistory.findMany({
      where: { userId: req.user.id },
      include: { song: { select: { genre: true, artistId: true } } },
      orderBy: { playedAt: 'desc' },
      take: 50,
    })

    // Extract preferred genres and artists
    const genres = [...new Set(history.map((h) => h.song.genre).filter(Boolean))]
    const artistIds = [...new Set(history.map((h) => h.song.artistId))]

    // Find songs matching preferences
    songs = await prisma.song.findMany({
      where: {
        OR: [
          { genre: { in: genres as string[] } },
          { artistId: { in: artistIds } },
        ],
      },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, name: true, cover: true } },
      },
      orderBy: { playCount: 'desc' },
      take: limitNum,
    })
  } else {
    // Return popular songs for non-authenticated users
    songs = await prisma.song.findMany({
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, name: true, cover: true } },
      },
      orderBy: { playCount: 'desc' },
      take: limitNum,
    })
  }

  res.json({
    code: 200,
    message: 'success',
    data: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
  })
}))

// Get daily recommendations (30 songs)
router.get('/daily', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a real app, this would use ML to generate daily recommendations
  const songs = await prisma.song.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { playCount: 'desc' },
    take: 30,
  })

  res.json({
    code: 200,
    message: 'success',
    data: {
      date: new Date().toISOString().split('T')[0],
      songs: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
    },
  })
}))

// Get recommended playlists
router.get('/playlists', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '10' } = req.query

  const playlists = await prisma.playlist.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { playCount: 'desc' },
    take: parseInt(limit as string),
  })

  res.json({
    code: 200,
    message: 'success',
    data: playlists.map((p) => ({ ...p, playCount: Number(p.playCount) })),
  })
}))

// Personal FM - endless radio based on preferences
router.get('/fm', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get songs user hasn't played recently
  const recentHistory = await prisma.playHistory.findMany({
    where: { userId: req.user!.id },
    select: { songId: true },
    orderBy: { playedAt: 'desc' },
    take: 100,
  })

  const recentSongIds = recentHistory.map((h) => h.songId)

  const songs = await prisma.song.findMany({
    where: {
      id: { notIn: recentSongIds },
    },
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { playCount: 'desc' },
    take: 5,
  })

  res.json({
    code: 200,
    message: 'success',
    data: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
  })
}))

// Music radar - weekly personalized playlist
router.get('/radar', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songs = await prisma.song.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { playCount: 'desc' },
    take: 30,
  })

  res.json({
    code: 200,
    message: 'success',
    data: {
      name: '音乐雷达',
      description: '根据你的听歌口味生成的专属歌单',
      songs: songs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
    },
  })
}))

// Get similar songs
router.get('/similar/:songId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.songId)

  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: { genre: true, artistId: true },
  })

  if (!song) {
    return res.json({ code: 200, message: 'success', data: [] })
  }

  const similarSongs = await prisma.song.findMany({
    where: {
      id: { not: songId },
      OR: [
        { genre: song.genre },
        { artistId: song.artistId },
      ],
    },
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { playCount: 'desc' },
    take: 10,
  })

  res.json({
    code: 200,
    message: 'success',
    data: similarSongs.map((s) => ({ ...s, playCount: Number(s.playCount) })),
  })
}))

export default router
