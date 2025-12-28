import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VocalSeparation, AudioStem, StemType } from '../../types/audio';

interface VocalRemoverProps {
  songId: string;
  songName: string;
  artistName: string;
  audioUrl: string;
  onSeparationComplete?: (stems: AudioStem[]) => void;
}

const STEM_CONFIG: { type: StemType; label: string; icon: string; color: string }[] = [
  { type: 'vocals', label: '人声', icon: '🎤', color: '#f472b6' },
  { type: 'drums', label: '鼓点', icon: '🥁', color: '#60a5fa' },
  { type: 'bass', label: '贝斯', icon: '🎸', color: '#34d399' },
  { type: 'piano', label: '钢琴', icon: '🎹', color: '#fbbf24' },
  { type: 'guitar', label: '吉他', icon: '🎸', color: '#a78bfa' },
  { type: 'other', label: '其他', icon: '🎵', color: '#94a3b8' },
];

export const VocalRemover: React.FC<VocalRemoverProps> = ({
  songId,
  songName,
  artistName,
  audioUrl,
  onSeparationComplete,
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<AudioStem[]>([]);
  const [activeMode, setActiveMode] = useState<'original' | 'karaoke' | 'acapella' | 'custom'>('original');
  const audioRef = useRef<HTMLAudioElement>(null);

  // 模拟分离进度
  const handleSeparate = async () => {
    setStatus('processing');
    setProgress(0);

    // 模拟处理过程
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    // 模拟生成的音轨
    const generatedStems: AudioStem[] = STEM_CONFIG.map((config, index) => ({
      id: `stem-${index}`,
      type: config.type,
      audioUrl: audioUrl, // 实际应该是分离后的音轨URL
      volume: 100,
      muted: false,
      solo: false,
      pan: 0,
      effects: [],
    }));

    setStems(generatedStems);
    setStatus('completed');
    onSeparationComplete?.(generatedStems);
  };

  const handleStemChange = (stemId: string, changes: Partial<AudioStem>) => {
    setStems(prev =>
      prev.map(stem =>
        stem.id === stemId ? { ...stem, ...changes } : stem
      )
    );
  };

  const handleSoloStem = (stemId: string) => {
    setStems(prev =>
      prev.map(stem => ({
        ...stem,
        solo: stem.id === stemId ? !stem.solo : false,
        muted: stem.id === stemId ? false : stem.muted,
      }))
    );
    setActiveMode('custom');
  };

  const handleMuteStem = (stemId: string) => {
    setStems(prev =>
      prev.map(stem =>
        stem.id === stemId ? { ...stem, muted: !stem.muted, solo: false } : stem
      )
    );
    setActiveMode('custom');
  };

  const applyPreset = (mode: 'original' | 'karaoke' | 'acapella') => {
    setActiveMode(mode);
    setStems(prev =>
      prev.map(stem => ({
        ...stem,
        muted: mode === 'karaoke'
          ? stem.type === 'vocals'
          : mode === 'acapella'
          ? stem.type !== 'vocals'
          : false,
        solo: false,
      }))
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎚️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">人声分离</h2>
            <p className="text-sm text-gray-400">{songName} - {artistName}</p>
          </div>
        </div>
      </div>

      {/* 处理中状态 */}
      {status === 'processing' && (
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">AI 正在分离音轨...</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl">🎤</p>
              <p className="text-xs text-gray-400">提取人声</p>
            </div>
            <div>
              <p className="text-2xl">🥁</p>
              <p className="text-xs text-gray-400">分离鼓点</p>
            </div>
            <div>
              <p className="text-2xl">🎸</p>
              <p className="text-xs text-gray-400">分离乐器</p>
            </div>
          </div>
        </div>
      )}

      {/* 开始分离按钮 */}
      {status === 'idle' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSeparate}
          className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg"
        >
          开始 AI 分离
        </motion.button>
      )}

      {/* 分离完成后的控制面板 */}
      {status === 'completed' && (
        <>
          {/* 预设模式 */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { mode: 'original', label: '原曲', icon: '🎵' },
              { mode: 'karaoke', label: '伴奏', icon: '🎤' },
              { mode: 'acapella', label: '清唱', icon: '👄' },
              { mode: 'custom', label: '自定义', icon: '🎚️' },
            ].map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => mode !== 'custom' && applyPreset(mode as any)}
                className={`p-4 rounded-xl transition-all ${
                  activeMode === mode
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* 音轨混音器 */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-4">
            <h3 className="text-white font-medium">音轨混音器</h3>
            {stems.map((stem) => {
              const config = STEM_CONFIG.find(c => c.type === stem.type);
              return (
                <div
                  key={stem.id}
                  className={`p-4 rounded-xl transition-all ${
                    stem.muted ? 'opacity-50' : ''
                  } ${stem.solo ? 'ring-2 ring-pink-500' : ''}`}
                  style={{ backgroundColor: `${config?.color}20` }}
                >
                  <div className="flex items-center gap-4">
                    {/* 图标和名称 */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: config?.color }}>
                      <span className="text-xl">{config?.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{config?.label}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {/* 音量滑块 */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stem.volume}
                          onChange={(e) =>
                            handleStemChange(stem.id, { volume: Number(e.target.value) })
                          }
                          className="flex-1 h-2 rounded-full appearance-none"
                          style={{
                            background: `linear-gradient(to right, ${config?.color} ${stem.volume}%, rgba(255,255,255,0.1) ${stem.volume}%)`,
                          }}
                        />
                        <span className="text-gray-400 text-sm w-10">{stem.volume}%</span>
                      </div>
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMuteStem(stem.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          stem.muted ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {stem.muted ? '🔇' : '🔊'}
                      </button>
                      <button
                        onClick={() => handleSoloStem(stem.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          stem.solo ? 'bg-yellow-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        S
                      </button>
                    </div>

                    {/* 声像控制 */}
                    <div className="w-24">
                      <p className="text-xs text-gray-400 text-center mb-1">声像</p>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={stem.pan * 100}
                        onChange={(e) =>
                          handleStemChange(stem.id, { pan: Number(e.target.value) / 100 })
                        }
                        className="w-full h-1 bg-white/10 rounded-full appearance-none"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>L</span>
                        <span>R</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 导出选项 */}
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center transition-colors">
              <span className="text-2xl block mb-2">💾</span>
              <span className="text-white text-sm">导出伴奏</span>
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center transition-colors">
              <span className="text-2xl block mb-2">🎤</span>
              <span className="text-white text-sm">导出人声</span>
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center transition-colors">
              <span className="text-2xl block mb-2">📦</span>
              <span className="text-white text-sm">导出全部</span>
            </button>
          </div>

          {/* K歌模式提示 */}
          <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl p-4 flex items-start gap-4">
            <span className="text-2xl">🎤</span>
            <div>
              <p className="text-white font-medium">开启 K歌模式</p>
              <p className="text-gray-400 text-sm">
                选择"伴奏"模式后，可以一边播放伴奏一边录制你的演唱，打造属于你的翻唱作品！
              </p>
              <button className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium">
                开始录制
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VocalRemover;
