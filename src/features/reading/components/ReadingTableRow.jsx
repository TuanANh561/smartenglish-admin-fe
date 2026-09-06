import { BookOpen, Eye, Lock, Pencil, Send, Sparkles, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

export default function ReadingTableRow({
  item,
  isOwned,
  isSystem,
  canManage,
  isTeacher,
  onRowClick,
  onAssignToClass,
  onEditClick,
  onDeleteClick,
}) {
  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.B1

  return (
    <tr
      onClick={() => onRowClick(item)}
      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
    >
      {/* Tiêu đề bài đọc */}
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
            <BookOpen size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
                {item.title}
              </span>
              {item.isAI && (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                  <Sparkles size={10} />
                  AI
                </span>
              )}
            </div>
            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
              {item.description}
            </span>
          </div>
        </div>
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

      {/* Độ dài */}
      <td className="px-4 py-4.5 text-center whitespace-nowrap">
        <span className="font-bold text-slate-800 text-sm block">
          {item.wordCount} từ
        </span>
        <span className="text-xs text-slate-400 block mt-0.5">
          ~{item.minutes} phút
        </span>
      </td>

      {/* Tác giả / Nguồn */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        {isTeacher && isOwned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Của tôi
          </span>
        ) : isSystem ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Hệ thống
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {item.authorName}
          </span>
        )}
      </td>

      {/* Số câu hỏi */}
      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
        {item.questions?.length || 5} câu
      </td>

      {/* Ngày tạo */}
      <td className="px-4 py-4.5 text-sm text-slate-500 whitespace-nowrap">
        {formatDate(item.createdAt)}
      </td>

      {/* Thao tác */}
      <td className="px-6 py-4.5 whitespace-nowrap">
        <div
          className="flex items-center justify-end gap-1 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút giao bài */}
          {isTeacher && isOwned && (
            <button
              type="button"
              onClick={(e) => onAssignToClass(e, item)}
              className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
              title="Giao bài cho lớp học"
            >
              <Send size={17} />
            </button>
          )}

          {/* Nút xem chi tiết */}
          <button
            type="button"
            onClick={() => onRowClick(item)}
            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
            title="Xem chi tiết bài đọc"
          >
            <Eye size={17} />
          </button>

          {/* Sửa / Xóa hoặc Lock */}
          {canManage ? (
            <>
              <button
                type="button"
                onClick={(e) => onEditClick(e, item)}
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Chỉnh sửa bài đọc"
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                onClick={(e) => onDeleteClick(e, item)}
                className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title="Xóa bài đọc"
              >
                <Trash2 size={17} />
              </button>
            </>
          ) : (
            <span className="p-1.5 text-slate-300" title="Chỉ xem">
              <Lock size={15} />
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}
