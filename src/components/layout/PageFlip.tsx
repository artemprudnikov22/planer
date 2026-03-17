import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageFlipProps {
  children: ReactNode
  direction: number // -1 for left, 1 for right
  pageKey: string
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
    scale: 0.995,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 28 : -28,
    opacity: 0,
    scale: 0.995,
  }),
}

export const PageFlip = ({ children, direction, pageKey }: PageFlipProps) => {
  const reduceMotion = useReducedMotion()

  return (
    <div className="perspective-1000 relative w-full min-h-screen overflow-hidden py-6">
      <AnimatePresence initial={false} custom={direction || 1}>
        {!reduceMotion && direction !== 0 && (
          <motion.div
            key={`sheet-${pageKey}`}
            className="flip-sheet"
            custom={direction || 1}
            initial={{
              opacity: 0.45,
              rotateY: 0,
              x: 0,
              left: direction > 0 ? 'auto' : 0,
              right: direction > 0 ? 0 : 'auto',
              transformOrigin: direction > 0 ? '0% 50%' : '100% 50%',
            }}
            animate={{
              opacity: 0,
              rotateY: direction > 0 ? -150 : 150,
              x: direction > 0 ? -80 : 80,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false} custom={direction || 1} mode="wait">
        <motion.div
          key={pageKey}
          custom={direction || 1}
          variants={variants}
          initial={direction === 0 || reduceMotion ? false : 'enter'}
          animate="center"
          exit="exit"
          transition={{
            x: { duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' },
            opacity: { duration: reduceMotion ? 0 : 0.18, ease: 'linear' },
            scale: { duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' },
          }}
          style={{ transformOrigin: direction > 0 ? '0% 50%' : '100% 50%' }}
          className="w-full preserve-3d will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
