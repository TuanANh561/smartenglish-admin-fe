import { ArrowLeft, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

export default function ReadingToolbar({
  search,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  topics,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  trashView,
  onToggleTrash,
  trashCount,
  onOpenCreate,
  onOpenPdfImport,
  onReload,
}) {
  const hasFilters = Boolean(
    search.trim() ||
    (selectedTopic && selectedTopic !== 'Tất cả chủ đề' && selectedTopic !== 'ALL') ||
    (selectedLevel && selectedLevel !== 'Tất cả' && selectedLevel !== 'ALL') ||
    (!trashView && selectedStatus && selectedStatus !== 'all')
  )

  const handleClearFilters = () => {
    onSearchChange('')
    onTopicChange('Tất cả chủ đề')
    onLevelChange('Tất cả')
    onStatusChange('all')
  }

  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Ô tìm kiếm không viền (borderless) chuẩn Benchmark */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm tiêu đề, chủ đề, nội dung...'}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Chủ đề */}
        <select
          value={selectedTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="Tất cả chủ đề">Chủ đề: Tất cả</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Cấp độ CEFR */}
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="Tất cả">Cấp độ: Tất cả</option>
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {/* Trạng thái - Chỉ hiện khi không ở thùng rác */}
        {!trashView && (
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Nút Xóa lọc nếu có */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1 transition-colors cursor-pointer"
          >
            Xoá lọc
          </button>
        )}

        {/* Nút Reload */}
        {onReload && (
          <button
            type="button"
            onClick={onReload}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs cursor-pointer hover:border-slate-300"
            title="Tải lại danh sách"
            aria-label="Tải lại danh sách"
          >
            <RefreshCw size={15} />
          </button>
        )}

        {/* Nút Import PDF */}
        {!trashView && onOpenPdfImport && (
          <button
            type="button"
            onClick={onOpenPdfImport}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs cursor-pointer hover:border-slate-300"
            title="Nhập bài đọc từ file PDF"
            aria-label="Nhập bài đọc từ file PDF"
          >
            <Upload size={15} />
          </button>
        )}

        {/* Thùng rác (Icon-only) */}
        <button
          type="button"
          onClick={() => onToggleTrash(!trashView)}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border ${
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
          title={trashView ? 'Quay lại danh sách bài đọc' : `Thùng rác (${trashCount || 0})`}
          aria-label={trashView ? 'Quay lại danh sách bài đọc' : `Thùng rác (${trashCount || 0})`}
        >
          {trashView ? (
            <ArrowLeft size={16} />
          ) : (
            <>
              <Trash2 size={16} />
              {trashCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {trashCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* Thêm bài đọc (Icon-only) */}
        {!trashView && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Thêm bài đọc mới"
            aria-label="Thêm bài đọc mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
