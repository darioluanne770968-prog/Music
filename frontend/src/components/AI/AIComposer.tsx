import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicStyle, MusicMood, AIComposition } from '../../types/ai';

interface AIComposerProps {
  onCompose: (composition: Partial<AIComposition>) => Promise<void>;
  onClose: () => void;
}

const MUSIC_STYLES: { value: MusicStyle; label: string; icon: string }[] = [
  { value: 'pop', label: '流行', icon: '🎵' },
  { value: 'rock', label: '摇滚', icon: '🎸' },
  { value: 'jazz', label: '爵士', icon: '🎷' },
  { value: 'classical', label: '古典', icon: '🎻' },
  { value: 'electronic', label: '电子', icon: '🎹' },
  { value: 'hiphop', label: '嘻哈', icon: '🎤' },
  { value: 'rnb', label: 'R&B', icon: '💜' },
  { value: 'chinese_pop', label: '华语流行', icon: '🇨🇳' },
  { value: 'chinese_folk', label: '民谣', icon: '🪕' },
  { value: 'ancient_style', label: '古风', icon: '🏯' },
];

const MUSIC_MOODS: { value: MusicMood; label: string; icon: string }[] = [
  { value: 'happy', label: '开心', icon: '😊' },
  { value: 'sad', label: '忧伤', icon: '😢' },
  { value: 'energetic', label: '活力', icon: '⚡' },
  { value: 'calm', label: '平静', icon: '🌊' },
  { value: 'romantic', label: '浪漫', icon: '💕' },
  { value: 'nostalgic', label: '怀旧', icon: '📷' },
  { value: 'hopeful', label: '希望', icon: '🌅' },
  { value: 'melancholic', label: '忧郁', icon: '🌧️' },
];

export const AIComposer: React.FC<AIComposerProps> = ({ onCompose, onClose }) => {
  const [step, setStep] = useState(1);
  const [inputType, setInputType] = useState<'humming' | 'lyrics' | 'style'>('style');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('pop');
  const [selectedMood, setSelectedMood] = useState<MusicMood>('happy');
  const [tempo, setTempo] = useState(120);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // 模拟生成进度
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      await onCompose({
        title,
        inputType,
        style: selectedStyle,
        mood: selectedMood,
        tempo,
        inputData: inputType === 'lyrics' ? lyrics : '',
      });
      setGenerationProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

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
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI 作曲助手</h2>
                <p className="text-sm text-gray-400">让 AI 为你创作专属音乐</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">选择创作方式</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { type: 'humming', icon: '🎙️', label: '哼唱旋律', desc: '哼唱你的创意' },
                    { type: 'lyrics', icon: '📝', label: '输入歌词', desc: '根据歌词作曲' },
                    { type: 'style', icon: '🎨', label: '选择风格', desc: '描述你想要的风格' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setInputType(item.type as any)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        inputType === item.type
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{item.icon}</span>
                      <span className="text-white font-medium block">{item.label}</span>
                      <span className="text-xs text-gray-400">{item.desc}</span>
                    </button>
                  ))}
                </div>

                {inputType === 'humming' && (
                  <div className="mt-6 text-center">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
                        isRecording
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}
                    >
                      {isRecording ? '⏹️' : '🎙️'}
                    </motion.button>
                    <p className="mt-4 text-gray-400">
                      {isRecording ? '正在录音... 点击停止' : recordedAudio ? '已录制完成' : '点击开始录音'}
                    </p>
                  </div>
                )}

                {inputType === 'lyrics' && (
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="在这里输入你的歌词..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
                  />
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">选择音乐风格</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {MUSIC_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setSelectedStyle(style.value)}
                        className={`p-3 rounded-xl transition-all ${
                          selectedStyle === style.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="text-xl block">{style.icon}</span>
                        <span className="text-xs">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">选择情绪氛围</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {MUSIC_MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-3 rounded-xl transition-all ${
                          selectedMood === mood.value
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="text-xl block">{mood.icon}</span>
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    节奏速度: {tempo} BPM
                  </h3>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>慢速 60</span>
                    <span>中速 120</span>
                    <span>快速 180</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">为你的作品命名</h3>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入歌曲名称..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-white/5 rounded-2xl p-6">
                  <h4 className="text-white font-medium mb-4">创作预览</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">风格</span>
                      <span className="text-white">
                        {MUSIC_STYLES.find(s => s.value === selectedStyle)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">情绪</span>
                      <span className="text-white">
                        {MUSIC_MOODS.find(m => m.value === selectedMood)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">节奏</span>
                      <span className="text-white">{tempo} BPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">输入方式</span>
                      <span className="text-white">
                        {inputType === 'humming' ? '哼唱' : inputType === 'lyrics' ? '歌词' : '风格'}
                      </span>
                    </div>
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-gray-400">
                      AI 正在创作中... {Math.round(generationProgress)}%
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="px-6 py-3 rounded-full bg-white/10 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            上一步
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !title}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isGenerating ? '生成中...' : '开始创作'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIComposer;
