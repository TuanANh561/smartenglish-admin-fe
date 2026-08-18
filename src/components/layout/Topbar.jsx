import { useState, useMemo, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ROUTE_META } from '@/components/layout/navConfig'
import { useAuthStore } from '@/store/authStore'
import CalendarScheduleDropdown from './CalendarScheduleDropdown'

function Topbar({ actions }) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const dateButtonRef = useRef(null)

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

  // Điều chỉnh tiêu đề và mô tả phù hợp theo từng vai trò
  let title = ROUTE_META[pathname]?.title ?? 'Trang quản trị'
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

      {/* ── Nút ngày tháng / Đặt lịch thông báo bên phải ──────────────── */}
      <div className="relative flex items-center gap-2.5">
        {actions ?? (
          <div className="relative">
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => setIsScheduleOpen((prev) => !prev)}
              className={[
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer group',
                isScheduleOpen
                  ? 'border-brand-500 bg-brand-50/80 text-brand-700 ring-2 ring-brand-400/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-300 text-slate-700',
              ].join(' ')}
              title="Nhấn để mở lịch tháng, chọn ngày và ghi nội dung thông báo / nhắc nhở"
            >
              <Calendar size={16} className="text-brand-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-700">{todayFormatted}</span>
              {scheduleCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 text-white px-1.5 text-[10px] font-bold shadow-2xs">
                  {scheduleCount}
                </span>
              )}
            </button>

            {/* ── Dropdown Lịch & Đặt thông báo ────────────────────────────── */}
            <CalendarScheduleDropdown
              isOpen={isScheduleOpen}
              onClose={() => setIsScheduleOpen(false)}
              anchorRef={dateButtonRef}
            />
          </div>
        )}
      </div>
    </header>
  )
}

export default Topbar
