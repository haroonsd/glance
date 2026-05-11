import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, Trash2, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useTaskStore } from '../store/tasks'
import { cn } from '../lib/utils'

export function ProjectsPage() {
  const { projects, tasks, fetchProjects, fetchTasks, addProject, deleteTask } = useTaskStore()
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProjects(), fetchTasks()])
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const p = await addProject(newName.trim())
      setNewName('')
      setAdding(false)
      toast.success('Project created')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const projectTasks = (pid) => tasks.filter(t => t.project_id === pid)

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-[var(--color-text-3)]">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-3)] transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {adding && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-2xl p-5">
                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName('') } }}
                      placeholder="Project name..."
                      className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none mb-4 text-lg font-medium" />
                    <div className="flex gap-2">
                      <button onClick={handleAdd} disabled={creating}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-3)] transition-colors">
                        {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                      </button>
                      <button onClick={() => { setAdding(false); setNewName('') }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] transition-colors">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {projects.map(p => {
                  const ptasks = projectTasks(p.id)
                  const done = ptasks.filter(t => t.status === 'done').length
                  const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelected(selected === p.id ? null : p.id)}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 cursor-pointer hover:border-[var(--color-border-2)] hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/20 flex items-center justify-center">
                          <FolderKanban className="w-5 h-5 text-[var(--color-accent-2)]" />
                        </div>
                        <ChevronRight className={cn('w-4 h-4 text-[var(--color-text-3)] transition-transform', selected === p.id && 'rotate-90')} />
                      </div>
                      <h3 className="font-semibold mb-1">{p.name}</h3>
                      <p className="text-xs text-[var(--color-text-3)] mb-4">{ptasks.length} task{ptasks.length !== 1 ? 's' : ''} · {done} done</p>
                      <div className="w-full h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[var(--color-accent)] rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                      </div>
                      <p className="text-xs text-[var(--color-text-3)] mt-1.5">{pct}% complete</p>

                      <AnimatePresence>
                        {selected === p.id && ptasks.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                            {ptasks.slice(0, 5).map(t => (
                              <div key={t.id} className="flex items-center gap-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                                  background: t.status === 'done' ? '#10b981' : t.status === 'progress' ? '#3b82f6' : t.status === 'waiting' ? '#f59e0b' : '#71717a'
                                }} />
                                <span className={cn('flex-1 truncate', t.status === 'done' && 'line-through text-[var(--color-text-3)]')}>{t.name}</span>
                              </div>
                            ))}
                            {ptasks.length > 5 && <p className="text-xs text-[var(--color-text-3)]">+{ptasks.length - 5} more</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {projects.length === 0 && !adding && (
                <div className="col-span-3 flex flex-col items-center justify-center h-60 text-center">
                  <FolderKanban className="w-12 h-12 text-[var(--color-text-4)] mb-4" />
                  <p className="text-[var(--color-text-2)] font-medium mb-1">No projects yet</p>
                  <p className="text-sm text-[var(--color-text-3)]">Create your first project to get started</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}