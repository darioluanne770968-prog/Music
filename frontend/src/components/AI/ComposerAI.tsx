import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AI 作曲助手组件
 * 智能编曲、旋律生成、和弦建议
 */

// 音乐风格
type MusicStyle = 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hiphop' | 'folk' | 'rnb'

// 调式
type KeySignature = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'
type Mode = 'major' | 'minor'

// 和弦
interface Chord {
  root: string
  type: 'major' | 'minor' | 'dim' | 'aug' | '7' | 'maj7' | 'min7' | 'sus2' | 'sus4'
  duration: number
}

// 旋律音符
interface MelodyNote {
  pitch: number // MIDI音高
  duration: number
  velocity: number
  startTime: number
}

// 作曲项目
interface CompositionProject {
  id: string
  name: string
  style: MusicStyle
  key: KeySignature
  mode: Mode
  bpm: number
  timeSignature: { beats: number; noteValue: number }
  chordProgression: Chord[]
  melody: MelodyNote[]
  bassline: MelodyNote[]
  drums: { pattern: boolean[][]; sounds: string[] }
  createdAt: Date
}

// AI 建议
interface AISuggestion {
  type: 'chord' | 'melody' | 'rhythm' | 'arrangement'
  content: string
  preview?: any
  confidence: number
}

// 风格配置
const STYLE_CONFIG: Record<MusicStyle, { name: string; icon: string; color: string; chords: string[] }> = {
  pop: { name: '流行', icon: '🎤', color: '#ec4899', chords: ['I', 'V', 'vi', 'IV'] },
  rock: { name: '摇滚', icon: '🎸', color: '#ef4444', chords: ['I', 'IV', 'V', 'I'] },
  jazz: { name: '爵士', icon: '🎷', color: '#f59e0b', chords: ['IIM7', 'V7', 'IM7', 'VI7'] },
  classical: { name: '古典', icon: '🎻', color: '#8b5cf6', chords: ['I', 'IV', 'V', 'I'] },
  electronic: { name: '电子', icon: '🎹', color: '#06b6d4', chords: ['i', 'VI', 'III', 'VII'] },
  hiphop: { name: '嘻哈', icon: '🎧', color: '#10b981', chords: ['i', 'iv', 'VII', 'III'] },
  folk: { name: '民谣', icon: '🪕', color: '#84cc16', chords: ['I', 'IV', 'I', 'V'] },
  rnb: { name: 'R&B', icon: '🎙️', color: '#6366f1', chords: ['IM7', 'IVM7', 'vim7', 'V7'] }
}

// 常用和弦进行
const CHORD_PROGRESSIONS = {
  pop: [
    { name: '经典流行', chords: ['C', 'G', 'Am', 'F'] },
    { name: '抒情', chords: ['Am', 'F', 'C', 'G'] },
    { name: '欢快', chords: ['C', 'Am', 'F', 'G'] }
  ],
  rock: [
    { name: '经典摇滚', chords: ['A', 'D', 'E', 'A'] },
    { name: '力量和弦', chords: ['E5', 'A5', 'D5', 'E5'] },
    { name: '布鲁斯摇滚', chords: ['E7', 'A7', 'B7', 'E7'] }
  ],
  jazz: [
    { name: '2-5-1', chords: ['Dm7', 'G7', 'Cmaj7'] },
    { name: '循环', chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'] },
    { name: '爵士布鲁斯', chords: ['C7', 'F7', 'C7', 'G7'] }
  ]
}

// AI 作曲 Hook
export function useComposerAI() {
  const [project, setProject] = useState<CompositionProject>({
    id: 'proj_1',
    name: '未命名作品',
    style: 'pop',
    key: 'C',
    mode: 'major',
    bpm: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    chordProgression: [],
    melody: [],
    bassline: [],
    drums: { pattern: [], sounds: ['kick', 'snare', 'hihat', 'tom'] },
    createdAt: new Date()
  })

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)

  // 初始化音频上下文
  useEffect(() => {
    audioContextRef.current = new AudioContext()
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  // 生成和弦进行
  const generateChordProgression = useCallback(async () => {
    setIsGenerating(true)

    // 模拟 AI 生成
    await new Promise(resolve => setTimeout(resolve, 1500))

    const styleChords = CHORD_PROGRESSIONS[project.style as keyof typeof CHORD_PROGRESSIONS] ||
                       CHORD_PROGRESSIONS.pop

    const selected = styleChords[Math.floor(Math.random() * styleChords.length)]

    const chords: Chord[] = selected.chords.map((chord, i) => ({
      root: chord,
      type: chord.includes('m') ? 'minor' : chord.includes('7') ? '7' : 'major',
      duration: 4
    }))

    setProject(prev => ({ ...prev, chordProgression: chords }))
    setIsGenerating(false)

    // 生成建议
    setSuggestions([
      {
        type: 'chord',
        content: `推荐使用 ${selected.name} 进行，这是${STYLE_CONFIG[project.style].name}风格的经典选择`,
        confidence: 0.92
      },
      {
        type: 'melody',
        content: '可以尝试在和弦音上构建旋律，使用经过音增加流动性',
        confidence: 0.85
      }
    ])
  }, [project.style])

  // 生成旋律
  const generateMelody = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 基于和弦生成简单旋律
    const melody: MelodyNote[] = []
    let currentTime = 0

    project.chordProgression.forEach((chord, chordIndex) => {
      // 每个和弦生成几个音符
      const notesPerChord = 4
      for (let i = 0; i < notesPerChord; i++) {
        const baseNote = 60 + (chordIndex % 7) * 2 // C4 基础
        melody.push({
          pitch: baseNote + Math.floor(Math.random() * 12),
          duration: 0.5,
          velocity: 0.7 + Math.random() * 0.3,
          startTime: currentTime
        })
        currentTime += 0.5
      }
    })

    setProject(prev => ({ ...prev, melody }))
    setIsGenerating(false)

    setSuggestions(prev => [...prev, {
      type: 'melody',
      content: 'AI 已生成基础旋律，您可以进一步调整音高和节奏',
      confidence: 0.88
    }])
  }, [project.chordProgression])

  // 生成贝斯线
  const generateBassline = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const bassline: MelodyNote[] = []
    let currentTime = 0

    project.chordProgression.forEach((chord) => {
      // 贝斯跟随和弦根音
      bassline.push({
        pitch: 36 + Math.floor(Math.random() * 12), // 低音区
        duration: 1,
        velocity: 0.8,
        startTime: currentTime
      })
      currentTime += 1
    })

    setProject(prev => ({ ...prev, bassline }))
    setIsGenerating(false)
  }, [project.chordProgression])

  // 生成鼓点
  const generateDrums = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 16步鼓机模式
    const pattern: boolean[][] = [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // hihat
      [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] // tom
    ]

    setProject(prev => ({
      ...prev,
      drums: { ...prev.drums, pattern }
    }))
    setIsGenerating(false)
  }, [])

  // 播放音符
  const playNote = useCallback((pitch: number, duration: number) => {
    if (!audioContextRef.current) return

    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()

    osc.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12)
    osc.type = 'sine'

    gain.gain.value = 0.3
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    osc.connect(gain)
    gain.connect(audioContextRef.current.destination)

    osc.start()
    osc.stop(audioContextRef.current.currentTime + duration)
  }, [])

  // 更新项目设置
  const updateProject = useCallback(<K extends keyof CompositionProject>(
    key: K,
    value: CompositionProject[K]
  ) => {
    setProject(prev => ({ ...prev, [key]: value }))
  }, [])

  // 一键生成完整编曲
  const generateFullArrangement = useCallback(async () => {
    await generateChordProgression()
    await generateMelody()
    await generateBassline()
    await generateDrums()

    setSuggestions([{
      type: 'arrangement',
      content: 'AI 已生成完整编曲！包含和弦进行、旋律、贝斯和鼓点',
      confidence: 0.95
    }])
  }, [generateChordProgression, generateMelody, generateBassline, generateDrums])

  return {
    project,
    suggestions,
    isGenerating,
    isPlaying,
    setIsPlaying,
    playbackPosition,
    updateProject,
    generateChordProgression,
    generateMelody,
    generateBassline,
    generateDrums,
    generateFullArrangement,
    playNote
  }
}

// 风格选择器
const StyleSelector: React.FC<{
  selected: MusicStyle
  onSelect: (style: MusicStyle) => void
}> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(Object.entries(STYLE_CONFIG) as [MusicStyle, typeof STYLE_CONFIG[MusicStyle]][]).map(([style, config]) => (
        <motion.button
          key={style}
          onClick={() => onSelect(style)}
          className={`p-3 rounded-xl text-center transition-all ${
            selected === style
              ? 'ring-2 ring-offset-2 ring-offset-dark-900'
              : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: selected === style ? `${config.color}30` : 'rgba(255,255,255,0.05)',
            ringColor: config.color
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl block mb-1">{config.icon}</span>
          <span className="text-xs text-white">{config.name}</span>
        </motion.button>
      ))}
    </div>
  )
}

// 调号选择器
const KeySelector: React.FC<{
  selectedKey: KeySignature
  selectedMode: Mode
  onKeyChange: (key: KeySignature) => void
  onModeChange: (mode: Mode) => void
}> = ({ selectedKey, selectedMode, onKeyChange, onModeChange }) => {
  const keys: KeySignature[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('major')}
          className={`flex-1 py-2 rounded-lg text-sm ${
            selectedMode === 'major' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          大调
        </button>
        <button
          onClick={() => onModeChange('minor')}
          className={`flex-1 py-2 rounded-lg text-sm ${
            selectedMode === 'minor' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          小调
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {keys.map(key => (
          <button
            key={key}
            onClick={() => onKeyChange(key)}
            className={`w-8 h-8 rounded text-sm ${
              selectedKey === key ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

// 和弦进行显示
const ChordProgressionView: React.FC<{
  chords: Chord[]
  onChordClick: (index: number) => void
}> = ({ chords, onChordClick }) => {
  if (chords.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-white/40">
        点击"生成和弦"开始
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {chords.map((chord, index) => (
        <motion.button
          key={index}
          onClick={() => onChordClick(index)}
          className="flex-1 h-24 bg-gradient-to-br from-primary-500/30 to-purple-500/30
                   rounded-xl flex flex-col items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="text-2xl font-bold text-white">{chord.root}</span>
          <span className="text-xs text-white/60">{chord.type}</span>
        </motion.button>
      ))}
    </div>
  )
}

// 旋律编辑器 (钢琴卷帘)
const MelodyEditor: React.FC<{
  melody: MelodyNote[]
  onNoteClick: (pitch: number, time: number) => void
}> = ({ melody, onNoteClick }) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaves = [4, 5]
  const steps = 16

  return (
    <div className="bg-dark-800 rounded-xl overflow-hidden">
      <div className="flex">
        {/* 音符标签 */}
        <div className="w-12 flex-shrink-0">
          {octaves.reverse().map(oct =>
            noteNames.slice().reverse().map(note => (
              <div
                key={`${note}${oct}`}
                className={`h-4 flex items-center justify-end pr-1 text-xs ${
                  note.includes('#') ? 'bg-dark-700 text-white/40' : 'text-white/60'
                }`}
              >
                {note}{oct}
              </div>
            ))
          )}
        </div>

        {/* 网格 */}
        <div className="flex-1 relative">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${steps}, 1fr)` }}>
            {octaves.reverse().map(oct =>
              noteNames.slice().reverse().map(note => (
                [...Array(steps)].map((_, step) => {
                  const pitch = (oct - 4) * 12 + noteNames.indexOf(note) + 60
                  const hasNote = melody.some(n =>
                    n.pitch === pitch && Math.floor(n.startTime * 4) === step
                  )

                  return (
                    <div
                      key={`${note}${oct}-${step}`}
                      onClick={() => onNoteClick(pitch, step / 4)}
                      className={`h-4 border-r border-b border-white/5 cursor-pointer
                               ${step % 4 === 0 ? 'border-l border-white/10' : ''}
                               ${note.includes('#') ? 'bg-dark-700' : 'bg-dark-800'}
                               hover:bg-primary-500/30`}
                    >
                      {hasNote && (
                        <div className="w-full h-full bg-primary-500 rounded-sm" />
                      )}
                    </div>
                  )
                })
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// AI 建议卡片
const SuggestionCard: React.FC<{
  suggestion: AISuggestion
}> = ({ suggestion }) => {
  const typeConfig = {
    chord: { icon: '🎹', label: '和弦建议' },
    melody: { icon: '🎵', label: '旋律建议' },
    rhythm: { icon: '🥁', label: '节奏建议' },
    arrangement: { icon: '🎼', label: '编曲建议' }
  }

  const config = typeConfig[suggestion.type]

  return (
    <motion.div
      className="p-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium">{config.label}</span>
            <span className="text-xs text-white/40">
              置信度 {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
          <p className="text-sm text-white/60">{suggestion.content}</p>
        </div>
      </div>
    </motion.div>
  )
}

// 主界面
interface ComposerAIProps {
  className?: string
}

export const ComposerAI: React.FC<ComposerAIProps> = ({ className }) => {
  const {
    project,
    suggestions,
    isGenerating,
    updateProject,
    generateChordProgression,
    generateMelody,
    generateBassline,
    generateDrums,
    generateFullArrangement,
    playNote
  } = useComposerAI()

  const [activeTab, setActiveTab] = useState<'setup' | 'compose' | 'arrange'>('setup')

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">AI 作曲助手</h3>
          <p className="text-sm text-white/40">{project.name}</p>
        </div>

        <button
          onClick={generateFullArrangement}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg
                   text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              生成中...
            </>
          ) : (
            <>
              ✨ 一键编曲
            </>
          )}
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'setup', label: '设置' },
          { key: 'compose', label: '作曲' },
          { key: 'arrange', label: '编曲' }
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

      <AnimatePresence mode="wait">
        {activeTab === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 风格选择 */}
            <div>
              <p className="text-white/60 text-sm mb-3">音乐风格</p>
              <StyleSelector
                selected={project.style}
                onSelect={(style) => updateProject('style', style)}
              />
            </div>

            {/* 调号选择 */}
            <div>
              <p className="text-white/60 text-sm mb-3">调号</p>
              <KeySelector
                selectedKey={project.key}
                selectedMode={project.mode}
                onKeyChange={(key) => updateProject('key', key)}
                onModeChange={(mode) => updateProject('mode', mode)}
              />
            </div>

            {/* BPM */}
            <div>
              <p className="text-white/60 text-sm mb-3">速度 (BPM)</p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={project.bpm}
                  onChange={(e) => updateProject('bpm', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-white font-mono w-12">{project.bpm}</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 和弦进行 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm">和弦进行</p>
                <button
                  onClick={generateChordProgression}
                  disabled={isGenerating}
                  className="px-3 py-1 bg-primary-500 rounded text-xs text-white disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '生成和弦'}
                </button>
              </div>
              <ChordProgressionView
                chords={project.chordProgression}
                onChordClick={(i) => playNote(60 + i * 4, 0.5)}
              />
            </div>

            {/* 旋律 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm">旋律</p>
                <button
                  onClick={generateMelody}
                  disabled={isGenerating || project.chordProgression.length === 0}
                  className="px-3 py-1 bg-primary-500 rounded text-xs text-white disabled:opacity-50"
                >
                  生成旋律
                </button>
              </div>
              <MelodyEditor
                melody={project.melody}
                onNoteClick={playNote}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'arrange' && (
          <motion.div
            key="arrange"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 乐器轨道 */}
            <div className="space-y-3">
              {[
                { name: '旋律', icon: '🎹', hasContent: project.melody.length > 0, onGenerate: generateMelody },
                { name: '贝斯', icon: '🎸', hasContent: project.bassline.length > 0, onGenerate: generateBassline },
                { name: '鼓点', icon: '🥁', hasContent: project.drums.pattern.length > 0, onGenerate: generateDrums }
              ].map((track, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-dark-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{track.icon}</span>
                    <span className="text-white">{track.name}</span>
                    {track.hasContent && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        已生成
                      </span>
                    )}
                  </div>
                  <button
                    onClick={track.onGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1 bg-white/10 rounded text-xs text-white/60
                             hover:bg-white/20 disabled:opacity-50"
                  >
                    {track.hasContent ? '重新生成' : '生成'}
                  </button>
                </div>
              ))}
            </div>

            {/* 导出 */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-white/10 rounded-xl text-white">
                导出 MIDI
              </button>
              <button className="flex-1 py-3 bg-primary-500 rounded-xl text-white">
                导出音频
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 建议 */}
      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-white/60 text-sm">AI 建议</p>
          {suggestions.slice(-2).map((suggestion, i) => (
            <SuggestionCard key={i} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ComposerAI
