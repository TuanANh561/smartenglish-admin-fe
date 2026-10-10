import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { stopAllAppAudio } from '@/lib/appAudioCoordinator'

function AppShellLayout() {
  const location = useLocation()

  useEffect(() => {
    stopAllAppAudio()
    return stopAllAppAudio
  }, [location.pathname])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default AppShellLayout
