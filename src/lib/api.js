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

// localStorage không tồn tại khi chạy test dưới Node — bọc lại để không vỡ.
const storage = typeof window !== 'undefined' ? window.localStorage : null
const getStoredToken = (key) => storage?.getItem(key) ?? null

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getStoredToken(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response.data,
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
  if (accessToken) storage?.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) storage?.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearTokens() {
  storage?.removeItem(TOKEN_KEY)
  storage?.removeItem(REFRESH_TOKEN_KEY)
}

// Endpoint xác thực tự thân — không được thử refresh khi chính chúng báo 401,
// nếu không sẽ lặp vô hạn.
const NO_RETRY_ENDPOINTS = new Set([ENDPOINTS.auth.login, ENDPOINTS.auth.refresh])

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
    if (USE_MOCK) {
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
  post: (endpoint, options) => request('POST', endpoint, options),
  put: (endpoint, options) => request('PUT', endpoint, options),
  patch: (endpoint, options) => request('PATCH', endpoint, options),
  del: (endpoint, options) => request('DELETE', endpoint, options),
}

export { USE_MOCK, TOKEN_KEY, REFRESH_TOKEN_KEY, setTokens, clearTokens }
