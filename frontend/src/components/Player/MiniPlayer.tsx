import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { Cover } from '@/components/common/Avatar'
import { PlayButton, IconButton } from '@/components/common/Button'
import { formatDuration } from '@/utils/format'

interface MiniPlayerProps {
  onExpand?: () => void
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    toggleFullScreen,
  } = usePlayerStore()

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-t border-dark-100 dark:border-dark-800 safe-bottom"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-dark-200 dark:bg-dark-700">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Cover & Info */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onExpand || toggleFullScreen}
          >
            <Cover
              src={currentSong.cover || currentSong.album?.cover}
              alt={currentSong.name}
              size="sm"
              isPlaying={isPlaying}
            />

            <div className="min-w-0">
              <h4 className="font-medium text-dark-900 dark:text-white truncate">
                {currentSong.name}
              </h4>
              <p className="text-sm text-dark-500 dark:text-dark-400 truncate">
                {currentSong.artist.name}
              </p>
            </div>
          </div>

          {/* Time Display */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400">
            <span>{formatDuration(currentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <IconButton
              label="上一首"
              onClick={playPrevious}
              className="hidden sm:flex"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </IconButton>

            <PlayButton
              isPlaying={isPlaying}
              onClick={togglePlay}
              size="sm"
            />

            <IconButton label="下一首" onClick={playNext}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </IconButton>

            <IconButton
              label="播放列表"
              onClick={() => usePlayerStore.getState().setShowQueue(true)}
              className="hidden sm:flex"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 10h11v2H3v-2zm0-4h11v2H3V6zm0 8h7v2H3v-2zm13-1v8l6-4-6-4z" />
              </svg>
            </IconButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Compact Mini Player for mobile
export const CompactMiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, toggleFullScreen } =
    usePlayerStore()

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed bottom-16 left-2 right-2 z-40 glass rounded-2xl shadow-lg cursor-pointer"
      onClick={onExpand || toggleFullScreen}
    >
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 p-2">
        <Cover
          src={currentSong.cover || currentSong.album?.cover}
          alt={currentSong.name}
          size="xs"
          isPlaying={isPlaying}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
            {currentSong.name}
          </p>
        </div>

        <button
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-500 text-white"
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
