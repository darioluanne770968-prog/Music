import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MultiKaraokeRoom, KaraokeParticipant, KaraokeSongQueue } from '../../types/live-streaming';

interface MultiKaraokeProps {
  roomId: string;
  userId: string;
  onJoinMic: () => void;
  onLeaveMic: () => void;
  onRequestSong: (songId: string) => void;
  onSendGift: (giftId: string, quantity: number) => void;
}

const DEMO_ROOM: MultiKaraokeRoom = {
  id: '1',
  name: '周五狂欢夜K歌房',
  hostId: 'host1',
  theme: {
    id: 't1',
    name: '霓虹派对',
    backgroundUrl: '/bg/neon.jpg',
    stageStyle: 'neon',
    effects: [],
    micStyles: [],
    scoreboardStyle: 'neon',
  },
  status: 'performing',
  participants: [
    { userId: '1', username: '歌王小明', avatar: '', role: 'host', micEnabled: true, position: 1, score: 95, totalSongs: 12, badges: ['vip'], joinedAt: new Date() },
    { userId: '2', username: '音乐达人', avatar: '', role: 'singer', micEnabled: true, position: 2, score: 88, totalSongs: 5, badges: [], joinedAt: new Date() },
    { userId: '3', username: '新手歌手', avatar: '', role: 'singer', micEnabled: false, position: 3, score: 0, totalSongs: 0, badges: [], joinedAt: new Date() },
  ],
  audience: [],
  songQueue: [
    { id: '1', songId: 's1', songName: '夜曲', artistName: '周杰伦', requestedBy: '小明', singersCount: 1, singers: ['1'], mode: 'solo', key: 0, status: 'performing', position: 1 },
    { id: '2', songId: 's2', songName: '告白气球', artistName: '周杰伦', requestedBy: '音乐达人', singersCount: 1, singers: ['2'], mode: 'solo', key: 0, status: 'queued', position: 2 },
    { id: '3', songId: 's3', songName: '晴天', artistName: '周杰伦', requestedBy: '小红', singersCount: 2, singers: ['1', '2'], mode: 'duet', key: 0, status: 'queued', position: 3 },
  ],
  currentPerformance: {
    songId: 's1',
    songName: '夜曲',
    singers: [
      { userId: '1', username: '歌王小明', avatar: '', score: 8520, combo: 15, maxCombo: 23, perfectCount: 45, greatCount: 12, missCount: 3, audioLevel: 0.8, effects: [] },
    ],
    startTime: new Date(),
    duration: 240,
    currentTime: 125,
    scoring: { enabled: true, mode: 'standard', realTimeScore: 8520, pitchAccuracy: 92, rhythmAccuracy: 88, expressionScore: 85 },
    lyricsSync: { currentLine: 12, currentWord: 3, highlightColor: '#ff69b4', displayMode: 'karaoke' },
  },
  settings: {
    maxParticipants: 8,
    maxAudience: 1000,
    micPositions: 4,
    allowSongRequests: true,
    autoNextSong: true,
    scoringEnabled: true,
    giftingEnabled: true,
    recordingEnabled: true,
    privateRoom: false,
    ageRestricted: false,
    language: 'zh-CN',
  },
  chat: [],
  reactions: [],
  gifts: [],
  stats: { totalViewers: 1256, peakViewers: 2000, totalGifts: 580, giftValue: 12500, songsPerformed: 28, averageScore: 85, duration: 7200 },
  createdAt: new Date(),
};

const DEMO_LYRICS = [
  { time: 0, text: '雨下整夜 我的爱溢出就像雨水' },
  { time: 5, text: '院子落叶 跟我的思念厚厚一叠' },
  { time: 10, text: '几句是非 也无法将我的热情冷却' },
  { time: 15, text: '你出现在我诗的每一页' },
  { time: 20, text: '雨下整夜 我的爱溢出就像雨水' },
];

export const MultiKaraokeComponent: React.FC<MultiKaraokeProps> = ({
  roomId,
  userId,
  onJoinMic,
  onLeaveMic,
  onRequestSong,
  onSendGift,
}) => {
  const [room, setRoom] = useState<MultiKaraokeRoom>(DEMO_ROOM);
  const [showQueue, setShowQueue] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(2);
  const [chatMessage, setChatMessage] = useState('');

  const currentSong = room.currentPerformance;
  const currentSinger = currentSong?.singers[0];
  const isHost = room.hostId === userId;
  const isSinger = room.participants.some(p => p.userId === userId && p.role !== 'pending');

  const gifts = [
    { id: 'rose', icon: '🌹', name: '玫瑰', price: 1 },
    { id: 'heart', icon: '💖', name: '爱心', price: 5 },
    { id: 'crown', icon: '👑', name: '皇冠', price: 50 },
    { id: 'car', icon: '🏎️', name: '跑车', price: 200 },
    { id: 'rocket', icon: '🚀', name: '火箭', price: 500 },
    { id: 'castle', icon: '🏰', name: '城堡', price: 1000 },
  ];

  // 模拟歌词滚动
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLyricIndex((i) => (i + 1) % DEMO_LYRICS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl overflow-hidden">
      {/* 顶部状态栏 */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm">LIVE</span>
          </div>
          <div className="px-3 py-1 bg-pink-500/30 rounded-full">
            <span className="text-pink-300 text-sm">👥 {room.stats.totalViewers}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white/10 rounded-full">
            <span>🔊</span>
          </button>
          <button className="p-2 bg-white/10 rounded-full">
            <span>⚙️</span>
          </button>
          <button className="px-4 py-2 bg-red-500/50 rounded-full text-white text-sm">
            退出
          </button>
        </div>
      </div>

      {/* 房间名称 */}
      <div className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
        <h1 className="text-xl font-bold text-white">{room.name}</h1>
        <p className="text-gray-400 text-sm">已演唱 {room.stats.songsPerformed} 首 · 累计 {formatTime(room.stats.duration)}</p>
      </div>

      {/* 主舞台区域 */}
      <div className="relative h-80 bg-gradient-to-b from-purple-900/50 to-black/50">
        {/* 霓虹效果背景 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 100, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute h-0.5 w-full"
              style={{
                top: `${20 + i * 15}%`,
                background: `linear-gradient(90deg, transparent, ${['#ff69b4', '#00ffff', '#ff4500', '#9400d3', '#00ff00'][i]}, transparent)`,
              }}
            />
          ))}
        </div>

        {/* 当前歌曲信息 */}
        {currentSong && (
          <div className="absolute top-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">{currentSong.songName}</p>
                <p className="text-gray-400 text-sm">原唱: {room.songQueue[0]?.artistName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                  {currentSinger?.score.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">准确度 {currentSong.scoring.pitchAccuracy}%</span>
                  <span className="text-yellow-400">Combo x{currentSinger?.combo}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 歌词显示 */}
        <div className="absolute inset-x-0 top-1/3 text-center space-y-4">
          {DEMO_LYRICS.slice(currentLyricIndex, currentLyricIndex + 3).map((lyric, i) => (
            <motion.p
              key={lyric.time}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: i === 0 ? 1 : 0.5, y: 0 }}
              className={`text-2xl ${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}
            >
              {lyric.text}
            </motion.p>
          ))}
        </div>

        {/* 进度条 */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
              style={{ width: `${((currentSong?.currentTime || 0) / (currentSong?.duration || 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{formatTime(currentSong?.currentTime || 0)}</span>
            <span>{formatTime(currentSong?.duration || 0)}</span>
          </div>
        </div>

        {/* 麦位显示 */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
          {room.participants.filter(p => p.role !== 'pending').slice(0, 4).map((participant, i) => (
            <motion.div
              key={participant.userId}
              animate={participant.micEnabled ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`relative w-16 h-16 rounded-full ${
                participant.micEnabled
                  ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900'
                  : 'opacity-50'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded-full">
                <p className="text-white text-xs whitespace-nowrap">{participant.username}</p>
              </div>
              {participant.role === 'host' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">👑</span>
                </div>
              )}
              {participant.micEnabled && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                >
                  <span className="text-green-400 text-lg">🎵</span>
                </motion.div>
              )}
            </motion.div>
          ))}
          {/* 空麦位 */}
          {[...Array(Math.max(0, 4 - room.participants.filter(p => p.role !== 'pending').length))].map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={onJoinMic}
              className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center hover:border-pink-500 transition-colors"
            >
              <span className="text-gray-400 text-2xl">+</span>
            </button>
          ))}
        </div>
      </div>

      {/* 功能区 */}
      <div className="p-4 bg-black/50">
        <div className="flex gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQueue(!showQueue)}
            className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
          >
            🎵 点歌 ({room.songQueue.length})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGifts(!showGifts)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium"
          >
            🎁 送礼
          </motion.button>
          <button className="py-3 px-4 bg-white/10 rounded-xl text-white">
            💬
          </button>
        </div>

        {/* 点歌队列 */}
        <AnimatePresence>
          {showQueue && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 rounded-xl p-4 mb-4 overflow-hidden"
            >
              <h3 className="text-white font-medium mb-3">点歌队列</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {room.songQueue.map((song, i) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      song.status === 'performing' ? 'bg-pink-500/20' : 'bg-white/5'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      song.status === 'performing' ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      {song.status === 'performing' ? '♪' : i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{song.songName}</p>
                      <p className="text-gray-400 text-xs">
                        {song.mode === 'duet' ? '合唱' : '独唱'} · {song.requestedBy}
                      </p>
                    </div>
                    {song.mode === 'duet' && (
                      <span className="text-pink-400 text-sm">👥</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm">
                + 我要点歌
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 礼物面板 */}
        <AnimatePresence>
          {showGifts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 rounded-xl p-4 mb-4 overflow-hidden"
            >
              <h3 className="text-white font-medium mb-3">礼物</h3>
              <div className="grid grid-cols-6 gap-3">
                {gifts.map((gift) => (
                  <motion.button
                    key={gift.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSendGift(gift.id, 1)}
                    className="flex flex-col items-center p-2 bg-white/5 rounded-xl hover:bg-white/10"
                  >
                    <span className="text-3xl mb-1">{gift.icon}</span>
                    <span className="text-gray-400 text-xs">{gift.price}币</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 聊天输入 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="发送弹幕..."
            className="flex-1 bg-white/10 rounded-xl px-4 py-2 text-white outline-none placeholder-gray-500"
          />
          <button className="px-4 py-2 bg-pink-500 rounded-xl text-white">
            发送
          </button>
        </div>

        {/* 滚动弹幕预览 */}
        <div className="mt-4 space-y-1">
          {[
            { user: '小红', msg: '唱得太好了！', color: '#ff69b4' },
            { user: 'VIP用户', msg: '666666', color: '#ffd700' },
            { user: '路人甲', msg: '求合唱！', color: '#00ffff' },
          ].map((chat, i) => (
            <div key={i} className="text-sm">
              <span style={{ color: chat.color }}>{chat.user}: </span>
              <span className="text-white">{chat.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiKaraokeComponent;
