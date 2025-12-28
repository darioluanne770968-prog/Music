import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MusicMatch as MusicMatchType, MusicProfile } from '../../types/social';

interface MusicMatchProps {
  onMatch: (userId: string) => void;
  onSkip: (userId: string) => void;
  onMessage: (userId: string) => void;
}

// 模拟匹配用户数据
const DEMO_MATCHES = [
  {
    id: '1',
    username: '音乐小王子',
    avatar: '/avatars/user1.jpg',
    age: 25,
    location: '北京',
    matchScore: 92,
    commonGenres: ['流行', '摇滚', '民谣'],
    commonArtists: ['周杰伦', '林俊杰', '邓紫棋'],
    commonSongs: ['夜曲', '江南', '光年之外'],
    topSong: { name: '夜曲', artist: '周杰伦' },
    personality: '探索者',
    bio: '音乐是我的生命，喜欢在深夜一个人听歌',
    recentlyPlaying: '告白气球 - 周杰伦',
  },
  {
    id: '2',
    username: '爵士女孩',
    avatar: '/avatars/user2.jpg',
    age: 23,
    location: '上海',
    matchScore: 88,
    commonGenres: ['爵士', '古典', 'R&B'],
    commonArtists: ['王菲', '陈奕迅', '李荣浩'],
    commonSongs: ['因为爱情', '富士山下', '李白'],
    topSong: { name: '红豆', artist: '王菲' },
    personality: '鉴赏家',
    bio: '咖啡配爵士，完美的下午时光',
    recentlyPlaying: '匆匆那年 - 王菲',
  },
  {
    id: '3',
    username: '电音狂热',
    avatar: '/avatars/user3.jpg',
    age: 22,
    location: '广州',
    matchScore: 85,
    commonGenres: ['电子', '嘻哈', 'EDM'],
    commonArtists: ['Avicii', 'Martin Garrix', 'The Chainsmokers'],
    commonSongs: ['Wake Me Up', 'Animals', 'Closer'],
    topSong: { name: 'Faded', artist: 'Alan Walker' },
    personality: '夜猫子',
    bio: '蹦迪是生活，电音是信仰',
    recentlyPlaying: 'Levels - Avicii',
  },
];

export const MusicMatch: React.FC<MusicMatchProps> = ({
  onMatch,
  onSkip,
  onMessage,
}) => {
  const [matches, setMatches] = useState(DEMO_MATCHES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [matchedUser, setMatchedUser] = useState<typeof DEMO_MATCHES[0] | null>(null);

  const currentMatch = matches[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);

    if (dir === 'right') {
      // 模拟匹配成功
      if (Math.random() > 0.5) {
        setMatchedUser(currentMatch);
      }
      onMatch(currentMatch.id);
    } else {
      onSkip(currentMatch.id);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  if (currentIndex >= matches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-6xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold text-white mb-2">暂时没有更多了</h2>
        <p className="text-gray-400 text-center mb-6">
          听更多音乐，发现更多志同道合的朋友
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-medium"
        >
          刷新推荐
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden">
      {/* 匹配成功弹窗 */}
      <AnimatePresence>
        {matchedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <div className="text-6xl mb-4 text-center">🎉</div>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                配对成功!
              </h2>
              <p className="text-gray-400 text-center mb-8">
                你和 {matchedUser.username} 音乐品味相似度 {matchedUser.matchScore}%
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                </div>
                <div className="text-4xl">💕</div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    onMessage(matchedUser.id);
                    setMatchedUser(null);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-medium"
                >
                  发送消息
                </button>
                <button
                  onClick={() => setMatchedUser(null)}
                  className="px-8 py-3 bg-white/10 rounded-full text-white font-medium"
                >
                  继续浏览
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 卡片堆叠 */}
      <div className="relative h-full p-6">
        {/* 背景卡片 */}
        {matches.slice(currentIndex + 1, currentIndex + 3).map((match, i) => (
          <div
            key={match.id}
            className="absolute inset-6 bg-gray-800 rounded-3xl"
            style={{
              transform: `scale(${1 - (i + 1) * 0.05}) translateY(${(i + 1) * 10}px)`,
              zIndex: -i - 1,
            }}
          />
        ))}

        {/* 当前卡片 */}
        <motion.div
          key={currentMatch.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{
            x: direction === 'left' ? -400 : direction === 'right' ? 400 : 0,
            rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
            opacity: direction ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="relative h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* 匹配度指示器 */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-lg">💕</span>
              <span className="text-white font-bold">{currentMatch.matchScore}%</span>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {currentMatch.username}
                  <span className="text-lg">{currentMatch.age}</span>
                </h2>
                <p className="text-gray-400 flex items-center gap-1">
                  📍 {currentMatch.location}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <span className="text-lg">{showDetails ? '▼' : '▲'}</span>
              </button>
            </div>

            {/* 正在播放 */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                🎵
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">正在播放</p>
                <p className="text-white text-sm">{currentMatch.recentlyPlaying}</p>
              </div>
            </div>

            {/* 共同标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentMatch.commonGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* 展开详情 */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-gray-300">{currentMatch.bio}</p>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">共同喜欢的歌手</p>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.commonArtists.map((artist) => (
                        <span
                          key={artist}
                          className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">共同喜欢的歌曲</p>
                    <div className="space-y-2">
                      {currentMatch.commonSongs.map((song) => (
                        <div
                          key={song}
                          className="flex items-center gap-2 text-white text-sm"
                        >
                          <span>🎵</span>
                          <span>{song}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {currentMatch.personality === '探索者' && '🔍'}
                      {currentMatch.personality === '鉴赏家' && '🎩'}
                      {currentMatch.personality === '夜猫子' && '🦉'}
                    </span>
                    <span className="text-white">{currentMatch.personality}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 拖拽指示 */}
          <motion.div
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-red-500 rounded-full px-4 py-2 opacity-0"
            style={{ opacity: direction === 'left' ? 1 : 0 }}
          >
            <span className="text-white font-bold">跳过</span>
          </motion.div>
          <motion.div
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-green-500 rounded-full px-4 py-2 opacity-0"
            style={{ opacity: direction === 'right' ? 1 : 0 }}
          >
            <span className="text-white font-bold">喜欢</span>
          </motion.div>
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-2xl hover:bg-red-500/50 transition-colors"
        >
          ❌
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDetails(!showDetails)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xl hover:bg-blue-500/50 transition-colors"
        >
          ℹ️
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-2xl hover:opacity-90 transition-opacity"
        >
          💕
        </motion.button>
      </div>
    </div>
  );
};

export default MusicMatch;
