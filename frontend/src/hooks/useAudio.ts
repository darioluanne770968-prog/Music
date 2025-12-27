import { useEffect, useRef, useCallback } from 'react'
import { Howl, Howler } from 'howler'
import { usePlayerStore } from '@/stores/playerStore'
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

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    playMode,
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

    // In a real app, you would fetch the actual URL from the API
    const audioUrl = `/api/songs/${currentSong.id}/url`

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
        setIsPlaying(true)
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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentSong?.id])

  // Handle play/pause state changes
  useEffect(() => {
    if (!howlRef.current) return

    if (isPlaying && !howlRef.current.playing()) {
      howlRef.current.play()
    } else if (!isPlaying && howlRef.current.playing()) {
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
