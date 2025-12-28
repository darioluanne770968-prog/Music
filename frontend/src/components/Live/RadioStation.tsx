import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 电台开播组件
 * 用户可以创建和收听音乐电台
 */

// 电台状态
type RadioStatus = 'offline' | 'live' | 'scheduled'

// 电台
interface RadioStation {
  id: string
  name: string
  host: {
    id: string
    name: string
    avatar: string
    followers: number
  }
  description: string
  coverImage: string
  category: string
  tags: string[]
  status: RadioStatus
  listeners: number
  likes: number
  scheduledTime?: Date
  currentTrack?: {
    title: string
    artist: string
    artwork: string
  }
  isFollowing: boolean
}

// 聊天消息
interface RadioMessage {
  id: string
  userId: string
  userName: string
  avatar: string
  content: string
  type: 'text' | 'gift' | 'join' | 'song_request'
  timestamp: Date
}

// 点歌请求
interface SongRequest {
  id: string
  userId: string
  userName: string
  track: {
    title: string
    artist: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'played'
  votes: number
}

// 电台 Hook
export function useRadioStation() {
  const [isLive, setIsLive] = useState(false)
  const [myStation, setMyStation] = useState<RadioStation | null>(null)
  const [liveStations, setLiveStations] = useState<RadioStation[]>([])
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [messages, setMessages] = useState<RadioMessage[]>([])
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [listeners, setListeners] = useState(0)

  // 模拟电台数据
  useEffect(() => {
    const mockStations: RadioStation[] = [
      {
        id: '1',
        name: '深夜情歌电台',
        host: { id: 'h1', name: 'DJ小明', avatar: '🎧', followers: 12500 },
        description: '陪你度过每一个深夜',
        coverImage: '/api/placeholder/200/200',
        category: '情感',
        tags: ['情歌', '深夜', '治愈'],
        status: 'live',
        listeners: 3280,
        likes: 8520,
        currentTrack: { title: '晴天', artist: '周杰伦', artwork: '/api/placeholder/50/50' },
        isFollowing: false
      },
      {
        id: '2',
        name: '摇滚不死电台',
        host: { id: 'h2', name: 'Rock King', avatar: '🎸', followers: 8900 },
        description: '经典摇滚，永不停歇',
        coverImage: '/api/placeholder/200/200',
        category: '摇滚',
        tags: ['摇滚', '经典', '激情'],
        status: 'live',
        listeners: 1850,
        likes: 5420,
        currentTrack: { title: 'Bohemian Rhapsody', artist: 'Queen', artwork: '/api/placeholder/50/50' },
        isFollowing: true
      },
      {
        id: '3',
        name: '电子派对',
        host: { id: 'h3', name: 'EDM Master', avatar: '🎹', followers: 6700 },
        description: '电音狂欢，嗨翻全场',
        coverImage: '/api/placeholder/200/200',
        category: '电子',
        tags: ['EDM', '派对', '嗨曲'],
        status: 'live',
        listeners: 2100,
        likes: 4800,
        currentTrack: { title: 'Levels', artist: 'Avicii', artwork: '/api/placeholder/50/50' },
        isFollowing: false
      }
    ]

    setLiveStations(mockStations)

    // 模拟消息
    const mockMessages: RadioMessage[] = [
      { id: 'm1', userId: 'u1', userName: '音乐爱好者', avatar: '😊', content: '这首歌太好听了！', type: 'text', timestamp: new Date() },
      { id: 'm2', userId: 'u2', userName: '深夜听众', avatar: '🌙', content: '主播晚上好～', type: 'text', timestamp: new Date() },
      { id: 'm3', userId: 'u3', userName: '新听众', avatar: '👋', content: '', type: 'join', timestamp: new Date() }
    ]
    setMessages(mockMessages)
  }, [])

  // 开始直播
  const goLive = useCallback((stationInfo: Partial<RadioStation>) => {
    const station: RadioStation = {
      id: `station_${Date.now()}`,
      name: stationInfo.name || '我的电台',
      host: { id: 'me', name: '我', avatar: '🎤', followers: 0 },
      description: stationInfo.description || '',
      coverImage: stationInfo.coverImage || '/api/placeholder/200/200',
      category: stationInfo.category || '综合',
      tags: stationInfo.tags || [],
      status: 'live',
      listeners: 0,
      likes: 0,
      isFollowing: false
    }

    setMyStation(station)
    setIsLive(true)

    // 模拟听众增长
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 结束直播
  const endLive = useCallback(() => {
    setIsLive(false)
    setMyStation(null)
    setListeners(0)
  }, [])

  // 加入电台
  const joinStation = useCallback((stationId: string) => {
    const station = liveStations.find(s => s.id === stationId)
    if (station) {
      setCurrentStation(station)
    }
  }, [liveStations])

  // 离开电台
  const leaveStation = useCallback(() => {
    setCurrentStation(null)
  }, [])

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    const message: RadioMessage = {
      id: `msg_${Date.now()}`,
      userId: 'me',
      userName: '我',
      avatar: '😊',
      content,
      type: 'text',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }, [])

  // 请求点歌
  const requestSong = useCallback((track: { title: string; artist: string }) => {
    const request: SongRequest = {
      id: `req_${Date.now()}`,
      userId: 'me',
      userName: '我',
      track,
      status: 'pending',
      votes: 1
    }
    setSongRequests(prev => [...prev, request])
  }, [])

  // 处理点歌请求
  const handleSongRequest = useCallback((requestId: string, action: 'approve' | 'reject') => {
    setSongRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
        : req
    ))
  }, [])

  return {
    isLive,
    myStation,
    liveStations,
    currentStation,
    messages,
    songRequests,
    listeners,
    goLive,
    endLive,
    joinStation,
    leaveStation,
    sendMessage,
    requestSong,
    handleSongRequest
  }
}

// 电台卡片
const StationCard: React.FC<{
  station: RadioStation
  onJoin: () => void
}> = ({ station, onJoin }) => {
  return (
    <motion.div
      className="bg-dark-800 rounded-xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onJoin}
    >
      <div className="relative h-32">
        <img
          src={station.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />

        {/* 直播标识 */}
        {station.status === 'live' && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full text-xs text-white">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              直播中
            </span>
            <span className="px-2 py-1 bg-black/50 rounded-full text-xs text-white">
              👁 {station.listeners.toLocaleString()}
            </span>
          </div>
        )}

        {/* 当前歌曲 */}
        {station.currentTrack && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <img
              src={station.currentTrack.artwork}
              alt=""
              className="w-10 h-10 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{station.currentTrack.title}</p>
              <p className="text-white/60 text-xs truncate">{station.currentTrack.artist}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{station.host.avatar}</span>
          <div>
            <h4 className="text-white font-medium">{station.name}</h4>
            <p className="text-xs text-white/60">{station.host.name}</p>
          </div>
        </div>

        <p className="text-sm text-white/40 mb-3">{station.description}</p>

        <div className="flex flex-wrap gap-2">
          {station.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 开播设置
const GoLiveForm: React.FC<{
  onGoLive: (info: Partial<RadioStation>) => void
}> = ({ onGoLive }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('综合')

  const categories = ['综合', '情感', '摇滚', '电子', '古典', '嘻哈', '爵士', '民谣']

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/60 block mb-2">电台名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="给你的电台起个名字"
          className="w-full bg-white/10 rounded-lg px-4 py-3 text-white
                   placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-sm text-white/60 block mb-2">电台介绍</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍一下你的电台"
          className="w-full h-20 bg-white/10 rounded-lg px-4 py-3 text-white
                   placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-sm text-white/60 block mb-2">电台分类</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm ${
                category === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onGoLive({ name, description, category })}
        disabled={!name}
        className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl
                 text-white font-medium disabled:opacity-50"
      >
        🎙️ 开始直播
      </button>
    </div>
  )
}

// 直播控制台
const LiveConsole: React.FC<{
  station: RadioStation
  listeners: number
  messages: RadioMessage[]
  songRequests: SongRequest[]
  onEnd: () => void
  onSendMessage: (content: string) => void
  onHandleRequest: (id: string, action: 'approve' | 'reject') => void
}> = ({ station, listeners, messages, songRequests, onEnd, onSendMessage, onHandleRequest }) => {
  const [messageInput, setMessageInput] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'requests'>('chat')

  return (
    <div className="space-y-4">
      {/* 直播状态 */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full text-xs text-white">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              直播中
            </span>
            <span className="text-white font-medium">{station.name}</span>
          </div>
          <button
            onClick={onEnd}
            className="px-4 py-1 bg-red-500 rounded-lg text-white text-sm"
          >
            结束直播
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <span>👁</span>
            <span className="text-white">{listeners}</span>
            <span className="text-white/40">观看</span>
          </div>
          <div className="flex items-center gap-1">
            <span>❤️</span>
            <span className="text-white">{station.likes}</span>
            <span className="text-white/40">喜欢</span>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 rounded-lg text-sm ${
            activeTab === 'chat' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          聊天
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 rounded-lg text-sm ${
            activeTab === 'requests' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          点歌 ({songRequests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {/* 内容区 */}
      <div className="h-64 bg-dark-800 rounded-xl overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2">
                  <span className="text-lg">{msg.avatar}</span>
                  <div>
                    <span className="text-primary-400 text-sm">{msg.userName}</span>
                    {msg.type === 'join' ? (
                      <span className="text-white/40 text-sm"> 加入了直播间</span>
                    ) : (
                      <p className="text-white text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="说点什么..."
                  className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white
                           placeholder-white/40 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (messageInput) {
                      onSendMessage(messageInput)
                      setMessageInput('')
                    }
                  }}
                  className="px-4 py-2 bg-primary-500 rounded-lg text-white text-sm"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            {songRequests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white">{req.track.title}</p>
                  <p className="text-xs text-white/40">{req.track.artist} · {req.userName} 点歌</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onHandleRequest(req.id, 'approve')}
                    className="px-3 py-1 bg-green-500 rounded text-white text-xs"
                  >
                    播放
                  </button>
                  <button
                    onClick={() => onHandleRequest(req.id, 'reject')}
                    className="px-3 py-1 bg-red-500 rounded text-white text-xs"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}

            {songRequests.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center text-white/40 py-8">
                暂无点歌请求
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 主界面
interface RadioStationProps {
  className?: string
}

export const RadioStation: React.FC<RadioStationProps> = ({ className }) => {
  const {
    isLive,
    myStation,
    liveStations,
    currentStation,
    messages,
    songRequests,
    listeners,
    goLive,
    endLive,
    joinStation,
    leaveStation,
    sendMessage,
    handleSongRequest
  } = useRadioStation()

  const [activeTab, setActiveTab] = useState<'discover' | 'create'>('discover')

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">音乐电台</h3>

        {!isLive && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'discover' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              发现
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'create' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              开播
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLive && myStation ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LiveConsole
              station={myStation}
              listeners={listeners}
              messages={messages}
              songRequests={songRequests}
              onEnd={endLive}
              onSendMessage={sendMessage}
              onHandleRequest={handleSongRequest}
            />
          </motion.div>
        ) : currentStation ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 正在收听 */}
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm mb-2">正在收听</p>
              <h4 className="text-xl font-bold text-white">{currentStation.name}</h4>
            </div>

            <button
              onClick={leaveStation}
              className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl"
            >
              离开电台
            </button>
          </motion.div>
        ) : activeTab === 'discover' ? (
          <motion.div
            key="discover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {liveStations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                onJoin={() => joinStation(station.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GoLiveForm onGoLive={goLive} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RadioStation
