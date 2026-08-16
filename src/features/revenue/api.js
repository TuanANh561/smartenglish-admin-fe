import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

export const getTransactions = ({
  page = 1,
  size = 10,
  search,
  status,
  planType,
  sortBy,
  sortDir,
} = {}) =>
  api.get(ENDPOINTS.revenue.transactions, {
    params: { page, size, search, status, planType, sortBy, sortDir },
  })

export const getRevenueStats = () => api.get(ENDPOINTS.revenue.stats)
