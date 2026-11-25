import { Eye, Pencil } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { canRevisePending } from './usePendingRequests'

/**
 * Thao tác của dòng học liệu mới đang chờ duyệt: "Xem" mở trang chi tiết như học liệu đã duyệt;
 * giáo viên gửi yêu cầu được sửa tiếp nội dung trong lúc chờ (onEdit).
 */
function PendingViewButton({ item, onClick, onEdit }) {
  const role = String(useAuthStore((s) => s.user?.role) || '').toLowerCase()
  const canEdit = Boolean(onEdit) && role === 'teacher' && (!item || canRevisePending(item))
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn?.()
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={stop(onClick)}
        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas cursor-pointer"
      >
        <Eye size={14} strokeWidth={1.75} />
        Xem
      </button>
      {canEdit ? (
        <button
          type="button"
          onClick={stop(onEdit)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          title="Sửa nội dung đang chờ duyệt"
        >
          <Pencil size={16} strokeWidth={1.75} />
        </button>
      ) : null}
    </span>
  )
}

export default PendingViewButton
