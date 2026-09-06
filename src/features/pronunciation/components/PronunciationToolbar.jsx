import { Plus, Search } from 'lucide-react'
import { PRONUNCIATION_CATEGORIES } from '@/mocks/data/pronunciation'

const CEFR_LEVELS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
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
  onOpenCreate,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm bài học phát âm, âm IPA..."
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
              {lvl === 'Tất cả' ? 'Cấp độ: Tất cả' : `Cấp độ ${lvl}`}
            </option>
          ))}
        </select>

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

        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm bài phát âm</span>
        </button>
      </div>
    </div>
  )
}
