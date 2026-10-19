import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { stopAllAppAudio } from '@/lib/appAudioCoordinator'

function AppShellLayout() {
  const location = useLocation()

  // Dừng âm thanh khi chuyển route (URL pathname, query search, hoặc điều hướng lịch sử)
  useEffect(() => {
    stopAllAppAudio()
    return stopAllAppAudio
  }, [location.pathname, location.search, location.key])

  // Dừng âm thanh khi người dùng rời tab trình duyệt hoặc ẩn cửa sổ
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllAppAudio()
      }
    }

    const handlePopState = () => {
      stopAllAppAudio()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default AppShellLayout

