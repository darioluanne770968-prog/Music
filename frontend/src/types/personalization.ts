// 超级个性化功能类型定义

// 心跳匹配音乐
export interface HeartbeatSync {
  id: string;
  userId: string;
  enabled: boolean;
  currentHeartRate: number;
  targetZone: HeartRateZone;
  syncMode: 'match' | 'target' | 'calm' | 'energize';
  playlistId?: string;
  history: HeartRateReading[];
  connectedDevice?: WearableDevice;
  preferences: HeartbeatPreferences;
}

export interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
  bpmRange: [number, number]; // 对应的音乐BPM范围
}

export interface HeartRateReading {
  timestamp: Date;
  bpm: number;
  songId?: string;
  activity: string;
}

export interface WearableDevice {
  id: string;
  type: 'watch' | 'band' | 'ring' | 'chest_strap';
  brand: string;
  model: string;
  connected: boolean;
  batteryLevel: number;
  lastSync: Date;
  capabilities: WearableCapability[];
}

export type WearableCapability =
  | 'heart_rate'
  | 'hrv'
  | 'spo2'
  | 'steps'
  | 'sleep'
  | 'stress'
  | 'gps'
  | 'music_control';

export interface HeartbeatPreferences {
  autoStart: boolean;
  targetRecoveryBpm: number;
  workoutIntensityPreference: 'match' | 'push' | 'recovery';
  restMusicPreference: 'calm' | 'ambient' | 'acoustic';
  notifyOnZoneChange: boolean;
}

// 天气音乐匹配
export interface WeatherMusic {
  id: string;
  userId: string;
  enabled: boolean;
  location: GeoLocation;
  currentWeather: WeatherData;
  mood: WeatherMood;
  playlist?: GeneratedPlaylist;
  preferences: WeatherMusicPreferences;
  history: WeatherMusicSession[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  sunrise: Date;
  sunset: Date;
  moonPhase: string;
  description: string;
  icon: string;
}

export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'partly_cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy'
  | 'hazy';

export interface WeatherMood {
  primary: string;
  secondary: string;
  energy: number;
  valence: number;
  suggestedGenres: string[];
}

export interface GeneratedPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: string[];
  generatedAt: Date;
  basedOn: string;
  mood: string;
}

export interface WeatherMusicPreferences {
  rainyDayGenres: string[];
  sunnyDayGenres: string[];
  coldWeatherGenres: string[];
  hotWeatherGenres: string[];
  nightTimePreference: 'calm' | 'energetic' | 'no_change';
  seasonalAdjustments: boolean;
}

export interface WeatherMusicSession {
  id: string;
  weather: WeatherData;
  playlist: string;
  startTime: Date;
  endTime: Date;
  tracksPlayed: number;
  userRating?: number;
}

// 日程智能播放
export interface ScheduleMusic {
  id: string;
  userId: string;
  enabled: boolean;
  calendar: CalendarIntegration;
  rules: ScheduleRule[];
  activeRule?: ScheduleRule;
  schedule: DailySchedule[];
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple' | 'custom';
  connected: boolean;
  syncEnabled: boolean;
  lastSync: Date;
  calendars: CalendarSource[];
}

export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

export interface ScheduleRule {
  id: string;
  name: string;
  trigger: ScheduleTrigger;
  action: MusicAction;
  priority: number;
  enabled: boolean;
}

export interface ScheduleTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  timeWindow?: TimeWindow;
}

export type TriggerType =
  | 'time'
  | 'event_start'
  | 'event_end'
  | 'location'
  | 'activity'
  | 'calendar_free'
  | 'calendar_busy';

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface TimeWindow {
  start: string; // HH:mm
  end: string; // HH:mm
  days: number[]; // 0-6
}

export interface MusicAction {
  type: 'play_playlist' | 'play_genre' | 'play_mood' | 'adjust_volume' | 'pause' | 'fade_out';
  playlistId?: string;
  genre?: string;
  mood?: string;
  volume?: number;
  fadeDuration?: number;
}

export interface DailySchedule {
  date: Date;
  events: ScheduledEvent[];
  musicBlocks: MusicBlock[];
}

export interface ScheduledEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  category: string;
  musicRule?: string;
}

export interface MusicBlock {
  startTime: Date;
  endTime: Date;
  ruleId: string;
  playlistId?: string;
  mood?: string;
}

// 梦境音乐
export interface DreamMusic {
  id: string;
  userId: string;
  enabled: boolean;
  sleepData: SleepData;
  dreamJournal: DreamEntry[];
  soundscapes: DreamSoundscape[];
  preferences: DreamMusicPreferences;
  insights: DreamInsight[];
}

export interface SleepData {
  lastNight: SleepSession;
  weeklyAverage: SleepStats;
  monthlyTrend: SleepTrend[];
  sleepScore: number;
}

export interface SleepSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  stages: SleepStage[];
  heartRateData: number[];
  movementData: number[];
  snoreDetected: boolean;
  dreamDetected: boolean;
  quality: number;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  duration: number;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  deepSleepPercentage: number;
  remPercentage: number;
}

export interface SleepTrend {
  date: Date;
  duration: number;
  quality: number;
  deepSleep: number;
  remSleep: number;
}

export interface DreamEntry {
  id: string;
  date: Date;
  title: string;
  description: string;
  mood: string;
  themes: string[];
  lucid: boolean;
  vivid: boolean;
  recurring: boolean;
  associatedSongs: string[];
  generatedSoundscape?: string;
}

export interface DreamSoundscape {
  id: string;
  name: string;
  description: string;
  elements: SoundElement[];
  duration: number;
  loopable: boolean;
  associatedMoods: string[];
  generatedFrom?: string; // dream entry id
}

export interface SoundElement {
  id: string;
  type: 'ambient' | 'tone' | 'nature' | 'melody' | 'binaural';
  source: string;
  volume: number;
  pan: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  frequency?: number; // for binaural beats
}

export interface DreamMusicPreferences {
  preSleepPlaylist?: string;
  wakingPlaylist?: string;
  lucidDreamInduction: boolean;
  binauralBeatsEnabled: boolean;
  preferredFrequencies: number[];
  volumeFadeTime: number;
  smartAlarmEnabled: boolean;
  smartAlarmWindow: number; // minutes
}

export interface DreamInsight {
  id: string;
  date: Date;
  type: 'pattern' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  data: Record<string, any>;
}

// 情境感知
export interface ContextAwareness {
  id: string;
  userId: string;
  enabled: boolean;
  sensors: ContextSensor[];
  currentContext: CurrentContext;
  rules: ContextRule[];
  history: ContextHistory[];
}

export interface ContextSensor {
  type: SensorType;
  enabled: boolean;
  permission: 'granted' | 'denied' | 'not_asked';
  lastReading?: any;
}

export type SensorType =
  | 'location'
  | 'motion'
  | 'light'
  | 'noise'
  | 'time'
  | 'calendar'
  | 'weather'
  | 'bluetooth'
  | 'wifi';

export interface CurrentContext {
  activity: DetectedActivity;
  location: ContextLocation;
  timeOfDay: TimeOfDay;
  energy: number;
  social: SocialContext;
  environment: EnvironmentContext;
}

export interface DetectedActivity {
  type: 'stationary' | 'walking' | 'running' | 'cycling' | 'driving' | 'commuting';
  confidence: number;
  duration: number;
}

export interface ContextLocation {
  type: 'home' | 'work' | 'gym' | 'commute' | 'cafe' | 'outdoors' | 'unknown';
  name?: string;
  coordinates?: GeoLocation;
}

export interface TimeOfDay {
  period: 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
  hour: number;
  isWeekend: boolean;
  isHoliday: boolean;
}

export interface SocialContext {
  alone: boolean;
  nearbyDevices: number;
  connectedHeadphones: boolean;
  speakerConnected: boolean;
}

export interface EnvironmentContext {
  noiseLevel: number;
  lightLevel: number;
  indoors: boolean;
}

export interface ContextRule {
  id: string;
  name: string;
  conditions: ContextCondition[];
  action: MusicAction;
  priority: number;
  enabled: boolean;
}

export interface ContextCondition {
  sensor: SensorType;
  field: string;
  operator: string;
  value: any;
}

export interface ContextHistory {
  timestamp: Date;
  context: CurrentContext;
  appliedRule?: string;
  playedContent?: string;
}

// 个人音乐DNA
export interface MusicDNA {
  id: string;
  userId: string;
  profile: DNAProfile;
  traits: MusicTrait[];
  evolution: DNAEvolution[];
  comparisons: DNAComparison[];
  insights: DNAInsight[];
  lastUpdated: Date;
}

export interface DNAProfile {
  dominantGenres: GenreWeight[];
  moodSpectrum: MoodSpectrum;
  eraPreference: EraPreference;
  instrumentPreference: InstrumentPreference[];
  vocalPreference: VocalPreference;
  productionStyle: ProductionStyle;
  listeningPatterns: ListeningPattern;
}

export interface GenreWeight {
  genre: string;
  weight: number;
  subgenres: SubgenreWeight[];
}

export interface SubgenreWeight {
  name: string;
  weight: number;
}

export interface MoodSpectrum {
  happy: number;
  sad: number;
  energetic: number;
  calm: number;
  aggressive: number;
  romantic: number;
  nostalgic: number;
  experimental: number;
}

export interface EraPreference {
  decades: Record<string, number>; // "1980s": 0.3
  preferVintage: boolean;
  preferModern: boolean;
}

export interface InstrumentPreference {
  instrument: string;
  affinity: number;
}

export interface VocalPreference {
  preferInstrumental: boolean;
  preferredGender: 'male' | 'female' | 'no_preference';
  languagePreferences: LanguagePreference[];
}

export interface LanguagePreference {
  language: string;
  weight: number;
}

export interface ProductionStyle {
  preferAcoustic: number;
  preferElectronic: number;
  preferLo_fi: number;
  preferHi_fi: number;
  preferMinimalist: number;
  preferMaximalist: number;
}

export interface ListeningPattern {
  averageSessionLength: number;
  peakListeningHours: number[];
  skipRate: number;
  repeatRate: number;
  discoveryRate: number;
  completionRate: number;
}

export interface MusicTrait {
  id: string;
  name: string;
  description: string;
  score: number;
  percentile: number;
  icon: string;
  color: string;
}

export interface DNAEvolution {
  date: Date;
  changes: DNAChange[];
  trigger?: string;
}

export interface DNAChange {
  trait: string;
  previousValue: number;
  newValue: number;
  significance: 'minor' | 'moderate' | 'major';
}

export interface DNAComparison {
  userId: string;
  username: string;
  compatibility: number;
  sharedTraits: string[];
  differentTraits: string[];
  recommendedSharedPlaylists: string[];
}

export interface DNAInsight {
  id: string;
  type: 'discovery' | 'trend' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
  createdAt: Date;
}
