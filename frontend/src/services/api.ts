import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/userStore'
import type { ApiResponse, PaginatedResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = useUserStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          // Try to refresh token
          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await this.post<{ token: string }>('/auth/refresh', {
                refreshToken,
              })
              useUserStore.getState().setToken(response.token)
              return this.client(originalRequest)
            }
          } catch {
            // Refresh failed, logout
            useUserStore.getState().logout()
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config)
    return response.data.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config)
    return response.data.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config)
    return response.data.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config)
    return response.data.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config)
    return response.data.data
  }

  async getPaginated<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<T>>> = await this.client.get(
      url,
      { params }
    )
    return response.data.data
  }
}

export const api = new ApiClient()

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    sendCode: '/auth/send-code',
    resetPassword: '/auth/reset-password',
  },

  // User
  users: {
    me: '/users/me',
    settings: '/users/me/settings',
    profile: (id: number) => `/users/${id}`,
    playlists: (id: number) => `/users/${id}/playlists`,
    followers: (id: number) => `/users/${id}/followers`,
    following: (id: number) => `/users/${id}/following`,
    follow: (id: number) => `/users/${id}/follow`,
    activities: (id: number) => `/users/${id}/activities`,
    stats: (id: number) => `/users/${id}/stats`,
  },

  // Songs
  songs: {
    detail: (id: number) => `/songs/${id}`,
    url: (id: number) => `/songs/${id}/url`,
    lyrics: (id: number) => `/songs/${id}/lyrics`,
    comments: (id: number) => `/songs/${id}/comments`,
    like: (id: number) => `/songs/${id}/like`,
    similar: (id: number) => `/songs/${id}/similar`,
    new: '/songs/new',
    hot: '/songs/hot',
  },

  // Playlists
  playlists: {
    list: '/playlists',
    create: '/playlists',
    categories: '/playlists/categories',
    hot: '/playlists/hot',
    detail: (id: number) => `/playlists/${id}`,
    songs: (id: number) => `/playlists/${id}/songs`,
    like: (id: number) => `/playlists/${id}/like`,
    comments: (id: number) => `/playlists/${id}/comments`,
  },

  // Albums
  albums: {
    detail: (id: number) => `/albums/${id}`,
    songs: (id: number) => `/albums/${id}/songs`,
    new: '/albums/new',
    hot: '/albums/hot',
  },

  // Artists
  artists: {
    detail: (id: number) => `/artists/${id}`,
    songs: (id: number) => `/artists/${id}/songs`,
    albums: (id: number) => `/artists/${id}/albums`,
    mvs: (id: number) => `/artists/${id}/mvs`,
    follow: (id: number) => `/artists/${id}/follow`,
    hot: '/artists/hot',
  },

  // Search
  search: {
    all: '/search',
    songs: '/search/songs',
    artists: '/search/artists',
    albums: '/search/albums',
    playlists: '/search/playlists',
    users: '/search/users',
    lyrics: '/search/lyrics',
    suggest: '/search/suggest',
    hot: '/search/hot',
    recognize: '/search/recognize',
  },

  // Recommend
  recommend: {
    songs: '/recommend/songs',
    playlists: '/recommend/playlists',
    daily: '/recommend/daily',
    personalized: '/recommend/personalized',
    fm: '/recommend/fm',
    radar: '/recommend/radar',
    similar: (songId: number) => `/recommend/similar/${songId}`,
  },

  // MVs
  mvs: {
    detail: (id: number) => `/mvs/${id}`,
    url: (id: number) => `/mvs/${id}/url`,
    comments: (id: number) => `/mvs/${id}/comments`,
    hot: '/mvs/hot',
    new: '/mvs/new',
    recommend: '/mvs/recommend',
  },

  // Charts
  charts: {
    list: '/charts',
    detail: (id: number) => `/charts/${id}`,
    hot: '/charts/hot',
    new: '/charts/new',
    soar: '/charts/soar',
    original: '/charts/original',
  },

  // Comments
  comments: {
    detail: (id: number) => `/comments/${id}`,
    like: (id: number) => `/comments/${id}/like`,
    reply: (id: number) => `/comments/${id}/reply`,
    report: (id: number) => `/comments/${id}/report`,
  },

  // Messages
  messages: {
    conversations: '/messages/conversations',
    chat: (userId: number) => `/messages/${userId}`,
    read: (id: number) => `/messages/${id}/read`,
    notifications: '/messages/notifications',
  },

  // History
  history: {
    list: '/history',
    recent: '/history/recent',
    weekly: '/history/weekly',
  },

  // Stats
  stats: {
    today: '/stats/me/today',
    week: '/stats/me/week',
    month: '/stats/me/month',
    year: '/stats/me/year',
    taste: '/stats/me/taste',
  },
}
