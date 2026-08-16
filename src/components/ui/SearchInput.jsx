import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...', className }) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={18}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 text-ink-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-9 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Xoá tìm kiếm"
          className="absolute right-2 rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}

export default SearchInput
