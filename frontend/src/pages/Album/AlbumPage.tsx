import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SongItem } from '@/components/Song/SongItem'
import { usePlayerStore } from '@/stores/playerStore'
import { formatDuration } from '@/utils/format'
import type { Song } from '@/types'

interface AlbumDetail {
  id: number
  name: string
  cover?: string
  releaseDate: string
  description?: string
  genre?: string
  type: 'album' | 'single' | 'ep'
  artist: {
    id: number
    name: string
    avatar?: string
    isVerified: boolean
  }
  songs: Song[]
}

const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`/api/albums/${id}`)
        const data = await response.json()
        if (data.code === 200) {
          setAlbum(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch album:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAlbum()
    }
  }, [id])

  const handlePlayAll = () => {
    if (album?.songs && album.songs.length > 0) {
      const songsWithAlbum = album.songs.map(song => ({
        ...song,
        album: { id: album.id, name: album.name, cover: album.cover },
        artist: album.artist
      }))
      setQueue(songsWithAlbum, 0)
    }
  }

  const handlePlaySong = (index: number) => {
    if (album?.songs) {
      const songsWithAlbum = album.songs.map(song => ({
        ...song,
        album: { id: album.id, name: album.name, cover: album.cover },
        artist: album.artist
      }))
      setQueue(songsWithAlbum, index)
    }
  }

  const totalDuration = album?.songs?.reduce((acc, song) => acc + song.duration, 0) || 0
  const releaseYear = album ? new Date(album.releaseDate).getFullYear() : ''
  const typeLabels = {
    album: '专辑',
    single: '单曲',
    ep: 'EP'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">专辑不存在</p>
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
    <div className="min-h-screen bg-dark-950">
      {/* Header with gradient background */}
      <div className="relative">
        {/* Background blur */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={album.cover || '/default-album.jpg'}
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
                src={album.cover || '/default-album.jpg'}
                alt={album.name}
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
              <span className="text-xs text-white/40 uppercase tracking-wider">
                {typeLabels[album.type] || '专辑'}
              </span>
              <h1 className="text-2xl lg:text-4xl font-bold text-white mt-2 mb-3">{album.name}</h1>

              {/* Artist */}
              <div
                className="flex items-center justify-center lg:justify-start gap-2 mb-4 cursor-pointer group"
                onClick={() => navigate(`/artist/${album.artist.id}`)}
              >
                <img
                  src={album.artist.avatar || '/default-artist.jpg'}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white/70 group-hover:text-white transition-colors">
                  {album.artist.name}
                </span>
                {album.artist.isVerified && (
                  <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-white/50 mb-6">
                <span>{releaseYear}</span>
                <span>·</span>
                <span>{album.songs?.length || 0} 首歌</span>
                <span>·</span>
                <span>{formatDuration(totalDuration)}</span>
                {album.genre && (
                  <>
                    <span>·</span>
                    <span>{album.genre}</span>
                  </>
                )}
              </div>

              {album.description && (
                <p className="text-white/60 text-sm mb-6 line-clamp-2 max-w-2xl">{album.description}</p>
              )}

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">曲目列表</h2>
        </div>

        {album.songs && album.songs.length > 0 ? (
          <div className="space-y-1">
            {album.songs.map((song, index) => (
              <SongItem
                key={song.id}
                song={{
                  ...song,
                  artist: album.artist,
                  album: { id: album.id, name: album.name, cover: album.cover } as any
                }}
                index={index}
                showIndex
                showCover={false}
                onClick={() => handlePlaySong(index)}
              />
            ))}
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

export default AlbumPage
