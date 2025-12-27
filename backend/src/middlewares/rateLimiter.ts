import rateLimit from 'express-rate-limit'
import { TooManyRequestsError } from './errorHandler.js'

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    code: 429,
    message: '登录尝试次数过多，请1小时后再试',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for search
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    code: 429,
    message: '搜索请求过于频繁',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    code: 429,
    message: '上传次数过多，请稍后再试',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for comments
export const commentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 comments per minute
  message: {
    code: 429,
    message: '评论发送过于频繁',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
})
