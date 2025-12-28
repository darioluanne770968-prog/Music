import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

/**
 * iOS 平台集成组件
 * 支持 Widget、Siri、Apple Watch
 */

// 检测是否在 Capacitor iOS 环境
const isCapacitoriOS = (): boolean => {
  // @ts-ignore
  return window.Capacitor?.getPlatform() === 'ios'
}

// 获取 Capacitor 插件
const getCapacitor = () => {
  // @ts-ignore
  return window.Capacitor?.Plugins || {}
}

// ==================== iOS Widget ====================

export interface WidgetData {
  songId: string
  songName: string
  artistName: string
  albumCover: string
  isPlaying: boolean
  progress: number
}

// Widget 数据同步 Hook
export function useWidgetSync() {
  const { currentSong, isPlaying, currentTime, duration } = usePlayerStore()

  useEffect(() => {
    if (!isCapacitoriOS()) return

    const updateWidget = async () => {
      const { WidgetBridge } = getCapacitor()
      if (!WidgetBridge) return

      const data: WidgetData = {
        songId: currentSong?.id || '',
        songName: currentSong?.name || '未在播放',
        artistName: currentSong?.artists?.map(a => a.name).join(', ') || '',
        albumCover: currentSong?.album?.coverUrl || '',
        isPlaying,
        progress: duration > 0 ? currentTime / duration : 0
      }

      try {
        await WidgetBridge.updateWidget({ data })
      } catch (error) {
        console.error('Widget update failed:', error)
      }
    }

    updateWidget()

    // 定期更新进度
    const interval = setInterval(updateWidget, 1000)
    return () => clearInterval(interval)
  }, [currentSong, isPlaying, currentTime, duration])
}

// ==================== Siri 集成 ====================

export interface SiriShortcut {
  id: string
  title: string
  phrase: string
  action: string
  icon: string
}

// 预定义的 Siri 快捷指令
export const siriShortcuts: SiriShortcut[] = [
  {
    id: 'play-music',
    title: '播放音乐',
    phrase: '播放汽水音乐',
    action: 'play',
    icon: '▶️'
  },
  {
    id: 'play-liked',
    title: '播放喜欢的歌',
    phrase: '播放我喜欢的歌',
    action: 'play-liked',
    icon: '❤️'
  },
  {
    id: 'play-daily',
    title: '每日推荐',
    phrase: '播放每日推荐',
    action: 'play-daily',
    icon: '📅'
  },
  {
    id: 'play-recent',
    title: '最近播放',
    phrase: '播放最近听的歌',
    action: 'play-recent',
    icon: '🕐'
  },
  {
    id: 'search-song',
    title: '搜索歌曲',
    phrase: '用汽水音乐搜索',
    action: 'search',
    icon: '🔍'
  }
]

// Siri 集成 Hook
export function useSiriIntegration() {
  const { playPause, playNext, playPrevious } = usePlayerStore()

  useEffect(() => {
    if (!isCapacitoriOS()) return

    const { SiriShortcuts } = getCapacitor()
    if (!SiriShortcuts) return

    // 注册 Siri 快捷指令
    const registerShortcuts = async () => {
      for (const shortcut of siriShortcuts) {
        try {
          await SiriShortcuts.donate({
            persistentIdentifier: shortcut.id,
            title: shortcut.title,
            suggestedInvocationPhrase: shortcut.phrase,
            userInfo: { action: shortcut.action }
          })
        } catch (error) {
          console.error('Siri shortcut registration failed:', error)
        }
      }
    }

    registerShortcuts()

    // 监听 Siri 命令
    const handleSiriAction = (data: { action: string; query?: string }) => {
      switch (data.action) {
        case 'play':
          playPause()
          break
        case 'next':
          playNext()
          break
        case 'previous':
          playPrevious()
          break
        case 'play-liked':
          // 播放喜欢的歌曲
          window.dispatchEvent(new CustomEvent('siri-play-liked'))
          break
        case 'play-daily':
          // 播放每日推荐
          window.dispatchEvent(new CustomEvent('siri-play-daily'))
          break
        case 'search':
          // 搜索歌曲
          window.dispatchEvent(new CustomEvent('siri-search', { detail: data.query }))
          break
        default:
          break
      }
    }

    SiriShortcuts.addListener('siriAction', handleSiriAction)

    return () => {
      SiriShortcuts.removeAllListeners()
    }
  }, [playPause, playNext, playPrevious])
}

// Siri 快捷指令设置组件
export const SiriShortcutsSettings: React.FC = () => {
  const [addedShortcuts, setAddedShortcuts] = useState<string[]>([])

  const handleAddShortcut = async (shortcut: SiriShortcut) => {
    if (!isCapacitoriOS()) {
      alert('此功能仅在 iOS 设备上可用')
      return
    }

    const { SiriShortcuts } = getCapacitor()
    if (!SiriShortcuts) return

    try {
      await SiriShortcuts.present({
        persistentIdentifier: shortcut.id,
        title: shortcut.title,
        suggestedInvocationPhrase: shortcut.phrase
      })
      setAddedShortcuts([...addedShortcuts, shortcut.id])
    } catch (error) {
      console.error('Failed to add Siri shortcut:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🎙️</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Siri 快捷指令</h3>
          <p className="text-sm text-white/60">用语音控制汽水音乐</p>
        </div>
      </div>

      <div className="space-y-3">
        {siriShortcuts.map((shortcut) => (
          <motion.div
            key={shortcut.id}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{shortcut.icon}</span>
              <div>
                <p className="font-medium text-white">{shortcut.title}</p>
                <p className="text-xs text-white/60">"{shortcut.phrase}"</p>
              </div>
            </div>
            <button
              onClick={() => handleAddShortcut(shortcut)}
              disabled={addedShortcuts.includes(shortcut.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                addedShortcuts.includes(shortcut.id)
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {addedShortcuts.includes(shortcut.id) ? '已添加' : '添加到 Siri'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ==================== Apple Watch ====================

export interface WatchData {
  songId: string
  songName: string
  artistName: string
  albumThumb: string
  isPlaying: boolean
  duration: number
  currentTime: number
}

// Apple Watch 同步 Hook
export function useAppleWatchSync() {
  const { currentSong, isPlaying, currentTime, duration, playPause, playNext, playPrevious, setVolume } = usePlayerStore()

  useEffect(() => {
    if (!isCapacitoriOS()) return

    const { WatchConnectivity } = getCapacitor()
    if (!WatchConnectivity) return

    // 更新 Watch 显示
    const updateWatch = async () => {
      const data: WatchData = {
        songId: currentSong?.id || '',
        songName: currentSong?.name || '未在播放',
        artistName: currentSong?.artists?.map(a => a.name).join(', ') || '',
        albumThumb: currentSong?.album?.coverUrl || '',
        isPlaying,
        duration,
        currentTime
      }

      try {
        await WatchConnectivity.sendMessage({ data })
      } catch (error) {
        console.error('Watch sync failed:', error)
      }
    }

    updateWatch()

    // 监听 Watch 控制命令
    const handleWatchMessage = (message: { action: string; value?: number }) => {
      switch (message.action) {
        case 'playPause':
          playPause()
          break
        case 'next':
          playNext()
          break
        case 'previous':
          playPrevious()
          break
        case 'volume':
          if (message.value !== undefined) {
            setVolume(message.value)
          }
          break
        default:
          break
      }
    }

    WatchConnectivity.addListener('messageReceived', handleWatchMessage)

    // 定期同步
    const interval = setInterval(updateWatch, 1000)

    return () => {
      clearInterval(interval)
      WatchConnectivity.removeAllListeners()
    }
  }, [currentSong, isPlaying, currentTime, duration, playPause, playNext, playPrevious, setVolume])
}

// Apple Watch 设置组件
export const AppleWatchSettings: React.FC = () => {
  const [isPaired, setIsPaired] = useState(false)
  const [isReachable, setIsReachable] = useState(false)

  useEffect(() => {
    if (!isCapacitoriOS()) return

    const checkWatchStatus = async () => {
      const { WatchConnectivity } = getCapacitor()
      if (!WatchConnectivity) return

      try {
        const status = await WatchConnectivity.getSessionState()
        setIsPaired(status.isPaired)
        setIsReachable(status.isReachable)
      } catch (error) {
        console.error('Watch status check failed:', error)
      }
    }

    checkWatchStatus()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
          <span className="text-2xl">⌚</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Apple Watch</h3>
          <p className="text-sm text-white/60">在手表上控制音乐</p>
        </div>
      </div>

      <div className="p-4 bg-white/5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white">配对状态</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isPaired ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPaired ? '已配对' : '未配对'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white">连接状态</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isReachable ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isReachable ? '已连接' : '不可达'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Watch 功能</h4>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <p className="font-medium text-white">实时同步</p>
            <p className="text-xs text-white/60">同步播放状态到手表</p>
          </div>
          <ToggleSwitch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <p className="font-medium text-white">离线歌曲</p>
            <p className="text-xs text-white/60">同步歌曲到手表</p>
          </div>
          <ToggleSwitch />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <p className="font-medium text-white">运动模式</p>
            <p className="text-xs text-white/60">根据心率调整音乐</p>
          </div>
          <ToggleSwitch />
        </div>
      </div>
    </div>
  )
}

// 开关组件
const ToggleSwitch: React.FC<{ defaultChecked?: boolean; onChange?: (checked: boolean) => void }> = ({
  defaultChecked = false,
  onChange
}) => {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <button
      onClick={() => {
        setChecked(!checked)
        onChange?.(!checked)
      }}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-primary-500' : 'bg-white/20'
      }`}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ==================== CarPlay ====================

export function useCarPlay() {
  const { currentSong, isPlaying, playPause, playNext, playPrevious } = usePlayerStore()

  useEffect(() => {
    if (!isCapacitoriOS()) return

    const { CarPlay } = getCapacitor()
    if (!CarPlay) return

    // 更新 CarPlay Now Playing
    const updateCarPlay = async () => {
      try {
        await CarPlay.updateNowPlaying({
          title: currentSong?.name || '',
          artist: currentSong?.artists?.map(a => a.name).join(', ') || '',
          album: currentSong?.album?.name || '',
          artwork: currentSong?.album?.coverUrl || '',
          isPlaying
        })
      } catch (error) {
        console.error('CarPlay update failed:', error)
      }
    }

    updateCarPlay()

    // 监听 CarPlay 控制
    const handleCarPlayAction = (data: { action: string }) => {
      switch (data.action) {
        case 'play':
        case 'pause':
          playPause()
          break
        case 'next':
          playNext()
          break
        case 'previous':
          playPrevious()
          break
        default:
          break
      }
    }

    CarPlay.addListener('controlAction', handleCarPlayAction)

    return () => {
      CarPlay.removeAllListeners()
    }
  }, [currentSong, isPlaying, playPause, playNext, playPrevious])
}

// iOS 平台设置页面
export const iOSPlatformSettings: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <SiriShortcutsSettings />
      <div className="border-t border-white/10" />
      <AppleWatchSettings />
    </div>
  )
}

export default iOSPlatformSettings
