import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import * as api from '@/services/netease'

interface LyricLine {
  time: number
  text: string
  translation?: string
}

interface LyricsDisplayProps {
  className?: string
  showTranslation?: boolean
  compact?: boolean
  currentTime?: number
  onSeek?: (time: number) => void
}

// Parse LRC format lyrics
const parseLRC = (lrc: string): LyricLine[] => {
  const lines: LyricLine[] = []
  if (!lrc) return lines

  const lrcLines = lrc.split('\n')

  for (const line of lrcLines) {
    // Match [mm:ss.xx] or [mm:ss:xx] format
    const timeMatch = line.match(/\[(\d{2}):(\d{2})[.:](\d{2,3})\]/)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1])
      const seconds = parseInt(timeMatch[2])
      const ms = parseInt(timeMatch[3])
      const time = minutes * 60 + seconds + ms / (timeMatch[3].length === 2 ? 100 : 1000)
      const text = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, '').trim()

      if (text) {
        lines.push({ time, text })
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

// Merge original lyrics with translation
const mergeLyrics = (original: LyricLine[], translation: LyricLine[]): LyricLine[] => {
  if (!translation.length) return original

  return original.map((line) => {
    // Find matching translation by time (within 0.5s tolerance)
    const trans = translation.find((t) => Math.abs(t.time - line.time) < 0.5)
    return {
      ...line,
      translation: trans?.text,
    }
  })
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  className = '',
  showTranslation: showTranslationProp = true,
  compact = false,
  currentTime: propCurrentTime,
  onSeek,
}) => {
  const { currentSong, currentTime: storeCurrentTime, isPlaying } = usePlayerStore()
  const currentTime = propCurrentTime ?? storeCurrentTime
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [loading, setLoading] = useState(false)
  const [showTranslation, setShowTranslation] = useState(showTranslationProp)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Fetch lyrics when song changes
  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentSong?.id) {
        setLyrics([])
        return
      }

      setLoading(true)
      try {
        const data = await api.getLyric(currentSong.id)

        if (data?.lrc?.lyric) {
          const originalLyrics = parseLRC(data.lrc.lyric)

          // Parse translation if available
          let translationLyrics: LyricLine[] = []
          if (data.tlyric?.lyric) {
            translationLyrics = parseLRC(data.tlyric.lyric)
          }

          // Merge original with translation
          const mergedLyrics = mergeLyrics(originalLyrics, translationLyrics)
          setLyrics(mergedLyrics)
        } else {
          setLyrics([])
        }
      } catch (error) {
        console.error('Failed to fetch lyrics:', error)
        setLyrics([])
      } finally {
        setLoading(false)
      }
    }

    fetchLyrics()
  }, [currentSong?.id])

  // Find current line index
  const currentLineIndex = useMemo(() => {
    if (lyrics.length === 0) return -1

    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i
      }
    }
    return -1
  }, [lyrics, currentTime])

  // Auto scroll to current line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current
      const activeLine = activeLineRef.current
      const containerHeight = container.clientHeight
      const lineTop = activeLine.offsetTop
      const lineHeight = activeLine.clientHeight

      const scrollTo = lineTop - containerHeight / 2 + lineHeight / 2

      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth',
      })
    }
  }, [currentLineIndex])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (lyrics.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <p className="text-white/40">暂无歌词</p>
        <p className="text-sm text-white/20 mt-1">纯音乐，请欣赏</p>
      </div>
    )
  }

  if (compact) {
    // Compact mode - show only current and next line
    const currentLine = lyrics[currentLineIndex]
    const nextLine = lyrics[currentLineIndex + 1]

    return (
      <div className={`text-center ${className}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLineIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white font-medium text-lg">
              {currentLine?.text || '...'}
            </p>
            {nextLine && (
              <p className="text-white/40 text-sm mt-1">
                {nextLine.text}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Check if any lyrics have translation
  const hasTranslation = lyrics.some((line) => line.translation)

  // Full mode - scrollable lyrics
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with toggle */}
      {hasTranslation && (
        <div className="flex items-center justify-end px-4 py-2 shrink-0">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              showTranslation
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-white/10 text-white/50 hover:text-white/70'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            翻译
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="py-[40vh]">
        {lyrics.map((line, index) => {
          const isActive = index === currentLineIndex
          const isPast = index < currentLineIndex
          const distance = Math.abs(index - currentLineIndex)

          return (
            <motion.div
              key={index}
              ref={isActive ? activeLineRef : undefined}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isActive ? 1 : isPast ? 0.3 : 0.5 - distance * 0.1,
                scale: isActive ? 1 : 0.95,
              }}
              transition={{ duration: 0.3 }}
              className={`py-3 px-4 text-center cursor-pointer transition-all ${
                isActive ? 'text-primary-500' : 'text-white/50 hover:text-white/70'
              }`}
              onClick={() => {
                // Seek to this line
                if (onSeek) {
                  onSeek(line.time)
                } else {
                  const { setCurrentTime } = usePlayerStore.getState()
                  setCurrentTime(line.time)
                }
              }}
            >
              <p className={`${isActive ? 'text-2xl font-bold' : 'text-lg'} transition-all`}>
                {line.text}
              </p>
              {showTranslation && line.translation && (
                <p className={`mt-1 ${isActive ? 'text-base text-white/70' : 'text-sm text-white/40'}`}>
                  {line.translation}
                </p>
              )}
            </motion.div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

// Single line lyrics for mini player
export const LyricsLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentSong, currentTime } = usePlayerStore()
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentLine, setCurrentLine] = useState<string>('')

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentSong?.id) return

      try {
        const data = await api.getLyric(currentSong.id)

        if (data?.lrc?.lyric) {
          setLyrics(parseLRC(data.lrc.lyric))
        } else {
          setLyrics([])
        }
      } catch (error) {
        setLyrics([])
      }
    }

    fetchLyrics()
  }, [currentSong?.id])

  useEffect(() => {
    if (lyrics.length === 0) {
      setCurrentLine('')
      return
    }

    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        setCurrentLine(lyrics[i].text)
        return
      }
    }
    setCurrentLine(lyrics[0]?.text || '')
  }, [lyrics, currentTime])

  if (!currentLine) return null

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={currentLine}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className={`text-sm text-white/60 truncate ${className}`}
      >
        {currentLine}
      </motion.p>
    </AnimatePresence>
  )
}
