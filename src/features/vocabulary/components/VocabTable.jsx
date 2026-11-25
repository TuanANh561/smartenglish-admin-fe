import PendingStatusBadge from '@/features/contentReview/PendingStatusBadge'
import PendingViewButton from '@/features/contentReview/PendingViewButton'
import { PENDING_ROW_CLASS, isPendingNew } from '@/features/contentReview/usePendingRequests'
import { Volume2, Play, Pencil, Trash2, RotateCcw, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { vocabularyColumns } from '../columns'
import OwnerBadge from '@/features/contentReview/OwnerBadge'

/**
 * Bảng dữ liệu danh sách từ vựng, hỗ trợ cả 2 chế độ hiển thị (Danh sách chính & Thùng rác).
 */
export function VocabTable({
  isLoading,
  vocabList = [],
  trashView,
  search,
  playingId,
  onPlayAudio,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onAutoImport,
  isImporting = false,
  isMine,
  onlineResult = null,
  isLookingUp = false,
  lookupActive = false,
  emptyState = null,
  onView,
}) {
  const showOnline = lookupActive && vocabList.length === 0
  const span = vocabularyColumns.length + 3
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm table-fixed">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            {vocabularyColumns.map((col) => {
              let widthClass = 'w-[17%] text-left px-3.5'
              if (col.accessorKey === 'word') widthClass = 'w-[17%] text-left px-4'
              else if (col.accessorKey === 'pronunciation') widthClass = 'w-[14%] text-left px-3'
              else if (col.accessorKey === 'partOfSpeech') widthClass = 'w-[10%] text-center px-2'
              else if (col.accessorKey === 'vietnameseMeaning') widthClass = 'w-[19%] text-left px-3'
              else if (col.accessorKey === 'cefrLevel') widthClass = 'w-[10%] text-center px-2'
              else if (col.accessorKey === 'topic') widthClass = 'w-[18%] text-left px-3'

              return (
                <th
                  key={col.accessorKey}
                  className={`py-3 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${widthClass}`}
                >
                  {col.header}
                </th>
              )
            })}
            <th className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500 w-[120px] whitespace-nowrap">
              Trạng thái
            </th>
            <th className="py-3 px-1.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 w-[60px] whitespace-nowrap">
              Audio
            </th>
            <th className={`py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${showOnline ? 'w-[150px]' : 'w-[80px]'}`}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading || (showOnline && isLookingUp) ? (
            <tr>
              <td colSpan={span} className="px-4 py-12 text-center">
                <LoadingSpinner
                  text={
                    showOnline && isLookingUp
                      ? `Kho chưa có "${search}", đang tra từ điển online...`
                      : search
                      ? `Đang tìm kiếm từ "${search}"...`
                      : 'Đang tải danh sách từ vựng...'
                  }
                />
              </td>
            </tr>
          ) : showOnline && onlineResult ? (
            <tr className="bg-slate-50/50">
              {vocabularyColumns.map((col) => (
                <td key={`online-${col.accessorKey}`} className="px-3.5 py-3 text-sm overflow-hidden">
                  {col.cell({ getValue: () => onlineResult[col.accessorKey], row: { original: onlineResult } })}
                </td>
              ))}
              <td className="px-2 py-3 text-center whitespace-nowrap">
                <Badge tone="neutral">Chưa có trong kho</Badge>
              </td>
              <td className="px-1.5 py-3 text-center">
                <button
                  onClick={(e) => onPlayAudio(e, { ...onlineResult, id: 'online' })}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                    playingId === 'online'
                      ? 'bg-brand-500 text-white animate-pulse'
                      : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'
                  }`}
                  title="Phát âm từ vựng"
                >
                  {playingId === 'online' ? <Volume2 size={16} /> : <Play size={16} strokeWidth={2} />}
                </button>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button
                  size="sm"
                  variant="primary"
                  icon={Plus}
                  loading={isImporting}
                  onClick={() => onAutoImport?.(onlineResult.word || search)}
                >
                  Thêm vào kho
                </Button>
              </td>
            </tr>
          ) : vocabList.length === 0 ? (
            <tr>
              <td colSpan={span}>{emptyState}</td>
            </tr>
          ) : (
            vocabList.map((vocab) => (
              <tr
                key={vocab.id}
                onClick={() => !trashView && onView?.(vocab)}
                className={`transition-colors group ${!trashView ? 'cursor-pointer' : ''} ${vocab.__pending ? PENDING_ROW_CLASS : 'hover:bg-slate-50/50'}`}
              >
                {vocabularyColumns.map((col) => {
                  let tdPad = 'px-3.5 text-left'
                  if (col.accessorKey === 'word') tdPad = 'px-4 text-left'
                  else if (col.accessorKey === 'pronunciation') tdPad = 'px-3 text-left'
                  else if (col.accessorKey === 'partOfSpeech') tdPad = 'px-2 text-center'
                  else if (col.accessorKey === 'vietnameseMeaning') tdPad = 'px-3 text-left'
                  else if (col.accessorKey === 'cefrLevel') tdPad = 'px-2 text-center'
                  else if (col.accessorKey === 'topic') tdPad = 'px-3 text-left'

                  return (
                    <td
                      key={`${vocab.id}-${col.accessorKey}`}
                      className={`${tdPad} py-3 text-sm overflow-hidden`}
                    >
                      {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                    </td>
                  )
                })}
                {/* Trạng thái */}
                <td className="px-2 py-3 text-center whitespace-nowrap">
                  {vocab.__pending ? (
                    <PendingStatusBadge request={vocab.__pending} />
                  ) : trashView ? (
                    <span className="text-xs font-medium text-red-500">Đã xóa</span>
                  ) : (
                    <Badge tone="success">Công khai</Badge>
                  )}
                </td>
                {/* Audio */}
                <td className="px-1.5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => onPlayAudio(e, vocab)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      playingId === vocab.id
                        ? 'bg-brand-500 text-white animate-pulse'
                        : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'
                    }`}
                    title="Phát âm từ vựng (Web Speech API)"
                  >
                    {playingId === vocab.id ? <Volume2 size={16} /> : <Play size={16} strokeWidth={2} />}
                  </button>
                </td>
                {/* Thao tác */}
                <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {isPendingNew(vocab) ? (
                    <PendingViewButton item={vocab} onClick={() => onView?.(vocab)} onEdit={() => onEdit(vocab)} />
                  ) : isMine && !isMine(vocab) ? (
                    <OwnerBadge mine={false} />
                  ) : trashView ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestore(vocab)
                        }}
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Khôi phục từ vựng"
                      >
                        <RotateCcw size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPermanentDelete(vocab)
                        }}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      {isMine ? <OwnerBadge mine /> : null}
                      <button
                        type="button"
                        onClick={(e) => onEdit(vocab)}
                        className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Sửa từ vựng"
                      >
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(vocab)
                        }}
                        className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Chuyển vào thùng rác"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default VocabTable

