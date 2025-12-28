import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SongItem } from '@/components/Song/SongItem'
import { usePlayerStore } from '@/stores/playerStore'
import { formatPlayCount } from '@/utils/format'
import type { Song, Album, Artist, Playlist } from '@/types'

const ExplorePage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const [hotSongs, setHotSongs] = useState<Song[]>([])
  const [newAlbums, setNewAlbums] = useState<Album[]>([])
  const [hotArtists, setHotArtists] = useState<Artist[]>([])
  const [hotPlaylists, setHotPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, albumsRes, playlistsRes] = await Promise.all([
          fetch('/api/search?q=&limit=10'),
          fetch('/api/albums/new?limit=8'),
          fetch('/api/playlists/hot?limit=6'),
        ])

        const [songsData, albumsData, playlistsData] = await Promise.all([
          songsRes.json(),
          albumsRes.json(),
          playlistsRes.json(),
        ])

        if (songsData.code === 200) {
          setHotSongs(songsData.data.songs || [])
          // Extract unique artists from songs
          const artists = songsData.data.artists || []
          setHotArtists(artists.slice(0, 6))
        }
        if (albumsData.code === 200) {
          setNewAlbums(albumsData.data || [])
        }
        if (playlistsData.code === 200) {
          setHotPlaylists(playlistsData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch explore data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePlaySong = (songs: Song[], index: number) => {
    setQueue(songs, index)
  }

  // Categories for quick access
  const categories = [
    { id: 'pop', name: '流行', color: 'from-pink-500 to-rose-500', icon: '🎤' },
    { id: 'rock', name: '摇滚', color: 'from-red-500 to-orange-500', icon: '🎸' },
    { id: 'hiphop', name: '说唱', color: 'from-purple-500 to-indigo-500', icon: '🎧' },
    { id: 'electronic', name: '电子', color: 'from-cyan-500 to-blue-500', icon: '🎹' },
    { id: 'folk', name: '民谣', color: 'from-green-500 to-teal-500', icon: '🪕' },
    { id: 'classical', name: '古典', color: 'from-amber-500 to-yellow-500', icon: '🎻' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="px-4 lg:px-8 pt-12 pb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">发现</h1>
        <p className="text-white/50">探索新音乐，发现新惊喜</p>
      </div>

      {/* Search bar */}
      <div className="px-4 lg:px-8 mb-6">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/search')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-white/40">搜索歌曲、歌手、专辑...</span>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="px-4 lg:px-8 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">音乐分类</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 cursor-pointer`}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-white font-medium">{cat.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hot Playlists */}
      {hotPlaylists.length > 0 && (
        <div className="px-4 lg:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">热门歌单</h2>
            <button className="text-sm text-primary-500">查看全部</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotPlaylists.map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={playlist.cover || '/default-playlist.jpg'}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-xs">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                    {formatPlayCount(playlist.playCount)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-5 h-5 text-dark-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-white truncate text-sm">{playlist.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* New Albums */}
      {newAlbums.length > 0 && (
        <div className="px-4 lg:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">新专辑上架</h2>
            <button className="text-sm text-primary-500">查看全部</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 xl:grid-cols-8">
            {newAlbums.map((album) => (
              <motion.div
                key={album.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/album/${album.id}`)}
                className="flex-shrink-0 w-32 lg:w-auto cursor-pointer group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={album.cover || '/default-album.jpg'}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-4 h-4 text-dark-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-white truncate text-sm">{album.name}</h4>
                <p className="text-xs text-white/50 truncate">{album.artist?.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hot Artists */}
      {hotArtists.length > 0 && (
        <div className="px-4 lg:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">热门歌手</h2>
            <button className="text-sm text-primary-500">查看全部</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6">
            {hotArtists.map((artist) => (
              <motion.div
                key={artist.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="flex-shrink-0 text-center cursor-pointer"
              >
                <div className="relative w-24 h-24 lg:w-full lg:aspect-square mx-auto mb-3">
                  <img
                    src={artist.avatar || '/default-artist.jpg'}
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover ring-2 ring-white/10"
                  />
                  {artist.isVerified && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-white truncate text-sm">{artist.name}</h4>
                <p className="text-xs text-white/50">{formatPlayCount(artist.followerCount)} 粉丝</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hot Songs */}
      {hotSongs.length > 0 && (
        <div className="px-4 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">热门歌曲</h2>
            <button
              onClick={() => handlePlaySong(hotSongs, 0)}
              className="flex items-center gap-2 text-sm text-primary-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
              </svg>
              播放全部
            </button>
          </div>
          <div className="space-y-1">
            {hotSongs.map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                index={index}
                showIndex
                showCover
                onClick={() => handlePlaySong(hotSongs, index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplorePage
