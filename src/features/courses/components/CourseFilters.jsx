import { Link } from 'react-router-dom'
import { LayoutGrid, List, Loader2, Plus, RefreshCw, Search, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

/**
 * Bộ lọc tìm kiếm và phân loại khóa học
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
  myCount,
  totalCount,
}) {
  const hasActiveFilters =
    search ||
    categoryFilter !== 'all' ||
    cefrFilter !== 'all' ||
    statusFilter !== 'all' ||
    (isTeacher && authorFilter !== 'mine') ||
    (!isTeacher && authorFilter !== 'all')

  const handleResetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setCefrFilter('all')
    setStatusFilter('all')
    setAuthorFilter(isTeacher ? 'mine' : 'all')
  }

  return (
    <Card className="p-4 space-y-3.5 border border-line">
      {/* Top row: Title and utility buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Bộ Lọc & Tìm Kiếm
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 transition-colors"
            >
              <X size={12} /> Đặt lại bộ lọc
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Switch View Mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-line">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-navy-800 shadow-xs'
                  : 'text-ink-muted hover:text-navy-800'
              }`}
              title="Dạng bảng chi tiết"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-navy-800 shadow-xs'
                  : 'text-ink-muted hover:text-navy-800'
              }`}
              title="Dạng thẻ lưới"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Refresh button */}
          <Button
            size="sm"
            variant="secondary"
            icon={isLoading ? Loader2 : RefreshCw}
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs"
          >
            Làm mới
          </Button>

          {/* Create Course button */}
          <Link to="/app/hoc-lieu/khoa-hoc/tao-moi">
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              className="text-xs shadow-xs"
            >
              Tạo khóa học mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="sm:col-span-2 md:col-span-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên chương, mã môn..."
            icon={Search}
            className="w-full text-xs"
          />
        </div>

        {/* Course Type / Category */}
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs"
        >
          <option value="all">Tất cả thể loại</option>
          <option value="Giao tiếp">Giao tiếp & Đời sống</option>
          <option value="Công sở">Công sở & Thương mại</option>
          <option value="Luyện thi">Luyện thi chứng chỉ</option>
          <option value="Du lịch">Du lịch & Khám phá</option>
          <option value="Học thuật">Học thuật & Tranh luận</option>
        </Select>

        {/* CEFR Level */}
        <Select
          value={cefrFilter}
          onChange={(e) => setCefrFilter(e.target.value)}
          className="text-xs"
        >
          <option value="all">Cấp độ CEFR (Tất cả)</option>
          <option value="A1">A1 - Sơ cấp</option>
          <option value="A2">A2 - Tiền trung cấp</option>
          <option value="B1">B1 - Trung cấp</option>
          <option value="B2">B2 - Trung cao cấp</option>
          <option value="C1">C1 - Cao cấp</option>
          <option value="C2">C2 - Thành thạo</option>
        </Select>

        {/* Publish Status */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs"
        >
          <option value="all">Trạng thái (Tất cả)</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </Select>
      </div>

      {/* Author Filter Tabs */}
      <div className="flex items-center gap-2 pt-1 border-t border-line/60">
        <span className="text-xs text-ink-muted mr-1">Phân loại tác giả:</span>
        <button
          onClick={() => setAuthorFilter('all')}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            authorFilter === 'all'
              ? 'bg-navy-700 text-white shadow-xs'
              : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
          }`}
        >
          Tất cả ({totalCount})
        </button>
        <button
          onClick={() => setAuthorFilter('system')}
          className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
            authorFilter === 'system'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Hệ thống
        </button>
        {isTeacher && (
          <button
            onClick={() => setAuthorFilter('mine')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
              authorFilter === 'mine'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Của tôi ({myCount})
          </button>
        )}
      </div>
    </Card>
  )
}
