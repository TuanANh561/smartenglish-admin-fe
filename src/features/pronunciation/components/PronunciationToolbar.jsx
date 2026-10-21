import Button from '@/components/ui/Button'
import { Plus, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react'
import { PRONUNCIATION_CATEGORIES } from '../pronunciationLessonApi'

const CEFR_LEVELS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
]

export default function PronunciationToolbar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  trashView = false,
  onToggleTrash,
  trashCount = 0,
  onOpenCreate,
  onReload,
  onRefresh,
}) {
  const handleReload = onReload || onRefresh

  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm kiếm bài học phát âm, âm IPA...'}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          {PRONUNCIATION_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'Tất cả phân loại' ? 'Phân loại: Tất cả' : cat}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          {CEFR_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl === 'Tất cả' ? 'Cấp độ: Tất cả' : lvl}
            </option>
          ))}
        </select>

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

        {handleReload && (
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            onClick={handleReload}
            title="Tải lại danh sách"
          />
        )}

        {/* Thêm bài phát âm (Icon-only) */}
        {!trashView && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Thêm bài phát âm mới"
            aria-label="Thêm bài phát âm mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* Nút thùng rác ở cuối row chứa thanh tìm kiếm, sau nút "Thêm", chỉ là nút có icon ko cần text */}
        <button
          type="button"
          onClick={() => onToggleTrash?.(!trashView)}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border ${
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
          title={trashView ? 'Quay lại danh sách phát âm' : `Thùng rác (${trashCount || 0})`}
          aria-label={trashView ? 'Quay lại danh sách phát âm' : `Thùng rác (${trashCount || 0})`}
        >
          {trashView ? (
            <RotateCcw size={16} />
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
      </div>
    </div>
  )
}
