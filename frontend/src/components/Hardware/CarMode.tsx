import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 车载模式组件
 * 大按钮、语音控制、驾驶安全优化
 */

// 车载状态
interface CarState {
  isConnected: boolean
  connectionType: 'carplay' | 'android_auto' | 'bluetooth' | 'usb'
  vehicleName: string
  batteryLevel: number
  isCharging: boolean
  speed: number
  isParked: boolean
}

// 快捷操作
interface QuickAction {
  id: string
  icon: string
  label: string
  action: () => void
}

// 车载模式 Hook
export function useCarMode() {
  const [carState, setCarState] = useState<CarState>({
    isConnected: true,
    connectionType: 'carplay',
    vehicleName: '我的 Tesla Model 3',
    batteryLevel: 78,
    isCharging: false,
    speed: 0,
    isParked: true
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState({
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    artwork: '/api/placeholder/200/200',
    duration: 269,
    currentTime: 45
  })
  const [volume, setVolume] = useState(60)
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  // 模拟车速变化
  useEffect(() => {
    const interval = setInterval(() => {
      if (!carState.isParked) {
        setCarState(prev => ({
          ...prev,
          speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 10)
        }))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [carState.isParked])

  // 语音命令处理
  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes('播放') || lowerCommand.includes('play')) {
      setIsPlaying(true)
      return '开始播放'
    }
    if (lowerCommand.includes('暂停') || lowerCommand.includes('pause')) {
      setIsPlaying(false)
      return '已暂停'
    }
    if (lowerCommand.includes('下一首') || lowerCommand.includes('next')) {
      return '播放下一首'
    }
    if (lowerCommand.includes('音量')) {
      const match = command.match(/(\d+)/)
      if (match) {
        setVolume(parseInt(match[1]))
        return `音量设置为 ${match[1]}`
      }
    }

    return '未识别的命令'
  }, [])

  // 开始语音识别
  const startVoice = useCallback(() => {
    setIsVoiceActive(true)
    // 模拟语音识别
    setTimeout(() => {
      setIsVoiceActive(false)
    }, 3000)
  }, [])

  return {
    carState,
    setCarState,
    isPlaying,
    setIsPlaying,
    currentTrack,
    volume,
    setVolume,
    isVoiceActive,
    startVoice,
    processVoiceCommand
  }
}

// 大按钮组件
const BigButton: React.FC<{
  icon: string
  label?: string
  onClick: () => void
  isActive?: boolean
  size?: 'normal' | 'large'
  variant?: 'primary' | 'secondary' | 'danger'
}> = ({ icon, label, onClick, isActive, size = 'normal', variant = 'secondary' }) => {
  const sizeClasses = {
    normal: 'w-20 h-20',
    large: 'w-28 h-28'
  }

  const variantClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80',
    danger: 'bg-red-500 text-white'
  }

  return (
    <motion.button
      className={`${sizeClasses[size]} rounded-2xl flex flex-col items-center justify-center
                ${variantClasses[variant]} transition-all`}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className={size === 'large' ? 'text-4xl' : 'text-2xl'}>{icon}</span>
      {label && <span className="text-xs mt-1">{label}</span>}
    </motion.button>
  )
}

// 进度条组件
const ProgressBar: React.FC<{
  current: number
  total: number
  onSeek: (time: number) => void
}> = ({ current, total, onSeek }) => {
  const progress = (current / total) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full">
      <div
        className="h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const percent = x / rect.width
          onSeek(percent * total)
        }}
      >
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-white/60">
        <span>{formatTime(current)}</span>
        <span>{formatTime(total)}</span>
      </div>
    </div>
  )
}

// 语音助手覆盖层
const VoiceOverlay: React.FC<{
  isActive: boolean
  onClose: () => void
}> = ({ isActive, onClose }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 bg-dark-900/95 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-primary-500 flex items-center justify-center mb-8"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 0 0 rgba(99, 102, 241, 0.4)',
                '0 0 0 40px rgba(99, 102, 241, 0)',
                '0 0 0 0 rgba(99, 102, 241, 0.4)'
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            <span className="text-5xl">🎤</span>
          </motion.div>

          <p className="text-2xl text-white font-medium mb-4">正在聆听...</p>
          <p className="text-white/60">试试说 "播放周杰伦的歌"</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 主界面
interface CarModeProps {
  className?: string
  onExit?: () => void
}

export const CarMode: React.FC<CarModeProps> = ({ className, onExit }) => {
  const {
    carState,
    isPlaying,
    setIsPlaying,
    currentTrack,
    volume,
    setVolume,
    isVoiceActive,
    startVoice
  } = useCarMode()

  const [showPlaylist, setShowPlaylist] = useState(false)

  // 快捷操作
  const quickActions: QuickAction[] = [
    { id: 'favorite', icon: '❤️', label: '喜欢', action: () => {} },
    { id: 'playlist', icon: '📋', label: '列表', action: () => setShowPlaylist(true) },
    { id: 'shuffle', icon: '🔀', label: '随机', action: () => {} },
    { id: 'repeat', icon: '🔁', label: '循环', action: () => {} }
  ]

  // 模拟播放列表
  const playlist = [
    { title: '晴天', artist: '周杰伦' },
    { title: '七里香', artist: '周杰伦' },
    { title: '稻香', artist: '周杰伦' },
    { title: '告白气球', artist: '周杰伦' },
    { title: '简单爱', artist: '周杰伦' }
  ]

  return (
    <div className={`min-h-screen bg-dark-900 text-white ${className}`}>
      {/* 状态栏 */}
      <div className="flex items-center justify-between p-4 bg-dark-800">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            carState.isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm">
            {carState.connectionType === 'carplay' ? 'CarPlay' :
             carState.connectionType === 'android_auto' ? 'Android Auto' :
             carState.connectionType === 'bluetooth' ? '蓝牙' : 'USB'}
          </span>
          <span className="text-sm text-white/40">|</span>
          <span className="text-sm text-white/60">{carState.vehicleName}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* 速度显示（驾驶中） */}
          {!carState.isParked && (
            <div className="flex items-center gap-1">
              <span className="text-lg font-mono">{Math.round(carState.speed)}</span>
              <span className="text-xs text-white/40">km/h</span>
            </div>
          )}

          {/* 电量 */}
          <div className="flex items-center gap-1">
            <span className="text-sm">{carState.isCharging ? '⚡' : '🔋'}</span>
            <span className="text-sm">{carState.batteryLevel}%</span>
          </div>

          {/* 退出按钮 */}
          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm"
            >
              退出车载模式
            </button>
          )}
        </div>
      </div>

      {/* 主内容 */}
      <div className="p-8">
        {/* 专辑封面和信息 */}
        <div className="flex items-center gap-8 mb-8">
          <motion.img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-48 h-48 rounded-2xl shadow-2xl"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying ? {
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            } : undefined}
          />

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{currentTrack.title}</h1>
            <p className="text-2xl text-white/60 mb-1">{currentTrack.artist}</p>
            <p className="text-lg text-white/40">{currentTrack.album}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <ProgressBar
            current={currentTrack.currentTime}
            total={currentTrack.duration}
            onSeek={(time) => console.log('Seek to:', time)}
          />
        </div>

        {/* 主控制按钮 */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <BigButton
            icon="⏮"
            onClick={() => {}}
          />

          <BigButton
            icon={isPlaying ? '⏸' : '▶️'}
            onClick={() => setIsPlaying(!isPlaying)}
            size="large"
            variant="primary"
          />

          <BigButton
            icon="⏭"
            onClick={() => {}}
          />
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-4 mb-8 max-w-md mx-auto">
          <span className="text-2xl">🔈</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="flex-1 h-3 rounded-full"
          />
          <span className="text-2xl">🔊</span>
        </div>

        {/* 快捷操作 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {quickActions.map(action => (
            <BigButton
              key={action.id}
              icon={action.icon}
              label={action.label}
              onClick={action.action}
            />
          ))}
        </div>

        {/* 语音按钮 */}
        <div className="flex justify-center">
          <motion.button
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500
                     flex items-center justify-center shadow-lg"
            whileTap={{ scale: 0.95 }}
            onClick={startVoice}
          >
            <span className="text-3xl">🎤</span>
          </motion.button>
        </div>

        {/* 驾驶安全提示 */}
        {!carState.isParked && (
          <div className="mt-8 p-4 bg-yellow-500/20 rounded-xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-medium">驾驶安全模式</p>
              <p className="text-sm text-white/60">
                部分交互已简化，建议使用语音控制
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 播放列表抽屉 */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPlaylist(false)}
          >
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-96 bg-dark-800 p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">播放列表</h3>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-2xl text-white/60"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl cursor-pointer ${
                      index === 0 ? 'bg-primary-500/20' : 'bg-white/5 hover:bg-white/10'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-lg font-medium">{track.title}</p>
                    <p className="text-sm text-white/60">{track.artist}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 语音助手覆盖 */}
      <VoiceOverlay
        isActive={isVoiceActive}
        onClose={() => {}}
      />
    </div>
  )
}

export default CarMode
