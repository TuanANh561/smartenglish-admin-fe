import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  GraduationCap,
  Mail,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function formatFullTime(dateInput) {
  if (!dateInput) return '—'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${min} • ${d}/${m}/${y}`
}

function getIconForNotification(type = '', channel = '') {
  const t = String(type).toLowerCase()
  const c = String(channel).toUpperCase()

  if (t === 'critical' || t === 'alert' || t === 'error') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
        <ShieldAlert size={22} strokeWidth={2} />
      </div>
    )
  }
  if (t === 'payment' || t === 'payment_success' || t === 'payment_receipt') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CreditCard size={22} strokeWidth={2} />
      </div>
    )
  }
  if (t === 'submission' || t === 'submit_assignment') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
        <FileCheck size={22} strokeWidth={2} />
      </div>
    )
  }
  if (t === 'question' || t === 'chat') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
        <MessageSquare size={22} strokeWidth={2} />
      </div>
    )
  }
  if (t === 'scheduled' || t === 'schedule') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
        <Calendar size={22} strokeWidth={2} />
      </div>
    )
  }
  if (c === 'EMAIL') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
        <Mail size={22} strokeWidth={2} />
      </div>
    )
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200">
      <Bell size={22} strokeWidth={2} />
    </div>
  )
}

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  onDelete,
}) {
  const navigate = useNavigate()

  if (!isOpen || !notification) return null

  const senderName =
    notification.sender?.name ||
    (typeof notification.sender === 'string' ? notification.sender : 'Hệ thống SmartEnglish')

  let meta = {}
  if (notification.metadata) {
    try {
      meta = typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata
    } catch {}
  }

  const targetGroupLabel =
    notification.targetGroupLabel ||
    meta?.targetLabel ||
    meta?.targetGroupLabel ||
    notification.targetLabel ||
    (notification.type?.toLowerCase() === 'reminder' || senderName === 'Nhắc nhở theo lịch'
      ? 'Chỉ bản thân'
      : (notification.targetGroup || 'Toàn bộ người dùng'))

  const channelLabel =
    notification.channel === 'EMAIL'
      ? 'Email HTML'
      : notification.channel === 'PUSH'
        ? 'Mobile Push'
        : notification.channel === 'IN_APP'
          ? 'In-App Web'
          : 'Đa kênh (All)'

  const isImportant =
    notification.isImportant ||
    notification.type === 'critical' ||
    notification.type === 'CRITICAL'

  const handleNavigate = () => {
    if (notification.targetLink) {
      navigate(notification.targetLink)
      onClose?.()
    }
  }

  const handleDelete = () => {
    onDelete?.(notification.rawId || notification.id)
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 p-5">
          <div className="flex items-start gap-3.5 min-w-0">
            {getIconForNotification(notification.type, notification.channel)}
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {isImportant && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200">
                    Quan trọng
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                  {channelLabel}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold border',
                    notification.isRead
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200',
                  )}
                >
                  {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                {notification.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Người gửi</p>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800">
                <User size={13} className="text-brand-500 shrink-0" />
                <span className="truncate">{senderName}</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Đối tượng nhận</p>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800">
                <Users size={13} className="text-indigo-500 shrink-0" />
                <span className="truncate">{targetGroupLabel}</span>
              </div>
            </div>

            <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                Thời gian: <strong>{formatFullTime(notification.createdAt)}</strong>
              </span>
              {notification.time && notification.time !== notification.createdAt && (
                <span className="text-slate-400 italic">({notification.time})</span>
              )}
            </div>
          </div>

          {/* Nội dung chi tiết */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nội dung thông báo
            </p>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
              {notification.content || 'Không có nội dung chi tiết.'}
            </div>
          </div>

          {/* Đường dẫn liên kết nếu có và là liên kết cụ thể */}
          {Boolean(notification.targetLink) &&
            notification.targetLink !== '/app/thong-bao' &&
            notification.targetLink !== '#' && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-semibold text-brand-900">Liên kết nội dung liên quan</p>
                <p className="text-brand-600 truncate text-[11px] font-mono mt-0.5">
                  {notification.targetLink}
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleNavigate}
                className="shrink-0 text-xs py-1 px-3 flex items-center gap-1.5"
              >
                <span>Mở liên kết</span>
                <ExternalLink size={13} />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
          {onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Xoá thông báo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
