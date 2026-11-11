import { create } from 'zustand'
import toast from 'react-hot-toast'
import { setTokens, clearTokens, TOKEN_KEY } from '@/lib/api'

const USER_KEY = 'se_admin_user'

/**
 * Quản lý phiên làm việc của Quản trị viên / Giáo viên.
 * Thông tin user được lưu trong localStorage ('se_admin_user') và đồng bộ từ auth-service (/users/me).
 * Token (access + refresh) do lib/api.js quản lý.
 */
const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
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

const readUserId = (raw) => {
  try {
    return raw ? JSON.parse(raw)?.id ?? null : null
  } catch {
    return null
  }
}

export const initAuthEventListener = () => {
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('se-admin:unauthorized', (event) => {
      const hadSession = Boolean(useAuthStore.getState().user)
      useAuthStore.getState().clearSession()
      const reason = event?.detail?.reason
      // Nhiều request cùng lỗi một lúc → chỉ hiện một thông báo
      if (hadSession && reason) toast.error(reason, { id: 'session-ended', duration: 6000 })
    })

    // Đồng bộ phiên giữa các tab (localStorage dùng chung): tab khác đăng xuất hoặc đổi tài khoản
    // thì tab này tải lại theo phiên hiện hành — tránh hiển thị admin nhưng gửi request bằng token giáo viên.
    // Làm mới access token của cùng một user không làm tải lại.
    window.addEventListener('storage', (event) => {
      if (event.storageArea !== window.localStorage) return
      const loggedOut = event.key === TOKEN_KEY && !event.newValue
      const switchedUser = event.key === USER_KEY && readUserId(event.oldValue) !== readUserId(event.newValue)
      if (event.key === null || loggedOut || switchedUser) {
        window.location.reload()
      }
    })
  }
}

initAuthEventListener()

