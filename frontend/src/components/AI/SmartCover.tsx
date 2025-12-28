import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AI 智能封面生成器
 * 为歌单生成艺术封面
 */

// 封面风格
export type CoverStyle =
  | 'abstract'      // 抽象艺术
  | 'gradient'      // 渐变
  | 'collage'       // 拼贴
  | 'minimal'       // 极简
  | 'retro'         // 复古
  | 'neon'          // 霓虹
  | 'watercolor'    // 水彩
  | 'geometric'     // 几何
  | 'glitch'        // 故障艺术
  | 'cyberpunk'     // 赛博朋克

// 封面配置
interface CoverConfig {
  style: CoverStyle
  primaryColor: string
  secondaryColor: string
  mood: string
  includeText: boolean
  textContent?: string
}

// 生成的封面
interface GeneratedCover {
  id: string
  url: string
  style: CoverStyle
  timestamp: number
}

// 根据配置生成Canvas封面
async function generateCoverCanvas(
  config: CoverConfig,
  size = 512
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 根据风格绘制
  switch (config.style) {
    case 'gradient':
      drawGradient(ctx, size, config)
      break
    case 'abstract':
      drawAbstract(ctx, size, config)
      break
    case 'geometric':
      drawGeometric(ctx, size, config)
      break
    case 'neon':
      drawNeon(ctx, size, config)
      break
    case 'minimal':
      drawMinimal(ctx, size, config)
      break
    case 'retro':
      drawRetro(ctx, size, config)
      break
    case 'watercolor':
      drawWatercolor(ctx, size, config)
      break
    case 'glitch':
      drawGlitch(ctx, size, config)
      break
    case 'cyberpunk':
      drawCyberpunk(ctx, size, config)
      break
    case 'collage':
    default:
      drawGradient(ctx, size, config)
  }

  // 添加文字
  if (config.includeText && config.textContent) {
    drawText(ctx, size, config.textContent)
  }

  return canvas
}

// 渐变风格
function drawGradient(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, config.primaryColor)
  gradient.addColorStop(0.5, config.secondaryColor)
  gradient.addColorStop(1, config.primaryColor)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 添加噪点
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`
    ctx.fillRect(
      Math.random() * size,
      Math.random() * size,
      1,
      1
    )
  }
}

// 抽象风格
function drawAbstract(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      Math.random() * 100 + 20,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = i % 2 === 0
      ? `${config.primaryColor}${Math.floor(Math.random() * 50 + 20).toString(16)}`
      : `${config.secondaryColor}${Math.floor(Math.random() * 50 + 20).toString(16)}`
    ctx.fill()
  }

  // 添加线条
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  for (let i = 0; i < 10; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * size, Math.random() * size)
    ctx.bezierCurveTo(
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size
    )
    ctx.stroke()
  }
}

// 几何风格
function drawGeometric(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#0f0f1a'
  ctx.fillRect(0, 0, size, size)

  const shapes = 15
  for (let i = 0; i < shapes; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const s = Math.random() * 150 + 50

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.random() * Math.PI * 2)

    ctx.fillStyle = i % 3 === 0
      ? config.primaryColor
      : i % 3 === 1
        ? config.secondaryColor
        : 'rgba(255,255,255,0.1)'

    // 随机形状
    const shapeType = Math.floor(Math.random() * 3)
    if (shapeType === 0) {
      // 三角形
      ctx.beginPath()
      ctx.moveTo(0, -s / 2)
      ctx.lineTo(s / 2, s / 2)
      ctx.lineTo(-s / 2, s / 2)
      ctx.closePath()
      ctx.fill()
    } else if (shapeType === 1) {
      // 矩形
      ctx.fillRect(-s / 2, -s / 2, s, s)
    } else {
      // 圆形
      ctx.beginPath()
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

// 霓虹风格
function drawNeon(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, size, size)

  // 霓虹线条
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < 8; i++) {
    const color = i % 2 === 0 ? config.primaryColor : config.secondaryColor

    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.strokeStyle = color
    ctx.lineWidth = 4

    ctx.beginPath()
    const startY = Math.random() * size
    ctx.moveTo(0, startY)

    for (let x = 0; x < size; x += 20) {
      ctx.lineTo(x, startY + Math.sin(x * 0.02 + i) * 50)
    }
    ctx.stroke()
  }

  // 添加发光点
  for (let i = 0; i < 50; i++) {
    const color = Math.random() > 0.5 ? config.primaryColor : config.secondaryColor
    ctx.shadowColor = color
    ctx.shadowBlur = 30
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      Math.random() * 5 + 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
}

// 极简风格
function drawMinimal(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, size, size)

  // 单个几何图形
  ctx.fillStyle = config.primaryColor
  const shapeSize = size * 0.4
  const x = (size - shapeSize) / 2
  const y = (size - shapeSize) / 2

  ctx.beginPath()
  ctx.arc(size / 2, size / 2, shapeSize / 2, 0, Math.PI * 2)
  ctx.fill()

  // 简单线条
  ctx.strokeStyle = config.secondaryColor
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(size * 0.2, size * 0.8)
  ctx.lineTo(size * 0.8, size * 0.2)
  ctx.stroke()
}

// 复古风格
function drawRetro(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  // 复古渐变背景
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0, '#ff6b35')
  gradient.addColorStop(0.5, '#f7c59f')
  gradient.addColorStop(1, '#2a1a1f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 太阳
  ctx.fillStyle = '#ffdd00'
  ctx.beginPath()
  ctx.arc(size / 2, size * 0.6, size * 0.3, 0, Math.PI, true)
  ctx.fill()

  // 条纹
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 3
  for (let y = size * 0.3; y < size; y += 15) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
}

// 水彩风格
function drawWatercolor(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, size, size)

  // 水彩斑点
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 100 + 30

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    const color = i % 2 === 0 ? config.primaryColor : config.secondaryColor
    gradient.addColorStop(0, color + '60')
    gradient.addColorStop(0.5, color + '30')
    gradient.addColorStop(1, color + '00')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 故障艺术风格
function drawGlitch(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, size, size)

  // 主形状
  ctx.fillStyle = config.primaryColor
  ctx.fillRect(size * 0.2, size * 0.3, size * 0.6, size * 0.4)

  // 故障偏移
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data

  // RGB偏移
  for (let y = 0; y < size; y++) {
    if (Math.random() > 0.9) {
      const shift = Math.floor(Math.random() * 20 - 10)
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const shiftI = (y * size + Math.min(Math.max(x + shift, 0), size - 1)) * 4
        data[i] = data[shiftI] // R
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // 扫描线
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 2)
  }
}

// 赛博朋克风格
function drawCyberpunk(ctx: CanvasRenderingContext2D, size: number, config: CoverConfig) {
  // 暗色背景
  ctx.fillStyle = '#0d0221'
  ctx.fillRect(0, 0, size, size)

  // 网格
  ctx.strokeStyle = '#ff00ff30'
  ctx.lineWidth = 1
  const gridSize = 30
  for (let x = 0; x < size; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }
  for (let y = 0; y < size; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  // 霓虹建筑轮廓
  ctx.strokeStyle = '#00ffff'
  ctx.lineWidth = 3
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = 15

  // 建筑1
  ctx.beginPath()
  ctx.moveTo(size * 0.1, size)
  ctx.lineTo(size * 0.1, size * 0.4)
  ctx.lineTo(size * 0.3, size * 0.4)
  ctx.lineTo(size * 0.3, size)
  ctx.stroke()

  // 建筑2
  ctx.strokeStyle = '#ff00ff'
  ctx.shadowColor = '#ff00ff'
  ctx.beginPath()
  ctx.moveTo(size * 0.4, size)
  ctx.lineTo(size * 0.4, size * 0.2)
  ctx.lineTo(size * 0.6, size * 0.2)
  ctx.lineTo(size * 0.6, size)
  ctx.stroke()

  // 建筑3
  ctx.strokeStyle = '#ffff00'
  ctx.shadowColor = '#ffff00'
  ctx.beginPath()
  ctx.moveTo(size * 0.7, size)
  ctx.lineTo(size * 0.7, size * 0.5)
  ctx.lineTo(size * 0.9, size * 0.5)
  ctx.lineTo(size * 0.9, size)
  ctx.stroke()
}

// 绘制文字
function drawText(ctx: CanvasRenderingContext2D, size: number, text: string) {
  ctx.save()
  ctx.fillStyle = 'white'
  ctx.font = `bold ${size * 0.08}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 10
  ctx.fillText(text, size / 2, size - size * 0.08)
  ctx.restore()
}

// 智能封面生成器组件
interface SmartCoverGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (coverUrl: string) => void
  playlistName?: string
  songs?: { name: string; artist: string }[]
}

export const SmartCoverGenerator: React.FC<SmartCoverGeneratorProps> = ({
  isOpen,
  onClose,
  onSelect,
  playlistName = '我的歌单',
  songs = []
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CoverStyle>('gradient')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [secondaryColor, setSecondaryColor] = useState('#ec4899')
  const [includeText, setIncludeText] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCovers, setGeneratedCovers] = useState<GeneratedCover[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const styles: { id: CoverStyle; name: string; icon: string }[] = [
    { id: 'gradient', name: '渐变', icon: '🌈' },
    { id: 'abstract', name: '抽象', icon: '🎨' },
    { id: 'geometric', name: '几何', icon: '📐' },
    { id: 'neon', name: '霓虹', icon: '💡' },
    { id: 'minimal', name: '极简', icon: '⬜' },
    { id: 'retro', name: '复古', icon: '📻' },
    { id: 'watercolor', name: '水彩', icon: '🖼️' },
    { id: 'glitch', name: '故障', icon: '📺' },
    { id: 'cyberpunk', name: '赛博', icon: '🌃' },
    { id: 'collage', name: '拼贴', icon: '🧩' }
  ]

  const generateCover = useCallback(async () => {
    setIsGenerating(true)

    const config: CoverConfig = {
      style: selectedStyle,
      primaryColor,
      secondaryColor,
      mood: 'happy',
      includeText,
      textContent: playlistName
    }

    const canvas = await generateCoverCanvas(config)
    const url = canvas.toDataURL('image/png')

    const newCover: GeneratedCover = {
      id: Date.now().toString(),
      url,
      style: selectedStyle,
      timestamp: Date.now()
    }

    setGeneratedCovers(prev => [newCover, ...prev.slice(0, 8)])
    setIsGenerating(false)
  }, [selectedStyle, primaryColor, secondaryColor, includeText, playlistName])

  const generateAll = useCallback(async () => {
    setIsGenerating(true)

    const covers: GeneratedCover[] = []
    for (const style of styles.slice(0, 6)) {
      const config: CoverConfig = {
        style: style.id,
        primaryColor,
        secondaryColor,
        mood: 'happy',
        includeText,
        textContent: playlistName
      }

      const canvas = await generateCoverCanvas(config)
      const url = canvas.toDataURL('image/png')

      covers.push({
        id: `${Date.now()}-${style.id}`,
        url,
        style: style.id,
        timestamp: Date.now()
      })
    }

    setGeneratedCovers(covers)
    setIsGenerating(false)
  }, [primaryColor, secondaryColor, includeText, playlistName])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 overflow-auto"
        >
          <div className="min-h-full p-6">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">AI 封面生成</h2>
              <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 风格选择 */}
            <div className="mb-6">
              <h3 className="text-sm text-white/60 mb-3">选择风格</h3>
              <div className="grid grid-cols-5 gap-2">
                {styles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedStyle === style.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl block mb-1">{style.icon}</span>
                    <span className="text-xs">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm text-white/60 block mb-2">主色调</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-white/60 block mb-2">辅助色</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 选项 */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-6">
              <span className="text-white">添加歌单名称</span>
              <button
                onClick={() => setIncludeText(!includeText)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  includeText ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md ml-1"
                  animate={{ x: includeText ? 20 : 0 }}
                />
              </button>
            </div>

            {/* 生成按钮 */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={generateCover}
                disabled={isGenerating}
                className="flex-1 py-3 bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50"
              >
                {isGenerating ? '生成中...' : '生成封面'}
              </button>
              <button
                onClick={generateAll}
                disabled={isGenerating}
                className="px-6 py-3 bg-white/10 rounded-xl text-white disabled:opacity-50"
              >
                批量生成
              </button>
            </div>

            {/* 生成结果 */}
            {generatedCovers.length > 0 && (
              <div>
                <h3 className="text-sm text-white/60 mb-3">生成结果</h3>
                <div className="grid grid-cols-3 gap-3">
                  {generatedCovers.map(cover => (
                    <motion.button
                      key={cover.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onSelect(cover.url)}
                      className="aspect-square rounded-xl overflow-hidden relative group"
                    >
                      <img
                        src={cover.url}
                        alt="生成的封面"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">使用</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SmartCoverGenerator
