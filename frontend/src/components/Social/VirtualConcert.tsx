import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 虚拟演唱会组件
 * 沉浸式在线演唱会体验
 */

// 演唱会状态
type ConcertStatus = 'upcoming' | 'live' | 'ended' | 'replay'

// 演唱会信息
interface Concert {
  id: string
  title: string
  artist: {
    name: string
    avatar: string
    verified: boolean
  }
  coverImage: string
  scheduledTime: Date
  duration: number
  status: ConcertStatus
  viewers: number
  maxViewers: number
  setlist: {
    order: number
    title: string
    duration: number
    isPlaying?: boolean
  }[]
  features: ('vr' | '3d' | 'chat' | 'gifts' | 'multiangle')[]
  ticketPrice?: number
  isPurchased?: boolean
}

// 礼物
interface Gift {
  id: string
  name: string
  icon: string
  price: number
  animation: 'float' | 'burst' | 'rain' | 'firework'
}

// 弹幕
interface Danmaku {
  id: string
  userId: string
  userName: string
  content: string
  color: string
  type: 'normal' | 'super' | 'gift'
  timestamp: number
}

// 虚拟演唱会 Hook
export function useVirtualConcert(concertId: string) {
  const [concert, setConcert] = useState<Concert | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [danmakus, setDanmakus] = useState<Danmaku[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'back' | 'closeup'>('front')

  // 礼物列表
  const gifts: Gift[] = [
    { id: '1', name: '荧光棒', icon: '🎤', price: 10, animation: 'float' },
    { id: '2', name: '玫瑰花', icon: '🌹', price: 50, animation: 'burst' },
    { id: '3', name: '皇冠', icon: '👑', price: 100, animation: 'float' },
    { id: '4', name: '烟花', icon: '🎆', price: 200, animation: 'firework' },
    { id: '5', name: '火箭', icon: '🚀', price: 500, animation: 'burst' },
    { id: '6', name: '城堡', icon: '🏰', price: 1000, animation: 'firework' }
  ]

  // 模拟演唱会数据
  useEffect(() => {
    const mockConcert: Concert = {
      id: concertId,
      title: '「夜的第七章」线上演唱会',
      artist: {
        name: '周杰伦',
        avatar: '/api/placeholder/100/100',
        verified: true
      },
      coverImage: '/api/placeholder/800/450',
      scheduledTime: new Date(),
      duration: 7200, // 2小时
      status: 'live',
      viewers: 125680,
      maxViewers: 200000,
      setlist: [
        { order: 1, title: '晴天', duration: 269, isPlaying: true },
        { order: 2, title: '七里香', duration: 296 },
        { order: 3, title: '稻香', duration: 233 },
        { order: 4, title: '告白气球', duration: 215 },
        { order: 5, title: '以父之名', duration: 360 },
        { order: 6, title: '夜的第七章', duration: 330 },
        { order: 7, title: '青花瓷', duration: 240 },
        { order: 8, title: '双截棍', duration: 195 }
      ],
      features: ['3d', 'chat', 'gifts', 'multiangle'],
      isPurchased: true
    }

    setConcert(mockConcert)

    // 模拟弹幕
    const danmakuInterval = setInterval(() => {
      const mockDanmakus = [
        '太好听了！！',
        '周杰伦永远的神',
        '🔥🔥🔥',
        '青春回来了',
        '感动哭了',
        '周董yyds',
        '❤️❤️❤️',
        '荧光棒举起来'
      ]

      const newDanmaku: Danmaku = {
        id: `dm_${Date.now()}`,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userName: `用户${Math.floor(Math.random() * 1000)}`,
        content: mockDanmakus[Math.floor(Math.random() * mockDanmakus.length)],
        color: ['#ffffff', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'][Math.floor(Math.random() * 5)],
        type: 'normal',
        timestamp: Date.now()
      }

      setDanmakus(prev => [...prev.slice(-50), newDanmaku])
    }, 800)

    // 模拟观看人数变化
    const viewerInterval = setInterval(() => {
      setConcert(prev => prev ? {
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 100 - 30)
      } : null)
    }, 5000)

    return () => {
      clearInterval(danmakuInterval)
      clearInterval(viewerInterval)
    }
  }, [concertId])

  // 发送弹幕
  const sendDanmaku = useCallback((content: string, color = '#ffffff') => {
    const newDanmaku: Danmaku = {
      id: `dm_${Date.now()}`,
      userId: 'me',
      userName: '我',
      content,
      color,
      type: 'normal',
      timestamp: Date.now()
    }
    setDanmakus(prev => [...prev, newDanmaku])
  }, [])

  // 发送礼物
  const sendGift = useCallback((gift: Gift) => {
    const giftDanmaku: Danmaku = {
      id: `gift_${Date.now()}`,
      userId: 'me',
      userName: '我',
      content: `送出了 ${gift.name} ${gift.icon}`,
      color: '#ffd700',
      type: 'gift',
      timestamp: Date.now()
    }
    setDanmakus(prev => [...prev, giftDanmaku])
  }, [])

  return {
    concert,
    isFullscreen,
    setIsFullscreen,
    showChat,
    setShowChat,
    danmakus,
    currentSongIndex,
    setCurrentSongIndex,
    viewAngle,
    setViewAngle,
    gifts,
    sendDanmaku,
    sendGift
  }
}

// 弹幕层
const DanmakuLayer: React.FC<{
  danmakus: Danmaku[]
}> = ({ danmakus }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {danmakus.slice(-20).map((danmaku, index) => (
        <motion.div
          key={danmaku.id}
          className="absolute whitespace-nowrap text-sm font-medium"
          style={{
            color: danmaku.color,
            top: `${(index % 8) * 12 + 5}%`,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}
          initial={{ right: '-100%' }}
          animate={{ right: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
        >
          {danmaku.type === 'gift' ? (
            <span className="px-2 py-1 bg-yellow-500/30 rounded-full">
              {danmaku.userName} {danmaku.content}
            </span>
          ) : (
            danmaku.content
          )}
        </motion.div>
      ))}
    </div>
  )
}

// 视频播放器
const ConcertPlayer: React.FC<{
  concert: Concert
  viewAngle: string
  danmakus: Danmaku[]
  showDanmaku: boolean
}> = ({ concert, viewAngle, danmakus, showDanmaku }) => {
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      {/* 视频占位 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
        <img
          src={concert.coverImage}
          alt={concert.title}
          className="w-full h-full object-cover opacity-50"
        />

        {/* 舞台效果 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        </div>

        {/* 灯光效果 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-32 bg-gradient-to-b from-primary-500/50 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              top: 0,
              transformOrigin: 'top'
            }}
            animate={{
              rotate: [-15 + i * 5, 15 - i * 3, -15 + i * 5]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* 弹幕层 */}
      {showDanmaku && <DanmakuLayer danmakus={danmakus} />}

      {/* 直播标识 */}
      {concert.status === 'live' && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full text-xs text-white">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            直播中
          </span>
          <span className="px-2 py-1 bg-black/50 rounded-full text-xs text-white">
            👁 {concert.viewers.toLocaleString()}
          </span>
        </div>
      )}

      {/* 视角切换 */}
      <div className="absolute top-4 right-4 flex gap-2">
        {['front', 'side', 'closeup', 'back'].map(angle => (
          <button
            key={angle}
            className={`px-2 py-1 rounded text-xs ${
              viewAngle === angle ? 'bg-primary-500 text-white' : 'bg-black/50 text-white/60'
            }`}
          >
            {angle === 'front' ? '正面' : angle === 'side' ? '侧面' : angle === 'closeup' ? '特写' : '全景'}
          </button>
        ))}
      </div>

      {/* 当前歌曲 */}
      <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg p-3">
        <p className="text-white font-medium">
          ♪ {concert.setlist.find(s => s.isPlaying)?.title || concert.setlist[0].title}
        </p>
        <p className="text-sm text-white/60">{concert.artist.name}</p>
      </div>
    </div>
  )
}

// 聊天面板
const ChatPanel: React.FC<{
  danmakus: Danmaku[]
  onSend: (content: string) => void
}> = ({ danmakus, onSend }) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [danmakus])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim())
      setInput('')
    }
  }

  return (
    <div className="h-full flex flex-col bg-dark-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <h4 className="text-white font-medium">互动区</h4>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {danmakus.slice(-30).map(dm => (
          <div key={dm.id} className="text-sm">
            <span className="text-white/40">{dm.userName}: </span>
            <span style={{ color: dm.color }}>{dm.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="发送弹幕..."
            className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white
                     placeholder-white/40 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-primary-500 rounded-lg text-white text-sm"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

// 礼物面板
const GiftPanel: React.FC<{
  gifts: Gift[]
  onSend: (gift: Gift) => void
}> = ({ gifts, onSend }) => {
  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h4 className="text-white font-medium mb-3">送礼物</h4>
      <div className="grid grid-cols-6 gap-2">
        {gifts.map(gift => (
          <motion.button
            key={gift.id}
            onClick={() => onSend(gift)}
            className="flex flex-col items-center gap-1 p-2 bg-white/5 rounded-xl
                     hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">{gift.icon}</span>
            <span className="text-xs text-white/60">{gift.price}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// 歌单
const Setlist: React.FC<{
  setlist: Concert['setlist']
  currentIndex: number
}> = ({ setlist, currentIndex }) => {
  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h4 className="text-white font-medium mb-3">曲目单</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {setlist.map((song, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              song.isPlaying ? 'bg-primary-500/20' : ''
            }`}
          >
            <span className="w-6 text-center text-sm text-white/40">{song.order}</span>
            <div className="flex-1">
              <p className={`text-sm ${song.isPlaying ? 'text-primary-400' : 'text-white'}`}>
                {song.title}
              </p>
            </div>
            {song.isPlaying && (
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-primary-500"
                    animate={{ height: [8, 16, 8] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 主界面
interface VirtualConcertProps {
  concertId?: string
  className?: string
}

export const VirtualConcert: React.FC<VirtualConcertProps> = ({
  concertId = 'concert_1',
  className
}) => {
  const {
    concert,
    showChat,
    setShowChat,
    danmakus,
    viewAngle,
    setViewAngle,
    gifts,
    sendDanmaku,
    sendGift
  } = useVirtualConcert(concertId)

  const [showDanmaku, setShowDanmaku] = useState(true)

  if (!concert) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-900 rounded-2xl overflow-hidden ${className}`}>
      {/* 顶部信息 */}
      <div className="p-4 bg-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={concert.artist.avatar}
            alt={concert.artist.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-white font-medium">{concert.artist.name}</h3>
              {concert.artist.verified && <span className="text-primary-400">✓</span>}
            </div>
            <p className="text-sm text-white/60">{concert.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDanmaku(!showDanmaku)}
            className={`px-3 py-1 rounded text-sm ${
              showDanmaku ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            弹幕
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded text-sm ${
              showChat ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            聊天
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex">
        {/* 视频区 */}
        <div className="flex-1 p-4">
          <ConcertPlayer
            concert={concert}
            viewAngle={viewAngle}
            danmakus={danmakus}
            showDanmaku={showDanmaku}
          />

          {/* 底部控制 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Setlist setlist={concert.setlist} currentIndex={0} />
            <GiftPanel gifts={gifts} onSend={sendGift} />
          </div>
        </div>

        {/* 聊天区 */}
        {showChat && (
          <div className="w-80 p-4 pl-0">
            <ChatPanel danmakus={danmakus} onSend={sendDanmaku} />
          </div>
        )}
      </div>
    </div>
  )
}

export default VirtualConcert
