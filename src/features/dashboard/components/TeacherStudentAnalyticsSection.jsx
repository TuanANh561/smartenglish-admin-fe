import { useState, useMemo } from 'react'
import {
  GraduationCap,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  PieChart as PieIcon,
  Bell,
  X,
  Send,
  Loader2,
  Calendar,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import Card, { CardHeader } from '@/components/ui/Card'
import ChartTooltip from '@/components/charts/ChartTooltip'
import { formatNumber } from '@/lib/utils'
import { createNotification, sendDirectEmail } from '@/features/notifications/notificationApi'
import {
  useStudentCefrStats,
  useTeacherPerformanceStats,
  useStudentHourlyActivity,
  useStudentRetentionStats,
} from '../hooks/useDashboard'

const REMINDER_STORAGE_KEY = 'se_student_reminders_history'

const loadReminderHistory = () => {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveReminderHistory = (history) => {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save reminder history', e)
  }
}

const formatSentTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return 'Đã gửi'
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  if (isToday) {
    return `Đã gửi: Hôm nay ${hours}:${minutes}`
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `Đã gửi: ${day}/${month}`
}

/**
 * Kiểm tra các địa chỉ email mẫu / test trong database
 * để tránh gửi thật làm Google Mail Delivery Subsystem báo lỗi dội về inbox của người gửi
 */
const isMockOrFakeEmail = (email) => {
  if (!email || !email.includes('@')) return true
  const lower = email.trim().toLowerCase()
  if (lower.endsWith('@smartenglish.com') && !lower.startsWith('admin')) return true
  if (lower.endsWith('@example.com') || lower.endsWith('@test.com')) return true
  const [localPart] = lower.split('@')
  if (localPart.length <= 2) return true
  const KNOWN_MOCKS = [
    'tuan.na@gmail.com',
    'lan.tt@gmail.com',
    'nam.lh@gmail.com',
    'linh.pm@gmail.com',
    'oxy@gmail.com',
    'student861@gmail.com',
    'teststudent@gmail.com',
    'student.demo@gmail.com',
    'user@test.com',
  ]
  if (KNOWN_MOCKS.includes(lower)) return true
  if (lower.includes('teststudent') || lower.includes('dummy') || lower.includes('fake')) return true
  return false
}

const CEFR_COLORS = ['#38BDF8', '#0284C7', '#1B3A57', '#10B981', '#F59E0B']

export default function TeacherStudentAnalyticsSection() {
  const { data: cefrData = [] } = useStudentCefrStats()
  const { data: teacherData = [] } = useTeacherPerformanceStats()
  const { data: hourlyData = [] } = useStudentHourlyActivity()
  const { data: retentionData } = useStudentRetentionStats()

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [teacherPage, setTeacherPage] = useState(0)
  const [teacherFilter, setTeacherFilter] = useState('active')
  const [sendViaApp, setSendViaApp] = useState(true)
  const [sendViaEmail, setSendViaEmail] = useState(true)
  const [reminderHistory, setReminderHistory] = useState(loadReminderHistory)

  const atRiskList = useMemo(() => retentionData?.atRiskStudentsList || [], [retentionData])

  // Lọc và phân trang giáo viên (xử lý khi có hàng chục giáo viên)
  const activeTeachersCount = useMemo(() => {
    return teacherData.filter((t) => t.classes > 0 || t.graded > 0 || t.pending > 0).length
  }, [teacherData])

  const filteredTeacherData = useMemo(() => {
    if (teacherFilter === 'active') {
      const activeList = teacherData.filter((t) => t.classes > 0 || t.graded > 0 || t.pending > 0)
      return activeList.length > 0 ? activeList : teacherData
    }
    return teacherData
  }, [teacherData, teacherFilter])

  const TEACHERS_PER_PAGE = 6
  const totalTeacherPages = Math.ceil(filteredTeacherData.length / TEACHERS_PER_PAGE) || 1
  const safeTeacherPage = Math.min(teacherPage, totalTeacherPages - 1)

  const currentTeacherPageData = useMemo(() => {
    const start = safeTeacherPage * TEACHERS_PER_PAGE
    return filteredTeacherData.slice(start, start + TEACHERS_PER_PAGE)
  }, [filteredTeacherData, safeTeacherPage])

  // Tính tổng số học viên đã kiểm tra đầu vào (CEFR placement test)
  const totalCefrTested = useMemo(() => {
    return cefrData.reduce((sum, item) => sum + (item.count || 0), 0)
  }, [cefrData])

  // Tính tỷ lệ chấm bài thực tế của giảng viên trên toàn hệ thống
  const { totalGraded, totalPending, gradingSlaRate } = useMemo(() => {
    const graded = teacherData.reduce((sum, item) => sum + (item.graded || 0), 0)
    const pending = teacherData.reduce((sum, item) => sum + (item.pending || 0), 0)
    const total = graded + pending
    const rate = total > 0 ? Math.round((graded / total) * 100) : 100
    return { totalGraded: graded, totalPending: pending, gradingSlaRate: rate }
  }, [teacherData])

  // Xác định khung giờ học tập đông nhất trong ngày
  const peakHour = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null
    const max = hourlyData.reduce((prev, curr) => (curr.learners > prev.learners ? curr : prev), hourlyData[0])
    if (!max || max.learners <= 0) return null
    return String(max.hour || '').replace(/^0+(\d)/, '$1')
  }, [hourlyData])

  // Mở modal nhắc nhở và tự động chọn các học viên chưa được gửi trong 24 giờ qua
  const handleOpenReminderModal = () => {
    const history = loadReminderHistory()
    setReminderHistory(history)

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const unremindedIds = atRiskList
      .filter((s) => {
        const rec = history[s.id]
        if (!rec || !rec.sentAt) return true
        return new Date(rec.sentAt).getTime() < oneDayAgo
      })
      .map((s) => s.id)

    setSelectedStudentIds(unremindedIds)
    setIsReminderModalOpen(true)
  }

  // Gửi thông báo nhắc nhở học viên qua Notification Service
  const handleSendReminder = async () => {
    const targets = atRiskList.filter((s) => selectedStudentIds.includes(s.id))
    if (targets.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học viên để gửi nhắc nhở.')
      return
    }

    if (!sendViaApp && !sendViaEmail) {
      toast.error('Vui lòng chọn ít nhất một kênh gửi (Ứng dụng hoặc Email).')
      return
    }

    setIsSendingReminder(true)
    try {
      const ids = targets.map((s) => s.id)
      const channel = sendViaApp && sendViaEmail ? 'ALL' : sendViaApp ? 'IN_APP' : 'EMAIL'

      // 1. Gửi thông báo ứng dụng
      if (sendViaApp || channel === 'ALL') {
        await createNotification({
          userIds: ids,
          title: 'Nhắc nhở học tập: Tiếp tục chuỗi rèn luyện tiếng Anh',
          content: 'SmartEnglish đang nhớ bạn! Hãy tiếp tục duy trì thói quen học tập để đạt mục tiêu CEFR nhé.',
          type: 'REMINDER',
          channel,
        })
      }

      // 2. Gửi email trực tiếp nếu chọn kênh Email
      let realEmailCount = 0
      if (sendViaEmail) {
        // Chỉ gửi email thật, tự động lọc bỏ các email mẫu/mock/không tồn tại trên Gmail để tránh Google Mail Delivery Failure dội về
        const emailTargets = targets.filter((s) => !isMockOrFakeEmail(s.email))
        realEmailCount = emailTargets.length

        if (emailTargets.length > 0) {
          await Promise.allSettled(
            emailTargets.map((s) =>
              sendDirectEmail({
                to: s.email,
                subject: 'Nhắc nhở học tập: Tiếp tục chuỗi rèn luyện tiếng Anh cùng SmartEnglish',
                templateType: 'GENERAL',
                templateVariables: {
                  name: s.displayName || 'Học viên',
                  role: 'student',
                  actionText: 'Tiếp tục học ngay',
                  actionUrl: 'smartenglish://learning',
                  message:
                    'SmartEnglish nhận thấy bạn chưa vào luyện tập trong những ngày gần đây. Hãy dành 10-15 phút hôm nay để giữ vững chuỗi học tập và nâng cao trình độ tiếng Anh nhé!',
                },
              }),
            ),
          )
        }
      }

      // 3. Ghi nhận và lưu vết lịch sử gửi nhắc nhở
      const nowIso = new Date().toISOString()
      const updatedHistory = { ...reminderHistory }
      targets.forEach((s) => {
        updatedHistory[s.id] = {
          sentAt: nowIso,
          sendApp: sendViaApp,
          sendEmail: sendViaEmail,
        }
      })
      setReminderHistory(updatedHistory)
      saveReminderHistory(updatedHistory)

      const channelLabel =
        sendViaApp && sendViaEmail ? 'Ứng dụng & Email' : sendViaApp ? 'Ứng dụng' : 'Email'
      const emailNote =
        sendViaEmail && realEmailCount < targets.length
          ? ` (${realEmailCount} email thật, đã bỏ qua các email mẫu tránh thư dội về)`
          : ''
      toast.success(`Đã gửi nhắc nhở tới ${targets.length} học viên qua ${channelLabel}${emailNote}!`)
      setIsReminderModalOpen(false)
    } catch (err) {
      toast.error('Không thể gửi thông báo. Vui lòng thử lại sau.')
    } finally {
      setIsSendingReminder(false)
    }
  }

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === atRiskList.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(atRiskList.map((s) => s.id))
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Mini KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tỷ lệ chấm bài đúng hạn */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-3.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
            <CheckCircle size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tỷ lệ chấm bài đúng hạn
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{gradingSlaRate}%</span>
              <span className="text-xs font-medium text-slate-500">
                {totalPending > 0 ? `${totalPending} bài chờ` : 'SLA < 24h'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Học viên hoạt động tuần */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-3.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/80 shadow-2xs">
            <Users size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Học viên hoạt động tuần
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-900">
                {formatNumber(retentionData?.activeWeek ?? 0)}
              </span>
              <span className="text-xs text-slate-400">học viên</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Đã kiểm tra đầu vào */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-3.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/80 shadow-2xs">
            <GraduationCap size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Đã kiểm tra đầu vào
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{formatNumber(totalCefrTested)}</span>
              <span className="text-xs text-slate-500 font-medium">CEFR Test</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Cảnh báo vắng học > 7 ngày (Interactive) */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenReminderModal}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-3.5 hover:shadow-sm cursor-pointer transition-all group"
          title="Bấm để xem danh sách học viên và gửi thông báo nhắc nhở"
        >
          <div className="w-12 h-12 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/80 shadow-2xs group-hover:scale-105 transition-transform">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Cảnh báo vắng học &gt; 7 ngày
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                Xem DS &rarr;
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-900">
                {retentionData?.atRiskOver7Days ?? 0}
              </span>
              <span className="text-xs text-slate-400 font-medium">cần nhắc nhở</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 3 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1: Hiệu suất & Tốc độ chấm bài của Giảng viên (Span 6) */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Award size={18} className="text-slate-600" />
                  Hiệu suất Chấm bài của Giảng viên
                </span>
              }
              action={
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  {/* Bộ lọc giáo viên */}
                  {activeTeachersCount > 0 && activeTeachersCount < teacherData.length && (
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherFilter('active')
                          setTeacherPage(0)
                        }}
                        className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all ${
                          teacherFilter === 'active'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Có lớp ({activeTeachersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherFilter('all')
                          setTeacherPage(0)
                        }}
                        className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all ${
                          teacherFilter === 'all'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Tất cả ({teacherData.length})
                      </button>
                    </div>
                  )}

                  {/* Phân trang khi có nhiều giáo viên */}
                  {totalTeacherPages > 1 && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                      <span>
                        {safeTeacherPage + 1}/{totalTeacherPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeTeacherPage === 0}
                        onClick={() => setTeacherPage((p) => Math.max(0, p - 1))}
                        className="p-0.5 rounded hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
                        title="Trang trước"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={safeTeacherPage >= totalTeacherPages - 1}
                        onClick={() => setTeacherPage((p) => Math.min(totalTeacherPages - 1, p + 1))}
                        className="p-0.5 rounded hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
                        title="Trang sau"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#1B3A57] inline-block" />
                      Đã chấm
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#E0E7FF] inline-block" />
                      Chờ chấm
                    </span>
                  </div>
                </div>
              }
            />

            <div className="px-2 pt-2 overflow-x-auto">
              <div style={{ minWidth: Math.max(360, currentTeacherPageData.length * 68) }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={currentTeacherPageData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 25 }}
                    barGap={6}
                  >
                    <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="teacher"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                  <Tooltip
                    content={<ChartTooltip formatter={(v) => `${v} bài nộp`} />}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar
                    dataKey="graded"
                    name="Đã chấm"
                    fill="#1B3A57"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="pending"
                    name="Chờ chấm"
                    fill="#C7D2FE"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* CHART 2: Phân bổ Trình độ Năng lực CEFR Học viên (Span 6) */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <PieIcon size={18} className="text-slate-600" />
                  Phân bổ Trình độ Học viên (CEFR)
                </span>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 px-2 pb-2">
              <div className="sm:col-span-6 relative flex justify-center items-center">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={cefrData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="65%"
                      outerRadius="88%"
                      paddingAngle={3}
                    >
                      {cefrData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || CEFR_COLORS[index % CEFR_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(val) => `${val}% học viên`} />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-800">5 Mức</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">CEFR A1-C1</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="sm:col-span-6 space-y-2 pr-2">
                {cefrData.map((item, idx) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color || CEFR_COLORS[idx % CEFR_COLORS.length] }}
                      />
                      <span className="text-slate-700 font-medium truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900">{item.value}%</span>
                      <span className="text-[11px] text-slate-400">({item.count} HV)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* CHART 3: Khung giờ vàng Học viên vào học trong 24 Giờ (Span 12 - Full Width) */}
        <div className="lg:col-span-12">
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Clock size={18} className="text-slate-600" />
                  Khung Giờ Vàng Học Tập trong Ngày (Peak Learning Hours)
                </span>
              }
              action={
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {peakHour ? `Đỉnh điểm: ${peakHour}` : 'Đang ghi nhận'}
                </span>
              }
            />

            <div className="px-2 pt-2">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={hourlyData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="learnersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    content={<ChartTooltip formatter={(v) => `${formatNumber(v)} học viên online`} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="learners"
                    name="Học viên trực tuyến"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#learnersGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Modal Xem Danh sách & Gửi Nhắc Nhở Học Viên Vắng Học */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Danh Sách Học Viên Cần Nhắc Nhở
                  </h3>
                  <p className="text-xs text-slate-500">
                    Học viên chưa hoạt động hoặc làm bài trong hơn 7 ngày ({atRiskList.length} học viên)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {atRiskList.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <UserCheck size={40} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">Không có học viên nào vắng học</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Toàn bộ học viên đều tích cực học tập trong tuần qua.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === atRiskList.length && atRiskList.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      <span>Chọn tất cả ({atRiskList.length})</span>
                    </label>
                    <span>
                      Đã chọn: {selectedStudentIds.length} học viên
                    </span>
                  </div>

                  <div className="space-y-2">
                    {atRiskList.map((st) => {
                      const isChecked = selectedStudentIds.includes(st.id)
                      const historyItem = reminderHistory[st.id]
                      const isSentRecently = historyItem && historyItem.sentAt

                      return (
                        <div
                          key={st.id}
                          onClick={() => toggleSelectStudent(st.id)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isChecked
                              ? 'border-slate-300 bg-slate-50'
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 pointer-events-none"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {st.displayName}
                              </p>
                              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                                <Mail size={12} />
                                {st.email}
                                {isMockOrFakeEmail(st.email) && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1 font-normal inline-block">
                                    Tài khoản mẫu
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {isSentRecently && (
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle size={11} className="text-slate-500" />
                                  {formatSentTime(historyItem.sentAt)}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-block">
                                Vắng {st.inactiveDays} ngày
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              {st.lastActive
                                ? `Gần nhất: ${new Date(st.lastActive).toLocaleDateString('vi-VN')}`
                                : 'Chưa đăng nhập'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Tùy chọn kênh gửi */}
              <div className="flex items-center gap-4 text-xs text-slate-700">
                <span className="font-semibold text-slate-600">Gửi qua:</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendViaApp}
                    onChange={(e) => setSendViaApp(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 w-3.5 h-3.5"
                  />
                  <span>Ứng dụng</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendViaEmail}
                    onChange={(e) => setSendViaEmail(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 w-3.5 h-3.5"
                  />
                  <span>Email</span>
                </label>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={
                    isSendingReminder ||
                    selectedStudentIds.length === 0 ||
                    (!sendViaApp && !sendViaEmail)
                  }
                  onClick={handleSendReminder}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  title={
                    !sendViaApp && !sendViaEmail
                      ? 'Vui lòng chọn ít nhất 1 hình thức gửi'
                      : selectedStudentIds.length === 0
                        ? 'Vui lòng chọn học viên cần gửi'
                        : ''
                  }
                >
                  {isSendingReminder ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Gửi nhắc nhở ({selectedStudentIds.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
