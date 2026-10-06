import api from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lấy toàn bộ danh sách gói dịch vụ dành cho Admin (Học viên, Giáo viên, Gói mua sỉ)
 */
export const getAdminPlans = async () => {
  const res = await api.get(ENDPOINTS.plans.adminList)
  return res.data || res
}

/**
 * Lấy dữ liệu KPI thống kê thật từ database
 */
export const getAdminStats = async () => {
  const res = await api.get(ENDPOINTS.plans.stats || '/payment/admin/stats')
  return res.data || res
}

/**
 * Lấy danh sách mã ưu đãi thật từ database
 */
export const getCoupons = async () => {
  const res = await api.get('/payment/admin/coupons')
  return res.data || res
}

/**
 * Tạo mã ưu đãi mới vào database
 */
export const createCoupon = async (couponData) => {
  const res = await api.post('/payment/admin/coupons', couponData)
  return res.data || res
}

/**
 * Xóa mã ưu đãi khỏi database
 */
export const deleteCoupon = async (id) => {
  const res = await api.del(`/payment/admin/coupons/${id}`)
  return res.data || res
}

/**
 * Lưu / cập nhật hàng loạt danh sách gói dịch vụ
 * @param {Array} plans - Danh sách các gói cập nhật
 */
export const batchSavePlans = async (plans) => {
  const res = await api.put(ENDPOINTS.plans.batchSave, { data: plans })
  return res.data || res
}

/**
 * Lưu hoặc tạo mới 1 gói đơn lẻ
 * @param {Object} plan - Thông tin gói
 */
export const savePlan = async (plan) => {
  const res = await api.post(ENDPOINTS.plans.create, { data: plan })
  return res.data || res
}

/**
 * Xóa / vô hiệu hóa gói dịch vụ
 * @param {string} id - Mã ID của gói
 */
export const deletePlan = async (id) => {
  const res = await api.del(ENDPOINTS.plans.remove, { path: { id } })
  return res.data || res
}
