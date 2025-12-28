import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 情绪日记组件
 * 通过音乐记录和分析情绪变化
 */

// 情绪类型
type MoodType = 'happy' | 'sad' | 'energetic' | 'calm' | 'anxious' | 'nostalgic' | 'romantic' | 'angry'

// 情绪记录
interface MoodEntry {
  id: string
  date: Date
  mood: MoodType
  intensity: number // 1-5
  tracks: {
    title: string
    artist: string
    artwork: string
  }[]
  note?: string
  weather?: string
  activity?: string
}

// 情绪统计
interface MoodStats {
  dominantMood: MoodType
  moodDistribution: { mood: MoodType; count: number; percentage: number }[]
  averageIntensity: number
  streak: number // 连续记录天数
  insights: string[]
}

// 情绪配置
const MOOD_CONFIG: Record<MoodType, { icon: string; label: string; color: string; gradient: string }> = {
  happy: { icon: '😊', label: '开心', color: '#fbbf24', gradient: 'from-yellow-400 to-orange-400' },
  sad: { icon: '😢', label: '悲伤', color: '#60a5fa', gradient: 'from-blue-400 to-indigo-400' },
  energetic: { icon: '⚡', label: '兴奋', color: '#f43f5e', gradient: 'from-red-400 to-pink-400' },
  calm: { icon: '😌', label: '平静', color: '#10b981', gradient: 'from-green-400 to-teal-400' },
  anxious: { icon: '😰', label: '焦虑', color: '#8b5cf6', gradient: 'from-purple-400 to-violet-400' },
  nostalgic: { icon: '🥺', label: '怀旧', color: '#f59e0b', gradient: 'from-amber-400 to-yellow-400' },
  romantic: { icon: '💕', label: '浪漫', color: '#ec4899', gradient: 'from-pink-400 to-rose-400' },
  angry: { icon: '😤', label: '愤怒', color: '#ef4444', gradient: 'from-red-500 to-orange-500' }
}

// 情绪日记 Hook
export function useMoodDiary() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null)
  const [intensity, setIntensity] = useState(3)

  // 模拟历史数据
  useEffect(() => {
    const mockEntries: MoodEntry[] = []
    const moods: MoodType[] = ['happy', 'sad', 'energetic', 'calm', 'anxious', 'nostalgic', 'romantic']

    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      mockEntries.push({
        id: `entry_${i}`,
        date,
        mood: moods[Math.floor(Math.random() * moods.length)],
        intensity: Math.floor(Math.random() * 5) + 1,
        tracks: [
          { title: '晴天', artist: '周杰伦', artwork: '/api/placeholder/50/50' },
          { title: '七里香', artist: '周杰伦', artwork: '/api/placeholder/50/50' }
        ],
        weather: ['☀️', '🌤️', '⛅', '🌧️', '❄️'][Math.floor(Math.random() * 5)],
        activity: ['🏃', '💼', '🏠', '🎮', '📚'][Math.floor(Math.random() * 5)]
      })
    }

    setEntries(mockEntries)
  }, [])

  // 计算统计
  const stats = useMemo<MoodStats>(() => {
    if (entries.length === 0) {
      return {
        dominantMood: 'calm',
        moodDistribution: [],
        averageIntensity: 0,
        streak: 0,
        insights: []
      }
    }

    // 情绪分布
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<MoodType, number>)

    const distribution = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood: mood as MoodType,
        count,
        percentage: Math.round((count / entries.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // 主导情绪
    const dominantMood = distribution[0]?.mood || 'calm'

    // 平均强度
    const averageIntensity = entries.reduce((acc, e) => acc + e.intensity, 0) / entries.length

    // 连续天数
    let streak = 0
    const today = new Date()
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[entries.length - 1 - i].date)
      const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === i) {
        streak++
      } else {
        break
      }
    }

    // 洞察
    const insights = [
      `你最近 30 天的主导情绪是${MOOD_CONFIG[dominantMood].label}`,
      `你的情绪强度平均为 ${averageIntensity.toFixed(1)}/5`,
      streak > 7 ? `太棒了！你已经连续记录 ${streak} 天` : '坚持记录，发现情绪规律'
    ]

    return {
      dominantMood,
      moodDistribution: distribution,
      averageIntensity,
      streak,
      insights
    }
  }, [entries])

  // 添加记录
  const addEntry = (mood: MoodType, intensity: number, note?: string) => {
    const newEntry: MoodEntry = {
      id: `entry_${Date.now()}`,
      date: new Date(),
      mood,
      intensity,
      tracks: [],
      note
    }
    setEntries(prev => [...prev, newEntry])
  }

  // 获取某天的记录
  const getEntryByDate = (date: Date): MoodEntry | undefined => {
    return entries.find(e =>
      e.date.toDateString() === date.toDateString()
    )
  }

  return {
    entries,
    stats,
    currentMood,
    setCurrentMood,
    intensity,
    setIntensity,
    addEntry,
    getEntryByDate
  }
}

// 情绪选择器
const MoodSelector: React.FC<{
  selected: MoodType | null
  onSelect: (mood: MoodType) => void
}> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {(Object.entries(MOOD_CONFIG) as [MoodType, typeof MOOD_CONFIG[MoodType]][]).map(([mood, config]) => (
        <motion.button
          key={mood}
          onClick={() => onSelect(mood)}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            selected === mood
              ? `bg-gradient-to-br ${config.gradient} text-white`
              : 'bg-white/5 hover:bg-white/10'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl">{config.icon}</span>
          <span className="text-sm">{config.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

// 强度选择器
const IntensitySelector: React.FC<{
  value: number
  onChange: (value: number) => void
  mood: MoodType | null
}> = ({ value, onChange, mood }) => {
  const config = mood ? MOOD_CONFIG[mood] : null

  return (
    <div className="flex items-center justify-center gap-4">
      {[1, 2, 3, 4, 5].map(level => (
        <motion.button
          key={level}
          onClick={() => onChange(level)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg
                    transition-all ${
                      level <= value
                        ? `bg-gradient-to-br ${config?.gradient || 'from-gray-400 to-gray-500'} text-white`
                        : 'bg-white/10 text-white/40'
                    }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {level}
        </motion.button>
      ))}
    </div>
  )
}

// 日历热力图
const MoodCalendar: React.FC<{
  entries: MoodEntry[]
  onDateClick: (date: Date) => void
}> = ({ entries, onDateClick }) => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 34) // 5 周

  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  for (let i = 0; i < 35; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    currentWeek.push(date)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  const getEntryForDate = (date: Date) => {
    return entries.find(e =>
      e.date.toDateString() === date.toDateString()
    )
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="space-y-2">
      {/* 星期标题 */}
      <div className="flex gap-1">
        {weekDays.map(day => (
          <div key={day} className="w-10 h-6 flex items-center justify-center text-xs text-white/40">
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex gap-1">
          {week.map((date, dayIndex) => {
            const entry = getEntryForDate(date)
            const isToday = date.toDateString() === today.toDateString()
            const isFuture = date > today
            const config = entry ? MOOD_CONFIG[entry.mood] : null

            return (
              <motion.button
                key={dayIndex}
                onClick={() => !isFuture && onDateClick(date)}
                disabled={isFuture}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs
                          transition-all ${
                            isFuture
                              ? 'bg-white/5 text-white/20 cursor-not-allowed'
                              : entry
                              ? `bg-gradient-to-br ${config?.gradient}`
                              : 'bg-white/10 hover:bg-white/20'
                          } ${isToday ? 'ring-2 ring-white/50' : ''}`}
                whileHover={!isFuture ? { scale: 1.1 } : undefined}
              >
                {entry ? config?.icon : date.getDate()}
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// 情绪分布图
const MoodDistributionChart: React.FC<{
  distribution: MoodStats['moodDistribution']
}> = ({ distribution }) => {
  return (
    <div className="space-y-3">
      {distribution.slice(0, 5).map((item, index) => {
        const config = MOOD_CONFIG[item.mood]

        return (
          <div key={item.mood} className="flex items-center gap-3">
            <span className="text-2xl w-10">{config.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{config.label}</span>
                <span className="text-sm text-white/60">{item.percentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 情绪趋势图
const MoodTrendChart: React.FC<{
  entries: MoodEntry[]
}> = ({ entries }) => {
  const recentEntries = entries.slice(-14) // 最近 14 天

  const moodToValue: Record<MoodType, number> = {
    happy: 5,
    energetic: 4,
    romantic: 4,
    calm: 3,
    nostalgic: 2,
    anxious: 2,
    sad: 1,
    angry: 1
  }

  const points = recentEntries.map((entry, index) => ({
    x: (index / (recentEntries.length - 1)) * 100,
    y: 100 - (moodToValue[entry.mood] / 5) * 100,
    mood: entry.mood
  }))

  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : ''

  return (
    <div className="h-32 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 背景线 */}
        {[20, 40, 60, 80].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />
        ))}

        {/* 趋势线 */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#trendGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* 数据点 */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={MOOD_CONFIG[point.mood].color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </svg>

      {/* Y 轴标签 */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-white/40">
        <span>😊</span>
        <span>😐</span>
        <span>😢</span>
      </div>
    </div>
  )
}

// 主界面
interface MoodDiaryProps {
  className?: string
}

export const MoodDiary: React.FC<MoodDiaryProps> = ({ className }) => {
  const {
    entries,
    stats,
    currentMood,
    setCurrentMood,
    intensity,
    setIntensity,
    addEntry
  } = useMoodDiary()

  const [activeTab, setActiveTab] = useState<'record' | 'calendar' | 'stats'>('record')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleSave = () => {
    if (currentMood) {
      addEntry(currentMood, intensity, note)
      setCurrentMood(null)
      setIntensity(3)
      setNote('')
    }
  }

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">情绪日记</h3>
          <p className="text-sm text-white/40">
            🔥 连续记录 {stats.streak} 天
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{MOOD_CONFIG[stats.dominantMood].icon}</span>
          <span className="text-sm text-white/60">主导情绪</span>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'record', label: '记录' },
          { key: 'calendar', label: '日历' },
          { key: 'stats', label: '统计' }
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
        {activeTab === 'record' && (
          <motion.div
            key="record"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 今日问候 */}
            <div className="text-center mb-6">
              <p className="text-white/60 mb-2">今天感觉怎么样？</p>
              <p className="text-2xl">
                {new Date().toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>

            {/* 情绪选择 */}
            <MoodSelector selected={currentMood} onSelect={setCurrentMood} />

            {/* 强度选择 */}
            {currentMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <p className="text-center text-white/60">这种感觉有多强烈？</p>
                <IntensitySelector
                  value={intensity}
                  onChange={setIntensity}
                  mood={currentMood}
                />

                {/* 备注 */}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="写点什么... (可选)"
                  className="w-full h-24 bg-white/5 rounded-xl p-4 text-white
                           placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                />

                {/* 保存按钮 */}
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500
                           rounded-xl text-white font-medium"
                >
                  保存今天的心情
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MoodCalendar
              entries={entries}
              onDateClick={setSelectedDate}
            />

            {/* 选中日期详情 */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-white/5 rounded-xl"
              >
                <p className="text-white/60 text-sm mb-2">
                  {selectedDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {entries.find(e => e.date.toDateString() === selectedDate.toDateString()) ? (
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {MOOD_CONFIG[entries.find(e => e.date.toDateString() === selectedDate.toDateString())!.mood].icon}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {MOOD_CONFIG[entries.find(e => e.date.toDateString() === selectedDate.toDateString())!.mood].label}
                      </p>
                      <p className="text-sm text-white/40">
                        强度: {entries.find(e => e.date.toDateString() === selectedDate.toDateString())!.intensity}/5
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40">这天没有记录</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 趋势图 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">情绪趋势 (近 14 天)</h4>
              <MoodTrendChart entries={entries} />
            </div>

            {/* 分布图 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">情绪分布</h4>
              <MoodDistributionChart distribution={stats.moodDistribution} />
            </div>

            {/* 洞察 */}
            <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">💡 洞察</h4>
              <ul className="space-y-2">
                {stats.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-white/80">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodDiary
