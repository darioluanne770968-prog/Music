import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js'
import { optionalAuth, AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get hot artists (must be before /:id)
router.get('/hot', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '50' } = req.query

  const artists = await prisma.artist.findMany({
    orderBy: { followerCount: 'desc' },
    take: parseInt(limit as string),
  })

  res.json({
    code: 200,
    message: 'success',
    data: artists,
  })
}))

// Get artist detail
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const artistId = parseInt(req.params.id)

  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    include: {
      _count: {
        select: {
          songs: true,
          albums: true,
        },
      },
    },
  })

  if (!artist) {
    throw new NotFoundError('歌手不存在')
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...artist,
      songCount: artist._count.songs,
      albumCount: artist._count.albums,
    },
  })
}))

// Get artist's songs
router.get('/:id/songs', asyncHandler(async (req: AuthRequest, res: Response) => {
  const artistId = parseInt(req.params.id)
  const { page = '1', limit = '50' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where: { artistId },
      include: {
        album: { select: { id: true, name: true, cover: true } },
      },
      orderBy: { playCount: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.song.count({ where: { artistId } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: songs.map((s) => ({
        ...s,
        playCount: Number(s.playCount),
        artist: { id: artistId },
      })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get artist's albums
router.get('/:id/albums', asyncHandler(async (req: AuthRequest, res: Response) => {
  const artistId = parseInt(req.params.id)
  const { page = '1', limit = '20' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const [albums, total] = await Promise.all([
    prisma.album.findMany({
      where: { artistId },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { releaseDate: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.album.count({ where: { artistId } }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: albums.map((a) => ({
        ...a,
        songCount: a._count.songs,
      })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get artist's MVs
router.get('/:id/mvs', asyncHandler(async (req: AuthRequest, res: Response) => {
  const artistId = parseInt(req.params.id)

  const mvs = await prisma.mV.findMany({
    where: { artistId },
    orderBy: { playCount: 'desc' },
  })

  res.json({
    code: 200,
    message: 'success',
    data: mvs.map((mv) => ({
      ...mv,
      playCount: Number(mv.playCount),
    })),
  })
}))

export default router
