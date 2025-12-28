/**
 * 错误处理工具
 * 统一错误处理、错误上报、重试机制
 */

// 错误类型
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

// 自定义错误类
export class AppError extends Error {
  type: ErrorType
  code?: string
  details?: Record<string, any>
  isRetryable: boolean
  timestamp: number

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    options?: {
      code?: string
      details?: Record<string, any>
      isRetryable?: boolean
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = options?.code
    this.details = options?.details
    this.isRetryable = options?.isRetryable ?? false
    this.timestamp = Date.now()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      details: this.details,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

// 错误消息映射
const errorMessages: Record<string, string> = {
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  AUTH_EXPIRED: '登录已过期，请重新登录',
  AUTH_INVALID: '账号或密码错误',
  NOT_FOUND: '请求的资源不存在',
  FORBIDDEN: '没有权限访问',
  RATE_LIMIT: '请求过于频繁，请稍后再试',
  SERVER_ERROR: '服务器繁忙，请稍后再试',
  VALIDATION_ERROR: '输入数据格式不正确',
  OFFLINE: '当前处于离线状态',
  TIMEOUT: '请求超时，请重试',
  UNKNOWN: '发生未知错误'
}

// 获取用户友好的错误消息
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return errorMessages[error.code || error.type] || error.message
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return errorMessages.NETWORK_ERROR
    }

    // 超时
    if (error.message.includes('timeout')) {
      return errorMessages.TIMEOUT
    }

    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return errorMessages.UNKNOWN
}

// 解析 HTTP 错误
export function parseHttpError(response: Response, data?: any): AppError {
  const status = response.status

  switch (status) {
    case 400:
      return new AppError(data?.message || '请求参数错误', ErrorType.VALIDATION, {
        code: 'VALIDATION_ERROR',
        details: data?.errors
      })

    case 401:
      return new AppError('未授权访问', ErrorType.AUTH, {
        code: 'AUTH_INVALID',
        isRetryable: false
      })

    case 403:
      return new AppError('没有权限', ErrorType.AUTH, {
        code: 'FORBIDDEN',
        isRetryable: false
      })

    case 404:
      return new AppError('资源不存在', ErrorType.CLIENT, {
        code: 'NOT_FOUND',
        isRetryable: false
      })

    case 429:
      return new AppError('请求过于频繁', ErrorType.CLIENT, {
        code: 'RATE_LIMIT',
        isRetryable: true
      })

    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError('服务器错误', ErrorType.SERVER, {
        code: 'SERVER_ERROR',
        isRetryable: true
      })

    default:
      return new AppError(data?.message || '请求失败', ErrorType.UNKNOWN, {
        code: `HTTP_${status}`,
        isRetryable: status >= 500
      })
  }
}

// 错误上报
interface ErrorReport {
  error: any
  context?: Record<string, any>
  userAgent: string
  url: string
  timestamp: number
}

class ErrorReporter {
  private endpoint: string
  private queue: ErrorReport[] = []
  private isProcessing = false

  constructor(endpoint = '/api/errors') {
    this.endpoint = endpoint
  }

  report(error: unknown, context?: Record<string, any>): void {
    const report: ErrorReport = {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError ? error.toJSON() : {})
      } : error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    }

    this.queue.push(report)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const report = this.queue.shift()
      if (!report) continue

      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        })
      } catch {
        // 上报失败时保存到本地存储
        this.saveToLocal(report)
      }
    }

    this.isProcessing = false
  }

  private saveToLocal(report: ErrorReport): void {
    try {
      const key = 'error_reports'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(report)
      // 最多保存 100 条
      if (existing.length > 100) {
        existing.shift()
      }
      localStorage.setItem(key, JSON.stringify(existing))
    } catch {
      // 忽略存储错误
    }
  }

  // 重新发送本地保存的错误报告
  async retryLocalReports(): Promise<void> {
    try {
      const key = 'error_reports'
      const reports = JSON.parse(localStorage.getItem(key) || '[]')
      if (reports.length === 0) return

      localStorage.removeItem(key)
      this.queue.push(...reports)
      this.processQueue()
    } catch {
      // 忽略
    }
  }
}

export const errorReporter = new ErrorReporter()

// 全局错误处理
export function setupGlobalErrorHandlers(): void {
  // 未捕获的错误
  window.onerror = (message, source, lineno, colno, error) => {
    errorReporter.report(error || message, {
      source,
      lineno,
      colno
    })
  }

  // Promise 拒绝
  window.onunhandledrejection = (event) => {
    errorReporter.report(event.reason, {
      type: 'unhandledrejection'
    })
  }
}

// 重试装饰器
interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: 'linear' | 'exponential'
  shouldRetry?: (error: unknown) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    shouldRetry = (error) => {
      if (error instanceof AppError) {
        return error.isRetryable
      }
      return true
    }
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error
      }

      const waitTime = backoff === 'exponential'
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt

      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}

// 错误边界辅助
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: null
  }
}

// 安全执行函数
export async function safeExecute<T>(
  fn: () => T | Promise<T>,
  options?: {
    fallback?: T
    onError?: (error: unknown) => void
  }
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    options?.onError?.(error)
    errorReporter.report(error)
    return options?.fallback
  }
}

// 超时包装
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AppError(message, ErrorType.NETWORK, {
          code: 'TIMEOUT',
          isRetryable: true
        }))
      }, timeoutMs)
    })
  ])
}

// 离线检测
export function isOffline(): boolean {
  return !navigator.onLine
}

export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export default {
  AppError,
  ErrorType,
  getErrorMessage,
  parseHttpError,
  errorReporter,
  setupGlobalErrorHandlers,
  withRetry,
  createErrorBoundaryState,
  safeExecute,
  withTimeout,
  isOffline,
  onOnlineStatusChange
}
