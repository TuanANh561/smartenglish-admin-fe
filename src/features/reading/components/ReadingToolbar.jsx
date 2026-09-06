import Button from '@/components/ui/Button'
import { LEVEL_GROUPS } from '../levels'
import { Plus, Search, Upload } from 'lucide-react'

export default function ReadingToolbar({
  search,
  onSearchChange,
  ownershipFilter,
  onOwnershipChange,
  levelGroup,
  onLevelChange,
  totalCount,
  myReadingsCount,
  isTeacher,
  onOpenCreate,
  onOpenPdfImport,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tiêu đề, chủ đề, từ khóa..."
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Filters & Add Button */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Học liệu */}
        <select
          value={ownershipFilter}
          onChange={(e) => onOwnershipChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="all">Học liệu: Tất cả ({totalCount})</option>
          <option value="mine">Học liệu: Của tôi ({myReadingsCount})</option>
          <option value="system">Học liệu: Hệ thống SmartEnglish</option>
          {isTeacher && <option value="others">Học liệu: Giáo viên khác</option>}
        </select>

        {/* Cấp độ */}
        <select
          value={levelGroup}
          onChange={(e) => onLevelChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          {LEVEL_GROUPS.map((group) => (
            <option key={group.key} value={group.key}>
              {group.key === 'all' ? 'Cấp độ: Tất cả' : `Cấp độ: ${group.label}`}
            </option>
          ))}
        </select>

        {/* Nút Import */}
        <Button size="sm" variant="secondary" icon={Upload} onClick={onOpenPdfImport}>
          Import
        </Button>

        {/* Nút thêm mới */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm bài đọc</span>
        </button>
      </div>
    </div>
  )
}
