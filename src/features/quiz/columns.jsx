import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, Eye, Pencil, PenLine, Shuffle, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export const QUESTION_TYPE_META = {
  multiple_choice: { label: 'Trắc nghiệm', dotClass: 'bg-brand-500' },
  fill_blank: { label: 'Điền từ', Icon: PenLine },
  matching: { label: 'Ghép nối', Icon: Shuffle },
  word_order: { label: 'Sắp xếp', Icon: ArrowUpDown },
}

const DIFFICULTY_META = {
  easy: { label: 'Dễ', tone: 'success' },
  medium: { label: 'Trung bình', tone: 'warning' },
  hard: { label: 'Khó', tone: 'danger' },
}

const SOURCE_META = {
  ai: { label: 'AI', tone: 'info' },
  manual: { label: 'Thủ công', tone: 'neutral' },
}

const columnHelper = createColumnHelper()

export function buildQuizColumns({ onView, onEdit, onDelete }) {
  return [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => <span className="font-mono text-xs text-ink-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor('questionType', {
      header: 'Dạng bài',
      cell: (info) => {
        const meta = QUESTION_TYPE_META[info.getValue()]
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink">
            {meta.dotClass ? (
              <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
            ) : (
              <meta.Icon size={14} strokeWidth={1.75} className="text-ink-muted" />
            )}
            {meta.label}
          </span>
        )
      },
    }),
    columnHelper.accessor('questionText', {
      header: 'Câu hỏi',
      cell: (info) => {
        const text = info.getValue()
        return (
          <span className="text-ink" title={text}>
            {text.length > 60 ? `${text.slice(0, 60)}…` : text}
          </span>
        )
      },
    }),
    columnHelper.accessor('relatedWord', {
      header: 'Từ vựng liên quan',
      cell: (info) => <Badge tone="neutral">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('cefrLevel', {
      header: 'CEFR',
      cell: (info) => <Badge tone="info">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('difficulty', {
      header: 'Độ khó',
      cell: (info) => {
        const meta = DIFFICULTY_META[info.getValue()]
        return <Badge tone={meta.tone}>{meta.label}</Badge>
      },
    }),
    columnHelper.accessor('source', {
      header: 'Nguồn',
      cell: (info) => {
        const meta = SOURCE_META[info.getValue()]
        return <Badge tone={meta.tone}>{meta.label}</Badge>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: (info) => (
        <div className="flex items-center gap-3 text-ink-muted">
          <button
            type="button"
            aria-label="Xem chi tiết"
            onClick={(event) => {
              event.stopPropagation()
              onView(info.row.original)
            }}
            className="hover:text-brand-500"
          >
            <Eye size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Sửa câu hỏi"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(info.row.original)
            }}
            className="hover:text-brand-500"
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Xoá câu hỏi"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(info.row.original)
            }}
            className="hover:text-[#B91C1C]"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      ),
    }),
  ]
}
