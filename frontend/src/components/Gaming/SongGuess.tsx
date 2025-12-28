import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuessChallenge, ChallengePlayer, GuessRound } from '../../types/gaming';

interface SongGuessProps {
  mode: 'solo' | 'pvp' | 'team';
  difficulty: 'easy' | 'normal' | 'hard';
  onGameEnd: (score: number, correctAnswers: number) => void;
  onExit: () => void;
}

// 模拟歌曲数据
const DEMO_SONGS = [
  { id: '1', name: '夜曲', artist: '周杰伦', audioClip: '/clips/nightsong.mp3' },
  { id: '2', name: '晴天', artist: '周杰伦', audioClip: '/clips/sunny.mp3' },
  { id: '3', name: '七里香', artist: '周杰伦', audioClip: '/clips/qilixiang.mp3' },
  { id: '4', name: '稻香', artist: '周杰伦', audioClip: '/clips/daoxiang.mp3' },
  { id: '5', name: '告白气球', artist: '周杰伦', audioClip: '/clips/balloon.mp3' },
];

export const SongGuess: React.FC<SongGuessProps> = ({
  mode,
  difficulty,
  onGameEnd,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'answering' | 'result' | 'ended'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentSong, setCurrentSong] = useState<typeof DEMO_SONGS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [clipDuration, setClipDuration] = useState(3); // 根据难度调整
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // 根据难度设置
  useEffect(() => {
    switch (difficulty) {
      case 'easy':
        setClipDuration(5);
        break;
      case 'normal':
        setClipDuration(3);
        break;
      case 'hard':
        setClipDuration(1);
        break;
    }
  }, [difficulty]);

  // 开始新回合
  const startRound = () => {
    const song = DEMO_SONGS[Math.floor(Math.random() * DEMO_SONGS.length)];
    setCurrentSong(song);

    // 生成选项
    const wrongOptions = DEMO_SONGS
      .filter(s => s.id !== song.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(s => s.name);

    const allOptions = [...wrongOptions, song.name].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setTimeLeft(15);
    setGameState('playing');

    // 播放音频片段
    if (audioRef.current) {
      audioRef.current.currentTime = Math.random() * 30; // 随机起始位置
      audioRef.current.play();
      setTimeout(() => {
        audioRef.current?.pause();
        setGameState('answering');
      }, clipDuration * 1000);
    }
  };

  // 倒计时
  useEffect(() => {
    if (gameState === 'answering' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'answering' && timeLeft === 0) {
      // 时间到，自动判断为错误
      handleAnswer(null);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  // 处理答案
  const handleAnswer = (answer: string | null) => {
    if (gameState !== 'answering') return;

    setSelectedAnswer(answer);
    const correct = answer === currentSong?.name;
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.floor(timeLeft * 10);
      const streakBonus = streak * 50;
      const hintPenalty = hintsUsed * 100;
      const roundScore = Math.max(0, 1000 + timeBonus + streakBonus - hintPenalty);

      setScore(prev => prev + roundScore);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setGameState('result');

    // 延迟进入下一回合
    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        setGameState('ended');
      } else {
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }, 2000);
  };

  // 使用提示
  const useHint = () => {
    if (hintsUsed >= 2 || showHint) return;
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  // 重播音频
  const replayAudio = () => {
    if (audioRef.current && gameState === 'answering') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setTimeout(() => {
        audioRef.current?.pause();
      }, clipDuration * 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 overflow-hidden">
      {/* 音频元素 */}
      <audio ref={audioRef} src={currentSong?.audioClip} />

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative h-full flex flex-col p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-white/60 text-sm">回合</p>
            <p className="text-2xl font-bold text-white">{currentRound + 1} / {totalRounds}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">分数</p>
            <p className="text-2xl font-bold text-yellow-400">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* 等待开始 */}
        <AnimatePresence>
          {gameState === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="text-6xl mb-6">🎵</div>
              <h2 className="text-3xl font-bold text-white mb-4">猜歌挑战</h2>
              <p className="text-white/60 mb-8">
                听音乐片段，猜出歌曲名称
              </p>
              <div className="flex gap-4 mb-8">
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-white/60 text-xs">难度</p>
                  <p className="text-white font-medium">
                    {difficulty === 'easy' && '简单'}
                    {difficulty === 'normal' && '普通'}
                    {difficulty === 'hard' && '困难'}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-white/60 text-xs">片段时长</p>
                  <p className="text-white font-medium">{clipDuration}秒</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-white/60 text-xs">回合数</p>
                  <p className="text-white font-medium">{totalRounds}回合</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRound}
                className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-xl font-bold text-white"
              >
                开始挑战
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 播放中 */}
        <AnimatePresence>
          {gameState === 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
                className="w-40 h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-8"
              >
                <span className="text-6xl">🎧</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-white">正在播放...</h3>
              <p className="text-white/60">仔细听！</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 回答阶段 */}
        <AnimatePresence>
          {(gameState === 'answering' || gameState === 'result') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* 倒计时 */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <motion.div
                  className={`text-4xl font-bold ${
                    timeLeft <= 5 ? 'text-red-400' : 'text-white'
                  }`}
                  animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {timeLeft}s
                </motion.div>
                <div className="flex-1 max-w-xs h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* 连击显示 */}
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center mb-4"
                >
                  <span className="text-yellow-400 font-bold">🔥 {streak} 连击!</span>
                </motion.div>
              )}

              {/* 功能按钮 */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={replayAudio}
                  disabled={gameState === 'result'}
                  className="px-4 py-2 bg-white/10 rounded-full text-white disabled:opacity-50"
                >
                  🔄 重播
                </button>
                <button
                  onClick={useHint}
                  disabled={gameState === 'result' || hintsUsed >= 2}
                  className="px-4 py-2 bg-white/10 rounded-full text-white disabled:opacity-50"
                >
                  💡 提示 ({2 - hintsUsed})
                </button>
              </div>

              {/* 提示 */}
              {showHint && currentSong && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">
                    提示: 歌手是 {currentSong.artist}
                  </span>
                </motion.div>
              )}

              {/* 选项 */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                {options.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    disabled={gameState === 'result'}
                    className={`p-6 rounded-2xl text-xl font-medium transition-all ${
                      gameState === 'result'
                        ? option === currentSong?.name
                          ? 'bg-green-500 text-white'
                          : selectedAnswer === option
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white/50'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              {/* 结果反馈 */}
              <AnimatePresence>
                {gameState === 'result' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mt-8"
                  >
                    {isCorrect ? (
                      <div className="text-6xl mb-4">🎉</div>
                    ) : (
                      <div className="text-6xl mb-4">😢</div>
                    )}
                    <p className="text-2xl font-bold text-white">
                      {isCorrect ? '回答正确!' : '回答错误'}
                    </p>
                    <p className="text-white/60">
                      正确答案: {currentSong?.name} - {currentSong?.artist}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 游戏结束 */}
        <AnimatePresence>
          {gameState === 'ended' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="text-center"
              >
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-4">挑战完成!</h2>

                <div className="text-5xl font-bold text-yellow-400 mb-8">
                  {score.toLocaleString()}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/10 rounded-2xl p-6">
                    <p className="text-4xl font-bold text-green-400">{correctAnswers}</p>
                    <p className="text-white/60">正确答案</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6">
                    <p className="text-4xl font-bold text-cyan-400">
                      {Math.round((correctAnswers / totalRounds) * 100)}%
                    </p>
                    <p className="text-white/60">正确率</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setCurrentRound(0);
                      setScore(0);
                      setStreak(0);
                      setCorrectAnswers(0);
                      setHintsUsed(0);
                      setGameState('waiting');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-medium"
                  >
                    再来一局
                  </button>
                  <button
                    onClick={() => onGameEnd(score, correctAnswers)}
                    className="px-8 py-3 bg-white/10 rounded-full text-white font-medium"
                  >
                    返回
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SongGuess;
