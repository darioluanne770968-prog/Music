import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARLyrics, ARLyricsStyle, ARAnimation } from '../../types/ar-vr';

interface ARLyricsProps {
  songId: string;
  songName: string;
  lyrics: LyricLine[];
  currentTime: number;
  enabled: boolean;
  onToggle: () => void;
}

interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

const DEMO_LYRICS: LyricLine[] = [
  { time: 0, text: '夜空中最亮的星', translation: 'The brightest star in the night sky' },
  { time: 3, text: '能否听清', translation: 'Can you hear me' },
  { time: 5, text: '那仰望的人', translation: 'The one who looks up' },
  { time: 8, text: '心底的孤独和叹息', translation: 'The loneliness and sighs in the heart' },
  { time: 12, text: '夜空中最亮的星', translation: 'The brightest star in the night sky' },
  { time: 16, text: '能否记起', translation: 'Can you remember' },
  { time: 18, text: '曾与我同行', translation: 'Once walked with me' },
  { time: 21, text: '消失在风里的身影', translation: 'The figure that disappeared in the wind' },
];

export const ARLyricsComponent: React.FC<ARLyricsProps> = ({
  songId,
  songName,
  lyrics = DEMO_LYRICS,
  currentTime,
  enabled,
  onToggle,
}) => {
  const [style, setStyle] = useState<'floating' | 'ground' | 'skywriting' | 'particle'>('floating');
  const [showTranslation, setShowTranslation] = useState(true);
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [fontSize, setFontSize] = useState(24);
  const [arMode, setArMode] = useState<'preview' | 'camera'>('preview');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLineIndex = lyrics.findIndex(
    (line, i) =>
      currentTime >= line.time &&
      (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
  );

  const currentLine = lyrics[currentLineIndex];
  const nextLine = lyrics[currentLineIndex + 1];

  const colorSchemes = {
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
    neon: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'],
    sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff'],
    ocean: ['#0077be', '#00a8cc', '#40e0d0', '#7fffd4'],
    fire: ['#ff4500', '#ff6347', '#ffd700', '#ff8c00'],
  };

  const stylePresets = [
    { id: 'floating', icon: '🌊', label: '漂浮' },
    { id: 'ground', icon: '🏔️', label: '地面' },
    { id: 'skywriting', icon: '✈️', label: '天书' },
    { id: 'particle', icon: '✨', label: '粒子' },
  ];

  // 绘制AR预览
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 模拟相机背景
      if (arMode === 'camera') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (!currentLine) return;

      const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
      const text = currentLine.text;

      // 根据样式绘制歌词
      switch (style) {
        case 'floating':
          drawFloatingLyrics(ctx, text, colors, canvas.width, canvas.height);
          break;
        case 'ground':
          drawGroundLyrics(ctx, text, colors, canvas.width, canvas.height);
          break;
        case 'skywriting':
          drawSkywritingLyrics(ctx, text, colors, canvas.width, canvas.height);
          break;
        case 'particle':
          drawParticleLyrics(ctx, text, colors, canvas.width, canvas.height);
          break;
      }
    };

    draw();
  }, [currentLine, style, colorScheme, arMode, fontSize]);

  const drawFloatingLyrics = (
    ctx: CanvasRenderingContext2D,
    text: string,
    colors: string[],
    width: number,
    height: number
  ) => {
    ctx.font = `bold ${fontSize}px "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 发光效果
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 20;

    // 渐变填充
    const gradient = ctx.createLinearGradient(0, height / 2 - 20, 0, height / 2 + 20);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;

    // 绘制文字
    const y = height / 2 + Math.sin(Date.now() / 500) * 10;
    ctx.fillText(text, width / 2, y);

    // 翻译
    if (showTranslation && currentLine?.translation) {
      ctx.font = `${fontSize * 0.6}px "PingFang SC", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 10;
      ctx.fillText(currentLine.translation, width / 2, y + 40);
    }
  };

  const drawGroundLyrics = (
    ctx: CanvasRenderingContext2D,
    text: string,
    colors: string[],
    width: number,
    height: number
  ) => {
    ctx.font = `bold ${fontSize}px "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';

    // 3D透视效果
    ctx.save();
    ctx.translate(width / 2, height * 0.8);
    ctx.scale(1, 0.5);
    ctx.rotate(-0.1);

    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 30;
    ctx.fillStyle = colors[0];
    ctx.fillText(text, 0, 0);

    ctx.restore();
  };

  const drawSkywritingLyrics = (
    ctx: CanvasRenderingContext2D,
    text: string,
    colors: string[],
    width: number,
    height: number
  ) => {
    ctx.font = `italic ${fontSize * 1.2}px "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';

    // 云雾效果
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'white';
    ctx.fillText(text, width / 2, height / 3);

    // 拖尾效果
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.3 / i;
      ctx.fillText(text, width / 2 + i * 2, height / 3 + i);
    }
    ctx.globalAlpha = 1;
  };

  const drawParticleLyrics = (
    ctx: CanvasRenderingContext2D,
    text: string,
    colors: string[],
    width: number,
    height: number
  ) => {
    ctx.font = `bold ${fontSize}px "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 绘制主文字
    ctx.fillStyle = colors[0];
    ctx.fillText(text, width / 2, height / 2);

    // 粒子效果
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      const size = 2 + Math.random() * 4;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AR 歌词</h2>
            <p className="text-sm text-gray-400">沉浸式歌词体验</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            enabled
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          {enabled ? '已开启' : '开启AR'}
        </motion.button>
      </div>

      {/* AR预览区域 */}
      <div className="relative bg-black rounded-2xl overflow-hidden">
        {/* 模式切换 */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button
            onClick={() => setArMode('preview')}
            className={`px-3 py-1 rounded-full text-sm ${
              arMode === 'preview' ? 'bg-white text-black' : 'bg-black/50 text-white'
            }`}
          >
            预览
          </button>
          <button
            onClick={() => setArMode('camera')}
            className={`px-3 py-1 rounded-full text-sm ${
              arMode === 'camera' ? 'bg-white text-black' : 'bg-black/50 text-white'
            }`}
          >
            📷 相机
          </button>
        </div>

        {/* Canvas 预览 */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-64 object-cover"
        />

        {/* 歌词进度 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            {lyrics.slice(Math.max(0, currentLineIndex - 1), currentLineIndex + 3).map((line, i) => (
              <motion.div
                key={line.time}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: i === 1 ? 1 : 0.5, y: 0 }}
                className={`px-3 py-1 rounded-full text-sm ${
                  i === 1 ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}
              >
                {line.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 样式选择 */}
      <div>
        <h3 className="text-white font-medium mb-4">AR 样式</h3>
        <div className="grid grid-cols-4 gap-4">
          {stylePresets.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStyle(preset.id as any)}
              className={`p-4 rounded-xl transition-all ${
                style === preset.id
                  ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="text-3xl block mb-2">{preset.icon}</span>
              <span className="text-sm">{preset.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 颜色方案 */}
      <div>
        <h3 className="text-white font-medium mb-4">颜色主题</h3>
        <div className="flex gap-3">
          {Object.entries(colorSchemes).map(([name, colors]) => (
            <button
              key={name}
              onClick={() => setColorScheme(name)}
              className={`relative w-12 h-12 rounded-xl overflow-hidden ${
                colorScheme === name ? 'ring-2 ring-white' : ''
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${colors.join(', ')})`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 设置 */}
      <div className="bg-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">显示翻译</p>
            <p className="text-gray-400 text-sm">在歌词下方显示翻译</p>
          </div>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`w-12 h-7 rounded-full transition-colors ${
              showTranslation ? 'bg-pink-500' : 'bg-white/10'
            }`}
          >
            <motion.div
              animate={{ x: showTranslation ? 20 : 2 }}
              className="w-5 h-5 bg-white rounded-full"
            />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">字体大小</p>
            <span className="text-gray-400">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none"
          />
        </div>
      </div>

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl p-4 flex items-start gap-4">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-white font-medium">如何使用</p>
          <p className="text-gray-400 text-sm">
            1. 打开手机相机或AR眼镜 2. 选择喜欢的歌词样式 3. 将设备对准空旷区域 4. 歌词将自动浮现在空间中
          </p>
        </div>
      </div>

      {/* 支持设备 */}
      <div className="text-center text-gray-500 text-sm">
        支持: iPhone (LiDAR) | Android AR | Apple Vision Pro | Meta Quest
      </div>
    </div>
  );
};

export default ARLyricsComponent;
