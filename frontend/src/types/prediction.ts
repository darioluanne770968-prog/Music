// 预测与趋势功能类型定义

// 热门预测
export interface HitPrediction {
  id: string;
  songId: string;
  songName: string;
  artistName: string;
  artistId: string;
  coverUrl: string;
  audioPreviewUrl: string;
  releaseDate: Date;
  predictedAt: Date;
  prediction: PredictionDetails;
  factors: PredictionFactor[];
  comparisons: HistoricalComparison[];
  marketData: MarketData;
  socialSignals: SocialSignal[];
  trajectory: TrajectoryPoint[];
  confidence: number;
  status: PredictionStatus;
  actualPerformance?: ActualPerformance;
}

export interface PredictionDetails {
  peakPosition: number;
  weeksOnChart: number;
  totalStreams: number;
  viralPotential: number;
  crossoverPotential: number;
  longevityScore: number;
  categories: string[];
}

export type PredictionStatus =
  | 'pending'
  | 'rising'
  | 'confirmed'
  | 'overperforming'
  | 'underperforming'
  | 'peaked'
  | 'declined';

export interface PredictionFactor {
  name: string;
  category: FactorCategory;
  weight: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: string;
}

export type FactorCategory =
  | 'audio_features'
  | 'artist_momentum'
  | 'social_buzz'
  | 'playlist_performance'
  | 'radio_potential'
  | 'sync_potential'
  | 'market_timing'
  | 'genre_trends';

export interface HistoricalComparison {
  songId: string;
  songName: string;
  artistName: string;
  releaseYear: number;
  similarity: number;
  peakPosition: number;
  totalStreams: number;
  chartWeeks: number;
}

export interface MarketData {
  releaseStrategy: string;
  labelSupport: number;
  marketingBudget: string;
  playlistPlacements: number;
  radioAdds: number;
  syncDeals: number;
  mediaAppearances: number;
}

export interface SocialSignal {
  platform: string;
  metric: string;
  value: number;
  growth: number;
  sentiment: number;
  hashtags: string[];
  influencerMentions: number;
}

export interface TrajectoryPoint {
  date: Date;
  position: number;
  streams: number;
  predicted: boolean;
  confidence: number;
}

export interface ActualPerformance {
  peakPosition: number;
  weeksOnChart: number;
  totalStreams: number;
  certifications: string[];
  awards: string[];
  accuracyScore: number;
}

// 趋势雷达
export interface TrendRadar {
  id: string;
  updatedAt: Date;
  globalTrends: GlobalTrend[];
  genreTrends: GenreTrend[];
  artistTrends: ArtistTrend[];
  soundTrends: SoundTrend[];
  viralMoments: ViralMoment[];
  emergingMarkets: EmergingMarket[];
  predictions: TrendPrediction[];
}

export interface GlobalTrend {
  id: string;
  name: string;
  category: string;
  momentum: number;
  growth: number;
  velocity: number;
  peakPrediction: Date;
  description: string;
  examples: TrendExample[];
  relatedTrends: string[];
  regions: RegionData[];
}

export interface TrendExample {
  type: 'song' | 'artist' | 'playlist' | 'video';
  id: string;
  name: string;
  imageUrl: string;
  relevance: number;
}

export interface RegionData {
  region: string;
  strength: number;
  growth: number;
  leadingIndicator: boolean;
}

export interface GenreTrend {
  genreId: string;
  genreName: string;
  parentGenre?: string;
  status: 'emerging' | 'rising' | 'peak' | 'declining' | 'stable';
  growth: number;
  marketShare: number;
  topArtists: string[];
  crossovers: CrossoverGenre[];
  subgenres: SubgenreTrend[];
  audioCharacteristics: AudioCharacteristics;
}

export interface CrossoverGenre {
  genreId: string;
  genreName: string;
  fusionStrength: number;
  examples: string[];
}

export interface SubgenreTrend {
  name: string;
  growth: number;
  isNew: boolean;
  keyArtists: string[];
}

export interface AudioCharacteristics {
  averageBpm: number;
  averageEnergy: number;
  averageValence: number;
  commonKeys: string[];
  instrumentationTrends: string[];
  productionTrends: string[];
}

export interface ArtistTrend {
  artistId: string;
  artistName: string;
  imageUrl: string;
  status: 'breakthrough' | 'rising' | 'established' | 'comeback' | 'declining';
  momentum: number;
  monthlyListeners: number;
  growth: number;
  socialGrowth: SocialGrowth;
  predictedTrajectory: string;
  keyEvents: KeyEvent[];
  comparableArtists: ComparableArtist[];
}

export interface SocialGrowth {
  instagram: number;
  twitter: number;
  tiktok: number;
  youtube: number;
  spotify: number;
}

export interface KeyEvent {
  date: Date;
  type: string;
  description: string;
  impact: number;
}

export interface ComparableArtist {
  artistId: string;
  artistName: string;
  similarity: number;
  comparisonPoint: string;
}

export interface SoundTrend {
  id: string;
  name: string;
  description: string;
  category: SoundCategory;
  popularity: number;
  growth: number;
  examples: SoundExample[];
  technicalDetails: TechnicalDetails;
  origins: SoundOrigin[];
  futureOutlook: string;
}

export type SoundCategory =
  | 'production_technique'
  | 'instrument'
  | 'vocal_style'
  | 'rhythm_pattern'
  | 'sonic_texture'
  | 'arrangement';

export interface SoundExample {
  songId: string;
  songName: string;
  artistName: string;
  timestamp?: number;
  description: string;
}

export interface TechnicalDetails {
  bpmRange: [number, number];
  keyPreference: string[];
  frequencyCharacteristics: string;
  effects: string[];
  instruments: string[];
}

export interface SoundOrigin {
  region: string;
  genre: string;
  year: number;
  pioneeringArtists: string[];
}

export interface ViralMoment {
  id: string;
  type: 'tiktok' | 'meme' | 'challenge' | 'sync' | 'remix' | 'cover';
  songId: string;
  songName: string;
  artistName: string;
  platform: string;
  startDate: Date;
  peakDate?: Date;
  status: 'emerging' | 'viral' | 'peak' | 'declining';
  views: number;
  userGeneratedContent: number;
  celebrityParticipation: string[];
  streamImpact: number;
  chartImpact: number;
}

export interface EmergingMarket {
  region: string;
  country: string;
  population: number;
  internetPenetration: number;
  streamingGrowth: number;
  topGenres: string[];
  topArtists: ArtistTrend[];
  opportunities: MarketOpportunity[];
  challenges: string[];
}

export interface MarketOpportunity {
  type: string;
  potential: number;
  description: string;
  requirements: string[];
}

export interface TrendPrediction {
  id: string;
  type: 'genre' | 'sound' | 'artist' | 'behavior';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  signals: string[];
  implications: string[];
}

// 音乐股票
export interface MusicStock {
  id: string;
  type: 'song' | 'artist' | 'catalog';
  entityId: string;
  entityName: string;
  entityImage: string;
  ticker: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  chart: StockChartPoint[];
  fundamentals: StockFundamentals;
  sentiment: StockSentiment;
  orders: StockOrder[];
  dividends: DividendInfo;
}

export interface StockChartPoint {
  timestamp: Date;
  price: number;
  volume: number;
  high: number;
  low: number;
}

export interface StockFundamentals {
  streams: number;
  streamsGrowth: number;
  monthlyListeners: number;
  listenersGrowth: number;
  playlistReach: number;
  radioPlays: number;
  syncRevenue: number;
  socialFollowers: number;
  engagementRate: number;
}

export interface StockSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  analystRatings: AnalystRating[];
  socialMentions: number;
  newsArticles: number;
  positiveRatio: number;
}

export interface AnalystRating {
  analyst: string;
  rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  targetPrice: number;
  date: Date;
  rationale: string;
}

export interface StockOrder {
  id: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  price?: number;
  quantity: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: Date;
  filledAt?: Date;
}

export interface DividendInfo {
  enabled: boolean;
  frequency: 'monthly' | 'quarterly' | 'annually';
  yield: number;
  lastPayment: Date;
  nextPayment: Date;
  history: DividendPayment[];
}

export interface DividendPayment {
  date: Date;
  amount: number;
  type: 'regular' | 'special';
}

// 用户投资组合
export interface MusicPortfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  returnPercent: number;
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
  performance: PerformanceData;
  watchlist: string[];
  alerts: PriceAlert[];
}

export interface PortfolioHolding {
  stockId: string;
  ticker: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
  weight: number;
}

export interface PortfolioTransaction {
  id: string;
  stockId: string;
  type: 'buy' | 'sell' | 'dividend';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  date: Date;
}

export interface PerformanceData {
  daily: PerformancePoint[];
  weekly: PerformancePoint[];
  monthly: PerformancePoint[];
  yearly: PerformancePoint[];
  allTime: PerformancePoint[];
}

export interface PerformancePoint {
  date: Date;
  value: number;
  return: number;
  benchmark: number;
}

export interface PriceAlert {
  id: string;
  stockId: string;
  condition: 'above' | 'below';
  price: number;
  triggered: boolean;
  triggeredAt?: Date;
  notificationSent: boolean;
}

// 趋势分析工具
export interface TrendAnalysisTool {
  id: string;
  name: string;
  type: AnalysisType;
  parameters: AnalysisParameter[];
  results: AnalysisResult;
  savedAnalyses: SavedAnalysis[];
}

export type AnalysisType =
  | 'song_comparison'
  | 'artist_trajectory'
  | 'genre_evolution'
  | 'market_timing'
  | 'viral_prediction'
  | 'custom';

export interface AnalysisParameter {
  name: string;
  type: 'entity' | 'date_range' | 'metric' | 'filter';
  value: any;
  options?: any[];
}

export interface AnalysisResult {
  summary: string;
  score: number;
  insights: Insight[];
  charts: ChartData[];
  recommendations: Recommendation[];
  exportable: boolean;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  data: any;
  options: any;
}

export interface Recommendation {
  id: string;
  type: 'invest' | 'avoid' | 'watch' | 'action';
  entity: string;
  rationale: string;
  confidence: number;
  timeframe: string;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  parameters: AnalysisParameter[];
  result: AnalysisResult;
  createdAt: Date;
  shared: boolean;
}
