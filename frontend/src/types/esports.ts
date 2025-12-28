// 音乐电竞功能类型定义

// 音乐电竞联赛
export interface MusicEsportsLeague {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  organizer: LeagueOrganizer;
  type: LeagueType;
  status: LeagueStatus;
  seasons: LeagueSeason[];
  currentSeason?: LeagueSeason;
  rules: LeagueRules;
  prizePool: PrizePool;
  sponsors: Sponsor[];
  broadcasts: BroadcastInfo[];
  teams: EsportsTeam[];
  players: EsportsPlayer[];
  stats: LeagueStats;
  createdAt: Date;
}

export interface LeagueOrganizer {
  id: string;
  name: string;
  logo: string;
  website: string;
  verified: boolean;
}

export type LeagueType =
  | 'rhythm_game'
  | 'karaoke'
  | 'dj_battle'
  | 'music_quiz'
  | 'production'
  | 'mixed';

export type LeagueStatus =
  | 'upcoming'
  | 'registration'
  | 'ongoing'
  | 'playoffs'
  | 'finals'
  | 'completed';

export interface LeagueSeason {
  id: string;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  status: LeagueStatus;
  stages: SeasonStage[];
  currentStage?: SeasonStage;
  participants: number;
  matches: Match[];
  standings: Standing[];
  champion?: string;
}

export interface SeasonStage {
  id: string;
  name: string;
  type: 'group' | 'swiss' | 'single_elim' | 'double_elim' | 'round_robin';
  order: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  groups?: StageGroup[];
  bracket?: Bracket;
}

export interface StageGroup {
  id: string;
  name: string;
  teams: string[];
  matches: Match[];
  standings: Standing[];
}

export interface Bracket {
  rounds: BracketRound[];
  type: 'single' | 'double';
}

export interface BracketRound {
  id: string;
  name: string;
  matches: Match[];
  bracket: 'winners' | 'losers' | 'grand_final';
}

export interface Match {
  id: string;
  stageId: string;
  roundNumber: number;
  matchNumber: number;
  participants: MatchParticipant[];
  games: Game[];
  scheduledTime: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  winner?: string;
  vod?: string;
  stats: MatchStats;
}

export interface MatchParticipant {
  id: string;
  type: 'team' | 'player';
  name: string;
  seed?: number;
  score: number;
  winner: boolean;
}

export interface Game {
  id: string;
  matchId: string;
  gameNumber: number;
  song?: SongPick;
  mode: string;
  scores: GameScore[];
  winner: string;
  duration: number;
  startedAt: Date;
  endedAt: Date;
}

export interface SongPick {
  songId: string;
  songName: string;
  artistName: string;
  difficulty: string;
  pickedBy: string;
}

export interface GameScore {
  participantId: string;
  score: number;
  accuracy: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  rank: string;
}

export interface MatchStats {
  viewers: number;
  peakViewers: number;
  chatMessages: number;
  predictions: number;
}

export interface LeagueRules {
  format: string;
  gameMode: string;
  songPool: SongPool;
  pickBanSystem?: PickBanSystem;
  scoringSystem: ScoringSystem;
  tiebreaker: string;
  codeOfConduct: string;
}

export interface SongPool {
  totalSongs: number;
  difficulties: string[];
  genres: string[];
  songs: PoolSong[];
  rotationEnabled: boolean;
  lastRotation?: Date;
}

export interface PoolSong {
  songId: string;
  songName: string;
  artistName: string;
  difficulty: string;
  tier: number;
  banned: boolean;
}

export interface PickBanSystem {
  enabled: boolean;
  bansPerTeam: number;
  picksPerTeam: number;
  order: string[];
  timePerPick: number;
  timePerBan: number;
}

export interface ScoringSystem {
  type: 'score' | 'accuracy' | 'combo' | 'mixed';
  weights?: Record<string, number>;
  bonuses?: ScoreBonus[];
}

export interface ScoreBonus {
  condition: string;
  value: number;
  description: string;
}

export interface PrizePool {
  total: number;
  currency: string;
  distribution: PrizeDistribution[];
  additionalPrizes: AdditionalPrize[];
  crowdfunded: boolean;
  crowdfundedAmount?: number;
}

export interface PrizeDistribution {
  placement: string;
  percentage: number;
  amount: number;
}

export interface AdditionalPrize {
  name: string;
  description: string;
  value: number;
  winner?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'title' | 'presenting' | 'major' | 'partner';
  website: string;
}

export interface BroadcastInfo {
  platform: string;
  url: string;
  language: string;
  casters: Caster[];
}

export interface Caster {
  id: string;
  name: string;
  role: 'play_by_play' | 'analyst' | 'host';
  avatar: string;
}

export interface Standing {
  position: number;
  participantId: string;
  participantName: string;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  differential: number;
  streak: string;
}

export interface LeagueStats {
  totalMatches: number;
  totalGames: number;
  averageViewers: number;
  peakViewers: number;
  totalPrizeAwarded: number;
  uniquePlayers: number;
}

// 电竞战队
export interface EsportsTeam {
  id: string;
  name: string;
  tag: string;
  logo: string;
  banner: string;
  colors: TeamColors;
  region: string;
  foundedAt: Date;
  owner: TeamOwner;
  manager?: TeamStaff;
  coach?: TeamStaff;
  roster: TeamMember[];
  achievements: TeamAchievement[];
  stats: TeamStats;
  social: TeamSocial;
  sponsors: Sponsor[];
  merchandise: TeamMerchandise[];
  fanClub: FanClub;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface TeamOwner {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface TeamStaff {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joinedAt: Date;
}

export interface TeamMember {
  playerId: string;
  role: 'captain' | 'player' | 'substitute';
  position: string;
  joinedAt: Date;
  contractEnd?: Date;
  salary?: number;
}

export interface TeamAchievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  placement: number;
  tournamentId: string;
  tournamentName: string;
  prize?: number;
}

export interface TeamStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  totalPrize: number;
  ranking: number;
  rankingPoints: number;
  currentStreak: number;
  bestStreak: number;
}

export interface TeamSocial {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  website?: string;
  followers: number;
}

export interface TeamMerchandise {
  id: string;
  name: string;
  type: 'jersey' | 'hoodie' | 'mousepad' | 'poster' | 'accessory';
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface FanClub {
  id: string;
  members: number;
  tiers: FanTier[];
  perks: string[];
  events: FanEvent[];
}

export interface FanTier {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  perks: string[];
  badge: string;
  memberCount: number;
}

export interface FanEvent {
  id: string;
  title: string;
  type: 'meet_greet' | 'watch_party' | 'qa' | 'practice_stream';
  date: Date;
  exclusive: boolean;
  minTier?: string;
}

// 电竞选手
export interface EsportsPlayer {
  id: string;
  gamertag: string;
  realName?: string;
  avatar: string;
  banner: string;
  country: string;
  birthDate?: Date;
  team?: EsportsTeam;
  role: PlayerRole;
  status: 'active' | 'inactive' | 'retired' | 'banned';
  career: PlayerCareer;
  stats: PlayerStats;
  achievements: PlayerAchievement[];
  settings: PlayerSettings;
  social: PlayerSocial;
  streaming: StreamingInfo;
}

export type PlayerRole =
  | 'all_rounder'
  | 'speed_specialist'
  | 'accuracy_specialist'
  | 'tech_specialist'
  | 'stamina_specialist';

export interface PlayerCareer {
  startDate: Date;
  teams: CareerTeam[];
  totalEarnings: number;
  peakRanking: number;
  currentRanking: number;
}

export interface CareerTeam {
  teamId: string;
  teamName: string;
  joinedAt: Date;
  leftAt?: Date;
  role: string;
  achievements: string[];
}

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  averageScore: number;
  averageAccuracy: number;
  averageCombo: number;
  highestScore: number;
  perfectGames: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  date: Date;
  type: 'tournament' | 'record' | 'milestone';
  description: string;
  prize?: number;
}

export interface PlayerSettings {
  equipment: PlayerEquipment;
  gameSettings: Record<string, any>;
  practiceRoutine: string;
}

export interface PlayerEquipment {
  keyboard?: string;
  mouse?: string;
  headphones?: string;
  monitor?: string;
  chair?: string;
  other: string[];
}

export interface PlayerSocial {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  twitch?: string;
  discord?: string;
  followers: number;
}

export interface StreamingInfo {
  platforms: StreamPlatform[];
  schedule?: StreamSchedule;
  averageViewers: number;
  peakViewers: number;
}

export interface StreamPlatform {
  platform: string;
  url: string;
  followers: number;
  partner: boolean;
}

export interface StreamSchedule {
  timezone: string;
  days: ScheduleDay[];
}

export interface ScheduleDay {
  day: number;
  startTime: string;
  endTime: string;
  content: string;
}

// 排位系统
export interface RankedSystem {
  id: string;
  userId: string;
  mode: RankedMode;
  currentSeason: RankedSeason;
  rank: PlayerRank;
  mmr: number;
  matchHistory: RankedMatch[];
  stats: RankedStats;
  rewards: SeasonReward[];
  placement: PlacementInfo;
}

export interface RankedMode {
  id: string;
  name: string;
  description: string;
  gameType: string;
  songPool: string[];
  rankDistribution: RankDistribution;
}

export interface RankedSeason {
  id: string;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  rewards: SeasonReward[];
  theme: string;
}

export interface PlayerRank {
  tier: RankTier;
  division: number;
  lp: number;
  lpToPromotion: number;
  promotionSeries?: PromotionSeries;
  peakTier: RankTier;
  peakDivision: number;
}

export type RankTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger';

export interface RankDistribution {
  tier: RankTier;
  percentage: number;
  minMmr: number;
  maxMmr: number;
}

export interface PromotionSeries {
  wins: number;
  losses: number;
  required: number;
  targetTier: RankTier;
  targetDivision: number;
  matches: string[];
}

export interface RankedMatch {
  id: string;
  timestamp: Date;
  opponent: MatchOpponent;
  song: SongPick;
  result: 'win' | 'loss' | 'draw';
  myScore: number;
  opponentScore: number;
  lpChange: number;
  mmrChange: number;
  duration: number;
}

export interface MatchOpponent {
  userId: string;
  username: string;
  avatar: string;
  rank: PlayerRank;
}

export interface RankedStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  averageAccuracy: number;
  lpGained: number;
  lpLost: number;
}

export interface SeasonReward {
  tier: RankTier;
  rewards: Reward[];
  claimed: boolean;
}

export interface Reward {
  type: 'skin' | 'badge' | 'frame' | 'title' | 'currency' | 'emote';
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
}

export interface PlacementInfo {
  gamesPlayed: number;
  gamesRequired: number;
  provisionalRank?: PlayerRank;
  completed: boolean;
}

// 锦标赛系统
export interface Tournament {
  id: string;
  name: string;
  description: string;
  banner: string;
  organizer: LeagueOrganizer;
  type: TournamentType;
  format: TournamentFormat;
  status: TournamentStatus;
  registration: RegistrationInfo;
  schedule: TournamentSchedule;
  prizePool: PrizePool;
  rules: LeagueRules;
  participants: TournamentParticipant[];
  brackets: Bracket[];
  streams: BroadcastInfo[];
  chat: TournamentChat;
}

export type TournamentType = 'open' | 'invitational' | 'qualifier' | 'major';
export type TournamentFormat = 'single_elim' | 'double_elim' | 'swiss' | 'round_robin';
export type TournamentStatus = 'announced' | 'registration' | 'ongoing' | 'completed';

export interface RegistrationInfo {
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  requirements: string[];
  open: boolean;
}

export interface TournamentSchedule {
  checkIn: Date;
  start: Date;
  estimatedEnd: Date;
  rounds: ScheduledRound[];
}

export interface ScheduledRound {
  name: string;
  startTime: Date;
  estimatedDuration: number;
}

export interface TournamentParticipant {
  id: string;
  type: 'player' | 'team';
  name: string;
  seed?: number;
  checkInStatus: 'pending' | 'checked_in' | 'no_show';
  eliminated: boolean;
  placement?: number;
}

export interface TournamentChat {
  enabled: boolean;
  moderated: boolean;
  slowMode: number;
  subscriberOnly: boolean;
}
