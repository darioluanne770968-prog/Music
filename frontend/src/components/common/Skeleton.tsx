import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}) => {
  const baseClasses = 'bg-white/5 dark:bg-white/5 light:bg-slate-200'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-shimmer',
    none: '',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{ width, height }}
    />
  )
}

// 歌曲列表骨架屏
export const SongListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
        <Skeleton variant="rounded" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    ))}
  </div>
)

// 歌单卡片骨架屏
export const PlaylistCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton variant="rounded" className="aspect-square w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="50%" height={12} />
    </div>
  </div>
)

// 歌单网格骨架屏
export const PlaylistGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <PlaylistCardSkeleton key={i} />
    ))}
  </div>
)

// 歌手卡片骨架屏
export const ArtistCardSkeleton: React.FC = () => (
  <div className="flex flex-col items-center gap-3">
    <Skeleton variant="circular" className="w-24 h-24 md:w-32 md:h-32" />
    <Skeleton variant="text" width={80} height={14} />
  </div>
)

// 横向滚动列表骨架屏
export const HorizontalListSkeleton: React.FC<{ count?: number; itemWidth?: number }> = ({
  count = 5,
  itemWidth = 150,
}) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ width: itemWidth }} className="flex-shrink-0 space-y-2">
        <Skeleton variant="rounded" className="aspect-square w-full" />
        <Skeleton variant="text" width="80%" height={14} />
        <Skeleton variant="text" width="50%" height={12} />
      </div>
    ))}
  </div>
)

// 首页骨架屏
export const HomePageSkeleton: React.FC = () => (
  <div className="space-y-8 p-4">
    {/* Banner */}
    <Skeleton variant="rounded" className="w-full h-40 md:h-56" />

    {/* 推荐歌单 */}
    <div className="space-y-4">
      <Skeleton variant="text" width={120} height={24} />
      <HorizontalListSkeleton count={5} />
    </div>

    {/* 新歌速递 */}
    <div className="space-y-4">
      <Skeleton variant="text" width={100} height={24} />
      <SongListSkeleton count={4} />
    </div>

    {/* 热门歌手 */}
    <div className="space-y-4">
      <Skeleton variant="text" width={100} height={24} />
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <ArtistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// 播放器骨架屏
export const PlayerSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton variant="rounded" width={56} height={56} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="40%" height={12} />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  </div>
)

// 歌词骨架屏
export const LyricsSkeleton: React.FC = () => (
  <div className="space-y-4 py-8">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={`${Math.random() * 40 + 40}%`}
        height={20}
        className="mx-auto"
      />
    ))}
  </div>
)

// 评论列表骨架屏
export const CommentListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={80} height={14} />
            <Skeleton variant="text" width={60} height={12} />
          </div>
          <Skeleton variant="text" width="90%" height={14} />
          <Skeleton variant="text" width="70%" height={14} />
        </div>
      </div>
    ))}
  </div>
)

// 搜索结果骨架屏
export const SearchResultSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-3">
      <Skeleton variant="text" width={80} height={20} />
      <SongListSkeleton count={3} />
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" width={80} height={20} />
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ArtistCardSkeleton key={i} />
        ))}
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" width={80} height={20} />
      <PlaylistGridSkeleton count={4} />
    </div>
  </div>
)

// 动画包装器
export const AnimatedSkeleton: React.FC<{
  children: React.ReactNode
  isLoading: boolean
  delay?: number
}> = ({ children, isLoading, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {isLoading ? children : null}
  </motion.div>
)

export default Skeleton
