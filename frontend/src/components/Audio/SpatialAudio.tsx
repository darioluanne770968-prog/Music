import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SpatialAudio as SpatialAudioType, SpatialFormat, Position3D } from '../../types/audio';

interface SpatialAudioProps {
  enabled: boolean;
  onToggle: () => void;
  settings: SpatialAudioType;
  onSettingsChange: (settings: SpatialAudioType) => void;
}

const SPATIAL_FORMATS: { value: SpatialFormat; label: string; icon: string; description: string }[] = [
  { value: 'stereo', label: '立体声', icon: '🎧', description: '标准双声道' },
  { value: 'dolby_atmos', label: 'Dolby Atmos', icon: '🎬', description: '杜比全景声' },
  { value: 'sony_360', label: 'Sony 360', icon: '🌐', description: '索尼360空间音频' },
  { value: 'binaural', label: '双耳录音', icon: '👂', description: '3D录音效果' },
  { value: 'ambisonics', label: 'Ambisonics', icon: '🔮', description: '全息声场' },
];

const ROOM_PRESETS = [
  { id: 'studio', name: '录音室', icon: '🎙️', size: 0.3 },
  { id: 'room', name: '房间', icon: '🏠', size: 0.5 },
  { id: 'hall', name: '音乐厅', icon: '🎭', size: 0.7 },
  { id: 'church', name: '教堂', icon: '⛪', size: 0.85 },
  { id: 'arena', name: '体育馆', icon: '🏟️', size: 0.95 },
  { id: 'outdoor', name: '户外', icon: '🌳', size: 0.2 },
];

export const SpatialAudioPanel: React.FC<SpatialAudioProps> = ({
  enabled,
  onToggle,
  settings,
  onSettingsChange,
}) => {
  const [listenerPosition, setListenerPosition] = useState<Position3D>({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('room');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 绘制3D空间可视化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        const y = (i / 10) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 绘制音源位置
      settings.sources.forEach((source, index) => {
        const x = ((source.position.x + 1) / 2) * canvas.width;
        const y = ((1 - source.position.z) / 2) * canvas.height;

        // 音源圆圈
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#f472b6' : index === 1 ? '#60a5fa' : '#34d399';
        ctx.fill();

        // 音源标签
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(source.type, x, y + 4);
      });

      // 绘制听者位置
      const lx = ((listenerPosition.x + 1) / 2) * canvas.width;
      const ly = ((1 - listenerPosition.z) / 2) * canvas.height;

      ctx.beginPath();
      ctx.arc(lx, ly, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👤', lx, ly + 6);
    };

    draw();
  }, [settings.sources, listenerPosition]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
    const z = 1 - ((e.clientY - rect.top) / canvas.height) * 2;

    setListenerPosition({ x, y: 0, z });
    onSettingsChange({
      ...settings,
      listenerPosition: { x, y: 0, z },
    });
  };

  const handleFormatChange = (format: SpatialFormat) => {
    onSettingsChange({ ...settings, format });
  };

  const handleRoomPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = ROOM_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onSettingsChange({
        ...settings,
        roomSize: presetId as any,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🔊</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">空间音频</h2>
            <p className="text-sm text-gray-400">沉浸式3D音效体验</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            enabled
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          {enabled ? '已开启' : '已关闭'}
        </motion.button>
      </div>

      {/* 格式选择 */}
      <div>
        <h3 className="text-white font-medium mb-4">音频格式</h3>
        <div className="grid grid-cols-5 gap-3">
          {SPATIAL_FORMATS.map((format) => (
            <motion.button
              key={format.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFormatChange(format.value)}
              className={`p-4 rounded-xl transition-all ${
                settings.format === format.value
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="text-2xl block mb-2">{format.icon}</span>
              <span className="text-xs block">{format.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3D空间可视化 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">3D 空间定位</h3>
          <p className="text-gray-400 text-sm">点击调整听者位置</p>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            onClick={handleCanvasClick}
            className="w-full rounded-xl cursor-crosshair bg-gray-900"
          />
          <div className="absolute bottom-2 left-2 flex gap-4 text-xs text-gray-400">
            <span><span className="inline-block w-3 h-3 rounded-full bg-pink-400 mr-1" />人声</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-1" />乐器</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1" />氛围</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1" />听者</span>
          </div>
        </div>
      </div>

      {/* 房间预设 */}
      <div>
        <h3 className="text-white font-medium mb-4">房间环境</h3>
        <div className="grid grid-cols-6 gap-3">
          {ROOM_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoomPreset(preset.id)}
              className={`p-3 rounded-xl transition-all ${
                selectedPreset === preset.id
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{preset.icon}</span>
              <span className="text-xs">{preset.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 高级设置 */}
      <div className="bg-white/5 rounded-2xl p-4 space-y-4">
        <h3 className="text-white font-medium">高级设置</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">头部追踪</p>
            <p className="text-gray-400 text-sm">根据头部移动调整音场</p>
          </div>
          <button
            onClick={() => onSettingsChange({ ...settings, headTracking: !settings.headTracking })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.headTracking ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          >
            <motion.div
              animate={{ x: settings.headTracking ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full"
            />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">空间感强度</p>
            <span className="text-gray-400">
              {Math.round(
                ((settings.sources[0]?.spread || 0.5) / 1) * 100
              )}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={(settings.sources[0]?.spread || 0.5) * 100}
            onChange={(e) => {
              const spread = Number(e.target.value) / 100;
              onSettingsChange({
                ...settings,
                sources: settings.sources.map(s => ({ ...s, spread })),
              });
            }}
            className="w-full h-2 bg-white/10 rounded-full appearance-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">混响量</p>
            <span className="text-gray-400">50%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full h-2 bg-white/10 rounded-full appearance-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">距离感</p>
            <span className="text-gray-400">70%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            className="w-full h-2 bg-white/10 rounded-full appearance-none"
          />
        </div>
      </div>

      {/* 效果说明 */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-4 flex items-start gap-4">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-white font-medium">使用提示</p>
          <p className="text-gray-400 text-sm">
            为获得最佳空间音频体验，建议使用支持空间音频的耳机（如 AirPods Pro）。
            开启头部追踪后，声场会随着你的头部移动而自动调整。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpatialAudioPanel;
