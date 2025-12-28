import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import * as api from '@/services/netease'
import toast from 'react-hot-toast'

interface MoodOption {
  id: string
  name: string
  icon: string
  gradient: string
  tags: string[]
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'happy',
    name: '开心愉悦',
    icon: '😊',
    gradient: 'from-yellow-400 to-orange-500',
    tags: ['欢快', '活力', '阳光'],
  },
  {
    id: 'sad',
    name: '伤感治愈',
    icon: '😢',
    gradient: 'from-blue-400 to-indigo-500',
    tags: ['伤感', '治愈', '安静'],
  },
  {
    id: 'relaxed',
    name: '放松舒缓',
    icon: '😌',
    gradient: 'from-green-400 to-teal-500',
    tags: ['轻音乐', '纯音乐', '自然'],
  },
  {
    id: 'energetic',
    name: '运动健身',
    icon: '💪',
    gradient: 'from-red-500 to-pink-500',
    tags: ['电子', '节奏感', '运动'],
  },
  {
    id: 'focus',
    name: '专注工作',
    icon: '🎯',
    gradient: 'from-purple-400 to-violet-500',
    tags: ['专注', '轻音乐', '背景音乐'],
  },
  {
    id: 'sleep',
    name: '助眠安神',
    icon: '😴',
    gradient: 'from-slate-400 to-slate-600',
    tags: ['轻柔', '安静', '白噪音'],
  },
  {
    id: 'romantic',
    name: '浪漫约会',
    icon: '💕',
    gradient: 'from-pink-400 to-rose-500',
    tags: ['浪漫', '情歌', '甜蜜'],
  },
  {
    id: 'party',
    name: '派对狂欢',
    icon: '🎉',
    gradient: 'from-amber-400 to-red-500',
    tags: ['派对', '电子', '嗨曲'],
  },
]

const TIME_OPTIONS = [
  { id: 'morning', name: '清晨', icon: '🌅', hour: [5, 9] },
  { id: 'noon', name: '午后', icon: '☀️', hour: [12, 14] },
  { id: 'evening', name: '傍晚', icon: '🌆', hour: [17, 19] },
  { id: 'night', name: '深夜', icon: '🌙', hour: [22, 4] },
]

const SmartPlaylistPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Get current time-based suggestion
  const getCurrentTimeSuggestion = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 9) return 'morning'
    if (hour >= 12 && hour < 14) return 'noon'
    if (hour >= 17 && hour < 19) return 'evening'
    if (hour >= 22 || hour < 4) return 'night'
    return null
  }

  const currentTimeSuggestion = getCurrentTimeSuggestion()

  const generatePlaylist = async (mood: MoodOption) => {
    setSelectedMood(mood.id)
    setLoading(true)

    try {
      // Use personalized recommendations or search by tags
      let songs: any[] = []

      // Try to get personalized playlist based on mood tags
      try {
        // Search for playlists matching the mood
        const searchRes = await api.searchPlaylists(mood.tags[0], 1)
        if (searchRes?.result?.playlists?.[0]) {
          const playlistId = searchRes.result.playlists[0].id
          const detailRes = await api.getPlaylistDetail(playlistId)
          if (detailRes?.playlist?.tracks) {
            songs = detailRes.playlist.tracks.slice(0, 30)
          }
        }
      } catch (e) {
        console.log('Playlist search failed, using recommendations')
      }

      // Fallback to recommendations if search failed
      if (songs.length === 0) {
        const recRes = await api.getRecommendSongs()
        if (recRes?.data?.dailySongs) {
          songs = recRes.data.dailySongs.slice(0, 30)
        }
      }

      if (songs.length > 0) {
        const formattedSongs = songs.map((song: any) => ({
          id: song.id,
          name: song.name,
          title: song.name,
          artist: song.ar?.[0]?.name || '未知歌手',
          artists: song.ar || [],
          album: song.al?.name || '未知专辑',
          albumId: song.al?.id,
          cover: song.al?.picUrl || '',
          duration: Math.floor((song.dt || 0) / 1000),
          isVip: song.fee === 1,
          mvId: song.mv || 0,
        }))

        setQueue(formattedSongs, 0)
        toast.success(`正在播放「${mood.name}」歌单`)
      } else {
        toast.error('暂无推荐歌曲，请先登录')
      }
    } catch (error) {
      console.error('Failed to generate playlist:', error)
      toast.error('生成歌单失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/20 via-dark-950/80 to-dark-950 h-64" />

        <div className="relative px-4 lg:px-8 pt-12 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-white mb-2">智能歌单</h1>
            <p className="text-white/60">根据心情或场景，为你生成专属歌单</p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 space-y-6">
        {/* Time-based suggestion */}
        {currentTimeSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-500/20 to-accent-purple/20 rounded-2xl p-4 border border-primary-500/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {TIME_OPTIONS.find(t => t.id === currentTimeSuggestion)?.icon}
              </span>
              <div>
                <p className="text-sm text-white/60">根据当前时间推荐</p>
                <p className="text-white font-medium">
                  {TIME_OPTIONS.find(t => t.id === currentTimeSuggestion)?.name}时光
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">选择你的心情</h3>
          <div className="grid grid-cols-2 gap-3">
            {MOOD_OPTIONS.map((mood, index) => (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generatePlaylist(mood)}
                disabled={loading}
                className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
                  selectedMood === mood.id && loading
                    ? 'ring-2 ring-primary-500'
                    : 'hover:scale-[1.02]'
                }`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-20`} />

                {/* Content */}
                <div className="relative">
                  <span className="text-3xl mb-2 block">{mood.icon}</span>
                  <p className="font-bold text-white">{mood.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mood.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Loading indicator */}
                  {selectedMood === mood.id && loading && (
                    <div className="absolute top-2 right-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">快速开始</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/daily')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">每日推荐</p>
                <p className="text-sm text-white/50">每天为你推荐30首好歌</p>
              </div>
              <svg className="w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/fm')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">私人FM</p>
                <p className="text-sm text-white/50">根据喜好无限推荐</p>
              </div>
              <svg className="w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SmartPlaylistPage
