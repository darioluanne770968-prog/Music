import React, { useRef, useState, useCallback } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { triggerHaptic } from '@/hooks/useGestures'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  threshold?: number
  className?: string
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  // 使用 spring 动画
  const pullDistance = useSpring(0, { stiffness: 400, damping: 40 })
  const progress = useTransform(pullDistance, [0, threshold], [0, 1])
  const rotation = useTransform(pullDistance, [0, threshold], [0, 360])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return

    // 只在顶部时启用下拉刷新
    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop > 0) return

    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, (currentY.current - startY.current) * 0.5)

    // 使用弹性阻尼效果
    const dampedDistance = Math.min(distance, threshold * 1.5)
    pullDistance.set(dampedDistance)

    // 到达阈值时震动反馈
    if (distance >= threshold && !isRefreshing) {
      triggerHaptic('light')
    }
  }, [isPulling, isRefreshing, threshold, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return
    setIsPulling(false)

    const distance = currentY.current - startY.current

    if (distance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      pullDistance.set(60) // 保持在刷新位置
      triggerHaptic('medium')

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        pullDistance.set(0)
      }
    } else {
      pullDistance.set(0)
    }

    startY.current = 0
    currentY.current = 0
  }, [isPulling, threshold, isRefreshing, onRefresh, pullDistance])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 刷新指示器 */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-10"
        style={{ top: -60, y: pullDistance }}
      >
        <motion.div
          className="w-10 h-10 flex items-center justify-center"
          style={{ rotate: rotation }}
        >
          {isRefreshing ? (
            <LoadingSpinner />
          ) : (
            <RefreshIcon progress={progress} />
          )}
        </motion.div>
      </motion.div>

      {/* 内容 */}
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  )
}

// 刷新图标
const RefreshIcon: React.FC<{ progress: any }> = ({ progress }) => (
  <motion.svg
    className="w-6 h-6 text-primary-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    style={{ opacity: progress }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </motion.svg>
)

// 加载动画
const LoadingSpinner: React.FC = () => (
  <motion.div
    className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
)

// 简化版下拉刷新 Hook（用于需要更多自定义的场景）
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number
    disabled?: boolean
  } = {}
) {
  const { threshold = 80, disabled = false } = options
  const [state, setState] = useState({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    progress: 0,
  })

  const startY = useRef(0)

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (disabled || state.isRefreshing) return
      if (window.scrollY > 0) return

      startY.current = e.touches[0].clientY
      setState(s => ({ ...s, isPulling: true }))
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (!state.isPulling || state.isRefreshing) return

      const distance = Math.max(0, (e.touches[0].clientY - startY.current) * 0.5)
      const dampedDistance = Math.min(distance, threshold * 1.5)
      const progress = Math.min(distance / threshold, 1)

      setState(s => ({
        ...s,
        pullDistance: dampedDistance,
        progress,
      }))
    },

    onTouchEnd: async () => {
      if (!state.isPulling) return

      if (state.pullDistance >= threshold && !state.isRefreshing) {
        setState(s => ({ ...s, isRefreshing: true, isPulling: false }))
        triggerHaptic('medium')

        try {
          await onRefresh()
        } finally {
          setState({
            isPulling: false,
            isRefreshing: false,
            pullDistance: 0,
            progress: 0,
          })
        }
      } else {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          progress: 0,
        })
      }
    },
  }

  return { ...state, handlers }
}

export default PullToRefresh
