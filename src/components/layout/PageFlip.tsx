import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageFlipProps {
  children: ReactNode
  direction: number // -1 for left, 1 for right
  pageKey: string
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    rotateY: direction > 0 ? 90 : -90,
    rotateZ: direction > 0 ? 6 : -6,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    rotateY: direction < 0 ? 90 : -90,
    rotateZ: direction < 0 ? 6 : -6,
    opacity: 0,
    scale: 0.9,
  }),
}

export const PageFlip = ({ children, direction, pageKey }: PageFlipProps) => {
  return (
    <div className="perspective-1000 relative w-full min-h-screen overflow-hidden py-6">
      <AnimatePresence initial={false} custom={direction}>
        {direction !== 0 && (
          <motion.div
            key={`sheet-${pageKey}`}
            className="flip-sheet"
            custom={direction}
            initial={{
              opacity: 0.55,
              rotateY: 0,
              rotateZ: direction > 0 ? 2 : -2,
              x: 0,
              left: direction > 0 ? 'auto' : 0,
              right: direction > 0 ? 0 : 'auto',
              transformOrigin: direction > 0 ? '0% 50%' : '100% 50%',
            }}
            animate={{
              opacity: 0,
              rotateY: direction > 0 ? -160 : 160,
              rotateZ: direction > 0 ? -8 : 8,
              x: direction > 0 ? -140 : 140,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            rotateY: { duration: 0.6, ease: 'easeInOut' },
            rotateZ: { duration: 0.6, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
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
