import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import SelectionTranslator from '@/components/SelectionTranslator'
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

  // Ngăn trình duyệt mở hộp thoại "Lưu trang web dạng HTML" khi người dùng nhấn Ctrl + S
  useEffect(() => {
    const handleGlobalCtrlS = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleGlobalCtrlS)
    return () => window.removeEventListener('keydown', handleGlobalCtrlS)
  }, [])

  return (
    <AppShell>
      <Outlet />
      <SelectionTranslator />
    </AppShell>
  )
}

export default AppShellLayout

