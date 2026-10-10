import { ArrowLeft, LayoutGrid, LayoutList, Plus, RefreshCw, Search, ShieldCheck, Sparkles, Trash2, Upload, User, Zap } from 'lucide-react'
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
  onSeedToeic200,
  isSeeding = false,
  onReload,
  viewMode = 'list',
  onViewModeChange,
  authorFilter = 'all',
  onAuthorFilterChange,
  totalExamsCount = 0,
  systemCount = 0,
  myCount = 0,
  isTeacher = false,
}) {
  const sourceFilters = isTeacher
    ? [
        { value: 'mine', label: `Của tôi (${myCount})`, icon: User },
        { value: 'system', label: `Hệ thống (${systemCount})`, icon: ShieldCheck },
        { value: 'all', label: `Tất cả (${totalExamsCount})`, icon: null },
      ]
    : [
        { value: 'all', label: `Tất cả (${totalExamsCount})`, icon: null },
        { value: 'system', label: `Hệ thống (${systemCount})`, icon: ShieldCheck },
        { value: 'mine', label: `Của tôi (${myCount})`, icon: User },
      ]

  const sourceFilterClass = (value) => {
    if (authorFilter === value) {
      if (value === 'mine') return 'bg-brand-600 text-white shadow-2xs'
      if (value === 'system') return 'bg-blue-600 text-white shadow-2xs'
      return 'bg-slate-900 text-white shadow-2xs'
    }
    if (value === 'mine') return 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/60'
    if (value === 'system') return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
    return 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
  }

  return (
    <div className="border-b border-slate-100">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4">
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
                Nhập đề thi
              </Button>
            )}

            {/* Thêm đề thi (Icon-only) */}
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Thêm đề thi mới"
              aria-label="Thêm đề thi mới"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Thùng rác (Icon-only) */}
        <button
          type="button"
          onClick={() => onToggleTrash(!trashView)}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border shrink-0 ${
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
          title={trashView ? 'Quay lại danh sách bài thi đang hoạt động' : `Thùng rác (${trashCount || 0})`}
          aria-label={trashView ? 'Quay lại danh sách bài thi đang hoạt động' : `Thùng rác (${trashCount || 0})`}
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
      </div>
      </div>

      {/* Hàng phân loại nguồn đề thi: Tất cả | Hệ thống | Của tôi */}
      {!trashView && onAuthorFilterChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-50/70 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-500" />
              Nguồn đề thi:
            </span>
            {sourceFilters.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onAuthorFilterChange(value)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${sourceFilterClass(value)}`}
              >
                {Icon && <Icon size={13} />}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {authorFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onAuthorFilterChange('all')}
              className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold cursor-pointer hover:underline"
            >
              Đặt lại nguồn &times;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
