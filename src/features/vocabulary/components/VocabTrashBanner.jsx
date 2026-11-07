import { Trash2 } from 'lucide-react'

/**
 * Banner thông báo trạng thái thùng rác từ vựng và nút quay lại danh sách chính.
 */
export function VocabTrashBanner({ trashCount, onBack }) {
  return (
    <div className="flex items-center justify-between bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800">
      <span className="flex items-center gap-1.5 font-medium">
        <Trash2 size={14} className="text-amber-600 shrink-0" />
        Bạn đang xem các từ vựng trong <strong>Thùng rác</strong> ({trashCount}). Bạn có thể khôi phục hoặc xóa hẳn bất kỳ lúc nào.
      </span>
      <button
        type="button"
        onClick={onBack}
        className="font-semibold text-amber-900 hover:underline cursor-pointer"
      >
        Quay lại danh sách
      </button>
    </div>
  )
}

export default VocabTrashBanner

