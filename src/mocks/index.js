/**
 * Bộ giải dữ liệu giả.
 *
 * Toàn bộ thư mục `src/mocks` là tạm thời. Khi backend xong:
 *   1. Đặt VITE_USE_MOCK=false trong .env
 *   2. Xoá cả thư mục này
 * Code trong `src/features` không cần sửa dòng nào.
 */
import { handlers } from './handlers'

const DELAY_MS = 350

export async function resolveMock(method, endpoint, ctx) {
  const key = `${method} ${endpoint}`
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  const handler = handlers[key]
  if (!handler) {
    throw {
      status: 501,
      message: `Chưa có dữ liệu giả cho "${key}". Thêm vào src/mocks/handlers.js.`,
      details: null,
    }
  }

  return typeof handler === 'function' ? handler(ctx) : structuredClone(handler)
}
