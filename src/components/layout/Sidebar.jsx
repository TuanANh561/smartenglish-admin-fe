import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Headphones,
  FileText,
  Mic,
  BookOpenText,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getVisibleNavGroups } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSidebarStore } from '@/store/sidebarStore'

// Icon và màu sắc riêng biệt cho từng bài học con (tương phản cao, tươi sáng)
const SUB_CONFIG = {
  '/app/hoc-lieu/tu-vung':  { icon: FileText,     color: 'text-blue-600',   bg: 'bg-blue-50' },
  '/app/hoc-lieu/ngu-phap': { icon: BookOpenText, color: 'text-purple-600', bg: 'bg-purple-50' },
  '/app/hoc-lieu/phat-am':  { icon: Mic,          color: 'text-rose-600',   bg: 'bg-rose-50' },
  '/app/hoc-lieu/bai-doc':  { icon: BookOpen,     color: 'text-emerald-600',bg: 'bg-emerald-50' },
  '/app/hoc-lieu/bai-nghe': { icon: Headphones,   color: 'text-amber-600',  bg: 'bg-amber-50' },
}

/**
 * Component hiển thị nhóm menu có menu con (Bài học)
 * Khi mở rộng: Accordion chuẩn đẹp
 * Khi thu nhỏ: Light Card Popover nền trắng, tương phản 100%, icon sinh động
 */
function NavItemGroup({ item, role, isCollapsed }) {
  const location = useLocation()
  const visibleChildren = (item.children || []).filter(
    (child) => !child.roles || child.roles.includes(role),
  )
  const isChildActive = visibleChildren.some((child) => location.pathname === child.to)
  const [open, setOpen] = useState(isChildActive)

  // Floating Portal Popover khi thu nhỏ
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)
  const popoverTimeoutRef = useRef(null)

  const updatePopoverPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopoverPos({
        top: Math.max(16, rect.top - 10),
        left: rect.right + 14,
      })
    }
  }

  const handleMouseEnter = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current)
    updatePopoverPosition()
    setIsPopoverOpen(true)
  }

  const handleMouseLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false)
    }, 200)
  }

  // ─── CHẾ ĐỘ THU NHỎ (COLLAPSED): LIGHT CARD POPOVER TƯƠNG PHẢN CAO ────────
  if (isCollapsed) {
    return (
      <div
        className="relative my-1 flex justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            updatePopoverPosition()
            setIsPopoverOpen((prev) => !prev)
          }}
          className={cn(
            'group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer',
            isChildActive || isPopoverOpen
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/35 ring-2 ring-brand-400/50'
              : 'text-brand-200/90 hover:bg-white/15 hover:text-white',
          )}
          title="Bài học (Nhấp hoặc rê chuột để xem danh sách bài học con)"
        >
          <item.icon size={20} strokeWidth={1.75} />

          {/* Chấm chỉ báo nhỏ nếu đang active một trang con */}
          {isChildActive && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-800" />
          )}
        </button>

        {/* ── PORTAL LIGHT CARD POPOVER (Nền trắng tinh khiết, tương phản 100%) ── */}
        {isPopoverOpen &&
          createPortal(
            <div
              style={{
                position: 'fixed',
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`,
                zIndex: 99999,
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="w-68 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50/90 rounded-xl border border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <BookOpen size={15} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Học liệu cốt lõi
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {visibleChildren.length} bài
                </span>
              </div>

              {/* Danh sách các bài học con với Icon & Chữ màu tương phản sắc nét */}
              <div className="flex flex-col gap-1">
                {visibleChildren.map((child) => {
                  const cfg = SUB_CONFIG[child.to] || { icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' }
                  const SubIcon = cfg.icon
                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={() => setIsPopoverOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'group/sub flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-xs',
                          isActive
                            ? 'bg-brand-50 border border-brand-200 text-brand-700 font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-brand-600 font-medium',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                              isActive ? 'bg-brand-500 text-white' : `${cfg.bg} ${cfg.color}`,
                            )}
                          >
                            <SubIcon size={14} strokeWidth={2} />
                          </div>

                          <span className="flex-1 truncate">{child.label}</span>

                          {isActive && (
                            <Check size={14} className="text-brand-600 shrink-0" strokeWidth={2.5} />
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>,
            document.body,
          )}
      </div>
    )
  }

  // ─── CHẾ ĐỘ MỞ RỘNG (EXPANDED): DẠNG ACCORDION CHUẨN ĐẸP ──────────────────
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer',
          isChildActive ? 'text-white bg-white/10 font-semibold' : 'text-slate-200 hover:bg-white/10 hover:text-white',
        )}
      >
        <item.icon size={18} strokeWidth={1.75} />
        <span className="flex-1 text-left">{item.label}</span>
        <span className="flex items-center gap-1.5 text-xs text-brand-300/80">
          <span className="rounded-md bg-white/10 px-1.5 py-0.2 text-[10px]">{visibleChildren.length}</span>
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={cn('transition-transform duration-200', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-0.5 border-l-2 border-brand-500/40 ml-5 pl-3 py-1 space-y-0.5">
          {visibleChildren.map((child) => {
            const cfg = SUB_CONFIG[child.to] || { icon: FileText }
            const SubIcon = cfg.icon
            return (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-brand-500 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <SubIcon size={14} strokeWidth={1.75} />
                <span>{child.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Item menu đơn (Dùng Portal Tooltip nền trắng tương phản cao khi thu nhỏ)
 */
function SingleNavItem({ item, isCollapsed, unread, role }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)

  const handleMouseEnter = () => {
    if (buttonRef.current && isCollapsed) {
      const rect = buttonRef.current.getBoundingClientRect()
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 14,
      })
      setIsTooltipOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setIsTooltipOpen(false)
  }

  return (
    <div
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative', isCollapsed && 'flex justify-center my-0.5')}
    >
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'flex items-center transition-all font-medium relative',
            isCollapsed
              ? 'h-11 w-11 justify-center rounded-2xl'
              : 'gap-3 px-3.5 py-2.5 text-sm rounded-xl',
            isActive
              ? 'bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25'
              : 'text-slate-200 hover:bg-white/10 hover:text-white',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              size={isCollapsed ? 20 : 18}
              strokeWidth={1.75}
              className="shrink-0"
            />

            {/* Label khi mở rộng */}
            {!isCollapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}

            {/* Badge unread */}
            {unread > 0 && (
              isCollapsed ? (
                <span
                  className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-navy-800"
                  title={`${unread} chưa đọc`}
                />
              ) : (
                <span
                  className={cn(
                    'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none',
                    isActive ? 'bg-white text-brand-600' : 'bg-red-500 text-white',
                  )}
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )
            )}
          </>
        )}
      </NavLink>

      {/* PORTAL TOOLTIP NỀN TRẮNG TƯƠNG PHẢN CAO */}
      {isCollapsed &&
        isTooltipOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${tooltipPos.top}px`,
              left: `${tooltipPos.left}px`,
              transform: 'translateY(-50%)',
              zIndex: 99999,
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in duration-100 flex items-center gap-1.5"
          >
            <span>{item.label}</span>
            {unread > 0 && (
              <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                {unread}
              </span>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}

function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'admin'
  const navGroups = getVisibleNavGroups(role)
  const myId = Number(user?.id) || 1

  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar)

  const communityUnread = useChatStore((s) => s.totalUnreadCount)
  const fetchUnreadCount = useChatStore((s) => s.fetchUnreadCount)

  // Polling unread messages
  useEffect(() => {
    fetchUnreadCount(myId)
    const interval = setInterval(() => {
      fetchUnreadCount(myId)
    }, 12000)
    return () => clearInterval(interval)
  }, [myId, fetchUnreadCount])

  // Phím tắt bàn phím: "[" để đóng/mở menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === '[') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  return (
    <aside
      className={cn(
        'relative flex h-screen shrink-0 flex-col bg-gradient-to-b from-navy-800 to-navy-900 border-r border-navy-700/60 transition-all duration-300 ease-in-out select-none z-20',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* ─── BRAND HEADER (Sạch sẽ, không còn nút toggle ở top) ────── */}
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-white/10 py-4 transition-all',
          isCollapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <GraduationCap size={22} strokeWidth={2} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 truncate">
              <span className="text-base font-extrabold text-white tracking-wide flex items-center gap-1.5">
                SmartEnglish <span className="rounded-md bg-brand-500/40 px-1.5 py-0.2 text-xs font-bold text-white border border-brand-400/40">AI</span>
              </span>
              <span className="text-[10px] text-sky-200/90 font-semibold uppercase tracking-wider block mt-0.5">
                Management System
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── DANH SÁCH MENU CUỘN DỌC ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-3 space-y-4">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label || groupIndex} className="space-y-1">
            {/* Tiêu đề nhóm */}
            {isCollapsed ? (
              groupIndex > 0 && <div className="my-2.5 mx-auto w-8 h-px bg-white/10" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-300/80 truncate">
                {group.label}
              </p>
            )}

            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isCommunity = Boolean(item.to && item.to.includes('cong-dong'))
                const unread = isCommunity ? communityUnread : (item.unreadCount || 0)

                if (item.children) {
                  return (
                    <NavItemGroup
                      key={item.label}
                      item={item}
                      role={role}
                      isCollapsed={isCollapsed}
                    />
                  )
                }

                return (
                  <SingleNavItem
                    key={item.to}
                    item={item}
                    isCollapsed={isCollapsed}
                    unread={unread}
                    role={role}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── NÚT Ở BOTTOM: ICON TRÒN NHƯ HÌNH VÀ TEXT "THU GỌN" ─────────── */}
      <div className="border-t border-white/10 p-2.5">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'group flex items-center transition-all cursor-pointer rounded-xl',
            isCollapsed
              ? 'h-10 w-10 justify-center mx-auto hover:bg-white/10'
              : 'w-full gap-3 px-3 py-2 text-brand-100 hover:bg-white/10 hover:text-white',
          )}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn'}
        >
          {/* Icon tròn như hình người dùng gửi */}
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border border-white/70 text-white transition-transform group-hover:scale-105',
              isCollapsed ? 'h-7 w-7' : 'h-6 w-6',
            )}
          >
            {isCollapsed ? (
              <ChevronRight size={15} strokeWidth={2.4} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.4} />
            )}
          </span>

          {/* Text "Thu gọn" khi mở rộng */}
          {!isCollapsed && (
            <span className="text-sm font-medium text-white/90 group-hover:text-white">
              Thu gọn
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
