import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

export function buildPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 3) {
    return [1, 2, 3, '...', totalPages]
  }
  if (page >= totalPages - 2) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, '...', page - 1, page, page + 1, '...', totalPages]
}

export function Pagination({ page = 1, totalPages = 1, onChange, className }) {
  if (totalPages <= 1) return null
  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav aria-label="Phân trang" className={cn('flex items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {pages.map((item, index) =>
        item === '...' ? (
          <span
            key={`dots-${index}`}
            className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-xs text-ink-muted select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer',
              item === page
                ? 'bg-navy-700 text-white shadow-xs'
                : 'border border-line bg-white text-ink-muted hover:bg-canvas hover:text-ink',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  )
}

export function PaginationBar({
  page = 1,
  pageSize = 10,
  total = 0,
  itemLabel = 'mục',
  onChange,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line', className)}>
      <p className="text-xs text-ink-muted">
        Hiển thị <strong>{start}</strong>-<strong>{end}</strong> trong tổng số{' '}
        <strong>{formatNumber(total)}</strong> {itemLabel}
      </p>
      <Pagination page={page} totalPages={totalPages} onChange={onChange} />
    </div>
  )
}

export default Pagination
