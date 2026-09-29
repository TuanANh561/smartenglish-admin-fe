import { ArrowLeft, LayoutGrid, LayoutList, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import { CEFR_LEVELS, EXAM_CATEGORIES } from '../examApi'

const STATUS_OPTIONS = [
  { value: 'all',       label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft' },
]

export default function ExamToolbar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  trashView,
  onToggleTrash,
  trashCount,
  onOpenCreate,
  onOpenImport,
  onReload,
  viewMode = 'list',
  onViewModeChange,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Ô tìm kiếm không viền (borderless) co giãn thông minh không chiếm quá nhiều chỗ */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-xs xl:max-w-sm">
        <Search size={17} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={trashView ? 'Tìm trong thùng rác...' : 'Tìm tên đề thi, thể loại, mô tả...'}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Cụm bộ lọc và nút hành động — 1 hàng duy nhất không bị rớt dòng */}
      <div className="flex items-center gap-2 shrink-0 flex-nowrap">
        {/* Thể loại đề thi */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer max-w-[150px]"
        >
          <option value="ALL">Thể loại: Tất cả</option>
          {EXAM_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Cấp độ CEFR */}
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="ALL">Cấp độ: Tất cả</option>
          {CEFR_LEVELS.filter((l) => l !== 'ALL').map((l) => (
            <option key={l} value={l}>Cấp độ {l}</option>
          ))}
        </select>

        {/* Trạng thái - Chỉ hiện khi không ở thùng rác */}
        {!trashView && (
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {/* View mode toggle: List / Grid */}
        {onViewModeChange && (
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-navy-800 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Chế độ hiển thị dạng Bảng (List view)"
            >
              <LayoutList size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-navy-800 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Chế độ hiển thị dạng Thẻ (Card grid view)"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        )}

        {/* Reload */}
        {onReload && (
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onReload} title="Tải lại" />
        )}

        {/* Import & Thêm mới - Chỉ hiện khi không ở thùng rác */}
        {!trashView && (
          <>
            {onOpenImport && (
              <Button size="sm" variant="secondary" icon={Upload} onClick={onOpenImport}>
                Import
              </Button>
            )}

            <button
              type="button"
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Thêm đề thi</span>
            </button>
          </>
        )}

        {/* Thùng rác - Ở cuối / chuyển sang Quay lại khi đang xem thùng rác */}
        <button
          type="button"
          onClick={() => onToggleTrash(!trashView)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors shadow-2xs cursor-pointer border shrink-0 ${
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
          title={trashView ? 'Quay lại danh sách bài thi đang hoạt động' : 'Xem các bài thi trong thùng rác'}
        >
          {trashView ? (
            <>
              <ArrowLeft size={14} />
              <span>Quay lại danh sách</span>
            </>
          ) : (
            <>
              <Trash2 size={14} className="text-slate-400 group-hover:text-red-500" />
              <span>Thùng rác</span>
              {trashCount > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
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
