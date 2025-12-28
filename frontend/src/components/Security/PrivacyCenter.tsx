import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 隐私安全中心组件
 * 端到端加密、匿名模式、家长控制、双因素认证
 */

// 隐私设置
interface PrivacySettings {
  // 账户安全
  twoFactorEnabled: boolean
  twoFactorMethod: '短信' | '邮箱' | '验证器' | null
  loginNotifications: boolean
  trustedDevices: TrustedDevice[]
  loginHistory: LoginRecord[]

  // 隐私选项
  anonymousMode: boolean
  hideListeningActivity: boolean
  hidePlaylist: boolean
  hideFollowers: boolean
  blockRecommendations: boolean
  dataSharing: boolean

  // 家长控制
  parentalControlEnabled: boolean
  parentalPin: string | null
  contentFilter: 'off' | 'moderate' | 'strict'
  playTimeLimit: number | null
  allowedHours: { start: number; end: number } | null

  // 加密
  endToEndEncryption: boolean
  encryptDownloads: boolean
  secureBackup: boolean
}

// 可信设备
interface TrustedDevice {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'computer' | 'tv'
  lastActive: Date
  location: string
  isCurrent: boolean
}

// 登录记录
interface LoginRecord {
  id: string
  device: string
  location: string
  ip: string
  time: Date
  status: 'success' | 'failed' | 'blocked'
}

// 安全状态
interface SecurityScore {
  score: number
  level: 'low' | 'medium' | 'high'
  suggestions: string[]
}

// 隐私中心 Hook
export function usePrivacyCenter() {
  const [settings, setSettings] = useState<PrivacySettings>({
    twoFactorEnabled: true,
    twoFactorMethod: '验证器',
    loginNotifications: true,
    trustedDevices: [
      { id: 'd1', name: 'iPhone 15 Pro', type: 'phone', lastActive: new Date(), location: '北京', isCurrent: true },
      { id: 'd2', name: 'MacBook Pro', type: 'computer', lastActive: new Date(Date.now() - 86400000), location: '北京', isCurrent: false },
      { id: 'd3', name: 'iPad Air', type: 'tablet', lastActive: new Date(Date.now() - 604800000), location: '上海', isCurrent: false }
    ],
    loginHistory: [
      { id: 'l1', device: 'iPhone 15 Pro', location: '北京', ip: '123.456.xxx.xxx', time: new Date(), status: 'success' },
      { id: 'l2', device: 'MacBook Pro', location: '北京', ip: '123.456.xxx.xxx', time: new Date(Date.now() - 86400000), status: 'success' },
      { id: 'l3', device: '未知设备', location: '广州', ip: '111.222.xxx.xxx', time: new Date(Date.now() - 172800000), status: 'blocked' }
    ],
    anonymousMode: false,
    hideListeningActivity: false,
    hidePlaylist: false,
    hideFollowers: false,
    blockRecommendations: false,
    dataSharing: true,
    parentalControlEnabled: false,
    parentalPin: null,
    contentFilter: 'off',
    playTimeLimit: null,
    allowedHours: null,
    endToEndEncryption: true,
    encryptDownloads: true,
    secureBackup: false
  })

  // 计算安全评分
  const securityScore: SecurityScore = (() => {
    let score = 0
    const suggestions: string[] = []

    if (settings.twoFactorEnabled) score += 30
    else suggestions.push('开启双因素认证')

    if (settings.loginNotifications) score += 10
    else suggestions.push('开启登录通知')

    if (settings.endToEndEncryption) score += 20
    else suggestions.push('开启端到端加密')

    if (settings.encryptDownloads) score += 10

    if (!settings.dataSharing) score += 10
    else suggestions.push('关闭数据共享以提高隐私')

    if (settings.trustedDevices.length <= 3) score += 10
    else suggestions.push('清理不常用的设备')

    score += 10 // 基础分

    return {
      score,
      level: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
      suggestions
    }
  })()

  // 更新设置
  const updateSettings = useCallback(<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // 移除设备
  const removeDevice = useCallback((deviceId: string) => {
    setSettings(prev => ({
      ...prev,
      trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId)
    }))
  }, [])

  // 启用双因素
  const enable2FA = useCallback((method: '短信' | '邮箱' | '验证器') => {
    setSettings(prev => ({
      ...prev,
      twoFactorEnabled: true,
      twoFactorMethod: method
    }))
  }, [])

  // 设置家长控制
  const setParentalControl = useCallback((pin: string, filter: 'moderate' | 'strict') => {
    setSettings(prev => ({
      ...prev,
      parentalControlEnabled: true,
      parentalPin: pin,
      contentFilter: filter
    }))
  }, [])

  return {
    settings,
    securityScore,
    updateSettings,
    removeDevice,
    enable2FA,
    setParentalControl
  }
}

// 安全评分卡片
const SecurityScoreCard: React.FC<{
  score: SecurityScore
}> = ({ score }) => {
  const colorMap = {
    low: { bg: 'from-red-500 to-orange-500', text: 'text-red-400' },
    medium: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-400' },
    high: { bg: 'from-green-500 to-teal-500', text: 'text-green-400' }
  }

  const levelLabels = {
    low: '需要加强',
    medium: '一般',
    high: '很安全'
  }

  return (
    <div className={`bg-gradient-to-br ${colorMap[score.level].bg} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white/80 text-sm">安全评分</h3>
          <p className="text-white text-4xl font-bold">{score.score}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-3xl">
            {score.level === 'high' ? '🛡️' : score.level === 'medium' ? '⚠️' : '❌'}
          </span>
        </div>
      </div>

      <p className="text-white/80 text-sm mb-3">
        您的账户安全状态: {levelLabels[score.level]}
      </p>

      {score.suggestions.length > 0 && (
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-2">建议:</p>
          <ul className="text-white/80 text-sm space-y-1">
            {score.suggestions.slice(0, 2).map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// 双因素认证
const TwoFactorAuth: React.FC<{
  enabled: boolean
  method: string | null
  onEnable: (method: '短信' | '邮箱' | '验证器') => void
  onDisable: () => void
}> = ({ enabled, method, onEnable, onDisable }) => {
  const [showSetup, setShowSetup] = useState(false)

  const methods = [
    { key: '短信' as const, icon: '📱', label: '短信验证码' },
    { key: '邮箱' as const, icon: '📧', label: '邮箱验证码' },
    { key: '验证器' as const, icon: '🔐', label: '验证器应用' }
  ]

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <h4 className="text-white font-medium">双因素认证</h4>
            <p className="text-sm text-white/60">
              {enabled ? `已启用 (${method})` : '增加账户安全性'}
            </p>
          </div>
        </div>

        <button
          onClick={() => enabled ? onDisable() : setShowSetup(true)}
          className={`px-4 py-2 rounded-lg text-sm ${
            enabled
              ? 'bg-white/10 text-white/60'
              : 'bg-primary-500 text-white'
          }`}
        >
          {enabled ? '关闭' : '开启'}
        </button>
      </div>

      <AnimatePresence>
        {showSetup && !enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-4 border-t border-white/10"
          >
            <p className="text-sm text-white/60 mb-3">选择验证方式:</p>
            {methods.map(m => (
              <button
                key={m.key}
                onClick={() => {
                  onEnable(m.key)
                  setShowSetup(false)
                }}
                className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3
                         hover:bg-white/10 transition-all"
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-white">{m.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 设备管理
const DeviceManager: React.FC<{
  devices: TrustedDevice[]
  onRemove: (id: string) => void
}> = ({ devices, onRemove }) => {
  const deviceIcons = {
    phone: '📱',
    tablet: '📱',
    computer: '💻',
    tv: '📺'
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h4 className="text-white font-medium mb-4">可信设备</h4>

      <div className="space-y-3">
        {devices.map(device => (
          <div
            key={device.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{deviceIcons[device.type]}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white">{device.name}</span>
                  {device.isCurrent && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      当前设备
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  {device.location} · 最后活跃 {device.lastActive.toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            {!device.isCurrent && (
              <button
                onClick={() => onRemove(device.id)}
                className="text-red-400 text-sm hover:underline"
              >
                移除
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 隐私选项
const PrivacyOptions: React.FC<{
  settings: PrivacySettings
  onUpdate: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void
}> = ({ settings, onUpdate }) => {
  const options = [
    { key: 'anonymousMode' as const, icon: '👻', label: '匿名模式', desc: '隐藏您的真实身份' },
    { key: 'hideListeningActivity' as const, icon: '🔇', label: '隐藏听歌动态', desc: '不显示正在播放' },
    { key: 'hidePlaylist' as const, icon: '📋', label: '隐藏歌单', desc: '设为私密' },
    { key: 'hideFollowers' as const, icon: '👥', label: '隐藏关注列表', desc: '不公开关注' },
    { key: 'blockRecommendations' as const, icon: '🚫', label: '停止个性化推荐', desc: '不使用历史记录' },
    { key: 'dataSharing' as const, icon: '📊', label: '数据共享', desc: '用于改进服务' }
  ]

  return (
    <div className="space-y-3">
      {options.map(opt => (
        <div
          key={opt.key}
          className="flex items-center justify-between p-4 bg-dark-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <span className="text-white">{opt.label}</span>
              <p className="text-xs text-white/40">{opt.desc}</p>
            </div>
          </div>

          <button
            onClick={() => onUpdate(opt.key, !settings[opt.key])}
            className={`w-12 h-6 rounded-full transition-all ${
              settings[opt.key] ? 'bg-primary-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow"
              animate={{ x: settings[opt.key] ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

// 家长控制
const ParentalControls: React.FC<{
  settings: PrivacySettings
  onEnable: (pin: string, filter: 'moderate' | 'strict') => void
  onDisable: () => void
}> = ({ settings, onEnable, onDisable }) => {
  const [pin, setPin] = useState('')
  const [filter, setFilter] = useState<'moderate' | 'strict'>('moderate')
  const [showSetup, setShowSetup] = useState(false)

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👨‍👩‍👧</span>
          <div>
            <h4 className="text-white font-medium">家长控制</h4>
            <p className="text-sm text-white/60">
              {settings.parentalControlEnabled ? '已开启' : '保护未成年人'}
            </p>
          </div>
        </div>

        <button
          onClick={() => settings.parentalControlEnabled ? onDisable() : setShowSetup(true)}
          className={`px-4 py-2 rounded-lg text-sm ${
            settings.parentalControlEnabled
              ? 'bg-white/10 text-white/60'
              : 'bg-primary-500 text-white'
          }`}
        >
          {settings.parentalControlEnabled ? '关闭' : '设置'}
        </button>
      </div>

      <AnimatePresence>
        {showSetup && !settings.parentalControlEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-white/10"
          >
            {/* PIN 设置 */}
            <div>
              <label className="text-sm text-white/60 block mb-2">设置 PIN 码</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                placeholder="6 位数字"
                className="w-full bg-white/10 rounded-lg px-4 py-2 text-white
                         placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* 内容过滤级别 */}
            <div>
              <label className="text-sm text-white/60 block mb-2">内容过滤级别</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('moderate')}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    filter === 'moderate' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  适度过滤
                </button>
                <button
                  onClick={() => setFilter('strict')}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    filter === 'strict' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  严格过滤
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (pin.length === 6) {
                  onEnable(pin, filter)
                  setShowSetup(false)
                }
              }}
              disabled={pin.length !== 6}
              className="w-full py-2 bg-primary-500 rounded-lg text-white text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认开启
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {settings.parentalControlEnabled && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60">
            当前过滤级别: {settings.contentFilter === 'strict' ? '严格' : '适度'}
          </p>
          {settings.playTimeLimit && (
            <p className="text-sm text-white/60">
              每日使用时长: {settings.playTimeLimit} 分钟
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// 加密设置
const EncryptionSettings: React.FC<{
  settings: PrivacySettings
  onUpdate: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void
}> = ({ settings, onUpdate }) => {
  const options = [
    { key: 'endToEndEncryption' as const, icon: '🔒', label: '端到端加密', desc: '消息和通话加密' },
    { key: 'encryptDownloads' as const, icon: '📥', label: '加密下载', desc: '离线内容加密存储' },
    { key: 'secureBackup' as const, icon: '☁️', label: '安全备份', desc: '加密云端备份' }
  ]

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h4 className="text-white font-medium mb-4">加密设置</h4>

      <div className="space-y-3">
        {options.map(opt => (
          <div
            key={opt.key}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{opt.icon}</span>
              <div>
                <span className="text-white text-sm">{opt.label}</span>
                <p className="text-xs text-white/40">{opt.desc}</p>
              </div>
            </div>

            <button
              onClick={() => onUpdate(opt.key, !settings[opt.key])}
              className={`w-10 h-5 rounded-full transition-all ${
                settings[opt.key] ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: settings[opt.key] ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 主界面
interface PrivacyCenterProps {
  className?: string
}

export const PrivacyCenter: React.FC<PrivacyCenterProps> = ({ className }) => {
  const {
    settings,
    securityScore,
    updateSettings,
    removeDevice,
    enable2FA,
    setParentalControl
  } = usePrivacyCenter()

  const [activeTab, setActiveTab] = useState<'security' | 'privacy' | 'family'>('security')

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">隐私与安全</h3>
      </div>

      {/* 安全评分 */}
      <SecurityScoreCard score={securityScore} />

      {/* 标签页 */}
      <div className="flex gap-2 mt-6 mb-4">
        {[
          { key: 'security', label: '账户安全' },
          { key: 'privacy', label: '隐私设置' },
          { key: 'family', label: '家长控制' }
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
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <TwoFactorAuth
              enabled={settings.twoFactorEnabled}
              method={settings.twoFactorMethod}
              onEnable={enable2FA}
              onDisable={() => updateSettings('twoFactorEnabled', false)}
            />
            <DeviceManager devices={settings.trustedDevices} onRemove={removeDevice} />
            <EncryptionSettings settings={settings} onUpdate={updateSettings} />
          </motion.div>
        )}

        {activeTab === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PrivacyOptions settings={settings} onUpdate={updateSettings} />
          </motion.div>
        )}

        {activeTab === 'family' && (
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ParentalControls
              settings={settings}
              onEnable={setParentalControl}
              onDisable={() => updateSettings('parentalControlEnabled', false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PrivacyCenter
