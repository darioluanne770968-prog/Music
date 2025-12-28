import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 直播功能组件
 * 支持音乐直播、实时互动、礼物打赏
 */

// 直播间类型
export interface LiveRoom {
  id: string
  title: string
  hostId: string
  hostName: string
  hostAvatar: string
  coverUrl: string
  viewerCount: number
  likeCount: number
  category: 'music' | 'radio' | 'chat'
  isLive: boolean
  startTime: Date
  tags: string[]
}

// 直播消息
export interface LiveMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: 'chat' | 'gift' | 'enter' | 'follow' | 'system'
  giftInfo?: {
    id: string
    name: string
    icon: string
    value: number
    count: number
  }
  timestamp: number
}

// 礼物类型
export interface Gift {
  id: string
  name: string
  icon: string
  price: number
  animation?: 'none' | 'float' | 'fullscreen'
}

// 预设礼物
export const defaultGifts: Gift[] = [
  { id: '1', name: '小心心', icon: '❤️', price: 1, animation: 'float' },
  { id: '2', name: '音符', icon: '🎵', price: 5, animation: 'float' },
  { id: '3', name: '麦克风', icon: '🎤', price: 10, animation: 'float' },
  { id: '4', name: '吉他', icon: '🎸', price: 50, animation: 'float' },
  { id: '5', name: '钢琴', icon: '🎹', price: 100, animation: 'fullscreen' },
  { id: '6', name: '火箭', icon: '🚀', price: 500, animation: 'fullscreen' },
  { id: '7', name: '皇冠', icon: '👑', price: 1000, animation: 'fullscreen' },
  { id: '8', name: '城堡', icon: '🏰', price: 5000, animation: 'fullscreen' }
]

// 直播间 Hook
export function useLiveRoom(roomId: string) {
  const [room, setRoom] = useState<LiveRoom | null>(null)
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [viewers, setViewers] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // 连接直播间
  const connect = useCallback(() => {
    const ws = new WebSocket(`wss://api.example.com/live/${roomId}`)

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'room_info':
          setRoom(data.room)
          break
        case 'message':
          setMessages(prev => [...prev.slice(-100), data.message])
          break
        case 'viewer_count':
          setViewers(data.count)
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

    wsRef.current = ws
  }, [roomId])

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      content
    }))
  }, [])

  // 发送礼物
  const sendGift = useCallback((gift: Gift, count = 1) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({
      type: 'gift',
      giftId: gift.id,
      count
    }))
  }, [])

  // 点赞
  const sendLike = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({ type: 'like' }))
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return {
    room,
    messages,
    viewers,
    isConnected,
    sendMessage,
    sendGift,
    sendLike
  }
}

// 直播间卡片
interface LiveRoomCardProps {
  room: LiveRoom
  onClick: () => void
}

export const LiveRoomCard: React.FC<LiveRoomCardProps> = ({ room, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
    >
      <img
        src={room.coverUrl}
        alt={room.title}
        className="w-full aspect-video object-cover"
      />

      {/* 直播标签 */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          直播中
        </span>
        {room.tags.slice(0, 2).map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* 观看人数 */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        {room.viewerCount > 10000
          ? `${(room.viewerCount / 10000).toFixed(1)}万`
          : room.viewerCount}
      </div>

      {/* 信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="font-medium text-white truncate">{room.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <img
            src={room.hostAvatar}
            alt={room.hostName}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-white/80 text-sm">{room.hostName}</span>
        </div>
      </div>

      {/* Hover 遮罩 */}
      <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="px-4 py-2 bg-primary-500 text-white rounded-full">
          进入直播间
        </span>
      </div>
    </motion.div>
  )
}

// 直播间界面
interface LiveRoomUIProps {
  roomId: string
  onClose: () => void
}

export const LiveRoomUI: React.FC<LiveRoomUIProps> = ({ roomId, onClose }) => {
  const { room, messages, viewers, isConnected, sendMessage, sendGift, sendLike } = useLiveRoom(roomId)
  const [inputMessage, setInputMessage] = useState('')
  const [showGiftPanel, setShowGiftPanel] = useState(false)
  const [floatingGifts, setFloatingGifts] = useState<{ id: string; icon: string; x: number }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage(inputMessage)
    setInputMessage('')
  }

  const handleSendGift = (gift: Gift) => {
    sendGift(gift)

    // 添加飘动动画
    if (gift.animation === 'float') {
      const newGift = {
        id: `${Date.now()}`,
        icon: gift.icon,
        x: Math.random() * 80 + 10
      }
      setFloatingGifts(prev => [...prev, newGift])
      setTimeout(() => {
        setFloatingGifts(prev => prev.filter(g => g.id !== newGift.id))
      }, 2000)
    }
  }

  const handleLike = () => {
    sendLike()
    // 添加爱心动画
    const heart = {
      id: `${Date.now()}`,
      icon: '❤️',
      x: Math.random() * 20 + 70
    }
    setFloatingGifts(prev => [...prev, heart])
    setTimeout(() => {
      setFloatingGifts(prev => prev.filter(g => g.id !== heart.id))
    }, 2000)
  }

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-900 relative overflow-hidden">
      {/* 视频区域 */}
      <div className="relative aspect-video bg-black">
        <img
          src={room.coverUrl}
          alt={room.title}
          className="w-full h-full object-cover"
        />

        {/* 顶部信息 */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={room.hostAvatar}
              alt={room.hostName}
              className="w-10 h-10 rounded-full border-2 border-primary-500"
            />
            <div>
              <h2 className="font-medium text-white">{room.hostName}</h2>
              <p className="text-xs text-white/60">{viewers} 观看</p>
            </div>
            <button className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
              关注
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 rounded-full text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 飘动的礼物 */}
        <AnimatePresence>
          {floatingGifts.map(gift => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 1, y: 0, x: `${gift.x}%` }}
              animate={{ opacity: 0, y: -200 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-20 text-3xl"
              style={{ left: `${gift.x}%` }}
            >
              {gift.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 消息列表 */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {messages.map(msg => (
            <LiveMessageItem key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 礼物面板 */}
        <AnimatePresence>
          {showGiftPanel && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="p-4 bg-dark-800 border-t border-white/10"
            >
              <div className="grid grid-cols-4 gap-3">
                {defaultGifts.map(gift => (
                  <button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10"
                  >
                    <span className="text-2xl mb-1">{gift.icon}</span>
                    <span className="text-xs text-white">{gift.name}</span>
                    <span className="text-xs text-primary-400">{gift.price}💎</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 输入区域 */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGiftPanel(!showGiftPanel)}
            className={`p-2 rounded-full ${showGiftPanel ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}
          >
            🎁
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="说点什么..."
            className="flex-1 px-4 py-2 bg-white/10 rounded-full text-white placeholder-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleLike}
            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
          >
            ❤️
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-full"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  )
}

// 消息项组件
const LiveMessageItem: React.FC<{ message: LiveMessage }> = ({ message }) => {
  if (message.type === 'enter') {
    return (
      <div className="text-center text-xs text-white/40">
        {message.userName} 进入了直播间
      </div>
    )
  }

  if (message.type === 'gift') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-2 bg-gradient-to-r from-primary-500/20 to-transparent rounded-lg"
      >
        <img src={message.userAvatar} alt="" className="w-6 h-6 rounded-full" />
        <span className="text-primary-400">{message.userName}</span>
        <span className="text-white/60">送出</span>
        <span className="text-xl">{message.giftInfo?.icon}</span>
        <span className="text-yellow-400">{message.giftInfo?.name}</span>
        {message.giftInfo && message.giftInfo.count > 1 && (
          <span className="text-yellow-400 font-bold">x{message.giftInfo.count}</span>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <img src={message.userAvatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
      <div>
        <span className="text-primary-400 text-sm">{message.userName}: </span>
        <span className="text-white">{message.content}</span>
      </div>
    </div>
  )
}

export default LiveRoomUI
