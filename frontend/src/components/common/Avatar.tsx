import React from 'react'
import { clsx } from 'clsx'
import { stringToColor, getInitials } from '@/utils/format'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  isOnline?: boolean
  showBorder?: boolean
}

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
}

const onlineSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5',
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className,
  isOnline,
  showBorder,
}) => {
  const [error, setError] = React.useState(false)
  const showFallback = !src || error

  const initials = getInitials(name || alt)
  const backgroundColor = stringToColor(name || alt || 'default')

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {showFallback ? (
        <div
          className={clsx(
            'flex items-center justify-center rounded-full font-medium text-white',
            sizes[size],
            showBorder && 'ring-2 ring-white dark:ring-dark-900'
          )}
          style={{ backgroundColor }}
        >
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'rounded-full object-cover',
            sizes[size],
            showBorder && 'ring-2 ring-white dark:ring-dark-900'
          )}
          onError={() => setError(true)}
        />
      )}

      {isOnline && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white dark:ring-dark-900',
            onlineSizes[size]
          )}
        />
      )}
    </div>
  )
}

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{
    src?: string
    alt?: string
    name?: string
  }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max)
  const remaining = avatars.length - max

  const overlapSizes = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-4',
  }

  return (
    <div className={clsx('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={clsx(index > 0 && overlapSizes[size])}
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            name={avatar.name}
            size={size}
            showBorder
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={clsx(
            'flex items-center justify-center rounded-full bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-300 font-medium ring-2 ring-white dark:ring-dark-900',
            sizes[size],
            overlapSizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

// Cover Image (for albums/playlists)
interface CoverProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  isPlaying?: boolean
  showPlayIcon?: boolean
  onClick?: () => void
}

const coverSizes = {
  xs: 'h-10 w-10',
  sm: 'h-12 w-12',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-32 w-32',
  full: 'h-full w-full',
}

export const Cover: React.FC<CoverProps> = ({
  src,
  alt = '',
  size = 'md',
  className,
  isPlaying,
  showPlayIcon,
  onClick,
}) => {
  const [error, setError] = React.useState(false)

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl bg-dark-100 dark:bg-dark-800 shrink-0',
        coverSizes[size],
        onClick && 'cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'h-full w-full object-cover transition-transform duration-300',
            onClick && 'group-hover:scale-110',
            isPlaying && 'animate-spin-slow'
          )}
          onError={() => setError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-dark-400">
          <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
      )}

      {/* Play overlay */}
      {showPlayIcon && onClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/90 text-dark-900">
            <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72c0 .94 1.02 1.53 1.83 1.06l11.03-6.86c.78-.49.78-1.63 0-2.12L9.83 4.08C9.02 3.61 8 4.2 8 5.14z" />
            </svg>
          </div>
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute bottom-1 right-1 flex items-end gap-0.5 h-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-primary-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
