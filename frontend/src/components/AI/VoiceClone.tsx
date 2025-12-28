import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceCloneProps {
  userId: string;
  onCloneComplete: (voiceModelId: string) => void;
}

interface VoiceModel {
  id: string;
  name: string;
  type: 'user' | 'celebrity' | 'ai_generated';
  status: 'training' | 'ready' | 'failed';
  quality: number;
  samples: number;
  createdAt: Date;
  previewUrl?: string;
}

const DEMO_MODELS: VoiceModel[] = [
  { id: '1', name: '我的声音', type: 'user', status: 'ready', quality: 92, samples: 10, createdAt: new Date() },
  { id: '2', name: 'AI歌手小美', type: 'ai_generated', status: 'ready', quality: 95, samples: 0, createdAt: new Date() },
];

export const VoiceClone: React.FC<VoiceCloneProps> = ({
  userId,
  onCloneComplete,
}) => {
  const [step, setStep] = useState<'intro' | 'record' | 'training' | 'complete'>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>(DEMO_MODELS);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [testText, setTestText] = useState('欢迎来到汽水音乐，让我用你的声音唱歌吧！');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recordingPrompts = [
    '请朗读：今天天气真好，阳光明媚。',
    '请朗读：音乐是我生命中最美好的陪伴。',
    '请朗读：每一个音符都在诉说着故事。',
    '请朗读：让我们一起感受音乐的魅力。',
    '请朗读：用心聆听，感受旋律的温度。',
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordings([...recordings, blob]);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordingTime(0);
  };

  const startTraining = async () => {
    setStep('training');
    setTrainingProgress(0);

    // 模拟训练进度
    const interval = setInterval(() => {
      setTrainingProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep('complete');
          const newModel: VoiceModel = {
            id: Date.now().toString(),
            name: '新声音模型',
            type: 'user',
            status: 'ready',
            quality: 90 + Math.floor(Math.random() * 10),
            samples: recordings.length,
            createdAt: new Date(),
          };
          setVoiceModels([...voiceModels, newModel]);
          onCloneComplete(newModel.id);
          return 100;
        }
        return p + 2;
      });
    }, 200);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎙️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI 声音克隆</h2>
            <p className="text-sm text-gray-400">用你的声音唱任何歌</p>
          </div>
        </div>
      </div>

      {/* 步骤指示 */}
      {step !== 'intro' && (
        <div className="flex items-center justify-center gap-4">
          {['record', 'training', 'complete'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s || ['training', 'complete'].indexOf(step) > ['training', 'complete'].indexOf(s)
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-16 h-1 rounded ${
                    ['training', 'complete'].indexOf(step) > i ? 'bg-violet-500' : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 介绍页 */}
      {step === 'intro' && (
        <div className="space-y-6">
          {/* 功能介绍 */}
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">用AI克隆你的声音</h3>
            <p className="text-gray-300 mb-6">
              只需录制几分钟的语音样本，AI就能学习你的声音特征，让你用自己的声音演唱任何歌曲！
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '🎤', title: '录制样本', desc: '5-10分钟' },
                { icon: '🧠', title: 'AI训练', desc: '约30分钟' },
                { icon: '🎵', title: '开始翻唱', desc: '无限可能' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 已有声音模型 */}
          {voiceModels.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-4">我的声音模型</h3>
              <div className="space-y-3">
                {voiceModels.map((model) => (
                  <motion.div
                    key={model.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedModel === model.id
                        ? 'bg-violet-500/20 ring-2 ring-violet-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-xl">
                          {model.type === 'user' ? '🎤' : model.type === 'celebrity' ? '⭐' : '🤖'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{model.name}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={model.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}>
                            {model.status === 'ready' ? '✓ 就绪' : '⏳ 训练中'}
                          </span>
                          <span className="text-gray-400">质量: {model.quality}%</span>
                        </div>
                      </div>
                      <button className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <span>▶️</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 开始按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('record')}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl text-white font-bold text-lg"
          >
            🎤 创建新声音模型
          </motion.button>
        </div>
      )}

      {/* 录音页 */}
      {step === 'record' && (
        <div className="space-y-6">
          {/* 录音提示 */}
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <p className="text-gray-400 mb-2">请朗读以下文字 ({recordings.length + 1}/5)</p>
            <p className="text-xl text-white font-medium">
              {recordingPrompts[recordings.length] || recordingPrompts[0]}
            </p>
          </div>

          {/* 录音可视化 */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              {/* 波形动画 */}
              {isRecording && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                      className="absolute inset-0 rounded-full border-2 border-red-500"
                    />
                  ))}
                </>
              )}

              {/* 录音按钮 */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-colors ${
                  isRecording ? 'bg-red-500' : 'bg-violet-500'
                }`}
              >
                <span className="text-4xl mb-2">{isRecording ? '⏹️' : '🎤'}</span>
                {isRecording ? (
                  <span className="text-white font-bold">{formatTime(recordingTime)}</span>
                ) : (
                  <span className="text-white text-sm">点击开始</span>
                )}
              </motion.button>
            </div>
          </div>

          {/* 录音列表 */}
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">已录制 {recordings.length}/5 段</p>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < recordings.length ? 'bg-violet-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 录音质量提示 */}
          <div className="bg-yellow-500/10 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-yellow-500 font-medium">录音提示</p>
              <p className="text-gray-400 text-sm">
                请在安静环境中录音，保持稳定的音量和清晰的发音。录音时长建议5-10秒。
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setRecordings([]);
                setStep('intro');
              }}
              className="flex-1 py-3 bg-white/10 rounded-xl text-white"
            >
              取消
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={recordings.length < 3}
              onClick={startTraining}
              className={`flex-1 py-3 rounded-xl font-medium ${
                recordings.length >= 3
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              开始训练 ({recordings.length}/3)
            </motion.button>
          </div>
        </div>
      )}

      {/* 训练中 */}
      {step === 'training' && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block text-6xl mb-4"
            >
              🧠
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">AI 正在学习你的声音</h3>
            <p className="text-gray-400">请耐心等待，这个过程大约需要30分钟</p>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">训练进度</span>
              <span className="text-white">{trainingProgress}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>

          {/* 训练阶段 */}
          <div className="space-y-3">
            {[
              { label: '分析音频特征', progress: trainingProgress > 20 ? 100 : trainingProgress * 5 },
              { label: '提取声纹数据', progress: trainingProgress > 40 ? 100 : Math.max(0, (trainingProgress - 20) * 5) },
              { label: '训练神经网络', progress: trainingProgress > 70 ? 100 : Math.max(0, (trainingProgress - 40) * 3.33) },
              { label: '优化合成质量', progress: Math.max(0, (trainingProgress - 70) * 3.33) },
            ].map((stage) => (
              <div key={stage.label} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10">
                  {stage.progress === 100 ? (
                    <span className="text-green-400">✓</span>
                  ) : stage.progress > 0 ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-violet-400"
                    >
                      ◐
                    </motion.span>
                  ) : (
                    <span className="text-gray-500">○</span>
                  )}
                </div>
                <span className={stage.progress > 0 ? 'text-white' : 'text-gray-500'}>{stage.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 完成 */}
      {step === 'complete' && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">声音模型创建成功！</h3>
            <p className="text-gray-400">现在你可以用自己的声音唱任何歌曲了</p>
          </div>

          {/* 测试区域 */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-4">
            <p className="text-white font-medium">试听效果</p>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-20 bg-white/10 rounded-xl p-3 text-white resize-none outline-none"
              placeholder="输入要合成的文字..."
            />
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-3 bg-violet-500 rounded-xl text-white flex items-center justify-center gap-2"
              >
                <span>{isPlaying ? '⏹️' : '▶️'}</span>
                {isPlaying ? '停止' : '试听'}
              </motion.button>
              <button className="px-4 py-3 bg-white/10 rounded-xl text-white">
                💾 保存
              </button>
            </div>
          </div>

          {/* 功能入口 */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl text-left"
            >
              <span className="text-3xl block mb-2">🎵</span>
              <p className="text-white font-medium">AI 翻唱</p>
              <p className="text-white/70 text-sm">用你的声音翻唱热门歌曲</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-left"
            >
              <span className="text-3xl block mb-2">🎤</span>
              <p className="text-white font-medium">文字转歌声</p>
              <p className="text-white/70 text-sm">输入歌词自动演唱</p>
            </motion.button>
          </div>

          <button
            onClick={() => setStep('intro')}
            className="w-full py-3 bg-white/10 rounded-xl text-white"
          >
            返回
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceClone;
