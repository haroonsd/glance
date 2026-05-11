import { motion } from 'framer-motion'
import { WatcherEye } from './WatcherEye'

export function PageLoader({ message = 'Loading' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)] z-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WatcherEye size={80} glow track={false} blink />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5"
        >
          <span className="text-sm text-[var(--color-text-2)] tracking-wide">{message}</span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm text-[var(--color-text-2)]"
          >
            ...
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}