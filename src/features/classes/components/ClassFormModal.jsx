import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function ClassFormModal({ isOpen, onClose, initialData, onSubmit }) {
  const isEditing = Boolean(initialData?.id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cefrTarget: 'B1',
    maxStudents: 30,
    status: 'ACTIVE',
    joinCode: '',
    startDate: '',
    endDate: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        cefrTarget: initialData.cefrTarget || initialData.level || 'B1',
        maxStudents: initialData.maxStudents || 30,
        status: (initialData.status || 'ACTIVE').toUpperCase(),
        joinCode: initialData.joinCode || initialData.code || '',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        cefrTarget: 'B1',
        maxStudents: 30,
        status: 'ACTIVE',
        joinCode: '',
        startDate: '',
        endDate: '',
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Vui lòng nhập tên lớp học'
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Tên lớp không được vượt quá 100 ký tự'
    }

    if (!formData.maxStudents || formData.maxStudents < 1 || formData.maxStudents > 200) {
      errs.maxStudents = 'Sĩ số tối đa từ 1 đến 200 học viên'
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        cefrTarget: formData.cefrTarget,
        maxStudents: Number(formData.maxStudents),
        status: formData.status,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : null,
      }
      if (!isEditing && formData.joinCode.trim()) {
        payload.joinCode = formData.joinCode.trim().toUpperCase()
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Có lỗi xảy ra, vui lòng thử lại',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
          </h3>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên lớp học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: IELTS Intensive B2 - Khóa 1"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-200 focus:border-brand-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trình độ CEFR <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cefrTarget}
                onChange={(e) => setFormData({ ...formData, cefrTarget: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sĩ số tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none ${
                  errors.maxStudents
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              {errors.maxStudents && (
                <p className="mt-1 text-xs text-red-500">{errors.maxStudents}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              >
                <option value="ACTIVE">Đang diễn ra (Active)</option>
                <option value="UPCOMING">Sắp diễn ra (Upcoming)</option>
                <option value="ENDED">Đã kết thúc (Ended)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã tham gia {isEditing ? '(Không thể sửa)' : '(Tự sinh nếu trống)'}
              </label>
              <input
                type="text"
                disabled={isEditing}
                value={formData.joinCode}
                onChange={(e) =>
                  setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })
                }
                placeholder="VD: ENG888"
                maxLength={20}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none ${
                  errors.endDate
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              >
              </input>
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả lớp học
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Giới thiệu mục tiêu, nội dung chương trình, lưu ý dành cho học viên..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
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
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo lớp học'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
