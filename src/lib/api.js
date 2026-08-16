import axios from 'axios'

/**
 * Điểm chuyển mạch giữa dữ liệu giả và API thật.
 *
 * Mặc định là mock. Khi backend sẵn sàng: đặt VITE_USE_MOCK=false trong .env
 * — không phải sửa bất kỳ file feature nào.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const TOKEN_KEY = 'se_admin_token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
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

async function request(method, endpoint, options = {}) {
  const { path, params, data, ...config } = options

  if (USE_MOCK) {
    const { resolveMock } = await import('../mocks')
    return resolveMock(method, endpoint, { path, params, data })
  }

  return http.request({
    method,
    url: buildPath(endpoint, path),
    params,
    data,
    ...config,
  })
}

export const api = {
  get: (endpoint, options) => request('GET', endpoint, options),
  post: (endpoint, options) => request('POST', endpoint, options),
  put: (endpoint, options) => request('PUT', endpoint, options),
  patch: (endpoint, options) => request('PATCH', endpoint, options),
  del: (endpoint, options) => request('DELETE', endpoint, options),
}

export { USE_MOCK, TOKEN_KEY }
