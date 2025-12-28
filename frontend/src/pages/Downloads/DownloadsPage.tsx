import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDownloadStore } from '@/stores/downloadStore'
import { usePlayerStore } from '@/stores/playerStore'
import { clsx } from 'clsx'

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate()
  const { setQueue } = usePlayerStore()
  const {
    downloadedSongs,
    downloadQueue,
    totalDownloadSize,
    deleteDownload,
    clearAllDownloads,
    isDownloading,
  } = useDownloadStore()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedSong, setSelectedSong] = useState<number | null>(null)

  const downloadedList = Object.values(downloadedSongs).sort(
    (a, b) => b.downloadedAt - a.downloadedAt
  )

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAll = () => {
    if (downloadedList.length > 0) {
      const formattedSongs = downloadedList.map(song => ({
        id: song.id,
        name: song.name,
        title: song.name,
        artist: song.artist,
        artists: [{ id: 0, name: song.artist }],
        album: song.album,
        cover: song.cover,
        duration: song.duration,
        isVip: false,
        mvId: 0,
        isOffline: true,
      }))
      setQueue(formattedSongs, 0)
    }
  }

  const handlePlaySong = (index: number) => {
    const formattedSongs = downloadedList.map(song => ({
      id: song.id,
      name: song.name,
      title: song.name,
      artist: song.artist,
      artists: [{ id: 0, name: song.artist }],
      album: song.album,
      cover: song.cover,
      duration: song.duration,
      isVip: false,
      mvId: 0,
      isOffline: true,
    }))
    setQueue(formattedSongs, index)
  }

  const handleDelete = (songId: number) => {
    setSelectedSong(songId)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (selectedSong !== null) {
      deleteDownload(selectedSong)
    }
    setShowDeleteConfirm(false)
    setSelectedSong(null)
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">下载管理</h1>
          </div>

          {downloadedList.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-500 hover:text-red-400"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">已下载</p>
            <p className="text-lg font-bold text-white">
              {downloadedList.length} 首歌曲
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/50">占用空间</p>
            <p className="text-lg font-bold text-primary-500">
              {formatSize(totalDownloadSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Download Queue */}
      {downloadQueue.length > 0 && (
        <div className="px-4 py-4 border-b border-white/5">
          <h3 className="text-sm font-medium text-white/50 mb-3">下载队列</h3>
          <div className="space-y-2">
            {downloadQueue.map((task) => (
              <div
                key={task.songId}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {task.songName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.status === 'downloading' && (
                      <>
                        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-primary-500 transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/50">{task.progress}%</span>
                      </>
                    )}
                    {task.status === 'pending' && (
                      <span className="text-xs text-white/50">等待中...</span>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-xs text-green-500">已完成</span>
                    )}
                    {task.status === 'error' && (
                      <span className="text-xs text-red-500">{task.error}</span>
                    )}
                  </div>
                </div>
                {task.status === 'downloading' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloaded Songs */}
      <div className="px-4 py-4">
        {downloadedList.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/50">已下载歌曲</h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-500 text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
              </svg>
              播放全部
            </motion.button>
          </div>
        )}

        {downloadedList.length > 0 ? (
          <div className="space-y-1">
            {downloadedList.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <img
                  src={song.cover || '/default-cover.jpg'}
                  alt={song.name}
                  className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                  onClick={() => handlePlaySong(index)}
                />

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlaySong(index)}>
                  <p className="text-sm font-medium text-white truncate">{song.name}</p>
                  <p className="text-xs text-white/50 truncate">{song.artist}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">{formatSize(song.size)}</span>

                  <button
                    onClick={() => handleDelete(song.id)}
                    className="p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
            </div>
            <p className="text-white/50 text-center">还没有下载任何歌曲</p>
            <p className="text-white/30 text-sm text-center mt-2">
              在播放页面点击下载按钮开始下载
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-dark-900 rounded-2xl p-6 max-w-sm mx-auto"
            >
              <h3 className="text-lg font-bold text-white mb-2">
                {selectedSong ? '删除下载' : '清空所有下载'}
              </h3>
              <p className="text-white/60 mb-6">
                {selectedSong
                  ? '确定要删除这首歌曲的下载吗？'
                  : '确定要清空所有下载吗？此操作不可撤销。'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium"
                >
                  取消
                </button>
                <button
                  onClick={selectedSong ? confirmDelete : () => { clearAllDownloads(); setShowDeleteConfirm(false) }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DownloadsPage
