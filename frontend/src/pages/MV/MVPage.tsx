import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as api from '@/services/netease'
import { CommentSection } from '@/components/Comments/CommentSection'

interface MVDetail {
  id: number
  name: string
  artistName: string
  artistId: number
  cover: string
  desc: string
  playCount: number
  subCount: number
  shareCount: number
  commentCount: number
  duration: number
  publishTime: string
}

interface RelatedMV {
  id: number
  name: string
  cover: string
  artist: {
    id: number
    name: string
  }
  playCount: number
}

const MVPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [mvDetail, setMvDetail] = useState<MVDetail | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [relatedMVs, setRelatedMVs] = useState<RelatedMV[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quality, setQuality] = useState<number>(1080)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchMV = async () => {
      setLoading(true)
      try {
        // Fetch MV details and URL in parallel
        const [detailRes, urlRes] = await Promise.all([
          api.getMvDetail(parseInt(id)),
          api.getMvUrl(parseInt(id), quality),
        ])

        if (detailRes?.data) {
          setMvDetail(detailRes.data)
        }

        if (urlRes?.data?.url) {
          setVideoUrl(urlRes.data.url)
        }

        // Fetch related MVs (using personalized MVs as a fallback)
        const relatedRes = await api.getRecommendMvs()
        if (relatedRes?.result) {
          setRelatedMVs(
            relatedRes.result.slice(0, 6).map((mv: any) => ({
              id: mv.id,
              name: mv.name,
              cover: mv.picUrl || mv.cover,
              artist: {
                id: mv.artistId,
                name: mv.artistName,
              },
              playCount: mv.playCount,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch MV:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMV()
  }, [id, quality])

  // Auto hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = percent * duration
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    } else {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPlayCount = (count: number) => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
    return count?.toString() || '0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!mvDetail) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">MV不存在</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-full bg-white/10 text-white text-sm"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white truncate">{mvDetail.name}</h1>
        </div>
      </div>

      {/* Video Player */}
      <div
        className="relative bg-black aspect-video"
        onMouseMove={() => setShowControls(true)}
        onClick={() => setShowControls(true)}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            poster={mvDetail.cover}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <img src={mvDetail.cover} alt={mvDetail.name} className="w-full h-full object-cover" />
        )}

        {/* Video Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 flex flex-col justify-between"
        >
          {/* Top bar */}
          <div className="p-4 flex items-center justify-between">
            <div />
            {/* Quality selector */}
            <select
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="px-2 py-1 rounded bg-white/20 text-white text-sm focus:outline-none"
            >
              <option value={1080}>1080P</option>
              <option value={720}>720P</option>
              <option value={480}>480P</option>
              <option value={240}>240P</option>
            </select>
          </div>

          {/* Center play button */}
          <div className="flex-1 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Bottom bar */}
          <div className="p-4">
            {/* Progress bar */}
            <div
              className="h-1 bg-white/20 rounded-full cursor-pointer mb-3"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay}>
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                  )}
                </button>
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button onClick={toggleFullscreen}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  {isFullscreen ? (
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  ) : (
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MV Info */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold text-white mb-2">{mvDetail.name}</h2>
        <Link
          to={`/artist/${mvDetail.artistId}`}
          className="text-primary-400 hover:text-primary-300"
        >
          {mvDetail.artistName}
        </Link>

        <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
          <span>{formatPlayCount(mvDetail.playCount)} 次播放</span>
          <span>{mvDetail.publishTime}</span>
        </div>

        {mvDetail.desc && (
          <p className="mt-4 text-sm text-white/60 line-clamp-3">{mvDetail.desc}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            {formatPlayCount(mvDetail.subCount)}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            {formatPlayCount(mvDetail.commentCount)}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
            </svg>
            分享
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-4 border-t border-white/10">
          <CommentSection resourceId={parseInt(id!)} resourceType="mv" />
        </div>
      )}

      {/* Related MVs */}
      {relatedMVs.length > 0 && (
        <div className="px-4 py-4 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">相关推荐</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedMVs.map((mv) => (
              <Link
                key={mv.id}
                to={`/mv/${mv.id}`}
                className="group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                  <img
                    src={mv.cover}
                    alt={mv.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                    {formatPlayCount(mv.playCount)}
                  </div>
                </div>
                <p className="text-sm text-white truncate">{mv.name}</p>
                <p className="text-xs text-white/50 truncate">{mv.artist.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MVPage
