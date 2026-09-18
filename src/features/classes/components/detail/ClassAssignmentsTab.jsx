import { BookOpen, Calendar, CheckCircle, Clock, FileText, Plus } from 'lucide-react'

const TYPE_CONFIG = {
  HOMEWORK: { label: 'Bài tập', bg: '#eff6ff', text: '#2563eb' },
  QUIZ: { label: 'Trắc nghiệm', bg: '#ecfdf5', text: '#059669' },
  ESSAY: { label: 'Viết luận', bg: '#fef3c7', text: '#d97706' },
  SPEAKING: { label: 'Luyện nói', bg: '#fdf2f8', text: '#db2777' },
}

export default function ClassAssignmentsTab({
  cls,
  assignments = [],
  loading = false,
  onCreateAssignmentClick,
}) {
  const formatDate = (d) => {
    if (!d) return 'Không có hạn chót'
    try {
      return new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return d
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Danh sách bài tập</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng số {assignments.length} bài tập đã được giao cho lớp này
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateAssignmentClick}
          className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* List */}
      <div className="p-6 pt-2">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Đang tải danh sách bài tập...
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <FileText size={24} />
            </span>
            <p className="text-sm font-medium text-slate-600">Chưa có bài tập nào được giao</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Hãy giao bài tập về nhà, trắc nghiệm hoặc bài viết luận cho học viên
            </p>
            <button
              type="button"
              onClick={onCreateAssignmentClick}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>Giao bài ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {assignments.map((asm) => {
              const typeCfg = TYPE_CONFIG[asm.assignmentType] || TYPE_CONFIG.HOMEWORK
              return (
                <div
                  key={asm.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-brand-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-lg px-2.5 py-1 text-xs font-bold"
                        style={{ backgroundColor: typeCfg.bg, color: typeCfg.text }}
                      >
                        {typeCfg.label}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900">{asm.title}</h5>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} className="text-slate-400" />
                      <span>Hạn nộp: {formatDate(asm.dueDate)}</span>
                    </div>
                  </div>

                  {asm.instructions && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {asm.instructions}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>
                        Điểm sàn đạt: <strong className="text-slate-700">{asm.passingScore || 5.0}</strong>
                      </span>
                      <span>
                        Chấm điểm: <strong className="text-slate-700">{asm.isGraded ? 'Có tính điểm' : 'Không'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 text-xs">
                        <CheckCircle size={12} />
                        <span>
                          Đã nộp: {asm.submissionCount || 0} / {cls.studentCount || 0}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
