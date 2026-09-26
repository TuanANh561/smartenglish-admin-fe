import { ChevronDown, GraduationCap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getVisibleNavGroups } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'

function NavItemGroup({ item, role }) {
  const location = useLocation()
  const visibleChildren = (item.children || []).filter(
    (child) => !child.roles || child.roles.includes(role),
  )
  const isChildActive = visibleChildren.some((child) => location.pathname === child.to)
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
          {visibleChildren.map((child) => (
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
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'admin'
  const navGroups = getVisibleNavGroups(role)
  const myId = Number(user?.id) || 1

  const communityUnread = useChatStore((s) => s.totalUnreadCount)
  const fetchUnreadCount = useChatStore((s) => s.fetchUnreadCount)

  useEffect(() => {
    fetchUnreadCount(myId)
    const interval = setInterval(() => {
      fetchUnreadCount(myId)
    }, 12000)
    return () => clearInterval(interval)
  }, [myId, fetchUnreadCount])

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900">
      {/* Brand Header */}
      <div className="flex shrink-0 items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <GraduationCap size={20} strokeWidth={1.75} className="text-white shrink-0" />
        <span className="text-base font-bold text-white tracking-wide">SmartEnglish AI</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isCommunity = Boolean(item.to && item.to.includes('cong-dong'))
                const unread = isCommunity ? communityUnread : (item.unreadCount || 0)
                return item.children ? (
                  <NavItemGroup key={item.label} item={item} role={role} />
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
                    {({ isActive }) => (
                      <>
                        <item.icon size={18} strokeWidth={1.75} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {unread > 0 && (
                          <span
                            aria-label={`${unread} tin nhắn chưa đọc`}
                            className={cn(
                              'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none',
                              isActive ? 'bg-white text-brand-600' : 'bg-brand-500 text-white',
                            )}
                          >
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
