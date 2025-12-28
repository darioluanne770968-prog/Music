import React, { useRef, useEffect, useState } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { clsx } from 'clsx'

interface AudioVisualizerProps {
  className?: string
  type?: 'bars' | 'wave' | 'circle'
  barCount?: number
  color?: string
}

// Global audio context and analyser (singleton)
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let connectedElement: HTMLAudioElement | null = null

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className,
  type = 'bars',
  barCount = 32,
  color = 'primary',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { isPlaying, currentSong } = usePlayerStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize audio context and connect to audio element
  useEffect(() => {
    const initAudio = () => {
      // Find the Howler audio element
      const audioElements = document.querySelectorAll('audio')
      const audioElement = Array.from(audioElements).find(el => el.src && el.src.includes('http'))

      if (!audioElement) {
        // Retry after a short delay
        setTimeout(initAudio, 500)
        return
      }

      // Don't reconnect if already connected to the same element
      if (connectedElement === audioElement && analyser) {
        setIsInitialized(true)
        return
      }

      try {
        // Create audio context if not exists
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume()
        }

        // Create analyser if not exists
        if (!analyser) {
          analyser = audioContext.createAnalyser()
          analyser.fftSize = 256
          analyser.smoothingTimeConstant = 0.8
          analyser.connect(audioContext.destination)
        }

        // Only create source node if not already connected
        if (connectedElement !== audioElement) {
          // Disconnect old source if exists
          if (sourceNode) {
            try {
              sourceNode.disconnect()
            } catch (e) {
              // Ignore disconnect errors
            }
          }

          // Create new source node
          sourceNode = audioContext.createMediaElementSource(audioElement)
          sourceNode.connect(analyser)
          connectedElement = audioElement
        }

        setIsInitialized(true)
      } catch (error) {
        console.warn('Audio visualization init error:', error)
      }
    }

    if (currentSong) {
      // Delay to ensure audio element is ready
      setTimeout(initAudio, 100)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentSong?.id])

  // Draw visualization
  useEffect(() => {
    if (!canvasRef.current || !analyser || !isInitialized) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Get actual canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    updateCanvasSize()

    const getGradientColor = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width / window.devicePixelRatio, 0)
      if (color === 'primary') {
        gradient.addColorStop(0, '#ec4899')
        gradient.addColorStop(0.5, '#a855f7')
        gradient.addColorStop(1, '#6366f1')
      } else if (color === 'white') {
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)')
        gradient.addColorStop(1, 'rgba(255,255,255,0.4)')
      }
      return gradient
    }

    const drawBars = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, width, height)
      analyser!.getByteFrequencyData(dataArray)

      const barWidth = width / barCount
      const gap = 2

      ctx.fillStyle = getGradientColor()

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (bufferLength / barCount))
        const value = dataArray[dataIndex]
        const barHeight = (value / 255) * height * 0.9

        const x = i * barWidth
        const y = height - barHeight

        // Draw rounded bar
        const radius = Math.min(barWidth - gap, 4) / 2
        ctx.beginPath()
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, [radius, radius, 0, 0])
        ctx.fill()
      }
    }

    const drawWave = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, width, height)
      analyser!.getByteTimeDomainData(dataArray)

      ctx.lineWidth = 2
      ctx.strokeStyle = getGradientColor()
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    const drawCircle = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 3

      ctx.clearRect(0, 0, width, height)
      analyser!.getByteFrequencyData(dataArray)

      ctx.strokeStyle = getGradientColor()
      ctx.lineWidth = 2

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (bufferLength / barCount))
        const value = dataArray[dataIndex]
        const barLength = (value / 255) * radius * 0.5

        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2
        const x1 = centerX + Math.cos(angle) * radius
        const y1 = centerY + Math.sin(angle) * radius
        const x2 = centerX + Math.cos(angle) * (radius + barLength)
        const y2 = centerY + Math.sin(angle) * (radius + barLength)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    const draw = () => {
      if (!isPlaying) {
        // Draw static state when paused
        ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      switch (type) {
        case 'wave':
          drawWave()
          break
        case 'circle':
          drawCircle()
          break
        default:
          drawBars()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isInitialized, type, barCount, color])

  return (
    <canvas
      ref={canvasRef}
      className={clsx('w-full h-full', className)}
      style={{ display: 'block' }}
    />
  )
}

// Mini visualizer for showing in lists or mini player
export const MiniVisualizer: React.FC<{ isPlaying: boolean; className?: string }> = ({
  isPlaying,
  className,
}) => {
  return (
    <div className={clsx('flex items-end gap-0.5 h-4', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-0.5 bg-primary-500 rounded-full transition-all',
            isPlaying ? 'animate-equalizer' : 'h-1'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  )
}

export default AudioVisualizer
