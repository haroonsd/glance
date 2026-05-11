import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  projects: [],
  loading: false,

  fetchTasks: async (projectId) => {
    set({ loading: true })
    const query = supabase.from('tasks').select('*').eq('deleted', false).order('created_at', { ascending: true })
    if (projectId) query.eq('project_id', projectId)
    const { data, error } = await query
    if (!error) set({ tasks: data || [] })
    set({ loading: false })
  },

  fetchProjects: async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true })
    if (!error) set({ projects: data || [] })
  },

  addTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single()
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

  addProject: async (name) => {
    const { data, error } = await supabase.from('projects').insert([{ name }]).select().single()
    if (error) throw error
    set((s) => ({ projects: [...s.projects, data] }))
    return data
  },

  subscribeToTasks: () => {
    const channel = supabase.channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        if (eventType === 'INSERT') set((s) => ({ tasks: [...s.tasks, newRow] }))
        if (eventType === 'UPDATE') set((s) => ({ tasks: s.tasks.map((t) => t.id === newRow.id ? newRow : t) }))
        if (eventType === 'DELETE') set((s) => ({ tasks: s.tasks.filter((t) => t.id !== oldRow.id) }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  },
}))