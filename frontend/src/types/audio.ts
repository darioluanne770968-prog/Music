// 专业音频功能类型定义

// 空间音频
export interface SpatialAudio {
  enabled: boolean;
  format: SpatialFormat;
  headTracking: boolean;
  roomSize: RoomSize;
  listenerPosition: Position3D;
  sources: SpatialSource[];
}

export type SpatialFormat = 'stereo' | 'dolby_atmos' | 'sony_360' | 'binaural' | 'ambisonics';

export type RoomSize = 'small' | 'medium' | 'large' | 'hall' | 'outdoor' | 'custom';

export interface Position3D {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (down to up)
  z: number; // -1 to 1 (back to front)
}

export interface SpatialSource {
  id: string;
  type: 'vocal' | 'instrument' | 'ambient' | 'effect';
  position: Position3D;
  size: number;
  spread: number;
  volume: number;
}

// 个性化 EQ
export interface PersonalizedEQ {
  id: string;
  userId: string;
  name: string;
  type: 'hearing_test' | 'manual' | 'preset' | 'ai_generated';
  bands: EQBand[];
  preamp: number;
  isActive: boolean;
  createdAt: Date;
}

export interface EQBand {
  frequency: number; // Hz
  gain: number; // dB (-12 to +12)
  q: number; // Quality factor
  type: BandType;
}

export type BandType = 'lowshelf' | 'highshelf' | 'peaking' | 'lowpass' | 'highpass' | 'notch';

export interface HearingTest {
  id: string;
  userId: string;
  frequencies: number[];
  thresholds: { left: number[]; right: number[] };
  hearingProfile: HearingProfile;
  recommendedEQ: PersonalizedEQ;
  testedAt: Date;
}

export interface HearingProfile {
  overallSensitivity: 'normal' | 'reduced' | 'enhanced';
  leftRightBalance: number; // -1 to 1
  frequencyResponse: { frequency: number; sensitivity: number }[];
  recommendations: string[];
}

// EQ 预设
export interface EQPreset {
  id: string;
  name: string;
  description: string;
  category: EQCategory;
  bands: EQBand[];
  preamp: number;
  icon: string;
  isDefault: boolean;
}

export type EQCategory =
  | 'genre' | 'mood' | 'device' | 'environment' | 'hearing' | 'custom';

// 高解析度音频
export interface HiResAudio {
  available: boolean;
  format: HiResFormat;
  bitDepth: number;
  sampleRate: number;
  codec: AudioCodec;
  fileSize: number;
  certification?: HiResCertification;
}

export type HiResFormat = 'flac' | 'alac' | 'dsd' | 'mqa' | 'wav' | 'aiff';

export type AudioCodec =
  | 'pcm' | 'flac' | 'alac' | 'aac' | 'mp3' | 'opus' | 'vorbis' | 'dsd';

export interface HiResCertification {
  type: 'hi_res' | 'hi_res_wireless' | 'mqa' | 'dsd';
  icon: string;
  description: string;
}

export interface AudioQuality {
  id: string;
  name: string;
  bitrate: number; // kbps
  sampleRate: number; // Hz
  bitDepth: number;
  codec: AudioCodec;
  streamingSize: number; // MB per minute
  description: string;
  requiresVIP: boolean;
}

// 人声分离
export interface VocalSeparation {
  id: string;
  songId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stems: AudioStem[];
  algorithm: SeparationAlgorithm;
  quality: number; // 0-1
  processedAt?: Date;
}

export interface AudioStem {
  id: string;
  type: StemType;
  audioUrl: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number; // -1 to 1
  effects: AudioEffect[];
}

export type StemType = 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'strings' | 'other';

export type SeparationAlgorithm = 'spleeter' | 'demucs' | 'open_unmix' | 'custom';

// 音频效果
export interface AudioEffect {
  id: string;
  type: EffectType;
  enabled: boolean;
  parameters: Record<string, number>;
  preset?: string;
}

export type EffectType =
  | 'reverb' | 'delay' | 'chorus' | 'flanger' | 'phaser'
  | 'distortion' | 'compressor' | 'limiter' | 'gate'
  | 'eq' | 'filter' | 'pitch_shift' | 'time_stretch';

// 音高/速度调节
export interface PlaybackModification {
  pitchShift: number; // 半音 -12 to +12
  tempoChange: number; // 百分比 0.5 to 2.0
  preservePitch: boolean;
  preserveTempo: boolean;
  keyLock: boolean;
}

// 3D 音效引擎
export interface Audio3DEngine {
  enabled: boolean;
  mode: Audio3DMode;
  intensity: number; // 0-1
  rotation: number; // 0-360 degrees
  elevation: number; // -90 to 90 degrees
  distance: number; // 0-1
  roomSimulation: RoomSimulation;
}

export type Audio3DMode = '8d' | '16d' | '24d' | 'custom' | 'theater' | 'concert';

export interface RoomSimulation {
  type: RoomType;
  size: number;
  reflections: number;
  damping: number;
  wetDryMix: number;
}

export type RoomType =
  | 'studio' | 'room' | 'hall' | 'church' | 'arena'
  | 'outdoor' | 'cave' | 'underwater' | 'custom';

// 音频分析
export interface AudioAnalysis {
  songId: string;
  duration: number;
  bpm: number;
  key: MusicalKey;
  timeSignature: TimeSignature;
  loudness: number; // LUFS
  dynamicRange: number; // dB
  energy: number; // 0-1
  danceability: number; // 0-1
  instrumentalness: number; // 0-1
  speechiness: number; // 0-1
  acousticness: number; // 0-1
  liveness: number; // 0-1
  valence: number; // 0-1
  sections: AudioSection[];
  beats: Beat[];
  segments: AudioSegment[];
}

export interface MusicalKey {
  key: string; // C, C#, D, etc.
  mode: 'major' | 'minor';
  confidence: number;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
  confidence: number;
}

export interface AudioSection {
  start: number;
  duration: number;
  loudness: number;
  tempo: number;
  key: string;
  mode: 'major' | 'minor';
  timeSignature: TimeSignature;
  type: SectionType;
}

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'instrumental' | 'other';

export interface Beat {
  start: number;
  duration: number;
  confidence: number;
}

export interface AudioSegment {
  start: number;
  duration: number;
  loudnessStart: number;
  loudnessMax: number;
  loudnessMaxTime: number;
  pitches: number[]; // 12 values for each pitch class
  timbre: number[]; // 12 timbral coefficients
}

// 音频设备
export interface AudioDevice {
  id: string;
  name: string;
  type: DeviceType;
  isDefault: boolean;
  isConnected: boolean;
  capabilities: DeviceCapabilities;
  settings: DeviceSettings;
}

export type DeviceType =
  | 'speaker' | 'headphone' | 'earbuds' | 'soundbar'
  | 'car_audio' | 'bluetooth' | 'airplay' | 'chromecast';

export interface DeviceCapabilities {
  maxSampleRate: number;
  maxBitDepth: number;
  supportsSpatial: boolean;
  supportsHiRes: boolean;
  latency: number;
}

export interface DeviceSettings {
  volume: number;
  balance: number;
  bassBoost: number;
  virtualizer: boolean;
  loudnessEqualization: boolean;
}

// 跨设备同步
export interface CrossDeviceSync {
  enabled: boolean;
  devices: SyncedDevice[];
  primaryDevice: string;
  syncSettings: SyncSettings;
}

export interface SyncedDevice {
  id: string;
  name: string;
  type: DeviceType;
  isActive: boolean;
  latencyOffset: number;
  volume: number;
}

export interface SyncSettings {
  syncPlayback: boolean;
  syncQueue: boolean;
  syncEQ: boolean;
  syncVolume: boolean;
  handoffEnabled: boolean;
}
