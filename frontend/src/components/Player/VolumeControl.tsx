import React, { useRef, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { usePlayerStore } from '@/stores/playerStore'
import { IconButton } from '@/components/common/Button'

interface VolumeControlProps {
  vertical?: boolean
  className?: string
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  vertical = false,
  className,
}) => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayVolume = isMuted ? 0 : volume

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      )
    }
    if (volume < 0.5) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
      </svg>
    )
  }

  const calculateVolume = useCallback(
    (clientX: number, clientY: number) => {
      if (!sliderRef.current) return volume

      const rect = sliderRef.current.getBoundingClientRect()

      if (vertical) {
        const y = rect.bottom - clientY
        return Math.max(0, Math.min(1, y / rect.height))
      } else {
        const x = clientX - rect.left
        return Math.max(0, Math.min(1, x / rect.width))
      }
    },
    [vertical, volume]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      const newVolume = calculateVolume(e.clientX, e.clientY)
      setVolume(newVolume)
    },
    [calculateVolume, setVolume]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const newVolume = calculateVolume(e.clientX, e.clientY)
        setVolume(newVolume)
      }
    },
    [isDragging, calculateVolume, setVolume]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (vertical) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-800/90 backdrop-blur-lg shadow-xl',
          className
        )}
      >
        <div
          ref={sliderRef}
          className="relative w-1 h-24 rounded-full bg-white/20 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Fill */}
          <div
            className="absolute bottom-0 left-0 w-full rounded-full bg-white transition-all"
            style={{ height: `${displayVolume * 100}%` }}
          />

          {/* Thumb */}
          <div
            className={clsx(
              'absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow transition-transform',
              isDragging && 'scale-125'
            )}
            style={{ bottom: `calc(${displayVolume * 100}% - 6px)` }}
          />
        </div>

        <IconButton label="静音" variant="ghost" size="sm" onClick={toggleMute}>
          <span className="text-white/80">{getVolumeIcon()}</span>
        </IconButton>
      </div>
    )
  }

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <IconButton label="静音" variant="ghost" size="sm" onClick={toggleMute}>
        <span className="text-dark-500 dark:text-dark-400">{getVolumeIcon()}</span>
      </IconButton>

      <div
        ref={sliderRef}
        className="relative w-20 h-1 rounded-full bg-dark-200 dark:bg-dark-700 cursor-pointer group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${displayVolume * 100}%` }}
        />

        {/* Thumb */}
        <div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-500 shadow transition-transform opacity-0 group-hover:opacity-100',
            isDragging && 'opacity-100 scale-125'
          )}
          style={{ left: `${displayVolume * 100}%` }}
        />
      </div>

      <span className="text-xs text-dark-500 dark:text-dark-400 w-8 tabular-nums">
        {Math.round(displayVolume * 100)}%
      </span>
    </div>
  )
}
