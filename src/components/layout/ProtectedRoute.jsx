import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useInitAuth } from '@/features/auth/hooks/useAuth'

function ProtectedRoute() {
  useInitAuth()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)

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
