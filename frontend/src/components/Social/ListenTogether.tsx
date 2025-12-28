import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 一起听功能组件
 * 支持创建房间、邀请好友、同步播放
 */

// 房间成员
export interface RoomMember {
  id: string
  name: string
  avatar: string
  isHost: boolean
  isReady: boolean
  isMuted: boolean
}

// 播放状态
export interface PlaybackState {
  songId: string
  songName: string
  artistName: string
  coverUrl: string
  currentTime: number
  duration: number
  isPlaying: boolean
}

// 聊天消息
export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: 'text' | 'reaction' | 'system'
  timestamp: number
}

// 房间状态
export interface ListenRoom {
  id: string
  name: string
  hostId: string
  members: RoomMember[]
  playbackState: PlaybackState | null
  queue: { songId: string; songName: string; addedBy: string }[]
  isPrivate: boolean
  maxMembers: number
}

// 一起听 Hook
export function useListenTogether() {
  const [room, setRoom] = useState<ListenRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [latency, setLatency] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  // 创建房间
  const createRoom = useCallback(async (name: string, isPrivate: boolean) => {
    // 模拟创建房间
    const newRoom: ListenRoom = {
      id: `room-${Date.now()}`,
      name,
      hostId: 'current-user',
      members: [
        {
          id: 'current-user',
          name: '我',
          avatar: '/avatars/default.jpg',
          isHost: true,
          isReady: true,
          isMuted: false
        }
      ],
      playbackState: null,
      queue: [],
      isPrivate,
      maxMembers: 8
    }

    setRoom(newRoom)
    connectToRoom(newRoom.id)

    return newRoom.id
  }, [])

  // 加入房间
  const joinRoom = useCallback(async (roomId: string) => {
    // 模拟加入房间
    connectToRoom(roomId)
  }, [])

  // 连接到房间
  const connectToRoom = (roomId: string) => {
    const ws = new WebSocket(`wss://api.example.com/listen-together/${roomId}`)

    ws.onopen = () => {
      setIsConnected(true)
      // 心跳检测
      setInterval(() => {
        const start = Date.now()
        ws.send(JSON.stringify({ type: 'ping' }))
        // 模拟延迟计算
        setLatency(Math.floor(Math.random() * 50 + 20))
      }, 5000)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'room_update':
          setRoom(data.room)
          break
        case 'playback_sync':
          // 同步播放状态
          setRoom(prev => prev ? { ...prev, playbackState: data.state } : null)
          break
        case 'chat':
          setMessages(prev => [...prev, data.message])
          break
        case 'member_joined':
          setRoom(prev => prev ? {
            ...prev,
            members: [...prev.members, data.member]
          } : null)
          addSystemMessage(`${data.member.name} 加入了房间`)
          break
        case 'member_left':
          setRoom(prev => prev ? {
            ...prev,
            members: prev.members.filter(m => m.id !== data.memberId)
          } : null)
          addSystemMessage(`有人离开了房间`)
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    wsRef.current = ws
  }

  // 添加系统消息
  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      userId: 'system',
      userName: '系统',
      userAvatar: '',
      content,
      type: 'system',
      timestamp: Date.now()
    }])
  }

  // 发送聊天消息
  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      content
    }))

    // 本地添加消息
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      userName: '我',
      userAvatar: '/avatars/default.jpg',
      content,
      type: 'text',
      timestamp: Date.now()
    }])
  }, [])

  // 发送表情反应
  const sendReaction = useCallback((emoji: string) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'reaction',
      emoji
    }))
  }, [])

  // 同步播放
  const syncPlayback = useCallback((state: PlaybackState) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'sync',
      state
    }))
  }, [])

  // 添加到队列
  const addToQueue = useCallback((song: { songId: string; songName: string }) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'add_queue',
      song
    }))
  }, [])

  // 离开房间
  const leaveRoom = useCallback(() => {
    wsRef.current?.close()
    setRoom(null)
    setMessages([])
    setIsConnected(false)
  }, [])

  return {
    room,
    messages,
    isConnected,
    latency,
    createRoom,
    joinRoom,
    sendMessage,
    sendReaction,
    syncPlayback,
    addToQueue,
    leaveRoom
  }
}

// 一起听界面
interface ListenTogetherUIProps {
  isOpen: boolean
  onClose: () => void
}

export const ListenTogetherUI: React.FC<ListenTogetherUIProps> = ({
  isOpen,
  onClose
}) => {
  const {
    room,
    messages,
    isConnected,
    latency,
    createRoom,
    joinRoom,
    sendMessage,
    sendReaction,
    leaveRoom
  } = useListenTogether()

  const [mode, setMode] = useState<'lobby' | 'room'>('lobby')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [chatInput, setChatInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const reactions = ['❤️', '🔥', '👏', '😂', '😢', '🎉', '🤘', '💃']

  useEffect(() => {
    if (room) {
      setMode('room')
    }
  }, [room])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreate = async () => {
    if (!roomName.trim()) return
    await createRoom(roomName, false)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    await joinRoom(joinCode)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendMessage(chatInput)
    setChatInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50"
        >
          <div className="h-full flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎧</span>
                <div>
                  <h2 className="font-bold text-white">
                    {mode === 'lobby' ? '一起听' : room?.name || '房间'}
                  </h2>
                  {mode === 'room' && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{isConnected ? `已连接 (${latency}ms)` : '连接中...'}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (mode === 'room') {
                    leaveRoom()
                    setMode('lobby')
                  } else {
                    onClose()
                  }
                }}
                className="p-2 text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {mode === 'lobby' ? (
              // 大厅
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-md mx-auto space-y-8">
                  {/* 创建房间 */}
                  <div className="p-6 bg-white/5 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">创建房间</h3>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="房间名称"
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 mb-4"
                    />
                    <button
                      onClick={handleCreate}
                      className="w-full py-3 bg-primary-500 rounded-xl text-white font-medium"
                    >
                      创建房间
                    </button>
                  </div>

                  {/* 加入房间 */}
                  <div className="p-6 bg-white/5 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">加入房间</h3>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="输入房间号"
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 mb-4"
                    />
                    <button
                      onClick={handleJoin}
                      className="w-full py-3 bg-white/10 rounded-xl text-white font-medium"
                    >
                      加入房间
                    </button>
                  </div>

                  {/* 热门房间 */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">热门房间</h3>
                    <div className="space-y-3">
                      {[
                        { id: '1', name: '周杰伦歌友会', members: 5, song: '晴天' },
                        { id: '2', name: '深夜电台', members: 3, song: '夜曲' },
                        { id: '3', name: '摇滚之夜', members: 7, song: 'Bohemian Rhapsody' }
                      ].map(r => (
                        <button
                          key={r.id}
                          onClick={() => joinRoom(r.id)}
                          className="w-full p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10"
                        >
                          <div className="text-left">
                            <h4 className="text-white font-medium">{r.name}</h4>
                            <p className="text-sm text-white/60">正在播放: {r.song}</p>
                          </div>
                          <div className="flex items-center gap-2 text-white/40">
                            <span>{r.members}/8</span>
                            <span>👥</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 房间
              <div className="flex-1 flex overflow-hidden">
                {/* 主内容 */}
                <div className="flex-1 flex flex-col">
                  {/* 播放信息 */}
                  {room?.playbackState && (
                    <div className="p-4 bg-white/5 flex items-center gap-4">
                      <img
                        src={room.playbackState.coverUrl}
                        alt=""
                        className="w-16 h-16 rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{room.playbackState.songName}</h4>
                        <p className="text-sm text-white/60">{room.playbackState.artistName}</p>
                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500"
                            style={{
                              width: `${(room.playbackState.currentTime / room.playbackState.duration) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 聊天区域 */}
                  <div className="flex-1 overflow-auto p-4 space-y-3">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 ${
                          msg.type === 'system' ? 'justify-center' : ''
                        }`}
                      >
                        {msg.type === 'system' ? (
                          <span className="text-white/40 text-sm">{msg.content}</span>
                        ) : (
                          <>
                            <img
                              src={msg.userAvatar}
                              alt=""
                              className="w-8 h-8 rounded-full bg-white/10"
                            />
                            <div>
                              <span className="text-primary-400 text-sm">{msg.userName}</span>
                              <p className="text-white">{msg.content}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 表情反应 */}
                  <div className="px-4 py-2 flex justify-center gap-2 border-t border-white/10">
                    {reactions.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* 输入框 */}
                  <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="发送消息..."
                      className="flex-1 px-4 py-2 bg-white/10 rounded-full text-white placeholder-white/40"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 rounded-full text-white"
                    >
                      发送
                    </button>
                  </form>
                </div>

                {/* 成员列表 */}
                <div className="w-64 border-l border-white/10 p-4">
                  <h3 className="text-sm text-white/60 mb-4">
                    成员 ({room?.members.length || 0}/{room?.maxMembers || 8})
                  </h3>
                  <div className="space-y-3">
                    {room?.members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                      >
                        <div className="relative">
                          <img
                            src={member.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full bg-white/10"
                          />
                          {member.isHost && (
                            <span className="absolute -top-1 -right-1 text-xs">👑</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{member.name}</p>
                          <p className="text-xs text-white/40">
                            {member.isHost ? '房主' : '成员'}
                          </p>
                        </div>
                        {member.isMuted && (
                          <span className="text-red-400">🔇</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 邀请链接 */}
                  <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/60 mb-2">邀请好友</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={room?.id || ''}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(room?.id || '')}
                        className="px-3 py-2 bg-primary-500 rounded-lg text-white text-sm"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ListenTogetherUI
