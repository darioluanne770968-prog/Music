import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArtistWorkstation,
  AnalyticsOverview,
  StreamAnalytics,
  Release,
} from '../../types/creator';

interface ArtistDashboardProps {
  artistId: string;
  artistName: string;
}

// 模拟数据
const DEMO_OVERVIEW: AnalyticsOverview = {
  totalStreams: 12500000,
  totalListeners: 850000,
  totalFollowers: 320000,
  totalRevenue: 125000,
  streamsChange: 15.5,
  listenersChange: 8.2,
  followersChange: 12.3,
  revenueChange: 18.7,
  period: 'month',
};

const DEMO_TOP_SONGS = [
  { id: '1', name: '夜曲', streams: 2500000, trend: 12 },
  { id: '2', name: '晴天', streams: 2100000, trend: -3 },
  { id: '3', name: '告白气球', streams: 1800000, trend: 25 },
  { id: '4', name: '稻香', streams: 1500000, trend: 8 },
  { id: '5', name: '七里香', streams: 1200000, trend: 5 },
];

const DEMO_RELEASES: Release[] = [
  {
    id: '1',
    type: 'album',
    title: '最伟大的作品',
    coverUrl: '/covers/album1.jpg',
    tracks: [],
    releaseDate: new Date('2024-07-15'),
    status: 'released',
    distributionPlatforms: [],
    metadata: { genre: '流行', language: '中文', copyright: '杰威尔音乐', tags: [] },
    preSaveCount: 150000,
    createdAt: new Date(),
  },
];

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  artistId,
  artistName,
}) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'audience' | 'revenue'>('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `¥${num.toLocaleString()}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">👑</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{artistName}</h2>
            <p className="text-gray-400">音乐人工作台</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="bg-white/10 border-none rounded-xl px-4 py-2 text-white"
          >
            <option value="day">今日</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">今年</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium">
            发布新作品
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '总播放量',
            value: DEMO_OVERVIEW.totalStreams,
            change: DEMO_OVERVIEW.streamsChange,
            icon: '▶️',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            label: '听众数',
            value: DEMO_OVERVIEW.totalListeners,
            change: DEMO_OVERVIEW.listenersChange,
            icon: '👥',
            color: 'from-purple-500 to-pink-500',
          },
          {
            label: '粉丝数',
            value: DEMO_OVERVIEW.totalFollowers,
            change: DEMO_OVERVIEW.followersChange,
            icon: '❤️',
            color: 'from-rose-500 to-red-500',
          },
          {
            label: '收入',
            value: DEMO_OVERVIEW.totalRevenue,
            change: DEMO_OVERVIEW.revenueChange,
            icon: '💰',
            color: 'from-amber-500 to-yellow-500',
            isCurrency: true,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change >= 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                }`}
              >
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
            <p className="text-white/70 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">
              {stat.isCurrency ? formatCurrency(stat.value) : formatNumber(stat.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'overview', label: '概览' },
          { id: 'streams', label: '播放分析' },
          { id: 'audience', label: '听众画像' },
          { id: 'revenue', label: '收入明细' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 热门歌曲 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-4">热门歌曲</h3>
          <div className="space-y-3">
            {DEMO_TOP_SONGS.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    index === 0
                      ? 'bg-amber-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">{song.name}</p>
                  <p className="text-gray-400 text-sm">{formatNumber(song.streams)} 次播放</p>
                </div>
                <span
                  className={`text-sm ${
                    song.trend >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {song.trend >= 0 ? '↑' : '↓'} {Math.abs(song.trend)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 播放趋势图表 */}
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-4">播放趋势</h3>
          <div className="h-48 flex items-end gap-2">
            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80, 70].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>1月</span>
            <span>2月</span>
            <span>3月</span>
            <span>4月</span>
            <span>5月</span>
            <span>6月</span>
            <span>7月</span>
            <span>8月</span>
            <span>9月</span>
            <span>10月</span>
            <span>11月</span>
            <span>12月</span>
          </div>
        </div>
      </div>

      {/* 最近发布 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">最近发布</h3>
          <button className="text-amber-400 text-sm hover:text-amber-300">查看全部</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {DEMO_RELEASES.map((release) => (
            <div
              key={release.id}
              className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="text-4xl">💿</span>
              </div>
              <div className="p-3">
                <p className="text-white font-medium truncate">{release.title}</p>
                <p className="text-gray-400 text-sm">{release.type === 'album' ? '专辑' : '单曲'}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(release.releaseDate).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          ))}
          <button className="aspect-square bg-white/5 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-3xl">+</span>
            <span className="text-sm">新建发布</span>
          </button>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: '📊', label: '数据报告', desc: '下载完整分析报告' },
          { icon: '🎵', label: '上传音乐', desc: '发布新作品' },
          { icon: '💬', label: '粉丝留言', desc: '23条未读消息' },
          { icon: '💰', label: '提现', desc: '可提现 ¥45,000' },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 text-left transition-colors"
          >
            <span className="text-3xl block mb-3">{action.icon}</span>
            <p className="text-white font-medium">{action.label}</p>
            <p className="text-gray-400 text-sm">{action.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ArtistDashboard;
