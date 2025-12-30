import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/userStore'
import { getGreeting, formatNumber } from '@/utils/format'
import * as api from '@/services/netease'

interface Banner {
  imageUrl: string
  targetId: number
  targetType: number
  titleColor: string
  typeTitle: string
}

interface PlaylistItem {
  id: number
  name: string
  picUrl: string
  playCount: number
  trackCount?: number
}

interface SongItem {
  id: number
  name: string
  picUrl?: string
  song?: {
    artists: Array<{ id: number; name: string }>
    album: { id: number; name: string; picUrl: string }
    duration: number
    mvid?: number
    fee?: number
  }
}

interface AlbumItem {
  id: number
  name: string
  picUrl: string
  artist: { id: number; name: string }
}

const CATEGORIES = ['推荐', '华语', '欧美', '日韩', '电子', '说唱', '民谣', '摇滚', '古典']

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { setQueue } = usePlayerStore()
  const [activeCategory, setActiveCategory] = useState('推荐')
  const [currentBanner, setCurrentBanner] = useState(0)

  // 处理 Banner 点击
  const handleBannerClick = (banner: Banner) => {
    // targetType: 1=歌曲, 10=专辑, 1000=歌单, 3000=外链
    console.log('Banner clicked:', banner.targetType, banner.targetId, banner.typeTitle)
    switch (banner.targetType) {
      case 1:
        // 播放歌曲
        api.getSongDetail(banner.targetId).then(res => {
          if (res?.songs?.[0]) {
            const song = api.formatSong(res.songs[0])
            setQueue([song], 0)
          }
        })
        break
      case 10:
        navigate(`/album/${banner.targetId}`)
        break
      case 1000:
        navigate(`/playlist/${banner.targetId}`)
        break
      case 3000:
        // 外链，忽略
        break
      default:
        // 尝试作为歌曲播放
        if (banner.targetId) {
          api.getSongDetail(banner.targetId).then(res => {
            if (res?.songs?.[0]) {
              const song = api.formatSong(res.songs[0])
              setQueue([song], 0)
            }
          }).catch(() => {
            console.log('Failed to play as song')
          })
        }
    }
  }

  const [banners, setBanners] = useState<Banner[]>([])
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [newSongs, setNewSongs] = useState<SongItem[]>([])
  const [newAlbums, setNewAlbums] = useState<AlbumItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 先尝试获取个性化推荐，失败则获取热门歌单
        const [bannerRes, albumRes] = await Promise.all([
          api.getBanner(0).catch(() => null),
          api.getNewestAlbums().catch(() => null)
        ])

        if (bannerRes?.banners) {
          setBanners(bannerRes.banners.slice(0, 5))
        }

        if (albumRes?.albums) {
          setNewAlbums(albumRes.albums.slice(0, 10))
        }

        // 尝试获取个性化推荐歌单
        try {
          const playlistRes = await api.getPersonalized(12)
          if (playlistRes?.result) {
            setPlaylists(playlistRes.result)
          }
        } catch {
          // 降级为热门歌单（不需要登录）
          try {
            const hotRes = await api.getHotPlaylists(12)
            if (hotRes?.playlists) {
              setPlaylists(hotRes.playlists.map((p: any) => ({
                id: p.id,
                name: p.name,
                picUrl: p.coverImgUrl,
                playCount: p.playCount
              })))
            }
          } catch (e) {
            console.log('Failed to get playlists:', e)
          }
        }

        // 尝试获取新歌
        try {
          const newSongRes = await api.getPersonalizedNewSongs(10)
          if (newSongRes?.result) {
            setNewSongs(newSongRes.result)
          }
        } catch {
          // 降级为新歌榜
          try {
            const topRes = await api.getToplistDetail()
            if (topRes?.playlist?.tracks) {
              setNewSongs(topRes.playlist.tracks.slice(0, 10).map((t: any) => ({
                id: t.id,
                name: t.name,
                picUrl: t.al?.picUrl,
                song: {
                  artists: t.ar,
                  album: t.al,
                  duration: t.dt,
                  mvid: t.mv,
                  fee: t.fee
                }
              })))
            }
          } catch (e) {
            console.log('Failed to get new songs:', e)
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Auto rotate banners
  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  // Play new songs
  const playNewSongs = (startIndex = 0) => {
    const songs = newSongs.map(item => ({
      id: item.id,
      name: item.name,
      title: item.name,
      artist: item.song?.artists?.[0]?.name || '未知歌手',
      artists: item.song?.artists || [],
      album: item.song?.album?.name || '未知专辑',
      albumId: item.song?.album?.id,
      cover: item.picUrl || item.song?.album?.picUrl || '',
      duration: Math.floor((item.song?.duration || 0) / 1000),
      isVip: item.song?.fee === 1,
      mvId: item.song?.mvid || 0,
    }))
    setQueue(songs, startIndex)
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 h-64 bg-gradient-to-b from-primary-500/20 via-accent-purple/10 to-transparent pointer-events-none" />

        <div className="relative sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                {getGreeting()}{user ? `，${user.username}` : ''}
              </h1>
              <p className="text-sm text-white/60">发现更多好音乐</p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/search" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 px-4 lg:px-6 pb-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-4 space-y-8">
        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-8">
            <div className="rounded-2xl bg-white/5 animate-pulse aspect-[2.5/1]" />
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />)}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Banner */}
            {banners.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden aspect-[2.5/1] lg:aspect-[3/1]">
                {banners.map((banner, index) => (
                  <motion.div
                    key={index}
                    className={`absolute inset-0 cursor-pointer ${index !== currentBanner ? 'pointer-events-none' : ''}`}
                    style={{ zIndex: index === currentBanner ? 10 : 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentBanner ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleBannerClick(banner)}
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.typeTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <span className="absolute bottom-4 left-4 px-2 py-1 rounded bg-primary-500/80 text-xs text-white pointer-events-none">
                      {banner.typeTitle}
                    </span>
                  </motion.div>
                ))}

                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentBanner ? 'bg-primary-500 w-4' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentBanner(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
              {[
                { icon: '📅', label: '每日推荐', path: '/daily', color: 'from-orange-500 to-red-500' },
                { icon: '📻', label: '私人FM', path: '/fm', color: 'from-purple-500 to-pink-500' },
                { icon: '🎵', label: '歌单', path: '/explore', color: 'from-blue-500 to-cyan-500' },
                { icon: '📊', label: '排行榜', path: '/toplist', color: 'from-green-500 to-emerald-500' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {action.icon}
                  </div>
                  <span className="text-xs text-white/70">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Recommended Playlists */}
            {playlists.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold text-white">推荐歌单</h2>
                  <Link to="/explore" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    更多
                    <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                  {playlists.slice(0, 6).map((playlist) => (
                    <Link
                      key={playlist.id}
                      to={`/playlist/${playlist.id}`}
                      className="group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/10">
                        <img
                          src={playlist.picUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white flex items-center gap-0.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                          </svg>
                          {formatNumber(playlist.playCount)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
                            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {playlist.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* New Songs */}
            {newSongs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold text-white">新歌速递</h2>
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-sm"
                    onClick={() => playNewSongs(0)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                    播放全部
                  </button>
                </div>

                <div className="bg-dark-900/50 rounded-2xl p-3 ring-1 ring-white/5">
                  {newSongs.slice(0, 6).map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => playNewSongs(index)}
                    >
                      <span className="w-6 text-center text-sm text-white/40">{index + 1}</span>
                      <img
                        src={song.picUrl || song.song?.album?.picUrl}
                        alt={song.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{song.name}</p>
                        <p className="text-xs text-white/50 truncate">
                          {song.song?.artists?.map(a => a.name).join(' / ')}
                        </p>
                      </div>
                      {song.song?.fee === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">VIP</span>
                      )}
                      {song.song?.mvid && song.song.mvid > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">MV</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* New Albums */}
            {newAlbums.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold text-white">新碟上架</h2>
                  <Link to="/albums" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    更多
                    <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {newAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="shrink-0 w-36 lg:w-44 group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/10 group-hover:ring-primary-500/50 transition-all">
                        <img
                          src={album.picUrl}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                        {album.name}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {album.artist?.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* More Playlists */}
            {playlists.length > 6 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold text-white">更多推荐</h2>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                  {playlists.slice(6, 12).map((playlist) => (
                    <Link
                      key={playlist.id}
                      to={`/playlist/${playlist.id}`}
                      className="group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/10">
                        <img
                          src={playlist.picUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white flex items-center gap-0.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                          </svg>
                          {formatNumber(playlist.playCount)}
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {playlist.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
