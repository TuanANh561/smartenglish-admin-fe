/**
 * Bảng ánh xạ: 'PHƯƠNG_THỨC + đường dẫn' → dữ liệu giả.
 *
 * Khoá luôn lấy từ ENDPOINTS, không gõ tay chuỗi đường dẫn — đổi đường dẫn
 * trong endpoints.js thì bảng này tự khớp theo.
 *
 * Giá trị có thể là:
 *   - dữ liệu tĩnh          → trả nguyên vẹn (đã clone)
 *   - hàm ({ path, params, data }) → tự xử lý cắt trang, lọc, tìm kiếm
 */
import { ENDPOINTS } from '../lib/endpoints'
import { paginate } from './utils'
import * as dashboard from './data/dashboard'
import { users, roles } from './data/users'
import { orders, plans, coupons, revenueSummary } from './data/payments'

const notFound = { status: 404, message: 'Không tìm thấy dữ liệu.', details: null }

function findOr404(collection, id) {
  const found = collection.find((item) => item.id === id)
  if (!found) throw notFound
  return structuredClone(found)
}

export const handlers = {
  // ── Thống kê / Dashboard ────────────────────────────────────────
  [`GET ${ENDPOINTS.stats.overview}`]: dashboard.overview,
  [`GET ${ENDPOINTS.stats.activeUsers}`]: dashboard.activeUsers,
  [`GET ${ENDPOINTS.stats.featureUsage}`]: dashboard.featureUsage,
  [`GET ${ENDPOINTS.stats.recentActivity}`]: ({ params }) =>
    structuredClone(dashboard.recentActivity.slice(0, params?.limit ?? 4)),
  [`GET ${ENDPOINTS.stats.aiUsage}`]: dashboard.aiUsage,

  // ── Doanh thu ───────────────────────────────────────────────────
  [`GET ${ENDPOINTS.revenue.summary}`]: revenueSummary,
  [`GET ${ENDPOINTS.revenue.byMonth}`]: dashboard.revenueByMonth,

  // ── Người dùng ──────────────────────────────────────────────────
  [`GET ${ENDPOINTS.users.list}`]: ({ params }) =>
    paginate(users, {
      ...params,
      searchFields: ['displayName', 'email'],
      filters: { role: params?.role, plan: params?.plan },
    }),
  [`GET ${ENDPOINTS.users.detail}`]: ({ path }) => findOr404(users, path.id),
  [`PATCH ${ENDPOINTS.users.update}`]: ({ path, data }) => ({
    ...findOr404(users, path.id),
    ...data,
  }),
  [`POST ${ENDPOINTS.users.lock}`]: ({ path }) => ({
    ...findOr404(users, path.id),
    isActive: false,
  }),
  [`POST ${ENDPOINTS.users.unlock}`]: ({ path }) => ({
    ...findOr404(users, path.id),
    isActive: true,
  }),

  // ── Vai trò ─────────────────────────────────────────────────────
  [`GET ${ENDPOINTS.roles.list}`]: roles,
  [`GET ${ENDPOINTS.roles.detail}`]: ({ path }) => findOr404(roles, path.id),

  // ── Đơn hàng, gói, mã giảm giá ──────────────────────────────────
  [`GET ${ENDPOINTS.orders.list}`]: ({ params }) =>
    paginate(orders, {
      ...params,
      searchFields: ['invoiceNumber', 'userName', 'userEmail'],
      filters: { status: params?.status, gateway: params?.gateway },
    }),
  [`GET ${ENDPOINTS.orders.detail}`]: ({ path }) => findOr404(orders, path.id),
  [`GET ${ENDPOINTS.plans.list}`]: plans,
  [`GET ${ENDPOINTS.coupons.list}`]: ({ params }) =>
    paginate(coupons, { ...params, searchFields: ['code'] }),
  [`GET ${ENDPOINTS.coupons.detail}`]: ({ path }) => findOr404(coupons, path.id),
}
