import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Users,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  TEACHER_ACTIVITIES,
  TEACHER_CLASSES,
  TEACHER_SCORE_CHART,
  TEACHER_STATS,
} from '@/mocks/data/teacher'

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
  const max = Math.max(...data.map((d) => d.value))
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
    submit: { Icon: FileText, bg: 'bg-brand-500/10', color: 'text-brand-600' },
    comment: { Icon: MessageSquare, bg: 'bg-slate-100', color: 'text-slate-500' },
    join: { Icon: UserPlus, bg: 'bg-green-100', color: 'text-green-600' },
  }
  const { Icon, bg, color } = map[type] ?? map.submit
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon size={15} className={color} />
    </span>
  )
}

// ─── Teacher Dashboard chính ─────────────────────────────────────────────────
function TeacherDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const today = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  const s = TEACHER_STATS

  return (
    <div className="space-y-6">
      {/* ── 4 KPI card ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Tổng số lớp */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <BookOpen size={20} strokeWidth={1.75} />
            </span>
            <span className="rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
              +1
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <AlertTriangle size={20} strokeWidth={1.75} />
            </span>
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Urgent
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-red-600">Bài tập sắp đến hạn</p>
          <p className="mt-0.5 text-3xl font-bold text-red-600">{s.urgentDeadlines}</p>
        </div>
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
              <p className="text-xs font-semibold text-ink-muted">Tỷ lệ hoàn thành</p>
              <div className="relative flex items-center justify-center">
                <DonutProgress percent={s.completionRate} />
                {/* Text ở giữa donut */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-navy-700">{s.completionRate}%</span>
                </div>
              </div>
              <p className="text-xs text-green-600">
                ↑ +{s.completionDelta}% so tuần trước
              </p>
            </div>

            {/* Bar chart — Điểm trung bình lớp */}
            <div className="flex flex-col gap-2 rounded-xl bg-canvas p-4">
              <p className="text-xs font-semibold text-ink-muted">Điểm trung bình lớp</p>
              <p className="text-4xl font-bold text-navy-700">{s.avgClassScore}</p>
              <div className="mt-auto">
                <ScoreBarChart data={TEACHER_SCORE_CHART} />
              </div>
            </div>
          </div>
        </div>

        {/* Hoạt động gần đây — 1/3 */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-navy-700">Hoạt động gần đây</h2>
          <div className="mt-4 space-y-4">
            {TEACHER_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex gap-3">
                <ActivityIcon type={act.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-ink">
                    <span className="font-semibold">{act.student}</span>{' '}
                    {act.action}{' '}
                    <span className="font-medium text-brand-600">"{act.target}"</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
          >
            Xem tất cả hoạt động
            <ArrowRight size={13} />
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
          {TEACHER_CLASSES.map((cls) => (
            <div
              key={cls.id}
              onClick={() => navigate('/lop-hoc')}
              className="group overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              {/* Ảnh bìa với gradient */}
              <div
                className="relative h-32 w-full"
                style={{ background: cls.coverGradient }}
              >
                {/* Tag loại lớp */}
                <span
                  className="absolute left-3 bottom-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                >
                  {cls.tag}
                </span>
              </div>

              <div className="p-3">
                <h3 className="truncate text-sm font-bold text-navy-700">{cls.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                  <Clock size={11} />
                  {cls.schedule}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <Users size={11} />
                    {cls.students}
                  </p>
                  {/* Thanh tiến độ */}
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${cls.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboardPage
