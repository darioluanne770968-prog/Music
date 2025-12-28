// 直播2.0 高级直播功能类型定义

// 多人K歌房
export interface MultiKaraokeRoom {
  id: string;
  name: string;
  hostId: string;
  theme: KaraokeTheme;
  status: 'waiting' | 'performing' | 'intermission';
  participants: KaraokeParticipant[];
  audience: AudienceMember[];
  songQueue: KaraokeSongQueue[];
  currentPerformance?: CurrentPerformance;
  settings: KaraokeRoomSettings;
  chat: LiveChatMessage[];
  reactions: LiveReaction[];
  gifts: ReceivedGift[];
  stats: RoomStats;
  createdAt: Date;
}

export interface KaraokeTheme {
  id: string;
  name: string;
  backgroundUrl: string;
  stageStyle: 'classic' | 'neon' | 'elegant' | 'party' | 'vintage' | 'futuristic';
  effects: ThemeEffect[];
  micStyles: MicStyle[];
  scoreboardStyle: string;
}

export interface ThemeEffect {
  type: 'confetti' | 'sparkle' | 'spotlight' | 'smoke' | 'laser' | 'bubbles';
  trigger: 'perfect_note' | 'combo' | 'song_end' | 'gift' | 'continuous';
  intensity: number;
  colors: string[];
}

export interface MicStyle {
  id: string;
  name: string;
  modelUrl: string;
  glowColor: string;
  premium: boolean;
}

export interface KaraokeParticipant {
  userId: string;
  username: string;
  avatar: string;
  role: 'host' | 'singer' | 'pending';
  micEnabled: boolean;
  position: number; // 麦位
  score: number;
  totalSongs: number;
  badges: string[];
  joinedAt: Date;
}

export interface AudienceMember {
  userId: string;
  username: string;
  avatar: string;
  vipLevel: number;
  giftsSent: number;
  watchTime: number;
  joinedAt: Date;
}

export interface KaraokeSongQueue {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  requestedBy: string;
  singers: string[]; // 最多可设置多人合唱
  mode: 'solo' | 'duet' | 'group' | 'battle';
  key: number; // 升降调
  status: 'queued' | 'performing' | 'completed' | 'skipped';
  position: number;
}

export interface CurrentPerformance {
  songId: string;
  songName: string;
  singers: PerformingSinger[];
  startTime: Date;
  duration: number;
  currentTime: number;
  scoring: LiveScoring;
  lyricsSync: LyricsSyncState;
}

export interface PerformingSinger {
  userId: string;
  username: string;
  avatar: string;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  audioLevel: number;
  effects: ActiveEffect[];
}

export interface LiveScoring {
  enabled: boolean;
  mode: 'standard' | 'strict' | 'relaxed';
  realTimeScore: number;
  pitchAccuracy: number;
  rhythmAccuracy: number;
  expressionScore: number;
}

export interface LyricsSyncState {
  currentLine: number;
  currentWord: number;
  highlightColor: string;
  displayMode: 'scroll' | 'karaoke' | 'teleprompter';
}

export interface ActiveEffect {
  type: 'reverb' | 'echo' | 'autotune' | 'harmonizer' | 'vocal_boost';
  level: number;
}

export interface KaraokeRoomSettings {
  maxParticipants: number;
  maxAudience: number;
  micPositions: number;
  allowSongRequests: boolean;
  autoNextSong: boolean;
  scoringEnabled: boolean;
  giftingEnabled: boolean;
  recordingEnabled: boolean;
  privateRoom: boolean;
  password?: string;
  ageRestricted: boolean;
  language: string;
}

export interface RoomStats {
  totalViewers: number;
  peakViewers: number;
  totalGifts: number;
  giftValue: number;
  songsPerformed: number;
  averageScore: number;
  duration: number;
}

// 虚拟偶像直播
export interface VirtualIdolLivestream {
  id: string;
  virtualIdolId: string;
  virtualIdol: VirtualIdol;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduledTime?: Date;
  startedAt?: Date;
  endedAt?: Date;
  viewers: number;
  peakViewers: number;
  content: VirtualIdolContent;
  interactions: IdolInteraction[];
  merchandise: LiveMerchandise[];
  chat: LiveChatMessage[];
  stats: VirtualIdolStats;
}

export interface VirtualIdol {
  id: string;
  name: string;
  persona: string;
  avatar3D: string;
  avatar2D: string;
  voiceProfile: string;
  personality: PersonalityTraits;
  capabilities: IdolCapability[];
  outfits: IdolOutfit[];
  currentOutfit: string;
  expressions: Expression[];
  dances: Dance[];
  songs: string[];
  followers: number;
  debutDate: Date;
}

export interface PersonalityTraits {
  cheerfulness: number;
  shyness: number;
  energy: number;
  sassiness: number;
  kindness: number;
  humor: number;
}

export type IdolCapability =
  | 'sing'
  | 'dance'
  | 'chat'
  | 'game'
  | 'cook'
  | 'draw'
  | 'asmr'
  | 'teach';

export interface IdolOutfit {
  id: string;
  name: string;
  thumbnailUrl: string;
  model3DUrl: string;
  occasion: 'casual' | 'performance' | 'formal' | 'seasonal' | 'special';
  limited: boolean;
  unlockCondition?: string;
}

export interface Expression {
  id: string;
  name: string;
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'shy' | 'smug' | 'crying' | 'love';
  intensity: number;
  blendShapes: BlendShape[];
}

export interface BlendShape {
  name: string;
  value: number;
}

export interface Dance {
  id: string;
  name: string;
  songId?: string;
  animationUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
}

export interface VirtualIdolContent {
  type: 'singing' | 'chatting' | 'gaming' | 'dancing' | 'special';
  setlist?: SetlistItem[];
  gameSession?: GameSession;
  talkTopics?: string[];
}

export interface SetlistItem {
  songId: string;
  songName: string;
  order: number;
  performed: boolean;
  requestedBy?: string;
}

export interface GameSession {
  gameId: string;
  gameName: string;
  currentScore: number;
  highScore: number;
  viewerParticipation: boolean;
}

export interface IdolInteraction {
  id: string;
  type: 'greeting' | 'response' | 'reaction' | 'song_request' | 'special';
  userId: string;
  username: string;
  message: string;
  idolResponse: string;
  timestamp: Date;
  highlighted: boolean;
}

export interface LiveMerchandise {
  id: string;
  name: string;
  type: 'digital' | 'physical' | 'limited';
  imageUrl: string;
  price: number;
  stock?: number;
  soldCount: number;
  flashSale: boolean;
  flashSaleEnd?: Date;
}

export interface VirtualIdolStats {
  totalWatchTime: number;
  chatMessages: number;
  giftsReceived: number;
  giftValue: number;
  songRequests: number;
  newFollowers: number;
}

// 弹幕点歌系统
export interface DanmakuSongRequest {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  songId: string;
  songName: string;
  artistName: string;
  message?: string;
  giftAttached?: string;
  giftValue: number;
  priority: number;
  status: 'pending' | 'approved' | 'rejected' | 'playing' | 'completed';
  createdAt: Date;
  processedAt?: Date;
}

export interface DanmakuSettings {
  enabled: boolean;
  requestCost: number; // 代币或礼物价值
  freeRequestsPerUser: number;
  priorityMultiplier: number;
  maxQueueSize: number;
  autoApprove: boolean;
  blacklistEnabled: boolean;
  blacklistedSongs: string[];
  blacklistedUsers: string[];
  cooldownSeconds: number;
}

export interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  type: 'text' | 'sticker' | 'song_request' | 'gift' | 'system';
  vipLevel: number;
  badges: ChatBadge[];
  highlighted: boolean;
  pinned: boolean;
  timestamp: Date;
}

export interface ChatBadge {
  id: string;
  name: string;
  iconUrl: string;
  color: string;
  type: 'subscriber' | 'moderator' | 'vip' | 'top_fan' | 'achievement' | 'event';
}

export interface LiveReaction {
  type: 'like' | 'love' | 'fire' | 'clap' | 'star' | 'wave' | 'cry' | 'laugh';
  count: number;
  lastTriggered: Date;
  animation: string;
}

export interface ReceivedGift {
  id: string;
  senderId: string;
  senderName: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  quantity: number;
  value: number;
  animation: string;
  message?: string;
  timestamp: Date;
}

// 直播混音功能
export interface LiveRemix {
  id: string;
  roomId: string;
  djId: string;
  djName: string;
  title: string;
  status: 'preparing' | 'live' | 'ended';
  tracks: RemixTrack[];
  effects: LiveEffect[];
  tempo: number;
  key: string;
  viewers: number;
  recording: boolean;
  recordingUrl?: string;
  chat: LiveChatMessage[];
  tips: DJTip[];
}

export interface RemixTrack {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  deck: 'A' | 'B';
  position: number;
  tempo: number;
  pitch: number;
  volume: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  filter: number;
  effects: TrackEffect[];
  loopStart?: number;
  loopEnd?: number;
  cuePoints: CuePoint[];
  playing: boolean;
}

export interface TrackEffect {
  type: 'echo' | 'reverb' | 'flanger' | 'phaser' | 'bitcrush' | 'filter';
  wet: number;
  params: Record<string, number>;
}

export interface CuePoint {
  id: string;
  position: number;
  color: string;
  name: string;
}

export interface LiveEffect {
  type: 'transition' | 'drop' | 'buildup' | 'breakdown' | 'scratch';
  active: boolean;
  intensity: number;
  duration: number;
}

export interface DJTip {
  id: string;
  senderId: string;
  senderName: string;
  amount: number;
  message?: string;
  songRequest?: string;
  timestamp: Date;
}

// 直播连麦PK
export interface LivePKBattle {
  id: string;
  title: string;
  type: 'singing' | 'gaming' | 'talent';
  status: 'pending' | 'ongoing' | 'ended';
  participants: PKParticipant[];
  rounds: PKRound[];
  currentRound: number;
  totalRounds: number;
  stakes: PKStakes;
  judges: PKJudge[];
  audienceVoting: boolean;
  audienceVotes: Record<string, number>;
  winner?: string;
  startTime: Date;
  endTime?: Date;
}

export interface PKParticipant {
  userId: string;
  username: string;
  avatar: string;
  roomId: string;
  score: number;
  supporters: number;
  giftsReceived: number;
  ready: boolean;
}

export interface PKRound {
  roundNumber: number;
  theme?: string;
  songId?: string;
  scores: Record<string, number>;
  winner?: string;
  startTime: Date;
  endTime?: Date;
}

export interface PKStakes {
  type: 'points' | 'followers' | 'custom';
  amount: number;
  description: string;
}

export interface PKJudge {
  userId: string;
  username: string;
  role: 'host' | 'guest' | 'ai';
  voted: boolean;
  vote?: string;
}

// 直播商城
export interface LiveShop {
  id: string;
  roomId: string;
  products: LiveProduct[];
  featuredProduct?: LiveProduct;
  flashSales: FlashSale[];
  orderHistory: LiveOrder[];
}

export interface LiveProduct {
  id: string;
  name: string;
  description: string;
  type: 'digital' | 'physical' | 'ticket' | 'membership';
  imageUrl: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  sold: number;
  pinned: boolean;
  limited: boolean;
}

export interface FlashSale {
  id: string;
  productId: string;
  discountPercentage: number;
  startTime: Date;
  endTime: Date;
  maxQuantity: number;
  soldQuantity: number;
}

export interface LiveOrder {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded';
  createdAt: Date;
}

// 直播弹幕墙
export interface DanmakuWall {
  id: string;
  roomId: string;
  settings: DanmakuWallSettings;
  messages: DanmakuMessage[];
  filters: DanmakuFilter[];
}

export interface DanmakuWallSettings {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast';
  density: 'low' | 'medium' | 'high';
  fontSizeRange: [number, number];
  opacity: number;
  colorful: boolean;
  customColors: string[];
  topRowReserved: boolean;
  bottomRowReserved: boolean;
}

export interface DanmakuMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  position: 'scroll' | 'top' | 'bottom';
  premium: boolean;
  timestamp: Date;
}

export interface DanmakuFilter {
  type: 'keyword' | 'user' | 'regex';
  value: string;
  action: 'block' | 'highlight' | 'moderate';
}
