import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendRadar, GlobalTrend, GenreTrend, ViralMoment, HitPrediction } from '../../types/prediction';

interface TrendRadarProps {
  onSelectTrend: (trend: GlobalTrend) => void;
  onViewPrediction: (prediction: HitPrediction) => void;
}

const DEMO_TRENDS: GlobalTrend[] = [
  { id: '1', name: '国风电子', category: 'genre', momentum: 92, growth: 45, velocity: 8.5, peakPrediction: new Date('2024-06-01'), description: '传统中国风与电子音乐的融合', examples: [], relatedTrends: [], regions: [] },
  { id: '2', name: 'AI人声', category: 'technology', momentum: 88, growth: 78, velocity: 12, peakPrediction: new Date('2024-04-01'), description: 'AI生成的人声和翻唱', examples: [], relatedTrends: [], regions: [] },
  { id: '3', name: 'Lo-Fi House', category: 'genre', momentum: 75, growth: 32, velocity: 5.2, peakPrediction: new Date('2024-08-01'), description: '复古Lo-Fi与House的结合', examples: [], relatedTrends: [], regions: [] },
  { id: '4', name: '短视频神曲', category: 'format', momentum: 95, growth: 25, velocity: 15, peakPrediction: new Date('2024-03-15'), description: '适合短视频的洗脑旋律', examples: [], relatedTrends: [], regions: [] },
  { id: '5', name: '治愈系民谣', category: 'genre', momentum: 68, growth: 18, velocity: 3.5, peakPrediction: new Date('2024-09-01'), description: '温暖治愈的民谣风格', examples: [], relatedTrends: [], regions: [] },
];

const DEMO_VIRAL: ViralMoment[] = [
  { id: '1', type: 'tiktok', songId: 's1', songName: '热爱105°C的你', artistName: '阿肆', platform: 'TikTok', startDate: new Date(), peakDate: new Date(), status: 'viral', views: 50000000, userGeneratedContent: 2500000, celebrityParticipation: ['明星A', '明星B'], streamImpact: 350, chartImpact: 25 },
  { id: '2', type: 'challenge', songId: 's2', songName: 'APT', artistName: 'ROSÉ', platform: 'TikTok', startDate: new Date(), status: 'peak', views: 120000000, userGeneratedContent: 5000000, celebrityParticipation: [], streamImpact: 500, chartImpact: 45 },
  { id: '3', type: 'meme', songId: 's3', songName: '孤勇者', artistName: '陈奕迅', platform: '微博', startDate: new Date(), status: 'declining', views: 80000000, userGeneratedContent: 1500000, celebrityParticipation: [], streamImpact: 200, chartImpact: 15 },
];

const DEMO_PREDICTIONS: HitPrediction[] = [
  { id: '1', songId: 's1', songName: '新歌预测1', artistName: '新人歌手', artistId: 'a1', coverUrl: '', audioPreviewUrl: '', releaseDate: new Date(), predictedAt: new Date(), prediction: { peakPosition: 3, weeksOnChart: 12, totalStreams: 50000000, viralPotential: 85, crossoverPotential: 70, longevityScore: 75, categories: ['流行', '电子'] }, factors: [], comparisons: [], marketData: { releaseStrategy: '', labelSupport: 0, marketingBudget: '', playlistPlacements: 0, radioAdds: 0, syncDeals: 0, mediaAppearances: 0 }, socialSignals: [], trajectory: [], confidence: 82, status: 'rising' },
  { id: '2', songId: 's2', songName: '即将爆发', artistName: '独立音乐人', artistId: 'a2', coverUrl: '', audioPreviewUrl: '', releaseDate: new Date(), predictedAt: new Date(), prediction: { peakPosition: 8, weeksOnChart: 8, totalStreams: 20000000, viralPotential: 92, crossoverPotential: 45, longevityScore: 60, categories: ['说唱', '陷阱'] }, factors: [], comparisons: [], marketData: { releaseStrategy: '', labelSupport: 0, marketingBudget: '', playlistPlacements: 0, radioAdds: 0, syncDeals: 0, mediaAppearances: 0 }, socialSignals: [], trajectory: [], confidence: 78, status: 'rising' },
];

export const TrendRadarComponent: React.FC<TrendRadarProps> = ({
  onSelectTrend,
  onViewPrediction,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'viral' | 'predictions' | 'genres'>('radar');
  const [selectedTrend, setSelectedTrend] = useState<GlobalTrend | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 绘制雷达图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'radar') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制雷达背景圆圈
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 绘制雷达扫描效果
    const gradient = ctx.createConicalGradient(centerX, centerY, 0);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
    gradient.addColorStop(0.1, 'rgba(147, 51, 234, 0)');
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制趋势点
    DEMO_TRENDS.forEach((trend, index) => {
      const angle = (index / DEMO_TRENDS.length) * Math.PI * 2 - Math.PI / 2;
      const radius = (trend.momentum / 100) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // 脉冲效果
      ctx.beginPath();
      ctx.arc(x, y, 20 + trend.velocity, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(236, 72, 153, ${0.3 - trend.velocity * 0.01})`;
      ctx.fill();

      // 点
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      const pointGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      pointGradient.addColorStop(0, '#ec4899');
      pointGradient.addColorStop(1, '#9333ea');
      ctx.fillStyle = pointGradient;
      ctx.fill();

      // 标签
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(trend.name, x, y + 25);
    });
  }, [activeTab]);

  const formatNumber = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerging': return 'bg-blue-500';
      case 'rising': return 'bg-green-500';
      case 'viral': return 'bg-pink-500';
      case 'peak': return 'bg-yellow-500';
      case 'declining': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'emerging': return '新兴';
      case 'rising': return '上升';
      case 'viral': return '病毒式';
      case 'peak': return '巅峰';
      case 'declining': return '下降';
      default: return status;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">趋势雷达</h2>
            <p className="text-sm text-gray-400">实时追踪音乐潮流动态</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm">实时更新</span>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2">
        {[
          { id: 'radar', label: '雷达', icon: '📡' },
          { id: 'viral', label: '病毒式传播', icon: '🔥' },
          { id: 'predictions', label: '爆款预测', icon: '🔮' },
          { id: 'genres', label: '风格趋势', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 雷达视图 */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full h-80 bg-gray-900/50 rounded-2xl"
            />
            <div className="absolute bottom-4 left-4 flex gap-4 text-sm">
              <span className="text-gray-400">
                <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-1" />
                动量越高越靠外
              </span>
              <span className="text-gray-400">
                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1 animate-ping" />
                速度越快脉冲越大
              </span>
            </div>
          </div>

          {/* 趋势列表 */}
          <div className="space-y-3">
            {DEMO_TRENDS.map((trend, index) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedTrend(trend);
                  onSelectTrend(trend);
                }}
                className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">
                        {trend.category === 'genre' ? '🎵' : trend.category === 'technology' ? '🤖' : '📱'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{trend.name}</p>
                      <p className="text-gray-400 text-sm">{trend.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">+{trend.growth}%</p>
                    <p className="text-gray-500 text-sm">动量 {trend.momentum}</p>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trend.momentum}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 病毒式传播 */}
      {activeTab === 'viral' && (
        <div className="space-y-4">
          {DEMO_VIRAL.map((viral) => (
            <div key={viral.id} className="p-5 bg-white/5 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{viral.songName}</p>
                    <p className="text-gray-400">{viral.artistName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(viral.status)}`}>
                        {getStatusText(viral.status)}
                      </span>
                      <span className="text-gray-500 text-sm">{viral.platform}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white">{formatNumber(viral.views)}</p>
                  <p className="text-gray-400 text-sm">播放量</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-pink-400">{formatNumber(viral.userGeneratedContent)}</p>
                  <p className="text-gray-400 text-sm">UGC作品</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-green-400">+{viral.streamImpact}%</p>
                  <p className="text-gray-400 text-sm">流量增长</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-400">#{viral.chartImpact}</p>
                  <p className="text-gray-400 text-sm">榜单排名</p>
                </div>
              </div>

              {viral.celebrityParticipation.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-gray-400 text-sm">明星参与:</span>
                  {viral.celebrityParticipation.map((celeb) => (
                    <span key={celeb} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                      {celeb}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 爆款预测 */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 mb-4">
            <p className="text-white font-medium mb-1">🔮 AI 爆款预测</p>
            <p className="text-gray-400 text-sm">
              基于AI分析音频特征、社交热度、艺人势能等多维度数据，预测潜在爆款歌曲
            </p>
          </div>

          {DEMO_PREDICTIONS.map((prediction) => (
            <motion.div
              key={prediction.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onViewPrediction(prediction)}
              className="p-5 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{prediction.songName}</p>
                    <p className="text-gray-400 text-sm">{prediction.artistName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    {prediction.confidence}%
                  </p>
                  <p className="text-gray-500 text-sm">预测置信度</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <p className="text-white font-bold">#{prediction.prediction.peakPosition}</p>
                  <p className="text-gray-400 text-xs">预测峰值</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <p className="text-white font-bold">{prediction.prediction.weeksOnChart}周</p>
                  <p className="text-gray-400 text-xs">预计上榜</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <p className="text-pink-400 font-bold">{prediction.prediction.viralPotential}%</p>
                  <p className="text-gray-400 text-xs">病毒潜力</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {prediction.prediction.categories.map((cat) => (
                  <span key={cat} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 风格趋势 */}
      {activeTab === 'genres' && (
        <div className="space-y-4">
          {[
            { name: '电子舞曲', growth: 25, share: 18, trend: 'up' },
            { name: '说唱/嘻哈', growth: 15, share: 22, trend: 'stable' },
            { name: '国风/古风', growth: 45, share: 12, trend: 'up' },
            { name: '流行', growth: 5, share: 35, trend: 'stable' },
            { name: '摇滚', growth: -5, share: 8, trend: 'down' },
            { name: 'R&B', growth: 18, share: 10, trend: 'up' },
          ].map((genre, index) => (
            <div key={genre.name} className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="text-white font-medium">{genre.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={genre.growth > 0 ? 'text-green-400' : genre.growth < 0 ? 'text-red-400' : 'text-gray-400'}>
                    {genre.growth > 0 ? '↑' : genre.growth < 0 ? '↓' : '→'} {Math.abs(genre.growth)}%
                  </span>
                  <span className="text-gray-400">{genre.share}% 市场份额</span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${genre.share}%` }}
                  className={`h-full ${
                    genre.trend === 'up' ? 'bg-green-500' : genre.trend === 'down' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendRadarComponent;
