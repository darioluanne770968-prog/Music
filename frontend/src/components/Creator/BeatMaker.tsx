import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Beat 制作器组件
 * 支持节拍编排、采样器、鼓机
 */

// 音色类型
export interface SoundKit {
  id: string
  name: string
  sounds: {
    id: string
    name: string
    url: string
    key: string
  }[]
}

// 节拍单元
export interface BeatCell {
  active: boolean
  velocity: number  // 0-1
  pitch: number     // 音高偏移
}

// 轨道
export interface DrumTrack {
  id: string
  name: string
  soundId: string
  pattern: BeatCell[]
  volume: number
  muted: boolean
  solo: boolean
}

// 项目状态
export interface BeatProject {
  name: string
  bpm: number
  bars: number
  beatsPerBar: number
  tracks: DrumTrack[]
  swing: number
}

// 默认音色包
const DEFAULT_KIT: SoundKit = {
  id: 'tr808',
  name: 'TR-808',
  sounds: [
    { id: 'kick', name: 'Kick', url: '/sounds/808/kick.wav', key: 'a' },
    { id: 'snare', name: 'Snare', url: '/sounds/808/snare.wav', key: 's' },
    { id: 'hihat', name: 'Hi-Hat', url: '/sounds/808/hihat.wav', key: 'd' },
    { id: 'openhat', name: 'Open Hat', url: '/sounds/808/openhat.wav', key: 'f' },
    { id: 'clap', name: 'Clap', url: '/sounds/808/clap.wav', key: 'g' },
    { id: 'tom', name: 'Tom', url: '/sounds/808/tom.wav', key: 'h' },
    { id: 'cowbell', name: 'Cowbell', url: '/sounds/808/cowbell.wav', key: 'j' },
    { id: 'rimshot', name: 'Rimshot', url: '/sounds/808/rimshot.wav', key: 'k' }
  ]
}

// 创建空节拍
function createEmptyPattern(length: number): BeatCell[] {
  return Array(length).fill(null).map(() => ({
    active: false,
    velocity: 0.8,
    pitch: 0
  }))
}

// 创建默认项目
function createDefaultProject(): BeatProject {
  const steps = 16

  return {
    name: '新建节拍',
    bpm: 120,
    bars: 1,
    beatsPerBar: 16,
    swing: 0,
    tracks: [
      { id: '1', name: 'Kick', soundId: 'kick', pattern: createEmptyPattern(steps), volume: 1, muted: false, solo: false },
      { id: '2', name: 'Snare', soundId: 'snare', pattern: createEmptyPattern(steps), volume: 1, muted: false, solo: false },
      { id: '3', name: 'Hi-Hat', soundId: 'hihat', pattern: createEmptyPattern(steps), volume: 0.8, muted: false, solo: false },
      { id: '4', name: 'Open Hat', soundId: 'openhat', pattern: createEmptyPattern(steps), volume: 0.7, muted: false, solo: false },
      { id: '5', name: 'Clap', soundId: 'clap', pattern: createEmptyPattern(steps), volume: 0.9, muted: false, solo: false },
      { id: '6', name: 'Tom', soundId: 'tom', pattern: createEmptyPattern(steps), volume: 0.8, muted: false, solo: false }
    ]
  }
}

// Beat 制作器 Hook
export function useBeatMaker() {
  const [project, setProject] = useState<BeatProject>(createDefaultProject())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedKit, setSelectedKit] = useState<SoundKit>(DEFAULT_KIT)

  const audioContextRef = useRef<AudioContext | null>(null)
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化音频
  useEffect(() => {
    audioContextRef.current = new AudioContext()

    // 加载音色（模拟）
    selectedKit.sounds.forEach(sound => {
      // 实际应用中加载真实音频文件
      // 这里创建简单的合成音
      const sampleRate = 44100
      const buffer = audioContextRef.current!.createBuffer(1, sampleRate * 0.5, sampleRate)
      const data = buffer.getChannelData(0)

      // 简单的打击乐合成
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        let sample = 0

        if (sound.id === 'kick') {
          const freq = 150 * Math.exp(-t * 20)
          sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10)
        } else if (sound.id === 'snare') {
          sample = (Math.random() * 2 - 1) * Math.exp(-t * 15)
          sample += Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 20) * 0.5
        } else if (sound.id === 'hihat' || sound.id === 'openhat') {
          sample = (Math.random() * 2 - 1) * Math.exp(-t * (sound.id === 'hihat' ? 50 : 10))
        } else if (sound.id === 'clap') {
          if (t < 0.02) {
            sample = (Math.random() * 2 - 1) * 0.5
          }
          sample += (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.8
        } else {
          sample = Math.sin(2 * Math.PI * 300 * t) * Math.exp(-t * 15)
        }

        data[i] = sample * 0.5
      }

      buffersRef.current.set(sound.id, buffer)
    })

    return () => {
      audioContextRef.current?.close()
    }
  }, [selectedKit])

  // 播放声音
  const playSound = useCallback((soundId: string, velocity = 1) => {
    const buffer = buffersRef.current.get(soundId)
    if (!buffer || !audioContextRef.current) return

    const source = audioContextRef.current.createBufferSource()
    const gainNode = audioContextRef.current.createGain()

    source.buffer = buffer
    gainNode.gain.value = velocity

    source.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    source.start()
  }, [])

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setIsPlaying(false)
    } else {
      const stepDuration = (60 / project.bpm) / 4 * 1000 // 16分音符

      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % (project.bars * project.beatsPerBar)

          // 播放当前步的所有激活的轨道
          project.tracks.forEach(track => {
            if (!track.muted && track.pattern[nextStep]?.active) {
              const hasSolo = project.tracks.some(t => t.solo)
              if (!hasSolo || track.solo) {
                playSound(track.soundId, track.pattern[nextStep].velocity * track.volume)
              }
            }
          })

          return nextStep
        })
      }, stepDuration)

      setIsPlaying(true)
    }
  }, [isPlaying, project, playSound])

  // 切换单元格
  const toggleCell = useCallback((trackId: string, stepIndex: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? {
              ...track,
              pattern: track.pattern.map((cell, i) =>
                i === stepIndex ? { ...cell, active: !cell.active } : cell
              )
            }
          : track
      )
    }))
  }, [])

  // 设置 BPM
  const setBpm = useCallback((bpm: number) => {
    setProject(prev => ({ ...prev, bpm: Math.max(60, Math.min(200, bpm)) }))
  }, [])

  // 切换轨道静音
  const toggleMute = useCallback((trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    }))
  }, [])

  // 切换轨道独奏
  const toggleSolo = useCallback((trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false
      }))
    }))
  }, [])

  // 设置轨道音量
  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, volume } : track
      )
    }))
  }, [])

  // 清空节拍
  const clearPattern = useCallback(() => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        pattern: createEmptyPattern(prev.bars * prev.beatsPerBar)
      }))
    }))
  }, [])

  // 随机生成
  const randomize = useCallback(() => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        pattern: track.pattern.map(() => ({
          active: Math.random() > 0.7,
          velocity: 0.6 + Math.random() * 0.4,
          pitch: 0
        }))
      }))
    }))
  }, [])

  return {
    project,
    isPlaying,
    currentStep,
    selectedKit,
    togglePlay,
    toggleCell,
    setBpm,
    toggleMute,
    toggleSolo,
    setTrackVolume,
    clearPattern,
    randomize,
    playSound
  }
}

// Beat 制作器界面
export const BeatMakerUI: React.FC = () => {
  const {
    project,
    isPlaying,
    currentStep,
    togglePlay,
    toggleCell,
    setBpm,
    toggleMute,
    toggleSolo,
    setTrackVolume,
    clearPattern,
    randomize,
    playSound
  } = useBeatMaker()

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 bg-dark-800 border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isPlaying ? 'bg-red-500' : 'bg-primary-500'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>

          {/* BPM 控制 */}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <button
              onClick={() => setBpm(project.bpm - 5)}
              className="text-white/60 hover:text-white"
            >
              -
            </button>
            <span className="text-white font-mono w-12 text-center">
              {project.bpm}
            </span>
            <button
              onClick={() => setBpm(project.bpm + 5)}
              className="text-white/60 hover:text-white"
            >
              +
            </button>
            <span className="text-white/40 text-sm ml-1">BPM</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearPattern}
            className="px-4 py-2 bg-white/10 rounded-lg text-white/60 hover:text-white"
          >
            清空
          </button>
          <button
            onClick={randomize}
            className="px-4 py-2 bg-white/10 rounded-lg text-white/60 hover:text-white"
          >
            随机
          </button>
          <button className="px-4 py-2 bg-primary-500 rounded-lg text-white">
            导出
          </button>
        </div>
      </div>

      {/* 步进指示器 */}
      <div className="flex px-4 py-2 bg-dark-800/50 border-b border-white/10">
        <div className="w-32" /> {/* 轨道名称占位 */}
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: project.bars * project.beatsPerBar }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i === currentStep && isPlaying
                  ? 'bg-primary-500'
                  : i % 4 === 0
                    ? 'bg-white/20'
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <div className="w-24" /> {/* 控制按钮占位 */}
      </div>

      {/* 节拍网格 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-2 ${
                track.muted ? 'opacity-50' : ''
              }`}
            >
              {/* 轨道信息 */}
              <div className="w-32 flex items-center gap-2">
                <button
                  onClick={() => playSound(track.soundId)}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  ▶
                </button>
                <span className="text-white text-sm truncate">{track.name}</span>
              </div>

              {/* 节拍单元格 */}
              <div className="flex-1 flex gap-0.5">
                {track.pattern.map((cell, stepIndex) => (
                  <motion.button
                    key={stepIndex}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCell(track.id, stepIndex)}
                    className={`flex-1 aspect-square rounded transition-all ${
                      cell.active
                        ? stepIndex === currentStep && isPlaying
                          ? 'bg-primary-400 shadow-lg shadow-primary-500/50'
                          : 'bg-primary-500'
                        : stepIndex === currentStep && isPlaying
                          ? 'bg-white/30'
                          : stepIndex % 4 === 0
                            ? 'bg-white/15'
                            : 'bg-white/10'
                    } hover:bg-white/30`}
                  />
                ))}
              </div>

              {/* 轨道控制 */}
              <div className="w-24 flex items-center gap-1">
                <button
                  onClick={() => toggleMute(track.id)}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    track.muted ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => toggleSolo(track.id)}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    track.solo ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  S
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={track.volume}
                  onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                  className="w-16"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部键盘提示 */}
      <div className="p-4 bg-dark-800 border-t border-white/10">
        <p className="text-white/40 text-sm text-center">
          按 空格 播放/暂停 | 按 A-K 键快速试听音色
        </p>
      </div>
    </div>
  )
}

export default BeatMakerUI
