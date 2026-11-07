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
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    // Không dùng dữ liệu giả khi API chưa khả dụng
  }
  return []
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

export const getStudentCefrStats = async () => {
  try {
    const res = await api.get(ENDPOINTS.stats?.cefrDistribution || '/admin/stats/cefr-distribution')
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    // Không dùng mock, tổng hợp từ API người dùng thật
  }

  try {
    const usersRes = await api.get(ENDPOINTS.users.list, { params: { page: 0, size: 200 } })
    const payload = usersRes?.data !== undefined ? usersRes.data : usersRes
    const users = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
    const students = users.filter((u) => String(u.role || '').toLowerCase() === 'student')

    const CEFR_CONFIG = [
      { level: 'A1', label: 'A1 (Mới bắt đầu)', color: '#38BDF8' },
      { level: 'A2', label: 'A2 (Sơ cấp)', color: '#0284C7' },
      { level: 'B1', label: 'B1 (Trung cấp)', color: '#1B3A57' },
      { level: 'B2', label: 'B2 (Trung cao cấp)', color: '#10B981' },
      { level: 'C1', label: 'C1 (Cao cấp)', color: '#F59E0B' },
    ]

    const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 }
    let totalTested = 0

    students.forEach((s) => {
      const lvl = String(s.cefrLevel || '').toUpperCase()
      if (lvl in counts) {
        counts[lvl]++
        totalTested++
      } else if (lvl === 'C2') {
        counts.C1 = (counts.C1 || 0) + 1
        totalTested++
      }
    })

    return CEFR_CONFIG.map((cfg) => {
      const count = counts[cfg.level] || 0
      const value = totalTested > 0 ? Math.round((count / totalTested) * 100) : 0
      return {
        label: cfg.label,
        value,
        count,
        color: cfg.color,
      }
    })
  } catch (e) {
    return [
      { label: 'A1 (Mới bắt đầu)', value: 0, count: 0, color: '#38BDF8' },
      { label: 'A2 (Sơ cấp)', value: 0, count: 0, color: '#0284C7' },
      { label: 'B1 (Trung cấp)', value: 0, count: 0, color: '#1B3A57' },
      { label: 'B2 (Trung cao cấp)', value: 0, count: 0, color: '#10B981' },
      { label: 'C1 (Cao cấp)', value: 0, count: 0, color: '#F59E0B' },
    ]
  }
}

export const getTeacherPerformanceStats = async () => {
  try {
    const res = await api.get(ENDPOINTS.stats?.teacherPerformance || '/admin/stats/teacher-performance')
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    // Không dùng mock, tổng hợp từ API lớp học & giáo viên thật
  }

  try {
    const [classesRes, usersRes] = await Promise.allSettled([
      api.get(ENDPOINTS.teacher.classes),
      api.get(ENDPOINTS.users.list, { params: { page: 0, size: 200 } }),
    ])

    const classesData = classesRes.status === 'fulfilled' ? classesRes.value : []
    const classes = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : []

    const usersData = usersRes.status === 'fulfilled' ? usersRes.value : {}
    const users = Array.isArray(usersData?.items) ? usersData.items : Array.isArray(usersData?.data?.items) ? usersData.data.items : []
    const teachers = users.filter((u) => String(u.role || '').toLowerCase() === 'teacher')

    const classAssignmentsMap = {}
    await Promise.allSettled(
      classes.map(async (cls) => {
        try {
          const aRes = await api.get(ENDPOINTS.teacher.assignments, { path: { id: cls.id } })
          const aList = Array.isArray(aRes?.data) ? aRes.data : Array.isArray(aRes) ? aRes : []
          classAssignmentsMap[cls.id] = aList
        } catch {
          classAssignmentsMap[cls.id] = []
        }
      })
    )

    const stats = teachers.map((t) => {
      const tClasses = classes.filter((c) => c.teacherId === t.id)
      let graded = 0
      let totalSubs = 0
      let students = 0

      tClasses.forEach((c) => {
        students += (c.studentCount || c.currentStudents || 0)
        const assignments = classAssignmentsMap[c.id] || []
        assignments.forEach((a) => {
          graded += (a.gradedCount || 0)
          totalSubs += (a.submissionCount || 0)
        })
      })

      const pending = Math.max(0, totalSubs - graded)
      const rate = totalSubs > 0 ? Math.round((graded / totalSubs) * 100) : 100

      return {
        teacher: t.displayName || `Giáo viên #${t.id}`,
        graded,
        pending,
        classes: tClasses.length,
        students,
        rate,
      }
    })

    stats.sort((a, b) => b.classes - a.classes || b.students - a.students || b.graded - a.graded)
    return stats
  } catch (e) {
    return []
  }
}

export const getStudentHourlyActivity = async () => {
  try {
    const res = await api.get(ENDPOINTS.stats?.hourlyActivity || '/admin/stats/hourly-activity')
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    // Không dùng mock
  }

  try {
    const usersRes = await api.get(ENDPOINTS.users.list, { params: { page: 0, size: 200 } })
    const payload = usersRes?.data !== undefined ? usersRes.data : usersRes
    const users = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []

    const hourSlots = ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '20h', '22h']
    const counts = {
      '0h': 0, '3h': 0, '6h': 0, '9h': 0, '12h': 0, '15h': 0, '18h': 0, '20h': 0, '22h': 0,
    }

    users.forEach((u) => {
      const timeStr = u.lastLoginAt || u.createdAt
      if (!timeStr) return
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return
      const hour = date.getHours()

      if (hour >= 0 && hour < 3) counts['0h']++
      else if (hour >= 3 && hour < 6) counts['3h']++
      else if (hour >= 6 && hour < 9) counts['6h']++
      else if (hour >= 9 && hour < 12) counts['9h']++
      else if (hour >= 12 && hour < 15) counts['12h']++
      else if (hour >= 15 && hour < 18) counts['15h']++
      else if (hour >= 18 && hour < 20) counts['18h']++
      else if (hour >= 20 && hour < 22) counts['20h']++
      else counts['22h']++
    })

    return hourSlots.map((h) => ({
      hour: h,
      learners: counts[h] || 0,
    }))
  } catch (e) {
    return [
      { hour: '0h', learners: 0 },
      { hour: '3h', learners: 0 },
      { hour: '6h', learners: 0 },
      { hour: '9h', learners: 0 },
      { hour: '12h', learners: 0 },
      { hour: '15h', learners: 0 },
      { hour: '18h', learners: 0 },
      { hour: '20h', learners: 0 },
      { hour: '22h', learners: 0 },
    ]
  }
}

export const getStudentRetentionStats = async () => {
  try {
    const res = await api.get(ENDPOINTS.stats?.retention || '/admin/stats/student-retention')
    const data = res?.data !== undefined ? res.data : res
    if (data && typeof data === 'object' && data.activeWeek !== undefined) return data
  } catch (err) {
    // Không dùng mock, tính toán từ dữ liệu người dùng thực tế
  }

  try {
    const usersRes = await api.get(ENDPOINTS.users.list, { params: { page: 0, size: 200 } })
    const payload = usersRes?.data !== undefined ? usersRes.data : usersRes
    const users = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
    const students = users.filter((u) => String(u.role || '').toLowerCase() === 'student')

    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const threeDaysMs = 3 * oneDayMs
    const sevenDaysMs = 7 * oneDayMs

    let activeToday = 0
    let activeWeek = 0
    let atRisk3To7Days = 0
    let atRiskOver7Days = 0
    const atRiskStudentsList = []

    students.forEach((s) => {
      const lastActive = s.lastLoginAt
        ? new Date(s.lastLoginAt).getTime()
        : s.createdAt
          ? new Date(s.createdAt).getTime()
          : 0

      const elapsed = now - lastActive
      const inactiveDays = Math.floor(elapsed / oneDayMs)

      if (elapsed <= oneDayMs) {
        activeToday++
      }
      if (elapsed <= sevenDaysMs) {
        activeWeek++
      } else {
        atRiskOver7Days++
        atRiskStudentsList.push({
          id: s.id,
          displayName: s.displayName || s.email,
          email: s.email,
          avatarUrl: s.avatarUrl,
          lastActive: s.lastLoginAt || s.createdAt,
          inactiveDays: Math.max(7, inactiveDays),
        })
      }

      if (elapsed > threeDaysMs && elapsed <= sevenDaysMs) {
        atRisk3To7Days++
      }
    })

    return {
      activeToday,
      activeWeek,
      atRisk3To7Days,
      atRiskOver7Days,
      atRiskStudentsList,
    }
  } catch (e) {
    return {
      activeToday: 0,
      activeWeek: 0,
      atRisk3To7Days: 0,
      atRiskOver7Days: 0,
      atRiskStudentsList: [],
    }
  }
}
