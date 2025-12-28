import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AI 语音助手组件
 * 支持语音点歌、语音控制、AI对话
 */

// 语音识别状态
type ListeningState = 'idle' | 'listening' | 'processing' | 'speaking'

// 语音命令类型
interface VoiceCommand {
  intent: 'play' | 'pause' | 'next' | 'previous' | 'search' | 'volume' | 'like' | 'playlist' | 'mood' | 'unknown'
  entities: {
    song?: string
    artist?: string
    playlist?: string
    mood?: string
    volume?: number
    query?: string
  }
  confidence: number
  rawText: string
}

// AI DJ 配置
interface AIDJConfig {
  personality: 'energetic' | 'calm' | 'funny' | 'professional'
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  introFrequency: 'every' | 'sometimes' | 'rarely'
  includeWeather: boolean
  includeNews: boolean
  includeTrivia: boolean
}

// 语音识别 Hook
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('浏览器不支持语音识别')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const text = event.results[last][0].transcript
      setTranscript(text)
    }

    recognition.onerror = (event: any) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('')
      setError(null)
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  return { isListening, transcript, error, startListening, stopListening }
}

// 语音合成 Hook
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, lang = 'zh-CN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop }
}

// 解析语音命令
export function parseVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase()

  // 播放控制
  if (lowerText.includes('暂停') || lowerText.includes('停止')) {
    return { intent: 'pause', entities: {}, confidence: 0.95, rawText: text }
  }
  if (lowerText.includes('播放') || lowerText.includes('继续')) {
    // 检查是否有具体歌曲/歌手
    const playMatch = text.match(/播放(.+?)的?歌?$/)
    if (playMatch) {
      return {
        intent: 'play',
        entities: { query: playMatch[1] },
        confidence: 0.9,
        rawText: text
      }
    }
    return { intent: 'play', entities: {}, confidence: 0.9, rawText: text }
  }
  if (lowerText.includes('下一首') || lowerText.includes('切歌')) {
    return { intent: 'next', entities: {}, confidence: 0.95, rawText: text }
  }
  if (lowerText.includes('上一首')) {
    return { intent: 'previous', entities: {}, confidence: 0.95, rawText: text }
  }

  // 音量控制
  const volumeMatch = text.match(/音量.*?(\d+)/)
  if (volumeMatch) {
    return {
      intent: 'volume',
      entities: { volume: parseInt(volumeMatch[1]) },
      confidence: 0.9,
      rawText: text
    }
  }
  if (lowerText.includes('大声') || lowerText.includes('调高')) {
    return { intent: 'volume', entities: { volume: 80 }, confidence: 0.8, rawText: text }
  }
  if (lowerText.includes('小声') || lowerText.includes('调低')) {
    return { intent: 'volume', entities: { volume: 30 }, confidence: 0.8, rawText: text }
  }

  // 心情/场景
  const moods = ['开心', '伤感', '放松', '激动', '安静', '浪漫', '治愈', '怀旧']
  for (const mood of moods) {
    if (lowerText.includes(mood)) {
      return { intent: 'mood', entities: { mood }, confidence: 0.85, rawText: text }
    }
  }

  // 收藏
  if (lowerText.includes('喜欢') || lowerText.includes('收藏')) {
    return { intent: 'like', entities: {}, confidence: 0.9, rawText: text }
  }

  // 搜索
  if (lowerText.includes('搜索') || lowerText.includes('找')) {
    const searchMatch = text.match(/(?:搜索|找)(.+)/)
    return {
      intent: 'search',
      entities: { query: searchMatch?.[1] || '' },
      confidence: 0.85,
      rawText: text
    }
  }

  return { intent: 'unknown', entities: { query: text }, confidence: 0.5, rawText: text }
}

// AI DJ 生成介绍
export async function generateDJIntro(
  song: { name: string; artist: string; album?: string },
  config: AIDJConfig
): Promise<string> {
  const intros = {
    energetic: [
      `哇哦！接下来这首超级好听！${song.artist}的《${song.name}》，准备好燃起来了吗！`,
      `来来来，把音量调大！${song.name}，${song.artist}的神作，走起！`,
      `嘿！这首歌绝对能让你跟着节奏摇起来！${song.artist} - ${song.name}！`
    ],
    calm: [
      `接下来，让我们一起聆听${song.artist}带来的《${song.name}》，希望你喜欢。`,
      `下一首歌是${song.name}，来自${song.artist}。静静感受音乐的美好。`,
      `${song.artist}的《${song.name}》，愿这首歌能带给你片刻宁静。`
    ],
    funny: [
      `叮咚！您的外卖到了！哦不对，是您点的歌到了！${song.artist}的${song.name}！`,
      `据说听这首歌的人颜值都会提升，来试试！${song.name}！`,
      `前方高能预警！${song.artist}的超级无敌好听的${song.name}来袭！`
    ],
    professional: [
      `接下来播放的是${song.artist}演唱的《${song.name}》${song.album ? `，收录于专辑《${song.album}》` : ''}。`,
      `下一首，${song.name}，演唱者${song.artist}。`,
      `${song.artist}，${song.name}。`
    ]
  }

  const personalityIntros = intros[config.personality]
  const intro = personalityIntros[Math.floor(Math.random() * personalityIntros.length)]

  // 添加额外信息
  let extra = ''
  if (config.includeWeather) {
    extra += ' 今天天气不错，适合听音乐。'
  }
  if (config.includeTrivia) {
    extra += ` 你知道吗？这首歌发行于...`
  }

  return intro + extra
}

// 语音助手界面
interface VoiceAssistantProps {
  onCommand: (command: VoiceCommand) => void
  isOpen: boolean
  onClose: () => void
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  isOpen,
  onClose
}) => {
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition()
  const { isSpeaking, speak, stop } = useSpeechSynthesis()
  const [state, setState] = useState<ListeningState>('idle')
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (isListening) {
      setState('listening')
    } else if (transcript && state === 'listening') {
      setState('processing')
      processCommand(transcript)
    }
  }, [isListening, transcript])

  const processCommand = async (text: string) => {
    const command = parseVoiceCommand(text)

    // 生成响应
    let responseText = ''
    switch (command.intent) {
      case 'play':
        responseText = command.entities.query
          ? `好的，正在为您播放${command.entities.query}`
          : '继续播放'
        break
      case 'pause':
        responseText = '已暂停'
        break
      case 'next':
        responseText = '好的，下一首'
        break
      case 'previous':
        responseText = '好的，上一首'
        break
      case 'volume':
        responseText = `音量已调整到${command.entities.volume}%`
        break
      case 'like':
        responseText = '已添加到喜欢'
        break
      case 'mood':
        responseText = `好的，为您推荐${command.entities.mood}的音乐`
        break
      case 'search':
        responseText = `正在搜索${command.entities.query}`
        break
      default:
        responseText = '抱歉，我没有理解您的意思'
    }

    setResponse(responseText)
    setState('speaking')
    speak(responseText)

    // 执行命令
    onCommand(command)

    // 等待语音播报完成
    setTimeout(() => {
      setState('idle')
    }, 2000)
  }

  const handlePress = () => {
    if (state === 'idle') {
      startListening()
    } else if (state === 'listening') {
      stopListening()
    } else if (state === 'speaking') {
      stop()
      setState('idle')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 动态波形 */}
          <div className="relative w-48 h-48 mb-8">
            <motion.div
              animate={{
                scale: state === 'listening' ? [1, 1.2, 1] : 1,
                opacity: state === 'listening' ? [0.5, 1, 0.5] : 0.3
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-primary-500/30"
            />
            <motion.div
              animate={{
                scale: state === 'listening' ? [1, 1.4, 1] : 1,
                opacity: state === 'listening' ? [0.3, 0.6, 0.3] : 0.2
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="absolute inset-0 rounded-full bg-primary-500/20"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePress}
              className={`absolute inset-0 m-auto w-32 h-32 rounded-full flex items-center justify-center ${
                state === 'listening' ? 'bg-red-500' :
                state === 'speaking' ? 'bg-green-500' :
                'bg-primary-500'
              }`}
            >
              {state === 'listening' ? (
                <svg className="w-12 h-12 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              ) : state === 'speaking' ? (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* 状态文字 */}
          <div className="text-center mb-8">
            {state === 'idle' && (
              <p className="text-white/60">点击开始语音输入</p>
            )}
            {state === 'listening' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-lg"
              >
                {transcript || '正在聆听...'}
              </motion.p>
            )}
            {state === 'processing' && (
              <p className="text-white/60">处理中...</p>
            )}
            {state === 'speaking' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary-400 text-lg"
              >
                {response}
              </motion.p>
            )}
          </div>

          {/* 示例命令 */}
          <div className="max-w-md text-center">
            <p className="text-white/40 text-sm mb-4">试试说：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['播放周杰伦的歌', '下一首', '音量调到50', '来点开心的音乐'].map((cmd) => (
                <span key={cmd} className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                  "{cmd}"
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// AI DJ 组件
interface AIDJProps {
  enabled: boolean
  config: AIDJConfig
  currentSong: { name: string; artist: string; album?: string } | null
}

export const AIDJ: React.FC<AIDJProps> = ({ enabled, config, currentSong }) => {
  const { speak, isSpeaking } = useSpeechSynthesis()
  const [lastSongId, setLastSongId] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !currentSong) return

    const songId = `${currentSong.name}-${currentSong.artist}`
    if (songId === lastSongId) return

    // 根据频率决定是否播报
    const shouldAnnounce = config.introFrequency === 'every' ||
      (config.introFrequency === 'sometimes' && Math.random() > 0.5) ||
      (config.introFrequency === 'rarely' && Math.random() > 0.8)

    if (shouldAnnounce) {
      generateDJIntro(currentSong, config).then((intro) => {
        speak(intro, config.language)
      })
    }

    setLastSongId(songId)
  }, [currentSong, enabled, config])

  if (!enabled) return null

  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-24 left-4 right-4 p-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl">🎙️</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">AI DJ</p>
            <p className="text-white/80 text-sm">正在介绍...</p>
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [12, 24, 12] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-1 bg-white rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceAssistant
