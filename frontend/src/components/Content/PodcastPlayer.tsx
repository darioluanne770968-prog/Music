import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Podcast, PodcastEpisode, PodcastChapter } from '../../types/content';

interface PodcastPlayerProps {
  podcast: Podcast;
  currentEpisode: PodcastEpisode;
  onEpisodeChange: (episode: PodcastEpisode) => void;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  currentEpisode,
  onEpisodeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showChapters, setShowChapters] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => handleSeek(currentTime + 30);
  const skipBackward = () => handleSeek(currentTime - 15);

  const toggleSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[nextIndex];
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const currentChapter = currentEpisode.chapters?.find(
    (ch, i, arr) =>
      currentTime >= ch.startTime &&
      (i === arr.length - 1 || currentTime < arr[i + 1].startTime)
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden">
      <audio ref={audioRef} src={currentEpisode.audioUrl} />

      {/* 头部 - 播客信息 */}
      <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 p-6">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-end gap-4 h-full">
          <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-5xl">🎙️</span>
          </div>
          <div className="flex-1 pb-2">
            <p className="text-white/70 text-sm mb-1">{podcast.category}</p>
            <h1 className="text-2xl font-bold text-white mb-2">{podcast.title}</h1>
            <p className="text-white/70 text-sm">{podcast.author.name}</p>
          </div>
          <button className="px-4 py-2 bg-white/20 rounded-full text-white text-sm hover:bg-white/30">
            {podcast.isSubscribed ? '已订阅' : '订阅'}
          </button>
        </div>
      </div>

      {/* 当前剧集 */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-1">
              {currentEpisode.seasonNumber && `第${currentEpisode.seasonNumber}季 `}
              第{currentEpisode.episodeNumber}集
            </p>
            <h2 className="text-xl font-bold text-white mb-2">{currentEpisode.title}</h2>
            <p className="text-gray-400 text-sm line-clamp-2">{currentEpisode.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              ⬇️
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              🔗
            </button>
          </div>
        </div>

        {/* 章节提示 */}
        {currentChapter && (
          <div className="mt-4 p-3 bg-purple-500/20 rounded-xl flex items-center gap-3">
            <span className="text-purple-400">📍</span>
            <span className="text-purple-300 text-sm">{currentChapter.title}</span>
          </div>
        )}
      </div>

      {/* 播放控制 */}
      <div className="p-6">
        {/* 进度条 */}
        <div className="mb-6">
          <div
            className="h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * currentEpisode.duration);
            }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${(currentTime / currentEpisode.duration) * 100}%` }}
            />
            {/* 章节标记 */}
            {currentEpisode.chapters?.map((chapter) => (
              <div
                key={chapter.title}
                className="absolute top-0 w-1 h-full bg-white/50"
                style={{ left: `${(chapter.startTime / currentEpisode.duration) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(currentEpisode.duration - currentTime)}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleSpeed}
            className="px-3 py-1 bg-white/10 rounded-full text-white text-sm hover:bg-white/20"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={skipBackward}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            <span className="text-xs text-white">-15</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isPlaying) {
                audioRef.current?.pause();
              } else {
                audioRef.current?.play();
              }
              setIsPlaying(!isPlaying);
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <span className="text-2xl text-white">{isPlaying ? '⏸' : '▶️'}</span>
          </motion.button>
          <button
            onClick={skipForward}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            <span className="text-xs text-white">+30</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            🌙
          </button>
        </div>

        {/* 功能按钮 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setShowChapters(!showChapters)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              showChapters ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'
            }`}
          >
            📑 章节
          </button>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              showTranscript ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'
            }`}
          >
            📝 文字稿
          </button>
          <button className="px-4 py-2 rounded-full text-sm bg-white/10 text-gray-300">
            💬 评论
          </button>
        </div>
      </div>

      {/* 章节列表 */}
      {showChapters && currentEpisode.chapters && (
        <div className="border-t border-white/10 p-6">
          <h3 className="text-white font-medium mb-4">章节</h3>
          <div className="space-y-2">
            {currentEpisode.chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => handleSeek(chapter.startTime)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${
                  currentChapter?.title === chapter.title
                    ? 'bg-purple-500/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-gray-400 text-sm w-16">
                  {formatTime(chapter.startTime)}
                </span>
                <span className={`flex-1 ${
                  currentChapter?.title === chapter.title ? 'text-purple-400' : 'text-white'
                }`}>
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 剧集列表 */}
      <div className="border-t border-white/10 p-6">
        <h3 className="text-white font-medium mb-4">更多剧集</h3>
        <div className="space-y-3">
          {podcast.episodes.slice(0, 5).map((episode) => (
            <button
              key={episode.id}
              onClick={() => onEpisodeChange(episode)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors ${
                currentEpisode.id === episode.id ? 'bg-purple-500/20' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                {episode.isPlayed ? '✓' : '▶️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{episode.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(episode.publishedAt).toLocaleDateString('zh-CN')} · {formatTime(episode.duration)}
                </p>
              </div>
              {episode.isDownloaded && <span className="text-green-400">⬇️</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
