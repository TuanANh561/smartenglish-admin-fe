import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useInitAuth } from '@/features/auth/hooks/useAuth'
import { isRouteAllowed } from '@/components/layout/navConfig'

function ProtectedRoute() {
  useInitAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    if (user && !isRouteAllowed(location.pathname, user.role)) {
      navigate('/', { replace: true })
    }
  }, [location.pathname, navigate, user])

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
