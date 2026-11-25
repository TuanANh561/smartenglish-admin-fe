import Badge from '@/components/ui/Badge'
import { PENDING_ACTION_LABEL } from './usePendingRequests'

/** Nhãn "Chờ duyệt" cho cột trạng thái của dòng học liệu đang chờ quản trị viên duyệt. */
function PendingStatusBadge({ request }) {
  if (!request) return null
  return (
    <Badge tone="warning" className="whitespace-nowrap">
      {PENDING_ACTION_LABEL[request.action] ?? 'Chờ duyệt'}
    </Badge>
  )
}

export default PendingStatusBadge
