import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

function AppShell({ children, actions }) {
  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar actions={actions} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-5">{children}</div>
        </main>
        <footer className="shrink-0 border-t border-line py-3 text-center text-xs text-ink-muted">
          © 2026 SmartEnglish AI — Trang quản trị nội bộ
        </footer>
      </div>
    </div>
  )
}

export default AppShell
