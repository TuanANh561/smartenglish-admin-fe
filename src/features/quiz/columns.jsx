import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, Eye, Lock, Pencil, PenLine, Shuffle, Trash2 } from 'lucide-react'
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

const columnHelper = createColumnHelper()

export function buildQuizColumns({ onView, onEdit, onDelete, currentUser }) {
  const isTeacher = currentUser?.role === 'teacher'
  const isAdmin = currentUser?.role === 'admin'

  const checkOwnership = (row) => {
    if (!currentUser) return false
    if (isTeacher) {
      return (
        row.authorEmail === currentUser.email ||
        row.authorName === currentUser.displayName ||
        row.authorName === 'Hoàng Thị Mai'
      )
    }
    return (
      row.authorEmail === currentUser.email ||
      row.authorEmail === 'system@smartenglish.vn' ||
      row.authorName?.includes('Hệ thống') ||
      row.authorName?.includes('Quản trị')
    )
  }

  const canManage = (row) => {
    if (!currentUser) return false
    if (isAdmin) return true
    return checkOwnership(row)
  }

  return [
    columnHelper.accessor((row) => row.title || row.questionText || row.id, {
      id: 'title',
      header: 'Tiêu đề bài kiểm tra',
      cell: (info) => {
        const text = info.getValue() || 'Bài kiểm tra'
        return (
          <span className="text-ink font-medium" title={text}>
            {text.length > 55 ? `${text.slice(0, 55)}…` : text}
          </span>
        )
      },
    }),
    columnHelper.accessor('questionType', {
      header: 'Dạng bài',
      cell: (info) => {
        const meta = QUESTION_TYPE_META[info.getValue()] || QUESTION_TYPE_META.multiple_choice
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
      header: 'Mục tiêu',
      cell: (info) => {
        const text = info.getValue() || 'Bài kiểm tra'
        return (
          <span className="text-ink font-medium" title={text}>
            {text.length > 55 ? `${text.slice(0, 55)}…` : text}
          </span>
        )
      },
    }),
    columnHelper.accessor('authorName', {
      header: 'Tác giả',
      cell: (info) => {
        const author = info.getValue() || 'Hệ thống'
        const isOwned = checkOwnership(info.row.original)
        const isSystem = author.includes('Hệ thống') || info.row.original.authorEmail === 'system@smartenglish.vn'

        if (isTeacher && isOwned) {
          return <Badge tone="success">👤 Của tôi</Badge>
        }
        if (isSystem) {
          return <Badge tone="neutral">🏢 Hệ thống</Badge>
        }
        return <Badge tone="warning">👨‍🏫 {author}</Badge>
      },
    }),
    columnHelper.accessor('cefrLevel', {
      header: 'CEFR',
      cell: (info) => <Badge tone="info">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('difficulty', {
      header: 'Độ khó',
      cell: (info) => {
        const meta = DIFFICULTY_META[info.getValue()] || DIFFICULTY_META.medium
        return <Badge tone={meta.tone}>{meta.label}</Badge>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: (info) => {
        const manageable = canManage(info.row.original)

        return (
          <div className="flex items-center gap-2 text-ink-muted">
            <button
              type="button"
              aria-label="Xem chi tiết"
              onClick={(event) => {
                event.stopPropagation()
                onView(info.row.original)
              }}
              className="hover:text-brand-500 p-1"
              title="Xem chi tiết câu hỏi"
            >
              <Eye size={16} strokeWidth={1.75} />
            </button>

            {manageable ? (
              <>
                <button
                  type="button"
                  aria-label="Sửa câu hỏi"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(info.row.original)
                  }}
                  className="hover:text-brand-500 p-1"
                  title="Sửa câu hỏi"
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
                  className="hover:text-[#B91C1C] p-1"
                  title="Xoá câu hỏi"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <span
                className="text-[10px] text-ink-muted italic flex items-center gap-0.5 px-1"
                title="Chỉ tác giả mới có quyền chỉnh sửa câu hỏi này"
              >
                <Lock size={11} />
                (Chỉ xem)
              </span>
            )}
          </div>
        )
      },
    }),
  ]
}
