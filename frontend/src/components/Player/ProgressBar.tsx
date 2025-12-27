import React, { useRef, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { formatDuration } from '@/utils/format'

interface ProgressBarProps {
  currentTime: number
  duration: number
  buffered?: number
  onSeek: (time: number) => void
  showTime?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  buffered = 0,
  onSeek,
  showTime = true,
  size = 'md',
  className,
}) => {
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState(0)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0

  const calculateTime = useCallback(
    (clientX: number) => {
      if (!progressRef.current || duration <= 0) return 0

      const rect = progressRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      return percentage * duration
    },
    [duration]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      const time = calculateTime(e.clientX)
      onSeek(time)
    },
    [calculateTime, onSeek]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const time = calculateTime(e.clientX)
      setHoverTime(time)

      if (progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect()
        setHoverPosition(e.clientX - rect.left)
      }

      if (isDragging) {
        onSeek(time)
      }
    },
    [calculateTime, isDragging, onSeek]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null)
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      const time = calculateTime(e.touches[0].clientX)
      onSeek(time)
    },
    [calculateTime, onSeek]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        const time = calculateTime(e.touches[0].clientX)
        onSeek(time)
      }
    },
    [calculateTime, isDragging, onSeek]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const barHeight = size === 'sm' ? 'h-0.5' : 'h-1'
  const thumbSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center gap-3">
        {showTime && (
          <span className="text-xs text-white/60 w-10 text-right tabular-nums">
            {formatDuration(currentTime)}
          </span>
        )}

        <div
          ref={progressRef}
          className={clsx(
            'relative flex-1 group cursor-pointer py-2',
            isDragging && 'cursor-grabbing'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track */}
          <div className={clsx('relative rounded-full bg-white/20', barHeight)}>
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/20 transition-all"
              style={{ width: `${bufferedProgress}%` }}
            />

            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />

            {/* Hover indicator */}
            {hoverTime !== null && !isDragging && (
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-white/50"
                style={{ left: hoverPosition }}
              />
            )}

            {/* Thumb */}
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-lg transition-transform',
                thumbSize,
                'opacity-0 group-hover:opacity-100',
                isDragging && 'opacity-100 scale-125'
              )}
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Hover time tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-full mb-2 px-2 py-1 rounded bg-dark-800 text-xs text-white pointer-events-none transform -translate-x-1/2"
              style={{ left: hoverPosition }}
            >
              {formatDuration(hoverTime)}
            </div>
          )}
        </div>

        {showTime && (
          <span className="text-xs text-white/60 w-10 tabular-nums">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    </div>
  )
}

// Simple progress bar for song lists
interface SimpleProgressBarProps {
  progress: number
  className?: string
}

export const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
  progress,
  className,
}) => {
  return (
    <div className={clsx('h-1 rounded-full bg-dark-200 dark:bg-dark-700 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-primary-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
