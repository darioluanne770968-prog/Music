import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { errorHandler } from './middlewares/errorHandler.js'
import { rateLimiter } from './middlewares/rateLimiter.js'
import routes from './routes/index.js'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api', rateLimiter)

// API Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Join user room for personal notifications
  socket.on('join', (userId: number) => {
    socket.join(`user:${userId}`)
  })

  // Leave room
  socket.on('leave', (userId: number) => {
    socket.leave(`user:${userId}`)
  })

  // Real-time chat
  socket.on('message', (data: { to: number; content: string; type: string }) => {
    io.to(`user:${data.to}`).emit('message', data)
  })

  // Live comments (for music/MV)
  socket.on('comment', (data: { targetType: string; targetId: number; content: string }) => {
    io.to(`${data.targetType}:${data.targetId}`).emit('comment', data)
  })

  // Join live room
  socket.on('joinLive', (roomId: string) => {
    socket.join(`live:${roomId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Export io for use in controllers
export { io }

// Start server
const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🎵 Soda Music API Server                ║
  ║                                           ║
  ║   Server running on port ${PORT}            ║
  ║   http://localhost:${PORT}                  ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `)
})

export default app
