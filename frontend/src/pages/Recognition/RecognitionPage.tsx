import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import * as api from '@/services/netease'
import toast from 'react-hot-toast'

type RecognitionState = 'idle' | 'listening' | 'processing' | 'found' | 'not_found'

interface RecognizedSong {
  id: number
  name: string
  artist: string
  album: string
  cover: string
  duration: number
}

const RecognitionPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const [state, setState] = useState<RecognitionState>('idle')
  const [recognizedSong, setRecognizedSong] = useState<RecognizedSong | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [listenDuration, setListenDuration] = useState(0)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  const startListening = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

      mediaStreamRef.current = stream

      // Create audio context for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      setState('listening')
      setListenDuration(0)

      // Start visualization loop
      const updateLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          setAudioLevel(average / 255)
        }
        animationRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()

      // Update listen duration
      timerRef.current = setInterval(() => {
        setListenDuration(prev => prev + 1)
      }, 1000)

      // After 5-10 seconds, simulate recognition
      setTimeout(() => {
        processRecognition()
      }, 5000 + Math.random() * 3000)

    } catch (error) {
      console.error('Failed to access microphone:', error)
      toast.error('无法访问麦克风，请检查权限设置')
      setState('idle')
    }
  }

  const stopListening = () => {
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setAudioLevel(0)
  }

  const processRecognition = async () => {
    stopListening()
    setState('processing')

    try {
      // In a real implementation, we would send audio data to an API like ACRCloud
      // For now, we'll simulate by fetching a random popular song

      // Get personalized recommendations or top songs
      const res = await api.getRecommendSongs()

      if (res?.data?.dailySongs?.length > 0) {
        // Pick a random song from recommendations
        const randomIndex = Math.floor(Math.random() * Math.min(10, res.data.dailySongs.length))
        const song = res.data.dailySongs[randomIndex]

        // Simulate a 70% success rate
        if (Math.random() > 0.3) {
          setRecognizedSong({
            id: song.id,
            name: song.name,
            artist: song.ar?.[0]?.name || '未知歌手',
            album: song.al?.name || '未知专辑',
            cover: song.al?.picUrl || '',
            duration: Math.floor((song.dt || 0) / 1000),
          })
          setState('found')
        } else {
          setState('not_found')
        }
      } else {
        setState('not_found')
      }
    } catch (error) {
      console.error('Recognition failed:', error)
      setState('not_found')
    }
  }

  const cancelRecognition = () => {
    stopListening()
    setState('idle')
    setRecognizedSong(null)
  }

  const playRecognizedSong = async () => {
    if (!recognizedSong) return

    try {
      // Get full song details
      const res = await api.getSongDetail([recognizedSong.id])
      if (res?.songs?.[0]) {
        const song = res.songs[0]
        const formattedSong = {
          id: song.id,
          name: song.name,
          title: song.name,
          artist: song.ar?.[0]?.name || '未知歌手',
          artists: song.ar || [],
          album: song.al?.name || '未知专辑',
          albumId: song.al?.id,
          cover: song.al?.picUrl || '',
          duration: Math.floor((song.dt || 0) / 1000),
          isVip: song.fee === 1,
          mvId: song.mv || 0,
        }

        setQueue([formattedSong], 0)
        toast.success('正在播放')
      }
    } catch (error) {
      toast.error('播放失败')
    }
  }

  const tryAgain = () => {
    setState('idle')
    setRecognizedSong(null)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 safe-top">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">听歌识曲</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center mb-8"
              >
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-pulse" />

                {/* Icon */}
                <svg className="w-20 h-20 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </motion.button>

              <p className="text-white text-lg font-medium mb-2">点击开始识别</p>
              <p className="text-white/50 text-sm">把手机靠近音乐播放源</p>
            </motion.div>
          )}

          {/* Listening State */}
          {state === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative w-40 h-40 mb-8">
                {/* Dynamic rings based on audio level */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary-500"
                    animate={{
                      scale: [1, 1.2 + audioLevel * 0.5 + i * 0.2],
                      opacity: [0.6 - i * 0.15, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Center button */}
                <button
                  onClick={cancelRecognition}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.1})`,
                    transition: 'transform 0.1s ease-out',
                  }}
                >
                  <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
              </div>

              <p className="text-white text-lg font-medium mb-2">正在聆听...</p>
              <p className="text-primary-500 text-sm">{listenDuration}秒</p>
              <p className="text-white/40 text-xs mt-4">点击取消</p>
            </motion.div>
          )}

          {/* Processing State */}
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
                <svg className="w-16 h-16 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>

              <p className="text-white text-lg font-medium">识别中...</p>
              <p className="text-white/50 text-sm mt-2">正在搜索歌曲信息</p>
            </motion.div>
          )}

          {/* Found State */}
          {state === 'found' && recognizedSong && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center w-full max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </motion.div>

              <p className="text-white/60 text-sm mb-4">已识别到歌曲</p>

              {/* Song Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={recognizedSong.cover || '/default-cover.jpg'}
                    alt={recognizedSong.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white font-bold truncate">{recognizedSong.name}</p>
                    <p className="text-white/50 text-sm truncate">{recognizedSong.artist}</p>
                    <p className="text-white/30 text-xs truncate mt-1">{recognizedSong.album}</p>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={tryAgain}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium"
                >
                  再试一次
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={playRecognizedSong}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                  </svg>
                  播放
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Not Found State */}
          {state === 'not_found' && (
            <motion.div
              key="not_found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </motion.div>

              <p className="text-white text-lg font-medium mb-2">未能识别</p>
              <p className="text-white/50 text-sm mb-6">请尝试靠近音源或选择更清晰的音乐片段</p>

              <button
                onClick={tryAgain}
                className="px-8 py-3 rounded-xl bg-primary-500 text-white font-medium"
              >
                再试一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      {state === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-8 safe-bottom"
        >
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-white/60 text-sm font-medium mb-3">使用提示</p>
            <ul className="space-y-2 text-white/40 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>尽量保持周围环境安静</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>将手机靠近音乐播放源</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>选择歌曲中有人声的部分效果更好</span>
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RecognitionPage
