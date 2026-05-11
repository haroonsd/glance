import { motion } from 'framer-motion'
import { LogOut, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { toast } from 'sonner'

export function DashboardPage() {
  const { profile, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-5 text-center">
        <Logo size={80} />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-2)]" />
          <span className="text-xs font-medium text-[var(--color-accent-2)]">You're in</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.name || 'there'}!</h1>
          <p className="text-[var(--color-text-2)]">The workspace is ready. Sidebar and tasks are up next.</p>
        </div>
        <Button variant="secondary" icon={LogOut} onClick={handleSignOut}>Sign out</Button>
      </motion.div>
    </div>
  )
}