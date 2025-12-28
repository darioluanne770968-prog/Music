import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

// 场景类型
export type Scene =
  | 'workout'    // 运动
  | 'work'       // 工作
  | 'sleep'      // 睡眠
  | 'commute'    // 通勤
  | 'party'      // 派对
  | 'study'      // 学习
  | 'meditation' // 冥想
  | 'gaming'     // 游戏

// 场景配置
const scenes: Record<Scene, {
  name: string
  icon: React.ReactNode
  color: string
  gradient: string
  description: string
  features: string[]
}> = {
  workout: {
    name: '运动',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
    ),
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-500',
    description: '激励你燃烧卡路里',
    features: ['高能节奏', 'BPM 120-160', '自动跳过慢歌'],
  },
  work: {
    name: '工作',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
      </svg>
    ),
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    description: '提升工作效率',
    features: ['纯音乐为主', '无歌词干扰', '番茄钟模式'],
  },
  sleep: {
    name: '睡眠',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
      </svg>
    ),
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-500',
    description: '帮助你安然入睡',
    features: ['舒缓音乐', '定时关闭', '音量渐弱'],
  },
  commute: {
    name: '通勤',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/>
      </svg>
    ),
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    description: '让通勤变得有趣',
    features: ['播客混播', '新歌推荐', '路况音乐'],
  },
  party: {
    name: '派对',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
      </svg>
    ),
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
    description: '点燃派对气氛',
    features: ['热门舞曲', '连续混音', 'DJ模式'],
  },
  study: {
    name: '学习',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
      </svg>
    ),
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
    description: '专注高效学习',
    features: ['白噪音', '番茄钟', '休息提醒'],
  },
  meditation: {
    name: '冥想',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-sky-500',
    description: '平静内心世界',
    features: ['呼吸引导', '自然音效', '冥想计时'],
  },
  gaming: {
    name: '游戏',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    ),
    color: '#F59E0B',
    gradient: 'from-amber-500 to-yellow-500',
    description: '增强游戏体验',
    features: ['游戏OST', '史诗配乐', '低延迟模式'],
  },
}

interface SceneModeProps {
  onSceneSelect?: (scene: Scene) => void
  activeScene?: Scene | null
}

export const SceneMode: React.FC<SceneModeProps> = ({
  onSceneSelect,
  activeScene: controlledScene,
}) => {
  const [activeScene, setActiveScene] = useState<Scene | null>(controlledScene || null)
  const [showSettings, setShowSettings] = useState(false)

  const handleSceneSelect = (scene: Scene) => {
    if (activeScene === scene) {
      setActiveScene(null)
      onSceneSelect?.(null as any)
    } else {
      setActiveScene(scene)
      onSceneSelect?.(scene)
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">场景模式</h2>
          <p className="text-sm text-white/60">根据场景自动调整播放体验</p>
        </div>
        {activeScene && (
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${scenes[activeScene].gradient} text-white text-sm font-medium flex items-center gap-2`}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {scenes[activeScene].name}模式已开启
          </div>
        )}
      </div>

      {/* Scene Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(scenes).map(([key, scene]) => (
          <motion.button
            key={key}
            onClick={() => handleSceneSelect(key as Scene)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-2xl transition-all ${
              activeScene === key
                ? `bg-gradient-to-br ${scene.gradient} shadow-lg shadow-${scene.color}/30`
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-3 ${activeScene === key ? 'text-white' : 'text-white/60'}`}>
                {scene.icon}
              </div>
              <h3 className={`font-medium mb-1 ${activeScene === key ? 'text-white' : 'text-white/80'}`}>
                {scene.name}
              </h3>
              <p className={`text-xs ${activeScene === key ? 'text-white/80' : 'text-white/40'}`}>
                {scene.description}
              </p>
            </div>

            {/* Active Indicator */}
            {activeScene === key && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" style={{ color: scene.color }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Active Scene Settings */}
      <AnimatePresence>
        {activeScene && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${scenes[activeScene].gradient}/20 border border-white/10`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">
                  {scenes[activeScene].name}模式设置
                </h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {scenes[activeScene].features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-4"
                  >
                    {/* Timer for sleep mode */}
                    {activeScene === 'sleep' && (
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">定时关闭</label>
                        <div className="flex gap-2">
                          {[15, 30, 45, 60].map((mins) => (
                            <button
                              key={mins}
                              className="flex-1 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors"
                            >
                              {mins}分钟
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BPM range for workout */}
                    {activeScene === 'workout' && (
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">目标 BPM 范围</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={100}
                            max={180}
                            defaultValue={140}
                            className="flex-1"
                          />
                          <span className="text-white font-medium">140 BPM</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SceneMode
