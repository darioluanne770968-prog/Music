import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * K歌模式组件
 * 支持录制、评分、分享
 */

// 歌词行类型
interface LyricLine {
  time: number
  text: string
  words?: { text: string; time: number; duration: number }[]
}

// 录制结果
interface RecordingResult {
  audioBlob: Blob
  score: number
  pitchAccuracy: number
  timing: number
  expression: number
}

// K歌设置
interface KaraokeSettings {
  micVolume: number
  musicVolume: number
  pitch: number // 升降调
  reverb: number
  echo: number
  showGuide: boolean
}

// K歌模式 Hook
export function useKaraokeMode() {
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [score, setScore] = useState(0)
  const [pitchData, setPitchData] = useState<number[]>([])
  const [settings, setSettings] = useState<KaraokeSettings>({
    micVolume: 0.8,
    musicVolume: 0.5,
    pitch: 0,
    reverb: 0.3,
    echo: 0.2,
    showGuide: true
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // 开始录制
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [])

  // 停止录制
  const stopRecording = useCallback((): Promise<RecordingResult> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

          // 计算分数（模拟）
          const result: RecordingResult = {
            audioBlob,
            score: Math.floor(Math.random() * 20 + 80), // 80-100
            pitchAccuracy: Math.floor(Math.random() * 15 + 85),
            timing: Math.floor(Math.random() * 15 + 85),
            expression: Math.floor(Math.random() * 20 + 80)
          }

          resolve(result)
        }

        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    })
  }, [])

  // 分析音高
  useEffect(() => {
    if (!isRecording || !analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const analyze = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)

      // 找到主频率
      let maxIndex = 0
      let maxValue = 0
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i]
          maxIndex = i
        }
      }

      const frequency = maxIndex * (44100 / bufferLength / 2)
      setPitchData(prev => [...prev.slice(-50), frequency])
    }

    const interval = setInterval(analyze, 50)
    return () => clearInterval(interval)
  }, [isRecording])

  return {
    isRecording,
    currentTime,
    score,
    pitchData,
    settings,
    setSettings,
    startRecording,
    stopRecording,
    setCurrentTime
  }
}

// K歌界面
interface KaraokeModeUIProps {
  songId: string
  songName: string
  artistName: string
  coverUrl: string
  lyrics: LyricLine[]
  audioUrl: string
  onClose: () => void
  onShare: (result: RecordingResult) => void
}

export const KaraokeModeUI: React.FC<KaraokeModeUIProps> = ({
  songName,
  artistName,
  coverUrl,
  lyrics,
  audioUrl,
  onClose,
  onShare
}) => {
  const {
    isRecording,
    currentTime,
    score,
    pitchData,
    settings,
    setSettings,
    startRecording,
    stopRecording,
    setCurrentTime
  } = useKaraokeMode()

  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<RecordingResult | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  // 当前歌词行索引
  const currentLineIndex = lyrics.findIndex(
    (line, index) =>
      currentTime >= line.time &&
      (index === lyrics.length - 1 || currentTime < lyrics[index + 1].time)
  )

  // 自动滚动歌词
  useEffect(() => {
    if (lyricsContainerRef.current && currentLineIndex >= 0) {
      const lineElement = lyricsContainerRef.current.children[currentLineIndex] as HTMLElement
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentLineIndex])

  const handlePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (isRecording) {
        const recordResult = await stopRecording()
        setResult(recordResult)
        setShowResult(true)
      }
    } else {
      await startRecording()
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = async () => {
    setIsPlaying(false)
    if (isRecording) {
      const recordResult = await stopRecording()
      setResult(recordResult)
      setShowResult(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-dark-800 to-dark-900">
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="font-medium text-white">{songName}</h2>
          <p className="text-sm text-white/60">{artistName}</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-white/60 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 实时分数 */}
      {isRecording && (
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-primary-400">{score}</div>
          <div className="text-sm text-white/60">实时评分</div>
        </div>
      )}

      {/* 音高显示 */}
      {isRecording && settings.showGuide && (
        <div className="h-24 mx-4 bg-white/5 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 flex items-end justify-center gap-0.5">
            {pitchData.map((pitch, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(pitch / 5, 100)}%` }}
                className="w-1 bg-gradient-to-t from-primary-500 to-purple-400 rounded-t"
              />
            ))}
          </div>
        </div>
      )}

      {/* 歌词区域 */}
      <div
        ref={lyricsContainerRef}
        className="flex-1 overflow-auto px-4 py-8"
      >
        <div className="space-y-6 text-center">
          {lyrics.map((line, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentLineIndex ? 1.1 : 1,
                opacity: index === currentLineIndex ? 1 : 0.4
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`text-xl transition-colors ${
                index === currentLineIndex ? 'text-primary-400' : 'text-white'
              }`}
            >
              {line.words ? (
                <span>
                  {line.words.map((word, wi) => {
                    const wordEndTime = word.time + word.duration
                    const isActive = currentTime >= word.time && currentTime < wordEndTime
                    const progress = isActive
                      ? (currentTime - word.time) / word.duration
                      : currentTime >= wordEndTime ? 1 : 0

                    return (
                      <span
                        key={wi}
                        className="relative inline-block"
                      >
                        <span className="text-white/40">{word.text}</span>
                        <span
                          className="absolute inset-0 text-primary-400 overflow-hidden"
                          style={{ width: `${progress * 100}%` }}
                        >
                          {word.text}
                        </span>
                      </span>
                    )
                  })}
                </span>
              ) : (
                line.text
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 进度条 */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500"
              style={{
                width: audioRef.current
                  ? `${(currentTime / (audioRef.current.duration || 1)) * 100}%`
                  : '0%'
              }}
            />
          </div>
          <span>{audioRef.current ? formatTime(audioRef.current.duration || 0) : '0:00'}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="p-6 flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePlay}
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isPlaying
              ? 'bg-red-500 animate-pulse'
              : 'bg-primary-500'
          }`}
        >
          {isPlaying ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-dark-800 rounded-t-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-6">K歌设置</h3>

              <div className="space-y-6">
                <SettingSlider
                  label="麦克风音量"
                  value={settings.micVolume}
                  onChange={(v) => setSettings({ ...settings, micVolume: v })}
                />
                <SettingSlider
                  label="伴奏音量"
                  value={settings.musicVolume}
                  onChange={(v) => setSettings({ ...settings, musicVolume: v })}
                />
                <SettingSlider
                  label="升降调"
                  value={(settings.pitch + 12) / 24}
                  onChange={(v) => setSettings({ ...settings, pitch: Math.round(v * 24 - 12) })}
                  showValue={`${settings.pitch > 0 ? '+' : ''}${settings.pitch}`}
                />
                <SettingSlider
                  label="混响"
                  value={settings.reverb}
                  onChange={(v) => setSettings({ ...settings, reverb: v })}
                />
                <SettingSlider
                  label="回声"
                  value={settings.echo}
                  onChange={(v) => setSettings({ ...settings, echo: v })}
                />

                <div className="flex items-center justify-between">
                  <span className="text-white">显示音高引导</span>
                  <button
                    onClick={() => setSettings({ ...settings, showGuide: !settings.showGuide })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      settings.showGuide ? 'bg-primary-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md ml-1"
                      animate={{ x: settings.showGuide ? 20 : 0 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 结果面板 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-dark-800 to-dark-900 rounded-3xl p-8"
            >
              <div className="text-center mb-8">
                <img
                  src={coverUrl}
                  alt={songName}
                  className="w-32 h-32 rounded-2xl mx-auto mb-4 shadow-xl"
                />
                <h3 className="text-xl font-bold text-white">{songName}</h3>
                <p className="text-white/60">{artistName}</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-primary-400 mb-2">
                  {result.score}
                </div>
                <div className="text-white/60">综合评分</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <ScoreItem label="音准" value={result.pitchAccuracy} />
                <ScoreItem label="节奏" value={result.timing} />
                <ScoreItem label="表现力" value={result.expression} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 bg-white/10 rounded-xl text-white"
                >
                  重唱
                </button>
                <button
                  onClick={() => onShare(result)}
                  className="flex-1 py-3 bg-primary-500 rounded-xl text-white"
                >
                  分享
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 设置滑块
const SettingSlider: React.FC<{
  label: string
  value: number
  onChange: (value: number) => void
  showValue?: string
}> = ({ label, value, onChange, showValue }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-white">{label}</span>
      <span className="text-white/60">{showValue ?? `${Math.round(value * 100)}%`}</span>
    </div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
    />
  </div>
)

// 分数项
const ScoreItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="text-center p-3 bg-white/5 rounded-xl">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-white/60">{label}</div>
  </div>
)

export default KaraokeModeUI
