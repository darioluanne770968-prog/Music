import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/userStore'
import { AuthModal } from '@/components/Auth/AuthModal'
import * as api from '@/services/netease'

interface DailySong {
  id: number
  name: string
  ar: { id: number; name: string }[]
  al: { id: number; name: string; picUrl: string }
  dt: number
  fee: number
  mv: number
  reason?: string
}

const DailyPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const { isAuthenticated } = useUserStore()
  const [songs, setSongs] = useState<DailySong[]>([])
  const [loading, setLoading] = useState(true)

  // Get current date
  const today = new Date()
  const day = today.getDate()
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.getDay()]

  useEffect(() => {
    const fetchDailySongs = async () => {
      try {
        setLoading(true)
        const res = await api.getRecommendSongs()
        if (res?.data?.dailySongs) {
          setSongs(res.data.dailySongs)
        }
      } catch (error) {
        console.error('Failed to fetch daily songs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDailySongs()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const handlePlayAll = () => {
    if (songs.length > 0) {
      const formattedSongs = songs.map((song) => ({
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
    }
  }

  const handlePlaySong = (index: number) => {
    const formattedSongs = songs.map((song) => ({
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
    setQueue(formattedSongs, index)
  }

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const [showAuthModal, setShowAuthModal] = useState(false)

  if (!isAuthenticated) {
    return (
      <>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">登录享受每日推荐</h2>
          <p className="text-white/50 text-center mb-6">
            登录后，每天为你推荐30首好歌
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium"
            >
              立即登录
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-full bg-white/10 text-white font-medium"
            >
              返回
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/30 via-dark-950/80 to-dark-950 h-64" />

        <div className="relative px-4 lg:px-8 pt-12 pb-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-6">
            {/* Calendar Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex flex-col items-center justify-center shadow-lg shadow-primary-500/25"
            >
              <span className="text-white/80 text-sm">{weekday}</span>
              <span className="text-white text-4xl font-bold">{day}</span>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl font-bold text-white">每日推荐</h1>
              <p className="text-white/50 mt-1">根据你的口味生成，每天6:00更新</p>
              <div className="flex items-center gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium shadow-lg shadow-primary-500/25"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                  </svg>
                  播放全部
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                onClick={() => handlePlaySong(index)}
              >
                {/* Index */}
                <div className="w-8 text-center text-sm text-white/40">
                  {index + 1}
                </div>

                {/* Cover */}
                <img
                  src={song.al?.picUrl}
                  alt={song.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.name}</p>
                  <p className="text-xs text-white/50 truncate">
                    {song.ar?.map((a) => a.name).join(' / ')}
                  </p>
                  {song.reason && (
                    <p className="text-xs text-primary-400 mt-0.5">{song.reason}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2">
                  {song.fee === 1 && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">VIP</span>
                  )}
                  {song.mv > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">MV</span>
                  )}
                </div>

                {/* Duration */}
                <span className="text-sm text-white/40 w-12 text-right">
                  {formatDuration(song.dt)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyPage
