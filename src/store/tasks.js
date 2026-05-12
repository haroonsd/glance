import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  trashedTasks: [],
  projects: [],
  loading: false,

  fetchTasks: async (projectId) => {
    set({ loading: true })
    let query = supabase.from('tasks').select('*').eq('deleted', false).order('created_at', { ascending: true })
    if (projectId) query = query.eq('project_id', projectId)
    const { data, error } = await query
    if (!error) set({ tasks: data || [] })
    set({ loading: false })
  },

  fetchTrashed: async () => {
    const { data, error } = await supabase.from('tasks').select('*').eq('deleted', true).order('updated_at', { ascending: false })
    if (!error) set({ trashedTasks: data || [] })
  },

  fetchProjects: async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true })
    if (!error) set({ projects: data || [] })
  },

  addTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([{ ...task, extra: task.extra || {} }]).select().single()
    if (error) throw error
    set((s) => ({ tasks: [...s.tasks, data] }))
    return data
  },

  updateTask: async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (error) throw error
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) }))
    return data
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').update({ deleted: true }).eq('id', id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  restoreTask: async (id) => {
    const { data, error } = await supabase.from('tasks').update({ deleted: false }).eq('id', id).select().single()
    if (error) throw error
    set((s) => ({ trashedTasks: s.trashedTasks.filter((t) => t.id !== id) }))
    return data
  },

  permanentDelete: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ trashedTasks: s.trashedTasks.filter((t) => t.id !== id) }))
  },

  addProject: async (name) => {
    const { data, error } = await supabase.from('projects').insert([{ name }]).select().single()
    if (error) throw error
    set((s) => ({ projects: [...s.projects, data] }))
    return data
  },

  addSubtask: async (taskId, name) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtasks = task.extra?.subtasks || []
    const newSub = { id: Date.now().toString(), name, done: false }
    return get().updateTask(taskId, { extra: { ...task.extra, subtasks: [...subtasks, newSub] } })
  },

  toggleSubtask: async (taskId, subId) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtasks = (task.extra?.subtasks || []).map(s => s.id === subId ? { ...s, done: !s.done } : s)
    return get().updateTask(taskId, { extra: { ...task.extra, subtasks } })
  },

  deleteSubtask: async (taskId, subId) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const subtasks = (task.extra?.subtasks || []).filter(s => s.id !== subId)
    return get().updateTask(taskId, { extra: { ...task.extra, subtasks } })
  },

  subscribeToTasks: () => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        if (eventType === 'INSERT' && !newRow.deleted) {
          set((s) => ({ tasks: [...s.tasks.filter(t => t.id !== newRow.id), newRow] }))
        }
        if (eventType === 'UPDATE') {
          if (newRow.deleted) {
            set((s) => ({ tasks: s.tasks.filter((t) => t.id !== newRow.id) }))
          } else {
            set((s) => ({ tasks: s.tasks.map((t) => t.id === newRow.id ? newRow : t) }))
          }
        }
        if (eventType === 'DELETE') {
          set((s) => ({ tasks: s.tasks.filter((t) => t.id !== oldRow.id) }))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  },
}))