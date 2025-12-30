import React, { Suspense, lazy, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { MiniPlayer } from '@/components/Player/MiniPlayer'
import { FullPlayer } from '@/components/Player/FullPlayer'
import { PlayQueue } from '@/components/Player/PlayQueue'
import { Sidebar } from '@/components/Layout/Sidebar'
import { ThemeProvider, DynamicTheme, ThemeSettings } from '@/components/Theme'
import { usePlayerStore } from '@/stores/playerStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAudio } from '@/hooks/useAudio'
import { HomePageSkeleton } from '@/components/common/Skeleton'

// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home/HomePage'))
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'))
const ExplorePage = lazy(() => import('@/pages/Explore/ExplorePage'))
const CategoryPage = lazy(() => import('@/pages/Explore/CategoryPage'))
const LibraryPage = lazy(() => import('@/pages/Library/LibraryPage'))
const PlaylistPage = lazy(() => import('@/pages/Playlist/PlaylistPage'))
const ArtistPage = lazy(() => import('@/pages/Artist/ArtistPage'))
const AlbumPage = lazy(() => import('@/pages/Album/AlbumPage'))
const ToplistPage = lazy(() => import('@/pages/Toplist/ToplistPage'))
const DailyPage = lazy(() => import('@/pages/Discover/DailyPage'))
const FMPage = lazy(() => import('@/pages/Discover/FMPage'))
const MVPage = lazy(() => import('@/pages/MV/MVPage'))
const StatsPage = lazy(() => import('@/pages/Stats/StatsPage'))
const DownloadsPage = lazy(() => import('@/pages/Downloads/DownloadsPage'))
const SmartPlaylistPage = lazy(() => import('@/pages/SmartPlaylist/SmartPlaylistPage'))
const RecognitionPage = lazy(() => import('@/pages/Recognition/RecognitionPage'))
const ListenTogetherPage = lazy(() => import('@/pages/ListenTogether/ListenTogetherPage'))

// Loading fallback with skeleton
const PageLoader = () => (
  <div className="min-h-screen animate-fade-in">
    <HomePageSkeleton />
  </div>
)

// Page transition wrapper
const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { animations, accessibility } = useThemeStore()

  if (!animations.enabled || !animations.pageTransitions || accessibility.reducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Bottom Navigation (mobile only)
const BottomNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      id: 'home',
      label: '首页',
      path: '/',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: '发现',
      path: '/explore',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      id: 'library',
      label: '音乐库',
      path: '/library',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: '我的',
      path: '/profile',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-950/90 backdrop-blur-xl border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                isActive ? 'text-primary-500' : 'text-white/40'
              }`}
            >
              {tab.icon(isActive)}
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Main App
const App: React.FC = () => {
  const { currentSong, isFullScreen, isShowQueue, setShowQueue } = usePlayerStore()
  const { resolvedTheme, dynamicTheme } = useThemeStore()
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false)

  // Initialize audio playback
  useAudio()

  return (
    <ThemeProvider>
      <div className={`min-h-screen transition-colors duration-300 ${
        resolvedTheme === 'dark' ? 'bg-dark-950' : 'bg-white'
      }`}>
        {/* Dynamic theme background */}
        {dynamicTheme.enabled && <div className="dynamic-bg" />}

        {/* Dynamic theme color extractor */}
        <DynamicTheme />

        {/* Play Queue Drawer */}
        <PlayQueue isOpen={isShowQueue} onClose={() => setShowQueue(false)} />

        {/* Theme Settings Modal */}
        <ThemeSettings isOpen={isThemeSettingsOpen} onClose={() => setIsThemeSettingsOpen(false)} />

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: resolvedTheme === 'dark' ? '#1a1c25' : '#ffffff',
              color: resolvedTheme === 'dark' ? '#fff' : '#0f172a',
              borderRadius: '12px',
              border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            },
          }}
        />

        {/* Desktop Sidebar */}
        {!isFullScreen && <Sidebar onOpenThemeSettings={() => setIsThemeSettingsOpen(true)} />}

        {/* Main content area */}
        <div className={`${!isFullScreen ? 'lg:ml-64' : ''}`}>
          {/* Main content */}
          <main className={`
            ${currentSong && !isFullScreen ? 'pb-32 lg:pb-24' : 'pb-16 lg:pb-0'}
          `}>
            <Suspense fallback={<PageLoader />}>
              <PageTransitionWrapper>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/explore/category/:id" element={<CategoryPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/playlist/:id" element={<PlaylistPage />} />
                  <Route path="/artist/:id" element={<ArtistPage />} />
                  <Route path="/album/:id" element={<AlbumPage />} />
                  <Route path="/toplist" element={<ToplistPage />} />
                  <Route path="/daily" element={<DailyPage />} />
                  <Route path="/fm" element={<FMPage />} />
                  <Route path="/mv/:id" element={<MVPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/downloads" element={<DownloadsPage />} />
                  <Route path="/smart-playlist" element={<SmartPlaylistPage />} />
                  <Route path="/recognition" element={<RecognitionPage />} />
                  <Route path="/listen-together" element={<ListenTogetherPage />} />
                  <Route path="/profile" element={<LibraryPage />} />
                  <Route path="/settings" element={<SettingsPage onOpenThemeSettings={() => setIsThemeSettingsOpen(true)} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PageTransitionWrapper>
            </Suspense>
          </main>

          {/* Mini player - fixed at bottom, offset for sidebar on desktop */}
          {currentSong && !isFullScreen && <MiniPlayer />}
        </div>

        {/* Bottom navigation (mobile only) */}
        {!isFullScreen && <BottomNav />}

        {/* Full screen player */}
        <FullPlayer />
      </div>
    </ThemeProvider>
  )
}

// Placeholder for settings page
const SettingsPage: React.FC<{ onOpenThemeSettings: () => void }> = ({ onOpenThemeSettings }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">设置</h1>
      <button
        onClick={onOpenThemeSettings}
        className="w-full p-4 bg-white/5 rounded-xl text-left flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span>外观设置</span>
        <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default App
