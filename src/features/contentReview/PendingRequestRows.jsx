import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Badge from '@/components/ui/Badge'
import { PENDING_REVIEW_EVENT } from '@/lib/pendingReview'
import { fetchContentReviews } from './contentReviewApi'

const ACTION_LABEL = {
  CREATE: 'Thêm mới',
  UPDATE: 'Chỉnh sửa',
  PUBLISH: 'Xuất bản / ẩn',
  RESTORE: 'Khôi phục',
  IMPORT: 'Nhập hàng loạt',
  DELETE: 'Xoá',
}

const timeAgo = (value) => {
  if (!value) return ''
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: vi })
  } catch {
    return ''
  }
}

/**
 * Các yêu cầu thêm / sửa / xoá đang chờ duyệt của một loại học liệu, hiện ngay trong bảng.
 * Giáo viên thấy yêu cầu của mình, quản trị viên thấy của mọi giáo viên.
 */
function PendingRequestRows({ type, colSpan, hidden = false }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const queryKey = ['content-reviews', 'pending-rows', type]
  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchContentReviews({ status: 'PENDING', type, size: 50 }),
    enabled: !hidden,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 0,
  })

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['content-reviews', 'pending-rows'] })
    window.addEventListener(PENDING_REVIEW_EVENT, refresh)
    return () => window.removeEventListener(PENDING_REVIEW_EVENT, refresh)
  }, [queryClient])

  if (hidden) return null
  const requests = data?.items ?? []
  if (requests.length === 0) return null

  return requests.map((r) => (
    <tr key={`pending-${r.id}`} className="bg-[#FFFBEB]/60">
      <td colSpan={Math.max(1, colSpan - 2)} className="px-4 py-3">
        <p className="truncate text-sm font-semibold text-slate-800" title={r.title || ''}>
          {r.title || `${ACTION_LABEL[r.action] ?? r.action} #${r.resourceId ?? 'mới'}`}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {ACTION_LABEL[r.action] ?? r.action}
          {r.requestedByEmail ? ` · ${r.requestedByEmail}` : ''}
          {r.updatedAt || r.createdAt ? ` · gửi ${timeAgo(r.updatedAt || r.createdAt)}` : ''}
        </p>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <Badge tone="warning">Chờ duyệt</Badge>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => navigate(`/app/duyet-noi-dung?type=${type}`)}
          className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-ink hover:bg-canvas cursor-pointer"
        >
          Xem
        </button>
      </td>
    </tr>
  ))
}

export default PendingRequestRows
