const express = require('express')
const NeteaseCloudMusicApi = require('NeteaseCloudMusicApi')

const app = express()
const PORT = 3000

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Parse JSON body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create API routes dynamically
Object.keys(NeteaseCloudMusicApi).forEach((apiName) => {
  if (typeof NeteaseCloudMusicApi[apiName] === 'function' && apiName !== 'default') {
    const route = '/' + apiName.replace(/_/g, '/')

    app.all(route, async (req, res) => {
      try {
        const params = { ...req.query, ...req.body }
        const result = await NeteaseCloudMusicApi[apiName](params)
        res.json(result.body)
      } catch (error) {
        res.status(500).json({
          code: 500,
          message: error.message || 'Internal Server Error'
        })
      }
    })
  }
})

// Common routes aliases
const routeAliases = {
  '/search': 'search',
  '/song/url': 'song_url',
  '/song/detail': 'song_detail',
  '/lyric': 'lyric',
  '/playlist/detail': 'playlist_detail',
  '/user/playlist': 'user_playlist',
  '/personalized': 'personalized',
  '/personalized/newsong': 'personalized_newsong',
  '/toplist': 'toplist',
  '/top/playlist': 'top_playlist',
  '/artist/songs': 'artist_songs',
  '/artist/album': 'artist_album',
  '/album': 'album',
  '/comment/music': 'comment_music',
  '/comment/playlist': 'comment_playlist',
  '/login/cellphone': 'login_cellphone',
  '/login/qr/key': 'login_qr_key',
  '/login/qr/create': 'login_qr_create',
  '/login/qr/check': 'login_qr_check',
  '/login/status': 'login_status',
  '/user/detail': 'user_detail',
  '/recommend/songs': 'recommend_songs',
  '/recommend/resource': 'recommend_resource',
  '/personal/fm': 'personal_fm',
  '/like': 'like',
  '/likelist': 'likelist',
  '/mv/url': 'mv_url',
  '/mv/detail': 'mv_detail',
  '/cloudsearch': 'cloudsearch',
  '/top/song': 'top_song',
  '/playlist/tracks': 'playlist_tracks',
  '/playlist/create': 'playlist_create',
  '/playlist/subscribe': 'playlist_subscribe',
  '/fm/trash': 'fm_trash',
  '/scrobble': 'scrobble',
  '/banner': 'banner',
}

Object.entries(routeAliases).forEach(([route, apiName]) => {
  if (NeteaseCloudMusicApi[apiName]) {
    app.all(route, async (req, res) => {
      try {
        const params = { ...req.query, ...req.body }
        const result = await NeteaseCloudMusicApi[apiName](params)
        res.json(result.body)
      } catch (error) {
        res.status(500).json({
          code: 500,
          message: error.message || 'Internal Server Error'
        })
      }
    })
  }
})

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '网易云音乐 API 服务运行中',
    availableRoutes: Object.keys(routeAliases)
  })
})

app.listen(PORT, () => {
  console.log(`\n🎵 网易云音乐 API 服务已启动`)
  console.log(`   地址: http://localhost:${PORT}`)
  console.log(`   文档: https://binaryify.github.io/NeteaseCloudMusicApi/\n`)
})
