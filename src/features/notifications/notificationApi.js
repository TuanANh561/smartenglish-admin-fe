import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lấy danh sách thông báo của user/teacher (hỗ trợ phân trang, lọc chưa đọc)
 */
export const getNotifications = ({ userId, unreadOnly = false, page = 0, size = 20 } = {}) =>
  api.get(ENDPOINTS.notifications.list, {
    params: { userId, unreadOnly, page, size },
  })

/**
 * Đếm số lượng thông báo chưa đọc (cho icon chuông)
 */
export const getUnreadNotificationCount = (userId) =>
  api.get(ENDPOINTS.notifications.unreadCount, {
    params: { userId },
  })

/**
 * Đánh dấu 1 thông báo là đã đọc
 */
export const markNotificationAsRead = (id, userId) =>
  api.patch(ENDPOINTS.notifications.markRead, {
    path: { id },
    params: { userId },
  })

/**
 * Đánh dấu toàn bộ thông báo của user là đã đọc
 */
export const markAllNotificationsAsRead = (userId) =>
  api.patch(ENDPOINTS.notifications.markAllRead, {
    params: { userId },
  })

/**
 * Xóa thông báo
 */
export const deleteNotification = (id, userId) =>
  api.del(ENDPOINTS.notifications.remove, {
    path: { id },
    params: { userId },
  })

/**
 * Tạo & gửi thông báo mới (In-App / Email / Push)
 */
export const createNotification = (data) =>
  api.post(ENDPOINTS.notifications.create, {
    data,
  })

/**
 * Gửi email trực tiếp (HTML template theo mẫu)
 */
export const sendDirectEmail = (data) =>
  api.post(ENDPOINTS.notifications.email, {
    data,
  })

/**
 * Lấy danh sách lịch hẹn thông báo / nhắc nhở trong lịch
 */
export const getScheduledNotifications = ({ creatorId, status } = {}) =>
  api.get(ENDPOINTS.notifications.schedules, {
    params: { creatorId, status },
  })

/**
 * Đặt lịch hẹn thông báo trong lịch
 */
export const createScheduledNotification = (data) =>
  api.post(ENDPOINTS.notifications.schedules, {
    data,
  })

/**
 * Hủy lịch hẹn thông báo
 */
export const cancelScheduledNotification = (id, creatorId) =>
  api.del(ENDPOINTS.notifications.removeSchedule, {
    path: { id },
    params: { creatorId },
  })

/**
 * Lấy lịch sử hoạt động của người dùng
 */
export const getUserActivities = ({ userId, page = 0, size = 20 } = {}) =>
  api.get(ENDPOINTS.notifications.activities, {
    params: { userId, page, size },
  })

/**
 * Ghi nhận một hoạt động thành công
 */
export const logUserActivity = (data) =>
  api.post(ENDPOINTS.notifications.logActivity, {
    data,
  })
