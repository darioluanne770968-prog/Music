import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary:
        'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white hover:bg-dark-200 dark:hover:bg-dark-700 focus:ring-dark-500',
      ghost:
        'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 focus:ring-dark-500',
      danger:
        'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      outline:
        'border-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white hover:bg-dark-100 dark:hover:bg-dark-800 focus:ring-dark-500',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2',
      icon: 'h-10 w-10 rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Icon Button
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isActive?: boolean
  label: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', isActive, label, children, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    }

    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600',
      secondary: 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white hover:bg-dark-200 dark:hover:bg-dark-700',
      ghost: 'text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
          variants[variant],
          sizes[size],
          isActive && 'text-primary-500',
          className
        )}
        aria-label={label}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Play Button (special styled button for play/pause)
interface PlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const PlayButton = React.forwardRef<HTMLButtonElement, PlayButtonProps>(
  ({ isPlaying, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-14 w-14',
      xl: 'h-16 w-16',
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 shadow-lg shadow-primary-500/30',
          sizes[size],
          className
        )}
        aria-label={isPlaying ? '暂停' : '播放'}
        {...props}
      >
        {isPlaying ? (
          <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            className={clsx(iconSizes[size], 'ml-0.5')}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
          </svg>
        )}
      </button>
    )
  }
)

PlayButton.displayName = 'PlayButton'
