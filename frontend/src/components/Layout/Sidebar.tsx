import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { AuthModal } from '@/components/Auth/AuthModal'

interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '推荐',
    path: '/',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'explore',
    label: '发现',
    path: '/explore',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'toplist',
    label: '排行榜',
    path: '/toplist',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3v18l7-3 7 3V3H5zm4 5a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    id: 'library',
    label: '音乐库',
    path: '/library',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

const playlistItems = [
  { id: 'liked', label: '我喜欢的音乐', count: 128 },
  { id: 'recent', label: '最近播放', count: 50 },
  { id: 'local', label: '本地音乐', count: 0 },
]

interface SidebarProps {
  onOpenThemeSettings?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenThemeSettings }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useUserStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-dark-900/50 backdrop-blur-xl border-r border-white/5 z-40">
      {/* Titlebar drag area for macOS */}
      <div className="h-7 titlebar-drag" />

      {/* Logo */}
      <div className="p-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">汽水音乐</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4 flex-shrink-0">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm">搜索音乐</span>
        </button>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Main Navigation */}
      <nav className="px-3 mb-6">
        <div className="text-xs font-medium text-white/30 px-3 mb-2">发现音乐</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full nav-item ${isActive ? 'active' : ''}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={isActive ? 'text-primary-500' : ''}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Tools */}
      <nav className="px-3 mb-4">
        <div className="text-xs font-medium text-white/30 px-3 mb-2">工具</div>
        <button
          onClick={() => navigate('/recognition')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/recognition' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="text-sm">听歌识曲</span>
        </button>
        <button
          onClick={() => navigate('/listen-together')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/listen-together' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="text-sm">一起听</span>
        </button>
        <button
          onClick={() => navigate('/smart-playlist')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/smart-playlist' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <span className="text-sm">智能歌单</span>
        </button>
        <button
          onClick={() => navigate('/stats')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/stats' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
          <span className="text-sm">听歌统计</span>
        </button>
        <button
          onClick={() => navigate('/downloads')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/downloads' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span className="text-sm">下载管理</span>
        </button>
        <button
          onClick={onOpenThemeSettings}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 000 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
          <span className="text-sm">外观设置</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/settings' ? 'bg-white/10 text-white' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          <span className="text-sm">设置</span>
        </button>
      </nav>

      {/* 创作工具 */}
      <nav className="px-3 mb-4">
        <div className="text-xs font-medium text-white/30 px-3 mb-2">创作工具</div>
        <button
          onClick={() => navigate('/ai-composer')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/ai-composer' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎼</span>
          <span className="text-sm">AI 作曲</span>
        </button>
        <button
          onClick={() => navigate('/sheet-editor')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/sheet-editor' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎵</span>
          <span className="text-sm">乐谱编辑</span>
        </button>
        <button
          onClick={() => navigate('/mv-creator')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/mv-creator' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎬</span>
          <span className="text-sm">MV 创作</span>
        </button>
        <button
          onClick={() => navigate('/podcast-studio')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/podcast-studio' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎙️</span>
          <span className="text-sm">播客工作室</span>
        </button>
        <button
          onClick={() => navigate('/white-noise')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/white-noise' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🌊</span>
          <span className="text-sm">白噪音</span>
        </button>
        <button
          onClick={() => navigate('/smart-scene')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/smart-scene' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎯</span>
          <span className="text-sm">智能场景</span>
        </button>
        <button
          onClick={() => navigate('/music-learning')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/music-learning' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">📚</span>
          <span className="text-sm">音乐学习</span>
        </button>
        <button
          onClick={() => navigate('/creator-economy')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/creator-economy' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">💰</span>
          <span className="text-sm">创作者中心</span>
        </button>
        <button
          onClick={() => navigate('/music-nft')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/music-nft' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🎨</span>
          <span className="text-sm">音乐 NFT</span>
        </button>
        <button
          onClick={() => navigate('/metaverse')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${location.pathname === '/metaverse' ? 'bg-white/10 text-white' : ''}`}
        >
          <span className="text-base">🌐</span>
          <span className="text-sm">元宇宙</span>
        </button>
      </nav>

      {/* Playlists */}
      <nav className="px-3 mb-4">
        <div className="text-xs font-medium text-white/30 px-3 mb-2">我的音乐</div>
        {playlistItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-xs text-white/30">{item.count}</span>
          </button>
        ))}

        {/* Create Playlist */}
        <button className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">创建歌单</span>
        </button>
      </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={user.avatar || '/default-avatar.jpg'}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 truncate">{user.username}</div>
              <div className="text-xs text-white/40">Lv.{user.level}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="退出登录"
            >
              <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/50 to-accent-purple/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-white/80">登录 / 注册</div>
              <div className="text-xs text-white/40">解锁更多功能</div>
            </div>
          </button>
        )}
      </div>
    </aside>
    </>
  )
}
