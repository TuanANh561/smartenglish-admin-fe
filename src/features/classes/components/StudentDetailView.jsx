import { ArrowLeft, ClipboardList } from 'lucide-react'

export default function StudentDetailView({ student, cls, onBack }) {
  const scoreColor =
    student.avgScore >= 8.5
      ? '#15803d'
      : student.avgScore >= 7.0
        ? '#1d4ed8'
        : '#b45309'
  const scoreBg =
    student.avgScore >= 8.5
      ? '#dcfce7'
      : student.avgScore >= 7.0
        ? '#dbeafe'
        : '#fef3c7'

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-navy-700 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Quay lại lớp {cls.name}
      </button>

      {/* Profile card */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Avatar lớn */}
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-xs"
            style={{ backgroundColor: student.avatarColor }}
          >
            {student.name.charAt(0)}
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-navy-700">{student.name}</h2>
            <p className="text-sm text-ink-muted">{student.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
                Lớp: {cls.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Cấp {cls.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Điểm TB */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Điểm trung bình</p>
          <p className="mt-1 text-3xl font-bold" style={{ color: scoreColor }}>
            {student.avgScore}
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: scoreBg, color: scoreColor }}
          >
            {student.avgScore >= 8.5 ? 'Xuất sắc' : student.avgScore >= 7.0 ? 'Khá' : 'Trung bình'}
          </span>
        </div>

        {/* Tiến độ */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Tiến độ</p>
          <p className="mt-1 text-3xl font-bold text-navy-700">{student.progress}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        {/* Lần học cuối */}
        <div className="col-span-2 rounded-xl border border-line bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs text-ink-muted">Lần học cuối</p>
          <p className="mt-1 text-base font-bold text-navy-700">{student.lastSeen}</p>
          <p className="mt-1 text-xs text-ink-muted">Hoạt động gần đây</p>
        </div>
      </div>

      {/* Placeholder chi tiết hơn */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-navy-700">Lịch sử bài tập</h3>
        <div className="flex h-32 items-center justify-center text-sm text-ink-muted">
          <ClipboardList size={24} className="mr-2 opacity-40" />
          Tính năng đang được phát triển
        </div>
      </div>
    </div>
  )
}
