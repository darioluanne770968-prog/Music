import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SleepSettings, Soundscape, SoundLayer } from '../../types/health';

interface SleepModeProps {
  isActive: boolean;
  onToggle: () => void;
  settings: SleepSettings;
  onSettingsChange: (settings: SleepSettings) => void;
}

// 模拟音景数据
const SOUNDSCAPES: Soundscape[] = [
  {
    id: '1',
    name: '雨夜',
    description: '窗外的雨声',
    category: 'weather',
    thumbnailUrl: '/soundscapes/rain.jpg',
    layers: [
      { id: 'rain', name: '雨声', audioUrl: '/sounds/rain.mp3', icon: '🌧️', volume: 80, pan: 0, enabled: true, isLooping: true },
      { id: 'thunder', name: '雷声', audioUrl: '/sounds/thunder.mp3', icon: '⛈️', volume: 30, pan: 0, enabled: false, isLooping: true },
    ],
    duration: 0,
    isPremium: false,
    downloads: 10000,
    rating: 4.8,
  },
  {
    id: '2',
    name: '海边',
    description: '海浪声与海鸥',
    category: 'nature',
    thumbnailUrl: '/soundscapes/ocean.jpg',
    layers: [
      { id: 'waves', name: '海浪', audioUrl: '/sounds/waves.mp3', icon: '🌊', volume: 70, pan: 0, enabled: true, isLooping: true },
      { id: 'seagulls', name: '海鸥', audioUrl: '/sounds/seagulls.mp3', icon: '🐦', volume: 20, pan: 0, enabled: true, isLooping: true },
    ],
    duration: 0,
    isPremium: false,
    downloads: 8000,
    rating: 4.7,
  },
  {
    id: '3',
    name: '森林',
    description: '鸟鸣与溪流',
    category: 'nature',
    thumbnailUrl: '/soundscapes/forest.jpg',
    layers: [
      { id: 'birds', name: '鸟鸣', audioUrl: '/sounds/birds.mp3', icon: '🐦', volume: 50, pan: -0.3, enabled: true, isLooping: true },
      { id: 'stream', name: '溪流', audioUrl: '/sounds/stream.mp3', icon: '💧', volume: 60, pan: 0.3, enabled: true, isLooping: true },
      { id: 'wind', name: '微风', audioUrl: '/sounds/wind.mp3', icon: '🍃', volume: 30, pan: 0, enabled: true, isLooping: true },
    ],
    duration: 0,
    isPremium: false,
    downloads: 12000,
    rating: 4.9,
  },
  {
    id: '4',
    name: '篝火',
    description: '温暖的火焰声',
    category: 'ambient',
    thumbnailUrl: '/soundscapes/campfire.jpg',
    layers: [
      { id: 'fire', name: '火焰', audioUrl: '/sounds/fire.mp3', icon: '🔥', volume: 80, pan: 0, enabled: true, isLooping: true },
      { id: 'crickets', name: '蟋蟀', audioUrl: '/sounds/crickets.mp3', icon: '🦗', volume: 40, pan: 0, enabled: true, isLooping: true },
    ],
    duration: 0,
    isPremium: false,
    downloads: 6000,
    rating: 4.6,
  },
];

export const SleepModePanel: React.FC<SleepModeProps> = ({
  isActive,
  onToggle,
  settings,
  onSettingsChange,
}) => {
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [customLayers, setCustomLayers] = useState<SoundLayer[]>([]);

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (remainingTime !== null && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev && prev <= 1) {
            onToggle();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remainingTime, onToggle]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setRemainingTime(timerMinutes * 60);
    setShowTimer(false);
  };

  const handleLayerVolumeChange = (layerId: string, volume: number) => {
    if (selectedSoundscape) {
      const updatedLayers = selectedSoundscape.layers.map(layer =>
        layer.id === layerId ? { ...layer, volume } : layer
      );
      setSelectedSoundscape({ ...selectedSoundscape, layers: updatedLayers });
    }
  };

  const handleLayerToggle = (layerId: string) => {
    if (selectedSoundscape) {
      const updatedLayers = selectedSoundscape.layers.map(layer =>
        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
      );
      setSelectedSoundscape({ ...selectedSoundscape, layers: updatedLayers });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              scale: isActive ? [1, 1.1, 1] : 1,
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center"
          >
            <span className="text-2xl">🌙</span>
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white">睡眠模式</h2>
            <p className="text-sm text-gray-400">
              {isActive ? '正在播放助眠音乐' : '开启舒适的睡眠体验'}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            isActive
              ? 'bg-white text-gray-900'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
          }`}
        >
          {isActive ? '关闭' : '开启'}
        </motion.button>
      </div>

      {/* 计时器显示 */}
      {remainingTime !== null && (
        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-white font-medium">定时关闭</p>
              <p className="text-gray-400 text-sm">剩余时间</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-white font-mono">
              {formatTime(remainingTime)}
            </span>
            <button
              onClick={() => setRemainingTime(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 音景选择 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">选择音景</h3>
          <button className="text-sm text-purple-400 hover:text-purple-300">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {SOUNDSCAPES.map((soundscape) => (
            <motion.button
              key={soundscape.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSoundscape(soundscape)}
              className={`relative aspect-square rounded-2xl overflow-hidden ${
                selectedSoundscape?.id === soundscape.id
                  ? 'ring-2 ring-purple-500'
                  : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">
                  {soundscape.layers[0]?.icon || '🎵'}
                </span>
                <span className="text-white text-sm font-medium">
                  {soundscape.name}
                </span>
              </div>
              {selectedSoundscape?.id === soundscape.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 音景混音器 */}
      <AnimatePresence>
        {selectedSoundscape && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-2xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">调整音效</h4>
              <p className="text-gray-400 text-sm">{selectedSoundscape.name}</p>
            </div>
            {selectedSoundscape.layers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-4">
                <button
                  onClick={() => handleLayerToggle(layer.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    layer.enabled ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                >
                  <span className="text-xl">{layer.icon}</span>
                </button>
                <span className="text-white w-16">{layer.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.volume}
                  onChange={(e) => handleLayerVolumeChange(layer.id, Number(e.target.value))}
                  disabled={!layer.enabled}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none disabled:opacity-50"
                />
                <span className="text-gray-400 w-12 text-right">{layer.volume}%</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置 */}
      <div className="bg-white/5 rounded-2xl p-4 space-y-4">
        <h4 className="text-white font-medium">睡眠设置</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔉</span>
            <div>
              <p className="text-white">渐弱音量</p>
              <p className="text-gray-400 text-sm">音乐会慢慢变小</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="60"
              value={settings.fadeOutDuration}
              onChange={(e) =>
                onSettingsChange({ ...settings, fadeOutDuration: Number(e.target.value) })
              }
              className="w-24 h-2 bg-white/10 rounded-full appearance-none"
            />
            <span className="text-gray-400 w-16">{settings.fadeOutDuration}分钟</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⏰</span>
            <div>
              <p className="text-white">定时关闭</p>
              <p className="text-gray-400 text-sm">设置睡眠时间</p>
            </div>
          </div>
          <button
            onClick={() => setShowTimer(true)}
            className="px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20"
          >
            {remainingTime ? '修改' : '设置'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔕</span>
            <div>
              <p className="text-white">勿扰模式</p>
              <p className="text-gray-400 text-sm">屏蔽所有通知</p>
            </div>
          </div>
          <button
            onClick={() =>
              onSettingsChange({ ...settings, blockNotifications: !settings.blockNotifications })
            }
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.blockNotifications ? 'bg-purple-500' : 'bg-white/10'
            }`}
          >
            <motion.div
              animate={{ x: settings.blockNotifications ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full"
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌓</span>
            <div>
              <p className="text-white">夜间模式</p>
              <p className="text-gray-400 text-sm">减少蓝光保护眼睛</p>
            </div>
          </div>
          <button
            onClick={() => onSettingsChange({ ...settings, nightLight: !settings.nightLight })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.nightLight ? 'bg-purple-500' : 'bg-white/10'
            }`}
          >
            <motion.div
              animate={{ x: settings.nightLight ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full"
            />
          </button>
        </div>
      </div>

      {/* 定时器弹窗 */}
      <AnimatePresence>
        {showTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTimer(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-3xl p-6 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                设置定时关闭
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[15, 30, 45, 60, 90, 120].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setTimerMinutes(minutes)}
                    className={`p-3 rounded-xl transition-colors ${
                      timerMinutes === minutes
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {minutes}分钟
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowTimer(false)}
                  className="flex-1 py-3 bg-white/10 rounded-full text-white font-medium"
                >
                  取消
                </button>
                <button
                  onClick={startTimer}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-medium"
                >
                  开始
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 星空动画背景 */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SleepModePanel;
