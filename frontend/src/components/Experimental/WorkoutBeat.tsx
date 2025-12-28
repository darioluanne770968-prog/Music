import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 运动节拍组件
 * 根据运动强度自动调节音乐BPM
 */

// 运动类型
type WorkoutType = 'running' | 'cycling' | 'walking' | 'hiit' | 'strength' | 'yoga' | 'dance'

// 运动阶段
type WorkoutPhase = 'warmup' | 'active' | 'peak' | 'cooldown' | 'rest'

// 运动数据
interface WorkoutData {
  heartRate: number
  cadence: number // 步频/踏频
  pace: number // 配速 (分钟/公里)
  calories: number
  duration: number // 秒
  distance: number // 米
  currentPhase: WorkoutPhase
  targetBPM: number
}

// 歌曲
interface WorkoutTrack {
  id: string
  title: string
  artist: string
  bpm: number
  genre: string
  energy: number // 1-10
  artwork: string
}

// 运动计划
interface WorkoutPlan {
  id: string
  name: string
  type: WorkoutType
  duration: number
  phases: {
    phase: WorkoutPhase
    duration: number
    targetBPM: { min: number; max: number }
  }[]
}

// 运动类型配置
const WORKOUT_CONFIG: Record<WorkoutType, { name: string; icon: string; bpmRange: { min: number; max: number } }> = {
  running: { name: '跑步', icon: '🏃', bpmRange: { min: 140, max: 180 } },
  cycling: { name: '骑行', icon: '🚴', bpmRange: { min: 120, max: 160 } },
  walking: { name: '步行', icon: '🚶', bpmRange: { min: 100, max: 130 } },
  hiit: { name: 'HIIT', icon: '🔥', bpmRange: { min: 140, max: 180 } },
  strength: { name: '力量', icon: '🏋️', bpmRange: { min: 120, max: 150 } },
  yoga: { name: '瑜伽', icon: '🧘', bpmRange: { min: 60, max: 100 } },
  dance: { name: '舞蹈', icon: '💃', bpmRange: { min: 120, max: 160 } }
}

// 运动节拍 Hook
export function useWorkoutBeat() {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutType, setWorkoutType] = useState<WorkoutType>('running')
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    heartRate: 72,
    cadence: 0,
    pace: 0,
    calories: 0,
    duration: 0,
    distance: 0,
    currentPhase: 'warmup',
    targetBPM: 140
  })

  const [currentTrack, setCurrentTrack] = useState<WorkoutTrack | null>(null)
  const [playlist, setPlaylist] = useState<WorkoutTrack[]>([])
  const [bpmSync, setBpmSync] = useState(true)
  const [targetBPM, setTargetBPM] = useState(140)

  // 模拟歌曲库
  const trackLibrary: WorkoutTrack[] = useMemo(() => [
    { id: '1', title: '双截棍', artist: '周杰伦', bpm: 136, genre: '嘻哈', energy: 9, artwork: '/api/placeholder/60/60' },
    { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', bpm: 171, genre: '电子', energy: 8, artwork: '/api/placeholder/60/60' },
    { id: '3', title: 'Uptown Funk', artist: 'Bruno Mars', bpm: 115, genre: '放克', energy: 9, artwork: '/api/placeholder/60/60' },
    { id: '4', title: 'Shake It Off', artist: 'Taylor Swift', bpm: 160, genre: '流行', energy: 8, artwork: '/api/placeholder/60/60' },
    { id: '5', title: 'Stronger', artist: 'Kanye West', bpm: 104, genre: '嘻哈', energy: 8, artwork: '/api/placeholder/60/60' },
    { id: '6', title: 'Eye of the Tiger', artist: 'Survivor', bpm: 109, genre: '摇滚', energy: 9, artwork: '/api/placeholder/60/60' },
    { id: '7', title: 'Pump It', artist: 'Black Eyed Peas', bpm: 154, genre: '电子', energy: 9, artwork: '/api/placeholder/60/60' },
    { id: '8', title: "Can't Hold Us", artist: 'Macklemore', bpm: 146, genre: '嘻哈', energy: 9, artwork: '/api/placeholder/60/60' },
    { id: '9', title: 'Born to Run', artist: 'Bruce Springsteen', bpm: 147, genre: '摇滚', energy: 8, artwork: '/api/placeholder/60/60' },
    { id: '10', title: 'Titanium', artist: 'David Guetta', bpm: 126, genre: '电子', energy: 8, artwork: '/api/placeholder/60/60' }
  ], [])

  // 根据目标 BPM 筛选歌曲
  const getMatchingTracks = useCallback((targetBPM: number, tolerance = 10) => {
    return trackLibrary
      .filter(t => Math.abs(t.bpm - targetBPM) <= tolerance)
      .sort((a, b) => Math.abs(a.bpm - targetBPM) - Math.abs(b.bpm - targetBPM))
  }, [trackLibrary])

  // 模拟运动数据更新
  useEffect(() => {
    if (!isWorkoutActive) return

    const interval = setInterval(() => {
      setWorkoutData(prev => {
        const newDuration = prev.duration + 1
        const phase = getPhaseFromDuration(newDuration)

        // 模拟心率变化
        const baseHR = phase === 'warmup' ? 100 : phase === 'active' ? 140 : phase === 'peak' ? 170 : 90
        const heartRate = baseHR + Math.floor(Math.random() * 10 - 5)

        // 模拟步频
        const cadence = workoutType === 'running' ? 160 + Math.floor(Math.random() * 20) :
                       workoutType === 'cycling' ? 90 + Math.floor(Math.random() * 10) : 0

        // 计算目标 BPM
        const config = WORKOUT_CONFIG[workoutType]
        const phaseMultiplier = phase === 'peak' ? 1 : phase === 'active' ? 0.8 : phase === 'warmup' ? 0.6 : 0.5
        const newTargetBPM = Math.round(
          config.bpmRange.min + (config.bpmRange.max - config.bpmRange.min) * phaseMultiplier
        )

        return {
          ...prev,
          duration: newDuration,
          heartRate,
          cadence,
          calories: prev.calories + (heartRate > 120 ? 0.2 : 0.1),
          distance: prev.distance + (workoutType === 'running' ? 3 : workoutType === 'cycling' ? 8 : 1),
          currentPhase: phase,
          targetBPM: newTargetBPM
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isWorkoutActive, workoutType])

  // 根据运动时长确定阶段
  const getPhaseFromDuration = (duration: number): WorkoutPhase => {
    if (duration < 300) return 'warmup'      // 前5分钟热身
    if (duration < 1200) return 'active'     // 5-20分钟活动
    if (duration < 1800) return 'peak'       // 20-30分钟高峰
    if (duration < 2100) return 'cooldown'   // 30-35分钟冷却
    return 'rest'
  }

  // BPM 同步 - 自动切换歌曲
  useEffect(() => {
    if (!isWorkoutActive || !bpmSync) return

    const matchingTracks = getMatchingTracks(workoutData.targetBPM, 15)
    if (matchingTracks.length > 0 && (!currentTrack || Math.abs(currentTrack.bpm - workoutData.targetBPM) > 15)) {
      const newTrack = matchingTracks[Math.floor(Math.random() * matchingTracks.length)]
      setCurrentTrack(newTrack)
    }
  }, [workoutData.targetBPM, bpmSync, isWorkoutActive, getMatchingTracks, currentTrack])

  // 开始运动
  const startWorkout = useCallback(() => {
    setIsWorkoutActive(true)
    setWorkoutData({
      heartRate: 72,
      cadence: 0,
      pace: 0,
      calories: 0,
      duration: 0,
      distance: 0,
      currentPhase: 'warmup',
      targetBPM: WORKOUT_CONFIG[workoutType].bpmRange.min
    })

    // 设置初始歌单
    const initialPlaylist = getMatchingTracks(WORKOUT_CONFIG[workoutType].bpmRange.min, 20)
    setPlaylist(initialPlaylist)
    if (initialPlaylist.length > 0) {
      setCurrentTrack(initialPlaylist[0])
    }
  }, [workoutType, getMatchingTracks])

  // 结束运动
  const endWorkout = useCallback(() => {
    setIsWorkoutActive(false)
  }, [])

  // 手动调节 BPM
  const adjustBPM = useCallback((delta: number) => {
    setTargetBPM(prev => {
      const newBPM = Math.max(60, Math.min(200, prev + delta))
      const matchingTracks = getMatchingTracks(newBPM, 10)
      if (matchingTracks.length > 0) {
        setCurrentTrack(matchingTracks[0])
      }
      return newBPM
    })
  }, [getMatchingTracks])

  return {
    isWorkoutActive,
    workoutType,
    setWorkoutType,
    workoutData,
    currentTrack,
    playlist,
    bpmSync,
    setBpmSync,
    targetBPM,
    startWorkout,
    endWorkout,
    adjustBPM
  }
}

// 运动类型选择
const WorkoutTypeSelector: React.FC<{
  selected: WorkoutType
  onSelect: (type: WorkoutType) => void
}> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {(Object.entries(WORKOUT_CONFIG) as [WorkoutType, typeof WORKOUT_CONFIG[WorkoutType]][]).slice(0, 4).map(([type, config]) => (
        <motion.button
          key={type}
          onClick={() => onSelect(type)}
          className={`p-4 rounded-xl text-center transition-all ${
            selected === type
              ? 'bg-primary-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl block mb-1">{config.icon}</span>
          <span className="text-xs">{config.name}</span>
        </motion.button>
      ))}
    </div>
  )
}

// 运动数据面板
const WorkoutStats: React.FC<{
  data: WorkoutData
  workoutType: WorkoutType
}> = ({ data, workoutType }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(2)}km`
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-red-400">{data.heartRate}</p>
        <p className="text-xs text-white/40">心率 BPM</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-white">{formatDuration(data.duration)}</p>
        <p className="text-xs text-white/40">时间</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-green-400">{Math.round(data.calories)}</p>
        <p className="text-xs text-white/40">卡路里</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-blue-400">{formatDistance(data.distance)}</p>
        <p className="text-xs text-white/40">距离</p>
      </div>
    </div>
  )
}

// 阶段指示器
const PhaseIndicator: React.FC<{
  phase: WorkoutPhase
}> = ({ phase }) => {
  const phaseConfig: Record<WorkoutPhase, { label: string; color: string; icon: string }> = {
    warmup: { label: '热身', color: 'bg-yellow-500', icon: '🔥' },
    active: { label: '运动', color: 'bg-green-500', icon: '💪' },
    peak: { label: '高峰', color: 'bg-red-500', icon: '⚡' },
    cooldown: { label: '冷却', color: 'bg-blue-500', icon: '❄️' },
    rest: { label: '休息', color: 'bg-gray-500', icon: '😌' }
  }

  const config = phaseConfig[phase]

  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${config.color}/20 rounded-full`}>
      <span>{config.icon}</span>
      <span className="text-white font-medium">{config.label}阶段</span>
    </div>
  )
}

// 当前播放
const CurrentPlaying: React.FC<{
  track: WorkoutTrack | null
  targetBPM: number
  bpmSync: boolean
  onBpmSyncToggle: () => void
  onAdjustBPM: (delta: number) => void
}> = ({ track, targetBPM, bpmSync, onBpmSyncToggle, onAdjustBPM }) => {
  return (
    <div className="bg-dark-800 rounded-xl p-4">
      {/* 当前歌曲 */}
      {track && (
        <div className="flex items-center gap-4 mb-4">
          <img
            src={track.artwork}
            alt=""
            className="w-16 h-16 rounded-lg"
          />
          <div className="flex-1">
            <h4 className="text-white font-medium">{track.title}</h4>
            <p className="text-sm text-white/60">{track.artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                {track.bpm} BPM
              </span>
              <span className="text-xs text-white/40">{track.genre}</span>
            </div>
          </div>
        </div>
      )}

      {/* BPM 控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBpmSyncToggle()}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              bpmSync ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {bpmSync ? '🔗 自动同步' : '🔓 手动'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAdjustBPM(-5)}
            className="w-8 h-8 rounded-full bg-white/10 text-white"
          >
            -
          </button>
          <span className="text-white font-mono text-lg w-16 text-center">
            {targetBPM}
          </span>
          <button
            onClick={() => onAdjustBPM(5)}
            className="w-8 h-8 rounded-full bg-white/10 text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// BPM 可视化
const BPMVisualizer: React.FC<{
  currentBPM: number
  targetBPM: number
  heartRate: number
}> = ({ currentBPM, targetBPM, heartRate }) => {
  return (
    <div className="relative h-24 bg-dark-800 rounded-xl overflow-hidden">
      {/* 节拍动画 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 mx-1 bg-primary-500 rounded-full"
            animate={{
              height: [20, 60, 20],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 60 / currentBPM,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* 信息 */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs">
        <span className="text-white/40">当前: {currentBPM} BPM</span>
        <span className="text-red-400">❤️ {heartRate}</span>
        <span className="text-white/40">目标: {targetBPM} BPM</span>
      </div>
    </div>
  )
}

// 主界面
interface WorkoutBeatProps {
  className?: string
}

export const WorkoutBeat: React.FC<WorkoutBeatProps> = ({ className }) => {
  const {
    isWorkoutActive,
    workoutType,
    setWorkoutType,
    workoutData,
    currentTrack,
    bpmSync,
    setBpmSync,
    targetBPM,
    startWorkout,
    endWorkout,
    adjustBPM
  } = useWorkoutBeat()

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">运动节拍</h3>
          <p className="text-sm text-white/40">音乐随心跳而动</p>
        </div>

        {isWorkoutActive && (
          <PhaseIndicator phase={workoutData.currentPhase} />
        )}
      </div>

      <AnimatePresence mode="wait">
        {isWorkoutActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 运动数据 */}
            <WorkoutStats data={workoutData} workoutType={workoutType} />

            {/* BPM 可视化 */}
            <BPMVisualizer
              currentBPM={currentTrack?.bpm || targetBPM}
              targetBPM={workoutData.targetBPM}
              heartRate={workoutData.heartRate}
            />

            {/* 当前播放 */}
            <CurrentPlaying
              track={currentTrack}
              targetBPM={targetBPM}
              bpmSync={bpmSync}
              onBpmSyncToggle={() => setBpmSync(!bpmSync)}
              onAdjustBPM={adjustBPM}
            />

            {/* 结束按钮 */}
            <button
              onClick={endWorkout}
              className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-medium"
            >
              结束运动
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* 运动类型 */}
            <div>
              <p className="text-white/60 text-sm mb-3">选择运动类型</p>
              <WorkoutTypeSelector selected={workoutType} onSelect={setWorkoutType} />
            </div>

            {/* BPM 范围预览 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">推荐 BPM 范围</span>
                <span className="text-primary-400 font-mono">
                  {WORKOUT_CONFIG[workoutType].bpmRange.min} - {WORKOUT_CONFIG[workoutType].bpmRange.max}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{
                    marginLeft: `${((WORKOUT_CONFIG[workoutType].bpmRange.min - 60) / 140) * 100}%`,
                    width: `${((WORKOUT_CONFIG[workoutType].bpmRange.max - WORKOUT_CONFIG[workoutType].bpmRange.min) / 140) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={startWorkout}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500
                       rounded-xl text-white font-medium text-lg"
            >
              {WORKOUT_CONFIG[workoutType].icon} 开始{WORKOUT_CONFIG[workoutType].name}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkoutBeat
