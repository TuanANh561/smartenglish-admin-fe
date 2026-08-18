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
import { transactions } from './data/transactions'
import { createMockToken, decodeMockToken, isTokenExpired } from './tokenUtils'

const notFound = { status: 404, message: 'Không tìm thấy dữ liệu.', details: null }
const sessionExpired = {
  status: 401,
  message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  details: null,
}

function findOr404(collection, id) {
  const found = collection.find((item) => item.id === id)
  if (!found) throw notFound
  return structuredClone(found)
}

// Access token sống ngắn (15 phút), refresh token sống dài (7 ngày) — như JWT thật.
const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

function issueTokenPair(user) {
  return {
    accessToken: createMockToken(user, ACCESS_TTL_SECONDS, 'access'),
    refreshToken: createMockToken(user, REFRESH_TTL_SECONDS, 'refresh'),
  }
}

export const handlers = {
  // ── Xác thực ────────────────────────────────────────────────────
  [`POST ${ENDPOINTS.auth.login}`]: ({ data }) => {
    const { email, password } = data ?? {}
    const user = users.find((item) => item.email === email)
    const validPassword =
      (user?.role === 'admin' && password === 'admin123') ||
      (user?.role === 'teacher' && password === 'teacher123')

    if (!user || !validPassword) {
      throw { status: 401, message: 'Email hoặc mật khẩu không đúng.', details: null }
    }

    return { ...issueTokenPair(user), user: structuredClone(user) }
  },

  [`POST ${ENDPOINTS.auth.refresh}`]: ({ data }) => {
    const payload = decodeMockToken(data?.refreshToken)
    if (!payload || payload.type !== 'refresh' || isTokenExpired(payload)) {
      throw sessionExpired
    }
    const user = users.find((item) => item.id === payload.sub)
    if (!user) throw sessionExpired
    return issueTokenPair(user)
  },

  [`GET ${ENDPOINTS.auth.me}`]: ({ token }) => {
    const payload = decodeMockToken(token)
    if (!payload || payload.type !== 'access' || isTokenExpired(payload)) {
      throw sessionExpired
    }
    const user = users.find((item) => item.id === payload.sub)
    if (!user) throw sessionExpired
    return structuredClone(user)
  },

  [`POST ${ENDPOINTS.auth.logout}`]: () => ({ success: true }),

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
  [`GET ${ENDPOINTS.revenue.transactions}`]: ({ params }) =>
    paginate(transactions, {
      ...params,
      searchFields: ['studentName', 'studentEmail'],
      filters: { status: params?.status, plan: params?.planType },
    }),
  [`GET ${ENDPOINTS.revenue.stats}`]: {
    totalRevenue: 45_200_000,
    totalTransactions: 1_234,
    averageOrderValue: 36_667,
    conversionRate: 3.2,
  },

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
  [`POST ${ENDPOINTS.users.lock}`]: ({ path }) => {
    const target = users.find((item) => item.id === path.id)
    if (!target) throw notFound
    target.isActive = false
    return structuredClone(target)
  },
  [`POST ${ENDPOINTS.users.unlock}`]: ({ path }) => {
    const target = users.find((item) => item.id === path.id)
    if (!target) throw notFound
    target.isActive = true
    return structuredClone(target)
  },

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
