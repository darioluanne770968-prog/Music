import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SongItem } from '@/components/Song/SongItem'
import { Cover, Avatar } from '@/components/common/Avatar'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song, Artist, Playlist, HotSearch } from '@/types'

// Demo data
const HOT_SEARCHES: HotSearch[] = [
  { keyword: '周杰伦', score: 100, iconType: 'hot' },
  { keyword: '起风了', score: 95, iconType: 'up' },
  { keyword: '孤勇者', score: 90, iconType: 'hot' },
  { keyword: '稻香', score: 85 },
  { keyword: '漠河舞厅', score: 80, iconType: 'new' },
  { keyword: '陈奕迅', score: 75 },
  { keyword: '薛之谦', score: 70 },
  { keyword: '林俊杰', score: 65 },
  { keyword: '邓紫棋', score: 60 },
  { keyword: '华晨宇', score: 55 },
]

const DEMO_RESULTS: {
  songs: Song[]
  artists: Artist[]
  playlists: Playlist[]
} = {
  songs: [
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
      name: '七里香',
      artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: ['华语', '流行'] },
      album: { id: 2, name: '七里香', artist: { id: 1, name: '周杰伦', isVerified: true, followerCount: 10000000, genres: [] }, cover: 'https://picsum.photos/seed/song6/300/300', releaseDate: '2004-08-03', type: 'album', songCount: 10 },
      cover: 'https://picsum.photos/seed/song6/300/300',
      duration: 299,
      playCount: 45000000,
      likeCount: 450000,
      commentCount: 90000,
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
  ],
  artists: [
    { id: 1, name: '周杰伦', avatar: 'https://picsum.photos/seed/artist1/200/200', isVerified: true, followerCount: 10000000, genres: ['华语', '流行'] },
  ],
  playlists: [
    {
      id: 1,
      name: '周杰伦精选50首',
      creator: { id: 1, username: '官方', level: 10, exp: 0, vipLevel: 0, followerCount: 0, followingCount: 0, playlistCount: 0, createdAt: '' },
      cover: 'https://picsum.photos/seed/pl7/300/300',
      tags: ['华语', '流行'],
      isPublic: true,
      isOfficial: true,
      playCount: 5000000,
      likeCount: 50000,
      songCount: 50,
      createdAt: '',
      updatedAt: '',
    },
  ],
}

type TabType = 'all' | 'songs' | 'artists' | 'playlists' | 'albums' | 'users'

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: '综合' },
  { id: 'songs', label: '单曲' },
  { id: 'artists', label: '歌手' },
  { id: 'playlists', label: '歌单' },
  { id: 'albums', label: '专辑' },
  { id: 'users', label: '用户' },
]

export const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const { setQueue } = usePlayerStore()

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
    inputRef.current?.focus()
  }, [])

  // Handle search
  const handleSearch = (keyword: string) => {
    if (!keyword.trim()) return

    setQuery(keyword)
    setIsSearching(true)
    setShowResults(true)
    setSuggestions([])

    // Add to history
    const newHistory = [keyword, ...searchHistory.filter((h) => h !== keyword)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim()) {
      // Simulate suggestions
      setSuggestions(
        HOT_SEARCHES
          .filter((h) => h.keyword.includes(value))
          .map((h) => h.keyword)
          .slice(0, 5)
      )
    } else {
      setSuggestions([])
      setShowResults(false)
    }
  }

  // Clear history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-dark-950 border-b border-dark-100 dark:border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            className="shrink-0 p-2 -ml-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800"
            onClick={() => navigate(-1)}
          >
            <svg className="w-5 h-5 text-dark-600 dark:text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="搜索歌曲、歌手、歌单"
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => {
                    setQuery('')
                    setShowResults(false)
                    setSuggestions([])
                    inputRef.current?.focus()
                  }}
                >
                  <svg className="w-5 h-5 text-dark-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-dark-100 dark:border-dark-700 overflow-hidden z-50"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left hover:bg-dark-100 dark:hover:bg-dark-700 flex items-center gap-3"
                      onClick={() => handleSearch(suggestion)}
                    >
                      <svg className="w-4 h-4 text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-dark-900 dark:text-white">{suggestion}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="shrink-0 px-3 py-2 text-primary-500 font-medium"
            onClick={() => handleSearch(query)}
          >
            搜索
          </button>
        </div>

        {/* Tabs */}
        {showResults && (
          <div className="flex gap-4 px-4 pb-2 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`pb-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-500 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 border-transparent hover:text-dark-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {showResults ? (
          // Search Results
          <div className="space-y-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Artists */}
                {(activeTab === 'all' || activeTab === 'artists') && DEMO_RESULTS.artists.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <h3 className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-3">歌手</h3>
                    )}
                    {DEMO_RESULTS.artists.map((artist) => (
                      <div
                        key={artist.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 cursor-pointer"
                      >
                        <Avatar
                          src={artist.avatar}
                          name={artist.name}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-dark-900 dark:text-white">{artist.name}</span>
                            {artist.isVerified && (
                              <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-dark-500 dark:text-dark-400">
                            歌手 · {artist.genres?.join('/')}
                          </p>
                        </div>
                        <button className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-sm">
                          关注
                        </button>
                      </div>
                    ))}
                  </section>
                )}

                {/* Songs */}
                {(activeTab === 'all' || activeTab === 'songs') && DEMO_RESULTS.songs.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-dark-500 dark:text-dark-400">单曲</h3>
                        <button
                          className="flex items-center gap-1 text-sm text-primary-500"
                          onClick={() => setQueue(DEMO_RESULTS.songs, 0)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                          </svg>
                          播放全部
                        </button>
                      </div>
                    )}
                    <div className="bg-dark-50 dark:bg-dark-900 rounded-2xl p-2">
                      {DEMO_RESULTS.songs.map((song, index) => (
                        <SongItem
                          key={song.id}
                          song={song}
                          onClick={() => setQueue(DEMO_RESULTS.songs, index)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Playlists */}
                {(activeTab === 'all' || activeTab === 'playlists') && DEMO_RESULTS.playlists.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <h3 className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-3">歌单</h3>
                    )}
                    {DEMO_RESULTS.playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 cursor-pointer"
                      >
                        <Cover
                          src={playlist.cover}
                          alt={playlist.name}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-900 dark:text-white truncate">{playlist.name}</p>
                          <p className="text-sm text-dark-500 dark:text-dark-400">
                            {playlist.songCount}首 · by {playlist.creator.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          // Default view (history + hot)
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-dark-900 dark:text-white">搜索历史</h2>
                  <button
                    className="text-sm text-dark-500 dark:text-dark-400"
                    onClick={clearHistory}
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((keyword, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-dark-100 dark:bg-dark-800 text-sm text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700"
                      onClick={() => handleSearch(keyword)}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Hot Searches */}
            <section>
              <h2 className="font-medium text-dark-900 dark:text-white mb-3">热门搜索</h2>
              <div className="grid grid-cols-2 gap-2">
                {HOT_SEARCHES.map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-left"
                    onClick={() => handleSearch(item.keyword)}
                  >
                    <span className={`w-5 text-center font-bold ${index < 3 ? 'text-primary-500' : 'text-dark-400'}`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-dark-900 dark:text-white truncate">{item.keyword}</span>
                    {item.iconType === 'hot' && (
                      <span className="text-xs text-red-500">HOT</span>
                    )}
                    {item.iconType === 'up' && (
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14l5-5 5 5H7z" />
                      </svg>
                    )}
                    {item.iconType === 'new' && (
                      <span className="text-xs text-blue-500">NEW</span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
