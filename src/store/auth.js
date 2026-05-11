import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      signIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        set({ user: data.user })
        await get().fetchProfile()
        return data
      },

      signUp: async ({ email, password, name }) => {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, email, name, role: 'member' })
        }
        set({ user: data.user })
        return data
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      fetchProfile: async () => {
        const user = get().user
        if (!user) return
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) set({ profile: data })
      },

      updateProfile: async (updates) => {
        const user = get().user
        if (!user) return
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
        if (error) throw error
        set({ profile: data })
        return data
      },

      init: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          set({ user: session.user, loading: false })
          await get().fetchProfile()
        } else {
          set({ loading: false })
        }
        supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            set({ user: session.user })
            get().fetchProfile()
          } else {
            set({ user: null, profile: null })
          }
        })
      },
    }),
    { name: 'glance-auth', partialize: (state) => ({ profile: state.profile }) }
  )
)