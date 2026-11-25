import { BookOpen, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Khung "chưa có dữ liệu" dùng chung cho các trang học liệu, để mọi trang hiển thị giống nhau.
 * Chỉ khác nhau ở tên loại học liệu và nút bấm.
 *
 * mode: 'trash' | 'search' | 'mine' | 'empty'
 */
function MaterialEmptyState({ label, mode = 'empty', onCreate, onBack, createLabel }) {
  const content = {
    trash: {
      icon: Trash2,
      title: 'Thùng rác trống',
      description: `Chưa có ${label} nào trong thùng rác.`,
    },
    search: {
      icon: Search,
      title: `Không tìm thấy ${label} phù hợp`,
      description: 'Thử đổi từ khoá hoặc bộ lọc.',
    },
    mine: {
      icon: BookOpen,
      title: `Bạn chưa có ${label} nào`,
      description: `${capitalize(label)} bạn tạo sẽ hiện ở đây sau khi được quản trị viên duyệt.`,
    },
    empty: {
      icon: BookOpen,
      title: `Chưa có ${label} nào`,
      description: `Bấm "${createLabel || `Thêm ${label}`}" để tạo ${label} đầu tiên.`,
    },
  }[mode]
  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="mb-1 text-sm font-bold text-slate-800">{content.title}</h3>
      <p className="mb-4 max-w-md text-xs text-slate-500">{content.description}</p>
      {mode === 'trash' && onBack ? (
        <Button size="sm" variant="secondary" icon={RotateCcw} onClick={onBack}>
          Quay lại danh sách
        </Button>
      ) : mode !== 'search' && onCreate ? (
        <Button size="sm" variant="primary" icon={Plus} onClick={onCreate}>
          {createLabel || `Thêm ${label}`}
        </Button>
      ) : null}
    </div>
  )
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Chọn kiểu khung trống theo trạng thái trang. */
export function emptyMode({ trash, search, filtered, mine }) {
  if (trash) return 'trash'
  if (search || filtered) return 'search'
  if (mine) return 'mine'
  return 'empty'
}

export default MaterialEmptyState
