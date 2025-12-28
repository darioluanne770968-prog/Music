import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import toast from 'react-hot-toast'

interface Participant {
  id: string
  name: string
  avatar: string
  isHost: boolean
  isOnline: boolean
}

interface ChatMessage {
  id: string
  sender: Participant
  content: string
  timestamp: number
  type: 'text' | 'system' | 'song'
}

type RoomState = 'none' | 'creating' | 'joining' | 'in_room'

// Mock avatars
const MOCK_AVATARS = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=4',
  'https://i.pravatar.cc/100?img=5',
]

const MOCK_NAMES = ['小明', '小红', '小刚', '小美', '小华']

const ListenTogetherPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentSong, isPlaying, setPlaying } = usePlayerStore()

  const [roomState, setRoomState] = useState<RoomState>('none')
  const [roomCode, setRoomCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Create room
  const createRoom = () => {
    setRoomState('creating')

    setTimeout(() => {
      const code = generateRoomCode()
      setRoomCode(code)

      // Add self as host
      const hostUser: Participant = {
        id: 'self',
        name: '我',
        avatar: MOCK_AVATARS[0],
        isHost: true,
        isOnline: true,
      }

      setParticipants([hostUser])
      setRoomState('in_room')

      // Add system message
      addSystemMessage('房间已创建，邀请好友一起听吧！')

      toast.success('房间创建成功')
    }, 1000)
  }

  // Join room
  const joinRoom = () => {
    if (!inputCode.trim()) {
      toast.error('请输入房间号')
      return
    }

    setRoomState('joining')

    setTimeout(() => {
      setRoomCode(inputCode.toUpperCase())

      // Add mock host
      const hostUser: Participant = {
        id: 'host',
        name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
        avatar: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
        isHost: true,
        isOnline: true,
      }

      // Add self
      const selfUser: Participant = {
        id: 'self',
        name: '我',
        avatar: MOCK_AVATARS[0],
        isHost: false,
        isOnline: true,
      }

      setParticipants([hostUser, selfUser])
      setRoomState('in_room')

      addSystemMessage(`已加入 ${hostUser.name} 的房间`)

      toast.success('加入房间成功')

      // Simulate host playing music after a delay
      if (currentSong) {
        setTimeout(() => {
          addSystemMessage(`${hostUser.name} 正在播放: ${currentSong.name}`)
        }, 2000)
      }
    }, 1500)
  }

  // Leave room
  const leaveRoom = () => {
    setRoomState('none')
    setRoomCode('')
    setInputCode('')
    setParticipants([])
    setMessages([])
    toast.success('已退出房间')
  }

  // Add system message
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: {
        id: 'system',
        name: '系统',
        avatar: '',
        isHost: false,
        isOnline: true,
      },
      content,
      timestamp: Date.now(),
      type: 'system',
    }
    setMessages(prev => [...prev, systemMessage])
  }

  // Send message
  const sendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: participants.find(p => p.id === 'self')!,
      content: messageInput,
      timestamp: Date.now(),
      type: 'text',
    }

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')

    // Simulate reply
    if (participants.length > 1) {
      setTimeout(() => {
        const otherParticipant = participants.find(p => p.id !== 'self')
        if (otherParticipant) {
          const replies = ['👍', '哈哈', '好听！', '再来一首', '这首歌不错', '🎵']
          const replyMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: otherParticipant,
            content: replies[Math.floor(Math.random() * replies.length)],
            timestamp: Date.now(),
            type: 'text',
          }
          setMessages(prev => [...prev, replyMessage])
        }
      }, 1500 + Math.random() * 2000)
    }
  }

  // Copy room code
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      toast.success('房间号已复制')
    } catch {
      toast.error('复制失败')
    }
  }

  // Simulate participants joining
  useEffect(() => {
    if (roomState === 'in_room' && participants.length === 1) {
      // Add a mock participant after a delay
      const timer = setTimeout(() => {
        const mockUser: Participant = {
          id: 'mock1',
          name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
          avatar: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
          isHost: false,
          isOnline: true,
        }
        setParticipants(prev => [...prev, mockUser])
        addSystemMessage(`${mockUser.name} 加入了房间`)
      }, 5000 + Math.random() * 5000)

      return () => clearTimeout(timer)
    }
  }, [roomState, participants.length])

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Broadcast play state changes
  useEffect(() => {
    if (roomState === 'in_room' && currentSong) {
      const me = participants.find(p => p.id === 'self')
      if (me?.isHost) {
        // Host controls playback
      }
    }
  }, [isPlaying, currentSong, roomState, participants])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">一起听</h1>
        </div>

        {roomState === 'in_room' && (
          <button
            onClick={leaveRoom}
            className="text-red-500 text-sm font-medium"
          >
            退出房间
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* No Room State */}
          {roomState === 'none' && (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-4 pb-32"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center mb-8">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>

              <h2 className="text-white text-xl font-bold mb-2">和朋友一起听</h2>
              <p className="text-white/50 text-center mb-8">创建房间或加入好友的房间，实时同步播放音乐</p>

              <div className="w-full max-w-sm space-y-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={createRoom}
                  className="w-full py-4 rounded-xl bg-primary-500 text-white font-medium"
                >
                  创建房间
                </motion.button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-sm">或</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="输入房间号"
                    maxLength={6}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg tracking-widest placeholder:text-white/30 focus:outline-none focus:border-primary-500"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={joinRoom}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
                  >
                    加入
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Creating/Joining State */}
          {(roomState === 'creating' || roomState === 'joining') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 mb-4">
                <div className="w-full h-full rounded-full border-4 border-white/10 border-t-primary-500 animate-spin" />
              </div>
              <p className="text-white">
                {roomState === 'creating' ? '正在创建房间...' : '正在加入房间...'}
              </p>
            </motion.div>
          )}

          {/* In Room State */}
          {roomState === 'in_room' && (
            <motion.div
              key="in_room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Room Info */}
              <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {participants.slice(0, 4).map((p, i) => (
                        <img
                          key={p.id}
                          src={p.avatar}
                          alt={p.name}
                          className="w-8 h-8 rounded-full border-2 border-dark-950"
                          style={{ zIndex: participants.length - i }}
                        />
                      ))}
                      {participants.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-dark-950 text-xs text-white">
                          +{participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-white/50 text-sm">{participants.length}人在听</span>
                  </div>

                  <button
                    onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 text-primary-500 text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    邀请
                  </button>
                </div>

                {/* Now Playing */}
                {currentSong && (
                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <img
                      src={currentSong.cover}
                      alt={currentSong.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
                      <p className="text-white/50 text-xs truncate">{currentSong.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <div className="flex items-center gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-primary-500 rounded-full animate-equalizer"
                              style={{
                                height: '16px',
                                animationDelay: `${i * 0.2}s`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">已暂停</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === 'system' ? (
                      <div className="text-center">
                        <span className="text-white/30 text-xs px-3 py-1 rounded-full bg-white/5">
                          {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-start gap-2 ${msg.sender.id === 'self' ? 'flex-row-reverse' : ''}`}>
                        <img
                          src={msg.sender.avatar}
                          alt={msg.sender.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className={`max-w-[70%] ${msg.sender.id === 'self' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender.id !== 'self' && (
                              <span className="text-white/50 text-xs">{msg.sender.name}</span>
                            )}
                            <span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-2xl ${
                            msg.sender.id === 'self'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-white/5 safe-bottom">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="发送消息..."
                    className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage}
                    className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvite(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-dark-900 rounded-2xl p-6 max-w-sm mx-auto"
            >
              <h3 className="text-lg font-bold text-white mb-4 text-center">邀请好友</h3>

              <div className="bg-white/5 rounded-xl p-6 mb-4 text-center">
                <p className="text-white/50 text-sm mb-2">房间号</p>
                <p className="text-3xl font-bold text-white tracking-widest">{roomCode}</p>
              </div>

              <p className="text-white/40 text-xs text-center mb-4">
                分享房间号给好友，一起听音乐吧
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInvite(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium"
                >
                  取消
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { copyRoomCode(); setShowInvite(false) }}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium"
                >
                  复制房间号
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ListenTogetherPage
