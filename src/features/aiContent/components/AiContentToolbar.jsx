import Button from '@/components/ui/Button'
import { ArrowLeft, CheckCheck, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_FILTERS } from './aiContentConstants'

export default function AiContentToolbar({
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  authorFilter,
  setAuthorFilter,
  searchTerm,
  setSearchTerm,
  onOpenCreationModal,
  onBulkApprove,
  pendingCount = 0,
  onReload,
  showTrash,
  setShowTrash,
  trashCount,
  isGenerating,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* ─── 1 Single Clean Row: Search + Dropdown Filters + Actions (Chuẩn Benchmark) ─── */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4">
        {/* Left: Ô tìm kiếm không viền (borderless) */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder={showTrash ? 'Tìm kiếm trong thùng rác AI...' : 'Tìm kiếm theo chủ đề, tiêu đề hoặc nội dung...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Right: Bộ lọc dropdown & Các nút thao tác */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc Dạng bài / Loại nội dung */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">Dạng bài: Tất cả</option>
            <option value="reading">Bài đọc hiểu</option>
            <option value="quiz">Bài kiểm tra (Quiz)</option>
            <option value="toeic">TOEIC & Điền từ</option>
          </select>

          {/* Lọc Trạng thái kiểm duyệt */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.value === 'all' ? 'Trạng thái: Tất cả' : filter.label}
              </option>
            ))}
          </select>

          {/* Lọc Nguồn / Tác giả */}
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">Nguồn: Tất cả</option>
            <option value="mine">Của tôi</option>
            <option value="others">Tác giả khác</option>
          </select>

          {/* Nút Làm mới / Tải lại */}
          {onReload && (
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={onReload}
              title="Tải lại danh sách"
            />
          )}

          {/* Nút Duyệt tất cả (chỉ hiện khi có bài cần duyệt) */}
          {pendingCount > 0 && !showTrash && (
            <Button
              size="sm"
              variant="secondary"
              icon={CheckCheck}
              onClick={onBulkApprove}
              title="Duyệt tất cả nội dung đang chờ phê duyệt"
              className="text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
            >
              Duyệt tất cả ({pendingCount})
            </Button>
          )}

          {/* Nút Tạo nội dung AI (Icon-only) */}
          {!showTrash && (
            <button
              type="button"
              onClick={onOpenCreationModal}
              disabled={isGenerating}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              title="Tạo nội dung AI mới"
              aria-label="Tạo nội dung AI mới"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Nút Thùng rác (Icon-only) */}
          <button
            type="button"
            onClick={() => setShowTrash((value) => !value)}
            className={cn(
              'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border',
              showTrash
                ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200',
            )}
            title={showTrash ? 'Quay lại danh sách nội dung AI' : `Thùng rác (${trashCount || 0})`}
            aria-label={showTrash ? 'Quay lại danh sách nội dung AI' : `Thùng rác (${trashCount || 0})`}
          >
            {showTrash ? (
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
