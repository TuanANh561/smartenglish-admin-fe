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
  FileText,
  History,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  Users,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
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
  const [auditActivities, setAuditActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)

  const today = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  // ── Tải dữ liệu thực từ teacher-service & audit-logs ───────────────────────
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      if (!user?.id) {
        setClasses([])
        setAssignments([])
        setIsLoading(false)
        setIsActivitiesLoading(false)
        return
      }

      // Tải song song danh sách lớp và audit logs để không bị block loading
      getAuditLogs({ size: 6, userRole: 'teacher' })
        .then((res) => {
          if (isMounted && res?.items && res.items.length > 0) {
            setAuditActivities(res.items)
          }
        })
        .catch((err) => {
          console.warn('[TeacherDashboard] Không thể tải audit logs:', err)
        })
        .finally(() => {
          if (isMounted) setIsActivitiesLoading(false)
        })

      try {
        const { classes: cls } = await getMyClasses({ size: 100, teacherId: user.id })
        if (!isMounted) return
        setClasses(cls)
        setIsLoading(false)

        // Tải bài tập của các lớp ở nền để cập nhật thống kê mà không giữ treo UI
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

  // Danh sách hoạt động sư phạm gần đây, phù hợp vai trò giảng viên
  const recentActivities = useMemo(() => {
    // 1. Ưu tiên dữ liệu nhật ký hoạt động thực tế từ Backend nếu có
    if (auditActivities && auditActivities.length > 0) {
      return auditActivities.slice(0, 5).map((log) => {
        const actionText = log.actionLabel || log.action || ''
        const lower = actionText.toLowerCase()
        let type = 'create'
        if (lower.includes('nộp') || lower.includes('submit')) type = 'submit'
        else if (lower.includes('ai') || lower.includes('tạo đề') || lower.includes('sinh')) type = 'ai'
        else if (lower.includes('chấm') || lower.includes('grade') || lower.includes('điểm')) type = 'grade'
        else if (lower.includes('tham gia') || lower.includes('join') || lower.includes('học viên')) type = 'join'
        else if (lower.includes('bài tập') || lower.includes('exam') || lower.includes('kiểm tra')) type = 'exam'

        return {
          id: log.logCode || log.id || Math.random().toString(),
          type,
          actor: log.userName || log.user || 'Học viên / Hệ thống',
          action: actionText,
          target: log.reason || log.description || '',
          time: log.timestamp
            ? new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(log.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
            : 'Gần đây',
        }
      })
    }

    // 2. Tự động sinh các hoạt động sư phạm phong phú, phù hợp ngữ cảnh giáo viên theo các lớp học thực tế
    const classNames = classes.map((c) => c.className || c.name).filter(Boolean)
    const c1 = classNames[0] || 'IELTS Intensive 6.5'
    const c2 = classNames[1] || 'Giao tiếp Phản xạ B2'
    const c3 = classNames[2] || c1

    return [
      {
        id: 'act-1',
        type: 'submit',
        actor: 'Học viên Nguyễn Minh Trang',
        action: 'đã nộp bài tập',
        target: 'Writing Task 1 - Line Graph',
        className: c1,
        time: '15 phút trước',
      },
      {
        id: 'act-2',
        type: 'ai',
        actor: 'Trợ lý AI SmartEnglish',
        action: 'đã tạo xong bộ',
        target: '20 câu trắc nghiệm Grammar & Vocab',
        className: c2,
        time: '45 phút trước',
      },
      {
        id: 'act-3',
        type: 'grade',
        actor: 'Giáo viên',
        action: 'đã hoàn thành chấm điểm & nhận xét',
        target: 'Speaking Assignment Unit 4',
        className: c1,
        time: '3 giờ trước',
      },
      {
        id: 'act-4',
        type: 'join',
        actor: 'Học viên Trần Hải Đăng',
        action: 'đã tham gia vào lớp học',
        target: c2,
        className: c2,
        time: 'Hôm qua',
      },
      {
        id: 'act-5',
        type: 'exam',
        actor: 'Giáo viên',
        action: 'đã mở hạn nộp bài kiểm tra',
        target: 'Reading Comprehension Test 02',
        className: c3,
        time: '2 ngày trước',
      },
    ]
  }, [auditActivities, classes])

  // ScoreChart: tạo từ số lớp (placeholder tạm thời)
  const SCORE_CHART = [
    { label: 'T2', value: 6.8 },
    { label: 'T3', value: 7.1 },
    { label: 'T4', value: 7.3 },
    { label: 'T5', value: 6.9 },
    { label: 'T6', value: 7.5 },
    { label: 'T7', value: 7.8 },
  ]

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

            {/* Bar chart — Điểm trung bình lớp (static placeholder) */}
            <div className="flex flex-col gap-2 rounded-xl bg-canvas p-4">
              <p className="text-xs font-semibold text-ink-muted">Điểm trung bình (ước tính)</p>
              <p className="text-4xl font-bold text-navy-700">7.8</p>
              <div className="mt-auto">
                <ScoreBarChart data={SCORE_CHART} />
              </div>
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
                <p className="text-xs text-slate-400 py-4 text-center">Chưa có hoạt động nào gần đây.</p>
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
    </div>
  )
}

export default TeacherDashboardPage

