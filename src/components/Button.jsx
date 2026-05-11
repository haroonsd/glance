import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

export function Button({ children, variant = 'primary', size = 'md', loading = false, icon: Icon, className, disabled, ...props }) {
  const variants = {
    primary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-3)] text-white shadow-lg shadow-[var(--color-accent-glow)]',
    secondary: 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)]',
    ghost: 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:text-[var(--color-text)]',
    danger: 'bg-[var(--color-danger)] hover:bg-red-600 text-white',
  }
  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-12 px-6 text-base rounded-lg gap-2',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={cn('inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </motion.button>
  )
}