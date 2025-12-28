import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐对战组件
 * 实时音乐知识对战/猜歌对战
 */

// 对战模式
type BattleMode = 'guess_song' | 'quiz' | 'lyrics' | 'speed'

// 玩家
interface Player {
  id: string
  name: string
  avatar: string
  score: number
  streak: number
  isReady: boolean
  answer?: string
  answerTime?: number
}

// 问题
interface Question {
  id: string
  type: 'audio' | 'text' | 'image'
  content: string
  audioUrl?: string
  imageUrl?: string
  options: string[]
  correctAnswer: string
  timeLimit: number
  points: number
}

// 对战房间
interface BattleRoom {
  id: string
  mode: BattleMode
  status: 'waiting' | 'playing' | 'finished'
  players: Player[]
  currentQuestion: number
  totalQuestions: number
  questions: Question[]
}

// 对战 Hook
export function useMusicBattle() {
  const [room, setRoom] = useState<BattleRoom | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    id: 'player_1',
    name: '我',
    avatar: '👤',
    score: 0,
    streak: 0,
    isReady: false
  })
  const [timeLeft, setTimeLeft] = useState(0)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  // 创建房间
  const createRoom = useCallback((mode: BattleMode) => {
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        type: 'audio',
        content: '这是哪首歌？',
        audioUrl: '/api/placeholder/audio',
        options: ['晴天', '七里香', '稻香', '告白气球'],
        correctAnswer: '晴天',
        timeLimit: 15,
        points: 100
      },
      {
        id: 'q2',
        type: 'text',
        content: '"天青色等烟雨，而我在等你"出自哪首歌？',
        options: ['青花瓷', '东风破', '发如雪', '菊花台'],
        correctAnswer: '青花瓷',
        timeLimit: 10,
        points: 100
      },
      {
        id: 'q3',
        type: 'text',
        content: '周杰伦的第一张专辑叫什么名字？',
        options: ['范特西', 'Jay', '八度空间', '叶惠美'],
        correctAnswer: 'Jay',
        timeLimit: 10,
        points: 150
      },
      {
        id: 'q4',
        type: 'text',
        content: '《以父之名》的词作者是谁？',
        options: ['周杰伦', '方文山', '黄俊郎', '林秋离'],
        correctAnswer: '黄俊郎',
        timeLimit: 10,
        points: 150
      },
      {
        id: 'q5',
        type: 'text',
        content: '下面哪首歌不是周杰伦的作品？',
        options: ['夜曲', '简单爱', '情书', '七里香'],
        correctAnswer: '情书',
        timeLimit: 10,
        points: 200
      }
    ]

    const newRoom: BattleRoom = {
      id: `room_${Date.now()}`,
      mode,
      status: 'waiting',
      players: [
        { ...currentPlayer, isReady: true },
        {
          id: 'bot_1',
          name: '音乐达人',
          avatar: '🤖',
          score: 0,
          streak: 0,
          isReady: true
        }
      ],
      currentQuestion: 0,
      totalQuestions: mockQuestions.length,
      questions: mockQuestions
    }

    setRoom(newRoom)
  }, [currentPlayer])

  // 开始对战
  const startBattle = useCallback(() => {
    if (!room) return

    setRoom(prev => prev ? { ...prev, status: 'playing' } : null)
    setTimeLeft(room.questions[0].timeLimit)
    setIsAnswerRevealed(false)
    setSelectedAnswer(null)
  }, [room])

  // 回答问题
  const submitAnswer = useCallback((answer: string) => {
    if (!room || isAnswerRevealed) return

    setSelectedAnswer(answer)

    const currentQ = room.questions[room.currentQuestion]
    const isCorrect = answer === currentQ.correctAnswer
    const answerTime = currentQ.timeLimit - timeLeft

    // 更新分数
    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / currentQ.timeLimit) * 50)
      const points = currentQ.points + timeBonus

      setRoom(prev => {
        if (!prev) return null
        return {
          ...prev,
          players: prev.players.map(p =>
            p.id === currentPlayer.id
              ? { ...p, score: p.score + points, streak: p.streak + 1, answer, answerTime }
              : p
          )
        }
      })

      setCurrentPlayer(prev => ({
        ...prev,
        score: prev.score + currentQ.points,
        streak: prev.streak + 1
      }))
    } else {
      setCurrentPlayer(prev => ({
        ...prev,
        streak: 0
      }))
    }

    // 模拟对手回答
    setTimeout(() => {
      setRoom(prev => {
        if (!prev) return null
        const botCorrect = Math.random() > 0.3
        const botAnswer = botCorrect ? currentQ.correctAnswer : currentQ.options[Math.floor(Math.random() * 4)]
        const botTime = 2 + Math.random() * 8

        return {
          ...prev,
          players: prev.players.map(p =>
            p.id === 'bot_1'
              ? {
                  ...p,
                  score: botCorrect ? p.score + currentQ.points : p.score,
                  streak: botCorrect ? p.streak + 1 : 0,
                  answer: botAnswer,
                  answerTime: botTime
                }
              : p
          )
        }
      })
    }, 1000 + Math.random() * 2000)

    setIsAnswerRevealed(true)
  }, [room, timeLeft, isAnswerRevealed, currentPlayer.id])

  // 下一题
  const nextQuestion = useCallback(() => {
    if (!room) return

    const nextIndex = room.currentQuestion + 1

    if (nextIndex >= room.totalQuestions) {
      setRoom(prev => prev ? { ...prev, status: 'finished' } : null)
    } else {
      setRoom(prev => prev ? { ...prev, currentQuestion: nextIndex } : null)
      setTimeLeft(room.questions[nextIndex].timeLimit)
      setIsAnswerRevealed(false)
      setSelectedAnswer(null)
    }
  }, [room])

  // 倒计时
  useEffect(() => {
    if (!room || room.status !== 'playing' || isAnswerRevealed) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsAnswerRevealed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [room, isAnswerRevealed])

  return {
    room,
    currentPlayer,
    timeLeft,
    isAnswerRevealed,
    selectedAnswer,
    createRoom,
    startBattle,
    submitAnswer,
    nextQuestion
  }
}

// 模式选择
const ModeSelection: React.FC<{
  onSelect: (mode: BattleMode) => void
}> = ({ onSelect }) => {
  const modes = [
    { mode: 'guess_song' as const, icon: '🎵', label: '猜歌', desc: '听前奏猜歌曲' },
    { mode: 'quiz' as const, icon: '❓', label: '问答', desc: '音乐知识问答' },
    { mode: 'lyrics' as const, icon: '📝', label: '歌词', desc: '看歌词猜歌' },
    { mode: 'speed' as const, icon: '⚡', label: '极速', desc: '10秒快速答题' }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {modes.map(item => (
        <motion.button
          key={item.mode}
          onClick={() => onSelect(item.mode)}
          className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl
                   text-left hover:from-primary-500/20 hover:to-purple-500/20 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-4xl block mb-2">{item.icon}</span>
          <h4 className="text-white font-bold text-lg">{item.label}</h4>
          <p className="text-sm text-white/60">{item.desc}</p>
        </motion.button>
      ))}
    </div>
  )
}

// 等待室
const WaitingRoom: React.FC<{
  room: BattleRoom
  onStart: () => void
}> = ({ room, onStart }) => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-6">等待玩家...</h3>

      <div className="flex justify-center gap-8 mb-8">
        {room.players.map((player, index) => (
          <motion.div
            key={player.id}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500
                          flex items-center justify-center text-4xl mb-2">
              {player.avatar}
            </div>
            <p className="text-white font-medium">{player.name}</p>
            <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-yellow-400'}`}>
              {player.isReady ? '已准备' : '等待中'}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="text-white/60 mb-4">
        {room.totalQuestions} 道题目 · {room.mode === 'guess_song' ? '猜歌' : '问答'}模式
      </p>

      <button
        onClick={onStart}
        disabled={!room.players.every(p => p.isReady)}
        className="px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full
                 text-white font-bold disabled:opacity-50"
      >
        开始对战
      </button>
    </div>
  )
}

// 问题卡片
const QuestionCard: React.FC<{
  question: Question
  timeLeft: number
  selectedAnswer: string | null
  isRevealed: boolean
  onAnswer: (answer: string) => void
}> = ({ question, timeLeft, selectedAnswer, isRevealed, onAnswer }) => {
  const progress = (timeLeft / question.timeLimit) * 100

  return (
    <div className="space-y-6">
      {/* 计时器 */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            timeLeft > 5 ? 'bg-primary-500' : 'bg-red-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/60">剩余时间</span>
        <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* 问题 */}
      <div className="bg-white/5 rounded-2xl p-6">
        {question.type === 'audio' && (
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500
                       flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
            >
              <span className="text-4xl">🎵</span>
            </motion.div>
          </div>
        )}

        <h3 className="text-xl text-white font-medium text-center">
          {question.content}
        </h3>
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrect = option === question.correctAnswer
          const showResult = isRevealed

          let buttonClass = 'bg-white/10 hover:bg-white/20'
          if (showResult) {
            if (isCorrect) {
              buttonClass = 'bg-green-500'
            } else if (isSelected && !isCorrect) {
              buttonClass = 'bg-red-500'
            }
          } else if (isSelected) {
            buttonClass = 'bg-primary-500'
          }

          return (
            <motion.button
              key={option}
              onClick={() => !isRevealed && onAnswer(option)}
              disabled={isRevealed}
              className={`p-4 rounded-xl text-white font-medium transition-all ${buttonClass}`}
              whileHover={!isRevealed ? { scale: 1.02 } : undefined}
              whileTap={!isRevealed ? { scale: 0.98 } : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {option}
              {showResult && isCorrect && ' ✓'}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// 对战中状态
const BattleInProgress: React.FC<{
  room: BattleRoom
  currentPlayer: Player
  timeLeft: number
  isAnswerRevealed: boolean
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  onNext: () => void
}> = ({ room, currentPlayer, timeLeft, isAnswerRevealed, selectedAnswer, onAnswer, onNext }) => {
  const currentQuestion = room.questions[room.currentQuestion]
  const opponent = room.players.find(p => p.id !== currentPlayer.id)

  return (
    <div className="space-y-6">
      {/* 分数面板 */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
        <div className="text-center">
          <p className="text-white font-bold text-xl">{currentPlayer.score}</p>
          <p className="text-xs text-white/60">{currentPlayer.name}</p>
          {currentPlayer.streak > 1 && (
            <span className="text-xs text-yellow-400">🔥 {currentPlayer.streak}连击</span>
          )}
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">第 {room.currentQuestion + 1}/{room.totalQuestions} 题</p>
        </div>

        <div className="text-center">
          <p className="text-white font-bold text-xl">{opponent?.score || 0}</p>
          <p className="text-xs text-white/60">{opponent?.name}</p>
          {opponent && opponent.streak > 1 && (
            <span className="text-xs text-yellow-400">🔥 {opponent.streak}连击</span>
          )}
        </div>
      </div>

      {/* 问题卡片 */}
      <QuestionCard
        question={currentQuestion}
        timeLeft={timeLeft}
        selectedAnswer={selectedAnswer}
        isRevealed={isAnswerRevealed}
        onAnswer={onAnswer}
      />

      {/* 下一题按钮 */}
      {isAnswerRevealed && (
        <motion.button
          onClick={onNext}
          className="w-full py-3 bg-primary-500 rounded-xl text-white font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {room.currentQuestion + 1 >= room.totalQuestions ? '查看结果' : '下一题'}
        </motion.button>
      )}
    </div>
  )
}

// 结果页面
const BattleResult: React.FC<{
  room: BattleRoom
  currentPlayer: Player
  onPlayAgain: () => void
}> = ({ room, currentPlayer, onPlayAgain }) => {
  const opponent = room.players.find(p => p.id !== currentPlayer.id)
  const isWinner = currentPlayer.score > (opponent?.score || 0)
  const isDraw = currentPlayer.score === (opponent?.score || 0)

  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* 结果标题 */}
      <div className="text-6xl mb-4">
        {isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
      </div>
      <h2 className="text-3xl font-bold text-white">
        {isDraw ? '平局！' : isWinner ? '你赢了！' : '再接再厉！'}
      </h2>

      {/* 最终分数 */}
      <div className="flex items-center justify-center gap-8">
        <div className={`p-6 rounded-2xl ${isWinner ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
          <span className="text-4xl block mb-2">{currentPlayer.avatar}</span>
          <p className="text-white font-bold">{currentPlayer.name}</p>
          <p className="text-3xl font-bold text-primary-400">{currentPlayer.score}</p>
        </div>

        <span className="text-2xl text-white/40">VS</span>

        <div className={`p-6 rounded-2xl ${!isWinner && !isDraw ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
          <span className="text-4xl block mb-2">{opponent?.avatar}</span>
          <p className="text-white font-bold">{opponent?.name}</p>
          <p className="text-3xl font-bold text-primary-400">{opponent?.score}</p>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{room.totalQuestions}</p>
          <p className="text-xs text-white/60">总题数</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">
            {Math.round((currentPlayer.score / (room.totalQuestions * 150)) * 100)}%
          </p>
          <p className="text-xs text-white/60">正确率</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-400">{currentPlayer.streak}</p>
          <p className="text-xs text-white/60">最高连击</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-primary-500 rounded-full text-white font-bold"
        >
          再来一局
        </button>
        <button className="px-8 py-3 bg-white/10 rounded-full text-white">
          分享战绩
        </button>
      </div>
    </motion.div>
  )
}

// 主界面
interface MusicBattleProps {
  className?: string
}

export const MusicBattle: React.FC<MusicBattleProps> = ({ className }) => {
  const {
    room,
    currentPlayer,
    timeLeft,
    isAnswerRevealed,
    selectedAnswer,
    createRoom,
    startBattle,
    submitAnswer,
    nextQuestion
  } = useMusicBattle()

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      <AnimatePresence mode="wait">
        {!room ? (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-white">音乐对战</h3>
              <p className="text-sm text-white/40">选择对战模式</p>
            </div>
            <ModeSelection onSelect={createRoom} />
          </motion.div>
        ) : room.status === 'waiting' ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WaitingRoom room={room} onStart={startBattle} />
          </motion.div>
        ) : room.status === 'playing' ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BattleInProgress
              room={room}
              currentPlayer={currentPlayer}
              timeLeft={timeLeft}
              isAnswerRevealed={isAnswerRevealed}
              selectedAnswer={selectedAnswer}
              onAnswer={submitAnswer}
              onNext={nextQuestion}
            />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BattleResult
              room={room}
              currentPlayer={currentPlayer}
              onPlayAgain={() => createRoom(room.mode)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicBattle
