import { BookOpen, Calendar, CheckCircle2, Copy, Shield, Users } from 'lucide-react'
import { LEVEL_COLOR } from '@/mocks/data/classes'

export default function ClassOverviewTab({ cls, members = [], assignments = [], copied, onCopyCode }) {
  const levelStyle = LEVEL_COLOR[cls.cefrTarget || cls.level] ?? LEVEL_COLOR.B1
  const studentCount = members.length > 0 ? members.length : cls.studentCount || 0
  const assignmentCount = assignments.length > 0 ? assignments.length : cls.assignmentCount || 0

  const formatDate = (d) => {
    if (!d) return 'Chưa thiết lập'
    try {
      return new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sĩ số học viên</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{studentCount}</span>
            <span className="text-xs text-slate-400">/ {cls.maxStudents || 30} tối đa</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bài tập đã giao</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{assignmentCount}</span>
            <span className="text-xs text-slate-400">bài tập</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Trình độ CEFR</span>
            <span
              className="flex h-8 px-2.5 items-center justify-center rounded-lg text-xs font-bold"
              style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
            >
              {cls.cefrTarget || cls.level || 'B1'}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {cls.cefrTarget === 'A1' || cls.cefrTarget === 'A2'
              ? 'Sơ cấp (Beginner)'
              : cls.cefrTarget === 'B1' || cls.cefrTarget === 'B2'
                ? 'Trung cấp (Intermediate)'
                : 'Cao cấp (Advanced)'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mã tham gia lớp</span>
            <button
              type="button"
              onClick={onCopyCode}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 font-mono text-xl font-bold tracking-wider text-brand-600">
            {cls.joinCode || 'CHƯA CÓ'}
          </p>
        </div>
      </div>

      {/* Detail information box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Thông tin chi tiết lớp học
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Giáo viên phụ trách</span>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Shield size={16} className="text-brand-500" />
              <span>{cls.teacherName || 'Thầy John Smith'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Thời gian khóa học</span>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={16} className="text-slate-400" />
              <span>
                {formatDate(cls.startDate)} &rarr; {formatDate(cls.endDate)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Mô tả và mục tiêu</span>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            {cls.description || 'Lớp học chưa có mô tả chi tiết.'}
          </p>
        </div>
      </div>
    </div>
  )
}
