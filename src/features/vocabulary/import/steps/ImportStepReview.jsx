/**
 * ImportStepReview.jsx
 * Step 3: Filter toolbar + bảng review & edit từ vựng đã bóc tách.
 */

import {
  CheckCircle2, AlertTriangle, XCircle, Info, Trash2, Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { speakWord } from '@/lib/ipaHelper'

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
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <TableHead
            importType={importType}
            filteredData={filteredData}
            selectedIds={selectedIds}
            onToggleSelectAll={onToggleSelectAll}
          />
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  Không có mục nào trong danh sách lọc này.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  importType={importType}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={() => !item.isDuplicate && onToggleSelectRow(item.id)}
                  onDelete={() => onDeleteRow(item.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterToolbar({ parsedItems, filteredData, selectedIds, filterStatus, setFilterStatus, onToggleSelectAll }) {
  const countOf = (st) => parsedItems.filter((i) => i.statusVal === st || i.status === st).length

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700">Lọc theo trạng thái:</span>

        <FilterBtn label={`Tất cả (${parsedItems.length})`} value="all" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-slate-800 text-white" inactiveClass="bg-white text-slate-600 border border-slate-200 hover:bg-slate-100" />
        <FilterBtn label={`Hợp lệ (${countOf('valid')})`} value="valid" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-emerald-600 text-white" inactiveClass="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" />
        <FilterBtn label={`Khác từ loại (${countOf('info')})`} value="info" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-blue-600 text-white" inactiveClass="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" />
        <FilterBtn label={`Trùng hoàn toàn (${countOf('warning')})`} value="warning" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-amber-600 text-white" inactiveClass="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" />
        <FilterBtn label={`Cần sửa lỗi (${countOf('error')})`} value="error" current={filterStatus} onClick={setFilterStatus}
          activeClass="bg-red-600 text-white" inactiveClass="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" />
      </div>

      <div className="text-xs text-slate-500 font-semibold">
        Đã chọn: <strong className="text-brand-600">{selectedIds.size}</strong>/{parsedItems.length} mục
      </div>
    </div>
  )
}

function FilterBtn({ label, value, current, onClick, activeClass, inactiveClass }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
        current === value ? activeClass : inactiveClass,
      )}
    >
      {label}
    </button>
  )
}

function TableHead({ importType, filteredData, selectedIds, onToggleSelectAll }) {
  const selectableRows = filteredData.filter((i) => !i.isDuplicate)
  const allSelected = selectableRows.length > 0 && selectableRows.every((item) => selectedIds.has(item.id))

  return (
    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
      <tr>
        <th className="p-3 w-10">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </th>
        {importType === 'vocabulary' && (
          <>
            <th className="p-3">Từ vựng (Word)</th>
            <th className="p-3">Phiên âm IPA</th>
            <th className="p-3">Nghĩa tiếng Việt</th>
            <th className="p-3">Ví dụ minh họa</th>
            <th className="p-3">Chủ đề</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </>
        )}
        {importType === 'grammar' && (
          <>
            <th className="p-3">Tên bài học ngữ pháp</th>
            <th className="p-3">Công thức tổng quát</th>
            <th className="p-3">Cấp độ</th>
            <th className="p-3">Ví dụ</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </>
        )}
        {importType === 'reading' && (
          <>
            <th className="p-3">Tiêu đề bài đọc</th>
            <th className="p-3">Số từ</th>
            <th className="p-3">Chủ đề</th>
            <th className="p-3">Số câu hỏi</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </>
        )}
        {importType === 'quiz' && (
          <>
            <th className="p-3">Nội dung câu hỏi</th>
            <th className="p-3">Các lựa chọn đáp án</th>
            <th className="p-3">Đáp án</th>
            <th className="p-3">Dạng bài</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </>
        )}
      </tr>
    </thead>
  )
}

function TableRow({ item, importType, isSelected, onToggleSelect, onDelete }) {
  const st = item.statusVal || item.status || 'valid'

  return (
    <tr
      className={cn(
        'transition-colors',
        item.isDuplicate
          ? 'bg-amber-50/40 opacity-70'
          : !isSelected
          ? 'opacity-60 bg-slate-50/40'
          : 'hover:bg-slate-50',
      )}
    >
      {/* Checkbox */}
      <td className="p-3">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={item.isDuplicate === true}
          onChange={onToggleSelect}
          title={item.isDuplicate ? 'Từ này đã tồn tại trong CSDL với cùng từ loại — không thể import' : undefined}
          className={cn(
            'rounded border-slate-300 text-brand-600 focus:ring-brand-500',
            item.isDuplicate ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          )}
        />
      </td>

      {/* VOCABULARY ROW */}
      {importType === 'vocabulary' && (
        <>
          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
            {item.word}{' '}
            <span className="text-[10px] text-slate-400 font-normal">({item.partOfSpeech})</span>
          </td>
          <td className="p-3 font-mono text-slate-600">
            <div className="flex items-center gap-1.5">
              {item.pronunciation || item.phonetic
                ? <span>{item.pronunciation || item.phonetic}</span>
                : <span className="text-red-400 text-[11px]">Thiếu IPA</span>
              }
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  speakWord(item.word, item.audioUrl)
                }}
                className={`rounded p-1 transition-colors cursor-pointer ${
                  item.audioUrl
                    ? 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
                title={item.audioUrl ? 'Nghe phát âm chuẩn (MP3)' : 'Nghe phát âm (Web Speech API)'}
              >
                <Volume2 size={13} />
              </button>
            </div>
          </td>
          <td className="p-3 font-medium text-slate-800">{item.vietnameseMeaning}</td>
          <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">{item.exampleSentence || item.exampleEn}</td>
          <td className="p-3 whitespace-nowrap">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
              {item.topic}
            </span>
          </td>
        </>
      )}

      {/* GRAMMAR ROW */}
      {importType === 'grammar' && (
        <>
          <td className="p-3 font-bold text-slate-900 max-w-xs">{item.title}</td>
          <td className="p-3 font-mono text-[11px] text-blue-700 max-w-xs">{item.formula}</td>
          <td className="p-3">
            <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{item.level}</span>
          </td>
          <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">{item.examples?.[0]?.en}</td>
        </>
      )}

      {/* READING ROW */}
      {importType === 'reading' && (
        <>
          <td className="p-3 font-bold text-slate-900 max-w-sm">{item.title}</td>
          <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">{item.wordCount} từ</td>
          <td className="p-3 whitespace-nowrap">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">{item.topic}</span>
          </td>
          <td className="p-3 font-bold text-brand-600 whitespace-nowrap">{item.questions?.length || 0} câu hỏi</td>
        </>
      )}

      {/* QUIZ ROW */}
      {importType === 'quiz' && (
        <>
          <td className="p-3 font-medium text-slate-900 max-w-xs">{item.question}</td>
          <td className="p-3 text-slate-600 max-w-xs line-clamp-1">{item.options?.join(' | ')}</td>
          <td className="p-3 font-bold text-emerald-700">Đáp án {item.correctAnswer}</td>
          <td className="p-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.skill}</span>
          </td>
        </>
      )}

      {/* STATUS BADGE */}
      <td className="p-3 text-center whitespace-nowrap">
        <StatusBadge st={st} statusMessage={item.statusMessage} />
      </td>

      {/* ACTIONS */}
      <td className="p-3 text-right whitespace-nowrap">
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
      <AlertTriangle size={12} /> {statusMessage || 'Đã có trong CSDL'}
    </span>
  )
  if (st === 'error') return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-red-200">
      <XCircle size={12} /> Thiếu trường
    </span>
  )
  return null
}
