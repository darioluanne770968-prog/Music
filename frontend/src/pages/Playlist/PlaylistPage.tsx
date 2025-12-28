import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import * as api from '@/services/netease'

interface PlaylistDetail {
  id: number
  name: string
  description: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  subscribedCount: number
  creator: {
    userId: number
    nickname: string
    avatarUrl: string
  }
  tracks: any[]
}

interface FormattedSong {
  id: number
  name: string
  title: string
  artist: string
  artists: any[]
  album: string
  albumId: number
  cover: string
  duration: number
  isVip: boolean
  mvId: number
}

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setQueue, currentSong, isPlaying } = usePlayerStore()

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null)
  const [songs, setSongs] = useState<FormattedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // Get playlist details
        const detailRes = await api.getPlaylistDetail(parseInt(id))

        if (detailRes?.code === 200 && detailRes.playlist) {
          setPlaylist(detailRes.playlist)

          // Get all tracks if not included
          let tracks = detailRes.playlist.tracks || []

          if (tracks.length === 0 && detailRes.playlist.trackIds?.length > 0) {
            // Fetch track details
            const trackIds = detailRes.playlist.trackIds.slice(0, 100).map((t: any) => t.id)
            const tracksRes = await api.getSongDetail(trackIds)
            if (tracksRes?.songs) {
              tracks = tracksRes.songs
            }
          }

          // Format songs
          const formattedSongs = tracks.map((track: any) => ({
            id: track.id,
            name: track.name,
            title: track.name,
            artist: track.ar?.[0]?.name || '未知歌手',
            artists: track.ar || [],
            album: track.al?.name || '未知专辑',
            albumId: track.al?.id,
            cover: track.al?.picUrl || '',
            duration: Math.floor((track.dt || 0) / 1000),
            isVip: track.fee === 1,
            mvId: track.mv || 0,
          }))

          setSongs(formattedSongs)
        } else {
          setError('歌单不存在')
        }
      } catch (err) {
        console.error('Failed to fetch playlist:', err)
        setError('加载失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylist()
  }, [id])

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0)
    }
  }

  const handlePlaySong = (index: number) => {
    setQueue(songs, index)
  }

  const formatPlayCount = (count: number) => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
    return count.toString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">{error || '歌单不存在'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-full bg-white/10 text-white text-sm"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header with gradient background */}
      <div className="relative">
        {/* Background blur */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={playlist.coverImgUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/80 to-dark-950" />
        </div>

        {/* Content */}
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

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <img
                src={playlist.coverImgUrl}
                alt={playlist.name}
                className="w-48 h-48 lg:w-56 lg:h-56 rounded-2xl shadow-2xl object-cover mx-auto lg:mx-0"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center lg:text-left"
            >
              <span className="text-xs text-white/40 uppercase tracking-wider">歌单</span>
              <h1 className="text-2xl lg:text-4xl font-bold text-white mt-2 mb-3">{playlist.name}</h1>

              {playlist.description && (
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{playlist.description}</p>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-white/50 mb-6">
                <div className="flex items-center gap-2">
                  <img
                    src={playlist.creator?.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{playlist.creator?.nickname}</span>
                </div>
                <span>·</span>
                <span>{playlist.trackCount} 首歌</span>
                <span>·</span>
                <span>{formatPlayCount(playlist.playCount)} 次播放</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium shadow-lg shadow-primary-500/25"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                  </svg>
                  播放全部
                </motion.button>

                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="px-4 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">歌曲列表</h2>
          <span className="text-sm text-white/40">
            总时长 {Math.floor(totalDuration / 3600)}:{Math.floor((totalDuration % 3600) / 60).toString().padStart(2, '0')}:{(totalDuration % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {songs.length > 0 ? (
          <div className="space-y-1">
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id
              return (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isCurrentSong
                      ? 'bg-primary-500/20 ring-1 ring-primary-500/30'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => handlePlaySong(index)}
                >
                  {/* Index / Playing indicator */}
                  <div className="w-8 text-center">
                    {isCurrentSong && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="w-0.5 h-3 bg-primary-500 animate-pulse rounded-full" />
                        <span className="w-0.5 h-4 bg-primary-500 animate-pulse rounded-full animation-delay-100" />
                        <span className="w-0.5 h-3 bg-primary-500 animate-pulse rounded-full animation-delay-200" />
                      </div>
                    ) : (
                      <span className={`text-sm ${isCurrentSong ? 'text-primary-500' : 'text-white/40'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Cover */}
                  <img
                    src={song.cover || '/default-album.jpg'}
                    alt={song.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-primary-500' : 'text-white'}`}>
                      {song.name}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {song.artists.map((a: any) => a.name).join(' / ')} - {song.album}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2">
                    {song.isVip && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">VIP</span>
                    )}
                    {song.mvId > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">MV</span>
                    )}
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-white/40 w-12 text-right">
                    {formatDuration(song.duration)}
                  </span>

                  {/* More button */}
                  <button
                    className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Show more options
                    }}
                  >
                    <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="6" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="18" r="2" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-white/40">
            暂无歌曲
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistPage
