import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { AuthRequest } from '../middlewares/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Get all charts
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const charts = [
    { id: 1, name: '热歌榜', type: 'hot', description: '实时热门歌曲排行', updateFrequency: '实时更新' },
    { id: 2, name: '新歌榜', type: 'new', description: '最新发布歌曲排行', updateFrequency: '每日更新' },
    { id: 3, name: '飙升榜', type: 'soar', description: '近期飙升最快的歌曲', updateFrequency: '每小时更新' },
    { id: 4, name: '原创榜', type: 'original', description: '优质原创音乐排行', updateFrequency: '每周更新' },
    { id: 5, name: '华语榜', type: 'chinese', description: '华语音乐热门排行', updateFrequency: '每日更新' },
    { id: 6, name: '欧美榜', type: 'western', description: '欧美音乐热门排行', updateFrequency: '每日更新' },
    { id: 7, name: '日韩榜', type: 'jpkr', description: '日韩音乐热门排行', updateFrequency: '每日更新' },
    { id: 8, name: '电子榜', type: 'electronic', description: '电子音乐热门排行', updateFrequency: '每周更新' },
  ]

  res.json({
    code: 200,
    message: 'success',
    data: charts,
  })
}))

// Get chart detail with songs
router.get('/:type', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type } = req.params
  const { limit = '100' } = req.query

  // Get songs based on chart type
  let orderBy: any = { playCount: 'desc' }
  let where: any = {}

  switch (type) {
    case 'new':
      orderBy = { releaseDate: 'desc' }
      break
    case 'soar':
      // In real app, calculate based on play count change
      orderBy = { playCount: 'desc' }
      break
    case 'chinese':
      where = { language: '华语' }
      break
    case 'western':
      where = { language: { in: ['英语', '欧美'] } }
      break
    case 'electronic':
      where = { genre: '电子' }
      break
  }

  const songs = await prisma.song.findMany({
    where,
    include: {
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, name: true, cover: true } },
    },
    orderBy,
    take: parseInt(limit as string),
  })

  // Add ranking info
  const rankedSongs = songs.map((song, index) => ({
    ...song,
    playCount: Number(song.playCount),
    rank: index + 1,
    lastRank: index + 1 + Math.floor(Math.random() * 5) - 2, // Simulated
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)],
  }))

  const chartInfo: Record<string, any> = {
    hot: { name: '热歌榜', description: '实时热门歌曲排行' },
    new: { name: '新歌榜', description: '最新发布歌曲排行' },
    soar: { name: '飙升榜', description: '近期飙升最快的歌曲' },
    original: { name: '原创榜', description: '优质原创音乐排行' },
    chinese: { name: '华语榜', description: '华语音乐热门排行' },
    western: { name: '欧美榜', description: '欧美音乐热门排行' },
    jpkr: { name: '日韩榜', description: '日韩音乐热门排行' },
    electronic: { name: '电子榜', description: '电子音乐热门排行' },
  }

  res.json({
    code: 200,
    message: 'success',
    data: {
      type,
      ...chartInfo[type] || { name: '排行榜', description: '' },
      updateTime: new Date().toISOString(),
      songs: rankedSongs,
    },
  })
}))

export default router
