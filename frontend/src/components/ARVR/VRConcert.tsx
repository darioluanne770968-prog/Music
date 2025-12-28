import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VRConcert as VRConcertType, VRVenue, VRAvatar } from '../../types/ar-vr';

interface VRConcertProps {
  concert: VRConcertType;
  userAvatar: VRAvatar;
  onJoin: () => void;
  onLeave: () => void;
  onReaction: (type: string) => void;
}

const DEMO_CONCERT: VRConcertType = {
  id: '1',
  title: '元宇宙跨年演唱会',
  artistId: 'artist1',
  artistName: '周杰伦',
  description: '在虚拟世界中与偶像零距离互动，共同迎接新年！',
  venue: {
    id: 'venue1',
    name: '星际穹顶',
    type: 'fantasy',
    capacity: 100000,
    model3DUrl: '/models/venue.glb',
    ambientSounds: ['crowd_noise', 'ambient_music'],
    lightingPresets: [],
    stageDesign: {
      width: 100,
      height: 50,
      depth: 80,
      screens: [],
      effects: [],
      pyrotechnics: true,
    },
  },
  startTime: new Date(),
  endTime: new Date(Date.now() + 3600000),
  status: 'live',
  ticketPrice: 99,
  maxAttendees: 100000,
  currentAttendees: 78542,
  features: ['live_chat', 'gesture_reactions', 'photo_mode', 'dancing', 'light_sticks'],
  interactionModes: ['controller', 'hand_tracking'],
  avatarRequired: true,
  recordingAvailable: true,
  merchandiseEnabled: true,
};

export const VRConcertComponent: React.FC<VRConcertProps> = ({
  concert = DEMO_CONCERT,
  userAvatar,
  onJoin,
  onLeave,
  onReaction,
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [viewMode, setViewMode] = useState<'stage' | 'crowd' | 'vip' | 'backstage'>('stage');
  const [showChat, setShowChat] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [lightStickColor, setLightStickColor] = useState('#ff69b4');
  const [isWaving, setIsWaving] = useState(false);

  const reactions = [
    { id: 'clap', icon: '👏', label: '鼓掌' },
    { id: 'heart', icon: '❤️', label: '比心' },
    { id: 'fire', icon: '🔥', label: '燃' },
    { id: 'star', icon: '⭐', label: '打Call' },
    { id: 'cry', icon: '😭', label: '感动' },
    { id: 'scream', icon: '🎉', label: '尖叫' },
  ];

  const lightStickColors = [
    '#ff69b4', '#00ffff', '#ff4500', '#9400d3',
    '#00ff00', '#ffd700', '#ffffff', '#ff1493'
  ];

  const handleJoin = () => {
    setIsJoined(true);
    onJoin();
  };

  const handleLeave = () => {
    setIsJoined(false);
    onLeave();
  };

  const triggerReaction = (type: string) => {
    onReaction(type);
    // 显示反馈动画
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl overflow-hidden">
      {/* 未加入时的预览 */}
      {!isJoined ? (
        <div className="relative">
          {/* 演唱会预览 */}
          <div className="relative h-80 bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/40" />

            {/* VR标识 */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-bold">
                VR
              </div>
              <div className="px-3 py-1 bg-red-500 rounded-full text-white text-sm font-bold animate-pulse">
                LIVE
              </div>
            </div>

            {/* 观众数 */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
              <span className="text-green-400">●</span>
              <span className="text-white text-sm">{formatNumber(concert.currentAttendees)} 人在场</span>
            </div>

            {/* 3D场景预览 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="text-8xl"
              >
                🎪
              </motion.div>
            </div>

            {/* 演唱会信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80">
              <h1 className="text-3xl font-bold text-white mb-2">{concert.title}</h1>
              <p className="text-white/80 mb-2">{concert.artistName}</p>
              <p className="text-white/60 text-sm">{concert.description}</p>
            </div>
          </div>

          {/* 功能特性 */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: '🎤', label: '实时互动' },
                { icon: '💬', label: '弹幕聊天' },
                { icon: '📸', label: '合影模式' },
                { icon: '💃', label: '跳舞互动' },
                { icon: '🎆', label: '烟火特效' },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <p className="text-gray-400 text-xs">{feature.label}</p>
                </div>
              ))}
            </div>

            {/* 场地信息 */}
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🏟️</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{concert.venue.name}</p>
                  <p className="text-gray-400 text-sm">
                    容量: {formatNumber(concert.venue.capacity)} |
                    类型: {concert.venue.type === 'fantasy' ? '奇幻世界' : concert.venue.type}
                  </p>
                </div>
              </div>
            </div>

            {/* 票价和加入按钮 */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">入场票价</p>
                <p className="text-2xl font-bold text-white">
                  {concert.ticketPrice === 0 ? '免费' : `¥${concert.ticketPrice}`}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg"
              >
                🥽 戴上VR进入
              </motion.button>
            </div>

            {/* 设备要求 */}
            <div className="text-center text-gray-500 text-sm">
              支持设备: Quest 2/3 | PICO 4 | Apple Vision Pro | PSVR 2
            </div>
          </div>
        </div>
      ) : (
        /* 已加入演唱会界面 */
        <div className="relative h-[600px]">
          {/* VR场景模拟 */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-black to-purple-900">
            {/* 舞台效果 */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.5), transparent)',
                  'radial-gradient(circle at 30% 70%, rgba(219, 39, 119, 0.5), transparent)',
                  'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.5), transparent)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0"
            />

            {/* 激光效果 */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className="absolute top-1/4 left-1/2 w-1 h-64 origin-top"
                  style={{
                    background: `linear-gradient(to bottom, ${lightStickColor}, transparent)`,
                    transform: `rotate(${i * 45}deg)`,
                  }}
                />
              ))}
            </div>

            {/* 虚拟舞台 */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="text-8xl mb-4">🎤</div>
                <p className="text-white text-2xl font-bold">{concert.artistName}</p>
              </motion.div>
            </div>

            {/* 观众荧光棒效果 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [20, 40, 20],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                  className="w-1 rounded-full"
                  style={{
                    backgroundColor: lightStickColors[i % lightStickColors.length],
                    height: 20 + Math.random() * 30,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 顶部状态栏 */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-500 rounded-full text-white text-sm font-bold animate-pulse">
                LIVE
              </div>
              <span className="text-white">{concert.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
                <span className="text-green-400">●</span>
                <span className="text-white text-sm">{formatNumber(concert.currentAttendees)}</span>
              </div>
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-red-500/50 rounded-full text-white text-sm hover:bg-red-500"
              >
                退出
              </button>
            </div>
          </div>

          {/* 视角切换 */}
          <div className="absolute top-20 left-4 flex flex-col gap-2">
            {[
              { id: 'stage', label: '舞台', icon: '🎤' },
              { id: 'crowd', label: '观众席', icon: '👥' },
              { id: 'vip', label: 'VIP区', icon: '⭐' },
              { id: 'backstage', label: '后台', icon: '🚪' },
            ].map((view) => (
              <motion.button
                key={view.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode(view.id as any)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  viewMode === view.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-black/50 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{view.icon}</span>
              </motion.button>
            ))}
          </div>

          {/* 荧光棒控制 */}
          <div className="absolute top-20 right-4 space-y-4">
            <div className="bg-black/50 rounded-2xl p-3">
              <p className="text-white text-xs text-center mb-2">荧光棒颜色</p>
              <div className="grid grid-cols-4 gap-1">
                {lightStickColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setLightStickColor(color)}
                    className={`w-6 h-6 rounded-full ${
                      lightStickColor === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={isWaving ? { rotate: [-10, 10, -10] } : {}}
              transition={{ duration: 0.2, repeat: isWaving ? Infinity : 0 }}
              onMouseDown={() => setIsWaving(true)}
              onMouseUp={() => setIsWaving(false)}
              onMouseLeave={() => setIsWaving(false)}
              className="w-full py-3 bg-black/50 rounded-xl text-white text-center"
            >
              <span className="text-2xl">🪄</span>
              <p className="text-xs mt-1">挥动</p>
            </motion.button>
          </div>

          {/* 底部控制栏 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80">
            <div className="flex items-center justify-between">
              {/* 反应按钮 */}
              <div className="flex gap-2">
                {reactions.map((reaction) => (
                  <motion.button
                    key={reaction.id}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => triggerReaction(reaction.id)}
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                  >
                    <span className="text-xl">{reaction.icon}</span>
                  </motion.button>
                ))}
              </div>

              {/* 功能按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    showChat ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  💬 聊天
                </button>
                <button className="px-4 py-2 bg-white/10 rounded-full text-gray-300 text-sm">
                  📸 拍照
                </button>
                <button className="px-4 py-2 bg-white/10 rounded-full text-gray-300 text-sm">
                  🛍️ 周边
                </button>
              </div>
            </div>
          </div>

          {/* 聊天窗口 */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="absolute bottom-20 left-4 w-80 h-60 bg-black/70 rounded-2xl p-4 overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {[
                      { user: '小明', msg: '太棒了！！！', color: '#ff69b4' },
                      { user: '音乐迷', msg: '这首歌太好听了', color: '#00ffff' },
                      { user: 'VIP用户', msg: '🔥🔥🔥', color: '#ffd700' },
                      { user: '新手', msg: '第一次参加VR演唱会', color: '#98fb98' },
                      { user: '老粉丝', msg: '从上海来的', color: '#dda0dd' },
                    ].map((chat, i) => (
                      <div key={i} className="text-sm">
                        <span style={{ color: chat.color }}>{chat.user}: </span>
                        <span className="text-white">{chat.msg}</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="发送弹幕..."
                    className="mt-2 w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 飘动的反应表情 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 400,
                  y: 600,
                  opacity: 0,
                }}
                animate={{
                  y: -100,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                className="absolute text-2xl"
              >
                {reactions[Math.floor(Math.random() * reactions.length)].icon}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VRConcertComponent;
