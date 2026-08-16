import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lớp gọi dữ liệu xác thực. Không biết mock tồn tại — mock/API thật do
 * VITE_USE_MOCK quyết định trong lib/api.js.
 */

export const login = (payload) => api.post(ENDPOINTS.auth.login, { data: payload })

export const logout = () => api.post(ENDPOINTS.auth.logout)

export const getMe = () => api.get(ENDPOINTS.auth.me)
