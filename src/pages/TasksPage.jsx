import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Circle, Flag, Trash2, Loader2, LayoutList, Kanban, MoreHorizontal, ChevronRight, Check, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '../components/AppLayout'
import { useTaskStore } from '../store/tasks'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

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

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'done') return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function Dropdown({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = (e) => setOpen(false)
    setTimeout(() => document.addEventListener('mousedown', close), 0)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div className="relative">
      <div onMouseDown={(e) => { e.stopPropagation(); setOpen(!open) }}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.12 }}
            className={cn('absolute top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden min-w-36 py-1', align === 'right' ? 'right-0' : 'left-0')}
            onMouseDown={e => e.stopPropagation()}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DItem({ children, onClick, className }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface-2)] transition-colors text-left text-[var(--color-text-2)] hover:text-[var(--color-text)]', className)}>
      {children}
    </button>
  )
}

function StatusBadge({ value, onChange }) {
  const s = STATUSES.find(x => x.value === value) || STATUSES[0]
  return (
    <Dropdown trigger={
      <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-[var(--color-surface-3)] transition-colors whitespace-nowrap" style={{ color: s.color }}>
        <Circle className="w-2 h-2 fill-current shrink-0" />{s.label}
      </button>
    }>
      {STATUSES.map(x => <DItem key={x.value} onClick={() => onChange(x.value)}><Circle className="w-2 h-2 fill-current shrink-0" style={{ color: x.color }} /><span style={{ color: x.color }}>{x.label}</span></DItem>)}
    </Dropdown>
  )
}

function PriorityBadge({ value, onChange }) {
  const p = PRIORITIES.find(x => x.value === value) || PRIORITIES[0]
  return (
    <Dropdown trigger={
      <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-[var(--color-surface-3)] transition-colors whitespace-nowrap" style={{ color: p.color }}>
        <Flag className="w-3 h-3 shrink-0" />{p.label}
      </button>
    }>
      {PRIORITIES.map(x => <DItem key={x.value} onClick={() => onChange(x.value)}><Flag className="w-3 h-3 shrink-0" style={{ color: x.color }} /><span style={{ color: x.color }}>{x.label}</span></DItem>)}
    </Dropdown>
  )
}

function TaskRow({ task, onUpdate, onDelete, onAddSubtask, onToggleSubtask, onDeleteSubtask, members }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(task.name)
  const [showSubs, setShowSubs] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const overdue = isOverdue(task.due_date, task.status)
  const subtasks = task.extra?.subtasks || []

  const handleNameBlur = () => {
    setEditing(false)
    if (name !== task.name && name.trim()) onUpdate(task.id, { name: name.trim() })
    else setName(task.name)
  }

  const handleAddSub = () => {
    if (!newSubName.trim()) return
    onAddSubtask(task.id, newSubName.trim())
    setNewSubName('')
  }

  return (
    <>
      <tr className={cn('group border-b border-[var(--color-border)] transition-colors', task.is_live ? 'bg-emerald-950/20' : 'hover:bg-[var(--color-surface-2)]')}>
        {/* Checkbox */}
        <td className="w-8 px-2 py-2.5 text-center">
          <button onClick={() => onUpdate(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
            className={cn('w-4 h-4 rounded border-2 flex items-center justify-center mx-auto transition-all', task.status === 'done' ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-border-2)] hover:border-[var(--color-accent)]')}>
            {task.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
        </td>

        {/* Live dot */}
        <td className="w-7 px-1 py-2.5 text-center">
          <button onClick={() => onUpdate(task.id, { is_live: !task.is_live })} title={task.is_live ? 'Stop live' : 'Mark live'}
            className="mx-auto flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--color-surface-3)] transition-colors">
            <motion.div animate={task.is_live ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
              className={cn('w-2 h-2 rounded-full', task.is_live ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-2)] group-hover:bg-[var(--color-text-4)]')} />
          </button>
        </td>

        {/* Expand + Name */}
        <td className="px-2 py-2.5 min-w-52">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSubs(!showSubs)} className="shrink-0 text-[var(--color-text-4)] hover:text-[var(--color-text-2)] transition-colors">
              <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', showSubs && 'rotate-90')} />
            </button>
            {editing ? (
              <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur}
                onKeyDown={e => { if (e.key === 'Enter') handleNameBlur(); if (e.key === 'Escape') { setName(task.name); setEditing(false) } }}
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] focus:outline-none border-b border-[var(--color-accent)] min-w-0" />
            ) : (
              <div className="flex-1 min-w-0">
                <span onClick={() => setEditing(true)} className={cn('text-sm cursor-text block truncate', task.status === 'done' ? 'line-through text-[var(--color-text-3)]' : 'text-[var(--color-text)]')}>{task.name}</span>
                {subtasks.length > 0 && <span className="text-xs text-[var(--color-text-3)]">{subtasks.filter(s => s.done).length}/{subtasks.length} subtasks</span>}
              </div>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="px-1 py-2.5 whitespace-nowrap">
          <StatusBadge value={task.status} onChange={v => onUpdate(task.id, { status: v })} />
        </td>

        {/* Priority */}
        <td className="px-1 py-2.5 whitespace-nowrap">
          <PriorityBadge value={task.priority} onChange={v => onUpdate(task.id, { priority: v })} />
        </td>

        {/* Due date */}
        <td className="px-2 py-2.5 whitespace-nowrap">
          <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-2)]')}>
            {overdue && <AlertCircle className="w-3 h-3 shrink-0" />}
            <input type="date" value={task.due_date || ''} onChange={e => onUpdate(task.id, { due_date: e.target.value || null })}
              className={cn('bg-transparent border-0 cursor-pointer focus:outline-none text-xs', overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-2)] hover:text-[var(--color-text)]')} />
          </div>
        </td>

        {/* Owner */}
        <td className="px-2 py-2.5 whitespace-nowrap">
          <Dropdown trigger={
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-[var(--color-surface-3)] transition-colors">
              {task.owner_id ? (
                <><div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[9px] font-bold shrink-0">{(members.find(m => m.id === task.owner_id)?.name || '?')[0]?.toUpperCase()}</div><span className="text-[var(--color-text-2)]">{members.find(m => m.id === task.owner_id)?.name?.split(' ')[0] || '?'}</span></>
              ) : <span className="text-[var(--color-text-4)]">Assign</span>}
            </button>
          }>
            <DItem onClick={() => onUpdate(task.id, { owner_id: null })}><X className="w-3 h-3" />Unassign</DItem>
            {members.map(m => (
              <DItem key={m.id} onClick={() => onUpdate(task.id, { owner_id: m.id })}>
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[9px] font-bold shrink-0">{m.name?.[0]?.toUpperCase()}</div>{m.name}
              </DItem>
            ))}
          </Dropdown>
        </td>

        {/* Actions */}
        <td className="px-1 py-2.5 w-8">
          <Dropdown align="right" trigger={
            <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-text-3)] transition-all">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          }>
            <DItem onClick={() => onUpdate(task.id, { status: 'done' })}><Check className="w-3 h-3" />Mark done</DItem>
            <DItem onClick={() => onUpdate(task.id, { is_live: !task.is_live })}><div className={cn('w-2 h-2 rounded-full shrink-0', task.is_live ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-2)]')} />{task.is_live ? 'Stop live' : 'Mark live'}</DItem>
            <div className="h-px bg-[var(--color-border)] my-1" />
            <DItem onClick={() => onDelete(task.id)} className="text-[var(--color-danger)] hover:bg-red-950/30"><Trash2 className="w-3 h-3" />Move to trash</DItem>
          </Dropdown>
        </td>
      </tr>

      {/* Subtasks */}
      <AnimatePresence>
        {showSubs && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={8} className="p-0 border-b border-[var(--color-border)]">
              <table className="w-full">
                <tbody>
                  {subtasks.map(sub => (
                    <tr key={sub.id} className="group/sub bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                      <td className="w-8 px-2 py-1.5 text-center">
                        <button onClick={() => onToggleSubtask(task.id, sub.id)}
                          className={cn('w-3.5 h-3.5 rounded border-2 flex items-center justify-center mx-auto transition-all', sub.done ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-border-2)] hover:border-[var(--color-accent)]')}>
                          {sub.done && <Check className="w-2 h-2 text-white" />}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 pl-14" colSpan={6}>
                        <span className={cn('text-xs', sub.done ? 'line-through text-[var(--color-text-3)]' : 'text-[var(--color-text-2)]')}>{sub.name}</span>
                      </td>
                      <td className="px-1 py-1.5 w-8">
                        <button onClick={() => onDeleteSubtask(task.id, sub.id)}
                          className="opacity-0 group-hover/sub:opacity-100 p-1 rounded hover:bg-red-950/30 text-[var(--color-text-4)] hover:text-[var(--color-danger)] transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--color-surface-2)]">
                    <td className="w-8 px-2 py-1.5"></td>
                    <td className="px-2 py-1.5 pl-14" colSpan={7}>
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-[var(--color-text-4)]" />
                        <input value={newSubName} onChange={e => setNewSubName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddSub(); if (e.key === 'Escape') setNewSubName('') }}
                          placeholder="Add subtask... (Enter)"
                          className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

function BoardView({ tasks, onUpdate, onDelete, onAddTask }) {
  const [newNames, setNewNames] = useState({})
  const [adding, setAdding] = useState({})

  const handleAdd = async (status) => {
    const name = newNames[status]?.trim()
    if (!name) return
    await onAddTask({ name, status, priority: 'medium', due_date: null, project_id: 'proj-1', deleted: false, is_live: false, extra: {} })
    setNewNames(n => ({ ...n, [status]: '' }))
    setAdding(a => ({ ...a, [status]: false }))
  }

  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full items-start">
      {STATUSES.map(col => {
        const colTasks = tasks.filter(t => t.status === col.value)
        return (
          <div key={col.value} className="flex flex-col gap-3 min-w-64 w-64 shrink-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Circle className="w-2.5 h-2.5 fill-current shrink-0" style={{ color: col.color }} />
                <span className="text-sm font-medium">{col.label}</span>
                <span className="text-xs text-[var(--color-text-3)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <button onClick={() => setAdding(a => ({ ...a, [col.value]: true }))}
                className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 min-h-12">
              <AnimatePresence>
                {colTasks.map(task => (
                  <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-[var(--color-border-2)] hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className={cn('text-sm font-medium flex-1 leading-snug', task.status === 'done' && 'line-through text-[var(--color-text-3)]')}>{task.name}</p>
                      <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950/30 text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-all shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-0.5 text-xs" style={{ color: PRIORITIES.find(p => p.value === task.priority)?.color || '#71717a' }}>
                        <Flag className="w-2.5 h-2.5" />{task.priority || 'low'}
                      </span>
                      {task.due_date && (
                        <span className={cn('text-xs', isOverdue(task.due_date, task.status) ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-3)]')}>
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {adding[col.value] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-xl p-3">
                    <input autoFocus value={newNames[col.value] || ''} onChange={e => setNewNames(n => ({ ...n, [col.value]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleAdd(col.value); if (e.key === 'Escape') setAdding(a => ({ ...a, [col.value]: false })) }}
                      placeholder="Task name..." className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none mb-2" />
                    <div className="flex gap-2">
                      <button onClick={() => handleAdd(col.value)} className="text-xs px-2 py-1 rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-3)]">Add</button>
                      <button onClick={() => setAdding(a => ({ ...a, [col.value]: false }))} className="text-xs px-2 py-1 rounded bg-[var(--color-surface-2)] text-[var(--color-text-2)]">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TasksPage() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, subscribeToTasks, addSubtask, toggleSubtask, deleteSubtask } = useTaskStore()
  const [newTaskName, setNewTaskName] = useState('')
  const [adding, setAdding] = useState(false)
  const [view, setView] = useState('table')
  const [members, setMembers] = useState([])
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    fetchTasks()
    const unsub = subscribeToTasks()
    supabase.from('profiles').select('id, name, email').then(({ data }) => { if (data) setMembers(data) })
    return unsub
  }, [])

  const handleAddTask = async (taskData) => {
    if (taskData && typeof taskData === 'object' && taskData.name) {
      try { await addTask(taskData) } catch (err) { toast.error('Failed: ' + err.message) }
      return
    }
    if (!newTaskName.trim()) return
    setAdding(true)
    try {
      await addTask({ name: newTaskName.trim(), status: 'todo', priority: 'medium', due_date: null, project_id: 'proj-1', deleted: false, is_live: false, extra: {} })
      setNewTaskName('')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally { setAdding(false) }
  }

  const handleUpdate = async (id, updates) => {
    try { await updateTask(id, updates) }
    catch (err) { toast.error('Failed: ' + err.message) }
  }

  const handleDelete = async (id) => {
    try { await deleteTask(id); toast.success('Moved to trash') }
    catch { toast.error('Failed to delete') }
  }

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h1 className="text-xl font-semibold">My Tasks</h1>
            <p className="text-sm text-[var(--color-text-3)]">{activeTasks.length} active · {doneTasks.length} done</p>
          </div>
          <div className="flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-1 gap-1">
            <button onClick={() => setView('table')} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all', view === 'table' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-3)] hover:text-[var(--color-text)]')}>
              <LayoutList className="w-3.5 h-3.5" />Table
            </button>
            <button onClick={() => setView('board')} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all', view === 'board' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-3)] hover:text-[var(--color-text)]')}>
              <Kanban className="w-3.5 h-3.5" />Board
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>
        ) : view === 'board' ? (
          <div className="flex-1 overflow-hidden">
            <BoardView tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} onAddTask={handleAddTask} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-[var(--color-surface)] z-10 border-b border-[var(--color-border)]">
                <tr>
                  <th className="w-8 px-2 py-2.5"></th>
                  <th className="w-7 px-1 py-2.5"></th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider">Task</th>
                  <th className="text-left px-1 py-2.5 text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-1 py-2.5 text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider whitespace-nowrap">Priority</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider whitespace-nowrap">Due Date</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-[var(--color-text-3)] uppercase tracking-wider whitespace-nowrap">Owner</th>
                  <th className="w-8 px-1 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {activeTasks.map(task => (
                    <TaskRow key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete}
                      onAddSubtask={addSubtask} onToggleSubtask={toggleSubtask} onDeleteSubtask={deleteSubtask} members={members} />
                  ))}
                </AnimatePresence>

                <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                  <td colSpan={8} className="px-4 py-2">
                    <div className="flex items-center gap-2 pl-10">
                      <Plus className="w-3.5 h-3.5 text-[var(--color-text-4)] shrink-0" />
                      <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }}
                        placeholder="Add a task... (press Enter)"
                        className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-4)] focus:outline-none py-1.5" />
                      {newTaskName && (
                        <button onClick={handleAddTask} disabled={adding}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-3)] transition-colors shrink-0">
                          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {doneTasks.length > 0 && (
                  <>
                    <tr className="border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors" onClick={() => setShowDone(!showDone)}>
                      <td colSpan={8} className="px-4 py-2.5 bg-[var(--color-surface-2)]">
                        <div className="flex items-center gap-2 pl-8">
                          <ChevronRight className={cn('w-3.5 h-3.5 text-[var(--color-text-3)] transition-transform', showDone && 'rotate-90')} />
                          <span className="text-xs font-bold text-[var(--color-text-3)] uppercase tracking-wider">Done</span>
                          <span className="text-xs bg-[var(--color-surface-3)] text-[var(--color-text-3)] px-2 py-0.5 rounded-full font-medium">{doneTasks.length}</span>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {showDone && doneTasks.map(task => (
                        <TaskRow key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete}
                          onAddSubtask={addSubtask} onToggleSubtask={toggleSubtask} onDeleteSubtask={deleteSubtask} members={members} />
                      ))}
                    </AnimatePresence>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}