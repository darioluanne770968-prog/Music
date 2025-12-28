import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 智能音箱集成组件
 * 支持多种智能音箱品牌和多房间控制
 */

// 音箱设备
interface SpeakerDevice {
  id: string
  name: string
  brand: 'homepod' | 'sonos' | 'alexa' | 'google' | 'xiaomi' | 'other'
  model: string
  room: string
  isOnline: boolean
  isPlaying: boolean
  volume: number
  currentTrack?: {
    title: string
    artist: string
    artwork: string
  }
  capabilities: ('airplay' | 'chromecast' | 'spotify_connect' | 'dlna')[]
}

// 房间组
interface RoomGroup {
  id: string
  name: string
  icon: string
  devices: string[]
  isPlaying: boolean
  volume: number
}

// 音箱品牌信息
const SPEAKER_BRANDS = {
  homepod: { name: 'HomePod', icon: '🍎', color: '#000000' },
  sonos: { name: 'Sonos', icon: '🔊', color: '#000000' },
  alexa: { name: 'Echo', icon: '🔵', color: '#00A8E1' },
  google: { name: 'Nest', icon: '🏠', color: '#4285F4' },
  xiaomi: { name: '小米音箱', icon: '🟠', color: '#FF6700' },
  other: { name: '其他', icon: '🔈', color: '#666666' }
}

// 智能音箱 Hook
export function useSmartSpeakers() {
  const [devices, setDevices] = useState<SpeakerDevice[]>([])
  const [rooms, setRooms] = useState<RoomGroup[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  // 模拟设备发现
  useEffect(() => {
    // 模拟已配对设备
    const mockDevices: SpeakerDevice[] = [
      {
        id: 'speaker_1',
        name: '客厅 HomePod',
        brand: 'homepod',
        model: 'HomePod mini',
        room: '客厅',
        isOnline: true,
        isPlaying: true,
        volume: 65,
        currentTrack: {
          title: '晴天',
          artist: '周杰伦',
          artwork: '/api/placeholder/100/100'
        },
        capabilities: ['airplay']
      },
      {
        id: 'speaker_2',
        name: '卧室 Sonos',
        brand: 'sonos',
        model: 'Sonos One',
        room: '卧室',
        isOnline: true,
        isPlaying: false,
        volume: 40,
        capabilities: ['airplay', 'spotify_connect']
      },
      {
        id: 'speaker_3',
        name: '书房 Echo',
        brand: 'alexa',
        model: 'Echo Dot 4',
        room: '书房',
        isOnline: true,
        isPlaying: false,
        volume: 50,
        capabilities: ['spotify_connect']
      },
      {
        id: 'speaker_4',
        name: '厨房 Nest',
        brand: 'google',
        model: 'Nest Audio',
        room: '厨房',
        isOnline: false,
        isPlaying: false,
        volume: 30,
        capabilities: ['chromecast']
      },
      {
        id: 'speaker_5',
        name: '浴室小爱',
        brand: 'xiaomi',
        model: '小爱音箱 Pro',
        room: '浴室',
        isOnline: true,
        isPlaying: false,
        volume: 45,
        capabilities: ['dlna']
      }
    ]

    const mockRooms: RoomGroup[] = [
      { id: 'room_1', name: '全屋播放', icon: '🏠', devices: ['speaker_1', 'speaker_2', 'speaker_3', 'speaker_5'], isPlaying: false, volume: 50 },
      { id: 'room_2', name: '客厅+卧室', icon: '🛋️', devices: ['speaker_1', 'speaker_2'], isPlaying: false, volume: 55 },
      { id: 'room_3', name: '工作区', icon: '💼', devices: ['speaker_2', 'speaker_3'], isPlaying: false, volume: 40 }
    ]

    setDevices(mockDevices)
    setRooms(mockRooms)
  }, [])

  // 扫描新设备
  const scanForDevices = useCallback(async () => {
    setIsScanning(true)

    // 模拟扫描延迟
    await new Promise(resolve => setTimeout(resolve, 3000))

    setIsScanning(false)
  }, [])

  // 播放到设备
  const playToDevice = useCallback((deviceId: string) => {
    setDevices(prev => prev.map(d => ({
      ...d,
      isPlaying: d.id === deviceId ? true : d.isPlaying
    })))
  }, [])

  // 停止播放
  const stopDevice = useCallback((deviceId: string) => {
    setDevices(prev => prev.map(d => ({
      ...d,
      isPlaying: d.id === deviceId ? false : d.isPlaying
    })))
  }, [])

  // 设置音量
  const setVolume = useCallback((deviceId: string, volume: number) => {
    setDevices(prev => prev.map(d => ({
      ...d,
      volume: d.id === deviceId ? volume : d.volume
    })))
  }, [])

  // 播放到房间组
  const playToRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (room) {
      setDevices(prev => prev.map(d => ({
        ...d,
        isPlaying: room.devices.includes(d.id) ? true : d.isPlaying
      })))
      setRooms(prev => prev.map(r => ({
        ...r,
        isPlaying: r.id === roomId
      })))
    }
  }, [rooms])

  // 停止房间组
  const stopRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (room) {
      setDevices(prev => prev.map(d => ({
        ...d,
        isPlaying: room.devices.includes(d.id) ? false : d.isPlaying
      })))
      setRooms(prev => prev.map(r => ({
        ...r,
        isPlaying: r.id === roomId ? false : r.isPlaying
      })))
    }
  }, [rooms])

  // 创建房间组
  const createRoomGroup = useCallback((name: string, deviceIds: string[]) => {
    const newRoom: RoomGroup = {
      id: `room_${Date.now()}`,
      name,
      icon: '🎵',
      devices: deviceIds,
      isPlaying: false,
      volume: 50
    }
    setRooms(prev => [...prev, newRoom])
  }, [])

  return {
    devices,
    rooms,
    isScanning,
    selectedDevice,
    setSelectedDevice,
    scanForDevices,
    playToDevice,
    stopDevice,
    setVolume,
    playToRoom,
    stopRoom,
    createRoomGroup
  }
}

// 设备卡片组件
const DeviceCard: React.FC<{
  device: SpeakerDevice
  isSelected: boolean
  onSelect: () => void
  onPlay: () => void
  onStop: () => void
  onVolumeChange: (volume: number) => void
}> = ({ device, isSelected, onSelect, onPlay, onStop, onVolumeChange }) => {
  const brandInfo = SPEAKER_BRANDS[device.brand]

  return (
    <motion.div
      className={`p-4 rounded-2xl cursor-pointer transition-all ${
        isSelected ? 'bg-primary-500/20 ring-2 ring-primary-500' : 'bg-white/5 hover:bg-white/10'
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: brandInfo.color + '20' }}
          >
            {brandInfo.icon}
          </div>
          <div>
            <h4 className="text-white font-medium">{device.name}</h4>
            <p className="text-xs text-white/40">{device.model}</p>
          </div>
        </div>

        <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* 当前播放 */}
      {device.isPlaying && device.currentTrack && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
          <img
            src={device.currentTrack.artwork}
            alt=""
            className="w-10 h-10 rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{device.currentTrack.title}</p>
            <p className="text-xs text-white/40 truncate">{device.currentTrack.artist}</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-0.5 bg-primary-500 rounded-full"
                animate={{
                  height: [8, 16, 8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 音量控制 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/40">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={device.volume}
          onChange={(e) => {
            e.stopPropagation()
            onVolumeChange(parseInt(e.target.value))
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1"
        />
        <span className="text-xs text-white/60 w-8">{device.volume}%</span>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-2">
        {device.isPlaying ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStop()
            }}
            className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
          >
            停止播放
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            disabled={!device.isOnline}
            className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            播放到此设备
          </button>
        )}
      </div>

      {/* 功能标签 */}
      <div className="flex flex-wrap gap-1 mt-3">
        {device.capabilities.map(cap => (
          <span
            key={cap}
            className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60"
          >
            {cap}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// 房间组卡片
const RoomCard: React.FC<{
  room: RoomGroup
  devices: SpeakerDevice[]
  onPlay: () => void
  onStop: () => void
}> = ({ room, devices, onPlay, onStop }) => {
  const roomDevices = devices.filter(d => room.devices.includes(d.id))
  const onlineCount = roomDevices.filter(d => d.isOnline).length

  return (
    <motion.div
      className={`p-4 rounded-xl ${
        room.isPlaying ? 'bg-primary-500/20' : 'bg-white/5'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{room.icon}</span>
          <div>
            <h4 className="text-white font-medium">{room.name}</h4>
            <p className="text-xs text-white/40">{onlineCount}/{roomDevices.length} 在线</p>
          </div>
        </div>

        {room.isPlaying ? (
          <button
            onClick={onStop}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm"
          >
            停止
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm"
          >
            播放
          </button>
        )}
      </div>

      {/* 设备头像 */}
      <div className="flex -space-x-2">
        {roomDevices.slice(0, 4).map(device => (
          <div
            key={device.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                      border-2 border-dark-800 ${device.isOnline ? 'bg-white/20' : 'bg-white/5'}`}
          >
            {SPEAKER_BRANDS[device.brand].icon}
          </div>
        ))}
        {roomDevices.length > 4 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs
                        border-2 border-dark-800 bg-white/10 text-white/60">
            +{roomDevices.length - 4}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 主界面
interface SmartSpeakerProps {
  className?: string
}

export const SmartSpeaker: React.FC<SmartSpeakerProps> = ({ className }) => {
  const {
    devices,
    rooms,
    isScanning,
    selectedDevice,
    setSelectedDevice,
    scanForDevices,
    playToDevice,
    stopDevice,
    setVolume,
    playToRoom,
    stopRoom
  } = useSmartSpeakers()

  const [activeTab, setActiveTab] = useState<'devices' | 'rooms'>('devices')
  const [showAddRoom, setShowAddRoom] = useState(false)

  // 按房间分组设备
  const devicesByRoom = devices.reduce((acc, device) => {
    if (!acc[device.room]) {
      acc[device.room] = []
    }
    acc[device.room].push(device)
    return acc
  }, {} as Record<string, SpeakerDevice[]>)

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">智能音箱</h3>
          <p className="text-sm text-white/40">
            {devices.filter(d => d.isOnline).length} 个设备在线
          </p>
        </div>

        <button
          onClick={scanForDevices}
          disabled={isScanning}
          className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm
                   hover:bg-white/20 disabled:opacity-50 flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              扫描中...
            </>
          ) : (
            <>
              <span>🔍</span>
              扫描设备
            </>
          )}
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'devices'
              ? 'bg-primary-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          设备 ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'rooms'
              ? 'bg-primary-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          房间组 ({rooms.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'devices' ? (
          <motion.div
            key="devices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {Object.entries(devicesByRoom).map(([room, roomDevices]) => (
              <div key={room} className="mb-6">
                <h4 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                  <span>📍</span>
                  {room}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {roomDevices.map(device => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      isSelected={selectedDevice === device.id}
                      onSelect={() => setSelectedDevice(device.id)}
                      onPlay={() => playToDevice(device.id)}
                      onStop={() => stopDevice(device.id)}
                      onVolumeChange={(v) => setVolume(device.id, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                devices={devices}
                onPlay={() => playToRoom(room.id)}
                onStop={() => stopRoom(room.id)}
              />
            ))}

            <button
              onClick={() => setShowAddRoom(true)}
              className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl
                       text-white/40 hover:border-white/40 hover:text-white/60 transition-all"
            >
              + 创建房间组
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 当前播放状态 */}
      {devices.some(d => d.isPlaying) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                🎵
              </div>
              <div>
                <p className="text-white font-medium">正在播放</p>
                <p className="text-sm text-white/60">
                  {devices.filter(d => d.isPlaying).length} 个设备
                </p>
              </div>
            </div>

            <button
              onClick={() => devices.forEach(d => d.isPlaying && stopDevice(d.id))}
              className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm"
            >
              全部停止
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartSpeaker
