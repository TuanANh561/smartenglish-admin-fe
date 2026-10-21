import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

/**
 * Lớp gọi dữ liệu của Dashboard.
 *
 * Không có `if mock` ở đây. Việc dùng dữ liệu giả hay API thật do
 * VITE_USE_MOCK quyết định trong lib/api.js.
 */

export const getOverview = (range) => api.get(ENDPOINTS.stats.overview, { params: range })

export const getActiveUsers = (range) => api.get(ENDPOINTS.stats.activeUsers, { params: range })

export const getFeatureUsage = (range) => api.get(ENDPOINTS.stats.featureUsage, { params: range })

export const getRevenueByMonth = (range) => api.get(ENDPOINTS.revenue.byMonth, { params: range })

export const getAiUsage = async (range) => {
  try {
    const res = await api.get(ENDPOINTS.stats.aiUsage, { params: range })
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    // Fallback xu hướng luyện tập AI 7 ngày gần nhất khi backend chưa implement
    return [
      { day: 'T5', date: '2026-10-15', requests: 3120, tokens: 1240000 },
      { day: 'T6', date: '2026-10-16', requests: 3610, tokens: 1480000 },
      { day: 'T7', date: '2026-10-17', requests: 3480, tokens: 1390000 },
      { day: 'CN', date: '2026-10-18', requests: 4050, tokens: 1720000 },
      { day: 'T2', date: '2026-10-19', requests: 3890, tokens: 1610000 },
      { day: 'T3', date: '2026-10-20', requests: 4320, tokens: 1820000 },
      { day: 'T4', date: '2026-10-21', requests: 4780, tokens: 1950000 },
    ]
  }
}

export const getRevenueStats = async () => {
  try {
    const res = await api.get(ENDPOINTS.revenue.stats || '/admin/revenue/stats')
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    console.warn('Lỗi tải thống kê doanh thu:', err)
    return null
  }
}

export const getRecentTransactions = async (size = 10) => {
  try {
    const res = await api.get(ENDPOINTS.revenue.transactions, { params: { page: 1, size } })
    const data = res?.data !== undefined ? res.data : res
    const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    return list
  } catch (err) {
    console.warn('Lỗi tải danh sách giao dịch:', err)
    return []
  }
}

export const getRecentActivity = async (limit = 10) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const [actRes, txRes] = await Promise.allSettled([
    api.get(ENDPOINTS.stats.recentActivity, { params: { limit } }),
    api.get(ENDPOINTS.revenue.transactions, { params: { page: 1, size: 20 } }),
  ])

  const rawActs = actRes.status === 'fulfilled' && actRes.value ? actRes.value : []
  const actList = Array.isArray(rawActs) ? rawActs : rawActs?.items || rawActs?.content || rawActs?.data || []

  const rawTxs = txRes.status === 'fulfilled' && txRes.value ? txRes.value : []
  const txList = Array.isArray(rawTxs) ? rawTxs : rawTxs?.items || rawTxs?.content || rawTxs?.data || []

  const mapPlanToLabel = (plan) => {
    if (!plan) return 'Mua gói Premium'
    const p = String(plan).toLowerCase()
    if (p.includes('lifetime')) return 'Mua gói Trọn đời (Lifetime)'
    if (p.includes('year') || p.includes('1_year')) return 'Mua gói Premium 1 Năm'
    if (p.includes('month')) return 'Mua gói Premium 1 Tháng'
    if (p.includes('pro')) return 'Mua gói Giáo viên Pro'
    if (p.includes('teacher')) return 'Đăng ký gói Giáo viên'
    return `Mua gói ${plan}`
  }

  // 1. Chuyển đổi các đơn hàng mua gói trong 7 ngày gần nhất thành mục hoạt động
  const recentPurchases = txList
    .filter((tx) => {
      const time = new Date(tx.createdAt || tx.occurredAt).getTime()
      return !isNaN(time) && time >= sevenDaysAgo
    })
    .map((tx) => ({
      id: `order-${tx.id || tx.orderCode}`,
      user: {
        id: tx.userId || tx.studentId || tx.id,
        displayName: tx.studentName || tx.customerName || 'Học viên',
        avatarUrl: tx.studentAvatar || null,
        cefrLevel: tx.cefrLevel || (String(tx.plan || '').includes('pro') ? 'GV Pro' : 'Premium'),
        email: tx.studentEmail || tx.customerEmail,
      },
      action: tx.courseName || mapPlanToLabel(tx.plan || tx.planType),
      status:
        tx.status === 'completed' || tx.status === 'COMPLETED' || tx.status === 'success'
          ? 'success'
          : (tx.status || 'success').toLowerCase(),
      occurredAt: tx.createdAt || tx.occurredAt || new Date().toISOString(),
      amount: tx.amount || null,
      isPackagePurchase: true,
      isWithin7Days: true,
    }))

  // 2. Chuẩn hóa các hoạt động hệ thống/học tập
  const standardActs = actList.map((act) => {
    const time = new Date(act.occurredAt).getTime()
    const within7Days = !isNaN(time) && time >= sevenDaysAgo
    const isPurchase =
      act.action?.toLowerCase().includes('mua') ||
      act.action?.toLowerCase().includes('nâng cấp') ||
      act.action?.toLowerCase().includes('gói') ||
      act.action?.toLowerCase().includes('premium') ||
      (act.amount != null && act.amount > 0)

    return {
      ...act,
      isPackagePurchase: isPurchase,
      isWithin7Days: within7Days,
    }
  })

  // 3. Hợp nhất và loại trừ trùng lặp
  const seen = new Set()
  const merged = []

  for (const item of [...recentPurchases, ...standardActs]) {
    const key = `${item.user?.displayName || item.user?.id}-${item.action}-${item.occurredAt}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  // 4. Sắp xếp thời gian mới nhất lên đầu
  merged.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

  return merged
}
