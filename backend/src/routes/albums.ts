import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js'
import { AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get album detail
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const albumId = parseInt(req.params.id)

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      artist: {
        select: { id: true, name: true, avatar: true, isVerified: true },
      },
      songs: {
        include: {
          artist: { select: { id: true, name: true } },
        },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!album) {
    throw new NotFoundError('专辑不存在')
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...album,
      songs: album.songs.map((s) => ({
        ...s,
        playCount: Number(s.playCount),
      })),
    },
  })
}))

// Get album songs
router.get('/:id/songs', asyncHandler(async (req: AuthRequest, res: Response) => {
  const albumId = parseInt(req.params.id)

  const songs = await prisma.song.findMany({
    where: { albumId },
    include: {
      artist: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  })

  res.json({
    code: 200,
    message: 'success',
    data: songs.map((s) => ({
      ...s,
      playCount: Number(s.playCount),
    })),
  })
}))

// Get new albums
router.get('/new', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '20' } = req.query

  const albums = await prisma.album.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      _count: { select: { songs: true } },
    },
    orderBy: { releaseDate: 'desc' },
    take: parseInt(limit as string),
  })

  res.json({
    code: 200,
    message: 'success',
    data: albums.map((a) => ({
      ...a,
      songCount: a._count.songs,
    })),
  })
}))

// Get hot albums
router.get('/hot', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '20' } = req.query

  // Get albums with most played songs
  const albums = await prisma.album.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      _count: { select: { songs: true } },
    },
    take: parseInt(limit as string),
  })

  res.json({
    code: 200,
    message: 'success',
    data: albums.map((a) => ({
      ...a,
      songCount: a._count.songs,
    })),
  })
}))

export default router
