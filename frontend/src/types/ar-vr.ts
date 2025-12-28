// AR/VR 增强现实与虚拟现实功能类型定义

// AR歌词类型
export interface ARLyrics {
  id: string;
  songId: string;
  type: 'floating' | 'ground' | 'skywriting' | 'particle';
  style: ARLyricsStyle;
  position: Position3D;
  animation: ARAnimation;
  interactionEnabled: boolean;
  syncWithMusic: boolean;
}

export interface ARLyricsStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  glowColor: string;
  glowIntensity: number;
  opacity: number;
  outline: boolean;
  shadow: boolean;
  gradient?: {
    colors: string[];
    angle: number;
  };
}

export interface ARAnimation {
  type: 'fade' | 'slide' | 'bounce' | 'wave' | 'explode' | 'morph';
  duration: number;
  easing: string;
  loop: boolean;
  delay: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// VR演唱会类型
export interface VRConcert {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  description: string;
  venue: VRVenue;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'ended' | 'replay';
  ticketPrice: number;
  maxAttendees: number;
  currentAttendees: number;
  features: VRConcertFeature[];
  interactionModes: InteractionMode[];
  avatarRequired: boolean;
  recordingAvailable: boolean;
  merchandiseEnabled: boolean;
}

export interface VRVenue {
  id: string;
  name: string;
  type: 'stadium' | 'theater' | 'club' | 'outdoor' | 'fantasy' | 'space' | 'underwater';
  capacity: number;
  model3DUrl: string;
  ambientSounds: string[];
  lightingPresets: LightingPreset[];
  stageDesign: StageDesign;
  seatingLayout?: SeatingLayout;
}

export interface LightingPreset {
  id: string;
  name: string;
  colors: string[];
  intensity: number;
  pattern: 'static' | 'pulse' | 'chase' | 'strobe' | 'rainbow';
  syncWithBeat: boolean;
}

export interface StageDesign {
  width: number;
  height: number;
  depth: number;
  screens: VRScreen[];
  effects: StageEffect[];
  pyrotechnics: boolean;
}

export interface VRScreen {
  id: string;
  position: Position3D;
  size: { width: number; height: number };
  content: 'video' | 'lyrics' | 'visualizer' | 'camera';
}

export interface StageEffect {
  type: 'smoke' | 'laser' | 'confetti' | 'fireworks' | 'hologram';
  intensity: number;
  color: string;
  triggerType: 'automatic' | 'beat' | 'manual';
}

export interface SeatingLayout {
  type: 'rows' | 'freeform' | 'standing' | 'mixed';
  sections: VenueSection[];
  vipAreas: VIPArea[];
}

export interface VenueSection {
  id: string;
  name: string;
  capacity: number;
  priceMultiplier: number;
  viewQuality: 'front' | 'middle' | 'back' | 'side';
}

export interface VIPArea {
  id: string;
  name: string;
  capacity: number;
  perks: string[];
  price: number;
}

export type VRConcertFeature =
  | 'live_chat'
  | 'virtual_merchandise'
  | 'backstage_access'
  | 'meet_and_greet'
  | 'photo_mode'
  | 'gesture_reactions'
  | 'voice_chat'
  | 'dancing'
  | 'light_sticks'
  | 'crowd_wave';

export type InteractionMode =
  | 'controller'
  | 'hand_tracking'
  | 'eye_tracking'
  | 'voice'
  | 'body_tracking';

// VR KTV类型
export interface VRKTV {
  id: string;
  roomId: string;
  hostId: string;
  participants: VRKTVParticipant[];
  theme: VRKTVTheme;
  songQueue: QueuedSong[];
  currentSong?: QueuedSong;
  roomSettings: VRKTVSettings;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
}

export interface VRKTVParticipant {
  userId: string;
  username: string;
  avatar: VRAvatar;
  role: 'host' | 'singer' | 'audience';
  score: number;
  songsPerformed: number;
  micEnabled: boolean;
  position: Position3D;
}

export interface VRKTVTheme {
  id: string;
  name: string;
  environment: 'classic' | 'neon' | 'beach' | 'space' | 'forest' | 'city' | 'underwater';
  roomModel: string;
  lighting: LightingPreset;
  decorations: VRDecoration[];
}

export interface VRDecoration {
  id: string;
  type: 'prop' | 'effect' | 'interactive';
  modelUrl: string;
  position: Position3D;
  scale: number;
  interactive: boolean;
}

export interface VRKTVSettings {
  maxParticipants: number;
  allowDuets: boolean;
  scoringEnabled: boolean;
  autoQueue: boolean;
  guestMicAllowed: boolean;
  recordingEnabled: boolean;
  effectsLevel: 'low' | 'medium' | 'high';
}

export interface QueuedSong {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  requestedBy: string;
  singersCount: number;
  singers: string[];
  status: 'queued' | 'performing' | 'completed';
  score?: number;
}

// VR Avatar类型
export interface VRAvatar {
  id: string;
  userId: string;
  type: 'realistic' | 'stylized' | 'anime' | 'robot' | 'fantasy';
  bodyType: 'full' | 'upper' | 'head_only';
  customization: AvatarCustomization;
  animations: AvatarAnimation[];
  accessories: AvatarAccessory[];
  outfits: AvatarOutfit[];
  currentOutfitId: string;
}

export interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  faceShape: string;
  bodyHeight: number;
  bodyBuild: string;
  voicePitch: number;
}

export interface AvatarAnimation {
  id: string;
  name: string;
  type: 'idle' | 'dance' | 'gesture' | 'emote' | 'sing';
  triggerType: 'manual' | 'automatic' | 'motion_capture';
  loopable: boolean;
}

export interface AvatarAccessory {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'earrings' | 'necklace' | 'lightstick' | 'microphone';
  modelUrl: string;
  equipped: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AvatarOutfit {
  id: string;
  name: string;
  style: string;
  pieces: OutfitPiece[];
  unlocked: boolean;
  source: 'default' | 'purchase' | 'event' | 'achievement' | 'nft';
}

export interface OutfitPiece {
  slot: 'top' | 'bottom' | 'shoes' | 'fullBody' | 'jacket';
  itemId: string;
  color: string;
}

// 元宇宙音乐空间类型
export interface MetaverseMusicWorld {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  type: 'public' | 'private' | 'event';
  theme: MetaverseTheme;
  zones: MetaverseZone[];
  currentUsers: number;
  maxUsers: number;
  features: MetaverseFeature[];
  economy: MetaverseEconomy;
  events: MetaverseEvent[];
  rules: string[];
  createdAt: Date;
}

export interface MetaverseTheme {
  name: string;
  skybox: string;
  terrain: string;
  ambientMusic: string;
  weatherEffects: WeatherEffect[];
  timeOfDay: 'day' | 'night' | 'sunset' | 'dynamic';
}

export interface WeatherEffect {
  type: 'rain' | 'snow' | 'aurora' | 'stars' | 'clouds' | 'fog';
  intensity: number;
  syncWithMusic: boolean;
}

export interface MetaverseZone {
  id: string;
  name: string;
  type: 'stage' | 'lounge' | 'studio' | 'shop' | 'gallery' | 'game' | 'social';
  position: Position3D;
  size: { width: number; height: number; depth: number };
  capacity: number;
  activities: ZoneActivity[];
  portalTo?: string;
}

export interface ZoneActivity {
  id: string;
  type: 'concert' | 'karaoke' | 'dance' | 'listen' | 'create' | 'trade' | 'chat';
  name: string;
  description: string;
  participants: number;
  startTime?: Date;
  endTime?: Date;
}

export type MetaverseFeature =
  | 'voice_chat'
  | 'text_chat'
  | 'emotes'
  | 'trading'
  | 'nft_gallery'
  | 'live_concerts'
  | 'dj_booth'
  | 'karaoke_rooms'
  | 'music_studio'
  | 'social_dancing';

export interface MetaverseEconomy {
  currency: string;
  exchangeRate: number;
  marketplaceEnabled: boolean;
  creatorRewards: boolean;
  tipEnabled: boolean;
}

export interface MetaverseEvent {
  id: string;
  name: string;
  type: 'concert' | 'party' | 'competition' | 'workshop' | 'meetup';
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  registered: number;
  rewards: EventReward[];
}

export interface EventReward {
  type: 'currency' | 'item' | 'badge' | 'nft';
  name: string;
  quantity: number;
  rarity: string;
}

// AR音乐可视化类型
export interface ARVisualization {
  id: string;
  name: string;
  type: 'particle' | 'waveform' | 'spectrum' | 'geometric' | 'nature' | 'abstract';
  settings: ARVisualizationSettings;
  audioReactivity: AudioReactivity;
  placement: 'world' | 'face' | 'surface' | 'sky';
  interactive: boolean;
}

export interface ARVisualizationSettings {
  colorScheme: string[];
  intensity: number;
  scale: number;
  density: number;
  smoothness: number;
  glowEnabled: boolean;
  shadowEnabled: boolean;
}

export interface AudioReactivity {
  bassResponse: number;
  midResponse: number;
  highResponse: number;
  beatDetection: boolean;
  smoothing: number;
}

// AR滤镜类型
export interface ARMusicFilter {
  id: string;
  name: string;
  category: 'face' | 'background' | 'overlay' | 'effect';
  thumbnailUrl: string;
  modelUrl: string;
  audioReactive: boolean;
  artistCollaboration?: string;
  premium: boolean;
  downloads: number;
}

// 设备类型
export interface VRDevice {
  id: string;
  type: 'headset' | 'controller' | 'tracker';
  brand: string;
  model: string;
  connected: boolean;
  batteryLevel: number;
  capabilities: VRCapability[];
}

export type VRCapability =
  | 'positional_tracking'
  | 'hand_tracking'
  | 'eye_tracking'
  | 'haptic_feedback'
  | 'passthrough'
  | 'spatial_audio'
  | 'mixed_reality';

// AR会话类型
export interface ARSession {
  id: string;
  userId: string;
  startTime: Date;
  deviceType: 'phone' | 'tablet' | 'glasses';
  features: string[];
  trackingState: 'initializing' | 'tracking' | 'limited' | 'not_available';
  lightEstimation: LightEstimation;
  anchors: ARAnchor[];
}

export interface LightEstimation {
  ambientIntensity: number;
  ambientColorTemperature: number;
  primaryLightDirection: Position3D;
  primaryLightIntensity: number;
}

export interface ARAnchor {
  id: string;
  type: 'plane' | 'image' | 'object' | 'face' | 'body';
  position: Position3D;
  rotation: { x: number; y: number; z: number; w: number };
  content?: string;
}
