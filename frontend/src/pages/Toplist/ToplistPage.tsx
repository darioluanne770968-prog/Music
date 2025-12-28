import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as api from '@/services/netease'

interface ToplistItem {
  id: number
  name: string
  coverImgUrl: string
  updateFrequency: string
  description: string
  playCount: number
  trackCount: number
  tracks?: {
    first: string
    second: string
  }[]
}

const ToplistPage: React.FC = () => {
  const navigate = useNavigate()
  const [toplists, setToplists] = useState<ToplistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all toplists
  useEffect(() => {
    const fetchToplists = async () => {
      try {
        const res = await api.getToplist()
        if (res?.list) {
          setToplists(res.list)
        }
      } catch (error) {
        console.error('Failed to fetch toplists:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchToplists()
  }, [])

  // Official toplists (first 4 usually)
  const officialLists = toplists.slice(0, 4)
  // Global toplists
  const globalLists = toplists.slice(4)

  // Navigate to playlist detail page
  const handleOpenToplist = (id: number) => {
    navigate(`/playlist/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => navigate(-1)}
          >
            <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">排行榜</h1>
        </div>
      </div>

      {/* Official Charts */}
      <section className="p-4">
        <h2 className="text-sm font-medium text-white/50 mb-3">官方榜</h2>
        <div className="space-y-2">
          {officialLists.map((list) => (
            <motion.button
              key={list.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenToplist(list.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <img
                src={list.coverImgUrl}
                alt={list.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-white truncate">{list.name}</p>
                <p className="text-xs text-white/40 mt-1">{list.updateFrequency}</p>
                {list.tracks && list.tracks.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {list.tracks.slice(0, 3).map((track, i) => (
                      <p key={i} className="text-xs text-white/50 truncate">
                        {i + 1}. {track.first} - {track.second}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <svg className="w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Global Charts */}
      <section className="p-4 pt-0">
        <h2 className="text-sm font-medium text-white/50 mb-3">更多榜单</h2>
        <div className="grid grid-cols-3 gap-3">
          {globalLists.map((list) => (
            <motion.button
              key={list.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenToplist(list.id)}
              className="text-center group"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                <img
                  src={list.coverImgUrl}
                  alt={list.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-white/70 truncate">
                {list.name.replace('排行榜', '')}
              </p>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ToplistPage
