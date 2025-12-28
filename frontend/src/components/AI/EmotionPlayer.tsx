import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionType, DetectedEmotion } from '../../types/ai';

interface EmotionPlayerProps {
  onEmotionDetected?: (emotion: DetectedEmotion) => void;
  onPlaylistRecommended?: (playlistId: string) => void;
}

const EMOTIONS: { type: EmotionType; icon: string; color: string; playlist: string }[] = [
  { type: 'happy', icon: '😊', color: 'from-yellow-400 to-orange-500', playlist: '开心时刻' },
  { type: 'sad', icon: '😢', color: 'from-blue-400 to-indigo-500', playlist: '治愈心灵' },
  { type: 'energetic', icon: '⚡', color: 'from-red-400 to-pink-500', playlist: '活力满满' },
  { type: 'calm', icon: '🌊', color: 'from-cyan-400 to-teal-500', playlist: '平静时光' },
  { type: 'romantic', icon: '💕', color: 'from-pink-400 to-rose-500', playlist: '浪漫情歌' },
  { type: 'nostalgic', icon: '📷', color: 'from-amber-400 to-yellow-600', playlist: '怀旧金曲' },
  { type: 'anxious', icon: '😰', color: 'from-purple-400 to-violet-500', playlist: '舒缓焦虑' },
  { type: 'focused', icon: '🎯', color: 'from-green-400 to-emerald-500', playlist: '专注工作' },
];

export const EmotionPlayer: React.FC<EmotionPlayerProps> = ({
  onEmotionDetected,
  onPlaylistRecommended,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMode, setDetectionMode] = useState<'face' | 'voice' | 'manual'>('manual');
  const [currentEmotion, setCurrentEmotion] = useState<DetectedEmotion | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // 模拟情绪检测
  const detectEmotion = async (mode: 'face' | 'voice') => {
    setIsDetecting(true);

    // 模拟检测过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    const emotions = EMOTIONS;
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    const detected: DetectedEmotion = {
      primary: randomEmotion.type,
      intensity: 0.7 + Math.random() * 0.3,
      valence: Math.random() * 2 - 1,
      arousal: Math.random(),
    };

    setCurrentEmotion(detected);
    onEmotionDetected?.(detected);
    setIsDetecting(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleManualSelect = (emotionType: EmotionType) => {
    const emotion: DetectedEmotion = {
      primary: emotionType,
      intensity: 1,
      valence: 0,
      arousal: 0.5,
    };
    setCurrentEmotion(emotion);
    onEmotionDetected?.(emotion);
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const currentEmotionData = currentEmotion
    ? EMOTIONS.find(e => e.type === currentEmotion.primary)
    : null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎭</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">情绪识别播放</h2>
            <p className="text-sm text-gray-400">根据你的心情推荐音乐</p>
          </div>
        </div>
      </div>

      {/* 检测模式选择 */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => {
            setDetectionMode('face');
            startCamera();
          }}
          className={`p-4 rounded-2xl transition-all ${
            detectionMode === 'face'
              ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <span className="text-3xl block mb-2">📷</span>
          <span className="font-medium">面部识别</span>
          <p className="text-xs opacity-70 mt-1">通过表情分析</p>
        </button>
        <button
          onClick={() => {
            setDetectionMode('voice');
            setIsListening(true);
            detectEmotion('voice');
          }}
          className={`p-4 rounded-2xl transition-all ${
            detectionMode === 'voice'
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <span className="text-3xl block mb-2">🎙️</span>
          <span className="font-medium">语音识别</span>
          <p className="text-xs opacity-70 mt-1">通过声音分析</p>
        </button>
        <button
          onClick={() => setDetectionMode('manual')}
          className={`p-4 rounded-2xl transition-all ${
            detectionMode === 'manual'
              ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <span className="text-3xl block mb-2">👆</span>
          <span className="font-medium">手动选择</span>
          <p className="text-xs opacity-70 mt-1">选择当前心情</p>
        </button>
      </div>

      {/* 摄像头预览 */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {isDetecting ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-32 h-32 rounded-full border-4 border-pink-500 border-dashed"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-2 border-white/50" />
              )}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={() => detectEmotion('face')}
                disabled={isDetecting}
                className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium disabled:opacity-50"
              >
                {isDetecting ? '分析中...' : '开始检测'}
              </button>
              <button
                onClick={stopCamera}
                className="px-6 py-2 bg-white/20 text-white rounded-full font-medium"
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 语音检测动画 */}
      <AnimatePresence>
        {isListening && detectionMode === 'voice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/5 rounded-2xl p-8 flex flex-col items-center"
          >
            <div className="flex items-end gap-1 h-16">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [20, 40 + Math.random() * 40, 20],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                    delay: i * 0.05,
                  }}
                  className="w-2 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-gray-400 mt-4">正在聆听你的声音...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 手动选择情绪 */}
      {detectionMode === 'manual' && (
        <div className="grid grid-cols-4 gap-3">
          {EMOTIONS.map((emotion) => (
            <motion.button
              key={emotion.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleManualSelect(emotion.type)}
              className={`p-4 rounded-2xl transition-all ${
                currentEmotion?.primary === emotion.type
                  ? `bg-gradient-to-br ${emotion.color} text-white`
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-3xl block mb-2">{emotion.icon}</span>
              <span className="text-sm">
                {emotion.type === 'happy' && '开心'}
                {emotion.type === 'sad' && '难过'}
                {emotion.type === 'energetic' && '兴奋'}
                {emotion.type === 'calm' && '平静'}
                {emotion.type === 'romantic' && '浪漫'}
                {emotion.type === 'nostalgic' && '怀旧'}
                {emotion.type === 'anxious' && '焦虑'}
                {emotion.type === 'focused' && '专注'}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* 检测结果 */}
      <AnimatePresence>
        {currentEmotion && currentEmotionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-gradient-to-br ${currentEmotionData.color} rounded-2xl p-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{currentEmotionData.icon}</span>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  检测到你正在感到
                  {currentEmotionData.type === 'happy' && '开心'}
                  {currentEmotionData.type === 'sad' && '难过'}
                  {currentEmotionData.type === 'energetic' && '兴奋'}
                  {currentEmotionData.type === 'calm' && '平静'}
                  {currentEmotionData.type === 'romantic' && '浪漫'}
                  {currentEmotionData.type === 'nostalgic' && '怀旧'}
                  {currentEmotionData.type === 'anxious' && '焦虑'}
                  {currentEmotionData.type === 'focused' && '专注'}
                </h3>
                <p className="text-white/80">
                  置信度: {Math.round(currentEmotion.intensity * 100)}%
                </p>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">为你推荐歌单</p>
                  <h4 className="text-xl font-bold text-white">{currentEmotionData.playlist}</h4>
                </div>
                <button
                  onClick={() => onPlaylistRecommended?.('playlist-id')}
                  className="px-6 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-white/90 transition-colors"
                >
                  立即播放
                </button>
              </div>
            </div>

            {/* 情绪指标 */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/20 rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">情绪正负</p>
                <div className="flex items-center gap-2">
                  <span>😢</span>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{
                        width: `${(currentEmotion.valence + 1) * 50}%`,
                        marginLeft: currentEmotion.valence < 0 ? 'auto' : 0,
                      }}
                    />
                  </div>
                  <span>😊</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">能量水平</p>
                <div className="flex items-center gap-2">
                  <span>😴</span>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${currentEmotion.arousal * 100}%` }}
                    />
                  </div>
                  <span>⚡</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmotionPlayer;
