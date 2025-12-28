import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DAOGovernance, DAOProposal, DAOMember } from '../../types/web3';

interface DAOGovernanceProps {
  dao: DAOGovernance;
  userVotingPower: number;
  onVote: (proposalId: string, vote: 'for' | 'against' | 'abstain') => void;
  onDelegate: (toAddress: string) => void;
  onCreateProposal: (proposal: Partial<DAOProposal>) => void;
}

const DEMO_DAO: DAOGovernance = {
  id: '1',
  name: '汽水音乐DAO',
  treasury: 5000000,
  members: 128500,
  proposals: [
    {
      id: '1',
      title: '增加音乐人分成比例',
      description: '提议将音乐人的平台收入分成从70%提高到75%，以更好地支持创作者生态。',
      proposer: '0x1234...5678',
      category: 'treasury',
      status: 'active',
      votesFor: 45000,
      votesAgainst: 12000,
      votesAbstain: 3000,
      quorum: 50000,
      startTime: new Date(Date.now() - 86400000 * 2),
      endTime: new Date(Date.now() + 86400000 * 5),
      transactions: [],
    },
    {
      id: '2',
      title: '推出NFT音乐收藏系列',
      description: '与顶级艺人合作推出限量版NFT音乐收藏品，收益用于社区建设。',
      proposer: '0xabcd...efgh',
      category: 'feature',
      status: 'active',
      votesFor: 38000,
      votesAgainst: 8000,
      votesAbstain: 2000,
      quorum: 50000,
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(Date.now() + 86400000 * 6),
      transactions: [],
    },
    {
      id: '3',
      title: '新增社区音乐人扶持计划',
      description: '从社区基金中拨款100万支持新兴音乐人发展。',
      proposer: '0x9876...5432',
      category: 'artist_grant',
      status: 'passed',
      votesFor: 62000,
      votesAgainst: 5000,
      votesAbstain: 3000,
      quorum: 50000,
      startTime: new Date(Date.now() - 86400000 * 10),
      endTime: new Date(Date.now() - 86400000 * 3),
      executionTime: new Date(Date.now() - 86400000),
      transactions: [],
    },
  ],
  votingRules: {
    minVotingPower: 100,
    quorumPercentage: 40,
    passingThreshold: 60,
    votingPeriod: 7,
    executionDelay: 2,
    delegationEnabled: true,
  },
  councils: [],
};

export const DAOGovernancePanel: React.FC<DAOGovernanceProps> = ({
  dao = DEMO_DAO,
  userVotingPower = 1500,
  onVote,
  onDelegate,
  onCreateProposal,
}) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'treasury' | 'members'>('proposals');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<DAOProposal | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => `$${formatNumber(num)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'passed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'executed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '投票中';
      case 'passed': return '已通过';
      case 'rejected': return '已否决';
      case 'executed': return '已执行';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treasury': return '💰';
      case 'governance': return '🏛️';
      case 'feature': return '⚡';
      case 'partnership': return '🤝';
      case 'artist_grant': return '🎵';
      case 'community': return '👥';
      case 'technical': return '⚙️';
      default: return '📋';
    }
  };

  const filteredProposals = dao.proposals.filter(
    p => filterStatus === 'all' || p.status === filterStatus
  );

  const calculateProgress = (proposal: DAOProposal) => {
    const total = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    return {
      for: (proposal.votesFor / proposal.quorum) * 100,
      against: (proposal.votesAgainst / proposal.quorum) * 100,
      quorumProgress: (total / proposal.quorum) * 100,
    };
  };

  const getTimeRemaining = (endTime: Date) => {
    const diff = endTime.getTime() - Date.now();
    if (diff <= 0) return '已结束';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}天 ${hours}小时` : `${hours}小时`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{dao.name}</h2>
            <p className="text-sm text-gray-400">去中心化治理</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium"
        >
          ➕ 创建提案
        </motion.button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '国库资金', value: formatCurrency(dao.treasury), icon: '💎', color: 'from-blue-500 to-cyan-500' },
          { label: '社区成员', value: formatNumber(dao.members), icon: '👥', color: 'from-purple-500 to-pink-500' },
          { label: '我的票权', value: formatNumber(userVotingPower), icon: '🗳️', color: 'from-amber-500 to-orange-500' },
          { label: '活跃提案', value: dao.proposals.filter(p => p.status === 'active').length, icon: '📋', color: 'from-green-500 to-emerald-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-white/70 text-sm">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'proposals', label: '提案', icon: '📋' },
          { id: 'treasury', label: '国库', icon: '💰' },
          { id: 'members', label: '成员', icon: '👥' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 提案列表 */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {/* 筛选 */}
          <div className="flex gap-2">
            {['all', 'active', 'passed', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterStatus === status
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {status === 'all' ? '全部' : getStatusText(status)}
              </button>
            ))}
          </div>

          {/* 提案卡片 */}
          <div className="space-y-4">
            {filteredProposals.map((proposal) => {
              const progress = calculateProgress(proposal);
              return (
                <motion.div
                  key={proposal.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedProposal(proposal)}
                  className="bg-white/5 rounded-2xl p-5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getCategoryIcon(proposal.category)}</span>
                      <div>
                        <h3 className="text-lg font-medium text-white">{proposal.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{proposal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(proposal.status)}`}>
                        {getStatusText(proposal.status)}
                      </span>
                    </div>
                  </div>

                  {/* 投票进度 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">赞成 {formatNumber(proposal.votesFor)}</span>
                      <span className="text-red-400">反对 {formatNumber(proposal.votesAgainst)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min(progress.for, 100)}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(progress.against, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>法定人数: {Math.min(progress.quorumProgress, 100).toFixed(1)}%</span>
                      <span>剩余: {getTimeRemaining(proposal.endTime)}</span>
                    </div>
                  </div>

                  {/* 投票按钮 */}
                  {proposal.status === 'active' && (
                    <div className="flex gap-2 mt-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onVote(proposal.id, 'for');
                        }}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30"
                      >
                        👍 赞成
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onVote(proposal.id, 'against');
                        }}
                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30"
                      >
                        👎 反对
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onVote(proposal.id, 'abstain');
                        }}
                        className="py-2 px-4 bg-gray-500/20 text-gray-400 rounded-xl hover:bg-gray-500/30"
                      >
                        弃权
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 国库 */}
      {activeTab === 'treasury' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-6">
            <p className="text-gray-400 mb-2">国库总资金</p>
            <p className="text-4xl font-bold text-white">${dao.treasury.toLocaleString()}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-green-400">+$125,000 本月收入</span>
              <span className="text-red-400">-$45,000 本月支出</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">资金分配</h3>
            <div className="space-y-3">
              {[
                { label: '音乐人扶持', amount: 2000000, percent: 40, color: 'bg-pink-500' },
                { label: '平台开发', amount: 1500000, percent: 30, color: 'bg-blue-500' },
                { label: '市场推广', amount: 1000000, percent: 20, color: 'bg-green-500' },
                { label: '储备金', amount: 500000, percent: 10, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-white flex-1">{item.label}</span>
                  <span className="text-gray-400">{formatCurrency(item.amount)}</span>
                  <span className="text-gray-500 w-12 text-right">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">最近交易</h3>
            <div className="space-y-2">
              {[
                { type: 'out', desc: '音乐人月度分成', amount: 25000, date: '2天前' },
                { type: 'in', desc: 'NFT销售收入', amount: 50000, date: '3天前' },
                { type: 'out', desc: '社区活动赞助', amount: 10000, date: '5天前' },
                { type: 'in', desc: '订阅收入分成', amount: 75000, date: '1周前' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <span className={`text-xl ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'in' ? '📥' : '📤'}
                  </span>
                  <span className="text-white flex-1">{tx.desc}</span>
                  <span className={tx.type === 'in' ? 'text-green-400' : 'text-red-400'}>
                    {tx.type === 'in' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">{tx.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 成员 */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 rounded-2xl p-4">
              <p className="text-gray-400 text-sm">总成员</p>
              <p className="text-2xl font-bold text-white">{formatNumber(dao.members)}</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-4">
              <p className="text-gray-400 text-sm">总票权</p>
              <p className="text-2xl font-bold text-white">{formatNumber(dao.members * 100)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">票权排行</h3>
            <div className="space-y-3">
              {[
                { rank: 1, address: '0x1234...5678', power: 125000, percent: 2.5 },
                { rank: 2, address: '0xabcd...efgh', power: 98000, percent: 1.96 },
                { rank: 3, address: '0x9876...5432', power: 75000, percent: 1.5 },
                { rank: 4, address: '0xfedc...ba98', power: 62000, percent: 1.24 },
                { rank: 5, address: '0x5555...6666', power: 58000, percent: 1.16 },
              ].map((member) => (
                <div key={member.rank} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    member.rank === 1 ? 'bg-amber-500 text-white' :
                    member.rank === 2 ? 'bg-gray-400 text-white' :
                    member.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {member.rank}
                  </span>
                  <span className="text-white font-mono flex-1">{member.address}</span>
                  <span className="text-white">{formatNumber(member.power)}</span>
                  <span className="text-gray-500 w-16 text-right">{member.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 委托投票 */}
          <div className="bg-indigo-500/10 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-2">委托投票</h3>
            <p className="text-gray-400 text-sm mb-4">
              将你的投票权委托给信任的社区成员，让他们代表你参与治理决策。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入委托地址 (0x...)"
                className="flex-1 bg-white/10 rounded-xl px-4 py-2 text-white outline-none"
              />
              <button className="px-4 py-2 bg-indigo-500 rounded-xl text-white">
                委托
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAOGovernancePanel;
