import { create } from 'zustand'
import { setTokens, clearTokens } from '@/lib/api'

/**
 * Chỉ giữ `user` trong bộ nhớ — access/refresh token nằm trong localStorage
 * (xem lib/api.js). Sau F5, `useInitAuth` sẽ nạp lại `user` bằng token đang có.
 */
export const TEST_USERS = {
  1: {
    id: 1,
    displayName: 'Quản trị viên Hệ thống',
    email: 'admin@smartenglish.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    plan: 'lifetime',
  },
  2: {
    id: 2,
    displayName: 'Thầy John Smith',
    email: 'teacher.john@smartenglish.com',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    plan: 'premium_yearly',
  },
  3: {
    id: 3,
    displayName: 'Nguyễn Thế Anh',
    email: 'student.theanh@gmail.com',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    plan: 'premium_monthly',
  },
}

export const getInitialUser = () => {
  if (typeof window === 'undefined') return TEST_USERS[1]
  try {
    const params = new URLSearchParams(window.location.search)
    const queryUser = params.get('asUser') || params.get('userId') || params.get('as')
    if (queryUser) {
      const id =
        Number(queryUser) ||
        (queryUser.toLowerCase() === 'teacher'
          ? 2
          : queryUser.toLowerCase() === 'student'
          ? 3
          : 1)
      sessionStorage.setItem('se_test_user_id', String(id))
      return TEST_USERS[id] || TEST_USERS[1]
    }
    const savedId = sessionStorage.getItem('se_test_user_id')
    if (savedId && TEST_USERS[savedId]) {
      return TEST_USERS[savedId]
    }
  } catch {
    // ignore storage errors
  }
  return TEST_USERS[1]
}

export const DEFAULT_ADMIN_USER = TEST_USERS[1]

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  initialized: true,

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
