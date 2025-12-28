import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 关注系统组件
 * 支持关注/粉丝列表、互相关注、推荐用户
 */

// 用户类型
export interface User {
  id: string
  name: string
  avatar: string
  bio?: string
  isFollowing: boolean
  isFollower: boolean
  isMutual: boolean
  followersCount: number
  followingCount: number
  badges?: string[]
  recentSongs?: { id: string; name: string; cover: string }[]
}

// 关注相关的通知
export interface FollowNotification {
  id: string
  type: 'follow' | 'follow_request' | 'follow_accept'
  user: User
  timestamp: number
  isRead: boolean
}

// 关注系统 Hook
export function useFollowSystem(userId?: string) {
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [recommendations, setRecommendations] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 获取关注者
  const fetchFollowers = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/followers`)
      const data = await res.json()
      setFollowers(data)
    } catch (error) {
      console.error('Failed to fetch followers:', error)
    }
    setIsLoading(false)
  }, [userId])

  // 获取正在关注
  const fetchFollowing = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/following`)
      const data = await res.json()
      setFollowing(data)
    } catch (error) {
      console.error('Failed to fetch following:', error)
    }
    setIsLoading(false)
  }, [userId])

  // 获取推荐用户
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch('/api/users/recommendations')
      const data = await res.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }, [])

  // 关注用户
  const follow = useCallback(async (targetUserId: string) => {
    try {
      await fetch(`/api/users/${targetUserId}/follow`, { method: 'POST' })
      // 更新本地状态
      setFollowing(prev => {
        const user = recommendations.find(u => u.id === targetUserId) ||
          followers.find(u => u.id === targetUserId)
        if (user) {
          return [...prev, { ...user, isFollowing: true }]
        }
        return prev
      })
      setRecommendations(prev => prev.filter(u => u.id !== targetUserId))
    } catch (error) {
      console.error('Failed to follow user:', error)
    }
  }, [recommendations, followers])

  // 取消关注
  const unfollow = useCallback(async (targetUserId: string) => {
    try {
      await fetch(`/api/users/${targetUserId}/unfollow`, { method: 'POST' })
      setFollowing(prev => prev.filter(u => u.id !== targetUserId))
    } catch (error) {
      console.error('Failed to unfollow user:', error)
    }
  }, [])

  useEffect(() => {
    fetchFollowers()
    fetchFollowing()
    fetchRecommendations()
  }, [fetchFollowers, fetchFollowing, fetchRecommendations])

  return {
    followers,
    following,
    recommendations,
    isLoading,
    follow,
    unfollow,
    refresh: () => {
      fetchFollowers()
      fetchFollowing()
      fetchRecommendations()
    }
  }
}

// 用户卡片组件
interface UserCardProps {
  user: User
  onFollow: (userId: string) => void
  onUnfollow: (userId: string) => void
  showRecentSongs?: boolean
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onFollow,
  onUnfollow,
  showRecentSongs = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          {user.isMutual && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-xs">🤝</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-white truncate">{user.name}</h4>
            {user.badges?.map((badge, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
                {badge}
              </span>
            ))}
          </div>
          {user.bio && (
            <p className="text-sm text-white/60 line-clamp-2 mt-1">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            <span>{user.followersCount} 粉丝</span>
            <span>{user.followingCount} 关注</span>
          </div>
        </div>

        <FollowButton
          isFollowing={user.isFollowing}
          isMutual={user.isMutual}
          onFollow={() => onFollow(user.id)}
          onUnfollow={() => onUnfollow(user.id)}
        />
      </div>

      {/* 最近听的歌 */}
      {showRecentSongs && user.recentSongs && user.recentSongs.length > 0 && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <p className="text-xs text-white/40 mb-2">最近在听</p>
              <div className="flex gap-2">
                {user.recentSongs.slice(0, 3).map(song => (
                  <div key={song.id} className="flex items-center gap-2 flex-1">
                    <img
                      src={song.cover}
                      alt={song.name}
                      className="w-8 h-8 rounded"
                    />
                    <span className="text-xs text-white/60 truncate">{song.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

// 关注按钮组件
interface FollowButtonProps {
  isFollowing: boolean
  isMutual?: boolean
  onFollow: () => void
  onUnfollow: () => void
  size?: 'small' | 'medium' | 'large'
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  isMutual,
  onFollow,
  onUnfollow,
  size = 'medium'
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-2.5 text-base'
  }

  if (isFollowing) {
    return (
      <button
        onClick={onUnfollow}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`rounded-full font-medium transition-all ${sizeClasses[size]} ${
          isHovered
            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
            : isMutual
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
              : 'bg-white/10 text-white/60 border border-white/20'
        }`}
      >
        {isHovered ? '取消关注' : isMutual ? '互相关注' : '已关注'}
      </button>
    )
  }

  return (
    <button
      onClick={onFollow}
      className={`rounded-full font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors ${sizeClasses[size]}`}
    >
      关注
    </button>
  )
}

// 关注/粉丝列表页面
interface FollowListPageProps {
  userId: string
  initialTab?: 'followers' | 'following'
}

export const FollowListPage: React.FC<FollowListPageProps> = ({
  userId,
  initialTab = 'followers'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  const { followers, following, isLoading, follow, unfollow } = useFollowSystem(userId)
  const [searchQuery, setSearchQuery] = useState('')

  const currentList = activeTab === 'followers' ? followers : following
  const filteredList = currentList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* 标签切换 */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'followers' ? 'text-white' : 'text-white/60'
          }`}
        >
          粉丝 {followers.length}
          {activeTab === 'followers' && (
            <motion.div
              layoutId="followTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'following' ? 'text-white' : 'text-white/60'
          }`}
        >
          关注 {following.length}
          {activeTab === 'following' && (
            <motion.div
              layoutId="followTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
            />
          )}
        </button>
      </div>

      {/* 搜索 */}
      <div className="p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索用户..."
          className="w-full px-4 py-2 bg-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 用户列表 */}
      <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            {searchQuery ? '没有找到匹配的用户' : '暂无用户'}
          </div>
        ) : (
          filteredList.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onFollow={follow}
              onUnfollow={unfollow}
            />
          ))
        )}
      </div>
    </div>
  )
}

// 推荐用户组件
interface RecommendedUsersProps {
  users: User[]
  onFollow: (userId: string) => void
  title?: string
}

export const RecommendedUsers: React.FC<RecommendedUsersProps> = ({
  users,
  onFollow,
  title = '推荐关注'
}) => {
  if (users.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <motion.div
            key={user.id}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white/5 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{user.name}</h4>
                <p className="text-xs text-white/40">{user.followersCount} 粉丝</p>
              </div>
              <button
                onClick={() => onFollow(user.id)}
                className="px-4 py-1.5 bg-primary-500 text-white text-sm rounded-full hover:bg-primary-600"
              >
                关注
              </button>
            </div>
            {user.bio && (
              <p className="text-sm text-white/60 mt-2 line-clamp-2">{user.bio}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 关注通知组件
interface FollowNotificationsProps {
  notifications: FollowNotification[]
  onAccept?: (userId: string) => void
  onReject?: (userId: string) => void
  onMarkRead?: (notificationId: string) => void
}

export const FollowNotifications: React.FC<FollowNotificationsProps> = ({
  notifications,
  onAccept,
  onReject,
  onMarkRead
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    return `${Math.floor(hours / 24)}天前`
  }

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-xl ${
            notification.isRead ? 'bg-white/5' : 'bg-primary-500/10'
          }`}
          onClick={() => onMarkRead?.(notification.id)}
        >
          <div className="flex items-center gap-3">
            <img
              src={notification.user.avatar}
              alt={notification.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="text-white">
                <span className="font-medium">{notification.user.name}</span>
                {notification.type === 'follow' && ' 关注了你'}
                {notification.type === 'follow_request' && ' 请求关注你'}
                {notification.type === 'follow_accept' && ' 接受了你的关注请求'}
              </p>
              <p className="text-xs text-white/40">{formatTime(notification.timestamp)}</p>
            </div>
            {notification.type === 'follow_request' ? (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAccept?.(notification.user.id)
                  }}
                  className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full"
                >
                  接受
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReject?.(notification.user.id)
                  }}
                  className="px-3 py-1 bg-white/10 text-white/60 text-sm rounded-full"
                >
                  拒绝
                </button>
              </div>
            ) : (
              <FollowButton
                isFollowing={notification.user.isFollowing}
                isMutual={notification.user.isMutual}
                onFollow={() => {}}
                onUnfollow={() => {}}
                size="small"
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default FollowListPage
