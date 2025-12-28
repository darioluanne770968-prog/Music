import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { clsx } from 'clsx'

interface EQBand {
  frequency: number
  gain: number
  label: string
}

interface EQPreset {
  name: string
  icon: string
  bands: number[]
}

const EQ_FREQUENCIES: EQBand[] = [
  { frequency: 60, gain: 0, label: '60' },
  { frequency: 170, gain: 0, label: '170' },
  { frequency: 310, gain: 0, label: '310' },
  { frequency: 600, gain: 0, label: '600' },
  { frequency: 1000, gain: 0, label: '1K' },
  { frequency: 3000, gain: 0, label: '3K' },
  { frequency: 6000, gain: 0, label: '6K' },
  { frequency: 12000, gain: 0, label: '12K' },
]

const EQ_PRESETS: EQPreset[] = [
  { name: '默认', icon: '🎵', bands: [0, 0, 0, 0, 0, 0, 0, 0] },
  { name: '低音增强', icon: '🔊', bands: [6, 5, 4, 2, 0, 0, 0, 0] },
  { name: '高音增强', icon: '✨', bands: [0, 0, 0, 0, 2, 4, 5, 6] },
  { name: '人声增强', icon: '🎤', bands: [-2, -1, 0, 3, 4, 3, 0, -1] },
  { name: '摇滚', icon: '🎸', bands: [5, 3, 0, -1, 1, 3, 5, 6] },
  { name: '流行', icon: '🎧', bands: [-1, 1, 3, 4, 3, 0, -1, -2] },
  { name: '古典', icon: '🎻', bands: [0, 0, 0, 0, 0, -2, -3, -4] },
  { name: '电子', icon: '🎹', bands: [5, 4, 1, 0, -1, 2, 4, 5] },
  { name: '爵士', icon: '🎷', bands: [0, 2, 3, 2, -1, -1, 0, 1] },
  { name: '深夜模式', icon: '🌙', bands: [-3, -2, 0, 2, 2, 0, -2, -3] },
]

// Global audio context and filters
let audioContext: AudioContext | null = null
let filters: BiquadFilterNode[] = []
let sourceNode: MediaElementAudioSourceNode | null = null
let connectedElement: HTMLAudioElement | null = null

interface EqualizerProps {
  isOpen: boolean
  onClose: () => void
}

export const Equalizer: React.FC<EqualizerProps> = ({ isOpen, onClose }) => {
  const [bands, setBands] = useState<number[]>(EQ_PRESETS[0].bands)
  const [activePreset, setActivePreset] = useState<string>('默认')
  const [isInitialized, setIsInitialized] = useState(false)
  const { currentSong } = usePlayerStore()

  // Initialize EQ
  const initializeEQ = useCallback(() => {
    const audioElements = document.querySelectorAll('audio')
    const audioElement = Array.from(audioElements).find(el => el.src && el.src.includes('http'))

    if (!audioElement) {
      setTimeout(initializeEQ, 500)
      return
    }

    if (connectedElement === audioElement && filters.length > 0) {
      setIsInitialized(true)
      return
    }

    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      // Disconnect old connections
      if (sourceNode) {
        try {
          sourceNode.disconnect()
        } catch (e) {}
      }
      filters.forEach(f => {
        try { f.disconnect() } catch (e) {}
      })

      // Create filters for each band
      filters = EQ_FREQUENCIES.map((band, i) => {
        const filter = audioContext!.createBiquadFilter()
        filter.type = i === 0 ? 'lowshelf' : i === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking'
        filter.frequency.value = band.frequency
        filter.Q.value = 1
        filter.gain.value = bands[i]
        return filter
      })

      // Connect filters in series
      sourceNode = audioContext.createMediaElementSource(audioElement)
      let lastNode: AudioNode = sourceNode

      filters.forEach(filter => {
        lastNode.connect(filter)
        lastNode = filter
      })

      lastNode.connect(audioContext.destination)
      connectedElement = audioElement
      setIsInitialized(true)
    } catch (error) {
      console.warn('EQ initialization error:', error)
    }
  }, [bands])

  useEffect(() => {
    if (isOpen && currentSong) {
      setTimeout(initializeEQ, 100)
    }
  }, [isOpen, currentSong?.id, initializeEQ])

  // Update filter gains when bands change
  useEffect(() => {
    if (filters.length === bands.length) {
      filters.forEach((filter, i) => {
        filter.gain.value = bands[i]
      })
    }
  }, [bands])

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands]
    newBands[index] = value
    setBands(newBands)
    setActivePreset('')
  }

  const applyPreset = (preset: EQPreset) => {
    setBands([...preset.bands])
    setActivePreset(preset.name)
  }

  const resetEQ = () => {
    applyPreset(EQ_PRESETS[0])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900 rounded-t-3xl max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-lg font-bold text-white">均衡器</h2>
              <button
                onClick={resetEQ}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                重置
              </button>
            </div>

            {/* Presets */}
            <div className="px-6 pb-6">
              <p className="text-xs text-white/50 mb-3">预设模式</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {EQ_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={clsx(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-xl whitespace-nowrap transition-all',
                      activePreset === preset.name
                        ? 'bg-primary-500/20 ring-1 ring-primary-500'
                        : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className={clsx(
                      'text-xs',
                      activePreset === preset.name ? 'text-primary-500' : 'text-white/70'
                    )}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* EQ Sliders */}
            <div className="px-6 pb-8">
              <p className="text-xs text-white/50 mb-4">自定义调节</p>
              <div className="flex items-end justify-between gap-2 h-48">
                {EQ_FREQUENCIES.map((band, index) => (
                  <div key={band.frequency} className="flex flex-col items-center gap-2 flex-1">
                    {/* Value indicator */}
                    <span className="text-xs text-white/50 tabular-nums">
                      {bands[index] > 0 ? '+' : ''}{bands[index]}
                    </span>

                    {/* Vertical slider */}
                    <div className="relative h-32 w-full flex justify-center">
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={bands[index]}
                        onChange={(e) => handleBandChange(index, parseInt(e.target.value))}
                        className="eq-slider"
                        style={{
                          writingMode: 'vertical-lr',
                          direction: 'rtl',
                          height: '128px',
                          width: '24px',
                        }}
                      />
                      {/* Zero line indicator */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 pointer-events-none" />
                    </div>

                    {/* Frequency label */}
                    <span className="text-xs text-white/40">{band.label}</span>
                  </div>
                ))}
              </div>

              {/* dB labels */}
              <div className="flex justify-between mt-4 px-2">
                <span className="text-xs text-white/30">+12dB</span>
                <span className="text-xs text-white/30">0dB</span>
                <span className="text-xs text-white/30">-12dB</span>
              </div>
            </div>

            {/* Status */}
            <div className="px-6 pb-6">
              <div className={clsx(
                'flex items-center gap-2 px-4 py-3 rounded-xl',
                isInitialized ? 'bg-green-500/10' : 'bg-yellow-500/10'
              )}>
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  isInitialized ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                )} />
                <span className={clsx(
                  'text-sm',
                  isInitialized ? 'text-green-500' : 'text-yellow-500'
                )}>
                  {isInitialized ? '均衡器已启用' : '正在初始化...'}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Equalizer
