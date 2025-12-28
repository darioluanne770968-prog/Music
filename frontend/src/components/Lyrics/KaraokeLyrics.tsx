import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

// 逐字歌词类型
export interface KaraokeLine {
  startTime: number
  endTime: number
  text: string
  words: KaraokeWord[]
}

export interface KaraokeWord {
  text: string
  startTime: number
  endTime: number
}

// 歌词翻译
export interface LyricsTranslation {
  original: string
  translation: string
  language: 'zh' | 'en' | 'ja' | 'ko'
}

interface KaraokeLyricsProps {
  lyrics: KaraokeLine[]
  translation?: LyricsTranslation[]
  showTranslation?: boolean
  fontSize?: 'small' | 'medium' | 'large'
  onShare?: (line: KaraokeLine) => void
  onCorrect?: (lineIndex: number, correction: string) => void
}

export const KaraokeLyrics: React.FC<KaraokeLyricsProps> = ({
  lyrics,
  translation,
  showTranslation = true,
  fontSize = 'medium',
  onShare,
  onCorrect,
}) => {
  const { currentTime, isPlaying } = usePlayerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeLine, setActiveLine] = useState(0)

  // 字体大小映射
  const fontSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  }

  // 查找当前行
  useEffect(() => {
    const currentLine = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    )
    if (currentLine !== -1 && currentLine !== activeLine) {
      setActiveLine(currentLine)
    }
  }, [currentTime, lyrics, activeLine])

  // 自动滚动到当前行
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const activeElement = container.querySelector(`[data-line="${activeLine}"]`)
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLine])

  // 计算单词高亮进度
  const getWordProgress = (word: KaraokeWord) => {
    if (currentTime < word.startTime) return 0
    if (currentTime >= word.endTime) return 1
    return (currentTime - word.startTime) / (word.endTime - word.startTime)
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-16 lyrics-mask"
    >
      <div className="space-y-8">
        {lyrics.map((line, lineIndex) => {
          const isActive = lineIndex === activeLine
          const isPast = lineIndex < activeLine

          return (
            <motion.div
              key={lineIndex}
              data-line={lineIndex}
              initial={false}
              animate={{
                opacity: isActive ? 1 : isPast ? 0.4 : 0.6,
                scale: isActive ? 1 : 0.95,
              }}
              className={`text-center transition-all duration-300 ${
                isActive ? 'text-white' : 'text-white/60'
              }`}
            >
              {/* Main lyrics line */}
              <div className={`${fontSizes[fontSize]} font-bold mb-2`}>
                {line.words.map((word, wordIndex) => {
                  const progress = isActive ? getWordProgress(word) : isPast ? 1 : 0

                  return (
                    <span
                      key={wordIndex}
                      className="relative inline-block mx-0.5"
                    >
                      {/* Background text */}
                      <span className="text-white/30">{word.text}</span>

                      {/* Highlighted text */}
                      <span
                        className="absolute inset-0 text-primary-400 overflow-hidden"
                        style={{
                          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
                        }}
                      >
                        {word.text}
                      </span>
                    </span>
                  )
                })}
              </div>

              {/* Translation */}
              {showTranslation && translation?.[lineIndex] && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isActive ? 0.8 : 0.4, y: 0 }}
                  className="text-sm text-white/60"
                >
                  {translation[lineIndex].translation}
                </motion.p>
              )}

              {/* Actions (visible on active line) */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-4 mt-3"
                >
                  <button
                    onClick={() => onShare?.(line)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    title="分享歌词"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onCorrect?.(lineIndex, line.text)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    title="纠错"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// 歌词海报生成组件
export const LyricsPoster: React.FC<{
  lyric: string
  songName: string
  artist: string
  albumCover?: string
  onClose: () => void
}> = ({ lyric, songName, artist, albumCover, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generatePoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    canvas.width = 1080
    canvas.height = 1920

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a1c25')
    gradient.addColorStop(1, '#2a1f35')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制歌词
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'

    // 自动换行
    const maxWidth = canvas.width - 160
    const lines = wrapText(ctx, lyric, maxWidth)
    const lineHeight = 80
    const startY = canvas.height / 2 - (lines.length * lineHeight) / 2

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight)
    })

    // 绘制歌曲信息
    ctx.font = '36px "PingFang SC", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(`${songName} - ${artist}`, canvas.width / 2, canvas.height - 200)

    // 绘制水印
    ctx.font = '24px "PingFang SC", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillText('汽水音乐', canvas.width / 2, canvas.height - 100)
  }

  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${songName}_lyrics.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  useEffect(() => {
    generatePoster()
  }, [lyric, songName, artist])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 rounded-2xl overflow-hidden max-w-md w-full">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-medium text-white">歌词海报</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl"
            style={{ aspectRatio: '9/16' }}
          />
        </div>

        <div className="p-4 flex gap-3">
          <button
            onClick={downloadPoster}
            className="flex-1 py-3 bg-primary-500 rounded-xl text-white font-medium hover:bg-primary-600 transition-colors"
          >
            保存图片
          </button>
          <button
            onClick={() => {/* Share logic */}}
            className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
          >
            分享
          </button>
        </div>
      </div>
    </div>
  )
}

// 辅助函数：文本自动换行
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine + word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export default KaraokeLyrics
