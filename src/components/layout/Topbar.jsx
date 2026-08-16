import { Calendar, Download } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { ROUTE_META } from '@/components/layout/navConfig'

function Topbar({ actions }) {
  const { pathname } = useLocation()
  const meta = ROUTE_META[pathname] ?? { title: 'Trang quản trị', description: '' }

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-surface px-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-700">{meta.title}</h1>
        {meta.description && <p className="text-sm text-ink-muted">{meta.description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions ?? (
          <>
            <Button variant="secondary" size="sm" icon={Calendar}>
              01/08 - 31/08/2026
            </Button>
            <Button size="sm" icon={Download}>
              Xuất CSV
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

export default Topbar
