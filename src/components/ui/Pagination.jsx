import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function buildPageNumbers(page, totalPages) {
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

function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null
  const pages = buildPageNumbers(page, totalPages)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} strokeWidth={1.75} />
      </button>

      {pages.map((item, index) =>
        item === '...' ? (
          <span key={`dots-${index}`} className="px-1 text-sm text-ink-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium',
              item === page ? 'bg-navy-700 text-white' : 'text-ink hover:bg-canvas',
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
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default Pagination
