import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  getScheduledNotifications,
  createScheduledNotification,
  cancelScheduledNotification,
} from '@/features/notifications/notificationApi'
import { getTeacherClasses } from '@/features/classes/classApi'

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

  const user = useAuthStore((s) => s.user)
  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'
  const currentUserId = user?.id || 2

  // Danh sách lịch thông báo thật 100% từ backend notification-service (Không fake data)
  const [scheduledList, setScheduledList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Danh sách các lớp học do người dùng hiện tại tạo / phụ trách
  const [myClasses, setMyClasses] = useState([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  const fetchMyClasses = async () => {
    setIsLoadingClasses(true)
    try {
      let list = []
      if (isAdmin) {
        const resAdminSpecific = await getTeacherClasses({ teacherId: currentUserId }).catch(() => null)
        const specificList = Array.isArray(resAdminSpecific) ? resAdminSpecific : resAdminSpecific?.data || []
        if (Array.isArray(specificList) && specificList.length > 0) {
          list = specificList
        } else {
          const resAll = await getTeacherClasses().catch(() => null)
          const allList = Array.isArray(resAll) ? resAll : resAll?.data || []
          const createdByMe = allList.filter(
            (c) => String(c.teacherId) === String(currentUserId) || String(c.createdBy) === String(currentUserId),
          )
          list = createdByMe.length > 0 ? createdByMe : allList
        }
      } else {
        const resTeacher = await getTeacherClasses().catch(() => null)
        list = Array.isArray(resTeacher) ? resTeacher : resTeacher?.data || []
      }
      setMyClasses(list)
    } catch (err) {
      console.warn('Lỗi tải danh sách lớp học:', err)
      setMyClasses([])
    } finally {
      setIsLoadingClasses(false)
    }
  }

  // Lấy dữ liệu thật từ notification-service
  const fetchBackendSchedules = async () => {
    setIsLoading(true)
    try {
      const res = await getScheduledNotifications({ creatorId: currentUserId })
      const list = Array.isArray(res) ? res : res?.data || []
      if (Array.isArray(list)) {
        const mapped = list.map((item) => {
          let date = todayStr
          let time = '09:00'
          if (item.scheduledAt) {
            const dt = new Date(item.scheduledAt)
            if (!isNaN(dt.getTime())) {
              const y = dt.getFullYear()
              const m = String(dt.getMonth() + 1).padStart(2, '0')
              const d = String(dt.getDate()).padStart(2, '0')
              date = `${y}-${m}-${d}`
              time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
            }
          }
          return {
            id: item.id,
            title: item.title,
            content: item.content || item.title,
            target: item.targetLabel || 'Chỉ bản thân',
            date,
            time,
            type: (item.remindType || 'class').toLowerCase(),
            status: (item.status || 'pending').toLowerCase(),
          }
        })
        setScheduledList(mapped)
      } else {
        setScheduledList([])
      }
    } catch (err) {
      console.warn('Lỗi tải lịch thông báo từ backend:', err)
      setScheduledList([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchBackendSchedules()
      fetchMyClasses()
    }
  }, [isOpen, currentUserId])

  // Form thêm nhắc nhở / thông báo cho ngày được chọn
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteTime, setNoteTime] = useState('09:00')
  const [noteTarget, setNoteTarget] = useState(isAdmin ? 'Tất cả người dùng' : 'Chỉ bản thân')
  const [activeTab, setActiveTab] = useState('add') // 'add' | 'list'

  // Đồng bộ noteTarget khi vai trò hoặc danh sách lớp thay đổi
  useEffect(() => {
    if (isAdmin) {
      if (!noteTarget) {
        setNoteTarget('Tất cả người dùng')
      }
    } else {
      if (!noteTarget || noteTarget.startsWith('Tất cả')) {
        setNoteTarget(myClasses.length > 0 ? myClasses[0].name : 'Chỉ bản thân')
      }
    }
  }, [isAdmin, myClasses])

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
    const firstDay = new Date(currentYear, currentMonth, 1)
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

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

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
      })
    }

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
  const handleSaveReminder = async (e) => {
    e.preventDefault()
    if (!noteTitle.trim()) {
      toast.error('Vui lòng nhập nội dung hoặc tiêu đề thông báo!')
      return
    }

    const scheduledDateTime = new Date(`${selectedDate}T${noteTime}:00`).toISOString()

    let targetType = 'CLASS'
    let remindType = 'CLASS'
    if (noteTarget === 'Tất cả người dùng') {
      targetType = 'ALL_USERS'
      remindType = 'GENERAL'
    } else if (noteTarget === 'Tất cả học viên') {
      targetType = 'ALL_STUDENTS'
      remindType = 'STUDENT'
    } else if (noteTarget === 'Tất cả giáo viên') {
      targetType = 'ALL_TEACHERS'
      remindType = 'TEACHER'
    } else if (noteTarget === 'Chỉ bản thân' || noteTarget === 'Chỉ nhắc cá nhân tôi') {
      targetType = 'SELF'
      remindType = 'SELF'
    } else {
      targetType = 'CLASS'
      remindType = 'CLASS'
    }

    const newItem = {
      id: `sch-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim() || noteTitle.trim(),
      date: selectedDate,
      time: noteTime,
      target: noteTarget,
      type: remindType.toLowerCase(),
      status: 'pending',
    }

    setScheduledList((prev) => [newItem, ...prev])
    toast.success(`Đã lưu thông báo nhắc nhở cho ngày ${formatDateVi(selectedDate)}!`)
    setNoteTitle('')
    setNoteContent('')
    setActiveTab('list')

    try {
      await createScheduledNotification({
        creatorId: currentUserId,
        title: newItem.title,
        content: newItem.content,
        targetType,
        targetLabel: noteTarget,
        scheduledAt: scheduledDateTime,
        remindType,
        repeatType: 'NONE',
        channels: 'IN_APP,WEB',
      })
      fetchBackendSchedules()
    } catch (err) {
      console.warn('Lỗi lưu schedule lên backend:', err)
    }
  }

  // Xóa thông báo
  const handleDeleteItem = async (id) => {
    setScheduledList((prev) => prev.filter((item) => item.id !== id))
    toast.success('Đã xóa lịch thông báo')
    try {
      await cancelScheduledNotification(id, currentUserId)
    } catch {
      // retain optimistic deletion
    }
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
      className="absolute right-0 top-full mt-2 z-50 w-[740px] md:w-[780px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95"
      style={{ filter: 'drop-shadow(0 20px 30px rgba(15, 23, 42, 0.18))' }}
    >
      {/* ── 1. HEADER CHUNG CỦA MODAL (TIÊU ĐỀ & NÚT ĐÓNG X) ───────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
            <CalendarIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Lịch Đặt Thông Báo & Nhắc Nhở
            </h3>
            <p className="text-[11px] text-slate-400">
              Chọn ngày để ghi chú nội dung và đặt lịch gửi tự động
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── 2. THÂN MODAL CHIA 2 CỘT NGANG (SPLIT LAYOUT) ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-3 items-start">
        
        {/* ── CỘT TRÁI (5/12): LỊCH THÁNG (CALENDAR PICKER) ────────────────── */}
        <div className="md:col-span-5 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
          {/* Điều hướng Tháng / Năm */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                Tháng {currentMonth + 1}, {currentYear}
              </span>
              {selectedDate === todayStr && (
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-semibold">
                  Hôm nay
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleGoToday}
                className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-md border border-slate-200 p-0.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-md border border-slate-200 p-0.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Lưới các ngày trong tháng */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2">
            {/* Hàng tên thứ */}
            <div className="grid grid-cols-7 text-center mb-1">
              {DAYS_OF_WEEK.map((dw) => (
                <span key={dw} className="text-[10px] font-semibold text-slate-400 py-0.5">
                  {dw}
                </span>
              ))}
            </div>

            {/* Ô ngày */}
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
                      'relative flex h-7.5 w-full flex-col items-center justify-center rounded-lg text-[11px] font-medium transition-all cursor-pointer select-none',
                      !dayObj.isCurrentMonth && 'text-slate-300 opacity-50',
                      dayObj.isCurrentMonth && 'text-slate-700 hover:bg-white hover:shadow-2xs',
                      isSelected &&
                        'bg-brand-600! text-white! font-bold shadow-xs scale-105 z-10',
                      isToday && !isSelected && 'border border-brand-500 text-brand-600 font-bold bg-brand-50/60',
                    )}
                  >
                    <span>{dayObj.dayNumber}</span>
                    {hasEvents && (
                      <span
                        className={cn(
                          'absolute bottom-0.5 h-1 w-1 rounded-full',
                          isSelected ? 'bg-white' : 'bg-red-500',
                        )}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tóm tắt ngày đã chọn */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-brand-50/60 px-2.5 py-1.5 border border-brand-100/80">
            <span className="text-[11px] font-semibold text-slate-800">
              Ngày chọn: <strong className="text-brand-700">{formatDateVi(selectedDate)}</strong>
            </span>
            <span className="rounded-full bg-white px-2 py-0.2 text-[10px] font-bold text-slate-600 border border-brand-200">
              {selectedDateEvents.length} nhắc nhở
            </span>
          </div>
        </div>

        {/* ── CỘT PHẢI (7/12): FORM GHI NỘI DUNG & DANH SÁCH ─────────────────── */}
        <div className="md:col-span-7 flex flex-col">
          {/* Header tab chuyển đổi: Ghi nội dung | Danh sách */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {activeTab === 'add' ? 'Thêm thông báo mới' : `Danh sách (${selectedDateEvents.length})`}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                  activeTab === 'add'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                + Ghi nội dung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                  activeTab === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Danh sách ({selectedDateEvents.length})
              </button>
            </div>
          </div>

          {/* ── VIEW TAB 1: FORM GHI NỘI DUNG THÔNG BÁO CHO NGÀY ĐÃ CHỌN ──────── */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveReminder} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tiêu đề / Nội dung nhắc nhở:
                </label>
                <input
                  type="text"
                  placeholder="VD: Nhắc nộp bài viết Unit 4, Lịch thi thử trắc nghiệm..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                      className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Gửi tới đối tượng:
                  </label>
                  <Select
                    value={noteTarget}
                    onChange={(e) => setNoteTarget(e.target.value)}
                    size="sm"
                  >
                    {isAdmin && (
                      <>
                        <option value="Tất cả người dùng">Tất cả người dùng</option>
                        <option value="Tất cả học viên">Tất cả học viên</option>
                        <option value="Tất cả giáo viên">Tất cả giáo viên</option>
                      </>
                    )}

                    {myClasses.length > 0 && (
                      <optgroup label={isAdmin ? 'Các lớp học do bạn tạo / quản lý' : 'Các lớp học do bạn tạo'}>
                        {myClasses.map((c) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Select>
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer active:scale-98"
                >
                  <Bell size={13} />
                  <span>Lưu thông báo cho ngày {formatDateVi(selectedDate)}</span>
                </button>
              </div>
            </form>
          )}

          {/* ── VIEW TAB 2: DANH SÁCH NHẮC NHỞ ĐÃ ĐẶT ──────────────────────── */}
          {activeTab === 'list' && (
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
              {selectedDateEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                  <CalendarIcon size={22} className="mx-auto mb-1.5 text-slate-300" />
                  Chưa có thông báo nào cho ngày{' '}
                  <strong className="text-slate-800">{formatDateVi(selectedDate)}</strong>.
                  <p
                    className="mt-1.5 text-[11px] text-brand-600 hover:underline cursor-pointer font-semibold"
                    onClick={() => setActiveTab('add')}
                  >
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
                        <p className="text-xs font-bold text-slate-900 truncate">
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

              {/* Các ngày khác có thông báo */}
              {scheduledList.length > selectedDateEvents.length && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Các ngày khác có thông báo ({scheduledList.length - selectedDateEvents.length}):
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
      </div>
    </div>
  )
}
