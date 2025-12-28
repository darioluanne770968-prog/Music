import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SongItem } from '@/components/Song/SongItem'
import { usePlayerStore } from '@/stores/playerStore'
import { formatPlayCount } from '@/utils/format'
import type { Song, Album } from '@/types'

interface ArtistDetail {
  id: number
  name: string
  avatar?: string
  cover?: string
  bio?: string
  country?: string
  genres: string[]
  isVerified: boolean
  followerCount: number
  songCount: number
  albumCount: number
}

const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const [artist, setArtist] = useState<ArtistDetail | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs')

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const [artistRes, songsRes, albumsRes] = await Promise.all([
          fetch(`/api/artists/${id}`),
          fetch(`/api/artists/${id}/songs?limit=50`),
          fetch(`/api/artists/${id}/albums`),
        ])

        const [artistData, songsData, albumsData] = await Promise.all([
          artistRes.json(),
          songsRes.json(),
          albumsRes.json(),
        ])

        if (artistData.code === 200) {
          setArtist(artistData.data)
        }
        if (songsData.code === 200) {
          setSongs(songsData.data.items || [])
        }
        if (albumsData.code === 200) {
          setAlbums(albumsData.data.items || [])
        }
      } catch (error) {
        console.error('Failed to fetch artist:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchArtist()
    }
  }, [id])

  const handlePlayAll = () => {
    if (songs.length > 0) {
      // Add artist info to songs
      const songsWithArtist = songs.map(song => ({
        ...song,
        artist: { id: artist!.id, name: artist!.name, avatar: artist?.avatar } as any
      }))
      setQueue(songsWithArtist, 0)
    }
  }

  const handlePlaySong = (index: number) => {
    const songsWithArtist = songs.map(song => ({
      ...song,
      artist: { id: artist!.id, name: artist!.name, avatar: artist?.avatar } as any
    }))
    setQueue(songsWithArtist, index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">歌手不存在</p>
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
            src={artist.cover || artist.avatar || '/default-artist.jpg'}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-40 scale-110"
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

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-end">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <img
                  src={artist.avatar || '/default-artist.jpg'}
                  alt={artist.name}
                  className="w-40 h-40 lg:w-48 lg:h-48 rounded-full shadow-2xl object-cover ring-4 ring-white/10"
                />
                {artist.isVerified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center lg:text-left"
            >
              <span className="text-xs text-white/40 uppercase tracking-wider">艺人</span>
              <h1 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-3">{artist.name}</h1>

              {artist.bio && (
                <p className="text-white/60 text-sm mb-4 line-clamp-2 max-w-2xl">{artist.bio}</p>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-white/50 mb-6">
                <span>{formatPlayCount(artist.followerCount)} 粉丝</span>
                <span>·</span>
                <span>{artist.songCount} 首歌</span>
                <span>·</span>
                <span>{artist.albumCount} 张专辑</span>
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
                  播放热门
                </motion.button>

                <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  关注
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-8 border-b border-white/10">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('songs')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'songs'
                ? 'text-white border-primary-500'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            热门歌曲
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'albums'
                ? 'text-white border-primary-500'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            专辑
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6">
        {activeTab === 'songs' && (
          <div className="space-y-1">
            {songs.length > 0 ? (
              songs.map((song, index) => (
                <SongItem
                  key={song.id}
                  song={{
                    ...song,
                    artist: { id: artist.id, name: artist.name } as any
                  }}
                  index={index}
                  showIndex
                  showCover
                  onClick={() => handlePlaySong(index)}
                />
              ))
            ) : (
              <div className="py-12 text-center text-white/40">暂无歌曲</div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.length > 0 ? (
              albums.map((album) => (
                <motion.div
                  key={album.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={album.cover || '/default-album.jpg'}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-5 h-5 text-dark-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-medium text-white truncate">{album.name}</h4>
                  <p className="text-sm text-white/50">
                    {new Date(album.releaseDate).getFullYear()}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/40">暂无专辑</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistPage
