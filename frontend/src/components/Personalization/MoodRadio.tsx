import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

// 心情类型
export type Mood =
  | 'happy'      // 开心
  | 'sad'        // 伤感
  | 'relaxed'    // 放松
  | 'energetic'  // 亢奋
  | 'romantic'   // 浪漫
  | 'focused'    // 专注
  | 'nostalgic'  // 怀旧
  | 'peaceful'   // 平静

// 心情配置
const moods: Record<Mood, {
  name: string
  emoji: string
  color: string
  gradient: string
  description: string
}> = {
  happy: {
    name: '开心',
    emoji: '😊',
    color: '#FCD34D',
    gradient: 'from-yellow-400 to-orange-400',
    description: '欢快明朗的旋律',
  },
  sad: {
    name: '伤感',
    emoji: '😢',
    color: '#60A5FA',
    gradient: 'from-blue-400 to-indigo-400',
    description: '抒发内心的情感',
  },
  relaxed: {
    name: '放松',
    emoji: '😌',
    color: '#34D399',
    gradient: 'from-green-400 to-teal-400',
    description: '舒缓身心的音乐',
  },
  energetic: {
    name: '亢奋',
    emoji: '🔥',
    color: '#F87171',
    gradient: 'from-red-400 to-pink-400',
    description: '充满能量的节奏',
  },
  romantic: {
    name: '浪漫',
    emoji: '💕',
    color: '#F472B6',
    gradient: 'from-pink-400 to-rose-400',
    description: '甜蜜温馨的情歌',
  },
  focused: {
    name: '专注',
    emoji: '🎯',
    color: '#A78BFA',
    gradient: 'from-purple-400 to-violet-400',
    description: '帮助集中注意力',
  },
  nostalgic: {
    name: '怀旧',
    emoji: '🌅',
    color: '#FB923C',
    gradient: 'from-orange-400 to-amber-400',
    description: '回忆往昔时光',
  },
  peaceful: {
    name: '平静',
    emoji: '🌊',
    color: '#38BDF8',
    gradient: 'from-sky-400 to-cyan-400',
    description: '内心宁静安详',
  },
}

interface MoodRadioProps {
  onMoodSelect?: (mood: Mood) => void
  selectedMood?: Mood | null
}

export const MoodRadio: React.FC<MoodRadioProps> = ({
  onMoodSelect,
  selectedMood: controlledMood,
}) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(controlledMood || null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    setIsPlaying(true)
    onMoodSelect?.(mood)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">心情电台</h2>
        <p className="text-sm text-white/60">选择你的心情，发现适合的音乐</p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(moods).map(([key, mood]) => (
          <motion.button
            key={key}
            onClick={() => handleMoodSelect(key as Mood)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${mood.gradient} overflow-hidden transition-all ${
              selectedMood === key ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900' : ''
            }`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className="text-4xl mb-2 block">{mood.emoji}</span>
              <h3 className="text-lg font-bold text-white mb-1">{mood.name}</h3>
              <p className="text-xs text-white/80">{mood.description}</p>
            </div>

            {/* Playing Indicator */}
            {selectedMood === key && isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-3 right-3"
              >
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{ height: ['40%', '100%', '40%'] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Now Playing Section */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-white/5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{moods[selectedMood].emoji}</span>
                <div>
                  <h3 className="font-medium text-white">
                    {moods[selectedMood].name}电台
                  </h3>
                  <p className="text-xs text-white/60">
                    {moods[selectedMood].description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3 rounded-full bg-gradient-to-br ${moods[selectedMood].gradient}`}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <p className="text-xs text-white/40 mb-2">为你推荐</p>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 skeleton-shimmer" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-white/10 rounded skeleton-shimmer mb-1" />
                    <div className="h-2 w-16 bg-white/10 rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodRadio
