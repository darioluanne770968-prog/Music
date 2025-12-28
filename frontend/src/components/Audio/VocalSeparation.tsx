import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 人声分离组件
 * 支持提取/移除人声、分离乐器轨道
 */

// 分离模式
export type SeparationMode = 'vocals' | 'instrumental' | 'drums' | 'bass' | 'other' | 'piano'

// 分离结果
export interface SeparatedTrack {
  id: string
  type: SeparationMode
  url: string
  volume: number
  muted: boolean
  solo: boolean
}

// 分离状态
interface SeparationState {
  isProcessing: boolean
  progress: number
  tracks: SeparatedTrack[]
  error: string | null
}

// 模拟人声分离（实际应用中会调用服务器端 AI 模型如 Spleeter/Demucs）
async function separateAudio(
  audioUrl: string,
  mode: 'vocals' | 'full'
): Promise<SeparatedTrack[]> {
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 3000))

  if (mode === 'vocals') {
    return [
      { id: '1', type: 'vocals', url: audioUrl, volume: 1, muted: false, solo: false },
      { id: '2', type: 'instrumental', url: audioUrl, volume: 1, muted: false, solo: false }
    ]
  } else {
    return [
      { id: '1', type: 'vocals', url: audioUrl, volume: 1, muted: false, solo: false },
      { id: '2', type: 'drums', url: audioUrl, volume: 1, muted: false, solo: false },
      { id: '3', type: 'bass', url: audioUrl, volume: 1, muted: false, solo: false },
      { id: '4', type: 'piano', url: audioUrl, volume: 1, muted: false, solo: false },
      { id: '5', type: 'other', url: audioUrl, volume: 1, muted: false, solo: false }
    ]
  }
}

// 人声分离 Hook
export function useVocalSeparation() {
  const [state, setState] = useState<SeparationState>({
    isProcessing: false,
    progress: 0,
    tracks: [],
    error: null
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map())

  const separate = useCallback(async (audioUrl: string, mode: 'vocals' | 'full') => {
    setState(prev => ({ ...prev, isProcessing: true, progress: 0, error: null }))

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 300)

      const tracks = await separateAudio(audioUrl, mode)

      clearInterval(progressInterval)
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        tracks
      }))

      return tracks
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: '分离失败，请重试'
      }))
      return []
    }
  }, [])

  const updateTrack = useCallback((trackId: string, updates: Partial<SeparatedTrack>) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, ...updates } : t
      )
    }))

    // 更新音量
    if (updates.volume !== undefined) {
      const gainNode = gainNodesRef.current.get(trackId)
      if (gainNode) {
        gainNode.gain.value = updates.volume
      }
    }
  }, [])

  const toggleMute = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      )
    }))
  }, [])

  const toggleSolo = useCallback((trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => ({
        ...t,
        solo: t.id === trackId ? !t.solo : false
      }))
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      tracks: [],
      error: null
    })
  }, [])

  return {
    ...state,
    separate,
    updateTrack,
    toggleMute,
    toggleSolo,
    reset
  }
}

// 人声分离界面
interface VocalSeparationUIProps {
  audioUrl: string
  songName: string
  artistName: string
  onClose: () => void
}

export const VocalSeparationUI: React.FC<VocalSeparationUIProps> = ({
  audioUrl,
  songName,
  artistName,
  onClose
}) => {
  const {
    isProcessing,
    progress,
    tracks,
    error,
    separate,
    updateTrack,
    toggleMute,
    toggleSolo,
    reset
  } = useVocalSeparation()

  const [selectedMode, setSelectedMode] = useState<'vocals' | 'full'>('vocals')
  const [isPlaying, setIsPlaying] = useState(false)

  const trackIcons: Record<SeparationMode, string> = {
    vocals: '🎤',
    instrumental: '🎸',
    drums: '🥁',
    bass: '🎸',
    piano: '🎹',
    other: '🎵'
  }

  const trackNames: Record<SeparationMode, string> = {
    vocals: '人声',
    instrumental: '伴奏',
    drums: '鼓组',
    bass: '贝斯',
    piano: '钢琴',
    other: '其他'
  }

  const handleSeparate = () => {
    separate(audioUrl, selectedMode)
  }

  const handleExport = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId)
    if (track) {
      // 模拟下载
      const a = document.createElement('a')
      a.href = track.url
      a.download = `${songName}_${trackNames[track.type]}.mp3`
      a.click()
    }
  }

  const handleExportAll = () => {
    tracks.forEach(track => {
      const a = document.createElement('a')
      a.href = track.url
      a.download = `${songName}_${trackNames[track.type]}.mp3`
      a.click()
    })
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-white">人声分离</h2>
            <p className="text-sm text-white/60">{songName} - {artistName}</p>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 overflow-auto p-6">
        {tracks.length === 0 ? (
          // 未分离状态
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-8">
              <span className="text-5xl">🎧</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">AI 人声分离</h3>
            <p className="text-white/60 text-center mb-8 max-w-md">
              使用 AI 技术将歌曲分离为人声和各种乐器轨道，
              你可以单独调整每个轨道的音量或导出
            </p>

            {/* 模式选择 */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setSelectedMode('vocals')}
                className={`px-6 py-3 rounded-xl transition-all ${
                  selectedMode === 'vocals'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                <span className="block text-2xl mb-1">🎤 + 🎸</span>
                <span className="text-sm">人声/伴奏</span>
              </button>
              <button
                onClick={() => setSelectedMode('full')}
                className={`px-6 py-3 rounded-xl transition-all ${
                  selectedMode === 'full'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                <span className="block text-2xl mb-1">🎤🥁🎸🎹</span>
                <span className="text-sm">完整分离</span>
              </button>
            </div>

            {/* 分离按钮 */}
            {isProcessing ? (
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">正在分离...</span>
                  <span className="text-white/60">{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-white/40 text-sm mt-4">
                  AI 正在分析音频，这可能需要几分钟...
                </p>
              </div>
            ) : (
              <button
                onClick={handleSeparate}
                className="px-8 py-4 bg-primary-500 rounded-xl text-white font-bold text-lg hover:bg-primary-600"
              >
                开始分离
              </button>
            )}

            {error && (
              <p className="mt-4 text-red-400">{error}</p>
            )}
          </div>
        ) : (
          // 分离结果
          <div>
            {/* 播放控制 */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 轨道列表 */}
            <div className="space-y-4">
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${
                    track.solo ? 'bg-primary-500/20 border border-primary-500' :
                    track.muted ? 'bg-white/5 opacity-50' :
                    'bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* 图标 */}
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                      {trackIcons[track.type]}
                    </div>

                    {/* 名称和控制 */}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{trackNames[track.type]}</h4>

                      {/* 音量滑块 */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={track.volume}
                          onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                          className="flex-1 h-2 bg-white/20 rounded-full appearance-none"
                          disabled={track.muted}
                        />
                        <span className="text-white/60 text-sm w-12 text-right">
                          {Math.round(track.volume * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMute(track.id)}
                        className={`p-2 rounded-lg ${
                          track.muted ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'
                        }`}
                        title="静音"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {track.muted ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          )}
                        </svg>
                      </button>

                      <button
                        onClick={() => toggleSolo(track.id)}
                        className={`p-2 rounded-lg font-bold text-sm ${
                          track.solo ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/60'
                        }`}
                        title="独奏"
                      >
                        S
                      </button>

                      <button
                        onClick={() => handleExport(track.id)}
                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20"
                        title="导出"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 底部操作 */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-white/10 rounded-xl text-white"
              >
                重新分离
              </button>
              <button
                onClick={handleExportAll}
                className="flex-1 py-3 bg-primary-500 rounded-xl text-white"
              >
                导出全部
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VocalSeparationUI
