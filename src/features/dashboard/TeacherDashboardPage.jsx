import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  History,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { getUserActivities } from '@/features/notifications/notificationApi'
import { getAuditLogs } from '@/features/auditLog/auditLogApi'
import {
  computeTeacherStats,
  getAllAssignments,
  getMyClasses,
} from './teacherDashboardApi'

// ─── Biểu đồ donut SVG thuần — tỷ lệ hoàn thành ─────────────────────────────
function DonutProgress({ percent }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const filled = (percent / 100) * circ

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
      {/* Vòng nền */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E8EDF3" strokeWidth="14" />
      {/* Vòng tiến độ */}
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke="#29A8E8"
        strokeWidth="14"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Biểu đồ cột mini — điểm trung bình theo buổi ───────────────────────────
function ScoreBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex h-20 items-end gap-1.5">
      {data.map((d, i) => {
        const isLast = i === data.length - 1
        const height = Math.round((d.value / max) * 100)
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${height}%`,
                background: isLast ? '#1B3A57' : '#CBD5E1',
                minHeight: 4,
              }}
            />
            <span className="text-[9px] text-slate-400">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Icon hoạt động theo loại ────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const map = {
    submit: { Icon: FileText, bg: 'bg-blue-50 text-blue-600', ring: 'ring-blue-100' },
    comment: { Icon: MessageSquare, bg: 'bg-slate-100 text-slate-600', ring: 'ring-slate-200' },
    join: { Icon: UserPlus, bg: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200' },
    create: { Icon: BookOpen, bg: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200' },
    ai: { Icon: Sparkles, bg: 'bg-purple-50 text-purple-600', ring: 'ring-purple-200' },
    grade: { Icon: Award, bg: 'bg-amber-50 text-amber-600', ring: 'ring-amber-200' },
    exam: { Icon: ClipboardList, bg: 'bg-teal-50 text-teal-600', ring: 'ring-teal-200' },
    payment: { Icon: CreditCard, bg: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200' },
    payment_receipt: { Icon: CreditCard, bg: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200' },
  }
  const { Icon, bg, ring } = map[type] ?? map.submit
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ring-1 ${ring}`}>
      <Icon size={15} />
    </span>
  )
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-slate-100" />
      <div className="mt-3 h-3 w-16 rounded bg-slate-100" />
      <div className="mt-1.5 h-8 w-20 rounded bg-slate-100" />
    </div>
  )
}

// ─── Skeleton Class Card ──────────────────────────────────────────────────────
function SkeletonClassCard() {
  return (
    <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  )
}

// Màu gradient theo index
const CLASS_GRADIENTS = [
  'linear-gradient(135deg, #1B3A57 0%, #29A8E8 100%)',
  'linear-gradient(135deg, #0f766e 0%, #34d399 100%)',
  'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
  'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
  'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)',
]

// ─── Teacher Dashboard chính ─────────────────────────────────────────────────
function TeacherDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [userActivities, setUserActivities] = useState([])
  const [userOrders, setUserOrders] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [isRecentOrdersLoading, setIsRecentOrdersLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)

  const today = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  // ── Tải giao dịch mua gói gần đây (toàn hệ thống — giáo viên + học viên) ──
  useEffect(() => {
    let isMounted = true
    setIsRecentOrdersLoading(true)
    api
      .get('/payment/admin/orders/recent', { params: { size: 8, status: 'SUCCESS' } })
      .catch(() => api.get('/admin/orders', { params: { size: 8, status: 'SUCCESS', sort: 'createdAt,desc' } }))
      .then((res) => {
        if (!isMounted) return
        const raw = res?.data ?? res
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
            ? raw.content
            : Array.isArray(raw?.data)
              ? raw.data
              : []
        const success = list.filter(
          (o) => ['SUCCESS', 'completed', 'paid', 'COMPLETED'].includes(o.status)
        )
        setRecentOrders(success.slice(0, 8))
      })
      .catch(() => { if (isMounted) setRecentOrders([]) })
      .finally(() => { if (isMounted) setIsRecentOrdersLoading(false) })
    return () => { isMounted = false }
  }, [])

  // ── Tải dữ liệu thực từ teacher-service, notification-service & payment-service ──
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      setIsActivitiesLoading(true)
      if (!user?.id) {
        setClasses([])
        setAssignments([])
        setUserActivities([])
        setUserOrders([])
        setIsLoading(false)
        setIsActivitiesLoading(false)
        return
      }

      // 1. Chỉ tải hoạt động và giao dịch của chính giáo viên đang đăng nhập (user.id)
      const currentTeacherId = user.id
      Promise.allSettled([
        getUserActivities({ userId: currentTeacherId, size: 10 }),
        api.get('/payment/user/orders', { params: { userId: currentTeacherId } }),
      ])
        .then(([actsRes, ordsRes]) => {
          if (!isMounted) return

          if (actsRes.status === 'fulfilled' && actsRes.value) {
            const raw = actsRes.value
            const list = raw?.content || (Array.isArray(raw) ? raw : raw?.data?.content || raw?.data || [])
            setUserActivities(Array.isArray(list) ? list : [])
          } else {
            setUserActivities([])
          }

          if (ordsRes.status === 'fulfilled' && ordsRes.value) {
            const raw = ordsRes.value
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
            setUserOrders(list)
          } else {
            setUserOrders([])
          }
        })
        .catch((err) => {
          console.warn('[TeacherDashboard] Lỗi tải hoạt động cá nhân:', err)
          if (isMounted) {
            setUserActivities([])
            setUserOrders([])
          }
        })
        .finally(() => {
          if (isMounted) setIsActivitiesLoading(false)
        })

      // 2. Tải lớp học và bài tập
      try {
        const { classes: cls } = await getMyClasses({ size: 100, teacherId: user.id })
        if (!isMounted) return
        setClasses(cls)
        setIsLoading(false)

        getAllAssignments(cls)
          .then((asgns) => {
            if (isMounted) setAssignments(asgns)
          })
          .catch((err) => {
            console.warn('[TeacherDashboard] Không thể tải bài tập:', err)
          })
      } catch (err) {
        console.warn('[TeacherDashboard] Không thể tải dữ liệu lớp:', err)
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [user?.id])

  const s = useMemo(() => computeTeacherStats(classes, assignments), [classes, assignments])

  // Tính completion rate: tỷ lệ bài đã đóng/tổng bài tập
  const completionRate = useMemo(() => {
    if (!assignments.length) return 0
    const closed = assignments.filter((a) => a.status === 'CLOSED').length
    return Math.round((closed / assignments.length) * 100)
  }, [assignments])

  // Danh sách hoạt động gần đây của chính giáo viên (Thanh toán gói Pro, bài tập, chấm điểm)
  const recentActivities = useMemo(() => {
    const combined = []

    // A. Giao dịch thanh toán gói Pro thành công của chính giáo viên
    if (userOrders && userOrders.length > 0) {
      const successfulOrders = userOrders.filter(
        (o) => o.status === 'completed' || o.status === 'SUCCESS' || o.status === 'paid'
      )
      successfulOrders.forEach((o) => {
        const orderDate = o.createdAt ? new Date(o.createdAt) : new Date()
        const amountFormatted = o.amount ? `${Number(o.amount).toLocaleString('vi-VN')}đ` : '20.000đ'
        const planTitle = o.planName || 'Gói Giảng Viên Pro'
        combined.push({
          id: `order-${o.id || o.orderCode}`,
          type: 'payment',
          actor: 'Bạn',
          action: `Đã nâng cấp thành công ${planTitle} (${amountFormatted})`,
          target: `Mã đơn: ${o.orderCode || 'SEAI...'} • VietQR Napas`,
          timestamp: orderDate.getTime(),
          time:
            orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
            ' - ' +
            orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        })
      })
    }

    // B. Nhật ký hoạt động từ notification-service (UserActivityLog của riêng giáo viên)
    if (userActivities && userActivities.length > 0) {
      userActivities.forEach((act) => {
        const typeLower = (act.activityType || '').toLowerCase()
        let type = 'create'
        if (typeLower.includes('pay') || typeLower.includes('receipt')) type = 'payment'
        else if (typeLower.includes('submit')) type = 'submit'
        else if (typeLower.includes('ai')) type = 'ai'
        else if (typeLower.includes('grade')) type = 'grade'
        else if (typeLower.includes('join')) type = 'join'
        else if (typeLower.includes('exam')) type = 'exam'

        const actDate = act.createdAt ? new Date(act.createdAt) : new Date()
        combined.push({
          id: `act-${act.id}`,
          type,
          actor: 'Bạn',
          action: (act.title || 'Hoạt động cá nhân')
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .trim(),
          target: (act.description || '')
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .trim(),
          timestamp: actDate.getTime(),
          time:
            actDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
            ' - ' +
            actDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        })
      })
    }

    // Nếu có hoạt động thực tế từ đơn hàng hoặc log, ưu tiên hiển thị và sắp xếp theo thời gian mới nhất
    if (combined.length > 0) {
      // Loại bỏ trùng lặp nếu cả hai bên cùng ghi nhận cùng mã đơn
      const unique = []
      const seen = new Set()
      combined
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach((item) => {
          const key = item.action + item.target
          if (!seen.has(key)) {
            seen.add(key)
            unique.push(item)
          }
        })
      return unique.slice(0, 5)
    }

    return []
  }, [userActivities, userOrders])

  // Tính điểm trung bình từ các bài tập đã có điểm nếu có
  const averageClassScore = useMemo(() => {
    const gradedAssignments = assignments.filter((a) => a.averageScore != null || a.score != null)
    if (gradedAssignments.length === 0) return null
    const total = gradedAssignments.reduce((acc, a) => acc + (a.averageScore || a.score || 0), 0)
    return (total / gradedAssignments.length).toFixed(1)
  }, [assignments])

  return (
    <div className="space-y-6">
      {/* ── 4 KPI card ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Tổng số lớp */}
            <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <BookOpen size={20} strokeWidth={1.75} />
                </span>
              </div>
              <p className="mt-3 text-xs text-ink-muted">Tổng số lớp</p>
              <p className="mt-0.5 text-3xl font-bold text-navy-700">{s.totalClasses}</p>
            </div>

            {/* Tổng học viên */}
            <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Users size={20} strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-xs text-ink-muted">Tổng học viên</p>
              <p className="mt-0.5 text-3xl font-bold text-navy-700">{s.totalStudents}</p>
            </div>

            {/* Bài tập đang giao */}
            <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList size={20} strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-xs text-ink-muted">Bài tập đang giao</p>
              <p className="mt-0.5 text-3xl font-bold text-navy-700">{s.activeAssignments}</p>
            </div>

            {/* Bài tập sắp đến hạn — urgent */}
            <div className={`rounded-xl border p-4 shadow-sm ${s.urgentDeadlines > 0 ? 'border-red-200 bg-red-50' : 'border-line bg-white'}`}>
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.urgentDeadlines > 0 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                  <AlertTriangle size={20} strokeWidth={1.75} />
                </span>
                {s.urgentDeadlines > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    Urgent
                  </span>
                )}
              </div>
              <p className={`mt-3 text-xs font-semibold ${s.urgentDeadlines > 0 ? 'text-red-600' : 'text-ink-muted'}`}>
                Bài tập sắp đến hạn
              </p>
              <p className={`mt-0.5 text-3xl font-bold ${s.urgentDeadlines > 0 ? 'text-red-600' : 'text-navy-700'}`}>
                {s.urgentDeadlines}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Performance + Activity ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Performance Overview — chiếm 2/3 */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-700">Performance Overview</h2>
            <button type="button" className="text-ink-muted hover:text-navy-700">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Donut — Tỷ lệ hoàn thành */}
            <div className="flex flex-col items-center gap-2 rounded-xl bg-canvas p-4">
              <p className="text-xs font-semibold text-ink-muted">Tỷ lệ hoàn thành bài tập</p>
              {isLoading ? (
                <div className="h-[140px] w-[140px] rounded-full bg-slate-100 animate-pulse" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <DonutProgress percent={completionRate} />
                  {/* Text ở giữa donut */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-navy-700">{completionRate}%</span>
                  </div>
                </div>
              )}
              {assignments.length > 0 && (
                <p className="text-xs text-slate-500">
                  {assignments.filter((a) => a.status === 'CLOSED').length}/{assignments.length} bài đã đóng
                </p>
              )}
            </div>

            {/* Bar chart — Điểm trung bình lớp */}
            <div className="flex flex-col gap-2 rounded-xl bg-canvas p-4">
              <p className="text-xs font-semibold text-ink-muted">Điểm trung bình lớp</p>
              {averageClassScore === null ? (
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <p className="text-3xl font-bold text-slate-300">--</p>
                    <p className="mt-1 text-[11px] text-slate-400">Chưa có bài làm được chấm điểm</p>
                  </div>
                  <div className="mt-4 flex h-[64px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 text-[11px] text-slate-400 text-center px-2">
                    Điểm số trung bình sẽ hiển thị khi bạn chấm bài tập của học viên
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <p className="text-4xl font-bold text-navy-700">{averageClassScore}</p>
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">Dựa trên các bài tập đã chấm</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hoạt động gần đây — 1/3 */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <History size={18} className="text-brand-500" />
                <h2 className="font-semibold text-navy-700">Hoạt động gần đây</h2>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mới nhất
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {isActivitiesLoading && recentActivities.length === 0 ? (
                <div className="flex items-center gap-3 py-6 justify-center">
                  <Loader2 size={18} strokeWidth={2.25} className="animate-spin shrink-0 text-brand-600" />
                  <span className="text-xs text-slate-500">Đang tải hoạt động...</span>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2.5">
                    <History size={18} strokeWidth={1.75} />
                  </div>
                  <p className="text-xs font-medium text-slate-600">Chưa có hoạt động nào gần đây</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                    Hoạt động giao bài, chấm điểm và học viên nộp bài sẽ tự động hiển thị tại đây khi bạn tạo lớp học.
                  </p>
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 group">
                    <ActivityIcon type={act.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed text-ink">
                        <span className="font-semibold text-navy-800">{act.actor}</span>{' '}
                        <span className="text-ink-muted">{act.action}</span>{' '}
                        {act.target && (
                          <span className="font-medium text-brand-600">"{act.target}"</span>
                        )}
                        {act.className && act.className !== act.target && (
                          <span className="text-ink-muted text-[11px]"> ({act.className})</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-muted flex items-center gap-1">
                        <Clock size={10} className="text-slate-400" />
                        {act.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/nhat-ky')}
            className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer group"
          >
            <span className="group-hover:underline">Xem tất cả hoạt động</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── Lớp học đang giảng dạy ──────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-700">Lớp học đang giảng dạy</h2>
          <button
            type="button"
            onClick={() => navigate('/lop-hoc')}
            className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 cursor-pointer"
          >
            Xem tất cả lớp
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <SkeletonClassCard />
              <SkeletonClassCard />
              <SkeletonClassCard />
              <SkeletonClassCard />
            </>
          ) : classes.length === 0 ? (
            <div className="col-span-4 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">Bạn chưa có lớp học nào.</p>
              <button
                type="button"
                onClick={() => navigate('/lop-hoc')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
              >
                Tạo lớp học ngay
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            classes.slice(0, 8).map((cls, idx) => {
              const name = cls.className || cls.name || `Lớp #${cls.id}`
              const students = cls.studentCount ?? cls.currentStudents ?? 0
              const maxStudents = cls.maxStudents ?? 30
              const progress = maxStudents > 0 ? Math.round((students / maxStudents) * 100) : 0
              const gradient = CLASS_GRADIENTS[idx % CLASS_GRADIENTS.length]
              // Tag from description hoặc type
              const tag = cls.subject || cls.type || 'Lớp học'

              return (
                <div
                  key={cls.id}
                  onClick={() => navigate('/lop-hoc')}
                  className="group overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  {/* Ảnh bìa với gradient */}
                  <div
                    className="relative h-32 w-full"
                    style={{ background: gradient }}
                  >
                    {/* Tag loại lớp */}
                    <span
                      className="absolute left-3 bottom-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                    >
                      {tag}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-sm font-bold text-navy-700">{name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                      <Clock size={11} />
                      {cls.schedule || 'Liên hệ giáo viên để biết lịch'}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                        <Users size={11} />
                        {students}/{maxStudents} học viên
                      </p>
                      {/* Thanh tiến độ sĩ số */}
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Giao dịch mua gói gần đây ─────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-navy-700">Giao dịch mua gói gần đây</h2>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Thành công
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/giao-dich')}
            className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 cursor-pointer"
          >
            Xem tất cả
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          {isRecentOrdersLoading ? (
            <div className="divide-y divide-line/60">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                    <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-400 mb-3">
                <CreditCard size={22} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-slate-600">Chưa có giao dịch thành công</p>
              <p className="text-xs text-slate-400 mt-1">Các giao dịch mua gói Premium sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-canvas">
                <span className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Người dùng</span>
                <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Gói đăng ký</span>
                <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Số tiền</span>
                <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Thời gian</span>
                <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted text-right">TT</span>
              </div>

              {recentOrders.map((order) => {
                const userName = order.userName || order.userEmail || order.userId || 'Người dùng'
                const planName = order.planName || order.description || 'Gói Premium'
                const amount = order.amount
                  ? `${Number(order.amount).toLocaleString('vi-VN')}đ`
                  : '--'
                const orderDate = order.createdAt ? new Date(order.createdAt) : null
                const timeStr = orderDate
                  ? orderDate.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  : '--'
                const roleLabel = order.userRole === 'TEACHER' ? 'Giáo viên' : 'Học viên'
                const roleColor = order.userRole === 'TEACHER'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-sky-50 text-sky-600'
                const initials = (order.userName || 'U').slice(0, 2).toUpperCase()

                return (
                  <div key={order.id || order.orderCode} className="grid grid-cols-12 gap-2 items-center px-5 py-3 hover:bg-canvas/60 transition-colors">
                    {/* Người dùng */}
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-700">{userName}</p>
                        <span className={`inline-block mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${roleColor}`}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Gói */}
                    <div className="col-span-3 min-w-0">
                      <p className="truncate text-sm text-ink">{planName}</p>
                      {order.orderCode && (
                        <p className="text-[10px] text-ink-muted mt-0.5 font-mono truncate">{order.orderCode}</p>
                      )}
                    </div>

                    {/* Số tiền */}
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-emerald-600">{amount}</p>
                    </div>

                    {/* Thời gian */}
                    <div className="col-span-2">
                      <p className="text-[11px] text-ink-muted flex items-center gap-1">
                        <Clock size={10} className="shrink-0" />
                        {timeStr}
                      </p>
                    </div>

                    {/* Trạng thái */}
                    <div className="col-span-1 flex justify-end">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-100">
                        <CheckCircle size={9} />
                        OK
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboardPage

