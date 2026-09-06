import { Plus, Search } from 'lucide-react'
import { LISTENING_ACCENTS, LISTENING_TOPICS } from '@/mocks/data/listening'

export default function ListeningToolbar({
  search,
  setSearch,
  setPage,
  ownershipFilter,
  setOwnershipFilter,
  topic,
  setTopic,
  accent,
  setAccent,
  totalLessons,
  myLessonsCount,
  isTeacher,
  onOpenCreate,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Tìm theo tên bài nghe, chủ đề, giọng đọc..."
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Filters & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Học liệu */}
        <select
          value={ownershipFilter}
          onChange={(e) => {
            setOwnershipFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="all">Học liệu: Tất cả ({totalLessons})</option>
          <option value="mine">Học liệu: Của tôi ({myLessonsCount})</option>
          <option value="system">Học liệu: Hệ thống SmartEnglish</option>
          {isTeacher && <option value="others">Học liệu: Giáo viên khác</option>}
        </select>

        {/* Chủ đề */}
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

        {/* Giọng đọc */}
        <select
          value={accent}
          onChange={(e) => {
            setAccent(e.target.value)
            setPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <option value="all">Giọng đọc: Tất cả</option>
          {LISTENING_ACCENTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Thêm bài nghe */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm bài nghe</span>
        </button>
      </div>
    </div>
  )
}
