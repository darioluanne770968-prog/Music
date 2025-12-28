import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'

interface PageTransitionProps {
  children: React.ReactNode
  mode?: 'fade' | 'slide' | 'scale' | 'slideUp'
}

// 动画变体
const variants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.98, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.98, opacity: 0 },
  },
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'slideUp',
}) => {
  const location = useLocation()
  const { animations, accessibility } = useThemeStore()

  // 如果禁用动画或启用减少动画，直接渲染
  if (!animations.enabled || !animations.pageTransitions || accessibility.reducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants[mode]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.25,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// iOS 风格的页面过渡（从右侧滑入）
export const IOSPageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const { animations, accessibility } = useThemeStore()

  if (!animations.enabled || !animations.pageTransitions || accessibility.reducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-30%', opacity: 0.5 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// 模态框过渡
export const ModalTransition: React.FC<{
  children: React.ReactNode
  isOpen: boolean
  onClose?: () => void
}> = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="fixed z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 抽屉过渡
export const DrawerTransition: React.FC<{
  children: React.ReactNode
  isOpen: boolean
  onClose?: () => void
  position?: 'left' | 'right' | 'bottom'
}> = ({ children, isOpen, onClose, position = 'right' }) => {
  const positionVariants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            variants={positionVariants[position]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
            }}
            className="fixed z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 列表项动画
export const ListItemTransition: React.FC<{
  children: React.ReactNode
  index: number
  enabled?: boolean
}> = ({ children, index, enabled = true }) => {
  const { animations, accessibility } = useThemeStore()

  if (!enabled || !animations.enabled || accessibility.reducedMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

// 渐显动画包装器
export const FadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}> = ({ children, delay = 0, duration = 0.3, className }) => {
  const { animations, accessibility } = useThemeStore()

  if (!animations.enabled || accessibility.reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 缩放动画包装器
export const ScaleIn: React.FC<{
  children: React.ReactNode
  delay?: number
  className?: string
}> = ({ children, delay = 0, className }) => {
  const { animations, accessibility } = useThemeStore()

  if (!animations.enabled || accessibility.reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
