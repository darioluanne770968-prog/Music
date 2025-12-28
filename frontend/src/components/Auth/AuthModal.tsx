import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import * as api from '@/services/netease'
import toast from 'react-hot-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'qr' | 'phone' | 'register' | 'forgot'

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('qr')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [qrKey, setQrKey] = useState<string>('')
  const [qrStatus, setQrStatus] = useState<'loading' | 'ready' | 'scanned' | 'expired' | 'success'>('loading')
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
  })
  const { login } = useUserStore()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Generate QR Code
  const generateQRCode = async () => {
    setQrStatus('loading')
    try {
      // Get QR key
      const keyRes = await api.getQRKey()
      if (keyRes?.data?.unikey) {
        const key = keyRes.data.unikey
        setQrKey(key)

        // Get QR code image
        const qrRes = await api.createQRCode(key, true)
        if (qrRes?.data?.qrimg) {
          setQrCode(qrRes.data.qrimg)
          setQrStatus('ready')
          // Start checking for scan
          startQRCheck(key)
        }
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      setQrStatus('expired')
      toast.error('获取二维码失败')
    }
  }

  // Check QR code scan status
  const startQRCheck = (key: string) => {
    // Clear existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.checkQRCode(key)
        // 800: QR expired, 801: Waiting for scan, 802: Scanned waiting for confirm, 803: Login success
        if (res?.code === 800) {
          setQrStatus('expired')
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        } else if (res?.code === 802) {
          setQrStatus('scanned')
        } else if (res?.code === 803) {
          setQrStatus('success')
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
          // Fetch user info and login
          await handleQRLoginSuccess()
        }
      } catch (error) {
        console.error('QR check error:', error)
      }
    }, 2000)
  }

  // Handle successful QR login
  const handleQRLoginSuccess = async () => {
    try {
      const statusRes = await api.getLoginStatus()
      if (statusRes?.data?.profile) {
        const profile = statusRes.data.profile
        const user = {
          id: profile.userId,
          username: profile.nickname,
          avatar: profile.avatarUrl,
          level: profile.vipType || 0,
          vipLevel: profile.vipType || 0,
          followerCount: profile.followeds || 0,
          followingCount: profile.follows || 0,
          playlistCount: profile.playlistCount || 0,
          createdAt: new Date(profile.createTime).toISOString(),
        }
        login(user, statusRes.data.cookie || '')
        toast.success('登录成功')
        onClose()
      }
    } catch (error) {
      console.error('Failed to get user info:', error)
      toast.error('获取用户信息失败')
    }
  }

  // Generate QR when mode is qr and modal is open
  useEffect(() => {
    if (isOpen && mode === 'qr') {
      generateQRCode()
    }
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [isOpen, mode])

  // Phone login
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phone) {
      toast.error('请输入手机号')
      return
    }
    if (!formData.password && !formData.code) {
      toast.error('请输入密码或验证码')
      return
    }

    setLoading(true)
    try {
      const res = await api.loginWithPhone(
        formData.phone,
        formData.password || undefined,
        formData.code || undefined
      )

      if (res?.code === 200) {
        const profile = res.profile
        const user = {
          id: profile.userId,
          username: profile.nickname,
          avatar: profile.avatarUrl,
          level: profile.vipType || 0,
          vipLevel: profile.vipType || 0,
          followerCount: profile.followeds || 0,
          followingCount: profile.follows || 0,
          playlistCount: profile.playlistCount || 0,
          createdAt: new Date(profile.createTime).toISOString(),
        }
        login(user, res.cookie || '')
        toast.success('登录成功')
        onClose()
      } else {
        toast.error(res?.message || '登录失败')
      }
    } catch (error) {
      toast.error('登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phone || !formData.password) {
      toast.error('请填写手机号和密码')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        login(data.data.user, data.data.token)
        toast.success('登录成功')
        onClose()
      } else {
        toast.error(data.message || '登录失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.phone || !formData.password) {
      toast.error('请填写完整信息')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('两次密码不一致')
      return
    }
    if (formData.password.length < 6) {
      toast.error('密码至少6位')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.code === 201) {
        login(data.data.user, data.data.token)
        toast.success('注册成功')
        onClose()
      } else {
        toast.error(data.message || '注册失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      // Demo login with test account
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '13800138000',
          password: 'demo123',
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        login(data.data.user, data.data.token)
        toast.success('登录成功')
        onClose()
      } else {
        // If demo account doesn't exist, create mock user for demo
        const mockUser = {
          id: 1,
          username: 'Demo用户',
          phone: '13800138000',
          avatar: 'https://picsum.photos/seed/demo/200',
          level: 5,
          exp: 2500,
          vipLevel: 1,
          followerCount: 128,
          followingCount: 56,
          playlistCount: 3,
          createdAt: new Date().toISOString(),
        }
        login(mockUser, 'demo-token')
        toast.success('Demo 登录成功')
        onClose()
      }
    } catch (error) {
      // Fallback to mock user
      const mockUser = {
        id: 1,
        username: 'Demo用户',
        phone: '13800138000',
        avatar: 'https://picsum.photos/seed/demo/200',
        level: 5,
        exp: 2500,
        vipLevel: 1,
        followerCount: 128,
        followingCount: 56,
        playlistCount: 3,
        createdAt: new Date().toISOString(),
      }
      login(mockUser, 'demo-token')
      toast.success('Demo 登录成功')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-dark-900 rounded-2xl p-6 shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {(mode === 'login' || mode === 'qr' || mode === 'phone') && '登录网易云音乐'}
              {mode === 'register' && '注册'}
              {mode === 'forgot' && '找回密码'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Login Method Tabs */}
          {(mode === 'qr' || mode === 'phone' || mode === 'login') && (
            <div className="flex items-center gap-4 mb-6 border-b border-white/10">
              <button
                onClick={() => setMode('qr')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'qr'
                    ? 'text-primary-500 border-primary-500'
                    : 'text-white/50 border-transparent hover:text-white'
                }`}
              >
                扫码登录
              </button>
              <button
                onClick={() => setMode('phone')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'phone'
                    ? 'text-primary-500 border-primary-500'
                    : 'text-white/50 border-transparent hover:text-white'
                }`}
              >
                手机号登录
              </button>
            </div>
          )}

          {/* QR Code Login */}
          {mode === 'qr' && (
            <div className="flex flex-col items-center py-4">
              <div className="relative w-48 h-48 bg-white rounded-xl overflow-hidden mb-4">
                {qrStatus === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                  </div>
                )}
                {qrCode && qrStatus !== 'loading' && (
                  <img src={qrCode} alt="QR Code" className="w-full h-full object-contain p-2" />
                )}
                {qrStatus === 'expired' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                    <p className="text-white text-sm mb-2">二维码已过期</p>
                    <button
                      onClick={generateQRCode}
                      className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-sm"
                    >
                      刷新
                    </button>
                  </div>
                )}
                {qrStatus === 'scanned' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90">
                    <svg className="w-12 h-12 text-white mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <p className="text-white text-sm">扫描成功</p>
                    <p className="text-white/80 text-xs">请在手机上确认登录</p>
                  </div>
                )}
                {qrStatus === 'success' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90">
                    <svg className="w-12 h-12 text-white mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <p className="text-white text-sm">登录成功</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-white/60 text-center">
                {qrStatus === 'ready' && '打开网易云音乐APP扫码登录'}
                {qrStatus === 'loading' && '正在加载二维码...'}
                {qrStatus === 'scanned' && '已扫码，请在手机上确认'}
                {qrStatus === 'expired' && '二维码已过期，请刷新'}
                {qrStatus === 'success' && '正在登录...'}
              </p>

              <div className="flex items-center gap-2 mt-4 text-xs text-white/40">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>安全登录，数据加密传输</span>
              </div>
            </div>
          )}

          {/* Phone Login Form */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">手机号</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入网易云音乐绑定的手机号"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">密码</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium disabled:opacity-50 transition-opacity"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <p className="text-center text-xs text-white/40">
                登录即表示同意《用户协议》和《隐私政策》
              </p>
            </form>
          )}

          {/* Legacy Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">手机号</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">密码</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/60">
                  <input type="checkbox" className="rounded" />
                  记住我
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-primary-500 hover:text-primary-400"
                >
                  忘记密码？
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium disabled:opacity-50 transition-opacity"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Demo 体验登录
              </button>

              <p className="text-center text-sm text-white/60">
                还没有账号？
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary-500 hover:text-primary-400 ml-1"
                >
                  立即注册
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">用户名</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">手机号</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">密码</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码 (至少6位)"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">确认密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="请再次输入密码"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium disabled:opacity-50 transition-opacity"
              >
                {loading ? '注册中...' : '注册'}
              </button>

              <p className="text-center text-sm text-white/60">
                已有账号？
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary-500 hover:text-primary-400 ml-1"
                >
                  立即登录
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">手机号</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入注册手机号"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="验证码"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  className="px-4 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                  获取验证码
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-purple text-white font-medium disabled:opacity-50 transition-opacity"
              >
                下一步
              </button>

              <p className="text-center text-sm text-white/60">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary-500 hover:text-primary-400"
                >
                  返回登录
                </button>
              </p>
            </form>
          )}

          {/* Social Login */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-white/40 mb-4">其他登录方式</p>
            <div className="flex justify-center gap-4">
              <button className="w-12 h-12 rounded-full bg-[#07C160] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098c.895.249 1.87.387 2.878.387 4.801 0 8.691-3.287 8.691-7.342 0-4.053-3.89-7.342-8.691-7.342zM19 11c0 3.519-3.276 6.39-7.322 6.912a.52.52 0 00-.447.506c-.004.186.06.37.18.512l1.25 1.484c.08.094.138.206.17.328.064.238-.032.489-.236.627-.126.084-.275.131-.43.131-.223 0-.443-.09-.604-.26l-1.166-1.23a.516.516 0 00-.373-.173.496.496 0 00-.179.031c-.774.218-1.591.364-2.437.43 4.547-.23 8.152-3.45 8.152-7.356 0-.067-.002-.134-.005-.2l.002-.002c.445.243.858.535 1.228.868C18.518 14.4 19 15.652 19 17v-6z"/>
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-[#EB4646] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-4v-1A1.5 1.5 0 0 0 14.5 2h-5zm5 6a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm-3.5 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-4 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1z"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
