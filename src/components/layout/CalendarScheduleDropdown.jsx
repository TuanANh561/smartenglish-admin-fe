import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Send,
  Trash2,
  Users,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'smartenglish_scheduled_reminders'

const INITIAL_SCHEDULED = [
  {
    id: 'sch-1',
    title: 'Nhắc nhở nộp bài tập Viết Unit 4',
    target: 'Lớp IELTS 6.5 — Tối T3, T5',
    date: '2026-08-20',
    time: '09:00',
    type: 'class',
    content: 'Hạn chót nộp bài essay Task 2 vào 23:59 ngày mai. Các bạn nhớ hoàn thành đúng hạn nhé!',
    status: 'pending',
  },
  {
    id: 'sch-2',
    title: 'Lịch thi thử trắc nghiệm Ngữ pháp tuần 3',
    target: 'Tất cả học viên',
    date: '2026-08-22',
    time: '14:30',
    type: 'exam',
    content: 'Bài kiểm tra trắc nghiệm 30 câu chuẩn CEFR B1 sẽ mở vào 14:30 thứ Bảy tuần này.',
    status: 'pending',
  },
  {
    id: 'sch-3',
    title: 'Cập nhật bài học phát âm âm Schwa /ə/',
    target: 'Lớp Tiếng Anh Giao Tiếp',
    date: '2026-08-25',
    time: '08:00',
    type: 'lesson',
    content: 'Bài học mới đã được đăng tải kèm bài tập thu âm giọng nói chấm điểm AI.',
    status: 'pending',
  },
]

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function CalendarScheduleDropdown({ isOpen, onClose, anchorRef }) {
  const dropdownRef = useRef(null)

  // Ngày hiện tại
  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => {
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [today])

  // Lịch tháng đang hiển thị
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  // Ngày đang được chọn trên lịch (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(todayStr)

  // Danh sách lịch thông báo
  const [scheduledList, setScheduledList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULED
    } catch {
      return INITIAL_SCHEDULED
    }
  })

  // Form thêm nhắc nhở / thông báo cho ngày được chọn
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteTime, setNoteTime] = useState('09:00')
  const [noteTarget, setNoteTarget] = useState('Lớp IELTS 6.5')
  const [activeTab, setActiveTab] = useState('add') // 'add' | 'list'

  // Lưu vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledList))
    } catch {
      // ignore
    }
  }, [scheduledList])

  // Đóng dropdown khi click outside hoặc ấn Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, anchorRef])

  // Chuyển tháng
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleGoToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(todayStr)
  }

  // Tính toán các ngày trong tháng
  const calendarDays = useMemo(() => {
    // Ngày đầu tiên của tháng: 0 là CN, 1 là T2,... ta đổi sang chuẩn T2 = 0, CN = 6
    const firstDay = new Date(currentYear, currentMonth, 1)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6 // Chủ nhật thành 6

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

    // Ngày của tháng trước
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = currentMonth === 0 ? 12 : currentMonth
      const y = currentMonth === 0 ? currentYear - 1 : currentYear
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isPrev: true,
      })
    }

    // Ngày của tháng hiện tại
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
      })
    }

    // Ngày của tháng sau để đủ ô lưới (ví dụ 35 hoặc 42 ô)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2
      const y = currentMonth === 11 ? currentYear + 1 : currentYear
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isNext: true,
      })
    }

    return days
  }, [currentYear, currentMonth])

  // Map ngày -> danh sách thông báo
  const eventsByDate = useMemo(() => {
    const map = {}
    scheduledList.forEach((item) => {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    })
    return map
  }, [scheduledList])

  // Các sự kiện của ngày đang chọn
  const selectedDateEvents = useMemo(() => {
    return scheduledList.filter((item) => item.date === selectedDate)
  }, [scheduledList, selectedDate])

  // Xử lý tạo ghi chú / lịch thông báo mới
  const handleSaveReminder = (e) => {
    e.preventDefault()
    if (!noteTitle.trim()) {
      toast.error('Vui lòng nhập nội dung hoặc tiêu đề thông báo!')
      return
    }

    const newItem = {
      id: `sch-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim() || noteTitle.trim(),
      date: selectedDate,
      time: noteTime,
      target: noteTarget,
      type: 'class',
      status: 'pending',
    }

    setScheduledList((prev) => [newItem, ...prev])
    toast.success(`Đã lưu thông báo nhắc nhở cho ngày ${formatDateVi(selectedDate)}!`)
    setNoteTitle('')
    setNoteContent('')
    setActiveTab('list')
  }

  // Xóa thông báo
  const handleDeleteItem = (id) => {
    setScheduledList((prev) => prev.filter((item) => item.id !== id))
    toast.success('Đã xóa lịch thông báo')
  }

  // Format ngày tiếng Việt hiển thị
  const formatDateVi = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 z-50 w-[440px] max-w-[95vw] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95"
      style={{ filter: 'drop-shadow(0 20px 25px rgba(15, 23, 42, 0.15))' }}
    >
      {/* ── Header Dropdown ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
            <CalendarIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-navy-700">
              Lịch Đặt Thông Báo & Nhắc Nhở
            </h3>
            <p className="text-[11px] text-ink-muted">
              Chọn ngày để ghi chú nội dung và đặt lịch gửi tự động
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Bộ điều hướng Tháng / Năm ────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-navy-700">
            Tháng {currentMonth + 1}, {currentYear}
          </span>
          {selectedDate === todayStr && (
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
              Hôm nay
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToday}
            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Tháng trước"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Tháng sau"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Lưới Lịch Tháng (Calendar Grid) ──────────────────────────────── */}
      <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
        {/* Hàng thứ */}
        <div className="grid grid-cols-7 text-center mb-1">
          {DAYS_OF_WEEK.map((dw) => (
            <span key={dw} className="text-[11px] font-semibold text-slate-400 py-1">
              {dw}
            </span>
          ))}
        </div>

        {/* Lưới các ngày */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayObj, idx) => {
            const isSelected = dayObj.dateStr === selectedDate
            const isToday = dayObj.dateStr === todayStr
            const events = eventsByDate[dayObj.dateStr] || []
            const hasEvents = events.length > 0

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(dayObj.dateStr)}
                className={cn(
                  'relative flex h-8 w-full flex-col items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer',
                  !dayObj.isCurrentMonth && 'text-slate-300 opacity-60',
                  dayObj.isCurrentMonth && 'text-slate-700 hover:bg-white hover:shadow-2xs',
                  isSelected &&
                    'bg-brand-600! text-white! font-bold shadow-xs scale-105 z-10',
                  isToday && !isSelected && 'border border-brand-500 text-brand-600 font-bold bg-brand-50/50',
                )}
              >
                <span>{dayObj.dayNumber}</span>

                {/* Dot indicator khi ngày có sự kiện / ghi chú */}
                {hasEvents && (
                  <span
                    className={cn(
                      'absolute bottom-1 h-1 w-1 rounded-full',
                      isSelected ? 'bg-white' : 'bg-red-500',
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Thanh thông tin ngày đang chọn & Chuyển tab ─────────────────── */}
      <div className="mt-3 flex items-center justify-between bg-brand-50/60 rounded-xl px-3 py-2 border border-brand-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarIcon size={14} className="text-brand-600 shrink-0" />
          <span className="text-xs font-bold text-navy-700 truncate">
            Ngày đã chọn: {formatDateVi(selectedDate)}
          </span>
          {selectedDateEvents.length > 0 && (
            <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[10px] font-bold shrink-0">
              {selectedDateEvents.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-brand-200/60 text-[11px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={cn(
              'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
              activeTab === 'add' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-navy-700',
            )}
          >
            + Ghi nội dung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={cn(
              'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
              activeTab === 'list' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-navy-700',
            )}
          >
            Danh sách ({selectedDateEvents.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: FORM GHI NỘI DUNG THÔNG BÁO CHO NGÀY ĐƯỢC CHỌN ──────── */}
      {activeTab === 'add' && (
        <form onSubmit={handleSaveReminder} className="mt-3 space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Tiêu đề / Nội dung nhắc nhở:
            </label>
            <input
              type="text"
              placeholder="VD: Nhắc nộp bài viết Unit 4, Lịch thi thử trắc nghiệm..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giờ thông báo:
              </label>
              <div className="relative">
                <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={noteTime}
                  onChange={(e) => setNoteTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2 py-1.5 text-xs text-navy-700 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Gửi tới đối tượng:
              </label>
              <select
                value={noteTarget}
                onChange={(e) => setNoteTarget(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-navy-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="Tất cả học viên">Tất cả học viên</option>
                <option value="Lớp IELTS 6.5">Lớp IELTS 6.5</option>
                <option value="Lớp TOEIC 600+">Lớp TOEIC 600+</option>
                <option value="Lớp Giao tiếp B1">Lớp Giao tiếp B1</option>
                <option value="Chỉ nhắc cá nhân tôi">Chỉ nhắc cá nhân tôi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ghi chú chi tiết (không bắt buộc):
            </label>
            <textarea
              rows={2}
              placeholder="Nhập nội dung chi tiết bài học, hạn nộp hoặc lưu ý cần gửi..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-navy-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Bell size={13} />
              Lưu thông báo cho ngày {formatDateVi(selectedDate)}
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 2: DANH SÁCH NHẮC NHỞ / THÔNG BÁO ĐÃ ĐẶT ─────────────── */}
      {activeTab === 'list' && (
        <div className="mt-3 max-h-[220px] overflow-y-auto space-y-2 pr-1">
          {selectedDateEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
              <CalendarIcon size={24} className="mx-auto mb-1.5 text-slate-300" />
              Chưa có thông báo nào được đặt cho ngày{' '}
              <strong>{formatDateVi(selectedDate)}</strong>.
              <p className="mt-1 text-[11px] text-brand-600 cursor-pointer font-medium" onClick={() => setActiveTab('add')}>
                + Nhấn vào đây để ghi nội dung nhắc nhở
              </p>
            </div>
          ) : (
            selectedDateEvents.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-brand-300 transition-colors"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Bell size={12} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-700 truncate">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-brand-600">
                        <Clock size={10} /> {item.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {item.target}
                      </span>
                    </div>
                    {item.content && item.content !== item.title && (
                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded-md">
                        {item.content}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Xóa thông báo này"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}

          {/* Hiển thị thêm các sự kiện sắp tới nếu ngày này không có hoặc ít */}
          {scheduledList.length > selectedDateEvents.length && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Các ngày khác sắp có thông báo ({scheduledList.length - selectedDateEvents.length}):
              </p>
              <div className="space-y-1">
                {scheduledList
                  .filter((item) => item.date !== selectedDate)
                  .slice(0, 3)
                  .map((otherItem) => (
                    <button
                      key={otherItem.id}
                      type="button"
                      onClick={() => {
                        setSelectedDate(otherItem.date)
                        // nếu tháng khác thì đổi tháng
                        const parts = otherItem.date.split('-')
                        if (parts.length === 3) {
                          setCurrentYear(parseInt(parts[0], 10))
                          setCurrentMonth(parseInt(parts[1], 10) - 1)
                        }
                      }}
                      className="w-full flex items-center justify-between text-left rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
                    >
                      <span className="truncate font-medium">{otherItem.title}</span>
                      <span className="shrink-0 text-[10px] text-slate-400 font-semibold ml-2">
                        {formatDateVi(otherItem.date)} ({otherItem.time})
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
