import { useState, useMemo, useRef, useEffect } from 'react'
import { Bell, Calendar, ChevronDown, LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_META } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import Avatar from '@/components/ui/Avatar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import CalendarScheduleDropdown from './CalendarScheduleDropdown'
import NotificationDropdown from './NotificationDropdown'

function Topbar({ actions }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unreadNotifCount, setUnreadNotifCount] = useState(3)

  const dateButtonRef = useRef(null)
  const notifButtonRef = useRef(null)
  const userMenuRef = useRef(null)

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  // Đếm số lượng thông báo đã đặt
  const [scheduleCount, setScheduleCount] = useState(3)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartenglish_scheduled_reminders')
      if (saved) {
        const list = JSON.parse(saved)
        setScheduleCount(list.length)
      }
    } catch {
      // ignore
    }
  }, [isScheduleOpen])

  // Handle clicking outside user menu dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleLogout = async () => {
    await logout()
    setConfirmOpen(false)
    navigate('/dang-nhap', { replace: true })
  }

  // Điều chỉnh tiêu đề và mô tả phù hợp theo từng vai trò
  let title = ROUTE_META[pathname]?.title ?? ''
  let description = ROUTE_META[pathname]?.description ?? ''

  if (pathname === '/') {
    if (user?.role === 'teacher') {
      const shortName = user?.displayName?.split(' ').pop() || 'Giáo viên'
      title = `Chào mừng trở lại, ${shortName} 👋`
      description = 'Dưới đây là tình hình lớp học và học liệu của bạn hôm nay.'
    } else {
      title = 'Dashboard Tổng quan'
      description = 'Chào mừng trở lại, hệ thống đang hoạt động ổn định.'
    }
  }

  return (
    <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-line bg-surface px-6 relative z-30">
      {/* ── Tiêu đề lớn nhất trang (Thống nhất phân cấp chuẩn) ─────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-700">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs sm:text-sm text-ink-muted leading-tight">
            {description}
          </p>
        )}
      </div>

      {/* ── Nút điều hướng góc trên bên phải (Chuẩn Facebook: Lịch/Ngày, Chuông thông báo, Avatar có badge v) ──────────────── */}
      <div className="relative flex items-center gap-3">
        {actions ?? (
          <div className="relative">
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => {
                setIsScheduleOpen((prev) => !prev)
                setIsNotifOpen(false)
                setUserMenuOpen(false)
              }}
              className={[
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer group',
                isScheduleOpen
                  ? 'border-brand-500 bg-brand-50/80 text-brand-700 ring-2 ring-brand-400/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-300 text-slate-700',
              ].join(' ')}
              title="Nhấn để mở lịch tháng, chọn ngày và ghi nội dung thông báo / nhắc nhở"
            >
              <Calendar size={16} className="text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">{todayFormatted}</span>
              {scheduleCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 text-white px-1.5 text-[10px] font-bold shadow-2xs">
                  {scheduleCount}
                </span>
              )}
            </button>

            {/* Dropdown Lịch & Đặt thông báo */}
            <CalendarScheduleDropdown
              isOpen={isScheduleOpen}
              onClose={() => setIsScheduleOpen(false)}
              anchorRef={dateButtonRef}
            />
          </div>
        )}

        {/* ── NÚT CHUÔNG THÔNG BÁO DÀNH RIÊNG CHO GIÁO VIÊN (KẾ BÊN AVATAR) ────────── */}
        {user?.role === 'teacher' && (
          <div className="relative">
            <button
              ref={notifButtonRef}
              type="button"
              onClick={() => {
                setIsNotifOpen((prev) => !prev)
                setIsScheduleOpen(false)
                setUserMenuOpen(false)
              }}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer',
                isNotifOpen
                  ? 'bg-brand-50 text-brand-600 ring-2 ring-brand-400/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
              )}
              title="Thông báo dành cho giáo viên"
            >
              <Bell size={19} className={isNotifOpen ? 'text-brand-600' : 'text-slate-800'} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-2xs">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {/* Dropdown thông báo giáo viên */}
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              anchorRef={notifButtonRef}
              userRole={user?.role}
              onUnreadCountChange={setUnreadNotifCount}
            />
          </div>
        )}

        {/* ── AVATAR NGƯỜI DÙNG CÓ NÚT MŨI TÊN V Ở GÓC DƯỚI BÊN PHẢI (CHUẨN FACEBOOK) ── */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen((prev) => !prev)
              setIsNotifOpen(false)
              setIsScheduleOpen(false)
            }}
            aria-expanded={userMenuOpen}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full cursor-pointer focus:outline-none"
            title="Tài khoản & Cài đặt"
          >
            <Avatar
              name={user?.displayName ?? 'Quản trị viên'}
              src={user?.avatarUrl}
              size="md"
              className="h-10 w-10 rounded-full object-cover border border-slate-200 ring-2 ring-transparent transition-all group-hover:ring-brand-400/40"
            />
            {/* Vòng tròn nhỏ có mũi tên xuống ở góc dưới bên phải avatar */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-200 border-2 border-white text-slate-700 shadow-xs transition-transform group-hover:scale-105">
              <ChevronDown
                size={11}
                strokeWidth={2.5}
                className={cn('transition-transform duration-200', userMenuOpen && 'rotate-180')}
              />
            </span>
          </button>

          {/* User Menu Popover */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              {/* Header profile info */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-1">
                <Avatar
                  name={user?.displayName ?? 'Quản trị viên'}
                  src={user?.avatarUrl}
                  size="md"
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 leading-tight">
                    {user?.displayName ?? 'Quản trị viên'}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 mt-0.5">
                    {user?.role === 'teacher' ? 'Giáo viên' : 'Quản trị hệ thống'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  navigate('/cai-dat')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 shrink-0">
                  <User size={16} />
                </div>
                <span>Xem Profile & Cài đặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  setConfirmOpen(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
                  <LogOut size={16} />
                </div>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
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
    </header>
  )
}

export default Topbar
