import React, { useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { usePlayerStore } from '@/stores/playerStore'
import { parseLyrics, findCurrentLineIndex, calculateWordProgress } from '@/utils/lrcParser'
import type { LyricLine } from '@/types'

interface LyricsDisplayProps {
  currentTime: number
  onSeek?: (time: number) => void
  className?: string
  lyrics?: LyricLine[]
}

// Demo lyrics for testing
const DEMO_LYRICS = `[00:00.00] 作曲 : Demo
[00:01.00] 作词 : Demo
[00:04.00]等待是最漫长的借口
[00:08.50]相见不如怀念的沉默
[00:13.00]你说过的话都还记得
[00:17.50]只是时间不会再回头
[00:22.00]
[00:26.00]每一秒都是新的选择
[00:30.50]每一步都在靠近或远离
[00:35.00]有些故事注定要经过
[00:39.50]有些人注定只能错过
[00:44.00]
[00:48.00]如果时光可以倒流
[00:52.50]我会选择不让你走
[00:57.00]可惜没有如果
[01:01.50]只剩下你的轮廓
[01:06.00]
[01:10.00]记忆里的你还是那么温柔
[01:14.50]笑起来像阳光一样明亮
[01:19.00]可我已经学会了放手
[01:23.50]让你去找属于你的远方
`

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  currentTime,
  onSeek,
  className,
  lyrics: propLyrics,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<(HTMLDivElement | null)[]>([])
  const { currentSong } = usePlayerStore()

  // Parse lyrics
  const lyrics = useMemo(() => {
    if (propLyrics) return propLyrics
    // In real app, fetch lyrics from API
    return parseLyrics(DEMO_LYRICS)
  }, [propLyrics])

  // Find current line
  const currentLineIndex = useMemo(() => {
    return findCurrentLineIndex(lyrics, currentTime, 0)
  }, [lyrics, currentTime])

  // Scroll to current line
  useEffect(() => {
    if (currentLineIndex < 0 || !containerRef.current) return

    const lineElement = linesRef.current[currentLineIndex]
    if (!lineElement) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const lineRect = lineElement.getBoundingClientRect()

    // Calculate scroll position to center the current line
    const scrollTop =
      lineElement.offsetTop -
      container.offsetTop -
      containerRect.height / 2 +
      lineRect.height / 2

    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    })
  }, [currentLineIndex])

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="text-center text-white/40">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h10v-2H3v2zm16-4h-2v4h-4v2h4v4h2v-4h4v-2h-4v-4z" />
          </svg>
          <p>暂无歌词</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'overflow-y-auto scrollbar-hide px-4',
        className
      )}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <div className="py-[40%]">
        {lyrics.map((line, index) => {
          const isActive = index === currentLineIndex
          const isPast = index < currentLineIndex

          // Calculate word progress for karaoke effect
          const wordProgress = isActive && line.words
            ? calculateWordProgress(line, currentTime)
            : []

          return (
            <motion.div
              key={index}
              ref={(el) => (linesRef.current[index] = el)}
              className={clsx(
                'py-3 cursor-pointer transition-all duration-300',
                isActive && 'scale-105',
              )}
              onClick={() => onSeek?.(line.time)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {line.words && isActive ? (
                // Karaoke style with word-by-word highlighting
                <div className="text-center">
                  {line.words.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className="relative inline-block"
                    >
                      {/* Background text */}
                      <span className="text-2xl font-bold text-white/30">
                        {word.text}
                      </span>
                      {/* Highlighted text */}
                      <span
                        className="absolute inset-0 text-2xl font-bold text-white overflow-hidden"
                        style={{
                          clipPath: `inset(0 ${100 - (wordProgress[wordIndex] || 0) * 100}% 0 0)`,
                        }}
                      >
                        {word.text}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                // Regular line
                <p
                  className={clsx(
                    'text-center transition-all duration-300',
                    isActive
                      ? 'text-2xl font-bold text-white'
                      : isPast
                      ? 'text-lg text-white/30'
                      : 'text-lg text-white/50 hover:text-white/70'
                  )}
                >
                  {line.text}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Compact lyrics for mini player
interface CompactLyricsProps {
  currentTime: number
  className?: string
}

export const CompactLyrics: React.FC<CompactLyricsProps> = ({
  currentTime,
  className,
}) => {
  const lyrics = useMemo(() => parseLyrics(DEMO_LYRICS), [])
  const currentLineIndex = findCurrentLineIndex(lyrics, currentTime)
  const currentLine = lyrics[currentLineIndex]
  const nextLine = lyrics[currentLineIndex + 1]

  if (!currentLine) return null

  return (
    <div className={clsx('text-center overflow-hidden', className)}>
      <motion.p
        key={currentLineIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-dark-900 dark:text-white font-medium truncate"
      >
        {currentLine.text}
      </motion.p>
      {nextLine && (
        <p className="text-xs text-dark-500 dark:text-dark-400 truncate mt-0.5">
          {nextLine.text}
        </p>
      )}
    </div>
  )
}

// Floating desktop lyrics
interface DesktopLyricsProps {
  currentTime: number
  isVisible: boolean
  onClose: () => void
}

export const DesktopLyrics: React.FC<DesktopLyricsProps> = ({
  currentTime,
  isVisible,
  onClose,
}) => {
  const lyrics = useMemo(() => parseLyrics(DEMO_LYRICS), [])
  const currentLineIndex = findCurrentLineIndex(lyrics, currentTime)
  const currentLine = lyrics[currentLineIndex]
  const nextLine = lyrics[currentLineIndex + 1]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      drag
      dragMomentum={false}
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-xl shadow-2xl cursor-move"
      style={{ minWidth: 400, maxWidth: 800 }}
    >
      <button
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-700 text-white flex items-center justify-center hover:bg-dark-600"
        onClick={onClose}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center">
        {currentLine && (
          <motion.p
            key={currentLineIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white"
          >
            {currentLine.text}
          </motion.p>
        )}
        {nextLine && (
          <p className="text-sm text-white/50 mt-2">
            {nextLine.text}
          </p>
        )}
      </div>
    </motion.div>
  )
}
