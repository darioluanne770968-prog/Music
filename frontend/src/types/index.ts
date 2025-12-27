// User Types
export interface User {
  id: number
  username: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  level: number
  exp: number
  vipLevel: number
  vipExpireAt?: string
  followerCount: number
  followingCount: number
  playlistCount: number
  createdAt: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  quality: 'standard' | 'high' | 'lossless' | 'hires'
  language: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  equalizer: EqualizerSettings
}

export interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  commentReply: boolean
  newFollower: boolean
  newSong: boolean
}

export interface PrivacySettings {
  showPlayHistory: boolean
  showLikes: boolean
  showPlaylists: boolean
  allowMessages: 'all' | 'followers' | 'none'
}

export interface EqualizerSettings {
  enabled: boolean
  preset: string
  bands: number[]
}

// Music Types
export interface Artist {
  id: number
  name: string
  avatar?: string
  cover?: string
  bio?: string
  country?: string
  genres: string[]
  isVerified: boolean
  followerCount: number
}

export interface Album {
  id: number
  name: string
  artist: Artist
  cover?: string
  releaseDate: string
  description?: string
  genre?: string
  type: 'album' | 'single' | 'ep'
  songCount: number
}

export interface Song {
  id: number
  name: string
  artist: Artist
  artists?: Artist[]
  album?: Album
  duration: number
  cover?: string
  genre?: string
  language?: string
  releaseDate?: string
  playCount: number
  likeCount: number
  commentCount: number
  isVip: boolean
  isLiked?: boolean
  hasLyrics: boolean
  hasMv: boolean
}

export interface Lyrics {
  id: number
  songId: number
  lines: LyricLine[]
  translated?: LyricLine[]
  romanized?: LyricLine[]
}

export interface LyricLine {
  time: number
  text: string
  words?: LyricWord[]
}

export interface LyricWord {
  time: number
  duration: number
  text: string
}

export interface MV {
  id: number
  name: string
  artist: Artist
  song?: Song
  cover?: string
  duration: number
  playCount: number
  qualities: MVQuality[]
}

export interface MVQuality {
  quality: '360p' | '480p' | '720p' | '1080p' | '4k'
  url: string
}

// Playlist Types
export interface Playlist {
  id: number
  name: string
  creator: User
  cover?: string
  description?: string
  tags: string[]
  isPublic: boolean
  isOfficial: boolean
  playCount: number
  likeCount: number
  songCount: number
  songs?: Song[]
  createdAt: string
  updatedAt: string
  isLiked?: boolean
}

export interface PlaylistCategory {
  id: number
  name: string
  icon?: string
  subcategories?: PlaylistCategory[]
}

// Comment Types
export interface Comment {
  id: number
  user: User
  content: string
  images?: string[]
  likeCount: number
  replyCount: number
  isHot: boolean
  isLiked?: boolean
  parentId?: number
  replies?: Comment[]
  createdAt: string
}

// Search Types
export interface SearchResult {
  songs: Song[]
  artists: Artist[]
  albums: Album[]
  playlists: Playlist[]
  users: User[]
  total: {
    songs: number
    artists: number
    albums: number
    playlists: number
    users: number
  }
}

export interface SearchSuggestion {
  keyword: string
  type: 'song' | 'artist' | 'album' | 'playlist'
}

export interface HotSearch {
  keyword: string
  score: number
  iconType?: 'hot' | 'up' | 'new'
}

// Player Types
export type PlayMode = 'sequence' | 'loop' | 'single' | 'shuffle' | 'heartbeat'

export interface PlayState {
  isPlaying: boolean
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isMuted: boolean
  playMode: PlayMode
  playbackRate: number
}

export interface PlayQueue {
  songs: Song[]
  currentIndex: number
  history: number[]
}

// Chart Types
export interface Chart {
  id: number
  name: string
  description?: string
  cover?: string
  updateTime: string
  songs: ChartSong[]
}

export interface ChartSong extends Song {
  rank: number
  lastRank?: number
  change: 'up' | 'down' | 'new' | 'same'
}

// Activity Types
export interface Activity {
  id: number
  user: User
  type: 'share_song' | 'share_playlist' | 'create_playlist' | 'follow_user' | 'comment'
  content: ActivityContent
  likeCount: number
  commentCount: number
  isLiked?: boolean
  createdAt: string
}

export interface ActivityContent {
  text?: string
  images?: string[]
  song?: Song
  playlist?: Playlist
  targetUser?: User
}

// Message Types
export interface Conversation {
  userId: number
  user: User
  lastMessage: Message
  unreadCount: number
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  type: 'text' | 'image' | 'song' | 'playlist'
  extra?: MessageExtra
  isRead: boolean
  createdAt: string
}

export interface MessageExtra {
  song?: Song
  playlist?: Playlist
  imageUrl?: string
}

// Stats Types
export interface UserStats {
  totalPlayCount: number
  totalPlayDuration: number
  topArtists: ArtistStat[]
  topGenres: GenreStat[]
  topSongs: Song[]
  listeningTrend: DailyStat[]
}

export interface ArtistStat {
  artist: Artist
  playCount: number
  playDuration: number
}

export interface GenreStat {
  genre: string
  playCount: number
  percentage: number
}

export interface DailyStat {
  date: string
  playCount: number
  playDuration: number
}

// Achievement Types
export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: string
  progress?: number
  total?: number
}

// API Response Types
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Notification Types
export interface Notification {
  id: number
  type: 'comment' | 'like' | 'follow' | 'system' | 'message'
  title: string
  content: string
  extra?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

// Theme Types
export interface Theme {
  id: string
  name: string
  primary: string
  background: string
  card: string
  text: string
  isDark: boolean
}

// Visualizer Types
export type VisualizerStyle = 'bars' | 'wave' | 'circular' | 'particles' | '3d'

export interface VisualizerConfig {
  style: VisualizerStyle
  color: string
  sensitivity: number
  smoothing: number
}
