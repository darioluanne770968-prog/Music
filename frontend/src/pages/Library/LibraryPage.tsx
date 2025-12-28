import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SongItem } from '@/components/Song/SongItem'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song, Playlist } from '@/types'

const LibraryPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue, queue } = usePlayerStore()
  const [activeTab, setActiveTab] = useState<'recent' | 'liked' | 'playlists'>('recent')
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [likedSongs, setLikedSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch playlists
        const playlistsRes = await fetch('/api/playlists/hot?limit=20')
        const playlistsData = await playlistsRes.json()
        if (playlistsData.code === 200) {
          setPlaylists(playlistsData.data || [])
        }

        // Use queue songs as recent plays for demo
        if (queue.length > 0) {
          setRecentSongs(queue.slice(0, 20))
        } else {
          // Fetch some songs as fallback
          const songsRes = await fetch('/api/search?q=&limit=20')
          const songsData = await songsRes.json()
          if (songsData.code === 200 && songsData.data.songs) {
            setRecentSongs(songsData.data.songs)
          }
        }

        // For demo, liked songs = recent songs
        setLikedSongs(recentSongs)
      } catch (error) {
        console.error('Failed to fetch library:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [queue])

  const handlePlaySong = (songs: Song[], index: number) => {
    setQueue(songs, index)
  }

  const tabs = [
    { id: 'recent' as const, label: '最近播放', icon: '🎵' },
    { id: 'liked' as const, label: '我喜欢', icon: '❤️' },
    { id: 'playlists' as const, label: '歌单', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="px-4 lg:px-8 pt-12 pb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6">我的音乐库</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-primary-500/20 to-primary-500/5 rounded-2xl p-4 border border-primary-500/20"
          >
            <div className="text-2xl mb-2">🎵</div>
            <div className="text-2xl font-bold text-white">{recentSongs.length}</div>
            <div className="text-sm text-white/50">最近播放</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-2xl p-4 border border-red-500/20"
          >
            <div className="text-2xl mb-2">❤️</div>
            <div className="text-2xl font-bold text-white">{likedSongs.length}</div>
            <div className="text-sm text-white/50">喜欢的歌</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-2xl font-bold text-white">{playlists.length}</div>
            <div className="text-sm text-white/50">创建歌单</div>
          </motion.div>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/50 mb-3">工具</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/recognition')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
              <span className="text-xs text-white/70">听歌识曲</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/listen-together')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <span className="text-xs text-white/70">一起听</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/smart-playlist')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <span className="text-xs text-white/70">智能歌单</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/stats')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
              </div>
              <span className="text-xs text-white/70">听歌统计</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/downloads')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
              </div>
              <span className="text-xs text-white/70">下载管理</span>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-dark-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Recent Songs */}
            {activeTab === 'recent' && (
              <div>
                {recentSongs.length > 0 ? (
                  <div className="space-y-1">
                    {recentSongs.map((song, index) => (
                      <SongItem
                        key={song.id}
                        song={song}
                        index={index}
                        showIndex
                        showCover
                        onClick={() => handlePlaySong(recentSongs, index)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-4">🎵</div>
                    <p className="text-white/60">还没有播放记录</p>
                    <p className="text-white/40 text-sm mt-2">去发现页面探索音乐吧</p>
                    <button
                      onClick={() => navigate('/explore')}
                      className="mt-4 px-6 py-2 rounded-full bg-primary-500 text-white text-sm"
                    >
                      去发现
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Liked Songs */}
            {activeTab === 'liked' && (
              <div>
                {likedSongs.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/50 text-sm">{likedSongs.length} 首歌曲</span>
                      <button
                        onClick={() => handlePlaySong(likedSongs, 0)}
                        className="flex items-center gap-2 text-primary-500 text-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                        </svg>
                        播放全部
                      </button>
                    </div>
                    <div className="space-y-1">
                      {likedSongs.map((song, index) => (
                        <SongItem
                          key={song.id}
                          song={song}
                          index={index}
                          showIndex
                          showCover
                          onClick={() => handlePlaySong(likedSongs, index)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-4">❤️</div>
                    <p className="text-white/60">还没有喜欢的歌曲</p>
                    <p className="text-white/40 text-sm mt-2">点击歌曲右侧的心形按钮收藏</p>
                  </div>
                )}
              </div>
            )}

            {/* Playlists */}
            {activeTab === 'playlists' && (
              <div>
                {/* Create playlist button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 mb-4 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">新建歌单</div>
                    <div className="text-sm text-white/50">创建你的专属歌单</div>
                  </div>
                </motion.button>

                {/* Playlist grid */}
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {playlists.map((playlist) => (
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
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <svg className="w-5 h-5 text-dark-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-xs text-white">
                            {playlist.songCount} 首
                          </div>
                        </div>
                        <h4 className="font-medium text-white truncate">{playlist.name}</h4>
                        <p className="text-sm text-white/50 truncate">
                          {(playlist as any).user?.username || '未知'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-white/60">还没有歌单</p>
                    <p className="text-white/40 text-sm mt-2">点击上方按钮创建你的第一个歌单</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LibraryPage
