import { useState } from 'react'
import { Loader2, UserPlus, X } from 'lucide-react'

export default function AddStudentModal({ isOpen, onClose, onAddMember }) {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedId = parseInt(userId, 10)
    if (isNaN(parsedId) || parsedId <= 0) {
      setError('Vui lòng nhập User ID học viên hợp lệ (số nguyên dương)')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onAddMember({
        userId: parsedId,
        role: role,
        status: 'ACTIVE',
      })
      setUserId('')
      onClose()
    } catch (err) {
      setError(err?.message || 'Không thể thêm học viên vào lớp')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <UserPlus size={18} className="text-brand-500" />
            <h3 className="font-bold text-base">Thêm học viên vào lớp</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              User ID của Học viên <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="VD: 3, 4, 5..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Nhập mã định danh người dùng trong hệ thống cần ghi danh vào lớp.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò trong lớp
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            >
              <option value="STUDENT">Học viên (Student)</option>
              <option value="ASSISTANT_TEACHER">Trợ giảng (Assistant Teacher)</option>
            </select>
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
              <span>Thêm ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
