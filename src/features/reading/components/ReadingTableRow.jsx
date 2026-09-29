import { BookOpen, Copy, Eye, Lock, Pencil, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#dcfce7', text: '#166534' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#fdf4ff', text: '#86198f' },
}

const STATUS_BADGE = {
  published: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  draft:     { label: 'Draft',     bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
}

export default function ReadingTableRow({
  item,
  isTrash,
  canManage,
  onRowClick,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  onPermanentDeleteClick,
  onTogglePublish,
  onDuplicate,
}) {
  const levelStyle  = LEVEL_COLOR[item.cefrLevel]  ?? LEVEL_COLOR.B1
  const statusBadge = STATUS_BADGE[item.status]     ?? STATUS_BADGE.published

  return (
    <tr
      onClick={() => !isTrash && onRowClick(item)}
      className={`group transition-colors hover:bg-slate-50/60 ${!isTrash ? 'cursor-pointer' : ''}`}
    >
      {/* Tiêu đề */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
            <BookOpen size={16} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-brand-600 transition-colors">
              {item.titleEn}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {item.titleVi}
            </p>
          </div>
        </div>
      </td>

      {/* Chủ đề */}
      <td className="px-3 py-3 text-xs text-slate-600">
        {item.topic || '—'}
      </td>

      {/* Cấp độ */}
      <td className="px-3 py-3 text-center">
        <span
          className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold"
          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
        >
          {item.cefrLevel}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="px-3 py-3 text-center">
        {!isTrash ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); canManage && onTogglePublish(item) }}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${statusBadge.bg} ${statusBadge.text} ${canManage ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            title={canManage ? 'Nhấn để đổi trạng thái' : undefined}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </button>
        ) : (
          <span className="text-xs text-red-400 font-medium">Đã xóa</span>
        )}
      </td>

      {/* Độ dài */}
      <td className="px-3 py-3 text-center">
        <span className="font-semibold text-slate-800 text-xs block">{item.wordCount ?? 0} từ</span>
        <span className="text-xs text-slate-400 block">~{item.estimatedMin ?? 5} phút</span>
      </td>

      {/* Câu hỏi */}
      <td className="px-3 py-3 text-center font-semibold text-slate-700 text-xs">
        {item.questionCount ?? item.questions?.length ?? 0} câu
      </td>

      {/* Ngày tạo */}
      <td className="px-3 py-3 text-xs text-slate-500">
        {formatDate(item.createdAt)}
      </td>

      {/* Thao tác */}
      <td className="px-4 py-3">
        <div
          className="flex items-center justify-end gap-0.5 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => onRestoreClick(item)}
                className="rounded-lg p-1.5 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Khôi phục bài đọc"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => onPermanentDeleteClick(item)}
                className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title="Xóa vĩnh viễn"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onRowClick(item)}
                className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye size={16} />
              </button>
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => onDuplicate(item)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Nhân bản"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onEditClick(e, item)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteClick(e, item)}
                    className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Xóa bài đọc"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              {!canManage && (
                <span className="p-1.5 text-slate-300" title="Chỉ xem">
                  <Lock size={15} />
                </span>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
