import Select from '@/components/ui/Select'
import { useState, useMemo, useEffect } from 'react'
import {
  CheckCircle2, AlertTriangle, XCircle, Info, Trash2, Volume2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { speakWord, speakWithWebSpeech } from '@/lib/ipaHelper'

export default function ImportStepReview({
  parsedItems,
  filteredData,
  selectedIds,
  filterStatus,
  setFilterStatus,
  importType,
  onToggleSelectAll,
  onToggleSelectRow,
  onDeleteRow,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pagedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, safeCurrentPage, pageSize])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <FilterToolbar
        parsedItems={parsedItems}
        filteredData={filteredData}
        selectedIds={selectedIds}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onToggleSelectAll={onToggleSelectAll}
      />

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs table-fixed">
          <TableHead
            importType={importType}
            filteredData={filteredData}
            selectedIds={selectedIds}
            onToggleSelectAll={onToggleSelectAll}
          />
          <tbody className="divide-y divide-slate-100 bg-white">
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  Không có mục nào trong danh sách lọc này.
                </td>
              </tr>
            ) : (
              pagedData.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  importType={importType}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={() => !item.isDuplicate && item.statusVal !== 'error' && onToggleSelectRow(item.id)}
                  onDelete={() => onDeleteRow(item.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <div>
            Hiển thị <strong>{(safeCurrentPage - 1) * pageSize + 1}</strong> - <strong>{Math.min(safeCurrentPage * pageSize, filteredData.length)}</strong> trên tổng số <strong>{filteredData.length}</strong> từ
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <span className="font-semibold text-slate-700 px-1">
              Trang {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Sau <ChevronRight size={14} />
            </button>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              size="sm"
              containerClassName="ml-2 w-36 inline-block"
              options={[
                { value: 20, label: '20 từ / trang' },
                { value: 50, label: '50 từ / trang' },
                { value: 100, label: '100 từ / trang' },
                { value: 200, label: '200 từ / trang' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterToolbar({ parsedItems, filteredData, selectedIds, filterStatus, setFilterStatus, onToggleSelectAll }) {
  const countOf = (st) => parsedItems.filter((i) => i.statusVal === st || i.status === st).length
  const newValidCount = parsedItems.filter((i) => !i.isDuplicate && i.statusVal !== 'error').length

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-bold text-slate-700 shrink-0 mr-1">Lọc theo trạng thái:</span>

        <FilterBtn label={`Tất cả (${parsedItems.length})`} value="all" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-brand-600 text-white shadow-2xs" inactiveClass="bg-white text-slate-600 border border-slate-200 hover:bg-slate-100" />
        <FilterBtn label={`Hợp lệ (${countOf('valid')})`} value="valid" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-emerald-600 text-white" inactiveClass="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" />
        <FilterBtn label={`Khác từ loại (${countOf('info')})`} value="info" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-blue-600 text-white" inactiveClass="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" />
        <FilterBtn label={`Đã có trong kho từ (${countOf('warning')})`} value="warning" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-amber-600 text-white" inactiveClass="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" />
        {countOf('error') > 0 && (
          <FilterBtn label={`Cần sửa lỗi (${countOf('error')})`} value="error" current={filterStatus} onClick={setFilterStatus}
            activeClass="bg-red-600 text-white" inactiveClass="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" />
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSelectAll(true)}
            className="px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="Chọn tất cả từ mới không bị trùng lặp"
          >
            Chọn tất cả từ mới ({newValidCount})
          </button>
          <button
            type="button"
            onClick={() => onToggleSelectAll(false)}
            className="px-2 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="Bỏ chọn toàn bộ"
          >
            Bỏ chọn
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold pl-2 border-l border-slate-200 whitespace-nowrap shrink-0">
          Đã chọn: <strong className="text-brand-600">{selectedIds.size}</strong>/{parsedItems.length}
        </div>
      </div>
    </div>
  )
}

function FilterBtn({ label, value, current, onClick, activeClass, inactiveClass }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0',
        current === value ? activeClass : inactiveClass,
      )}
    >
      {label}
    </button>
  )
}

function TableHead({ importType, filteredData, selectedIds, onToggleSelectAll }) {
  const selectableRows = filteredData.filter((i) => !i.isDuplicate && i.statusVal !== 'error')
  const allSelected = selectableRows.length > 0 && selectableRows.every((item) => selectedIds.has(item.id))

  return (
    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
      <tr>
        <th className="p-3 w-10 text-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </th>
        {importType === 'vocabulary' && (
          <>
            <th className="p-3 w-[15%]">Từ vựng (Word)</th>
            <th className="p-3 w-[13%]">Phiên âm IPA</th>
            <th className="p-3 w-[16%]">Nghĩa tiếng Việt</th>
            <th className="p-3 w-[25%]">Ví dụ minh họa</th>
            <th className="p-3 w-[14%]">Chủ đề</th>
            <th className="p-3 w-[13%] text-center">Trạng thái</th>
            <th className="p-3 w-14 text-center">Xóa</th>
          </>
        )}
        {importType === 'grammar' && (
          <>
            <th className="p-3 w-[22%]">Tên bài học ngữ pháp</th>
            <th className="p-3 w-[24%]">Công thức tổng quát</th>
            <th className="p-3 w-[10%]">Cấp độ</th>
            <th className="p-3 w-[26%]">Ví dụ</th>
            <th className="p-3 w-[14%] text-center">Trạng thái</th>
            <th className="p-3 w-14 text-center">Xóa</th>
          </>
        )}
        {importType === 'reading' && (
          <>
            <th className="p-3 w-[34%]">Tiêu đề bài đọc</th>
            <th className="p-3 w-[12%]">Số từ</th>
            <th className="p-3 w-[20%]">Chủ đề</th>
            <th className="p-3 w-[16%]">Số câu hỏi</th>
            <th className="p-3 w-[14%] text-center">Trạng thái</th>
            <th className="p-3 w-14 text-center">Xóa</th>
          </>
        )}
        {importType === 'quiz' && (
          <>
            <th className="p-3 w-[34%]">Nội dung câu hỏi</th>
            <th className="p-3 w-[26%]">Các lựa chọn đáp án</th>
            <th className="p-3 w-[12%]">Đáp án</th>
            <th className="p-3 w-[10%]">Dạng bài</th>
            <th className="p-3 w-[14%] text-center">Trạng thái</th>
            <th className="p-3 w-14 text-center">Xóa</th>
          </>
        )}
      </tr>
    </thead>
  )
}

function TableRow({ item, importType, isSelected, onToggleSelect, onDelete }) {
  const st = item.statusVal || item.status || 'valid'
  const isBlocked = item.isDuplicate === true || st === 'error'

  return (
    <tr
      className={cn(
        'transition-colors',
        item.isDuplicate
          ? 'bg-amber-50/40 opacity-70'
          : st === 'error'
          ? 'bg-red-50/30 opacity-70'
          : !isSelected
          ? 'opacity-60 bg-slate-50/40'
          : 'hover:bg-slate-50/80',
      )}
    >
      {/* Checkbox */}
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={isBlocked}
          onChange={onToggleSelect}
          title={
            item.isDuplicate
              ? 'Từ này đã tồn tại trong CSDL — đã tự động bỏ chọn'
              : st === 'error'
              ? 'Mục này bị thiếu từ vựng tiếng Anh'
              : undefined
          }
          className={cn(
            'rounded border-slate-300 text-brand-600 focus:ring-brand-500',
            isBlocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          )}
        />
      </td>

      {/* VOCABULARY ROW */}
      {importType === 'vocabulary' && (
        <>
          <td className="p-3 font-bold text-slate-900 truncate">
            {item.word}{' '}
            <span className="text-[10px] text-slate-400 font-normal">({item.partOfSpeech})</span>
          </td>
          <td className="p-3 font-mono text-slate-600">
            <div className="flex items-center gap-1.5 min-w-0">
              {item.pronunciation || item.phonetic ? (
                <span className="truncate">{item.pronunciation || item.phonetic}</span>
              ) : (
                <span className="text-red-400 text-[11px] shrink-0">Thiếu IPA</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  speakWithWebSpeech(item.word)
                }}
                className="rounded p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
                title="Nghe phát âm từ vựng (Web Speech API)"
              >
                <Volume2 size={13} />
              </button>
            </div>
          </td>
          <td className="p-3 font-medium text-slate-800 truncate" title={item.vietnameseMeaning}>
            {item.vietnameseMeaning}
          </td>
          <td className="p-3 text-slate-600">
            <p className="line-clamp-2 leading-relaxed" title={item.exampleSentence || item.exampleEn}>
              {item.exampleSentence || item.exampleEn}
            </p>
          </td>
          <td className="p-3">
            <span
              className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 truncate block max-w-full"
              title={item.topic}
            >
              {item.topic}
            </span>
          </td>
        </>
      )}

      {/* GRAMMAR ROW */}
      {importType === 'grammar' && (
        <>
          <td className="p-3 font-bold text-slate-900 truncate" title={item.title}>{item.title}</td>
          <td className="p-3 font-mono text-[11px] text-blue-700 truncate" title={item.formula}>{item.formula}</td>
          <td className="p-3">
            <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{item.level}</span>
          </td>
          <td className="p-3 text-slate-600">
            <p className="line-clamp-2" title={item.examples?.[0]?.en}>{item.examples?.[0]?.en}</p>
          </td>
        </>
      )}

      {/* READING ROW */}
      {importType === 'reading' && (
        <>
          <td className="p-3 font-bold text-slate-900 truncate" title={item.title}>{item.title}</td>
          <td className="p-3 font-semibold text-slate-700 truncate">{item.wordCount} từ</td>
          <td className="p-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 truncate block max-w-full" title={item.topic}>
              {item.topic}
            </span>
          </td>
          <td className="p-3 font-bold text-brand-600 truncate">{item.questions?.length || 0} câu hỏi</td>
        </>
      )}

      {/* QUIZ ROW */}
      {importType === 'quiz' && (
        <>
          <td className="p-3 font-medium text-slate-900 truncate" title={item.question}>{item.question}</td>
          <td className="p-3 text-slate-600 truncate" title={item.options?.join(' | ')}>{item.options?.join(' | ')}</td>
          <td className="p-3 font-bold text-emerald-700 truncate">Đáp án {item.correctAnswer}</td>
          <td className="p-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] truncate block">{item.skill}</span>
          </td>
        </>
      )}

      {/* STATUS BADGE */}
      <td className="p-3 text-center whitespace-nowrap">
        <StatusBadge st={st} statusMessage={item.statusMessage} />
      </td>

      {/* ACTIONS */}
      <td className="p-3 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Xóa dòng này"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}

function StatusBadge({ st, statusMessage }) {
  if (st === 'valid') return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-emerald-200">
      <CheckCircle2 size={12} /> Hợp lệ
    </span>
  )
  if (st === 'info') return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-blue-200">
      <Info size={12} /> Khác từ loại
    </span>
  )
  if (st === 'warning') return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-amber-200">
      <AlertTriangle size={12} /> {statusMessage || 'Đã có trong kho từ'}
    </span>
  )
  if (st === 'error') return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-red-200">
      <XCircle size={12} /> Thiếu trường
    </span>
  )
  return null
}
