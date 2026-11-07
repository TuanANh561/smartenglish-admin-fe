import { Search, X, RefreshCw, Upload, Plus, Trash2, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { SORT_OPTIONS, PARTS_OF_SPEECH, PART_OF_SPEECH_LABEL } from '../hooks/useVocabulary'

/**
 * Thanh công cụ tìm kiếm, bộ lọc, thao tác thêm mới/import và chuyển đổi thùng rác.
 */
export function VocabToolbar({
  trashView,
  trashCount,
  searchInput,
  onSearchChange,
  onSearchClear,
  sortBy,
  onSortChange,
  partOfSpeech,
  onPartOfSpeechChange,
  topicId,
  onTopicChange,
  topics = [],
  onRefresh,
  onOpenImport,
  onOpenCreate,
  onToggleTrash,
}) {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder={trashView ? 'Tìm kiếm trong thùng rác...' : 'Tìm kiếm từ vựng...'}
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
        {searchInput && (
          <button
            type="button"
            onClick={onSearchClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Xóa tìm kiếm"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter and Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Sắp xếp */}
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          size="sm"
          containerClassName="w-36 shrink-0"
          options={SORT_OPTIONS}
        />

        {/* Từ loại */}
        <Select
          value={partOfSpeech}
          onChange={(e) => onPartOfSpeechChange(e.target.value)}
          size="sm"
          containerClassName="w-38 shrink-0"
          options={[
            { value: '', label: 'Từ loại: Tất cả' },
            ...PARTS_OF_SPEECH.map((pos) => ({
              value: pos,
              label: `${PART_OF_SPEECH_LABEL[pos] || pos} (${pos})`,
            })),
          ]}
        />

        {/* Chủ đề */}
        <Select
          value={topicId}
          onChange={(e) => onTopicChange(e.target.value)}
          size="sm"
          containerClassName="w-44 shrink-0"
          options={[
            { value: '', label: 'Chủ đề: Tất cả' },
            ...topics.map((top) => ({
              value: top.id,
              label: top.nameVi || top.nameEn,
            })),
          ]}
        />

        {/* Nút Tải lại danh sách */}
        <Button
          size="sm"
          variant="secondary"
          icon={RefreshCw}
          onClick={onRefresh}
          title="Tải lại danh sách"
        />

        {/* Nút Import (Chỉ hiển thị khi không ở thùng rác) */}
        {!trashView && (
          <Button size="sm" variant="secondary" icon={Upload} onClick={onOpenImport}>
            Import
          </Button>
        )}

        {/* Nút Thêm mới (Chỉ hiển thị khi không ở thùng rác) */}
        {!trashView && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Thêm từ mới"
            aria-label="Thêm từ mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* Nút Thùng rác (Icon-only với Badge số lượng, ở cuối row) */}
        <button
          type="button"
          onClick={onToggleTrash}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer border ${
            trashView
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
          title={trashView ? 'Quay lại kho từ vựng' : `Thùng rác (${trashCount || 0})`}
          aria-label={trashView ? 'Quay lại kho từ vựng' : `Thùng rác (${trashCount || 0})`}
        >
          {trashView ? (
            <RotateCcw size={16} />
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
  )
}

export default VocabToolbar

