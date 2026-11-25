import Badge from '@/components/ui/Badge'

/** Nhãn nguồn học liệu, chỉ hiện cho giáo viên. */
function OwnerBadge({ mine }) {
  return <Badge tone={mine ? 'info' : 'neutral'}>{mine ? 'Của bạn' : 'Hệ thống'}</Badge>
}

export default OwnerBadge
