import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { usePlayerStore } from '@/stores/playerStore'
import * as api from '@/services/netease'

interface SearchResults {
  songs: any[]
  artists: any[]
  albums: any[]
  playlists: any[]
}

interface HotSearch {
  searchWord: string
  score: number
  iconType?: number
  content?: string
}

type TabType = 'all' | 'songs' | 'artists' | 'playlists' | 'albums'

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: '综合' },
  { id: 'songs', label: '单曲' },
  { id: 'artists', label: '歌手' },
  { id: 'playlists', label: '歌单' },
  { id: 'albums', label: '专辑' },
]

export const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [hotSearches, setHotSearches] = useState<HotSearch[]>([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    songs: [],
    artists: [],
    albums: [],
    playlists: [],
  })
  const { setQueue } = usePlayerStore()

  // Load search history and hot searches
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
    inputRef.current?.focus()

    // Fetch hot searches
    api.searchHot()
      .then((data) => {
        if (data?.data) {
          setHotSearches(data.data.slice(0, 20))
        }
      })
      .catch(console.error)
  }, [])

  // Handle search
  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return

    setQuery(keyword)
    setIsSearching(true)
    setShowResults(true)
    setSuggestions([])

    // Add to history
    const newHistory = [keyword, ...searchHistory.filter((h) => h !== keyword)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    try {
      // Search for different types in parallel
      const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
        api.search(keyword, 1, 20), // Songs
        api.search(keyword, 100, 10), // Artists
        api.search(keyword, 10, 10), // Albums
        api.search(keyword, 1000, 10), // Playlists
      ])

      setResults({
        songs: songsRes?.result?.songs || [],
        artists: artistsRes?.result?.artists || [],
        albums: albumsRes?.result?.albums || [],
        playlists: playlistsRes?.result?.playlists || [],
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [searchHistory])

  // Handle input change with suggestions
  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim().length >= 1) {
      try {
        const data = await api.searchSuggest(value)
        if (data?.result) {
          const items: any[] = []
          if (data.result.songs) {
            data.result.songs.slice(0, 3).forEach((s: any) => {
              items.push({ type: 'song', name: s.name, artist: s.artists?.[0]?.name })
            })
          }
          if (data.result.artists) {
            data.result.artists.slice(0, 2).forEach((a: any) => {
              items.push({ type: 'artist', name: a.name })
            })
          }
          setSuggestions(items)
        }
      } catch (error) {
        console.error('Suggestion error:', error)
      }
    } else {
      setSuggestions([])
      setShowResults(false)
    }
  }, [])

  // Clear history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  // Play songs from search results
  const playSongs = (songs: any[], startIndex = 0) => {
    const formattedSongs = songs.map((song) => ({
      id: song.id,
      name: song.name,
      title: song.name,
      artist: song.ar?.[0]?.name || song.artists?.[0]?.name || '未知歌手',
      artists: song.ar || song.artists || [],
      album: song.al?.name || song.album?.name || '未知专辑',
      albumId: song.al?.id || song.album?.id,
      cover: song.al?.picUrl || song.album?.picUrl || '',
      duration: Math.floor((song.dt || song.duration) / 1000),
      isVip: song.fee === 1,
      mvId: song.mv || song.mvid || 0,
    }))
    setQueue(formattedSongs, startIndex)
  }

  const formatPlayCount = (count: number) => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
    return count?.toString() || '0'
  }

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            className="shrink-0 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => navigate(-1)}
          >
            <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
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
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
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
                  <svg className="w-5 h-5 text-white/40 hover:text-white/60" viewBox="0 0 24 24" fill="currentColor">
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
                  className="absolute top-full left-0 right-0 mt-2 bg-dark-800 rounded-xl shadow-lg border border-white/10 overflow-hidden z-50"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                      onClick={() => handleSearch(suggestion.name)}
                    >
                      <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-white">{suggestion.name}</span>
                      {suggestion.artist && (
                        <span className="text-xs text-white/40">- {suggestion.artist}</span>
                      )}
                      <span className="text-xs text-white/40 ml-auto">{suggestion.type === 'song' ? '单曲' : '歌手'}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="shrink-0 px-3 py-2 text-primary-400 font-medium hover:text-primary-300 transition-colors"
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
                    : 'text-white/50 border-transparent hover:text-white'
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
                {/* No Results */}
                {results.songs.length === 0 && results.artists.length === 0 &&
                 results.albums.length === 0 && results.playlists.length === 0 && (
                  <div className="py-20 text-center">
                    <svg className="w-16 h-16 mx-auto text-white/20 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-white/40">没有找到相关结果</p>
                    <p className="text-white/30 text-sm mt-1">换个关键词试试</p>
                  </div>
                )}

                {/* Artists */}
                {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <h3 className="text-sm font-medium text-white/50 mb-3">歌手</h3>
                    )}
                    {results.artists.slice(0, activeTab === 'all' ? 3 : 20).map((artist) => (
                      <Link
                        key={artist.id}
                        to={`/artist/${artist.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img
                          src={artist.img1v1Url || artist.picUrl}
                          alt={artist.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{artist.name}</span>
                            {artist.accountId && (
                              <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-white/50">
                            {artist.alias?.length > 0 ? artist.alias[0] : '歌手'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </section>
                )}

                {/* Songs */}
                {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/50">单曲</h3>
                        <button
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm hover:bg-primary-500/30 transition-colors"
                          onClick={() => playSongs(results.songs, 0)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                          </svg>
                          播放全部
                        </button>
                      </div>
                    )}
                    <div className="bg-dark-900/50 rounded-2xl p-2 ring-1 ring-white/5">
                      {results.songs.slice(0, activeTab === 'all' ? 5 : 50).map((song, index) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => playSongs(results.songs, index)}
                        >
                          <img
                            src={song.al?.picUrl || song.album?.picUrl}
                            alt={song.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{song.name}</p>
                            <p className="text-xs text-white/50 truncate">
                              {(song.ar || song.artists)?.map((a: any) => a.name).join(' / ')} - {song.al?.name || song.album?.name}
                            </p>
                          </div>
                          {song.fee === 1 && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">VIP</span>
                          )}
                          {(song.mv > 0 || song.mvid > 0) && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">MV</span>
                          )}
                          <span className="text-sm text-white/40 w-12 text-right">
                            {formatDuration(song.dt || song.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <h3 className="text-sm font-medium text-white/50 mb-3">专辑</h3>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      {results.albums.slice(0, activeTab === 'all' ? 6 : 30).map((album) => (
                        <Link
                          key={album.id}
                          to={`/album/${album.id}`}
                          className="group cursor-pointer"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/10">
                            <img
                              src={album.picUrl}
                              alt={album.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-sm text-white truncate">{album.name}</p>
                          <p className="text-xs text-white/50 truncate">{album.artist?.name}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Playlists */}
                {(activeTab === 'all' || activeTab === 'playlists') && results.playlists.length > 0 && (
                  <section>
                    {activeTab === 'all' && (
                      <h3 className="text-sm font-medium text-white/50 mb-3">歌单</h3>
                    )}
                    {results.playlists.slice(0, activeTab === 'all' ? 5 : 20).map((playlist) => (
                      <Link
                        key={playlist.id}
                        to={`/playlist/${playlist.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img
                          src={playlist.coverImgUrl}
                          alt={playlist.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{playlist.name}</p>
                          <p className="text-sm text-white/50">
                            {playlist.trackCount}首 · {formatPlayCount(playlist.playCount)}次播放
                          </p>
                        </div>
                      </Link>
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
                  <h2 className="font-medium text-white">搜索历史</h2>
                  <button
                    className="text-sm text-white/40 hover:text-white/60 transition-colors"
                    onClick={clearHistory}
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((keyword, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20 hover:text-white transition-colors"
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
              <h2 className="font-medium text-white mb-3">热搜榜</h2>
              <div className="space-y-1">
                {hotSearches.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-left transition-colors"
                    onClick={() => handleSearch(item.searchWord)}
                  >
                    <span className={`w-6 text-center font-bold ${index < 3 ? 'text-primary-500' : 'text-white/30'}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-white ${index < 3 ? 'font-medium' : ''}`}>{item.searchWord}</span>
                        {item.iconType === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">HOT</span>
                        )}
                        {item.iconType === 5 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400">UP</span>
                        )}
                      </div>
                      {item.content && (
                        <p className="text-xs text-white/40 truncate mt-0.5">{item.content}</p>
                      )}
                    </div>
                    <span className="text-xs text-white/30">{formatPlayCount(item.score)}</span>
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
