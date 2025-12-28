import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AIDJSession, DJTrack, DJSettings } from '../../types/ai';

interface AIDJMixerProps {
  initialTracks?: DJTrack[];
  onSessionUpdate?: (session: AIDJSession) => void;
}

export const AIDJMixer: React.FC<AIDJMixerProps> = ({ initialTracks = [], onSessionUpdate }) => {
  const [tracks, setTracks] = useState<DJTrack[]>(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crossfader, setCrossfader] = useState(50);
  const [masterBPM, setMasterBPM] = useState(128);
  const [autoMix, setAutoMix] = useState(true);
  const [settings, setSettings] = useState<DJSettings>({
    autoBPMMatch: true,
    autoKeyMatch: true,
    autoTransition: true,
    transitionDuration: 8,
    energyFlow: 'wave',
    crossfaderCurve: 'exponential',
  });

  const deckARef = useRef<HTMLAudioElement>(null);
  const deckBRef = useRef<HTMLAudioElement>(null);
  const [deckAVolume, setDeckAVolume] = useState(100);
  const [deckBVolume, setDeckBVolume] = useState(100);
  const [deckAPosition, setDeckAPosition] = useState(0);
  const [deckBPosition, setDeckBPosition] = useState(0);

  // 模拟波形数据
  const generateWaveform = () => Array.from({ length: 100 }, () => Math.random() * 100);
  const [waveformA] = useState(generateWaveform);
  const [waveformB] = useState(generateWaveform);

  const handleCrossfade = (value: number) => {
    setCrossfader(value);
    // 根据crossfader位置调整两个deck的音量
    const deckAVol = Math.min(100, (100 - value) * 2);
    const deckBVol = Math.min(100, value * 2);
    setDeckAVolume(deckAVol);
    setDeckBVolume(deckBVol);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎧</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI DJ 混音台</h2>
            <p className="text-sm text-gray-400">智能过渡，无缝衔接</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-400">主 BPM</span>
            <div className="text-xl font-bold text-white">{masterBPM}</div>
          </div>
          <button
            onClick={() => setAutoMix(!autoMix)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              autoMix
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {autoMix ? '🤖 AI 自动' : '👤 手动'}
          </button>
        </div>
      </div>

      {/* 双碟盘 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Deck A */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold text-lg">DECK A</span>
            <span className="text-gray-400 text-sm">128 BPM • Am</span>
          </div>

          {/* 唱片 */}
          <div className="relative aspect-square max-w-[200px] mx-auto">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-700 flex items-center justify-center"
            >
              <div className="w-1/3 h-1/3 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50" />
            </motion.div>
            {/* 唱针 */}
            <div className="absolute top-0 right-0 w-16 h-2 bg-gray-600 rounded-full transform rotate-45 origin-right" />
          </div>

          {/* 波形 */}
          <div className="h-16 bg-black/50 rounded-xl overflow-hidden flex items-end p-2 gap-0.5">
            {waveformA.map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500 rounded-t"
                style={{ height: `${height}%`, opacity: i < deckAPosition ? 0.3 : 1 }}
              />
            ))}
          </div>

          {/* 控制 */}
          <div className="flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              ⏮️
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center hover:bg-cyan-400"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              ⏭️
            </button>
          </div>

          {/* 音量 */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">音量</span>
            <input
              type="range"
              min="0"
              max="100"
              value={deckAVolume}
              onChange={(e) => setDeckAVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-full appearance-none"
            />
            <span className="text-white text-sm w-8">{deckAVolume}%</span>
          </div>
        </div>

        {/* Deck B */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold text-lg">DECK B</span>
            <span className="text-gray-400 text-sm">126 BPM • Cm</span>
          </div>

          {/* 唱片 */}
          <div className="relative aspect-square max-w-[200px] mx-auto">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-700 flex items-center justify-center"
            >
              <div className="w-1/3 h-1/3 rounded-full bg-purple-500/20 border-2 border-purple-500/50" />
            </motion.div>
            <div className="absolute top-0 right-0 w-16 h-2 bg-gray-600 rounded-full transform rotate-45 origin-right" />
          </div>

          {/* 波形 */}
          <div className="h-16 bg-black/50 rounded-xl overflow-hidden flex items-end p-2 gap-0.5">
            {waveformB.map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-purple-500 rounded-t"
                style={{ height: `${height}%`, opacity: i < deckBPosition ? 0.3 : 1 }}
              />
            ))}
          </div>

          {/* 控制 */}
          <div className="flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              ⏮️
            </button>
            <button className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-400">
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              ⏭️
            </button>
          </div>

          {/* 音量 */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">音量</span>
            <input
              type="range"
              min="0"
              max="100"
              value={deckBVolume}
              onChange={(e) => setDeckBVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-full appearance-none"
            />
            <span className="text-white text-sm w-8">{deckBVolume}%</span>
          </div>
        </div>
      </div>

      {/* Crossfader */}
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 font-medium">A</span>
          <span className="text-gray-400 text-sm">Crossfader</span>
          <span className="text-purple-400 font-medium">B</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={crossfader}
          onChange={(e) => handleCrossfade(Number(e.target.value))}
          className="w-full h-4 bg-gradient-to-r from-cyan-500 via-white/20 to-purple-500 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* 效果器 */}
      <div className="grid grid-cols-4 gap-4">
        {['Echo', 'Filter', 'Flanger', 'Reverb'].map((effect) => (
          <button
            key={effect}
            className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">
              {effect === 'Echo' && '🔊'}
              {effect === 'Filter' && '🎚️'}
              {effect === 'Flanger' && '🌀'}
              {effect === 'Reverb' && '🎭'}
            </div>
            <span className="text-gray-300 text-sm">{effect}</span>
          </button>
        ))}
      </div>

      {/* AI 设置 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-medium mb-4">AI 混音设置</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">自动 BPM 匹配</span>
            <input
              type="checkbox"
              checked={settings.autoBPMMatch}
              onChange={(e) => setSettings({ ...settings, autoBPMMatch: e.target.checked })}
              className="w-5 h-5 rounded bg-white/10"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">自动调性匹配</span>
            <input
              type="checkbox"
              checked={settings.autoKeyMatch}
              onChange={(e) => setSettings({ ...settings, autoKeyMatch: e.target.checked })}
              className="w-5 h-5 rounded bg-white/10"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">自动过渡</span>
            <input
              type="checkbox"
              checked={settings.autoTransition}
              onChange={(e) => setSettings({ ...settings, autoTransition: e.target.checked })}
              className="w-5 h-5 rounded bg-white/10"
            />
          </label>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">过渡时长</span>
            <select
              value={settings.transitionDuration}
              onChange={(e) => setSettings({ ...settings, transitionDuration: Number(e.target.value) })}
              className="bg-white/10 border-none rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="4">4 拍</option>
              <option value="8">8 拍</option>
              <option value="16">16 拍</option>
              <option value="32">32 拍</option>
            </select>
          </div>
        </div>
      </div>

      {/* 播放队列 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">AI 智能队列</h3>
          <button className="text-sm text-purple-400 hover:text-purple-300">+ 添加歌曲</button>
        </div>
        <div className="space-y-2">
          {[
            { name: '夜曲', artist: '周杰伦', bpm: 128, key: 'Am', energy: 0.7 },
            { name: 'Blinding Lights', artist: 'The Weeknd', bpm: 126, key: 'Cm', energy: 0.8 },
            { name: 'Levitating', artist: 'Dua Lipa', bpm: 124, key: 'Bm', energy: 0.85 },
          ].map((track, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-xl ${
                index === 0 ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-white/5'
              }`}
            >
              <span className="text-gray-400 w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="text-white font-medium">{track.name}</div>
                <div className="text-gray-400 text-sm">{track.artist}</div>
              </div>
              <div className="text-gray-400 text-sm">{track.bpm} BPM</div>
              <div className="text-gray-400 text-sm">{track.key}</div>
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                  style={{ width: `${track.energy * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDJMixer;
