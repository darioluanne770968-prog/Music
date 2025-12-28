import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { errorReporter, getErrorMessage } from '@/utils/errorHandler'

/**
 * 错误边界组件
 * 捕获子组件的错误并显示友好的错误界面
 */

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // 上报错误
    errorReporter.report(error, {
      componentStack: errorInfo.componentStack
    })

    // 调用回调
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.props.showRetry !== false ? this.handleRetry : undefined}
        />
      )
    }

    return this.props.children
  }
}

// 默认错误回退界面
interface ErrorFallbackProps {
  error: Error | null
  onRetry?: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const message = error ? getErrorMessage(error) : '发生了一些问题'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
    >
      <div className="w-20 h-20 mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">出错了</h3>
      <p className="text-white/60 mb-6 max-w-md">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
        >
          重试
        </button>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-6 text-left w-full max-w-lg">
          <summary className="cursor-pointer text-sm text-white/40">
            查看详细错误信息
          </summary>
          <pre className="mt-2 p-4 bg-dark-800 rounded-lg text-xs text-red-400 overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </motion.div>
  )
}

// 页面级错误边界
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-screen flex flex-col items-center justify-center bg-dark-900">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8"
          >
            <div className="w-32 h-32 mb-8 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">页面加载失败</h1>
            <p className="text-white/60 mb-8">抱歉，页面遇到了问题</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600"
            >
              刷新页面
            </button>
          </motion.div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// 网络错误提示
export const NetworkError: React.FC<{
  onRetry?: () => void
}> = ({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed bottom-24 left-4 right-4 p-4 bg-red-500/90 rounded-xl flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      <span className="text-white">网络连接已断开</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-1 bg-white/20 text-white rounded-full text-sm"
      >
        重试
      </button>
    )}
  </motion.div>
)

// 空状态
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && (
      <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center text-3xl">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    {description && (
      <p className="text-white/60 mb-6 max-w-md">{description}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600"
      >
        {action.label}
      </button>
    )}
  </div>
)

// 加载失败
export const LoadingError: React.FC<{
  message?: string
  onRetry?: () => void
}> = ({ message = '加载失败', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <svg className="w-12 h-12 text-white/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-white/60 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        重试
      </button>
    )}
  </div>
)

export default ErrorBoundary
