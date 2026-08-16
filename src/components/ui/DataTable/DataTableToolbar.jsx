import { useEffect, useRef, useState } from 'react'
import SearchInput from '@/components/ui/SearchInput'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 300

/** Hàng công cụ trên bảng: tìm kiếm (trì hoãn 300ms) trái, bộ lọc giữa, hành động phải. */
function DataTableToolbar({ searchValue = '', onSearchChange, searchPlaceholder, children, actions, className }) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debounceRef = useRef(null)

  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleChange = (value) => {
    setLocalSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(value), DEBOUNCE_MS)
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <SearchInput
        value={localSearch}
        onChange={handleChange}
        placeholder={searchPlaceholder}
        className="w-full max-w-xs"
      />
      {children && <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export default DataTableToolbar
