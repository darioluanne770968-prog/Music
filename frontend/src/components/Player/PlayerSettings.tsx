import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/stores/playerStore'

// 音质类型
export type AudioQuality = 'standard' | 'high' | 'lossless' | 'hires'

// 音质配置
export const audioQualities: Record<AudioQuality, { label: string; bitrate: string; desc: string }> = {
  standard: { label: '标准', bitrate: '128kbps', desc: '省流量，适合普通场景' },
  high: { label: '高品质', bitrate: '320kbps', desc: '高品质MP3，均衡选择' },
  lossless: { label: '无损', bitrate: 'FLAC', desc: '无损音质，发烧友首选' },
  hires: { label: 'Hi-Res', bitrate: '24bit/96kHz', desc: '高解析度，极致体验' },
}

interface PlayerSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const PlayerSettings: React.FC<PlayerSettingsProps> = ({ isOpen, onClose }) => {
  const {
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
  } = usePlayerStore()

  const [quality, setQuality] = useState<AudioQuality>('high')
  const [abLoop, setABLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null })
  const [crossfade, setCrossfade] = useState(false)
  const [crossfadeDuration, setCrossfadeDuration] = useState(5)
  const [gaplessPlayback, setGaplessPlayback] = useState(true)
  const [replayGain, setReplayGain] = useState(false)

  // 播放速度选项
  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-dark-900 rounded-t-3xl border-t border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">播放设置</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-8 max-h-[60vh]">
              {/* 音质选择 */}
              <section>
                <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </span>
                  音质选择
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(audioQualities).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setQuality(key as AudioQuality)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        quality === key
                          ? 'bg-primary-500/20 border border-primary-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{value.label}</span>
                        <span className="text-xs text-primary-400">{value.bitrate}</span>
                      </div>
                      <p className="text-xs text-white/40">{value.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* 播放速度 */}
              <section>
                <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.92 6-4.72 7.28L13 17v5l5-5-1.28-1.28C19.05 14.05 20 11.65 20 9c0-4.42-3.58-8-8-8-.34 0-.67.03-1 .08V2.05L11 2l2 .05zM11 4.07V7h2V4.07c-3.06.45-5.48 2.87-5.93 5.93H10v2H7.07c.45 3.06 2.87 5.48 5.93 5.93V15h-2v2.93c-3.95-.49-7-3.85-7-7.93 0-3.21 1.92-6 4.72-7.28L11 4.07z"/>
                    </svg>
                  </span>
                  播放速度
                  <span className="ml-auto text-primary-400">{playbackRate}x</span>
                </h3>
                <div className="flex items-center gap-2">
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        playbackRate === rate
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </section>

              {/* A-B 循环 */}
              <section>
                <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                  </span>
                  A-B 循环
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // 设置 A 点
                      const currentTime = usePlayerStore.getState().currentTime
                      setABLoop(prev => ({ ...prev, a: currentTime }))
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      abLoop.a !== null
                        ? 'bg-primary-500/20 border border-primary-500 text-primary-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    设置 A 点
                    {abLoop.a !== null && (
                      <span className="ml-2 text-xs">{formatTime(abLoop.a)}</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const currentTime = usePlayerStore.getState().currentTime
                      setABLoop(prev => ({ ...prev, b: currentTime }))
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      abLoop.b !== null
                        ? 'bg-primary-500/20 border border-primary-500 text-primary-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    设置 B 点
                    {abLoop.b !== null && (
                      <span className="ml-2 text-xs">{formatTime(abLoop.b)}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setABLoop({ a: null, b: null })}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {abLoop.a !== null && abLoop.b !== null && (
                  <p className="mt-2 text-xs text-primary-400 text-center">
                    循环播放: {formatTime(abLoop.a)} - {formatTime(abLoop.b)}
                  </p>
                )}
              </section>

              {/* 交叉淡入淡出 */}
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-white">交叉淡入淡出</h3>
                      <p className="text-xs text-white/40">歌曲切换时平滑过渡</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={crossfade} onChange={setCrossfade} />
                </div>
                {crossfade && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">过渡时长</span>
                      <span className="text-xs text-primary-400">{crossfadeDuration}秒</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={crossfadeDuration}
                      onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </section>

              {/* 无缝播放 */}
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-white">无缝播放</h3>
                      <p className="text-xs text-white/40">消除歌曲之间的间隙</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={gaplessPlayback} onChange={setGaplessPlayback} />
                </div>
              </section>

              {/* 回放增益 */}
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-white">回放增益</h3>
                      <p className="text-xs text-white/40">自动调节音量均衡</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={replayGain} onChange={setReplayGain} />
                </div>
              </section>

              {/* 音量 */}
              <section>
                <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                    </svg>
                  </span>
                  音量
                  <span className="ml-auto text-primary-400">{Math.round(volume * 100)}%</span>
                </h3>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toggle Switch
const ToggleSwitch: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      checked ? 'bg-primary-500' : 'bg-white/20'
    }`}
  >
    <motion.div
      className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
)

// 格式化时间
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default PlayerSettings
