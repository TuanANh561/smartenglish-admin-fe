import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'
import { notifyPendingReview } from '@/lib/pendingReview'

export const fetchContentReviews = ({ status = 'PENDING', type, page = 0, size = 20, withPayload } = {}) =>
  api.get(ENDPOINTS.contentReviews.list, {
    params: { status, type: type || undefined, page, size, withPayload: withPayload || undefined },
  })

export const fetchContentReviewDetail = (id) => api.get(ENDPOINTS.contentReviews.detail, { path: { id } })

export const fetchPendingReviewCount = () => api.get(ENDPOINTS.contentReviews.pendingCount)

export const approveContentReview = (id, note) =>
  api.post(ENDPOINTS.contentReviews.approve, { path: { id }, data: { note } })

export const rejectContentReview = (id, reason) =>
  api.post(ENDPOINTS.contentReviews.reject, { path: { id }, data: { reason } })

export const fetchClassReviews = () => api.get(ENDPOINTS.teacher.classReviews)

export const fetchClassReviewCount = () => api.get(ENDPOINTS.teacher.classReviewCount)

export const approveClassReview = (id) => api.put(ENDPOINTS.teacher.approveClassReview, { path: { id } })

export const rejectClassReview = (id, reason) =>
  api.put(ENDPOINTS.teacher.rejectClassReview, { path: { id }, data: { reason } })

export const cancelContentReview = (id) => api.delete(ENDPOINTS.contentReviews.cancel, { path: { id } })

export const fetchOwnedContent = () => api.get(ENDPOINTS.contentReviews.owned)

export const reviseContentReview = (id, data) => api.put(ENDPOINTS.contentReviews.revise, { path: { id }, data })

/** Id yêu cầu duyệt khi bản ghi là học liệu mới đang chờ (id dạng "pending-12"), ngược lại null. */
export const pendingRequestId = (id) => {
  const s = String(id ?? '')
  return s.startsWith('pending-') ? s.slice('pending-'.length).split('-')[0] : null
}

/** Đọc học liệu mới đang chờ duyệt từ nội dung giáo viên đã gửi; học liệu thường thì gọi load(). */
export async function loadPendingOr(id, load, normalize = (x) => x) {
  const reqId = pendingRequestId(id)
  if (!reqId) return load()
  const request = await fetchContentReviewDetail(reqId)
  const index = Number(String(id).split('-')[2])
  const raw = Array.isArray(request?.payload) ? request.payload[index] : request?.payload
  const payload = raw && typeof raw === 'object' ? raw : { title: request?.title, word: request?.title }
  return { ...normalize({ ...payload, id }), id, __pending: request }
}

/** Lưu sửa đổi: học liệu mới đang chờ duyệt thì cập nhật thẳng vào yêu cầu đó; học liệu thường thì gọi send(). */
export async function savePendingOr(id, payload, send) {
  const reqId = pendingRequestId(id)
  if (!reqId) return send()
  await reviseContentReview(reqId, payload)
  notifyPendingReview('Đã cập nhật nội dung đang chờ duyệt.')
  return { ...payload, id }
}
