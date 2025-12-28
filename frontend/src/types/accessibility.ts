// 无障碍功能类型定义

// 手语MV
export interface SignLanguageMV {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  signLanguageType: SignLanguageType;
  performer: SignPerformer;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  syncData: SignSyncData;
  quality: VideoQuality;
  verified: boolean;
  views: number;
  likes: number;
  createdAt: Date;
}

export type SignLanguageType =
  | 'asl' // American Sign Language
  | 'bsl' // British Sign Language
  | 'csl' // Chinese Sign Language
  | 'jsl' // Japanese Sign Language
  | 'auslan' // Australian Sign Language
  | 'isl' // International Sign Language
  | 'other';

export interface SignPerformer {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  certifications: string[];
  languages: SignLanguageType[];
  videosCount: number;
  followers: number;
  verified: boolean;
}

export interface SignSyncData {
  segments: SignSegment[];
  accuracy: number;
  syncMethod: 'manual' | 'ai_assisted' | 'ai_generated';
}

export interface SignSegment {
  startTime: number;
  endTime: number;
  lyrics: string;
  signDescription: string;
  handshapeCode?: string;
}

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '4k';

// 触觉反馈
export interface HapticFeedback {
  id: string;
  userId: string;
  enabled: boolean;
  device: HapticDevice;
  mode: HapticMode;
  intensity: number;
  patterns: HapticPattern[];
  customizations: HapticCustomization;
}

export interface HapticDevice {
  id: string;
  type: 'phone' | 'watch' | 'controller' | 'vest' | 'wristband' | 'custom';
  name: string;
  connected: boolean;
  batteryLevel: number;
  capabilities: HapticCapability[];
  actuators: number;
}

export type HapticCapability =
  | 'vibration'
  | 'force_feedback'
  | 'spatial'
  | 'thermal'
  | 'pressure';

export interface HapticMode {
  id: string;
  name: string;
  type: 'rhythm' | 'melody' | 'bass' | 'full' | 'lyrics' | 'custom';
  description: string;
  previewUrl?: string;
}

export interface HapticPattern {
  id: string;
  name: string;
  type: 'beat' | 'melody' | 'chord' | 'effect';
  waveform: HapticWaveform;
  duration: number;
  intensity: number;
  frequency: number;
}

export interface HapticWaveform {
  type: 'sine' | 'square' | 'triangle' | 'custom';
  points?: WaveformPoint[];
}

export interface WaveformPoint {
  time: number;
  amplitude: number;
}

export interface HapticCustomization {
  beatEmphasis: number;
  bassResponse: number;
  melodyTracking: boolean;
  vocalHighlight: boolean;
  transitionSmoothing: number;
  maxIntensity: number;
  minIntensity: number;
}

// 语音控制
export interface VoiceControl {
  id: string;
  userId: string;
  enabled: boolean;
  language: string;
  wakeWord: string;
  customWakeWords: string[];
  commands: VoiceCommand[];
  customCommands: CustomVoiceCommand[];
  feedback: VoiceFeedback;
  privacy: VoicePrivacy;
  history: VoiceCommandHistory[];
}

export interface VoiceCommand {
  id: string;
  category: VoiceCommandCategory;
  phrases: string[];
  action: string;
  parameters?: VoiceParameter[];
  enabled: boolean;
}

export type VoiceCommandCategory =
  | 'playback'
  | 'navigation'
  | 'search'
  | 'playlist'
  | 'settings'
  | 'social'
  | 'accessibility';

export interface VoiceParameter {
  name: string;
  type: 'song' | 'artist' | 'playlist' | 'genre' | 'number' | 'time' | 'boolean';
  required: boolean;
  examples: string[];
}

export interface CustomVoiceCommand {
  id: string;
  name: string;
  phrases: string[];
  action: VoiceAction;
  createdAt: Date;
}

export interface VoiceAction {
  type: 'play' | 'navigate' | 'control' | 'macro';
  target?: string;
  parameters?: Record<string, any>;
  sequence?: VoiceAction[];
}

export interface VoiceFeedback {
  enabled: boolean;
  type: 'voice' | 'sound' | 'haptic' | 'visual';
  volume: number;
  voice: VoiceFeedbackVoice;
  confirmActions: boolean;
  readSongInfo: boolean;
}

export interface VoiceFeedbackVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  speed: number;
  pitch: number;
}

export interface VoicePrivacy {
  saveHistory: boolean;
  historyRetention: number; // days
  sendToCloud: boolean;
  deleteOnRequest: boolean;
}

export interface VoiceCommandHistory {
  id: string;
  timestamp: Date;
  transcript: string;
  command: string;
  success: boolean;
  executionTime: number;
}

// 盲人模式
export interface BlindMode {
  id: string;
  userId: string;
  enabled: boolean;
  screenReader: ScreenReaderSettings;
  navigation: BlindNavigation;
  audioDescriptions: AudioDescriptionSettings;
  brailleDisplay?: BrailleDisplaySettings;
  gestures: GestureSettings;
  shortcuts: KeyboardShortcuts;
}

export interface ScreenReaderSettings {
  enabled: boolean;
  engine: 'built_in' | 'voiceover' | 'talkback' | 'nvda' | 'jaws';
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  punctuation: 'none' | 'some' | 'all';
  verbosity: 'brief' | 'normal' | 'verbose';
  hints: boolean;
  announceNotifications: boolean;
  readAlbumArt: boolean;
  describeLyrics: boolean;
}

export interface BlindNavigation {
  mode: 'list' | 'grid' | 'tree';
  audioBeacons: boolean;
  spatialAudio: boolean;
  hapticLandmarks: boolean;
  skipSilentAreas: boolean;
  focusIndicator: FocusIndicator;
}

export interface FocusIndicator {
  type: 'sound' | 'haptic' | 'both';
  sound?: string;
  hapticPattern?: string;
}

export interface AudioDescriptionSettings {
  enabled: boolean;
  describeAlbumArt: boolean;
  describeArtistPhotos: boolean;
  describeVisualizers: boolean;
  describeUI: boolean;
  autoDescribe: boolean;
  descriptorVoice: string;
}

export interface BrailleDisplaySettings {
  enabled: boolean;
  device: string;
  cells: number;
  showLyrics: boolean;
  showMetadata: boolean;
  refreshRate: number;
  contractedBraille: boolean;
  eightDot: boolean;
}

export interface GestureSettings {
  swipeLeft: string;
  swipeRight: string;
  swipeUp: string;
  swipeDown: string;
  doubleTap: string;
  tripleTap: string;
  twoFingerTap: string;
  twoFingerSwipe: string;
  threeFingerTap: string;
  longPress: string;
  customGestures: CustomGesture[];
}

export interface CustomGesture {
  id: string;
  name: string;
  pattern: string;
  action: string;
}

export interface KeyboardShortcuts {
  enabled: boolean;
  preset: 'default' | 'screen_reader' | 'custom';
  shortcuts: Shortcut[];
}

export interface Shortcut {
  key: string;
  modifiers: string[];
  action: string;
  description: string;
}

// 认知辅助
export interface CognitiveAssist {
  id: string;
  userId: string;
  enabled: boolean;
  simplifiedUI: SimplifiedUI;
  readingAssist: ReadingAssist;
  memoryAid: MemoryAid;
  focusAssist: CognitiveFocusAssist;
  routines: Routine[];
}

export interface SimplifiedUI {
  enabled: boolean;
  reducedOptions: boolean;
  largerButtons: boolean;
  clearLabels: boolean;
  iconOnly: boolean;
  colorCoding: boolean;
  consistentLayout: boolean;
  hideAdvancedFeatures: boolean;
}

export interface ReadingAssist {
  enabled: boolean;
  fontSize: number;
  fontFamily: string;
  lineSpacing: number;
  letterSpacing: number;
  highlightCurrentWord: boolean;
  dyslexiaFont: boolean;
  contrastMode: 'normal' | 'high' | 'inverted';
  textToSpeech: boolean;
}

export interface MemoryAid {
  enabled: boolean;
  recentlyPlayed: boolean;
  favorites: boolean;
  routinePlaylists: boolean;
  visualCues: boolean;
  audioReminders: boolean;
  contextualSuggestions: boolean;
}

export interface CognitiveFocusAssist {
  enabled: boolean;
  reducedAnimations: boolean;
  reducedNotifications: boolean;
  minimizeDistractions: boolean;
  autoplayPrevention: boolean;
  breakReminders: boolean;
  breakInterval: number;
}

export interface Routine {
  id: string;
  name: string;
  time: string;
  days: number[];
  playlist: string;
  reminder: boolean;
  reminderTime: number; // minutes before
}

// 色盲辅助
export interface ColorBlindAssist {
  id: string;
  userId: string;
  type: ColorBlindType;
  enabled: boolean;
  colorPalette: ColorPalette;
  patternOverlay: boolean;
  labelColors: boolean;
  contrastEnhancement: boolean;
  customColors: CustomColorMap;
}

export type ColorBlindType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly';

export interface ColorPalette {
  id: string;
  name: string;
  type: ColorBlindType;
  colors: PaletteColor[];
}

export interface PaletteColor {
  name: string;
  original: string;
  adjusted: string;
  pattern?: string;
}

export interface CustomColorMap {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  text: string;
}

// 听力辅助
export interface HearingAssist {
  id: string;
  userId: string;
  enabled: boolean;
  hearingProfile: HearingProfile;
  amplification: AmplificationSettings;
  visualAlerts: VisualAlertSettings;
  lyricsSettings: LyricsAccessibilitySettings;
  captions: CaptionSettings;
}

export interface HearingProfile {
  leftEar: FrequencyResponse;
  rightEar: FrequencyResponse;
  profileSource: 'audiogram' | 'self_test' | 'estimated';
  lastUpdated: Date;
}

export interface FrequencyResponse {
  hz250: number;
  hz500: number;
  hz1000: number;
  hz2000: number;
  hz4000: number;
  hz8000: number;
}

export interface AmplificationSettings {
  enabled: boolean;
  mode: 'balanced' | 'speech' | 'music' | 'custom';
  leftGain: number;
  rightGain: number;
  frequencyBoosts: FrequencyBoost[];
  compression: boolean;
  compressionRatio: number;
}

export interface FrequencyBoost {
  frequency: number;
  gain: number;
  bandwidth: number;
}

export interface VisualAlertSettings {
  enabled: boolean;
  flashScreen: boolean;
  ledNotification: boolean;
  vibration: boolean;
  visualBeat: boolean;
  beatIntensity: number;
  colorPulse: boolean;
  pulseColor: string;
}

export interface LyricsAccessibilitySettings {
  alwaysShow: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  contrast: 'normal' | 'high';
  backgroundColor: string;
  syncHighlight: boolean;
  romanization: boolean;
  signLanguageLink: boolean;
}

export interface CaptionSettings {
  enabled: boolean;
  style: CaptionStyle;
  position: 'top' | 'bottom' | 'custom';
  autoGenerate: boolean;
  showSpeaker: boolean;
  showSoundEffects: boolean;
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  opacity: number;
  outline: boolean;
  outlineColor: string;
}

// 运动辅助
export interface MotorAssist {
  id: string;
  userId: string;
  enabled: boolean;
  switchControl: SwitchControlSettings;
  dwellControl: DwellControlSettings;
  voiceNav: VoiceNavigationSettings;
  eyeTracking: EyeTrackingSettings;
  customInputs: CustomInputDevice[];
}

export interface SwitchControlSettings {
  enabled: boolean;
  switches: SwitchDevice[];
  scanMode: 'auto' | 'manual' | 'step';
  scanSpeed: number;
  pauseOnFirst: boolean;
  loops: number;
  autoSelect: boolean;
  autoSelectDelay: number;
}

export interface SwitchDevice {
  id: string;
  name: string;
  type: 'keyboard' | 'mouse' | 'external' | 'screen';
  key?: string;
  action: string;
}

export interface DwellControlSettings {
  enabled: boolean;
  dwellTime: number;
  tolerance: number;
  showProgress: boolean;
  progressStyle: 'ring' | 'fill' | 'shrink';
  actionOnDwell: 'click' | 'menu';
}

export interface VoiceNavigationSettings {
  enabled: boolean;
  language: string;
  continuous: boolean;
  dictationMode: boolean;
  spellingMode: boolean;
  numberMode: boolean;
}

export interface EyeTrackingSettings {
  enabled: boolean;
  device: string;
  calibrated: boolean;
  sensitivity: number;
  dwellEnabled: boolean;
  dwellTime: number;
  smoothing: number;
}

export interface CustomInputDevice {
  id: string;
  name: string;
  type: string;
  mapping: InputMapping[];
  connected: boolean;
}

export interface InputMapping {
  input: string;
  action: string;
  holdAction?: string;
  doubleAction?: string;
}
