import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 白噪音生成器 - 环境音混合/专注模式/睡眠辅助

interface SoundLayer {
  id: string;
  name: string;
  icon: string;
  category: 'nature' | 'urban' | 'indoor' | 'abstract';
  isActive: boolean;
  volume: number;
  frequency?: number; // for oscillator-based sounds
  type?: 'white' | 'pink' | 'brown' | 'custom';
}

interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  layers: { id: string; volume: number }[];
  timer?: number; // minutes
  fadeOut?: boolean;
}

interface TimerSettings {
  duration: number; // minutes
  fadeOutDuration: number; // seconds
  autoStop: boolean;
}

// 声音层定义
const SOUND_LAYERS: Omit<SoundLayer, 'isActive' | 'volume'>[] = [
  // 自然音
  { id: 'rain', name: '雨声', icon: '🌧️', category: 'nature' },
  { id: 'thunder', name: '雷声', icon: '⛈️', category: 'nature' },
  { id: 'ocean', name: '海浪', icon: '🌊', category: 'nature' },
  { id: 'river', name: '溪流', icon: '🏞️', category: 'nature' },
  { id: 'wind', name: '风声', icon: '💨', category: 'nature' },
  { id: 'birds', name: '鸟鸣', icon: '🐦', category: 'nature' },
  { id: 'crickets', name: '蟋蟀', icon: '🦗', category: 'nature' },
  { id: 'forest', name: '森林', icon: '🌲', category: 'nature' },
  { id: 'campfire', name: '篝火', icon: '🔥', category: 'nature' },
  { id: 'leaves', name: '落叶', icon: '🍂', category: 'nature' },

  // 城市音
  { id: 'traffic', name: '车流', icon: '🚗', category: 'urban' },
  { id: 'subway', name: '地铁', icon: '🚇', category: 'urban' },
  { id: 'cafe', name: '咖啡厅', icon: '☕', category: 'urban' },
  { id: 'crowd', name: '人群', icon: '👥', category: 'urban' },
  { id: 'airplane', name: '飞机', icon: '✈️', category: 'urban' },
  { id: 'train', name: '火车', icon: '🚂', category: 'urban' },

  // 室内音
  { id: 'fan', name: '风扇', icon: '🌀', category: 'indoor' },
  { id: 'ac', name: '空调', icon: '❄️', category: 'indoor' },
  { id: 'fireplace', name: '壁炉', icon: '🏠', category: 'indoor' },
  { id: 'clock', name: '时钟', icon: '🕐', category: 'indoor' },
  { id: 'keyboard', name: '键盘', icon: '⌨️', category: 'indoor' },
  { id: 'washing', name: '洗衣机', icon: '🧺', category: 'indoor' },
  { id: 'dishwasher', name: '洗碗机', icon: '🍽️', category: 'indoor' },
  { id: 'dryer', name: '烘干机', icon: '👕', category: 'indoor' },

  // 抽象音
  { id: 'white', name: '白噪音', icon: '⚪', category: 'abstract', type: 'white' },
  { id: 'pink', name: '粉噪音', icon: '🩷', category: 'abstract', type: 'pink' },
  { id: 'brown', name: '棕噪音', icon: '🟤', category: 'abstract', type: 'brown' },
  { id: 'binaural', name: '双耳节拍', icon: '🎧', category: 'abstract' },
  { id: 'drone', name: '持续低音', icon: '🎵', category: 'abstract' },
  { id: 'tibetan', name: '颂钵', icon: '🔔', category: 'abstract' },
];

// 预设场景
const PRESETS: Preset[] = [
  {
    id: 'focus',
    name: '专注工作',
    icon: '💻',
    description: '咖啡厅氛围，帮助集中注意力',
    layers: [
      { id: 'cafe', volume: 0.4 },
      { id: 'keyboard', volume: 0.2 },
      { id: 'brown', volume: 0.3 },
    ],
  },
  {
    id: 'sleep',
    name: '助眠模式',
    icon: '🌙',
    description: '柔和的雨声和风声',
    layers: [
      { id: 'rain', volume: 0.5 },
      { id: 'wind', volume: 0.2 },
      { id: 'pink', volume: 0.2 },
    ],
    timer: 45,
    fadeOut: true,
  },
  {
    id: 'nature',
    name: '自然冥想',
    icon: '🧘',
    description: '森林与溪流的宁静',
    layers: [
      { id: 'forest', volume: 0.4 },
      { id: 'river', volume: 0.4 },
      { id: 'birds', volume: 0.2 },
    ],
  },
  {
    id: 'storm',
    name: '暴风雨夜',
    icon: '⛈️',
    description: '室内听雨的温馨感',
    layers: [
      { id: 'rain', volume: 0.6 },
      { id: 'thunder', volume: 0.3 },
      { id: 'fireplace', volume: 0.4 },
    ],
  },
  {
    id: 'beach',
    name: '海滩日光',
    icon: '🏖️',
    description: '海浪拍打沙滩',
    layers: [
      { id: 'ocean', volume: 0.6 },
      { id: 'wind', volume: 0.2 },
      { id: 'birds', volume: 0.15 },
    ],
  },
  {
    id: 'train-journey',
    name: '火车旅途',
    icon: '🚂',
    description: '悠长的火车之旅',
    layers: [
      { id: 'train', volume: 0.5 },
      { id: 'rain', volume: 0.3 },
    ],
  },
  {
    id: 'deep-focus',
    name: '深度专注',
    icon: '🧠',
    description: '双耳节拍增强专注力',
    layers: [
      { id: 'binaural', volume: 0.4 },
      { id: 'brown', volume: 0.3 },
    ],
  },
  {
    id: 'cozy-home',
    name: '温馨小屋',
    icon: '🏠',
    description: '雨天待在家里',
    layers: [
      { id: 'rain', volume: 0.4 },
      { id: 'fireplace', volume: 0.5 },
      { id: 'clock', volume: 0.15 },
    ],
  },
];

export const useWhiteNoiseGenerator = () => {
  const [layers, setLayers] = useState<SoundLayer[]>(
    SOUND_LAYERS.map(layer => ({ ...layer, isActive: false, volume: 0.5 }))
  );
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState<TimerSettings | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Map<string, { source: AudioNode; gain: GainNode }>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  // 初始化音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.value = masterVolume;
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // 生成噪音
  const createNoiseBuffer = useCallback((type: 'white' | 'pink' | 'brown', duration: number = 2) => {
    if (!audioContextRef.current) return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const samples = sampleRate * duration;
    const buffer = audioContextRef.current.createBuffer(2, samples, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      let lastOut = 0;

      for (let i = 0; i < samples; i++) {
        const white = Math.random() * 2 - 1;

        switch (type) {
          case 'white':
            channelData[i] = white;
            break;
          case 'pink':
            // 简化的粉噪音
            channelData[i] = (white + lastOut * 0.9) / 2;
            lastOut = channelData[i];
            break;
          case 'brown':
            // 布朗噪音
            channelData[i] = (lastOut + white * 0.02) / 1.02;
            lastOut = channelData[i];
            break;
        }
      }
    }

    return buffer;
  }, []);

  // 创建声音源
  const createSoundSource = useCallback((layer: SoundLayer) => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.value = layer.volume * masterVolume;
    gainNode.connect(masterGainRef.current);

    let source: AudioNode;

    if (layer.type === 'white' || layer.type === 'pink' || layer.type === 'brown') {
      // 噪音类型
      const buffer = createNoiseBuffer(layer.type);
      if (!buffer) return;

      const bufferSource = audioContextRef.current.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.loop = true;
      bufferSource.connect(gainNode);
      bufferSource.start();
      source = bufferSource;
    } else if (layer.id === 'binaural') {
      // 双耳节拍
      const leftOsc = audioContextRef.current.createOscillator();
      const rightOsc = audioContextRef.current.createOscillator();
      const merger = audioContextRef.current.createChannelMerger(2);

      leftOsc.frequency.value = 200;
      rightOsc.frequency.value = 210; // 10Hz 差异

      const leftGain = audioContextRef.current.createGain();
      const rightGain = audioContextRef.current.createGain();
      leftGain.gain.value = 0.3;
      rightGain.gain.value = 0.3;

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(gainNode);

      leftOsc.start();
      rightOsc.start();
      source = merger;
    } else {
      // 其他声音使用合成
      const oscillator = audioContextRef.current.createOscillator();
      const filter = audioContextRef.current.createBiquadFilter();

      // 根据声音类型设置不同参数
      const params = getOscillatorParams(layer.id);
      oscillator.type = params.type;
      oscillator.frequency.value = params.frequency;
      filter.type = params.filterType;
      filter.frequency.value = params.filterFreq;
      filter.Q.value = params.q;

      oscillator.connect(filter);
      filter.connect(gainNode);
      oscillator.start();
      source = oscillator;
    }

    nodesRef.current.set(layer.id, { source, gain: gainNode });
  }, [masterVolume, createNoiseBuffer]);

  // 获取振荡器参数
  const getOscillatorParams = (id: string) => {
    const defaults = {
      type: 'sine' as OscillatorType,
      frequency: 100,
      filterType: 'lowpass' as BiquadFilterType,
      filterFreq: 1000,
      q: 1,
    };

    const params: Record<string, typeof defaults> = {
      rain: { ...defaults, frequency: 50, filterFreq: 500, q: 0.5 },
      ocean: { ...defaults, frequency: 30, filterFreq: 300, q: 0.3 },
      wind: { ...defaults, frequency: 80, filterFreq: 400, q: 0.4 },
      fan: { ...defaults, frequency: 60, filterFreq: 200, q: 0.2 },
      drone: { ...defaults, type: 'sawtooth', frequency: 55, filterFreq: 800, q: 2 },
    };

    return params[id] || defaults;
  };

  // 停止声音源
  const stopSoundSource = useCallback((layerId: string) => {
    const node = nodesRef.current.get(layerId);
    if (node) {
      if ('stop' in node.source && typeof node.source.stop === 'function') {
        (node.source as OscillatorNode).stop();
      }
      node.gain.disconnect();
      nodesRef.current.delete(layerId);
    }
  }, []);

  // 切换声音层
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newActive = !layer.isActive;
        if (newActive && isPlaying) {
          createSoundSource({ ...layer, isActive: true });
        } else {
          stopSoundSource(layerId);
        }
        return { ...layer, isActive: newActive };
      }
      return layer;
    }));
    setCurrentPreset(null);
  }, [isPlaying, createSoundSource, stopSoundSource]);

  // 调整音量
  const adjustLayerVolume = useCallback((layerId: string, volume: number) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const node = nodesRef.current.get(layerId);
        if (node) {
          node.gain.gain.value = volume * masterVolume;
        }
        return { ...layer, volume };
      }
      return layer;
    }));
  }, [masterVolume]);

  // 调整主音量
  const adjustMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, []);

  // 播放/暂停
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      // 暂停所有
      layers.filter(l => l.isActive).forEach(layer => {
        stopSoundSource(layer.id);
      });
      setIsPlaying(false);
    } else {
      // 恢复音频上下文
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      // 播放所有激活的层
      layers.filter(l => l.isActive).forEach(layer => {
        createSoundSource(layer);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, layers, createSoundSource, stopSoundSource]);

  // 应用预设
  const applyPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // 先停止所有声音
    layers.filter(l => l.isActive).forEach(layer => {
      stopSoundSource(layer.id);
    });

    // 更新层状态
    setLayers(prev => prev.map(layer => {
      const presetLayer = preset.layers.find(l => l.id === layer.id);
      if (presetLayer) {
        return { ...layer, isActive: true, volume: presetLayer.volume };
      }
      return { ...layer, isActive: false };
    }));

    // 如果正在播放，创建新的声音源
    if (isPlaying) {
      preset.layers.forEach(presetLayer => {
        const layer = layers.find(l => l.id === presetLayer.id);
        if (layer) {
          createSoundSource({ ...layer, isActive: true, volume: presetLayer.volume });
        }
      });
    }

    // 设置定时器
    if (preset.timer) {
      setTimer({
        duration: preset.timer,
        fadeOutDuration: preset.fadeOut ? 30 : 0,
        autoStop: true,
      });
      setRemainingTime(preset.timer * 60);
    }

    setCurrentPreset(presetId);
  }, [layers, isPlaying, createSoundSource, stopSoundSource]);

  // 设置定时器
  const setTimerDuration = useCallback((minutes: number) => {
    if (minutes === 0) {
      setTimer(null);
      setRemainingTime(0);
    } else {
      setTimer({
        duration: minutes,
        fadeOutDuration: 30,
        autoStop: true,
      });
      setRemainingTime(minutes * 60);
    }
  }, []);

  // 定时器倒计时
  useEffect(() => {
    if (!timer || remainingTime <= 0 || !isPlaying) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;

        // 淡出效果
        if (timer.fadeOutDuration > 0 && newTime <= timer.fadeOutDuration) {
          const fadeRatio = newTime / timer.fadeOutDuration;
          if (masterGainRef.current) {
            masterGainRef.current.gain.value = masterVolume * fadeRatio;
          }
        }

        // 停止播放
        if (newTime <= 0) {
          togglePlayback();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, remainingTime, isPlaying, masterVolume, togglePlayback]);

  // 保存自定义混音
  const saveCustomMix = useCallback((name: string) => {
    const activeLayers = layers.filter(l => l.isActive).map(l => ({
      id: l.id,
      volume: l.volume,
    }));

    const customPreset: Preset = {
      id: `custom-${Date.now()}`,
      name,
      icon: '💾',
      description: '自定义混音',
      layers: activeLayers,
    };

    // 这里应该保存到本地存储或服务器
    console.log('保存自定义预设:', customPreset);
    return customPreset.id;
  }, [layers]);

  return {
    layers,
    masterVolume,
    isPlaying,
    timer,
    remainingTime,
    currentPreset,
    toggleLayer,
    adjustLayerVolume,
    adjustMasterVolume,
    togglePlayback,
    applyPreset,
    setTimerDuration,
    saveCustomMix,
  };
};

// 声音层卡片
const SoundLayerCard: React.FC<{
  layer: SoundLayer;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}> = ({ layer, onToggle, onVolumeChange }) => {
  return (
    <motion.div
      className={`relative p-4 rounded-2xl cursor-pointer transition-all ${
        layer.isActive
          ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50'
          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
    >
      <div className="text-3xl text-center mb-2">{layer.icon}</div>
      <div className="text-center text-white font-medium text-sm">{layer.name}</div>

      {layer.isActive && (
        <motion.div
          className="mt-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={layer.volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-full appearance-none cursor-pointer"
          />
        </motion.div>
      )}

      {layer.isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.div>
  );
};

// 预设卡片
const PresetCard: React.FC<{
  preset: Preset;
  isActive: boolean;
  onSelect: () => void;
}> = ({ preset, isActive, onSelect }) => {
  return (
    <motion.div
      className={`p-4 rounded-xl cursor-pointer ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400'
          : 'bg-slate-800/50 hover:bg-slate-800'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{preset.icon}</span>
        <div className="flex-1">
          <div className="text-white font-medium">{preset.name}</div>
          <div className="text-gray-400 text-sm">{preset.description}</div>
        </div>
        {preset.timer && (
          <span className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-400">
            {preset.timer}分钟
          </span>
        )}
      </div>
    </motion.div>
  );
};

// 定时器显示
const TimerDisplay: React.FC<{
  remainingTime: number;
  onSetTimer: (minutes: number) => void;
}> = ({ remainingTime, onSetTimer }) => {
  const [showOptions, setShowOptions] = useState(false);
  const timerOptions = [0, 15, 30, 45, 60, 90, 120];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-white"
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowOptions(!showOptions)}
      >
        <span className="text-xl">⏱️</span>
        <span>{remainingTime > 0 ? formatTime(remainingTime) : '定时'}</span>
      </motion.button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 bg-slate-800 rounded-xl p-2 shadow-xl z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {timerOptions.map(mins => (
              <motion.button
                key={mins}
                className="block w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-lg"
                whileHover={{ x: 4 }}
                onClick={() => {
                  onSetTimer(mins);
                  setShowOptions(false);
                }}
              >
                {mins === 0 ? '关闭定时' : `${mins} 分钟`}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 可视化动画
const VisualizerAnimation: React.FC<{
  isPlaying: boolean;
  activeLayers: SoundLayer[];
}> = ({ isPlaying, activeLayers }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && activeLayers.length > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = Date.now() / 1000;

        // 绘制波纹
        activeLayers.forEach((layer, i) => {
          const hue = (i * 60) % 360;
          const maxRadius = 100 + layer.volume * 50;

          for (let j = 0; j < 3; j++) {
            const radius = (maxRadius * ((time * 0.5 + j * 0.3) % 1));
            const alpha = 1 - radius / maxRadius;

            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        // 中心圆
        const pulseScale = 1 + Math.sin(time * 2) * 0.1;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, activeLayers]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="w-full h-48 rounded-xl bg-slate-900/50"
    />
  );
};

// 主组件
export const WhiteNoiseGenerator: React.FC = () => {
  const {
    layers,
    masterVolume,
    isPlaying,
    remainingTime,
    currentPreset,
    toggleLayer,
    adjustLayerVolume,
    adjustMasterVolume,
    togglePlayback,
    applyPreset,
    setTimerDuration,
    saveCustomMix,
  } = useWhiteNoiseGenerator();

  const [activeCategory, setActiveCategory] = useState<'nature' | 'urban' | 'indoor' | 'abstract'>('nature');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customMixName, setCustomMixName] = useState('');

  const activeLayers = layers.filter(l => l.isActive);
  const filteredLayers = layers.filter(l => l.category === activeCategory);

  const handleSave = () => {
    if (customMixName.trim()) {
      saveCustomMix(customMixName);
      setShowSaveModal(false);
      setCustomMixName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">白噪音生成器</h1>
          <p className="text-gray-400">混合环境音，创造你的专属氛围</p>
        </div>

        {/* 主控制区 */}
        <div className="flex flex-col items-center gap-6">
          <VisualizerAnimation isPlaying={isPlaying} activeLayers={activeLayers} />

          <div className="flex items-center gap-6">
            {/* 播放/暂停 */}
            <motion.button
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isPlaying
                  ? 'bg-gradient-to-r from-pink-500 to-red-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayback}
            >
              <span className="text-3xl text-white">{isPlaying ? '⏸️' : '▶️'}</span>
            </motion.button>

            {/* 定时器 */}
            <TimerDisplay remainingTime={remainingTime} onSetTimer={setTimerDuration} />
          </div>

          {/* 主音量 */}
          <div className="w-full max-w-md flex items-center gap-4">
            <span className="text-gray-400">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => adjustMasterVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-gray-400">🔊</span>
          </div>

          {/* 当前混音 */}
          {activeLayers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-gray-400 text-sm">当前混音:</span>
              {activeLayers.map(layer => (
                <span
                  key={layer.id}
                  className="px-3 py-1 bg-slate-800 rounded-full text-white text-sm"
                >
                  {layer.icon} {layer.name}
                </span>
              ))}
              <motion.button
                className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowSaveModal(true)}
              >
                💾 保存
              </motion.button>
            </div>
          )}
        </div>

        {/* 预设 */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">预设场景</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESETS.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={currentPreset === preset.id}
                onSelect={() => applyPreset(preset.id)}
              />
            ))}
          </div>
        </div>

        {/* 声音库 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">声音库</h2>

            {/* 分类切换 */}
            <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
              {(['nature', 'urban', 'indoor', 'abstract'] as const).map(cat => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'nature' ? '🌿 自然' :
                   cat === 'urban' ? '🏙️ 城市' :
                   cat === 'indoor' ? '🏠 室内' : '✨ 抽象'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredLayers.map(layer => (
              <SoundLayerCard
                key={layer.id}
                layer={layer}
                onToggle={() => toggleLayer(layer.id)}
                onVolumeChange={(v) => adjustLayerVolume(layer.id, v)}
              />
            ))}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">使用提示</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">💡</span>
              <span>混合多种声音创造独特的环境氛围</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">🎧</span>
              <span>双耳节拍建议使用耳机聆听效果最佳</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">⏱️</span>
              <span>设置定时器，音乐会渐渐淡出帮助入睡</span>
            </div>
          </div>
        </div>

        {/* 保存混音弹窗 */}
        <AnimatePresence>
          {showSaveModal && (
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
                <h3 className="text-xl font-bold text-white mb-4">保存自定义混音</h3>
                <input
                  type="text"
                  value={customMixName}
                  onChange={(e) => setCustomMixName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 rounded-xl text-white mb-4"
                  placeholder="输入混音名称"
                  autoFocus
                />
                <div className="flex gap-4">
                  <button
                    className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
                    onClick={() => setShowSaveModal(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
                    onClick={handleSave}
                  >
                    保存
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

export default WhiteNoiseGenerator;
