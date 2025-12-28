import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 年度报告数据类型
export interface AnnualReportData {
  year: number
  totalListeningTime: number // 分钟
  totalSongs: number
  totalArtists: number
  topSongs: Array<{
    id: string
    name: string
    artist: string
    cover: string
    playCount: number
  }>
  topArtists: Array<{
    id: string
    name: string
    avatar: string
    playCount: number
  }>
  topGenres: Array<{
    name: string
    percentage: number
  }>
  monthlyStats: Array<{
    month: number
    minutes: number
    songs: number
  }>
  listeningPersonality: string
  favoriteTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  longestStreak: number // 连续听歌天数
  firstSongOfYear: {
    name: string
    artist: string
    date: Date
  }
  discoveredArtists: number
  achievements: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
}

interface AnnualReportProps {
  data: AnnualReportData
  onClose?: () => void
  onShare?: () => void
}

// 报告页面组件
const ReportPage: React.FC<{
  children: React.ReactNode
  bgColor?: string
}> = ({ children, bgColor = 'bg-gradient-to-br from-primary-600 to-purple-600' }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className={`absolute inset-0 ${bgColor} flex flex-col items-center justify-center p-8`}
  >
    {children}
  </motion.div>
)

export const AnnualReport: React.FC<AnnualReportProps> = ({
  data,
  onClose,
  onShare,
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 8

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 格式化听歌时间
  const formatListeningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) {
      return `${days} 天 ${hours % 24} 小时`
    }
    return `${hours} 小时 ${minutes % 60} 分钟`
  }

  // 获取时段描述
  const getTimeOfDayText = (time: string) => {
    const texts = {
      morning: '清晨的阳光',
      afternoon: '午后的惬意',
      evening: '黄昏的温暖',
      night: '深夜的宁静',
    }
    return texts[time as keyof typeof texts] || time
  }

  const pages = [
    // Page 1: Welcome
    <ReportPage key="welcome" bgColor="bg-gradient-to-br from-indigo-600 to-purple-700">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          {data.year}
        </h1>
        <p className="text-xl text-white/80 mb-8">年度音乐报告</p>
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-5xl">🎵</span>
        </div>
        <p className="text-white/60">点击继续查看</p>
      </motion.div>
    </ReportPage>,

    // Page 2: Total Listening Time
    <ReportPage key="time" bgColor="bg-gradient-to-br from-pink-600 to-rose-600">
      <div className="text-center">
        <p className="text-lg text-white/80 mb-4">这一年，你用音乐陪伴了</p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="text-6xl font-bold text-white mb-4"
        >
          {formatListeningTime(data.totalListeningTime)}
        </motion.div>
        <p className="text-white/60">
          相当于听了 {Math.round(data.totalListeningTime / 3)} 首歌
        </p>
      </div>
    </ReportPage>,

    // Page 3: Top Song
    <ReportPage key="top-song" bgColor="bg-gradient-to-br from-amber-600 to-orange-600">
      <div className="text-center">
        <p className="text-lg text-white/80 mb-4">你最爱的歌是</p>
        {data.topSongs[0] && (
          <>
            <motion.img
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              src={data.topSongs[0].cover}
              alt=""
              className="w-48 h-48 rounded-2xl mx-auto mb-6 shadow-2xl"
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {data.topSongs[0].name}
            </h2>
            <p className="text-xl text-white/80 mb-4">
              {data.topSongs[0].artist}
            </p>
            <p className="text-white/60">
              你听了 {data.topSongs[0].playCount} 次
            </p>
          </>
        )}
      </div>
    </ReportPage>,

    // Page 4: Top Artist
    <ReportPage key="top-artist" bgColor="bg-gradient-to-br from-cyan-600 to-blue-600">
      <div className="text-center">
        <p className="text-lg text-white/80 mb-4">你最常听的歌手是</p>
        {data.topArtists[0] && (
          <>
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              src={data.topArtists[0].avatar}
              alt=""
              className="w-40 h-40 rounded-full mx-auto mb-6 border-4 border-white/20"
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {data.topArtists[0].name}
            </h2>
            <p className="text-white/60">
              TA 的歌陪伴你 {data.topArtists[0].playCount} 次
            </p>
          </>
        )}
      </div>
    </ReportPage>,

    // Page 5: Genres
    <ReportPage key="genres" bgColor="bg-gradient-to-br from-green-600 to-emerald-600">
      <div className="text-center w-full max-w-md">
        <p className="text-lg text-white/80 mb-6">你的音乐口味</p>
        <div className="space-y-4">
          {data.topGenres.slice(0, 5).map((genre, index) => (
            <motion.div
              key={genre.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <span className="text-white font-medium w-20 text-right">
                {genre.name}
              </span>
              <div className="flex-1 h-8 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${genre.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <span className="text-white/80 w-12">{genre.percentage}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </ReportPage>,

    // Page 6: Listening Personality
    <ReportPage key="personality" bgColor="bg-gradient-to-br from-violet-600 to-purple-700">
      <div className="text-center">
        <p className="text-lg text-white/80 mb-4">你的听歌人格是</p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <div className="text-8xl mb-6">🎧</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {data.listeningPersonality}
          </h2>
        </motion.div>
        <p className="text-white/60">
          你喜欢在{getTimeOfDayText(data.favoriteTimeOfDay)}时听歌
        </p>
      </div>
    </ReportPage>,

    // Page 7: Achievements
    <ReportPage key="achievements" bgColor="bg-gradient-to-br from-yellow-600 to-amber-600">
      <div className="text-center w-full max-w-md">
        <p className="text-lg text-white/80 mb-6">你获得的成就</p>
        <div className="grid grid-cols-2 gap-4">
          {data.achievements.slice(0, 4).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.15 }}
              className="bg-white/20 rounded-2xl p-4"
            >
              <span className="text-4xl">{achievement.icon}</span>
              <p className="text-white font-medium mt-2">{achievement.name}</p>
              <p className="text-white/60 text-xs mt-1">{achievement.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </ReportPage>,

    // Page 8: Summary
    <ReportPage key="summary" bgColor="bg-gradient-to-br from-rose-600 to-pink-600">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          {data.year}，感谢音乐的陪伴
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-4xl font-bold text-white">{data.totalSongs}</p>
            <p className="text-white/60 text-sm">首歌曲</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">{data.totalArtists}</p>
            <p className="text-white/60 text-sm">位歌手</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">{data.longestStreak}</p>
            <p className="text-white/60 text-sm">天连续听歌</p>
          </div>
        </div>
        <p className="text-white/80">
          愿{data.year + 1}年，音乐继续陪伴你
        </p>
      </div>
    </ReportPage>,
  ]

  return (
    <div className="fixed inset-0 bg-dark-950 z-50">
      {/* Page Container */}
      <div className="relative h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {pages[currentPage]}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
        {/* Progress Dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentPage ? 'bg-white w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      </button>

      {/* Touch Navigation Areas */}
      <button
        onClick={prevPage}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-5"
        disabled={currentPage === 0}
      />
      <button
        onClick={nextPage}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-5"
        disabled={currentPage === totalPages - 1}
      />
    </div>
  )
}

export default AnnualReport
