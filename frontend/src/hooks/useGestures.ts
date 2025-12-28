import { useRef, useState, useCallback, useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { useThemeStore } from '@/stores/themeStore'

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  isSwiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

interface SwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwiping?: (state: SwipeState) => void
  preventScroll?: boolean
}

// 滑动手势 Hook
export function useSwipe(options: SwipeOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwiping,
    preventScroll = false,
  } = options

  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  })

  const ref = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isSwiping) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - state.startX
    const deltaY = touch.clientY - state.startY

    // 确定滑动方向
    let direction: SwipeState['direction'] = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    // 如果是水平滑动且需要阻止滚动
    if (preventScroll && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
    }

    const newState = {
      ...state,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      direction,
    }

    setState(newState)
    onSwiping?.(newState)
  }, [state, onSwiping, preventScroll])

  const handleTouchEnd = useCallback(() => {
    if (!state.isSwiping) return

    const { deltaX, deltaY, direction } = state

    // 检查是否超过阈值
    if (Math.abs(deltaX) > threshold && direction) {
      if (direction === 'left') onSwipeLeft?.()
      if (direction === 'right') onSwipeRight?.()
    }

    if (Math.abs(deltaY) > threshold && direction) {
      if (direction === 'up') onSwipeUp?.()
      if (direction === 'down') onSwipeDown?.()
    }

    setState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
      direction: null,
    })
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  return { ref, ...state }
}

// 播放器滑动切歌 Hook
export function usePlayerSwipe() {
  const { playNext, playPrevious } = usePlayerStore()

  return useSwipe({
    threshold: 80,
    onSwipeLeft: () => {
      playNext()
      triggerHaptic('light')
    },
    onSwipeRight: () => {
      playPrevious()
      triggerHaptic('light')
    },
    preventScroll: true,
  })
}

// 下拉刷新 Hook
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const threshold = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY.current) * 0.5)

    if (distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [isPulling, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      triggerHaptic('medium')
      await onRefresh()
      setIsRefreshing(false)
    }

    setIsPulling(false)
    setPullDistance(0)
  }, [isPulling, pullDistance, isRefreshing, onRefresh])

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / threshold, 1),
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

// 长按菜单 Hook
export function useLongPress(
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  options: { delay?: number; onPress?: () => void } = {}
) {
  const { delay = 500, onPress } = options
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false

    // 获取位置
    let x = 0, y = 0
    if ('touches' in e) {
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    } else {
      x = e.clientX
      y = e.clientY
    }
    setPosition({ x, y })

    timerRef.current = setTimeout(() => {
      isLongPress.current = true
      triggerHaptic('heavy')
      onLongPress(e)
    }, delay)
  }, [onLongPress, delay])

  const stop = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!isLongPress.current && onPress) {
      onPress()
    }
  }, [onPress])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    position,
    handlers: {
      onTouchStart: start,
      onTouchEnd: stop,
      onTouchMove: cancel,
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: cancel,
    },
  }
}

// 双击 Hook
export function useDoubleTap(
  onDoubleTap: () => void,
  onSingleTap?: () => void,
  delay = 300
) {
  const tapCount = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleTap = useCallback(() => {
    tapCount.current += 1

    if (tapCount.current === 1) {
      timerRef.current = setTimeout(() => {
        if (tapCount.current === 1) {
          onSingleTap?.()
        }
        tapCount.current = 0
      }, delay)
    } else if (tapCount.current === 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      tapCount.current = 0
      triggerHaptic('light')
      onDoubleTap()
    }
  }, [onDoubleTap, onSingleTap, delay])

  return { onClick: handleTap }
}

// 捏合缩放 Hook
export function usePinchZoom(
  onZoom: (scale: number) => void,
  options: { minScale?: number; maxScale?: number } = {}
) {
  const { minScale = 0.5, maxScale = 3 } = options
  const [scale, setScale] = useState(1)
  const initialDistance = useRef(0)
  const initialScale = useRef(1)

  const getDistance = (touches: React.TouchList) => {
    const [t1, t2] = [touches[0], touches[1]]
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches)
      initialScale.current = scale
    }
  }, [scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current > 0) {
      const currentDistance = getDistance(e.touches)
      const newScale = (currentDistance / initialDistance.current) * initialScale.current
      const clampedScale = Math.min(Math.max(newScale, minScale), maxScale)

      setScale(clampedScale)
      onZoom(clampedScale)
    }
  }, [onZoom, minScale, maxScale])

  const handleTouchEnd = useCallback(() => {
    initialDistance.current = 0
  }, [])

  return {
    scale,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

// 触觉反馈
export function triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
  // 检查是否支持 Vibration API
  if ('vibrate' in navigator) {
    const durations = {
      light: 10,
      medium: 20,
      heavy: 40,
    }
    navigator.vibrate(durations[intensity])
  }

  // 对于 iOS，使用 Capacitor Haptics 插件（如果可用）
  // @ts-ignore
  if (window.Capacitor?.Plugins?.Haptics) {
    const styles = {
      light: 'LIGHT',
      medium: 'MEDIUM',
      heavy: 'HEAVY',
    }
    // @ts-ignore
    window.Capacitor.Plugins.Haptics.impact({ style: styles[intensity] })
  }
}

// 滚动位置记忆 Hook
export function useScrollPosition(key: string) {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    // 恢复滚动位置
    const savedPosition = sessionStorage.getItem(`scroll-${key}`)
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10))
    }

    // 保存滚动位置
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, String(window.scrollY))
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [key])

  return scrollPosition
}
