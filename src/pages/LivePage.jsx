import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Circle, Clock, CheckSquare, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import { getInitials, stringToColor, formatRelativeTime } from '../lib/utils'

export function LivePage() {
  const { profile } = useAuthStore()
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: taskData }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('tasks').select('*').eq('deleted', false),
      ])
      setMembers(profiles || [])
      setTasks(taskData || [])
      setLoading(false)
    }
    load()

    // Update presence every 30s
    const presenceInterval = setInterval(load, 30000)
    // Tick clock every minute
    const clockInterval = setInterval(() => setNow(new Date()), 60000)

    // Realtime task updates
    const channel = supabase.channel('live-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe()

    return () => {
      clearInterval(presenceInterval)
      clearInterval(clockInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  const getMemberTasks = (memberId) => tasks.filter(t => t.owner_id === memberId && t.status !== 'done')
  const getInProgressTask = (memberId) => tasks.find(t => t.owner_id === memberId && t.status === 'progress')

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    waiting: tasks.filter(t => t.status === 'waiting').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              <h1 className="text-xl font-semibold">Live Now</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-3)]">
            <Clock className="w-4 h-4" />
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tasks', value: stats.total, color: '#6366f1' },
                  { label: 'In Progress', value: stats.progress, color: '#3b82f6' },
                  { label: 'Waiting', value: stats.waiting, color: '#f59e0b' },
                  { label: 'Completed', value: stats.done, color: '#10b981' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
                    <p className="text-xs text-[var(--color-text-3)] mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Overall Progress</h2>
                  <span className="text-sm text-[var(--color-text-3)]">
                    {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% complete
                  </span>
                </div>
                <div className="w-full h-3 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }}
                    initial={{ width: 0 }}
                    animate={{ width: stats.total ? `${(stats.done / stats.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut' }} />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-3)]">
                  <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-[#71717a] text-[#71717a]" />{stats.todo} to do</span>
                  <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-[#3b82f6] text-[#3b82f6]" />{stats.progress} in progress</span>
                  <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-[#f59e0b] text-[#f59e0b]" />{stats.waiting} waiting</span>
                  <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-[#10b981] text-[#10b981]" />{stats.done} done</span>
                </div>
              </div>

              {/* Team activity */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-accent-2)]" />
                  <h2 className="font-semibold">Team Activity</h2>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {members.map((member, i) => {
                    const activeTasks = getMemberTasks(member.id)
                    const currentTask = getInProgressTask(member.id)
                    const isMe = member.id === profile?.id
                    return (
                      <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 px-5 py-4">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: stringToColor(member.name) }}>
                            {getInitials(member.name)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-surface)] ${currentTask ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-4)]'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium">{member.name || 'Unknown'}</p>
                            {isMe && <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-glow)] text-[var(--color-accent-2)]">You</span>}
                            <span className="text-xs text-[var(--color-text-4)] capitalize">{member.role || 'member'}</span>
                          </div>
                          {currentTask ? (
                            <p className="text-xs text-[var(--color-text-3)] truncate">
                              <span className="text-[var(--color-success)]">● </span>Working on: {currentTask.name}
                            </p>
                          ) : activeTasks.length > 0 ? (
                            <p className="text-xs text-[var(--color-text-3)]">{activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''} pending</p>
                          ) : (
                            <p className="text-xs text-[var(--color-text-4)]">No active tasks</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-3)]">
                            <CheckSquare className="w-3 h-3" />
                            {activeTasks.length} open
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  {members.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-sm text-[var(--color-text-3)]">No team members found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}