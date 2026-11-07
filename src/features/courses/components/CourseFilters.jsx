import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutGrid, List, Loader2, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

/**
 * Thanh công cụ tìm kiếm và bộ lọc khóa học (1 hàng duy nhất gọn gàng, đồng bộ)
 */
export default function CourseFilters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  cefrFilter,
  setCefrFilter,
  statusFilter,
  setStatusFilter,
  authorFilter,
  setAuthorFilter,
  viewMode,
  setViewMode,
  isLoading,
  onRefresh,
  isTeacher,
  myCount = 0,
  systemCount = 0,
  totalCount = 0,
  trashView = false,
  onToggleTrash,
  trashCount = 0,
}) {
  const hasActiveFilters =
    search ||
    categoryFilter !== 'all' ||
    cefrFilter !== 'all' ||
    statusFilter !== 'all' ||
    authorFilter !== 'all'

  const handleResetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setCefrFilter('all')
    setStatusFilter('all')
    setAuthorFilter(isTeacher ? 'mine' : 'all')
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs px-5 py-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Ô tìm kiếm không viền gọn gàng */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[220px] max-w-md xl:max-w-lg">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm tên khóa học, mã môn, tác giả...'}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap">
          {/* Nguồn tác giả Dropdown (Gom từ tab vào dropdown) */}
          {isTeacher ? (
            <Select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              size="sm"
              containerClassName="w-[170px] shrink-0"
              options={[
                { value: 'mine', label: `Nguồn: Của tôi (${myCount})` },
                { value: 'system', label: `Nguồn: Hệ thống (${systemCount})` },
                { value: 'all', label: `Nguồn: Tất cả (${totalCount})` },
              ]}
            />
          ) : (
            <Select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              size="sm"
              containerClassName="w-[170px] shrink-0"
              options={[
                { value: 'all', label: `Nguồn: Tất cả (${totalCount})` },
                { value: 'system', label: `Nguồn: Hệ thống (${systemCount})` },
                { value: 'mine', label: `Nguồn: Của tôi (${myCount})` },
              ]}
            />
          )}

          {/* Thể loại */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            size="sm"
            containerClassName="w-[160px] shrink-0"
            options={[
              { value: 'all', label: 'Thể loại: Tất cả' },
              { value: 'Giao tiếp', label: 'Giao tiếp' },
              { value: 'Công sở', label: 'Công sở' },
              { value: 'Luyện thi', label: 'Luyện thi' },
              { value: 'Du lịch', label: 'Du lịch' },
              { value: 'Học thuật', label: 'Học thuật' },
            ]}
          />

          {/* Cấp độ CEFR */}
          <Select
            value={cefrFilter}
            onChange={(e) => setCefrFilter(e.target.value)}
            size="sm"
            containerClassName="w-[145px] shrink-0"
            options={[
              { value: 'all', label: 'Cấp độ: Tất cả' },
              { value: 'A1', label: 'Cấp độ A1' },
              { value: 'A2', label: 'Cấp độ A2' },
              { value: 'B1', label: 'Cấp độ B1' },
              { value: 'B2', label: 'Cấp độ B2' },
              { value: 'C1', label: 'Cấp độ C1' },
              { value: 'C2', label: 'Cấp độ C2' },
            ]}
          />

          {/* Trạng thái xuất bản - Chỉ hiện khi không ở thùng rác */}
          {!trashView && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="sm"
              containerClassName="w-[155px] shrink-0"
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'published', label: 'Đã xuất bản' },
                { value: 'draft', label: 'Bản nháp' },
              ]}
            />
          )}

          {/* Chuyển đổi hiển thị: List (Bảng) / Grid (Thẻ) */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-navy-800 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Dạng bảng chi tiết"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-navy-800 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Dạng thẻ lưới"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Nút tải lại */}
          <Button
            size="sm"
            variant="secondary"
            icon={isLoading ? Loader2 : RefreshCw}
            onClick={onRefresh}
            disabled={isLoading}
            title="Tải lại danh sách"
          />

          {/* Nút đặt lại bộ lọc */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <X size={13} />
              <span className="hidden xl:inline">Đặt lại</span>
            </button>
          )}

          {/* Nút Tạo khóa học mới (Icon-only) */}
          {!trashView && (
            <Link to="/app/hoc-lieu/khoa-hoc/tao-moi">
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white transition-all shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                title="Tạo khóa học mới"
                aria-label="Tạo khóa học mới"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </Link>
          )}

          {/* Nút Thùng rác (Icon-only, ở cuối row) */}
          <button
            type="button"
            onClick={() => onToggleTrash && onToggleTrash(!trashView)}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border shrink-0 ${
              trashView
                ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            }`}
            title={trashView ? 'Quay lại danh sách khóa học' : `Thùng rác (${trashCount || 0})`}
            aria-label={trashView ? 'Quay lại danh sách khóa học' : `Thùng rác (${trashCount || 0})`}
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
    </div>
  )
}
