import { Copy, Eye, Headphones, Pencil, Trash2, Volume2 } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eef2ff', text: '#4f46e5' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}

export default function PronunciationTableRow({
  item,
  isPlaying,
  onPlayAudio,
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const isPublished = item.status === 'published'
  const levelStyle = LEVEL_COLOR[item.level] ?? LEVEL_COLOR.A1

  return (
    <tr
      onClick={() => onViewDetails(item)}
      className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
    >
      {/* Tên bài học */}
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600 shadow-2xs">
            <Headphones size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-brand-600 transition-colors">
                {item.title}
              </span>
              {item.ipaSymbol && (
                <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md font-semibold border border-brand-100 shrink-0">
                  {item.ipaSymbol}
                </span>
              )}
            </div>
            <span className="line-clamp-1 text-xs text-slate-500 mt-0.5">
              {item.description || item.mouthShapeGuide || 'Bài học luyện phát âm tiêu chuẩn'}
            </span>
          </div>
        </div>
      </td>

      {/* Phân loại âm */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {item.category}
        </span>
      </td>

      {/* Cấp độ */}
      <td className="px-4 py-4.5 text-center whitespace-nowrap">
        <span
          className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
        >
          {item.level}
        </span>
      </td>

      {/* Mẫu Audio */}
      <td className="px-4 py-4.5 text-center whitespace-nowrap">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onPlayAudio(e, item)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer shadow-2xs',
              isPlaying
                ? 'bg-brand-500 text-white animate-pulse'
                : 'bg-blue-50 text-brand-600 hover:bg-brand-500 hover:text-white',
            )}
            title={isPlaying ? 'Dừng audio' : 'Nghe thử âm mẫu'}
          >
            <Volume2 size={14} />
          </button>
          <span className="font-bold text-slate-800 text-sm">
            {item.audioSampleCount || 24} mẫu
          </span>
        </div>
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-4.5 whitespace-nowrap">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: isPublished ? '#ecfdf5' : '#f1f5f9',
            color: isPublished ? '#059669' : '#475569',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: isPublished ? '#10b981' : '#94a3b8' }}
          />
          <span>{isPublished ? 'Published' : 'Draft'}</span>
        </span>
      </td>

      {/* Cập nhật */}
      <td className="px-4 py-4.5 text-sm text-slate-500 whitespace-nowrap">
        {formatRelativeTime(item.updatedAt)}
      </td>

      {/* Thao tác */}
      <td
        onClick={(e) => e.stopPropagation()}
        className="px-6 py-4.5 whitespace-nowrap text-right"
      >
        <div className="flex items-center justify-end gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            className="rounded-lg p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
            title="Xem chi tiết bài học"
          >
            <Eye size={17} />
          </button>
          <button
            type="button"
            onClick={(e) => onEdit(e, item)}
            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Chỉnh sửa bài học"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            onClick={(e) => onDuplicate(e, item)}
            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Nhân bản bài học"
          >
            <Copy size={17} />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(e, item)}
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            title="Xóa bài học"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  )
}
