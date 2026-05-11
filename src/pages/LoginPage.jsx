import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/')
      } else {
        if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); setLoading(false); return }
        await signUp({ email: form.email, password: form.password, name: form.name })
        toast.success('Account created! Check your email to verify.')
        setMode('signin')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]" />
        <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -100, 0], y: [0, 100, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <Logo size={48} />
            <span className="text-3xl font-bold tracking-tight">Glance</span>
          </div>
          <motion.h1 key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </motion.h1>
          <p className="text-[var(--color-text-3)] text-sm">
            {mode === 'signin' ? 'Sign in to your workspace' : 'Start collaborating with your team'}
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  <Input label="Full name" icon={User} placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </motion.div>
              )}
            </AnimatePresence>
            <Input label="Email" icon={Mail} type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            {mode === 'signup' && (
              <div className="text-xs text-[var(--color-text-3)] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Min 8 characters
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] transition-colors">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-[var(--color-accent-2)] font-medium">{mode === 'signin' ? 'Sign up' : 'Sign in'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}