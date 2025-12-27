import React, { useRef, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { usePlayerStore } from '@/stores/playerStore'
import { getFrequencyData, initAudioContext } from '@/utils/audio'

type VisualizerStyle = 'bars' | 'wave' | 'circular' | 'particles'

interface AudioVisualizerProps {
  style?: VisualizerStyle
  color?: string
  barCount?: number
  sensitivity?: number
  className?: string
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  style = 'bars',
  color = '#ff3366',
  barCount = 32,
  sensitivity = 1,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { isPlaying } = usePlayerStore()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = getFrequencyData()
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    if (data.length === 0) {
      // Draw idle state
      drawIdleState(ctx, width, height, color, style, barCount)
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    switch (style) {
      case 'bars':
        drawBars(ctx, data, width, height, color, barCount, sensitivity)
        break
      case 'wave':
        drawWave(ctx, data, width, height, color, sensitivity)
        break
      case 'circular':
        drawCircular(ctx, data, width, height, color, barCount, sensitivity)
        break
      case 'particles':
        drawParticles(ctx, data, width, height, color, sensitivity)
        break
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [style, color, barCount, sensitivity])

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, draw])

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={clsx('w-full h-full', className)}
      style={{ display: 'block' }}
    />
  )
}

// Drawing functions
function drawIdleState(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  style: VisualizerStyle,
  barCount: number
) {
  ctx.fillStyle = color
  ctx.globalAlpha = 0.3

  if (style === 'bars') {
    const barWidth = (width / barCount) * 0.8
    const gap = (width / barCount) * 0.2

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap)
      const barHeight = 2 + Math.random() * 4
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    }
  } else if (style === 'wave') {
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  color: string,
  barCount: number,
  sensitivity: number
) {
  const barWidth = (width / barCount) * 0.7
  const gap = (width / barCount) * 0.3
  const step = Math.floor(data.length / barCount)

  // Create gradient
  const gradient = ctx.createLinearGradient(0, height, 0, 0)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, adjustColor(color, 40))

  for (let i = 0; i < barCount; i++) {
    const dataIndex = i * step
    const value = data[dataIndex] * sensitivity
    const barHeight = (value / 255) * height * 0.9

    const x = i * (barWidth + gap)
    const y = height - barHeight

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0])
    ctx.fill()
  }
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  color: string,
  sensitivity: number
) {
  const sliceWidth = width / data.length
  const centerY = height / 2

  // Draw filled wave
  ctx.beginPath()
  ctx.moveTo(0, centerY)

  for (let i = 0; i < data.length; i++) {
    const value = ((data[i] - 128) / 128) * sensitivity
    const y = centerY + value * (height / 2) * 0.8
    const x = i * sliceWidth

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.lineTo(width, centerY)
  ctx.lineTo(0, centerY)
  ctx.closePath()

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, `${color}80`)
  gradient.addColorStop(0.5, `${color}40`)
  gradient.addColorStop(1, `${color}80`)

  ctx.fillStyle = gradient
  ctx.fill()

  // Draw line
  ctx.beginPath()
  for (let i = 0; i < data.length; i++) {
    const value = ((data[i] - 128) / 128) * sensitivity
    const y = centerY + value * (height / 2) * 0.8
    const x = i * sliceWidth

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  color: string,
  barCount: number,
  sensitivity: number
) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 3
  const step = Math.floor(data.length / barCount)

  for (let i = 0; i < barCount; i++) {
    const dataIndex = i * step
    const value = data[dataIndex] * sensitivity
    const barHeight = (value / 255) * radius * 0.8

    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2
    const innerRadius = radius
    const outerRadius = radius + barHeight

    const x1 = centerX + Math.cos(angle) * innerRadius
    const y1 = centerY + Math.sin(angle) * innerRadius
    const x2 = centerX + Math.cos(angle) * outerRadius
    const y2 = centerY + Math.sin(angle) * outerRadius

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.lineWidth = (Math.PI * 2 * radius) / barCount * 0.6
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2)
  ctx.strokeStyle = `${color}40`
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  color: string,
  sensitivity: number
) {
  const particleCount = 50
  const step = Math.floor(data.length / particleCount)
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length

  for (let i = 0; i < particleCount; i++) {
    const dataIndex = i * step
    const value = data[dataIndex] * sensitivity
    const size = (value / 255) * 20 + 2

    // Random position influenced by audio
    const x = (width / particleCount) * i + Math.sin(Date.now() / 1000 + i) * 20
    const y = height / 2 + Math.sin(Date.now() / 500 + i * 2) * (value / 255) * (height / 3)

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `${color}${Math.floor((value / 255) * 200).toString(16).padStart(2, '0')}`
    ctx.fill()
  }
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Simple bars for mini visualizer
interface MiniBarsProps {
  barCount?: number
  className?: string
}

export const MiniBars: React.FC<MiniBarsProps> = ({
  barCount = 4,
  className,
}) => {
  const { isPlaying } = usePlayerStore()

  return (
    <div className={clsx('flex items-end gap-0.5 h-4', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'w-0.5 bg-primary-500 rounded-full transition-all',
            isPlaying ? 'animate-pulse' : 'h-1'
          )}
          style={{
            height: isPlaying ? `${40 + Math.random() * 60}%` : '25%',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
