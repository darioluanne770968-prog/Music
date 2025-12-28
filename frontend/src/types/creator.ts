// 创作者经济功能类型定义

// 音乐人工作台
export interface ArtistWorkstation {
  artistId: string;
  profile: ArtistProfile;
  analytics: ArtistAnalytics;
  releases: Release[];
  earnings: Earnings;
  fanManagement: FanManagement;
  promotions: Promotion[];
  notifications: WorkstationNotification[];
}

export interface ArtistProfile {
  id: string;
  stageName: string;
  realName?: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  genres: string[];
  labels?: string[];
  socialLinks: SocialLink[];
  verified: boolean;
  verifiedAt?: Date;
  location?: string;
  website?: string;
}

export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'weibo' | 'douyin' | 'bilibili';
  url: string;
  followers?: number;
}

export interface ArtistAnalytics {
  overview: AnalyticsOverview;
  streams: StreamAnalytics;
  audience: AudienceAnalytics;
  geography: GeographyAnalytics;
  revenue: RevenueAnalytics;
}

export interface AnalyticsOverview {
  totalStreams: number;
  totalListeners: number;
  totalFollowers: number;
  totalRevenue: number;
  streamsChange: number; // 百分比
  listenersChange: number;
  followersChange: number;
  revenueChange: number;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface StreamAnalytics {
  byDate: { date: string; streams: number }[];
  bySong: { songId: string; name: string; streams: number }[];
  byPlaylist: { playlistId: string; name: string; streams: number }[];
  bySource: { source: string; streams: number }[];
  skipRate: number;
  saveRate: number;
  averageListenDuration: number;
}

export interface AudienceAnalytics {
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genders: { gender: string; percentage: number }[];
  };
  listeningHabits: {
    peakHours: number[];
    peakDays: number[];
    averageSessionLength: number;
  };
  topCities: { city: string; country: string; listeners: number }[];
  retention: { cohort: string; retention: number }[];
}

export interface GeographyAnalytics {
  countries: { country: string; streams: number; listeners: number }[];
  cities: { city: string; country: string; streams: number }[];
  heatmap: { lat: number; lng: number; intensity: number }[];
}

export interface RevenueAnalytics {
  total: number;
  bySource: { source: RevenueSource; amount: number }[];
  bySong: { songId: string; name: string; amount: number }[];
  byMonth: { month: string; amount: number }[];
  pending: number;
  paid: number;
}

export type RevenueSource =
  | 'streaming' | 'downloads' | 'sync' | 'merchandise'
  | 'live' | 'tips' | 'subscriptions' | 'nft';

// 发行管理
export interface Release {
  id: string;
  type: ReleaseType;
  title: string;
  coverUrl: string;
  tracks: ReleaseTrack[];
  releaseDate: Date;
  status: ReleaseStatus;
  distributionPlatforms: DistributionPlatform[];
  metadata: ReleaseMetadata;
  preSaveCount?: number;
  createdAt: Date;
}

export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation' | 'live';

export type ReleaseStatus = 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'released' | 'takedown';

export interface ReleaseTrack {
  order: number;
  songId?: string;
  title: string;
  audioFile: string;
  duration: number;
  isExplicit: boolean;
  contributors: Contributor[];
  lyrics?: string;
  isrc?: string;
}

export interface Contributor {
  name: string;
  role: ContributorRole;
  share: number; // 版税分成百分比
}

export type ContributorRole =
  | 'primary_artist' | 'featured_artist' | 'composer' | 'lyricist'
  | 'producer' | 'mixer' | 'master_engineer' | 'remixer';

export interface DistributionPlatform {
  platform: string;
  icon: string;
  enabled: boolean;
  url?: string;
  status: 'pending' | 'live' | 'error';
}

export interface ReleaseMetadata {
  genre: string;
  subgenre?: string;
  language: string;
  copyright: string;
  recordLabel?: string;
  upc?: string;
  tags: string[];
}

// 付费独家内容
export interface PaidContent {
  id: string;
  artistId: string;
  type: PaidContentType;
  title: string;
  description: string;
  coverUrl: string;
  content: string; // URL 或内容
  price: number;
  currency: string;
  tier?: SubscriptionTier;
  purchases: number;
  revenue: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
}

export type PaidContentType =
  | 'exclusive_song' | 'behind_the_scenes' | 'acoustic_version'
  | 'demo' | 'remix' | 'live_recording' | 'commentary'
  | 'early_access' | 'merch_discount' | 'virtual_meet';

export interface SubscriptionTier {
  id: string;
  artistId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  benefits: string[];
  subscriberCount: number;
  icon: string;
  color: string;
}

// 音乐 NFT
export interface MusicNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  blockchain: Blockchain;
  artistId: string;
  title: string;
  description: string;
  mediaUrl: string;
  coverUrl: string;
  type: NFTType;
  edition: NFTEdition;
  attributes: NFTAttribute[];
  royaltyPercentage: number;
  price?: number;
  currency?: string;
  ownerId?: string;
  transactionHistory: NFTTransaction[];
  createdAt: Date;
}

export type Blockchain = 'ethereum' | 'polygon' | 'solana' | 'tezos' | 'flow';

export type NFTType =
  | 'single_track' | 'album' | 'artwork' | 'video' | 'experience'
  | 'collectible' | 'membership' | 'concert_ticket';

export interface NFTEdition {
  type: 'unique' | 'limited' | 'open';
  total?: number;
  minted: number;
  available: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTTransaction {
  type: 'mint' | 'transfer' | 'sale' | 'bid';
  from: string;
  to: string;
  price?: number;
  currency?: string;
  transactionHash: string;
  timestamp: Date;
}

// 直播打赏
export interface LiveTipping {
  sessionId: string;
  artistId: string;
  tips: Tip[];
  totalAmount: number;
  topTippers: Tipper[];
  giftAnimations: GiftAnimation[];
}

export interface Tip {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  amount: number;
  currency: string;
  giftId?: string;
  message?: string;
  timestamp: Date;
}

export interface Tipper {
  userId: string;
  username: string;
  avatarUrl: string;
  totalAmount: number;
  tipCount: number;
  rank: number;
}

export interface GiftAnimation {
  id: string;
  name: string;
  icon: string;
  animationUrl: string;
  soundUrl?: string;
  price: number;
  currency: string;
  category: 'basic' | 'premium' | 'luxury' | 'special';
}

// 版税分成
export interface RoyaltyTracking {
  artistId: string;
  songs: SongRoyalty[];
  totalEarnings: number;
  pendingPayment: number;
  lastPayout: Payout;
  payoutHistory: Payout[];
  splitAgreements: SplitAgreement[];
}

export interface SongRoyalty {
  songId: string;
  title: string;
  totalStreams: number;
  totalEarnings: number;
  byPlatform: { platform: string; streams: number; earnings: number }[];
  byCountry: { country: string; streams: number; earnings: number }[];
  splits: RoyaltySplit[];
}

export interface RoyaltySplit {
  recipientId: string;
  recipientName: string;
  role: ContributorRole;
  percentage: number;
  earnings: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'crypto';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SplitAgreement {
  id: string;
  songId: string;
  participants: SplitParticipant[];
  status: 'draft' | 'pending_signatures' | 'active' | 'disputed';
  documentUrl?: string;
  createdAt: Date;
}

export interface SplitParticipant {
  userId: string;
  name: string;
  email: string;
  role: ContributorRole;
  percentage: number;
  hasSigned: boolean;
  signedAt?: Date;
}

// 翻唱授权
export interface CoverLicense {
  id: string;
  originalSongId: string;
  originalSongTitle: string;
  originalArtist: string;
  licenseeId: string;
  licenseeName: string;
  type: LicenseType;
  territory: string[];
  duration: number; // 月
  fee: number;
  currency: string;
  royaltyRate: number;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  coverVersions: CoverVersion[];
  createdAt: Date;
  expiresAt: Date;
}

export type LicenseType =
  | 'mechanical' | 'sync' | 'performance' | 'print' | 'master';

export interface CoverVersion {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  audioUrl: string;
  coverUrl: string;
  releaseDate: Date;
  streams: number;
  earnings: number;
}

// 粉丝管理
export interface FanManagement {
  totalFans: number;
  newFansToday: number;
  newFansThisWeek: number;
  fanSegments: FanSegment[];
  topFans: TopFan[];
  fanMessages: FanMessage[];
}

export interface FanSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  fanCount: number;
  color: string;
}

export interface SegmentCriteria {
  minStreams?: number;
  minFollowDays?: number;
  hasSubscription?: boolean;
  hasPurchased?: boolean;
  engagementLevel?: 'low' | 'medium' | 'high' | 'super';
}

export interface TopFan {
  userId: string;
  username: string;
  avatarUrl: string;
  totalStreams: number;
  followingSince: Date;
  engagementScore: number;
  totalSpent: number;
  badges: string[];
}

export interface FanMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  message: string;
  type: 'text' | 'voice' | 'song_request';
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
}

// 推广工具
export interface Promotion {
  id: string;
  artistId: string;
  type: PromotionType;
  title: string;
  description: string;
  targetAudience: TargetAudience;
  budget: number;
  spent: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  performance: PromotionPerformance;
  startDate: Date;
  endDate: Date;
}

export type PromotionType =
  | 'playlist_pitch' | 'social_ads' | 'influencer' | 'radio'
  | 'press' | 'spotify_marquee' | 'pre_save' | 'release_radar';

export interface TargetAudience {
  ageRange: { min: number; max: number };
  genders: string[];
  locations: string[];
  genres: string[];
  similarArtists: string[];
  interests: string[];
}

export interface PromotionPerformance {
  impressions: number;
  clicks: number;
  streams: number;
  followers: number;
  saves: number;
  costPerStream: number;
  costPerFollower: number;
}

export interface WorkstationNotification {
  id: string;
  type: 'milestone' | 'payout' | 'review' | 'fan_message' | 'release' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}
