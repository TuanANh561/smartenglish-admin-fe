import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Trash2,
  X,
  FileCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'smartenglish_teacher_notifications'

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Học viên nộp bài tập mới',
    content: 'Nguyễn Văn An vừa nộp bài "Luyện nói Speaking Unit 4 - Travel Plans".',
    time: '5 phút trước',
    isRead: false,
    type: 'submission',
    targetLink: '/app/lop-hoc',
    sender: {
      name: 'Nguyễn Văn An',
      role: 'Học viên',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'notif-2',
    title: 'Câu hỏi mới từ học sinh trong lớp',
    content: 'Trần Thị Mai thắc mắc trong bài giảng "Thì Quá khứ hoàn thành": "Khi nào dùng had done ạ?"',
    time: '25 phút trước',
    isRead: false,
    type: 'question',
    targetLink: '/app/cong-dong',
    sender: {
      name: 'Trần Thị Mai',
      role: 'Học viên',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'notif-3',
    title: 'Học liệu biên soạn đã được duyệt',
    content: 'Bài nghe "TOEIC Part 3 - Office Conversation" đã được quản trị viên duyệt xuất bản.',
    time: '2 giờ trước',
    isRead: false,
    type: 'approval',
    targetLink: '/app/hoc-lieu/bai-nghe',
    sender: {
      name: 'Ban Quản trị',
      role: 'Hệ thống',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'notif-4',
    title: 'Nhắc nhở buổi học trực tuyến',
    content: 'Lớp "IELTS Speaking Master 01" sẽ diễn ra lúc 19:30 tối nay. Hãy chuẩn bị slide bài giảng.',
    time: 'Hôm nay, 14:00',
    isRead: true,
    type: 'schedule',
    targetLink: '/app/lop-hoc',
    sender: {
      name: 'Lịch học tự động',
      role: 'Hệ thống',
      avatar: null,
    },
  },
  {
    id: 'notif-5',
    title: 'Báo cáo tiến độ học viên định kỳ',
    content: 'Báo cáo tuần của 28 học viên đã được AI tổng hợp và sẵn sàng để bạn nhận xét.',
    time: 'Hôm qua',
    isRead: true,
    type: 'report',
    targetLink: '/app/lop-hoc',
    sender: {
      name: 'AI Analytics',
      role: 'Hệ thống',
      avatar: null,
    },
  },
]

export default function NotificationDropdown({
  isOpen,
  onClose,
  anchorRef,
  userRole = 'teacher',
  onUnreadCountChange,
}) {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread'

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS
    } catch {
      return DEFAULT_NOTIFICATIONS
    }
  })

  // Lưu lại vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch {
      // ignore
    }
  }, [notifications])

  // Tính số lượng chưa đọc và báo ra ngoài cho chuông thông báo
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  useEffect(() => {
    onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  // Lọc theo tab
  const filteredList = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, activeTab])

  // Đóng khi click ngoài
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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
  }

  // Đánh dấu 1 thông báo là đã đọc
  const handleItemClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    )
    if (item.targetLink) {
      navigate(item.targetLink)
      onClose()
    }
  }

  // Xóa 1 thông báo
  const handleDeleteItem = (e, id) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (!isOpen) return null

  const getIconForType = (type) => {
    switch (type) {
      case 'submission':
        return <FileCheck size={14} className="text-emerald-600" />
      case 'question':
        return <MessageSquare size={14} className="text-blue-600" />
      case 'approval':
        return <Sparkles size={14} className="text-amber-600" />
      case 'schedule':
        return <Calendar size={14} className="text-indigo-600" />
      default:
        return <AlertCircle size={14} className="text-slate-600" />
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-13 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white shadow-2xs">
              {unreadCount} mới
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
              title="Đánh dấu tất cả là đã đọc"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Đã đọc tất cả</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Tabs Lọc: Tất cả / Chưa đọc ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'all'
              ? 'bg-brand-500 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'unread'
              ? 'bg-brand-500 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span
              className={cn(
                'flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold px-1',
                activeTab === 'unread' ? 'bg-white text-brand-600' : 'bg-red-500 text-white',
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Danh sách thông báo ── */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
        {filteredList.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <Bell size={22} />
            </div>
            <p className="text-xs font-medium text-slate-500">
              {activeTab === 'unread'
                ? 'Tuyệt vời! Bạn không còn thông báo chưa đọc nào.'
                : 'Chưa có thông báo nào dành cho bạn.'}
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50',
                !item.isRead ? 'bg-brand-50/40' : 'bg-white',
              )}
            >
              {/* Avatar hoặc Icon người gửi */}
              <div className="relative shrink-0 mt-0.5">
                {item.sender?.avatar ? (
                  <img
                    src={item.sender.avatar}
                    alt={item.sender.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200">
                    <GraduationCap size={18} />
                  </div>
                )}
                {/* Type Badge ở góc dưới avatar */}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-2xs border border-slate-200">
                  {getIconForType(item.type)}
                </span>
              </div>

              {/* Nội dung thông báo */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={cn(
                      'text-xs truncate',
                      !item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700',
                    )}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {item.time}
                  </span>
                </div>

                <p className="text-[11.5px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                  {item.content}
                </p>

                {item.sender?.name && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    Từ: <span className="text-slate-600">{item.sender.name}</span>
                  </p>
                )}
              </div>

              {/* Dấu chấm xanh nếu chưa đọc */}
              {!item.isRead && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-brand-600 shrink-0" />
              )}

              {/* Nút xóa nhanh khi hover */}
              <button
                type="button"
                onClick={(e) => handleDeleteItem(e, item.id)}
                title="Xóa thông báo này"
                className="absolute right-2 top-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-md bg-white hover:bg-red-50 hover:text-red-600 text-slate-400 shadow-2xs border border-slate-200 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 flex items-center justify-between text-xs">
        {userRole === 'admin' ? (
          <button
            type="button"
            onClick={() => {
              navigate('/app/thong-bao')
              onClose()
            }}
            className="flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer w-full justify-center py-0.5"
          >
            <span>Quản lý thông báo toàn hệ thống</span>
            <ExternalLink size={13} />
          </button>
        ) : (
          <span className="text-[11px] text-slate-500 text-center w-full">
            ✨ Cập nhật thông báo trực tiếp từ lớp học & học viên
          </span>
        )}
      </div>
    </div>
  )
}
