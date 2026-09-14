import { create } from 'zustand'
import { http } from '@/lib/api'

export const useChatStore = create((set, get) => ({
  totalUnreadCount: 0,
  typingMap: {},

  setTotalUnreadCount: (count) => set({ totalUnreadCount: Math.max(0, Number(count) || 0) }),

  incrementUnreadCount: (amount = 1) =>
    set((state) => ({ totalUnreadCount: state.totalUnreadCount + amount })),

  decrementUnreadCount: (amount = 1) =>
    set((state) => ({ totalUnreadCount: Math.max(0, state.totalUnreadCount - amount) })),

  fetchUnreadCount: async (userId) => {
    if (!userId) return
    try {
      const res = await http.get(`/api/v1/social/conversations/unread-count?userId=${userId}`)
      const count = res?.data?.unreadCount ?? res?.unreadCount ?? 0
      set({ totalUnreadCount: Math.max(0, Number(count) || 0) })
    } catch (err) {
      console.warn('Cannot fetch unread count from social-service:', err)
    }
  },

  setTyping: (conversationId, typingInfo) => {
    set((state) => ({
      typingMap: {
        ...state.typingMap,
        [conversationId]: typingInfo,
      },
    }))
  },

  clearTyping: (conversationId) => {
    set((state) => {
      const next = { ...state.typingMap }
      delete next[conversationId]
      return { typingMap: next }
    })
  },
}))
