import FilterChip from '@/components/ui/FilterChip'
import { cn } from '@/lib/utils'

/** Hàng chip lọc nhanh nằm trên bảng. `chips`: [{ key, label }]. Chip đầu luôn là "Tất cả". */
function FilterChipRow({ chips, value, onChange, className }) {
  const isAll = !value || value === 'all'

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <FilterChip active={isAll} onClick={() => onChange('all')}>
        Tất cả
      </FilterChip>
      {chips.map((chip) => (
        <FilterChip key={chip.key} active={value === chip.key} onClick={() => onChange(chip.key)}>
          {chip.label}
        </FilterChip>
      ))}
    </div>
  )
}

export default FilterChipRow
