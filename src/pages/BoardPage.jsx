import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Circle, Flag, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useTaskStore } from '../store/tasks'
import { cn } from '../lib/utils'

const COLUMNS = [
  { value: 'todo', label: 'To Do', color: '#71717a' },
  { value: 'progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'waiting', label: 'Waiting', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#10b981' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#71717a' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
]

function KanbanCard({ task, onUpdate, onDelete }) {
  const priority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[0]
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 cursor-pointer hover:border-[var(--color-border-2)] hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className={cn('text-sm font-medium flex-1', task.status === 'done' ? 'line-through text-[var(--color-text-3)]' : 'text-[var(--color-text)]')}>
          {task.name}
        </p>
        <button onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-danger)]/20 text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-all shrink-0">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: priority.color }}>
          <Flag className="w-3 h-3" />{priority.label}
        </span>
        {task.due_date && (
          <span className="text-xs text-[var(--color-text-3)]">
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function KanbanColumn({ column, tasks, onUpdate, onDelete, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    await onAdd(newName.trim(), column.value)
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-3 min-w-64 w-64">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Circle className="w-2.5 h-2.5 fill-current" style={{ color: column.color }} />
          <span className="text-sm font-medium text-[var(--color-text)]">{column.label}</span>
          <span className="text-xs text-[var(--color-text-3)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={() => setAdding(true)} className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2 min-h-20">
        <AnimatePresence>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-xl p-3">
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName('') } }}
                placeholder="Task name..."
                className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none mb-2" />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="text-xs px-2 py-1 rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-3)] transition-colors">Add</button>
                <button onClick={() => { setAdding(false); setNewName('') }} className="text-xs px-2 py-1 rounded bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function BoardPage() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, subscribeToTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
    const unsub = subscribeToTasks()
    return unsub
  }, [])

  const handleAdd = async (name, status) => {
    try {
      await addTask({ name, status, priority: 'medium', due_date: null, project_id: 'proj-1', deleted: false })
    } catch (err) {
      toast.error('Failed to add task: ' + err.message)
    }
  }

  const handleUpdate = async (id, updates) => {
    try { await updateTask(id, updates) }
    catch { toast.error('Failed to update task') }
  }

  const handleDelete = async (id) => {
    try { await deleteTask(id); toast.success('Task deleted') }
    catch { toast.error('Failed to delete task') }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-xl font-semibold">Board</h1>
            <p className="text-sm text-[var(--color-text-3)]">{tasks.length} tasks across {COLUMNS.length} columns</p>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <div className="flex gap-4 h-full">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.value}
                  column={col}
                  tasks={tasks.filter(t => t.status === col.value)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}