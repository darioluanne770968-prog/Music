import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 元宇宙音乐空间 - VR音乐厅/3D社交/虚拟演出

interface VirtualSpace {
  id: string;
  name: string;
  type: 'concert-hall' | 'club' | 'lounge' | 'outdoor' | 'studio' | 'gallery';
  capacity: number;
  currentUsers: number;
  theme: string;
  ambiance: 'energetic' | 'chill' | 'intimate' | 'epic';
  features: string[];
}

interface Avatar {
  id: string;
  name: string;
  model: 'human' | 'robot' | 'animal' | 'abstract';
  style: string;
  accessories: string[];
  position: { x: number; y: number; z: number };
  rotation: number;
  animation: 'idle' | 'dancing' | 'waving' | 'jumping' | 'sitting';
  status: 'online' | 'away' | 'busy' | 'listening';
}

interface VirtualEvent {
  id: string;
  title: string;
  artist: string;
  startTime: Date;
  duration: number;
  spaceId: string;
  ticketPrice: number;
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  features: string[];
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'emoji' | 'reaction' | 'gift';
  timestamp: Date;
}

// 虚拟空间定义
const VIRTUAL_SPACES: VirtualSpace[] = [
  {
    id: 'main-hall',
    name: '主音乐厅',
    type: 'concert-hall',
    capacity: 10000,
    currentUsers: 3456,
    theme: 'futuristic',
    ambiance: 'epic',
    features: ['3D音效', '全息舞台', '互动灯光', '虚拟烟花'],
  },
  {
    id: 'neon-club',
    name: '霓虹俱乐部',
    type: 'club',
    capacity: 500,
    currentUsers: 234,
    theme: 'cyberpunk',
    ambiance: 'energetic',
    features: ['DJ台', '舞池', 'VIP包厢', '虚拟酒吧'],
  },
  {
    id: 'zen-lounge',
    name: '禅意休息室',
    type: 'lounge',
    capacity: 100,
    currentUsers: 45,
    theme: 'japanese',
    ambiance: 'chill',
    features: ['榻榻米', '枯山水', '茶室', '冥想区'],
  },
  {
    id: 'floating-garden',
    name: '浮空花园',
    type: 'outdoor',
    capacity: 2000,
    currentUsers: 567,
    theme: 'fantasy',
    ambiance: 'intimate',
    features: ['漂浮岛屿', '瀑布', '星空', '萤火虫'],
  },
  {
    id: 'crystal-studio',
    name: '水晶工作室',
    type: 'studio',
    capacity: 50,
    currentUsers: 12,
    theme: 'minimal',
    ambiance: 'intimate',
    features: ['录音设备', '合作创作', '实时混音', '直播'],
  },
  {
    id: 'art-gallery',
    name: '音乐艺术馆',
    type: 'gallery',
    capacity: 300,
    currentUsers: 89,
    theme: 'artistic',
    ambiance: 'chill',
    features: ['音乐可视化', 'NFT展览', '互动装置', '创作工坊'],
  },
];

// 虚拟活动
const VIRTUAL_EVENTS: Omit<VirtualEvent, 'startTime'>[] = [
  {
    id: 'event-1',
    title: '电音狂欢夜',
    artist: 'DJ Stellar',
    duration: 180,
    spaceId: 'neon-club',
    ticketPrice: 0,
    attendees: 1234,
    maxAttendees: 5000,
    isLive: true,
    features: ['虚拟应援', '实时互动', '独家周边'],
  },
  {
    id: 'event-2',
    title: '古典音乐之夜',
    artist: '虚拟交响乐团',
    duration: 120,
    spaceId: 'main-hall',
    ticketPrice: 29,
    attendees: 5678,
    maxAttendees: 10000,
    isLive: false,
    features: ['4K画质', '360°视角', '乐器特写'],
  },
  {
    id: 'event-3',
    title: '独立音乐人专场',
    artist: '多位艺人',
    duration: 240,
    spaceId: 'floating-garden',
    ticketPrice: 15,
    attendees: 890,
    maxAttendees: 2000,
    isLive: false,
    features: ['艺人见面', '签名周边', '幕后花絮'],
  },
];

// 表情和动作
const EXPRESSIONS = ['😀', '🥳', '🎉', '❤️', '🔥', '👏', '🎵', '💃', '🕺', '✨'];
const ANIMATIONS = ['dancing', 'waving', 'jumping', 'sitting', 'idle'] as const;

export const useMetaverseSpace = () => {
  const [currentSpace, setCurrentSpace] = useState<VirtualSpace | null>(null);
  const [avatar, setAvatar] = useState<Avatar>({
    id: 'user-avatar',
    name: '我的化身',
    model: 'human',
    style: 'casual',
    accessories: ['headphones'],
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    animation: 'idle',
    status: 'online',
  });
  const [nearbyUsers, setNearbyUsers] = useState<Avatar[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentEvent, setCurrentEvent] = useState<VirtualEvent | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);

  // 进入空间
  const enterSpace = useCallback((spaceId: string) => {
    const space = VIRTUAL_SPACES.find(s => s.id === spaceId);
    if (space) {
      setCurrentSpace(space);
      // 模拟其他用户
      setNearbyUsers(
        Array.from({ length: Math.min(space.currentUsers, 20) }, (_, i) => ({
          id: `user-${i}`,
          name: `用户${i + 1}`,
          model: (['human', 'robot', 'animal', 'abstract'] as const)[Math.floor(Math.random() * 4)],
          style: 'default',
          accessories: [],
          position: {
            x: (Math.random() - 0.5) * 100,
            y: 0,
            z: (Math.random() - 0.5) * 100,
          },
          rotation: Math.random() * 360,
          animation: (['idle', 'dancing', 'waving'] as const)[Math.floor(Math.random() * 3)],
          status: 'online' as const,
        }))
      );
    }
  }, []);

  // 离开空间
  const leaveSpace = useCallback(() => {
    setCurrentSpace(null);
    setNearbyUsers([]);
    setMessages([]);
  }, []);

  // 移动头像
  const moveAvatar = useCallback((direction: 'forward' | 'backward' | 'left' | 'right') => {
    const speed = 5;
    const radians = (avatar.rotation * Math.PI) / 180;

    setAvatar(prev => {
      let newX = prev.position.x;
      let newZ = prev.position.z;

      switch (direction) {
        case 'forward':
          newX += Math.sin(radians) * speed;
          newZ += Math.cos(radians) * speed;
          break;
        case 'backward':
          newX -= Math.sin(radians) * speed;
          newZ -= Math.cos(radians) * speed;
          break;
        case 'left':
          newX -= Math.cos(radians) * speed;
          newZ += Math.sin(radians) * speed;
          break;
        case 'right':
          newX += Math.cos(radians) * speed;
          newZ -= Math.sin(radians) * speed;
          break;
      }

      return {
        ...prev,
        position: { ...prev.position, x: newX, z: newZ },
      };
    });
  }, [avatar.rotation]);

  // 旋转头像
  const rotateAvatar = useCallback((delta: number) => {
    setAvatar(prev => ({
      ...prev,
      rotation: (prev.rotation + delta) % 360,
    }));
  }, []);

  // 设置动画
  const setAnimation = useCallback((animation: Avatar['animation']) => {
    setAvatar(prev => ({ ...prev, animation }));
  }, []);

  // 发送消息
  const sendMessage = useCallback((content: string, type: ChatMessage['type'] = 'text') => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: avatar.id,
      userName: avatar.name,
      content,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev.slice(-99), newMessage]);
  }, [avatar]);

  // 发送表情
  const sendReaction = useCallback((emoji: string) => {
    sendMessage(emoji, 'reaction');
  }, [sendMessage]);

  // 加入活动
  const joinEvent = useCallback((eventId: string) => {
    const event = VIRTUAL_EVENTS.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent({
        ...event,
        startTime: new Date(),
      });
      enterSpace(event.spaceId);
    }
  }, [enterSpace]);

  // 离开活动
  const leaveEvent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  // 更新头像
  const updateAvatar = useCallback((updates: Partial<Avatar>) => {
    setAvatar(prev => ({ ...prev, ...updates }));
  }, []);

  // 切换VR模式
  const toggleVRMode = useCallback(() => {
    setIsVRMode(prev => !prev);
  }, []);

  return {
    currentSpace,
    avatar,
    nearbyUsers,
    messages,
    currentEvent,
    isVRMode,
    enterSpace,
    leaveSpace,
    moveAvatar,
    rotateAvatar,
    setAnimation,
    sendMessage,
    sendReaction,
    joinEvent,
    leaveEvent,
    updateAvatar,
    toggleVRMode,
  };
};

// 3D场景渲染组件
const Scene3D: React.FC<{
  space: VirtualSpace;
  avatar: Avatar;
  nearbyUsers: Avatar[];
  onMove: (direction: 'forward' | 'backward' | 'left' | 'right') => void;
  onRotate: (delta: number) => void;
}> = ({ space, avatar, nearbyUsers, onMove, onRotate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const time = { current: 0 };

    const render = () => {
      time.current += 0.016;
      const width = canvas.width;
      const height = canvas.height;

      // 背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (space.theme === 'cyberpunk') {
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a0a2e');
      } else if (space.theme === 'fantasy') {
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(1, '#0a1a2e');
      } else {
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#0a0a2a');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 星空/粒子效果
      for (let i = 0; i < 100; i++) {
        const x = (i * 123.456 + time.current * 10) % width;
        const y = (i * 78.901 + time.current * 5) % height;
        const size = Math.sin(time.current + i) * 0.5 + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time.current + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 地面网格
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = (avatar.position.x % gridSize);
      const offsetZ = (avatar.position.z % gridSize);

      for (let i = -10; i <= 10; i++) {
        const startX = width / 2 + (i * gridSize - offsetX) * 2;
        ctx.beginPath();
        ctx.moveTo(startX, height * 0.4);
        ctx.lineTo(width / 2 + (i * gridSize - offsetX) * 0.5, height);
        ctx.stroke();
      }

      // 其他用户
      nearbyUsers.forEach((user, index) => {
        const relX = user.position.x - avatar.position.x;
        const relZ = user.position.z - avatar.position.z;
        const distance = Math.sqrt(relX * relX + relZ * relZ);

        if (distance < 100) {
          const screenX = width / 2 + relX * 3;
          const screenY = height * 0.7 - distance * 2;
          const size = Math.max(10, 30 - distance * 0.3);

          // 头像圆圈
          ctx.fillStyle = `hsl(${index * 30}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          ctx.fill();

          // 名称
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(user.name, screenX, screenY - size - 5);

          // 动画效果
          if (user.animation === 'dancing') {
            const bounce = Math.sin(time.current * 5 + index) * 5;
            ctx.beginPath();
            ctx.arc(screenX, screenY + bounce, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 玩家指示器
      const playerY = height * 0.75;
      ctx.save();
      ctx.translate(width / 2, playerY);

      // 方向指示
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 20);
      ctx.moveTo(-15, 5);
      ctx.lineTo(0, -20);
      ctx.lineTo(15, 5);
      ctx.stroke();

      ctx.restore();

      // 空间信息
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, 20, 200, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(space.name, 30, 45);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#00d4ff';
      ctx.fillText(`👥 ${space.currentUsers} 人在线`, 30, 65);
      ctx.fillText(`🎵 ${space.ambiance}`, 30, 85);

      animationId = requestAnimationFrame(render);
    };

    render();

    // 键盘控制
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          onMove('forward');
          break;
        case 's':
        case 'ArrowDown':
          onMove('backward');
          break;
        case 'a':
        case 'ArrowLeft':
          onRotate(-15);
          break;
        case 'd':
        case 'ArrowRight':
          onRotate(15);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [space, avatar, nearbyUsers, onMove, onRotate]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={600}
      className="w-full rounded-xl"
    />
  );
};

// 空间卡片
const SpaceCard: React.FC<{
  space: VirtualSpace;
  onEnter: () => void;
}> = ({ space, onEnter }) => {
  const typeIcons = {
    'concert-hall': '🎭',
    'club': '🪩',
    'lounge': '🛋️',
    'outdoor': '🌸',
    'studio': '🎛️',
    'gallery': '🖼️',
  };

  return (
    <motion.div
      className="bg-slate-800/50 rounded-2xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onEnter}
    >
      <div className={`h-40 flex items-center justify-center text-6xl ${
        space.theme === 'cyberpunk' ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30' :
        space.theme === 'fantasy' ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30' :
        space.theme === 'japanese' ? 'bg-gradient-to-br from-red-500/30 to-pink-500/30' :
        'bg-gradient-to-br from-cyan-500/30 to-blue-500/30'
      }`}>
        {typeIcons[space.type]}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{space.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${
            space.currentUsers / space.capacity > 0.8 ? 'bg-red-500/20 text-red-400' :
            space.currentUsers / space.capacity > 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {space.currentUsers}/{space.capacity}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {space.features.slice(0, 3).map(feature => (
            <span key={feature} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-gray-400">
              {feature}
            </span>
          ))}
        </div>
        <motion.button
          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          进入空间
        </motion.button>
      </div>
    </motion.div>
  );
};

// 活动卡片
const EventCard: React.FC<{
  event: Omit<VirtualEvent, 'startTime'>;
  onJoin: () => void;
}> = ({ event, onJoin }) => {
  return (
    <motion.div
      className="bg-slate-800/50 rounded-2xl p-4"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-xl flex items-center justify-center text-4xl">
          🎤
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">{event.title}</h3>
            {event.isLive && (
              <span className="px-2 py-0.5 bg-red-500 rounded text-xs text-white animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-2">{event.artist}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👥 {event.attendees}/{event.maxAttendees}</span>
            <span>⏱️ {event.duration}分钟</span>
            <span>{event.ticketPrice === 0 ? '免费' : `¥${event.ticketPrice}`}</span>
          </div>
        </div>
        <motion.button
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onJoin}
        >
          {event.isLive ? '加入' : '预约'}
        </motion.button>
      </div>
    </motion.div>
  );
};

// 聊天面板
const ChatPanel: React.FC<{
  messages: ChatMessage[];
  onSend: (content: string) => void;
  onReaction: (emoji: string) => void;
}> = ({ messages, onSend, onReaction }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-white font-bold mb-3">聊天</h3>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            className={`${
              msg.type === 'reaction' ? 'text-center' : ''
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.type === 'reaction' ? (
              <span className="text-2xl">{msg.content}</span>
            ) : (
              <>
                <span className="text-cyan-400 text-sm">{msg.userName}: </span>
                <span className="text-white text-sm">{msg.content}</span>
              </>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 表情快捷 */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {EXPRESSIONS.map(emoji => (
          <motion.button
            key={emoji}
            className="p-1 hover:bg-slate-700 rounded"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReaction(emoji)}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-white text-sm"
          placeholder="发送消息..."
        />
        <motion.button
          className="px-4 py-2 bg-cyan-500 rounded-lg text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
        >
          发送
        </motion.button>
      </div>
    </div>
  );
};

// 头像编辑器
const AvatarEditor: React.FC<{
  avatar: Avatar;
  onUpdate: (updates: Partial<Avatar>) => void;
  onClose: () => void;
}> = ({ avatar, onUpdate, onClose }) => {
  const models = ['human', 'robot', 'animal', 'abstract'] as const;
  const styles = ['casual', 'formal', 'sporty', 'punk', 'elegant'];
  const accessories = ['headphones', 'glasses', 'hat', 'mask', 'wings'];

  return (
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
        <h3 className="text-xl font-bold text-white mb-6">编辑头像</h3>

        {/* 预览 */}
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-6xl">
          {avatar.model === 'human' ? '👤' :
           avatar.model === 'robot' ? '🤖' :
           avatar.model === 'animal' ? '🐱' : '✨'}
        </div>

        {/* 模型选择 */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">模型</label>
          <div className="flex gap-2">
            {models.map(model => (
              <button
                key={model}
                className={`flex-1 py-2 rounded-lg ${
                  avatar.model === model ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'
                }`}
                onClick={() => onUpdate({ model })}
              >
                {model === 'human' ? '人类' :
                 model === 'robot' ? '机器人' :
                 model === 'animal' ? '动物' : '抽象'}
              </button>
            ))}
          </div>
        </div>

        {/* 风格选择 */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">风格</label>
          <div className="flex flex-wrap gap-2">
            {styles.map(style => (
              <button
                key={style}
                className={`px-3 py-1 rounded-lg ${
                  avatar.style === style ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'
                }`}
                onClick={() => onUpdate({ style })}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* 配件选择 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">配件</label>
          <div className="flex flex-wrap gap-2">
            {accessories.map(acc => (
              <button
                key={acc}
                className={`px-3 py-1 rounded-lg ${
                  avatar.accessories.includes(acc) ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'
                }`}
                onClick={() => {
                  const newAccessories = avatar.accessories.includes(acc)
                    ? avatar.accessories.filter(a => a !== acc)
                    : [...avatar.accessories, acc];
                  onUpdate({ accessories: newAccessories });
                }}
              >
                {acc === 'headphones' ? '🎧' :
                 acc === 'glasses' ? '👓' :
                 acc === 'hat' ? '🎩' :
                 acc === 'mask' ? '🎭' : '🪽'} {acc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
            onClick={onClose}
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 主组件
export const MetaverseMusicSpace: React.FC = () => {
  const {
    currentSpace,
    avatar,
    nearbyUsers,
    messages,
    currentEvent,
    isVRMode,
    enterSpace,
    leaveSpace,
    moveAvatar,
    rotateAvatar,
    setAnimation,
    sendMessage,
    sendReaction,
    joinEvent,
    updateAvatar,
    toggleVRMode,
  } = useMetaverseSpace();

  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  if (currentSpace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 顶部栏 */}
        <div className="h-14 bg-slate-800/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <motion.button
              className="px-4 py-2 bg-slate-700 rounded-xl text-white"
              whileHover={{ scale: 1.05 }}
              onClick={leaveSpace}
            >
              ← 离开
            </motion.button>
            <h2 className="text-white font-bold">{currentSpace.name}</h2>
            <span className="text-cyan-400 text-sm">👥 {nearbyUsers.length + 1} 人</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className="px-4 py-2 bg-slate-700 rounded-xl text-white"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAvatarEditor(true)}
            >
              👤 头像
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-xl text-white ${
                isVRMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              whileHover={{ scale: 1.05 }}
              onClick={toggleVRMode}
            >
              🥽 VR模式
            </motion.button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-56px)]">
          {/* 3D场景 */}
          <div className="flex-1 p-4">
            <Scene3D
              space={currentSpace}
              avatar={avatar}
              nearbyUsers={nearbyUsers}
              onMove={moveAvatar}
              onRotate={rotateAvatar}
            />

            {/* 动作按钮 */}
            <div className="flex justify-center gap-2 mt-4">
              {ANIMATIONS.map(anim => (
                <motion.button
                  key={anim}
                  className={`px-4 py-2 rounded-xl ${
                    avatar.animation === anim
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAnimation(anim)}
                >
                  {anim === 'idle' ? '🧍 站立' :
                   anim === 'dancing' ? '💃 跳舞' :
                   anim === 'waving' ? '👋 挥手' :
                   anim === 'jumping' ? '🦘 跳跃' : '🪑 坐下'}
                </motion.button>
              ))}
            </div>

            {/* 控制提示 */}
            <div className="text-center mt-4 text-gray-500 text-sm">
              使用 WASD 或方向键移动 · A/D 旋转视角
            </div>
          </div>

          {/* 聊天面板 */}
          <div className="w-80 p-4">
            <ChatPanel
              messages={messages}
              onSend={sendMessage}
              onReaction={sendReaction}
            />
          </div>
        </div>

        {/* 头像编辑器 */}
        <AnimatePresence>
          {showAvatarEditor && (
            <AvatarEditor
              avatar={avatar}
              onUpdate={updateAvatar}
              onClose={() => setShowAvatarEditor(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🌐 元宇宙音乐空间</h1>
          <p className="text-gray-400">探索虚拟世界，与全球乐迷相遇</p>
        </div>

        {/* 当前活动 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">🎤 热门活动</h2>
          <div className="space-y-4">
            {VIRTUAL_EVENTS.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={() => joinEvent(event.id)}
              />
            ))}
          </div>
        </div>

        {/* 虚拟空间 */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">🏠 虚拟空间</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIRTUAL_SPACES.map(space => (
              <SpaceCard
                key={space.id}
                space={space}
                onEnter={() => enterSpace(space.id)}
              />
            ))}
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="bg-slate-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">元宇宙音乐体验</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🥽</div>
              <h4 className="text-white font-medium mb-2">VR沉浸</h4>
              <p className="text-gray-400 text-sm">支持VR设备，身临其境的音乐体验</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-white font-medium mb-2">社交互动</h4>
              <p className="text-gray-400 text-sm">与全球乐迷实时交流、共同欣赏</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎭</div>
              <h4 className="text-white font-medium mb-2">虚拟演出</h4>
              <p className="text-gray-400 text-sm">观看独家虚拟演唱会和直播</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="text-white font-medium mb-2">个性头像</h4>
              <p className="text-gray-400 text-sm">自定义你的虚拟形象和装扮</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaverseMusicSpace;
