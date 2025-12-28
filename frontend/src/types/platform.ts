// 跨平台与智能设备类型定义

// 设备管理
export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceType;
  platform: DevicePlatform;
  isActive: boolean;
  isCurrentDevice: boolean;
  lastActiveAt: Date;
  capabilities: DeviceCapabilities;
  settings: DeviceSettings;
  iconUrl: string;
}

export type DeviceType =
  | 'phone' | 'tablet' | 'desktop' | 'web' | 'tv'
  | 'watch' | 'car' | 'speaker' | 'headphones' | 'game_console';

export type DevicePlatform =
  | 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'web'
  | 'watchos' | 'wearos' | 'tvos' | 'android_tv' | 'carplay'
  | 'android_auto' | 'alexa' | 'google_home' | 'sonos' | 'playstation' | 'xbox';

export interface DeviceCapabilities {
  supportsOffline: boolean;
  supportsHiRes: boolean;
  supportsSpatialAudio: boolean;
  supportsVideo: boolean;
  supportsLyrics: boolean;
  supportsVisualizer: boolean;
  maxAudioQuality: string;
  hasScreen: boolean;
  screenSize?: string;
  hasMicrophone: boolean;
  hasCamera: boolean;
  supportsBluetooth: boolean;
  supportsAirPlay: boolean;
  supportsChromecast: boolean;
}

export interface DeviceSettings {
  audioQuality: string;
  downloadQuality: string;
  crossfade: number;
  gapless: boolean;
  normalizeVolume: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
  autoPlay: boolean;
}

// 智能手表
export interface WatchApp {
  connected: boolean;
  deviceId: string;
  deviceName: string;
  platform: 'watchos' | 'wearos' | 'galaxy_watch';
  batteryLevel: number;
  storageUsed: number;
  storageTotal: number;
  syncedPlaylists: WatchPlaylist[];
  settings: WatchSettings;
  complications: WatchComplication[];
}

export interface WatchPlaylist {
  playlistId: string;
  name: string;
  songCount: number;
  sizeBytes: number;
  syncedAt: Date;
  autoSync: boolean;
}

export interface WatchSettings {
  showNowPlaying: boolean;
  showHeartRate: boolean;
  hapticFeedback: boolean;
  autoStartWorkout: boolean;
  offlineMode: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  maxStorage: number; // MB
}

export interface WatchComplication {
  type: 'now_playing' | 'recent' | 'favorites' | 'workout';
  position: string;
  enabled: boolean;
}

// 车载模式
export interface CarMode {
  enabled: boolean;
  platform: 'carplay' | 'android_auto' | 'bluetooth' | 'native';
  vehicle?: Vehicle;
  settings: CarModeSettings;
  recentDestinations: CarDestination[];
  drivingPlaylists: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  bluetoothName?: string;
  features: VehicleFeature[];
}

export type VehicleFeature =
  | 'steering_wheel_controls' | 'voice_control' | 'touch_screen'
  | 'hud_display' | 'surround_sound' | 'wireless_charging';

export interface CarModeSettings {
  autoLaunch: boolean;
  largeControls: boolean;
  voiceCommands: boolean;
  speedBasedVolume: boolean;
  navigationAnnouncements: 'mute' | 'duck' | 'pause';
  safetyMode: boolean;
  nightMode: 'auto' | 'on' | 'off';
  preferredAudioSource: 'bluetooth' | 'usb' | 'aux' | 'carplay';
}

export interface CarDestination {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  lastVisited: Date;
  suggestedPlaylist?: string;
}

// 智能家居
export interface SmartHomeIntegration {
  enabled: boolean;
  platforms: SmartHomePlatform[];
  devices: SmartHomeDevice[];
  routines: SmartHomeRoutine[];
  scenes: SmartHomeScene[];
}

export interface SmartHomePlatform {
  id: string;
  type: 'alexa' | 'google_home' | 'homekit' | 'smartthings' | 'home_assistant';
  name: string;
  isConnected: boolean;
  connectedAt: Date;
  deviceCount: number;
}

export interface SmartHomeDevice {
  id: string;
  platformId: string;
  name: string;
  type: SmartDeviceType;
  room: string;
  isOnline: boolean;
  capabilities: string[];
  currentState: Record<string, any>;
}

export type SmartDeviceType =
  | 'speaker' | 'display' | 'light' | 'thermostat' | 'tv'
  | 'soundbar' | 'receiver' | 'multiroom' | 'alarm';

export interface SmartHomeRoutine {
  id: string;
  name: string;
  trigger: RoutineTrigger;
  actions: RoutineAction[];
  enabled: boolean;
  lastRun?: Date;
}

export interface RoutineTrigger {
  type: 'time' | 'location' | 'device' | 'voice' | 'event';
  conditions: Record<string, any>;
}

export interface RoutineAction {
  type: 'play_music' | 'set_volume' | 'control_device' | 'announcement';
  target: string;
  parameters: Record<string, any>;
  delay?: number;
}

export interface SmartHomeScene {
  id: string;
  name: string;
  icon: string;
  actions: RoutineAction[];
  playlist?: string;
  mood?: string;
}

// 游戏主机
export interface GameConsoleApp {
  platform: 'playstation' | 'xbox' | 'switch';
  connected: boolean;
  deviceId: string;
  gamertag?: string;
  features: ConsoleFeature[];
  settings: ConsoleSettings;
  achievements: ConsoleAchievement[];
}

export type ConsoleFeature =
  | 'background_music' | 'game_integration' | 'voice_control'
  | 'social_features' | 'streaming' | 'karaoke';

export interface ConsoleSettings {
  backgroundMusicVolume: number;
  gameAudioDucking: number;
  showOverlay: boolean;
  overlayPosition: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  socialSharing: boolean;
  voiceCommands: boolean;
}

export interface ConsoleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  points: number;
}

// 智能电视
export interface TVApp {
  platform: 'tvos' | 'android_tv' | 'samsung' | 'lg' | 'roku' | 'fire_tv';
  connected: boolean;
  deviceId: string;
  deviceName: string;
  resolution: '1080p' | '4k' | '8k';
  features: TVFeature[];
  settings: TVSettings;
  screensaver: TVScreensaver;
}

export type TVFeature =
  | 'dolby_vision' | 'dolby_atmos' | 'hdr10' | 'ambient_mode'
  | 'voice_control' | 'multi_view' | 'pip';

export interface TVSettings {
  videoQuality: 'auto' | '720p' | '1080p' | '4k';
  audioOutput: 'tv_speakers' | 'soundbar' | 'receiver' | 'headphones';
  showLyrics: boolean;
  showVisualizer: boolean;
  visualizerStyle: string;
  idleTimeout: number;
  screensaverEnabled: boolean;
}

export interface TVScreensaver {
  type: 'album_art' | 'visualizer' | 'photos' | 'clock' | 'slideshow';
  startAfter: number; // 分钟
  settings: Record<string, any>;
}

// 投射/串流
export interface CastingSession {
  id: string;
  protocol: CastProtocol;
  targetDevice: CastDevice;
  status: 'connecting' | 'connected' | 'playing' | 'paused' | 'error';
  currentMedia?: CastMedia;
  volume: number;
  muted: boolean;
  startedAt: Date;
}

export type CastProtocol = 'chromecast' | 'airplay' | 'dlna' | 'spotify_connect' | 'bluetooth';

export interface CastDevice {
  id: string;
  name: string;
  type: DeviceType;
  protocol: CastProtocol;
  iconUrl: string;
  isAvailable: boolean;
  capabilities: string[];
}

export interface CastMedia {
  songId: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  position: number;
}

// 多房间音频
export interface MultiRoomAudio {
  enabled: boolean;
  groups: SpeakerGroup[];
  availableSpeakers: Speaker[];
}

export interface SpeakerGroup {
  id: string;
  name: string;
  speakers: Speaker[];
  volume: number;
  isPlaying: boolean;
  currentMedia?: CastMedia;
}

export interface Speaker {
  id: string;
  name: string;
  room: string;
  type: 'sonos' | 'homepod' | 'echo' | 'google_home' | 'bose' | 'generic';
  isOnline: boolean;
  volume: number;
  balance: number;
  groupId?: string;
}

// 离线模式
export interface OfflineMode {
  enabled: boolean;
  autoDownload: boolean;
  downloadSettings: DownloadSettings;
  downloads: OfflineDownload[];
  storageUsed: number;
  storageLimit: number;
  lastSyncAt: Date;
}

export interface DownloadSettings {
  quality: 'low' | 'medium' | 'high' | 'lossless';
  wifiOnly: boolean;
  autoRemoveAfter: number; // 天, 0 = 永不
  smartDownloads: boolean;
  maxStorage: number; // MB
  downloadLyrics: boolean;
  downloadAlbumArt: boolean;
}

export interface OfflineDownload {
  id: string;
  type: 'song' | 'album' | 'playlist' | 'podcast' | 'audiobook';
  referenceId: string;
  title: string;
  coverUrl: string;
  size: number;
  downloadedAt: Date;
  lastPlayedAt?: Date;
  playCount: number;
  status: 'queued' | 'downloading' | 'completed' | 'paused' | 'error';
  progress?: number;
  expiresAt?: Date;
}

// 语音控制
export interface VoiceControl {
  enabled: boolean;
  wakeWord: string;
  language: string;
  assistants: VoiceAssistant[];
  commands: VoiceCommand[];
  history: VoiceInteraction[];
}

export interface VoiceAssistant {
  type: 'siri' | 'alexa' | 'google' | 'cortana' | 'bixby' | 'native';
  enabled: boolean;
  linked: boolean;
  capabilities: string[];
}

export interface VoiceCommand {
  phrase: string;
  action: string;
  parameters?: Record<string, string>;
  customResponse?: string;
}

export interface VoiceInteraction {
  id: string;
  query: string;
  response: string;
  action?: string;
  success: boolean;
  timestamp: Date;
}

// 数据同步
export interface DataSync {
  lastSyncAt: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncProgress?: number;
  syncItems: SyncItem[];
  conflicts: SyncConflict[];
  settings: SyncSettings;
}

export interface SyncItem {
  type: 'library' | 'playlists' | 'history' | 'settings' | 'downloads';
  lastSyncAt: Date;
  status: 'synced' | 'pending' | 'error';
  itemCount: number;
}

export interface SyncConflict {
  id: string;
  type: string;
  localValue: any;
  remoteValue: any;
  detectedAt: Date;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // 分钟
  syncOnCellular: boolean;
  syncHistory: boolean;
  syncPlaylists: boolean;
  syncSettings: boolean;
  syncOfflineContent: boolean;
}

// 小组件
export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  platform: 'ios' | 'android' | 'windows' | 'macos';
  settings: WidgetSettings;
  refreshInterval: number;
}

export type WidgetType =
  | 'now_playing' | 'recent' | 'favorites' | 'recommendations'
  | 'lyrics' | 'stats' | 'playlist' | 'artist' | 'album';

export type WidgetSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface WidgetSettings {
  theme: 'light' | 'dark' | 'system' | 'album_color';
  showAlbumArt: boolean;
  showControls: boolean;
  transparency: number;
  cornerRadius: number;
}

// 快捷指令/自动化
export interface Shortcut {
  id: string;
  name: string;
  icon: string;
  color: string;
  actions: ShortcutAction[];
  trigger?: ShortcutTrigger;
  runCount: number;
  lastRunAt?: Date;
}

export interface ShortcutAction {
  type: string;
  parameters: Record<string, any>;
  output?: string;
}

export interface ShortcutTrigger {
  type: 'manual' | 'time' | 'location' | 'nfc' | 'shortcut' | 'automation';
  conditions: Record<string, any>;
}
