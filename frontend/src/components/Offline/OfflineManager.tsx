import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDownloadStore } from '@/stores/downloadStore'

// 下载任务状态
export type DownloadStatus = 'pending' | 'downloading' | 'paused' | 'completed' | 'failed'

// 下载任务
export interface DownloadTask {
  id: string
  songId: string
  name: string
  artist: string
  cover: string
  size: number // bytes
  downloaded: number
  status: DownloadStatus
  quality: 'standard' | 'high' | 'lossless'
  createdAt: Date
  completedAt?: Date
}

// 存储统计
interface StorageStats {
  used: number
  available: number
  total: number
  musicSize: number
  cacheSize: number
  lyricsSize: number
}

interface OfflineManagerProps {
  isOpen: boolean
  onClose: () => void
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'storage' | 'settings'>('downloads')
  const [storageStats, setStorageStats] = useState<StorageStats>({
    used: 0,
    available: 0,
    total: 0,
    musicSize: 0,
    cacheSize: 0,
    lyricsSize: 0,
  })

  // 设置
  const [settings, setSettings] = useState({
    autoDownload: true,
    wifiOnly: true,
    downloadQuality: 'high' as 'standard' | 'high' | 'lossless',
    maxCacheSize: 2048, // MB
    offlineLyrics: true,
    deleteAfterListen: false,
  })

  // 获取存储信息
  useEffect(() => {
    const getStorageInfo = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        setStorageStats({
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0,
          musicSize: 0, // 需要从实际下载数据计算
          cacheSize: 0,
          lyricsSize: 0,
        })
      }
    }
    getStorageInfo()
  }, [])

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  // 模拟下载任务
  const downloadTasks: DownloadTask[] = [
    {
      id: '1',
      songId: 's1',
      name: '起风了',
      artist: '买辣椒也用券',
      cover: 'https://picsum.photos/100',
      size: 10 * 1024 * 1024,
      downloaded: 7 * 1024 * 1024,
      status: 'downloading',
      quality: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      songId: 's2',
      name: '告白气球',
      artist: '周杰伦',
      cover: 'https://picsum.photos/101',
      size: 8 * 1024 * 1024,
      downloaded: 8 * 1024 * 1024,
      status: 'completed',
      quality: 'lossless',
      createdAt: new Date(),
      completedAt: new Date(),
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-dark-900 rounded-t-3xl border-t border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">离线管理</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: 'downloads', label: '下载' },
                { id: 'storage', label: '存储' },
                { id: 'settings', label: '设置' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'downloads' && (
                <div className="p-4 space-y-4">
                  {/* Download Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">{downloadTasks.filter(t => t.status === 'completed').length}</p>
                      <p className="text-xs text-white/60">已下载</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-primary-400">{downloadTasks.filter(t => t.status === 'downloading').length}</p>
                      <p className="text-xs text-white/60">下载中</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">{formatSize(storageStats.musicSize)}</p>
                      <p className="text-xs text-white/60">总大小</p>
                    </div>
                  </div>

                  {/* Download List */}
                  {downloadTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <img
                        src={task.cover}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{task.name}</p>
                        <p className="text-xs text-white/60 truncate">{task.artist}</p>
                        {task.status === 'downloading' && (
                          <div className="mt-1">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(task.downloaded / task.size) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-white/40 mt-1">
                              {formatSize(task.downloaded)} / {formatSize(task.size)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'downloading' && (
                          <button className="p-2 rounded-full hover:bg-white/10">
                            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                          </button>
                        )}
                        {task.status === 'completed' && (
                          <span className="text-xs text-green-400">已完成</span>
                        )}
                        <button className="p-2 rounded-full hover:bg-white/10">
                          <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {downloadTasks.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">📥</div>
                      <p className="text-white/60">暂无下载任务</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="p-4 space-y-6">
                  {/* Storage Usage */}
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">存储使用</span>
                      <span className="text-sm text-white/60">
                        {formatSize(storageStats.used)} / {formatSize(storageStats.total)}
                      </span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                        style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-primary-500" />
                          <span className="text-xs text-white/60">音乐</span>
                        </div>
                        <p className="text-sm font-medium text-white">{formatSize(storageStats.musicSize)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                          <span className="text-xs text-white/60">缓存</span>
                        </div>
                        <p className="text-sm font-medium text-white">{formatSize(storageStats.cacheSize)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-cyan-500" />
                          <span className="text-xs text-white/60">歌词</span>
                        </div>
                        <p className="text-sm font-medium text-white">{formatSize(storageStats.lyricsSize)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clear Options */}
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <span className="text-white">清除缓存</span>
                      <span className="text-sm text-white/60">{formatSize(storageStats.cacheSize)}</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <span className="text-white">清除歌词缓存</span>
                      <span className="text-sm text-white/60">{formatSize(storageStats.lyricsSize)}</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400">
                      <span>清除所有下载</span>
                      <span className="text-sm">{formatSize(storageStats.musicSize)}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-4 space-y-4">
                  {/* Auto Download */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">智能下载</p>
                      <p className="text-xs text-white/60">自动下载喜欢的歌曲</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoDownload}
                      onChange={(v) => setSettings(s => ({ ...s, autoDownload: v }))}
                    />
                  </div>

                  {/* WiFi Only */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">仅WiFi下载</p>
                      <p className="text-xs text-white/60">仅在WiFi连接时下载</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.wifiOnly}
                      onChange={(v) => setSettings(s => ({ ...s, wifiOnly: v }))}
                    />
                  </div>

                  {/* Download Quality */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-white font-medium mb-3">下载音质</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['standard', 'high', 'lossless'] as const).map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setSettings(s => ({ ...s, downloadQuality: quality }))}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            settings.downloadQuality === quality
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {quality === 'standard' && '标准'}
                          {quality === 'high' && '高品质'}
                          {quality === 'lossless' && '无损'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Offline Lyrics */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">离线歌词</p>
                      <p className="text-xs text-white/60">同时下载歌词文件</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.offlineLyrics}
                      onChange={(v) => setSettings(s => ({ ...s, offlineLyrics: v }))}
                    />
                  </div>

                  {/* Max Cache Size */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">最大缓存</p>
                      <span className="text-sm text-primary-400">{settings.maxCacheSize} MB</span>
                    </div>
                    <input
                      type="range"
                      min={512}
                      max={4096}
                      step={256}
                      value={settings.maxCacheSize}
                      onChange={(e) => setSettings(s => ({ ...s, maxCacheSize: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toggle Switch
const ToggleSwitch: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      checked ? 'bg-primary-500' : 'bg-white/20'
    }`}
  >
    <motion.div
      className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
)

export default OfflineManager
