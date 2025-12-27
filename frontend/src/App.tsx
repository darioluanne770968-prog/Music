import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MiniPlayer } from '@/components/Player/MiniPlayer'
import { FullPlayer } from '@/components/Player/FullPlayer'
import { usePlayerStore } from '@/stores/playerStore'

// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home/HomePage'))
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'))

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
  </div>
)

// Bottom Navigation
const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('home')

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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-t border-dark-100 dark:border-dark-800 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <a
              key={tab.id}
              href={tab.path}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
                isActive ? 'text-primary-500' : 'text-dark-500 dark:text-dark-400'
              }`}
              onClick={(e) => {
                e.preventDefault()
                setActiveTab(tab.id)
              }}
            >
              {tab.icon(isActive)}
              <span className="text-xs">{tab.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

// Main App
const App: React.FC = () => {
  const { currentSong, isFullScreen } = usePlayerStore()

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            borderRadius: '12px',
          },
        }}
      />

      {/* Main content */}
      <main className={currentSong && !isFullScreen ? 'pb-32' : 'pb-16'}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/explore" element={<HomePage />} />
            <Route path="/library" element={<HomePage />} />
            <Route path="/profile" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom navigation */}
      {!isFullScreen && <BottomNav />}

      {/* Mini player */}
      {currentSong && !isFullScreen && <MiniPlayer />}

      {/* Full screen player */}
      <FullPlayer />
    </div>
  )
}

export default App
