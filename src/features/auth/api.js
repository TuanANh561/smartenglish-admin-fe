import { api, REFRESH_TOKEN_KEY } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lớp gọi dữ liệu xác thực.
 */

export const login = (payload) => {
  const body = {
    emailOrUsername: payload.emailOrUsername || payload.email || payload.username,
    password: payload.password,
  }
  return api.post(ENDPOINTS.auth.login, { data: body })
}

export const logout = () => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
  return api.post(ENDPOINTS.auth.logout, { data: { refreshToken } })
}

export const getMe = () => api.get(ENDPOINTS.auth.me)

