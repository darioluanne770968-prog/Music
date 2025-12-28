import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSun, FiMoon, FiMonitor, FiDroplet, FiEye,
  FiType, FiZap, FiSliders, FiCheck, FiRefreshCw
} from 'react-icons/fi'
import { useThemeStore, ThemeMode, AccentColor, accentColors } from '@/stores/themeStore'

interface ThemeSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const {
    themeMode,
    accentColor,
    customColor,
    dynamicTheme,
    accessibility,
    backgroundBlur,
    animations,
    setThemeMode,
    setAccentColor,
    setCustomColor,
    setDynamicTheme,
    setAccessibility,
    setBackgroundBlur,
    setAnimations,
    resetToDefaults,
  } = useThemeStore()

  const [activeTab, setActiveTab] = useState<'theme' | 'accessibility' | 'animation'>('theme')

  const themeModes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <FiSun className="w-5 h-5" />, label: '浅色' },
    { value: 'dark', icon: <FiMoon className="w-5 h-5" />, label: '深色' },
    { value: 'system', icon: <FiMonitor className="w-5 h-5" />, label: '跟随系统' },
  ]

  const colorOptions: { value: AccentColor; color: string; label: string }[] = [
    { value: 'pink', color: '#ff3381', label: '粉红' },
    { value: 'purple', color: '#8b5cf6', label: '紫色' },
    { value: 'blue', color: '#3b82f6', label: '蓝色' },
    { value: 'cyan', color: '#06b6d4', label: '青色' },
    { value: 'amber', color: '#f59e0b', label: '琥珀' },
    { value: 'green', color: '#10b981', label: '绿色' },
    { value: 'red', color: '#ef4444', label: '红色' },
  ]

  const fontSizes = [
    { value: 'small', label: '小' },
    { value: 'medium', label: '中' },
    { value: 'large', label: '大' },
    { value: 'xlarge', label: '特大' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] bg-dark-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">外观设置</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: 'theme', icon: <FiDroplet />, label: '主题' },
                { id: 'accessibility', icon: <FiEye />, label: '无障碍' },
                { id: 'animation', icon: <FiZap />, label: '动画' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === 'theme' && (
                <>
                  {/* Theme Mode */}
                  <section>
                    <h3 className="text-sm font-medium text-white/60 mb-3">主题模式</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {themeModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setThemeMode(mode.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            themeMode === mode.value
                              ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {mode.icon}
                          <span className="text-xs">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Accent Color */}
                  <section>
                    <h3 className="text-sm font-medium text-white/60 mb-3">强调色</h3>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAccentColor(option.value)}
                          className={`relative w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            accentColor === option.value ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900' : ''
                          }`}
                          style={{ backgroundColor: option.color }}
                          title={option.label}
                        >
                          {accentColor === option.value && (
                            <FiCheck className="absolute inset-0 m-auto w-5 h-5 text-white" />
                          )}
                        </button>
                      ))}
                      {/* Custom color */}
                      <div className="relative">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value)
                            setAccentColor('custom')
                          }}
                          className="w-10 h-10 rounded-full cursor-pointer appearance-none border-0 bg-transparent"
                          style={{
                            backgroundColor: customColor,
                          }}
                          title="自定义颜色"
                        />
                        {accentColor === 'custom' && (
                          <FiCheck className="absolute inset-0 m-auto w-5 h-5 text-white pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Dynamic Theme */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">动态主题</h3>
                        <p className="text-xs text-white/40 mt-0.5">根据专辑封面自动调整主题色</p>
                      </div>
                      <ToggleSwitch
                        checked={dynamicTheme.enabled}
                        onChange={setDynamicTheme}
                      />
                    </div>
                  </section>

                  {/* Background Blur */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">背景模糊</h3>
                        <p className="text-xs text-white/40 mt-0.5">启用毛玻璃效果</p>
                      </div>
                      <ToggleSwitch
                        checked={backgroundBlur}
                        onChange={setBackgroundBlur}
                      />
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'accessibility' && (
                <>
                  {/* High Contrast */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">高对比度</h3>
                        <p className="text-xs text-white/40 mt-0.5">增强文字和元素对比度</p>
                      </div>
                      <ToggleSwitch
                        checked={accessibility.highContrast}
                        onChange={(v) => setAccessibility({ highContrast: v })}
                      />
                    </div>
                  </section>

                  {/* Reduced Motion */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">减少动画</h3>
                        <p className="text-xs text-white/40 mt-0.5">减少界面动画效果</p>
                      </div>
                      <ToggleSwitch
                        checked={accessibility.reducedMotion}
                        onChange={(v) => setAccessibility({ reducedMotion: v })}
                      />
                    </div>
                  </section>

                  {/* Bold Text */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">粗体文字</h3>
                        <p className="text-xs text-white/40 mt-0.5">使用更粗的字体</p>
                      </div>
                      <ToggleSwitch
                        checked={accessibility.boldText}
                        onChange={(v) => setAccessibility({ boldText: v })}
                      />
                    </div>
                  </section>

                  {/* Font Size */}
                  <section>
                    <h3 className="text-sm font-medium text-white mb-3">
                      <FiType className="inline mr-2" />
                      字体大小
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {fontSizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setAccessibility({ fontSize: size.value as any })}
                          className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                            accessibility.fontSize === size.value
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'animation' && (
                <>
                  {/* Animations */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">启用动画</h3>
                        <p className="text-xs text-white/40 mt-0.5">开启所有界面动画</p>
                      </div>
                      <ToggleSwitch
                        checked={animations.enabled}
                        onChange={(v) => setAnimations({ enabled: v })}
                      />
                    </div>
                  </section>

                  {/* Page Transitions */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">页面切换动画</h3>
                        <p className="text-xs text-white/40 mt-0.5">页面间切换时的过渡效果</p>
                      </div>
                      <ToggleSwitch
                        checked={animations.pageTransitions}
                        onChange={(v) => setAnimations({ pageTransitions: v })}
                        disabled={!animations.enabled}
                      />
                    </div>
                  </section>

                  {/* Micro Interactions */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">微交互动画</h3>
                        <p className="text-xs text-white/40 mt-0.5">按钮点击、悬停等反馈动画</p>
                      </div>
                      <ToggleSwitch
                        checked={animations.microInteractions}
                        onChange={(v) => setAnimations({ microInteractions: v })}
                        disabled={!animations.enabled}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                恢复默认设置
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}> = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      checked ? 'bg-primary-500' : 'bg-white/20'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    disabled={disabled}
  >
    <motion.div
      className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
)

export default ThemeSettings
