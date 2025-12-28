import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐治疗组件
 * 冥想、专注、放松、睡眠辅助
 */

// 治疗模式
type TherapyMode = 'meditation' | 'focus' | 'relax' | 'sleep' | 'anxiety' | 'energy'

// 治疗会话
interface TherapySession {
  id: string
  mode: TherapyMode
  duration: number // 分钟
  startTime: Date
  endTime?: Date
  completed: boolean
  feedback?: {
    rating: number
    notes: string
  }
}

// 背景音
interface AmbientSound {
  id: string
  name: string
  icon: string
  category: 'nature' | 'urban' | 'music' | 'binaural'
  volume: number
  isPlaying: boolean
}

// 呼吸模式
interface BreathingPattern {
  name: string
  inhale: number
  hold: number
  exhale: number
  holdAfter: number
  description: string
}

// 治疗配置
const THERAPY_MODES: Record<TherapyMode, { name: string; icon: string; color: string; description: string }> = {
  meditation: { name: '冥想', icon: '🧘', color: '#8b5cf6', description: '平静内心，找到内在平和' },
  focus: { name: '专注', icon: '🎯', color: '#3b82f6', description: '提高专注力和工作效率' },
  relax: { name: '放松', icon: '😌', color: '#10b981', description: '释放压力，身心放松' },
  sleep: { name: '助眠', icon: '🌙', color: '#6366f1', description: '帮助入睡，改善睡眠质量' },
  anxiety: { name: '减压', icon: '💆', color: '#f59e0b', description: '缓解焦虑，安抚情绪' },
  energy: { name: '提神', icon: '⚡', color: '#ef4444', description: '提升能量，振奋精神' }
}

// 呼吸模式
const BREATHING_PATTERNS: BreathingPattern[] = [
  { name: '放松呼吸', inhale: 4, hold: 0, exhale: 6, holdAfter: 0, description: '4-6 呼吸法' },
  { name: '方形呼吸', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, description: '4-4-4-4 均匀呼吸' },
  { name: '4-7-8 呼吸', inhale: 4, hold: 7, exhale: 8, holdAfter: 0, description: '深度放松' },
  { name: '能量呼吸', inhale: 2, hold: 2, exhale: 2, holdAfter: 0, description: '快速提神' }
]

// 音乐治疗 Hook
export function useMusicTherapy() {
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null)
  const [selectedMode, setSelectedMode] = useState<TherapyMode>('meditation')
  const [duration, setDuration] = useState(10)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter'>('inhale')
  const [selectedBreathing, setSelectedBreathing] = useState(BREATHING_PATTERNS[0])

  // 背景音
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([
    { id: 'rain', name: '雨声', icon: '🌧️', category: 'nature', volume: 50, isPlaying: false },
    { id: 'waves', name: '海浪', icon: '🌊', category: 'nature', volume: 50, isPlaying: false },
    { id: 'forest', name: '森林', icon: '🌲', category: 'nature', volume: 50, isPlaying: false },
    { id: 'fire', name: '篝火', icon: '🔥', category: 'nature', volume: 50, isPlaying: false },
    { id: 'wind', name: '微风', icon: '💨', category: 'nature', volume: 50, isPlaying: false },
    { id: 'birds', name: '鸟鸣', icon: '🐦', category: 'nature', volume: 50, isPlaying: false },
    { id: 'thunder', name: '雷声', icon: '⛈️', category: 'nature', volume: 30, isPlaying: false },
    { id: 'stream', name: '溪流', icon: '🏞️', category: 'nature', volume: 50, isPlaying: false },
    { id: 'cafe', name: '咖啡厅', icon: '☕', category: 'urban', volume: 40, isPlaying: false },
    { id: 'train', name: '火车', icon: '🚂', category: 'urban', volume: 40, isPlaying: false },
    { id: 'binaural', name: '双耳节拍', icon: '🎧', category: 'binaural', volume: 30, isPlaying: false },
    { id: 'piano', name: '钢琴', icon: '🎹', category: 'music', volume: 50, isPlaying: false }
  ])

  // 会话历史
  const [sessionHistory, setSessionHistory] = useState<TherapySession[]>([])

  // 计时器
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false)
          completeSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, timeRemaining])

  // 呼吸动画
  useEffect(() => {
    if (!isActive) return

    const phases = [
      { phase: 'inhale' as const, duration: selectedBreathing.inhale },
      { phase: 'hold' as const, duration: selectedBreathing.hold },
      { phase: 'exhale' as const, duration: selectedBreathing.exhale },
      { phase: 'holdAfter' as const, duration: selectedBreathing.holdAfter }
    ].filter(p => p.duration > 0)

    let currentIndex = 0
    let timer: NodeJS.Timeout

    const nextPhase = () => {
      setBreathingPhase(phases[currentIndex].phase)
      timer = setTimeout(() => {
        currentIndex = (currentIndex + 1) % phases.length
        nextPhase()
      }, phases[currentIndex].duration * 1000)
    }

    nextPhase()

    return () => clearTimeout(timer)
  }, [isActive, selectedBreathing])

  // 开始会话
  const startSession = useCallback(() => {
    const session: TherapySession = {
      id: `session_${Date.now()}`,
      mode: selectedMode,
      duration,
      startTime: new Date(),
      completed: false
    }
    setCurrentSession(session)
    setTimeRemaining(duration * 60)
    setIsActive(true)
  }, [selectedMode, duration])

  // 暂停/继续
  const togglePause = useCallback(() => {
    setIsActive(prev => !prev)
  }, [])

  // 完成会话
  const completeSession = useCallback(() => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true
      }
      setSessionHistory(prev => [...prev, completedSession])
      setCurrentSession(null)
    }
  }, [currentSession])

  // 结束会话
  const endSession = useCallback(() => {
    setIsActive(false)
    setTimeRemaining(0)
    setCurrentSession(null)
  }, [])

  // 切换背景音
  const toggleSound = useCallback((soundId: string) => {
    setAmbientSounds(prev => prev.map(s =>
      s.id === soundId ? { ...s, isPlaying: !s.isPlaying } : s
    ))
  }, [])

  // 调节背景音音量
  const setSoundVolume = useCallback((soundId: string, volume: number) => {
    setAmbientSounds(prev => prev.map(s =>
      s.id === soundId ? { ...s, volume } : s
    ))
  }, [])

  return {
    currentSession,
    selectedMode,
    setSelectedMode,
    duration,
    setDuration,
    timeRemaining,
    isActive,
    breathingPhase,
    selectedBreathing,
    setSelectedBreathing,
    ambientSounds,
    sessionHistory,
    startSession,
    togglePause,
    endSession,
    toggleSound,
    setSoundVolume
  }
}

// 呼吸动画组件
const BreathingCircle: React.FC<{
  phase: 'inhale' | 'hold' | 'exhale' | 'holdAfter'
  pattern: BreathingPattern
}> = ({ phase, pattern }) => {
  const phaseLabels = {
    inhale: '吸气',
    hold: '屏息',
    exhale: '呼气',
    holdAfter: '屏息'
  }

  const phaseDurations = {
    inhale: pattern.inhale,
    hold: pattern.hold,
    exhale: pattern.exhale,
    holdAfter: pattern.holdAfter
  }

  const scale = phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : undefined

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* 外圈 */}
      <div className="absolute inset-0 rounded-full border-4 border-white/10" />

      {/* 呼吸圈 */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-500/50 to-purple-500/50
                 flex items-center justify-center"
        animate={{
          scale: scale,
          opacity: phase === 'hold' || phase === 'holdAfter' ? 0.6 : 1
        }}
        transition={{
          duration: phaseDurations[phase],
          ease: 'easeInOut'
        }}
      >
        <div className="text-center">
          <p className="text-white text-xl font-medium">{phaseLabels[phase]}</p>
          <p className="text-white/60 text-sm">{phaseDurations[phase]}s</p>
        </div>
      </motion.div>

      {/* 进度环 */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#breathGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="289"
          initial={{ strokeDashoffset: 289 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: phaseDurations[phase],
            ease: 'linear'
          }}
          key={phase}
        />
        <defs>
          <linearGradient id="breathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// 模式选择
const ModeSelector: React.FC<{
  selected: TherapyMode
  onSelect: (mode: TherapyMode) => void
}> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.entries(THERAPY_MODES) as [TherapyMode, typeof THERAPY_MODES[TherapyMode]][]).map(([mode, config]) => (
        <motion.button
          key={mode}
          onClick={() => onSelect(mode)}
          className={`p-4 rounded-xl text-center transition-all ${
            selected === mode
              ? 'ring-2 ring-offset-2 ring-offset-dark-900'
              : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: selected === mode ? `${config.color}30` : 'rgba(255,255,255,0.05)',
            ringColor: config.color
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl block mb-2">{config.icon}</span>
          <span className="text-white text-sm font-medium">{config.name}</span>
        </motion.button>
      ))}
    </div>
  )
}

// 时长选择
const DurationSelector: React.FC<{
  value: number
  onChange: (value: number) => void
}> = ({ value, onChange }) => {
  const durations = [5, 10, 15, 20, 30, 45, 60]

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {durations.map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            value === d
              ? 'bg-primary-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          {d} 分钟
        </button>
      ))}
    </div>
  )
}

// 背景音混音器
const AmbientMixer: React.FC<{
  sounds: AmbientSound[]
  onToggle: (id: string) => void
  onVolumeChange: (id: string, volume: number) => void
}> = ({ sounds, onToggle, onVolumeChange }) => {
  const categories = ['nature', 'urban', 'music', 'binaural']
  const categoryLabels: Record<string, string> = {
    nature: '自然',
    urban: '环境',
    music: '音乐',
    binaural: '双耳节拍'
  }

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs text-white/40 mb-2">{categoryLabels[cat]}</p>
          <div className="flex flex-wrap gap-2">
            {sounds.filter(s => s.category === cat).map(sound => (
              <div key={sound.id} className="relative">
                <motion.button
                  onClick={() => onToggle(sound.id)}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center
                           transition-all ${
                             sound.isPlaying
                               ? 'bg-primary-500/30 ring-2 ring-primary-500'
                               : 'bg-white/5 hover:bg-white/10'
                           }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-xs text-white/60">{sound.name}</span>
                </motion.button>

                {sound.isPlaying && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sound.volume}
                    onChange={(e) => onVolumeChange(sound.id, parseInt(e.target.value))}
                    className="absolute -bottom-4 left-0 w-full h-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 会话进行中界面
const ActiveSession: React.FC<{
  mode: TherapyMode
  timeRemaining: number
  isActive: boolean
  breathingPhase: 'inhale' | 'hold' | 'exhale' | 'holdAfter'
  breathingPattern: BreathingPattern
  onTogglePause: () => void
  onEnd: () => void
}> = ({ mode, timeRemaining, isActive, breathingPhase, breathingPattern, onTogglePause, onEnd }) => {
  const config = THERAPY_MODES[mode]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 模式信息 */}
      <div>
        <span className="text-4xl">{config.icon}</span>
        <h3 className="text-xl font-bold text-white mt-2">{config.name}中</h3>
      </div>

      {/* 呼吸圈 */}
      <BreathingCircle phase={breathingPhase} pattern={breathingPattern} />

      {/* 剩余时间 */}
      <div>
        <p className="text-4xl font-mono text-white">{formatTime(timeRemaining)}</p>
        <p className="text-white/40 text-sm">剩余时间</p>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onTogglePause}
          className="w-16 h-16 rounded-full bg-white/10 text-2xl flex items-center justify-center"
        >
          {isActive ? '⏸' : '▶️'}
        </button>
        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 text-2xl
                   flex items-center justify-center"
        >
          ⏹
        </button>
      </div>
    </motion.div>
  )
}

// 主界面
interface MusicTherapyProps {
  className?: string
}

export const MusicTherapy: React.FC<MusicTherapyProps> = ({ className }) => {
  const {
    currentSession,
    selectedMode,
    setSelectedMode,
    duration,
    setDuration,
    timeRemaining,
    isActive,
    breathingPhase,
    selectedBreathing,
    setSelectedBreathing,
    ambientSounds,
    startSession,
    togglePause,
    endSession,
    toggleSound,
    setSoundVolume
  } = useMusicTherapy()

  const [showSounds, setShowSounds] = useState(false)

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">音乐治疗</h3>
          <p className="text-sm text-white/40">放松身心，找到内在平静</p>
        </div>

        <button
          onClick={() => setShowSounds(!showSounds)}
          className={`px-4 py-2 rounded-lg text-sm ${
            showSounds ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          🎵 背景音
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentSession ? (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ActiveSession
              mode={selectedMode}
              timeRemaining={timeRemaining}
              isActive={isActive}
              breathingPhase={breathingPhase}
              breathingPattern={selectedBreathing}
              onTogglePause={togglePause}
              onEnd={endSession}
            />
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* 模式选择 */}
            <div>
              <p className="text-white/60 text-sm mb-3 text-center">选择模式</p>
              <ModeSelector selected={selectedMode} onSelect={setSelectedMode} />
            </div>

            {/* 时长选择 */}
            <div>
              <p className="text-white/60 text-sm mb-3 text-center">设置时长</p>
              <DurationSelector value={duration} onChange={setDuration} />
            </div>

            {/* 呼吸模式 */}
            <div>
              <p className="text-white/60 text-sm mb-3 text-center">呼吸模式</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {BREATHING_PATTERNS.map(pattern => (
                  <button
                    key={pattern.name}
                    onClick={() => setSelectedBreathing(pattern)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedBreathing.name === pattern.name
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {pattern.name}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-white/40 mt-2">
                {selectedBreathing.description}
              </p>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={startSession}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500
                       rounded-xl text-white font-medium text-lg"
            >
              开始 {THERAPY_MODES[selectedMode].name}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景音混音器 */}
      <AnimatePresence>
        {showSounds && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <AmbientMixer
              sounds={ambientSounds}
              onToggle={toggleSound}
              onVolumeChange={setSoundVolume}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicTherapy
