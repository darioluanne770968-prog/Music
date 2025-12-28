// 游戏化功能类型定义

// 音乐节奏游戏
export interface RhythmGame {
  id: string;
  songId: string;
  difficulty: GameDifficulty;
  beatMap: BeatMap;
  highScores: GameScore[];
  playCount: number;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'master';

export interface BeatMap {
  id: string;
  songId: string;
  difficulty: GameDifficulty;
  bpm: number;
  notes: BeatNote[];
  duration: number;
  creator?: string;
  verified: boolean;
}

export interface BeatNote {
  time: number; // 毫秒
  lane: number; // 0-3 或 0-5 取决于模式
  type: NoteType;
  duration?: number; // 长按音符
  slideDirection?: 'left' | 'right' | 'up' | 'down';
}

export type NoteType = 'tap' | 'hold' | 'slide' | 'flick' | 'scratch';

export interface GameSession {
  id: string;
  oderId: string;
  songId: string;
  beatMapId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  judgments: JudgmentCount;
  isComplete: boolean;
}

export interface JudgmentCount {
  perfect: number;
  great: number;
  good: number;
  bad: number;
  miss: number;
}

export interface GameScore {
  userId: string;
  username: string;
  avatarUrl: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  rank: ScoreRank;
  date: Date;
}

export type ScoreRank = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// 猜歌挑战
export interface GuessChallenge {
  id: string;
  type: ChallengeType;
  mode: ChallengeMode;
  rounds: GuessRound[];
  currentRound: number;
  players: ChallengePlayer[];
  status: 'waiting' | 'playing' | 'finished';
  settings: ChallengeSettings;
  createdAt: Date;
}

export type ChallengeType = 'intro' | 'lyrics' | 'humming' | 'backwards' | 'slowed' | 'speedup';
export type ChallengeMode = 'solo' | 'pvp' | 'team' | 'battle_royale';

export interface GuessRound {
  roundNumber: number;
  songId: string;
  audioClip: string; // 音频片段URL
  clipStart: number;
  clipDuration: number;
  options?: string[]; // 选项（选择题模式）
  correctAnswer: string;
  playerAnswers: PlayerAnswer[];
  timeLimit: number;
}

export interface PlayerAnswer {
  oderId: string;
  answer: string;
  responseTime: number; // 毫秒
  isCorrect: boolean;
  score: number;
}

export interface ChallengePlayer {
  userId: string;
  username: string;
  avatarUrl: string;
  score: number;
  streak: number;
  isReady: boolean;
  isHost: boolean;
}

export interface ChallengeSettings {
  roundCount: number;
  timeLimit: number;
  difficulty: GameDifficulty;
  genres?: string[];
  decades?: string[];
  allowHints: boolean;
  pointsPerCorrect: number;
  streakBonus: boolean;
}

// 音乐知识问答
export interface MusicQuiz {
  id: string;
  category: QuizCategory;
  questions: QuizQuestion[];
  difficulty: GameDifficulty;
  timeLimit: number;
  createdAt: Date;
}

export type QuizCategory =
  | 'general' | 'artists' | 'albums' | 'lyrics' | 'music_theory'
  | 'history' | 'instruments' | 'genres' | 'awards' | 'trivia';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'audio';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  mediaUrl?: string;
}

// 成就系统
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  isSecret: boolean;
  unlockedAt?: Date;
}

export type AchievementCategory =
  | 'listening' | 'collection' | 'social' | 'gaming' | 'creation'
  | 'exploration' | 'streak' | 'special' | 'seasonal';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AchievementRequirement {
  type: string;
  target: number;
  current?: number;
  conditions?: Record<string, any>;
}

export interface AchievementReward {
  type: 'badge' | 'title' | 'skin' | 'coins' | 'vip_days' | 'exclusive_content';
  value: string | number;
  description: string;
}

export interface UserAchievements {
  oderId: string;
  achievements: Achievement[];
  points: number;
  level: number;
  titles: UserTitle[];
  currentTitle?: string;
  badges: Badge[];
  displayedBadges: string[];
}

export interface UserTitle {
  id: string;
  name: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: Date;
}

// 音乐养成游戏
export interface MusicPet {
  id: string;
  oderId: string;
  name: string;
  type: PetType;
  level: number;
  experience: number;
  mood: number; // 0-100
  energy: number; // 0-100
  skills: PetSkill[];
  accessories: PetAccessory[];
  stage: EvolutionStage;
  stats: PetStats;
  createdAt: Date;
}

export type PetType =
  | 'music_note' | 'vinyl_record' | 'speaker' | 'microphone'
  | 'guitar' | 'piano' | 'drums' | 'headphones';

export interface PetSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  effect: PetSkillEffect;
}

export interface PetSkillEffect {
  type: 'bonus_coins' | 'extra_xp' | 'unlock_content' | 'social_boost';
  value: number;
}

export interface PetAccessory {
  id: string;
  name: string;
  type: 'hat' | 'clothes' | 'background' | 'effect';
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type EvolutionStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'legendary';

export interface PetStats {
  totalListeningTime: number;
  songsPlayed: number;
  daysActive: number;
  achievementsUnlocked: number;
}

// 音乐树
export interface MusicTree {
  id: string;
  oderId: string;
  name: string;
  level: number;
  growthPoints: number;
  branches: TreeBranch[];
  decorations: TreeDecoration[];
  seasonalTheme?: string;
  createdAt: Date;
}

export interface TreeBranch {
  id: string;
  genre: string;
  level: number;
  fruits: TreeFruit[];
  position: { x: number; y: number };
}

export interface TreeFruit {
  id: string;
  type: 'song' | 'album' | 'artist';
  referenceId: string;
  harvestedAt?: Date;
}

export interface TreeDecoration {
  id: string;
  type: string;
  imageUrl: string;
  position: { x: number; y: number; z: number };
}

// 虚拟演唱会
export interface VirtualConcert {
  id: string;
  artistId: string;
  title: string;
  description: string;
  coverImage: string;
  startTime: Date;
  duration: number;
  venue: VirtualVenue;
  setlist: ConcertSong[];
  ticketTypes: TicketType[];
  attendees: number;
  maxCapacity: number;
  status: 'upcoming' | 'live' | 'ended' | 'replay';
  replayUrl?: string;
  interactions: ConcertInteraction[];
}

export interface VirtualVenue {
  id: string;
  name: string;
  theme: string;
  capacity: number;
  features: string[];
  previewImages: string[];
  model3dUrl?: string;
}

export interface ConcertSong {
  order: number;
  songId: string;
  specialEffects?: string[];
  guestArtist?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  perks: string[];
  quantity: number;
  sold: number;
}

export interface ConcertInteraction {
  type: 'lightstick' | 'cheer' | 'emoji' | 'gift' | 'request';
  count: number;
}

export interface ConcertAttendee {
  oderId: string;
  username: string;
  avatar: string;
  avatar3d?: string;
  ticketType: string;
  position: { x: number; y: number; z: number };
  lightstickColor: string;
  isVIP: boolean;
}
