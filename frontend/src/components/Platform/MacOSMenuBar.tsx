import React, { useEffect, useState } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

/**
 * macOS 菜单栏播放器组件
 * 通过 Electron 的 Tray API 实现
 */

// 快捷键配置
export interface KeyboardShortcuts {
  playPause: string
  next: string
  previous: string
  volumeUp: string
  volumeDown: string
  like: string
  search: string
  miniPlayer: string
}

const defaultShortcuts: KeyboardShortcuts = {
  playPause: 'Space',
  next: 'CommandOrControl+Right',
  previous: 'CommandOrControl+Left',
  volumeUp: 'CommandOrControl+Up',
  volumeDown: 'CommandOrControl+Down',
  like: 'CommandOrControl+L',
  search: 'CommandOrControl+K',
  miniPlayer: 'CommandOrControl+M',
}

// 检测是否在 Electron 环境
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electron
}

// 获取 Electron API
const getElectron = () => {
  if (isElectron()) {
    return (window as any).electron
  }
  return null
}

// macOS 菜单栏控制 Hook
export function useMacOSMenuBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    playPause,
    playNext,
    playPrevious,
    setVolume,
  } = usePlayerStore()

  useEffect(() => {
    const electron = getElectron()
    if (!electron) return

    // 更新系统托盘显示
    const updateTray = () => {
      electron.ipcRenderer.send('update-tray', {
        song: currentSong,
        isPlaying,
      })
    }

    updateTray()

    // 监听托盘事件
    const handleTrayClick = () => playPause()
    const handleTrayNext = () => playNext()
    const handleTrayPrevious = () => playPrevious()

    electron.ipcRenderer.on('tray-play-pause', handleTrayClick)
    electron.ipcRenderer.on('tray-next', handleTrayNext)
    electron.ipcRenderer.on('tray-previous', handleTrayPrevious)

    return () => {
      electron.ipcRenderer.removeListener('tray-play-pause', handleTrayClick)
      electron.ipcRenderer.removeListener('tray-next', handleTrayNext)
      electron.ipcRenderer.removeListener('tray-previous', handleTrayPrevious)
    }
  }, [currentSong, isPlaying, playPause, playNext, playPrevious])

  return null
}

// 全局快捷键 Hook
export function useGlobalShortcuts(shortcuts: KeyboardShortcuts = defaultShortcuts) {
  const {
    playPause,
    playNext,
    playPrevious,
    volume,
    setVolume,
  } = usePlayerStore()

  useEffect(() => {
    const electron = getElectron()
    if (!electron) return

    // 注册全局快捷键
    const registerShortcuts = () => {
      electron.ipcRenderer.send('register-shortcuts', shortcuts)
    }

    registerShortcuts()

    // 监听快捷键事件
    const handleShortcut = (_: any, action: string) => {
      switch (action) {
        case 'play-pause':
          playPause()
          break
        case 'next':
          playNext()
          break
        case 'previous':
          playPrevious()
          break
        case 'volume-up':
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'volume-down':
          setVolume(Math.max(0, volume - 0.1))
          break
        default:
          break
      }
    }

    electron.ipcRenderer.on('shortcut', handleShortcut)

    return () => {
      electron.ipcRenderer.removeListener('shortcut', handleShortcut)
      electron.ipcRenderer.send('unregister-shortcuts')
    }
  }, [playPause, playNext, playPrevious, volume, setVolume, shortcuts])
}

// Touch Bar 配置 (macOS)
export function useTouchBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playPause,
    playNext,
    playPrevious,
    seek,
  } = usePlayerStore()

  useEffect(() => {
    const electron = getElectron()
    if (!electron) return

    // 更新 Touch Bar
    const updateTouchBar = () => {
      electron.ipcRenderer.send('update-touchbar', {
        song: currentSong,
        isPlaying,
        currentTime,
        duration,
      })
    }

    updateTouchBar()

    // 监听 Touch Bar 事件
    const handleTouchBarPlay = () => playPause()
    const handleTouchBarNext = () => playNext()
    const handleTouchBarPrevious = () => playPrevious()
    const handleTouchBarSeek = (_: any, time: number) => seek(time)

    electron.ipcRenderer.on('touchbar-play', handleTouchBarPlay)
    electron.ipcRenderer.on('touchbar-next', handleTouchBarNext)
    electron.ipcRenderer.on('touchbar-previous', handleTouchBarPrevious)
    electron.ipcRenderer.on('touchbar-seek', handleTouchBarSeek)

    return () => {
      electron.ipcRenderer.removeListener('touchbar-play', handleTouchBarPlay)
      electron.ipcRenderer.removeListener('touchbar-next', handleTouchBarNext)
      electron.ipcRenderer.removeListener('touchbar-previous', handleTouchBarPrevious)
      electron.ipcRenderer.removeListener('touchbar-seek', handleTouchBarSeek)
    }
  }, [currentSong, isPlaying, currentTime, duration, playPause, playNext, playPrevious, seek])
}

// Media Session API (跨平台)
export function useMediaSession() {
  const {
    currentSong,
    isPlaying,
    playPause,
    playNext,
    playPrevious,
    seek,
    currentTime,
    duration,
  } = usePlayerStore()

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    // 设置媒体元数据
    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.name,
        artist: currentSong.artists?.map(a => a.name).join(', ') || '',
        album: currentSong.album?.name || '',
        artwork: currentSong.album?.coverUrl ? [
          { src: currentSong.album.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ] : undefined,
      })
    }

    // 设置播放状态
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

    // 设置位置状态
    if (duration > 0) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: currentTime,
      })
    }

    // 设置操作处理器
    navigator.mediaSession.setActionHandler('play', () => playPause())
    navigator.mediaSession.setActionHandler('pause', () => playPause())
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious())
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext())
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime)
      }
    })
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10
      seek(Math.max(0, currentTime - skipTime))
    })
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10
      seek(Math.min(duration, currentTime + skipTime))
    })

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekto', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
    }
  }, [currentSong, isPlaying, currentTime, duration, playPause, playNext, playPrevious, seek])
}

// 快捷键设置组件
export const ShortcutsSettings: React.FC<{
  shortcuts: KeyboardShortcuts
  onChange: (shortcuts: KeyboardShortcuts) => void
}> = ({ shortcuts, onChange }) => {
  const [recording, setRecording] = useState<keyof KeyboardShortcuts | null>(null)

  const handleRecord = (key: keyof KeyboardShortcuts) => {
    setRecording(key)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recording) return
    e.preventDefault()

    const modifiers: string[] = []
    if (e.metaKey) modifiers.push('Command')
    if (e.ctrlKey) modifiers.push('Control')
    if (e.altKey) modifiers.push('Alt')
    if (e.shiftKey) modifiers.push('Shift')

    const key = e.key === ' ' ? 'Space' : e.key
    const shortcut = [...modifiers, key].join('+')

    onChange({ ...shortcuts, [recording]: shortcut })
    setRecording(null)
  }

  const shortcutLabels: Record<keyof KeyboardShortcuts, string> = {
    playPause: '播放/暂停',
    next: '下一首',
    previous: '上一首',
    volumeUp: '音量增加',
    volumeDown: '音量减少',
    like: '喜欢歌曲',
    search: '搜索',
    miniPlayer: '迷你播放器',
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <h3 className="text-lg font-medium text-white">快捷键设置</h3>
      {(Object.keys(shortcuts) as Array<keyof KeyboardShortcuts>).map((key) => (
        <div
          key={key}
          className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
        >
          <span className="text-white">{shortcutLabels[key]}</span>
          <button
            onClick={() => handleRecord(key)}
            className={`px-4 py-2 rounded-lg text-sm font-mono ${
              recording === key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {recording === key ? '按下快捷键...' : shortcuts[key]}
          </button>
        </div>
      ))}
    </div>
  )
}

export default useMacOSMenuBar
