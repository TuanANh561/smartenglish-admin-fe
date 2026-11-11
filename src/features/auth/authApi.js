import { api, REFRESH_TOKEN_KEY } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lớp gọi dữ liệu xác thực.
 */

export const login = async (payload) => {
  const body = {
    emailOrUsername: payload.emailOrUsername || payload.email || payload.username,
    password: payload.password,
  }
  try {
    return await api.post('/auth/login', { data: body })
  } catch (err) {
    // Fallback sang /auth/admin/login nếu đăng nhập bằng username không chứa @
    if (!String(body.emailOrUsername || '').includes('@') || err?.status === 404) {
      return await api.post(ENDPOINTS.auth.login, { data: body })
    }
    throw err
  }
}

export const logout = () => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
  return api.post(ENDPOINTS.auth.logout, { data: { refreshToken } })
}

export const getMe = () => api.get(ENDPOINTS.auth.me)

export const registerTeacher = (data) => api.post('/auth/register-teacher', { data })

export const getTeacherRegistrationStatus = (email) =>
  api.get('/auth/teacher-registration/status', { params: { email } })

