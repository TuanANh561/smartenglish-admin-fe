import { ChevronDown, GraduationCap, LogOut } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'

function NavItemGroup({ item }) {
  const location = useLocation()
  const isChildActive = item.children.some((child) => location.pathname === child.to)
  const [open, setOpen] = useState(isChildActive)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isChildActive ? 'text-white' : 'text-brand-200/90 hover:bg-white/10',
        )}
      >
        <item.icon size={18} strokeWidth={1.75} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-4">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500 text-white' : 'text-brand-200/90 hover:bg-white/10',
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setConfirmOpen(false)
    navigate('/dang-nhap', { replace: true })
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900">
      <div className="flex shrink-0 items-center gap-2 px-5 py-5">
        <GraduationCap size={18} strokeWidth={1.75} className="text-white" />
        <span className="text-base font-semibold text-white">SmartEnglish AI</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <NavItemGroup key={item.label} item={item} />
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'text-brand-200/90 hover:bg-white/10',
                      )
                    }
                  >
                    <item.icon size={18} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 px-3 pb-4">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/10 p-2.5">
          <Avatar name={user?.displayName ?? 'Quản trị viên'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.displayName ?? 'Quản trị viên'}
            </p>
            <p className="truncate text-xs text-brand-200/70">Quản trị hệ thống</p>
          </div>
          <button
            type="button"
            aria-label="Đăng xuất"
            onClick={() => setConfirmOpen(true)}
            className="shrink-0 rounded-lg p-1.5 text-brand-200/90 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Đăng xuất khỏi trang quản trị?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng trang quản trị."
        confirmText="Đăng xuất"
      />
    </aside>
  )
}

export default Sidebar
