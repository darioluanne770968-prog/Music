import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParentalControls, UsageReport, ApprovalRequest } from '../../types/security';

interface ParentalControlsProps {
  parentUserId: string;
  childAccountId: string;
  onUpdateSettings: (settings: Partial<ParentalControls>) => void;
  onApproveRequest: (requestId: string, approved: boolean) => void;
}

const DEMO_CONTROLS: ParentalControls = {
  id: '1',
  parentUserId: 'parent1',
  childAccountId: 'child1',
  enabled: true,
  pin: '****',
  settings: {
    explicitContent: {
      allowExplicit: false,
      filterExplicitLyrics: true,
      hideExplicitContent: true,
      replaceWithClean: true,
      notifyParent: true,
    },
    socialFeatures: {
      allowMessaging: false,
      allowFriendRequests: true,
      allowPublicProfile: false,
      allowComments: true,
      allowSharing: true,
      allowCollaborativePlaylists: true,
      approvalRequired: true,
    },
    purchaseRestrictions: {
      allowPurchases: false,
      maxAmount: 50,
      requireApproval: true,
      approvalThreshold: 10,
      allowSubscriptions: false,
      allowGifting: false,
    },
    contentFilters: [
      { id: '1', type: 'genre', value: '重金属', action: 'block' },
      { id: '2', type: 'keyword', value: '暴力', action: 'block' },
    ],
    timeRestrictions: {
      enabled: true,
      dailyLimit: 120,
      weeklyLimit: 600,
      quietHours: [{ start: '22:00', end: '07:00', days: [0, 1, 2, 3, 4, 5, 6], enforced: true }],
      schoolDayRestrictions: true,
      weekendBonus: 60,
    },
    ageRating: {
      birthDate: new Date('2012-05-15'),
      ageVerified: true,
      maxRating: 'PG',
      autoAdjust: true,
    },
  },
  schedules: [],
  reports: [],
  approvalQueue: [
    { id: '1', type: 'friend', description: '添加好友 "音乐达人"', requestedAt: new Date(), status: 'pending', details: {} },
    { id: '2', type: 'content', description: '访问歌曲 "XXX"', requestedAt: new Date(), status: 'pending', details: {} },
  ],
  notifications: [],
};

const DEMO_REPORT: UsageReport = {
  id: '1',
  period: 'weekly',
  startDate: new Date(Date.now() - 604800000),
  endDate: new Date(),
  totalListeningTime: 420,
  topGenres: [
    { genre: '流行', time: 180, percentage: 42 },
    { genre: '动漫', time: 120, percentage: 28 },
    { genre: '古典', time: 80, percentage: 19 },
    { genre: '民谣', time: 40, percentage: 11 },
  ],
  topArtists: [
    { artistId: '1', artistName: '周杰伦', time: 90, plays: 25 },
    { artistId: '2', artistName: '邓紫棋', time: 60, plays: 18 },
    { artistId: '3', artistName: '林俊杰', time: 45, plays: 12 },
  ],
  topSongs: [],
  blockedAttempts: [
    { timestamp: new Date(), type: 'explicit', content: '某首歌', reason: '含有不当歌词' },
    { timestamp: new Date(), type: 'time', content: '超时使用', reason: '超过每日限制' },
  ],
  screenTime: {
    totalTime: 420,
    activeTime: 350,
    backgroundTime: 70,
    sessions: 15,
    averageSession: 28,
    longestSession: 65,
  },
  recommendations: [
    { type: 'positive', title: '听音乐习惯良好', description: '本周听音乐时间在健康范围内' },
    { type: 'suggestion', title: '尝试更多类型', description: '可以引导孩子探索更多音乐风格' },
  ],
};

export const ParentalControlsComponent: React.FC<ParentalControlsProps> = ({
  parentUserId,
  childAccountId,
  onUpdateSettings,
  onApproveRequest,
}) => {
  const [controls, setControls] = useState<ParentalControls>(DEMO_CONTROLS);
  const [report] = useState<UsageReport>(DEMO_REPORT);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'time' | 'social' | 'reports'>('overview');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');

  const updateSetting = (path: string, value: any) => {
    // 递归更新嵌套设置
    setControls(prev => {
      const newControls = { ...prev };
      const parts = path.split('.');
      let current: any = newControls;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newControls;
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}` : `${mins}分钟`;
  };

  const getAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">👨‍👧</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">家长控制</h2>
            <p className="text-sm text-gray-400">保护孩子的音乐体验</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => updateSetting('enabled', !controls.enabled)}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            controls.enabled
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          {controls.enabled ? '已开启' : '已关闭'}
        </motion.button>
      </div>

      {/* 孩子账户信息 */}
      <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
          <span className="text-3xl">👧</span>
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">小明的账户</p>
          <p className="text-gray-400 text-sm">
            {getAge(controls.settings.ageRating.birthDate)} 岁 ·
            今日已使用 {formatTime(45)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-green-400">状态正常</p>
          <p className="text-gray-500 text-sm">上次活动: 10分钟前</p>
        </div>
      </div>

      {/* 待审批请求 */}
      {controls.approvalQueue.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-yellow-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500">⚠️</span>
            <span className="text-yellow-500 font-medium">
              {controls.approvalQueue.filter(r => r.status === 'pending').length} 个待审批请求
            </span>
          </div>
          <div className="space-y-2">
            {controls.approvalQueue.filter(r => r.status === 'pending').map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {request.type === 'friend' ? '👥' : request.type === 'content' ? '🎵' : '💰'}
                  </span>
                  <span className="text-white text-sm">{request.description}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApproveRequest(request.id, true)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                  >
                    批准
                  </button>
                  <button
                    onClick={() => onApproveRequest(request.id, false)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 标签页 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '概览', icon: '📊' },
          { id: 'content', label: '内容', icon: '🎵' },
          { id: 'time', label: '时间', icon: '⏰' },
          { id: 'social', label: '社交', icon: '👥' },
          { id: 'reports', label: '报告', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{formatTime(report.totalListeningTime)}</p>
              <p className="text-gray-400 text-sm">本周收听</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{report.screenTime.sessions}</p>
              <p className="text-gray-400 text-sm">使用次数</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{report.blockedAttempts.length}</p>
              <p className="text-gray-400 text-sm">被拦截</p>
            </div>
          </div>

          {/* 快速设置 */}
          <div className="space-y-3">
            {[
              { key: 'settings.explicitContent.allowExplicit', label: '允许成人内容', value: controls.settings.explicitContent.allowExplicit, icon: '🔞' },
              { key: 'settings.socialFeatures.allowMessaging', label: '允许私信', value: controls.settings.socialFeatures.allowMessaging, icon: '💬' },
              { key: 'settings.purchaseRestrictions.allowPurchases', label: '允许购买', value: controls.settings.purchaseRestrictions.allowPurchases, icon: '💳' },
              { key: 'settings.timeRestrictions.enabled', label: '时间限制', value: controls.settings.timeRestrictions.enabled, icon: '⏰' },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{setting.icon}</span>
                  <span className="text-white">{setting.label}</span>
                </div>
                <button
                  onClick={() => updateSetting(setting.key, !setting.value)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    setting.value ? 'bg-green-500' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{ x: setting.value ? 20 : 2 }}
                    className="w-5 h-5 bg-white rounded-full"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 内容控制 */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <h3 className="text-white font-medium">成人内容</h3>
            {[
              { key: 'settings.explicitContent.filterExplicitLyrics', label: '过滤不当歌词' },
              { key: 'settings.explicitContent.hideExplicitContent', label: '隐藏成人内容' },
              { key: 'settings.explicitContent.replaceWithClean', label: '自动替换为干净版' },
              { key: 'settings.explicitContent.notifyParent', label: '尝试访问时通知家长' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-gray-300">{item.label}</span>
                <button
                  onClick={() => {
                    const parts = item.key.split('.');
                    let value = controls as any;
                    for (const part of parts) value = value[part];
                    updateSetting(item.key, !value);
                  }}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    (() => {
                      const parts = item.key.split('.');
                      let value = controls as any;
                      for (const part of parts) value = value[part];
                      return value;
                    })()
                      ? 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: (() => {
                        const parts = item.key.split('.');
                        let value = controls as any;
                        for (const part of parts) value = value[part];
                        return value;
                      })()
                        ? 16
                        : 2,
                    }}
                    className="w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">内容过滤器</h3>
            <div className="space-y-2">
              {controls.settings.contentFilters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">屏蔽</span>
                    <span className="text-gray-300 text-sm">{filter.value}</span>
                    <span className="text-gray-500 text-xs">({filter.type})</span>
                  </div>
                  <button className="text-gray-500 hover:text-red-400">✕</button>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500">
                + 添加过滤规则
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">年龄限制</h3>
            <div className="flex gap-2">
              {['G', 'PG', 'PG13', 'R'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateSetting('settings.ageRating.maxRating', rating)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    controls.settings.ageRating.maxRating === rating
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 时间控制 */}
      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">每日使用限制</h3>
              <span className="text-gray-400">{formatTime(controls.settings.timeRestrictions.dailyLimit)}</span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="30"
              value={controls.settings.timeRestrictions.dailyLimit}
              onChange={(e) => updateSetting('settings.timeRestrictions.dailyLimit', Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>30分钟</span>
              <span>5小时</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4">安静时间</h3>
            {controls.settings.timeRestrictions.quietHours.map((quiet, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <div>
                    <p className="text-white">{quiet.start} - {quiet.end}</p>
                    <p className="text-gray-500 text-sm">每天</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newQuiet = [...controls.settings.timeRestrictions.quietHours];
                    newQuiet[i] = { ...quiet, enforced: !quiet.enforced };
                    updateSetting('settings.timeRestrictions.quietHours', newQuiet);
                  }}
                  className={`w-10 h-6 rounded-full ${quiet.enforced ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <motion.div
                    animate={{ x: quiet.enforced ? 16 : 2 }}
                    className="w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">周末额外时间</p>
                <p className="text-gray-400 text-sm">周末可以多用 {formatTime(controls.settings.timeRestrictions.weekendBonus)}</p>
              </div>
              <input
                type="number"
                value={controls.settings.timeRestrictions.weekendBonus}
                onChange={(e) => updateSetting('settings.timeRestrictions.weekendBonus', Number(e.target.value))}
                className="w-20 bg-white/10 rounded-lg px-3 py-2 text-white text-center outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 报告 */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4">热门音乐类型</h3>
            <div className="space-y-3">
              {report.topGenres.map((genre) => (
                <div key={genre.genre}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{genre.genre}</span>
                    <span className="text-gray-400">{formatTime(genre.time)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${genre.percentage}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4">收听记录</h3>
            <div className="space-y-2">
              {report.topArtists.map((artist) => (
                <div key={artist.artistId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span>🎤</span>
                    </div>
                    <div>
                      <p className="text-white">{artist.artistName}</p>
                      <p className="text-gray-500 text-sm">{artist.plays} 次播放</p>
                    </div>
                  </div>
                  <span className="text-gray-400">{formatTime(artist.time)}</span>
                </div>
              ))}
            </div>
          </div>

          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl ${
                rec.type === 'positive' ? 'bg-green-500/10' : rec.type === 'concern' ? 'bg-red-500/10' : 'bg-blue-500/10'
              }`}
            >
              <p className={`font-medium ${
                rec.type === 'positive' ? 'text-green-400' : rec.type === 'concern' ? 'text-red-400' : 'text-blue-400'
              }`}>
                {rec.type === 'positive' ? '✓' : rec.type === 'concern' ? '⚠️' : '💡'} {rec.title}
              </p>
              <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentalControlsComponent;
