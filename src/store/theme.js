import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: true,
      toggle: () => {
        const next = !get().dark
        set({ dark: next })
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      },
      init: () => {
        const { dark } = get()
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
      },
    }),
    { name: 'glance-theme' }
  )
)