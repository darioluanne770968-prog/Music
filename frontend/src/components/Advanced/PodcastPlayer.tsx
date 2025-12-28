import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 播客播放器组件
 * 支持播客订阅、章节跳转、播放速度、睡眠定时
 */

// 播客类型
export interface Podcast {
  id: string
  title: string
  author: string
  cover: string
  description: string
  category: string
  episodes: PodcastEpisode[]
  isSubscribed: boolean
  subscribersCount: number
}

// 播客单集
export interface PodcastEpisode {
  id: string
  title: string
  description: string
  audioUrl: string
  duration: number
  publishDate: Date
  chapters?: PodcastChapter[]
  isPlayed: boolean
  playProgress: number
  isDownloaded: boolean
}

// 章节
export interface PodcastChapter {
  id: string
  title: string
  startTime: number
  endTime: number
}

// 播客播放器 Hook
export function usePodcastPlayer() {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [sleepTimer, setSleepTimer] = useState<number | null>(null)

  const play = useCallback((episode: PodcastEpisode) => {
    setCurrentEpisode(episode)
    setCurrentTime(episode.playProgress || 0)
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const seekToChapter = useCallback((chapter: PodcastChapter) => {
    setCurrentTime(chapter.startTime)
  }, [])

  const skipForward = useCallback((seconds = 30) => {
    if (!currentEpisode) return
    setCurrentTime(prev => Math.min(prev + seconds, currentEpisode.duration))
  }, [currentEpisode])

  const skipBackward = useCallback((seconds = 15) => {
    setCurrentTime(prev => Math.max(prev - seconds, 0))
  }, [])

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate)
  }, [])

  const setSleep = useCallback((minutes: number | null) => {
    setSleepTimer(minutes)
    if (minutes) {
      setTimeout(() => {
        setIsPlaying(false)
        setSleepTimer(null)
      }, minutes * 60 * 1000)
    }
  }, [])

  return {
    currentEpisode,
    isPlaying,
    currentTime,
    playbackRate,
    sleepTimer,
    play,
    pause,
    seekToChapter,
    skipForward,
    skipBackward,
    setSpeed,
    setSleep,
    setCurrentTime
  }
}

// 播客卡片组件
interface PodcastCardProps {
  podcast: Podcast
  onSubscribe: (podcastId: string) => void
  onPlay: (episode: PodcastEpisode) => void
}

export const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  onSubscribe,
  onPlay
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="bg-white/5 rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={podcast.cover}
            alt={podcast.title}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg truncate">{podcast.title}</h3>
            <p className="text-white/60 text-sm">{podcast.author}</p>
            <p className="text-white/40 text-xs mt-1">{podcast.subscribersCount} 订阅者</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onSubscribe(podcast.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  podcast.isSubscribed
                    ? 'bg-white/10 text-white/60'
                    : 'bg-primary-500 text-white'
                }`}
              >
                {podcast.isSubscribed ? '已订阅' : '订阅'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-white/40 hover:text-white"
              >
                <motion.svg
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              <p className="text-white/60 text-sm">{podcast.description}</p>

              <h4 className="text-white font-medium">最新单集</h4>
              {podcast.episodes.slice(0, 3).map(episode => (
                <EpisodeItem
                  key={episode.id}
                  episode={episode}
                  onPlay={() => onPlay(episode)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 单集列表项
interface EpisodeItemProps {
  episode: PodcastEpisode
  onPlay: () => void
  showProgress?: boolean
}

export const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  onPlay,
  showProgress = true
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days < 1) return '今天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString()
  }

  const progress = episode.playProgress / episode.duration

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <button
        onClick={onPlay}
        className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-white truncate">{episode.title}</h5>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>{formatDate(episode.publishDate)}</span>
          <span>·</span>
          <span>{formatDuration(episode.duration)}</span>
          {episode.isDownloaded && <span>✓ 已下载</span>}
        </div>

        {showProgress && progress > 0 && progress < 1 && (
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>

      <button className="p-2 text-white/40 hover:text-white">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  )
}

// 播客播放器界面
interface PodcastPlayerUIProps {
  episode: PodcastEpisode
  isPlaying: boolean
  currentTime: number
  playbackRate: number
  sleepTimer: number | null
  onPlayPause: () => void
  onSeek: (time: number) => void
  onSkipForward: () => void
  onSkipBackward: () => void
  onSetSpeed: (rate: number) => void
  onSetSleep: (minutes: number | null) => void
  onSeekToChapter: (chapter: PodcastChapter) => void
}

export const PodcastPlayerUI: React.FC<PodcastPlayerUIProps> = ({
  episode,
  isPlaying,
  currentTime,
  playbackRate,
  sleepTimer,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onSetSpeed,
  onSetSleep,
  onSeekToChapter
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showSleepMenu, setShowSleepMenu] = useState(false)
  const [showChapters, setShowChapters] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const sleepOptions = [5, 10, 15, 30, 45, 60]

  const currentChapter = episode.chapters?.find(
    ch => currentTime >= ch.startTime && currentTime < ch.endTime
  )

  return (
    <div className="p-6">
      {/* 章节信息 */}
      {currentChapter && (
        <div className="mb-4 text-center">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
            {currentChapter.title}
          </span>
        </div>
      )}

      {/* 进度条 */}
      <div className="mb-6">
        <input
          type="range"
          min={0}
          max={episode.duration}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6366f1 ${(currentTime / episode.duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / episode.duration) * 100}%)`
          }}
        />
        <div className="flex justify-between mt-2 text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(episode.duration - currentTime)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={onSkipBackward}
          className="p-3 text-white/60 hover:text-white"
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">15</span>
          </div>
        </button>

        <button
          onClick={onPlayPause}
          className="p-5 bg-primary-500 rounded-full text-white hover:bg-primary-600"
        >
          {isPlaying ? (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={onSkipForward}
          className="p-3 text-white/60 hover:text-white"
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">30</span>
          </div>
        </button>
      </div>

      {/* 辅助控制 */}
      <div className="flex items-center justify-center gap-8 mt-6">
        {/* 播放速度 */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm"
          >
            {playbackRate}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-dark-800 rounded-xl shadow-xl">
              {speeds.map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    onSetSpeed(speed)
                    setShowSpeedMenu(false)
                  }}
                  className={`block w-full px-4 py-2 text-sm rounded-lg ${
                    playbackRate === speed ? 'bg-primary-500 text-white' : 'text-white/60 hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 睡眠定时 */}
        <div className="relative">
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={`px-3 py-1 rounded-full text-sm ${
              sleepTimer ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {sleepTimer ? `${sleepTimer}分钟` : '睡眠'}
          </button>
          {showSleepMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-dark-800 rounded-xl shadow-xl">
              {sleepTimer && (
                <button
                  onClick={() => {
                    onSetSleep(null)
                    setShowSleepMenu(false)
                  }}
                  className="block w-full px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-white/10"
                >
                  取消
                </button>
              )}
              {sleepOptions.map(minutes => (
                <button
                  key={minutes}
                  onClick={() => {
                    onSetSleep(minutes)
                    setShowSleepMenu(false)
                  }}
                  className="block w-full px-4 py-2 text-sm text-white/60 rounded-lg hover:bg-white/10"
                >
                  {minutes}分钟
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 章节 */}
        {episode.chapters && episode.chapters.length > 0 && (
          <button
            onClick={() => setShowChapters(!showChapters)}
            className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm"
          >
            章节
          </button>
        )}
      </div>

      {/* 章节列表 */}
      {showChapters && episode.chapters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-white/5 rounded-xl max-h-60 overflow-auto"
        >
          {episode.chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => onSeekToChapter(chapter)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
                currentChapter?.id === chapter.id ? 'bg-primary-500/20' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-white">{chapter.title}</span>
              <span className="text-white/40 text-sm">{formatTime(chapter.startTime)}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default PodcastCard
