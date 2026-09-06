import { ChevronRight, ChevronsUpDown, ChevronDown as SortDesc, ChevronUp as SortAsc } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { createColumnHelper, flexRender, rowSortingFeature, useTable } from '@tanstack/react-table'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { cn, formatNumber } from '@/lib/utils'

/**
 * Bọc @tanstack/react-table (v9). Chỉ dùng `rowSortingFeature` — sắp xếp là
 * "manual": DataTable không tự sắp lại `data` (server/mock đã sắp), feature chỉ cần
 * để hiện mũi tên + phát `onSortingChange`, tương tự v8 với `manualSorting: true`.
 * Chọn nhiều dòng và mở rộng dòng KHÔNG dùng feature riêng của thư viện — tự quản lý
 * bằng state cục bộ vì đơn giản hơn nhiều so với rowSelectionFeature/rowExpandingFeature.
 * PHẢI dùng hook `useTable` (không tự gọi `constructTable`) — hook lo phần khởi tạo
 * reactivity (`coreReactivityFeature`) mà table-core không tự thêm.
 */
const FEATURES = { rowSortingFeature }
const localColumnHelper = createColumnHelper()

function alignClass(align) {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function DataTable({
  columns,
  data = [],
  isLoading = false,
  error = null,
  onRetry,
  pagination,
  onPageChange,
  sorting = [],
  onSortingChange,
  emptyMessage = 'Chưa có dữ liệu',
  onRowClick,
  selectedRowId,
  enableSelection = false,
  expandable = false,
  renderExpandedRow,
  onSelectionChange,
  controlsPosition = 'end',
  separateControls = false,
  className,
}) {
  const [rowSelection, setRowSelectionState] = useState({})
  const [expandedRows, setExpandedRows] = useState({})

  const setRowSelection = (updater) => {
    setRowSelectionState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      onSelectionChange?.(next)
      return next
    })
  }

  const allSelected = data.length > 0 && data.every((row) => rowSelection[row.id])
  const someSelected = !allSelected && data.some((row) => rowSelection[row.id])

  const finalColumns = useMemo(() => {
    const extra = []

    if (expandable && enableSelection && !separateControls) {
      extra.push(
        localColumnHelper.display({
          id: '__controls',
          header: () => (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onChange={(event) => {
                  const checked = event.target.checked
                  setRowSelection(checked ? Object.fromEntries(data.map((row) => [row.id, true])) : {})
                }}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                title="Chọn tất cả"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="inline-flex items-center justify-center gap-1.5" onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={!!rowSelection[row.original.id]}
                onChange={(event) =>
                  setRowSelection((prev) => ({ ...prev, [row.original.id]: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                title="Chọn dòng"
              />
              <button
                type="button"
                onClick={() => {
                  setExpandedRows((prev) => ({ ...prev, [row.original.id]: !prev[row.original.id] }))
                }}
                aria-label={expandedRows[row.original.id] ? 'Thu gọn' : 'Mở rộng'}
                title={expandedRows[row.original.id] ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
                className="inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className={cn('transition-transform duration-200', expandedRows[row.original.id] && 'rotate-90 text-brand-600')}
                />
              </button>
            </div>
          ),
          meta: { align: 'center', compact: true, widthClass: 'w-20 min-w-[76px] max-w-[84px]' },
        }),
      )
    } else {
      if (enableSelection) {
        extra.push(
          localColumnHelper.display({
            id: '__select',
            header: () => (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setRowSelection(checked ? Object.fromEntries(data.map((row) => [row.id, true])) : {})
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                  title="Chọn tất cả"
                />
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={!!rowSelection[row.original.id]}
                  onChange={(event) =>
                    setRowSelection((prev) => ({ ...prev, [row.original.id]: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                  title="Chọn dòng"
                />
              </div>
            ),
            meta: { align: 'center', compact: true, widthClass: 'w-10 min-w-[40px] max-w-[48px]' },
          }),
        )
      }

      if (expandable) {
        extra.push(
          localColumnHelper.display({
            id: '__expand',
            header: () => null,
            cell: ({ row }) => (
              <div className="flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedRows((prev) => ({ ...prev, [row.original.id]: !prev[row.original.id] }))
                  }}
                  aria-label={expandedRows[row.original.id] ? 'Thu gọn' : 'Mở rộng'}
                  title={expandedRows[row.original.id] ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
                  className="inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className={cn('transition-transform duration-200', expandedRows[row.original.id] && 'rotate-90 text-brand-600')}
                  />
                </button>
              </div>
            ),
            meta: { align: 'center', compact: true, widthClass: 'w-10 min-w-[40px] max-w-[48px]' },
          }),
        )
      }
    }

    return controlsPosition === 'start' ? [...extra, ...columns] : [...columns, ...extra]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, expandable, enableSelection, separateControls, controlsPosition, data, rowSelection, expandedRows, allSelected, someSelected])

  const table = useTable({
    features: FEATURES,
    columns: finalColumns,
    data,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange,
    manualSorting: true,
    manualPagination: true,
    manualExpanding: true,
  })

  const columnCount = finalColumns.length
  const showFooter = !isLoading && !error && pagination && pagination.totalPages > 1

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  const align = header.column.columnDef.meta?.align
                  const meta = header.column.columnDef.meta
                  const isCompact = meta?.compact

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        isCompact
                          ? 'px-2 py-3 text-xs font-bold uppercase tracking-wider text-slate-500'
                          : 'px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500',
                        meta?.widthClass,
                        alignClass(align),
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer',
                            align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' ? (
                            <SortAsc size={14} strokeWidth={2} className="text-brand-600" />
                          ) : sortDir === 'desc' ? (
                            <SortDesc size={14} strokeWidth={2} className="text-brand-600" />
                          ) : (
                            <ChevronsUpDown size={14} strokeWidth={1.75} className="text-slate-400" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {finalColumns.map((col, colIndex) => {
                    const meta = col.columnDef?.meta || col.meta
                    const isCompact = meta?.compact
                    return (
                      <td
                        key={colIndex}
                        className={cn(isCompact ? 'px-2 py-3' : 'px-6 py-4.5', meta?.widthClass)}
                      >
                        <Skeleton
                          className={cn('h-4', isCompact ? 'w-5 mx-auto' : 'w-full max-w-[160px]')}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-8">
                  <ErrorState error={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : !data.length ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-8">
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      'border-b border-slate-100 transition-colors last:border-0',
                      onRowClick && 'cursor-pointer',
                      selectedRowId === row.original.id || rowSelection[row.original.id]
                        ? 'bg-brand-50/50'
                        : 'hover:bg-slate-50/50',
                    )}
                  >
                    {row.getAllCells().map((cell) => {
                      const meta = cell.column.columnDef.meta
                      const isCompact = meta?.compact
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            isCompact ? 'px-2 py-3 text-sm text-slate-800' : 'px-6 py-4.5 text-sm text-slate-800',
                            meta?.widthClass,
                            alignClass(meta?.align),
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                  {expandable && expandedRows[row.original.id] && (
                    <tr className="border-b border-slate-100 bg-slate-50/70 last:border-0">
                      <td colSpan={columnCount} className="px-6 py-4 text-sm">
                        {renderExpandedRow?.(row.original)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{(pagination.page - 1) * pagination.size + 1}</strong>-
            <strong>{Math.min(pagination.page * pagination.size, pagination.total)}</strong> trong tổng số{' '}
            <strong>{formatNumber(pagination.total)}</strong> mục
          </p>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

export default DataTable
