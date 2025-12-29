import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 播客工具 - 录制/编辑/发布

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: 'draft' | 'recording' | 'editing' | 'published';
  audioUrl?: string;
  coverUrl?: string;
  segments: AudioSegment[];
  showNotes?: string;
  tags: string[];
  publishedAt?: Date;
  stats?: EpisodeStats;
}

interface AudioSegment {
  id: string;
  type: 'recording' | 'music' | 'soundEffect' | 'silence';
  startTime: number;
  duration: number;
  label?: string;
  audioData?: Float32Array;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

interface EpisodeStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  avgListenTime: number;
}

interface PodcastShow {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  category: string;
  episodes: PodcastEpisode[];
  subscribers: number;
  totalPlays: number;
}

// 音效库
const SOUND_EFFECTS = [
  { id: 'applause', name: '掌声', icon: '👏', category: 'audience' },
  { id: 'laugh', name: '笑声', icon: '😄', category: 'audience' },
  { id: 'transition', name: '转场', icon: '🔄', category: 'transition' },
  { id: 'whoosh', name: '嗖声', icon: '💨', category: 'transition' },
  { id: 'ding', name: '叮声', icon: '🔔', category: 'notification' },
  { id: 'pop', name: '弹出', icon: '💥', category: 'notification' },
  { id: 'typing', name: '打字', icon: '⌨️', category: 'ambient' },
  { id: 'rain', name: '雨声', icon: '🌧️', category: 'ambient' },
  { id: 'birds', name: '鸟鸣', icon: '🐦', category: 'ambient' },
  { id: 'cafe', name: '咖啡厅', icon: '☕', category: 'ambient' },
];

// 背景音乐库
const BACKGROUND_MUSIC = [
  { id: 'upbeat', name: '轻快活泼', mood: 'happy', duration: 120 },
  { id: 'chill', name: '轻松惬意', mood: 'relaxed', duration: 180 },
  { id: 'dramatic', name: '戏剧张力', mood: 'dramatic', duration: 90 },
  { id: 'corporate', name: '商务专业', mood: 'professional', duration: 150 },
  { id: 'ambient', name: '环境音乐', mood: 'ambient', duration: 240 },
  { id: 'acoustic', name: '原声木吉他', mood: 'warm', duration: 120 },
];

export const usePodcastStudio = () => {
  const [show, setShow] = useState<PodcastShow>({
    id: 'show-1',
    name: '我的播客',
    description: '分享有趣的故事和见解',
    coverUrl: '',
    category: '科技',
    episodes: [],
    subscribers: 0,
    totalPlays: 0,
  });

  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 初始化音频分析
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  }, []);

  // 创建新剧集
  const createEpisode = useCallback((title: string) => {
    const newEpisode: PodcastEpisode = {
      id: `episode-${Date.now()}`,
      title,
      description: '',
      duration: 0,
      status: 'draft',
      segments: [],
      tags: [],
    };
    setCurrentEpisode(newEpisode);
    return newEpisode.id;
  }, []);

  // 开始录制
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 连接音频分析器
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        // 监控音量
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        const updateLevel = () => {
          if (isRecording && analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
            requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (currentEpisode) {
          const newSegment: AudioSegment = {
            id: `segment-${Date.now()}`,
            type: 'recording',
            startTime: currentEpisode.segments.reduce((acc, s) => acc + s.duration, 0),
            duration: recordingTime,
            volume: 1,
          };

          setCurrentEpisode(prev => prev ? {
            ...prev,
            duration: prev.duration + recordingTime,
            segments: [...prev.segments, newSegment],
            audioUrl,
          } : null);
        }

        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
    }
  }, [currentEpisode, recordingTime, isRecording]);

  // 停止录制
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // 录制计时
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // 添加音效
  const addSoundEffect = useCallback((effectId: string, atTime?: number) => {
    if (!currentEpisode) return;

    const effect = SOUND_EFFECTS.find(e => e.id === effectId);
    if (!effect) return;

    const newSegment: AudioSegment = {
      id: `effect-${Date.now()}`,
      type: 'soundEffect',
      startTime: atTime ?? currentEpisode.duration,
      duration: 2,
      label: effect.name,
      volume: 0.8,
    };

    setCurrentEpisode(prev => prev ? {
      ...prev,
      segments: [...prev.segments, newSegment],
    } : null);
  }, [currentEpisode]);

  // 添加背景音乐
  const addBackgroundMusic = useCallback((musicId: string) => {
    if (!currentEpisode) return;

    const music = BACKGROUND_MUSIC.find(m => m.id === musicId);
    if (!music) return;

    const newSegment: AudioSegment = {
      id: `music-${Date.now()}`,
      type: 'music',
      startTime: 0,
      duration: music.duration,
      label: music.name,
      volume: 0.3,
      fadeIn: 2,
      fadeOut: 3,
    };

    setCurrentEpisode(prev => prev ? {
      ...prev,
      segments: [...prev.segments, newSegment],
    } : null);
  }, [currentEpisode]);

  // 删除片段
  const removeSegment = useCallback((segmentId: string) => {
    setCurrentEpisode(prev => prev ? {
      ...prev,
      segments: prev.segments.filter(s => s.id !== segmentId),
    } : null);
  }, []);

  // 调整片段音量
  const adjustSegmentVolume = useCallback((segmentId: string, volume: number) => {
    setCurrentEpisode(prev => prev ? {
      ...prev,
      segments: prev.segments.map(s =>
        s.id === segmentId ? { ...s, volume } : s
      ),
    } : null);
  }, []);

  // 更新剧集信息
  const updateEpisode = useCallback((updates: Partial<PodcastEpisode>) => {
    setCurrentEpisode(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // 发布剧集
  const publishEpisode = useCallback(async () => {
    if (!currentEpisode) return;

    const publishedEpisode: PodcastEpisode = {
      ...currentEpisode,
      status: 'published',
      publishedAt: new Date(),
      stats: {
        plays: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        avgListenTime: 0,
      },
    };

    setShow(prev => ({
      ...prev,
      episodes: [publishedEpisode, ...prev.episodes],
    }));

    setCurrentEpisode(null);
    return publishedEpisode.id;
  }, [currentEpisode]);

  // 导出音频
  const exportAudio = useCallback(async (format: 'mp3' | 'wav' | 'aac') => {
    if (!currentEpisode?.audioUrl) return null;

    // 模拟导出
    return `${currentEpisode.title}.${format}`;
  }, [currentEpisode]);

  return {
    show,
    currentEpisode,
    isRecording,
    recordingTime,
    isPlaying,
    playbackTime,
    audioLevel,
    createEpisode,
    startRecording,
    stopRecording,
    addSoundEffect,
    addBackgroundMusic,
    removeSegment,
    adjustSegmentVolume,
    updateEpisode,
    publishEpisode,
    exportAudio,
    setIsPlaying,
    setPlaybackTime,
  };
};

// 音量指示器组件
const VolumeIndicator: React.FC<{ level: number }> = ({ level }) => {
  const bars = 20;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = i / bars;
        const isActive = level > threshold;
        const intensity = Math.min(1, (level - threshold) * bars);

        return (
          <motion.div
            key={i}
            className={`w-2 rounded-full ${
              isActive
                ? intensity > 0.8
                  ? 'bg-red-500'
                  : intensity > 0.6
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-slate-700'
            }`}
            animate={{ height: isActive ? `${20 + i * 3}%` : '20%' }}
            transition={{ duration: 0.05 }}
          />
        );
      })}
    </div>
  );
};

// 波形显示组件
const WaveformDisplay: React.FC<{
  segments: AudioSegment[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}> = ({ segments, duration, currentTime, onSeek }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = 10;

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    onSeek(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto">
      {/* 时间标尺 */}
      <div className="h-6 relative mb-2" style={{ width: duration * pixelsPerSecond }}>
        {Array.from({ length: Math.ceil(duration / 30) + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 text-xs text-gray-500"
            style={{ left: i * 30 * pixelsPerSecond }}
          >
            {formatTime(i * 30)}
          </div>
        ))}
      </div>

      {/* 波形轨道 */}
      <div
        ref={containerRef}
        className="h-24 bg-slate-900 rounded-lg relative cursor-pointer"
        style={{ width: Math.max(duration * pixelsPerSecond, 800) }}
        onClick={handleClick}
      >
        {/* 片段 */}
        {segments.map(segment => (
          <motion.div
            key={segment.id}
            className={`absolute top-2 bottom-2 rounded-lg ${
              segment.type === 'recording' ? 'bg-cyan-500/50' :
              segment.type === 'music' ? 'bg-purple-500/50' :
              segment.type === 'soundEffect' ? 'bg-yellow-500/50' :
              'bg-slate-600'
            }`}
            style={{
              left: segment.startTime * pixelsPerSecond,
              width: segment.duration * pixelsPerSecond,
            }}
            whileHover={{ scale: 1.02 }}
          >
            {/* 模拟波形 */}
            <div className="h-full flex items-center justify-center gap-px px-2">
              {segment.type === 'recording' && Array.from({ length: Math.floor(segment.duration * 3) }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-cyan-400"
                  style={{ height: `${30 + Math.random() * 60}%` }}
                />
              ))}
              {segment.label && (
                <span className="absolute left-2 top-1 text-xs text-white/80 truncate">
                  {segment.label}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* 播放头 */}
        <motion.div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1" />
        </motion.div>
      </div>
    </div>
  );
};

// 录制面板
const RecordingPanel: React.FC<{
  isRecording: boolean;
  recordingTime: number;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
}> = ({ isRecording, recordingTime, audioLevel, onStart, onStop }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">录制</h3>
        <VolumeIndicator level={audioLevel} />
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="text-4xl font-mono text-white">
          {formatTime(recordingTime)}
        </div>

        <motion.button
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isRecording ? onStop : onStart}
        >
          {isRecording ? (
            <motion.div
              className="w-8 h-8 bg-white rounded-sm"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          ) : (
            <div className="w-8 h-8 bg-white rounded-full" />
          )}
        </motion.button>
      </div>

      {isRecording && (
        <motion.div
          className="mt-4 flex items-center justify-center gap-2 text-red-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          正在录制...
        </motion.div>
      )}
    </div>
  );
};

// 音效面板
const SoundEffectsPanel: React.FC<{
  onAddEffect: (effectId: string) => void;
}> = ({ onAddEffect }) => {
  const categories = ['audience', 'transition', 'notification', 'ambient'];

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">音效</h3>

      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2 capitalize">
            {category === 'audience' ? '观众' :
             category === 'transition' ? '转场' :
             category === 'notification' ? '提示' : '环境'}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {SOUND_EFFECTS.filter(e => e.category === category).map(effect => (
              <motion.button
                key={effect.id}
                className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddEffect(effect.id)}
              >
                <div className="text-2xl text-center">{effect.icon}</div>
                <div className="text-xs text-gray-400 text-center mt-1">{effect.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 背景音乐面板
const BackgroundMusicPanel: React.FC<{
  onAddMusic: (musicId: string) => void;
}> = ({ onAddMusic }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">背景音乐</h3>

      <div className="space-y-2">
        {BACKGROUND_MUSIC.map(music => (
          <motion.div
            key={music.id}
            className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
            onClick={() => onAddMusic(music.id)}
          >
            <div>
              <div className="text-white font-medium">{music.name}</div>
              <div className="text-gray-400 text-sm">
                {Math.floor(music.duration / 60)}:{(music.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <motion.button
              className="p-2 bg-cyan-500/20 rounded-full text-cyan-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ▶️
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 剧集信息编辑
const EpisodeEditor: React.FC<{
  episode: PodcastEpisode;
  onUpdate: (updates: Partial<PodcastEpisode>) => void;
}> = ({ episode, onUpdate }) => {
  const [tags, setTags] = useState(episode.tags.join(', '));

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-bold text-white">剧集信息</h3>

      <div>
        <label className="block text-gray-400 text-sm mb-1">标题</label>
        <input
          type="text"
          value={episode.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white"
          placeholder="输入剧集标题"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">描述</label>
        <textarea
          value={episode.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white"
          rows={4}
          placeholder="输入剧集描述"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">标签</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => {
            setTags(e.target.value);
            onUpdate({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) });
          }}
          className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white"
          placeholder="标签, 用逗号分隔"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">节目笔记</label>
        <textarea
          value={episode.showNotes || ''}
          onChange={(e) => onUpdate({ showNotes: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white font-mono text-sm"
          rows={6}
          placeholder="支持 Markdown 格式"
        />
      </div>
    </div>
  );
};

// 主组件
export const PodcastStudio: React.FC = () => {
  const {
    show,
    currentEpisode,
    isRecording,
    recordingTime,
    isPlaying,
    playbackTime,
    audioLevel,
    createEpisode,
    startRecording,
    stopRecording,
    addSoundEffect,
    addBackgroundMusic,
    removeSegment,
    updateEpisode,
    publishEpisode,
    exportAudio,
    setPlaybackTime,
  } = usePodcastStudio();

  const [activePanel, setActivePanel] = useState<'effects' | 'music' | 'info'>('effects');
  const [showPublishModal, setShowPublishModal] = useState(false);

  const handleNewEpisode = () => {
    const title = `第 ${show.episodes.length + 1} 期`;
    createEpisode(title);
  };

  const handlePublish = async () => {
    await publishEpisode();
    setShowPublishModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🎙️ 播客工作室</h1>
            <p className="text-gray-400">{show.name}</p>
          </div>

          <div className="flex items-center gap-4">
            {currentEpisode ? (
              <>
                <motion.button
                  className="px-4 py-2 bg-slate-700 rounded-xl text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportAudio('mp3')}
                >
                  📥 导出
                </motion.button>
                <motion.button
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPublishModal(true)}
                >
                  🚀 发布
                </motion.button>
              </>
            ) : (
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewEpisode}
              >
                ➕ 新建剧集
              </motion.button>
            )}
          </div>
        </div>

        {currentEpisode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧 - 录制和波形 */}
            <div className="lg:col-span-2 space-y-6">
              <RecordingPanel
                isRecording={isRecording}
                recordingTime={recordingTime}
                audioLevel={audioLevel}
                onStart={startRecording}
                onStop={stopRecording}
              />

              <WaveformDisplay
                segments={currentEpisode.segments}
                duration={Math.max(currentEpisode.duration, 60)}
                currentTime={playbackTime}
                onSeek={setPlaybackTime}
              />

              {/* 片段列表 */}
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">片段列表</h3>
                {currentEpisode.segments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    还没有录制内容，点击上方按钮开始录制
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentEpisode.segments.map((segment, index) => (
                      <motion.div
                        key={segment.id}
                        className="p-3 bg-slate-700/50 rounded-lg flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xl ${
                            segment.type === 'recording' ? 'text-cyan-400' :
                            segment.type === 'music' ? 'text-purple-400' :
                            'text-yellow-400'
                          }`}>
                            {segment.type === 'recording' ? '🎤' :
                             segment.type === 'music' ? '🎵' : '🔊'}
                          </span>
                          <div>
                            <div className="text-white font-medium">
                              {segment.label || `片段 ${index + 1}`}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')} -
                              {Math.floor(segment.duration)}秒
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={segment.volume}
                            className="w-20"
                            title="音量"
                          />
                          <motion.button
                            className="p-2 text-red-400 hover:text-red-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSegment(segment.id)}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧 - 面板切换 */}
            <div className="space-y-4">
              {/* 面板选择 */}
              <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
                {(['effects', 'music', 'info'] as const).map(panel => (
                  <button
                    key={panel}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      activePanel === panel
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActivePanel(panel)}
                  >
                    {panel === 'effects' ? '🔊 音效' :
                     panel === 'music' ? '🎵 音乐' : '📝 信息'}
                  </button>
                ))}
              </div>

              {/* 面板内容 */}
              <AnimatePresence mode="wait">
                {activePanel === 'effects' && (
                  <motion.div
                    key="effects"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SoundEffectsPanel onAddEffect={addSoundEffect} />
                  </motion.div>
                )}

                {activePanel === 'music' && (
                  <motion.div
                    key="music"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <BackgroundMusicPanel onAddMusic={addBackgroundMusic} />
                  </motion.div>
                )}

                {activePanel === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <EpisodeEditor episode={currentEpisode} onUpdate={updateEpisode} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* 剧集列表 */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {show.episodes.map(episode => (
                <motion.div
                  key={episode.id}
                  className="bg-slate-800/50 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div className="h-40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-6xl">🎙️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{episode.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {episode.description || '暂无描述'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                      </span>
                      {episode.stats && (
                        <div className="flex items-center gap-3 text-gray-400">
                          <span>▶️ {episode.stats.plays}</span>
                          <span>❤️ {episode.stats.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {show.episodes.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-bold text-white mb-2">开始你的播客之旅</h3>
                <p className="text-gray-400 mb-6">点击上方按钮创建你的第一期节目</p>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewEpisode}
                >
                  创建第一期节目
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* 发布确认弹窗 */}
        <AnimatePresence>
          {showPublishModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-slate-800 rounded-2xl p-6 w-full max-w-md"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">发布剧集</h3>
                <p className="text-gray-400 mb-6">
                  确定要发布「{currentEpisode?.title}」吗？发布后将对所有用户可见。
                </p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
                    onClick={() => setShowPublishModal(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium"
                    onClick={handlePublish}
                  >
                    确认发布
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PodcastStudio;
