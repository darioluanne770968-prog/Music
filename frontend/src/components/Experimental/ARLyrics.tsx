import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AR 歌词组件
 * 增强现实歌词展示效果
 */

// 歌词行
interface LyricLine {
  time: number
  text: string
  translation?: string
}

// AR 效果类型
type AREffect = 'float' | 'particle' | 'neon' | 'wave' | 'glitch' | '3d'

// AR 歌词设置
interface ARSettings {
  effect: AREffect
  fontSize: 'small' | 'medium' | 'large'
  showTranslation: boolean
  backgroundColor: 'transparent' | 'blur' | 'gradient'
  position: 'top' | 'center' | 'bottom'
  animation: boolean
  particleCount: number
  colorScheme: 'default' | 'rainbow' | 'neon' | 'monochrome'
}

// AR 歌词 Hook
export function useARLyrics() {
  const [lyrics, setLyrics] = useState<LyricLine[]>([
    { time: 0, text: '天青色等烟雨', translation: 'The azure waits for the misty rain' },
    { time: 3, text: '而我在等你', translation: 'While I wait for you' },
    { time: 6, text: '炊烟袅袅升起', translation: 'Kitchen smoke curls upward' },
    { time: 9, text: '隔江千万里', translation: 'Across countless miles of river' },
    { time: 12, text: '在瓶底书汉隶仿前朝的飘逸', translation: 'Writing Han clerical script at the bottle bottom' },
    { time: 18, text: '就当我为遇见你伏笔', translation: 'As foreshadowing for meeting you' },
    { time: 24, text: '天青色等烟雨', translation: 'The azure waits for the misty rain' },
    { time: 27, text: '而我在等你', translation: 'While I wait for you' },
    { time: 30, text: '月色被打捞起', translation: 'The moonlight is scooped up' },
    { time: 33, text: '晕开了结局', translation: 'Blurring the ending' }
  ])

  const [currentTime, setCurrentTime] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [settings, setSettings] = useState<ARSettings>({
    effect: 'float',
    fontSize: 'large',
    showTranslation: true,
    backgroundColor: 'blur',
    position: 'center',
    animation: true,
    particleCount: 50,
    colorScheme: 'default'
  })

  // 模拟播放进度
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = (prev + 0.1) % 36
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // 更新当前歌词行
  useEffect(() => {
    const index = lyrics.findIndex((line, i) => {
      const nextLine = lyrics[i + 1]
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time)
    })
    if (index !== -1) {
      setCurrentLineIndex(index)
    }
  }, [currentTime, lyrics])

  return {
    lyrics,
    currentTime,
    currentLineIndex,
    settings,
    setSettings
  }
}

// 粒子效果
const ParticleEffect: React.FC<{
  count: number
  colorScheme: ARSettings['colorScheme']
}> = ({ count, colorScheme }) => {
  const colors = {
    default: ['#6366f1', '#8b5cf6', '#a855f7'],
    rainbow: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
    neon: ['#00ff88', '#00ffff', '#ff00ff'],
    monochrome: ['#ffffff', '#cccccc', '#999999']
  }

  const particleColors = colors[colorScheme]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: particleColors[i % particleColors.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )
}

// 浮动歌词效果
const FloatLyric: React.FC<{
  text: string
  translation?: string
  showTranslation: boolean
  fontSize: ARSettings['fontSize']
  colorScheme: ARSettings['colorScheme']
}> = ({ text, translation, showTranslation, fontSize, colorScheme }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  const colorClasses = {
    default: 'text-white',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent',
    neon: 'text-green-400 drop-shadow-[0_0_10px_rgba(0,255,128,0.8)]',
    monochrome: 'text-white'
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <motion.p
        className={`font-bold ${sizeClasses[fontSize]} ${colorClasses[colorScheme]}`}
        animate={{
          textShadow: [
            '0 0 20px rgba(99,102,241,0.5)',
            '0 0 40px rgba(139,92,246,0.5)',
            '0 0 20px rgba(99,102,241,0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>

      {showTranslation && translation && (
        <motion.p
          className="text-white/60 mt-4 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {translation}
        </motion.p>
      )}
    </motion.div>
  )
}

// 霓虹效果歌词
const NeonLyric: React.FC<{
  text: string
  fontSize: ARSettings['fontSize']
}> = ({ text, fontSize }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  return (
    <motion.div
      className={`font-bold ${sizeClasses[fontSize]} text-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="relative">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{
              color: '#fff',
              textShadow: `
                0 0 5px #fff,
                0 0 10px #fff,
                0 0 20px #ff00de,
                0 0 30px #ff00de,
                0 0 40px #ff00de,
                0 0 55px #ff00de,
                0 0 75px #ff00de
              `
            }}
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.div>
  )
}

// 波浪效果歌词
const WaveLyric: React.FC<{
  text: string
  fontSize: ARSettings['fontSize']
}> = ({ text, fontSize }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  return (
    <motion.div
      className={`font-bold ${sizeClasses[fontSize]} text-center text-white`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{
            y: [0, -15, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  )
}

// 故障效果歌词
const GlitchLyric: React.FC<{
  text: string
  fontSize: ARSettings['fontSize']
}> = ({ text, fontSize }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  return (
    <motion.div
      className={`font-bold ${sizeClasses[fontSize]} text-center relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 主文字 */}
      <span className="text-white relative z-10">{text}</span>

      {/* 故障层 */}
      <motion.span
        className="absolute inset-0 text-cyan-400 z-0"
        animate={{
          x: [-2, 2, -2],
          opacity: [0.8, 0.3, 0.8]
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        {text}
      </motion.span>

      <motion.span
        className="absolute inset-0 text-red-400 z-0"
        animate={{
          x: [2, -2, 2],
          opacity: [0.8, 0.3, 0.8]
        }}
        transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

// 3D 效果歌词
const ThreeDLyric: React.FC<{
  text: string
  fontSize: ARSettings['fontSize']
}> = ({ text, fontSize }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  }

  return (
    <motion.div
      className={`font-bold ${sizeClasses[fontSize]} text-center`}
      style={{ perspective: '1000px' }}
      initial={{ opacity: 0, rotateX: -90 }}
      animate={{ opacity: 1, rotateX: 0 }}
      exit={{ opacity: 0, rotateX: 90 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="inline-block text-white"
        style={{
          textShadow: `
            0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25),
            0 10px 10px rgba(0,0,0,.2),
            0 20px 20px rgba(0,0,0,.15)
          `
        }}
        animate={{
          rotateY: [-5, 5, -5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

// 设置面板
const SettingsPanel: React.FC<{
  settings: ARSettings
  onChange: (settings: ARSettings) => void
  onClose: () => void
}> = ({ settings, onChange, onClose }) => {
  const effects: { key: AREffect; label: string; icon: string }[] = [
    { key: 'float', label: '浮动', icon: '🌊' },
    { key: 'particle', label: '粒子', icon: '✨' },
    { key: 'neon', label: '霓虹', icon: '💡' },
    { key: 'wave', label: '波浪', icon: '〰️' },
    { key: 'glitch', label: '故障', icon: '📺' },
    { key: '3d', label: '3D', icon: '🎲' }
  ]

  const colorSchemes: { key: ARSettings['colorScheme']; label: string }[] = [
    { key: 'default', label: '默认' },
    { key: 'rainbow', label: '彩虹' },
    { key: 'neon', label: '霓虹' },
    { key: 'monochrome', label: '单色' }
  ]

  return (
    <motion.div
      className="absolute inset-0 bg-black/80 z-50 p-6 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">AR 歌词设置</h3>
          <button onClick={onClose} className="text-white/60 text-2xl">×</button>
        </div>

        {/* 效果选择 */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3">视觉效果</p>
          <div className="grid grid-cols-3 gap-2">
            {effects.map(effect => (
              <button
                key={effect.key}
                onClick={() => onChange({ ...settings, effect: effect.key })}
                className={`p-3 rounded-xl text-center ${
                  settings.effect === effect.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                <span className="text-xl block mb-1">{effect.icon}</span>
                <span className="text-xs">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 字体大小 */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3">字体大小</p>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => onChange({ ...settings, fontSize: size })}
                className={`flex-1 py-2 rounded-lg ${
                  settings.fontSize === size
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 配色方案 */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3">配色方案</p>
          <div className="flex gap-2">
            {colorSchemes.map(scheme => (
              <button
                key={scheme.key}
                onClick={() => onChange({ ...settings, colorScheme: scheme.key })}
                className={`flex-1 py-2 rounded-lg ${
                  settings.colorScheme === scheme.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {scheme.label}
              </button>
            ))}
          </div>
        </div>

        {/* 开关选项 */}
        <div className="space-y-3">
          {[
            { key: 'showTranslation', label: '显示翻译' },
            { key: 'animation', label: '动画效果' }
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">{opt.label}</span>
              <button
                onClick={() => onChange({
                  ...settings,
                  [opt.key]: !settings[opt.key as keyof ARSettings]
                })}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings[opt.key as keyof ARSettings] ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow"
                  animate={{ x: settings[opt.key as keyof ARSettings] ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 主界面
interface ARLyricsProps {
  className?: string
}

export const ARLyrics: React.FC<ARLyricsProps> = ({ className }) => {
  const { lyrics, currentLineIndex, settings, setSettings } = useARLyrics()
  const [showSettings, setShowSettings] = useState(false)

  const currentLine = lyrics[currentLineIndex]

  const renderLyric = () => {
    if (!currentLine) return null

    const props = {
      text: currentLine.text,
      translation: currentLine.translation,
      showTranslation: settings.showTranslation,
      fontSize: settings.fontSize,
      colorScheme: settings.colorScheme
    }

    switch (settings.effect) {
      case 'float':
        return <FloatLyric {...props} />
      case 'neon':
        return <NeonLyric text={props.text} fontSize={props.fontSize} />
      case 'wave':
        return <WaveLyric text={props.text} fontSize={props.fontSize} />
      case 'glitch':
        return <GlitchLyric text={props.text} fontSize={props.fontSize} />
      case '3d':
        return <ThreeDLyric text={props.text} fontSize={props.fontSize} />
      case 'particle':
        return <FloatLyric {...props} />
      default:
        return <FloatLyric {...props} />
    }
  }

  const bgClasses = {
    transparent: '',
    blur: 'backdrop-blur-xl bg-black/30',
    gradient: 'bg-gradient-to-br from-purple-900/50 to-blue-900/50'
  }

  const positionClasses = {
    top: 'items-start pt-20',
    center: 'items-center',
    bottom: 'items-end pb-20'
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 背景 */}
      <div className={`absolute inset-0 ${bgClasses[settings.backgroundColor]}`}>
        {/* 粒子效果 */}
        {settings.effect === 'particle' && (
          <ParticleEffect count={settings.particleCount} colorScheme={settings.colorScheme} />
        )}
      </div>

      {/* 歌词区域 */}
      <div className={`relative z-10 min-h-[400px] flex justify-center ${positionClasses[settings.position]}`}>
        <AnimatePresence mode="wait">
          <motion.div key={currentLineIndex}>
            {renderLyric()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm
                   flex items-center justify-center text-white"
        >
          ⚙️
        </button>
      </div>

      {/* 进度指示器 */}
      <div className="absolute bottom-4 left-4 right-16 z-20">
        <div className="flex gap-1">
          {lyrics.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i === currentLineIndex ? 'bg-primary-500' :
                i < currentLineIndex ? 'bg-white/40' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ARLyrics
