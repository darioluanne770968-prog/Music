import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/services/netease'
import { useUserStore } from '@/stores/userStore'

interface Comment {
  id: number
  content: string
  time: number
  likeCount: number
  liked: boolean
  user: {
    id: number
    name: string
    avatar: string
  }
  beReplied?: {
    content: string
    user: {
      id: number
      name: string
    }
  }
}

interface CommentSectionProps {
  resourceId: number
  resourceType: 'song' | 'playlist' | 'album' | 'mv'
  className?: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  resourceId,
  resourceType,
  className = '',
}) => {
  const { isAuthenticated } = useUserStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [hotComments, setHotComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'hot' | 'new'>('hot')

  const limit = 20

  // Get comment type for API
  const getCommentType = () => {
    switch (resourceType) {
      case 'song': return 0
      case 'mv': return 1
      case 'playlist': return 2
      case 'album': return 3
      default: return 0
    }
  }

  // Format comment data
  const formatComment = (raw: any): Comment => ({
    id: raw.commentId,
    content: raw.content,
    time: raw.time,
    likeCount: raw.likedCount || 0,
    liked: raw.liked || false,
    user: {
      id: raw.user?.userId,
      name: raw.user?.nickname,
      avatar: raw.user?.avatarUrl,
    },
    beReplied: raw.beReplied?.[0] ? {
      content: raw.beReplied[0].content,
      user: {
        id: raw.beReplied[0].user?.userId,
        name: raw.beReplied[0].user?.nickname,
      },
    } : undefined,
  })

  // Fetch comments
  const fetchComments = useCallback(async (isLoadMore = false) => {
    if (!resourceId) return

    try {
      if (!isLoadMore) {
        setLoading(true)
      }

      const offset = isLoadMore ? (page + 1) * limit : 0

      let res: any
      switch (resourceType) {
        case 'song':
          res = await api.getMusicComments(resourceId, limit, offset)
          break
        case 'playlist':
          res = await api.getPlaylistComments(resourceId, limit, offset)
          break
        case 'album':
          res = await api.getAlbumComments(resourceId, limit, offset)
          break
        case 'mv':
          res = await api.getMvComments(resourceId, limit, offset)
          break
      }

      if (res?.code === 200) {
        const newComments = (res.comments || []).map(formatComment)
        const newHotComments = (res.hotComments || []).map(formatComment)

        if (isLoadMore) {
          setComments((prev) => [...prev, ...newComments])
          setPage((prev) => prev + 1)
        } else {
          setComments(newComments)
          setHotComments(newHotComments)
          setPage(0)
        }

        setTotal(res.total || 0)
        setHasMore(newComments.length === limit)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }, [resourceId, resourceType, page])

  // Initial fetch
  useEffect(() => {
    fetchComments()
  }, [resourceId])

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    if (days < 365) return `${date.getMonth() + 1}月${date.getDate()}日`
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  // Like comment
  const handleLike = async (commentId: number, liked: boolean) => {
    if (!isAuthenticated) {
      // Show login prompt
      return
    }

    try {
      const res = await api.likeComment(resourceId, commentId, liked ? 0 : 1, getCommentType())
      if (res?.code === 200) {
        // Update local state
        const updateComments = (comments: Comment[]) =>
          comments.map((c) =>
            c.id === commentId
              ? { ...c, liked: !liked, likeCount: c.likeCount + (liked ? -1 : 1) }
              : c
          )
        setComments(updateComments)
        setHotComments(updateComments)
      }
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  // Send comment
  const handleSend = async () => {
    if (!inputValue.trim() || !isAuthenticated || sending) return

    setSending(true)
    try {
      const res = await api.sendComment(1, getCommentType(), resourceId, inputValue.trim())
      if (res?.code === 200) {
        setInputValue('')
        setShowInput(false)
        // Refresh comments
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to send comment:', error)
    } finally {
      setSending(false)
    }
  }

  const displayComments = activeTab === 'hot' ? hotComments : comments

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">评论</h3>
          <span className="text-sm text-white/40">({total})</span>
        </div>

        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          写评论
        </button>
      </div>

      {/* Comment Input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl p-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isAuthenticated ? '分享你的想法...' : '请先登录后再评论'}
                disabled={!isAuthenticated}
                className="w-full h-24 bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none"
                maxLength={140}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/40">{inputValue.length}/140</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInput(false)}
                    className="px-4 py-1.5 rounded-full text-white/60 text-sm hover:text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || !isAuthenticated || sending}
                    className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {sending ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('hot')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'hot'
              ? 'text-primary-500 border-primary-500'
              : 'text-white/50 border-transparent hover:text-white'
          }`}
        >
          精彩评论 ({hotComments.length})
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'new'
              ? 'text-primary-500 border-primary-500'
              : 'text-white/50 border-transparent hover:text-white'
          }`}
        >
          最新评论 ({total})
        </button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : displayComments.length === 0 ? (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-white/20 mb-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          <p className="text-white/40">暂无评论</p>
          <p className="text-sm text-white/30 mt-1">快来抢沙发吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              {/* Avatar */}
              <img
                src={comment.user.avatar || '/default-avatar.jpg'}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white/80">{comment.user.name}</span>
                  <span className="text-xs text-white/30">{formatTime(comment.time)}</span>
                </div>

                <p className="text-sm text-white/90 break-words">{comment.content}</p>

                {/* Replied comment */}
                {comment.beReplied && (
                  <div className="mt-2 p-2 rounded-lg bg-white/5 text-sm">
                    <span className="text-primary-400">@{comment.beReplied.user.name}</span>
                    <span className="text-white/50 ml-1">{comment.beReplied.content}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleLike(comment.id, comment.liked)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      comment.liked ? 'text-primary-500' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill={comment.liked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                    </svg>
                    {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                  </button>

                  <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
                    回复
                  </button>

                  <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
                    分享
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Load More */}
          {activeTab === 'new' && hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={() => fetchComments(true)}
                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
              >
                加载更多
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentSection
