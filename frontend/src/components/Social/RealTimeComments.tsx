import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 实时评论系统
 * 支持弹幕式评论、实时互动、热评高亮
 */

// 评论类型
export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: number
  songTime?: number // 歌曲时间点评论
  likes: number
  isLiked: boolean
  replies: Comment[]
  isHot?: boolean
  badges?: string[]
}

// 弹幕评论
export interface DanmakuComment {
  id: string
  content: string
  color: string
  time: number // 歌曲时间
  type: 'scroll' | 'top' | 'bottom'
}

// WebSocket 消息类型
type WSMessageType = 'comment' | 'like' | 'reply' | 'delete' | 'danmaku'

interface WSMessage {
  type: WSMessageType
  data: any
  timestamp: number
}

// 实时评论 Hook
export function useRealTimeComments(songId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [danmakus, setDanmakus] = useState<DanmakuComment[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`wss://api.example.com/comments/${songId}`)

    ws.onopen = () => {
      setIsConnected(true)
      console.log('Comments WebSocket connected')
    }

    ws.onmessage = (event) => {
      const message: WSMessage = JSON.parse(event.data)

      switch (message.type) {
        case 'comment':
          setComments(prev => [message.data, ...prev])
          break
        case 'like':
          setComments(prev => prev.map(c =>
            c.id === message.data.commentId
              ? { ...c, likes: message.data.likes, isLiked: message.data.isLiked }
              : c
          ))
          break
        case 'reply':
          setComments(prev => prev.map(c =>
            c.id === message.data.parentId
              ? { ...c, replies: [...c.replies, message.data.reply] }
              : c
          ))
          break
        case 'danmaku':
          setDanmakus(prev => [...prev, message.data])
          break
        default:
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      // 自动重连
      setTimeout(connect, 3000)
    }

    ws.onerror = (error) => {
      console.error('Comments WebSocket error:', error)
    }

    wsRef.current = ws
  }, [songId])

  // 断开连接
  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  // 发送评论
  const sendComment = useCallback((content: string, songTime?: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({
      type: 'comment',
      data: { content, songTime },
      timestamp: Date.now()
    }))
  }, [])

  // 发送弹幕
  const sendDanmaku = useCallback((content: string, time: number, color = '#ffffff') => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({
      type: 'danmaku',
      data: { content, time, color, type: 'scroll' },
      timestamp: Date.now()
    }))
  }, [])

  // 点赞
  const likeComment = useCallback((commentId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({
      type: 'like',
      data: { commentId },
      timestamp: Date.now()
    }))
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    comments,
    danmakus,
    isConnected,
    sendComment,
    sendDanmaku,
    likeComment
  }
}

// 评论列表组件
interface CommentListProps {
  songId: string
  currentTime: number
}

export const CommentList: React.FC<CommentListProps> = ({ songId, currentTime }) => {
  const { comments, isConnected, sendComment, likeComment } = useRealTimeComments(songId)
  const [newComment, setNewComment] = useState('')
  const [showTimeComment, setShowTimeComment] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'hot'>('time')
  const listRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    sendComment(newComment, showTimeComment ? currentTime : undefined)
    setNewComment('')
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'hot') {
      return b.likes - a.likes
    }
    return b.timestamp - a.timestamp
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full">
      {/* 连接状态 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-white/60">
            {isConnected ? '实时连接中' : '连接断开'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'time' ? 'bg-primary-500 text-white' : 'text-white/60'
            }`}
          >
            最新
          </button>
          <button
            onClick={() => setSortBy('hot')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'hot' ? 'bg-primary-500 text-white' : 'text-white/60'
            }`}
          >
            热门
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      <div ref={listRef} className="flex-1 overflow-auto px-4 py-2 space-y-4">
        <AnimatePresence>
          {sortedComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`p-3 rounded-xl ${
                comment.isHot ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-white/5'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{comment.userName}</span>
                    {comment.badges?.map((badge, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
                        {badge}
                      </span>
                    ))}
                    {comment.songTime !== undefined && (
                      <span className="text-xs text-primary-400">
                        @ {formatTime(comment.songTime)}
                      </span>
                    )}
                    {comment.isHot && (
                      <span className="text-xs text-orange-400">🔥 热评</span>
                    )}
                  </div>
                  <p className="text-white/80 mt-1">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/40">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                    <button
                      onClick={() => likeComment(comment.id)}
                      className={`flex items-center gap-1 text-xs ${
                        comment.isLiked ? 'text-red-400' : 'text-white/40'
                      }`}
                    >
                      <span>{comment.isLiked ? '❤️' : '🤍'}</span>
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-xs text-white/40">
                      回复
                    </button>
                  </div>

                  {/* 回复列表 */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-white/10 space-y-2">
                      {comment.replies.slice(0, 3).map((reply) => (
                        <div key={reply.id} className="text-sm">
                          <span className="text-primary-400">{reply.userName}</span>
                          <span className="text-white/60">：{reply.content}</span>
                        </div>
                      ))}
                      {comment.replies.length > 3 && (
                        <button className="text-xs text-primary-400">
                          查看全部 {comment.replies.length} 条回复
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 评论输入 */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowTimeComment(!showTimeComment)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              showTimeComment ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            📍 时间点评论
          </button>
          {showTimeComment && (
            <span className="text-xs text-white/60">
              将在 {formatTime(currentTime)} 显示
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表评论..."
            className="flex-1 px-4 py-2 bg-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-6 py-2 bg-primary-500 text-white rounded-full disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  )
}

// 弹幕显示组件
interface DanmakuDisplayProps {
  danmakus: DanmakuComment[]
  currentTime: number
  enabled: boolean
}

export const DanmakuDisplay: React.FC<DanmakuDisplayProps> = ({
  danmakus,
  currentTime,
  enabled
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeDanmakus, setActiveDanmakus] = useState<(DanmakuComment & { track: number; left: number })[]>([])
  const tracks = useRef<number[]>([0, 0, 0, 0, 0]) // 5 条弹幕轨道

  useEffect(() => {
    if (!enabled) return

    // 找出当前时间点的弹幕
    const currentDanmakus = danmakus.filter(
      d => d.time >= currentTime - 0.5 && d.time <= currentTime + 0.5
    )

    // 为新弹幕分配轨道
    const newActive = currentDanmakus.map(d => {
      const now = Date.now()
      // 找到最早可用的轨道
      let track = 0
      let minTime = tracks.current[0]
      for (let i = 1; i < tracks.current.length; i++) {
        if (tracks.current[i] < minTime) {
          minTime = tracks.current[i]
          track = i
        }
      }
      // 更新轨道占用时间
      tracks.current[track] = now + 8000

      return { ...d, track, left: 100 }
    })

    if (newActive.length > 0) {
      setActiveDanmakus(prev => [...prev, ...newActive])
    }

    // 清理已经滚出屏幕的弹幕
    const cleanup = setInterval(() => {
      setActiveDanmakus(prev => prev.filter(d => d.left > -100))
    }, 1000)

    return () => clearInterval(cleanup)
  }, [currentTime, danmakus, enabled])

  // 更新弹幕位置
  useEffect(() => {
    if (!enabled) return

    const animate = () => {
      setActiveDanmakus(prev => prev.map(d => ({
        ...d,
        left: d.left - 0.5 // 每帧移动 0.5%
      })))
    }

    const interval = setInterval(animate, 50)
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {activeDanmakus.map((danmaku) => (
        <motion.div
          key={danmaku.id}
          initial={{ x: '100vw' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 8, ease: 'linear' }}
          className="absolute whitespace-nowrap text-lg font-medium"
          style={{
            top: `${danmaku.track * 40 + 20}px`,
            color: danmaku.color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {danmaku.content}
        </motion.div>
      ))}
    </div>
  )
}

// 弹幕输入组件
interface DanmakuInputProps {
  onSend: (content: string, color: string) => void
  currentTime: number
}

export const DanmakuInput: React.FC<DanmakuInputProps> = ({ onSend, currentTime }) => {
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#ffffff')
  const [isOpen, setIsOpen] = useState(false)

  const colors = [
    '#ffffff', '#ff0000', '#ff8800', '#ffff00',
    '#00ff00', '#00ffff', '#0088ff', '#ff00ff'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    onSend(content, color)
    setContent('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white/10 rounded-full text-white/60 hover:bg-white/20"
      >
        发弹幕
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="absolute bottom-full left-0 mb-2 p-3 bg-dark-800 rounded-xl shadow-xl min-w-[300px]"
          >
            <div className="flex gap-2 mb-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === c ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入弹幕内容..."
                maxLength={50}
                className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none"
                style={{ color }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 rounded-lg text-white"
              >
                发送
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CommentList
