import { useState } from 'react'
import { BookOpen, Calendar, Loader2, X } from 'lucide-react'

const ASSIGNMENT_TYPES = [
  { value: 'HOMEWORK', label: 'Bài tập về nhà (Homework)' },
  { value: 'QUIZ', label: 'Bài trắc nghiệm (Quiz)' },
  { value: 'ESSAY', label: 'Bài viết luận (Essay)' },
  { value: 'SPEAKING', label: 'Bài luyện nói (Speaking)' },
]

export default function CreateAssignmentModal({ isOpen, onClose, onCreateAssignment }) {
  const [formData, setFormData] = useState({
    title: '',
    assignmentType: 'HOMEWORK',
    instructions: '',
    dueDate: '',
    passingScore: 5.0,
    isGraded: true,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) {
      errs.title = 'Vui lòng nhập tiêu đề bài tập'
    }
    if (formData.passingScore < 0 || formData.passingScore > 10) {
      errs.passingScore = 'Điểm đạt phải từ 0 đến 10'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await onCreateAssignment({
        title: formData.title.trim(),
        assignmentType: formData.assignmentType,
        instructions: formData.instructions?.trim() || null,
        dueDate: formData.dueDate ? `${formData.dueDate}:00Z` : null,
        passingScore: Number(formData.passingScore),
        isGraded: formData.isGraded,
      })
      onClose()
    } catch (err) {
      setErrors({ submit: err?.message || 'Không thể tạo bài tập' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <BookOpen size={18} className="text-brand-500" />
            <h3 className="font-bold text-base">Giao bài tập mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errors.submit && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề bài tập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Viết đoạn văn IELTS Task 2 - Topic Environment"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                errors.title
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-200 focus:border-brand-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại bài tập
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              >
                {ASSIGNMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm sàn đạt (Thang 10)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
              {errors.passingScore && (
                <p className="mt-1 text-xs text-red-500">{errors.passingScore}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hạn chót nộp bài
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hướng dẫn làm bài
            </label>
            <textarea
              rows={3}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Chi tiết yêu cầu, độ dài tối thiểu, cấu trúc bài nộp..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isGraded"
              checked={formData.isGraded}
              onChange={(e) => setFormData({ ...formData, isGraded: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isGraded" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Tính điểm vào kết quả đánh giá học bạ
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>Giao bài tập</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
