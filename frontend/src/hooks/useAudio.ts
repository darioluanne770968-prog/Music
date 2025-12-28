import { useEffect, useRef, useCallback } from 'react'
import { Howl, Howler } from 'howler'
import { usePlayerStore } from '@/stores/playerStore'
import { useStatsStore } from '@/stores/statsStore'
import { resumeAudioContext } from '@/utils/audio'

interface UseAudioOptions {
  onEnded?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (time: number) => void
  onDurationChange?: (duration: number) => void
  onBufferProgress?: (progress: number) => void
}

export function useAudio(options: UseAudioOptions = {}) {
  const howlRef = useRef<Howl | null>(null)
  const animationRef = useRef<number | null>(null)
  const playStartTime = useRef<number>(0)
  const { recordPlay } = useStatsStore()

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    playMode,
    seekTime,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setBuffered,
    setIsLoading,
    setError,
    playNext,
  } = usePlayerStore()

  // Update time during playback
  const updateTime = useCallback(() => {
    if (howlRef.current && isPlaying) {
      const time = howlRef.current.seek() as number
      setCurrentTime(time)
      options.onTimeUpdate?.(time)
      animationRef.current = requestAnimationFrame(updateTime)
    }
  }, [isPlaying, setCurrentTime, options])

  // Load new song
  useEffect(() => {
    if (!currentSong) return

    // Clean up previous
    if (howlRef.current) {
      howlRef.current.unload()
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsLoading(true)
    setError(null)

    // Get audio URL from Netease API
    const loadAudio = async () => {
      try {
        let audioUrl = currentSong.url // Use direct URL if available

        // Try to fetch from Netease API
        if (!audioUrl) {
          try {
            const response = await fetch(`/api/song/url/v1?id=${currentSong.id}&level=exhigh`)
            const data = await response.json()
            if (data.code === 200 && data.data?.[0]?.url) {
              audioUrl = data.data[0].url
            }
          } catch {
            console.log('API not available, using fallback')
          }
        }

        if (!audioUrl) {
          throw new Error('无法获取音频地址，可能需要 VIP')
        }

        const howl = new Howl({
          src: [audioUrl],
          html5: true, // Use HTML5 Audio for streaming
          preload: true,
          volume: isMuted ? 0 : volume,
          rate: playbackRate,
          onload: () => {
            setDuration(howl.duration())
            setIsLoading(false)
            options.onDurationChange?.(howl.duration())
          },
          onplay: () => {
            // Check if we actually want to be playing
            const currentState = usePlayerStore.getState()
            if (!currentState.isPlaying) {
              // User paused but something triggered play - pause again
              howl.pause()
              return
            }
            // Track play start time for stats
            playStartTime.current = Date.now()
            resumeAudioContext()
            animationRef.current = requestAnimationFrame(updateTime)
          },
          onpause: () => {
            setIsPlaying(false)
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current)
            }
          },
          onstop: () => {
            setIsPlaying(false)
            setCurrentTime(0)
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current)
            }
          },
          onend: () => {
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current)
            }

            // Record play stats
            if (currentSong && playStartTime.current > 0) {
              const playDuration = Math.floor((Date.now() - playStartTime.current) / 1000)
              if (playDuration > 10) { // Only record if played more than 10 seconds
                recordPlay({
                  id: currentSong.id,
                  name: currentSong.name,
                  artist: currentSong.artist?.name || currentSong.artist || '未知歌手',
                  artistId: currentSong.artist?.id,
                  album: currentSong.album,
                  albumId: currentSong.albumId,
                  cover: currentSong.cover,
                }, playDuration)
              }
              playStartTime.current = 0
            }

            options.onEnded?.()

            // Handle play mode
            if (playMode === 'single') {
              howl.seek(0)
              howl.play()
            } else {
              playNext()
            }
          },
          onloaderror: (_, error) => {
            const errorMsg = `加载失败: ${error}`
            setError(errorMsg)
            setIsLoading(false)
            options.onError?.(errorMsg)
          },
          onplayerror: (_, error) => {
            const errorMsg = `播放失败: ${error}`
            setError(errorMsg)
            setIsPlaying(false)
            options.onError?.(errorMsg)
          },
        })

        howlRef.current = howl

        // Auto play if isPlaying was true
        if (isPlaying) {
          howl.play()
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '加载音频失败'
        setError(errorMsg)
        setIsLoading(false)
        options.onError?.(errorMsg)
      }
    }

    loadAudio()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentSong?.id])

  // Handle play/pause state changes
  useEffect(() => {
    if (!howlRef.current) return

    if (isPlaying) {
      // Only play if not already playing
      if (!howlRef.current.playing()) {
        howlRef.current.play()
      }
    } else {
      // Always pause when isPlaying is false
      howlRef.current.pause()
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume)
    }
    Howler.volume(isMuted ? 0 : volume)
  }, [volume, isMuted])

  // Handle playback rate changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackRate)
    }
  }, [playbackRate])

  // Handle seek requests
  useEffect(() => {
    if (seekTime !== null && howlRef.current) {
      howlRef.current.seek(seekTime)
      // Clear the seek request
      usePlayerStore.setState({ seekTime: null })
    }
  }, [seekTime])

  // Seek function
  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time)
      setCurrentTime(time)
    }
  }, [setCurrentTime])

  // Play function
  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play()
    }
  }, [])

  // Pause function
  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause()
    }
  }, [])

  // Toggle play function
  const togglePlay = useCallback(() => {
    if (howlRef.current) {
      if (howlRef.current.playing()) {
        howlRef.current.pause()
      } else {
        howlRef.current.play()
      }
    }
  }, [])

  // Stop function
  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop()
    }
  }, [])

  // Get audio element for visualization
  const getAudioElement = useCallback((): HTMLAudioElement | null => {
    if (howlRef.current) {
      // Access internal audio element
      const sounds = (howlRef.current as unknown as { _sounds: Array<{ _node: HTMLAudioElement }> })._sounds
      if (sounds && sounds.length > 0) {
        return sounds[0]._node
      }
    }
    return null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return {
    howl: howlRef.current,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    getAudioElement,
  }
}

// Simplified audio hook for demo/preview
export function useSimpleAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const play = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return { audio: audioRef.current, play, pause, stop }
}
