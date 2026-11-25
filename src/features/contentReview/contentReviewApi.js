import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

export const fetchContentReviews = ({ status = 'PENDING', type, page = 0, size = 20 } = {}) =>
  api.get(ENDPOINTS.contentReviews.list, { params: { status, type: type || undefined, page, size } })

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
