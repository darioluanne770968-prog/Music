import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐游戏组件
 * 节奏游戏、猜歌游戏、音乐问答
 */

// ==================== 节奏游戏 ====================

interface Note {
  id: string
  time: number
  lane: number // 0-3 四个轨道
  type: 'tap' | 'hold' | 'slide'
  duration?: number
}

interface RhythmGameState {
  score: number
  combo: number
  maxCombo: number
  perfect: number
  good: number
  miss: number
  isPlaying: boolean
}

// 节奏游戏 Hook
export function useRhythmGame(notes: Note[]) {
  const [state, setState] = useState<RhythmGameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    isPlaying: false
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [hitEffects, setHitEffects] = useState<{ id: string; lane: number; type: 'perfect' | 'good' | 'miss' }[]>([])

  const handleHit = useCallback((lane: number, timing: number) => {
    // 找到当前时间点附近的音符
    const tolerance = 0.15 // 150ms 容差
    const note = notes.find(n =>
      n.lane === lane &&
      Math.abs(n.time - currentTime) < tolerance &&
      !n.time // 未被击中
    )

    if (!note) {
      return
    }

    const diff = Math.abs(note.time - currentTime)
    let hitType: 'perfect' | 'good' | 'miss'
    let scoreAdd: number

    if (diff < 0.05) {
      hitType = 'perfect'
      scoreAdd = 100
    } else if (diff < 0.1) {
      hitType = 'good'
      scoreAdd = 50
    } else {
      hitType = 'miss'
      scoreAdd = 0
    }

    setState(prev => {
      const newCombo = hitType === 'miss' ? 0 : prev.combo + 1
      return {
        ...prev,
        score: prev.score + scoreAdd * (1 + newCombo * 0.1),
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        [hitType]: prev[hitType] + 1
      }
    })

    // 显示击中效果
    setHitEffects(prev => [...prev, { id: `${Date.now()}`, lane, type: hitType }])
    setTimeout(() => {
      setHitEffects(prev => prev.filter(e => e.id !== `${Date.now()}`))
    }, 500)
  }, [currentTime, notes])

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const reset = useCallback(() => {
    setState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfect: 0,
      good: 0,
      miss: 0,
      isPlaying: false
    })
    setCurrentTime(0)
  }, [])

  return {
    state,
    currentTime,
    hitEffects,
    handleHit,
    start,
    pause,
    reset,
    setCurrentTime
  }
}

// 节奏游戏界面
interface RhythmGameUIProps {
  songName: string
  notes: Note[]
  audioUrl: string
  onClose: () => void
  onComplete: (result: RhythmGameState) => void
}

export const RhythmGameUI: React.FC<RhythmGameUIProps> = ({
  songName,
  notes,
  audioUrl,
  onClose,
  onComplete
}) => {
  const { state, currentTime, hitEffects, handleHit, start, reset, setCurrentTime } = useRhythmGame(notes)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const laneColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308']

  // 获取当前可见的音符
  const visibleNotes = notes.filter(
    note => note.time > currentTime - 0.5 && note.time < currentTime + 2
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isPlaying) return

      const keyToLane: Record<string, number> = {
        'd': 0, 'f': 1, 'j': 2, 'k': 3
      }

      if (keyToLane[e.key] !== undefined) {
        handleHit(keyToLane[e.key], currentTime)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isPlaying, currentTime, handleHit])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    onComplete(state)
  }

  const handleStart = () => {
    start()
    audioRef.current?.play()
  }

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* 顶部信息 */}
      <div className="flex items-center justify-between p-4 bg-dark-800">
        <button onClick={onClose} className="p-2 text-white/60">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{Math.floor(state.score)}</div>
          <div className="text-xs text-white/60">{songName}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary-400">{state.combo}x</div>
          <div className="text-xs text-white/60">连击</div>
        </div>
      </div>

      {/* 游戏区域 */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        {/* 轨道 */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3].map(lane => (
            <div
              key={lane}
              className="flex-1 border-r border-white/10 relative"
              style={{ background: `linear-gradient(to bottom, transparent, ${laneColors[lane]}10)` }}
            >
              {/* 判定线 */}
              <div
                className="absolute bottom-20 left-0 right-0 h-1"
                style={{ backgroundColor: laneColors[lane] }}
              />

              {/* 点击区域 */}
              <button
                onClick={() => handleHit(lane, currentTime)}
                className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center"
              >
                <div
                  className="w-16 h-16 rounded-full border-4 opacity-50"
                  style={{ borderColor: laneColors[lane] }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* 下落的音符 */}
        {visibleNotes.map(note => {
          const progress = (note.time - currentTime) / 2 // 2秒预览
          const top = (1 - progress) * 100

          return (
            <motion.div
              key={note.id}
              className="absolute w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                left: `calc(${note.lane * 25 + 12.5}% - 32px)`,
                top: `calc(${top}% - 80px - 32px)`,
                backgroundColor: laneColors[note.lane]
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {note.type === 'hold' && (
                <div
                  className="absolute w-12 rounded-full"
                  style={{
                    backgroundColor: laneColors[note.lane],
                    height: (note.duration || 0) * 100,
                    top: -((note.duration || 0) * 100)
                  }}
                />
              )}
            </motion.div>
          )
        })}

        {/* 击中效果 */}
        <AnimatePresence>
          {hitEffects.map(effect => (
            <motion.div
              key={effect.id}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 flex items-center justify-center"
              style={{
                left: `calc(${effect.lane * 25 + 12.5}%)`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className={`text-2xl font-bold ${
                effect.type === 'perfect' ? 'text-yellow-400' :
                effect.type === 'good' ? 'text-green-400' : 'text-red-400'
              }`}>
                {effect.type.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 开始按钮 */}
      {!state.isPlaying && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStart}
            className="px-8 py-4 bg-primary-500 rounded-xl text-white text-xl font-bold"
          >
            开始游戏
          </motion.button>
        </div>
      )}

      {/* 按键提示 */}
      <div className="p-4 bg-dark-800 flex justify-center gap-4">
        {['D', 'F', 'J', 'K'].map((key, i) => (
          <div
            key={key}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: laneColors[i], color: 'white' }}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 猜歌游戏 ====================

interface GuessSong {
  id: string
  name: string
  artist: string
  previewUrl: string
  options: string[]
}

// 猜歌游戏界面
interface GuessSongGameProps {
  songs: GuessSong[]
  onComplete: (score: number) => void
  onClose: () => void
}

export const GuessSongGame: React.FC<GuessSongGameProps> = ({
  songs,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentSong = songs[currentIndex]
  const isLastSong = currentIndex === songs.length - 1

  // 倒计时
  useEffect(() => {
    if (!isPlaying || showResult) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleAnswer('') // 超时
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, showResult])

  const handleStart = () => {
    setIsPlaying(true)
    audioRef.current?.play()
  }

  const handleAnswer = (answer: string) => {
    const correct = answer === currentSong.name
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const bonus = Math.floor(countdown * 10)
      setScore(prev => prev + 100 + bonus)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    audioRef.current?.pause()
  }

  const handleNext = () => {
    if (isLastSong) {
      onComplete(score)
    } else {
      setCurrentIndex(prev => prev + 1)
      setShowResult(false)
      setCountdown(10)
      setIsPlaying(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-dark-800 to-dark-900 p-6">
      <audio ref={audioRef} src={currentSong.previewUrl} />

      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="p-2 text-white/60">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-xl font-bold text-white">{score}</div>
          <div className="text-xs text-white/60">得分</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary-400">{streak}🔥</div>
          <div className="text-xs text-white/60">连对</div>
        </div>
      </div>

      {/* 进度 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>第 {currentIndex + 1} / {songs.length} 题</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${((currentIndex + 1) / songs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 播放区域 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!isPlaying ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStart}
            className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.button>
        ) : (
          <>
            {/* 倒计时 */}
            <div className="relative w-32 h-32 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray={`${(countdown / 10) * 364} 364`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{countdown}</span>
              </div>
            </div>

            {/* 选项 */}
            <div className="w-full space-y-3">
              {currentSong.options.map((option, i) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left transition-colors ${
                    showResult
                      ? option === currentSong.name
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/40'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 结果 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '答对了！' : '答错了'}
            </div>
            <p className="text-white/60 mb-4">
              正确答案：{currentSong.name} - {currentSong.artist}
            </p>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-primary-500 rounded-xl text-white font-medium"
            >
              {isLastSong ? '查看结果' : '下一题'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== 音乐问答 ====================

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  category: 'artist' | 'album' | 'lyric' | 'trivia'
}

// 问答游戏界面
interface MusicQuizProps {
  questions: QuizQuestion[]
  onComplete: (score: number) => void
  onClose: () => void
}

export const MusicQuiz: React.FC<MusicQuizProps> = ({
  questions,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isCorrect = selectedIndex === currentQuestion.correctIndex

  const handleSelect = (index: number) => {
    if (showAnswer) return
    setSelectedIndex(index)
    setShowAnswer(true)

    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 10)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedIndex(null)
      setShowAnswer(false)
    }
  }

  const categoryIcons = {
    artist: '👤',
    album: '💿',
    lyric: '🎤',
    trivia: '❓'
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-dark-800 to-dark-900 p-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="p-2 text-white/60">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="px-4 py-2 bg-primary-500/20 rounded-full">
          <span className="text-primary-400 font-bold">{score} 分</span>
        </div>
      </div>

      {/* 进度 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>{currentIndex + 1} / {questions.length}</span>
          <span>{categoryIcons[currentQuestion.category]}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 问题 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white text-center">
          {currentQuestion.question}
        </h2>
      </div>

      {/* 选项 */}
      <div className="flex-1 space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(index)}
            disabled={showAnswer}
            className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
              showAnswer
                ? index === currentQuestion.correctIndex
                  ? 'bg-green-500 text-white'
                  : index === selectedIndex
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-white/40'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1">{option}</span>
            {showAnswer && index === currentQuestion.correctIndex && (
              <span className="text-xl">✓</span>
            )}
            {showAnswer && index === selectedIndex && index !== currentQuestion.correctIndex && (
              <span className="text-xl">✗</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* 下一题按钮 */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={handleNext}
              className="w-full py-4 bg-primary-500 rounded-xl text-white font-bold"
            >
              {isLastQuestion ? '查看结果' : '下一题'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RhythmGameUI
