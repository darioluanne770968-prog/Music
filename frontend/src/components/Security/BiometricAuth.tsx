import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 生物识别类型
export type BiometricType = 'face' | 'fingerprint' | 'none'

// 设备信息
export interface DeviceInfo {
  id: string
  name: string
  type: 'ios' | 'android' | 'web' | 'desktop'
  lastActive: Date
  location?: string
  isCurrent: boolean
  isVerified: boolean
}

// 检测可用的生物识别类型
export async function detectBiometricType(): Promise<BiometricType> {
  // 检查是否在 Capacitor 环境
  // @ts-ignore
  if (window.Capacitor?.Plugins?.BiometricAuth) {
    // @ts-ignore
    const result = await window.Capacitor.Plugins.BiometricAuth.isAvailable()
    if (result.hasFaceId) return 'face'
    if (result.hasTouchId || result.hasFingerprint) return 'fingerprint'
  }

  // 检查 WebAuthn
  if ('credentials' in navigator && 'PublicKeyCredential' in window) {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    if (available) return 'fingerprint' // WebAuthn 一般是指纹或 Windows Hello
  }

  return 'none'
}

// 生物识别认证
export async function authenticateWithBiometric(): Promise<boolean> {
  // @ts-ignore
  if (window.Capacitor?.Plugins?.BiometricAuth) {
    try {
      // @ts-ignore
      const result = await window.Capacitor.Plugins.BiometricAuth.verify({
        reason: '验证身份以继续',
        title: '身份验证',
        subtitle: '请使用生物识别验证',
        negativeButtonText: '取消',
      })
      return result.verified
    } catch {
      return false
    }
  }

  // WebAuthn fallback
  if ('credentials' in navigator) {
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
        },
      })

      return !!credential
    } catch {
      return false
    }
  }

  return false
}

// 生物识别设置组件
interface BiometricAuthSettingsProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export const BiometricAuthSettings: React.FC<BiometricAuthSettingsProps> = ({
  enabled,
  onToggle,
}) => {
  const [biometricType, setBiometricType] = useState<BiometricType>('none')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    detectBiometricType().then(setBiometricType)
  }, [])

  const handleToggle = async () => {
    if (!enabled) {
      // 启用前需要验证
      setIsAuthenticating(true)
      const success = await authenticateWithBiometric()
      setIsAuthenticating(false)

      if (success) {
        onToggle(true)
      }
    } else {
      onToggle(false)
    }
  }

  const biometricLabels = {
    face: { name: 'Face ID', icon: '😊' },
    fingerprint: { name: 'Touch ID', icon: '👆' },
    none: { name: '不可用', icon: '🔒' },
  }

  if (biometricType === 'none') {
    return (
      <div className="p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3 text-white/60">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-medium">生物识别不可用</p>
            <p className="text-xs">您的设备不支持生物识别验证</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{biometricLabels[biometricType].icon}</span>
          <div>
            <p className="font-medium text-white">{biometricLabels[biometricType].name}</p>
            <p className="text-xs text-white/60">使用生物识别快速登录</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isAuthenticating}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            enabled ? 'bg-primary-500' : 'bg-white/20'
          } ${isAuthenticating ? 'opacity-50' : ''}`}
        >
          <motion.div
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  )
}

// 设备管理组件
interface DeviceManagerProps {
  devices: DeviceInfo[]
  onRemoveDevice: (deviceId: string) => void
  onVerifyDevice: (deviceId: string) => void
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({
  devices,
  onRemoveDevice,
  onVerifyDevice,
}) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null)

  const deviceIcons = {
    ios: '📱',
    android: '📱',
    web: '🌐',
    desktop: '💻',
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">已登录设备</h3>
      <p className="text-sm text-white/60">
        管理已登录的设备，可以移除不认识的设备
      </p>

      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`p-4 rounded-xl ${
              device.isCurrent ? 'bg-primary-500/20 border border-primary-500/50' : 'bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{deviceIcons[device.type]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{device.name}</p>
                    {device.isCurrent && (
                      <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                        当前设备
                      </span>
                    )}
                    {device.isVerified && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-white/60">
                    {device.location && `${device.location} · `}
                    {formatLastActive(device.lastActive)}
                  </p>
                </div>
              </div>

              {!device.isCurrent && (
                <div className="flex items-center gap-2">
                  {!device.isVerified && (
                    <button
                      onClick={() => onVerifyDevice(device.id)}
                      className="px-3 py-1 text-xs bg-white/10 rounded-full text-white/60 hover:bg-white/20"
                    >
                      验证
                    </button>
                  )}
                  <button
                    onClick={() => setShowRemoveConfirm(device.id)}
                    className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Remove Confirmation */}
            <AnimatePresence>
              {showRemoveConfirm === device.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-sm text-white/80 mb-3">
                    确定要移除此设备吗？该设备将需要重新登录。
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRemoveConfirm(null)}
                      className="flex-1 py-2 bg-white/10 rounded-lg text-white/60"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        onRemoveDevice(device.id)
                        setShowRemoveConfirm(null)
                      }}
                      className="flex-1 py-2 bg-red-500 rounded-lg text-white"
                    >
                      移除
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
        退出所有其他设备
      </button>
    </div>
  )
}

// 隐私模式组件
interface PrivacyModeProps {
  settings: {
    hideHistory: boolean
    hideLikes: boolean
    hideActivity: boolean
    privateProfile: boolean
  }
  onChange: (settings: PrivacyModeProps['settings']) => void
}

export const PrivacyModeSettings: React.FC<PrivacyModeProps> = ({
  settings,
  onChange,
}) => {
  const privacyOptions = [
    {
      key: 'hideHistory' as const,
      label: '隐藏听歌记录',
      description: '其他用户将无法看到你的听歌历史',
    },
    {
      key: 'hideLikes' as const,
      label: '隐藏喜欢列表',
      description: '其他用户将无法看到你喜欢的歌曲',
    },
    {
      key: 'hideActivity' as const,
      label: '隐藏动态',
      description: '不在动态中显示你的听歌活动',
    },
    {
      key: 'privateProfile' as const,
      label: '私密账号',
      description: '只有你允许的人才能看到你的主页',
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">隐私设置</h3>

      <div className="space-y-3">
        {privacyOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
          >
            <div>
              <p className="font-medium text-white">{option.label}</p>
              <p className="text-xs text-white/60">{option.description}</p>
            </div>
            <button
              onClick={() => onChange({ ...settings, [option.key]: !settings[option.key] })}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings[option.key] ? 'bg-primary-500' : 'bg-white/20'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: settings[option.key] ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Data Export */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="font-medium text-white mb-3">数据管理</h4>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <span className="text-white">导出我的数据</span>
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400">
            <span>删除账号</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BiometricAuthSettings
