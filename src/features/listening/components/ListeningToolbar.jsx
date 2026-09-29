import Button from '@/components/ui/Button'
import { ArrowLeft, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LISTENING_TOPICS } from '@/mocks/data/listening'

export const LISTENING_CATEGORIES = [
  { value: 'all', label: 'Tất cả dạng bài' },
  { value: 'TOEIC_PART_1', label: 'Part 1 (Mô tả tranh)' },
  { value: 'TOEIC_PART_2', label: 'Part 2 (Hỏi & Đáp)' },
  { value: 'TOEIC_PART_3', label: 'Part 3 (Đoạn hội thoại)' },
  { value: 'TOEIC_PART_4', label: 'Part 4 (Bài nói ngắn)' },
  { value: 'CONVERSATION', label: 'Hội thoại giao tiếp' },
  { value: 'SHORT_TALK', label: 'Bài nói theo chủ đề' },
  { value: 'NEWS_PODCAST', label: 'Tin tức & Podcast' },
  { value: 'DICTATION', label: 'Chép chính tả' },
]

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
  trashView,
  setTrashView,
  trashCount,
  totalLessons,
  myLessonsCount,
  isTeacher,
  onOpenCreate,
  onReload,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Ô tìm kiếm không viền (borderless) chuẩn Benchmark */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm kiếm bài học, chủ đề, kịch bản...'}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Cụm bộ lọc và nút hành động trên cùng 1 hàng */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Lọc Dạng bài / TOEIC Part */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          {LISTENING_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Lọc Nguồn học liệu (chỉ ghi Nguồn: ở mục Tất cả, các mục sau không lặp lại) */}
        <select
          value={ownershipFilter}
          onChange={(e) => {
            setOwnershipFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="all">Nguồn: Tất cả ({totalLessons})</option>
          <option value="mine">Của tôi ({myLessonsCount})</option>
          <option value="system">SmartEnglish</option>
          {isTeacher && <option value="others">Giáo viên khác</option>}
        </select>

        {/* Lọc Chủ đề (chỉ ghi Chủ đề: ở mục Tất cả, các mục sau không lặp lại) */}
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="all">Chủ đề: Tất cả</option>
          {LISTENING_TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Nút Tải lại danh sách */}
        {onReload && (
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            onClick={onReload}
            title="Tải lại danh sách"
          />
        )}


        {/* Nút Thêm bài nghe */}
        {!trashView && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Thêm bài nghe</span>
          </button>
        )}

        {/* Nút Thùng rác - Ở cuối kế bên nút Thêm */}
        <button
          type="button"
          onClick={() => {
            setTrashView(!trashView)
            setPage(1)
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors shadow-2xs cursor-pointer border',
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200',
          )}
          title={trashView ? 'Quay lại danh sách bài nghe đang hoạt động' : 'Xem các bài nghe trong thùng rác'}
        >
          {trashView ? (
            <>
              <ArrowLeft size={14} />
              <span>Quay lại</span>
            </>
          ) : (
            <>
              <Trash2 size={14} className="text-slate-400 group-hover:text-red-500" />
              <span>Thùng rác</span>
              {trashCount > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
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
