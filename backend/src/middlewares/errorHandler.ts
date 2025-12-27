import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409)
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = '请求过于频繁') {
    super(message, 429)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(message, 500)
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        code: 409,
        message: '数据已存在',
        data: null,
      })
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        code: 404,
        message: '数据不存在',
        data: null,
      })
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      code: 400,
      message: '请求参数验证失败',
      data: (err as any).errors,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的令牌',
      data: null,
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '令牌已过期',
      data: null,
    })
  }

  // App errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: null,
    })
  }

  // Unknown errors
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
  })
}

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
