import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DownloadedSong {
  id: number
  name: string
  artist: string
  album: string
  cover: string
  duration: number
  audioBlob?: Blob
  downloadedAt: number
  size: number
}

interface DownloadTask {
  songId: number
  songName: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'error'
  error?: string
}

interface DownloadStore {
  // State
  downloadedSongs: Record<number, DownloadedSong>
  downloadQueue: DownloadTask[]
  currentDownload: number | null
  isDownloading: boolean
  totalDownloadSize: number

  // Actions
  addToDownloadQueue: (song: {
    id: number
    name: string
    artist: string
    album: string
    cover: string
    duration: number
  }) => void
  removeFromQueue: (songId: number) => void
  startDownload: () => Promise<void>
  pauseDownload: () => void
  deleteDownload: (songId: number) => void
  clearAllDownloads: () => void
  isDownloaded: (songId: number) => boolean
  getDownloadedSong: (songId: number) => DownloadedSong | null
  getDownloadProgress: (songId: number) => number
}

// IndexedDB for storing audio blobs
const DB_NAME = 'soda-music-downloads'
const DB_VERSION = 1
const STORE_NAME = 'audio-files'

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

const saveAudioToIDB = async (id: number, blob: Blob): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ id, blob })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

const getAudioFromIDB = async (id: number): Promise<Blob | null> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      resolve(request.result?.blob || null)
    }
  })
}

const deleteAudioFromIDB = async (id: number): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloadedSongs: {},
      downloadQueue: [],
      currentDownload: null,
      isDownloading: false,
      totalDownloadSize: 0,

      addToDownloadQueue: (song) => {
        const { downloadQueue, downloadedSongs } = get()

        // Skip if already downloaded or in queue
        if (downloadedSongs[song.id]) return
        if (downloadQueue.find(t => t.songId === song.id)) return

        const task: DownloadTask = {
          songId: song.id,
          songName: song.name,
          progress: 0,
          status: 'pending',
        }

        set({ downloadQueue: [...downloadQueue, task] })

        // Auto-start download if not currently downloading
        if (!get().isDownloading) {
          get().startDownload()
        }
      },

      removeFromQueue: (songId) => {
        const { downloadQueue } = get()
        set({
          downloadQueue: downloadQueue.filter(t => t.songId !== songId),
        })
      },

      startDownload: async () => {
        const { downloadQueue, isDownloading, downloadedSongs } = get()

        if (isDownloading) return

        const pendingTask = downloadQueue.find(t => t.status === 'pending')
        if (!pendingTask) return

        set({ isDownloading: true, currentDownload: pendingTask.songId })

        // Update task status
        set({
          downloadQueue: downloadQueue.map(t =>
            t.songId === pendingTask.songId
              ? { ...t, status: 'downloading' as const, progress: 0 }
              : t
          ),
        })

        try {
          // Get audio URL from API
          const urlResponse = await fetch(`/api/song/url/v1?id=${pendingTask.songId}&level=exhigh`)
          const urlData = await urlResponse.json()

          if (urlData.code !== 200 || !urlData.data?.[0]?.url) {
            throw new Error('无法获取音频地址')
          }

          const audioUrl = urlData.data[0].url
          const fileSize = urlData.data[0].size || 0

          // Download with progress tracking
          const response = await fetch(audioUrl)

          if (!response.ok) {
            throw new Error('下载失败')
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('无法读取响应')
          }

          const chunks: Uint8Array[] = []
          let receivedLength = 0
          const contentLength = parseInt(response.headers.get('content-length') || '0') || fileSize

          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            chunks.push(value)
            receivedLength += value.length

            // Update progress
            const progress = contentLength > 0
              ? Math.round((receivedLength / contentLength) * 100)
              : 0

            set({
              downloadQueue: get().downloadQueue.map(t =>
                t.songId === pendingTask.songId
                  ? { ...t, progress }
                  : t
              ),
            })
          }

          // Combine chunks into blob
          const blob = new Blob(chunks, { type: 'audio/mpeg' })

          // Save to IndexedDB
          await saveAudioToIDB(pendingTask.songId, blob)

          // Get song details
          const songResponse = await fetch(`/api/song/detail?ids=${pendingTask.songId}`)
          const songData = await songResponse.json()
          const songInfo = songData.songs?.[0]

          // Add to downloaded songs
          const downloadedSong: DownloadedSong = {
            id: pendingTask.songId,
            name: songInfo?.name || pendingTask.songName,
            artist: songInfo?.ar?.[0]?.name || '未知歌手',
            album: songInfo?.al?.name || '未知专辑',
            cover: songInfo?.al?.picUrl || '',
            duration: Math.floor((songInfo?.dt || 0) / 1000),
            downloadedAt: Date.now(),
            size: blob.size,
          }

          set({
            downloadedSongs: { ...get().downloadedSongs, [pendingTask.songId]: downloadedSong },
            downloadQueue: get().downloadQueue.map(t =>
              t.songId === pendingTask.songId
                ? { ...t, status: 'completed' as const, progress: 100 }
                : t
            ),
            totalDownloadSize: get().totalDownloadSize + blob.size,
          })

          // Remove from queue after a delay
          setTimeout(() => {
            set({
              downloadQueue: get().downloadQueue.filter(t => t.songId !== pendingTask.songId),
            })
          }, 2000)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '下载失败'

          set({
            downloadQueue: get().downloadQueue.map(t =>
              t.songId === pendingTask.songId
                ? { ...t, status: 'error' as const, error: errorMessage }
                : t
            ),
          })
        }

        set({ isDownloading: false, currentDownload: null })

        // Continue with next download
        const nextPending = get().downloadQueue.find(t => t.status === 'pending')
        if (nextPending) {
          get().startDownload()
        }
      },

      pauseDownload: () => {
        set({ isDownloading: false })
      },

      deleteDownload: async (songId) => {
        try {
          await deleteAudioFromIDB(songId)
        } catch (e) {
          console.error('Failed to delete from IDB:', e)
        }

        const { downloadedSongs, totalDownloadSize } = get()
        const song = downloadedSongs[songId]
        const newDownloadedSongs = { ...downloadedSongs }
        delete newDownloadedSongs[songId]

        set({
          downloadedSongs: newDownloadedSongs,
          totalDownloadSize: totalDownloadSize - (song?.size || 0),
        })
      },

      clearAllDownloads: async () => {
        const { downloadedSongs } = get()

        for (const songId of Object.keys(downloadedSongs)) {
          try {
            await deleteAudioFromIDB(parseInt(songId))
          } catch (e) {
            console.error('Failed to delete from IDB:', e)
          }
        }

        set({
          downloadedSongs: {},
          downloadQueue: [],
          totalDownloadSize: 0,
        })
      },

      isDownloaded: (songId) => {
        return !!get().downloadedSongs[songId]
      },

      getDownloadedSong: (songId) => {
        return get().downloadedSongs[songId] || null
      },

      getDownloadProgress: (songId) => {
        const task = get().downloadQueue.find(t => t.songId === songId)
        return task?.progress || 0
      },
    }),
    {
      name: 'soda-music-downloads',
      partialize: (state) => ({
        downloadedSongs: state.downloadedSongs,
        totalDownloadSize: state.totalDownloadSize,
      }),
    }
  )
)

// Export helper to get audio blob URL for playback
export const getOfflineAudioUrl = async (songId: number): Promise<string | null> => {
  try {
    const blob = await getAudioFromIDB(songId)
    if (blob) {
      return URL.createObjectURL(blob)
    }
  } catch (e) {
    console.error('Failed to get offline audio:', e)
  }
  return null
}
