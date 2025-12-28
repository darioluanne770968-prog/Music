import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * 音乐可视化组件
 * 支持多种可视化效果
 */

// 可视化模式
export type VisualizerMode =
  | 'bars'         // 柱状图
  | 'wave'         // 波形
  | 'circle'       // 圆形
  | 'particles'    // 粒子
  | 'spectrum3d'   // 3D频谱
  | 'kaleidoscope' // 万花筒
  | 'dna'          // DNA双螺旋
  | 'terrain'      // 地形
  | 'galaxy'       // 星系
  | 'fluid'        // 流体

// 可视化配置
interface VisualizerConfig {
  mode: VisualizerMode
  colorScheme: 'rainbow' | 'gradient' | 'mono' | 'album'
  sensitivity: number
  smoothing: number
  showFPS: boolean
}

// 粒子
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

// 音乐可视化 Hook
export function useMusicVisualizer(audioElement: HTMLAudioElement | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [fps, setFps] = useState(0)
  const [config, setConfig] = useState<VisualizerConfig>({
    mode: 'bars',
    colorScheme: 'rainbow',
    sensitivity: 1,
    smoothing: 0.8,
    showFPS: false
  })

  const particlesRef = useRef<Particle[]>([])
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)

  // 初始化音频分析器
  useEffect(() => {
    if (!audioElement) return

    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 256
    analyserRef.current.smoothingTimeConstant = config.smoothing

    const source = audioContextRef.current.createMediaElementSource(audioElement)
    source.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)

    return () => {
      audioContextRef.current?.close()
    }
  }, [audioElement])

  // 更新平滑度
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = config.smoothing
    }
  }, [config.smoothing])

  // 获取颜色
  const getColor = useCallback((index: number, total: number, value: number) => {
    switch (config.colorScheme) {
      case 'rainbow':
        return `hsl(${(index / total) * 360}, 80%, ${50 + value * 20}%)`
      case 'gradient':
        return `hsl(${240 + value * 60}, 80%, ${50 + value * 30}%)`
      case 'mono':
        return `rgba(255, 255, 255, ${0.3 + value * 0.7})`
      default:
        return `hsl(${(index / total) * 360}, 80%, 60%)`
    }
  }, [config.colorScheme])

  // 绘制柱状图
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const barWidth = width / data.length * 2
    const barGap = 2

    for (let i = 0; i < data.length / 2; i++) {
      const value = data[i] / 255 * config.sensitivity
      const barHeight = value * height * 0.8

      ctx.fillStyle = getColor(i, data.length / 2, value)

      // 镜像效果
      ctx.fillRect(
        width / 2 + i * (barWidth + barGap),
        height / 2 - barHeight / 2,
        barWidth,
        barHeight
      )
      ctx.fillRect(
        width / 2 - (i + 1) * (barWidth + barGap),
        height / 2 - barHeight / 2,
        barWidth,
        barHeight
      )
    }
  }, [config.sensitivity, getColor])

  // 绘制波形
  const drawWave = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    ctx.beginPath()
    ctx.moveTo(0, height / 2)

    const sliceWidth = width / data.length
    let x = 0

    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255 * config.sensitivity
      const y = height / 2 + (value - 0.5) * height * 0.8

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.strokeStyle = getColor(0, 1, 0.8)
    ctx.lineWidth = 3
    ctx.stroke()

    // 镜像
    ctx.beginPath()
    x = 0
    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255 * config.sensitivity
      const y = height / 2 - (value - 0.5) * height * 0.8

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.strokeStyle = getColor(0, 1, 0.5)
    ctx.stroke()
  }, [config.sensitivity, getColor])

  // 绘制圆形
  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const baseRadius = Math.min(width, height) * 0.2
    const maxRadius = Math.min(width, height) * 0.4

    // 计算平均能量
    const avgEnergy = Array.from(data).reduce((a, b) => a + b, 0) / data.length / 255

    // 绘制多层圆环
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath()

      for (let i = 0; i < data.length; i++) {
        const value = data[i] / 255 * config.sensitivity
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
        const radius = baseRadius + value * (maxRadius - baseRadius) + ring * 20

        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.strokeStyle = getColor(ring, 3, avgEnergy)
      ctx.lineWidth = 3 - ring
      ctx.stroke()
    }

    // 中心圆
    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius * (0.5 + avgEnergy * 0.5), 0, Math.PI * 2)
    ctx.fillStyle = getColor(0, 1, avgEnergy)
    ctx.fill()
  }, [config.sensitivity, getColor])

  // 绘制粒子
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const avgEnergy = Array.from(data).reduce((a, b) => a + b, 0) / data.length / 255

    // 生成新粒子
    if (avgEnergy > 0.3) {
      for (let i = 0; i < Math.floor(avgEnergy * 10); i++) {
        particlesRef.current.push({
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * avgEnergy * 20,
          vy: (Math.random() - 0.5) * avgEnergy * 20,
          size: Math.random() * 5 + 2,
          color: getColor(Math.random() * 100, 100, avgEnergy),
          life: 1
        })
      }
    }

    // 更新和绘制粒子
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.01
      p.size *= 0.99

      if (p.life <= 0) return false

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color.replace(')', `, ${p.life})`)
      ctx.fill()

      return true
    })

    // 限制粒子数量
    if (particlesRef.current.length > 500) {
      particlesRef.current = particlesRef.current.slice(-500)
    }
  }, [getColor])

  // 绘制万花筒
  const drawKaleidoscope = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const segments = 8
    const angleStep = (Math.PI * 2) / segments

    ctx.save()
    ctx.translate(centerX, centerY)

    for (let s = 0; s < segments; s++) {
      ctx.save()
      ctx.rotate(angleStep * s)

      if (s % 2 === 1) {
        ctx.scale(-1, 1)
      }

      for (let i = 0; i < data.length / 4; i++) {
        const value = data[i] / 255 * config.sensitivity
        const radius = i * 3 + value * 50
        const angle = value * Math.PI * 0.5

        ctx.beginPath()
        ctx.arc(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          value * 10 + 2,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = getColor(i, data.length / 4, value)
        ctx.fill()
      }

      ctx.restore()
    }

    ctx.restore()
  }, [config.sensitivity, getColor])

  // 绘制星系
  const drawGalaxy = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const time = Date.now() * 0.001
    const avgEnergy = Array.from(data).reduce((a, b) => a + b, 0) / data.length / 255

    // 星系螺旋
    for (let arm = 0; arm < 3; arm++) {
      const armOffset = (arm * Math.PI * 2) / 3

      for (let i = 0; i < 100; i++) {
        const value = data[i % data.length] / 255 * config.sensitivity
        const distance = i * 3 + value * 20
        const angle = i * 0.1 + time + armOffset + avgEnergy

        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance * 0.5 // 扁平化

        const size = (1 + value * 3) * (1 - i / 100)

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = getColor(i, 100, value)
        ctx.fill()
      }
    }

    // 中心光芒
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 50 + avgEnergy * 30
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)')
    gradient.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 50 + avgEnergy * 30, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }, [config.sensitivity, getColor])

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')!
    const width = canvas.width
    const height = canvas.height

    // 获取频率数据
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    // 清除画布（带拖尾效果）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(0, 0, width, height)

    // 根据模式绘制
    switch (config.mode) {
      case 'bars':
        drawBars(ctx, dataArray, width, height)
        break
      case 'wave':
        drawWave(ctx, dataArray, width, height)
        break
      case 'circle':
        drawCircle(ctx, dataArray, width, height)
        break
      case 'particles':
        drawParticles(ctx, dataArray, width, height)
        break
      case 'kaleidoscope':
        drawKaleidoscope(ctx, dataArray, width, height)
        break
      case 'galaxy':
        drawGalaxy(ctx, dataArray, width, height)
        break
      default:
        drawBars(ctx, dataArray, width, height)
    }

    // FPS 计算
    frameCountRef.current++
    const now = performance.now()
    if (now - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
      lastTimeRef.current = now
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [config.mode, drawBars, drawWave, drawCircle, drawParticles, drawKaleidoscope, drawGalaxy])

  // 启动动画
  useEffect(() => {
    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  return { canvasRef, fps, config, setConfig }
}

// 可视化器界面
interface MusicVisualizerProps {
  audioElement: HTMLAudioElement | null
}

export const MusicVisualizerUI: React.FC<MusicVisualizerProps> = ({ audioElement }) => {
  const { canvasRef, fps, config, setConfig } = useMusicVisualizer(audioElement)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const modes: { id: VisualizerMode; name: string; icon: string }[] = [
    { id: 'bars', name: '柱状图', icon: '📊' },
    { id: 'wave', name: '波形', icon: '〰️' },
    { id: 'circle', name: '圆形', icon: '⭕' },
    { id: 'particles', name: '粒子', icon: '✨' },
    { id: 'kaleidoscope', name: '万花筒', icon: '🌸' },
    { id: 'galaxy', name: '星系', icon: '🌌' }
  ]

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />

      {/* FPS */}
      {config.showFPS && (
        <div className="absolute top-4 left-4 text-white/60 text-sm font-mono">
          {fps} FPS
        </div>
      )}

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        {/* 模式选择 */}
        <div className="flex justify-center gap-2 mb-4">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setConfig(prev => ({ ...prev, mode: mode.id }))}
              className={`px-4 py-2 rounded-full text-sm ${
                config.mode === mode.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {mode.icon} {mode.name}
            </button>
          ))}
        </div>

        {/* 设置 */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">灵敏度</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.sensitivity}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                sensitivity: parseFloat(e.target.value)
              }))}
              className="w-24"
            />
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-white/10 rounded-full text-white/60"
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default MusicVisualizerUI
