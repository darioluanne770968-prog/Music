import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * 专业均衡器组件
 * 支持多频段 EQ、预设、可视化
 */

// 均衡器频段
export interface EQBand {
  frequency: number  // Hz
  gain: number       // dB (-12 to 12)
  q: number          // Q 值 (0.1 to 10)
  type: BiquadFilterType
}

// 均衡器预设
export interface EQPreset {
  id: string
  name: string
  icon: string
  bands: number[]  // 每个频段的增益值
}

// 默认频段
const DEFAULT_BANDS: EQBand[] = [
  { frequency: 32, gain: 0, q: 1, type: 'lowshelf' },
  { frequency: 64, gain: 0, q: 1, type: 'peaking' },
  { frequency: 125, gain: 0, q: 1, type: 'peaking' },
  { frequency: 250, gain: 0, q: 1, type: 'peaking' },
  { frequency: 500, gain: 0, q: 1, type: 'peaking' },
  { frequency: 1000, gain: 0, q: 1, type: 'peaking' },
  { frequency: 2000, gain: 0, q: 1, type: 'peaking' },
  { frequency: 4000, gain: 0, q: 1, type: 'peaking' },
  { frequency: 8000, gain: 0, q: 1, type: 'peaking' },
  { frequency: 16000, gain: 0, q: 1, type: 'highshelf' }
]

// 预设列表
const EQ_PRESETS: EQPreset[] = [
  { id: 'flat', name: '平坦', icon: '➖', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass', name: '重低音', icon: '🔊', bands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { id: 'treble', name: '高音增强', icon: '✨', bands: [0, 0, 0, 0, 0, 0, 2, 4, 5, 6] },
  { id: 'vocal', name: '人声增强', icon: '🎤', bands: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  { id: 'rock', name: '摇滚', icon: '🎸', bands: [5, 4, 2, 0, -2, -1, 2, 4, 5, 5] },
  { id: 'pop', name: '流行', icon: '🎵', bands: [1, 2, 3, 2, 0, 0, 1, 2, 3, 2] },
  { id: 'jazz', name: '爵士', icon: '🎷', bands: [3, 2, 0, 1, 2, 2, 1, 2, 3, 3] },
  { id: 'classical', name: '古典', icon: '🎻', bands: [4, 3, 2, 1, 0, 0, 0, 2, 3, 4] },
  { id: 'electronic', name: '电子', icon: '🎹', bands: [5, 4, 2, 0, -1, 0, 1, 3, 4, 3] },
  { id: 'hiphop', name: '嘻哈', icon: '🎧', bands: [6, 5, 3, 1, 0, 1, 1, 0, 2, 1] },
  { id: 'acoustic', name: '原声', icon: '🎸', bands: [3, 2, 1, 0, 1, 1, 2, 2, 3, 2] },
  { id: 'podcast', name: '播客', icon: '🎙️', bands: [-3, -2, 0, 3, 4, 4, 3, 0, -1, -2] },
  { id: 'live', name: '现场', icon: '🏟️', bands: [2, 1, 0, 0, 1, 2, 2, 1, 0, 1] },
  { id: 'lounge', name: '休闲', icon: '☕', bands: [1, 2, 2, 1, 0, 0, 0, 1, 2, 2] },
  { id: 'night', name: '深夜', icon: '🌙', bands: [-2, 0, 1, 2, 1, 0, -1, -1, 0, 1] },
  { id: 'car', name: '车载', icon: '🚗', bands: [4, 3, 1, 0, -1, 0, 1, 2, 4, 3] }
]

// 均衡器处理器类
class EQProcessor {
  private audioContext: AudioContext
  private filters: BiquadFilterNode[] = []
  private inputNode: GainNode
  private outputNode: GainNode
  private analyser: AnalyserNode

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
    this.inputNode = audioContext.createGain()
    this.outputNode = audioContext.createGain()
    this.analyser = audioContext.createAnalyser()
    this.analyser.fftSize = 256

    // 创建滤波器链
    DEFAULT_BANDS.forEach((band, index) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.gain.value = band.gain
      filter.Q.value = band.q
      this.filters.push(filter)
    })

    // 连接滤波器
    this.inputNode.connect(this.filters[0])
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1])
    }
    this.filters[this.filters.length - 1].connect(this.analyser)
    this.analyser.connect(this.outputNode)
    this.outputNode.connect(audioContext.destination)
  }

  // 设置频段增益
  setGain(bandIndex: number, gain: number) {
    if (this.filters[bandIndex]) {
      this.filters[bandIndex].gain.setValueAtTime(gain, this.audioContext.currentTime)
    }
  }

  // 应用预设
  applyPreset(preset: EQPreset) {
    preset.bands.forEach((gain, index) => {
      this.setGain(index, gain)
    })
  }

  // 获取频谱数据
  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    return data
  }

  // 获取输入节点
  getInputNode(): GainNode {
    return this.inputNode
  }

  // 断开连接
  disconnect() {
    this.inputNode.disconnect()
    this.filters.forEach(f => f.disconnect())
    this.analyser.disconnect()
    this.outputNode.disconnect()
  }
}

// 均衡器 Hook
export function useEqualizer(audioElement: HTMLAudioElement | null) {
  const [bands, setBands] = useState<EQBand[]>(DEFAULT_BANDS)
  const [activePreset, setActivePreset] = useState<string | null>('flat')
  const [isEnabled, setIsEnabled] = useState(true)
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128))

  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<EQProcessor | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number>()

  // 初始化
  useEffect(() => {
    if (!audioElement) return

    audioContextRef.current = new AudioContext()
    processorRef.current = new EQProcessor(audioContextRef.current)

    sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
    sourceRef.current.connect(processorRef.current.getInputNode())

    // 频谱动画
    const updateSpectrum = () => {
      if (processorRef.current) {
        setFrequencyData(processorRef.current.getFrequencyData())
      }
      animationRef.current = requestAnimationFrame(updateSpectrum)
    }
    updateSpectrum()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
    }
  }, [audioElement])

  // 设置频段增益
  const setGain = useCallback((bandIndex: number, gain: number) => {
    setBands(prev => prev.map((band, i) =>
      i === bandIndex ? { ...band, gain } : band
    ))
    processorRef.current?.setGain(bandIndex, gain)
    setActivePreset(null) // 清除预设
  }, [])

  // 应用预设
  const applyPreset = useCallback((presetId: string) => {
    const preset = EQ_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setBands(prev => prev.map((band, i) => ({ ...band, gain: preset.bands[i] })))
      processorRef.current?.applyPreset(preset)
      setActivePreset(presetId)
    }
  }, [])

  // 重置
  const reset = useCallback(() => {
    applyPreset('flat')
  }, [applyPreset])

  return {
    bands,
    activePreset,
    isEnabled,
    frequencyData,
    presets: EQ_PRESETS,
    setGain,
    applyPreset,
    reset,
    setIsEnabled
  }
}

// 均衡器界面
interface EqualizerUIProps {
  bands: EQBand[]
  activePreset: string | null
  frequencyData: Uint8Array
  presets: EQPreset[]
  onGainChange: (bandIndex: number, gain: number) => void
  onPresetSelect: (presetId: string) => void
  onReset: () => void
}

export const EqualizerUI: React.FC<EqualizerUIProps> = ({
  bands,
  activePreset,
  frequencyData,
  presets,
  onGainChange,
  onPresetSelect,
  onReset
}) => {
  const [showPresets, setShowPresets] = useState(true)

  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${freq / 1000}k`
    }
    return freq.toString()
  }

  return (
    <div className="p-6 bg-dark-800 rounded-2xl">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">均衡器</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1 text-sm text-white/60 hover:text-white"
          >
            重置
          </button>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`px-4 py-1 rounded-full text-sm ${
              showPresets ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            预设
          </button>
        </div>
      </div>

      {/* 频谱可视化 */}
      <div className="h-20 mb-6 flex items-end justify-center gap-0.5 bg-white/5 rounded-xl p-2">
        {Array.from(frequencyData).slice(0, 64).map((value, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-primary-500 to-purple-400 rounded-full"
            animate={{ height: `${(value / 255) * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>

      {/* 预设选择 */}
      {showPresets && (
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2">
            {presets.slice(0, 8).map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset.id)}
                className={`p-2 rounded-xl text-center transition-all ${
                  activePreset === preset.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <span className="text-lg block">{preset.icon}</span>
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 频段滑块 */}
      <div className="flex items-end justify-between gap-2 h-48">
        {bands.map((band, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            {/* 增益值 */}
            <span className="text-xs text-white/40 mb-2">
              {band.gain > 0 ? '+' : ''}{band.gain}
            </span>

            {/* 滑块 */}
            <div className="relative flex-1 w-full flex justify-center">
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={band.gain}
                onChange={(e) => onGainChange(index, parseFloat(e.target.value))}
                className="absolute w-32 origin-center -rotate-90 appearance-none bg-transparent"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-90deg)'
                }}
              />

              {/* 轨道背景 */}
              <div className="w-2 h-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="w-full bg-primary-500 rounded-full origin-bottom"
                  animate={{
                    height: `${((band.gain + 12) / 24) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* 频率标签 */}
            <span className="text-xs text-white/60 mt-2">
              {formatFrequency(band.frequency)}
            </span>
          </div>
        ))}
      </div>

      {/* dB 刻度 */}
      <div className="flex justify-between mt-4 text-xs text-white/40">
        <span>-12 dB</span>
        <span>0 dB</span>
        <span>+12 dB</span>
      </div>
    </div>
  )
}

export default EqualizerUI
