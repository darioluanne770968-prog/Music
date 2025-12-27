import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler, NotFoundError, ForbiddenError } from '../middlewares/errorHandler.js'
import { auth, optionalAuth, AuthRequest, vipRequired } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get song detail
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: {
      artist: { select: { id: true, name: true, avatar: true, isVerified: true } },
      album: { select: { id: true, name: true, cover: true, releaseDate: true } },
    },
  })

  if (!song) {
    throw new NotFoundError('歌曲不存在')
  }

  // Check if user liked
  let isLiked = false
  if (req.user) {
    const like = await prisma.userLike.findUnique({
      where: {
        userId_songId: { userId: req.user.id, songId },
      },
    })
    isLiked = !!like
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      ...song,
      playCount: Number(song.playCount),
      isLiked,
      hasLyrics: true, // TODO: check from lyrics table
      hasMv: !!song.albumId, // TODO: check from mv table
    },
  })
}))

// Get song URL (for streaming)
router.get('/:id/url', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)
  const { quality = 'high' } = req.query

  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: {
      id: true,
      name: true,
      fileUrl128: true,
      fileUrl320: true,
      fileUrlFlac: true,
      isVip: true,
    },
  })

  if (!song) {
    throw new NotFoundError('歌曲不存在')
  }

  // Check VIP requirement for high quality
  if (song.isVip && (!req.user || req.user.vipLevel < 1)) {
    throw new ForbiddenError('此歌曲需要VIP才能播放')
  }

  // Get URL based on quality
  let url = song.fileUrl128
  if (quality === 'high' || quality === '320') {
    url = song.fileUrl320 || song.fileUrl128
  } else if (quality === 'lossless' || quality === 'flac') {
    if (!req.user || req.user.vipLevel < 2) {
      throw new ForbiddenError('无损音质需要高级VIP')
    }
    url = song.fileUrlFlac || song.fileUrl320 || song.fileUrl128
  }

  // Increment play count
  await prisma.song.update({
    where: { id: songId },
    data: { playCount: { increment: 1 } },
  })

  // Record play history
  if (req.user) {
    await prisma.playHistory.create({
      data: {
        userId: req.user.id,
        songId,
        source: req.query.source as string || 'direct',
      },
    })
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      url: url || '/demo-song.mp3', // Fallback to demo
      quality,
      expiresIn: 3600, // URL expires in 1 hour
    },
  })
}))

// Get song lyrics
router.get('/:id/lyrics', asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)

  const lyrics = await prisma.lyrics.findFirst({
    where: { songId },
  })

  // Demo lyrics if none found
  const demoLyrics = `[00:00.00] 作曲 : Demo
[00:01.00] 作词 : Demo
[00:04.00]这是一首示例歌曲
[00:08.50]歌词会随着音乐同步
[00:13.00]每一行都有时间标记
[00:17.50]让你能够跟唱每句歌词`

  res.json({
    code: 200,
    message: 'success',
    data: lyrics || {
      id: 0,
      songId,
      content: demoLyrics,
      translated: null,
      romanized: null,
      type: 'lrc',
    },
  })
}))

// Like song
router.post('/:id/like', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)

  await prisma.userLike.create({
    data: {
      userId: req.user!.id,
      songId,
    },
  })

  // Increment like count
  await prisma.song.update({
    where: { id: songId },
    data: { likeCount: { increment: 1 } },
  })

  res.json({
    code: 200,
    message: '已添加到喜欢',
    data: null,
  })
}))

// Unlike song
router.delete('/:id/like', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)

  await prisma.userLike.delete({
    where: {
      userId_songId: {
        userId: req.user!.id,
        songId,
      },
    },
  })

  // Decrement like count
  await prisma.song.update({
    where: { id: songId },
    data: { likeCount: { decrement: 1 } },
  })

  res.json({
    code: 200,
    message: '已从喜欢中移除',
    data: null,
  })
}))

// Get song comments
router.get('/:id/comments', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)
  const { page = '1', limit = '20', sort = 'hot' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  const orderBy = sort === 'hot'
    ? { likeCount: 'desc' as const }
    : { createdAt: 'desc' as const }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        targetType: 'song',
        targetId: songId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, vipLevel: true },
        },
        replies: {
          take: 3,
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { replies: true } },
      },
      orderBy,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.comment.count({
      where: {
        targetType: 'song',
        targetId: songId,
        parentId: null,
      },
    }),
  ])

  res.json({
    code: 200,
    message: 'success',
    data: {
      items: comments.map((c) => ({
        ...c,
        replyCount: c._count.replies,
      })),
      total,
      page: pageNum,
      pageSize: limitNum,
      hasMore: pageNum * limitNum < total,
    },
  })
}))

// Get similar songs
router.get('/:id/similar', asyncHandler(async (req: AuthRequest, res: Response) => {
  const songId = parseInt(req.params.id)

  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: { genre: true, artistId: true },
  })

  if (!song) {
    throw new NotFoundError('歌曲不存在')
  }

  // Find similar songs by genre or artist
  const similarSongs = await prisma.song.findMany({
    where: {
      AND: [
        { id: { not: songId } },
        {
          OR: [
            { genre: song.genre },
            { artistId: song.artistId },
          ],
        },
      ],
    },
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    take: 10,
    orderBy: { playCount: 'desc' },
  })

  res.json({
    code: 200,
    message: 'success',
    data: similarSongs.map((s) => ({
      ...s,
      playCount: Number(s.playCount),
    })),
  })
}))

// Get new songs
router.get('/new', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '20' } = req.query

  const songs = await prisma.song.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { releaseDate: 'desc' },
    take: parseInt(limit as string),
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

// Get hot songs
router.get('/hot', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '50' } = req.query

  const songs = await prisma.song.findMany({
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy: { playCount: 'desc' },
    take: parseInt(limit as string),
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

export default router
