import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankedSystem, PlayerRank, RankedMatch, RankTier } from '../../types/esports';

interface RankedSystemProps {
  userId: string;
  onStartMatch: () => void;
  onViewHistory: () => void;
}

const RANK_TIERS: { tier: RankTier; name: string; icon: string; color: string }[] = [
  { tier: 'bronze', name: '青铜', icon: '🥉', color: '#cd7f32' },
  { tier: 'silver', name: '白银', icon: '🥈', color: '#c0c0c0' },
  { tier: 'gold', name: '黄金', icon: '🥇', color: '#ffd700' },
  { tier: 'platinum', name: '铂金', icon: '💎', color: '#e5e4e2' },
  { tier: 'diamond', name: '钻石', icon: '💠', color: '#b9f2ff' },
  { tier: 'master', name: '大师', icon: '🏆', color: '#9b59b6' },
  { tier: 'grandmaster', name: '宗师', icon: '👑', color: '#e74c3c' },
  { tier: 'challenger', name: '王者', icon: '⚡', color: '#f39c12' },
];

const DEMO_RANKED: RankedSystem = {
  id: '1',
  userId: 'user1',
  mode: {
    id: 'rhythm',
    name: '节奏对战',
    description: '1v1节奏游戏对战',
    gameType: 'rhythm',
    songPool: [],
    rankDistribution: [],
  },
  currentSeason: {
    id: 's1',
    name: '第三赛季 - 星辰之歌',
    number: 3,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    rewards: [],
    theme: '星辰',
  },
  rank: {
    tier: 'diamond',
    division: 2,
    lp: 75,
    lpToPromotion: 25,
    peakTier: 'master',
    peakDivision: 4,
  },
  mmr: 2150,
  matchHistory: [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      opponent: { userId: 'opp1', username: '节奏大师', avatar: '', rank: { tier: 'diamond', division: 1, lp: 50, lpToPromotion: 50, peakTier: 'diamond', peakDivision: 1 } },
      song: { songId: 's1', songName: '夜曲', artistName: '周杰伦', difficulty: 'Expert', pickedBy: 'opp1' },
      result: 'win',
      myScore: 985420,
      opponentScore: 972150,
      lpChange: 18,
      mmrChange: 15,
      duration: 180,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      opponent: { userId: 'opp2', username: '音游新星', avatar: '', rank: { tier: 'diamond', division: 3, lp: 20, lpToPromotion: 80, peakTier: 'diamond', peakDivision: 2 } },
      song: { songId: 's2', songName: 'Blinding Lights', artistName: 'The Weeknd', difficulty: 'Hard', pickedBy: 'user1' },
      result: 'win',
      myScore: 998750,
      opponentScore: 945320,
      lpChange: 15,
      mmrChange: 12,
      duration: 200,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000),
      opponent: { userId: 'opp3', username: '指尖舞者', avatar: '', rank: { tier: 'master', division: 4, lp: 10, lpToPromotion: 90, peakTier: 'master', peakDivision: 3 } },
      song: { songId: 's3', songName: 'Bad Guy', artistName: 'Billie Eilish', difficulty: 'Expert', pickedBy: 'opp3' },
      result: 'loss',
      myScore: 912450,
      opponentScore: 978620,
      lpChange: -12,
      mmrChange: -10,
      duration: 195,
    },
  ],
  stats: {
    totalGames: 156,
    wins: 98,
    losses: 58,
    winRate: 62.8,
    currentStreak: 2,
    bestStreak: 12,
    averageScore: 965000,
    averageAccuracy: 94.5,
    lpGained: 450,
    lpLost: 280,
  },
  rewards: [],
  placement: { gamesPlayed: 10, gamesRequired: 10, completed: true },
};

export const RankedSystemComponent: React.FC<RankedSystemProps> = ({
  userId,
  onStartMatch,
  onViewHistory,
}) => {
  const [ranked] = useState<RankedSystem>(DEMO_RANKED);
  const [showHistory, setShowHistory] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const currentRankInfo = RANK_TIERS.find(r => r.tier === ranked.rank.tier);
  const nextRankInfo = RANK_TIERS[RANK_TIERS.findIndex(r => r.tier === ranked.rank.tier) + 1];

  const startMatchmaking = () => {
    setIsSearching(true);
    const timer = setInterval(() => {
      setSearchTime(t => t + 1);
    }, 1000);

    // 模拟找到对手
    setTimeout(() => {
      clearInterval(timer);
      setIsSearching(false);
      setSearchTime(0);
      onStartMatch();
    }, 3000 + Math.random() * 5000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl overflow-hidden">
      {/* 头部 - 赛季信息 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">当前赛季</p>
            <h1 className="text-2xl font-bold text-white">{ranked.currentSeason.name}</h1>
            <p className="text-white/70 text-sm mt-1">
              剩余 {Math.ceil((ranked.currentSeason.endDate.getTime() - Date.now()) / 86400000)} 天
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">模式</p>
            <p className="text-white font-medium">{ranked.mode.name}</p>
          </div>
        </div>
      </div>

      {/* 段位展示 */}
      <div className="p-6">
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block"
          >
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: `linear-gradient(135deg, ${currentRankInfo?.color}40, ${currentRankInfo?.color}20)`,
                border: `3px solid ${currentRankInfo?.color}`,
                boxShadow: `0 0 30px ${currentRankInfo?.color}40`,
              }}
            >
              <span className="text-6xl">{currentRankInfo?.icon}</span>
            </div>
          </motion.div>

          <h2
            className="text-3xl font-bold mb-1"
            style={{ color: currentRankInfo?.color }}
          >
            {currentRankInfo?.name} {ranked.rank.division}
          </h2>
          <p className="text-gray-400">{ranked.rank.lp} LP</p>

          {/* 段位进度条 */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">
                {currentRankInfo?.name} {ranked.rank.division}
              </span>
              <span className="text-gray-400">
                {ranked.rank.division > 1
                  ? `${currentRankInfo?.name} ${ranked.rank.division - 1}`
                  : nextRankInfo?.name || '晋级'}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ranked.rank.lp}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentRankInfo?.color}, ${nextRankInfo?.color || currentRankInfo?.color})`,
                }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              距离晋级还需 {ranked.rank.lpToPromotion} LP
            </p>
          </div>

          {/* 晋级赛提示 */}
          {ranked.rank.promotionSeries && (
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl">
              <p className="text-yellow-500 font-medium">晋级赛进行中！</p>
              <div className="flex justify-center gap-2 mt-2">
                {[...Array(ranked.rank.promotionSeries.required)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < ranked.rank.promotionSeries!.wins
                        ? 'bg-green-500'
                        : i < ranked.rank.promotionSeries!.wins + ranked.rank.promotionSeries!.losses
                        ? 'bg-red-500'
                        : 'bg-white/20'
                    }`}
                  >
                    {i < ranked.rank.promotionSeries!.wins ? '✓' : i < ranked.rank.promotionSeries!.wins + ranked.rank.promotionSeries!.losses ? '✗' : '?'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 开始匹配按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isSearching ? () => setIsSearching(false) : startMatchmaking}
          disabled={isSearching}
          className={`w-full mt-6 py-5 rounded-2xl font-bold text-lg transition-all ${
            isSearching
              ? 'bg-red-500/50 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}
        >
          {isSearching ? (
            <div className="flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⏳
              </motion.span>
              <span>寻找对手中... {formatTime(searchTime)}</span>
            </div>
          ) : (
            <span>🎮 开始匹配</span>
          )}
        </motion.button>

        {/* 统计数据 */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: '胜场', value: ranked.stats.wins, color: 'text-green-400' },
            { label: '负场', value: ranked.stats.losses, color: 'text-red-400' },
            { label: '胜率', value: `${ranked.stats.winRate}%`, color: 'text-blue-400' },
            { label: '连胜', value: ranked.stats.currentStreak, color: 'text-yellow-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 最近战绩 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">最近战绩</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-purple-400 text-sm"
            >
              {showHistory ? '收起' : '查看全部'}
            </button>
          </div>

          {/* 战绩指示条 */}
          <div className="flex gap-1 mb-4">
            {ranked.matchHistory.slice(0, 10).map((match) => (
              <div
                key={match.id}
                className={`flex-1 h-2 rounded-full ${
                  match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            ))}
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {ranked.matchHistory.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-xl ${
                      match.result === 'win' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          <span className="text-white font-bold">
                            {match.result === 'win' ? 'W' : 'L'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">vs {match.opponent.username}</p>
                          <p className="text-gray-400 text-sm">
                            {match.song.songName} - {match.song.difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {match.myScore.toLocaleString()} - {match.opponentScore.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm ${
                            match.lpChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {match.lpChange > 0 ? '+' : ''}{match.lpChange} LP
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 段位分布 */}
        <div className="mt-6 bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-4">段位分布</h3>
          <div className="flex items-end gap-1 h-24">
            {RANK_TIERS.map((tier, i) => {
              const heights = [5, 12, 25, 20, 15, 10, 8, 5];
              const isCurrent = tier.tier === ranked.rank.tier;
              return (
                <div key={tier.tier} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heights[i] * 3}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full rounded-t"
                    style={{
                      backgroundColor: isCurrent ? tier.color : `${tier.color}40`,
                      border: isCurrent ? `2px solid ${tier.color}` : 'none',
                    }}
                  />
                  <span className="text-xs mt-1" style={{ color: isCurrent ? tier.color : '#888' }}>
                    {tier.icon}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2">
            <span className="text-purple-400 text-sm">你超过了 78% 的玩家</span>
          </div>
        </div>

        {/* 赛季奖励预览 */}
        <div className="mt-6">
          <h3 className="text-white font-medium mb-4">赛季奖励</h3>
          <div className="grid grid-cols-4 gap-3">
            {RANK_TIERS.slice(2, 6).map((tier) => {
              const unlocked = RANK_TIERS.findIndex(t => t.tier === ranked.rank.tier) >= RANK_TIERS.findIndex(t => t.tier === tier.tier);
              return (
                <div
                  key={tier.tier}
                  className={`p-3 rounded-xl text-center ${
                    unlocked ? 'bg-white/10' : 'bg-white/5 opacity-50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{tier.icon}</span>
                  <p className="text-gray-400 text-xs">{tier.name}框</p>
                  {unlocked && <span className="text-green-400 text-xs">✓ 已解锁</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankedSystemComponent;
