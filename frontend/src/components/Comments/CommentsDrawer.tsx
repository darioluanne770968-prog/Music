import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentSection } from './CommentSection'
import { usePlayerStore } from '@/stores/playerStore'

interface CommentsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ isOpen, onClose }) => {
  const { currentSong } = usePlayerStore()

  if (!currentSong) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] bg-dark-900 rounded-t-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-dark-900/90 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentSong.cover || '/default-cover.jpg'}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">
                      {currentSong.name}
                    </p>
                    <p className="text-xs text-white/50">{currentSong.artist?.name || '未知歌手'}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-4 py-4 scrollbar-thin">
              <CommentSection
                resourceId={currentSong.id}
                resourceType="song"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CommentsDrawer
