import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { TOKEN_KEY } from '@/lib/api'
import * as authApi from '../api'

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const role = String(data?.user?.role || '').trim().toLowerCase()
      if (role === 'student') {
        clearSession()
        throw new Error('Tài khoản học viên không thể truy cập trang quản trị.')
      }
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
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (!token) {
      clearSession()
      setInitialized(true)
      return
    }

    authApi
      .getMe()
      .then((me) => {
        const role = String(me?.role || '').trim().toLowerCase()
        if (!me || role === 'student') {
          toast.error('Tài khoản học viên không thể truy cập trang quản trị.')
          clearSession()
        } else {
          setUser(me)
          setInitialized(true)
        }
      })
      .catch((err) => {
        // Nếu token bị từ chối hoặc hết hạn, dọn sạch phiên làm việc
        if (err?.status === 401 || err?.status === 403 || err?.status === 409) {
          clearSession()
        }
        setInitialized(true)
      })
  }, [setUser, setInitialized, clearSession])
}
