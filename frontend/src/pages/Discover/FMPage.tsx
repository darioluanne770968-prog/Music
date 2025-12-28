import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/userStore'
import { AuthModal } from '@/components/Auth/AuthModal'
import * as api from '@/services/netease'

interface FMSong {
  id: number
  name: string
  artists: { id: number; name: string }[]
  album: { id: number; name: string; picUrl: string }
  duration: number
  mvid: number
}

const FMPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue, currentSong, isPlaying, togglePlay, playNext } = usePlayerStore()
  const { isAuthenticated } = useUserStore()
  const [fmQueue, setFmQueue] = useState<FMSong[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Fetch FM songs
  const fetchFMSongs = useCallback(async () => {
    try {
      const res = await api.getPersonalFm()
      if (res?.data) {
        setFmQueue((prev) => [...prev, ...res.data])
        return res.data
      }
      return []
    } catch (error) {
      console.error('Failed to fetch FM songs:', error)
      return []
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      setLoading(true)
      const songs = await fetchFMSongs()
      if (songs.length > 0) {
        playSong(songs[0])
      }
      setLoading(false)
    }
    init()
  }, [isAuthenticated])

  // Play current FM song
  const playSong = (song: FMSong) => {
    const formattedSong = {
      id: song.id,
      name: song.name,
      title: song.name,
      artist: song.artists?.[0]?.name || '未知歌手',
      artists: song.artists || [],
      album: song.album?.name || '未知专辑',
      albumId: song.album?.id,
      cover: song.album?.picUrl || '',
      duration: Math.floor((song.duration || 0) / 1000),
      isVip: false,
      mvId: song.mvid || 0,
    }
    setQueue([formattedSong], 0)
  }

  // Play next FM song
  const handleNext = async () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= fmQueue.length) {
      // Fetch more songs
      const newSongs = await fetchFMSongs()
      if (newSongs.length > 0) {
        playSong(newSongs[0])
        setCurrentIndex(fmQueue.length)
      }
    } else {
      playSong(fmQueue[nextIndex])
      setCurrentIndex(nextIndex)
    }
    setIsLiked(false)
  }

  // Trash current song (skip and never play again)
  const handleTrash = async () => {
    const currentFM = fmQueue[currentIndex]
    if (currentFM) {
      try {
        await api.fmTrash(currentFM.id)
      } catch (error) {
        console.error('Failed to trash song:', error)
      }
    }
    handleNext()
  }

  // Like current song
  const handleLike = async () => {
    const currentFM = fmQueue[currentIndex]
    if (currentFM) {
      try {
        await api.likeSong(currentFM.id, !isLiked)
        setIsLiked(!isLiked)
      } catch (error) {
        console.error('Failed to like song:', error)
      }
    }
  }

  const currentFMSong = fmQueue[currentIndex]

  if (!isAuthenticated) {
    return (
      <>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">登录享受私人FM</h2>
          <p className="text-white/50 text-center mb-6">
            根据你的喜好，无限推荐好歌
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">私人FM</h1>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {currentFMSong ? (
          <>
            {/* Album Cover */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFMSong.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="relative mb-8"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/30 to-accent-purple/30 blur-3xl scale-110" />

                <motion.img
                  src={currentFMSong.album?.picUrl}
                  alt={currentFMSong.name}
                  className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-3xl object-cover shadow-2xl"
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 20,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Song Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFMSong.id + '-info'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">{currentFMSong.name}</h2>
                <p className="text-white/60">
                  {currentFMSong.artists?.map((a) => a.name).join(' / ')}
                </p>
                <p className="text-white/40 text-sm mt-1">{currentFMSong.album?.name}</p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8">
              {/* Trash Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleTrash}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple flex items-center justify-center shadow-lg shadow-primary-500/25"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                  </svg>
                )}
              </motion.button>

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </motion.button>
            </div>

            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="mt-8"
            >
              <svg
                className={`w-8 h-8 transition-colors ${isLiked ? 'text-red-500' : 'text-white/40'}`}
                viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-white/60">暂无推荐</p>
          </div>
        )}
      </div>

      {/* FM Info */}
      <div className="py-8 text-center">
        <p className="text-xs text-white/30">
          私人FM · 根据你的喜好推荐
        </p>
      </div>
    </div>
  )
}

export default FMPage
