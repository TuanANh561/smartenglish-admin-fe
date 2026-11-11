import { useCallback, useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  Calendar,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Laptop,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  CheckCircle2,
  Edit3,
  PlusCircle,
  AlertTriangle,
  User,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { getUserActivities } from '@/features/notifications/notificationApi'
import { getAuditLogs } from './auditLogApi'

const PAGE_SIZE = 10

function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function getInitials(name) {
  if (!name) return 'GV'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function stripEmojis(str) {
  if (!str) return ''
  return String(str).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
}

const TARGET_TYPE_VI_MAP = {
  friend_request_received: 'Lời mời kết bạn',
  friend_accepted: 'Kết bạn',
  chat_message: 'Tin nhắn',
  payment_receipt: 'Biên lai thanh toán',
  subscription_success: 'Gói dịch vụ',
  exam_created: 'Đề thi',
  assignment_submitted: 'Bài tập nộp',
  assignment_created: 'Bài tập lớp học',
  class_join_request: 'Yêu cầu vào lớp',
  class_created: 'Lớp học',
  course_created: 'Khóa học',
  violation_warning: 'Cảnh báo cộng đồng',
  course: 'Khóa học',
  reading_passage: 'Bài đọc',
  listening_lesson: 'Bài nghe',
  grammar_lesson: 'Bài ngữ pháp',
  vocabulary: 'Từ vựng',
  exam: 'Đề thi',
  user: 'Tài khoản',
  teacher_registration: 'Hồ sơ giáo viên',
  system_settings: 'Cấu hình hệ thống',
  auth: 'Xác thực bảo mật',
  ai_content: 'Học liệu AI',
  general: 'Hoạt động hệ thống',
}

function formatTargetType(rawType) {
  if (!rawType) return 'Hoạt động'
  const key = String(rawType).trim().toLowerCase()
  if (TARGET_TYPE_VI_MAP[key]) return TARGET_TYPE_VI_MAP[key]
  // Nếu đã là tiếng Việt có dấu hoặc chữ thường đẹp thì giữ nguyên
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(rawType)) {
    return String(rawType).trim()
  }
  return String(rawType).replace(/_/g, ' ')
}

function cleanTargetId(rawId) {
  if (rawId === null || rawId === undefined) return ''
  const s = String(rawId).trim().replace(/^#+/, '')
  if (!s || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null') return ''
  return s
}

function formatUserHandle(userStr) {
  if (!userStr) return ''
  const s = String(userStr).trim().replace(/^@+/, '')
  if (!s) return ''
  // Nếu là email (đã có @ bên trong) hoặc chuỗi mô tả có khoảng trắng thì hiển thị trực tiếp, không gắn thêm @ ở đầu
  if (s.includes('@') || s.includes(' ')) return s
  return `@${s}`
}

function isWithinDateRange(timestampMs, dateRange) {
  if (dateRange === 'all') return true
  const now = Date.now()
  if (dateRange === '24h') return now - timestampMs <= 24 * 60 * 60 * 1000
  if (dateRange === '7d') return now - timestampMs <= 7 * 24 * 60 * 60 * 1000
  if (dateRange === '30d') return now - timestampMs <= 30 * 24 * 60 * 60 * 1000
  return true
}

function AuditLogPage() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = (user?.role || '').toUpperCase().includes('TEACHER')

  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Bộ lọc
  const [dateRange, setDateRange] = useState('all')
  const [userRole, setUserRole] = useState('all')
  const [actionType, setActionType] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Drawer xem chi tiết
  const [activeLog, setActiveLog] = useState(null)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isTeacher) {
        const teacherName = user?.displayName || 'Giáo viên'
        const teacherEmail = user?.email || 'teacher'
        const teacherInitials = getInitials(teacherName)
        const currentUserId = Number(user?.id)

        // Tải dữ liệu hoạt động thực tế của giáo viên từ các phân hệ
        const [actsRes, ordersRes, classesRes, coursesRes, examsRes] = await Promise.allSettled([
          getUserActivities({ userId: user?.id, page: 0, size: 50 }),
          api.get('/payment/user/orders', { params: { userId: user?.id } }),
          api.get('/api/v1/teacher/classes', { params: { page: 0, size: 30 } }),
          api.get('/admin/courses'),
          api.get('/admin/exams', { params: { page: 0, size: 50 } }),
        ])

        const teacherLogs = []

        // 1. Chuyển đổi các Lớp học & Bài tập do Giáo viên tạo và giao
        const rawClasses = classesRes.status === 'fulfilled' ? classesRes.value : null
        const classesList = Array.isArray(rawClasses?.content)
          ? rawClasses.content
          : Array.isArray(rawClasses?.data?.content)
          ? rawClasses.data.content
          : Array.isArray(rawClasses?.data)
          ? rawClasses.data
          : Array.isArray(rawClasses)
          ? rawClasses
          : []

        classesList.forEach((cls) => {
          const d = cls.createdAt ? new Date(cls.createdAt) : new Date()
          const classCode = cls.code || `CLS-${cls.id}`
          teacherLogs.push({
            id: `class-${cls.id}`,
            logCode: `CLS-${cls.id}`,
            timestamp: formatTimestamp(d),
            rawTime: d.getTime(),
            userName: teacherName,
            user: teacherEmail,
            userInitials: teacherInitials,
            userRole: 'teacher',
            userRoleLabel: 'Giáo viên',
            avatarColor: '#2563EB',
            actionType: 'create',
            action: `Quản lý lớp học: ${cls.name}`,
            actionLabel: `Khởi tạo & quản lý lớp học "${cls.name}"`,
            targetType: 'Lớp học',
            targetId: classCode,
            reason: `Lớp học mã ${classCode} (${cls.studentCount ?? 0} học viên, ${cls.assignmentCount ?? 0} bài tập)`,
            ipAddress: '127.0.0.1',
            device: 'Web Teacher Console',
            severity: 'normal',
            details: {
              classId: cls.id,
              className: cls.name,
              classCode,
              studentCount: cls.studentCount ?? 0,
            },
          })
        })

        // Tải danh sách bài tập đã giao của tối đa 5 lớp học gần nhất
        if (classesList.length > 0) {
          const assignmentPromises = classesList.slice(0, 5).map((cls) =>
            api
              .get(`/api/v1/teacher/classes/${cls.id}/assignments`, { params: { page: 0, size: 20 } })
              .then((res) => ({ cls, res }))
              .catch(() => null)
          )
          const assignmentResults = await Promise.all(assignmentPromises)
          assignmentResults.filter(Boolean).forEach(({ cls, res }) => {
            const asgList = Array.isArray(res?.content)
              ? res.content
              : Array.isArray(res?.data?.content)
              ? res.data.content
              : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
              ? res
              : []
            asgList.forEach((asg) => {
              const d = asg.createdAt ? new Date(asg.createdAt) : new Date()
              teacherLogs.push({
                id: `asg-${asg.id}`,
                logCode: `ASG-${asg.id}`,
                timestamp: formatTimestamp(d),
                rawTime: d.getTime(),
                userName: teacherName,
                user: teacherEmail,
                userInitials: teacherInitials,
                userRole: 'teacher',
                userRoleLabel: 'Giáo viên',
                avatarColor: '#4F46E5',
                actionType: 'create',
                action: `Giao bài tập: ${asg.title}`,
                actionLabel: `Đã giao bài tập "${asg.title}" cho lớp ${cls.name}`,
                targetType: 'Bài tập lớp học',
                targetId: String(asg.id),
                reason: asg.description || `Hạn nộp: ${asg.dueAt ? new Date(asg.dueAt).toLocaleString('vi-VN') : 'Không giới hạn'}`,
                ipAddress: '127.0.0.1',
                device: 'Web Teacher Console',
                severity: 'normal',
                details: {
                  assignmentId: asg.id,
                  title: asg.title,
                  type: asg.type,
                  className: cls.name,
                  dueAt: asg.dueAt,
                },
              })
            })
          })
        }

        // 2. Chuyển đổi Khóa học & Đề thi do chính Giáo viên biên soạn
        const rawCourses = coursesRes.status === 'fulfilled' ? coursesRes.value : []
        const coursesList = Array.isArray(rawCourses?.data)
          ? rawCourses.data
          : Array.isArray(rawCourses?.content)
          ? rawCourses.content
          : Array.isArray(rawCourses)
          ? rawCourses
          : []
        coursesList
          .filter((c) => Number(c.createdBy || c.authorId) === currentUserId)
          .forEach((c) => {
            const d = c.updatedAt || c.createdAt ? new Date(c.updatedAt || c.createdAt) : new Date()
            teacherLogs.push({
              id: `course-${c.id}`,
              logCode: `CRS-${c.id}`,
              timestamp: formatTimestamp(d),
              rawTime: d.getTime(),
              userName: teacherName,
              user: teacherEmail,
              userInitials: teacherInitials,
              userRole: 'teacher',
              userRoleLabel: 'Giáo viên',
              avatarColor: '#0284C7',
              actionType: 'create',
              action: `Biên soạn khóa học: ${c.title}`,
              actionLabel: `Biên soạn khóa học "${c.title}"`,
              targetType: 'Khóa học',
              targetId: String(c.code || c.id),
              reason: `Cấp độ ${c.cefrLevel || 'B1'} • Trạng thái: ${c.isPublished ? 'Đã xuất bản' : 'Bản nháp'}`,
              ipAddress: '127.0.0.1',
              device: 'Web Teacher Console',
              severity: 'normal',
              details: { courseId: c.id, title: c.title, cefrLevel: c.cefrLevel },
            })
          })

        const rawExams = examsRes.status === 'fulfilled' ? examsRes.value : []
        const examsList = Array.isArray(rawExams?.content)
          ? rawExams.content
          : Array.isArray(rawExams?.data?.content)
          ? rawExams.data.content
          : Array.isArray(rawExams?.data)
          ? rawExams.data
          : Array.isArray(rawExams)
          ? rawExams
          : []
        examsList
          .filter((e) => Number(e.createdBy || e.authorId) === currentUserId)
          .forEach((e) => {
            const d = e.updatedAt || e.createdAt ? new Date(e.updatedAt || e.createdAt) : new Date()
            teacherLogs.push({
              id: `exam-${e.id}`,
              logCode: `EXM-${e.id}`,
              timestamp: formatTimestamp(d),
              rawTime: d.getTime(),
              userName: teacherName,
              user: teacherEmail,
              userInitials: teacherInitials,
              userRole: 'teacher',
              userRoleLabel: 'Giáo viên',
              avatarColor: '#7C3AED',
              actionType: 'create',
              action: `Biên soạn đề thi: ${e.title}`,
              actionLabel: `Tạo đề thi "${e.title}"`,
              targetType: 'Đề thi',
              targetId: String(e.id),
              reason: `Thời lượng ${e.durationMinutes || 45} phút • Cấp độ ${e.level || 'B1'}`,
              ipAddress: '127.0.0.1',
              device: 'Web Teacher Console',
              severity: 'normal',
              details: { examId: e.id, title: e.title, level: e.level },
            })
          })

        // 3. Chuyển đổi đơn hàng từ payment-service (chính của giáo viên)
        const rawOrders = ordersRes.status === 'fulfilled' ? ordersRes.value : []
        const ordersList = Array.isArray(rawOrders)
          ? rawOrders
          : Array.isArray(rawOrders?.content)
          ? rawOrders.content
          : []

        ordersList
          .filter((o) => o.status === 'completed' || o.status === 'SUCCESS' || o.status === 'paid')
          .forEach((o) => {
            const d = o.createdAt ? new Date(o.createdAt) : new Date()
            const planTitle = stripEmojis(o.planName || 'Gói Giảng Viên Pro')
            const amountStr = o.amount ? `${Number(o.amount).toLocaleString('vi-VN')}đ` : '20.000đ'
            const orderCode = cleanTargetId(o.orderCode || `ORD-${o.id}`)

            teacherLogs.push({
              id: `order-${o.id || orderCode}`,
              logCode: orderCode,
              timestamp: formatTimestamp(d),
              rawTime: d.getTime(),
              userName: teacherName,
              user: teacherEmail,
              userInitials: teacherInitials,
              userRole: 'teacher',
              userRoleLabel: 'Giáo viên',
              avatarColor: '#10B981',
              actionType: 'payment',
              action: `Nâng cấp ${planTitle}`,
              actionLabel: `Đã nâng cấp thành công ${planTitle} (${amountStr})`,
              targetService: isTeacher ? undefined : 'payment-service',
              targetType: 'Giao dịch',
              targetId: orderCode,
              reason: `Thanh toán VietQR Napas thành công cho ${planTitle}. Mã đơn: ${orderCode}`,
              ipAddress: '127.0.0.1',
              device: 'Web Teacher Console',
              severity: 'normal',
              details: {
                orderId: o.id,
                orderCode,
                planName: planTitle,
                amount: o.amount,
                paymentGateway: o.paymentGateway || 'VIETQR_SEPAY',
                status: o.status,
                createdAt: o.createdAt,
                paidAt: o.paidAt || o.createdAt,
              },
            })
          })

        // 4. Chuyển đổi hoạt động từ notification-service (phân biệt đúng Người thực hiện & Đối tượng)
        const actsData = actsRes.status === 'fulfilled' ? actsRes.value : null
        const actContent = Array.isArray(actsData?.content)
          ? actsData.content
          : Array.isArray(actsData)
          ? actsData
          : []

        actContent.forEach((act) => {
          const d = act.createdAt ? new Date(act.createdAt) : new Date()
          const typeLower = (act.activityType || '').toLowerCase()
          let actType = 'create'
          if (typeLower.includes('pay') || typeLower.includes('receipt') || typeLower.includes('subscription')) actType = 'payment'
          else if (typeLower.includes('submit') || typeLower.includes('grade')) actType = 'update'
          else if (typeLower.includes('ai')) actType = 'create'
          else if (typeLower.includes('friend') || typeLower.includes('chat')) actType = 'approve'

          let metaObj = {}
          try {
            if (typeof act.metadata === 'string') metaObj = JSON.parse(act.metadata)
            else if (act.metadata) metaObj = act.metadata
          } catch {}

          const cleanTitle = stripEmojis(act.title || 'Hoạt động hệ thống')
          const cleanDesc = stripEmojis(act.description || '')

          // Xác định chính xác Người thực hiện (Actor) & Vai trò dựa trên loại sự kiện
          let actorName = teacherName
          let actorHandle = teacherEmail
          let actorRole = 'teacher'
          let actorRoleLabel = 'Giáo viên'
          let actorDevice = act.deviceInfo || 'Web Teacher Console'
          let avatarColor = actType === 'payment' ? '#10B981' : '#3B82F6'

          if (typeLower === 'friend_request_received') {
            const parsedSender =
              metaObj.requesterName ||
              metaObj.senderName ||
              cleanTitle.replace(/\s*đã gửi lời mời kết bạn.*/i, '').trim() ||
              'Thành viên'
            actorName = parsedSender
            actorHandle = metaObj.requesterEmail || 'Cộng đồng SmartEnglish'
            actorRole = 'student'
            actorRoleLabel = 'Thành viên'
            actorDevice = 'SmartEnglish Community'
            avatarColor = '#0EA5E9'
          } else if (typeLower === 'friend_accepted') {
            const parsedFriend =
              metaObj.friendName ||
              cleanTitle.replace(/\s*đã chấp nhận lời mời kết bạn.*/i, '').trim() ||
              'Thành viên'
            actorName = parsedFriend
            actorHandle = metaObj.friendEmail || 'Cộng đồng SmartEnglish'
            actorRole = 'student'
            actorRoleLabel = 'Thành viên'
            actorDevice = 'SmartEnglish Community'
            avatarColor = '#10B981'
          } else if (typeLower === 'chat_message') {
            actorName = metaObj.senderName || 'Thành viên'
            actorHandle = 'Tin nhắn trực tuyến'
            actorRole = 'student'
            actorRoleLabel = 'Thành viên'
            actorDevice = 'SmartEnglish Chat'
            avatarColor = '#6366F1'
          } else if (typeLower === 'assignment_submitted' || typeLower === 'class_join_request') {
            actorName = metaObj.studentName || metaObj.requesterName || 'Học viên'
            actorHandle = metaObj.studentEmail || 'Học viên lớp học'
            actorRole = 'student'
            actorRoleLabel = 'Học viên'
            actorDevice = 'SmartEnglish Mobile / Web'
            avatarColor = '#10B981'
          }

          const targetTypeLabel = formatTargetType(act.activityType)
          const rawTargetId = metaObj.invoiceNo || metaObj.orderCode || act.id

          teacherLogs.push({
            id: `act-${act.id}`,
            logCode: `LOG-${act.id}`,
            timestamp: formatTimestamp(d),
            rawTime: d.getTime(),
            userName: actorName,
            user: actorHandle,
            userInitials: getInitials(actorName),
            userRole: actorRole,
            userRoleLabel: actorRoleLabel,
            avatarColor,
            actionType: actType,
            action: cleanTitle,
            actionLabel: cleanTitle,
            targetService: isTeacher ? undefined : 'notification-service',
            targetType: targetTypeLabel,
            targetId: cleanTargetId(rawTargetId),
            reason: cleanDesc,
            ipAddress: act.ipAddress || '127.0.0.1',
            device: actorDevice,
            severity: 'normal',
            details: metaObj,
          })
        })

        // 5. Nếu chưa có hoạt động nào khác, bổ sung mốc phiên đăng nhập hiện tại
        if (teacherLogs.length === 0) {
          const defaultDate = new Date()
          teacherLogs.push({
            id: 'init-login',
            logCode: 'AUTH-01',
            timestamp: formatTimestamp(defaultDate),
            rawTime: defaultDate.getTime(),
            userName: teacherName,
            user: teacherEmail,
            userInitials: teacherInitials,
            userRole: 'teacher',
            userRoleLabel: 'Giáo viên',
            avatarColor: '#1B3A57',
            actionType: 'auth',
            action: 'Đăng nhập hệ thống giảng dạy',
            actionLabel: 'Đăng nhập hệ thống quản lý giảng dạy thành công',
            targetService: isTeacher ? undefined : 'auth-service',
            targetType: 'Phiên làm việc',
            targetId: cleanTargetId(user?.id || 1),
            reason: 'Khởi tạo phiên làm việc giảng viên trên Web Console',
            ipAddress: '127.0.0.1',
            device: 'Web Teacher Console',
            severity: 'normal',
            details: {
              userId: user?.id,
              role: 'TEACHER',
              loginAt: defaultDate.toISOString(),
            },
          })
        }

        // Loại bỏ trùng lặp theo actionLabel + targetId
        const unique = []
        const seen = new Set()
        teacherLogs
          .sort((a, b) => b.rawTime - a.rawTime)
          .forEach((item) => {
            const key = `${item.actionLabel}|${item.targetId || ''}`
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(item)
            }
          })

        // Lọc theo bộ lọc client-side (Date, userRole, actionType, severity, search)
        const filtered = unique.filter((item) => {
          if (!isWithinDateRange(item.rawTime, dateRange)) return false
          if (userRole !== 'all' && (item.userRole || '').toLowerCase() !== userRole.toLowerCase()) {
            return false
          }
          if (actionType !== 'all') {
            const itAct = (item.actionType || '').toLowerCase()
            if (!itAct.includes(actionType)) return false
          }
          if (severity !== 'all' && item.severity !== severity) return false
          if (search.trim()) {
            const q = search.trim().toLowerCase()
            const matches =
              (item.actionLabel || '').toLowerCase().includes(q) ||
              (item.targetType || '').toLowerCase().includes(q) ||
              (item.targetId || '').toLowerCase().includes(q) ||
              (item.reason || '').toLowerCase().includes(q) ||
              (item.ipAddress || '').toLowerCase().includes(q) ||
              (item.userName || '').toLowerCase().includes(q)
            if (!matches) return false
          }
          return true
        })

        const totalCount = filtered.length
        const pageStart = (page - 1) * PAGE_SIZE
        const pagedItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

        setLogs(pagedItems)
        setTotal(totalCount)
        setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)))
      } else {
        // Nếu là Admin hệ thống, tải nhật ký quản trị từ auth-service và chuẩn hóa tiếng Việt
        const data = await getAuditLogs({
          page,
          size: PAGE_SIZE,
          dateRange,
          userRole,
          actionType,
          severity,
          search,
        })
        const normalizedItems = (data.items || []).map((item) => ({
          ...item,
          targetType: formatTargetType(item.targetType),
          targetId: cleanTargetId(item.targetId),
        }))
        setLogs(normalizedItems)
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.warn('Lỗi khi tải nhật ký hoạt động:', err)
      toast.error('Không thể kết nối máy chủ nhật ký hoạt động')
    } finally {
      setIsLoading(false)
    }
  }, [page, dateRange, userRole, actionType, severity, search, isTeacher, user])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleResetFilters = () => {
    setDateRange('all')
    setUserRole('all')
    setActionType('all')
    setSeverity('all')
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters =
    dateRange !== 'all' ||
    userRole !== 'all' ||
    actionType !== 'all' ||
    severity !== 'all' ||
    search.trim() !== ''

  const handleExportCsv = () => {
    if (!logs.length) {
      toast.error('Không có dữ liệu nhật ký để xuất')
      return
    }
    const headers = ['Mã Log', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Địa chỉ IP', 'Thiết bị', 'Mức độ', 'Lý do']
    const rows = logs.map((l) => [
      l.logCode || l.id,
      `"${l.timestamp}"`,
      `"${l.userName || l.user}"`,
      `"${l.userRoleLabel || l.userRole}"`,
      `"${l.actionLabel || l.action}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.device || ''}"`,
      `"${l.severity || ''}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Đã xuất báo cáo CSV nhật ký hoạt động')
  }

  const handleExportPdf = () => {
    if (!logs.length) {
      toast.error('Không có dữ liệu nhật ký để xuất')
      return
    }
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      doc.setFontSize(15)
      doc.text('NHAT KY HOAT DONG HE THONG SMARTENGLISH AI', 14, 18)
      doc.setFontSize(9)
      doc.text(`Ngay xuat: ${new Date().toLocaleString('vi-VN')} | Tong so: ${logs.length} ban ghi`, 14, 25)
      doc.line(14, 28, 196, 28)

      let y = 35
      doc.setFontSize(9)
      doc.text('THOI GIAN', 14, y)
      doc.text('NGUOI DUNG', 50, y)
      doc.text('HANH DONG / DOI TUONG', 95, y)
      doc.text('IP / THIET BI', 158, y)
      doc.line(14, y + 2, 196, y + 2)
      y += 8

      const logsToExport = logs.slice(0, 35)
      logsToExport.forEach((log) => {
        if (y > 275) {
          doc.addPage()
          y = 20
        }
        const timeStr = String(log.createdAt || log.timestamp || '').slice(0, 19).replace('T', ' ')
        const userStr = String(log.userName || log.user || 'He thong').slice(0, 20)
        const actStr = String(log.actionLabel || log.action || '').slice(0, 30)
        const ipStr = String(log.ipAddress || log.device || 'Web Console').slice(0, 18)

        doc.text(timeStr, 14, y)
        doc.text(userStr, 50, y)
        doc.text(actStr, 95, y)
        doc.text(ipStr, 158, y)
        y += 7
      })

      doc.save(`SmartEnglish_NhatKy_${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('Đã tải xuống file PDF nhật ký hoạt động!')
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err)
      toast.error('Không thể tạo file PDF: ' + (err?.message || 'Lỗi'))
    }
  }

  const startRecord = (page - 1) * PAGE_SIZE + 1
  const endRecord = Math.min(page * PAGE_SIZE, total)

  // Helper render icon hành động
  const renderActionIcon = (log) => {
    const act = (log.actionType || log.action || '').toLowerCase()
    if (act.includes('pay') || act.includes('thanh toán') || act.includes('receipt') || act.includes('gói') || act.includes('hóa đơn')) {
      return <CreditCard size={15} className="text-emerald-600 shrink-0" />
    }
    if (act.includes('delete') || act.includes('xóa')) {
      return <Trash2 size={15} className="text-red-500 shrink-0" />
    }
    if (act.includes('approve') || act.includes('duyệt')) {
      return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
    }
    if (act.includes('lock') || act.includes('khóa') || act.includes('auth')) {
      return <ShieldAlert size={15} className="text-amber-500 shrink-0" />
    }
    if (act.includes('create') || act.includes('tạo')) {
      return <PlusCircle size={15} className="text-indigo-500 shrink-0" />
    }
    return <Edit3 size={15} className="text-blue-500 shrink-0" />
  }

  // Helper render severity badge
  const renderSeverityBadge = (sev) => {
    const s = (sev || 'normal').toLowerCase()
    if (s === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600 border border-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Nghiêm trọng
        </span>
      )
    }
    if (s === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Cảnh báo
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Bình thường
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Main Unified Container (Đồng bộ chuẩn Vocabulary & QuizBank) ─────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar & Filters (Đồng bộ chuẩn Benchmark Tab 1) */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Left: Thanh tìm kiếm không viền (borderless) đồng bộ Tab 1 */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-xs xl:max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, IP, người dùng..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Nhóm Dropdown Bộ lọc & Nút Thao tác */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Thời gian */}
            <Select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                setPage(1)
              }}
              size="sm"
              containerClassName="w-36 shrink-0"
              options={[
                { value: 'all', label: 'Thời gian: Tất cả' },
                { value: '24h', label: '24 giờ qua' },
                { value: '7d', label: '7 ngày qua' },
                { value: '30d', label: '30 ngày qua' },
              ]}
            />

            {/* Lọc Người thực hiện / Vai trò */}
            <Select
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value)
                setPage(1)
              }}
              size="sm"
              containerClassName="w-44 shrink-0"
              options={
                isTeacher
                  ? [
                      { value: 'all', label: 'Thực hiện: Tất cả' },
                      { value: 'teacher', label: 'Của tôi (Giáo viên)' },
                      { value: 'student', label: 'Học viên & Thành viên' },
                    ]
                  : [
                      { value: 'all', label: 'Vai trò: Tất cả' },
                      { value: 'admin', label: 'Quản trị viên (Admin)' },
                      { value: 'teacher', label: 'Giáo viên (Teacher)' },
                      { value: 'student', label: 'Học viên (Student)' },
                    ]
              }
            />

            {/* Lọc Loại thao tác */}
            <Select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value)
                setPage(1)
              }}
              size="sm"
              containerClassName="w-48 shrink-0"
              options={[
                { value: 'all', label: 'Thao tác: Tất cả' },
                { value: 'payment', label: 'Thanh toán & Gói Pro' },
                { value: 'create', label: 'Tạo mới' },
                { value: 'update', label: 'Cập nhật & Chấm điểm' },
                { value: 'approve', label: 'Phê duyệt' },
                { value: 'auth', label: 'Khóa / Phân quyền' },
                { value: 'delete', label: 'Xóa tài nguyên' },
              ]}
            />

            {/* Lọc Mức độ */}
            <Select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value)
                setPage(1)
              }}
              size="sm"
              containerClassName="w-36 shrink-0"
              options={[
                { value: 'all', label: 'Mức độ: Tất cả' },
                { value: 'normal', label: 'Bình thường' },
                { value: 'warning', label: 'Cảnh báo' },
                { value: 'critical', label: 'Nghiêm trọng' },
              ]}
            />

            {/* Nút Đặt lại bộ lọc (nếu đang lọc) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={13} />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Nút Tải lại danh sách */}
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={loadLogs}
              className={cn('rounded-xl cursor-pointer shadow-2xs', isLoading && 'pointer-events-none opacity-60')}
              title="Làm mới danh sách"
            />

            {/* Nút Xuất CSV */}
            <Button
              size="sm"
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={handleExportCsv}
              className="rounded-xl cursor-pointer shadow-2xs"
            >
              Xuất CSV
            </Button>

            {/* Nút Xuất PDF */}
            <Button
              size="sm"
              variant="primary"
              icon={FileText}
              onClick={handleExportPdf}
              className="rounded-xl bg-navy-800 hover:bg-navy-900 cursor-pointer shadow-2xs"
            >
              Xuất PDF
            </Button>
          </div>
        </div>

        {/* ── Table Danh Sách Nhật Ký ────────────────────────────────────────── */}
        <div className="overflow-x-auto min-h-[320px] relative">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5 whitespace-nowrap">THỜI GIAN</th>
                <th className="px-6 py-3.5 whitespace-nowrap">NGƯỜI THỰC HIỆN</th>
                <th className="px-6 py-3.5 whitespace-nowrap">HÀNH ĐỘNG & ĐỐI TƯỢNG</th>
                <th className="px-6 py-3.5 whitespace-nowrap">ĐỊA CHỈ IP & THIẾT BỊ</th>
                <th className="px-6 py-3.5 whitespace-nowrap text-center">MỨC ĐỘ</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap">CHI TIẾT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <LoadingSpinner text="Đang tải danh sách nhật ký hoạt động..." />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <Shield size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Không tìm thấy bản ghi nhật ký nào</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'Thử nới lỏng các điều kiện lọc hoặc từ khóa tìm kiếm để xem các hoạt động khác.'
                        : 'Hệ thống chưa ghi nhận hành động quản trị mới nào.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Đặt lại bộ lọc</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group border-b border-slate-100"
                  >
                    {/* Cột 1: Thời gian */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {log.timestamp}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="shrink-0" />
                          <span>UTC+7</span>
                          {log.logCode && (
                            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500 font-medium">
                              #{cleanTargetId(log.logCode)}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Cột 2: Người thực hiện */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs uppercase shadow-xs transition-transform group-hover:scale-105"
                          style={{ backgroundColor: log.avatarColor || '#1B3A57' }}
                        >
                          {log.userInitials || 'AD'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {log.userName || log.user}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={cn(
                                'inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                                (log.userRole || '').toLowerCase() === 'admin'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : (log.userRole || '').toLowerCase() === 'teacher'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              )}
                            >
                              {log.userRoleLabel || log.userRole}
                            </span>
                            {log.user && (
                              <span className="text-xs text-slate-400">
                                {formatUserHandle(log.user)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Hành động & Đối tượng */}
                    <td className="px-6 py-4">
                      <div className="flex items-start max-w-md">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {stripEmojis(log.actionLabel || log.action)}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {!isTeacher && log.targetService && (
                              <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700 font-semibold">
                                {log.targetService}
                              </span>
                            )}
                            {log.targetType && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-medium">
                                {formatTargetType(log.targetType)}{' '}
                                {cleanTargetId(log.targetId) ? `#${cleanTargetId(log.targetId)}` : ''}
                              </span>
                            )}
                            {log.reason && (
                              <span className="text-xs text-slate-500 italic truncate max-w-[220px]" title={log.reason}>
                                — {log.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 4: IP & Thiết bị */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 w-fit">
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          {(log.device || '').toLowerCase().includes('mobile') ? (
                            <Smartphone size={13} className="text-slate-400" />
                          ) : (
                            <Laptop size={13} className="text-slate-400" />
                          )}
                          <span>{log.device || 'Web Admin Console'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Cột 5: Mức độ */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>

                    {/* Cột 6: Thao tác / Chi tiết */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLog(log)
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all cursor-pointer shadow-2xs"
                        title="Xem chi tiết bản ghi"
                      >
                        <Eye size={14} />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer Phân Trang (Đồng bộ chuẩn Vocabulary & QuizBank) ────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/20">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : startRecord}</strong> - <strong>{endRecord}</strong> trong tổng số{' '}
            <strong>{total}</strong> bản ghi nhật ký
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* ── Drawer Xem Chi Tiết Nhật Ký ───────────────────────────────────────── */}
      <Drawer
        open={Boolean(activeLog)}
        onClose={() => setActiveLog(null)}
        title="Chi tiết nhật ký hoạt động"
        className="max-w-[500px]"
      >
        {activeLog && (
          <div className="space-y-5 text-sm">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-mono text-slate-400 text-xs">
                  {activeLog.logCode ? `#${cleanTargetId(activeLog.logCode)}` : `ID: ${activeLog.id}`}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {stripEmojis(activeLog.actionLabel || activeLog.action)}
                </h3>
              </div>
              <div>{renderSeverityBadge(activeLog.severity)}</div>
            </div>

            {/* Thông tin chính */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Người thực hiện:
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {activeLog.userName || activeLog.user}
                </span>
                <span className="text-xs text-slate-500 font-medium">{formatUserHandle(activeLog.user)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Vai trò:
                </span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {activeLog.userRoleLabel || activeLog.userRole}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Thời gian:
                </span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                  {activeLog.timestamp}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  Địa chỉ IP:
                </span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                  {activeLog.ipAddress || '127.0.0.1'}
                </span>
              </div>
            </div>

            {/* Dịch vụ & Đối tượng tác động */}
            {((!isTeacher && activeLog.targetService) || activeLog.targetType) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                  {!isTeacher && activeLog.targetService ? 'Dịch vụ & Đối tượng tác động:' : 'Đối tượng tác động:'}
                </span>
                <div className="flex items-center gap-2">
                  {!isTeacher && activeLog.targetService && (
                    <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 font-mono text-xs text-indigo-700 font-bold">
                      {activeLog.targetService}
                    </span>
                  )}
                  {activeLog.targetType && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-semibold">
                      {formatTargetType(activeLog.targetType)}{' '}
                      {cleanTargetId(activeLog.targetId) ? `#${cleanTargetId(activeLog.targetId)}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Lý do / Ghi chú */}
            {activeLog.reason && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Lý do / Giải trình
                </h4>
                <p className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 bg-slate-50/50 leading-relaxed">
                  {stripEmojis(activeLog.reason)}
                </p>
              </div>
            )}

            {/* Thiết bị & Trình duyệt */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                Thiết bị & Môi trường
              </h4>
              <p className="rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-700 bg-white">
                {activeLog.device || 'Web Admin Console'}
              </p>
            </div>

            {/* Dữ liệu chi tiết Payload (Chỉ hiển thị cho Quản trị viên kỹ thuật, không hiển thị cho Giáo viên) */}
            {!isTeacher && activeLog.details && Object.keys(activeLog.details).length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Dữ liệu thay đổi (Payload)
                </h4>
                <pre className="rounded-xl bg-slate-900 p-3 text-xs text-emerald-400 font-mono overflow-x-auto max-h-[220px] shadow-inner">
                  {JSON.stringify(activeLog.details, null, 2)}
                </pre>
              </div>
            )}

            {/* Nút đóng */}
            <div className="pt-3 border-t border-slate-100">
              <Button variant="secondary" fullWidth onClick={() => setActiveLog(null)} className="rounded-xl">
                Đóng chi tiết
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AuditLogPage
