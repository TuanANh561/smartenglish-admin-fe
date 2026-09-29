import { Eye, ImageIcon, Lock, Pencil, Play, Send, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_MAP = {
  TOEIC_PART_1: { label: 'Part 1', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  TOEIC_PART_2: { label: 'Part 2', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  TOEIC_PART_3: { label: 'Part 3', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  TOEIC_PART_4: { label: 'Part 4', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  CONVERSATION: { label: 'Hội thoại', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  SHORT_TALK: { label: 'Bài nói', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  NEWS_PODCAST: { label: 'Podcast', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
  DICTATION: { label: 'Chép chính tả', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
}

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
  const cat = CATEGORY_MAP[item.category] || { label: item.category || 'Nghe', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
  const hasAudioFile = Boolean(
    item.audioUrl &&
      item.audioUrl.trim().length > 0 &&
      !String(item.audioUrl).match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i)
  )
  const isReady = item.syncedTranscripts && item.syncedTranscripts.length > 0

  return (
    <tr
      onClick={() => onRowClick(item)}
      className="group transition-colors hover:bg-slate-50/60 cursor-pointer"
    >
      {/* Tiêu đề + Nút Play Audio (Tinh gọn, chuẩn Data Table) */}
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          {/* Audio Play Button */}
          <button
            type="button"
            onClick={(e) => onPlayToggle(e, item)}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs',
              isPlaying
                ? 'bg-brand-500 text-white animate-pulse'
                : 'bg-blue-50 text-brand-600 hover:bg-brand-500 hover:text-white',
            )}
            title={isPlaying ? 'Dừng phát' : 'Nghe bài học'}
          >
            {isPlaying ? (
              <Volume2 size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>

          {/* Photo thumbnail nếu là TOEIC Part 1 có ảnh */}
          {item.imageUrl ? (
            <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 p-0.5 text-[7px] text-white">
                <ImageIcon size={8} />
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 min-w-0">
            {/* Category / Part Badge */}
            <span className={cn('inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold border shadow-2xs', cat.bg)}>
              {cat.label}
            </span>

            {/* Tiêu đề chính */}
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate block group-hover:text-brand-600 transition-colors">
              {item.title}
            </span>
          </div>
        </div>
      </td>

      {/* Chủ đề */}
      <td className="px-4 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
        {item.topic || 'Tổng hợp'}
      </td>

      {/* Cấp độ */}
      <td className="px-4 py-4 text-center whitespace-nowrap">
        <span
          className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-xs font-bold shadow-2xs"
          style={{ backgroundColor: cefr.bg, color: cefr.text }}
        >
          {cefr.code}
        </span>
      </td>

      {/* Thời lượng */}
      <td className="px-4 py-4 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
        {item.duration || '01:00'}
      </td>

      {/* Tác giả / Nguồn */}
      <td className="px-4 py-4 whitespace-nowrap">
        {isTeacher && isOwned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Của tôi
          </span>
        ) : isSystem ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            SmartEnglish
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {item.authorName || 'Giáo viên'}
          </span>
        )}
      </td>

      {/* Bản chép lời & Câu hỏi */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium w-fit',
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
            {isReady ? `${item.syncedTranscripts.length} câu đồng bộ` : 'Bản chép đầy đủ'}
          </span>
          {item.questions && item.questions.length > 0 && (
            <span className="text-[11px] text-slate-500 font-medium">
              {item.questions.length} câu hỏi bài tập
            </span>
          )}
        </div>
      </td>

      {/* Thao tác */}
      <td className="px-6 py-4 whitespace-nowrap">
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
