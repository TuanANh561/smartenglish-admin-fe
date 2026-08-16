import { create } from 'zustand'
import { setTokens, clearTokens } from '@/lib/api'

/**
 * Chỉ giữ `user` trong bộ nhớ — access/refresh token nằm trong localStorage
 * (xem lib/api.js). Sau F5, `useInitAuth` sẽ nạp lại `user` bằng token đang có.
 */
export const useAuthStore = create((set) => ({
  user: null,
  initialized: false,

  setSession: ({ user, accessToken, refreshToken }) => {
    setTokens({ accessToken, refreshToken })
    set({ user, initialized: true })
  },
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
  clearSession: () => {
    clearTokens()
    set({ user: null, initialized: true })
  },
}))

// Refresh token cũng hết hạn giữa lúc dùng app → api.js phát sự kiện này,
// authStore tự xoá phiên để ProtectedRoute đưa người dùng về /dang-nhap.
if (typeof window !== 'undefined') {
  window.addEventListener('se-admin:unauthorized', () => {
    useAuthStore.getState().clearSession()
  })
}
