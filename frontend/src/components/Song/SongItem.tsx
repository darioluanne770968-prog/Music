import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Cover } from '@/components/common/Avatar'
import { IconButton } from '@/components/common/Button'
import { usePlayerStore } from '@/stores/playerStore'
import { formatDuration } from '@/utils/format'
import type { Song } from '@/types'

interface SongItemProps {
  song: Song
  index?: number
  showCover?: boolean
  showDuration?: boolean
  showArtist?: boolean
  showAlbum?: boolean
  showIndex?: boolean
  showActions?: boolean
  isActive?: boolean
  onClick?: () => void
  onPlay?: () => void
  onLike?: () => void
  onMore?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'card'
}

export const SongItem: React.FC<SongItemProps> = ({
  song,
  index,
  showCover = true,
  showDuration = true,
  showArtist = true,
  showAlbum = false,
  showIndex = false,
  showActions = true,
  isActive,
  onClick,
  onPlay,
  onLike,
  onMore,
  className,
  variant = 'default',
}) => {
  const { currentSong, isPlaying, setCurrentSong, play, pause } = usePlayerStore()

  const isCurrentSong = currentSong?.id === song.id
  const isCurrentlyPlaying = isCurrentSong && isPlaying

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setCurrentSong(song)
      play()
    }
  }

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrentSong) {
      if (isPlaying) {
        pause()
      } else {
        play()
      }
    } else {
      setCurrentSong(song)
      play()
    }
  }

  if (variant === 'card') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'p-3 rounded-2xl cursor-pointer transition-colors',
          isActive
            ? 'bg-primary-500/10 border border-primary-500/30'
            : 'hover:bg-dark-100 dark:hover:bg-dark-800',
          className
        )}
        onClick={handleClick}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 group">
          <img
            src={song.cover || song.album?.cover || '/default-cover.jpg'}
            alt={song.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              className="w-12 h-12 rounded-full bg-white text-dark-900 flex items-center justify-center"
              onClick={handlePlayPause}
            >
              {isCurrentlyPlaying ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                </svg>
              )}
            </button>
          </div>
          {isCurrentlyPlaying && (
            <div className="absolute bottom-2 right-2 flex items-end gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-primary-500 rounded-full animate-pulse"
                  style={{
                    height: 8 + Math.random() * 8,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <h4 className="font-medium text-dark-900 dark:text-white truncate">{song.name}</h4>
        <p className="text-sm text-dark-500 dark:text-dark-400 truncate">{song.artist.name}</p>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer transition-colors',
          isActive
            ? 'bg-primary-500/10'
            : 'hover:bg-dark-100 dark:hover:bg-dark-800',
          className
        )}
        onClick={handleClick}
      >
        {showCover && (
          <Cover
            src={song.cover || song.album?.cover}
            alt={song.name}
            size="xs"
            isPlaying={isCurrentlyPlaying}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium truncate',
            isCurrentSong ? 'text-primary-500' : 'text-dark-900 dark:text-white'
          )}>
            {song.name}
          </p>
        </div>
        {showDuration && (
          <span className="text-xs text-dark-500 dark:text-dark-400">
            {formatDuration(song.duration)}
          </span>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={clsx(
        'flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer group transition-colors',
        isActive && 'bg-primary-500/10',
        isCurrentSong && 'bg-primary-500/5',
        className
      )}
      onClick={handleClick}
    >
      {/* Index or Play indicator */}
      {showIndex && (
        <div className="w-8 text-center">
          {isCurrentlyPlaying ? (
            <div className="flex items-center justify-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-primary-500 rounded-full animate-pulse"
                  style={{ height: 8 + Math.random() * 8, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            <span className={clsx(
              'text-sm',
              isCurrentSong ? 'text-primary-500 font-medium' : 'text-white/40'
            )}>
              {(index ?? 0) + 1}
            </span>
          )}
        </div>
      )}

      {/* Cover */}
      {showCover && (
        <div className="relative">
          <Cover
            src={song.cover || song.album?.cover}
            alt={song.name}
            size="md"
            showPlayIcon
            onClick={handlePlayPause}
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={clsx(
          'font-medium truncate',
          isCurrentSong ? 'text-primary-500' : 'text-white'
        )}>
          {song.name}
          {song.isVip && (
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-400 text-white">
              VIP
            </span>
          )}
        </h4>
        {(showArtist || showAlbum) && (
          <p className="text-sm text-white/50 truncate">
            {showArtist && song.artist.name}
            {showArtist && showAlbum && song.album && ' - '}
            {showAlbum && song.album?.name}
          </p>
        )}
      </div>

      {/* Duration */}
      {showDuration && (
        <span className="text-sm text-white/40 tabular-nums">
          {formatDuration(song.duration)}
        </span>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton
            label={song.isLiked ? '取消喜欢' : '喜欢'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onLike?.()
            }}
          >
            <svg
              className={clsx('w-5 h-5', song.isLiked ? 'text-primary-500' : 'text-white/40')}
              viewBox="0 0 24 24"
              fill={song.isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </IconButton>

          <IconButton
            label="更多"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMore?.()
            }}
          >
            <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </IconButton>
        </div>
      )}
    </motion.div>
  )
}

// Song List
interface SongListProps {
  songs: Song[]
  showIndex?: boolean
  showCover?: boolean
  emptyText?: string
  className?: string
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  showIndex = true,
  showCover = true,
  emptyText = '暂无歌曲',
  className,
}) => {
  const { setQueue } = usePlayerStore()

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0)
    }
  }

  if (songs.length === 0) {
    return (
      <div className="py-12 text-center text-dark-500 dark:text-dark-400">
        {emptyText}
      </div>
    )
  }

  return (
    <div className={className}>
      {songs.map((song, index) => (
        <SongItem
          key={song.id}
          song={song}
          index={index}
          showIndex={showIndex}
          showCover={showCover}
          onClick={() => setQueue(songs, index)}
        />
      ))}
    </div>
  )
}
