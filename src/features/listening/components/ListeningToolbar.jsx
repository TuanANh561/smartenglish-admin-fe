import Button from '@/components/ui/Button'
import { ArrowLeft, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LISTENING_TOPICS, LISTENING_CATEGORIES, LISTENING_ACCENTS } from '../listeningConstants'

export default function ListeningToolbar({
  search,
  setSearch,
  setPage,
  ownershipFilter,
  setOwnershipFilter,
  category,
  setCategory,
  topic,
  setTopic,
  accent = 'all',
  setAccent,
  trashView,
  setTrashView,
  trashCount,
  totalLessons,
  myLessonsCount,
  isTeacher,
  onOpenCreate,
  onReload,
}) {
  const hasFilters = Boolean(
    search.trim() ||
    category !== 'all' ||
    ownershipFilter !== 'all' ||
    topic !== 'all' ||
    (accent && accent !== 'all')
  )

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setOwnershipFilter('all')
    setTopic('all')
    if (setAccent) setAccent('all')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
      {/* Ô tìm kiếm không viền (borderless) chuẩn Benchmark */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-xs">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder={trashView ? 'Tìm trong thùng rác...' : 'Tìm kiếm bài học, chủ đề...'}
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Lọc Dạng bài / TOEIC Part */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer h-9"
        >
          {LISTENING_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Lọc Nguồn học liệu */}
        <select
          value={ownershipFilter}
          onChange={(e) => {
            setOwnershipFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer h-9"
        >
          <option value="all">Nguồn: Tất cả ({totalLessons})</option>
          <option value="mine">Của tôi ({myLessonsCount})</option>
          <option value="system">SmartEnglish</option>
          {isTeacher && <option value="others">Giáo viên khác</option>}
        </select>

        {/* Lọc Chủ đề */}
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer h-9"
        >
          <option value="all">Chủ đề: Tất cả</option>
          {LISTENING_TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Lọc Giọng đọc / Accent */}
        {setAccent && (
          <select
            value={accent}
            onChange={(e) => {
              setAccent(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer h-9"
          >
            <option value="all">Giọng: Tất cả</option>
            {LISTENING_ACCENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}

        {/* Nút Xóa bộ lọc nếu có */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 transition-colors cursor-pointer"
          >
            Xoá lọc
          </button>
        )}

        {/* Đường phân cách nhẹ giữa bộ lọc và nút thao tác */}
        <div className="hidden sm:block h-5 w-px bg-slate-200 mx-0.5" />

        {/* CỤM NÚT HÀNH ĐỘNG ICON-ONLY */}
        {/* Nút Tải lại danh sách */}
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

        {/* Nút Thùng rác (Icon-only) */}
        <button
          type="button"
          onClick={() => {
            setTrashView(!trashView)
            setPage(1)
          }}
          className={cn(
            'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border',
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200',
          )}
          title={trashView ? 'Quay lại danh sách bài nghe' : `Thùng rác (${trashCount || 0})`}
          aria-label={trashView ? 'Quay lại danh sách bài nghe' : `Thùng rác (${trashCount || 0})`}
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

        {/* Nút Thêm bài nghe (Icon-only) */}
        {!trashView && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Thêm bài nghe mới"
            aria-label="Thêm bài nghe mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
