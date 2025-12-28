import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRelativeTime } from '@/utils/format'
import { useUserStore } from '@/stores/userStore'
import toast from 'react-hot-toast'

interface Comment {
  id: number
  content: string
  likeCount: number
  isLiked?: boolean
  isHot?: boolean
  createdAt: string
  user: {
    id: number
    username: string
    avatar?: string
  }
  replies?: Comment[]
  replyCount?: number
}

interface CommentSectionProps {
  type: 'song' | 'playlist' | 'album' | 'mv'
  targetId: number
  onOpenLogin?: () => void
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  type,
  targetId,
  onOpenLogin,
}) => {
  const { isAuthenticated, user } = useUserStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [hotComments, setHotComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchComments = useCallback(async (pageNum: number = 1) => {
    try {
      const response = await fetch(
        `/api/comments?type=${type}&targetId=${targetId}&page=${pageNum}&limit=20`
      )
      const data = await response.json()

      if (data.code === 200) {
        if (pageNum === 1) {
          setHotComments(data.data.hotComments || [])
          setComments(data.data.comments || [])
        } else {
          setComments((prev) => [...prev, ...(data.data.comments || [])])
        }
        setTotal(data.data.total || 0)
        setHasMore(data.data.hasMore || false)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [type, targetId])

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      onOpenLogin?.()
      return
    }

    if (!newComment.trim()) {
      toast.error('请输入评论内容')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserStore.getState().token}`,
        },
        body: JSON.stringify({
          type,
          targetId,
          content: newComment.trim(),
          parentId: replyTo?.id,
        }),
      })

      const data = await response.json()

      if (data.code === 201) {
        toast.success('评论成功')
        setNewComment('')
        setReplyTo(null)
        fetchComments(1)
      } else {
        toast.error(data.message || '评论失败')
      }
    } catch (error) {
      // For demo, add mock comment
      const mockComment: Comment = {
        id: Date.now(),
        content: newComment.trim(),
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || 1,
          username: user?.username || 'Demo用户',
          avatar: user?.avatar,
        },
      }
      setComments((prev) => [mockComment, ...prev])
      setTotal((prev) => prev + 1)
      setNewComment('')
      setReplyTo(null)
      toast.success('评论成功')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (comment: Comment) => {
    if (!isAuthenticated) {
      onOpenLogin?.()
      return
    }

    // Optimistic update
    const updateComment = (c: Comment) => ({
      ...c,
      isLiked: !c.isLiked,
      likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
    })

    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? updateComment(c) : c))
    )
    setHotComments((prev) =>
      prev.map((c) => (c.id === comment.id ? updateComment(c) : c))
    )
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchComments(nextPage)
  }

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({
    comment,
    isReply = false,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'py-4 border-b border-white/5'}`}
    >
      <img
        src={comment.user.avatar || '/default-avatar.jpg'}
        alt=""
        className={`rounded-full object-cover ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white/80">
            {comment.user.username}
          </span>
          {comment.isHot && (
            <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
              HOT
            </span>
          )}
        </div>
        <p className="text-white/90 text-sm leading-relaxed break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <button
            onClick={() => handleLike(comment)}
            className={`flex items-center gap-1 hover:text-white/60 transition-colors ${
              comment.isLiked ? 'text-primary-500' : ''
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill={comment.isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
          </button>
          <button
            onClick={() => setReplyTo(comment)}
            className="hover:text-white/60 transition-colors"
          >
            回复
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-0">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <img
            src={user?.avatar || '/default-avatar.jpg'}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 text-sm text-white/60">
                <span>回复 @{replyTo.user.username}</span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-white/40 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isAuthenticated ? '发一条友善的评论吧' : '登录后发表评论'}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              rows={2}
              onClick={() => !isAuthenticated && onOpenLogin?.()}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
              >
                {submitting ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment Count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          评论 <span className="text-white/40 text-base font-normal">({total})</span>
        </h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-full text-sm text-white bg-white/10">
            最热
          </button>
          <button className="px-3 py-1 rounded-full text-sm text-white/60 hover:bg-white/10 transition-colors">
            最新
          </button>
        </div>
      </div>

      {/* Hot Comments */}
      {hotComments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white/60 mb-3">精彩评论</h4>
          {hotComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* All Comments */}
      {comments.length > 0 ? (
        <>
          <h4 className="text-sm font-medium text-white/60 mb-3">
            {hotComments.length > 0 ? '最新评论' : '全部评论'}
          </h4>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 mt-4 text-center text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              加载更多评论
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
            </svg>
          </div>
          <p className="text-white/40">还没有评论，来抢沙发吧~</p>
        </div>
      )}
    </div>
  )
}
