/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Format number to human readable format (e.g., 1.2万, 3.5亿)
 */
export function formatNumber(num: number): string {
  if (!num || num < 0) return '0'

  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toLocaleString()
}

/**
 * Alias for formatNumber - format play count
 */
export const formatPlayCount = formatNumber

/**
 * Format date to relative time (e.g., 刚刚, 5分钟前, 昨天)
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 2) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * Format date to string (e.g., 2024-01-01, 2024年1月1日)
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  if (format === 'long') {
    return `${year}年${month}月${day}日`
  }
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let size = bytes

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

/**
 * Format bitrate to human readable format
 */
export function formatBitrate(kbps: number): string {
  if (!kbps || kbps < 0) return '未知'

  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`
  }
  return `${kbps} kbps`
}

/**
 * Get quality label
 */
export function getQualityLabel(quality: string): string {
  const labels: Record<string, string> = {
    standard: '标准',
    high: '高品质',
    lossless: '无损',
    hires: 'Hi-Res',
    '128': '标准 128kbps',
    '320': '高品质 320kbps',
    flac: '无损 FLAC',
    master: '母带级',
  }
  return labels[quality] || quality
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate random color from string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    '#ff3366',
    '#ff6b8a',
    '#ff9fb5',
    '#ed1152',
    '#c80845',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#ec4899',
    '#f43f5e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
  ]

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return ''

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Format playlist tags
 */
export function formatTags(tags: string[], maxCount: number = 3): string[] {
  return tags.slice(0, maxCount)
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}
