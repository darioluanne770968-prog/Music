import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 智能场景 - 场景识别/天气联动/位置感知/时间感知

interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  conditions: SceneCondition[];
  musicSettings: MusicSettings;
  isActive: boolean;
  autoActivate: boolean;
}

interface SceneCondition {
  type: 'time' | 'weather' | 'location' | 'activity' | 'calendar' | 'device' | 'ambient';
  operator: 'equals' | 'between' | 'contains' | 'greater' | 'less';
  value: any;
}

interface MusicSettings {
  genre?: string[];
  mood?: string[];
  tempo?: { min: number; max: number };
  energy?: 'low' | 'medium' | 'high';
  playlist?: string;
  volume?: number;
  crossfade?: number;
}

interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
  temperature: number;
  humidity: number;
  windSpeed: number;
}

interface LocationData {
  type: 'home' | 'work' | 'gym' | 'commute' | 'cafe' | 'outdoor' | 'unknown';
  latitude: number;
  longitude: number;
  name?: string;
}

interface AmbientData {
  noiseLevel: 'quiet' | 'moderate' | 'loud';
  lightLevel: 'dark' | 'dim' | 'bright';
  motion: boolean;
}

// 预设场景
const PRESET_SCENES: Omit<Scene, 'isActive'>[] = [
  {
    id: 'morning',
    name: '清晨唤醒',
    icon: '🌅',
    description: '轻柔的音乐开启美好的一天',
    conditions: [
      { type: 'time', operator: 'between', value: ['06:00', '09:00'] },
    ],
    musicSettings: {
      mood: ['peaceful', 'uplifting'],
      energy: 'medium',
      tempo: { min: 80, max: 120 },
      volume: 60,
    },
    autoActivate: true,
  },
  {
    id: 'focus',
    name: '专注工作',
    icon: '💻',
    description: '帮助集中注意力的背景音乐',
    conditions: [
      { type: 'time', operator: 'between', value: ['09:00', '18:00'] },
      { type: 'location', operator: 'equals', value: 'work' },
    ],
    musicSettings: {
      genre: ['ambient', 'classical', 'lo-fi'],
      energy: 'low',
      tempo: { min: 60, max: 90 },
      volume: 40,
    },
    autoActivate: true,
  },
  {
    id: 'workout',
    name: '运动健身',
    icon: '🏃',
    description: '高能量音乐激发运动热情',
    conditions: [
      { type: 'location', operator: 'equals', value: 'gym' },
      { type: 'activity', operator: 'equals', value: 'exercise' },
    ],
    musicSettings: {
      genre: ['electronic', 'hip-hop', 'rock'],
      energy: 'high',
      tempo: { min: 120, max: 180 },
      volume: 80,
    },
    autoActivate: true,
  },
  {
    id: 'commute',
    name: '通勤路上',
    icon: '🚗',
    description: '让通勤时光更愉快',
    conditions: [
      { type: 'activity', operator: 'equals', value: 'driving' },
    ],
    musicSettings: {
      mood: ['energetic', 'happy'],
      energy: 'medium',
      volume: 70,
    },
    autoActivate: true,
  },
  {
    id: 'rainy',
    name: '雨天心情',
    icon: '🌧️',
    description: '配合雨声的治愈音乐',
    conditions: [
      { type: 'weather', operator: 'equals', value: 'rainy' },
    ],
    musicSettings: {
      mood: ['melancholic', 'peaceful'],
      genre: ['jazz', 'acoustic', 'ambient'],
      energy: 'low',
      volume: 50,
    },
    autoActivate: true,
  },
  {
    id: 'sleep',
    name: '睡前放松',
    icon: '🌙',
    description: '帮助入睡的舒缓音乐',
    conditions: [
      { type: 'time', operator: 'between', value: ['22:00', '06:00'] },
      { type: 'ambient', operator: 'equals', value: { lightLevel: 'dark' } },
    ],
    musicSettings: {
      genre: ['ambient', 'classical'],
      mood: ['peaceful', 'dreamy'],
      energy: 'low',
      tempo: { min: 40, max: 70 },
      volume: 30,
      crossfade: 10,
    },
    autoActivate: true,
  },
  {
    id: 'party',
    name: '派对时刻',
    icon: '🎉',
    description: '热闹的派对氛围',
    conditions: [
      { type: 'calendar', operator: 'contains', value: ['party', '聚会'] },
      { type: 'ambient', operator: 'equals', value: { noiseLevel: 'loud' } },
    ],
    musicSettings: {
      genre: ['pop', 'electronic', 'dance'],
      energy: 'high',
      tempo: { min: 110, max: 140 },
      volume: 90,
    },
    autoActivate: false,
  },
  {
    id: 'romantic',
    name: '浪漫时刻',
    icon: '💕',
    description: '浪漫的约会音乐',
    conditions: [
      { type: 'ambient', operator: 'equals', value: { lightLevel: 'dim' } },
    ],
    musicSettings: {
      mood: ['romantic', 'peaceful'],
      genre: ['jazz', 'r&b', 'soul'],
      energy: 'low',
      volume: 45,
    },
    autoActivate: false,
  },
];

export const useSmartScene = () => {
  const [scenes, setScenes] = useState<Scene[]>(
    PRESET_SCENES.map(s => ({ ...s, isActive: false }))
  );
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    condition: 'sunny',
    temperature: 22,
    humidity: 60,
    windSpeed: 10,
  });
  const [currentLocation, setCurrentLocation] = useState<LocationData>({
    type: 'home',
    latitude: 39.9042,
    longitude: 116.4074,
  });
  const [ambientData, setAmbientData] = useState<AmbientData>({
    noiseLevel: 'quiet',
    lightLevel: 'bright',
    motion: false,
  });
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // 检查场景条件
  const checkConditions = useCallback((conditions: SceneCondition[]): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          if (condition.operator === 'between') {
            const [start, end] = condition.value;
            if (start <= end) {
              return currentTime >= start && currentTime <= end;
            } else {
              return currentTime >= start || currentTime <= end;
            }
          }
          return false;

        case 'weather':
          return currentWeather.condition === condition.value;

        case 'location':
          return currentLocation.type === condition.value;

        case 'ambient':
          const ambientValue = condition.value;
          return Object.entries(ambientValue).every(([key, val]) =>
            ambientData[key as keyof AmbientData] === val
          );

        default:
          return true;
      }
    });
  }, [currentWeather, currentLocation, ambientData]);

  // 自动检测并激活场景
  useEffect(() => {
    if (!isAutoMode) return;

    const matchedScene = scenes.find(scene =>
      scene.autoActivate && checkConditions(scene.conditions)
    );

    if (matchedScene && matchedScene.id !== activeSceneId) {
      setActiveSceneId(matchedScene.id);
      setScenes(prev => prev.map(s => ({
        ...s,
        isActive: s.id === matchedScene.id,
      })));
    }
  }, [scenes, checkConditions, isAutoMode, activeSceneId]);

  // 模拟获取天气数据
  const fetchWeather = useCallback(async () => {
    // 模拟API调用
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    setCurrentWeather({
      condition: randomCondition,
      temperature: Math.floor(Math.random() * 30) + 5,
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 30),
    });
  }, []);

  // 模拟获取位置
  const detectLocation = useCallback(async () => {
    const locations: LocationData['type'][] = ['home', 'work', 'gym', 'commute', 'cafe', 'outdoor'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    setCurrentLocation(prev => ({
      ...prev,
      type: randomLocation,
    }));
  }, []);

  // 手动激活场景
  const activateScene = useCallback((sceneId: string) => {
    setActiveSceneId(sceneId);
    setScenes(prev => prev.map(s => ({
      ...s,
      isActive: s.id === sceneId,
    })));
  }, []);

  // 停用当前场景
  const deactivateScene = useCallback(() => {
    setActiveSceneId(null);
    setScenes(prev => prev.map(s => ({
      ...s,
      isActive: false,
    })));
  }, []);

  // 创建自定义场景
  const createCustomScene = useCallback((scene: Omit<Scene, 'id' | 'isActive'>) => {
    const newScene: Scene = {
      ...scene,
      id: `custom-${Date.now()}`,
      isActive: false,
    };
    setScenes(prev => [...prev, newScene]);
    return newScene.id;
  }, []);

  // 更新场景设置
  const updateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s =>
      s.id === sceneId ? { ...s, ...updates } : s
    ));
  }, []);

  // 删除场景
  const deleteScene = useCallback((sceneId: string) => {
    setScenes(prev => prev.filter(s => s.id !== sceneId));
    if (activeSceneId === sceneId) {
      setActiveSceneId(null);
    }
  }, [activeSceneId]);

  return {
    scenes,
    currentWeather,
    currentLocation,
    ambientData,
    activeSceneId,
    isAutoMode,
    setIsAutoMode,
    fetchWeather,
    detectLocation,
    setAmbientData,
    activateScene,
    deactivateScene,
    createCustomScene,
    updateScene,
    deleteScene,
    checkConditions,
  };
};

// 场景卡片组件
const SceneCard: React.FC<{
  scene: Scene;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}> = ({ scene, isActive, onActivate, onEdit, onDelete }) => {
  return (
    <motion.div
      className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
        isActive
          ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400'
          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
      }`}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onActivate}
    >
      {isActive && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{scene.icon}</span>
        <div className="flex gap-2">
          <motion.button
            className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            ⚙️
          </motion.button>
          {onDelete && (
            <motion.button
              className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-red-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              🗑️
            </motion.button>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{scene.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{scene.description}</p>

      {/* 条件标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scene.conditions.map((condition, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-gray-300"
          >
            {condition.type === 'time' && `⏰ ${condition.value.join(' - ')}`}
            {condition.type === 'weather' && `🌤️ ${condition.value}`}
            {condition.type === 'location' && `📍 ${condition.value}`}
            {condition.type === 'activity' && `🏃 ${condition.value}`}
            {condition.type === 'ambient' && `🔊 环境感知`}
          </span>
        ))}
      </div>

      {/* 音乐设置预览 */}
      <div className="space-y-2 text-sm">
        {scene.musicSettings.genre && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">风格:</span>
            <span className="text-cyan-400">{scene.musicSettings.genre.join(', ')}</span>
          </div>
        )}
        {scene.musicSettings.energy && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">能量:</span>
            <span className={`${
              scene.musicSettings.energy === 'high' ? 'text-red-400' :
              scene.musicSettings.energy === 'medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {scene.musicSettings.energy === 'high' ? '高' :
               scene.musicSettings.energy === 'medium' ? '中' : '低'}
            </span>
          </div>
        )}
        {scene.musicSettings.volume && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">音量:</span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${scene.musicSettings.volume}%` }}
              />
            </div>
            <span className="text-gray-400">{scene.musicSettings.volume}%</span>
          </div>
        )}
      </div>

      {/* 自动激活状态 */}
      {scene.autoActivate && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          自动激活
        </div>
      )}
    </motion.div>
  );
};

// 环境状态显示
const EnvironmentStatus: React.FC<{
  weather: WeatherData;
  location: LocationData;
  ambient: AmbientData;
  onRefreshWeather: () => void;
  onRefreshLocation: () => void;
}> = ({ weather, location, ambient, onRefreshWeather, onRefreshLocation }) => {
  const weatherIcons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️',
    foggy: '🌫️',
  };

  const locationIcons: Record<string, string> = {
    home: '🏠',
    work: '💼',
    gym: '🏋️',
    commute: '🚗',
    cafe: '☕',
    outdoor: '🌳',
    unknown: '📍',
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-2xl">
      {/* 天气 */}
      <motion.div
        className="p-4 bg-slate-700/50 rounded-xl cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={onRefreshWeather}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">天气</span>
          <span className="text-3xl">{weatherIcons[weather.condition]}</span>
        </div>
        <div className="text-2xl font-bold text-white">{weather.temperature}°C</div>
        <div className="text-sm text-gray-400">
          湿度 {weather.humidity}% · 风速 {weather.windSpeed}km/h
        </div>
      </motion.div>

      {/* 位置 */}
      <motion.div
        className="p-4 bg-slate-700/50 rounded-xl cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={onRefreshLocation}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">位置</span>
          <span className="text-3xl">{locationIcons[location.type]}</span>
        </div>
        <div className="text-xl font-bold text-white capitalize">
          {location.type === 'home' ? '家' :
           location.type === 'work' ? '公司' :
           location.type === 'gym' ? '健身房' :
           location.type === 'commute' ? '通勤中' :
           location.type === 'cafe' ? '咖啡厅' :
           location.type === 'outdoor' ? '户外' : '未知'}
        </div>
        <div className="text-sm text-gray-400">
          {location.name || '正在定位...'}
        </div>
      </motion.div>

      {/* 环境 */}
      <div className="p-4 bg-slate-700/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">环境</span>
          <span className="text-3xl">
            {ambient.lightLevel === 'dark' ? '🌙' :
             ambient.lightLevel === 'dim' ? '🌆' : '☀️'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">噪音</span>
            <span className={`text-sm font-medium ${
              ambient.noiseLevel === 'quiet' ? 'text-green-400' :
              ambient.noiseLevel === 'moderate' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {ambient.noiseLevel === 'quiet' ? '安静' :
               ambient.noiseLevel === 'moderate' ? '适中' : '嘈杂'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">光线</span>
            <span className="text-sm font-medium text-white">
              {ambient.lightLevel === 'dark' ? '黑暗' :
               ambient.lightLevel === 'dim' ? '昏暗' : '明亮'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 场景编辑器
const SceneEditor: React.FC<{
  scene?: Scene;
  onSave: (scene: Omit<Scene, 'id' | 'isActive'>) => void;
  onCancel: () => void;
}> = ({ scene, onSave, onCancel }) => {
  const [name, setName] = useState(scene?.name || '');
  const [icon, setIcon] = useState(scene?.icon || '🎵');
  const [description, setDescription] = useState(scene?.description || '');
  const [autoActivate, setAutoActivate] = useState(scene?.autoActivate ?? true);
  const [conditions, setConditions] = useState<SceneCondition[]>(scene?.conditions || []);
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(scene?.musicSettings || {});

  const icons = ['🌅', '💻', '🏃', '🚗', '🌧️', '🌙', '🎉', '💕', '📚', '🎮', '🍳', '🎨', '🧘', '🎄'];

  const handleSave = () => {
    onSave({
      name,
      icon,
      description,
      autoActivate,
      conditions,
      musicSettings,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {scene ? '编辑场景' : '创建场景'}
        </h2>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">场景名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white"
                placeholder="输入场景名称"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">图标</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(i => (
                  <button
                    key={i}
                    className={`w-10 h-10 rounded-lg text-xl ${
                      icon === i ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    onClick={() => setIcon(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white"
              rows={2}
              placeholder="输入场景描述"
            />
          </div>

          {/* 触发条件 */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">触发条件</label>
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                  <select
                    value={condition.type}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index].type = e.target.value as any;
                      setConditions(newConditions);
                    }}
                    className="px-3 py-1 bg-slate-600 rounded text-white"
                  >
                    <option value="time">时间</option>
                    <option value="weather">天气</option>
                    <option value="location">位置</option>
                    <option value="activity">活动</option>
                  </select>
                  <input
                    type="text"
                    value={typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value)}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index].value = e.target.value;
                      setConditions(newConditions);
                    }}
                    className="flex-1 px-3 py-1 bg-slate-600 rounded text-white"
                  />
                  <button
                    className="p-1 text-red-400 hover:text-red-300"
                    onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-gray-400 hover:border-cyan-500 hover:text-cyan-500"
                onClick={() => setConditions([...conditions, { type: 'time', operator: 'between', value: ['09:00', '18:00'] }])}
              >
                + 添加条件
              </button>
            </div>
          </div>

          {/* 音乐设置 */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">音乐设置</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1">能量等级</label>
                <select
                  value={musicSettings.energy || ''}
                  onChange={(e) => setMusicSettings({ ...musicSettings, energy: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
                >
                  <option value="">自动</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1">音量</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicSettings.volume || 50}
                  onChange={(e) => setMusicSettings({ ...musicSettings, volume: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* 自动激活 */}
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <div className="text-white font-medium">自动激活</div>
              <div className="text-gray-400 text-sm">满足条件时自动切换到此场景</div>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                autoActivate ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
              onClick={() => setAutoActivate(!autoActivate)}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full"
                animate={{ x: autoActivate ? 26 : 2 }}
              />
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-8">
          <button
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 主组件
export const SmartScene: React.FC = () => {
  const {
    scenes,
    currentWeather,
    currentLocation,
    ambientData,
    activeSceneId,
    isAutoMode,
    setIsAutoMode,
    fetchWeather,
    detectLocation,
    activateScene,
    deactivateScene,
    createCustomScene,
    deleteScene,
  } = useSmartScene();

  const [showEditor, setShowEditor] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const handleCreateScene = (scene: Omit<Scene, 'id' | 'isActive'>) => {
    createCustomScene(scene);
    setShowEditor(false);
    setEditingScene(null);
  };

  const activeScene = scenes.find(s => s.id === activeSceneId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 标题和控制 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">智能场景</h1>
            <p className="text-gray-400">根据时间、天气、位置自动调整音乐</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 自动模式开关 */}
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              <span className="text-gray-400">自动模式</span>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  isAutoMode ? 'bg-cyan-500' : 'bg-slate-600'
                }`}
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full"
                  animate={{ x: isAutoMode ? 26 : 2 }}
                />
              </button>
            </div>

            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingScene(null);
                setShowEditor(true);
              }}
            >
              + 创建场景
            </motion.button>
          </div>
        </div>

        {/* 当前活动场景 */}
        {activeScene && (
          <motion.div
            className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{activeScene.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{activeScene.name}</h2>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      活动中
                    </span>
                  </div>
                  <p className="text-gray-400">{activeScene.description}</p>
                </div>
              </div>

              <motion.button
                className="px-4 py-2 bg-slate-700 rounded-xl text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deactivateScene}
              >
                停用场景
              </motion.button>
            </div>

            {/* 当前音乐设置 */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              {activeScene.musicSettings.genre && (
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">风格</div>
                  <div className="text-white font-medium">
                    {activeScene.musicSettings.genre.join(', ')}
                  </div>
                </div>
              )}
              {activeScene.musicSettings.mood && (
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">氛围</div>
                  <div className="text-white font-medium">
                    {activeScene.musicSettings.mood.join(', ')}
                  </div>
                </div>
              )}
              {activeScene.musicSettings.tempo && (
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">节奏</div>
                  <div className="text-white font-medium">
                    {activeScene.musicSettings.tempo.min}-{activeScene.musicSettings.tempo.max} BPM
                  </div>
                </div>
              )}
              {activeScene.musicSettings.volume && (
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">音量</div>
                  <div className="text-white font-medium">
                    {activeScene.musicSettings.volume}%
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 环境状态 */}
        <EnvironmentStatus
          weather={currentWeather}
          location={currentLocation}
          ambient={ambientData}
          onRefreshWeather={fetchWeather}
          onRefreshLocation={detectLocation}
        />

        {/* 场景列表 */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">所有场景</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map(scene => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isActive={scene.id === activeSceneId}
                onActivate={() => activateScene(scene.id)}
                onEdit={() => {
                  setEditingScene(scene);
                  setShowEditor(true);
                }}
                onDelete={scene.id.startsWith('custom-') ? () => deleteScene(scene.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* 场景编辑器 */}
        <AnimatePresence>
          {showEditor && (
            <SceneEditor
              scene={editingScene || undefined}
              onSave={handleCreateScene}
              onCancel={() => {
                setShowEditor(false);
                setEditingScene(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartScene;
