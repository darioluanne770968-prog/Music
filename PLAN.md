# 汽水音乐复刻版 - 完整开发规划 (增强版)

## 项目概述

复刻"汽水音乐"的全部功能，并加入更多创新高级功能，打造一个功能完备的音乐流媒体应用。

---

## 一、技术栈选择

### 前端（Web + 移动端）
| 层级 | 技术 | 说明 |
|------|------|------|
| Web前端 | React 18 + TypeScript | 主流框架，生态丰富 |
| 移动端 | React Native | 跨平台，复用Web逻辑 |
| 状态管理 | Zustand | 轻量级状态管理 |
| UI组件 | TailwindCSS + Headless UI | 高度可定制 |
| 音频播放 | Howler.js / Web Audio API | 专业音频处理 |
| 路由 | React Router v6 | 单页应用路由 |
| 动画 | Framer Motion | 流畅动画效果 |
| 图表 | Chart.js / D3.js | 数据可视化 |

### 后端
| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Node.js + Express/Fastify | 高性能API服务 |
| 数据库 | PostgreSQL | 关系型数据存储 |
| 缓存 | Redis | 热点数据缓存 |
| 搜索 | Elasticsearch | 全文搜索引擎 |
| 存储 | MinIO/S3 | 音频文件存储 |
| 队列 | Bull/BullMQ | 任务队列处理 |
| AI服务 | TensorFlow.js | 推荐算法/音频分析 |

### 基础设施
| 层级 | 技术 | 说明 |
|------|------|------|
| 容器化 | Docker + Docker Compose | 本地开发环境 |
| API文档 | Swagger/OpenAPI | 接口文档 |
| 实时通信 | Socket.io | 弹幕/评论实时推送 |
| CDN | 自建/云服务 | 音频文件加速 |

---

## 二、核心功能模块（50+功能点）

### 1. 音乐播放器（核心）⭐
- [ ] 基础播放控制（播放/暂停/上一首/下一首）
- [ ] 进度条拖拽与精确定位
- [ ] 音量控制与静音
- [ ] 播放模式（顺序/随机/单曲循环/列表循环/心动模式）
- [ ] 播放队列管理（拖拽排序）
- [ ] 后台播放与锁屏控制
- [ ] 多频段均衡器（10频段）
- [ ] 倍速播放（0.5x-2.0x）
- [ ] 定时关闭（时间/歌曲数）
- [ ] 淡入淡出效果
- [ ] 无缝切歌（Gapless Playback）
- [ ] 跨设备同步播放进度
- [ ] AB循环（片段循环练习）
- [ ] 音频增强（低音增强/人声突出）

### 2. 歌词系统 🎤
- [ ] LRC格式歌词解析
- [ ] 逐字歌词同步（卡拉OK效果）
- [ ] 双语歌词（原文+翻译）
- [ ] 罗马音/拼音歌词
- [ ] 歌词海报生成（多模板）
- [ ] 歌词字体/颜色/大小自定义
- [ ] 歌词背景模糊效果
- [ ] 歌词贡献/纠错
- [ ] 桌面歌词（悬浮窗）
- [ ] 歌词分享到社交平台

### 3. 首页与推荐 🏠
- [ ] 个性化推荐算法
- [ ] 每日30首推荐
- [ ] 热门歌曲排行榜（多榜单）
- [ ] 新歌速递
- [ ] 分类浏览（流派/心情/场景/年代）
- [ ] Banner轮播广告
- [ ] 个性化音乐雷达
- [ ] 相似歌曲推荐
- [ ] "猜你喜欢"模块
- [ ] 朋友在听
- [ ] 同城热播
- [ ] 私人FM电台

### 4. 搜索功能 🔍
- [ ] 综合搜索（歌曲/歌手/专辑/歌单/用户/歌词）
- [ ] 热门搜索词云
- [ ] 搜索历史（可清除）
- [ ] 搜索建议（自动补全）
- [ ] 语音搜索
- [ ] 听歌识曲（Shazam式）
- [ ] 哼唱识曲
- [ ] 图片识曲（识别专辑封面）
- [ ] 高级筛选（时长/年代/语言）
- [ ] 搜索结果排序

### 5. 歌单系统 📋
- [ ] 创建/编辑/删除歌单
- [ ] 歌单封面自定义（上传/AI生成）
- [ ] 收藏其他用户歌单
- [ ] 歌单分享（链接/二维码）
- [ ] 智能歌单（根据心情/场景/天气自动生成）
- [ ] 歌单排序（多种方式）
- [ ] 批量管理歌曲
- [ ] 歌单标签系统
- [ ] 协作歌单（多人编辑）
- [ ] 歌单动态封面
- [ ] 歌单评分系统

### 6. 用户系统 👤
- [ ] 手机号/邮箱注册登录
- [ ] 第三方登录（微信/QQ/微博/Apple）
- [ ] 个人主页定制
- [ ] 关注/粉丝系统
- [ ] 听歌记录/年度报告
- [ ] 个人收藏管理
- [ ] 会员系统（多等级）
- [ ] 用户等级与成就系统
- [ ] 个性签名与状态
- [ ] 隐私设置
- [ ] 账号安全（双因素认证）
- [ ] 多设备管理

### 7. 社交功能 💬
- [ ] 歌曲评论（支持图片/表情）
- [ ] 评论点赞/回复/举报
- [ ] 热门评论/最新评论
- [ ] 神评论精选
- [ ] 动态/朋友圈发布
- [ ] 私信系统
- [ ] 分享到社交平台
- [ ] @提及功能
- [ ] 音乐话题讨论
- [ ] 乐评人认证
- [ ] 音乐圈子/社群

### 8. MV/视频 📹
- [ ] MV高清播放（多清晰度）
- [ ] 视频弹幕系统
- [ ] MV推荐列表
- [ ] 画质选择（360p-4K）
- [ ] 小窗播放
- [ ] 视频截图/GIF生成
- [ ] MV收藏列表
- [ ] 演唱会/现场视频
- [ ] 音乐纪录片
- [ ] 竖屏MV（短视频式）

### 9. 下载与缓存 💾
- [ ] 歌曲下载（多音质）
- [ ] 批量下载
- [ ] 离线播放模式
- [ ] 智能缓存管理
- [ ] 音质选择（标准128k/HQ320k/无损FLAC/Hi-Res）
- [ ] 下载任务管理
- [ ] WiFi自动下载
- [ ] 存储空间分析
- [ ] 歌词/封面同步下载

### 10. 电台/播客 📻
- [ ] 个人FM电台
- [ ] 主题电台（助眠/运动/学习）
- [ ] DJ电台节目
- [ ] 播客订阅
- [ ] 播客专辑
- [ ] 定时播放
- [ ] 有声书专区
- [ ] ASMR专区
- [ ] 白噪音/自然声

---

## 三、高级创新功能（30+功能点）⚡

### 11. AI智能功能 🤖
- [ ] AI音乐推荐（深度学习）
- [ ] AI歌词生成
- [ ] AI作曲/编曲辅助
- [ ] 智能歌单生成（根据文字描述）
- [ ] AI音乐风格转换
- [ ] 智能音质增强
- [ ] AI语音助手（语音控制）
- [ ] 情感分析推荐
- [ ] AI封面生成
- [ ] 智能音乐剪辑

### 12. 音频可视化 🎨
- [ ] 频谱可视化（多种样式）
- [ ] 波形可视化
- [ ] 3D音乐可视化
- [ ] 动态壁纸随音乐变化
- [ ] VJ视觉效果
- [ ] 音乐粒子效果
- [ ] 音乐喷泉效果
- [ ] 自定义可视化主题

### 13. 音乐社区 🌐
- [ ] 音乐直播（歌手/用户）
- [ ] 直播送礼/打赏
- [ ] K歌房间（多人合唱）
- [ ] 音乐PK对战
- [ ] 翻唱作品上传
- [ ] 原创音乐人入驻
- [ ] 音乐人认证
- [ ] 粉丝群组
- [ ] 线下活动/演唱会票务
- [ ] 音乐众筹

### 14. 个性化定制 🎭
- [ ] 深色/浅色模式
- [ ] 多主题皮肤（20+）
- [ ] 自定义主题颜色
- [ ] 动态主题（随专辑封面变化）
- [ ] 自定义播放器样式
- [ ] 字体选择
- [ ] 图标包切换
- [ ] 手势自定义
- [ ] 桌面小组件
- [ ] 动态图标

### 15. 车载模式 🚗
- [ ] 车载UI（大按钮/简洁界面）
- [ ] CarPlay/Android Auto支持
- [ ] 语音控制优化
- [ ] 驾驶安全模式
- [ ] 蓝牙自动连接播放
- [ ] 车载专属歌单

### 16. 智能设备联动 📱
- [ ] 智能手表控制
- [ ] 智能音箱投放
- [ ] 多设备同步播放
- [ ] Chromecast支持
- [ ] AirPlay支持
- [ ] DLNA投屏
- [ ] 蓝牙耳机手势控制
- [ ] 空间音频（Dolby Atmos）

### 17. 游戏化元素 🎮
- [ ] 每日签到奖励
- [ ] 听歌任务系统
- [ ] 成就徽章收集
- [ ] 排行榜（听歌时长/收藏数）
- [ ] 音乐知识问答
- [ ] 猜歌游戏
- [ ] 音乐记忆游戏
- [ ] 节奏游戏（简单版）

### 18. 数据统计与分析 📊
- [ ] 个人听歌报告
- [ ] 年度音乐总结
- [ ] 听歌时间分布
- [ ] 最爱歌手/流派统计
- [ ] 听歌心情分析
- [ ] 音乐DNA图谱
- [ ] 与好友对比
- [ ] 听歌热力图

### 19. 音乐学习 📚
- [ ] 乐器教学视频
- [ ] 吉他/钢琴谱显示
- [ ] 和弦识别
- [ ] 节拍器
- [ ] 调音器
- [ ] 慢速播放学习
- [ ] 音乐理论知识
- [ ] 在线音乐课程

### 20. 特殊音频功能 🔊
- [ ] 3D环绕音效
- [ ] 杜比全景声
- [ ] Hi-Res高解析度音频
- [ ] 母带级音质
- [ ] 动态范围压缩
- [ ] 响度标准化
- [ ] 房间校准
- [ ] 助听模式

---

## 四、数据库设计（扩展版）

### 用户相关
```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    vip_level INT DEFAULT 0,
    vip_expire_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户关注关系
CREATE TABLE user_follows (
    follower_id INT REFERENCES users(id),
    following_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 用户设置
CREATE TABLE user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id),
    theme VARCHAR(20) DEFAULT 'auto',
    quality VARCHAR(20) DEFAULT 'high',
    language VARCHAR(10) DEFAULT 'zh-CN',
    notifications JSONB DEFAULT '{}',
    privacy JSONB DEFAULT '{}',
    equalizer JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户成就
CREATE TABLE user_achievements (
    user_id INT REFERENCES users(id),
    achievement_id INT REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- 成就定义
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(500),
    condition JSONB NOT NULL
);
```

### 音乐相关
```sql
-- 歌手表
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    cover VARCHAR(500),
    bio TEXT,
    country VARCHAR(50),
    birth_date DATE,
    genres JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 专辑表
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    artist_id INT REFERENCES artists(id),
    cover VARCHAR(500),
    release_date DATE,
    description TEXT,
    genre VARCHAR(50),
    type VARCHAR(20) DEFAULT 'album', -- album/single/EP
    created_at TIMESTAMP DEFAULT NOW()
);

-- 歌曲表
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    artist_id INT REFERENCES artists(id),
    album_id INT REFERENCES albums(id),
    duration INT NOT NULL, -- seconds
    file_url_128 VARCHAR(500),
    file_url_320 VARCHAR(500),
    file_url_flac VARCHAR(500),
    lyrics_id INT,
    mv_id INT,
    cover VARCHAR(500),
    genre VARCHAR(50),
    language VARCHAR(20),
    release_date DATE,
    play_count BIGINT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_vip BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 歌词表
CREATE TABLE lyrics (
    id SERIAL PRIMARY KEY,
    song_id INT REFERENCES songs(id),
    content TEXT NOT NULL,
    translated TEXT,
    romanized TEXT,
    type VARCHAR(20) DEFAULT 'lrc', -- lrc/krc/qrc
    language VARCHAR(20),
    contributor_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- MV表
CREATE TABLE mvs (
    id SERIAL PRIMARY KEY,
    song_id INT REFERENCES songs(id),
    name VARCHAR(200) NOT NULL,
    artist_id INT REFERENCES artists(id),
    cover VARCHAR(500),
    url_360 VARCHAR(500),
    url_720 VARCHAR(500),
    url_1080 VARCHAR(500),
    url_4k VARCHAR(500),
    duration INT,
    play_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 歌单相关
```sql
-- 歌单表
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    user_id INT REFERENCES users(id),
    cover VARCHAR(500),
    description TEXT,
    tags JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT TRUE,
    is_official BOOLEAN DEFAULT FALSE,
    play_count BIGINT DEFAULT 0,
    like_count INT DEFAULT 0,
    song_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 歌单歌曲关联
CREATE TABLE playlist_songs (
    playlist_id INT REFERENCES playlists(id),
    song_id INT REFERENCES songs(id),
    sort_order INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id)
);

-- 用户收藏歌单
CREATE TABLE user_playlist_favorites (
    user_id INT REFERENCES users(id),
    playlist_id INT REFERENCES playlists(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, playlist_id)
);
```

### 社交相关
```sql
-- 评论表
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL, -- song/playlist/mv/album
    target_id INT NOT NULL,
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]',
    parent_id INT REFERENCES comments(id),
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    is_hot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 评论点赞
CREATE TABLE comment_likes (
    user_id INT REFERENCES users(id),
    comment_id INT REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, comment_id)
);

-- 用户动态
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- share_song/create_playlist/follow_user
    content JSONB NOT NULL,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 私信
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text', -- text/image/song/playlist
    extra JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 播放相关
```sql
-- 播放历史
CREATE TABLE play_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    song_id INT REFERENCES songs(id),
    played_at TIMESTAMP DEFAULT NOW(),
    duration INT, -- actual played duration
    source VARCHAR(50), -- playlist/album/search/recommend
    device VARCHAR(50)
);

-- 用户喜欢的歌曲
CREATE TABLE user_likes (
    user_id INT REFERENCES users(id),
    song_id INT REFERENCES songs(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, song_id)
);

-- 下载记录
CREATE TABLE downloads (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    song_id INT REFERENCES songs(id),
    quality VARCHAR(20),
    downloaded_at TIMESTAMP DEFAULT NOW()
);

-- 播放队列
CREATE TABLE play_queues (
    user_id INT PRIMARY KEY REFERENCES users(id),
    songs JSONB NOT NULL,
    current_index INT DEFAULT 0,
    current_position INT DEFAULT 0, -- ms
    play_mode VARCHAR(20) DEFAULT 'sequence',
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 统计相关
```sql
-- 每日统计
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    date DATE NOT NULL,
    play_count INT DEFAULT 0,
    play_duration INT DEFAULT 0, -- seconds
    genres JSONB DEFAULT '{}',
    artists JSONB DEFAULT '{}',
    moods JSONB DEFAULT '{}',
    UNIQUE(user_id, date)
);

-- 排行榜
CREATE TABLE charts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- hot/new/soar/genre
    songs JSONB NOT NULL, -- [{song_id, rank, change}]
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 五、完整API设计

### 认证模块 `/api/auth`
```
POST   /register              # 注册
POST   /login                 # 登录
POST   /logout                # 登出
POST   /refresh               # 刷新Token
POST   /send-code             # 发送验证码
POST   /reset-password        # 重置密码
POST   /oauth/:provider       # 第三方登录
```

### 用户模块 `/api/users`
```
GET    /me                    # 当前用户信息
PUT    /me                    # 更新个人信息
GET    /me/settings           # 获取设置
PUT    /me/settings           # 更新设置
GET    /:id                   # 获取用户信息
GET    /:id/playlists         # 用户歌单
GET    /:id/followers         # 粉丝列表
GET    /:id/following         # 关注列表
POST   /:id/follow            # 关注用户
DELETE /:id/follow            # 取消关注
GET    /:id/activities        # 用户动态
GET    /:id/stats             # 听歌统计
```

### 歌曲模块 `/api/songs`
```
GET    /:id                   # 获取歌曲详情
GET    /:id/url               # 获取播放地址
GET    /:id/lyrics            # 获取歌词
GET    /:id/comments          # 获取评论
POST   /:id/comments          # 发表评论
POST   /:id/like              # 喜欢歌曲
DELETE /:id/like              # 取消喜欢
GET    /:id/similar           # 相似歌曲
GET    /new                   # 新歌速递
GET    /hot                   # 热门歌曲
```

### 歌单模块 `/api/playlists`
```
GET    /                      # 歌单列表
POST   /                      # 创建歌单
GET    /categories            # 歌单分类
GET    /hot                   # 热门歌单
GET    /:id                   # 歌单详情
PUT    /:id                   # 更新歌单
DELETE /:id                   # 删除歌单
POST   /:id/songs             # 添加歌曲
DELETE /:id/songs             # 移除歌曲
POST   /:id/like              # 收藏歌单
DELETE /:id/like              # 取消收藏
GET    /:id/comments          # 歌单评论
```

### 专辑模块 `/api/albums`
```
GET    /:id                   # 专辑详情
GET    /:id/songs             # 专辑歌曲
GET    /new                   # 新专辑
GET    /hot                   # 热门专辑
```

### 歌手模块 `/api/artists`
```
GET    /:id                   # 歌手详情
GET    /:id/songs             # 歌手热门歌曲
GET    /:id/albums            # 歌手专辑
GET    /:id/mvs               # 歌手MV
POST   /:id/follow            # 关注歌手
DELETE /:id/follow            # 取消关注
GET    /hot                   # 热门歌手
```

### 搜索模块 `/api/search`
```
GET    /                      # 综合搜索
GET    /songs                 # 搜索歌曲
GET    /artists               # 搜索歌手
GET    /albums                # 搜索专辑
GET    /playlists             # 搜索歌单
GET    /users                 # 搜索用户
GET    /lyrics                # 搜索歌词
GET    /suggest               # 搜索建议
GET    /hot                   # 热门搜索
POST   /recognize             # 听歌识曲
```

### 推荐模块 `/api/recommend`
```
GET    /songs                 # 推荐歌曲
GET    /playlists             # 推荐歌单
GET    /daily                 # 每日推荐
GET    /personalized          # 个性化推荐
GET    /fm                    # 私人FM
GET    /radar                 # 音乐雷达
GET    /similar/:songId       # 相似推荐
```

### MV模块 `/api/mvs`
```
GET    /:id                   # MV详情
GET    /:id/url               # MV播放地址
GET    /:id/comments          # MV评论
GET    /hot                   # 热门MV
GET    /new                   # 最新MV
GET    /recommend             # 推荐MV
```

### 排行榜模块 `/api/charts`
```
GET    /                      # 所有榜单
GET    /:id                   # 榜单详情
GET    /hot                   # 热歌榜
GET    /new                   # 新歌榜
GET    /soar                  # 飙升榜
GET    /original              # 原创榜
```

### 评论模块 `/api/comments`
```
GET    /:id                   # 评论详情
POST   /:id/like              # 点赞评论
DELETE /:id/like              # 取消点赞
POST   /:id/reply             # 回复评论
DELETE /:id                   # 删除评论
POST   /:id/report            # 举报评论
```

### 消息模块 `/api/messages`
```
GET    /conversations         # 会话列表
GET    /:userId               # 与某用户的消息
POST   /:userId               # 发送消息
PUT    /:id/read              # 标记已读
DELETE /:id                   # 删除消息
GET    /notifications         # 系统通知
```

### 播放记录 `/api/history`
```
GET    /                      # 播放历史
DELETE /                      # 清空历史
GET    /recent                # 最近播放
GET    /weekly                # 本周最多播放
```

### 下载模块 `/api/downloads`
```
GET    /                      # 下载列表
POST   /:songId               # 添加下载
DELETE /:songId               # 删除下载
GET    /queue                 # 下载队列
```

### 统计模块 `/api/stats`
```
GET    /me/today              # 今日统计
GET    /me/week               # 本周统计
GET    /me/month              # 本月统计
GET    /me/year               # 年度报告
GET    /me/taste              # 音乐口味分析
```

---

## 六、项目结构

```
soda-music/
├── frontend/                    # 前端项目
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   ├── components/          # 通用组件
│   │   │   ├── Player/          # 播放器组件
│   │   │   │   ├── MiniPlayer.tsx
│   │   │   │   ├── FullPlayer.tsx
│   │   │   │   ├── PlayQueue.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── VolumeControl.tsx
│   │   │   │   └── Equalizer.tsx
│   │   │   ├── Lyrics/          # 歌词组件
│   │   │   │   ├── LyricsDisplay.tsx
│   │   │   │   ├── LyricLine.tsx
│   │   │   │   └── LyricsPoster.tsx
│   │   │   ├── Playlist/        # 歌单组件
│   │   │   ├── Song/            # 歌曲组件
│   │   │   ├── Comment/         # 评论组件
│   │   │   ├── Search/          # 搜索组件
│   │   │   ├── Visualizer/      # 可视化组件
│   │   │   └── common/          # 通用UI组件
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       ├── Loading.tsx
│   │   │       └── ...
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home/            # 首页
│   │   │   ├── Search/          # 搜索页
│   │   │   ├── Library/         # 音乐库
│   │   │   ├── Profile/         # 个人主页
│   │   │   ├── Player/          # 播放页
│   │   │   ├── Playlist/        # 歌单页
│   │   │   ├── Artist/          # 歌手页
│   │   │   ├── Album/           # 专辑页
│   │   │   ├── MV/              # MV页
│   │   │   ├── Charts/          # 排行榜
│   │   │   ├── Settings/        # 设置页
│   │   │   └── Auth/            # 认证页
│   │   ├── stores/              # Zustand状态管理
│   │   │   ├── playerStore.ts
│   │   │   ├── userStore.ts
│   │   │   ├── playlistStore.ts
│   │   │   └── uiStore.ts
│   │   ├── hooks/               # 自定义Hooks
│   │   │   ├── usePlayer.ts
│   │   │   ├── useAudio.ts
│   │   │   ├── useLyrics.ts
│   │   │   └── useSearch.ts
│   │   ├── services/            # API服务
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── song.ts
│   │   │   ├── playlist.ts
│   │   │   └── user.ts
│   │   ├── utils/               # 工具函数
│   │   │   ├── format.ts
│   │   │   ├── lrcParser.ts
│   │   │   ├── storage.ts
│   │   │   └── audio.ts
│   │   ├── types/               # TypeScript类型
│   │   ├── styles/              # 样式文件
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── controllers/         # 控制器
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── songController.ts
│   │   │   ├── playlistController.ts
│   │   │   ├── searchController.ts
│   │   │   └── ...
│   │   ├── services/            # 业务逻辑
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── songService.ts
│   │   │   ├── recommendService.ts
│   │   │   └── ...
│   │   ├── models/              # 数据模型
│   │   │   ├── User.ts
│   │   │   ├── Song.ts
│   │   │   ├── Playlist.ts
│   │   │   └── ...
│   │   ├── routes/              # 路由定义
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── songs.ts
│   │   │   └── ...
│   │   ├── middlewares/         # 中间件
│   │   │   ├── auth.ts
│   │   │   ├── validator.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/               # 工具函数
│   │   ├── config/              # 配置文件
│   │   └── app.ts               # 应用入口
│   ├── prisma/
│   │   └── schema.prisma        # 数据库Schema
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                      # Docker配置
│   ├── nginx/
│   ├── postgres/
│   └── redis/
│
├── docker-compose.yml           # Docker编排
├── docker-compose.dev.yml       # 开发环境
├── .env.example                 # 环境变量示例
├── Makefile                     # 常用命令
└── README.md                    # 项目文档
```

---

## 七、开发顺序

### Phase 1: 基础架构 ✅
1. 初始化前后端项目
2. 配置Docker开发环境
3. 数据库设计与迁移
4. 基础API框架

### Phase 2: 核心功能 🎵
1. 用户认证系统
2. 音乐播放器核心
3. 歌词解析与同步
4. 基础UI组件库

### Phase 3: 内容功能 📚
1. 歌曲/专辑/歌手管理
2. 歌单CRUD
3. 搜索功能
4. 首页与推荐

### Phase 4: 社交功能 💬
1. 评论系统
2. 关注系统
3. 动态功能
4. 私信系统

### Phase 5: 高级功能 ⚡
1. 音频可视化
2. MV播放
3. 下载缓存
4. 统计分析

### Phase 6: 创新功能 🚀
1. AI推荐
2. 听歌识曲
3. 车载模式
4. 游戏化元素

---

准备开始实现！
