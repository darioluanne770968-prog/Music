import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { clsx } from 'clsx'

interface SleepTimerProps {
  isOpen: boolean
  onClose: () => void
}

interface TimerOption {
  label: string
  minutes: number
  icon: string
}

const TIMER_OPTIONS: TimerOption[] = [
  { label: '关闭', minutes: 0, icon: '❌' },
  { label: '15分钟', minutes: 15, icon: '⏱️' },
  { label: '30分钟', minutes: 30, icon: '⏱️' },
  { label: '45分钟', minutes: 45, icon: '⏱️' },
  { label: '1小时', minutes: 60, icon: '🕐' },
  { label: '90分钟', minutes: 90, icon: '🕐' },
  { label: '2小时', minutes: 120, icon: '🕑' },
  { label: '播完当前歌曲', minutes: -1, icon: '🎵' },
]

// Global timer state
let sleepTimeout: NodeJS.Timeout | null = null
let endTime: number | null = null

export const SleepTimer: React.FC<SleepTimerProps> = ({ isOpen, onClose }) => {
  const { pause, currentSong } = usePlayerStore()
  const [selectedOption, setSelectedOption] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [isStopAfterCurrent, setIsStopAfterCurrent] = useState(false)

  // Calculate remaining time
  useEffect(() => {
    if (!endTime) {
      setRemainingTime(null)
      return
    }

    const updateRemaining = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime! - now) / 1000))
      setRemainingTime(remaining)

      if (remaining <= 0) {
        handleTimerEnd()
      }
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  // Handle stop after current song
  useEffect(() => {
    if (!isStopAfterCurrent) return

    const unsubscribe = usePlayerStore.subscribe((state, prevState) => {
      if (prevState.currentSong?.id !== state.currentSong?.id) {
        // Song changed, stop playback
        pause()
        setIsStopAfterCurrent(false)
        setSelectedOption(0)
      }
    })

    return () => unsubscribe()
  }, [isStopAfterCurrent, pause])

  const handleTimerEnd = useCallback(() => {
    pause()
    endTime = null
    sleepTimeout = null
    setSelectedOption(0)
    setRemainingTime(null)
  }, [pause])

  const selectOption = (option: TimerOption, index: number) => {
    // Clear existing timer
    if (sleepTimeout) {
      clearTimeout(sleepTimeout)
      sleepTimeout = null
    }
    endTime = null
    setIsStopAfterCurrent(false)

    if (option.minutes === 0) {
      // Disable timer
      setSelectedOption(0)
      setRemainingTime(null)
    } else if (option.minutes === -1) {
      // Stop after current song
      setIsStopAfterCurrent(true)
      setSelectedOption(index)
      setRemainingTime(null)
    } else {
      // Set timer
      const duration = option.minutes * 60 * 1000
      endTime = Date.now() + duration
      setSelectedOption(index)
      setRemainingTime(option.minutes * 60)

      sleepTimeout = setTimeout(() => {
        handleTimerEnd()
      }, duration)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900 rounded-t-3xl max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-lg font-bold text-white">定时关闭</h2>
              {remainingTime !== null && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  <span className="text-sm text-primary-500 font-medium tabular-nums">
                    {formatTime(remainingTime)}
                  </span>
                </div>
              )}
              {isStopAfterCurrent && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20">
                  <span className="text-sm text-primary-500">播完停止</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="px-6 text-sm text-white/50 mb-4">
              设置定时关闭后，音乐将在指定时间后自动停止播放
            </p>

            {/* Options */}
            <div className="px-6 pb-8">
              <div className="grid grid-cols-2 gap-3">
                {TIMER_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectOption(option, index)}
                    className={clsx(
                      'flex items-center gap-3 p-4 rounded-xl transition-all',
                      selectedOption === index
                        ? 'bg-primary-500/20 ring-1 ring-primary-500'
                        : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className={clsx(
                      'font-medium',
                      selectedOption === index ? 'text-primary-500' : 'text-white'
                    )}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Current Status */}
            {(remainingTime !== null || isStopAfterCurrent) && (
              <div className="px-6 pb-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">定时关闭已开启</p>
                    <p className="text-sm text-white/60">
                      {isStopAfterCurrent
                        ? `播完「${currentSong?.name || '当前歌曲'}」后停止`
                        : `还有 ${formatTime(remainingTime!)} 后停止播放`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="px-6 pb-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm text-white/70">小提示</p>
                  <p className="text-xs text-white/50 mt-1">
                    定时关闭适合睡前听歌，音乐会逐渐变小声后停止播放
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SleepTimer
