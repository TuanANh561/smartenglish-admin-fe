import axios from 'axios'
import { ENDPOINTS } from './endpoints'

/**
 * Điểm chuyển mạch giữa dữ liệu giả và API thật.
 *
 * Mặc định là mock. Khi backend sẵn sàng: đặt VITE_USE_MOCK=false trong .env
 * — không phải sửa bất kỳ file feature nào.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * Mô hình JWT access + refresh token (chuẩn bị trước cho backend thật):
 * - `se_admin_token`: access token, sống ngắn, gửi kèm mọi request qua header Authorization.
 * - `se_admin_refresh_token`: refresh token, sống dài, CHỈ dùng để xin access token mới.
 * Khi một request báo 401 (hết hạn access token), `request()` tự xin token mới bằng
 * refresh token rồi gọi lại request đó một lần. Nếu refresh cũng thất bại, xoá cả hai
 * token và phát sự kiện `se-admin:unauthorized` để tầng UI (authStore) chuyển về đăng nhập.
 */
const TOKEN_KEY = 'se_admin_token'
const REFRESH_TOKEN_KEY = 'se_admin_refresh_token'

// localStorage được truy cập động để hỗ trợ môi trường trình duyệt và test runner
const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null)
const getStoredToken = (key) => getStorage()?.getItem(key) ?? null

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080'
const safeBaseURL = rawBaseURL.replace('localhost', '127.0.0.1')

export const http = axios.create({
  baseURL: safeBaseURL,
  timeout: 30000, // 30 giây timeout chống treo request vô hạn
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getStoredToken(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => {
    const res = response.data
    // Nếu backend trả về ErrorResponse dạng { status: 4xx/5xx, error: "...", message: "..." }
    if (res && typeof res === 'object' && typeof res.status === 'number' && res.status >= 400) {
      const err = new Error(res.message || res.error || 'Lỗi xử lý từ máy chủ')
      err.response = { status: res.status, data: res }
      return Promise.reject(err)
    }
    // Tự động giải nén vỏ ApiResponse { status, message, data } nếu backend trả về
    if (res && typeof res === 'object' && 'data' in res && ('status' in res || 'code' in res)) {
      return res.data !== undefined && res.data !== null ? res.data : res
    }
    return res
  },
  (error) => Promise.reject(toApiError(error)),
)

/** Chuẩn hoá lỗi để UI luôn nhận cùng một hình dạng, thông báo bằng tiếng Việt. */
function toApiError(error) {
  const status = error.response?.status
  const messages = {
    400: 'Dữ liệu gửi lên không hợp lệ.',
    401: 'Phiên đăng nhập đã hết hạn.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy dữ liệu.',
    409: 'Dữ liệu bị trùng hoặc đang xung đột.',
    422: 'Dữ liệu không hợp lệ.',
    500: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
  }
  return {
    status: status ?? 0,
    message:
      error.response?.data?.message ??
      messages[status] ??
      (error.code === 'ECONNABORTED'
        ? 'Yêu cầu quá thời gian chờ.'
        : 'Không kết nối được máy chủ.'),
    details: error.response?.data?.errors ?? null,
  }
}

/** '/admin/users/:id' + { id: 7 } → '/admin/users/7' */
function buildPath(template, path = {}) {
  return template.replace(/:(\w+)/g, (_, key) => {
    if (path[key] === undefined || path[key] === null) {
      throw new Error(`Thiếu tham số "${key}" cho đường dẫn ${template}`)
    }
    return encodeURIComponent(path[key])
  })
}

function setTokens({ accessToken, refreshToken } = {}) {
  const s = getStorage()
  if (accessToken) s?.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) s?.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearTokens() {
  const s = getStorage()
  s?.removeItem(TOKEN_KEY)
  s?.removeItem(REFRESH_TOKEN_KEY)
}

// Endpoint xác thực tự thân — không được thử refresh khi chính chúng báo 401,
// nếu không sẽ lặp vô hạn.
const NO_RETRY_ENDPOINTS = new Set([
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.refresh,
  '/auth/login',
  '/auth/admin/login',
  '/auth/refresh',
])

let refreshPromise = null

/** Xin access token mới bằng refresh token đang lưu. Nhiều lệnh gọi cùng lúc dùng chung một lần xin. */
function refreshAccessToken() {
  const refreshToken = getStoredToken(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    return Promise.reject({ status: 401, message: 'Chưa đăng nhập.', details: null })
  }

  if (!refreshPromise) {
    refreshPromise = request('POST', ENDPOINTS.auth.refresh, { data: { refreshToken } })
      .then((tokens) => {
        setTokens(tokens)
        return tokens
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function request(method, endpoint, options = {}, isRetry = false) {
  const { path, params, data, ...config } = options

  try {
    // Chỉ gọi backend thật cho các endpoint đã triển khai
    // Các endpoint khác tiếp tục dùng mock nếu chưa sẵn sàng
    const isReadyBackend =
      endpoint.startsWith('/auth') ||
      endpoint.startsWith('/api/v1/auth') ||
      endpoint.startsWith('/users') ||
      endpoint.startsWith('/api/v1/users') ||
      endpoint.startsWith('/admin/words') ||
      endpoint.startsWith('/admin/users') ||
      endpoint.startsWith('/admin/audit-logs') ||
      endpoint.startsWith('/admin/reports') ||
      endpoint.startsWith('/admin/teacher-registrations') ||
      endpoint.startsWith('/admin/reading-passages') ||
      endpoint.startsWith('/admin/courses') ||
      endpoint.startsWith('/admin/lessons') ||
      endpoint.startsWith('/admin/upload') ||
      endpoint.startsWith('/admin/speaking') ||
      endpoint.startsWith('/admin/pronunciation-lessons') ||
      endpoint.startsWith('/admin/grammar-lessons') ||
      endpoint.startsWith('/admin/listening-lessons') ||
      endpoint.startsWith('/admin/exams') ||
      endpoint.startsWith('/admin/quizzes') ||
      endpoint.startsWith('/content/listening') ||
      endpoint.startsWith('/admin/ai') ||
      endpoint.startsWith('/ai-practice') ||
      endpoint.startsWith('/content/courses') ||
      endpoint.startsWith('/api/v1/teacher') ||
      endpoint.startsWith('/teacher') ||
      endpoint.startsWith('/payment') ||
      endpoint.startsWith('/api/v1/payment') ||
      endpoint.startsWith('/admin/coupons') ||
      endpoint.startsWith('/admin/plans') ||
      endpoint.startsWith('/admin/subscriptions') ||
      endpoint.startsWith('/admin/orders') ||
      endpoint.startsWith('/admin/revenue') ||
      endpoint.startsWith('/admin/transactions') ||
      endpoint.startsWith('/admin/stats') ||
      endpoint.startsWith('/api/v1/notifications') ||
      endpoint.startsWith('/notifications') ||
      endpoint.startsWith('/admin/notifications')

    if (USE_MOCK || !isReadyBackend) {
      const { resolveMock } = await import('../mocks')
      return await resolveMock(method, endpoint, {
        path,
        params,
        data,
        token: getStoredToken(TOKEN_KEY),
      })
    }

    return await http.request({
      method,
      url: buildPath(endpoint, path),
      params,
      data,
      ...config,
    })
  } catch (error) {
    const canRetryWithRefresh =
      error.status === 401 &&
      !isRetry &&
      !NO_RETRY_ENDPOINTS.has(endpoint) &&
      getStoredToken(REFRESH_TOKEN_KEY)

    if (canRetryWithRefresh) {
      await refreshAccessToken()
      return request(method, endpoint, options, true)
    }

    if (error.status === 401) {
      clearTokens()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('se-admin:unauthorized'))
      }
    }
    throw error
  }
}

export const api = {
  get: (endpoint, options) => request('GET', endpoint, options),
  post: (endpoint, dataOrOptions, options = {}) => {
    if (
      dataOrOptions &&
      typeof dataOrOptions === 'object' &&
      !Array.isArray(dataOrOptions) &&
      !('data' in dataOrOptions || 'params' in dataOrOptions || 'headers' in dataOrOptions || 'path' in dataOrOptions)
    ) {
      return request('POST', endpoint, { data: dataOrOptions, ...options })
    }
    return request('POST', endpoint, { ...dataOrOptions, ...options })
  },
  put: (endpoint, dataOrOptions, options = {}) => {
    if (
      dataOrOptions &&
      typeof dataOrOptions === 'object' &&
      !Array.isArray(dataOrOptions) &&
      !('data' in dataOrOptions || 'params' in dataOrOptions || 'headers' in dataOrOptions || 'path' in dataOrOptions)
    ) {
      return request('PUT', endpoint, { data: dataOrOptions, ...options })
    }
    return request('PUT', endpoint, { ...dataOrOptions, ...options })
  },
  patch: (endpoint, dataOrOptions, options = {}) => {
    if (
      dataOrOptions &&
      typeof dataOrOptions === 'object' &&
      !Array.isArray(dataOrOptions) &&
      !('data' in dataOrOptions || 'params' in dataOrOptions || 'headers' in dataOrOptions || 'path' in dataOrOptions)
    ) {
      return request('PATCH', endpoint, { data: dataOrOptions, ...options })
    }
    return request('PATCH', endpoint, { ...dataOrOptions, ...options })
  },
  del: (endpoint, options) => request('DELETE', endpoint, options),
}

export default api
export { USE_MOCK, TOKEN_KEY, REFRESH_TOKEN_KEY, setTokens, clearTokens }
