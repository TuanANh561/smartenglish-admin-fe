import { Link } from 'react-router-dom'
import { LayoutGrid, List, Loader2, Plus, RefreshCw, Search, X } from 'lucide-react'
import Button from '@/components/ui/Button'

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
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-xs xl:max-w-sm">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên khóa học, mã môn, tác giả..."
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap">
          {/* Nguồn tác giả Dropdown (Gom từ tab vào dropdown) */}
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            {isTeacher ? (
              <>
                <option value="mine">Nguồn: Của tôi ({myCount})</option>
                <option value="system">Nguồn: Hệ thống ({systemCount})</option>
                <option value="all">Nguồn: Tất cả ({totalCount})</option>
              </>
            ) : (
              <>
                <option value="all">Nguồn: Tất cả ({totalCount})</option>
                <option value="system">Nguồn: Hệ thống ({systemCount})</option>
                <option value="mine">Nguồn: Của tôi ({myCount})</option>
              </>
            )}
          </select>

          {/* Thể loại */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer max-w-[140px]"
          >
            <option value="all">Thể loại: Tất cả</option>
            <option value="Giao tiếp">Giao tiếp</option>
            <option value="Công sở">Công sở</option>
            <option value="Luyện thi">Luyện thi</option>
            <option value="Du lịch">Du lịch</option>
            <option value="Học thuật">Học thuật</option>
          </select>

          {/* Cấp độ CEFR */}
          <select
            value={cefrFilter}
            onChange={(e) => setCefrFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">Cấp độ: Tất cả</option>
            <option value="A1">Cấp độ A1</option>
            <option value="A2">Cấp độ A2</option>
            <option value="B1">Cấp độ B1</option>
            <option value="B2">Cấp độ B2</option>
            <option value="C1">Cấp độ C1</option>
            <option value="C2">Cấp độ C2</option>
          </select>

          {/* Trạng thái xuất bản */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>

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

          {/* Nút Tạo khóa học mới */}
          <Link to="/app/hoc-lieu/khoa-hoc/tao-moi">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Tạo khóa học</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
