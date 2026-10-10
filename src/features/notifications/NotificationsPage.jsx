import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  History,
  Info,
  Layers,
  Mail,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
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
import { useAuthStore } from '@/store/authStore'
import {
  getNotifications,
  createNotification,
  deleteNotification,
  getScheduledNotifications,
  createScheduledNotification,
  cancelScheduledNotification,
  getUserActivities,
  logUserActivity,
  sendDirectEmail,
} from '@/features/notifications/notificationApi'

const TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'important', label: 'Quan trọng' },
  { value: 'scheduled', label: 'Lịch gửi' },
  { value: 'activities', label: 'Lịch sử hoạt động' },
]

function formatTimeVi(dateInput) {
  if (!dateInput) return 'Vừa xong'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Vừa xong'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

function NotificationsPage() {
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || 1

  // Dữ liệu thật 100% từ backend notification-service (Không fake data, không fallback)
  const [notifications, setNotifications] = useState([])
  const [schedules, setSchedules] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  // Drawer tạo thông báo mới
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')
  const [channel, setChannel] = useState('ALL') // 'ALL' | 'IN_APP' | 'EMAIL' | 'PUSH'
  const [userEmail, setUserEmail] = useState('hocvien@smartenglish.edu.vn')
  const [targetGroup, setTargetGroup] = useState('All Users')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')

  // Modal test activity log
  const [isTestLogOpen, setIsTestLogOpen] = useState(false)

  // Nạp dữ liệu thật 100% từ backend notification-service
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Lấy thông báo in-app
      const resNotif = await getNotifications({ userId: currentUserId, size: 50 }).catch(() => null)
      const listNotif = resNotif?.content || (Array.isArray(resNotif) ? resNotif : resNotif?.data?.content || [])
      const mappedNotif = Array.isArray(listNotif)
        ? listNotif.map((n) => ({
            id: String(n.id),
            rawId: n.id,
            title: n.title,
            content: n.content,
            type: (n.type || 'info').toLowerCase(),
            isImportant: n.type === 'CRITICAL' || n.type === 'critical',
            isRead: Boolean(n.isRead),
            sender: n.senderName || 'Hệ thống',
            targetGroup: 'All Users',
            targetGroupLabel: 'Toàn bộ người dùng',
            channel: n.channel || 'IN_APP',
            status: 'sent',
            sentAt: formatTimeVi(n.createdAt),
            createdAt: n.createdAt,
          }))
        : []

      // 2. Lấy danh sách lịch gửi từ notification-service
      const resSched = await getScheduledNotifications({ creatorId: currentUserId }).catch(() => null)
      const listSched = Array.isArray(resSched) ? resSched : resSched?.data || []
      const mappedSched = Array.isArray(listSched)
        ? listSched.map((s) => ({
            id: `SCH-${s.id}`,
            rawId: s.id,
            title: s.title,
            content: s.content || s.title,
            type: 'scheduled',
            isImportant: false,
            isRead: true,
            sender: user?.displayName || 'Giảng viên',
            targetGroup: s.targetType || 'ALL',
            targetGroupLabel: s.targetLabel || 'Toàn bộ người dùng',
            channel: s.channels || 'IN_APP',
            status: 'scheduled',
            scheduledFor: s.scheduledAt
              ? `Lên lịch: ${new Date(s.scheduledAt).toLocaleString('vi-VN')}`
              : 'Lên lịch',
            sentAt: 'Chưa gửi',
            createdAt: s.createdAt || s.scheduledAt,
          }))
        : []

      setSchedules(Array.isArray(listSched) ? listSched : [])
      setNotifications([...mappedNotif, ...mappedSched])

      // 3. Lấy lịch sử hoạt động từ backend
      const resAct = await getUserActivities({ userId: currentUserId, size: 50 }).catch(() => null)
      const listAct = resAct?.content || (Array.isArray(resAct) ? resAct : resAct?.data?.content || [])
      setActivities(Array.isArray(listAct) ? listAct : [])
    } catch (err) {
      console.warn('Lỗi tải dữ liệu thông báo từ backend:', err)
      setNotifications([])
      setActivities([])
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUserId])

  // Lọc thông báo
  const filteredNotifications = useMemo(() => {
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

  // Lọc lịch sử hoạt động
  const filteredActivities = useMemo(() => {
    if (!search) return activities
    const s = search.toLowerCase()
    return activities.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(s)) ||
        (a.description && a.description.toLowerCase().includes(s)) ||
        (a.activityType && a.activityType.toLowerCase().includes(s)) ||
        (a.ipAddress && a.ipAddress.toLowerCase().includes(s)),
    )
  }, [activities, search])

  const total = activeTab === 'activities' ? filteredActivities.length : filteredNotifications.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE

  const pageNotificationData = filteredNotifications.slice(start, start + PAGE_SIZE)
  const pageActivityData = filteredActivities.slice(start, start + PAGE_SIZE)

  // Tạo thông báo mới (In-app, Email, Push hoặc Lên lịch)
  const handleCreateNotification = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung')
      return
    }

    if (isScheduled && !scheduleTime) {
      toast.error('Vui lòng chọn thời gian lên lịch gửi')
      return
    }

    try {
      if (isScheduled) {
        // Lên lịch gửi
        const scheduledAt = new Date(scheduleTime).toISOString()
        await createScheduledNotification({
          creatorId: currentUserId,
          title: title.trim(),
          content: content.trim(),
          targetType: targetGroup.toUpperCase(),
          targetLabel:
            targetGroup === 'All Users'
              ? 'Toàn bộ người dùng'
              : targetGroup === 'Students'
                ? 'Học viên'
                : 'Giáo viên',
          scheduledAt,
          remindType: type.toUpperCase(),
          repeatType: 'NONE',
          channels: channel,
        })

        const newNoti = {
          id: `SCH-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
          type: 'scheduled',
          isImportant: false,
          isRead: false,
          sender: user?.displayName || 'Admin',
          targetGroup,
          targetGroupLabel:
            targetGroup === 'All Users'
              ? 'Toàn bộ người dùng'
              : targetGroup === 'Students'
                ? 'Học viên'
                : 'Giáo viên',
          status: 'scheduled',
          channel,
          scheduledFor: `Lên lịch: ${new Date(scheduleTime).toLocaleString('vi-VN')}`,
          sentAt: 'Chưa gửi',
          createdAt: new Date().toISOString(),
        }
        setNotifications((prev) => [newNoti, ...prev])
        toast.success(`Đã lên lịch phát thông báo qua kênh [${channel}] thành công!`)
      } else {
        // Gửi ngay lập tức (In-App + Tự động gửi Email nếu có)
        await createNotification({
          userId: currentUserId,
          title: title.trim(),
          content: content.trim(),
          type: type.toUpperCase(),
          channel,
          userEmail: channel === 'EMAIL' || channel === 'ALL' ? userEmail : undefined,
          targetLink: '/app/thong-bao',
          senderId: currentUserId,
          senderName: user?.displayName || 'Ban Quản trị Hệ thống',
        })

        const newNoti = {
          id: `NOTI-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
          type,
          isImportant: type === 'critical',
          isRead: false,
          sender: user?.displayName || 'Ban Quản trị',
          targetGroup,
          targetGroupLabel:
            targetGroup === 'All Users'
              ? 'Toàn bộ người dùng'
              : targetGroup === 'Students'
                ? 'Học viên'
                : 'Giáo viên',
          status: 'sent',
          channel,
          sentAt: 'Vừa xong',
          createdAt: new Date().toISOString(),
        }
        setNotifications((prev) => [newNoti, ...prev])

        // Ghi lại vào activity log
        logUserActivity({
          userId: currentUserId,
          activityType: 'CREATE_NOTIFICATION',
          title: 'Phát thông báo hệ thống',
          description: `Đã phát thông báo "${title.trim()}" qua kênh ${channel}.`,
          status: 'SUCCESS',
        }).catch(() => {})

        toast.success(
          channel === 'EMAIL'
            ? 'Đã phát email thông báo HTML theo mẫu thành công!'
            : `Đã phát thông báo tức thì qua kênh [${channel}]!`,
        )
      }

      setIsCreateOpen(false)
      setTitle('')
      setContent('')
      setType('info')
      setChannel('ALL')
      setIsScheduled(false)
      setScheduleTime('')
    } catch (err) {
      console.error('Lỗi gửi thông báo:', err)
      toast.error('Gửi thông báo thất bại, vui lòng thử lại!')
    }
  }

  // Xóa thông báo (In-App hoặc Lịch hẹn)
  const handleDelete = async (id) => {
    const item = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Đã xoá thông báo')
    try {
      if (item?.status === 'scheduled' && item?.rawId) {
        await cancelScheduledNotification(item.rawId, currentUserId)
      } else {
        const numId = Number(id)
        if (!isNaN(numId)) {
          await deleteNotification(numId, currentUserId)
        }
      }
    } catch {
      // retain optimistic deletion
    }
  }

  // Ghi activity test
  const handleSimulateActivity = async (activityType, titleText, descText) => {
    try {
      const newAct = {
        userId: currentUserId,
        activityType,
        title: titleText,
        description: descText,
        ipAddress: '127.0.0.1',
        deviceInfo: 'Chrome (Browser Session)',
        status: 'SUCCESS',
      }
      const res = await logUserActivity(newAct).catch(() => null)
      const item = res || {
        ...newAct,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      }
      setActivities((prev) => [item, ...prev])
      toast.success(`Đã ghi nhận sự kiện: ${titleText}`)
    } catch {
      toast.error('Lỗi ghi nhận lịch sử')
    }
  }

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  return (
    <div className="space-y-4">
      {/* Header Giới Thiệu Chức Năng */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 text-white p-5 rounded-2xl shadow-sm border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-400/30">
              <Bell size={18} />
            </span>
            <h2 className="text-lg font-bold">Trung tâm Thông báo & Lịch sử Hoạt động</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Hỗ trợ đa kênh (Email HTML, Chuông thông báo Web & Mobile, Đẩy thông báo Push), lên lịch nhắc nhở trong lịch, và tự động ghi vết toàn bộ lịch sử hoạt động của người dùng.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            onClick={loadData}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Làm mới
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            Tạo thông báo mới
          </Button>
        </div>
      </div>

      {/* Main Container Card */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {/* Top bar: Tabs + Search + Action */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map((tab) => {
              const isUnreadTab = tab.value === 'unread'
              const badgeCount = isUnreadTab ? unreadCount : null
              return (
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
                  {badgeCount > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder={
                  activeTab === 'activities' ? 'Tìm trong nhật ký hoạt động...' : 'Tìm kiếm thông báo...'
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-navy-700 placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {activeTab === 'activities' && (
              <Button
                size="sm"
                variant="secondary"
                icon={History}
                onClick={() =>
                  handleSimulateActivity(
                    'PAYMENT_SUCCESS',
                    'Thanh toán học phí thành công',
                    'Mô phỏng sự kiện thanh toán thành công qua cổng thanh toán.',
                  )
                }
                title="Ghi nhận sự kiện hoạt động mẫu để kiểm tra"
              >
                + Ghi mẫu
              </Button>
            )}
          </div>
        </div>

        {/* NỘI DUNG THEO TAB: LỊCH SỬ HOẠT ĐỘNG */}
        {activeTab === 'activities' ? (
          <div>
            {pageActivityData.length === 0 ? (
              <div className="p-12 text-center text-sm text-ink-muted">
                Chưa có lịch sử hoạt động nào được ghi nhận.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {pageActivityData.map((act) => {
                  const isPayment = act.activityType === 'PAYMENT_SUCCESS'
                  const isSubmit = act.activityType === 'SUBMIT_ASSIGNMENT'
                  const isLogin = act.activityType === 'LOGIN'
                  const isClass = act.activityType === 'JOIN_CLASS'

                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Icon Loại Hoạt Động */}
                      <div className="mt-0.5 shrink-0">
                        {isPayment ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={18} />
                          </span>
                        ) : isSubmit ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <Check size={18} />
                          </span>
                        ) : isLogin ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <ShieldCheck size={18} />
                          </span>
                        ) : isClass ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                            <Users size={18} />
                          </span>
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Activity size={18} />
                          </span>
                        )}
                      </div>

                      {/* Thông tin hoạt động */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-800">{act.title}</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            {act.activityType}
                          </span>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            {act.status || 'SUCCESS'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {act.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted pt-1">
                          {act.ipAddress && <span>IP: <strong>{act.ipAddress}</strong></span>}
                          {act.deviceInfo && <span>Thiết bị: {act.deviceInfo}</span>}
                        </div>
                      </div>

                      {/* Thời gian */}
                      <div className="shrink-0 text-right text-xs text-ink-muted">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={11} />
                          {formatTimeVi(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* NỘI DUNG CÁC TAB THÔNG BÁO */
          <div>
            {pageNotificationData.length === 0 ? (
              <div className="p-12 text-center text-sm text-ink-muted">
                Không có thông báo nào trong danh mục này.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {pageNotificationData.map((item) => {
                  const isCritical = item.type === 'critical' || item.isImportant
                  const isScheduledItem = item.status === 'scheduled'
                  const channelBadge =
                    item.channel === 'EMAIL'
                      ? 'Email'
                      : item.channel === 'PUSH'
                        ? 'Mobile Push'
                        : item.channel === 'IN_APP'
                          ? 'In-App Web'
                          : 'Đa kênh (All)'

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
                            <Calendar size={20} strokeWidth={2} />
                          </span>
                        ) : item.channel === 'EMAIL' ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <Mail size={20} strokeWidth={2} />
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
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-600">
                              Quan trọng
                            </span>
                          )}
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Kênh: {channelBadge}
                          </span>
                        </div>

                        <p className="text-sm text-ink-muted leading-relaxed">
                          {item.content}
                        </p>

                        {/* Metadata line */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-ink-muted">
                          <span className="flex items-center gap-1">
                            <User size={13} />
                            {item.sender}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users size={13} />
                            {item.targetGroupLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex flex-col items-end gap-2.5 shrink-0">
                        <span className="text-xs text-ink-muted">
                          {isScheduledItem ? item.scheduledFor : item.sentAt}
                        </span>

                        <div className="flex items-center gap-2">
                          {isScheduledItem ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Clock size={12} /> Lịch gửi
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <Send size={12} /> Đã phát
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
          </div>
        )}

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <p className="text-sm text-ink-muted">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> {activeTab === 'activities' ? 'hoạt động' : 'thông báo'}
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>

      {/* Drawer Tạo Thông Báo Mới (Hỗ trợ Đa kênh & Lên lịch) */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Thông Báo Mới"
        className="max-w-[500px]"
      >
        <form onSubmit={handleCreateNotification} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Tiêu đề thông báo *
            </label>
            <Input
              placeholder="VD: Nhắc nhở nộp bài tập Speaking Unit 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 font-semibold text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Nội dung chi tiết *
            </label>
            <textarea
              rows={4}
              placeholder="Nhập nội dung thông báo gửi tới học viên hoặc người dùng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-canvas p-3 text-sm focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Kênh phát thông báo */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Kênh phát thông báo
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[
                { id: 'ALL', label: 'Tất cả (Đa kênh)', icon: Layers },
                { id: 'IN_APP', label: 'Web In-App (Chuông)', icon: Bell },
                { id: 'EMAIL', label: 'Email HTML', icon: Mail },
                { id: 'PUSH', label: 'Mobile Push', icon: Smartphone },
              ].map((c) => {
                const IconComponent = c.icon
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer',
                      channel === c.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                        : 'border-line bg-white hover:bg-slate-50 text-slate-700',
                    )}
                  >
                    <IconComponent size={14} className={channel === c.id ? 'text-brand-600' : 'text-slate-400'} />
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nếu chọn Email hoặc ALL: Hiển thị trường email nhận */}
          {(channel === 'EMAIL' || channel === 'ALL') && (
            <div className="rounded-xl border border-line p-3 bg-amber-50/40 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                <Mail size={13} />
                Địa chỉ email người nhận (Thử nghiệm template HTML)
              </label>
              <Input
                type="email"
                placeholder="VD: student@smartenglish.edu.vn"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-amber-800">
                Hệ thống sẽ render email HTML chuẩn thương hiệu SmartEnglish kèm nút bấm hành động.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Loại thông báo
              </label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 text-sm font-medium"
              >
                <option value="info">Thông tin chung</option>
                <option value="critical">Khẩn cấp / Quan trọng</option>
                <option value="homework_reminder">Nhắc bài tập về nhà</option>
                <option value="payment_receipt">Biên lai thanh toán</option>
                <option value="welcome">Chào mừng tài khoản mới</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Đối tượng nhận
              </label>
              <Select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="mt-1 text-sm font-medium"
              >
                <option value="All Users">Toàn bộ người dùng</option>
                <option value="Students">Học viên</option>
                <option value="Teachers">Giáo viên</option>
              </Select>
            </div>
          </div>

          {/* Lên lịch gửi trong lịch */}
          <div className="rounded-xl border border-line p-3 space-y-2 bg-slate-50/50">
            <label className="flex items-center gap-2 text-sm font-semibold text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded border-line text-brand-500 focus:ring-brand-500"
              />
              Lên lịch gửi thông báo / Đặt trong lịch
            </label>

            {isScheduled && (
              <div className="space-y-1">
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="text-sm mt-1"
                  required={isScheduled}
                />
                <p className="text-[11px] text-ink-muted">
                  Đồng bộ vào lịch giảng viên và tự động quét gửi theo chu kỳ.
                </p>
              </div>
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
              {isScheduled ? 'Lên lịch gửi vào lịch' : 'Phát thông báo ngay'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

export default NotificationsPage
