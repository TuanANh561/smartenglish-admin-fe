import { ArchiveRestore, BookOpen, Trash2, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import {
  confidenceTone,
  STATUS_BADGE,
  TYPE_ICON,
  TYPE_LABELS,
} from './aiContentConstants'

export default function AiContentCard({
  item,
  canManage,
  showTrash,
  onClick,
  onApprove,
  onReject,
  onSoftDelete,
  onRestore,
}) {
  const Icon = TYPE_ICON[item.type] || BookOpen
  const statusMeta = STATUS_BADGE[item.status]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group cursor-pointer rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
    >
      {/* Card content — fixed height */}
      <div className="flex h-[260px] flex-col p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <Icon size={17} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-navy-700">{item.title}</h3>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                {TYPE_LABELS[item.type] || 'Nội dung AI'} · {item.level}
              </p>
            </div>
          </div>
          {statusMeta && (
            <Badge tone={statusMeta.tone} className="shrink-0 text-[10px]">
              {statusMeta.label}
            </Badge>
          )}
        </div>

        {/* Content preview — truncated */}
        <div className="mt-3 flex-1 overflow-hidden">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Nội dung
          </p>
          <p className="mt-1 line-clamp-5 text-xs leading-relaxed text-ink">
            {item.content || item.definition || '—'}
          </p>
        </div>

        {/* Footer meta */}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center gap-3 text-[10px] text-ink-muted">
            {item.questions?.length > 0 && (
              <span>{item.questions.length} câu hỏi</span>
            )}
            <Badge tone={confidenceTone(item.confidenceScore ?? 92)} className="text-[10px]">
              {item.confidenceScore ?? 92}%
            </Badge>
          </div>
          {canManage && !showTrash && item.status !== 'DELETED' && (
            <div className="flex items-center gap-1.5">
              {item.status === 'PENDING_REVIEW' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApprove(item.id)
                  }}
                  className="rounded-md bg-navy-700 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-navy-800 cursor-pointer"
                >
                  Duyệt
                </button>
              )}
              {item.status === 'PENDING_REVIEW' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReject(item.id)
                  }}
                  className="rounded-md border border-line bg-white p-1 text-ink-muted transition-colors hover:border-red-300 hover:text-red-500 cursor-pointer"
                  aria-label="Từ chối"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSoftDelete(item.id)
                }}
                className="rounded-md border border-red-200 bg-red-50 p-1 text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
                aria-label="Xóa mềm"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
          {showTrash && canManage && item.status === 'DELETED' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRestore(item.id)
              }}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
            >
              <ArchiveRestore size={12} />
              Khôi phục
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
