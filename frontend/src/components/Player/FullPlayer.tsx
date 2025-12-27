import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { Cover } from '@/components/common/Avatar'
import { PlayButton, IconButton } from '@/components/common/Button'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'
import { LyricsDisplay } from '@/components/Lyrics/LyricsDisplay'
import { formatDuration } from '@/utils/format'
import type { PlayMode } from '@/types'

const playModeIcons: Record<PlayMode, { icon: JSX.Element; label: string }> = {
  sequence: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
      </svg>
    ),
    label: '顺序播放',
  },
  loop: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </svg>
    ),
    label: '列表循环',
  },
  single: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        <text x="10" y="15" fontSize="8" fontWeight="bold">
          1
        </text>
      </svg>
    ),
    label: '单曲循环',
  },
  shuffle: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
      </svg>
    ),
    label: '随机播放',
  },
  heartbeat: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    label: '心动模式',
  },
}

export const FullPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playMode,
    togglePlay,
    playNext,
    playPrevious,
    setPlayMode,
    setCurrentTime,
    isFullScreen,
    toggleFullScreen,
    isShowLyrics,
    setShowLyrics,
    setShowQueue,
  } = usePlayerStore()

  const [showVolumeControl, setShowVolumeControl] = useState(false)

  if (!currentSong || !isFullScreen) return null

  const cyclePlayMode = () => {
    const modes: PlayMode[] = ['sequence', 'loop', 'single', 'shuffle', 'heartbeat']
    const currentIndex = modes.indexOf(playMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setPlayMode(nextMode)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-dark-950"
      >
        {/* Background with blur */}
        <div className="absolute inset-0">
          {currentSong.cover && (
            <img
              src={currentSong.cover}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/80 to-dark-950" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col safe-top safe-bottom">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <IconButton label="收起" onClick={toggleFullScreen} variant="ghost">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </IconButton>

            <div className="text-center">
              <p className="text-xs text-white/60">正在播放</p>
              <p className="text-sm text-white font-medium">{currentSong.album?.name || '未知专辑'}</p>
            </div>

            <IconButton label="更多" onClick={() => {}} variant="ghost">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
            </IconButton>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {isShowLyrics ? (
              <LyricsDisplay
                currentTime={currentTime}
                onSeek={setCurrentTime}
                className="w-full max-w-lg h-[60vh]"
              />
            ) : (
              <>
                {/* Album Cover */}
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{
                    duration: 20,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'linear',
                  }}
                  className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80"
                >
                  <div className="absolute inset-0 rounded-full bg-dark-800 shadow-2xl" />
                  <div className="absolute inset-4 rounded-full overflow-hidden">
                    <img
                      src={currentSong.cover || currentSong.album?.cover || '/default-cover.jpg'}
                      alt={currentSong.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Center hole */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-dark-950 border-4 border-dark-800" />
                  </div>
                </motion.div>

                {/* Song Info */}
                <div className="mt-8 text-center">
                  <h2 className="text-xl font-bold text-white">{currentSong.name}</h2>
                  <p className="mt-1 text-white/60">{currentSong.artist.name}</p>
                </div>

                {/* Like & Comment Buttons */}
                <div className="flex items-center gap-6 mt-6">
                  <IconButton
                    label="喜欢"
                    variant="ghost"
                    isActive={currentSong.isLiked}
                  >
                    <svg
                      className={`w-6 h-6 ${currentSong.isLiked ? 'text-primary-500' : 'text-white'}`}
                      viewBox="0 0 24 24"
                      fill={currentSong.isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </IconButton>

                  <IconButton label="评论" variant="ghost">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  </IconButton>

                  <IconButton
                    label="歌词"
                    variant="ghost"
                    isActive={isShowLyrics}
                    onClick={() => setShowLyrics(true)}
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h10v-2H3v2zm16-4h-2v4h-4v2h4v4h2v-4h4v-2h-4v-4z" />
                    </svg>
                  </IconButton>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="px-6 pb-6">
            {/* Progress Bar */}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={setCurrentTime}
            />

            {/* Main Controls */}
            <div className="flex items-center justify-between mt-6">
              <IconButton
                label={playModeIcons[playMode].label}
                variant="ghost"
                onClick={cyclePlayMode}
              >
                <span className="text-white/80">{playModeIcons[playMode].icon}</span>
              </IconButton>

              <div className="flex items-center gap-6">
                <IconButton label="上一首" variant="ghost" onClick={playPrevious}>
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                  </svg>
                </IconButton>

                <PlayButton isPlaying={isPlaying} onClick={togglePlay} size="xl" />

                <IconButton label="下一首" variant="ghost" onClick={playNext}>
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </IconButton>
              </div>

              <IconButton
                label="播放列表"
                variant="ghost"
                onClick={() => setShowQueue(true)}
              >
                <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 10h11v2H3v-2zm0-4h11v2H3V6zm0 8h7v2H3v-2zm13-1v8l6-4-6-4z" />
                </svg>
              </IconButton>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="relative">
                <IconButton
                  label="音量"
                  variant="ghost"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                >
                  <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
                  </svg>
                </IconButton>
                {showVolumeControl && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                    <VolumeControl vertical />
                  </div>
                )}
              </div>

              <IconButton label="定时关闭" variant="ghost">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </IconButton>

              <IconButton label="倍速" variant="ghost">
                <span className="text-xs font-medium text-white/60">
                  {usePlayerStore.getState().playbackRate}x
                </span>
              </IconButton>

              <IconButton label="分享" variant="ghost">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                </svg>
              </IconButton>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
