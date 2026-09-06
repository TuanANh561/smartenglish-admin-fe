import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowUpDown,
  BookOpen,
  Building2,
  CheckSquare,
  Clock,
  Eye,
  GraduationCap,
  HelpCircle,
  Lock,
  Pencil,
  PenLine,
  Share2,
  Shuffle,
  Trash2,
  User,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { SHORT_TEST_TYPE_META } from '@/mocks/data/shortTests'

export const QUESTION_TYPE_META = {
  multiple_choice: { label: 'Trắc nghiệm', Icon: CheckSquare },
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
    if (!currentUser || !row) return false
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
    if (!currentUser || !row) return false
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
        const Icon = meta.Icon
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink">
            <Icon size={14} strokeWidth={1.75} className="text-brand-500 shrink-0" />
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
          return (
            <Badge tone="success" className="inline-flex items-center gap-1">
              <User size={12} strokeWidth={2} />
              Của tôi
            </Badge>
          )
        }
        if (isSystem) {
          return (
            <Badge tone="neutral" className="inline-flex items-center gap-1">
              <Building2 size={12} strokeWidth={2} />
              Hệ thống
            </Badge>
          )
        }
        return (
          <Badge tone="warning" className="inline-flex items-center gap-1">
            <GraduationCap size={12} strokeWidth={2} />
            {author}
          </Badge>
        )
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

export function buildShortTestColumns({ onView, onEdit, onDelete, onAssign, currentUser }) {
  const isTeacher = currentUser?.role === 'teacher'
  const isAdmin = currentUser?.role === 'admin'

  const checkOwnership = (row) => {
    if (!currentUser || !row) return false
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
    if (!currentUser || !row) return false
    if (isAdmin) return true
    return checkOwnership(row)
  }

  return [
    columnHelper.accessor('title', {
      header: 'Tiêu đề bài test & Đoạn văn',
      cell: (info) => {
        const row = info.row.original
        const title = row.title || 'Bài test ngắn'
        const snippet = row.passage ? row.passage.replace(/\s+/g, ' ').slice(0, 80) + '…' : ''
        return (
          <div className="py-1 min-w-[260px]">
            <div className="flex items-center gap-2">
              <span className="text-ink font-semibold text-sm hover:text-brand-600 transition-colors cursor-pointer">
                {title}
              </span>
            </div>
            {snippet && (
              <p className="line-clamp-1 text-xs text-ink-muted mt-0.5 max-w-[420px]">
                {snippet}
              </p>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('testTypeLabel', {
      header: 'Dạng bài test',
      cell: (info) => {
        const row = info.row.original
        const meta = SHORT_TEST_TYPE_META[row.testType] || { label: info.getValue() || 'Test ngắn', tone: 'info' }
        return (
          <Badge tone={meta.tone} className="whitespace-nowrap font-medium">
            {meta.label}
          </Badge>
        )
      },
    }),
    columnHelper.accessor((row) => (row.questions ? row.questions.length : 0), {
      id: 'questionCount',
      header: 'Số câu',
      cell: (info) => (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
          <HelpCircle size={12} className="text-slate-500" />
          {info.getValue()} câu
        </span>
      ),
    }),
    columnHelper.accessor('level', {
      header: 'CEFR',
      cell: (info) => (
        <Badge tone="info" className="font-bold">
          {info.getValue() || 'B2'}
        </Badge>
      ),
    }),
    columnHelper.accessor('durationMinutes', {
      header: 'Thời lượng',
      cell: (info) => (
        <span className="text-xs text-ink-muted whitespace-nowrap inline-flex items-center gap-1">
          <Clock size={12} className="text-slate-400" />
          {info.getValue() || 5} phút
        </span>
      ),
    }),
    columnHelper.accessor('authorName', {
      header: 'Tác giả',
      cell: (info) => {
        const author = info.getValue() || 'Hệ thống'
        const isOwned = checkOwnership(info.row.original)
        const isSystem =
          author.includes('Hệ thống') || info.row.original.authorEmail === 'system@smartenglish.vn'

        if (isTeacher && isOwned) {
          return (
            <Badge tone="success" className="inline-flex items-center gap-1">
              <User size={12} strokeWidth={2} />
              Của tôi
            </Badge>
          )
        }
        if (isSystem) {
          return (
            <Badge tone="neutral" className="inline-flex items-center gap-1">
              <Building2 size={12} strokeWidth={2} />
              Hệ thống
            </Badge>
          )
        }
        return (
          <Badge tone="warning" className="inline-flex items-center gap-1">
            <GraduationCap size={12} strokeWidth={2} />
            {author}
          </Badge>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: (info) => {
        const manageable = canManage(info.row.original)

        return (
          <div className="flex items-center gap-1 text-ink-muted">
            <button
              type="button"
              aria-label="Xem chi tiết"
              onClick={(event) => {
                event.stopPropagation()
                onView(info.row.original)
              }}
              className="hover:text-brand-500 p-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
              title="Xem bài test ngắn"
            >
              <Eye size={16} strokeWidth={1.75} />
            </button>

            {onAssign && (
              <button
                type="button"
                aria-label="Giao bài"
                onClick={(event) => {
                  event.stopPropagation()
                  onAssign(info.row.original)
                }}
                className="hover:text-brand-500 p-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                title="Giao bài test cho lớp"
              >
                <Share2 size={16} strokeWidth={1.75} />
              </button>
            )}

            {manageable ? (
              <>
                <button
                  type="button"
                  aria-label="Sửa bài test"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(info.row.original)
                  }}
                  className="hover:text-brand-500 p-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                  title="Sửa bài test"
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label="Xoá bài test"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(info.row.original)
                  }}
                  className="hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Xoá bài test"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <span
                className="text-[10px] text-ink-muted italic flex items-center gap-0.5 px-1"
                title="Chỉ xem (bài test của tác giả khác)"
              >
                <Lock size={11} />
              </span>
            )}
          </div>
        )
      },
    }),
  ]
}

