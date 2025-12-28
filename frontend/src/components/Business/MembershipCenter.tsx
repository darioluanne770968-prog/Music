import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 会员中心组件
 * 会员等级、权益、积分系统
 */

// 会员等级
type MemberLevel = 'free' | 'basic' | 'premium' | 'ultimate' | 'family'

// 会员信息
interface Membership {
  level: MemberLevel
  points: number
  expireDate: Date | null
  autoRenew: boolean
  daysRemaining: number | null
}

// 权益
interface Benefit {
  id: string
  icon: string
  title: string
  description: string
  levels: MemberLevel[]
}

// 订阅方案
interface SubscriptionPlan {
  id: string
  level: MemberLevel
  name: string
  price: number
  originalPrice?: number
  period: 'monthly' | 'quarterly' | 'yearly'
  features: string[]
  isPopular?: boolean
}

// 积分任务
interface PointTask {
  id: string
  icon: string
  title: string
  points: number
  description: string
  completed: boolean
  progress?: { current: number; target: number }
}

// 积分商品
interface RewardItem {
  id: string
  name: string
  image: string
  points: number
  stock: number
  category: 'coupon' | 'gift' | 'digital' | 'physical'
}

// 会员 Hook
export function useMembership() {
  const [membership, setMembership] = useState<Membership>({
    level: 'premium',
    points: 2580,
    expireDate: new Date('2024-12-31'),
    autoRenew: true,
    daysRemaining: 180
  })

  // 会员等级配置
  const levelConfig: Record<MemberLevel, { name: string; color: string; icon: string; gradient: string }> = {
    free: { name: '普通用户', color: '#9ca3af', icon: '🎵', gradient: 'from-gray-400 to-gray-500' },
    basic: { name: '基础会员', color: '#10b981', icon: '🎶', gradient: 'from-green-400 to-teal-500' },
    premium: { name: '高级会员', color: '#8b5cf6', icon: '👑', gradient: 'from-purple-400 to-indigo-500' },
    ultimate: { name: '至尊会员', color: '#f59e0b', icon: '💎', gradient: 'from-yellow-400 to-orange-500' },
    family: { name: '家庭套餐', color: '#ec4899', icon: '👨‍👩‍👧‍👦', gradient: 'from-pink-400 to-rose-500' }
  }

  // 权益列表
  const benefits: Benefit[] = [
    { id: 'b1', icon: '🎵', title: '无损音质', description: '享受最高品质音乐', levels: ['basic', 'premium', 'ultimate', 'family'] },
    { id: 'b2', icon: '🚫', title: '免广告', description: '纯净听歌体验', levels: ['basic', 'premium', 'ultimate', 'family'] },
    { id: 'b3', icon: '📥', title: '无限下载', description: '离线听歌无限制', levels: ['premium', 'ultimate', 'family'] },
    { id: 'b4', icon: '🎤', title: 'K歌功能', description: '全功能卡拉OK', levels: ['premium', 'ultimate', 'family'] },
    { id: 'b5', icon: '🎧', title: '空间音频', description: '沉浸式3D音效', levels: ['premium', 'ultimate', 'family'] },
    { id: 'b6', icon: '🎨', title: '专属主题', description: '限定主题皮肤', levels: ['ultimate'] },
    { id: 'b7', icon: '🎫', title: '优先购票', description: '演唱会优先购买', levels: ['ultimate'] },
    { id: 'b8', icon: '💬', title: '专属客服', description: '1对1VIP服务', levels: ['ultimate'] },
    { id: 'b9', icon: '👥', title: '多人共享', description: '最多6人共享', levels: ['family'] },
    { id: 'b10', icon: '👶', title: '儿童模式', description: '安全健康内容', levels: ['family'] }
  ]

  // 订阅方案
  const plans: SubscriptionPlan[] = [
    {
      id: 'basic_monthly',
      level: 'basic',
      name: '基础会员',
      price: 15,
      period: 'monthly',
      features: ['无损音质', '免广告', '基础下载']
    },
    {
      id: 'premium_monthly',
      level: 'premium',
      name: '高级会员',
      price: 25,
      period: 'monthly',
      features: ['无损音质', '免广告', '无限下载', 'K歌功能', '空间音频'],
      isPopular: true
    },
    {
      id: 'premium_yearly',
      level: 'premium',
      name: '高级会员年卡',
      price: 228,
      originalPrice: 300,
      period: 'yearly',
      features: ['无损音质', '免广告', '无限下载', 'K歌功能', '空间音频', '专属徽章']
    },
    {
      id: 'ultimate_monthly',
      level: 'ultimate',
      name: '至尊会员',
      price: 40,
      period: 'monthly',
      features: ['全部高级权益', '专属主题', '优先购票', '专属客服', '2倍积分']
    },
    {
      id: 'family_monthly',
      level: 'family',
      name: '家庭套餐',
      price: 45,
      period: 'monthly',
      features: ['6人共享', '全部高级权益', '儿童模式', '家长控制']
    }
  ]

  // 积分任务
  const tasks: PointTask[] = [
    { id: 't1', icon: '✅', title: '每日签到', points: 5, description: '每天签到获取积分', completed: true },
    { id: 't2', icon: '🎵', title: '听歌30分钟', points: 10, description: '每日听歌任务', completed: false, progress: { current: 18, target: 30 } },
    { id: 't3', icon: '📤', title: '分享歌曲', points: 5, description: '分享任意歌曲', completed: false },
    { id: 't4', icon: '❤️', title: '收藏10首歌', points: 10, description: '本周收藏任务', completed: false, progress: { current: 7, target: 10 } },
    { id: 't5', icon: '👥', title: '邀请好友', points: 100, description: '邀请新用户注册', completed: false }
  ]

  // 积分商品
  const rewards: RewardItem[] = [
    { id: 'r1', name: '7天会员体验卡', image: '🎫', points: 200, stock: 999, category: 'digital' },
    { id: 'r2', name: '专属头像框', image: '🖼️', points: 500, stock: 100, category: 'digital' },
    { id: 'r3', name: '演唱会门票5折券', image: '🎟️', points: 1000, stock: 50, category: 'coupon' },
    { id: 'r4', name: '限定实体专辑', image: '💿', points: 5000, stock: 10, category: 'physical' },
    { id: 'r5', name: '签名海报', image: '🎨', points: 8000, stock: 5, category: 'physical' }
  ]

  // 升级会员
  const upgradeMembership = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setMembership(prev => ({
        ...prev,
        level: plan.level,
        expireDate: new Date(Date.now() + (plan.period === 'yearly' ? 365 : plan.period === 'quarterly' ? 90 : 30) * 24 * 60 * 60 * 1000)
      }))
    }
  }

  // 完成任务
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      setMembership(prev => ({
        ...prev,
        points: prev.points + task.points
      }))
    }
  }

  // 兑换商品
  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (reward && membership.points >= reward.points) {
      setMembership(prev => ({
        ...prev,
        points: prev.points - reward.points
      }))
      return true
    }
    return false
  }

  return {
    membership,
    levelConfig,
    benefits,
    plans,
    tasks,
    rewards,
    upgradeMembership,
    completeTask,
    redeemReward
  }
}

// 会员卡片
const MemberCard: React.FC<{
  membership: Membership
  levelConfig: Record<MemberLevel, { name: string; color: string; icon: string; gradient: string }>
}> = ({ membership, levelConfig }) => {
  const config = levelConfig[membership.level]

  return (
    <motion.div
      className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-6 relative overflow-hidden`}
      whileHover={{ scale: 1.02 }}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <span className="text-8xl">{config.icon}</span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-white font-bold text-xl">{config.name}</h3>
            {membership.expireDate && (
              <p className="text-white/80 text-sm">
                {membership.daysRemaining} 天后到期
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">我的积分</p>
            <p className="text-white font-bold text-2xl">{membership.points.toLocaleString()}</p>
          </div>

          {membership.autoRenew && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
              自动续费中
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 权益网格
const BenefitsGrid: React.FC<{
  benefits: Benefit[]
  currentLevel: MemberLevel
}> = ({ benefits, currentLevel }) => {
  const levelOrder: MemberLevel[] = ['free', 'basic', 'premium', 'ultimate', 'family']
  const currentIndex = levelOrder.indexOf(currentLevel)

  return (
    <div className="grid grid-cols-2 gap-3">
      {benefits.map(benefit => {
        const isUnlocked = benefit.levels.includes(currentLevel)

        return (
          <div
            key={benefit.id}
            className={`p-4 rounded-xl ${
              isUnlocked ? 'bg-primary-500/20' : 'bg-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{benefit.icon}</span>
              <span className="text-white font-medium">{benefit.title}</span>
            </div>
            <p className="text-sm text-white/60">{benefit.description}</p>
            {!isUnlocked && (
              <p className="text-xs text-primary-400 mt-2">
                升级 {benefit.levels[0]} 解锁
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 订阅方案卡片
const PlanCard: React.FC<{
  plan: SubscriptionPlan
  isCurrentPlan: boolean
  onSelect: () => void
}> = ({ plan, isCurrentPlan, onSelect }) => {
  const periodLabels = {
    monthly: '月',
    quarterly: '季',
    yearly: '年'
  }

  return (
    <motion.div
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isCurrentPlan
          ? 'border-primary-500 bg-primary-500/10'
          : plan.isPopular
          ? 'border-yellow-500/50 bg-yellow-500/5'
          : 'border-white/10 bg-white/5 hover:border-white/30'
      }`}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1
                       bg-yellow-500 text-black text-xs font-bold rounded-full">
          最受欢迎
        </span>
      )}

      <h4 className="text-white font-bold mb-2">{plan.name}</h4>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-primary-400">¥{plan.price}</span>
        <span className="text-white/40">/{periodLabels[plan.period]}</span>
        {plan.originalPrice && (
          <span className="text-sm text-white/40 line-through ml-2">
            ¥{plan.originalPrice}
          </span>
        )}
      </div>

      <ul className="space-y-1">
        {plan.features.slice(0, 3).map((feature, i) => (
          <li key={i} className="text-sm text-white/60 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {feature}
          </li>
        ))}
        {plan.features.length > 3 && (
          <li className="text-sm text-white/40">
            +{plan.features.length - 3} 项权益
          </li>
        )}
      </ul>

      <button
        className={`w-full mt-4 py-2 rounded-lg text-sm font-medium ${
          isCurrentPlan
            ? 'bg-white/10 text-white/60 cursor-not-allowed'
            : 'bg-primary-500 text-white'
        }`}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? '当前方案' : '立即订阅'}
      </button>
    </motion.div>
  )
}

// 积分任务
const PointTasks: React.FC<{
  tasks: PointTask[]
  onComplete: (taskId: string) => void
}> = ({ tasks, onComplete }) => {
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`p-4 rounded-xl flex items-center gap-4 ${
            task.completed ? 'bg-green-500/10' : 'bg-white/5'
          }`}
        >
          <span className="text-2xl">{task.icon}</span>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">{task.title}</span>
              <span className="text-primary-400">+{task.points}</span>
            </div>

            {task.progress && !task.completed && (
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(task.progress.current / task.progress.target) * 100}%` }}
                />
              </div>
            )}

            {!task.progress && (
              <p className="text-sm text-white/40">{task.description}</p>
            )}
          </div>

          {task.completed ? (
            <span className="text-green-400">✓ 已完成</span>
          ) : (
            <button
              onClick={() => onComplete(task.id)}
              className="px-4 py-1 bg-primary-500 rounded-full text-sm text-white"
            >
              领取
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// 积分商城
const PointShop: React.FC<{
  rewards: RewardItem[]
  currentPoints: number
  onRedeem: (rewardId: string) => void
}> = ({ rewards, currentPoints, onRedeem }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {rewards.map(reward => {
        const canAfford = currentPoints >= reward.points

        return (
          <motion.div
            key={reward.id}
            className="p-4 bg-white/5 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-4xl text-center mb-3">{reward.image}</div>
            <h4 className="text-white font-medium text-center mb-1">{reward.name}</h4>
            <p className="text-center text-primary-400 font-bold mb-3">
              {reward.points.toLocaleString()} 积分
            </p>
            <button
              onClick={() => canAfford && onRedeem(reward.id)}
              disabled={!canAfford}
              className={`w-full py-2 rounded-lg text-sm ${
                canAfford
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {canAfford ? '立即兑换' : '积分不足'}
            </button>
            <p className="text-xs text-white/40 text-center mt-2">
              剩余 {reward.stock} 件
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}

// 主界面
interface MembershipCenterProps {
  className?: string
}

export const MembershipCenter: React.FC<MembershipCenterProps> = ({ className }) => {
  const {
    membership,
    levelConfig,
    benefits,
    plans,
    tasks,
    rewards,
    upgradeMembership,
    completeTask,
    redeemReward
  } = useMembership()

  const [activeTab, setActiveTab] = useState<'benefits' | 'plans' | 'points'>('benefits')

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 会员卡 */}
      <MemberCard membership={membership} levelConfig={levelConfig} />

      {/* 标签页 */}
      <div className="flex gap-2 mt-6 mb-4">
        {[
          { key: 'benefits', label: '我的权益' },
          { key: 'plans', label: '升级会员' },
          { key: 'points', label: '积分中心' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <AnimatePresence mode="wait">
        {activeTab === 'benefits' && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BenefitsGrid benefits={benefits} currentLevel={membership.level} />
          </motion.div>
        )}

        {activeTab === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-4"
          >
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.level === membership.level && plan.period === 'monthly'}
                onSelect={() => upgradeMembership(plan.id)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'points' && (
          <motion.div
            key="points"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h4 className="text-white font-medium mb-3">每日任务</h4>
              <PointTasks tasks={tasks} onComplete={completeTask} />
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">积分商城</h4>
              <PointShop
                rewards={rewards}
                currentPoints={membership.points}
                onRedeem={redeemReward}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MembershipCenter
