import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Cover } from '@/components/common/Avatar'
import { SongItem } from '@/components/Song/SongItem'
import { usePlayerStore } from '@/stores/playerStore'
import { useUserStore } from '@/stores/userStore'
import { getGreeting, formatNumber } from '@/utils/format'
import type { Song, Playlist, Artist } from '@/types'

// Demo data
const DEMO_BANNERS = [
  { id: 1, image: 'https://picsum.photos/seed/banner1/800/300', title: '新歌首发' },
  { id: 2, image: 'https://picsum.photos/seed/banner2/800/300', title: '热门推荐' },
  { id: 3, image: 'https://picsum.photos/seed/banner3/800/300', title: '独家专辑' },
]

const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: 1,
    name: '今日推荐',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl1/300/300',
    description: '根据你的口味生成',
    tags: ['推荐'],
    isPublic: true,
    isOfficial: true,
    playCount: 1234567,
    likeCount: 12345,
    songCount: 30,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    name: '热门华语',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl2/300/300',
    tags: ['华语', '流行'],
    isPublic: true,
    isOfficial: true,
    playCount: 2345678,
    likeCount: 23456,
    songCount: 50,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    name: '轻音乐助眠',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl3/300/300',
    tags: ['轻音乐', '助眠'],
    isPublic: true,
    isOfficial: false,
    playCount: 876543,
    likeCount: 8765,
    songCount: 25,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 4,
    name: '运动能量',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl4/300/300',
    tags: ['运动', '电子'],
    isPublic: true,
    isOfficial: false,
    playCount: 654321,
    likeCount: 6543,
    songCount: 40,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 5,
    name: '经典老歌',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl5/300/300',
    tags: ['经典', '怀旧'],
    isPublic: true,
    isOfficial: false,
    playCount: 543210,
    likeCount: 5432,
    songCount: 60,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 6,
    name: '欧美精选',
    creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
    cover: 'https://picsum.photos/seed/pl6/300/300',
    tags: ['欧美', '流行'],
    isPublic: true,
    isOfficial: true,
    playCount: 432109,
    likeCount: 4321,
    songCount: 45,
    createdAt: '',
    updatedAt: '',
  },
]

const DEMO_SONGS: Song[] = [
  {
    id: 1,
    name: '晴天',
    artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: ['华语', '流行'] },
    album: { id: 1, name: '叶惠美', artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: [] }, cover: 'https://picsum.photos/seed/song1/300/300', releaseDate: '2003-07-31', type: 'album', songCount: 11 },
    cover: 'https://picsum.photos/seed/song1/300/300',
    duration: 269,
    playCount: 50000000,
    likeCount: 500000,
    commentCount: 100000,
    isVip: false,
    hasLyrics: true,
    hasMv: true,
  },
  {
    id: 2,
    name: '起风了',
    artist: { id: 2, name: '买辣椒也用券', isVerified: true, followerCount: 5000000, genres: ['华语', '民谣'] },
    album: { id: 2, name: '起风了', artist: { id: 2, name: '买辣椒也用券', isVerified: true, followerCount: 5000000, genres: [] }, cover: 'https://picsum.photos/seed/song2/300/300', releaseDate: '2017-02-17', type: 'single', songCount: 1 },
    cover: 'https://picsum.photos/seed/song2/300/300',
    duration: 325,
    playCount: 40000000,
    likeCount: 400000,
    commentCount: 80000,
    isVip: false,
    hasLyrics: true,
    hasMv: true,
  },
  {
    id: 3,
    name: '稻香',
    artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: ['华语', '流行'] },
    album: { id: 3, name: '魔杰座', artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: [] }, cover: 'https://picsum.photos/seed/song3/300/300', releaseDate: '2008-10-15', type: 'album', songCount: 11 },
    cover: 'https://picsum.photos/seed/song3/300/300',
    duration: 223,
    playCount: 45000000,
    likeCount: 450000,
    commentCount: 90000,
    isVip: false,
    hasLyrics: true,
    hasMv: true,
  },
  {
    id: 4,
    name: '孤勇者',
    artist: { id: 3, name: '陈奕迅', isVerified: true, followerCount: 8000000, genres: ['华语', '流行'] },
    album: { id: 4, name: '孤勇者', artist: { id: 3, name: '陈奕迅', isVerified: true, followerCount: 8000000, genres: [] }, cover: 'https://picsum.photos/seed/song4/300/300', releaseDate: '2021-11-08', type: 'single', songCount: 1 },
    cover: 'https://picsum.photos/seed/song4/300/300',
    duration: 262,
    playCount: 60000000,
    likeCount: 600000,
    commentCount: 120000,
    isVip: false,
    hasLyrics: true,
    hasMv: true,
  },
  {
    id: 5,
    name: '漠河舞厅',
    artist: { id: 4, name: '柳爽', isVerified: true, followerCount: 2000000, genres: ['华语', '民谣'] },
    album: { id: 5, name: '漠河舞厅', artist: { id: 4, name: '柳爽', isVerified: true, followerCount: 2000000, genres: [] }, cover: 'https://picsum.photos/seed/song5/300/300', releaseDate: '2020-08-05', type: 'single', songCount: 1 },
    cover: 'https://picsum.photos/seed/song5/300/300',
    duration: 292,
    playCount: 30000000,
    likeCount: 300000,
    commentCount: 60000,
    isVip: false,
    hasLyrics: true,
    hasMv: true,
  },
]

const CATEGORIES = ['推荐', '华语', '欧美', '日韩', '电子', '说唱', '民谣', '摇滚', '古典']

export const HomePage: React.FC = () => {
  const { user } = useUserStore()
  const { setQueue } = usePlayerStore()
  const [activeCategory, setActiveCategory] = React.useState('推荐')
  const [currentBanner, setCurrentBanner] = React.useState(0)

  // Auto rotate banners
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % DEMO_BANNERS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-white">
              {getGreeting()}{user ? `，${user.username}` : ''}
            </h1>
            <p className="text-sm text-dark-500 dark:text-dark-400">发现更多好音乐</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800">
              <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800">
              <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden aspect-[2.5/1]">
          {DEMO_BANNERS.map((banner, index) => (
            <motion.div
              key={banner.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentBanner ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                {banner.title}
              </h3>
            </motion.div>
          ))}

          {/* Indicators */}
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {DEMO_BANNERS.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📅', label: '每日推荐', color: 'from-orange-500 to-red-500' },
            { icon: '📻', label: '私人FM', color: 'from-purple-500 to-pink-500' },
            { icon: '🎵', label: '歌单', color: 'from-blue-500 to-cyan-500' },
            { icon: '📊', label: '排行榜', color: 'from-green-500 to-emerald-500' },
          ].map((action) => (
            <Link
              key={action.label}
              to={`/${action.label}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-dark-50 dark:bg-dark-800 hover:scale-105 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl`}>
                {action.icon}
              </div>
              <span className="text-xs text-dark-600 dark:text-dark-400">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recommended Playlists */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">推荐歌单</h2>
            <Link to="/playlists" className="text-sm text-primary-500">更多</Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {DEMO_PLAYLISTS.slice(0, 6).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-xs text-white flex items-center gap-0.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                    {formatNumber(playlist.playCount)}
                  </div>
                </div>
                <p className="text-sm text-dark-900 dark:text-white line-clamp-2">
                  {playlist.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Songs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">热门歌曲</h2>
            <button
              className="flex items-center gap-1 text-sm text-primary-500"
              onClick={() => setQueue(DEMO_SONGS, 0)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
              </svg>
              播放全部
            </button>
          </div>

          <div className="bg-dark-50 dark:bg-dark-900 rounded-2xl p-2">
            {DEMO_SONGS.map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                index={index}
                showIndex
                onClick={() => setQueue(DEMO_SONGS, index)}
              />
            ))}
          </div>
        </section>

        {/* New Albums */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">新碟上架</h2>
            <Link to="/albums" className="text-sm text-primary-500">更多</Link>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {DEMO_SONGS.map((song) => (
              <Link
                key={song.id}
                to={`/album/${song.album?.id}`}
                className="shrink-0 w-32"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2">
                  <img
                    src={song.album?.cover}
                    alt={song.album?.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                  {song.album?.name}
                </p>
                <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                  {song.artist.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
