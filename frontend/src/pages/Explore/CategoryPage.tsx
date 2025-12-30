import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { getTopPlaylists, formatPlaylist } from '@/services/netease'
import { formatPlayCount } from '@/utils/format'

interface Playlist {
  id: number
  name: string
  cover: string
  playCount: number
  songCount: number
  creator: {
    id: number
    name: string
    avatar: string
  }
}

// 分类映射到网易云的分类标签
const categoryMap: Record<string, string> = {
  pop: '流行',
  rock: '摇滚',
  hiphop: '说唱',
  electronic: '电子',
  folk: '民谣',
  classical: '古典',
}

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()

  const categoryName = searchParams.get('name') || categoryMap[id || ''] || '全部'
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true)
        const cat = categoryMap[id || ''] || '全部'
        const res = await getTopPlaylists(cat, 30)
        if (res?.playlists) {
          setPlaylists(res.playlists.map(formatPlaylist))
        }
      } catch (error) {
        console.error('Failed to fetch playlists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [id])

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-950/90 backdrop-blur-lg">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">{categoryName}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-white/10 mb-3" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-xs">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                    {formatPlayCount(playlist.playCount)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-glow">
                      <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
                  {playlist.name}
                </h4>
                <p className="text-xs text-white/50 mt-1 truncate">
                  by {playlist.creator?.name || '未知'}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50">暂无歌单</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
