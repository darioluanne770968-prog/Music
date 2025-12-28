import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 虚拟乐器组件
 * 支持钢琴、吉他、架子鼓、合成器等
 */

// 乐器类型
type InstrumentType = 'piano' | 'guitar' | 'drums' | 'synth' | 'bass' | 'strings'

// 音符定义
interface Note {
  note: string
  frequency: number
  octave: number
}

// 钢琴键盘音符
const PIANO_NOTES: Note[] = [
  { note: 'C', frequency: 261.63, octave: 4 },
  { note: 'C#', frequency: 277.18, octave: 4 },
  { note: 'D', frequency: 293.66, octave: 4 },
  { note: 'D#', frequency: 311.13, octave: 4 },
  { note: 'E', frequency: 329.63, octave: 4 },
  { note: 'F', frequency: 349.23, octave: 4 },
  { note: 'F#', frequency: 369.99, octave: 4 },
  { note: 'G', frequency: 392.00, octave: 4 },
  { note: 'G#', frequency: 415.30, octave: 4 },
  { note: 'A', frequency: 440.00, octave: 4 },
  { note: 'A#', frequency: 466.16, octave: 4 },
  { note: 'B', frequency: 493.88, octave: 4 },
  { note: 'C', frequency: 523.25, octave: 5 },
  { note: 'C#', frequency: 554.37, octave: 5 },
  { note: 'D', frequency: 587.33, octave: 5 },
  { note: 'D#', frequency: 622.25, octave: 5 },
  { note: 'E', frequency: 659.25, octave: 5 },
  { note: 'F', frequency: 698.46, octave: 5 },
  { note: 'F#', frequency: 739.99, octave: 5 },
  { note: 'G', frequency: 783.99, octave: 5 },
  { note: 'G#', frequency: 830.61, octave: 5 },
  { note: 'A', frequency: 880.00, octave: 5 },
  { note: 'A#', frequency: 932.33, octave: 5 },
  { note: 'B', frequency: 987.77, octave: 5 }
]

// 吉他弦定义
const GUITAR_STRINGS = [
  { name: 'E', baseFreq: 329.63, frets: 12 },
  { name: 'B', baseFreq: 246.94, frets: 12 },
  { name: 'G', baseFreq: 196.00, frets: 12 },
  { name: 'D', baseFreq: 146.83, frets: 12 },
  { name: 'A', baseFreq: 110.00, frets: 12 },
  { name: 'E', baseFreq: 82.41, frets: 12 }
]

// 合成器波形
type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle'

// 合成器参数
interface SynthParams {
  waveform: WaveformType
  attack: number
  decay: number
  sustain: number
  release: number
  filterFreq: number
  filterQ: number
  detune: number
  reverb: number
}

// 音频引擎
class InstrumentEngine {
  private audioContext: AudioContext
  private masterGain: GainNode
  private reverb: ConvolverNode
  private activeOscillators: Map<string, OscillatorNode> = new Map()
  private activeGains: Map<string, GainNode> = new Map()

  constructor() {
    this.audioContext = new AudioContext()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = 0.5

    this.reverb = this.audioContext.createConvolver()
    this.createReverbImpulse()

    this.masterGain.connect(this.audioContext.destination)
  }

  private createReverbImpulse() {
    const length = this.audioContext.sampleRate * 2
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
      }
    }

    this.reverb.buffer = impulse
  }

  // 播放音符 - 钢琴音色
  playPianoNote(frequency: number, velocity = 0.8): string {
    const id = `piano_${frequency}_${Date.now()}`

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    // 钢琴音色 - 使用多个谐波
    osc.type = 'triangle'
    osc.frequency.value = frequency

    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filter.Q.value = 1

    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(velocity, this.audioContext.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.3 * velocity, this.audioContext.currentTime + 0.3)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()

    this.activeOscillators.set(id, osc)
    this.activeGains.set(id, gain)

    return id
  }

  // 释放音符
  releaseNote(id: string) {
    const gain = this.activeGains.get(id)
    const osc = this.activeOscillators.get(id)

    if (gain && osc) {
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)
      setTimeout(() => {
        osc.stop()
        osc.disconnect()
        gain.disconnect()
        this.activeOscillators.delete(id)
        this.activeGains.delete(id)
      }, 500)
    }
  }

  // 播放吉他音符
  playGuitarNote(frequency: number, velocity = 0.8): string {
    const id = `guitar_${frequency}_${Date.now()}`

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.value = frequency

    filter.type = 'lowpass'
    filter.frequency.value = 3000
    filter.Q.value = 2

    gain.gain.value = velocity
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 2)

    return id
  }

  // 播放合成器音符
  playSynthNote(frequency: number, params: SynthParams, velocity = 0.8): string {
    const id = `synth_${frequency}_${Date.now()}`

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    osc.type = params.waveform
    osc.frequency.value = frequency
    osc.detune.value = params.detune

    filter.type = 'lowpass'
    filter.frequency.value = params.filterFreq
    filter.Q.value = params.filterQ

    const now = this.audioContext.currentTime
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(velocity, now + params.attack)
    gain.gain.linearRampToValueAtTime(velocity * params.sustain, now + params.attack + params.decay)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()

    this.activeOscillators.set(id, osc)
    this.activeGains.set(id, gain)

    return id
  }

  // 播放鼓声
  playDrum(type: 'kick' | 'snare' | 'hihat' | 'tom' | 'crash') {
    const now = this.audioContext.currentTime

    switch (type) {
      case 'kick': {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()

        osc.frequency.value = 150
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.1)

        gain.gain.value = 1
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start(now)
        osc.stop(now + 0.3)
        break
      }

      case 'snare': {
        const noise = this.createNoise(0.2)
        const osc = this.audioContext.createOscillator()
        const noiseGain = this.audioContext.createGain()
        const oscGain = this.audioContext.createGain()

        osc.frequency.value = 200

        noiseGain.gain.value = 0.5
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

        oscGain.gain.value = 0.5
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

        noise.connect(noiseGain)
        noiseGain.connect(this.masterGain)

        osc.connect(oscGain)
        oscGain.connect(this.masterGain)

        osc.start(now)
        osc.stop(now + 0.2)
        break
      }

      case 'hihat': {
        const noise = this.createNoise(0.1)
        const filter = this.audioContext.createBiquadFilter()
        const gain = this.audioContext.createGain()

        filter.type = 'highpass'
        filter.frequency.value = 8000

        gain.gain.value = 0.3
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)
        break
      }

      case 'tom': {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()

        osc.frequency.value = 100
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2)

        gain.gain.value = 0.8
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start(now)
        osc.stop(now + 0.4)
        break
      }

      case 'crash': {
        const noise = this.createNoise(1)
        const filter = this.audioContext.createBiquadFilter()
        const gain = this.audioContext.createGain()

        filter.type = 'bandpass'
        filter.frequency.value = 5000
        filter.Q.value = 0.5

        gain.gain.value = 0.4
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)
        break
      }
    }
  }

  private createNoise(duration: number): AudioBufferSourceNode {
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.start()

    return source
  }

  setVolume(value: number) {
    this.masterGain.gain.value = value
  }

  getAudioContext(): AudioContext {
    return this.audioContext
  }
}

// 虚拟乐器 Hook
export function useVirtualInstrument() {
  const [instrument, setInstrument] = useState<InstrumentType>('piano')
  const [volume, setVolume] = useState(0.5)
  const [octave, setOctave] = useState(4)
  const [synthParams, setSynthParams] = useState<SynthParams>({
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.5,
    filterFreq: 2000,
    filterQ: 1,
    detune: 0,
    reverb: 0.3
  })

  const engineRef = useRef<InstrumentEngine | null>(null)
  const activeNotesRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    engineRef.current = new InstrumentEngine()
    return () => {
      // 清理
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setVolume(volume)
  }, [volume])

  // 播放音符
  const playNote = useCallback((noteKey: string, frequency: number) => {
    if (!engineRef.current) return

    let noteId: string

    switch (instrument) {
      case 'piano':
        noteId = engineRef.current.playPianoNote(frequency)
        break
      case 'guitar':
        noteId = engineRef.current.playGuitarNote(frequency)
        break
      case 'synth':
        noteId = engineRef.current.playSynthNote(frequency, synthParams)
        break
      default:
        noteId = engineRef.current.playPianoNote(frequency)
    }

    activeNotesRef.current.set(noteKey, noteId)
  }, [instrument, synthParams])

  // 释放音符
  const releaseNote = useCallback((noteKey: string) => {
    const noteId = activeNotesRef.current.get(noteKey)
    if (noteId && engineRef.current) {
      engineRef.current.releaseNote(noteId)
      activeNotesRef.current.delete(noteKey)
    }
  }, [])

  // 播放鼓声
  const playDrum = useCallback((type: 'kick' | 'snare' | 'hihat' | 'tom' | 'crash') => {
    engineRef.current?.playDrum(type)
  }, [])

  return {
    instrument,
    setInstrument,
    volume,
    setVolume,
    octave,
    setOctave,
    synthParams,
    setSynthParams,
    playNote,
    releaseNote,
    playDrum
  }
}

// 钢琴键盘组件
const PianoKeyboard: React.FC<{
  octave: number
  onNoteStart: (key: string, freq: number) => void
  onNoteEnd: (key: string) => void
}> = ({ octave, onNoteStart, onNoteEnd }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

  const handleKeyDown = (note: Note, index: number) => {
    const key = `${note.note}${note.octave}`
    if (!activeKeys.has(key)) {
      setActiveKeys(prev => new Set([...prev, key]))
      const adjustedFreq = note.frequency * Math.pow(2, octave - 4)
      onNoteStart(key, adjustedFreq)
    }
  }

  const handleKeyUp = (note: Note) => {
    const key = `${note.note}${note.octave}`
    setActiveKeys(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    onNoteEnd(key)
  }

  const isBlackKey = (note: string) => note.includes('#')

  return (
    <div className="relative h-48 flex">
      {PIANO_NOTES.map((note, index) => {
        const key = `${note.note}${note.octave}`
        const isBlack = isBlackKey(note.note)
        const isActive = activeKeys.has(key)

        if (isBlack) {
          return (
            <motion.div
              key={key}
              className={`absolute w-8 h-28 rounded-b-lg cursor-pointer z-10 ${
                isActive ? 'bg-primary-500' : 'bg-dark-900'
              }`}
              style={{
                left: `${(index - 0.5) * (100 / PIANO_NOTES.length)}%`
              }}
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => handleKeyDown(note, index)}
              onMouseUp={() => handleKeyUp(note)}
              onMouseLeave={() => activeKeys.has(key) && handleKeyUp(note)}
            />
          )
        }

        return (
          <motion.div
            key={key}
            className={`flex-1 h-full rounded-b-lg cursor-pointer border-r border-dark-600 ${
              isActive ? 'bg-primary-400' : 'bg-white'
            }`}
            whileTap={{ scale: 0.98 }}
            onMouseDown={() => handleKeyDown(note, index)}
            onMouseUp={() => handleKeyUp(note)}
            onMouseLeave={() => activeKeys.has(key) && handleKeyUp(note)}
          >
            <div className="h-full flex items-end justify-center pb-2">
              <span className="text-xs text-dark-400">{note.note}</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 吉他指板组件
const GuitarFretboard: React.FC<{
  onNotePlay: (freq: number) => void
}> = ({ onNotePlay }) => {
  return (
    <div className="bg-amber-900 rounded-lg p-4">
      {GUITAR_STRINGS.map((string, stringIndex) => (
        <div key={stringIndex} className="flex items-center mb-1">
          <span className="w-8 text-xs text-white/60">{string.name}</span>
          <div className="flex-1 flex">
            {Array.from({ length: string.frets }).map((_, fret) => {
              const freq = string.baseFreq * Math.pow(2, fret / 12)
              return (
                <motion.div
                  key={fret}
                  className="flex-1 h-6 border-r border-amber-700 cursor-pointer hover:bg-amber-800/50"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNotePlay(freq)}
                >
                  {[3, 5, 7, 9, 12].includes(fret) && stringIndex === 2 && (
                    <div className="w-2 h-2 mx-auto mt-2 rounded-full bg-white/30" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// 架子鼓组件
const DrumKit: React.FC<{
  onDrumHit: (type: 'kick' | 'snare' | 'hihat' | 'tom' | 'crash') => void
}> = ({ onDrumHit }) => {
  const drums = [
    { type: 'crash' as const, label: '镲', size: 80, position: { top: 10, left: 20 } },
    { type: 'hihat' as const, label: 'Hi-Hat', size: 60, position: { top: 40, left: 10 } },
    { type: 'tom' as const, label: 'Tom', size: 70, position: { top: 30, left: 120 } },
    { type: 'snare' as const, label: '军鼓', size: 80, position: { top: 80, left: 60 } },
    { type: 'kick' as const, label: '底鼓', size: 100, position: { top: 100, left: 140 } }
  ]

  return (
    <div className="relative h-64">
      {drums.map((drum) => (
        <motion.div
          key={drum.type}
          className="absolute rounded-full bg-gradient-to-br from-dark-600 to-dark-800
                     border-4 border-dark-500 cursor-pointer flex items-center justify-center
                     shadow-lg"
          style={{
            width: drum.size,
            height: drum.size,
            top: drum.position.top,
            left: drum.position.left
          }}
          whileTap={{ scale: 0.95, backgroundColor: '#6366f1' }}
          onClick={() => onDrumHit(drum.type)}
        >
          <span className="text-xs text-white/60">{drum.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

// 合成器控制面板
const SynthControls: React.FC<{
  params: SynthParams
  onChange: (params: SynthParams) => void
}> = ({ params, onChange }) => {
  const waveforms: WaveformType[] = ['sine', 'square', 'sawtooth', 'triangle']

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-dark-800 rounded-xl">
      {/* 波形选择 */}
      <div>
        <label className="text-xs text-white/60 block mb-2">波形</label>
        <div className="flex gap-2">
          {waveforms.map(wf => (
            <button
              key={wf}
              onClick={() => onChange({ ...params, waveform: wf })}
              className={`px-2 py-1 rounded text-xs ${
                params.waveform === wf
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {wf}
            </button>
          ))}
        </div>
      </div>

      {/* ADSR */}
      <div className="col-span-2 grid grid-cols-4 gap-2">
        {[
          { key: 'attack', label: 'Attack', max: 1 },
          { key: 'decay', label: 'Decay', max: 1 },
          { key: 'sustain', label: 'Sustain', max: 1 },
          { key: 'release', label: 'Release', max: 2 }
        ].map(ctrl => (
          <div key={ctrl.key}>
            <label className="text-xs text-white/60 block mb-1">{ctrl.label}</label>
            <input
              type="range"
              min="0.01"
              max={ctrl.max}
              step="0.01"
              value={params[ctrl.key as keyof SynthParams] as number}
              onChange={(e) => onChange({
                ...params,
                [ctrl.key]: parseFloat(e.target.value)
              })}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* 滤波器 */}
      <div>
        <label className="text-xs text-white/60 block mb-1">Filter Freq</label>
        <input
          type="range"
          min="100"
          max="10000"
          value={params.filterFreq}
          onChange={(e) => onChange({ ...params, filterFreq: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-white/60 block mb-1">Detune</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={params.detune}
          onChange={(e) => onChange({ ...params, detune: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  )
}

// 主界面
interface VirtualInstrumentsProps {
  className?: string
}

export const VirtualInstruments: React.FC<VirtualInstrumentsProps> = ({ className }) => {
  const {
    instrument,
    setInstrument,
    volume,
    setVolume,
    octave,
    setOctave,
    synthParams,
    setSynthParams,
    playNote,
    releaseNote,
    playDrum
  } = useVirtualInstrument()

  const instruments: { type: InstrumentType; label: string; icon: string }[] = [
    { type: 'piano', label: '钢琴', icon: '🎹' },
    { type: 'guitar', label: '吉他', icon: '🎸' },
    { type: 'drums', label: '架子鼓', icon: '🥁' },
    { type: 'synth', label: '合成器', icon: '🎛️' }
  ]

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">虚拟乐器</h3>

        <div className="flex items-center gap-4">
          {/* 音量 */}
          <div className="flex items-center gap-2">
            <span className="text-white/60">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>

          {/* 八度 */}
          {instrument !== 'drums' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOctave(Math.max(1, octave - 1))}
                className="w-6 h-6 rounded bg-white/10 text-white"
              >
                -
              </button>
              <span className="text-white text-sm">C{octave}</span>
              <button
                onClick={() => setOctave(Math.min(7, octave + 1))}
                className="w-6 h-6 rounded bg-white/10 text-white"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 乐器选择 */}
      <div className="flex gap-2 mb-6">
        {instruments.map((inst) => (
          <button
            key={inst.type}
            onClick={() => setInstrument(inst.type)}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              instrument === inst.type
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <span className="text-2xl">{inst.icon}</span>
            <span className="text-xs">{inst.label}</span>
          </button>
        ))}
      </div>

      {/* 乐器界面 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={instrument}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-dark-800 rounded-xl overflow-hidden"
        >
          {instrument === 'piano' && (
            <PianoKeyboard
              octave={octave}
              onNoteStart={playNote}
              onNoteEnd={releaseNote}
            />
          )}

          {instrument === 'guitar' && (
            <GuitarFretboard
              onNotePlay={(freq) => playNote(`guitar_${freq}`, freq)}
            />
          )}

          {instrument === 'drums' && (
            <DrumKit onDrumHit={playDrum} />
          )}

          {instrument === 'synth' && (
            <div>
              <SynthControls params={synthParams} onChange={setSynthParams} />
              <PianoKeyboard
                octave={octave}
                onNoteStart={playNote}
                onNoteEnd={releaseNote}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 键盘提示 */}
      <div className="mt-4 text-center text-xs text-white/40">
        使用鼠标点击或触摸屏幕演奏
      </div>
    </div>
  )
}

export default VirtualInstruments
