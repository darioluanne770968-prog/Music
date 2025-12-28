import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeCapsule as TimeCapsuleType, CapsuleTheme } from '../../types/social';

interface TimeCapsuleProps {
  onSend: (capsule: Partial<TimeCapsuleType>) => Promise<void>;
  onClose: () => void;
}

const THEMES: CapsuleTheme[] = [
  { id: '1', name: '星空', backgroundUrl: '/themes/starry.jpg', animation: 'stars' },
  { id: '2', name: '海洋', backgroundUrl: '/themes/ocean.jpg', animation: 'waves' },
  { id: '3', name: '森林', backgroundUrl: '/themes/forest.jpg', animation: 'leaves' },
  { id: '4', name: '樱花', backgroundUrl: '/themes/sakura.jpg', animation: 'petals' },
  { id: '5', name: '复古', backgroundUrl: '/themes/retro.jpg', animation: 'film' },
  { id: '6', name: '霓虹', backgroundUrl: '/themes/neon.jpg', animation: 'glow' },
];

const PRESET_DATES = [
  { label: '1周后', days: 7 },
  { label: '1个月后', days: 30 },
  { label: '3个月后', days: 90 },
  { label: '半年后', days: 180 },
  { label: '1年后', days: 365 },
  { label: '5年后', days: 1825 },
];

export const TimeCapsuleCreator: React.FC<TimeCapsuleProps> = ({ onSend, onClose }) => {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState<'self' | 'friend'>('self');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<{ id: string; name: string; artist: string }[]>([]);
  const [message, setMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<CapsuleTheme>(THEMES[0]);
  const [unlockDate, setUnlockDate] = useState<Date>(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 模拟歌曲搜索结果
  const searchResults = [
    { id: '1', name: '夜曲', artist: '周杰伦' },
    { id: '2', name: '晴天', artist: '周杰伦' },
    { id: '3', name: '告白气球', artist: '周杰伦' },
    { id: '4', name: '稻香', artist: '周杰伦' },
  ];

  const handleAddSong = (song: typeof searchResults[0]) => {
    if (selectedSongs.length < 10 && !selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const handleRemoveSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== songId));
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend({
        recipientId: recipient === 'self' ? undefined : recipientEmail,
        songs: selectedSongs.map(s => ({ songId: s.id })),
        message,
        theme: selectedTheme,
        unlockDate,
      });
      setIsComplete(true);
    } catch (error) {
      console.error('Failed to send capsule:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysUntilUnlock = Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* 完成状态 */}
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <div className="text-8xl mb-6">💌</div>
              <h2 className="text-3xl font-bold text-white mb-4">时间胶囊已封存</h2>
              <p className="text-gray-400 mb-8">
                {recipient === 'self'
                  ? `将在 ${formatDate(unlockDate)} 向你开启`
                  : `将在 ${formatDate(unlockDate)} 发送给 ${recipientEmail}`}
              </p>

              <div className="bg-white/5 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <p className="text-4xl font-bold text-pink-400">{selectedSongs.length}</p>
                    <p className="text-gray-400 text-sm">首歌曲</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-purple-400">{daysUntilUnlock}</p>
                    <p className="text-gray-400 text-sm">天后开启</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-medium"
              >
                完成
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* 头部 */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">音乐时间胶囊</h2>
                    <p className="text-sm text-gray-400">封存此刻的音乐记忆</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  ×
                </button>
              </div>

              {/* 步骤指示器 */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= s
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && (
                      <div className={`flex-1 h-0.5 ${step > s ? 'bg-pink-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {/* 步骤1: 选择接收人 */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white">发送给谁?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setRecipient('self')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          recipient === 'self'
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-4xl block mb-3">🙋</span>
                        <span className="text-white font-medium block">给未来的自己</span>
                        <span className="text-gray-400 text-sm">给未来某一天的你</span>
                      </button>
                      <button
                        onClick={() => setRecipient('friend')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          recipient === 'friend'
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-4xl block mb-3">👥</span>
                        <span className="text-white font-medium block">给朋友</span>
                        <span className="text-gray-400 text-sm">分享音乐的惊喜</span>
                      </button>
                    </div>

                    {recipient === 'friend' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <label className="block text-gray-400 mb-2">朋友的邮箱</label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="friend@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* 步骤2: 选择歌曲 */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">选择歌曲</h3>
                      <span className="text-gray-400 text-sm">{selectedSongs.length}/10</span>
                    </div>

                    {/* 已选歌曲 */}
                    {selectedSongs.length > 0 && (
                      <div className="space-y-2">
                        {selectedSongs.map((song, index) => (
                          <div
                            key={song.id}
                            className="flex items-center gap-3 bg-pink-500/20 rounded-xl p-3"
                          >
                            <span className="text-gray-400 w-6">{index + 1}</span>
                            <div className="flex-1">
                              <p className="text-white">{song.name}</p>
                              <p className="text-gray-400 text-sm">{song.artist}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveSong(song.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 搜索结果 */}
                    <div>
                      <input
                        type="text"
                        placeholder="搜索歌曲..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 mb-4"
                      />
                      <div className="space-y-2">
                        {searchResults
                          .filter(s => !selectedSongs.find(ss => ss.id === s.id))
                          .map((song) => (
                            <button
                              key={song.id}
                              onClick={() => handleAddSong(song)}
                              className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 text-left"
                            >
                              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                🎵
                              </div>
                              <div className="flex-1">
                                <p className="text-white">{song.name}</p>
                                <p className="text-gray-400 text-sm">{song.artist}</p>
                              </div>
                              <span className="text-pink-400">+</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 步骤3: 写留言 & 选主题 */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">写一封信</h3>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          recipient === 'self'
                            ? '给未来的自己写几句话...'
                            : '给朋友写几句话...'
                        }
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">选择主题</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme)}
                            className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                              selectedTheme.id === theme.id
                                ? 'border-pink-500'
                                : 'border-transparent'
                            }`}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-sm">{theme.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 步骤4: 选择开启日期 */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white">何时开启?</h3>

                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_DATES.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() =>
                            setUnlockDate(new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000))
                          }
                          className={`p-4 rounded-xl transition-all ${
                            daysUntilUnlock === preset.days
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2">或选择具体日期</label>
                      <input
                        type="date"
                        value={unlockDate.toISOString().split('T')[0]}
                        onChange={(e) => setUnlockDate(new Date(e.target.value))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    {/* 预览 */}
                    <div className="bg-white/5 rounded-2xl p-6 mt-6">
                      <h4 className="text-white font-medium mb-4">胶囊预览</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">接收人</span>
                          <span className="text-white">
                            {recipient === 'self' ? '自己' : recipientEmail}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">歌曲数量</span>
                          <span className="text-white">{selectedSongs.length} 首</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">开启日期</span>
                          <span className="text-white">{formatDate(unlockDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">等待天数</span>
                          <span className="text-pink-400">{daysUntilUnlock} 天</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 底部 */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <button
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="px-6 py-3 rounded-full bg-white/10 text-white font-medium disabled:opacity-50"
              >
                上一步
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={
                    (step === 1 && recipient === 'friend' && !recipientEmail) ||
                    (step === 2 && selectedSongs.length === 0)
                  }
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium disabled:opacity-50"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium disabled:opacity-50"
                >
                  {isSending ? '封存中...' : '封存胶囊'}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TimeCapsuleCreator;
