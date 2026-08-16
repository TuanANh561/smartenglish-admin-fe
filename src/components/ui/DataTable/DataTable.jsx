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

    if (expandable) {
      extra.push(
        localColumnHelper.display({
          id: '__expand',
          header: () => null,
          cell: ({ row }) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setExpandedRows((prev) => ({ ...prev, [row.original.id]: !prev[row.original.id] }))
              }}
              aria-label={expandedRows[row.original.id] ? 'Thu gọn' : 'Mở rộng'}
              className="rounded-lg p-1 text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <ChevronRight
                size={18}
                strokeWidth={1.75}
                className={cn('transition-transform', expandedRows[row.original.id] && 'rotate-90')}
              />
            </button>
          ),
          meta: { align: 'center' },
        }),
      )
    }

    if (enableSelection) {
      extra.push(
        localColumnHelper.display({
          id: '__select',
          header: () => (
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
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={!!rowSelection[row.original.id]}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                setRowSelection((prev) => ({ ...prev, [row.original.id]: event.target.checked }))
              }
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
            />
          ),
          meta: { align: 'center' },
        }),
      )
    }

    return [...extra, ...columns]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, expandable, enableSelection, data, rowSelection, expandedRows, allSelected, someSelected])

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
          <thead className="bg-canvas">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  const align = header.column.columnDef.meta?.align

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted',
                        alignClass(align),
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-ink',
                            align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' ? (
                            <SortAsc size={14} strokeWidth={1.75} />
                          ) : sortDir === 'desc' ? (
                            <SortDesc size={14} strokeWidth={1.75} />
                          ) : (
                            <ChevronsUpDown size={14} strokeWidth={1.75} className="text-ink-muted/50" />
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
          <tbody className="divide-y divide-line">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {finalColumns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6">
                  <ErrorState error={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : !data.length ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6">
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      'border-b border-line transition-colors last:border-0',
                      onRowClick && 'cursor-pointer',
                      selectedRowId === row.original.id || rowSelection[row.original.id]
                        ? 'bg-brand-500/5'
                        : 'hover:bg-canvas',
                    )}
                  >
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn('px-4 py-3', alignClass(cell.column.columnDef.meta?.align))}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expandable && expandedRows[row.original.id] && (
                    <tr className="border-b border-line bg-canvas last:border-0">
                      <td colSpan={columnCount} className="px-4 py-3">
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
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            Hiển thị {(pagination.page - 1) * pagination.size + 1}-
            {Math.min(pagination.page * pagination.size, pagination.total)} trên{' '}
            {formatNumber(pagination.total)} mục
          </p>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

export default DataTable
