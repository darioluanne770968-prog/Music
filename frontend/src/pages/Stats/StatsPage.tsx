import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStatsStore } from '@/stores/statsStore'
import { usePlayerStore } from '@/stores/playerStore'

const StatsPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const {
    getTopSongs,
    getTopArtists,
    getRecentlyPlayed,
    getDailyStats,
    getTotalStats,
  } = useStatsStore()

  const topSongs = useMemo(() => getTopSongs(10), [getTopSongs])
  const topArtists = useMemo(() => getTopArtists(10), [getTopArtists])
  const recentSongs = useMemo(() => getRecentlyPlayed(10), [getRecentlyPlayed])
  const dailyStats = useMemo(() => getDailyStats(7), [getDailyStats])
  const totalStats = useMemo(() => getTotalStats(), [getTotalStats])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const formatShortDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Calculate max for chart
  const maxDailyTime = Math.max(...dailyStats.map(d => d.totalTime), 1)

  const playTopSongs = () => {
    if (topSongs.length > 0) {
      const formattedSongs = topSongs.map(song => ({
        id: song.songId,
        name: song.songName,
        title: song.songName,
        artist: song.artistName,
        artists: [{ id: song.artistId || 0, name: song.artistName }],
        album: song.albumName || '',
        albumId: song.albumId,
        cover: song.cover || '',
        duration: 0,
        isVip: false,
        mvId: 0,
      }))
      setQueue(formattedSongs, 0)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 via-dark-950/80 to-dark-950 h-64" />

        <div className="relative px-4 lg:px-8 pt-12 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">我的听歌报告</h1>
            <p className="text-white/60">记录你的音乐旅程</p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 space-y-6">
        {/* Total Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-gradient-to-br from-primary-500/20 to-accent-purple/20 rounded-2xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white">
              {formatDuration(totalStats.totalTime).split(/(\d+)/)[1] || '0'}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {totalStats.totalTime >= 3600 ? '小时' : '分钟'}
            </div>
            <div className="text-xs text-primary-400 mt-2">总时长</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white">
              {totalStats.totalSongs}
            </div>
            <div className="text-xs text-white/60 mt-1">首</div>
            <div className="text-xs text-blue-400 mt-2">播放次数</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-white">
              {totalStats.totalArtists}
            </div>
            <div className="text-xs text-white/60 mt-1">位</div>
            <div className="text-xs text-green-400 mt-2">歌手</div>
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 rounded-2xl p-4"
        >
          <h3 className="text-lg font-bold text-white mb-4">本周收听</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {dailyStats.length > 0 ? (
              dailyStats.map((day, index) => {
                const height = (day.totalTime / maxDailyTime) * 100
                const dayName = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-accent-purple rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-white/40">{dayName}</span>
                  </div>
                )
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/40">
                暂无数据
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">最常听的歌曲</h3>
            {topSongs.length > 0 && (
              <button
                onClick={playTopSongs}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                播放全部
              </button>
            )}
          </div>

          {topSongs.length > 0 ? (
            <div className="space-y-2">
              {topSongs.slice(0, 5).map((song, index) => (
                <div
                  key={song.songId}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  <img
                    src={song.cover || '/default-cover.jpg'}
                    alt={song.songName}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.songName}</p>
                    <p className="text-xs text-white/50 truncate">{song.artistName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-500">{song.playCount}次</p>
                    <p className="text-xs text-white/40">{formatShortDuration(song.totalDuration)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <p>开始听歌来生成你的专属报告吧！</p>
            </div>
          )}
        </motion.div>

        {/* Top Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800/50 rounded-2xl p-4"
        >
          <h3 className="text-lg font-bold text-white mb-4">最喜欢的歌手</h3>

          {topArtists.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {topArtists.slice(0, 5).map((artist, index) => (
                <div key={artist.name} className="flex-shrink-0 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    index === 0 ? 'bg-gradient-to-br from-primary-500 to-accent-purple' :
                    'bg-gradient-to-br from-dark-700 to-dark-800'
                  }`}>
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm font-medium text-white truncate max-w-[80px]">
                    {artist.name}
                  </p>
                  <p className="text-xs text-white/40">{artist.playCount}次</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <p>暂无数据</p>
            </div>
          )}
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary-500/10 to-accent-purple/10 rounded-2xl p-4 border border-primary-500/20"
        >
          <h3 className="text-lg font-bold text-white mb-3">🎵 趣味数据</h3>
          <div className="space-y-2 text-sm text-white/70">
            {totalStats.totalTime > 0 && (
              <>
                <p>
                  📅 你总共听了 <span className="text-primary-500 font-bold">{formatDuration(totalStats.totalTime)}</span> 的音乐
                </p>
                {topSongs[0] && (
                  <p>
                    🔥 你最爱的歌是 <span className="text-primary-500 font-bold">{topSongs[0].songName}</span>，
                    听了 <span className="text-primary-500 font-bold">{topSongs[0].playCount}</span> 次
                  </p>
                )}
                {topArtists[0] && (
                  <p>
                    ⭐ 你最喜欢的歌手是 <span className="text-primary-500 font-bold">{topArtists[0].name}</span>
                  </p>
                )}
              </>
            )}
            {totalStats.totalTime === 0 && (
              <p>开始听歌，解锁更多趣味数据！</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StatsPage
