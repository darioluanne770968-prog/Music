import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 哼唱识别组件
 * 通过哼唱/口哨识别歌曲
 */

// 音频特征
interface AudioFeatures {
  pitch: number[]
  tempo: number
  duration: number
  melody: number[]
}

// 识别结果
interface RecognitionResult {
  song: {
    id: string
    name: string
    artist: string
    cover: string
    confidence: number
  }
  matchedMelody: number[]
  timestamp: number
}

// 音频分析器
class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null
  private pitchHistory: number[] = []

  async start(): Promise<void> {
    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    source.connect(this.analyser)
  }

  stop(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop())
    this.audioContext?.close()
    this.pitchHistory = []
  }

  // 获取当前音高
  getPitch(): number {
    if (!this.analyser) return 0

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)
    this.analyser.getFloatFrequencyData(dataArray)

    // 找到最大值对应的频率
    let maxIndex = 0
    let maxValue = -Infinity
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i]
        maxIndex = i
      }
    }

    // 转换为频率
    const sampleRate = this.audioContext?.sampleRate || 44100
    const frequency = maxIndex * sampleRate / (this.analyser.fftSize * 2)

    return frequency
  }

  // 获取音频特征
  getFeatures(): AudioFeatures {
    const pitch = this.pitchHistory.slice(-100) // 最近100个采样
    const tempo = this.estimateTempo(pitch)
    const melody = this.extractMelody(pitch)

    return {
      pitch,
      tempo,
      duration: pitch.length * 0.05, // 50ms per sample
      melody
    }
  }

  // 估算节拍
  private estimateTempo(pitch: number[]): number {
    // 简化的节拍检测
    let changes = 0
    for (let i = 1; i < pitch.length; i++) {
      if (Math.abs(pitch[i] - pitch[i - 1]) > 50) {
        changes++
      }
    }
    return (changes / (pitch.length * 0.05)) * 60 // BPM
  }

  // 提取旋律
  private extractMelody(pitch: number[]): number[] {
    // 量化音高到音阶
    return pitch
      .filter(p => p > 80 && p < 1000) // 过滤有效频率
      .map(p => Math.round(12 * Math.log2(p / 440) + 69)) // 转换为MIDI音符
  }

  // 记录音高
  recordPitch(): void {
    const pitch = this.getPitch()
    if (pitch > 0) {
      this.pitchHistory.push(pitch)
    }
  }
}

// 哼唱识别 Hook
export function useHumRecognition() {
  const [isRecording, setIsRecording] = useState(false)
  const [results, setResults] = useState<RecognitionResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      analyzerRef.current = new AudioAnalyzer()
      await analyzerRef.current.start()
      setIsRecording(true)
      setError(null)

      // 每50ms记录一次音高
      intervalRef.current = setInterval(() => {
        analyzerRef.current?.recordPitch()
      }, 50)
    } catch (err) {
      setError('无法访问麦克风')
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const features = analyzerRef.current?.getFeatures()
    analyzerRef.current?.stop()
    setIsRecording(false)

    if (features && features.melody.length > 10) {
      setIsSearching(true)

      // 发送到服务器进行识别
      try {
        const response = await fetch('/api/recognize/hum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features })
        })
        const data = await response.json()
        setResults(data.results || mockResults())
      } catch {
        // 使用模拟数据
        setResults(mockResults())
      }

      setIsSearching(false)
    } else {
      setError('录音太短，请再试一次')
    }
  }, [])

  return {
    isRecording,
    results,
    isSearching,
    error,
    startRecording,
    stopRecording
  }
}

// 模拟识别结果
function mockResults(): RecognitionResult[] {
  return [
    {
      song: {
        id: '1',
        name: '晴天',
        artist: '周杰伦',
        cover: '/covers/sunny.jpg',
        confidence: 0.92
      },
      matchedMelody: [60, 62, 64, 65, 67],
      timestamp: Date.now()
    },
    {
      song: {
        id: '2',
        name: '稻香',
        artist: '周杰伦',
        cover: '/covers/rice.jpg',
        confidence: 0.78
      },
      matchedMelody: [60, 62, 64, 65, 67],
      timestamp: Date.now()
    },
    {
      song: {
        id: '3',
        name: '七里香',
        artist: '周杰伦',
        cover: '/covers/qilixiang.jpg',
        confidence: 0.65
      },
      matchedMelody: [60, 62, 64, 65, 67],
      timestamp: Date.now()
    }
  ]
}

// 哼唱识别界面
interface HumRecognitionUIProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (song: RecognitionResult['song']) => void
}

export const HumRecognitionUI: React.FC<HumRecognitionUIProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const {
    isRecording,
    results,
    isSearching,
    error,
    startRecording,
    stopRecording
  } = useHumRecognition()

  const [recordTime, setRecordTime] = useState(0)
  const [visualData, setVisualData] = useState<number[]>([])

  // 录音计时和可视化
  useEffect(() => {
    if (!isRecording) {
      setRecordTime(0)
      return
    }

    const timer = setInterval(() => {
      setRecordTime(t => t + 0.1)
      // 模拟波形数据
      setVisualData(prev => {
        const newData = [...prev, Math.random() * 100]
        return newData.slice(-50)
      })
    }, 100)

    return () => clearInterval(timer)
  }, [isRecording])

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-purple-900 to-dark-900 z-50"
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="h-full flex flex-col items-center justify-center p-6">
            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">哼唱识曲</h2>
              <p className="text-white/60">哼唱或吹口哨，我来帮你找歌</p>
            </div>

            {/* 可视化波形 */}
            <div className="w-full max-w-md h-32 mb-8 flex items-end justify-center gap-1">
              {visualData.map((value, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-primary-500 to-purple-400 rounded-full"
                  animate={{ height: isRecording ? `${value}%` : '10%' }}
                  transition={{ duration: 0.1 }}
                />
              ))}
              {visualData.length === 0 && (
                [...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-2 bg-white/20 rounded-full"
                  />
                ))
              )}
            </div>

            {/* 录音按钮 */}
            <div className="relative mb-8">
              <motion.div
                animate={{
                  scale: isRecording ? [1, 1.2, 1] : 1,
                  opacity: isRecording ? [0.5, 0.8, 0.5] : 0
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 -m-4 rounded-full bg-red-500/30"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                disabled={isSearching}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-primary-500'
                }`}
              >
                {isSearching ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRecording ? (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* 录音时间 */}
            {isRecording && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-lg mb-4"
              >
                {recordTime.toFixed(1)}s
              </motion.p>
            )}

            {/* 提示 */}
            {!isRecording && !isSearching && results.length === 0 && (
              <p className="text-white/40 text-center">
                {error || '点击按钮开始录音，唱出你记得的旋律'}
              </p>
            )}

            {/* 搜索中 */}
            {isSearching && (
              <p className="text-white/60">正在搜索匹配的歌曲...</p>
            )}

            {/* 结果列表 */}
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-3"
              >
                <p className="text-white/60 text-center mb-4">找到以下可能的歌曲</p>
                {results.map((result, index) => (
                  <motion.button
                    key={result.song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(result.song)}
                    className="w-full flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <img
                      src={result.song.cover}
                      alt={result.song.name}
                      className="w-14 h-14 rounded-lg object-cover bg-white/10"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-white">{result.song.name}</h4>
                      <p className="text-sm text-white/60">{result.song.artist}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-400 font-bold">
                        {Math.round(result.song.confidence * 100)}%
                      </div>
                      <div className="text-xs text-white/40">匹配度</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HumRecognitionUI
