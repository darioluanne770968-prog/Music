/**
 * Audio utilities for the music player
 */

// Audio context for visualization and effects
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null

/**
 * Initialize audio context
 */
export function initAudioContext(audioElement: HTMLAudioElement): {
  context: AudioContext
  analyser: AnalyserNode
} {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }

  if (!analyser) {
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
  }

  if (!sourceNode) {
    sourceNode = audioContext.createMediaElementSource(audioElement)
    sourceNode.connect(analyser)
    analyser.connect(audioContext.destination)
  }

  return { context: audioContext, analyser }
}

/**
 * Get frequency data for visualization
 */
export function getFrequencyData(): Uint8Array {
  if (!analyser) return new Uint8Array(0)

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  return dataArray
}

/**
 * Get waveform data for visualization
 */
export function getWaveformData(): Uint8Array {
  if (!analyser) return new Uint8Array(0)

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  return dataArray
}

/**
 * Resume audio context (required after user interaction)
 */
export function resumeAudioContext(): Promise<void> {
  if (audioContext && audioContext.state === 'suspended') {
    return audioContext.resume()
  }
  return Promise.resolve()
}

/**
 * Create equalizer bands
 */
export function createEqualizer(
  context: AudioContext,
  bands: number[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]
): BiquadFilterNode[] {
  const filters: BiquadFilterNode[] = []

  bands.forEach((frequency, index) => {
    const filter = context.createBiquadFilter()

    if (index === 0) {
      filter.type = 'lowshelf'
    } else if (index === bands.length - 1) {
      filter.type = 'highshelf'
    } else {
      filter.type = 'peaking'
    }

    filter.frequency.value = frequency
    filter.gain.value = 0
    filter.Q.value = 1

    filters.push(filter)
  })

  // Connect filters in series
  for (let i = 0; i < filters.length - 1; i++) {
    filters[i].connect(filters[i + 1])
  }

  return filters
}

/**
 * Apply equalizer preset
 */
export function applyEqualizerPreset(
  filters: BiquadFilterNode[],
  preset: string
): void {
  const presets: Record<string, number[]> = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: [5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    treble: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    vocal: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
    dance: [4, 3, 1, 0, -1, 0, 1, 2, 3, 4],
    rock: [4, 3, 1, 0, -1, 0, 2, 3, 4, 4],
    pop: [1, 2, 3, 2, 0, -1, -1, 0, 1, 2],
    jazz: [3, 2, 0, 1, -1, -1, 0, 1, 2, 3],
    classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
    electronic: [4, 3, 0, -2, -2, 0, 3, 4, 4, 3],
    hiphop: [5, 4, 0, -1, 2, 0, 1, 2, 3, 4],
    rnb: [3, 5, 3, -1, -1, 1, 2, 2, 3, 3],
    acoustic: [3, 2, 0, 1, 2, 1, 1, 2, 2, 2],
    loudness: [4, 3, 0, 0, -2, 0, -1, -3, 4, 1],
    lounge: [-3, -2, 0, 1, 3, 2, 0, -1, 1, 0],
  }

  const gains = presets[preset] || presets.flat

  filters.forEach((filter, index) => {
    if (gains[index] !== undefined) {
      filter.gain.value = gains[index]
    }
  })
}

/**
 * Calculate RMS volume level
 */
export function calculateRMSLevel(data: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    const value = (data[i] - 128) / 128
    sum += value * value
  }
  return Math.sqrt(sum / data.length)
}

/**
 * Detect beats in audio (simple implementation)
 */
export function detectBeat(
  frequencyData: Uint8Array,
  threshold: number = 0.8,
  sensitivity: number = 100
): boolean {
  // Focus on bass frequencies (first few bins)
  const bassRange = frequencyData.slice(0, 10)
  const average = bassRange.reduce((a, b) => a + b, 0) / bassRange.length

  return average > threshold * sensitivity
}

/**
 * Get dominant color from frequency data (for visualization)
 */
export function getColorFromFrequency(
  frequencyData: Uint8Array,
  baseHue: number = 330
): string {
  const average = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length
  const normalized = average / 255

  const hue = (baseHue + normalized * 60) % 360
  const saturation = 70 + normalized * 30
  const lightness = 40 + normalized * 20

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Format audio buffer to WAV
 */
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const dataLength = buffer.length * blockAlign
  const headerLength = 44
  const totalLength = headerLength + dataLength

  const arrayBuffer = new ArrayBuffer(totalLength)
  const view = new DataView(arrayBuffer)

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, totalLength - 8, true)
  writeString(view, 8, 'WAVE')

  // fmt sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Sub-chunk size
  view.setUint16(20, format, true) // Audio format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true) // Byte rate
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)

  // data sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write audio data
  const channels: Float32Array[] = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }

  return arrayBuffer
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * Cross-fade between two audio sources
 */
export function crossFade(
  fromElement: HTMLAudioElement,
  toElement: HTMLAudioElement,
  duration: number = 2000
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fromVolume = fromElement.volume
    const toVolume = toElement.volume

    toElement.volume = 0
    toElement.play()

    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      fromElement.volume = fromVolume * (1 - progress)
      toElement.volume = toVolume * progress

      if (progress < 1) {
        requestAnimationFrame(fade)
      } else {
        fromElement.pause()
        fromElement.volume = fromVolume
        resolve()
      }
    }

    requestAnimationFrame(fade)
  })
}

/**
 * Preload audio file
 */
export function preloadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'auto'

    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true })
    audio.addEventListener('error', () => reject(new Error('Failed to load audio')), {
      once: true,
    })

    audio.src = url
    audio.load()
  })
}

/**
 * Check if audio format is supported
 */
export function isFormatSupported(mimeType: string): boolean {
  const audio = document.createElement('audio')
  return audio.canPlayType(mimeType) !== ''
}

/**
 * Get supported audio formats
 */
export function getSupportedFormats(): string[] {
  const formats = [
    { mime: 'audio/mpeg', ext: 'mp3' },
    { mime: 'audio/ogg; codecs="vorbis"', ext: 'ogg' },
    { mime: 'audio/wav', ext: 'wav' },
    { mime: 'audio/flac', ext: 'flac' },
    { mime: 'audio/aac', ext: 'aac' },
    { mime: 'audio/webm; codecs="opus"', ext: 'webm' },
    { mime: 'audio/mp4; codecs="mp4a.40.2"', ext: 'm4a' },
  ]

  return formats.filter((f) => isFormatSupported(f.mime)).map((f) => f.ext)
}
