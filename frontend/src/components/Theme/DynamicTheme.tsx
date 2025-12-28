import { useEffect, useRef } from 'react'
import ColorThief from 'color-thief-browser'
import { usePlayerStore } from '@/stores/playerStore'
import { useThemeStore } from '@/stores/themeStore'

/**
 * 动态主题组件
 * 根据当前播放歌曲的专辑封面提取主色调
 */
export const DynamicTheme: React.FC = () => {
  const { currentSong } = usePlayerStore()
  const { dynamicTheme, updateDynamicColors } = useThemeStore()
  const colorThief = useRef<ColorThief | null>(null)
  const lastImageUrl = useRef<string | null>(null)

  useEffect(() => {
    if (!dynamicTheme.enabled) return
    if (!currentSong?.album?.coverUrl) return
    if (currentSong.album.coverUrl === lastImageUrl.current) return

    lastImageUrl.current = currentSong.album.coverUrl

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = currentSong.album.coverUrl

    img.onload = () => {
      try {
        if (!colorThief.current) {
          colorThief.current = new ColorThief()
        }

        // 获取主色调
        const dominantColor = colorThief.current.getColor(img)
        const palette = colorThief.current.getPalette(img, 5)

        if (dominantColor && palette) {
          const dominant = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])
          const paletteHex = palette.map(c => rgbToHex(c[0], c[1], c[2]))

          updateDynamicColors({
            dominant,
            palette: paletteHex,
          })
        }
      } catch (error) {
        console.error('Failed to extract colors:', error)
      }
    }

    img.onerror = () => {
      console.error('Failed to load image for color extraction')
    }
  }, [currentSong?.album?.coverUrl, dynamicTheme.enabled, updateDynamicColors])

  return null
}

// RGB 转 HEX
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export default DynamicTheme
