import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { TOKEN_KEY } from '@/lib/api'
import * as authApi from '../api'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data)
      toast.success('Đăng nhập thành công')
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)

  return async () => {
    try {
      await authApi.logout()
    } catch {
      // Xoá phiên cục bộ ngay cả khi gọi API đăng xuất thất bại (mất mạng...).
    }
    clearSession()
  }
}

/**
 * Nạp lại phiên đăng nhập từ access token khi mở app (F5).
 * Gọi một lần ở ProtectedRoute — nếu access token đã hết hạn, `getMe()` sẽ
 * báo 401 và lib/api.js tự thử làm mới bằng refresh token trước khi thất bại hẳn.
 */
export function useInitAuth() {
  const initialized = useAuthStore((state) => state.initialized)
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    if (initialized) return

    if (!localStorage.getItem(TOKEN_KEY)) {
      setInitialized(true)
      return
    }

    authApi
      .getMe()
      .then((user) => {
        setUser(user)
        setInitialized(true)
      })
      .catch(() => clearSession())
  }, [initialized, setUser, setInitialized, clearSession])
}
