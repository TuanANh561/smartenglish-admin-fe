import { useCallback, useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchOwnedContent } from './contentReviewApi'

export const OWNED_CONTENT_KEY = ['content-reviews', 'owned']

/** Số bản ghi tải khi giáo viên lọc "Của tôi" (học liệu của một giáo viên thường ít). */
export const MINE_PAGE_SIZE = 200

/**
 * Học liệu nào do giáo viên đang đăng nhập tạo.
 * Giáo viên mặc định xem "Của tôi"; học liệu của người khác chỉ được xem, không sửa / xoá.
 */
export function useOwnership(type) {
  const user = useAuthStore((s) => s.user)
  const isTeacher = String(user?.role || '').toLowerCase() === 'teacher'
  const { data } = useQuery({
    queryKey: OWNED_CONTENT_KEY,
    queryFn: fetchOwnedContent,
    enabled: isTeacher,
    staleTime: 30000,
  })

  const ownedIds = useMemo(() => new Set((data?.[type] ?? []).map(String)), [data, type])

  const isMine = useCallback(
    (item) =>
      Boolean(item) &&
      (ownedIds.has(String(item.id)) ||
        (item.createdBy != null && user?.id != null && String(item.createdBy) === String(user.id))),
    [ownedIds, user?.id],
  )

  const canManage = useCallback((item) => !isTeacher || isMine(item), [isTeacher, isMine])

  /** Lọc theo nguồn và đưa học liệu của giáo viên lên đầu. */
  const applyFilter = useCallback(
    (items, filter) => {
      const list = Array.isArray(items) ? items : []
      if (!isTeacher) return list
      if (filter === 'mine') return list.filter(isMine)
      if (filter === 'system') return list.filter((x) => !isMine(x))
      return [...list.filter(isMine), ...list.filter((x) => !isMine(x))]
    },
    [isTeacher, isMine],
  )

  const ids = useMemo(() => Array.from(ownedIds), [ownedIds])

  return { isTeacher, isMine, canManage, applyFilter, ownedIds: ids, defaultFilter: isTeacher ? 'mine' : 'all' }
}

const MAX_MINE = 100

/** Không phân biệt hoa thường và dấu khi tìm trong danh sách "Của tôi". */
const fold = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

/**
 * Danh sách "Của tôi": tải từng học liệu theo id giáo viên sở hữu, nên không bị phân trang
 * của danh sách chung che mất. `fields` là các trường dùng để tìm kiếm.
 */
export function useMyItems(type, ids, fetchById, { enabled, search = '', fields = ['title'] }) {
  const list = enabled ? ids.slice(0, MAX_MINE) : []
  const results = useQueries({
    queries: list.map((id) => ({
      queryKey: ['owned-item', type, id],
      queryFn: () => fetchById(id),
      staleTime: 30000,
      retry: 0,
    })),
  })
  const isLoading = results.some((r) => r.isLoading)
  const q = fold(search.trim())
  const items = results
    .map((r) => r.data)
    .filter((item) => item && !item.deletedAt && !item.isDeleted)
    .filter((item) => !q || fields.some((f) => fold(item[f]).includes(q)))
  return { items, isLoading }
}
