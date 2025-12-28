import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * 音频编辑器组件
 * 支持歌曲剪辑、混音、特效
 */

// 音频片段类型
export interface AudioClip {
  id: string
  name: string
  url: string
  startTime: number
  endTime: number
  volume: number
  pan: number
  effects: AudioEffect[]
}

// 音频特效类型
export interface AudioEffect {
  type: 'reverb' | 'echo' | 'distortion' | 'chorus' | 'compressor' | 'eq'
  params: Record<string, number>
  enabled: boolean
}

// 编辑器状态
interface EditorState {
  clips: AudioClip[]
  currentTime: number
  duration: number
  isPlaying: boolean
  zoom: number
  selectedClipId: string | null
}

// 音频编辑器 Hook
export function useAudioEditor() {
  const audioContext = useRef<AudioContext | null>(null)
  const [state, setState] = useState<EditorState>({
    clips: [],
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    zoom: 1,
    selectedClipId: null
  })

  // 初始化音频上下文
  useEffect(() => {
    audioContext.current = new AudioContext()
    return () => {
      audioContext.current?.close()
    }
  }, [])

  // 添加音频片段
  const addClip = useCallback(async (file: File) => {
    if (!audioContext.current) return

    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer)

    const clip: AudioClip = {
      id: `clip-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      startTime: state.currentTime,
      endTime: state.currentTime + audioBuffer.duration,
      volume: 1,
      pan: 0,
      effects: []
    }

    setState(prev => ({
      ...prev,
      clips: [...prev.clips, clip],
      duration: Math.max(prev.duration, clip.endTime)
    }))
  }, [state.currentTime])

  // 删除片段
  const removeClip = useCallback((clipId: string) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.filter(c => c.id !== clipId),
      selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId
    }))
  }, [])

  // 更新片段
  const updateClip = useCallback((clipId: string, updates: Partial<AudioClip>) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
    }))
  }, [])

  // 选择片段
  const selectClip = useCallback((clipId: string | null) => {
    setState(prev => ({ ...prev, selectedClipId: clipId }))
  }, [])

  // 添加特效
  const addEffect = useCallback((clipId: string, effect: AudioEffect) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(c =>
        c.id === clipId
          ? { ...c, effects: [...c.effects, effect] }
          : c
      )
    }))
  }, [])

  // 播放控制
  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const seek = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(time, prev.duration)) }))
  }, [])

  // 缩放
  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(10, zoom)) }))
  }, [])

  // 导出音频
  const exportAudio = useCallback(async (): Promise<Blob | null> => {
    if (!audioContext.current || state.clips.length === 0) return null

    // 创建离线音频上下文
    const offlineContext = new OfflineAudioContext(
      2,
      state.duration * 44100,
      44100
    )

    // 处理每个片段
    for (const clip of state.clips) {
      const response = await fetch(clip.url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer)

      const source = offlineContext.createBufferSource()
      source.buffer = audioBuffer

      // 音量控制
      const gainNode = offlineContext.createGain()
      gainNode.gain.value = clip.volume

      // 声像控制
      const panNode = offlineContext.createStereoPanner()
      panNode.pan.value = clip.pan

      source.connect(gainNode)
      gainNode.connect(panNode)
      panNode.connect(offlineContext.destination)

      source.start(clip.startTime)
    }

    const renderedBuffer = await offlineContext.startRendering()

    // 转换为 WAV
    const wavBlob = audioBufferToWav(renderedBuffer)
    return wavBlob
  }, [state.clips, state.duration])

  return {
    state,
    addClip,
    removeClip,
    updateClip,
    selectClip,
    addEffect,
    play,
    pause,
    seek,
    setZoom,
    exportAudio
  }
}

// AudioBuffer 转 WAV
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, bufferLength - 8, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // 写入音频数据
  const channels: Float32Array[] = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      view.setInt16(offset, sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// 音频编辑器组件
export const AudioEditor: React.FC = () => {
  const {
    state,
    addClip,
    removeClip,
    updateClip,
    selectClip,
    play,
    pause,
    seek,
    setZoom,
    exportAudio
  } = useAudioEditor()

  const timelineRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      await addClip(file)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const blob = await exportAudio()
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'edited-audio.wav'
      a.click()
      URL.revokeObjectURL(url)
    }
    setIsExporting(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const selectedClip = state.clips.find(c => c.id === state.selectedClipId)

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-white/10">
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 bg-primary-500 rounded-lg text-white cursor-pointer hover:bg-primary-600">
            导入音频
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            disabled={state.clips.length === 0 || isExporting}
            className="px-4 py-2 bg-green-500 rounded-lg text-white disabled:opacity-50"
          >
            {isExporting ? '导出中...' : '导出'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white/60 font-mono">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">缩放</span>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={state.zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* 主编辑区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 时间轴 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 播放控制 */}
          <div className="flex items-center justify-center gap-4 py-4 bg-dark-800">
            <button
              onClick={() => seek(0)}
              className="p-2 text-white/60 hover:text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={() => state.isPlaying ? pause() : play()}
              className="p-4 bg-primary-500 rounded-full text-white hover:bg-primary-600"
            >
              {state.isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => seek(state.duration)}
              className="p-2 text-white/60 hover:text-white"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* 轨道区域 */}
          <div
            ref={timelineRef}
            className="flex-1 overflow-auto p-4"
            onClick={(e) => {
              if (e.target === timelineRef.current) {
                selectClip(null)
              }
            }}
          >
            {state.clips.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40">
                拖拽或导入音频文件开始编辑
              </div>
            ) : (
              <div className="space-y-2">
                {state.clips.map((clip) => (
                  <motion.div
                    key={clip.id}
                    layoutId={clip.id}
                    onClick={() => selectClip(clip.id)}
                    className={`h-20 rounded-lg cursor-pointer transition-all ${
                      state.selectedClipId === clip.id
                        ? 'ring-2 ring-primary-500'
                        : ''
                    }`}
                    style={{
                      marginLeft: `${clip.startTime * 50 * state.zoom}px`,
                      width: `${(clip.endTime - clip.startTime) * 50 * state.zoom}px`,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <div className="h-full p-2 flex flex-col justify-between">
                      <span className="text-white text-sm truncate">{clip.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-xs">
                          {formatTime(clip.endTime - clip.startTime)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeClip(clip.id)
                          }}
                          className="text-white/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 播放指针 */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
              style={{ left: `${state.currentTime * 50 * state.zoom + 16}px` }}
            />
          </div>
        </div>

        {/* 属性面板 */}
        {selectedClip && (
          <div className="w-80 bg-dark-800 border-l border-white/10 p-4 overflow-auto">
            <h3 className="text-lg font-medium text-white mb-4">片段属性</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">名称</label>
                <input
                  type="text"
                  value={selectedClip.name}
                  onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  音量 ({Math.round(selectedClip.volume * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedClip.volume}
                  onChange={(e) => updateClip(selectedClip.id, { volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  声像 ({selectedClip.pan > 0 ? 'R' : selectedClip.pan < 0 ? 'L' : 'C'} {Math.abs(Math.round(selectedClip.pan * 100))})
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={selectedClip.pan}
                  onChange={(e) => updateClip(selectedClip.id, { pan: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">起始时间</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={selectedClip.startTime}
                  onChange={(e) => updateClip(selectedClip.id, { startTime: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">特效</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['reverb', 'echo', 'distortion', 'chorus'].map((effect) => (
                    <button
                      key={effect}
                      className="px-3 py-2 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 text-sm capitalize"
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AudioEditor
