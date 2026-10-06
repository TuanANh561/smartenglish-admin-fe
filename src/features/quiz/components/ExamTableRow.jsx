import { Award, BookOpen, Clock, Copy, Eye, FileText, HelpCircle, Pencil, RotateCcw, Send, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LEVEL_COLOR = {
  A1:  { bg: '#f0fdf4', text: '#15803d' },
  A2:  { bg: '#dcfce7', text: '#166534' },
  B1:  { bg: '#eff6ff', text: '#1d4ed8' },
  B2:  { bg: '#eef2ff', text: '#4f46e5' },
  C1:  { bg: '#faf5ff', text: '#7c3aed' },
  C2:  { bg: '#fdf4ff', text: '#86198f' },
  ALL: { bg: '#f1f5f9', text: '#475569' },
}

const CATEGORY_MAP = {
  TOEIC_FULL: { label: 'TOEIC Full', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  TOEIC_MINI: { label: 'TOEIC Mini', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  PLACEMENT:  { label: 'Placement Test', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  GRAMMAR:    { label: 'Ngữ pháp', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  VOCABULARY: { label: 'Từ vựng', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  READING:    { label: 'Đọc hiểu', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  LISTENING:  { label: 'Nghe hiểu', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  GENERAL:    { label: 'Tổng hợp', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
}

const STATUS_BADGE = {
  published: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  draft:     { label: 'Draft',     bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
}

export default function ExamTableRow({
  item,
  isTrash,
  canManage,
  isTeacher,
  onRowClick,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  onPermanentDeleteClick,
  onTogglePublish,
  onDuplicate,
  onAssignToClass,
}) {
  const levelStyle  = LEVEL_COLOR[item.cefrLevel] || LEVEL_COLOR.B1
  const categoryCfg = CATEGORY_MAP[item.category] || CATEGORY_MAP.GENERAL
  const statusBadge = STATUS_BADGE[item.status]    || STATUS_BADGE.published

  return (
    <tr
      onClick={() => !isTrash && onRowClick(item)}
      className={`group transition-colors hover:bg-slate-50/60 ${!isTrash ? 'cursor-pointer' : ''}`}
    >
      {/* Tên đề thi & mô tả */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Award size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-brand-600 transition-colors">
                {item.title}
              </p>
              {canManage ? (
                <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                  Của bạn
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
                  Hệ thống
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5 max-w-md">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Thể loại */}
      <td className="px-3 py-3.5">
        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${categoryCfg.bg}`}>
          {categoryCfg.label}
        </span>
      </td>

      {/* Cấp độ */}
      <td className="px-3 py-3.5 text-center">
        <span
          className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold"
          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
        >
          {item.cefrLevel}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="px-3 py-3.5 text-center">
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
          <span className="text-xs text-red-500 font-medium">Đã xóa</span>
        )}
      </td>

      {/* Thời lượng */}
      <td className="px-3 py-3.5 text-center text-xs text-slate-700 font-medium">
        {item.durationMinutes} phút
      </td>

      {/* Số câu hỏi */}
      <td className="px-3 py-3.5 text-center font-semibold text-slate-700 text-xs">
        {item.totalQuestions ?? item.questions?.length ?? 0} câu
      </td>

      {/* Ngày tạo */}
      <td className="px-3 py-3.5 text-xs text-slate-500">
        {formatDate(item.createdAt)}
      </td>

      {/* Thao tác */}
      <td className="px-4 py-3.5">
        <div
          className="flex items-center justify-end gap-1 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => onRestoreClick(item)}
                className="rounded-lg p-1.5 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Khôi phục bài thi"
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

              {/* Nút Giao cho lớp học dành cho Giáo viên */}
              {isTeacher && item.status === 'published' && onAssignToClass && (
                <button
                  type="button"
                  onClick={() => onAssignToClass(item)}
                  className="rounded-lg p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer shadow-2xs"
                  title="Giao bài thi này cho lớp học của bạn"
                >
                  <Send size={15} />
                </button>
              )}

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
                    title="Xóa bài thi"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
