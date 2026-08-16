import { cn } from '@/lib/utils'

function FilterChip({ children, active = false, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-line bg-white text-ink hover:bg-canvas',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default FilterChip
