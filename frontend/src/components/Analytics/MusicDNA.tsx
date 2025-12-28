import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐DNA分析组件
 * 深度分析用户的音乐品味和听歌习惯
 */

// DNA 特征
interface DNATraits {
  // 音乐性格
  personality: {
    adventurous: number    // 探索性 (0-100)
    nostalgic: number      // 怀旧度
    mainstream: number     // 主流度
    eclectic: number       // 多元化
    loyal: number          // 忠诚度 (重复播放)
  }

  // 情感倾向
  emotional: {
    energy: number         // 能量
    valence: number        // 正面情绪
    danceability: number   // 舞曲性
    acousticness: number   // 原声感
    intensity: number      // 强度
  }

  // 听歌时段
  timePatterns: {
    morning: number        // 早晨 6-12
    afternoon: number      // 下午 12-18
    evening: number        // 傍晚 18-22
    night: number          // 深夜 22-6
    weekday: number        // 工作日
    weekend: number        // 周末
  }

  // 流派分布
  genres: { name: string; percentage: number; trend: 'up' | 'down' | 'stable' }[]

  // 艺人多样性
  artistDiversity: {
    totalArtists: number
    topArtistPercentage: number
    newArtistsThisMonth: number
  }

  // 时代偏好
  eraTaste: {
    era: string
    percentage: number
  }[]
}

// 洞察
interface Insight {
  id: string
  type: 'discovery' | 'habit' | 'recommendation' | 'milestone'
  icon: string
  title: string
  description: string
  data?: any
}

// DNA 分析 Hook
export function useMusicDNA() {
  const [traits, setTraits] = useState<DNATraits>({
    personality: {
      adventurous: 72,
      nostalgic: 45,
      mainstream: 58,
      eclectic: 83,
      loyal: 67
    },
    emotional: {
      energy: 68,
      valence: 72,
      danceability: 55,
      acousticness: 42,
      intensity: 61
    },
    timePatterns: {
      morning: 15,
      afternoon: 25,
      evening: 40,
      night: 20,
      weekday: 55,
      weekend: 45
    },
    genres: [
      { name: '流行', percentage: 32, trend: 'stable' },
      { name: '摇滚', percentage: 22, trend: 'up' },
      { name: '电子', percentage: 18, trend: 'up' },
      { name: 'R&B', percentage: 15, trend: 'down' },
      { name: '古典', percentage: 8, trend: 'stable' },
      { name: '爵士', percentage: 5, trend: 'up' }
    ],
    artistDiversity: {
      totalArtists: 287,
      topArtistPercentage: 18,
      newArtistsThisMonth: 23
    },
    eraTaste: [
      { era: '2020s', percentage: 35 },
      { era: '2010s', percentage: 28 },
      { era: '2000s', percentage: 20 },
      { era: '1990s', percentage: 12 },
      { era: '更早', percentage: 5 }
    ]
  })

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'discovery',
      icon: '🔍',
      title: '音乐探索者',
      description: '你本月发现了 23 位新艺人，比上月增加 35%！'
    },
    {
      id: '2',
      type: 'habit',
      icon: '🌙',
      title: '夜猫子',
      description: '你的黄金听歌时间是晚上 8-10 点，这时你最常听放松的音乐'
    },
    {
      id: '3',
      type: 'recommendation',
      icon: '✨',
      title: '品味匹配',
      description: '基于你的 DNA，我们发现你可能喜欢独立摇滚风格'
    },
    {
      id: '4',
      type: 'milestone',
      icon: '🎯',
      title: '里程碑',
      description: '你已经累计听了 1,000 小时音乐！'
    }
  ])

  const [musicPersona, setMusicPersona] = useState({
    name: '音乐探险家',
    description: '你有着开放的音乐品味，喜欢探索新的音乐风格，同时也保持着对经典的热爱。',
    traits: ['开放', '多元', '感性', '夜行者'],
    matchPercentage: 87
  })

  return {
    traits,
    insights,
    musicPersona
  }
}

// DNA 螺旋可视化
const DNAHelix: React.FC<{
  traits: DNATraits
}> = ({ traits }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    let animationId: number
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const amplitude = 40
      const frequency = 0.05
      const helixSpacing = 10

      // 绘制双螺旋
      for (let y = 0; y < height; y += 4) {
        const offset = Math.sin(y * frequency + phase) * amplitude

        // 左螺旋
        const leftX = centerX - 30 + offset
        const rightX = centerX + 30 - offset

        // 颜色基于特征值
        const colorIndex = Math.floor(y / height * 5)
        const colors = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4']
        const color = colors[colorIndex] || colors[0]

        ctx.beginPath()
        ctx.arc(leftX, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        ctx.beginPath()
        ctx.arc(rightX, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.6
        ctx.fill()
        ctx.globalAlpha = 1

        // 连接线
        if (y % helixSpacing === 0) {
          ctx.beginPath()
          ctx.moveTo(leftX, y)
          ctx.lineTo(rightX, y)
          ctx.strokeStyle = `${color}40`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      phase += 0.02
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [traits])

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={300}
      className="mx-auto"
    />
  )
}

// 雷达图组件
const RadarChart: React.FC<{
  data: { label: string; value: number }[]
  size?: number
}> = ({ data, size = 200 }) => {
  const center = size / 2
  const radius = size * 0.4
  const angleStep = (Math.PI * 2) / data.length

  const points = data.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (item.value / 100) * radius
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      labelX: center + Math.cos(angle) * (radius + 20),
      labelY: center + Math.sin(angle) * (radius + 20)
    }
  })

  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z'

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* 背景网格 */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
        <polygon
          key={i}
          points={data.map((_, j) => {
            const angle = j * angleStep - Math.PI / 2
            const r = radius * scale
            return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* 轴线 */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        )
      })}

      {/* 数据区域 */}
      <motion.path
        d={pathData}
        fill="rgba(99, 102, 241, 0.3)"
        stroke="#6366f1"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* 数据点 */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#6366f1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}

      {/* 标签 */}
      {data.map((item, i) => (
        <text
          key={i}
          x={points[i].labelX}
          y={points[i].labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white/60 text-xs"
        >
          {item.label}
        </text>
      ))}
    </svg>
  )
}

// 时段分布图
const TimeDistribution: React.FC<{
  patterns: DNATraits['timePatterns']
}> = ({ patterns }) => {
  const hours = [
    { label: '早晨', value: patterns.morning, icon: '🌅', color: '#f59e0b' },
    { label: '下午', value: patterns.afternoon, icon: '☀️', color: '#10b981' },
    { label: '傍晚', value: patterns.evening, icon: '🌆', color: '#8b5cf6' },
    { label: '深夜', value: patterns.night, icon: '🌙', color: '#6366f1' }
  ]

  return (
    <div className="space-y-3">
      {hours.map((hour, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xl w-8">{hour.icon}</span>
          <span className="w-12 text-sm text-white/60">{hour.label}</span>
          <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: hour.color }}
              initial={{ width: 0 }}
              animate={{ width: `${hour.value}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          </div>
          <span className="w-10 text-right text-sm text-white/60">{hour.value}%</span>
        </div>
      ))}
    </div>
  )
}

// 流派饼图
const GenreChart: React.FC<{
  genres: DNATraits['genres']
}> = ({ genres }) => {
  const colors = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899']

  let cumulativePercentage = 0
  const paths = genres.map((genre, i) => {
    const startAngle = cumulativePercentage * 3.6 - 90
    cumulativePercentage += genre.percentage
    const endAngle = cumulativePercentage * 3.6 - 90

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)

    const largeArc = genre.percentage > 50 ? 1 : 0

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[i % colors.length],
      ...genre
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {paths.map((item, i) => (
          <motion.path
            key={i}
            d={item.path}
            fill={item.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
        <circle cx="50" cy="50" r="20" fill="#1a1a2e" />
      </svg>

      <div className="flex-1 space-y-2">
        {genres.map((genre, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-sm text-white flex-1">{genre.name}</span>
            <span className="text-sm text-white/60">{genre.percentage}%</span>
            <span className="text-sm">
              {genre.trend === 'up' ? '📈' : genre.trend === 'down' ? '📉' : '➖'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 洞察卡片
const InsightCard: React.FC<{
  insight: Insight
}> = ({ insight }) => {
  const bgColors = {
    discovery: 'from-blue-500/20 to-cyan-500/20',
    habit: 'from-purple-500/20 to-pink-500/20',
    recommendation: 'from-green-500/20 to-teal-500/20',
    milestone: 'from-yellow-500/20 to-orange-500/20'
  }

  return (
    <motion.div
      className={`p-4 rounded-xl bg-gradient-to-r ${bgColors[insight.type]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{insight.icon}</span>
        <div>
          <h4 className="text-white font-medium">{insight.title}</h4>
          <p className="text-sm text-white/60">{insight.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// 主界面
interface MusicDNAProps {
  className?: string
}

export const MusicDNA: React.FC<MusicDNAProps> = ({ className }) => {
  const { traits, insights, musicPersona } = useMusicDNA()
  const [activeSection, setActiveSection] = useState<'overview' | 'details' | 'insights'>('overview')

  const personalityData = [
    { label: '探索性', value: traits.personality.adventurous },
    { label: '怀旧度', value: traits.personality.nostalgic },
    { label: '主流度', value: traits.personality.mainstream },
    { label: '多元化', value: traits.personality.eclectic },
    { label: '忠诚度', value: traits.personality.loyal }
  ]

  const emotionalData = [
    { label: '能量', value: traits.emotional.energy },
    { label: '正面', value: traits.emotional.valence },
    { label: '舞曲性', value: traits.emotional.danceability },
    { label: '原声感', value: traits.emotional.acousticness },
    { label: '强度', value: traits.emotional.intensity }
  ]

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">音乐 DNA</h3>
          <p className="text-sm text-white/40">深度分析你的音乐品味</p>
        </div>

        <button className="px-4 py-2 bg-primary-500 rounded-lg text-white text-sm">
          分享我的 DNA
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'overview', label: '概览' },
          { key: 'details', label: '详细分析' },
          { key: 'insights', label: '洞察' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeSection === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* 音乐人格 */}
            <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-6">
                <DNAHelix traits={traits} />
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {musicPersona.name}
                  </h4>
                  <p className="text-white/60 mb-4">{musicPersona.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {musicPersona.traits.map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 双雷达图 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-dark-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-4 text-center">音乐性格</h4>
                <RadarChart data={personalityData} />
              </div>
              <div className="bg-dark-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-4 text-center">情感倾向</h4>
                <RadarChart data={emotionalData} />
              </div>
            </div>

            {/* 流派分布 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">流派分布</h4>
              <GenreChart genres={traits.genres} />
            </div>
          </motion.div>
        )}

        {activeSection === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 时段分布 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">听歌时段分布</h4>
              <TimeDistribution patterns={traits.timePatterns} />

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-white">{traits.timePatterns.weekday}%</p>
                  <p className="text-sm text-white/40">工作日</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-white">{traits.timePatterns.weekend}%</p>
                  <p className="text-sm text-white/40">周末</p>
                </div>
              </div>
            </div>

            {/* 艺人多样性 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">艺人多样性</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-primary-400">
                    {traits.artistDiversity.totalArtists}
                  </p>
                  <p className="text-sm text-white/40">总艺人数</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-green-400">
                    {traits.artistDiversity.newArtistsThisMonth}
                  </p>
                  <p className="text-sm text-white/40">本月新发现</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-yellow-400">
                    {traits.artistDiversity.topArtistPercentage}%
                  </p>
                  <p className="text-sm text-white/40">最爱艺人占比</p>
                </div>
              </div>
            </div>

            {/* 年代偏好 */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">年代偏好</h4>
              <div className="space-y-3">
                {traits.eraTaste.map((era, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-white/60">{era.era}</span>
                    <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${era.percentage}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-white/60">{era.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicDNA
