// 内容扩展功能类型定义

// 播客
export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  author: PodcastAuthor;
  category: PodcastCategory;
  language: string;
  explicit: boolean;
  episodes: PodcastEpisode[];
  totalEpisodes: number;
  subscribers: number;
  rating: number;
  ratingCount: number;
  publishFrequency: string;
  website?: string;
  rssFeed?: string;
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PodcastAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  podcasts: string[];
  followers: number;
}

export type PodcastCategory =
  | 'music' | 'interview' | 'news' | 'comedy' | 'true_crime'
  | 'education' | 'technology' | 'business' | 'health' | 'sports'
  | 'culture' | 'history' | 'science' | 'storytelling' | 'society';

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: Date;
  episodeNumber?: number;
  seasonNumber?: number;
  coverUrl?: string;
  guests?: string[];
  topics: string[];
  chapters?: PodcastChapter[];
  transcript?: string;
  playCount: number;
  isPlayed: boolean;
  playProgress?: number;
  isDownloaded: boolean;
}

export interface PodcastChapter {
  title: string;
  startTime: number;
  endTime: number;
  imageUrl?: string;
  url?: string;
}

export interface PodcastSubscription {
  podcastId: string;
  userId: string;
  notifications: boolean;
  autoDownload: boolean;
  playbackSpeed: number;
  subscribedAt: Date;
}

// 有声书
export interface Audiobook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  narrator: string;
  coverUrl: string;
  description: string;
  publisher: string;
  publishedDate: Date;
  duration: number;
  chapters: AudiobookChapter[];
  language: string;
  genres: string[];
  series?: BookSeries;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  price: number;
  currency: string;
  isPurchased: boolean;
  isInLibrary: boolean;
  sampleUrl?: string;
  abridged: boolean;
}

export interface AudiobookChapter {
  id: string;
  title: string;
  duration: number;
  startTime: number;
  audioUrl: string;
}

export interface BookSeries {
  id: string;
  name: string;
  bookNumber: number;
  totalBooks: number;
}

export interface AudiobookProgress {
  audiobookId: string;
  oderId: string;
  currentChapter: number;
  currentTime: number;
  percentComplete: number;
  lastPlayedAt: Date;
  bookmarks: AudiobookBookmark[];
  notes: AudiobookNote[];
  playbackSpeed: number;
}

export interface AudiobookBookmark {
  id: string;
  chapterId: string;
  time: number;
  label?: string;
  createdAt: Date;
}

export interface AudiobookNote {
  id: string;
  chapterId: string;
  time: number;
  text: string;
  highlightColor?: string;
  createdAt: Date;
}

// 音乐纪录片
export interface MusicDocumentary {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trailerUrl?: string;
  videoUrl: string;
  duration: number;
  director: string;
  producers: string[];
  featuredArtists: string[];
  releaseDate: Date;
  genres: string[];
  language: string;
  subtitles: string[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  isPremium: boolean;
  chapters: DocumentaryChapter[];
  relatedContent: RelatedContent[];
}

export interface DocumentaryChapter {
  title: string;
  startTime: number;
  duration: number;
  thumbnailUrl: string;
}

export interface RelatedContent {
  type: 'song' | 'album' | 'artist' | 'documentary' | 'article';
  id: string;
  title: string;
  thumbnailUrl: string;
}

// 演唱会直播
export interface ConcertStream {
  id: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  streamUrl?: string;
  chatEnabled: boolean;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'upcoming' | 'live' | 'ended';
  viewerCount: number;
  peakViewers: number;
  venue?: string;
  ticketRequired: boolean;
  ticketPrice?: number;
  replayAvailable: boolean;
  replayUrl?: string;
  replayExpiresAt?: Date;
  setlist?: SetlistItem[];
  interactions: StreamInteraction[];
}

export interface SetlistItem {
  order: number;
  songId: string;
  songTitle: string;
  startTime?: number;
  notes?: string;
}

export interface StreamInteraction {
  type: 'like' | 'heart' | 'fire' | 'clap' | 'lightstick';
  count: number;
  recentUsers: string[];
}

export interface ConcertTicket {
  id: string;
  oderId: string;
  concertId: string;
  type: 'general' | 'vip' | 'backstage';
  price: number;
  currency: string;
  purchasedAt: Date;
  qrCode: string;
  isUsed: boolean;
}

// 音乐课程
export interface MusicCourse {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  instructor: CourseInstructor;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration: number;
  lessonsCount: number;
  lessons: CourseLesson[];
  skills: string[];
  requirements: string[];
  language: string;
  rating: number;
  ratingCount: number;
  enrolledCount: number;
  price: number;
  currency: string;
  isPurchased: boolean;
  progress?: CourseProgress;
  certificate?: CourseCertificate;
}

export interface CourseInstructor {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  credentials: string[];
  coursesCount: number;
  studentsCount: number;
  rating: number;
}

export type CourseCategory =
  | 'guitar' | 'piano' | 'drums' | 'bass' | 'vocals'
  | 'music_theory' | 'production' | 'mixing' | 'songwriting'
  | 'dj' | 'violin' | 'ukulele' | 'harmonica' | 'flute';

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  resources: LessonResource[];
  quiz?: LessonQuiz;
  assignment?: LessonAssignment;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface LessonResource {
  type: 'pdf' | 'audio' | 'sheet_music' | 'backing_track' | 'midi';
  title: string;
  url: string;
  size: number;
}

export interface LessonQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  attempts: number;
  bestScore?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'audio_identify';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
}

export interface LessonAssignment {
  id: string;
  title: string;
  description: string;
  type: 'recording' | 'written' | 'practice';
  dueDate?: Date;
  submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  fileUrl?: string;
  text?: string;
  submittedAt: Date;
  feedback?: string;
  grade?: number;
}

export interface CourseProgress {
  lessonCompleted: number;
  totalLessons: number;
  percentComplete: number;
  quizzesPassed: number;
  totalQuizzes: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastAccessedAt: Date;
  estimatedTimeRemaining: number;
}

export interface CourseCertificate {
  id: string;
  courseId: string;
  oderId: string;
  issueDate: Date;
  certificateUrl: string;
  verificationCode: string;
}

// 电台
export interface RadioStation {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  type: RadioType;
  genre?: string;
  mood?: string;
  artistId?: string;
  tags: string[];
  currentTrack?: RadioTrack;
  upNext: RadioTrack[];
  listeners: number;
  isLive: boolean;
  schedule?: RadioSchedule[];
}

export type RadioType =
  | 'genre' | 'mood' | 'decade' | 'artist' | 'personalized'
  | 'live_dj' | 'talk' | 'news' | 'sports';

export interface RadioTrack {
  songId: string;
  title: string;
  artist: string;
  coverUrl: string;
  startedAt?: Date;
  duration: number;
}

export interface RadioSchedule {
  id: string;
  title: string;
  host?: string;
  startTime: string; // HH:MM
  endTime: string;
  days: number[];
  description: string;
}

// 音乐资讯
export interface MusicNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverUrl: string;
  author: NewsAuthor;
  category: NewsCategory;
  tags: string[];
  relatedArtists: string[];
  relatedSongs: string[];
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface NewsAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
}

export type NewsCategory =
  | 'release' | 'tour' | 'award' | 'interview' | 'review'
  | 'industry' | 'trending' | 'feature' | 'opinion';

// 歌词卡片
export interface LyricsCard {
  id: string;
  songId: string;
  songTitle: string;
  artistName: string;
  lyrics: string;
  startTime: number;
  endTime: number;
  backgroundType: 'color' | 'gradient' | 'image' | 'video' | 'album_art';
  background: string;
  textStyle: TextStyle;
  animation: AnimationType;
  createdBy: string;
  shareCount: number;
  likes: number;
  createdAt: Date;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textShadow?: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export type AnimationType =
  | 'none' | 'fade' | 'typewriter' | 'slide' | 'bounce'
  | 'glow' | 'shake' | 'wave' | 'karaoke';

// MV 短视频
export interface MusicVideo {
  id: string;
  songId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: '720p' | '1080p' | '4k';
  artistId: string;
  director?: string;
  releaseDate: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isPremium: boolean;
  behindTheScenes?: string;
  lyrics?: SyncedLyrics;
}

export interface SyncedLyrics {
  lines: { time: number; text: string }[];
  language: string;
  translations?: { language: string; lines: { time: number; text: string }[] }[];
}

// 用户生成短视频
export interface UserVideo {
  id: string;
  oderId: string;
  username: string;
  avatarUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  caption: string;
  songId?: string;
  songSnippet?: { startTime: number; endTime: number };
  tags: string[];
  effects: VideoEffect[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface VideoEffect {
  type: 'filter' | 'sticker' | 'text' | 'ar';
  name: string;
  parameters: Record<string, any>;
}
