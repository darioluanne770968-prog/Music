import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 成就系统组件
 * 支持成就、徽章、等级、每日挑战
 */

// 成就类型
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'listening' | 'social' | 'discovery' | 'collection' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  target: number
  unlocked: boolean
  unlockedAt?: Date
  reward?: {
    type: 'xp' | 'badge' | 'theme' | 'avatar'
    value: number | string
  }
}

// 等级信息
export interface LevelInfo {
  level: number
  title: string
  currentXP: number
  requiredXP: number
  perks: string[]
}

// 每日挑战
export interface DailyChallenge {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  target: number
  reward: number
  expiresAt: Date
}

// 排行榜条目
export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatar: string
  score: number
  level: number
  isCurrentUser: boolean
}

// 成就数据
const ACHIEVEMENTS: Achievement[] = [
  // 听歌类
  {
    id: 'first_song',
    name: '初次邂逅',
    description: '播放第一首歌曲',
    icon: '🎵',
    category: 'listening',
    rarity: 'common',
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: new Date()
  },
  {
    id: 'music_lover',
    name: '音乐爱好者',
    description: '累计听歌100首',
    icon: '💗',
    category: 'listening',
    rarity: 'common',
    progress: 87,
    target: 100,
    unlocked: false
  },
  {
    id: 'marathon',
    name: '音乐马拉松',
    description: '单日听歌超过4小时',
    icon: '🏃',
    category: 'listening',
    rarity: 'rare',
    progress: 2.5,
    target: 4,
    unlocked: false
  },
  {
    id: 'night_owl',
    name: '夜猫子',
    description: '在凌晨3点听歌',
    icon: '🦉',
    category: 'listening',
    rarity: 'rare',
    progress: 0,
    target: 1,
    unlocked: false
  },
  {
    id: 'audiophile',
    name: '发烧友',
    description: '累计听歌超过1000小时',
    icon: '🎧',
    category: 'listening',
    rarity: 'legendary',
    progress: 234,
    target: 1000,
    unlocked: false
  },
  // 社交类
  {
    id: 'social_butterfly',
    name: '社交达人',
    description: '关注100位用户',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    progress: 45,
    target: 100,
    unlocked: false
  },
  {
    id: 'influencer',
    name: '意见领袖',
    description: '获得1000位粉丝',
    icon: '⭐',
    category: 'social',
    rarity: 'epic',
    progress: 156,
    target: 1000,
    unlocked: false
  },
  {
    id: 'share_master',
    name: '分享达人',
    description: '分享100首歌曲',
    icon: '📤',
    category: 'social',
    rarity: 'rare',
    progress: 23,
    target: 100,
    unlocked: false
  },
  // 发现类
  {
    id: 'explorer',
    name: '音乐探索者',
    description: '听遍10个音乐流派',
    icon: '🗺️',
    category: 'discovery',
    rarity: 'rare',
    progress: 7,
    target: 10,
    unlocked: false
  },
  {
    id: 'world_music',
    name: '世界之声',
    description: '听遍来自20个国家的音乐',
    icon: '🌍',
    category: 'discovery',
    rarity: 'epic',
    progress: 12,
    target: 20,
    unlocked: false
  },
  {
    id: 'hipster',
    name: '潮流先锋',
    description: '在歌曲走红前就开始听',
    icon: '😎',
    category: 'discovery',
    rarity: 'legendary',
    progress: 0,
    target: 1,
    unlocked: false
  },
  // 收藏类
  {
    id: 'collector',
    name: '收藏家',
    description: '创建10个歌单',
    icon: '📚',
    category: 'collection',
    rarity: 'common',
    progress: 5,
    target: 10,
    unlocked: false
  },
  {
    id: 'curator',
    name: '策展人',
    description: '歌单被收藏100次',
    icon: '🎯',
    category: 'collection',
    rarity: 'epic',
    progress: 34,
    target: 100,
    unlocked: false
  }
]

// 每日挑战数据
const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: '1',
    name: '音乐早餐',
    description: '在早上8点前听3首歌',
    icon: '☀️',
    progress: 1,
    target: 3,
    reward: 50,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: '新歌尝鲜',
    description: '听5首从未听过的歌曲',
    icon: '🆕',
    progress: 3,
    target: 5,
    reward: 100,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: '社交音乐',
    description: '分享一首歌给好友',
    icon: '👥',
    progress: 0,
    target: 1,
    reward: 30,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
  }
]

// 等级系统
const LEVELS: LevelInfo[] = [
  { level: 1, title: '音乐小白', currentXP: 0, requiredXP: 100, perks: [] },
  { level: 2, title: '音乐新手', currentXP: 0, requiredXP: 200, perks: ['解锁个人主页装扮'] },
  { level: 5, title: '音乐爱好者', currentXP: 0, requiredXP: 500, perks: ['解锁高级主题'] },
  { level: 10, title: '音乐达人', currentXP: 0, requiredXP: 1000, perks: ['解锁专属徽章', '解锁高清下载'] },
  { level: 20, title: '音乐大师', currentXP: 0, requiredXP: 2000, perks: ['解锁VIP图标', '优先客服'] },
  { level: 50, title: '音乐传奇', currentXP: 0, requiredXP: 5000, perks: ['专属称号', '年度报告特权'] }
]

// 成就系统 Hook
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES)
  const [level, setLevel] = useState<LevelInfo>({
    level: 8,
    title: '音乐爱好者',
    currentXP: 650,
    requiredXP: 800,
    perks: ['解锁个人主页装扮', '解锁高级主题']
  })
  const [totalXP, setTotalXP] = useState(2150)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  // 检查成就解锁
  const checkAchievements = () => {
    setAchievements(prev => prev.map(a => {
      if (!a.unlocked && a.progress >= a.target) {
        const unlocked = { ...a, unlocked: true, unlockedAt: new Date() }
        setNewAchievement(unlocked)
        return unlocked
      }
      return a
    }))
  }

  // 增加经验
  const addXP = (amount: number) => {
    setTotalXP(prev => prev + amount)
    setLevel(prev => {
      const newCurrentXP = prev.currentXP + amount
      if (newCurrentXP >= prev.requiredXP) {
        // 升级
        return {
          ...prev,
          level: prev.level + 1,
          currentXP: newCurrentXP - prev.requiredXP,
          requiredXP: Math.floor(prev.requiredXP * 1.5)
        }
      }
      return { ...prev, currentXP: newCurrentXP }
    })
  }

  // 完成每日挑战
  const completeChallenge = (challengeId: string) => {
    setDailyChallenges(prev => prev.map(c => {
      if (c.id === challengeId && c.progress >= c.target) {
        addXP(c.reward)
        return { ...c, progress: c.target }
      }
      return c
    }))
  }

  return {
    achievements,
    dailyChallenges,
    level,
    totalXP,
    newAchievement,
    setNewAchievement,
    checkAchievements,
    addXP,
    completeChallenge
  }
}

// 成就解锁弹窗
interface AchievementUnlockedProps {
  achievement: Achievement | null
  onClose: () => void
}

export const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({
  achievement,
  onClose
}) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-500'
  }

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`p-6 rounded-2xl bg-gradient-to-r ${rarityColors[achievement.rarity]} shadow-2xl`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                {achievement.icon}
              </div>
              <div>
                <p className="text-white/80 text-sm">成就解锁！</p>
                <h3 className="text-xl font-bold text-white">{achievement.name}</h3>
                <p className="text-white/80 text-sm">{achievement.description}</p>
              </div>
              <button onClick={onClose} className="ml-4 text-white/60 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 成就列表页面
interface AchievementsPageProps {
  achievements: Achievement[]
  level: LevelInfo
  dailyChallenges: DailyChallenge[]
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  achievements,
  level,
  dailyChallenges
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'leaderboard'>('achievements')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: '全部', icon: '🏆' },
    { id: 'listening', name: '听歌', icon: '🎵' },
    { id: 'social', name: '社交', icon: '👥' },
    { id: 'discovery', name: '发现', icon: '🔍' },
    { id: 'collection', name: '收藏', icon: '📚' },
    { id: 'special', name: '特殊', icon: '⭐' }
  ]

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length

  const rarityColors = {
    common: 'border-gray-500 bg-gray-500/10',
    rare: 'border-blue-500 bg-blue-500/10',
    epic: 'border-purple-500 bg-purple-500/10',
    legendary: 'border-yellow-500 bg-yellow-500/10'
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* 等级信息 */}
      <div className="p-6 bg-gradient-to-r from-primary-500 to-purple-500">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              {level.level}
            </div>
            <svg className="absolute inset-0 w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray={`${(level.currentXP / level.requiredXP) * 226} 226`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{level.title}</h2>
            <p className="text-white/80">等级 {level.level}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${(level.currentXP / level.requiredXP) * 100}%` }}
                />
              </div>
              <span className="text-white/80 text-sm">
                {level.currentXP}/{level.requiredXP} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'achievements', name: '成就', icon: '🏆' },
          { id: 'challenges', name: '每日挑战', icon: '🎯' },
          { id: 'leaderboard', name: '排行榜', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 text-center transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-primary-500'
                : 'text-white/60'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'achievements' && (
        <>
          {/* 分类筛选 */}
          <div className="p-4 flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* 统计 */}
          <div className="px-4 py-2 text-white/60 text-sm">
            已解锁 {unlockedCount}/{achievements.length} 个成就
          </div>

          {/* 成就列表 */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {filteredAchievements.map(achievement => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 ${
                  achievement.unlocked
                    ? rarityColors[achievement.rarity]
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{achievement.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                        achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                        achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {achievement.rarity === 'legendary' ? '传说' :
                         achievement.rarity === 'epic' ? '史诗' :
                         achievement.rarity === 'rare' ? '稀有' : '普通'}
                      </span>
                    </div>
                    <p className="text-sm text-white/60">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {achievement.progress}/{achievement.target}
                        </p>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <span className="text-green-400 text-2xl">✓</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'challenges' && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="text-center p-4 bg-primary-500/10 rounded-xl">
            <p className="text-white/60 text-sm">每日挑战将在</p>
            <p className="text-2xl font-bold text-white">08:42:15</p>
            <p className="text-white/60 text-sm">后刷新</p>
          </div>

          {dailyChallenges.map(challenge => (
            <div
              key={challenge.id}
              className="p-4 bg-white/5 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl">
                  {challenge.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{challenge.name}</h4>
                  <p className="text-sm text-white/60">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40">
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-yellow-400 font-bold">+{challenge.reward}</span>
                  <span className="text-white/40 text-xs block">XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {[
              { rank: 1, userName: '音乐之王', score: 125600, level: 42 },
              { rank: 2, userName: '旋律猎手', score: 98400, level: 38 },
              { rank: 3, userName: '节拍大师', score: 87200, level: 35 },
              { rank: 4, userName: '我', score: 2150, level: 8, isCurrentUser: true },
              { rank: 5, userName: '音符收集者', score: 1890, level: 7 }
            ].map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  entry.isCurrentUser ? 'bg-primary-500/20 border border-primary-500' : 'bg-white/5'
                }`}
              >
                <span className={`w-8 text-center font-bold ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-orange-400' :
                  'text-white/60'
                }`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex-1">
                  <p className="font-medium text-white">{entry.userName}</p>
                  <p className="text-xs text-white/40">Lv.{entry.level}</p>
                </div>
                <span className="text-white/60">{entry.score.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementsPage
