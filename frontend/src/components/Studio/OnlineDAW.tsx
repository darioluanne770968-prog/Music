import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnlineDAW, DAWTrack, Clip, PluginInstance } from '../../types/music-studio';

interface OnlineDAWProps {
  projectId: string;
  userId: string;
  onSave: () => void;
  onExport: () => void;
}

const DEMO_TRACKS: DAWTrack[] = [
  {
    id: '1', name: '主唱', type: 'audio', color: '#ff69b4', volume: 80, pan: 0, mute: false, solo: false,
    armed: false, frozen: false, height: 80, input: { type: 'microphone', channel: 1, monitoring: 'off' },
    output: { destination: 'master', channel: 'stereo' }, clips: [], effects: [], sends: [], automation: [],
  },
  {
    id: '2', name: '和声', type: 'audio', color: '#9b59b6', volume: 60, pan: 0, mute: false, solo: false,
    armed: false, frozen: false, height: 80, input: { type: 'none', channel: 1, monitoring: 'off' },
    output: { destination: 'master', channel: 'stereo' }, clips: [], effects: [], sends: [], automation: [],
  },
  {
    id: '3', name: '钢琴', type: 'instrument', color: '#3498db', volume: 75, pan: -20, mute: false, solo: false,
    armed: false, frozen: false, height: 80, input: { type: 'virtual', channel: 1, monitoring: 'off' },
    output: { destination: 'master', channel: 'stereo' }, clips: [], effects: [], sends: [], automation: [],
  },
  {
    id: '4', name: '贝斯', type: 'instrument', color: '#2ecc71', volume: 70, pan: 0, mute: false, solo: false,
    armed: false, frozen: false, height: 80, input: { type: 'virtual', channel: 1, monitoring: 'off' },
    output: { destination: 'master', channel: 'stereo' }, clips: [], effects: [], sends: [], automation: [],
  },
  {
    id: '5', name: '鼓组', type: 'instrument', color: '#e74c3c', volume: 85, pan: 0, mute: false, solo: false,
    armed: false, frozen: false, height: 80, input: { type: 'virtual', channel: 1, monitoring: 'off' },
    output: { destination: 'master', channel: 'stereo' }, clips: [], effects: [], sends: [], automation: [],
  },
];

export const OnlineDAWComponent: React.FC<OnlineDAWProps> = ({
  projectId,
  userId,
  onSave,
  onExport,
}) => {
  const [tracks, setTracks] = useState<DAWTrack[]>(DEMO_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
  const [zoom, setZoom] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showMixer, setShowMixer] = useState(true);
  const [showPlugins, setShowPlugins] = useState(false);
  const [showBrowser, setShowBrowser] = useState(true);
  const [snap, setSnap] = useState(true);
  const [loop, setLoop] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(16);
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalBars = 32;
  const beatsPerBar = timeSignature.numerator;
  const pixelsPerBeat = 40 * zoom;

  const formatTime = (beats: number) => {
    const bar = Math.floor(beats / beatsPerBar) + 1;
    const beat = (beats % beatsPerBar) + 1;
    return `${bar}.${beat}`;
  };

  const handleTrackChange = (trackId: string, changes: Partial<DAWTrack>) => {
    setTracks(prev =>
      prev.map(track =>
        track.id === trackId ? { ...track, ...changes } : track
      )
    );
  };

  const handleSolo = (trackId: string) => {
    setTracks(prev =>
      prev.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false,
      }))
    );
  };

  const handleMute = (trackId: string) => {
    handleTrackChange(trackId, { mute: !tracks.find(t => t.id === trackId)?.mute });
  };

  const addTrack = (type: 'audio' | 'midi' | 'instrument') => {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const newTrack: DAWTrack = {
      id: Date.now().toString(),
      name: `新轨道 ${tracks.length + 1}`,
      type,
      color: colors[tracks.length % colors.length],
      volume: 75,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      frozen: false,
      height: 80,
      input: { type: type === 'audio' ? 'microphone' : 'virtual', channel: 1, monitoring: 'off' },
      output: { destination: 'master', channel: 'stereo' },
      clips: [],
      effects: [],
      sends: [],
      automation: [],
    };
    setTracks([...tracks, newTrack]);
  };

  // 模拟播放
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(t => {
        const next = t + 0.25;
        if (loop && next >= loopEnd) return loopStart;
        if (next >= totalBars * beatsPerBar) return 0;
        return next;
      });
    }, (60 / tempo / 4) * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, tempo, loop, loopStart, loopEnd]);

  const browserItems = [
    { id: 'drums', name: '鼓组', icon: '🥁', items: ['Kick 808', 'Snare', 'Hi-Hat', 'Clap'] },
    { id: 'synths', name: '合成器', icon: '🎹', items: ['Lead', 'Pad', 'Bass', 'Arp'] },
    { id: 'fx', name: '效果器', icon: '🎛️', items: ['Reverb', 'Delay', 'Chorus', 'Distortion'] },
    { id: 'loops', name: '采样循环', icon: '🔄', items: ['Hip-Hop Beat', 'EDM Drop', 'Acoustic Guitar'] },
  ];

  return (
    <div className="bg-gray-900 rounded-3xl overflow-hidden h-[700px] flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isPlaying ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span className="text-white">{isPlaying ? '⏸' : '▶️'}</span>
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center"
            >
              <span className="text-white">⏹</span>
            </button>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-gray-700'
              }`}
            >
              <span className="text-white">⏺</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">BPM</span>
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-16 bg-transparent text-white text-center outline-none"
            />
          </div>

          <div className="text-white font-mono text-lg bg-gray-700 rounded-lg px-4 py-2">
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnap(!snap)}
            className={`px-3 py-2 rounded-lg text-sm ${snap ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            🧲 Snap
          </button>
          <button
            onClick={() => setLoop(!loop)}
            className={`px-3 py-2 rounded-lg text-sm ${loop ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            🔁 Loop
          </button>
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="px-2 py-1 text-white">-</button>
            <span className="text-gray-400 text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="px-2 py-1 text-white">+</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-4 py-2 bg-gray-700 rounded-lg text-white text-sm">
            💾 保存
          </button>
          <button onClick={onExport} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white text-sm">
            📤 导出
          </button>
        </div>
      </div>

      {/* 主工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 音色浏览器 */}
        {showBrowser && (
          <div className="w-60 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-3 border-b border-gray-700">
              <input
                type="text"
                placeholder="搜索音色..."
                className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div className="p-2">
              {browserItems.map(category => (
                <div key={category.id} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 text-sm">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="space-y-1">
                    {category.items.map(item => (
                      <button
                        key={item}
                        className="w-full text-left px-4 py-2 text-white text-sm hover:bg-gray-700 rounded-lg"
                        draggable
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 轨道区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 时间线刻度 */}
          <div className="h-8 bg-gray-800 flex items-center border-b border-gray-700">
            <div className="w-48 flex-shrink-0" />
            <div ref={timelineRef} className="flex-1 overflow-x-auto relative">
              <div style={{ width: totalBars * beatsPerBar * pixelsPerBeat }}>
                {[...Array(totalBars)].map((_, bar) => (
                  <div
                    key={bar}
                    className="absolute top-0 h-full border-l border-gray-600"
                    style={{ left: bar * beatsPerBar * pixelsPerBeat }}
                  >
                    <span className="text-gray-500 text-xs ml-1">{bar + 1}</span>
                  </div>
                ))}
                {/* 播放头 */}
                <motion.div
                  className="absolute top-0 w-0.5 h-full bg-pink-500 z-10"
                  style={{ left: currentTime * pixelsPerBeat }}
                />
                {/* 循环区域 */}
                {loop && (
                  <div
                    className="absolute top-0 h-full bg-purple-500/20"
                    style={{
                      left: loopStart * pixelsPerBeat,
                      width: (loopEnd - loopStart) * pixelsPerBeat,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 轨道列表 */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map(track => (
              <div
                key={track.id}
                className={`flex border-b border-gray-700 ${
                  selectedTrack === track.id ? 'bg-gray-700/50' : ''
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                {/* 轨道控制 */}
                <div className="w-48 flex-shrink-0 p-2 bg-gray-800 border-r border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <input
                      value={track.name}
                      onChange={(e) => handleTrackChange(track.id, { name: e.target.value })}
                      className="flex-1 bg-transparent text-white text-sm outline-none"
                    />
                    <span className="text-gray-500 text-xs">{track.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMute(track.id)}
                      className={`w-6 h-6 rounded text-xs ${track.mute ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => handleSolo(track.id)}
                      className={`w-6 h-6 rounded text-xs ${track.solo ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}
                    >
                      S
                    </button>
                    <button
                      onClick={() => handleTrackChange(track.id, { armed: !track.armed })}
                      className={`w-6 h-6 rounded text-xs ${track.armed ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                      R
                    </button>
                    <div className="flex-1 mx-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) => handleTrackChange(track.id, { volume: Number(e.target.value) })}
                        className="w-full h-1 rounded appearance-none bg-gray-600"
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-8">{track.volume}%</span>
                  </div>
                </div>

                {/* 轨道内容区 */}
                <div
                  className="flex-1 relative"
                  style={{ height: track.height, backgroundColor: `${track.color}10` }}
                >
                  {/* 模拟波形/MIDI片段 */}
                  {track.type === 'audio' && (
                    <div
                      className="absolute top-2 bottom-2 rounded-lg"
                      style={{
                        left: 0,
                        width: 8 * pixelsPerBeat,
                        backgroundColor: `${track.color}40`,
                        border: `1px solid ${track.color}`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center px-2">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 mx-px rounded-full"
                            style={{
                              height: `${20 + Math.random() * 60}%`,
                              backgroundColor: track.color,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {track.type === 'instrument' && (
                    <div
                      className="absolute top-2 bottom-2 rounded-lg"
                      style={{
                        left: 4 * pixelsPerBeat,
                        width: 4 * pixelsPerBeat,
                        backgroundColor: `${track.color}40`,
                        border: `1px solid ${track.color}`,
                      }}
                    >
                      <div className="absolute inset-1 flex flex-col gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 rounded"
                            style={{
                              marginLeft: `${Math.random() * 30}%`,
                              width: `${30 + Math.random() * 50}%`,
                              backgroundColor: track.color,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 添加轨道按钮 */}
            <div className="p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => addTrack('audio')}
                  className="flex-1 py-3 border border-dashed border-gray-600 rounded-xl text-gray-500 hover:border-pink-500 hover:text-pink-500"
                >
                  + 音频轨道
                </button>
                <button
                  onClick={() => addTrack('instrument')}
                  className="flex-1 py-3 border border-dashed border-gray-600 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + 乐器轨道
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 混音器 */}
        {showMixer && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-white font-medium mb-4">混音器</h3>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {tracks.map(track => (
                <div
                  key={track.id}
                  className="w-16 flex-shrink-0 flex flex-col items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: track.color }}
                  />
                  <div className="h-32 w-4 bg-gray-700 rounded-full relative mb-2">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-full"
                      style={{
                        height: `${track.volume}%`,
                        backgroundColor: track.mute ? '#888' : track.color,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      onChange={(e) => handleTrackChange(track.id, { volume: Number(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ writingMode: 'vertical-lr' }}
                    />
                  </div>
                  <div className="flex gap-1 mb-2">
                    <button
                      onClick={() => handleMute(track.id)}
                      className={`w-5 h-5 rounded text-xs ${track.mute ? 'bg-red-500' : 'bg-gray-600'}`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => handleSolo(track.id)}
                      className={`w-5 h-5 rounded text-xs ${track.solo ? 'bg-yellow-500' : 'bg-gray-600'}`}
                    >
                      S
                    </button>
                  </div>
                  <span className="text-gray-400 text-xs text-center truncate w-full">
                    {track.name}
                  </span>
                </div>
              ))}
              {/* Master */}
              <div className="w-16 flex-shrink-0 flex flex-col items-center border-l border-gray-600 pl-2">
                <div className="w-3 h-3 rounded-full mb-2 bg-white" />
                <div className="h-32 w-4 bg-gray-700 rounded-full relative mb-2">
                  <div className="absolute bottom-0 left-0 right-0 h-4/5 rounded-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500" />
                </div>
                <span className="text-white text-xs font-medium">Master</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <button
            onClick={() => setShowBrowser(!showBrowser)}
            className={showBrowser ? 'text-pink-400' : ''}
          >
            📁 浏览器
          </button>
          <button
            onClick={() => setShowMixer(!showMixer)}
            className={showMixer ? 'text-pink-400' : ''}
          >
            🎚️ 混音器
          </button>
          <button
            onClick={() => setShowPlugins(!showPlugins)}
            className={showPlugins ? 'text-pink-400' : ''}
          >
            🔌 插件
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>轨道: {tracks.length}</span>
          <span>采样率: 48kHz</span>
          <span>缓冲: 256</span>
          <span>CPU: 12%</span>
        </div>
      </div>
    </div>
  );
};

export default OnlineDAWComponent;
