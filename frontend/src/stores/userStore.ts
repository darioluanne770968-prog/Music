import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserSettings, Notification } from '@/types'

interface UserStore {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  settings: UserSettings
  notifications: Notification[]
  unreadCount: number

  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  setSettings: (settings: Partial<UserSettings>) => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setQuality: (quality: 'standard' | 'high' | 'lossless' | 'hires') => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: number) => void
  markAllNotificationsRead: () => void
  setIsLoading: (loading: boolean) => void
}

const defaultSettings: UserSettings = {
  theme: 'auto',
  quality: 'high',
  language: 'zh-CN',
  notifications: {
    pushEnabled: true,
    emailEnabled: false,
    commentReply: true,
    newFollower: true,
    newSong: true,
  },
  privacy: {
    showPlayHistory: true,
    showLikes: true,
    showPlaylists: true,
    allowMessages: 'all',
  },
  equalizer: {
    enabled: false,
    preset: 'flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      settings: defaultSettings,
      notifications: [],
      unreadCount: 0,

      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: user !== null
      }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        notifications: [],
        unreadCount: 0,
      }),

      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),

      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }))

        // Apply theme to document
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // Auto: check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.toggle('dark', prefersDark)
        }
      },

      setQuality: (quality) => set((state) => ({
        settings: { ...state.settings, quality },
      })),

      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
      })),

      markNotificationRead: (id) => set((state) => {
        const notification = state.notifications.find((n) => n.id === id)
        if (!notification || notification.isRead) return state

        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }
      }),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'soda-music-user',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
      }),
    }
  )
)

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('soda-music-user')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      const theme = state?.settings?.theme || 'auto'
      const root = document.documentElement

      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      }
    } catch (e) {
      // Ignore
    }
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { settings } = useUserStore.getState()
    if (settings.theme === 'auto') {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  })
}
