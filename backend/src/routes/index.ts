import { Router } from 'express'
import authRoutes from './auth.js'
import userRoutes from './users.js'
import songRoutes from './songs.js'
import playlistRoutes from './playlists.js'
import artistRoutes from './artists.js'
import albumRoutes from './albums.js'
import searchRoutes from './search.js'
import recommendRoutes from './recommend.js'
import chartRoutes from './charts.js'
import commentRoutes from './comments.js'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/songs', songRoutes)
router.use('/playlists', playlistRoutes)
router.use('/artists', artistRoutes)
router.use('/albums', albumRoutes)
router.use('/search', searchRoutes)
router.use('/recommend', recommendRoutes)
router.use('/charts', chartRoutes)
router.use('/comments', commentRoutes)

// API info
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'Soda Music API',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        songs: '/api/songs',
        playlists: '/api/playlists',
        artists: '/api/artists',
        albums: '/api/albums',
        search: '/api/search',
        recommend: '/api/recommend',
        charts: '/api/charts',
        comments: '/api/comments',
      },
    },
  })
})

export default router
