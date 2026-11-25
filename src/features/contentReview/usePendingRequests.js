import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PENDING_REVIEW_EVENT } from '@/lib/pendingReview'
import { fetchContentReviews } from './contentReviewApi'

export const PENDING_ROWS_KEY = ['content-reviews', 'pending-rows']

/** Nền vàng nhạt cho dòng học liệu đang chờ duyệt. */
export const PENDING_ROW_CLASS = 'bg-[#FFFBEB] hover:bg-[#FEF3C7]/60'

export const PENDING_ACTION_LABEL = {
  CREATE: 'Chờ duyệt',
  UPDATE: 'Chờ duyệt sửa',
  PUBLISH: 'Chờ duyệt xuất bản',
  RESTORE: 'Chờ duyệt khôi phục',
  IMPORT: 'Chờ duyệt',
  DELETE: 'Chờ duyệt xoá',
}

/**
 * Yêu cầu thêm / sửa / xoá đang chờ duyệt của một loại học liệu.
 * Giáo viên nhận yêu cầu của mình, quản trị viên nhận của mọi giáo viên.
 */
export function usePendingRequests(type, { enabled = true } = {}) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: [...PENDING_ROWS_KEY, type],
    queryFn: () => fetchContentReviews({ status: 'PENDING', type, size: 50, withPayload: true }),
    enabled,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 0,
  })

  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: PENDING_ROWS_KEY })
    window.addEventListener(PENDING_REVIEW_EVENT, refresh)
    return () => window.removeEventListener(PENDING_REVIEW_EVENT, refresh)
  }, [queryClient])

  const requests = enabled ? (data?.items ?? []) : []
  return { requests }
}

/**
 * Biến yêu cầu "thêm mới" thành bản ghi có cùng dạng với học liệu đã duyệt,
 * để hiển thị bằng chính dòng bảng và trang chi tiết của học liệu đó.
 */
export function toPendingItems(requests, normalize = (x) => x) {
  const build = (r, raw, id) => {
    let item
    try {
      item = normalize({ ...raw, id, status: raw.status ?? 'draft' }) || {}
    } catch {
      item = { ...raw }
    }
    return { ...item, id, updatedAt: r.updatedAt || r.createdAt, __pending: r }
  }
  return requests
    .filter((r) => r.action === 'CREATE' || r.action === 'IMPORT')
    .flatMap((r) => {
      // Nhập hàng loạt: mỗi mục là một dòng, cùng chung một yêu cầu duyệt
      if (Array.isArray(r.payload)) {
        return r.payload
          .filter((x) => x && typeof x === 'object')
          .map((x, i) => ({ ...build(r, x, `pending-${r.id}-${i}`), __bulk: true }))
      }
      // Yêu cầu không kèm nội dung (VD: thêm từ vựng tự tra từ điển): chỉ có tiêu đề
      const raw = r.payload && typeof r.payload === 'object' ? r.payload : { title: r.title, word: r.title }
      return [build(r, raw, `pending-${r.id}`)]
    })
}

/** Gắn yêu cầu sửa / xoá đang chờ vào bản ghi đã có, theo id học liệu. */
export function markPending(items, requests) {
  const byId = new Map(
    requests.filter((r) => r.resourceId && r.action !== 'CREATE').map((r) => [String(r.resourceId), r]),
  )
  if (byId.size === 0) return items
  return items.map((item) => (byId.has(String(item.id)) ? { ...item, __pending: byId.get(String(item.id)) } : item))
}

/** Danh sách hiển thị: học liệu chờ duyệt lên đầu, rồi đến học liệu đã có (có đánh dấu yêu cầu sửa / xoá). */
export function withPending(items, requests, normalize, { showNew = true, search = '' } = {}) {
  const marked = markPending(items, requests)
  if (!showNew) return marked
  const q = String(search || '').trim().toLowerCase()
  const fresh = toPendingItems(requests, normalize).filter(
    (item) =>
      !q ||
      [item.title, item.titleEn, item.titleVi, item.word, item.__pending?.title]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(q)),
  )
  return [...fresh, ...marked]
}

/** Học liệu mới đang chờ duyệt (chưa có trong kho). */
export const isPendingNew = (item) => Boolean(item?.__pending) && String(item?.id ?? '').startsWith('pending-')

/** Mục mới đang chờ duyệt mà giáo viên sửa tiếp được (có nội dung riêng, không thuộc lần nhập hàng loạt). */
export const canRevisePending = (item) =>
  isPendingNew(item) && !item.__bulk && Boolean(item.__pending?.payload) && typeof item.__pending.payload === 'object'

/** Trang yêu cầu chờ duyệt mở sang trang học liệu kèm ?pending=<id>: tự mở chi tiết của mục đó. */
export const PENDING_ROUTE = {
  GRAMMAR_LESSON: '/app/hoc-lieu/ngu-phap',
  PRONUNCIATION_LESSON: '/app/hoc-lieu/phat-am',
  READING_PASSAGE: '/app/hoc-lieu/bai-doc',
  LISTENING_LESSON: '/app/hoc-lieu/bai-nghe',
  EXAM: '/app/hoc-lieu/bai-kiem-tra',
  WORD: '/app/hoc-lieu/tu-vung',
}

export function useOpenPendingFromQuery(rows, open) {
  const [params, setParams] = useSearchParams()
  const target = params.get('pending')
  useEffect(() => {
    if (!target) return
    const item = rows.find((r) => String(r.id) === `pending-${target}`)
    if (!item) return
    open(item)
    const next = new URLSearchParams(params)
    next.delete('pending')
    setParams(next, { replace: true })
  }, [target, rows, open, params, setParams])
}
