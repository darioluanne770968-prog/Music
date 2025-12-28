// 健康与生活功能类型定义

// 睡眠模式
export interface SleepMode {
  enabled: boolean;
  settings: SleepSettings;
  schedule?: SleepSchedule;
  statistics: SleepStatistics;
}

export interface SleepSettings {
  fadeOutDuration: number; // 分钟
  stopAfter: number; // 分钟, 0 = 不自动停止
  maxVolume: number; // 0-100
  minVolume: number; // 0-100
  mixWithSoundscape: boolean;
  soundscapeId?: string;
  soundscapeVolume: number;
  blockNotifications: boolean;
  dimScreen: boolean;
  nightLight: boolean; // 减少蓝光
}

export interface SleepSchedule {
  enabled: boolean;
  bedtime: string; // HH:MM
  wakeTime: string; // HH:MM
  days: number[]; // 0-6, Sunday = 0
  bedtimeReminder: number; // 提前多少分钟提醒
  smartAlarm: boolean; // 智能闹钟
  alarmPlaylist?: string;
}

export interface SleepStatistics {
  averageSleepTime: number;
  averageListeningTime: number;
  mostPlayedSleepSongs: string[];
  sleepQualityTrend: { date: string; quality: number }[];
}

// 音景/白噪音
export interface Soundscape {
  id: string;
  name: string;
  description: string;
  category: SoundscapeCategory;
  thumbnailUrl: string;
  layers: SoundLayer[];
  duration: number; // 0 = 无限循环
  isPremium: boolean;
  downloads: number;
  rating: number;
}

export type SoundscapeCategory =
  | 'nature' | 'urban' | 'weather' | 'ambient' | 'binaural'
  | 'meditation' | 'focus' | 'sleep' | 'asmr' | 'fantasy';

export interface SoundLayer {
  id: string;
  name: string;
  audioUrl: string;
  icon: string;
  volume: number;
  pan: number; // -1 to 1
  enabled: boolean;
  isLooping: boolean;
}

export interface CustomSoundscape {
  id: string;
  userId: string;
  name: string;
  layers: SoundLayer[];
  createdAt: Date;
}

// 冥想/专注模式
export interface MeditationSession {
  id: string;
  type: MeditationType;
  title: string;
  description: string;
  duration: number; // 分钟
  instructor?: Instructor;
  audioUrl: string;
  backgroundMusic?: string;
  guidedSteps?: MeditationStep[];
  category: MeditationCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  thumbnailUrl: string;
}

export type MeditationType =
  | 'guided' | 'unguided' | 'breathing' | 'body_scan'
  | 'visualization' | 'mantra' | 'walking' | 'sleep';

export type MeditationCategory =
  | 'stress' | 'anxiety' | 'sleep' | 'focus' | 'energy'
  | 'gratitude' | 'self_love' | 'relationships' | 'work';

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  sessionsCount: number;
}

export interface MeditationStep {
  timestamp: number;
  instruction: string;
  duration: number;
  breathingPattern?: BreathingPattern;
}

export interface BreathingPattern {
  inhale: number; // 秒
  hold: number;
  exhale: number;
  holdAfterExhale: number;
  cycles: number;
}

// 专注模式
export interface FocusMode {
  enabled: boolean;
  settings: FocusSettings;
  currentSession?: FocusSession;
  statistics: FocusStatistics;
}

export interface FocusSettings {
  technique: FocusTechnique;
  workDuration: number; // 分钟
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  playlistId?: string;
  soundscapeId?: string;
  blockNotifications: boolean;
  showTimer: boolean;
  tickingSound: boolean;
}

export type FocusTechnique = 'pomodoro' | 'custom' | 'flow' | 'ultradian';

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  technique: FocusTechnique;
  workPeriods: number;
  totalFocusTime: number;
  totalBreakTime: number;
  songsPlayed: string[];
  interruptions: number;
}

export interface FocusStatistics {
  totalFocusTime: number;
  totalSessions: number;
  averageSessionLength: number;
  longestSession: number;
  currentStreak: number;
  bestStreak: number;
  focusByDay: { date: string; minutes: number }[];
  productiveHours: number[];
}

// 运动音乐
export interface WorkoutMode {
  enabled: boolean;
  activityType: ActivityType;
  settings: WorkoutSettings;
  currentSession?: WorkoutSession;
  statistics: WorkoutStatistics;
}

export type ActivityType =
  | 'running' | 'walking' | 'cycling' | 'gym' | 'yoga'
  | 'hiit' | 'dance' | 'swimming' | 'hiking' | 'meditation';

export interface WorkoutSettings {
  bpmMatching: boolean;
  targetBPM?: number;
  bpmRange: { min: number; max: number };
  intensityCurve: IntensityCurve;
  warmupDuration: number;
  cooldownDuration: number;
  playlistId?: string;
  voiceCoach: boolean;
  announceStats: boolean;
  heartRateSync: boolean;
}

export type IntensityCurve = 'constant' | 'ascending' | 'descending' | 'interval' | 'pyramid' | 'custom';

export interface WorkoutSession {
  id: string;
  activityType: ActivityType;
  startTime: Date;
  endTime?: Date;
  duration: number;
  distance?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgBPM: number;
  songsPlayed: WorkoutSong[];
  zones: HeartRateZone[];
}

export interface WorkoutSong {
  songId: string;
  bpm: number;
  playedAt: Date;
  heartRateAvg?: number;
  stepsPerMinute?: number;
}

export interface HeartRateZone {
  zone: number; // 1-5
  name: string;
  minBPM: number;
  maxBPM: number;
  timeInZone: number;
  percentage: number;
}

export interface WorkoutStatistics {
  totalWorkouts: number;
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  favoriteActivities: { activity: ActivityType; count: number }[];
  favoriteSongs: string[];
  averageBPM: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

// 听力保护
export interface HearingProtection {
  enabled: boolean;
  settings: HearingSettings;
  statistics: HearingStatistics;
  warnings: HearingWarning[];
}

export interface HearingSettings {
  maxVolume: number; // 0-100
  loudnessLimit: number; // dB
  exposureLimit: number; // 分钟/天
  autoReduceVolume: boolean;
  reduceAt: number; // dB threshold
  restReminder: boolean;
  restInterval: number; // 分钟
  restDuration: number; // 分钟
  showRealTimeDB: boolean;
  safeListeningMode: boolean;
}

export interface HearingStatistics {
  dailyExposure: number; // 分钟
  weeklyExposure: number;
  averageVolume: number;
  peakVolume: number;
  safeListeningPercentage: number;
  exposureByDay: { date: string; minutes: number; avgDB: number }[];
}

export interface HearingWarning {
  id: string;
  type: 'volume' | 'exposure' | 'rest';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

// 心率同步
export interface HeartRateSync {
  enabled: boolean;
  deviceId?: string;
  deviceName?: string;
  currentBPM?: number;
  settings: HeartRateSyncSettings;
  history: HeartRateReading[];
}

export interface HeartRateSyncSettings {
  syncMode: 'match' | 'calm' | 'energize' | 'custom';
  targetZone?: number; // 1-5
  bpmTolerance: number;
  transitionSpeed: 'slow' | 'medium' | 'fast';
  prioritizeGenre: boolean;
  allowedGenres?: string[];
}

export interface HeartRateReading {
  timestamp: Date;
  bpm: number;
  songId?: string;
  songBPM?: number;
}

// 健康数据整合
export interface HealthIntegration {
  connectedApps: HealthApp[];
  permissions: HealthPermission[];
  syncSettings: HealthSyncSettings;
}

export interface HealthApp {
  id: string;
  name: string;
  icon: string;
  platform: 'apple_health' | 'google_fit' | 'samsung_health' | 'fitbit' | 'garmin';
  isConnected: boolean;
  lastSync?: Date;
}

export interface HealthPermission {
  type: 'heart_rate' | 'steps' | 'sleep' | 'workout' | 'mindfulness';
  read: boolean;
  write: boolean;
}

export interface HealthSyncSettings {
  autoSync: boolean;
  syncInterval: number; // 分钟
  shareListeningData: boolean;
  shareMoodData: boolean;
}

// 情绪追踪
export interface MoodTracking {
  enabled: boolean;
  entries: MoodEntry[];
  insights: MoodInsight[];
  recommendations: MoodRecommendation[];
}

export interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: MoodType;
  energy: number; // 1-5
  notes?: string;
  triggers?: string[];
  songId?: string;
  activity?: string;
}

export type MoodType =
  | 'great' | 'good' | 'okay' | 'bad' | 'terrible'
  | 'happy' | 'sad' | 'anxious' | 'calm' | 'energetic'
  | 'tired' | 'stressed' | 'focused' | 'creative' | 'romantic';

export interface MoodInsight {
  type: 'pattern' | 'correlation' | 'suggestion';
  title: string;
  description: string;
  data?: any;
}

export interface MoodRecommendation {
  type: 'playlist' | 'activity' | 'meditation' | 'soundscape';
  title: string;
  description: string;
  resourceId: string;
  confidence: number;
}
