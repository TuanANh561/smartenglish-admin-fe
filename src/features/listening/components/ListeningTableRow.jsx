import { Eye, Lock, Pencil, Play, Send, Trash2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ListeningTableRow({
  item,
  isOwned,
  isSystem,
  cefr,
  isPlaying,
  canManage,
  isTeacher,
  onPlayToggle,
  onRowClick,
  onAssignToClass,
  onEditClick,
  onDeleteClick,
}) {
  const isReady = item.status === 'ready'

  return (
    <tr
      onClick={() => onRowClick(item)}
      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
    >
      {/* Tiêu đề + Nút Play Audio */}
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={(e) => onPlayToggle(e, item)}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs',
              isPlaying
                ? 'bg-brand-500 text-white animate-pulse'
                : 'bg-blue-50 text-brand-600 hover:bg-brand-500 hover:text-white',
            )}
            title={isPlaying ? 'Dừng audio' : 'Nghe thử audio'}
          >
            {isPlaying ? (
              <Volume2 size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
                {item.title}
              </span>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {item.accent}
              </span>
            </div>
            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
              {item.description}
            </span>
          </div>
        </div>
      </td>

      {/* Chủ đề */}
      <td className="px-4 py-4.5 text-sm font-medium text-slate-700 whitespace-nowrap">
        {item.topic}
      </td>

      {/* Cấp độ */}
      <td className="px-4 py-4.5 text-center whitespace-nowrap">
        <span
          className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold shadow-2xs"
          style={{ backgroundColor: cefr.bg, color: cefr.text }}
        >
          {cefr.code}
        </span>
      </td>

      {/* Thời lượng */}
      <td className="px-4 py-4.5 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
        {item.duration}
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

      {/* Bản chép lời / Transcript status */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            isReady
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-800 border border-amber-100',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isReady ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
          {isReady ? 'Bản chép sẵn sàng' : 'Cần kiểm tra'}
        </span>
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
              title="Giao bài nghe cho lớp học"
            >
              <Send size={17} />
            </button>
          )}

          {/* Nút xem chi tiết */}
          <button
            type="button"
            onClick={() => onRowClick(item)}
            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
            title="Xem chi tiết bài nghe"
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
                title="Chỉnh sửa"
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                onClick={(e) => onDeleteClick(e, item)}
                className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title="Xóa bài nghe"
              >
                <Trash2 size={17} />
              </button>
            </>
          ) : (
            <span
              className="p-1.5 text-slate-300"
              title="Chỉ xem (Không có quyền chỉnh sửa)"
            >
              <Lock size={15} />
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}
