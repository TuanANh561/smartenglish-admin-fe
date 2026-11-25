import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck } from 'lucide-react'
import { PENDING_REVIEW_EVENT } from '@/lib/pendingReview'
import { fetchPendingReviewCount } from './contentReviewApi'

export const PENDING_BY_TYPE_KEY = ['content-reviews', 'pending-by-type']

/** Nút "Chờ duyệt" trên trang học liệu: mở trang duyệt đã lọc sẵn theo loại học liệu. */
function PendingReviewButton({ type }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: PENDING_BY_TYPE_KEY,
    queryFn: fetchPendingReviewCount,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 0,
  })

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: PENDING_BY_TYPE_KEY })
    window.addEventListener(PENDING_REVIEW_EVENT, refresh)
    return () => window.removeEventListener(PENDING_REVIEW_EVENT, refresh)
  }, [queryClient])

  const count = Number(data?.byType?.[type]) || 0

  return (
    <button
      type="button"
      onClick={() => navigate(`/app/duyet-noi-dung?type=${type}`)}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm text-ink hover:bg-canvas cursor-pointer"
    >
      <ClipboardCheck size={14} strokeWidth={1.75} className="text-ink-muted" />
      Chờ duyệt
      {count > 0 && (
        <span className="rounded-full bg-[#FEF3C7] px-1.5 text-xs font-medium text-[#A16207]">{count}</span>
      )}
    </button>
  )
}

export default PendingReviewButton
