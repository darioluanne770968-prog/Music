import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 智能手表配套应用组件
 * Apple Watch / Wear OS 集成
 */

// 手表类型
type WatchType = 'apple_watch' | 'wear_os' | 'galaxy_watch' | 'fitbit'

// 手表状态
interface WatchState {
  isConnected: boolean
  type: WatchType
  model: string
  batteryLevel: number
  isCharging: boolean
  lastSync: Date
}

// 健康数据
interface HealthData {
  heartRate: number
  steps: number
  calories: number
  distance: number
  activeMinutes: number
  workoutType?: 'running' | 'cycling' | 'walking' | 'gym' | 'yoga'
  isWorkoutActive: boolean
}

// 播放状态
interface PlaybackState {
  isPlaying: boolean
  currentTrack: {
    title: string
    artist: string
    artwork: string
  }
  progress: number
  volume: number
}

// 离线音乐
interface OfflineTrack {
  id: string
  title: string
  artist: string
  duration: number
  size: number
  syncStatus: 'synced' | 'syncing' | 'pending'
}

// 手表配套 Hook
export function useWatchCompanion() {
  const [watchState, setWatchState] = useState<WatchState>({
    isConnected: true,
    type: 'apple_watch',
    model: 'Apple Watch Series 9',
    batteryLevel: 65,
    isCharging: false,
    lastSync: new Date()
  })

  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 72,
    steps: 8432,
    calories: 320,
    distance: 6.2,
    activeMinutes: 45,
    isWorkoutActive: false
  })

  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: true,
    currentTrack: {
      title: '晴天',
      artist: '周杰伦',
      artwork: '/api/placeholder/100/100'
    },
    progress: 0.35,
    volume: 70
  })

  const [offlineTracks, setOfflineTracks] = useState<OfflineTrack[]>([
    { id: '1', title: '晴天', artist: '周杰伦', duration: 269, size: 8.5, syncStatus: 'synced' },
    { id: '2', title: '七里香', artist: '周杰伦', duration: 296, size: 9.2, syncStatus: 'synced' },
    { id: '3', title: '稻香', artist: '周杰伦', duration: 233, size: 7.8, syncStatus: 'syncing' },
    { id: '4', title: '告白气球', artist: '周杰伦', duration: 215, size: 7.1, syncStatus: 'pending' }
  ])

  // 模拟心率变化
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(180,
          prev.heartRate + (Math.random() - 0.5) * (prev.isWorkoutActive ? 10 : 4)
        ))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // 同步音乐到手表
  const syncToWatch = useCallback((trackIds: string[]) => {
    setOfflineTracks(prev => prev.map(track => ({
      ...track,
      syncStatus: trackIds.includes(track.id) ? 'syncing' : track.syncStatus
    })))

    // 模拟同步完成
    setTimeout(() => {
      setOfflineTracks(prev => prev.map(track => ({
        ...track,
        syncStatus: trackIds.includes(track.id) ? 'synced' : track.syncStatus
      })))
    }, 3000)
  }, [])

  // 开始运动
  const startWorkout = useCallback((type: HealthData['workoutType']) => {
    setHealthData(prev => ({
      ...prev,
      workoutType: type,
      isWorkoutActive: true
    }))
  }, [])

  // 结束运动
  const endWorkout = useCallback(() => {
    setHealthData(prev => ({
      ...prev,
      workoutType: undefined,
      isWorkoutActive: false
    }))
  }, [])

  // 根据心率推荐音乐
  const getHeartRateBasedPlaylist = useCallback(() => {
    const { heartRate, isWorkoutActive, workoutType } = healthData

    if (!isWorkoutActive) {
      return { type: 'relaxing', bpm: '60-80' }
    }

    if (heartRate > 150) {
      return { type: 'high_energy', bpm: '160-180' }
    } else if (heartRate > 120) {
      return { type: 'workout', bpm: '120-150' }
    } else {
      return { type: 'warm_up', bpm: '100-120' }
    }
  }, [healthData])

  return {
    watchState,
    healthData,
    playback,
    setPlayback,
    offlineTracks,
    syncToWatch,
    startWorkout,
    endWorkout,
    getHeartRateBasedPlaylist
  }
}

// 手表预览组件
const WatchPreview: React.FC<{
  playback: PlaybackState
  healthData: HealthData
  watchType: WatchType
}> = ({ playback, healthData, watchType }) => {
  const isRound = watchType === 'galaxy_watch' || watchType === 'wear_os'

  return (
    <div className="flex justify-center mb-6">
      <div
        className={`relative bg-dark-900 border-4 border-dark-600 ${
          isRound ? 'w-48 h-48 rounded-full' : 'w-40 h-48 rounded-3xl'
        }`}
      >
        {/* 表带 */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-8 bg-dark-700 rounded-t-lg" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-8 bg-dark-700 rounded-b-lg" />

        {/* 表冠 */}
        {watchType === 'apple_watch' && (
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-2 h-8 bg-dark-600 rounded-r" />
        )}

        {/* 屏幕内容 */}
        <div className={`absolute inset-2 ${isRound ? 'rounded-full' : 'rounded-2xl'}
                       bg-dark-800 overflow-hidden p-3`}>
          {/* 当前播放 */}
          <div className="flex flex-col items-center justify-center h-full">
            {playback.isPlaying ? (
              <>
                <img
                  src={playback.currentTrack.artwork}
                  alt=""
                  className="w-16 h-16 rounded-lg mb-2"
                />
                <p className="text-xs text-white font-medium text-center truncate w-full">
                  {playback.currentTrack.title}
                </p>
                <p className="text-xs text-white/60 text-center truncate w-full">
                  {playback.currentTrack.artist}
                </p>

                {/* 控制按钮 */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs">⏮</span>
                  <span className="text-lg">⏸</span>
                  <span className="text-xs">⏭</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {healthData.isWorkoutActive ? '🏃' : '❤️'}
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(healthData.heartRate)}
                </p>
                <p className="text-xs text-white/60">BPM</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 健康数据卡片
const HealthCard: React.FC<{
  icon: string
  label: string
  value: string | number
  unit: string
  color: string
}> = ({ icon, label, value, unit, color }) => (
  <div className="p-4 bg-white/5 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-white/60">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-sm text-white/40">{unit}</span>
    </div>
  </div>
)

// 离线音乐管理
const OfflineMusic: React.FC<{
  tracks: OfflineTrack[]
  onSync: (ids: string[]) => void
}> = ({ tracks, onSync }) => {
  const totalSize = tracks
    .filter(t => t.syncStatus === 'synced')
    .reduce((acc, t) => acc + t.size, 0)

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium">手表离线音乐</h4>
        <span className="text-sm text-white/40">{totalSize.toFixed(1)} MB</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {tracks.map(track => (
          <div
            key={track.id}
            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{track.title}</p>
              <p className="text-xs text-white/40">{track.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{track.size}MB</span>

              {track.syncStatus === 'synced' && (
                <span className="text-green-400">✓</span>
              )}
              {track.syncStatus === 'syncing' && (
                <motion.div
                  className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {track.syncStatus === 'pending' && (
                <button
                  onClick={() => onSync([track.id])}
                  className="text-xs text-primary-400"
                >
                  同步
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSync(tracks.filter(t => t.syncStatus === 'pending').map(t => t.id))}
        className="w-full mt-4 py-2 bg-primary-500 rounded-lg text-white text-sm"
      >
        同步全部待同步
      </button>
    </div>
  )
}

// 运动模式选择
const WorkoutModes: React.FC<{
  activeWorkout?: HealthData['workoutType']
  isActive: boolean
  onStart: (type: HealthData['workoutType']) => void
  onEnd: () => void
}> = ({ activeWorkout, isActive, onStart, onEnd }) => {
  const modes = [
    { type: 'running' as const, icon: '🏃', label: '跑步' },
    { type: 'cycling' as const, icon: '🚴', label: '骑行' },
    { type: 'walking' as const, icon: '🚶', label: '步行' },
    { type: 'gym' as const, icon: '🏋️', label: '健身' },
    { type: 'yoga' as const, icon: '🧘', label: '瑜伽' }
  ]

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h4 className="text-white font-medium mb-4">运动模式</h4>

      {isActive ? (
        <div className="text-center">
          <div className="text-4xl mb-2">
            {modes.find(m => m.type === activeWorkout)?.icon}
          </div>
          <p className="text-white font-medium mb-4">
            {modes.find(m => m.type === activeWorkout)?.label}进行中
          </p>
          <button
            onClick={onEnd}
            className="px-6 py-2 bg-red-500 rounded-lg text-white"
          >
            结束运动
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {modes.map(mode => (
            <button
              key={mode.type}
              onClick={() => onStart(mode.type)}
              className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl
                       hover:bg-white/10 transition-all"
            >
              <span className="text-2xl">{mode.icon}</span>
              <span className="text-xs text-white/60">{mode.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 主界面
interface WatchCompanionProps {
  className?: string
}

export const WatchCompanion: React.FC<WatchCompanionProps> = ({ className }) => {
  const {
    watchState,
    healthData,
    playback,
    setPlayback,
    offlineTracks,
    syncToWatch,
    startWorkout,
    endWorkout,
    getHeartRateBasedPlaylist
  } = useWatchCompanion()

  const [activeTab, setActiveTab] = useState<'now_playing' | 'health' | 'offline'>('now_playing')

  const heartRatePlaylist = getHeartRateBasedPlaylist()

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">手表配套</h3>
          <p className="text-sm text-white/40">{watchState.model}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            watchState.isConnected
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              watchState.isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {watchState.isConnected ? '已连接' : '未连接'}
          </div>

          <div className="flex items-center gap-1 text-sm text-white/60">
            <span>{watchState.isCharging ? '⚡' : '🔋'}</span>
            <span>{watchState.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* 手表预览 */}
      <WatchPreview
        playback={playback}
        healthData={healthData}
        watchType={watchState.type}
      />

      {/* 标签页 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'now_playing', label: '播放中' },
          { key: 'health', label: '健康' },
          { key: 'offline', label: '离线' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <AnimatePresence mode="wait">
        {activeTab === 'now_playing' && (
          <motion.div
            key="now_playing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* 当前播放 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <img
                  src={playback.currentTrack.artwork}
                  alt=""
                  className="w-16 h-16 rounded-xl"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{playback.currentTrack.title}</h4>
                  <p className="text-sm text-white/60">{playback.currentTrack.artist}</p>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <button className="text-2xl text-white/60">⏮</button>
                <button
                  onClick={() => setPlayback(prev => ({
                    ...prev,
                    isPlaying: !prev.isPlaying
                  }))}
                  className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-2xl"
                >
                  {playback.isPlaying ? '⏸' : '▶️'}
                </button>
                <button className="text-2xl text-white/60">⏭</button>
              </div>

              {/* 音量 */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-white/40">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playback.volume}
                  onChange={(e) => setPlayback(prev => ({
                    ...prev,
                    volume: parseInt(e.target.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-white/40">🔊</span>
              </div>
            </div>

            {/* 心率推荐 */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="text-white font-medium">心率匹配推荐</p>
                  <p className="text-sm text-white/60">
                    当前心率 {Math.round(healthData.heartRate)} BPM
                  </p>
                </div>
              </div>
              <button className="w-full py-2 bg-white/10 rounded-lg text-sm text-white">
                播放 {heartRatePlaylist.bpm} BPM 歌曲
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* 健康数据 */}
            <div className="grid grid-cols-2 gap-3">
              <HealthCard
                icon="❤️"
                label="心率"
                value={Math.round(healthData.heartRate)}
                unit="BPM"
                color="#f43f5e"
              />
              <HealthCard
                icon="👣"
                label="步数"
                value={healthData.steps.toLocaleString()}
                unit="步"
                color="#10b981"
              />
              <HealthCard
                icon="🔥"
                label="卡路里"
                value={healthData.calories}
                unit="千卡"
                color="#f59e0b"
              />
              <HealthCard
                icon="📍"
                label="距离"
                value={healthData.distance.toFixed(1)}
                unit="公里"
                color="#6366f1"
              />
            </div>

            {/* 运动模式 */}
            <WorkoutModes
              activeWorkout={healthData.workoutType}
              isActive={healthData.isWorkoutActive}
              onStart={startWorkout}
              onEnd={endWorkout}
            />
          </motion.div>
        )}

        {activeTab === 'offline' && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <OfflineMusic
              tracks={offlineTracks}
              onSync={syncToWatch}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WatchCompanion
