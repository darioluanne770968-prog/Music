import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { asyncHandler, NotFoundError, ForbiddenError } from '../middlewares/errorHandler.js'
import { auth, AuthRequest } from '../middlewares/auth.js'
import { commentRateLimiter } from '../middlewares/rateLimiter.js'

const router = Router()
const prisma = new PrismaClient()

// Create comment (for songs, playlists, mvs, albums)
router.post('/:targetType/:targetId', auth, commentRateLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { targetType, targetId } = req.params

  const schema = z.object({
    content: z.string().min(1).max(1000),
    images: z.array(z.string().url()).optional(),
    parentId: z.number().optional(),
  })

  const { content, images, parentId } = schema.parse(req.body)

  const comment = await prisma.comment.create({
    data: {
      userId: req.user!.id,
      targetType,
      targetId: parseInt(targetId),
      content,
      images: images || [],
      parentId,
    },
    include: {
      user: {
        select: { id: true, username: true, avatar: true, vipLevel: true },
      },
    },
  })

  // Update parent reply count
  if (parentId) {
    await prisma.comment.update({
      where: { id: parentId },
      data: { replyCount: { increment: 1 } },
    })
  }

  // Update target comment count
  if (targetType === 'song') {
    await prisma.song.update({
      where: { id: parseInt(targetId) },
      data: { commentCount: { increment: 1 } },
    })
  }

  res.status(201).json({
    code: 201,
    message: '评论成功',
    data: comment,
  })
}))

// Get comment detail
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.id)

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: {
        select: { id: true, username: true, avatar: true, vipLevel: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!comment) {
    throw new NotFoundError('评论不存在')
  }

  res.json({
    code: 200,
    message: 'success',
    data: comment,
  })
}))

// Like comment
router.post('/:id/like', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.id)

  await prisma.comment.update({
    where: { id: commentId },
    data: { likeCount: { increment: 1 } },
  })

  res.json({
    code: 200,
    message: '点赞成功',
    data: null,
  })
}))

// Unlike comment
router.delete('/:id/like', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.id)

  await prisma.comment.update({
    where: { id: commentId },
    data: { likeCount: { decrement: 1 } },
  })

  res.json({
    code: 200,
    message: '已取消点赞',
    data: null,
  })
}))

// Reply to comment
router.post('/:id/reply', auth, commentRateLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parentId = parseInt(req.params.id)

  const parent = await prisma.comment.findUnique({
    where: { id: parentId },
  })

  if (!parent) {
    throw new NotFoundError('评论不存在')
  }

  const schema = z.object({
    content: z.string().min(1).max(1000),
  })

  const { content } = schema.parse(req.body)

  const reply = await prisma.comment.create({
    data: {
      userId: req.user!.id,
      targetType: parent.targetType,
      targetId: parent.targetId,
      content,
      parentId,
    },
    include: {
      user: {
        select: { id: true, username: true, avatar: true },
      },
    },
  })

  // Update parent reply count
  await prisma.comment.update({
    where: { id: parentId },
    data: { replyCount: { increment: 1 } },
  })

  res.status(201).json({
    code: 201,
    message: '回复成功',
    data: reply,
  })
}))

// Delete comment
router.delete('/:id', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.id)

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) {
    throw new NotFoundError('评论不存在')
  }

  if (comment.userId !== req.user!.id) {
    throw new ForbiddenError('无权删除此评论')
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  // Update target comment count
  if (comment.targetType === 'song') {
    await prisma.song.update({
      where: { id: comment.targetId },
      data: { commentCount: { decrement: 1 } },
    })
  }

  res.json({
    code: 200,
    message: '评论已删除',
    data: null,
  })
}))

// Report comment
router.post('/:id/report', auth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.id)

  // In a real app, save the report to a reports table
  console.log(`Comment ${commentId} reported by user ${req.user!.id}`)

  res.json({
    code: 200,
    message: '举报成功，我们会尽快处理',
    data: null,
  })
}))

export default router
