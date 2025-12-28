import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLongPress, triggerHaptic } from '@/hooks/useGestures'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
  divider?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
  disabled?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  disabled = false,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLongPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return

    let x = 0, y = 0
    if ('touches' in e) {
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    } else {
      x = e.clientX
      y = e.clientY
    }

    // 确保菜单不超出屏幕
    const menuWidth = 200
    const menuHeight = items.length * 48 + 16
    const maxX = window.innerWidth - menuWidth - 16
    const maxY = window.innerHeight - menuHeight - 16

    setPosition({
      x: Math.min(x, maxX),
      y: Math.min(y, maxY),
    })

    setIsOpen(true)
    onOpen?.()
  }, [disabled, items.length, onOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return
    triggerHaptic('light')
    item.onClick()
    handleClose()
  }, [handleClose])

  // 右键菜单支持（桌面端）
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    handleLongPress(e)
  }, [disabled, handleLongPress])

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, handleClose])

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  const { handlers } = useLongPress(handleLongPress)

  return (
    <>
      <div {...handlers} onContextMenu={handleContextMenu}>
        {children}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-[100] min-w-[200px] py-2 bg-dark-800 dark:bg-dark-800 light:bg-white rounded-xl border border-white/10 light:border-slate-200 shadow-2xl context-menu"
              style={{
                left: position.x,
                top: position.y,
                '--origin-x': '0%',
                '--origin-y': '0%',
              } as React.CSSProperties}
            >
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {item.divider && index > 0 && (
                    <div className="my-1 border-t border-white/10 light:border-slate-200" />
                  )}
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors
                      ${item.danger
                        ? 'text-red-500 hover:bg-red-500/10'
                        : 'text-white light:text-slate-900 hover:bg-white/10 light:hover:bg-slate-100'
                      }
                      ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                  >
                    {item.icon && (
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

// 预设的歌曲上下文菜单项
export const getSongContextMenuItems = (
  song: { id: string; name: string },
  handlers: {
    onPlay?: () => void
    onPlayNext?: () => void
    onAddToQueue?: () => void
    onAddToPlaylist?: () => void
    onDownload?: () => void
    onShare?: () => void
    onViewArtist?: () => void
    onViewAlbum?: () => void
    onLike?: () => void
    onDelete?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'play',
    label: '播放',
    icon: <PlayIcon />,
    onClick: handlers.onPlay || (() => {}),
  },
  {
    id: 'play-next',
    label: '下一首播放',
    icon: <NextIcon />,
    onClick: handlers.onPlayNext || (() => {}),
  },
  {
    id: 'add-to-queue',
    label: '添加到播放队列',
    icon: <QueueIcon />,
    onClick: handlers.onAddToQueue || (() => {}),
  },
  {
    id: 'add-to-playlist',
    label: '添加到歌单',
    icon: <PlusIcon />,
    onClick: handlers.onAddToPlaylist || (() => {}),
    divider: true,
  },
  {
    id: 'like',
    label: '收藏',
    icon: <HeartIcon />,
    onClick: handlers.onLike || (() => {}),
  },
  {
    id: 'download',
    label: '下载',
    icon: <DownloadIcon />,
    onClick: handlers.onDownload || (() => {}),
  },
  {
    id: 'share',
    label: '分享',
    icon: <ShareIcon />,
    onClick: handlers.onShare || (() => {}),
    divider: true,
  },
  {
    id: 'view-artist',
    label: '查看歌手',
    icon: <ArtistIcon />,
    onClick: handlers.onViewArtist || (() => {}),
  },
  {
    id: 'view-album',
    label: '查看专辑',
    icon: <AlbumIcon />,
    onClick: handlers.onViewAlbum || (() => {}),
  },
]

// Icons
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const NextIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const QueueIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
)

const ArtistIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const AlbumIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
)

export default ContextMenu
