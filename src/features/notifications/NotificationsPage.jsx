import { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Layers,
  Plus,
  Radio,
  Search,
  Send,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import { INITIAL_NOTIFICATIONS } from '@/mocks/data/notifications'

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc', badge: 2 },
  { value: 'important', label: 'Quan trọng' },
  { value: 'scheduled', label: 'Lịch gửi' },
]

function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 4

  // Drawer tạo thông báo mới
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')
  const [targetGroup, setTargetGroup] = useState('All Users')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())

      let matchTab = true
      if (activeTab === 'unread') matchTab = !item.isRead
      else if (activeTab === 'important') matchTab = item.isImportant || item.type === 'critical'
      else if (activeTab === 'scheduled') matchTab = item.status === 'scheduled'

      return matchSearch && matchTab
    })
  }, [notifications, activeTab, search])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const handleCreateNotification = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung')
      return
    }

    const newNoti = {
      id: `NOTI-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      type: type,
      isImportant: type === 'critical',
      isRead: false,
      sender: 'Admin',
      targetGroup: targetGroup,
      targetGroupLabel:
        targetGroup === 'All Users'
          ? 'Toàn bộ người dùng'
          : targetGroup === 'Students'
            ? 'Học viên'
            : 'Giáo viên',
      status: isScheduled ? 'scheduled' : 'sent',
      scheduledFor: isScheduled ? `Lên lịch: ${scheduleTime}` : undefined,
      sentAt: isScheduled ? 'Chưa gửi' : 'Vừa xong',
      createdAt: new Date().toISOString(),
    }

    setNotifications((prev) => [newNoti, ...prev])
    setIsCreateOpen(false)
    setTitle('')
    setContent('')
    setType('info')
    setIsScheduled(false)
    setScheduleTime('')
    toast.success(isScheduled ? 'Đã lên lịch gửi thông báo thành công' : 'Đã phát thông báo tức thì đến người dùng')
  }

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Đã xoá thông báo')
  }

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)),
    )
  }

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Thông báo hệ thống</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Quản lý và gửi thông báo đến người dùng nền tảng.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
          Tạo thông báo mới
        </Button>
      </div>

      {/* Main Container Card */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {/* Top bar: Tabs + Search */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value)
                  setPage(1)
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5',
                  activeTab === tab.value
                    ? 'bg-navy-700 text-white'
                    : 'text-ink-muted hover:bg-slate-100 hover:text-navy-700',
                )}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-line bg-canvas pl-8 pr-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notifications List */}
        {pageData.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-muted">
            Không có thông báo nào trong danh mục này.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {pageData.map((item) => {
              const isCritical = item.type === 'critical' || item.isImportant
              const isScheduledItem = item.status === 'scheduled'

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-4 p-5 transition-colors group',
                    !item.isRead ? 'bg-slate-50/70' : 'bg-white hover:bg-slate-50/40',
                  )}
                >
                  {/* Left Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCritical ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <AlertCircle size={20} strokeWidth={2} />
                      </span>
                    ) : isScheduledItem ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Clock size={20} strokeWidth={2} />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Info size={20} strokeWidth={2} />
                      </span>
                    )}
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-700 group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.isImportant && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                          Quan trọng
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed">
                      {item.content}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {item.sender}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {item.targetGroupLabel}
                      </span>
                    </div>
                  </div>

                  {/* Right Meta & Actions */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <span className="text-[11px] text-ink-muted">
                      {isScheduledItem ? item.scheduledFor : item.sentAt}
                    </span>

                    <div className="flex items-center gap-2">
                      {isScheduledItem ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <Clock size={11} /> Lịch gửi
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Send size={11} /> Đã gửi
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                        title="Xoá thông báo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <p className="text-xs text-ink-muted">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> thông báo
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>

      {/* Drawer Tạo Thông Báo Mới */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Thông Báo Mới"
        className="max-w-[480px]"
      >
        <form onSubmit={handleCreateNotification} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Tiêu đề thông báo *
            </label>
            <Input
              placeholder="VD: Bảo trì hệ thống AI khẩn cấp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Nội dung chi tiết *
            </label>
            <textarea
              rows={4}
              placeholder="Nhập nội dung thông báo gửi tới người dùng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-canvas p-3 text-xs focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Loại thông báo
              </label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 text-xs"
              >
                <option value="info">Thông tin chung</option>
                <option value="critical">Khẩn cấp / Quan trọng</option>
                <option value="scheduled">Nhắc nhở định kỳ</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Đối tượng nhận
              </label>
              <Select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="mt-1 text-xs"
              >
                <option value="All Users">Toàn bộ người dùng</option>
                <option value="Students">Học viên</option>
                <option value="Teachers">Giáo viên</option>
              </Select>
            </div>
          </div>

          {/* Lên lịch gửi */}
          <div className="rounded-xl border border-line p-3 space-y-2 bg-slate-50/50">
            <label className="flex items-center gap-2 text-xs font-semibold text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded border-line text-brand-500 focus:ring-brand-500"
              />
              Lên lịch gửi thông báo vào thời gian cụ thể
            </label>

            {isScheduled && (
              <Input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="text-xs mt-1"
                required={isScheduled}
              />
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsCreateOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" fullWidth icon={Send}>
              {isScheduled ? 'Lên lịch gửi' : 'Gửi thông báo ngay'}
            </Button>
          </div>
        </form>
      </Drawer>
    </main>
  )
}

export default NotificationsPage
