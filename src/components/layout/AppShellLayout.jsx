import { Outlet } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'

function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default AppShellLayout
