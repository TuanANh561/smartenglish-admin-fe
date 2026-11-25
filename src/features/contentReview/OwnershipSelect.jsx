import Select from '@/components/ui/Select'

const OPTIONS = [
  { value: 'mine', label: 'Nguồn: Của tôi' },
  { value: 'system', label: 'Nguồn: Hệ thống' },
  { value: 'all', label: 'Nguồn: Tất cả' },
]

/** Bộ lọc nguồn học liệu cho giáo viên: Của tôi / Hệ thống / Tất cả. */
function OwnershipSelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      containerClassName="w-40 shrink-0"
      options={OPTIONS}
    />
  )
}

export default OwnershipSelect
