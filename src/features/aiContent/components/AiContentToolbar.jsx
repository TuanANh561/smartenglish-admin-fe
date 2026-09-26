import { CheckCheck, Plus, Search, Trash2 } from 'lucide-react'
import { STATUS_FILTERS, TABS } from './aiContentConstants'

export default function AiContentToolbar({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onOpenCreationModal,
  onBulkApprove,
  showTrash,
  setShowTrash,
  trashCount,
}) {
  return (
    <div className="space-y-3">
      {/* ─── Tabs Navigation (Clean border-b style) ─── */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── 1 Single Clean Row: Search + Status Filter + Actions ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs">
        {/* Left: Search input + Status Dropdown in 1 tight cluster */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-xl">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm theo chủ đề, tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs focus:outline-none cursor-pointer shrink-0"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreationModal}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Tạo nội dung AI</span>
          </button>

          <button
            type="button"
            onClick={onBulkApprove}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Duyệt tất cả nội dung trong tab này"
          >
            <CheckCheck size={15} className="text-emerald-600" />
            <span>Duyệt tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrash((value) => !value)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showTrash
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
            }`}
          >
            <Trash2 size={14} className={showTrash ? 'text-red-600' : 'text-slate-500'} />
            <span>{showTrash ? 'Đóng thùng rác' : 'Thùng rác'}</span>
            {trashCount > 0 && (
              <span className="ml-0.5 rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                {trashCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
