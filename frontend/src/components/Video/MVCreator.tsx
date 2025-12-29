import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// MV制作器 - 音乐视频/歌词视频/可视化视频生成

interface VideoProject {
  id: string;
  name: string;
  duration: number;
  resolution: '720p' | '1080p' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  fps: 24 | 30 | 60;
  tracks: Track[];
  audioTrack?: AudioTrack;
}

interface Track {
  id: string;
  type: 'video' | 'image' | 'text' | 'effect' | 'lyrics';
  name: string;
  clips: Clip[];
  visible: boolean;
  locked: boolean;
}

interface Clip {
  id: string;
  trackId: string;
  startTime: number;
  endTime: number;
  content: ClipContent;
  effects: Effect[];
  keyframes: Keyframe[];
}

interface ClipContent {
  type: 'video' | 'image' | 'text' | 'shape' | 'particle';
  source?: string;
  text?: string;
  style?: Record<string, any>;
}

interface Effect {
  id: string;
  type: 'filter' | 'transition' | 'animation' | 'particle';
  name: string;
  params: Record<string, any>;
}

interface Keyframe {
  time: number;
  property: string;
  value: any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  waveform: number[];
  lyrics?: LyricLine[];
}

interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
  words?: { text: string; startTime: number; endTime: number }[];
}

// MV模板
const MV_TEMPLATES = [
  {
    id: 'lyric-wave',
    name: '歌词波浪',
    description: '歌词随音乐波动',
    thumbnail: '🌊',
    style: 'modern',
  },
  {
    id: 'particle-burst',
    name: '粒子爆发',
    description: '炫酷的粒子特效',
    thumbnail: '✨',
    style: 'energetic',
  },
  {
    id: 'neon-glow',
    name: '霓虹发光',
    description: '复古霓虹风格',
    thumbnail: '💡',
    style: 'retro',
  },
  {
    id: 'minimal-text',
    name: '简约文字',
    description: '干净简洁的文字动画',
    thumbnail: '📝',
    style: 'minimal',
  },
  {
    id: 'photo-slideshow',
    name: '照片幻灯',
    description: '照片配合音乐转场',
    thumbnail: '🖼️',
    style: 'classic',
  },
  {
    id: 'equalizer',
    name: '音频可视化',
    description: '音频频谱动态效果',
    thumbnail: '📊',
    style: 'tech',
  },
  {
    id: 'cinematic',
    name: '电影级',
    description: '电影感的视觉效果',
    thumbnail: '🎬',
    style: 'cinematic',
  },
  {
    id: 'hand-drawn',
    name: '手绘风格',
    description: '可爱的手绘动画',
    thumbnail: '✏️',
    style: 'artistic',
  },
];

// 视觉效果库
const VISUAL_EFFECTS = [
  { id: 'blur', name: '模糊', icon: '🌫️', category: 'filter' },
  { id: 'glow', name: '发光', icon: '💫', category: 'filter' },
  { id: 'vignette', name: '暗角', icon: '🔲', category: 'filter' },
  { id: 'grain', name: '颗粒', icon: '📺', category: 'filter' },
  { id: 'chromatic', name: '色差', icon: '🌈', category: 'filter' },
  { id: 'fade', name: '淡入淡出', icon: '🌅', category: 'transition' },
  { id: 'slide', name: '滑动', icon: '➡️', category: 'transition' },
  { id: 'zoom', name: '缩放', icon: '🔍', category: 'transition' },
  { id: 'rotate', name: '旋转', icon: '🔄', category: 'transition' },
  { id: 'bounce', name: '弹跳', icon: '⬆️', category: 'animation' },
  { id: 'shake', name: '抖动', icon: '📳', category: 'animation' },
  { id: 'pulse', name: '脉冲', icon: '💓', category: 'animation' },
  { id: 'typewriter', name: '打字机', icon: '⌨️', category: 'animation' },
  { id: 'fireworks', name: '烟花', icon: '🎆', category: 'particle' },
  { id: 'snow', name: '雪花', icon: '❄️', category: 'particle' },
  { id: 'confetti', name: '彩纸', icon: '🎊', category: 'particle' },
];

export const useMVCreator = () => {
  const [project, setProject] = useState<VideoProject>({
    id: 'project-1',
    name: '未命名项目',
    duration: 180,
    resolution: '1080p',
    aspectRatio: '16:9',
    fps: 30,
    tracks: [
      { id: 'track-1', type: 'video', name: '视频轨道 1', clips: [], visible: true, locked: false },
      { id: 'track-2', type: 'text', name: '文字轨道', clips: [], visible: true, locked: false },
      { id: 'track-3', type: 'lyrics', name: '歌词轨道', clips: [], visible: true, locked: false },
      { id: 'track-4', type: 'effect', name: '效果轨道', clips: [], visible: true, locked: false },
    ],
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // 添加片段
  const addClip = useCallback((trackId: string, content: ClipContent, startTime: number, duration: number) => {
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId,
      startTime,
      endTime: startTime + duration,
      content,
      effects: [],
      keyframes: [],
    };

    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, newClip] }
          : track
      ),
    }));

    return newClip.id;
  }, []);

  // 删除片段
  const removeClip = useCallback((clipId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.id !== clipId),
      })),
    }));
  }, []);

  // 移动片段
  const moveClip = useCallback((clipId: string, newStartTime: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId
            ? { ...clip, startTime: newStartTime, endTime: newStartTime + (clip.endTime - clip.startTime) }
            : clip
        ),
      })),
    }));
  }, []);

  // 添加效果
  const addEffect = useCallback((clipId: string, effect: Omit<Effect, 'id'>) => {
    const newEffect: Effect = {
      id: `effect-${Date.now()}`,
      ...effect,
    };

    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId
            ? { ...clip, effects: [...clip.effects, newEffect] }
            : clip
        ),
      })),
    }));
  }, []);

  // 导入音频
  const importAudio = useCallback((audioData: { name: string; duration: number; lyrics?: LyricLine[] }) => {
    // 生成模拟波形
    const waveform = Array.from({ length: Math.floor(audioData.duration * 10) }, () =>
      Math.random() * 0.7 + 0.3
    );

    setProject(prev => ({
      ...prev,
      duration: audioData.duration,
      audioTrack: {
        id: 'audio-1',
        name: audioData.name,
        duration: audioData.duration,
        waveform,
        lyrics: audioData.lyrics,
      },
    }));
  }, []);

  // 从歌词生成视频片段
  const generateFromLyrics = useCallback((lyrics: LyricLine[], templateId: string) => {
    const lyricsTrack = project.tracks.find(t => t.type === 'lyrics');
    if (!lyricsTrack) return;

    const newClips: Clip[] = lyrics.map((line, index) => ({
      id: `lyric-clip-${index}`,
      trackId: lyricsTrack.id,
      startTime: line.startTime,
      endTime: line.endTime,
      content: {
        type: 'text',
        text: line.text,
        style: {
          template: templateId,
          fontSize: 48,
          color: '#ffffff',
          animation: 'fade',
        },
      },
      effects: [],
      keyframes: [
        { time: 0, property: 'opacity', value: 0, easing: 'ease-in' },
        { time: 0.2, property: 'opacity', value: 1, easing: 'ease-out' },
        { time: 0.8, property: 'opacity', value: 1, easing: 'linear' },
        { time: 1, property: 'opacity', value: 0, easing: 'ease-in' },
      ],
    }));

    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === lyricsTrack.id
          ? { ...track, clips: newClips }
          : track
      ),
    }));
  }, [project.tracks]);

  // 播放控制
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const seekTo = useCallback((time: number) => setCurrentTime(Math.max(0, Math.min(time, project.duration))), [project.duration]);

  // 播放循环
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= project.duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, project.duration]);

  // 导出视频
  const exportVideo = useCallback(async () => {
    // 模拟导出过程
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`${project.name}_${project.resolution}.mp4`);
      }, 3000);
    });
  }, [project]);

  return {
    project,
    currentTime,
    isPlaying,
    selectedClip,
    zoom,
    setProject,
    setSelectedClip,
    setZoom,
    addClip,
    removeClip,
    moveClip,
    addEffect,
    importAudio,
    generateFromLyrics,
    play,
    pause,
    seekTo,
    exportVideo,
  };
};

// 预览画布
const PreviewCanvas: React.FC<{
  project: VideoProject;
  currentTime: number;
}> = ({ project, currentTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolutions = {
      '720p': [1280, 720],
      '1080p': [1920, 1080],
      '4K': [3840, 2160],
    };
    const [width, height] = resolutions[project.resolution];
    const scale = Math.min(canvas.width / width, canvas.height / height);

    // 清空画布
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 渲染当前帧的所有可见片段
    project.tracks
      .filter(track => track.visible)
      .flatMap(track => track.clips)
      .filter(clip => currentTime >= clip.startTime && currentTime <= clip.endTime)
      .forEach(clip => {
        const progress = (currentTime - clip.startTime) / (clip.endTime - clip.startTime);

        // 应用关键帧动画
        let opacity = 1;
        clip.keyframes
          .filter(kf => kf.property === 'opacity')
          .forEach(kf => {
            if (kf.time <= progress) {
              opacity = kf.value;
            }
          });

        ctx.globalAlpha = opacity;

        if (clip.content.type === 'text') {
          ctx.fillStyle = clip.content.style?.color || '#ffffff';
          ctx.font = `bold ${(clip.content.style?.fontSize || 48) * scale}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 文字阴影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 10 * scale;
          ctx.shadowOffsetX = 2 * scale;
          ctx.shadowOffsetY = 2 * scale;

          ctx.fillText(clip.content.text || '', canvas.width / 2, canvas.height / 2);

          ctx.shadowColor = 'transparent';
        }

        ctx.globalAlpha = 1;
      });

    // 渲染时间码
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const frames = Math.floor((currentTime % 1) * project.fps);
    ctx.fillText(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`,
      canvas.width - 20,
      canvas.height - 20
    );
  }, [project, currentTime]);

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={540}
      className="w-full bg-black rounded-xl"
    />
  );
};

// 时间轴组件
const Timeline: React.FC<{
  project: VideoProject;
  currentTime: number;
  zoom: number;
  selectedClip: string | null;
  onSeek: (time: number) => void;
  onSelectClip: (clipId: string | null) => void;
}> = ({ project, currentTime, zoom, selectedClip, onSeek, onSelectClip }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = 50 * zoom;

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
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
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* 时间标尺 */}
      <div
        className="h-8 bg-slate-700 relative cursor-pointer"
        onClick={handleTimelineClick}
        ref={timelineRef}
      >
        {Array.from({ length: Math.ceil(project.duration / 10) + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-slate-600 text-xs text-gray-400 pl-1"
            style={{ left: i * 10 * pixelsPerSecond }}
          >
            {formatTime(i * 10)}
          </div>
        ))}

        {/* 播放头 */}
        <motion.div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1" />
        </motion.div>
      </div>

      {/* 音频波形 */}
      {project.audioTrack && (
        <div className="h-16 bg-slate-700/50 relative">
          <div className="absolute inset-0 flex items-center">
            {project.audioTrack.waveform.map((value, i) => (
              <div
                key={i}
                className="w-0.5 bg-cyan-500/50 mx-px"
                style={{ height: `${value * 100}%` }}
              />
            ))}
          </div>
          <div className="absolute left-2 top-1 text-xs text-gray-400">
            🎵 {project.audioTrack.name}
          </div>
        </div>
      )}

      {/* 轨道 */}
      <div className="space-y-1 p-2">
        {project.tracks.map(track => (
          <div key={track.id} className="flex">
            {/* 轨道信息 */}
            <div className="w-32 flex-shrink-0 p-2 bg-slate-700/50 rounded-l-lg">
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded ${track.visible ? 'text-white' : 'text-gray-500'}`}
                >
                  👁️
                </button>
                <button
                  className={`p-1 rounded ${track.locked ? 'text-yellow-500' : 'text-gray-500'}`}
                >
                  🔒
                </button>
                <span className="text-sm text-gray-300 truncate">{track.name}</span>
              </div>
            </div>

            {/* 轨道内容 */}
            <div
              className="flex-1 h-12 bg-slate-900/50 relative rounded-r-lg"
              style={{ width: project.duration * pixelsPerSecond }}
            >
              {track.clips.map(clip => (
                <motion.div
                  key={clip.id}
                  className={`absolute top-1 bottom-1 rounded-lg cursor-pointer ${
                    selectedClip === clip.id
                      ? 'ring-2 ring-cyan-400'
                      : ''
                  } ${
                    track.type === 'video' ? 'bg-blue-500/50' :
                    track.type === 'text' ? 'bg-green-500/50' :
                    track.type === 'lyrics' ? 'bg-purple-500/50' :
                    'bg-orange-500/50'
                  }`}
                  style={{
                    left: clip.startTime * pixelsPerSecond,
                    width: (clip.endTime - clip.startTime) * pixelsPerSecond,
                  }}
                  onClick={() => onSelectClip(clip.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="px-2 py-1 text-xs text-white truncate">
                    {clip.content.text || clip.content.type}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 模板选择器
const TemplateSelector: React.FC<{
  onSelect: (templateId: string) => void;
}> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {MV_TEMPLATES.map(template => (
        <motion.div
          key={template.id}
          className="p-4 bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(template.id)}
        >
          <div className="text-4xl text-center mb-2">{template.thumbnail}</div>
          <h4 className="text-white font-medium text-center">{template.name}</h4>
          <p className="text-gray-400 text-xs text-center mt-1">{template.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

// 效果面板
const EffectsPanel: React.FC<{
  onAddEffect: (effect: Omit<Effect, 'id'>) => void;
}> = ({ onAddEffect }) => {
  const categories = ['filter', 'transition', 'animation', 'particle'];

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-gray-400 text-sm mb-2 capitalize">
            {category === 'filter' ? '滤镜' :
             category === 'transition' ? '转场' :
             category === 'animation' ? '动画' : '粒子'}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {VISUAL_EFFECTS.filter(e => e.category === category).map(effect => (
              <motion.button
                key={effect.id}
                className="p-2 bg-slate-700/50 rounded-lg text-center hover:bg-slate-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddEffect({
                  type: effect.category as any,
                  name: effect.name,
                  params: {},
                })}
              >
                <div className="text-xl">{effect.icon}</div>
                <div className="text-xs text-gray-400 mt-1">{effect.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 主组件
export const MVCreator: React.FC = () => {
  const {
    project,
    currentTime,
    isPlaying,
    selectedClip,
    zoom,
    setZoom,
    setSelectedClip,
    addClip,
    addEffect,
    importAudio,
    generateFromLyrics,
    play,
    pause,
    seekTo,
    exportVideo,
  } = useMVCreator();

  const [activeTab, setActiveTab] = useState<'templates' | 'effects' | 'text' | 'media'>('templates');
  const [isExporting, setIsExporting] = useState(false);

  // 模拟导入带歌词的音频
  const handleImportAudio = () => {
    importAudio({
      name: '示例歌曲.mp3',
      duration: 180,
      lyrics: [
        { startTime: 10, endTime: 14, text: '这是第一句歌词' },
        { startTime: 15, endTime: 19, text: '这是第二句歌词' },
        { startTime: 20, endTime: 24, text: '音乐响起的时候' },
        { startTime: 25, endTime: 29, text: '让我们一起歌唱' },
        { startTime: 30, endTime: 34, text: '随着节奏摇摆' },
        { startTime: 35, endTime: 39, text: '感受音乐的魅力' },
      ],
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportVideo();
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 顶部工具栏 */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">🎬 MV制作器</h1>
          <input
            type="text"
            value={project.name}
            className="bg-slate-700 text-white px-3 py-1 rounded-lg"
            placeholder="项目名称"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* 项目设置 */}
          <select
            value={project.resolution}
            className="bg-slate-700 text-white px-3 py-1 rounded-lg"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4K">4K</option>
          </select>

          <select
            value={project.aspectRatio}
            className="bg-slate-700 text-white px-3 py-1 rounded-lg"
          >
            <option value="16:9">16:9 横屏</option>
            <option value="9:16">9:16 竖屏</option>
            <option value="1:1">1:1 正方形</option>
          </select>

          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '导出中...' : '📥 导出视频'}
          </motion.button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* 左侧面板 */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-4 overflow-y-auto">
          {/* 标签切换 */}
          <div className="flex gap-1 mb-4 bg-slate-800 rounded-lg p-1">
            {(['templates', 'effects', 'text', 'media'] as const).map(tab => (
              <button
                key={tab}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'templates' ? '模板' :
                 tab === 'effects' ? '效果' :
                 tab === 'text' ? '文字' : '媒体'}
              </button>
            ))}
          </div>

          {/* 面板内容 */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold">选择模板</h3>
              <TemplateSelector
                onSelect={(templateId) => {
                  if (project.audioTrack?.lyrics) {
                    generateFromLyrics(project.audioTrack.lyrics, templateId);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'effects' && (
            <EffectsPanel
              onAddEffect={(effect) => {
                if (selectedClip) {
                  addEffect(selectedClip, effect);
                }
              }}
            />
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold">添加文字</h3>
              <motion.button
                className="w-full py-3 bg-slate-700 rounded-xl text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const textTrack = project.tracks.find(t => t.type === 'text');
                  if (textTrack) {
                    addClip(textTrack.id, {
                      type: 'text',
                      text: '双击编辑文字',
                      style: { fontSize: 48, color: '#ffffff' },
                    }, currentTime, 5);
                  }
                }}
              >
                ➕ 添加文字
              </motion.button>

              <div className="space-y-2">
                <label className="text-gray-400 text-sm">预设样式</label>
                {['标题', '副标题', '歌词', '描述'].map(style => (
                  <motion.button
                    key={style}
                    className="w-full py-2 bg-slate-700/50 rounded-lg text-white text-left px-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    {style}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold">媒体素材</h3>

              <motion.button
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImportAudio}
              >
                🎵 导入音频
              </motion.button>

              <motion.button
                className="w-full py-3 bg-slate-700 rounded-xl text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🖼️ 导入图片
              </motion.button>

              <motion.button
                className="w-full py-3 bg-slate-700 rounded-xl text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎬 导入视频
              </motion.button>

              {project.audioTrack && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-white">
                    <span>🎵</span>
                    <span className="flex-1 truncate">{project.audioTrack.name}</span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    时长: {Math.floor(project.audioTrack.duration / 60)}:{(project.audioTrack.duration % 60).toString().padStart(2, '0')}
                  </div>
                  {project.audioTrack.lyrics && (
                    <div className="text-cyan-400 text-sm mt-1">
                      包含 {project.audioTrack.lyrics.length} 行歌词
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 中间预览区 */}
        <div className="flex-1 flex flex-col">
          {/* 预览 */}
          <div className="flex-1 p-4 flex items-center justify-center">
            <PreviewCanvas project={project} currentTime={currentTime} />
          </div>

          {/* 播放控制 */}
          <div className="h-16 bg-slate-800/50 flex items-center justify-center gap-4">
            <motion.button
              className="p-2 rounded-lg bg-slate-700 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => seekTo(0)}
            >
              ⏮️
            </motion.button>

            <motion.button
              className="p-3 rounded-full bg-cyan-500 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isPlaying ? pause : play}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </motion.button>

            <motion.button
              className="p-2 rounded-lg bg-slate-700 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => seekTo(project.duration)}
            >
              ⏭️
            </motion.button>

            <div className="text-white font-mono ml-4">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
              <span className="text-gray-500"> / </span>
              {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-400 text-sm">缩放</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          {/* 时间轴 */}
          <div className="h-64 p-4 overflow-x-auto">
            <Timeline
              project={project}
              currentTime={currentTime}
              zoom={zoom}
              selectedClip={selectedClip}
              onSeek={seekTo}
              onSelectClip={setSelectedClip}
            />
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-72 bg-slate-800/50 border-l border-slate-700 p-4">
          <h3 className="text-white font-bold mb-4">属性</h3>

          {selectedClip ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">文字内容</label>
                <textarea
                  className="w-full mt-1 p-2 bg-slate-700 rounded-lg text-white"
                  rows={3}
                  placeholder="输入文字..."
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">字体大小</label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  defaultValue="48"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">颜色</label>
                <input
                  type="color"
                  defaultValue="#ffffff"
                  className="w-full h-10 rounded-lg"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">对齐方式</label>
                <div className="flex gap-2 mt-1">
                  {['左对齐', '居中', '右对齐'].map(align => (
                    <button
                      key={align}
                      className="flex-1 py-2 bg-slate-700 rounded-lg text-white text-sm"
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">动画效果</label>
                <select className="w-full mt-1 p-2 bg-slate-700 rounded-lg text-white">
                  <option value="none">无</option>
                  <option value="fade">淡入淡出</option>
                  <option value="slide">滑入</option>
                  <option value="bounce">弹跳</option>
                  <option value="typewriter">打字机</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              选择一个片段以编辑属性
            </div>
          )}
        </div>
      </div>

      {/* 导出进度 */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl p-8 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">正在导出视频</h3>
              <p className="text-gray-400 mb-4">请稍候...</p>
              <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MVCreator;
