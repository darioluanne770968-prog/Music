import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 创作者经济 - 打赏/订阅/分成系统/收益分析

interface Creator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  subscribers: number;
  totalEarnings: number;
  monthlyEarnings: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  benefits: string[];
  subscriberCount: number;
  color: string;
}

interface Earning {
  id: string;
  type: 'tip' | 'subscription' | 'stream' | 'download' | 'nft' | 'merchandise';
  amount: number;
  currency: string;
  from?: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'withdrawn';
}

interface Payout {
  id: string;
  amount: number;
  method: 'bank' | 'paypal' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
}

interface Tip {
  id: string;
  amount: number;
  message: string;
  fromUser: string;
  fromAvatar: string;
  timestamp: Date;
}

// 订阅等级
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: '基础粉丝',
    price: 9.9,
    interval: 'monthly',
    benefits: ['专属粉丝徽章', '优先评论', '每月专属内容'],
    subscriberCount: 1234,
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'super',
    name: '超级粉丝',
    price: 29.9,
    interval: 'monthly',
    benefits: ['所有基础权益', '专属直播间', '幕后花絮', '作品抢先听'],
    subscriberCount: 456,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'vip',
    name: 'VIP粉丝',
    price: 99.9,
    interval: 'monthly',
    benefits: ['所有超级权益', '私信权限', '签名周边', '线下见面会优先'],
    subscriberCount: 78,
    color: 'from-purple-500 to-pink-500',
  },
];

// 打赏金额选项
const TIP_AMOUNTS = [1, 5, 10, 50, 100, 520];

// 模拟收益数据
const MOCK_EARNINGS: Earning[] = [
  { id: 'e1', type: 'tip', amount: 100, currency: 'CNY', from: '用户A', description: '打赏', timestamp: new Date(), status: 'completed' },
  { id: 'e2', type: 'subscription', amount: 29.9, currency: 'CNY', from: '用户B', description: '超级粉丝订阅', timestamp: new Date(), status: 'completed' },
  { id: 'e3', type: 'stream', amount: 500, currency: 'CNY', description: '流媒体播放分成', timestamp: new Date(), status: 'completed' },
  { id: 'e4', type: 'download', amount: 50, currency: 'CNY', description: '付费下载', timestamp: new Date(), status: 'completed' },
  { id: 'e5', type: 'nft', amount: 1000, currency: 'CNY', from: '用户C', description: 'NFT销售', timestamp: new Date(), status: 'pending' },
];

// 模拟打赏列表
const MOCK_TIPS: Tip[] = [
  { id: 't1', amount: 520, message: '太好听了！支持你！', fromUser: '音乐爱好者', fromAvatar: '🎵', timestamp: new Date() },
  { id: 't2', amount: 100, message: '期待新作品', fromUser: '忠实粉丝', fromAvatar: '❤️', timestamp: new Date() },
  { id: 't3', amount: 50, message: '加油！', fromUser: '新粉丝', fromAvatar: '🌟', timestamp: new Date() },
];

export const useCreatorEconomy = () => {
  const [creator, setCreator] = useState<Creator>({
    id: 'creator-1',
    name: '音乐创作者',
    avatar: '🎤',
    verified: true,
    followers: 12345,
    subscribers: 1768,
    totalEarnings: 58900,
    monthlyEarnings: 8900,
    tier: 'gold',
    badges: [
      { id: 'b1', name: '认证创作者', icon: '✓', description: '官方认证的创作者', earnedAt: new Date() },
      { id: 'b2', name: '人气创作者', icon: '🔥', description: '拥有超过1万粉丝', earnedAt: new Date() },
      { id: 'b3', name: '月度之星', icon: '⭐', description: '本月最受欢迎创作者', earnedAt: new Date() },
    ],
  });

  const [earnings, setEarnings] = useState<Earning[]>(MOCK_EARNINGS);
  const [tips, setTips] = useState<Tip[]>(MOCK_TIPS);
  const [subscriptionTiers, setSubscriptionTiers] = useState(SUBSCRIPTION_TIERS);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState(5890);

  // 发送打赏
  const sendTip = useCallback((amount: number, message: string) => {
    const newTip: Tip = {
      id: `tip-${Date.now()}`,
      amount,
      message,
      fromUser: '我',
      fromAvatar: '👤',
      timestamp: new Date(),
    };
    setTips(prev => [newTip, ...prev]);

    const newEarning: Earning = {
      id: `earning-${Date.now()}`,
      type: 'tip',
      amount,
      currency: 'CNY',
      from: '我',
      description: '打赏',
      timestamp: new Date(),
      status: 'completed',
    };
    setEarnings(prev => [newEarning, ...prev]);
    setBalance(prev => prev + amount * 0.7); // 平台抽成30%
  }, []);

  // 订阅
  const subscribe = useCallback((tierId: string) => {
    const tier = subscriptionTiers.find(t => t.id === tierId);
    if (!tier) return;

    setSubscriptionTiers(prev => prev.map(t =>
      t.id === tierId ? { ...t, subscriberCount: t.subscriberCount + 1 } : t
    ));

    const newEarning: Earning = {
      id: `earning-${Date.now()}`,
      type: 'subscription',
      amount: tier.price,
      currency: 'CNY',
      from: '新订阅用户',
      description: `${tier.name}订阅`,
      timestamp: new Date(),
      status: 'completed',
    };
    setEarnings(prev => [newEarning, ...prev]);
    setBalance(prev => prev + tier.price * 0.7);
  }, [subscriptionTiers]);

  // 更新订阅等级
  const updateSubscriptionTier = useCallback((tierId: string, updates: Partial<SubscriptionTier>) => {
    setSubscriptionTiers(prev => prev.map(t =>
      t.id === tierId ? { ...t, ...updates } : t
    ));
  }, []);

  // 请求提现
  const requestPayout = useCallback((amount: number, method: Payout['method']) => {
    if (amount > balance) return false;

    const newPayout: Payout = {
      id: `payout-${Date.now()}`,
      amount,
      method,
      status: 'pending',
      requestedAt: new Date(),
    };
    setPayouts(prev => [newPayout, ...prev]);
    setBalance(prev => prev - amount);
    return true;
  }, [balance]);

  // 获取收益统计
  const getEarningsStats = useCallback(() => {
    const now = new Date();
    const thisMonth = earnings.filter(e => {
      const date = new Date(e.timestamp);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const byType = earnings.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: earnings.reduce((sum, e) => sum + e.amount, 0),
      thisMonth: thisMonth.reduce((sum, e) => sum + e.amount, 0),
      byType,
      pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    };
  }, [earnings]);

  return {
    creator,
    earnings,
    tips,
    subscriptionTiers,
    payouts,
    balance,
    sendTip,
    subscribe,
    updateSubscriptionTier,
    requestPayout,
    getEarningsStats,
  };
};

// 收益卡片
const EarningsCard: React.FC<{
  title: string;
  amount: number;
  trend?: number;
  icon: string;
}> = ({ title, amount, trend, icon }) => {
  return (
    <motion.div
      className="bg-slate-800/50 rounded-2xl p-6"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">¥{amount.toLocaleString()}</div>
      <div className="text-gray-400 text-sm">{title}</div>
    </motion.div>
  );
};

// 订阅等级卡片
const SubscriptionTierCard: React.FC<{
  tier: SubscriptionTier;
  onEdit: () => void;
}> = ({ tier, onEdit }) => {
  return (
    <motion.div
      className={`bg-gradient-to-br ${tier.color} p-6 rounded-2xl`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
        <motion.button
          className="p-2 bg-white/20 rounded-lg"
          whileHover={{ scale: 1.1 }}
          onClick={onEdit}
        >
          ⚙️
        </motion.button>
      </div>

      <div className="text-3xl font-bold text-white mb-2">
        ¥{tier.price}
        <span className="text-sm font-normal text-white/70">/{tier.interval === 'monthly' ? '月' : '年'}</span>
      </div>

      <div className="text-white/80 text-sm mb-4">
        {tier.subscriberCount} 位订阅者
      </div>

      <ul className="space-y-2">
        {tier.benefits.map((benefit, i) => (
          <li key={i} className="text-white/90 text-sm flex items-center gap-2">
            <span>✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// 打赏列表
const TipList: React.FC<{
  tips: Tip[];
}> = ({ tips }) => {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">最近打赏</h3>
      <div className="space-y-4">
        {tips.map(tip => (
          <motion.div
            key={tip.id}
            className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
              {tip.fromAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{tip.fromUser}</span>
                <span className="text-yellow-400 font-bold">¥{tip.amount}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{tip.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 收益明细
const EarningsHistory: React.FC<{
  earnings: Earning[];
}> = ({ earnings }) => {
  const typeIcons: Record<string, string> = {
    tip: '💝',
    subscription: '⭐',
    stream: '🎵',
    download: '📥',
    nft: '🖼️',
    merchandise: '👕',
  };

  const typeNames: Record<string, string> = {
    tip: '打赏',
    subscription: '订阅',
    stream: '播放分成',
    download: '下载收入',
    nft: 'NFT销售',
    merchandise: '周边销售',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">收益明细</h3>
      <div className="space-y-3">
        {earnings.slice(0, 10).map(earning => (
          <div
            key={earning.id}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeIcons[earning.type]}</span>
              <div>
                <div className="text-white font-medium">{typeNames[earning.type]}</div>
                <div className="text-gray-400 text-sm">{earning.from || earning.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">+¥{earning.amount}</div>
              <div className={`text-xs ${
                earning.status === 'completed' ? 'text-green-400' :
                earning.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {earning.status === 'completed' ? '已到账' :
                 earning.status === 'pending' ? '待确认' : '已提现'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 提现面板
const WithdrawPanel: React.FC<{
  balance: number;
  onWithdraw: (amount: number, method: Payout['method']) => boolean;
}> = ({ balance, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Payout['method']>('bank');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (onWithdraw(numAmount, method)) {
      setShowSuccess(true);
      setAmount('');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">提现</h3>

      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-1">可提现余额</div>
        <div className="text-3xl font-bold text-white">¥{balance.toLocaleString()}</div>
      </div>

      <div className="mb-4">
        <label className="text-gray-400 text-sm mb-2 block">提现金额</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white"
          placeholder="输入金额"
        />
        <div className="flex gap-2 mt-2">
          {[100, 500, 1000].map(preset => (
            <button
              key={preset}
              className="px-3 py-1 bg-slate-700 rounded-lg text-gray-400 text-sm"
              onClick={() => setAmount(preset.toString())}
            >
              ¥{preset}
            </button>
          ))}
          <button
            className="px-3 py-1 bg-slate-700 rounded-lg text-cyan-400 text-sm"
            onClick={() => setAmount(balance.toString())}
          >
            全部
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">提现方式</label>
        <div className="flex gap-2">
          {[
            { id: 'bank', name: '银行卡', icon: '🏦' },
            { id: 'paypal', name: 'PayPal', icon: '💳' },
            { id: 'crypto', name: '加密货币', icon: '₿' },
          ].map(m => (
            <button
              key={m.id}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                method === m.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-400'
              }`}
              onClick={() => setMethod(m.id as Payout['method'])}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleWithdraw}
      >
        申请提现
      </motion.button>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✓ 提现申请已提交，预计1-3个工作日到账
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 收益图表
const EarningsChart: React.FC<{
  data: { date: string; amount: number }[];
}> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">收益趋势</h3>
      <div className="h-48 flex items-end gap-1">
        {data.map((item, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg relative group"
            initial={{ height: 0 }}
            animate={{ height: `${(item.amount / maxAmount) * 100}%` }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ¥{item.amount}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-gray-400 text-xs">
        {data.slice(0, 7).map((item, i) => (
          <span key={i}>{item.date}</span>
        ))}
      </div>
    </div>
  );
};

// 打赏弹窗
const TipModal: React.FC<{
  creatorName: string;
  onTip: (amount: number, message: string) => void;
  onClose: () => void;
}> = ({ creatorName, onTip, onClose }) => {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleTip = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (finalAmount > 0) {
      onTip(finalAmount, message || '感谢你的创作！');
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">打赏 {creatorName}</h3>
        <p className="text-gray-400 text-sm mb-6">您的支持是创作者最大的动力</p>

        {/* 金额选择 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {TIP_AMOUNTS.map(amt => (
            <motion.button
              key={amt}
              className={`py-3 rounded-xl font-bold ${
                amount === amt && !customAmount
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-slate-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setAmount(amt);
                setCustomAmount('');
              }}
            >
              ¥{amt}
            </motion.button>
          ))}
        </div>

        {/* 自定义金额 */}
        <div className="mb-4">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white"
            placeholder="自定义金额"
          />
        </div>

        {/* 留言 */}
        <div className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white"
            rows={3}
            placeholder="留言给创作者（可选）"
          />
        </div>

        <div className="flex gap-4">
          <button
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
            onClick={onClose}
          >
            取消
          </button>
          <motion.button
            className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTip}
          >
            打赏 ¥{customAmount || amount}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 主组件
export const CreatorEconomy: React.FC = () => {
  const {
    creator,
    earnings,
    tips,
    subscriptionTiers,
    balance,
    sendTip,
    requestPayout,
    getEarningsStats,
  } = useCreatorEconomy();

  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'subscriptions' | 'withdraw'>('overview');
  const [showTipModal, setShowTipModal] = useState(false);

  const stats = getEarningsStats();

  // 模拟图表数据
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    date: ['一', '二', '三', '四', '五', '六', '日'][i],
    amount: Math.floor(Math.random() * 1000) + 500,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 创作者信息 */}
        <div className="bg-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-5xl">
              {creator.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{creator.name}</h1>
                {creator.verified && (
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                    ✓ 认证创作者
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  creator.tier === 'diamond' ? 'bg-purple-500/20 text-purple-400' :
                  creator.tier === 'platinum' ? 'bg-gray-300/20 text-gray-300' :
                  creator.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  creator.tier === 'silver' ? 'bg-gray-400/20 text-gray-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {creator.tier.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-6 text-gray-400">
                <span>👥 {creator.followers.toLocaleString()} 粉丝</span>
                <span>⭐ {creator.subscribers.toLocaleString()} 订阅者</span>
                <span>💰 总收益 ¥{creator.totalEarnings.toLocaleString()}</span>
              </div>
            </div>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTipModal(true)}
            >
              💝 打赏
            </motion.button>
          </div>

          {/* 徽章 */}
          <div className="flex gap-3 mt-4">
            {creator.badges.map(badge => (
              <div
                key={badge.id}
                className="px-3 py-2 bg-slate-700/50 rounded-xl flex items-center gap-2"
                title={badge.description}
              >
                <span>{badge.icon}</span>
                <span className="text-white text-sm">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1">
          {[
            { id: 'overview', name: '概览', icon: '📊' },
            { id: 'earnings', name: '收益', icon: '💰' },
            { id: 'subscriptions', name: '订阅', icon: '⭐' },
            { id: 'withdraw', name: '提现', icon: '🏦' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 收益卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <EarningsCard title="总收益" amount={stats.total} icon="💰" trend={12} />
                <EarningsCard title="本月收益" amount={stats.thisMonth} icon="📈" trend={8} />
                <EarningsCard title="待结算" amount={stats.pending} icon="⏳" />
                <EarningsCard title="可提现" amount={balance} icon="💳" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EarningsChart data={chartData} />
                <TipList tips={tips} />
              </div>

              {/* 收益来源分布 */}
              <div className="bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">收益来源</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(stats.byType).map(([type, amount]) => (
                    <div key={type} className="text-center p-4 bg-slate-700/30 rounded-xl">
                      <div className="text-2xl mb-2">
                        {type === 'tip' ? '💝' :
                         type === 'subscription' ? '⭐' :
                         type === 'stream' ? '🎵' :
                         type === 'download' ? '📥' :
                         type === 'nft' ? '🖼️' : '👕'}
                      </div>
                      <div className="text-white font-bold">¥{amount}</div>
                      <div className="text-gray-400 text-sm">
                        {type === 'tip' ? '打赏' :
                         type === 'subscription' ? '订阅' :
                         type === 'stream' ? '播放' :
                         type === 'download' ? '下载' :
                         type === 'nft' ? 'NFT' : '周边'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EarningsHistory earnings={earnings} />
            </motion.div>
          )}

          {activeTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {subscriptionTiers.map(tier => (
                <SubscriptionTierCard
                  key={tier.id}
                  tier={tier}
                  onEdit={() => {}}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <WithdrawPanel balance={balance} onWithdraw={requestPayout} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 打赏弹窗 */}
        <AnimatePresence>
          {showTipModal && (
            <TipModal
              creatorName={creator.name}
              onTip={sendTip}
              onClose={() => setShowTipModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatorEconomy;
