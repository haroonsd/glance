import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useTaskStore } from '../store/tasks'

export function TrashPage() {
  const { trashedTasks, fetchTrashed, restoreTask, permanentDelete } = useTaskStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrashed().then(() => setLoading(false))
  }, [])

  const handleRestore = async (id) => {
    try { await restoreTask(id); toast.success('Task restored') }
    catch { toast.error('Failed to restore') }
  }

  const handleDelete = async (id) => {
    try { await permanentDelete(id); toast.success('Permanently deleted') }
    catch { toast.error('Failed to delete') }
  }

  const daysLeft = (updatedAt) => {
    const expires = new Date(new Date(updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    return Math.max(0, Math.ceil((expires - new Date()) / (24 * 60 * 60 * 1000)))
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-semibold">Trash</h1>
          <p className="text-sm text-[var(--color-text-3)]">Deleted tasks are permanently removed after 7 days</p>
        </div>
        <div className="flex-1 overflow-auto p-6 max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : trashedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <Trash2 className="w-12 h-12 text-[var(--color-text-4)] mb-4" />
              <p className="text-[var(--color-text-2)] font-medium mb-1">Trash is empty</p>
              <p className="text-sm text-[var(--color-text-3)]">Deleted tasks appear here for 7 days</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {trashedTasks.map(task => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl group hover:border-[var(--color-border-2)] transition-all">
                    <Trash2 className="w-4 h-4 text-[var(--color-text-3)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-through text-[var(--color-text-2)] truncate">{task.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-[var(--color-warning)]" />
                        <p className="text-xs text-[var(--color-warning)]">{daysLeft(task.updated_at)} days until permanent deletion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleRestore(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors">
                        <RotateCcw className="w-3 h-3" />Restore
                      </button>
                      <button onClick={() => handleDelete(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 border border-[var(--color-danger)]/20 text-xs font-medium text-[var(--color-danger)] hover:bg-red-950/50 transition-colors">
                        <Trash2 className="w-3 h-3" />Delete forever
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}