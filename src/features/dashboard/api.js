import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

/**
 * Lớp gọi dữ liệu của Dashboard.
 *
 * Không có `if mock` ở đây. Việc dùng dữ liệu giả hay API thật do
 * VITE_USE_MOCK quyết định trong lib/api.js.
 */

export const getOverview = (range) => api.get(ENDPOINTS.stats.overview, { params: range })

export const getActiveUsers = (range) => api.get(ENDPOINTS.stats.activeUsers, { params: range })

export const getFeatureUsage = (range) => api.get(ENDPOINTS.stats.featureUsage, { params: range })

export const getRevenueByMonth = (range) => api.get(ENDPOINTS.revenue.byMonth, { params: range })

export const getRecentActivity = (limit = 4) =>
  api.get(ENDPOINTS.stats.recentActivity, { params: { limit } })
