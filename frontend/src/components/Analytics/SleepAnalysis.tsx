import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 睡眠分析组件
 * 分析睡前听歌习惯和睡眠质量关联
 */

// 睡眠记录
interface SleepRecord {
  date: Date
  sleepTime: string     // 入睡时间
  wakeTime: string      // 醒来时间
  duration: number      // 睡眠时长 (分钟)
  quality: 1 | 2 | 3 | 4 | 5
  musicBeforeSleep: {
    tracks: { title: string; artist: string }[]
    duration: number    // 听歌时长
    genres: string[]
  }
  sleepScore: number    // 0-100
}

// 睡眠建议
interface SleepRecommendation {
  type: 'playlist' | 'habit' | 'time'
  icon: string
  title: string
  description: string
  action?: string
}

// 睡眠分析 Hook
export function useSleepAnalysis() {
  // 模拟睡眠数据
  const records = useMemo<SleepRecord[]>(() => {
    const data: SleepRecord[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const sleepHour = 22 + Math.floor(Math.random() * 3)
      const sleepMinute = Math.floor(Math.random() * 60)
      const duration = 360 + Math.floor(Math.random() * 180) // 6-9小时

      data.push({
        date,
        sleepTime: `${sleepHour}:${sleepMinute.toString().padStart(2, '0')}`,
        wakeTime: `${(sleepHour + Math.floor(duration / 60)) % 24}:${(sleepMinute + duration % 60) % 60}`.padStart(5, '0'),
        duration,
        quality: Math.ceil(Math.random() * 5) as 1 | 2 | 3 | 4 | 5,
        musicBeforeSleep: {
          tracks: [
            { title: '夜曲', artist: '周杰伦' },
            { title: '安静', artist: '周杰伦' }
          ],
          duration: 15 + Math.floor(Math.random() * 30),
          genres: ['轻音乐', '古典', '氛围']
        },
        sleepScore: 60 + Math.floor(Math.random() * 40)
      })
    }

    return data
  }, [])

  // 统计分析
  const stats = useMemo(() => {
    const avgDuration = records.reduce((acc, r) => acc + r.duration, 0) / records.length
    const avgQuality = records.reduce((acc, r) => acc + r.quality, 0) / records.length
    const avgSleepScore = records.reduce((acc, r) => acc + r.sleepScore, 0) / records.length

    // 分析音乐对睡眠的影响
    const musicListeners = records.filter(r => r.musicBeforeSleep.duration > 0)
    const avgScoreWithMusic = musicListeners.length > 0
      ? musicListeners.reduce((acc, r) => acc + r.sleepScore, 0) / musicListeners.length
      : 0

    // 最佳入睡时间
    const sleepTimes = records.map(r => {
      const [h, m] = r.sleepTime.split(':').map(Number)
      return h * 60 + m
    })
    const avgSleepTime = sleepTimes.reduce((a, b) => a + b, 0) / sleepTimes.length
    const bestSleepHour = Math.floor(avgSleepTime / 60)
    const bestSleepMinute = Math.floor(avgSleepTime % 60)

    return {
      avgDuration: Math.round(avgDuration),
      avgQuality: avgQuality.toFixed(1),
      avgSleepScore: Math.round(avgSleepScore),
      musicImpact: Math.round(avgScoreWithMusic - avgSleepScore),
      bestSleepTime: `${bestSleepHour}:${bestSleepMinute.toString().padStart(2, '0')}`,
      weeklyTrend: records.map(r => r.sleepScore)
    }
  }, [records])

  // 睡眠建议
  const recommendations: SleepRecommendation[] = [
    {
      type: 'playlist',
      icon: '🎵',
      title: '推荐睡前歌单',
      description: '基于你的数据，轻音乐和古典音乐最能帮助你入睡',
      action: '播放助眠歌单'
    },
    {
      type: 'time',
      icon: '⏰',
      title: '最佳入睡时间',
      description: `建议在 ${stats.bestSleepTime} 左右开始准备入睡`,
    },
    {
      type: 'habit',
      icon: '🌙',
      title: '睡前习惯',
      description: '睡前 30 分钟听舒缓音乐可以提升睡眠质量 15%'
    }
  ]

  // 助眠歌单
  const sleepPlaylists = [
    { id: '1', name: '深度睡眠', icon: '🌙', tracks: 25, duration: '1小时45分' },
    { id: '2', name: '自然白噪音', icon: '🌲', tracks: 15, duration: '2小时' },
    { id: '3', name: '钢琴轻音乐', icon: '🎹', tracks: 30, duration: '1小时30分' },
    { id: '4', name: '冥想放松', icon: '🧘', tracks: 12, duration: '45分钟' }
  ]

  return {
    records,
    stats,
    recommendations,
    sleepPlaylists
  }
}

// 睡眠评分环
const SleepScoreRing: React.FC<{
  score: number
  size?: number
}> = ({ score, size = 120 }) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#f43f5e'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* 进度环 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-white/60">睡眠评分</span>
      </div>
    </div>
  )
}

// 周睡眠图表
const WeeklySleepChart: React.FC<{
  records: SleepRecord[]
}> = ({ records }) => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const maxDuration = Math.max(...records.map(r => r.duration))

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {records.map((record, index) => {
        const height = (record.duration / maxDuration) * 100
        const dayOfWeek = record.date.getDay()

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-purple-500"
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
            <span className="text-xs text-white/40">{days[dayOfWeek]}</span>
          </div>
        )
      })}
    </div>
  )
}

// 睡眠时间可视化
const SleepTimeVisual: React.FC<{
  sleepTime: string
  wakeTime: string
  duration: number
}> = ({ sleepTime, wakeTime, duration }) => {
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const sleepMinutes = parseTime(sleepTime)
  const wakeMinutes = parseTime(wakeTime)

  // 计算在 24 小时圆环上的位置
  const sleepAngle = (sleepMinutes / (24 * 60)) * 360 - 90
  const wakeAngle = (wakeMinutes / (24 * 60)) * 360 - 90

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <div className="flex items-center gap-6">
      {/* 时钟可视化 */}
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 背景圆环 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* 睡眠弧 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#sleepGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(duration / (24 * 60)) * 283} 283`}
            transform={`rotate(${sleepAngle} 50 50)`}
          />
          <defs>
            <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">😴</span>
        </div>
      </div>

      {/* 时间信息 */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs text-white/40">入睡</span>
            <p className="text-lg font-mono text-white">{sleepTime}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/40">醒来</span>
            <p className="text-lg font-mono text-white">{wakeTime}</p>
          </div>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-primary-400">{hours}小时{minutes}分</span>
        </div>
      </div>
    </div>
  )
}

// 主界面
interface SleepAnalysisProps {
  className?: string
}

export const SleepAnalysis: React.FC<SleepAnalysisProps> = ({ className }) => {
  const { records, stats, recommendations, sleepPlaylists } = useSleepAnalysis()
  const [selectedDate, setSelectedDate] = useState(0) // 索引

  const currentRecord = records[records.length - 1 - selectedDate]

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">睡眠分析</h3>
          <p className="text-sm text-white/40">音乐与睡眠的关系</p>
        </div>
        <SleepScoreRing score={stats.avgSleepScore} size={80} />
      </div>

      {/* 日期选择 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {records.slice().reverse().map((record, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
              selectedDate === index
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {index === 0 ? '今天' : index === 1 ? '昨天' : record.date.toLocaleDateString('zh-CN', { weekday: 'short' })}
          </button>
        ))}
      </div>

      {/* 当天睡眠详情 */}
      {currentRecord && (
        <div className="bg-dark-800 rounded-xl p-4 mb-6">
          <SleepTimeVisual
            sleepTime={currentRecord.sleepTime}
            wakeTime={currentRecord.wakeTime}
            duration={currentRecord.duration}
          />

          {/* 睡前音乐 */}
          {currentRecord.musicBeforeSleep.duration > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎵</span>
                <span className="text-sm text-white/60">
                  睡前听了 {currentRecord.musicBeforeSleep.duration} 分钟音乐
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentRecord.musicBeforeSleep.genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 周统计 */}
      <div className="bg-dark-800 rounded-xl p-4 mb-6">
        <h4 className="text-white font-medium mb-4">本周睡眠时长</h4>
        <WeeklySleepChart records={records} />

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {Math.floor(stats.avgDuration / 60)}h{stats.avgDuration % 60}m
            </p>
            <p className="text-xs text-white/40">平均时长</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.avgQuality}</p>
            <p className="text-xs text-white/40">平均质量</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              stats.musicImpact >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.musicImpact >= 0 ? '+' : ''}{stats.musicImpact}%
            </p>
            <p className="text-xs text-white/40">音乐提升</p>
          </div>
        </div>
      </div>

      {/* 助眠歌单 */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">助眠歌单</h4>
        <div className="grid grid-cols-2 gap-3">
          {sleepPlaylists.map(playlist => (
            <motion.div
              key={playlist.id}
              className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">{playlist.icon}</div>
              <h5 className="text-white font-medium">{playlist.name}</h5>
              <p className="text-xs text-white/40">
                {playlist.tracks} 首 · {playlist.duration}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 建议 */}
      <div className="space-y-3">
        <h4 className="text-white font-medium">睡眠建议</h4>
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            className="p-4 bg-white/5 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-2xl">{rec.icon}</span>
            <div className="flex-1">
              <h5 className="text-white font-medium">{rec.title}</h5>
              <p className="text-sm text-white/60">{rec.description}</p>
            </div>
            {rec.action && (
              <button className="px-3 py-1 bg-primary-500 rounded-lg text-sm text-white">
                {rec.action}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SleepAnalysis
