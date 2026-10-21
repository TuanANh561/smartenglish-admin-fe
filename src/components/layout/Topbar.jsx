import { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowLeft, Bell, Calendar, ChevronDown, LogOut, PanelLeft, Search, Settings, User, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_META } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { useSidebarStore } from '@/store/sidebarStore'
import { useCommunitySearchStore } from '@/store/communitySearchStore'
import { useTopbarStore } from '@/store/topbarStore'
import CommunitySearchDropdown from '@/features/community/components/CommunitySearchDropdown'
import Avatar from '@/components/ui/Avatar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import CalendarScheduleDropdown from './CalendarScheduleDropdown'
import NotificationDropdown from './NotificationDropdown'
import {
  getScheduledNotifications,
  getUnreadNotificationCount,
} from '@/features/notifications/notificationApi'
import { http } from '@/lib/api'
import { sendPresenceHeartbeat } from '@/features/community/socketService'
import toast from 'react-hot-toast'
import { useNotificationStream } from '@/features/notifications/useNotificationStream'

function Topbar({ actions }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)
  const searchQuery = useCommunitySearchStore((s) => s.searchQuery)
  const setSearchQuery = useCommunitySearchStore((s) => s.setSearchQuery)
  const isDropdownOpen = useCommunitySearchStore((s) => s.isDropdownOpen)
  const setIsDropdownOpen = useCommunitySearchStore((s) => s.setIsDropdownOpen)
  const setIsSearchingMode = useCommunitySearchStore((s) => s.setIsSearchingMode)
  const customHeader = useTopbarStore((s) => s.customHeader)
  const searchContainerRef = useRef(null)

  // Đóng Dropdown tìm kiếm khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsDropdownOpen])

  useEffect(() => {
    useTopbarStore.getState().clearCustomHeader()
  }, [pathname])

  // Global realtime presence heartbeat across all admin/teacher pages
  useEffect(() => {
    if (!user?.id) return
    const pingPresence = () => {
      http.post(`/api/v1/social/presence/heartbeat?userId=${user.id}`).catch(() => {})
      sendPresenceHeartbeat(user.id)
    }
    pingPresence()
    const timer = setInterval(pingPresence, 20000)
    return () => {
      clearInterval(timer)
    }
  }, [user?.id])

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [hasNewPulse, setHasNewPulse] = useState(false)

  // Kết nối Server-Sent Events (SSE) theo thời gian thực cho Admin / Giáo viên
  useNotificationStream({
    onNotification: (notif) => {
      setUnreadNotifCount((prev) => prev + 1)
      setHasNewPulse(true)
      setTimeout(() => setHasNewPulse(false), 2500)

      const cleanTitle = (notif.title || 'Thông báo mới')
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim()
      const cleanBody = (notif.body || notif.message || '')
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim()

      toast((t) => (
        <div className="flex items-start gap-2.5">
          <Bell size={18} className="text-slate-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-slate-900">{cleanTitle}</p>
            {cleanBody && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{cleanBody}</p>}
          </div>
        </div>
      ), {
        duration: 4500,
        position: 'top-right',
      })
    },
  })

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

  // Đếm số lượng thông báo / lịch hẹn thực tế từ backend
  const [scheduleCount, setScheduleCount] = useState(0)
  useEffect(() => {
    let isMounted = true
    const fetchCounts = async () => {
      try {
        const targetUserId = user?.id || 1
        // 1. Lấy số lượng lịch hẹn thực tế từ notification-service
        const schedRes = await getScheduledNotifications({ creatorId: targetUserId }).catch(() => null)
        const schedList = Array.isArray(schedRes) ? schedRes : schedRes?.data || []
        if (isMounted) {
          setScheduleCount(Array.isArray(schedList) ? schedList.length : 0)
        }

        // 2. Lấy số lượng thông báo chưa đọc thực tế
        if (user?.role === 'teacher' || user?.role === 'admin') {
          const unread = await getUnreadNotificationCount(targetUserId).catch(() => null)
          if (isMounted && typeof unread === 'number') {
            setUnreadNotifCount(unread)
          }
        }
      } catch {
        // ignore
      }
    }

    fetchCounts()
    return () => {
      isMounted = false
    }
  }, [user?.id, user?.role, isScheduleOpen, isNotifOpen])

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

  if (pathname === '/app/noi-dung-ai' && (user?.role === 'teacher' || user?.role === 'TEACHER')) {
    title = 'Tạo nội dung AI'
    description = 'Tạo và quản lý nội dung học liệu được sinh bởi AI'
  }

  if (pathname === '/app/nhat-ky' && (user?.role === 'teacher' || user?.role === 'TEACHER')) {
    title = 'Nhật ký hoạt động'
    description = 'Lịch sử hoạt động, nâng cấp dịch vụ & thao tác sư phạm của bạn'
  }

  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar)

  return (
    <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-line bg-surface px-6 relative z-30">
      {/* ── Tiêu đề lớn nhất trang & Nút toggle menu & Nút Quay lại ─────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
          title={isCollapsed ? 'Mở rộng thanh menu (Phím tắt: [ )' : 'Thu gọn thanh menu (Phím tắt: [ )'}
          aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <PanelLeft size={18} className={isCollapsed ? 'text-brand-600' : 'text-slate-600'} />
        </button>

        {customHeader?.backLink && (
          <>
            <Link
              to={customHeader.backLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition-all shadow-2xs shrink-0"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">{customHeader.backText || 'Quay lại'}</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />
          </>
        )}

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-navy-800 truncate">
            {customHeader?.title || title}
          </h1>
          {(customHeader?.subtitle || description) && (
            <p className="mt-0.5 text-xs text-ink-muted leading-tight truncate hidden sm:block">
              {customHeader?.subtitle || description}
            </p>
          )}
        </div>
      </div>

      {/* ── Thanh tìm kiếm bài viết + giáo viên ở trang Cộng đồng ── */}
      {pathname === '/app/cong-dong' && (
        <div ref={searchContainerRef} className="relative flex-1 max-w-md lg:max-w-xl mx-4 sm:mx-8">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm bài viết, giáo viên..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsDropdownOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchQuery.trim()) {
                    setIsSearchingMode(true)
                  }
                  setIsDropdownOpen(false)
                }
              }}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 placeholder:text-sm focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setIsDropdownOpen(true)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors"
                title="Xóa nội dung tìm kiếm"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Dropdown thông minh: Chủ đề thảo luận khi chưa gõ, Gợi ý 10 người dùng khi có từ khóa */}
          {isDropdownOpen && (
            <CommunitySearchDropdown onClose={() => setIsDropdownOpen(false)} />
          )}
        </div>
      )}

      {/* ── Nút điều hướng góc trên bên phải (Chuẩn Facebook: Lịch/Ngày, Chuông thông báo, Avatar có badge v) ──────────────── */}
      <div className="relative flex items-center gap-3 shrink-0">
        {customHeader?.actions && (
          <div className="flex items-center gap-2">
            {customHeader.actions}
            <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block mx-0.5" />
          </div>
        )}

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

        {/* ── NÚT CHUÔNG THÔNG BÁO DÀNH CHO GIÁO VIÊN & ADMIN (KẾ BÊN AVATAR) ────────── */}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
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
                'relative flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer',
                hasNewPulse && 'animate-bounce ring-2 ring-brand-500 shadow-md',
                isNotifOpen
                  ? 'bg-brand-50 text-brand-600 ring-2 ring-brand-400/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
              )}
              title="Thông báo hệ thống"
            >
              <Bell size={19} className={cn(isNotifOpen ? 'text-brand-600' : 'text-slate-800', hasNewPulse && 'text-brand-600')} />
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
                  navigate('/app/ho-so')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 shrink-0">
                  <User size={16} />
                </div>
                <span>Hồ sơ cá nhân</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  navigate('/app/cai-dat')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 shrink-0">
                  <Settings size={16} />
                </div>
                <span>Cài đặt hệ thống</span>
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
