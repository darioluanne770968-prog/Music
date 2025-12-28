import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'
import { formatDuration } from '@/utils/format'
import type { Song } from '@/types'

interface PlayQueueProps {
  isOpen: boolean
  onClose: () => void
}

export const PlayQueue: React.FC<PlayQueueProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    currentIndex,
    currentSong,
    setCurrentIndex,
    removeFromQueue,
    clearQueue,
    moveInQueue,
  } = usePlayerStore()

  const handlePlaySong = (index: number) => {
    setCurrentIndex(index)
  }

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    removeFromQueue(index)
  }

  const handleClearQueue = () => {
    clearQueue()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-dark-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">播放队列</h2>
                <p className="text-sm text-white/50">{queue.length} 首歌曲</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearQueue}
                  className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  清空
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Current Song */}
            {currentSong && (
              <div className="px-4 py-3 bg-primary-500/10 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentSong.cover || currentSong.album?.cover || '/default-cover.jpg'}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                      <div className="flex items-end gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                            className="w-0.5 bg-primary-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-500 truncate">
                      正在播放
                    </p>
                    <p className="text-white truncate">{currentSong.name}</p>
                    <p className="text-sm text-white/50 truncate">{currentSong.artist?.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {queue.length > 0 ? (
                <div className="py-2">
                  {queue.map((song, index) => (
                    <motion.div
                      key={`${song.id}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handlePlaySong(index)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        index === currentIndex
                          ? 'bg-primary-500/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Index */}
                      <div className="w-8 text-center">
                        {index === currentIndex ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [4, 10, 4] }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                }}
                                className="w-0.5 bg-primary-500 rounded-full"
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-white/40">{index + 1}</span>
                        )}
                      </div>

                      {/* Cover */}
                      <img
                        src={song.cover || song.album?.cover || '/default-cover.jpg'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          index === currentIndex ? 'text-primary-500' : 'text-white'
                        }`}>
                          {song.name}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {song.artist?.name}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-white/40 tabular-nums">
                        {formatDuration(song.duration)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemove(e, index)}
                        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      >
                        <svg className="w-4 h-4 text-white/40 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                  </div>
                  <p className="text-white/60 mb-2">播放队列为空</p>
                  <p className="text-sm text-white/40">去发现页面添加一些歌曲吧</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {queue.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>共 {queue.length} 首</span>
                  <span>
                    总时长 {formatDuration(queue.reduce((acc, song) => acc + song.duration, 0))}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
