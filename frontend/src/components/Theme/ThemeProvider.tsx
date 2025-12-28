import React, { useEffect } from 'react'
import { useThemeStore, initializeTheme } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { resolvedTheme, accessibility, animations, backgroundBlur } = useThemeStore()

  // 初始化主题
  useEffect(() => {
    initializeTheme()
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const store = useThemeStore.getState()
      if (store.themeMode === 'system') {
        store.setThemeMode('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 监听系统 reduced motion 偏好
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches && !accessibility.reducedMotion) {
      useThemeStore.getState().setAccessibility({ reducedMotion: true })
    }
  }, [accessibility.reducedMotion])

  // 构建根类名
  const rootClasses = [
    resolvedTheme,
    accessibility.highContrast && 'high-contrast',
    accessibility.reducedMotion && 'reduce-motion',
    accessibility.boldText && 'bold-text',
    !animations.enabled && 'no-animations',
    !backgroundBlur && 'no-blur',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={rootClasses}
      data-font-size={accessibility.fontSize}
      style={{
        // 字体大小缩放
        fontSize: getFontSize(accessibility.fontSize),
      }}
    >
      {children}
    </div>
  )
}

// 字体大小映射
function getFontSize(size: string): string {
  const sizes: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px',
  }
  return sizes[size] || '16px'
}

export default ThemeProvider
