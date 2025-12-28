import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 协作创作工作室
 * 支持多人实时协作编曲、混音
 */

// 协作者
interface Collaborator {
  id: string
  name: string
  avatar: string
  color: string
  cursor: { x: number; y: number } | null
  activeTrack: number | null
  isOnline: boolean
  role: 'owner' | 'editor' | 'viewer'
}

// 音轨
interface Track {
  id: string
  name: string
  type: 'audio' | 'midi' | 'vocal' | 'drums'
  color: string
  volume: number
  pan: number
  muted: boolean
  soloed: boolean
  locked: boolean
  lockedBy: string | null
  clips: Clip[]
}

// 音频片段
interface Clip {
  id: string
  trackId: string
  startTime: number
  duration: number
  name: string
  color: string
  waveform?: number[]
}

// 项目
interface Project {
  id: string
  name: string
  bpm: number
  timeSignature: { beats: number; noteValue: number }
  duration: number
  tracks: Track[]
  collaborators: Collaborator[]
}

// 操作历史
interface Operation {
  id: string
  type: 'add' | 'delete' | 'modify' | 'move'
  target: 'track' | 'clip' | 'setting'
  data: any
  userId: string
  timestamp: number
}

// 聊天消息
interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'mention'
}

// WebSocket 模拟
class CollaborationSocket {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  emit(event: string, data: any) {
    console.log('Socket emit:', event, data)
    // 模拟服务器响应
    setTimeout(() => {
      this.trigger(event + '_response', { success: true, data })
    }, 100)
  }

  trigger(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }

  off(event: string) {
    this.listeners.delete(event)
  }
}

// 协作 Hook
export function useCollaboration(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null)

  const socketRef = useRef<CollaborationSocket | null>(null)

  // 初始化连接
  useEffect(() => {
    socketRef.current = new CollaborationSocket()

    // 模拟当前用户
    const user: Collaborator = {
      id: 'user_1',
      name: '我',
      avatar: '👤',
      color: '#6366f1',
      cursor: null,
      activeTrack: null,
      isOnline: true,
      role: 'owner'
    }
    setCurrentUser(user)

    // 模拟项目数据
    const mockProject: Project = {
      id: projectId,
      name: '新协作项目',
      bpm: 120,
      timeSignature: { beats: 4, noteValue: 4 },
      duration: 180,
      tracks: [
        {
          id: 'track_1',
          name: '主旋律',
          type: 'midi',
          color: '#f43f5e',
          volume: 0.8,
          pan: 0,
          muted: false,
          soloed: false,
          locked: false,
          lockedBy: null,
          clips: [
            { id: 'clip_1', trackId: 'track_1', startTime: 0, duration: 8, name: 'Intro', color: '#f43f5e' }
          ]
        },
        {
          id: 'track_2',
          name: '和弦',
          type: 'midi',
          color: '#8b5cf6',
          volume: 0.6,
          pan: -0.2,
          muted: false,
          soloed: false,
          locked: false,
          lockedBy: null,
          clips: [
            { id: 'clip_2', trackId: 'track_2', startTime: 4, duration: 16, name: 'Chords', color: '#8b5cf6' }
          ]
        },
        {
          id: 'track_3',
          name: '鼓组',
          type: 'drums',
          color: '#f59e0b',
          volume: 0.7,
          pan: 0,
          muted: false,
          soloed: false,
          locked: false,
          lockedBy: null,
          clips: [
            { id: 'clip_3', trackId: 'track_3', startTime: 0, duration: 32, name: 'Beat', color: '#f59e0b' }
          ]
        },
        {
          id: 'track_4',
          name: '贝斯',
          type: 'audio',
          color: '#10b981',
          volume: 0.75,
          pan: 0,
          muted: false,
          soloed: false,
          locked: false,
          lockedBy: null,
          clips: []
        }
      ],
      collaborators: [
        user,
        {
          id: 'user_2',
          name: '小明',
          avatar: '🎸',
          color: '#f43f5e',
          cursor: { x: 200, y: 150 },
          activeTrack: 1,
          isOnline: true,
          role: 'editor'
        },
        {
          id: 'user_3',
          name: '小红',
          avatar: '🎤',
          color: '#10b981',
          cursor: null,
          activeTrack: null,
          isOnline: false,
          role: 'editor'
        }
      ]
    }

    setProject(mockProject)
    setCollaborators(mockProject.collaborators)
    setIsConnected(true)

    // 模拟协作者动作
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => {
        if (c.id !== user.id && c.isOnline) {
          return {
            ...c,
            cursor: {
              x: Math.random() * 800,
              y: Math.random() * 400
            }
          }
        }
        return c
      }))
    }, 2000)

    return () => {
      clearInterval(interval)
      socketRef.current?.off('*')
    }
  }, [projectId])

  // 添加音轨
  const addTrack = useCallback((type: Track['type']) => {
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      name: `新${type === 'audio' ? '音频' : type === 'midi' ? 'MIDI' : type === 'vocal' ? '人声' : '鼓组'}轨`,
      type,
      color: ['#f43f5e', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)],
      volume: 0.8,
      pan: 0,
      muted: false,
      soloed: false,
      locked: false,
      lockedBy: null,
      clips: []
    }

    setProject(prev => prev ? {
      ...prev,
      tracks: [...prev.tracks, newTrack]
    } : null)

    // 广播操作
    const operation: Operation = {
      id: `op_${Date.now()}`,
      type: 'add',
      target: 'track',
      data: newTrack,
      userId: currentUser?.id || '',
      timestamp: Date.now()
    }
    setOperations(prev => [...prev, operation])
  }, [currentUser])

  // 删除音轨
  const deleteTrack = useCallback((trackId: string) => {
    setProject(prev => prev ? {
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId)
    } : null)
  }, [])

  // 更新音轨
  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    setProject(prev => prev ? {
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, ...updates } : t
      )
    } : null)
  }, [])

  // 锁定音轨
  const lockTrack = useCallback((trackId: string) => {
    updateTrack(trackId, { locked: true, lockedBy: currentUser?.id || null })
  }, [updateTrack, currentUser])

  // 解锁音轨
  const unlockTrack = useCallback((trackId: string) => {
    updateTrack(trackId, { locked: false, lockedBy: null })
  }, [updateTrack])

  // 添加片段
  const addClip = useCallback((trackId: string, startTime: number, duration: number) => {
    const newClip: Clip = {
      id: `clip_${Date.now()}`,
      trackId,
      startTime,
      duration,
      name: '新片段',
      color: project?.tracks.find(t => t.id === trackId)?.color || '#6366f1'
    }

    setProject(prev => prev ? {
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
      )
    } : null)
  }, [project])

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      content,
      timestamp: Date.now(),
      type: content.includes('@') ? 'mention' : 'text'
    }
    setChat(prev => [...prev, message])
  }, [currentUser])

  // 更新光标位置
  const updateCursor = useCallback((x: number, y: number) => {
    if (currentUser) {
      setCollaborators(prev => prev.map(c =>
        c.id === currentUser.id ? { ...c, cursor: { x, y } } : c
      ))
    }
  }, [currentUser])

  return {
    project,
    collaborators,
    chat,
    operations,
    isConnected,
    currentUser,
    addTrack,
    deleteTrack,
    updateTrack,
    lockTrack,
    unlockTrack,
    addClip,
    sendMessage,
    updateCursor
  }
}

// 时间轴组件
const Timeline: React.FC<{
  duration: number
  bpm: number
  pixelsPerBeat: number
}> = ({ duration, bpm, pixelsPerBeat }) => {
  const beats = Math.ceil(duration * bpm / 60)
  const measures = Math.ceil(beats / 4)

  return (
    <div className="h-6 bg-dark-800 border-b border-dark-600 flex items-end">
      {Array.from({ length: measures }).map((_, i) => (
        <div
          key={i}
          className="border-l border-white/20 h-full flex items-center"
          style={{ width: pixelsPerBeat * 4 }}
        >
          <span className="text-xs text-white/40 ml-1">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

// 音轨列表组件
const TrackList: React.FC<{
  tracks: Track[]
  onUpdate: (trackId: string, updates: Partial<Track>) => void
  onLock: (trackId: string) => void
  onUnlock: (trackId: string) => void
  onDelete: (trackId: string) => void
  collaborators: Collaborator[]
}> = ({ tracks, onUpdate, onLock, onUnlock, onDelete, collaborators }) => {
  return (
    <div className="w-48 bg-dark-800 border-r border-dark-600">
      {tracks.map((track, index) => {
        const lockedByUser = track.lockedBy
          ? collaborators.find(c => c.id === track.lockedBy)
          : null
        const activeUsers = collaborators.filter(c => c.activeTrack === index && c.isOnline)

        return (
          <div
            key={track.id}
            className="h-20 border-b border-dark-600 p-2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm text-white font-medium truncate">
                  {track.name}
                </span>
              </div>

              {track.locked && (
                <span className="text-xs" title={`被 ${lockedByUser?.name} 锁定`}>
                  🔒
                </span>
              )}
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-1 mb-1">
              <button
                onClick={() => onUpdate(track.id, { muted: !track.muted })}
                className={`px-2 py-0.5 text-xs rounded ${
                  track.muted ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                M
              </button>
              <button
                onClick={() => onUpdate(track.id, { soloed: !track.soloed })}
                className={`px-2 py-0.5 text-xs rounded ${
                  track.soloed ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/60'
                }`}
              >
                S
              </button>
              <button
                onClick={() => track.locked ? onUnlock(track.id) : onLock(track.id)}
                className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/60"
              >
                {track.locked ? '🔓' : '🔒'}
              </button>
            </div>

            {/* 活跃用户 */}
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-1">
                {activeUsers.map(user => (
                  <div
                    key={user.id}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.avatar}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 片段组件
const ClipView: React.FC<{
  clip: Clip
  pixelsPerBeat: number
  bpm: number
}> = ({ clip, pixelsPerBeat, bpm }) => {
  const width = (clip.duration * bpm / 60) * pixelsPerBeat
  const left = (clip.startTime * bpm / 60) * pixelsPerBeat

  return (
    <motion.div
      className="absolute h-16 rounded-lg cursor-pointer overflow-hidden"
      style={{
        left,
        width,
        backgroundColor: clip.color
      }}
      whileHover={{ scale: 1.02 }}
      layoutId={clip.id}
    >
      <div className="p-1">
        <span className="text-xs text-white font-medium">{clip.name}</span>
      </div>

      {/* 波形模拟 */}
      <div className="absolute inset-x-0 bottom-0 h-8 flex items-center justify-center gap-px px-1">
        {Array.from({ length: Math.floor(width / 3) }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-white/30 rounded-full"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// 协作者光标
const CollaboratorCursor: React.FC<{
  collaborator: Collaborator
}> = ({ collaborator }) => {
  if (!collaborator.cursor) return null

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={false}
      animate={{
        x: collaborator.cursor.x,
        y: collaborator.cursor.y
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 500 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill={collaborator.color}
      >
        <path d="M0 0L12 10L6 10L0 20L0 0Z" />
      </svg>
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.name}
      </div>
    </motion.div>
  )
}

// 聊天面板
const ChatPanel: React.FC<{
  messages: ChatMessage[]
  collaborators: Collaborator[]
  onSend: (content: string) => void
}> = ({ messages, collaborators, onSend }) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim())
      setInput('')
    }
  }

  return (
    <div className="w-64 bg-dark-800 border-l border-dark-600 flex flex-col">
      {/* 协作者列表 */}
      <div className="p-3 border-b border-dark-600">
        <h4 className="text-sm text-white/60 mb-2">协作者</h4>
        <div className="flex flex-wrap gap-2">
          {collaborators.map(c => (
            <div
              key={c.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                c.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}
            >
              <span>{c.avatar}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="text-sm">
            <span className="text-primary-400 font-medium">{msg.userName}: </span>
            <span className="text-white/80">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-dark-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="发送消息..."
            className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white
                     placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-primary-500 rounded-lg text-white text-sm"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

// 主界面
interface CollaborativeStudioProps {
  projectId?: string
  className?: string
}

export const CollaborativeStudio: React.FC<CollaborativeStudioProps> = ({
  projectId = 'project_1',
  className
}) => {
  const {
    project,
    collaborators,
    chat,
    isConnected,
    addTrack,
    updateTrack,
    lockTrack,
    unlockTrack,
    deleteTrack,
    addClip,
    sendMessage,
    updateCursor
  } = useCollaboration(projectId)

  const [pixelsPerBeat, setPixelsPerBeat] = useState(20)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)

  // 播放动画
  useEffect(() => {
    if (!isPlaying || !project) return

    const interval = setInterval(() => {
      setPlayhead(prev => {
        if (prev >= project.duration) {
          setIsPlaying(false)
          return 0
        }
        return prev + 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, project])

  // 鼠标移动追踪
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      updateCursor(e.clientX - rect.left, e.clientY - rect.top)
    }
  }, [updateCursor])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-900 rounded-2xl overflow-hidden ${className}`}>
      {/* 顶部工具栏 */}
      <div className="h-14 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">{project.name}</h3>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? '已连接' : '断开'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* BPM */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">BPM</span>
            <span className="text-white font-mono">{project.bpm}</span>
          </div>

          {/* 播放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlayhead(0)}
              className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
            >
              ⏮
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false)
                setPlayhead(0)
              }}
              className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
            >
              ⏹
            </button>
          </div>

          {/* 缩放 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPixelsPerBeat(Math.max(10, pixelsPerBeat - 5))}
              className="w-6 h-6 rounded bg-white/10 text-white text-sm"
            >
              -
            </button>
            <button
              onClick={() => setPixelsPerBeat(Math.min(50, pixelsPerBeat + 5))}
              className="w-6 h-6 rounded bg-white/10 text-white text-sm"
            >
              +
            </button>
          </div>

          {/* 添加音轨 */}
          <div className="relative group">
            <button className="px-3 py-1.5 bg-primary-500 rounded-lg text-white text-sm">
              + 添加音轨
            </button>
            <div className="absolute right-0 top-full mt-1 bg-dark-700 rounded-lg overflow-hidden
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all z-50 shadow-xl">
              {[
                { type: 'audio' as const, label: '音频轨', icon: '🎵' },
                { type: 'midi' as const, label: 'MIDI轨', icon: '🎹' },
                { type: 'vocal' as const, label: '人声轨', icon: '🎤' },
                { type: 'drums' as const, label: '鼓轨', icon: '🥁' }
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => addTrack(item.type)}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10
                           flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex h-[500px]">
        {/* 音轨列表 */}
        <TrackList
          tracks={project.tracks}
          onUpdate={updateTrack}
          onLock={lockTrack}
          onUnlock={unlockTrack}
          onDelete={deleteTrack}
          collaborators={collaborators}
        />

        {/* 时间线和片段 */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto relative"
          onMouseMove={handleMouseMove}
        >
          {/* 时间轴 */}
          <Timeline
            duration={project.duration}
            bpm={project.bpm}
            pixelsPerBeat={pixelsPerBeat}
          />

          {/* 音轨内容 */}
          <div className="relative">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-20 border-b border-dark-600 relative"
                style={{ opacity: track.muted ? 0.5 : 1 }}
              >
                {/* 背景格子 */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: Math.ceil(project.duration * project.bpm / 60 / 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="border-l border-white/5 h-full"
                      style={{ width: pixelsPerBeat * 4 }}
                    />
                  ))}
                </div>

                {/* 片段 */}
                {track.clips.map(clip => (
                  <ClipView
                    key={clip.id}
                    clip={clip}
                    pixelsPerBeat={pixelsPerBeat}
                    bpm={project.bpm}
                  />
                ))}
              </div>
            ))}

            {/* 播放头 */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40"
              style={{
                left: (playhead * project.bpm / 60) * pixelsPerBeat
              }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1 -mt-1" />
            </motion.div>
          </div>

          {/* 协作者光标 */}
          {collaborators.filter(c => c.isOnline && c.cursor).map(c => (
            <CollaboratorCursor key={c.id} collaborator={c} />
          ))}
        </div>

        {/* 聊天面板 */}
        <ChatPanel
          messages={chat}
          collaborators={collaborators}
          onSend={sendMessage}
        />
      </div>
    </div>
  )
}

export default CollaborativeStudio
