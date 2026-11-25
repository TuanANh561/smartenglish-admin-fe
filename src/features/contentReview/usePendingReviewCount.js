import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PENDING_REVIEW_EVENT } from '@/lib/pendingReview'
import { fetchClassReviewCount, fetchPendingReviewCount } from './contentReviewApi'

export const PENDING_COUNT_KEY = ['content-reviews', 'pending-count']

/** Số thay đổi học liệu đang chờ quản trị viên duyệt (huy hiệu vàng trên menu). */
export function usePendingReviewCount(enabled) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: PENDING_COUNT_KEY,
    queryFn: async () => {
      // Học liệu + lớp học chờ duyệt; một nguồn lỗi thì vẫn hiện số của nguồn còn lại
      const [content, classes] = await Promise.allSettled([fetchPendingReviewCount(), fetchClassReviewCount()])
      const value = (r) => (r.status === 'fulfilled' ? Number(r.value?.total) || 0 : 0)
      return { total: value(content) + value(classes), classes: value(classes) }
    },
    enabled,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 0,
  })

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: PENDING_COUNT_KEY })
    window.addEventListener(PENDING_REVIEW_EVENT, refresh)
    return () => window.removeEventListener(PENDING_REVIEW_EVENT, refresh)
  }, [queryClient])

  return Number(query.data?.total) || 0
}
