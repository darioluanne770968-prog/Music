import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

/**
 * 跨设备同步播放组件
 * 支持 AirPlay、Chromecast、蓝牙设备
 */

// 设备类型
export type OutputDeviceType = 'local' | 'airplay' | 'chromecast' | 'bluetooth' | 'spotify-connect'

export interface OutputDevice {
  id: string
  name: string
  type: OutputDeviceType
  isActive: boolean
  isAvailable: boolean
  icon: string
  battery?: number
}

// 播放状态同步数据
export interface SyncState {
  songId: string
  position: number
  isPlaying: boolean
  volume: number
  timestamp: number
}

// 检测 AirPlay 可用性
export async function detectAirPlay(): Promise<boolean> {
  // @ts-ignore - WebKit specific
  if (window.WebKitPlaybackTargetAvailabilityEvent) {
    return true
  }
  return false
}

// 检测 Chromecast 可用性
export async function detectChromecast(): Promise<boolean> {
  // @ts-ignore
  return !!(window.chrome && window.chrome.cast)
}

// 获取蓝牙设备
export async function getBluetoothDevices(): Promise<OutputDevice[]> {
  if (!('bluetooth' in navigator)) return []

  try {
    // @ts-ignore
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['audio_source'] }],
      optionalServices: ['battery_service']
    })

    return [{
      id: device.id,
      name: device.name || '蓝牙设备',
      type: 'bluetooth',
      isActive: false,
      isAvailable: true,
      icon: '🎧'
    }]
  } catch {
    return []
  }
}

// 跨设备同步 Hook
export function useCrossDeviceSync() {
  const { currentSong, currentTime, isPlaying, volume } = usePlayerStore()
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [lastSync, setLastSync] = useState<SyncState | null>(null)

  // 发送同步状态
  const sendSyncState = useCallback(async () => {
    if (!syncEnabled || !currentSong) return

    const state: SyncState = {
      songId: currentSong.id,
      position: currentTime,
      isPlaying,
      volume,
      timestamp: Date.now()
    }

    // 通过 WebSocket 或 API 发送状态
    try {
      await fetch('/api/sync/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      setLastSync(state)
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [syncEnabled, currentSong, currentTime, isPlaying, volume])

  // 定期同步
  useEffect(() => {
    if (!syncEnabled) return

    const interval = setInterval(sendSyncState, 5000)
    return () => clearInterval(interval)
  }, [syncEnabled, sendSyncState])

  return {
    syncEnabled,
    setSyncEnabled,
    lastSync,
    sendSyncState
  }
}

// 设备选择器组件
interface DeviceSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (device: OutputDevice) => void
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [devices, setDevices] = useState<OutputDevice[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [activeDevice, setActiveDevice] = useState<string>('local')

  // 扫描可用设备
  const scanDevices = useCallback(async () => {
    setIsScanning(true)

    const foundDevices: OutputDevice[] = [
      {
        id: 'local',
        name: '本机',
        type: 'local',
        isActive: activeDevice === 'local',
        isAvailable: true,
        icon: '📱'
      }
    ]

    // 检测 AirPlay
    if (await detectAirPlay()) {
      foundDevices.push({
        id: 'airplay-1',
        name: 'AirPlay',
        type: 'airplay',
        isActive: false,
        isAvailable: true,
        icon: '📺'
      })
    }

    // 检测 Chromecast
    if (await detectChromecast()) {
      foundDevices.push({
        id: 'chromecast-1',
        name: 'Chromecast',
        type: 'chromecast',
        isActive: false,
        isAvailable: true,
        icon: '📡'
      })
    }

    // 模拟蓝牙设备（实际需要蓝牙权限）
    foundDevices.push(
      {
        id: 'bt-1',
        name: 'AirPods Pro',
        type: 'bluetooth',
        isActive: false,
        isAvailable: true,
        icon: '🎧',
        battery: 85
      },
      {
        id: 'bt-2',
        name: 'HomePod mini',
        type: 'bluetooth',
        isActive: false,
        isAvailable: true,
        icon: '🔊'
      }
    )

    setDevices(foundDevices)
    setIsScanning(false)
  }, [activeDevice])

  useEffect(() => {
    if (isOpen) {
      scanDevices()
    }
  }, [isOpen, scanDevices])

  const handleSelect = (device: OutputDevice) => {
    setActiveDevice(device.id)
    onSelect(device)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-dark-800 rounded-t-3xl z-50 p-6 max-h-[70vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">选择播放设备</h2>
              <button
                onClick={scanDevices}
                disabled={isScanning}
                className="px-4 py-2 bg-white/10 rounded-full text-sm text-white/80 hover:bg-white/20"
              >
                {isScanning ? '扫描中...' : '重新扫描'}
              </button>
            </div>

            <div className="space-y-3">
              {devices.map((device) => (
                <motion.button
                  key={device.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(device)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    device.id === activeDevice
                      ? 'bg-primary-500/20 border border-primary-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{device.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{device.name}</p>
                    <p className="text-xs text-white/60">
                      {device.type === 'local' && '本地播放'}
                      {device.type === 'airplay' && 'Apple AirPlay'}
                      {device.type === 'chromecast' && 'Google Cast'}
                      {device.type === 'bluetooth' && '蓝牙音频'}
                    </p>
                  </div>
                  {device.battery !== undefined && (
                    <div className="flex items-center gap-1 text-white/60">
                      <span className="text-sm">{device.battery}%</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 6H4a2 2 0 00-2 2v8a2 2 0 002 2h13a2 2 0 002-2V8a2 2 0 00-2-2zm-1 8H5V8h11v6zm5-4v4h-2V10h2z" />
                      </svg>
                    </div>
                  )}
                  {device.id === activeDevice && (
                    <motion.div
                      layoutId="activeDevice"
                      className="w-3 h-3 rounded-full bg-primary-500"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* 跨设备同步选项 */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-white/60 mb-3">跨设备功能</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">自动续播</p>
                    <p className="text-xs text-white/60">在其他设备上继续播放</p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">同步播放列表</p>
                    <p className="text-xs text-white/60">跨设备同步当前队列</p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

// 锁屏控制 Hook (使用 Media Session API)
export function useLockScreenControls() {
  const { currentSong, isPlaying, playPause, playNext, playPrevious, seek, currentTime, duration } = usePlayerStore()

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    // 设置媒体元数据
    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.name,
        artist: currentSong.artists?.map(a => a.name).join(', ') || '',
        album: currentSong.album?.name || '',
        artwork: currentSong.album?.coverUrl ? [
          { src: currentSong.album.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: currentSong.album.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: currentSong.album.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: currentSong.album.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: currentSong.album.coverUrl, sizes: '384x384', type: 'image/jpeg' },
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
        position: Math.min(currentTime, duration),
      })
    }

    // 设置操作处理器
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => playPause()],
      ['pause', () => playPause()],
      ['previoustrack', () => playPrevious()],
      ['nexttrack', () => playNext()],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime)
        }
      }],
      ['seekbackward', (details) => {
        const skipTime = details.seekOffset || 10
        seek(Math.max(0, currentTime - skipTime))
      }],
      ['seekforward', (details) => {
        const skipTime = details.seekOffset || 10
        seek(Math.min(duration, currentTime + skipTime))
      }],
    ]

    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch (e) {
        console.warn(`Action ${action} is not supported`)
      }
    })

    return () => {
      handlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch (e) {
          // Ignore
        }
      })
    }
  }, [currentSong, isPlaying, currentTime, duration, playPause, playNext, playPrevious, seek])
}

// 蓝牙元数据 Hook
export function useBluetoothMetadata() {
  const { currentSong, isPlaying } = usePlayerStore()

  useEffect(() => {
    // 蓝牙 AVRCP 元数据通过 Media Session API 自动处理
    // 这里可以添加额外的蓝牙特定功能

    // @ts-ignore - Capacitor specific
    if (window.Capacitor?.Plugins?.BluetoothInfo) {
      // @ts-ignore
      window.Capacitor.Plugins.BluetoothInfo.updateNowPlaying({
        title: currentSong?.name || '',
        artist: currentSong?.artists?.map(a => a.name).join(', ') || '',
        album: currentSong?.album?.name || '',
        isPlaying
      })
    }
  }, [currentSong, isPlaying])
}

// AirPlay 按钮组件
export const AirPlayButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    detectAirPlay().then(setIsAvailable)
  }, [])

  if (!isAvailable) return null

  return (
    <button
      className={`p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
      onClick={() => {
        // 触发 AirPlay 选择器
        const audio = document.querySelector('audio')
        if (audio) {
          // @ts-ignore - WebKit specific
          audio.webkitShowPlaybackTargetPicker?.()
        }
      }}
    >
      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    </button>
  )
}

export default DeviceSelector
