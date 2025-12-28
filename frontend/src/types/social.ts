// 社交增强功能类型定义

// 音乐匹配交友
export interface MusicMatch {
  id: string;
  oderId: string;
  matchedUserId: string;
  matchScore: number; // 0-100
  commonGenres: string[];
  commonArtists: string[];
  commonSongs: string[];
  matchReasons: MatchReason[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
}

export interface MatchReason {
  type: 'genre' | 'artist' | 'song' | 'listening_habit' | 'mood' | 'activity';
  description: string;
  weight: number;
}

export interface MusicProfile {
  userId: string;
  topGenres: { genre: string; percentage: number }[];
  topArtists: { artistId: string; name: string; score: number }[];
  listeningPersonality: ListeningPersonality;
  musicMood: MoodProfile;
  activeHours: number[]; // 24 hours activity distribution
  discoveryRate: number; // 0-1, how often they try new music
  socialness: number; // 0-1, sharing/interaction frequency
}

export interface ListeningPersonality {
  type: PersonalityType;
  traits: PersonalityTrait[];
  description: string;
}

export type PersonalityType =
  | 'explorer' | 'loyalist' | 'enthusiast' | 'casual'
  | 'curator' | 'social_butterfly' | 'night_owl' | 'early_bird';

export interface PersonalityTrait {
  name: string;
  score: number;
  icon: string;
}

export interface MoodProfile {
  dominantMood: string;
  moodVariety: number;
  moodByTime: { hour: number; mood: string }[];
}

// 协作歌单
export interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  ownerId: string;
  collaborators: Collaborator[];
  songs: CollaborativeSong[];
  settings: CollabSettings;
  chatRoom?: string;
  activityLog: PlaylistActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  oderId: string;
  username: string;
  avatarUrl: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  contributions: number;
}

export interface CollaborativeSong {
  songId: string;
  addedBy: string;
  addedAt: Date;
  votes: { oderId: string; vote: 'up' | 'down' }[];
  comments: SongComment[];
}

export interface SongComment {
  id: string;
  oderId: string;
  text: string;
  timestamp?: number; // 歌曲时间戳
  createdAt: Date;
}

export interface CollabSettings {
  isPublic: boolean;
  allowVoting: boolean;
  allowComments: boolean;
  maxSongs: number;
  autoRemoveLowVoted: boolean;
  syncPlayback: boolean; // 同步播放
}

export interface PlaylistActivity {
  id: string;
  userId: string;
  action: 'add' | 'remove' | 'vote' | 'comment' | 'reorder' | 'join' | 'leave';
  targetId?: string;
  details?: string;
  timestamp: Date;
}

// 音乐时间胶囊
export interface TimeCapsule {
  id: string;
  senderId: string;
  recipientId?: string; // 为空则发给自己
  recipientEmail?: string;
  songs: CapsuleSong[];
  message: string;
  voiceMessage?: string;
  photos?: string[];
  theme: CapsuleTheme;
  unlockDate: Date;
  isOpened: boolean;
  openedAt?: Date;
  createdAt: Date;
}

export interface CapsuleSong {
  songId: string;
  personalNote?: string;
  memory?: string;
}

export interface CapsuleTheme {
  id: string;
  name: string;
  backgroundUrl: string;
  animation: string;
  soundEffect?: string;
}

// 歌曲弹幕
export interface SongDanmaku {
  id: string;
  songId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number; // 歌曲播放时间点
  type: DanmakuType;
  style: DanmakuStyle;
  likes: number;
  createdAt: Date;
}

export type DanmakuType = 'text' | 'emoji' | 'sticker' | 'effect';

export interface DanmakuStyle {
  color: string;
  fontSize: 'small' | 'medium' | 'large';
  position: 'top' | 'bottom' | 'scroll';
  speed: number;
  opacity: number;
}

export interface DanmakuSettings {
  enabled: boolean;
  density: number; // 0-1
  showEmojis: boolean;
  showEffects: boolean;
  blockedWords: string[];
  blockedUsers: string[];
  fontSize: number;
  opacity: number;
  speed: number;
}

// 音乐漂流瓶
export interface DriftBottle {
  id: string;
  senderId: string;
  senderAnonymousName: string;
  songId: string;
  message: string;
  mood: string;
  location?: { city: string; country: string };
  theme: BottleTheme;
  status: 'drifting' | 'picked' | 'replied' | 'expired';
  pickerId?: string;
  replies: BottleReply[];
  driftDuration: number; // 漂流了多久（小时）
  createdAt: Date;
}

export interface BottleTheme {
  bottleStyle: string;
  oceanBackground: string;
  animation: string;
}

export interface BottleReply {
  id: string;
  userId: string;
  anonymousName: string;
  message: string;
  songId?: string;
  createdAt: Date;
}

// 粉丝应援
export interface FanSupport {
  id: string;
  artistId: string;
  type: SupportType;
  title: string;
  description: string;
  target: number;
  current: number;
  participants: SupportParticipant[];
  rewards: SupportReward[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed';
}

export type SupportType =
  | 'streaming' | 'voting' | 'funding' | 'milestone'
  | 'birthday' | 'anniversary' | 'comeback' | 'award';

export interface SupportParticipant {
  userId: string;
  username: string;
  avatarUrl: string;
  contribution: number;
  rank: number;
  badges: string[];
}

export interface SupportReward {
  tier: number;
  threshold: number;
  reward: string;
  unlocked: boolean;
}

// 粉丝社区
export interface FanCommunity {
  id: string;
  artistId: string;
  name: string;
  description: string;
  coverUrl: string;
  memberCount: number;
  level: number;
  experience: number;
  badges: CommunityBadge[];
  channels: CommunityChannel[];
  events: CommunityEvent[];
  createdAt: Date;
}

export interface CommunityBadge {
  id: string;
  name: string;
  icon: string;
  requirement: string;
  memberCount: number;
}

export interface CommunityChannel {
  id: string;
  name: string;
  type: 'chat' | 'forum' | 'media' | 'events';
  description: string;
  moderators: string[];
  postCount: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'listening_party' | 'qa' | 'contest' | 'meetup' | 'charity';
  startTime: Date;
  endTime: Date;
  participants: number;
  maxParticipants?: number;
}

// 音乐圈动态
export interface MusicPost {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  media?: PostMedia[];
  song?: { songId: string; timestamp?: number };
  playlist?: string;
  tags: string[];
  location?: string;
  visibility: 'public' | 'friends' | 'private';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: Date;
}

export type PostType =
  | 'now_playing' | 'review' | 'recommendation' | 'memory'
  | 'achievement' | 'milestone' | 'story' | 'poll';

export interface PostMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  duration?: number;
}

// 实时聊天
export interface ChatRoom {
  id: string;
  type: 'private' | 'group' | 'artist' | 'event';
  name?: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  nowPlaying?: string; // 当前播放的歌曲
  settings: ChatSettings;
  createdAt: Date;
}

export interface ChatParticipant {
  userId: string;
  username: string;
  avatarUrl: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isOnline: boolean;
  isTyping: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  type: 'text' | 'song' | 'playlist' | 'image' | 'voice' | 'sticker' | 'system';
  content: string;
  replyTo?: string;
  reactions: { emoji: string; userIds: string[] }[];
  readBy: string[];
  createdAt: Date;
}

export interface ChatSettings {
  muteNotifications: boolean;
  showSongActivity: boolean;
  allowVoiceMessages: boolean;
  theme: string;
}
