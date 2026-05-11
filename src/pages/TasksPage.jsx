import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Circle, ChevronDown, Calendar, User, Flag, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useTaskStore } from '../store/tasks'
import { useAuthStore } from '../store/auth'
import { cn, getInitials, stringToColor, formatRelativeTime } from '../lib/utils'

const STATUSES = [
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

function StatusBadge({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const status = STATUSES.find(s => s.value === value) || STATUSES[0]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-[var(--color-surface-3)]" style={{ color: status.color }}>
        <Circle className="w-2 h-2 fill-current" />
        {status.label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 mt-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 overflow-hidden min-w-32">
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => { onChange(s.value); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface-3)] transition-colors" style={{ color: s.color }}>
                <Circle className="w-2 h-2 fill-current" />{s.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PriorityBadge({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const priority = PRIORITIES.find(p => p.value === value) || PRIORITIES[0]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-[var(--color-surface-3)]" style={{ color: priority.color }}>
        <Flag className="w-3 h-3" />{priority.label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 mt-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 overflow-hidden min-w-28">
            {PRIORITIES.map(p => (
              <button key={p.value} onClick={() => { onChange(p.value); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface-3)] transition-colors" style={{ color: p.color }}>
                <Flag className="w-3 h-3" />{p.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskRow({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(task.name)

  const handleNameBlur = () => {
    setEditing(false)
    if (name !== task.name && name.trim()) onUpdate(task.id, { name: name.trim() })
    else setName(task.name)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
    >
      {/* Task name */}
      <td className="px-4 py-2.5 w-full">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={e => { if (e.key === 'Enter') handleNameBlur(); if (e.key === 'Escape') { setName(task.name); setEditing(false) } }}
            className="w-full bg-transparent text-sm text-[var(--color-text)] focus:outline-none border-b border-[var(--color-accent)]"
          />
        ) : (
          <span onClick={() => setEditing(true)} className={cn('text-sm cursor-text', task.status === 'done' ? 'line-through text-[var(--color-text-3)]' : 'text-[var(--color-text)]')}>
            {task.name}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <StatusBadge value={task.status} onChange={v => onUpdate(task.id, { status: v })} />
      </td>

      {/* Priority */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <PriorityBadge value={task.priority} onChange={v => onUpdate(task.id, { priority: v })} />
      </td>

      {/* Due date */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <input
          type="date"
          value={task.due_date || ''}
          onChange={e => onUpdate(task.id, { due_date: e.target.value || null })}
          className="text-xs text-[var(--color-text-2)] bg-transparent border-0 cursor-pointer hover:text-[var(--color-text)] focus:outline-none"
        />
      </td>

      {/* Delete */}
      <td className="px-2 py-2.5">
        <button onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-danger)]/20 text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </motion.tr>
  )
}

export function TasksPage() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, subscribeToTasks } = useTaskStore()
  const { profile } = useAuthStore()
  const [newTaskName, setNewTaskName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchTasks()
    const unsub = subscribeToTasks()
    return unsub
  }, [])

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return
    setAdding(true)
    try {
      await addTask({
        name: newTaskName.trim(),
        status: 'todo',
        priority: 'medium',
        due_date: null,
        project_id: 'proj-1',
        deleted: false,
      })
      setNewTaskName('')
    } catch (err) {
      toast.error('Failed to add task')
    } finally {
      setAdding(false)
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-xl font-semibold">My Tasks</h1>
            <p className="text-sm text-[var(--color-text-3)]">{tasks.length} tasks</p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-2 text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider">Task</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider">Status</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider">Priority</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider">Due Date</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {tasks.map(task => (
                    <TaskRow key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {/* Add task row */}
          <div className="flex items-center gap-2 mt-3 px-4">
            <Plus className="w-4 h-4 text-[var(--color-text-3)]" />
            <input
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }}
              placeholder="Add a task..."
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none py-2"
            />
            {newTaskName && (
              <button onClick={handleAddTask} disabled={adding}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-3)] transition-colors">
                {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}