import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayRecord {
  songId: number
  songName: string
  artistName: string
  artistId?: number
  albumName?: string
  albumId?: number
  cover?: string
  playCount: number
  totalDuration: number // in seconds
  lastPlayed: number // timestamp
}

interface DailyStats {
  date: string // YYYY-MM-DD
  totalTime: number // seconds
  songCount: number
}

interface StatsStore {
  // Records
  songRecords: Record<number, PlayRecord>
  artistRecords: Record<string, { name: string; playCount: number; totalDuration: number }>
  dailyStats: DailyStats[]

  // Computed stats
  totalListeningTime: number
  totalSongsPlayed: number

  // Actions
  recordPlay: (song: {
    id: number
    name: string
    artist: string
    artistId?: number
    album?: string
    albumId?: number
    cover?: string
  }, duration: number) => void

  getTopSongs: (limit?: number) => PlayRecord[]
  getTopArtists: (limit?: number) => { name: string; playCount: number; totalDuration: number }[]
  getRecentlyPlayed: (limit?: number) => PlayRecord[]
  getDailyStats: (days?: number) => DailyStats[]
  getTotalStats: () => { totalTime: number; totalSongs: number; totalArtists: number }
  clearStats: () => void
}

const getTodayDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      songRecords: {},
      artistRecords: {},
      dailyStats: [],
      totalListeningTime: 0,
      totalSongsPlayed: 0,

      recordPlay: (song, duration) => {
        const { songRecords, artistRecords, dailyStats, totalListeningTime, totalSongsPlayed } = get()
        const now = Date.now()
        const today = getTodayDate()

        // Update song record
        const existingSong = songRecords[song.id]
        const newSongRecords = {
          ...songRecords,
          [song.id]: {
            songId: song.id,
            songName: song.name,
            artistName: song.artist,
            artistId: song.artistId,
            albumName: song.album,
            albumId: song.albumId,
            cover: song.cover,
            playCount: (existingSong?.playCount || 0) + 1,
            totalDuration: (existingSong?.totalDuration || 0) + duration,
            lastPlayed: now,
          },
        }

        // Update artist record
        const artistKey = song.artist.toLowerCase()
        const existingArtist = artistRecords[artistKey]
        const newArtistRecords = {
          ...artistRecords,
          [artistKey]: {
            name: song.artist,
            playCount: (existingArtist?.playCount || 0) + 1,
            totalDuration: (existingArtist?.totalDuration || 0) + duration,
          },
        }

        // Update daily stats
        const todayIndex = dailyStats.findIndex(d => d.date === today)
        let newDailyStats: DailyStats[]

        if (todayIndex >= 0) {
          newDailyStats = [...dailyStats]
          newDailyStats[todayIndex] = {
            ...newDailyStats[todayIndex],
            totalTime: newDailyStats[todayIndex].totalTime + duration,
            songCount: newDailyStats[todayIndex].songCount + 1,
          }
        } else {
          newDailyStats = [
            ...dailyStats,
            { date: today, totalTime: duration, songCount: 1 },
          ].slice(-365) // Keep last 365 days
        }

        set({
          songRecords: newSongRecords,
          artistRecords: newArtistRecords,
          dailyStats: newDailyStats,
          totalListeningTime: totalListeningTime + duration,
          totalSongsPlayed: totalSongsPlayed + 1,
        })
      },

      getTopSongs: (limit = 10) => {
        const { songRecords } = get()
        return Object.values(songRecords)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, limit)
      },

      getTopArtists: (limit = 10) => {
        const { artistRecords } = get()
        return Object.values(artistRecords)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, limit)
      },

      getRecentlyPlayed: (limit = 20) => {
        const { songRecords } = get()
        return Object.values(songRecords)
          .sort((a, b) => b.lastPlayed - a.lastPlayed)
          .slice(0, limit)
      },

      getDailyStats: (days = 7) => {
        const { dailyStats } = get()
        return dailyStats.slice(-days)
      },

      getTotalStats: () => {
        const { totalListeningTime, totalSongsPlayed, artistRecords } = get()
        return {
          totalTime: totalListeningTime,
          totalSongs: totalSongsPlayed,
          totalArtists: Object.keys(artistRecords).length,
        }
      },

      clearStats: () => {
        set({
          songRecords: {},
          artistRecords: {},
          dailyStats: [],
          totalListeningTime: 0,
          totalSongsPlayed: 0,
        })
      },
    }),
    {
      name: 'soda-music-stats',
    }
  )
)
