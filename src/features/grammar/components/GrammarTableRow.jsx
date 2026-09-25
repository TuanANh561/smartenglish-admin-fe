import { BookOpen, Copy, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

export default function GrammarTableRow({
  item,
  isTrash = false,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTogglePublish,
}) {
  const isPublished = item.status === 'published'
  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.B1

  return (
    <tr
      onClick={() => onView(item)}
      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
    >
      {/* Tên bài học */}
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isTrash ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-brand-600'}`}>
            <BookOpen size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-sm tracking-tight block group-hover:text-brand-600 transition-colors">
              {item.title}
            </span>
            {item.formula && (
              <span className="font-mono text-xs text-slate-500 line-clamp-1 mt-0.5">
                {item.formula}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Chủ điểm */}
      <td className="px-4 py-4.5 text-sm font-medium text-slate-700 whitespace-nowrap">
        {item.topic}
      </td>

      {/* Cấp độ */}
      <td className="px-4 py-4.5 text-center whitespace-nowrap">
        <span
          className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold shadow-2xs"
          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
        >
          {item.level}
        </span>
      </td>

      {/* Số bài tập */}
      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
        {item.exerciseCount || item.sampleExercises?.length || 0} bài
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        {isTrash ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Trong thùng rác
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => onTogglePublish(e, item)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: isPublished ? '#ecfdf5' : '#f1f5f9',
              color: isPublished ? '#059669' : '#475569',
            }}
            title="Bấm để thay đổi trạng thái Xuất bản / Bản nháp"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: isPublished ? '#10b981' : '#94a3b8' }}
            />
            <span>{isPublished ? 'Published' : 'Draft'}</span>
          </button>
        )}
      </td>

      {/* Cập nhật */}
      <td className="px-4 py-4.5 text-sm text-slate-500 whitespace-nowrap">
        {formatRelativeTime(item.deletedAt || item.updatedAt)}
      </td>

      {/* Thao tác */}
      <td className="px-6 py-4.5 whitespace-nowrap">
        <div
          className="flex items-center justify-end gap-1 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={(e) => onRestore(e, item)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Khôi phục bài học"
              >
                <RotateCcw size={15} />
                Khôi phục
              </button>
              <button
                type="button"
                onClick={(e) => onPermanentDelete(e, item)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer ml-1"
                title="Xóa vĩnh viễn"
              >
                <Trash2 size={15} />
                Xóa hẳn
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onView(item)}
                className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye size={17} />
              </button>
              <button
                type="button"
                onClick={(e) => onEdit(e, item)}
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Chỉnh sửa"
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                onClick={(e) => onDuplicate(e, item)}
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Nhân bản"
              >
                <Copy size={17} />
              </button>
              <button
                type="button"
                onClick={(e) => onDelete(e, item)}
                className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title="Chuyển vào thùng rác"
              >
                <Trash2 size={17} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
