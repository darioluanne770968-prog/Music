// 音乐创作工作站类型定义

// 在线DAW (数字音频工作站)
export interface OnlineDAW {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  tempo: number;
  timeSignature: TimeSignature;
  key: MusicalKey;
  tracks: DAWTrack[];
  masterTrack: MasterTrack;
  arrangement: Arrangement;
  mixer: Mixer;
  plugins: PluginInstance[];
  automation: AutomationLane[];
  markers: Marker[];
  loopRegion?: LoopRegion;
  playhead: number;
  isPlaying: boolean;
  isRecording: boolean;
  collaborators: Collaborator[];
  history: EditHistory[];
  savedAt: Date;
  createdAt: Date;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface MusicalKey {
  root: string; // C, C#, D, etc.
  mode: 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';
}

export interface DAWTrack {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  frozen: boolean;
  height: number;
  input: AudioInput;
  output: AudioOutput;
  clips: Clip[];
  effects: PluginInstance[];
  sends: Send[];
  automation: AutomationLane[];
}

export type TrackType = 'audio' | 'midi' | 'instrument' | 'aux' | 'bus' | 'master';

export interface AudioInput {
  type: 'none' | 'microphone' | 'line' | 'virtual';
  deviceId?: string;
  channel: number | 'stereo';
  monitoring: 'off' | 'auto' | 'on';
}

export interface AudioOutput {
  destination: string; // track id or 'master'
  channel: number | 'stereo';
}

export interface Clip {
  id: string;
  trackId: string;
  type: 'audio' | 'midi';
  name: string;
  color: string;
  startTime: number; // beats
  duration: number; // beats
  offset: number; // internal offset
  gain: number;
  fadeIn: number;
  fadeOut: number;
  warp: WarpSettings;
  audioData?: AudioClipData;
  midiData?: MIDIClipData;
  locked: boolean;
}

export interface WarpSettings {
  enabled: boolean;
  mode: 'beats' | 'texture' | 'repitch' | 'complex';
  warpMarkers: WarpMarker[];
}

export interface WarpMarker {
  beatPosition: number;
  samplePosition: number;
}

export interface AudioClipData {
  fileUrl: string;
  sampleRate: number;
  channels: number;
  duration: number; // seconds
  waveformData: number[];
  bpm?: number;
  key?: string;
}

export interface MIDIClipData {
  notes: MIDINote[];
  controlChanges: ControlChange[];
  pitchBend: PitchBendPoint[];
}

export interface MIDINote {
  id: string;
  pitch: number; // 0-127
  velocity: number; // 0-127
  startTime: number; // beats
  duration: number; // beats
  channel: number;
}

export interface ControlChange {
  time: number;
  controller: number;
  value: number;
  channel: number;
}

export interface PitchBendPoint {
  time: number;
  value: number; // -8192 to 8191
}

export interface MasterTrack {
  volume: number;
  limiter: LimiterSettings;
  effects: PluginInstance[];
  metering: MeteringData;
}

export interface LimiterSettings {
  enabled: boolean;
  ceiling: number;
  release: number;
  lookahead: boolean;
}

export interface MeteringData {
  peakL: number;
  peakR: number;
  rmsL: number;
  rmsR: number;
  lufs: number;
  lra: number;
}

export interface Arrangement {
  sections: ArrangementSection[];
  tempo: TempoChange[];
  timeSignatures: TimeSignatureChange[];
  keyChanges: KeyChange[];
}

export interface ArrangementSection {
  id: string;
  name: string;
  color: string;
  startBeat: number;
  endBeat: number;
}

export interface TempoChange {
  beat: number;
  tempo: number;
  curve: 'instant' | 'linear' | 'ease';
}

export interface TimeSignatureChange {
  beat: number;
  numerator: number;
  denominator: number;
}

export interface KeyChange {
  beat: number;
  key: MusicalKey;
}

export interface Mixer {
  channels: MixerChannel[];
  busses: Bus[];
  sends: SendBus[];
}

export interface MixerChannel {
  trackId: string;
  faderPosition: number;
  panPosition: number;
  mute: boolean;
  solo: boolean;
  metering: MeteringData;
}

export interface Bus {
  id: string;
  name: string;
  color: string;
  inputs: string[];
  volume: number;
  pan: number;
  effects: PluginInstance[];
}

export interface SendBus {
  id: string;
  name: string;
  type: 'reverb' | 'delay' | 'chorus' | 'custom';
  returnLevel: number;
  effects: PluginInstance[];
}

export interface Send {
  busId: string;
  level: number;
  preFader: boolean;
}

// 插件系统
export interface PluginInstance {
  id: string;
  pluginId: string;
  name: string;
  type: PluginType;
  category: PluginCategory;
  bypassed: boolean;
  parameters: PluginParameter[];
  presets: PluginPreset[];
  currentPreset?: string;
  uiState: PluginUIState;
}

export type PluginType = 'instrument' | 'effect' | 'analyzer' | 'utility';
export type PluginCategory =
  | 'eq'
  | 'compressor'
  | 'reverb'
  | 'delay'
  | 'distortion'
  | 'modulation'
  | 'filter'
  | 'synth'
  | 'sampler'
  | 'drum_machine'
  | 'utility'
  | 'analyzer';

export interface PluginParameter {
  id: string;
  name: string;
  value: number;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  unit: string;
  automatable: boolean;
}

export interface PluginPreset {
  id: string;
  name: string;
  factory: boolean;
  parameters: Record<string, number>;
}

export interface PluginUIState {
  width: number;
  height: number;
  expanded: boolean;
  pinned: boolean;
}

// 自动化
export interface AutomationLane {
  id: string;
  targetId: string; // track, plugin, or parameter id
  targetParameter: string;
  mode: 'read' | 'write' | 'touch' | 'latch';
  points: AutomationPoint[];
  visible: boolean;
  height: number;
}

export interface AutomationPoint {
  time: number;
  value: number;
  curve: 'linear' | 'hold' | 'ease_in' | 'ease_out' | 'ease_in_out';
}

export interface Marker {
  id: string;
  time: number;
  name: string;
  color: string;
  type: 'position' | 'loop_start' | 'loop_end' | 'punch_in' | 'punch_out';
}

export interface LoopRegion {
  start: number;
  end: number;
  enabled: boolean;
}

// 协作功能
export interface Collaborator {
  userId: string;
  username: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  color: string;
  cursor?: CursorPosition;
  selection?: Selection;
  online: boolean;
  lastActive: Date;
}

export interface CursorPosition {
  trackId: string;
  time: number;
}

export interface Selection {
  type: 'time' | 'clips' | 'notes';
  startTime?: number;
  endTime?: number;
  clipIds?: string[];
  noteIds?: string[];
}

export interface EditHistory {
  id: string;
  userId: string;
  action: EditAction;
  timestamp: Date;
  data: any;
  undone: boolean;
}

export type EditAction =
  | 'create_clip'
  | 'delete_clip'
  | 'move_clip'
  | 'resize_clip'
  | 'edit_notes'
  | 'add_track'
  | 'delete_track'
  | 'change_parameter'
  | 'add_automation'
  | 'change_tempo'
  | 'add_plugin'
  | 'remove_plugin';

// 云端音色库
export interface CloudSoundLibrary {
  id: string;
  name: string;
  categories: SoundCategory[];
  totalSounds: number;
  featured: CloudSound[];
  recent: CloudSound[];
  favorites: string[];
}

export interface SoundCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
  soundCount: number;
}

export interface Subcategory {
  id: string;
  name: string;
  soundCount: number;
}

export interface CloudSound {
  id: string;
  name: string;
  type: SoundType;
  category: string;
  subcategory: string;
  tags: string[];
  bpm?: number;
  key?: string;
  duration: number;
  fileSize: number;
  format: AudioFormat;
  previewUrl: string;
  downloadUrl: string;
  artist?: string;
  pack?: string;
  license: SoundLicense;
  downloads: number;
  likes: number;
  createdAt: Date;
}

export type SoundType = 'loop' | 'one_shot' | 'preset' | 'midi' | 'sample_pack';
export type AudioFormat = 'wav' | 'mp3' | 'aiff' | 'flac' | 'ogg';

export interface SoundLicense {
  type: 'royalty_free' | 'creative_commons' | 'exclusive' | 'subscription';
  commercial: boolean;
  attribution: boolean;
  modifications: boolean;
}

// MIDI 支持
export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output' | 'both';
  connected: boolean;
  channels: number[];
}

export interface MIDIMapping {
  id: string;
  deviceId: string;
  channel: number;
  control: number; // CC number or note
  type: 'note' | 'cc' | 'pitch_bend';
  targetType: 'parameter' | 'action';
  targetId: string;
  minValue: number;
  maxValue: number;
  curve: 'linear' | 'logarithmic' | 'exponential';
}

export interface MIDILearn {
  enabled: boolean;
  targetId?: string;
  targetType?: string;
  lastReceived?: MIDIMessage;
}

export interface MIDIMessage {
  type: 'note_on' | 'note_off' | 'cc' | 'pitch_bend' | 'program_change';
  channel: number;
  data1: number;
  data2: number;
  timestamp: number;
}

// 虚拟乐器
export interface VirtualInstrument {
  id: string;
  name: string;
  type: InstrumentType;
  category: string;
  presets: InstrumentPreset[];
  parameters: InstrumentParameter[];
  keyRange: KeyRange;
  velocityCurve: VelocityCurve;
  articulations: Articulation[];
  layers: InstrumentLayer[];
}

export type InstrumentType =
  | 'synth'
  | 'sampler'
  | 'drum_machine'
  | 'rompler'
  | 'physical_modeling';

export interface InstrumentPreset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  parameters: Record<string, number>;
  favorite: boolean;
}

export interface InstrumentParameter {
  id: string;
  name: string;
  section: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface KeyRange {
  low: number;
  high: number;
  rootNote: number;
}

export interface VelocityCurve {
  type: 'linear' | 'light' | 'heavy' | 'compressed' | 'custom';
  points?: Array<{ input: number; output: number }>;
}

export interface Articulation {
  id: string;
  name: string;
  keyswitch?: number;
  ccSwitch?: { controller: number; value: number };
}

export interface InstrumentLayer {
  id: string;
  name: string;
  velocityRange: { low: number; high: number };
  keyRange: { low: number; high: number };
  samples: Sample[];
}

export interface Sample {
  id: string;
  url: string;
  rootNote: number;
  loopStart?: number;
  loopEnd?: number;
  loopMode: 'none' | 'forward' | 'ping_pong';
}

// 项目导出
export interface ExportSettings {
  format: ExportFormat;
  sampleRate: number;
  bitDepth: number;
  channels: 'mono' | 'stereo';
  dithering: boolean;
  normalize: boolean;
  normalizeTo: number;
  includeMarkers: boolean;
  splitByMarkers: boolean;
  stemExport: boolean;
  stems: string[];
}

export type ExportFormat = 'wav' | 'mp3' | 'flac' | 'aac' | 'ogg';

export interface ExportJob {
  id: string;
  projectId: string;
  settings: ExportSettings;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
