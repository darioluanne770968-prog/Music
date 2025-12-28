import { useState, useEffect, useCallback } from 'react'

// 断点定义
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export type Breakpoint = keyof typeof breakpoints

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'

// 屏幕方向
export type Orientation = 'portrait' | 'landscape'

interface ResponsiveState {
  width: number
  height: number
  breakpoint: Breakpoint
  deviceType: DeviceType
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
  isTouchDevice: boolean
  isRetina: boolean
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// 获取当前断点
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  return 'sm'
}

// 获取设备类型
function getDeviceType(width: number): DeviceType {
  if (width < breakpoints.md) return 'mobile'
  if (width < breakpoints.lg) return 'tablet'
  if (width < breakpoints.xl) return 'desktop'
  return 'large-desktop'
}

// 检测触摸设备
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 检测 Retina 屏幕
function isRetinaDisplay(): boolean {
  if (typeof window === 'undefined') return false
  return window.devicePixelRatio > 1
}

// 获取安全区域
function getSafeAreaInsets() {
  if (typeof getComputedStyle === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10) ||
         parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) ||
            parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10) ||
          parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10) ||
           parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
  }
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        breakpoint: 'sm',
        deviceType: 'mobile',
        orientation: 'portrait',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
        isPortrait: true,
        isLandscape: false,
        isTouchDevice: false,
        isRetina: false,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getCurrentBreakpoint(width)
    const deviceType = getDeviceType(width)
    const orientation = width > height ? 'landscape' : 'portrait'

    return {
      width,
      height,
      breakpoint,
      deviceType,
      orientation,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isLargeDesktop: deviceType === 'large-desktop',
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      isTouchDevice: isTouchDevice(),
      isRetina: isRetinaDisplay(),
      safeAreaInsets: getSafeAreaInsets(),
    }
  })

  const handleResize = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getCurrentBreakpoint(width)
    const deviceType = getDeviceType(width)
    const orientation = width > height ? 'landscape' : 'portrait'

    setState({
      width,
      height,
      breakpoint,
      deviceType,
      orientation,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isLargeDesktop: deviceType === 'large-desktop',
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      isTouchDevice: isTouchDevice(),
      isRetina: isRetinaDisplay(),
      safeAreaInsets: getSafeAreaInsets(),
    })
  }, [])

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [handleResize])

  return state
}

// 媒体查询 Hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// 断点匹配 Hook
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`)
}

// iPad 检测 Hook
export function useIsIPad(): boolean {
  const [isIPad, setIsIPad] = useState(false)

  useEffect(() => {
    const checkIPad = () => {
      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1366
      setIsIPad(isIOS && isTabletSize)
    }

    checkIPad()
    window.addEventListener('resize', checkIPad)
    return () => window.removeEventListener('resize', checkIPad)
  }, [])

  return isIPad
}

// 键盘高度 Hook (移动端)
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!('visualViewport' in window)) return

    const handleResize = () => {
      const viewport = window.visualViewport
      if (viewport) {
        const height = window.innerHeight - viewport.height
        setKeyboardHeight(Math.max(0, height))
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return keyboardHeight
}

// 屏幕唤醒锁 Hook
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
          setIsLocked(true)

          wakeLock.addEventListener('release', () => {
            setIsLocked(false)
          })
        }
      } catch (err) {
        console.error('Wake Lock error:', err)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      wakeLock?.release()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isLocked
}

// 方向锁定 Hook (需要全屏 API)
export function useOrientationLock(orientation: OrientationLockType = 'portrait') {
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && 'lock' in screen.orientation) {
          await screen.orientation.lock(orientation)
        }
      } catch (err) {
        // 静默失败，某些浏览器不支持
      }
    }

    lockOrientation()

    return () => {
      try {
        screen.orientation?.unlock()
      } catch {
        // ignore
      }
    }
  }, [orientation])
}
