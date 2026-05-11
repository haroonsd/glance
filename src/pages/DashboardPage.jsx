import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { AppLayout } from '../components/AppLayout'

export function DashboardPage() {
  const { profile } = useAuthStore()

  return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-5 text-center p-8">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-2)]" />
            <span className="text-xs font-medium text-[var(--color-accent-2)]">You're in</span>
          </div>
          <h1 className="text-4xl font-bold">Welcome, {profile?.name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-[var(--color-text-2)] max-w-sm">Tasks and board view are up next. Your workspace is ready.</p>
        </motion.div>
      </div>
    </AppLayout>
  )
}