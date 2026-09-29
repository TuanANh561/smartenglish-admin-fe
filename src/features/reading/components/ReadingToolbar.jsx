import { ArrowLeft, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all',       label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft' },
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

      {/* Cụm bộ lọc và nút hành động — 1 hàng duy nhất không bị rớt dòng */}
      <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
        {/* Chủ đề */}
        <select
          value={selectedTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="Tất cả chủ đề">Chủ đề: Tất cả</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
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
            <option key={l} value={l}>{l}</option>
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
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

          {/* Reload */}
          {onReload && (
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onReload} title="Tải lại" />
          )}

          {/* Import & Thêm mới - Chỉ hiện khi không ở thùng rác */}
          {!trashView && (
            <>
              <Button size="sm" variant="secondary" icon={Upload} onClick={onOpenPdfImport}>
                Import
              </Button>

              <button
                type="button"
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                Thêm bài đọc
              </button>
            </>
          )}

          {/* Thùng rác - Ở cuối / chuyển sang Quay lại khi đang xem thùng rác */}
          <button
            type="button"
            onClick={() => onToggleTrash(!trashView)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors shadow-2xs cursor-pointer border ${
              trashView
                ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            }`}
            title={trashView ? 'Quay lại danh sách bài đọc đang hoạt động' : 'Xem các bài đọc trong thùng rác'}
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
