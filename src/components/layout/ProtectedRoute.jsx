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

    if (user.role === 'student') {
      toast.error('Tài khoản học viên không có quyền truy cập trang quản trị.')
      clearSession()
      navigate('/dang-nhap', { replace: true })
      return
    }

    if (!isRouteAllowed(location.pathname, user.role)) {
      navigate('/app', { replace: true })
    }
  }, [location.pathname, navigate, user, initialized, clearSession])

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-sm text-ink-muted">
        Đang tải...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
