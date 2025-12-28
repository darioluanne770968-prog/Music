import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 动态类型
export type ActivityType =
  | 'listen'      // 听歌
  | 'like'        // 喜欢
  | 'share'       // 分享
  | 'comment'     // 评论
  | 'playlist'    // 创建歌单
  | 'follow'      // 关注
  | 'achievement' // 成就

export interface Activity {
  id: string
  type: ActivityType
  user: {
    id: string
    name: string
    avatar: string
  }
  content: {
    text: string
    song?: { id: string; name: string; artist: string; cover: string }
    playlist?: { id: string; name: string; cover: string }
    targetUser?: { id: string; name: string }
    achievement?: { id: string; name: string; icon: string }
  }
  timestamp: Date
  likes: number
  comments: number
  isLiked: boolean
}

interface ActivityFeedProps {
  activities: Activity[]
  onLoadMore?: () => void
  onLike?: (id: string) => void
  onComment?: (id: string) => void
  onShare?: (activity: Activity) => void
  isLoading?: boolean
}

// 活动类型图标
const activityIcons: Record<ActivityType, React.ReactNode> = {
  listen: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ),
  like: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  share: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
    </svg>
  ),
  comment: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
    </svg>
  ),
  playlist: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
    </svg>
  ),
  follow: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  achievement: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  ),
}

// 活动类型颜色
const activityColors: Record<ActivityType, string> = {
  listen: 'bg-blue-500',
  like: 'bg-red-500',
  share: 'bg-green-500',
  comment: 'bg-purple-500',
  playlist: 'bg-amber-500',
  follow: 'bg-cyan-500',
  achievement: 'bg-yellow-500',
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onLoadMore,
  onLike,
  onComment,
  onShare,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white/5 rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Avatar with activity icon */}
              <div className="relative flex-shrink-0">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${activityColors[activity.type]} flex items-center justify-center text-white`}>
                  {activityIcons[activity.type]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{activity.user.name}</span>
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: zhCN })}
                  </span>
                </div>

                <p className="text-sm text-white/80 mb-3">{activity.content.text}</p>

                {/* Song/Playlist Card */}
                {activity.content.song && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <img
                      src={activity.content.song.cover}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.content.song.name}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {activity.content.song.artist}
                      </p>
                    </div>
                    <button className="p-2 rounded-full bg-primary-500 text-white">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                )}

                {activity.content.playlist && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <img
                      src={activity.content.playlist.cover}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.content.playlist.name}
                      </p>
                      <p className="text-xs text-white/60">歌单</p>
                    </div>
                  </div>
                )}

                {activity.content.achievement && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30">
                    <span className="text-3xl">{activity.content.achievement.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-400">
                        {activity.content.achievement.name}
                      </p>
                      <p className="text-xs text-white/60">解锁成就</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-3">
                  <button
                    onClick={() => onLike?.(activity.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      activity.isLiked ? 'text-primary-500' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={activity.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {activity.likes > 0 && <span>{activity.likes}</span>}
                  </button>

                  <button
                    onClick={() => onComment?.(activity.id)}
                    className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    {activity.comments > 0 && <span>{activity.comments}</span>}
                  </button>

                  <button
                    onClick={() => onShare?.(activity)}
                    className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More */}
      {onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-3 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  )
}

export default ActivityFeed
