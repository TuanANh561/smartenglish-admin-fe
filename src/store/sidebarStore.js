import { create } from 'zustand'

const STORAGE_KEY = 'smartenglish_sidebar_collapsed'

export const useSidebarStore = create((set) => ({
  isCollapsed: (() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })(),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.isCollapsed
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return { isCollapsed: next }
    }),

  setCollapsed: (collapsed) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore
    }
    set({ isCollapsed: Boolean(collapsed) })
  },
}))
