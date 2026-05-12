import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckSquare, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { useAuthStore } from '../store/auth'
import { useTaskStore } from '../store/tasks'

export function DashboardPage() {
  const { profile } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => { fetchTasks() }, [])

  const today = new Date().toDateString()
  const overdue = tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date(today))

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: '#6366f1' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'progress').length, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Overdue', value: overdue.length, icon: AlertCircle, color: '#ef4444' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: Check, color: '#10b981' },
  ]

  const recent = [...tasks].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 6)

  const STATUS_COLORS = { todo: '#71717a', progress: '#3b82f6', waiting: '#f59e0b', done: '#10b981' }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Welcome */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-2)]" />
              <span className="text-xs font-medium text-[var(--color-accent-2)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">{greeting}, {profile?.name?.split(' ')[0] || 'there'} 👋</h1>
            <p className="text-[var(--color-text-2)]">Here's what's happening with your team today.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider">{stat.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.color + '22' }}>
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Recent tasks */}
          {recent.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="font-semibold">Recent Tasks</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {recent.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[task.status] || '#71717a' }} />
                    <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-[var(--color-text-3)]' : 'text-[var(--color-text)]'}`}>{task.name}</span>
                    <span className="text-xs text-[var(--color-text-3)] capitalize shrink-0 whitespace-nowrap">{task.status === 'progress' ? 'in progress' : task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="bg-red-950/20 border border-[var(--color-danger)]/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
                <h2 className="font-semibold text-[var(--color-danger)]">{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</h2>
              </div>
              <div className="space-y-1.5">
                {overdue.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] shrink-0" />
                    <span className="text-[var(--color-text-2)] truncate">{task.name}</span>
                    <span className="text-xs text-[var(--color-danger)] shrink-0">{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
                {overdue.length > 3 && <p className="text-xs text-[var(--color-text-3)] mt-1">+{overdue.length - 3} more</p>}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AppLayout>
  )
}