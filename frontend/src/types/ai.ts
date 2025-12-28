// AI 功能相关类型定义

// AI 作曲助手
export interface AIComposition {
  id: string;
  userId: string;
  title: string;
  description?: string;
  inputType: 'humming' | 'melody' | 'lyrics' | 'style';
  inputData: string; // 音频URL或文本
  generatedTrack?: GeneratedTrack;
  style: MusicStyle;
  mood: MusicMood;
  tempo: number; // BPM
  key: string; // 调式
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedTrack {
  id: string;
  audioUrl: string;
  waveformData: number[];
  stems: AudioStem[];
  midi?: string;
  sheet?: string; // 乐谱
}

export interface AudioStem {
  type: 'vocals' | 'drums' | 'bass' | 'melody' | 'harmony' | 'other';
  audioUrl: string;
  volume: number;
  muted: boolean;
}

export type MusicStyle =
  | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic'
  | 'hiphop' | 'rnb' | 'country' | 'folk' | 'blues'
  | 'metal' | 'punk' | 'indie' | 'soul' | 'reggae'
  | 'chinese_pop' | 'chinese_folk' | 'chinese_rock' | 'ancient_style';

export type MusicMood =
  | 'happy' | 'sad' | 'energetic' | 'calm' | 'romantic'
  | 'angry' | 'nostalgic' | 'hopeful' | 'melancholic' | 'peaceful';

// AI 翻唱生成
export interface AICover {
  id: string;
  originalSongId: string;
  userId: string;
  voiceModel: VoiceModel;
  style?: CoverStyle;
  pitch: number; // -12 to +12 半音
  generatedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface VoiceModel {
  id: string;
  name: string;
  artistName?: string;
  avatarUrl: string;
  voiceType: 'male' | 'female' | 'neutral';
  language: string[];
  samples: string[];
  isOfficial: boolean;
  usageCount: number;
}

export type CoverStyle =
  | 'acoustic' | 'rock' | 'jazz' | 'electronic' | 'orchestral'
  | 'a_cappella' | 'lofi' | 'metal' | 'reggae';

// AI DJ 混音
export interface AIDJSession {
  id: string;
  userId: string;
  name: string;
  tracks: DJTrack[];
  transitions: DJTransition[];
  currentIndex: number;
  isPlaying: boolean;
  bpm: number;
  settings: DJSettings;
  createdAt: Date;
}

export interface DJTrack {
  songId: string;
  song: {
    id: string;
    name: string;
    artist: string;
    coverUrl: string;
    duration: number;
  };
  startTime: number;
  endTime: number;
  bpm: number;
  key: string;
  energy: number; // 0-1
  cuePoints: CuePoint[];
}

export interface CuePoint {
  time: number;
  label: string;
  color: string;
}

export interface DJTransition {
  type: 'crossfade' | 'cut' | 'echo' | 'spinback' | 'filter' | 'beatmatch';
  duration: number;
  fromTrackIndex: number;
  toTrackIndex: number;
  settings: Record<string, number>;
}

export interface DJSettings {
  autoBPMMatch: boolean;
  autoKeyMatch: boolean;
  autoTransition: boolean;
  transitionDuration: number;
  energyFlow: 'ascending' | 'descending' | 'wave' | 'random';
  crossfaderCurve: 'linear' | 'exponential' | 'constant';
}

// 情绪识别
export interface EmotionDetection {
  id: string;
  userId: string;
  detectionType: 'face' | 'voice' | 'text' | 'activity';
  emotion: DetectedEmotion;
  confidence: number;
  timestamp: Date;
  recommendedPlaylist?: string;
}

export interface DetectedEmotion {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number; // 0-1
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0-1 (calm to excited)
}

export type EmotionType =
  | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted'
  | 'surprised' | 'neutral' | 'excited' | 'calm' | 'anxious'
  | 'nostalgic' | 'romantic' | 'melancholic' | 'energetic';

// AI 歌词翻译
export interface AILyricsTranslation {
  id: string;
  songId: string;
  originalLanguage: string;
  targetLanguage: string;
  originalLyrics: LyricLine[];
  translatedLyrics: TranslatedLyricLine[];
  preserveRhyme: boolean;
  translationStyle: 'literal' | 'poetic' | 'singable';
  status: 'pending' | 'completed' | 'failed';
}

export interface LyricLine {
  time: number;
  text: string;
  pronunciation?: string; // 罗马音/拼音
}

export interface TranslatedLyricLine extends LyricLine {
  originalText: string;
  alternatives?: string[];
  notes?: string;
}

// AI 音乐故事
export interface AIMusicStory {
  id: string;
  userId: string;
  type: StoryType;
  period: StoryPeriod;
  title: string;
  coverImage: string;
  sections: StorySection[];
  statistics: MusicStatistics;
  insights: MusicInsight[];
  shareUrl?: string;
  createdAt: Date;
}

export type StoryType = 'yearly' | 'monthly' | 'weekly' | 'mood' | 'genre' | 'artist' | 'memory';

export interface StoryPeriod {
  start: Date;
  end: Date;
}

export interface StorySection {
  type: 'intro' | 'top_songs' | 'top_artists' | 'mood_analysis' | 'listening_habits' | 'discovery' | 'memories' | 'outro';
  title: string;
  content: string;
  data: any;
  visualType: 'text' | 'chart' | 'carousel' | 'map' | 'timeline' | 'collage';
}

export interface MusicStatistics {
  totalListeningTime: number; // 分钟
  totalSongs: number;
  totalArtists: number;
  totalGenres: number;
  topGenres: { genre: string; count: number; percentage: number }[];
  topArtists: { artistId: string; name: string; count: number; image: string }[];
  topSongs: { songId: string; name: string; artist: string; count: number; image: string }[];
  listeningByHour: number[]; // 24 hours
  listeningByDay: number[]; // 7 days
  moodDistribution: { mood: string; percentage: number }[];
  newDiscoveries: number;
  repeatListens: number;
}

export interface MusicInsight {
  type: 'personality' | 'habit' | 'trend' | 'recommendation';
  title: string;
  description: string;
  icon: string;
}

// AI 推荐引擎
export interface AIRecommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  reason: string;
  confidence: number;
  items: RecommendedItem[];
  feedback?: 'liked' | 'disliked' | 'neutral';
  createdAt: Date;
}

export type RecommendationType =
  | 'for_you' | 'new_release' | 'similar_to' | 'mood_based'
  | 'activity_based' | 'time_based' | 'social' | 'rediscover';

export interface RecommendedItem {
  type: 'song' | 'album' | 'artist' | 'playlist';
  id: string;
  score: number;
  reasons: string[];
}
