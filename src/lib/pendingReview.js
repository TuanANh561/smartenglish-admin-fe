import toast from 'react-hot-toast'

/**
 * Thay đổi học liệu của giáo viên được máy chủ đưa vào hàng chờ duyệt (data.pendingReview = true).
 * Hiện thông báo "chờ duyệt" và chặn thông báo "thành công" mà trang gọi ngay sau đó,
 * vì thay đổi chưa được áp dụng.
 */
export const PENDING_REVIEW_EVENT = 'smartenglish:pending-review'

let lastPendingAt = 0

export function isPendingReviewResponse(response) {
  const body = response?.data
  const ok = response?.status >= 200 && response?.status < 300
  return ok && Boolean(body?.data?.pendingReview)
}

export function notifyPendingReview(message) {
  lastPendingAt = Date.now()
  toast(message || 'Đã gửi yêu cầu. Nội dung sẽ được áp dụng sau khi quản trị viên duyệt.', { duration: 6000 })
  window.dispatchEvent(new Event(PENDING_REVIEW_EVENT))
}

export function installPendingReviewToastGuard() {
  const original = toast.success
  toast.success = (message, options) => {
    if (Date.now() - lastPendingAt < 2500) return undefined
    return original(message, options)
  }
}
