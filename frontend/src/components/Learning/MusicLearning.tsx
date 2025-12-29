import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐学习组件
 * 乐器教学、乐理课程、听力训练
 */

// 学习类别
type LearningCategory = 'instrument' | 'theory' | 'ear_training' | 'rhythm'

// 乐器类型
type InstrumentType = 'piano' | 'guitar' | 'drums' | 'bass' | 'violin' | 'ukulele'

// 课程
interface Course {
  id: string
  title: string
  description: string
  category: LearningCategory
  instrument?: InstrumentType
  level: 'beginner' | 'intermediate' | 'advanced'
  lessons: Lesson[]
  progress: number
  duration: number
  thumbnail: string
}

// 课时
interface Lesson {
  id: string
  title: string
  duration: number
  type: 'video' | 'practice' | 'quiz'
  completed: boolean
  content: any
}

// 练习题
interface Exercise {
  id: string
  type: 'interval' | 'chord' | 'scale' | 'rhythm' | 'melody'
  question: string
  options: string[]
  correctAnswer: string
  audio?: string
}

// 用户进度
interface UserProgress {
  totalXP: number
  level: number
  streak: number
  coursesCompleted: number
  exercisesCompleted: number
  accuracy: number
}

// 音乐学习 Hook
export function useMusicLearning() {
  const [courses, setCourses] = useState<Course[]>([])
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXP: 2450,
    level: 12,
    streak: 7,
    coursesCompleted: 3,
    exercisesCompleted: 156,
    accuracy: 85
  })
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [exerciseResult, setExerciseResult] = useState<'correct' | 'incorrect' | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)

  // 初始化
  useEffect(() => {
    audioContextRef.current = new AudioContext()

    // 模拟课程数据
    const mockCourses: Course[] = [
      {
        id: 'c1',
        title: '钢琴入门基础',
        description: '从零开始学习钢琴，掌握基本指法和简单曲目',
        category: 'instrument',
        instrument: 'piano',
        level: 'beginner',
        lessons: [
          { id: 'l1', title: '认识钢琴键盘', duration: 10, type: 'video', completed: true, content: {} },
          { id: 'l2', title: '基本坐姿与手型', duration: 8, type: 'video', completed: true, content: {} },
          { id: 'l3', title: '右手五指练习', duration: 15, type: 'practice', completed: false, content: {} },
          { id: 'l4', title: '简单音阶练习', duration: 12, type: 'practice', completed: false, content: {} }
        ],
        progress: 50,
        duration: 180,
        thumbnail: '🎹'
      },
      {
        id: 'c2',
        title: '吉他弹唱入门',
        description: '学会基础和弦，开始你的弹唱之旅',
        category: 'instrument',
        instrument: 'guitar',
        level: 'beginner',
        lessons: [
          { id: 'l1', title: '吉他构造与调弦', duration: 12, type: 'video', completed: true, content: {} },
          { id: 'l2', title: 'C和弦练习', duration: 15, type: 'practice', completed: false, content: {} },
          { id: 'l3', title: 'G和弦练习', duration: 15, type: 'practice', completed: false, content: {} }
        ],
        progress: 33,
        duration: 240,
        thumbnail: '🎸'
      },
      {
        id: 'c3',
        title: '乐理基础',
        description: '音符、节拍、调式等基础乐理知识',
        category: 'theory',
        level: 'beginner',
        lessons: [
          { id: 'l1', title: '音符与时值', duration: 10, type: 'video', completed: true, content: {} },
          { id: 'l2', title: '拍号与节拍', duration: 10, type: 'video', completed: true, content: {} },
          { id: 'l3', title: '音程基础', duration: 15, type: 'video', completed: false, content: {} },
          { id: 'l4', title: '乐理测验', duration: 10, type: 'quiz', completed: false, content: {} }
        ],
        progress: 50,
        duration: 120,
        thumbnail: '📚'
      },
      {
        id: 'c4',
        title: '听力训练',
        description: '提升音乐听觉，识别音程、和弦、节奏',
        category: 'ear_training',
        level: 'beginner',
        lessons: [
          { id: 'l1', title: '单音听辨', duration: 10, type: 'practice', completed: false, content: {} },
          { id: 'l2', title: '音程听辨', duration: 15, type: 'practice', completed: false, content: {} },
          { id: 'l3', title: '和弦听辨', duration: 15, type: 'practice', completed: false, content: {} }
        ],
        progress: 0,
        duration: 90,
        thumbnail: '👂'
      }
    ]

    setCourses(mockCourses)

    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  // 播放音符
  const playNote = useCallback((frequency: number, duration = 0.5) => {
    if (!audioContextRef.current) return

    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()

    osc.frequency.value = frequency
    osc.type = 'sine'

    gain.gain.value = 0.3
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    osc.connect(gain)
    gain.connect(audioContextRef.current.destination)

    osc.start()
    osc.stop(audioContextRef.current.currentTime + duration)
  }, [])

  // 开始练习
  const startExercise = useCallback((type: Exercise['type']) => {
    const exercises: Record<string, Exercise> = {
      interval: {
        id: 'ex1',
        type: 'interval',
        question: '听辨这个音程',
        options: ['大二度', '小三度', '纯四度', '纯五度'],
        correctAnswer: '小三度'
      },
      chord: {
        id: 'ex2',
        type: 'chord',
        question: '这是什么类型的和弦？',
        options: ['大三和弦', '小三和弦', '减三和弦', '增三和弦'],
        correctAnswer: '大三和弦'
      },
      rhythm: {
        id: 'ex3',
        type: 'rhythm',
        question: '选择正确的节奏型',
        options: ['♩ ♩ ♩ ♩', '♩ ♫ ♩ ♫', '♫ ♫ ♩ ♩', '♩ ♩ ♫ ♫'],
        correctAnswer: '♩ ♫ ♩ ♫'
      }
    }

    setCurrentExercise(exercises[type] || exercises.interval)
    setExerciseResult(null)
  }, [])

  // 提交答案
  const submitAnswer = useCallback((answer: string) => {
    if (!currentExercise) return

    const isCorrect = answer === currentExercise.correctAnswer
    setExerciseResult(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      setUserProgress(prev => ({
        ...prev,
        totalXP: prev.totalXP + 10,
        exercisesCompleted: prev.exercisesCompleted + 1
      }))
    }
  }, [currentExercise])

  // 完成课时
  const completeLesson = useCallback((lessonId: string) => {
    if (!currentCourse) return

    setCourses(prev => prev.map(course => {
      if (course.id === currentCourse.id) {
        const updatedLessons = course.lessons.map(l =>
          l.id === lessonId ? { ...l, completed: true } : l
        )
        const completedCount = updatedLessons.filter(l => l.completed).length
        return {
          ...course,
          lessons: updatedLessons,
          progress: Math.round((completedCount / course.lessons.length) * 100)
        }
      }
      return course
    }))

    setUserProgress(prev => ({
      ...prev,
      totalXP: prev.totalXP + 50
    }))
  }, [currentCourse])

  return {
    courses,
    currentCourse,
    setCurrentCourse,
    currentLesson,
    setCurrentLesson,
    userProgress,
    currentExercise,
    exerciseResult,
    startExercise,
    submitAnswer,
    completeLesson,
    playNote
  }
}

// 进度卡片
const ProgressCard: React.FC<{
  progress: UserProgress
}> = ({ progress }) => {
  const xpForNextLevel = 500
  const currentLevelXP = progress.totalXP % xpForNextLevel
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100

  return (
    <div className="bg-gradient-to-br from-primary-500/30 to-purple-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center
                        text-white font-bold text-lg">
            {progress.level}
          </div>
          <div>
            <p className="text-white font-medium">等级 {progress.level}</p>
            <p className="text-sm text-white/60">{currentLevelXP} / {xpForNextLevel} XP</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full">
          <span>🔥</span>
          <span className="text-orange-400 font-medium">{progress.streak}</span>
          <span className="text-orange-400/60 text-sm">天</span>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{progress.coursesCompleted}</p>
          <p className="text-xs text-white/40">已完成课程</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">{progress.exercisesCompleted}</p>
          <p className="text-xs text-white/40">练习题</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">{progress.accuracy}%</p>
          <p className="text-xs text-white/40">正确率</p>
        </div>
      </div>
    </div>
  )
}

// 课程卡片
const CourseCard: React.FC<{
  course: Course
  onClick: () => void
}> = ({ course, onClick }) => {
  const levelColors = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400'
  }

  const levelLabels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  }

  return (
    <motion.div
      className="bg-dark-800 rounded-xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{course.thumbnail}</div>
          <div className="flex-1">
            <h4 className="text-white font-medium">{course.title}</h4>
            <p className="text-sm text-white/40 line-clamp-2">{course.description}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs ${levelColors[course.level]}`}>
                {levelLabels[course.level]}
              </span>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/40">{course.lessons.length} 课时</span>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/40">{course.duration} 分钟</span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/40">进度</span>
            <span className="text-primary-400">{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 课程详情
const CourseDetail: React.FC<{
  course: Course
  onLessonSelect: (lesson: Lesson) => void
  onBack: () => void
}> = ({ course, onLessonSelect, onBack }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white"
      >
        ← 返回
      </button>

      <div className="flex items-center gap-4">
        <span className="text-5xl">{course.thumbnail}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{course.title}</h3>
          <p className="text-white/60">{course.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-white font-medium">课时列表</h4>
        {course.lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            className={`p-4 rounded-xl flex items-center justify-between cursor-pointer ${
              lesson.completed ? 'bg-green-500/10' : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => onLessonSelect(lesson)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                lesson.completed ? 'bg-green-500' : 'bg-white/10'
              }`}>
                {lesson.completed ? '✓' : index + 1}
              </div>
              <div>
                <p className="text-white">{lesson.title}</p>
                <p className="text-xs text-white/40">
                  {lesson.type === 'video' ? '📹 视频' :
                   lesson.type === 'practice' ? '🎯 练习' : '❓ 测验'}
                  · {lesson.duration} 分钟
                </p>
              </div>
            </div>

            {!lesson.completed && (
              <span className="text-primary-400 text-sm">开始学习 →</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 听力训练
const EarTrainingExercise: React.FC<{
  exercise: Exercise
  onAnswer: (answer: string) => void
  result: 'correct' | 'incorrect' | null
  onPlaySound: () => void
  onNext: () => void
}> = ({ exercise, onAnswer, result, onPlaySound, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-bold text-white mb-2">{exercise.question}</h4>

        <button
          onClick={onPlaySound}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500
                   flex items-center justify-center mx-auto"
        >
          <span className="text-3xl">🔊</span>
        </button>
        <p className="text-white/40 text-sm mt-2">点击播放</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option, index) => {
          let buttonClass = 'bg-white/10 hover:bg-white/20'

          if (result) {
            if (option === exercise.correctAnswer) {
              buttonClass = 'bg-green-500'
            } else if (result === 'incorrect') {
              buttonClass = 'bg-red-500/20'
            }
          }

          return (
            <motion.button
              key={option}
              onClick={() => !result && onAnswer(option)}
              disabled={!!result}
              className={`p-4 rounded-xl text-white font-medium transition-all ${buttonClass}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className={`text-xl font-bold mb-4 ${
            result === 'correct' ? 'text-green-400' : 'text-red-400'
          }`}>
            {result === 'correct' ? '🎉 正确！+10 XP' : '❌ 错误'}
          </p>

          <button
            onClick={onNext}
            className="px-6 py-2 bg-primary-500 rounded-lg text-white"
          >
            下一题
          </button>
        </motion.div>
      )}
    </div>
  )
}

// 钢琴练习
const PianoPractice: React.FC<{
  onNotePlay: (frequency: number) => void
}> = ({ onNotePlay }) => {
  const whiteKeys = [
    { note: 'C', freq: 261.63 },
    { note: 'D', freq: 293.66 },
    { note: 'E', freq: 329.63 },
    { note: 'F', freq: 349.23 },
    { note: 'G', freq: 392.00 },
    { note: 'A', freq: 440.00 },
    { note: 'B', freq: 493.88 }
  ]

  const blackKeys = [
    { note: 'C#', freq: 277.18, position: 1 },
    { note: 'D#', freq: 311.13, position: 2 },
    { note: 'F#', freq: 369.99, position: 4 },
    { note: 'G#', freq: 415.30, position: 5 },
    { note: 'A#', freq: 466.16, position: 6 }
  ]

  return (
    <div className="relative h-48">
      {/* 白键 */}
      <div className="flex h-full">
        {whiteKeys.map((key, index) => (
          <motion.button
            key={key.note}
            onClick={() => onNotePlay(key.freq)}
            className="flex-1 bg-white rounded-b-lg border-r border-gray-200
                     flex items-end justify-center pb-2"
            whileTap={{ backgroundColor: '#e0e0e0' }}
          >
            <span className="text-gray-600 text-sm">{key.note}</span>
          </motion.button>
        ))}
      </div>

      {/* 黑键 */}
      {blackKeys.map((key) => (
        <motion.button
          key={key.note}
          onClick={() => onNotePlay(key.freq)}
          className="absolute top-0 w-[10%] h-[60%] bg-gray-900 rounded-b-lg z-10"
          style={{
            left: `${(key.position / 7) * 100 - 5}%`
          }}
          whileTap={{ backgroundColor: '#333' }}
        />
      ))}
    </div>
  )
}

// 主界面
interface MusicLearningProps {
  className?: string
}

export const MusicLearning: React.FC<MusicLearningProps> = ({ className }) => {
  const {
    courses,
    currentCourse,
    setCurrentCourse,
    userProgress,
    currentExercise,
    exerciseResult,
    startExercise,
    submitAnswer,
    playNote
  } = useMusicLearning()

  const [activeTab, setActiveTab] = useState<'courses' | 'practice' | 'piano'>('courses')

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">音乐学习</h3>
      </div>

      {/* 进度卡片 */}
      <ProgressCard progress={userProgress} />

      {/* 标签页 */}
      <div className="flex gap-2 mt-6 mb-4">
        {[
          { key: 'courses', label: '课程' },
          { key: 'practice', label: '练习' },
          { key: 'piano', label: '钢琴' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {currentCourse ? (
              <CourseDetail
                course={currentCourse}
                onLessonSelect={() => {}}
                onBack={() => setCurrentCourse(null)}
              />
            ) : (
              <div className="space-y-3">
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={() => setCurrentCourse(course)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {currentExercise ? (
              <EarTrainingExercise
                exercise={currentExercise}
                onAnswer={submitAnswer}
                result={exerciseResult}
                onPlaySound={() => playNote(440, 0.5)}
                onNext={() => startExercise(currentExercise.type)}
              />
            ) : (
              <div className="space-y-3">
                {[
                  { type: 'interval', icon: '🎵', label: '音程训练', desc: '听辨各种音程' },
                  { type: 'chord', icon: '🎹', label: '和弦训练', desc: '识别和弦类型' },
                  { type: 'rhythm', icon: '🥁', label: '节奏训练', desc: '节奏型辨识' }
                ].map(item => (
                  <motion.button
                    key={item.type}
                    onClick={() => startExercise(item.type as Exercise['type'])}
                    className="w-full p-4 bg-dark-800 rounded-xl flex items-center gap-4
                             hover:bg-dark-700 transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div className="text-left">
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-white/40">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'piano' && (
          <motion.div
            key="piano"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-center text-white/60 text-sm">点击琴键练习</p>
            <PianoPractice onNotePlay={playNote} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicLearning
