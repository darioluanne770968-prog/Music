import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 主题类型定义
export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'pink' | 'purple' | 'blue' | 'cyan' | 'amber' | 'green' | 'red' | 'custom'

// 预设主题色
export const accentColors: Record<AccentColor, { primary: string; rgb: string }> = {
  pink: { primary: '#ff3381', rgb: '255, 51, 129' },
  purple: { primary: '#8b5cf6', rgb: '139, 92, 246' },
  blue: { primary: '#3b82f6', rgb: '59, 130, 246' },
  cyan: { primary: '#06b6d4', rgb: '6, 182, 212' },
  amber: { primary: '#f59e0b', rgb: '245, 158, 11' },
  green: { primary: '#10b981', rgb: '16, 185, 129' },
  red: { primary: '#ef4444', rgb: '239, 68, 68' },
  custom: { primary: '#ff3381', rgb: '255, 51, 129' },
}

// 动态主题状态
export interface DynamicTheme {
  enabled: boolean
  dominantColor: string | null
  palette: string[]
  blur: boolean
}

// 无障碍设置
export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  boldText: boolean
}

interface ThemeStore {
  // 主题模式
  themeMode: ThemeMode
  resolvedTheme: 'light' | 'dark'

  // 强调色
  accentColor: AccentColor
  customColor: string

  // 动态主题（根据专辑封面）
  dynamicTheme: DynamicTheme

  // 无障碍设置
  accessibility: AccessibilitySettings

  // 背景模糊效果
  backgroundBlur: boolean

  // 动画设置
  animations: {
    enabled: boolean
    pageTransitions: boolean
    microInteractions: boolean
  }

  // Actions
  setThemeMode: (mode: ThemeMode) => void
  setAccentColor: (color: AccentColor) => void
  setCustomColor: (color: string) => void
  setDynamicTheme: (enabled: boolean) => void
  updateDynamicColors: (colors: { dominant: string; palette: string[] }) => void
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void
  setBackgroundBlur: (enabled: boolean) => void
  setAnimations: (settings: Partial<ThemeStore['animations']>) => void
  resetToDefaults: () => void
}

// 获取系统主题
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

// 默认设置
const defaultSettings = {
  themeMode: 'dark' as ThemeMode,
  resolvedTheme: 'dark' as 'light' | 'dark',
  accentColor: 'pink' as AccentColor,
  customColor: '#ff3381',
  dynamicTheme: {
    enabled: false,
    dominantColor: null,
    palette: [],
    blur: true,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium' as const,
    boldText: false,
  },
  backgroundBlur: true,
  animations: {
    enabled: true,
    pageTransitions: true,
    microInteractions: true,
  },
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setThemeMode: (mode) => {
        const resolved = mode === 'system' ? getSystemTheme() : mode
        set({ themeMode: mode, resolvedTheme: resolved })

        // 更新 DOM
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(resolved)
          document.documentElement.style.colorScheme = resolved
        }
      },

      setAccentColor: (color) => {
        set({ accentColor: color })

        // 更新 CSS 变量
        if (typeof document !== 'undefined') {
          const colorValue = color === 'custom' ? get().customColor : accentColors[color].primary
          const rgbValue = color === 'custom' ? hexToRgb(get().customColor) : accentColors[color].rgb
          document.documentElement.style.setProperty('--primary', rgbValue)
          document.documentElement.style.setProperty('--primary-color', colorValue)
        }
      },

      setCustomColor: (color) => {
        set({ customColor: color })
        if (get().accentColor === 'custom') {
          document.documentElement.style.setProperty('--primary', hexToRgb(color))
          document.documentElement.style.setProperty('--primary-color', color)
        }
      },

      setDynamicTheme: (enabled) => {
        set((state) => ({
          dynamicTheme: { ...state.dynamicTheme, enabled }
        }))
      },

      updateDynamicColors: ({ dominant, palette }) => {
        const state = get()
        if (!state.dynamicTheme.enabled) return

        set((state) => ({
          dynamicTheme: {
            ...state.dynamicTheme,
            dominantColor: dominant,
            palette,
          }
        }))

        // 更新动态背景
        if (typeof document !== 'undefined' && state.dynamicTheme.enabled) {
          document.documentElement.style.setProperty('--dynamic-color', dominant)
          document.documentElement.style.setProperty('--dynamic-rgb', hexToRgb(dominant))
        }
      },

      setAccessibility: (settings) => {
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings }
        }))

        // 更新 DOM 类
        if (typeof document !== 'undefined') {
          const { accessibility } = get()
          document.documentElement.classList.toggle('high-contrast', accessibility.highContrast)
          document.documentElement.classList.toggle('reduce-motion', accessibility.reducedMotion)
          document.documentElement.classList.toggle('bold-text', accessibility.boldText)
          document.documentElement.dataset.fontSize = accessibility.fontSize
        }
      },

      setBackgroundBlur: (enabled) => {
        set({ backgroundBlur: enabled })
      },

      setAnimations: (settings) => {
        set((state) => ({
          animations: { ...state.animations, ...settings }
        }))

        if (typeof document !== 'undefined') {
          const { animations } = get()
          document.documentElement.classList.toggle('no-animations', !animations.enabled)
        }
      },

      resetToDefaults: () => {
        set(defaultSettings)

        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'high-contrast', 'reduce-motion', 'bold-text', 'no-animations')
          document.documentElement.classList.add('dark')
          document.documentElement.style.setProperty('--primary', '255, 51, 129')
          document.documentElement.style.removeProperty('--dynamic-color')
          document.documentElement.style.removeProperty('--dynamic-rgb')
          document.documentElement.dataset.fontSize = 'medium'
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        accentColor: state.accentColor,
        customColor: state.customColor,
        dynamicTheme: { enabled: state.dynamicTheme.enabled, blur: state.dynamicTheme.blur },
        accessibility: state.accessibility,
        backgroundBlur: state.backgroundBlur,
        animations: state.animations,
      }),
    }
  )
)

// 辅助函数：HEX 转 RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '255, 51, 129'
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState()
    if (store.themeMode === 'system') {
      store.setThemeMode('system')
    }
  })
}

// 初始化主题
export const initializeTheme = () => {
  const store = useThemeStore.getState()
  store.setThemeMode(store.themeMode)
  store.setAccentColor(store.accentColor)
  store.setAccessibility(store.accessibility)
  store.setAnimations(store.animations)
}
