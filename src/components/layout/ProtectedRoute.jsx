import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useInitAuth } from '@/features/auth/hooks/useAuth'
import { isRouteAllowed } from '@/components/layout/navConfig'

function ProtectedRoute() {
  useInitAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    if (!initialized || !user) return

    const userRole = String(user.role || '').trim().toLowerCase()
    if (userRole === 'student') {
      toast.error('Tài khoản học viên không có quyền truy cập trang quản trị.')
      clearSession()
      navigate('/dang-nhap', { replace: true })
      return
    }

    if (!isRouteAllowed(location.pathname, userRole)) {
      if (location.pathname !== '/app') {
        navigate('/app', { replace: true })
      }
    }
  }, [location.pathname, navigate, user, initialized, clearSession])

  if (!initialized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-sm text-ink-muted">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="font-medium text-ink">Đang xác thực phiên làm việc...</p>
        <button
          type="button"
          onClick={() => {
            clearSession()
            navigate('/dang-nhap', { replace: true })
          }}
          className="text-xs text-brand-600 underline hover:text-brand-700 cursor-pointer pt-2"
        >
          Nếu chờ quá lâu, bấm vào đây để về trang Đăng nhập
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
