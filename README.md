# 汽水音乐 (Soda Music)

一个功能完整的音乐流媒体应用，复刻汽水音乐的核心功能，包含 80+ 功能点。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: TailwindCSS
- **动画**: Framer Motion
- **音频**: Howler.js
- **路由**: React Router v6
- **构建工具**: Vite

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **实时通信**: Socket.io
- **认证**: JWT

### 基础设施
- **容器化**: Docker + Docker Compose
- **对象存储**: MinIO (S3兼容)

## 功能特性

### 核心功能
- 音乐播放器（播放/暂停/上一首/下一首/进度控制）
- 歌词同步显示（LRC解析、逐字高亮）
- 播放模式（顺序/循环/单曲/随机/心动）
- 播放队列管理
- 音量控制与静音
- 倍速播放

### 内容功能
- 歌曲/专辑/歌手浏览
- 歌单创建与管理
- 搜索（歌曲/歌手/专辑/歌单/用户）
- 热门搜索与搜索建议
- 排行榜

### 社交功能
- 用户注册/登录
- 关注/粉丝系统
- 评论与回复
- 点赞收藏

### 个性化
- 个性化推荐
- 每日推荐
- 私人FM
- 深色模式

### 高级功能
- 音频可视化
- VIP会员系统
- 实时消息

## 项目结构

```
soda-music/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── stores/          # 状态管理
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── services/        # API服务
│   │   ├── utils/           # 工具函数
│   │   └── types/           # TypeScript类型
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── routes/          # API路由
│   │   ├── middlewares/     # 中间件
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   ├── prisma/              # 数据库Schema
│   └── package.json
│
├── docker-compose.yml       # Docker编排
└── README.md
```

## 快速开始

### 前置要求
- Node.js 18+
- Docker & Docker Compose
- pnpm (推荐) 或 npm

### 1. 克隆项目
```bash
git clone <repository-url>
cd soda-music
```

### 2. 启动基础服务
```bash
docker-compose up -d postgres redis minio
```

### 3. 配置后端
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed  # 可选：添加测试数据
npm run dev
```

### 4. 配置前端
```bash
cd frontend
npm install
npm run dev
```

### 5. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:4000
- MinIO控制台: http://localhost:9001 (minio/minio123)

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 歌曲
- `GET /api/songs/:id` - 获取歌曲详情
- `GET /api/songs/:id/url` - 获取播放地址
- `GET /api/songs/:id/lyrics` - 获取歌词
- `POST /api/songs/:id/like` - 喜欢歌曲

### 歌单
- `GET /api/playlists` - 歌单列表
- `POST /api/playlists` - 创建歌单
- `GET /api/playlists/:id` - 歌单详情
- `POST /api/playlists/:id/songs` - 添加歌曲

### 搜索
- `GET /api/search?q=关键词` - 综合搜索
- `GET /api/search/hot` - 热门搜索

### 推荐
- `GET /api/recommend/songs` - 推荐歌曲
- `GET /api/recommend/daily` - 每日推荐
- `GET /api/recommend/fm` - 私人FM

## 测试

### 运行前端测试
```bash
cd frontend
npm run test
```

### 运行后端测试
```bash
cd backend
npm run test
```

## 部署

### Docker 部署
```bash
docker-compose up -d
```

### 手动部署
1. 构建前端: `cd frontend && npm run build`
2. 构建后端: `cd backend && npm run build`
3. 运行后端: `cd backend && npm start`
4. 使用Nginx代理前端静态文件

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 许可证

MIT License

## 致谢

- 汽水音乐 - 设计灵感
- 网易云音乐 - 功能参考
- Spotify - UI/UX 参考
