import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeatNote, GameSession, JudgmentCount, ScoreRank } from '../../types/gaming';

interface RhythmGameProps {
  songId: string;
  songName: string;
  artistName: string;
  audioUrl: string;
  beatMap: BeatNote[];
  onGameEnd: (session: GameSession) => void;
  onExit: () => void;
}

const LANE_KEYS = ['D', 'F', 'J', 'K'];
const LANE_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];

export const RhythmGame: React.FC<RhythmGameProps> = ({
  songId,
  songName,
  artistName,
  audioUrl,
  beatMap,
  onGameEnd,
  onExit,
}) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'ended'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [judgments, setJudgments] = useState<JudgmentCount>({
    perfect: 0,
    great: 0,
    good: 0,
    bad: 0,
    miss: 0,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [activeNotes, setActiveNotes] = useState<(BeatNote & { id: number })[]>([]);
  const [hitEffects, setHitEffects] = useState<{ id: number; lane: number; judgment: string }[]>([]);
  const [countdown, setCountdown] = useState(3);

  const audioRef = useRef<HTMLAudioElement>(null);
  const gameLoopRef = useRef<number>();
  const noteIdRef = useRef(0);

  // 开始游戏
  const startGame = useCallback(() => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          audioRef.current?.play();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime * 1000;
        setCurrentTime(time);

        // 添加即将到达的音符
        const upcomingNotes = beatMap.filter(
          note => note.time > time && note.time <= time + 2000
        );

        setActiveNotes(prev => {
          const existingIds = prev.map(n => n.time);
          const newNotes = upcomingNotes
            .filter(n => !existingIds.includes(n.time))
            .map(n => ({ ...n, id: noteIdRef.current++ }));
          return [...prev, ...newNotes];
        });

        // 移除已过期的音符（miss）
        setActiveNotes(prev => {
          const missed = prev.filter(n => n.time < time - 200);
          if (missed.length > 0) {
            setCombo(0);
            setJudgments(j => ({ ...j, miss: j.miss + missed.length }));
          }
          return prev.filter(n => n.time >= time - 200);
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, beatMap]);

  // 处理按键
  const handleKeyPress = useCallback((lane: number) => {
    if (gameState !== 'playing') return;

    const time = currentTime;
    const hitWindow = 150; // ms

    // 找到该轨道上最近的音符
    const targetNote = activeNotes.find(
      note => note.lane === lane && Math.abs(note.time - time) < hitWindow
    );

    if (targetNote) {
      const timeDiff = Math.abs(targetNote.time - time);
      let judgment: keyof JudgmentCount;
      let points: number;

      if (timeDiff < 30) {
        judgment = 'perfect';
        points = 1000;
      } else if (timeDiff < 60) {
        judgment = 'great';
        points = 800;
      } else if (timeDiff < 100) {
        judgment = 'good';
        points = 500;
      } else {
        judgment = 'bad';
        points = 200;
      }

      // 更新分数和连击
      const newCombo = combo + 1;
      const comboBonus = Math.floor(newCombo / 10) * 100;
      setScore(prev => prev + points + comboBonus);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setJudgments(prev => ({ ...prev, [judgment]: prev[judgment] + 1 }));

      // 移除已击中的音符
      setActiveNotes(prev => prev.filter(n => n.id !== targetNote.id));

      // 添加击中效果
      setHitEffects(prev => [
        ...prev,
        { id: Date.now(), lane, judgment: judgment.toUpperCase() },
      ]);
      setTimeout(() => {
        setHitEffects(prev => prev.slice(1));
      }, 500);
    }
  }, [gameState, currentTime, activeNotes, combo]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        handleKeyPress(laneIndex);
      }
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // 计算评级
  const calculateRank = (): ScoreRank => {
    const totalNotes = Object.values(judgments).reduce((a, b) => a + b, 0);
    if (totalNotes === 0) return 'F';
    const accuracy = (judgments.perfect + judgments.great * 0.8 + judgments.good * 0.5) / totalNotes;
    if (accuracy >= 0.98) return 'SSS';
    if (accuracy >= 0.95) return 'SS';
    if (accuracy >= 0.90) return 'S';
    if (accuracy >= 0.80) return 'A';
    if (accuracy >= 0.70) return 'B';
    if (accuracy >= 0.60) return 'C';
    if (accuracy >= 0.50) return 'D';
    return 'F';
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-black" />

      {/* 音频 */}
      <audio ref={audioRef} src={audioUrl} onEnded={() => setGameState('ended')} />

      {/* 游戏区域 */}
      <div className="relative h-full flex flex-col">
        {/* 头部信息 */}
        <div className="p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{songName}</h2>
            <p className="text-gray-400">{artistName}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-400 text-sm">分数</p>
              <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">连击</p>
              <p className="text-2xl font-bold text-yellow-400">{combo}x</p>
            </div>
          </div>
        </div>

        {/* 音符下落区域 */}
        <div className="flex-1 relative overflow-hidden">
          {/* 轨道 */}
          <div className="absolute inset-0 flex justify-center gap-2 px-4">
            {LANE_KEYS.map((key, lane) => (
              <div
                key={lane}
                className="w-20 h-full relative"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, ${LANE_COLORS[lane]}10 100%)`
                }}
              >
                {/* 下落的音符 */}
                {activeNotes
                  .filter(note => note.lane === lane)
                  .map(note => {
                    const progress = (currentTime - note.time + 2000) / 2000;
                    return (
                      <motion.div
                        key={note.id}
                        className="absolute left-0 right-0 h-6 rounded-lg"
                        style={{
                          top: `${progress * 100}%`,
                          backgroundColor: LANE_COLORS[lane],
                          boxShadow: `0 0 20px ${LANE_COLORS[lane]}`,
                        }}
                      />
                    );
                  })}

                {/* 击中效果 */}
                {hitEffects
                  .filter(e => e.lane === lane)
                  .map(effect => (
                    <motion.div
                      key={effect.id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      className="absolute bottom-20 left-0 right-0 text-center font-bold"
                      style={{ color: LANE_COLORS[lane] }}
                    >
                      {effect.judgment}
                    </motion.div>
                  ))}
              </div>
            ))}
          </div>

          {/* 判定线 */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4">
            {LANE_KEYS.map((key, lane) => (
              <motion.button
                key={lane}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleKeyPress(lane)}
                className="w-20 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  background: `linear-gradient(180deg, ${LANE_COLORS[lane]}, ${LANE_COLORS[lane]}80)`,
                  boxShadow: `0 0 30px ${LANE_COLORS[lane]}50`,
                }}
              >
                {key}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 判定统计 */}
        <div className="p-4 flex justify-center gap-6">
          <div className="text-center">
            <p className="text-cyan-400 font-bold">{judgments.perfect}</p>
            <p className="text-xs text-gray-400">PERFECT</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold">{judgments.great}</p>
            <p className="text-xs text-gray-400">GREAT</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 font-bold">{judgments.good}</p>
            <p className="text-xs text-gray-400">GOOD</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 font-bold">{judgments.bad}</p>
            <p className="text-xs text-gray-400">BAD</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-bold">{judgments.miss}</p>
            <p className="text-xs text-gray-400">MISS</p>
          </div>
        </div>
      </div>

      {/* 开始倒计时 */}
      <AnimatePresence>
        {gameState === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20"
          >
            <h2 className="text-4xl font-bold text-white mb-8">{songName}</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xl font-bold text-white"
            >
              开始游戏
            </motion.button>
            <button onClick={onExit} className="mt-4 text-gray-400 hover:text-white">
              返回
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 倒计时 */}
      <AnimatePresence>
        {countdown > 0 && gameState === 'ready' && (
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <span className="text-9xl font-bold text-white">{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 暂停菜单 */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20"
          >
            <h2 className="text-4xl font-bold text-white mb-8">暂停</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setGameState('playing')}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium"
              >
                继续游戏
              </button>
              <button
                onClick={onExit}
                className="px-8 py-3 bg-white/10 rounded-full text-white font-medium"
              >
                退出游戏
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 结算界面 */}
      <AnimatePresence>
        {gameState === 'ended' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-8xl font-bold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {calculateRank()}
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">{songName}</h2>
              <p className="text-gray-400 mb-8">{artistName}</p>

              <div className="text-5xl font-bold text-white mb-8">
                {score.toLocaleString()}
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div>
                  <p className="text-3xl font-bold text-yellow-400">{maxCombo}x</p>
                  <p className="text-gray-400">最大连击</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{judgments.perfect}</p>
                  <p className="text-gray-400">Perfect</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">
                    {Math.round(
                      ((judgments.perfect + judgments.great * 0.8 + judgments.good * 0.5) /
                        Object.values(judgments).reduce((a, b) => a + b, 1)) *
                        100
                    )}%
                  </p>
                  <p className="text-gray-400">准确率</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setScore(0);
                    setCombo(0);
                    setMaxCombo(0);
                    setJudgments({ perfect: 0, great: 0, good: 0, bad: 0, miss: 0 });
                    setGameState('ready');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium"
                >
                  再来一次
                </button>
                <button
                  onClick={onExit}
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
  );
};

export default RhythmGame;
