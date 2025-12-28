import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song, PlayMode, PlayState, PlayQueue } from '@/types'

interface PlayerStore extends PlayState, PlayQueue {
  // State
  currentSong: Song | null
  isFullScreen: boolean
  isShowQueue: boolean
  isShowLyrics: boolean
  isLoading: boolean
  error: string | null
  seekTime: number | null

  // Computed
  queue: Song[]

  // Actions
  setCurrentSong: (song: Song) => void
  setCurrentIndex: (index: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: number) => void
  seekTo: (time: number) => void
  setDuration: (duration: number) => void
  setBuffered: (buffered: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlayMode: (mode: PlayMode) => void
  setPlaybackRate: (rate: number) => void

  // Queue Actions
  setQueue: (songs: Song[], startIndex?: number) => void
  addToQueue: (song: Song) => void
  addToQueueNext: (song: Song) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playNext: () => void
  playPrevious: () => void
  jumpTo: (index: number) => void
  shuffle: () => void

  // UI Actions
  toggleFullScreen: () => void
  setShowQueue: (show: boolean) => void
  setShowLyrics: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Fisher-Yates shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getNextIndex = (
  currentIndex: number,
  songsLength: number,
  playMode: PlayMode,
  history: number[]
): number => {
  if (songsLength === 0) return -1

  switch (playMode) {
    case 'single':
      return currentIndex
    case 'loop':
    case 'sequence':
      return (currentIndex + 1) % songsLength
    case 'shuffle':
      // Simple shuffle: random next song
      let next = Math.floor(Math.random() * songsLength)
      // Avoid playing the same song
      if (songsLength > 1) {
        while (next === currentIndex) {
          next = Math.floor(Math.random() * songsLength)
        }
      }
      return next
    case 'heartbeat':
      // Heartbeat mode: recommend similar songs (placeholder)
      return (currentIndex + 1) % songsLength
    default:
      return (currentIndex + 1) % songsLength
  }
}

const getPreviousIndex = (
  currentIndex: number,
  songsLength: number,
  history: number[]
): number => {
  if (songsLength === 0) return -1

  // If we have history, go back
  if (history.length > 0) {
    return history[history.length - 1]
  }

  // Otherwise, go to previous song
  return currentIndex > 0 ? currentIndex - 1 : songsLength - 1
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 0.8,
      isMuted: false,
      playMode: 'sequence',
      playbackRate: 1,
      songs: [],
      currentIndex: -1,
      history: [],
      isFullScreen: false,
      isShowQueue: false,
      isShowLyrics: false,
      isLoading: false,
      error: null,
      seekTime: null,

      // Computed - queue is alias for songs
      get queue() {
        return get().songs
      },

      // Basic Actions
      setCurrentSong: (song) => {
        const { songs } = get()
        const index = songs.findIndex((s) => s.id === song.id)

        if (index !== -1) {
          set({ currentSong: song, currentIndex: index, currentTime: 0, error: null })
        } else {
          set({
            currentSong: song,
            songs: [song, ...songs],
            currentIndex: 0,
            currentTime: 0,
            error: null
          })
        }
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      seekTo: (time) => set({ seekTime: time, currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setBuffered: (buffered) => set({ buffered }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setPlayMode: (playMode) => set({ playMode }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),

      // setCurrentIndex is alias for jumpTo
      setCurrentIndex: (index) => {
        const { songs, currentIndex, history } = get()
        if (index < 0 || index >= songs.length) return

        const newHistory = currentIndex >= 0 ? [...history, currentIndex] : history

        set({
          currentIndex: index,
          currentSong: songs[index],
          history: newHistory.slice(-50),
          currentTime: 0,
          isPlaying: true,
          error: null,
        })
      },

      // Queue Actions
      setQueue: (songs, startIndex = 0) => {
        const song = songs[startIndex] || null
        set({
          songs,
          currentIndex: startIndex,
          currentSong: song,
          history: [],
          currentTime: 0,
          isPlaying: song !== null,
          error: null,
        })
      },

      addToQueue: (song) => {
        const { songs } = get()
        if (!songs.some((s) => s.id === song.id)) {
          set({ songs: [...songs, song] })
        }
      },

      addToQueueNext: (song) => {
        const { songs, currentIndex } = get()
        if (!songs.some((s) => s.id === song.id)) {
          const newSongs = [...songs]
          newSongs.splice(currentIndex + 1, 0, song)
          set({ songs: newSongs })
        }
      },

      removeFromQueue: (index) => {
        const { songs, currentIndex } = get()
        if (index < 0 || index >= songs.length) return

        const newSongs = songs.filter((_, i) => i !== index)
        let newIndex = currentIndex

        if (index < currentIndex) {
          newIndex = currentIndex - 1
        } else if (index === currentIndex) {
          newIndex = Math.min(currentIndex, newSongs.length - 1)
        }

        set({
          songs: newSongs,
          currentIndex: newIndex,
          currentSong: newSongs[newIndex] || null,
        })
      },

      clearQueue: () => set({
        songs: [],
        currentIndex: -1,
        currentSong: null,
        history: [],
        isPlaying: false,
        currentTime: 0,
      }),

      playNext: () => {
        const { currentIndex, songs, playMode, history } = get()
        if (songs.length === 0) return

        // Add current to history
        const newHistory = currentIndex >= 0 ? [...history, currentIndex] : history

        const nextIndex = getNextIndex(currentIndex, songs.length, playMode, newHistory)

        // Stop if sequence mode and reached the end
        if (playMode === 'sequence' && currentIndex === songs.length - 1) {
          set({ isPlaying: false, currentTime: 0 })
          return
        }

        set({
          currentIndex: nextIndex,
          currentSong: songs[nextIndex],
          history: newHistory.slice(-50), // Keep last 50 in history
          currentTime: 0,
          isPlaying: true,
          error: null,
        })
      },

      playPrevious: () => {
        const { currentIndex, songs, history, currentTime } = get()
        if (songs.length === 0) return

        // If played more than 3 seconds, restart current song
        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }

        const prevIndex = getPreviousIndex(currentIndex, songs.length, history)
        const newHistory = history.length > 0 ? history.slice(0, -1) : history

        set({
          currentIndex: prevIndex,
          currentSong: songs[prevIndex],
          history: newHistory,
          currentTime: 0,
          isPlaying: true,
          error: null,
        })
      },

      jumpTo: (index) => {
        const { songs, currentIndex, history } = get()
        if (index < 0 || index >= songs.length) return

        const newHistory = currentIndex >= 0 ? [...history, currentIndex] : history

        set({
          currentIndex: index,
          currentSong: songs[index],
          history: newHistory.slice(-50),
          currentTime: 0,
          isPlaying: true,
          error: null,
        })
      },

      shuffle: () => {
        const { songs, currentSong } = get()
        if (songs.length <= 1) return

        const shuffled = shuffleArray(songs)
        const newIndex = currentSong
          ? shuffled.findIndex((s) => s.id === currentSong.id)
          : 0

        set({
          songs: shuffled,
          currentIndex: newIndex,
          history: [],
        })
      },

      // UI Actions
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
      setShowQueue: (isShowQueue) => set({ isShowQueue }),
      setShowLyrics: (isShowLyrics) => set({ isShowLyrics }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'soda-music-player',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        playMode: state.playMode,
        playbackRate: state.playbackRate,
        songs: state.songs.slice(0, 100), // Keep last 100 songs
        currentIndex: state.currentIndex,
      }),
    }
  )
)
