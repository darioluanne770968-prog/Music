// 硬件生态系统类型定义

// 智能耳机
export interface SmartEarbuds {
  id: string;
  brand: string;
  model: string;
  connected: boolean;
  paired: boolean;
  batteryLevel: BatteryStatus;
  firmware: FirmwareInfo;
  features: EarbudFeatures;
  settings: EarbudSettings;
  healthData: EarbudHealthData;
  customizations: EarbudCustomization;
}

export interface BatteryStatus {
  leftEarbud: number;
  rightEarbud: number;
  case: number;
  charging: boolean;
  estimatedPlaytime: number;
}

export interface FirmwareInfo {
  version: string;
  updateAvailable: boolean;
  latestVersion?: string;
  releaseNotes?: string;
}

export interface EarbudFeatures {
  anc: boolean; // Active Noise Cancellation
  transparency: boolean;
  spatialAudio: boolean;
  headTracking: boolean;
  adaptiveEQ: boolean;
  hearingTest: boolean;
  hearingAid: boolean;
  heartRateSensor: boolean;
  temperatureSensor: boolean;
  motionSensor: boolean;
  touchControls: boolean;
  voiceAssistant: boolean;
  multipoint: boolean;
  losslessAudio: boolean;
  wirelessCharging: boolean;
}

export interface EarbudSettings {
  ancLevel: number;
  transparencyLevel: number;
  spatialAudioEnabled: boolean;
  headTrackingEnabled: boolean;
  adaptiveEQEnabled: boolean;
  equalizer: EqualizerSettings;
  controls: EarbudControlSettings;
  voiceAssistant: VoiceAssistantSettings;
  findMyEnabled: boolean;
  autoConnect: boolean;
  autoPlayPause: boolean;
  inEarDetection: boolean;
}

export interface EqualizerSettings {
  preset: string;
  customBands: EqualizerBand[];
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
}

export interface EarbudControlSettings {
  leftSingleTap: EarbudAction;
  leftDoubleTap: EarbudAction;
  leftTripleTap: EarbudAction;
  leftLongPress: EarbudAction;
  leftSwipe: EarbudAction;
  rightSingleTap: EarbudAction;
  rightDoubleTap: EarbudAction;
  rightTripleTap: EarbudAction;
  rightLongPress: EarbudAction;
  rightSwipe: EarbudAction;
  stemPress: EarbudAction;
}

export type EarbudAction =
  | 'play_pause'
  | 'next_track'
  | 'previous_track'
  | 'volume_up'
  | 'volume_down'
  | 'anc_toggle'
  | 'transparency_toggle'
  | 'voice_assistant'
  | 'none';

export interface VoiceAssistantSettings {
  enabled: boolean;
  provider: 'siri' | 'google' | 'alexa' | 'bixby' | 'custom';
  wakeWord: boolean;
  voiceFeedback: boolean;
}

export interface EarbudHealthData {
  hearingProfile: HearingProfile;
  exposureHistory: NoiseExposure[];
  usageStats: EarbudUsageStats;
  hearingTestResults: HearingTestResult[];
}

export interface HearingProfile {
  leftEar: FrequencyResponse;
  rightEar: FrequencyResponse;
  overallScore: number;
  recommendations: string[];
}

export interface FrequencyResponse {
  frequencies: number[];
  thresholds: number[];
}

export interface NoiseExposure {
  date: Date;
  averageLevel: number;
  peakLevel: number;
  duration: number;
  warningTriggered: boolean;
}

export interface EarbudUsageStats {
  totalPlaytime: number;
  dailyAverage: number;
  ancUsage: number;
  transparencyUsage: number;
  callTime: number;
  spatialAudioTime: number;
}

export interface HearingTestResult {
  date: Date;
  leftEarScore: number;
  rightEarScore: number;
  overallScore: number;
  recommendation: string;
}

export interface EarbudCustomization {
  name: string;
  ledColor?: string;
  gestureProfiles: GestureProfile[];
  soundProfiles: SoundProfile[];
  activeGestureProfile: string;
  activeSoundProfile: string;
}

export interface GestureProfile {
  id: string;
  name: string;
  controls: EarbudControlSettings;
}

export interface SoundProfile {
  id: string;
  name: string;
  equalizer: EqualizerSettings;
  ancLevel: number;
  spatialAudio: boolean;
}

// 车载集成
export interface CarIntegration {
  id: string;
  userId: string;
  vehicle: VehicleInfo;
  connection: CarConnection;
  features: CarFeatures;
  settings: CarSettings;
  drivingData: DrivingData;
  playlists: CarPlaylist[];
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin?: string;
  infotainmentSystem: string;
  audioSystem: AudioSystemInfo;
  connectedCar: boolean;
}

export interface AudioSystemInfo {
  brand: string;
  speakers: number;
  subwoofer: boolean;
  amplifierWatts: number;
  surroundSound: boolean;
  dolbyAtmos: boolean;
}

export interface CarConnection {
  type: 'bluetooth' | 'carplay' | 'android_auto' | 'usb' | 'wifi';
  status: 'connected' | 'disconnected' | 'connecting';
  signalStrength: number;
  latency: number;
  audioCodec: string;
}

export interface CarFeatures {
  voiceControl: boolean;
  steeringWheelControls: boolean;
  displayIntegration: boolean;
  navigation: boolean;
  climateControl: boolean;
  seatControl: boolean;
  ambientLighting: boolean;
  hud: boolean; // Head-up display
}

export interface CarSettings {
  audioPreset: CarAudioPreset;
  volumeLimit: number;
  speedVolumeAdjust: boolean;
  speedVolumeGain: number;
  announceNavigation: boolean;
  pauseForCalls: boolean;
  autoResume: boolean;
  handsFreeMode: boolean;
  displayMode: 'full' | 'minimal' | 'now_playing';
  ambientLightSync: boolean;
  ambientLightColor: string;
}

export interface CarAudioPreset {
  id: string;
  name: string;
  equalizer: EqualizerSettings;
  surroundMode: string;
  focusPosition: 'driver' | 'all' | 'rear';
  bassBoost: number;
  trebleBoost: number;
}

export interface DrivingData {
  currentSpeed: number;
  totalDistance: number;
  currentTrip: TripInfo;
  recentTrips: TripInfo[];
  drivingPatterns: DrivingPattern[];
}

export interface TripInfo {
  id: string;
  startTime: Date;
  endTime?: Date;
  distance: number;
  duration: number;
  route?: RouteInfo;
  musicPlayed: PlayedTrack[];
  averageSpeed: number;
}

export interface RouteInfo {
  start: string;
  end: string;
  waypoints: string[];
  estimatedTime: number;
}

export interface PlayedTrack {
  songId: string;
  songName: string;
  artistName: string;
  playedAt: Date;
  duration: number;
  completed: boolean;
}

export interface DrivingPattern {
  type: 'commute' | 'road_trip' | 'errand' | 'leisure';
  frequency: number;
  averageDuration: number;
  preferredGenres: string[];
  timeOfDay: string;
}

export interface CarPlaylist {
  id: string;
  name: string;
  type: 'commute' | 'road_trip' | 'workout' | 'relax' | 'focus' | 'custom';
  tracks: string[];
  autoGenerated: boolean;
  basedOn: string;
  downloadedForOffline: boolean;
}

// 智能音箱技能
export interface SmartSpeakerSkill {
  id: string;
  name: string;
  description: string;
  platform: SpeakerPlatform;
  icon: string;
  invocationName: string;
  intents: SkillIntent[];
  settings: SkillSettings;
  stats: SkillStats;
  version: string;
  publishedAt: Date;
}

export type SpeakerPlatform = 'alexa' | 'google' | 'siri' | 'bixby' | 'cortana' | 'xiaomi';

export interface SkillIntent {
  id: string;
  name: string;
  utterances: string[];
  slots: IntentSlot[];
  action: string;
  response: IntentResponse;
}

export interface IntentSlot {
  name: string;
  type: 'song' | 'artist' | 'playlist' | 'genre' | 'mood' | 'number' | 'time' | 'custom';
  required: boolean;
  prompt?: string;
}

export interface IntentResponse {
  type: 'speech' | 'audio' | 'card' | 'mixed';
  speechText?: string;
  audioUrl?: string;
  cardTitle?: string;
  cardContent?: string;
  cardImage?: string;
  shouldEndSession: boolean;
}

export interface SkillSettings {
  defaultPlaylist: string;
  volumeDefault: number;
  explicitFilter: boolean;
  personalizedResponses: boolean;
  briefMode: boolean;
  multiRoom: boolean;
  linkedAccount: boolean;
}

export interface SkillStats {
  totalInvocations: number;
  dailyActiveUsers: number;
  averageSessionDuration: number;
  topIntents: TopIntent[];
  rating: number;
  reviews: number;
}

export interface TopIntent {
  intent: string;
  count: number;
  percentage: number;
}

// 智能家居集成
export interface SmartHomeMusic {
  id: string;
  userId: string;
  home: SmartHomeInfo;
  rooms: SmartRoom[];
  speakers: SmartSpeaker[];
  routines: SmartRoutine[];
  scenes: SmartScene[];
  automations: SmartAutomation[];
}

export interface SmartHomeInfo {
  name: string;
  platform: SmartHomePlatform;
  connected: boolean;
  devices: number;
  zones: number;
}

export type SmartHomePlatform =
  | 'apple_home'
  | 'google_home'
  | 'amazon_echo'
  | 'samsung_smartthings'
  | 'home_assistant'
  | 'custom';

export interface SmartRoom {
  id: string;
  name: string;
  type: RoomType;
  speakers: string[];
  currentlyPlaying?: NowPlaying;
  volume: number;
  grouped: boolean;
  groupId?: string;
}

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'garage'
  | 'outdoor'
  | 'other';

export interface NowPlaying {
  songId: string;
  songName: string;
  artistName: string;
  albumArt: string;
  position: number;
  duration: number;
  isPlaying: boolean;
}

export interface SmartSpeaker {
  id: string;
  name: string;
  brand: string;
  model: string;
  room: string;
  capabilities: SpeakerCapabilities;
  status: SpeakerStatus;
  settings: SpeakerSettings;
}

export interface SpeakerCapabilities {
  stereo: boolean;
  multiRoom: boolean;
  voiceAssistant: boolean;
  airplay: boolean;
  chromecast: boolean;
  spotify_connect: boolean;
  bluetooth: boolean;
  aux: boolean;
  dolbyAtmos: boolean;
}

export interface SpeakerStatus {
  online: boolean;
  playing: boolean;
  volume: number;
  muted: boolean;
  source: string;
  firmware: string;
}

export interface SpeakerSettings {
  equalizer: EqualizerSettings;
  nightMode: boolean;
  nightModeStart: string;
  nightModeEnd: string;
  maxVolume: number;
  voiceVolume: number;
  micEnabled: boolean;
}

export interface SmartRoutine {
  id: string;
  name: string;
  trigger: RoutineTrigger;
  actions: RoutineAction[];
  enabled: boolean;
  lastRun?: Date;
  runCount: number;
}

export interface RoutineTrigger {
  type: 'time' | 'voice' | 'sensor' | 'location' | 'device';
  config: Record<string, any>;
}

export interface RoutineAction {
  type: 'play_music' | 'adjust_volume' | 'switch_room' | 'announce' | 'control_device';
  target: string;
  parameters: Record<string, any>;
  delay?: number;
}

export interface SmartScene {
  id: string;
  name: string;
  icon: string;
  rooms: string[];
  music: SceneMusic;
  lighting?: SceneLighting;
  climate?: SceneClimate;
}

export interface SceneMusic {
  playlist?: string;
  genre?: string;
  mood?: string;
  volume: number;
  shuffle: boolean;
}

export interface SceneLighting {
  brightness: number;
  color?: string;
  colorTemperature?: number;
}

export interface SceneClimate {
  temperature?: number;
  mode?: string;
}

export interface SmartAutomation {
  id: string;
  name: string;
  description: string;
  conditions: AutomationCondition[];
  actions: RoutineAction[];
  enabled: boolean;
  priority: number;
}

export interface AutomationCondition {
  type: 'time' | 'presence' | 'device_state' | 'weather' | 'calendar';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

// 可穿戴设备集成
export interface WearableIntegration {
  id: string;
  userId: string;
  devices: WearableDevice[];
  healthSync: HealthSyncSettings;
  notifications: WearableNotifications;
  controls: WearableControls;
}

export interface WearableDevice {
  id: string;
  type: WearableType;
  brand: string;
  model: string;
  connected: boolean;
  batteryLevel: number;
  lastSync: Date;
  capabilities: WearableCapability[];
  settings: WearableSettings;
}

export type WearableType = 'smartwatch' | 'fitness_band' | 'smart_ring' | 'smart_glasses';

export type WearableCapability =
  | 'heart_rate'
  | 'spo2'
  | 'steps'
  | 'sleep'
  | 'stress'
  | 'music_control'
  | 'music_storage'
  | 'notifications'
  | 'voice_assistant'
  | 'gps'
  | 'nfc';

export interface WearableSettings {
  syncHealth: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  allowControls: boolean;
  showNotifications: boolean;
  offlineMusic: boolean;
  offlinePlaylistId?: string;
  hapticFeedback: boolean;
}

export interface HealthSyncSettings {
  enabled: boolean;
  metrics: HealthMetric[];
  workoutDetection: boolean;
  sleepTracking: boolean;
  heartRateSync: boolean;
  stressTracking: boolean;
}

export interface HealthMetric {
  type: string;
  enabled: boolean;
  syncToApp: boolean;
}

export interface WearableNotifications {
  nowPlaying: boolean;
  playlistEnded: boolean;
  recommendations: boolean;
  socialActivity: boolean;
  achievements: boolean;
}

export interface WearableControls {
  playPause: boolean;
  skipTrack: boolean;
  volumeControl: boolean;
  likeTrack: boolean;
  voiceSearch: boolean;
  offlineMode: boolean;
}

// 游戏主机集成
export interface GamingIntegration {
  id: string;
  userId: string;
  consoles: GamingConsole[];
  settings: GamingMusicSettings;
  activity: GamingActivity[];
}

export interface GamingConsole {
  id: string;
  type: ConsoleType;
  name: string;
  connected: boolean;
  features: ConsoleFeatures;
}

export type ConsoleType = 'playstation' | 'xbox' | 'nintendo' | 'steam_deck' | 'pc';

export interface ConsoleFeatures {
  backgroundMusic: boolean;
  spotifyConnect: boolean;
  customSoundtracks: boolean;
  voiceChat: boolean;
  streamOverlay: boolean;
}

export interface GamingMusicSettings {
  backgroundMusicEnabled: boolean;
  autoLowerForChat: boolean;
  lowerAmount: number;
  gameSpecificPlaylists: GamePlaylist[];
  streamMode: boolean;
  copyrightFilter: boolean;
}

export interface GamePlaylist {
  gameId: string;
  gameName: string;
  playlistId: string;
  playlistName: string;
  autoPlay: boolean;
}

export interface GamingActivity {
  gameId: string;
  gameName: string;
  startTime: Date;
  endTime?: Date;
  musicPlayed: PlayedTrack[];
}
