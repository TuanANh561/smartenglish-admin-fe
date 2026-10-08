import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lấy danh sách giao dịch & đối soát từ backend payment-service
 * @param {object} params
 */
export const getTransactions = async (params = {}) => {
  const { page = 1, size = 10, search, status, gateway, planType } = params
  const queryParams = { page, size }
  if (search?.trim()) queryParams.search = search.trim()
  if (status && status !== 'all') queryParams.status = status
  if (gateway && gateway !== 'all') queryParams.gateway = gateway
  if (planType && planType !== 'all') queryParams.planType = planType

  const res = await api.get('/admin/transactions', { params: queryParams })
  return res?.data !== undefined ? res.data : res
}

/**
 * Lấy số liệu KPI doanh thu & đối soát từ backend
 */
export const getReconciliationStats = async () => {
  const res = await api.get(ENDPOINTS.revenue.stats)
  return res?.data !== undefined ? res.data : res
}

/**
 * Phê duyệt hoàn tiền cho giao dịch
 * @param {string|number} id
 * @param {string} reason
 */
export const approveRefund = async (id, reason) => {
  const res = await api.post(`/admin/transactions/${id}/refund`, {
    data: { reason: reason || 'Phê duyệt hoàn tiền từ Quản trị viên' },
  })
  return res?.data !== undefined ? res.data : res
}

/**
 * Từ chối yêu cầu hoàn tiền cho giao dịch
 * @param {string|number} id
 * @param {string} reason
 */
export const rejectRefund = async (id, reason) => {
  const res = await api.post(`/admin/transactions/${id}/reject-refund`, {
    data: { reason: reason || 'Từ chối yêu cầu hoàn tiền' },
  })
  return res?.data !== undefined ? res.data : res
}
