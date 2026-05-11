import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'

export const Input = forwardRef(function Input({ label, error, icon: Icon, type = 'text', className, ...props }, ref) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--color-text-2)] mb-2">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]" />}
        <input
          ref={ref}
          type={actualType}
          className={cn(
            'w-full h-11 px-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]',
            'text-[var(--color-text)] placeholder:text-[var(--color-text-4)]',
            'transition-all duration-150',
            'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'border-[var(--color-danger)]',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
})