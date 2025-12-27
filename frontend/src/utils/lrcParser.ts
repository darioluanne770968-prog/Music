import type { LyricLine, LyricWord } from '@/types'

/**
 * Parse LRC format lyrics
 * Supports: [mm:ss.xx] text, [mm:ss.xxx] text, [mm:ss] text
 */
export function parseLRC(lrc: string): LyricLine[] {
  if (!lrc || typeof lrc !== 'string') return []

  const lines: LyricLine[] = []
  const lrcLines = lrc.split('\n')

  // Regex for time tags: [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of lrcLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Skip metadata lines like [ti:Title], [ar:Artist], etc.
    if (/^\[[a-z]{2}:/.test(trimmed)) continue

    // Find all time tags
    const times: number[] = []
    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
        : 0

      const time = minutes * 60 + seconds + milliseconds / 1000
      times.push(time)
      lastIndex = match.index + match[0].length
    }

    if (times.length === 0) continue

    // Get the text after all time tags
    const text = trimmed.slice(lastIndex).trim()
    if (!text) continue

    // Add a line for each time tag (for lyrics with multiple time tags)
    for (const time of times) {
      lines.push({ time, text })
    }
  }

  // Sort by time
  lines.sort((a, b) => a.time - b.time)

  return lines
}

/**
 * Parse enhanced LRC with word-by-word timing
 * Format: [mm:ss.xx]<mm:ss.xx>word1<mm:ss.xx>word2...
 */
export function parseEnhancedLRC(lrc: string): LyricLine[] {
  if (!lrc || typeof lrc !== 'string') return []

  const lines: LyricLine[] = []
  const lrcLines = lrc.split('\n')

  const lineTimeRegex = /^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/
  const wordTimeRegex = /<(\d{2}):(\d{2})(?:\.(\d{2,3}))?>/g

  for (const line of lrcLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Skip metadata
    if (/^\[[a-z]{2}:/.test(trimmed)) continue

    // Parse line time
    const lineMatch = lineTimeRegex.exec(trimmed)
    if (!lineMatch) continue

    const lineMinutes = parseInt(lineMatch[1], 10)
    const lineSeconds = parseInt(lineMatch[2], 10)
    const lineMs = lineMatch[3]
      ? parseInt(lineMatch[3].padEnd(3, '0').slice(0, 3), 10)
      : 0
    const lineTime = lineMinutes * 60 + lineSeconds + lineMs / 1000

    // Get content after line time tag
    const content = trimmed.slice(lineMatch[0].length)

    // Parse words
    const words: LyricWord[] = []
    let lastIndex = 0
    let lastWordEndTime = lineTime
    let match: RegExpExecArray | null

    while ((match = wordTimeRegex.exec(content)) !== null) {
      // Text before this time tag is part of previous word or first word
      const textBefore = content.slice(lastIndex, match.index).trim()

      if (textBefore && words.length > 0) {
        // Add to previous word
        words[words.length - 1].text += textBefore
      } else if (textBefore) {
        // First word
        words.push({
          time: lineTime,
          duration: 0,
          text: textBefore,
        })
      }

      // Parse word time
      const wordMinutes = parseInt(match[1], 10)
      const wordSeconds = parseInt(match[2], 10)
      const wordMs = match[3]
        ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
        : 0
      const wordTime = wordMinutes * 60 + wordSeconds + wordMs / 1000

      // Update duration of previous word
      if (words.length > 0) {
        words[words.length - 1].duration = wordTime - lastWordEndTime
      }

      lastWordEndTime = wordTime
      lastIndex = match.index + match[0].length
    }

    // Remaining text
    const remainingText = content.slice(lastIndex).trim()
    if (remainingText) {
      if (words.length > 0) {
        words[words.length - 1].text += remainingText
      } else {
        words.push({
          time: lineTime,
          duration: 0,
          text: remainingText,
        })
      }
    }

    // Build full text
    const fullText = words.map((w) => w.text).join('')

    if (fullText) {
      lines.push({
        time: lineTime,
        text: fullText,
        words: words.length > 0 ? words : undefined,
      })
    }
  }

  lines.sort((a, b) => a.time - b.time)

  return lines
}

/**
 * Parse QRC (QQ Music) format lyrics
 */
export function parseQRC(qrc: string): LyricLine[] {
  // QRC is XML-based, this is a simplified parser
  if (!qrc || typeof qrc !== 'string') return []

  try {
    // Extract LyricContent from QRC
    const contentMatch = qrc.match(/<LyricContent><!\[CDATA\[([\s\S]*?)\]\]><\/LyricContent>/)
    if (!contentMatch) return parseLRC(qrc) // Fallback to LRC

    const content = contentMatch[1]
    return parseLRC(content)
  } catch {
    return parseLRC(qrc)
  }
}

/**
 * Parse KRC (Kugou) format lyrics
 */
export function parseKRC(krc: string): LyricLine[] {
  // KRC is a proprietary format, this is a simplified parser
  if (!krc || typeof krc !== 'string') return []

  // KRC starts with krc1 header and is base64 encoded
  // For simplicity, we assume it's already decoded
  return parseLRC(krc)
}

/**
 * Auto-detect and parse lyrics
 */
export function parseLyrics(content: string, type: 'lrc' | 'qrc' | 'krc' = 'lrc'): LyricLine[] {
  switch (type) {
    case 'qrc':
      return parseQRC(content)
    case 'krc':
      return parseKRC(content)
    default:
      // Check if it's enhanced LRC
      if (content.includes('<') && content.includes('>')) {
        const enhanced = parseEnhancedLRC(content)
        if (enhanced.length > 0 && enhanced.some((l) => l.words)) {
          return enhanced
        }
      }
      return parseLRC(content)
  }
}

/**
 * Find current lyric line index based on current time
 */
export function findCurrentLineIndex(
  lyrics: LyricLine[],
  currentTime: number,
  offset: number = 0
): number {
  if (!lyrics || lyrics.length === 0) return -1

  const time = currentTime + offset

  // Binary search for efficiency
  let left = 0
  let right = lyrics.length - 1
  let result = -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (lyrics[mid].time <= time) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}

/**
 * Calculate word highlight progress
 */
export function calculateWordProgress(
  line: LyricLine,
  currentTime: number,
  offset: number = 0
): number[] {
  if (!line.words) return []

  const time = currentTime + offset
  const lineStartTime = line.time

  return line.words.map((word) => {
    const wordStart = word.time
    const wordEnd = wordStart + word.duration

    if (time < wordStart) return 0
    if (time >= wordEnd) return 1
    if (word.duration === 0) return time >= wordStart ? 1 : 0

    return (time - wordStart) / word.duration
  })
}

/**
 * Convert lyrics to plain text
 */
export function lyricsToText(lyrics: LyricLine[]): string {
  return lyrics.map((line) => line.text).join('\n')
}

/**
 * Convert lyrics to LRC format string
 */
export function lyricsToLRC(lyrics: LyricLine[]): string {
  return lyrics
    .map((line) => {
      const minutes = Math.floor(line.time / 60)
      const seconds = Math.floor(line.time % 60)
      const ms = Math.round((line.time % 1) * 100)

      return `[${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${ms.toString().padStart(2, '0')}]${line.text}`
    })
    .join('\n')
}

/**
 * Merge original and translated lyrics
 */
export function mergeLyrics(
  original: LyricLine[],
  translated: LyricLine[]
): LyricLine[] {
  if (!translated || translated.length === 0) return original
  if (!original || original.length === 0) return []

  // Create a map of translated lyrics by time (rounded to avoid float issues)
  const translatedMap = new Map<number, string>()
  for (const line of translated) {
    translatedMap.set(Math.round(line.time * 100) / 100, line.text)
  }

  // Merge
  return original.map((line) => {
    const key = Math.round(line.time * 100) / 100
    const translation = translatedMap.get(key)

    if (translation) {
      return {
        ...line,
        text: `${line.text}\n${translation}`,
      }
    }
    return line
  })
}
