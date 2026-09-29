import { Award, BookOpen, Clock, Copy, Eye, FileText, HelpCircle, Pencil, RotateCcw, Sparkles, Target, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const LEVEL_COLOR = {
  A1:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  A2:  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  B1:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  B2:  { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
  C1:  { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  C2:  { bg: '#fdf4ff', text: '#86198f', border: '#f5d0fe' },
  ALL: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
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

export default function ExamCard({
  item,
  isTrash,
  canManage,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  onPermanentDeleteClick,
  onTogglePublish,
  onDuplicate,
}) {
  const levelStyle  = LEVEL_COLOR[item.cefrLevel] || LEVEL_COLOR.B1
  const categoryCfg = CATEGORY_MAP[item.category] || CATEGORY_MAP.GENERAL
  const statusBadge = STATUS_BADGE[item.status]    || STATUS_BADGE.published
  const questionCount = item.totalQuestions ?? (item.questions?.length || 0)

  return (
    <div
      onClick={() => !isTrash && onCardClick(item)}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md ${
        !isTrash ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Header: Category + Badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category badge */}
            <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${categoryCfg.bg}`}>
              {categoryCfg.label}
            </span>

            {/* CEFR Level badge */}
            <span
              className="inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-bold"
              style={{
                backgroundColor: levelStyle.bg,
                color: levelStyle.text,
                borderColor: levelStyle.border,
              }}
            >
              {item.cefrLevel}
            </span>
          </div>

          {/* Status or Trash badge */}
          {isTrash ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Đã xóa
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (canManage && onTogglePublish) onTogglePublish(item)
              }}
              disabled={!canManage}
              title={canManage ? 'Nhấp để đổi trạng thái xuất bản' : undefined}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-opacity ${statusBadge.bg} ${statusBadge.text} ${
                canManage ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.75rem] leading-snug">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
          {item.description || 'Chưa có phần giới thiệu chi tiết cho đề thi này.'}
        </p>

        {/* Key Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock size={14} className="text-brand-500 shrink-0" />
            <span className="truncate">
              Thời gian: <strong className="text-slate-900">{item.durationMinutes || 45}p</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <HelpCircle size={14} className="text-emerald-500 shrink-0" />
            <span className="truncate">
              Quy mô: <strong className="text-slate-900">{questionCount} câu</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Target size={14} className="text-purple-500 shrink-0" />
            <span className="truncate">
              Điểm sàn: <strong className="text-slate-900">{item.passingScore || 0}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span className="truncate">
              Thưởng: <strong className="text-amber-600">+{item.xpReward || 50} XP</strong>
            </span>
          </div>
        </div>

        {/* Sections pill info */}
        {Array.isArray(item.sections) && item.sections.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.sections.slice(0, 3).map((sec, i) => (
              <span key={i} className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {sec.title || sec.sectionName}
              </span>
            ))}
            {item.sections.length > 3 && (
              <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                +{item.sections.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Author/Date & Action buttons */}
      <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-700 truncate">
            {item.authorName || 'Quản trị viên'}
          </p>
          <p className="text-[10px] text-slate-400">
            {formatDate(item.createdAt)}
          </p>
        </div>

        {/* Action icons */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => onRestoreClick(item)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer border border-emerald-200"
                title="Khôi phục đề thi"
              >
                <RotateCcw size={13} />
                <span>Khôi phục</span>
              </button>
              <button
                type="button"
                onClick={() => onPermanentDeleteClick(item)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title="Xóa vĩnh viễn"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onCardClick(item)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                title="Xem chi tiết câu hỏi"
              >
                <Eye size={15} />
              </button>

              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => onDuplicate(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Nhân bản đề thi"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onEditClick(e, item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Chỉnh sửa đề thi"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteClick(e, item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Chuyển vào thùng rác"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
