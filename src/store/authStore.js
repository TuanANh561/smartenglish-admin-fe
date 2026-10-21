import { create } from 'zustand'
import { setTokens, clearTokens, TOKEN_KEY } from '@/lib/api'

/**
 * Quản lý phiên làm việc của Quản trị viên / Giáo viên.
 * Thông tin user được lưu trong localStorage ('se_admin_user') và đồng bộ từ auth-service (/users/me).
 * Token (access + refresh) do lib/api.js quản lý.
 */
const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('se_admin_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const hasStoredToken = () => {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY))
  } catch {
    return false
  }
}

const initialSavedUser = getStoredUser()
const hasToken = hasStoredToken()

export const useAuthStore = create((set) => ({
  user: initialSavedUser,
  // Nếu không có token, chắc chắn chưa đăng nhập -> initialized: true, user: null
  // Nếu có token, giữ initialized: false để useInitAuth xác thực với /users/me trước khi hiển thị dashboard
  initialized: !hasToken,

  setSession: ({ user, accessToken, refreshToken }) => {
    setTokens({ accessToken, refreshToken })
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('se_admin_user', JSON.stringify(user))
    }
    set({ user, initialized: true })
  },
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('se_admin_user', JSON.stringify(user))
    }
    set({ user, initialized: true })
  },
  setInitialized: (initialized) => set({ initialized }),
  clearSession: () => {
    clearTokens()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('se_admin_user')
      sessionStorage.removeItem('se_test_user_id')
    }
    set({ user: null, initialized: true })
  },
}))

export const initAuthEventListener = () => {
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('se-admin:unauthorized', () => {
      useAuthStore.getState().clearSession()
    })
  }
}

initAuthEventListener()

