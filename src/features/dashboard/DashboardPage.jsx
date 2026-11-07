import { useMemo, lazy, Suspense } from 'react'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Crown,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import BarChartCard from '@/components/charts/BarChartCard'
import DonutCard from '@/components/charts/DonutCard'
import LineChartCard from '@/components/charts/LineChartCard'
import ErrorState from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import KpiCard from '@/features/dashboard/components/KpiCard'
import RecentActivityCard from '@/features/dashboard/components/RecentActivityCard'
import RecentTransactionsCard from '@/features/dashboard/components/RecentTransactionsCard'
import TeacherDashboardPage from '@/features/dashboard/TeacherDashboardPage'

// Lazy Loading Code-Splitting cho phần Analytics Giảng viên & Học viên
const TeacherStudentAnalyticsSection = lazy(
  () => import('@/features/dashboard/components/TeacherStudentAnalyticsSection'),
)
import { useAuthStore } from '@/store/authStore'
import {
  useActiveUsers,
  useAiUsage,
  useFeatureUsage,
  useOverview,
  useRecentActivity,
  useRecentTransactions,
  useRevenueByMonth,
  useRevenueStats,
} from '@/features/dashboard/hooks/useDashboard'

/** Tiêu đề card kèm icon nhỏ — chỉ áp dụng riêng cho Dashboard */
function SectionTitle({ icon: Icon, iconClassName, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={18} strokeWidth={1.75} className={iconClassName ?? 'text-slate-600'} />
      {children}
    </span>
  )
}

function SectionEyebrow({ children }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </p>
  )
}

// Admin Dashboard — toàn bộ hooks gọi ở đây, không bị điều kiện chặn
function AdminDashboard() {
  const overview = useOverview()
  const activeUsers = useActiveUsers()
  const featureUsage = useFeatureUsage()
  const revenueByMonth = useRevenueByMonth()
  const revenueStats = useRevenueStats()
  const recentTransactions = useRecentTransactions(15)
  const recentActivity = useRecentActivity(15)
  const aiUsage = useAiUsage()

  // 6 Thẻ KPI bao quát: Học viên (DAU, MAU), Doanh thu (Tháng, Hôm nay), Vận hành (Giao dịch SePay, Chuyển đổi Premium)
  const kpis = useMemo(() => {
    if (!overview.data && !revenueStats.data) return []

    const ov = overview.data || {}
    const rs = revenueStats.data || {}

    // Giao dịch thành công
    const txCount =
      rs.successfulTransactions ??
      (Array.isArray(recentTransactions.data)
        ? recentTransactions.data.filter((t) => {
            const s = String(t.status || '').toLowerCase()
            return s === 'completed' || s === 'success' || s === 'paid'
          }).length
        : 0)

    // Xác định giao dịch phát sinh trong ngày hôm nay
    const isToday = (dateStr) => {
      if (!dateStr) return false
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return false
      const now = new Date()
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    }

    // Doanh thu thực tế phát sinh hôm nay: tính từ các giao dịch thành công trong ngày
    const txTodayRevenue = Array.isArray(recentTransactions.data)
      ? recentTransactions.data
          .filter((t) => {
            const s = String(t.status || '').toLowerCase()
            const isPaid = s === 'completed' || s === 'success' || s === 'paid'
            return isPaid && isToday(t.createdAt || t.occurredAt || t.paidAt)
          })
          .reduce((sum, t) => sum + Number(t.amount || t.amountFinal || 0), 0)
      : null

    // Nếu không có giao dịch hôm nay thì chuẩn xác là 0đ (không dùng công thức ước tính ảo)
    const todayRev = txTodayRevenue !== null ? txTodayRevenue : (Number(rs.todayRevenue) || 0)
    const successRate = rs.successRate != null ? rs.successRate : 100

    // Doanh thu tháng này: ưu tiên số liệu trực tiếp từ payment-service (rs.monthlyRevenue),
    // không để fallback số liệu cũ của tháng trước đè lên số liệu thực của tháng hiện tại
    const monthlyRev = rs.monthlyRevenue != null
      ? Number(rs.monthlyRevenue)
      : (ov.monthlyRevenue?.value != null ? Number(ov.monthlyRevenue.value) : 0)

    const monthlyDelta = rs.revenueDelta != null
      ? rs.revenueDelta
      : (ov.monthlyRevenue?.changePercent ?? 0)

    return [
      {
        icon: Wallet,
        tone: 'success',
        label: 'Doanh thu tháng này',
        value: formatCurrency(monthlyRev, {
          compact: false,
        }),
        changePercent: monthlyDelta,
      },
      {
        icon: TrendingUp,
        tone: 'indigo',
        label: 'Doanh thu hôm nay',
        value: formatCurrency(todayRev, { compact: false }),
        changePercent: rs.todayDelta ?? 0,
      },
      {
        icon: CheckCircle2,
        tone: 'purple',
        label: 'Giao dịch thành công',
        value: `${formatNumber(txCount)} đơn`,
        subtitle: `${successRate}% thanh toán`,
      },
      {
        icon: Crown,
        tone: 'gold',
        label: 'Tỷ lệ chuyển đổi',
        value: formatPercent(ov.premiumConversionRate?.value ?? rs.conversionRate ?? 0),
        changePercent: ov.premiumConversionRate?.changePercent,
      },
    ]
  }, [overview.data, revenueStats.data, recentTransactions.data])

  // Chuẩn hóa xu hướng tương tác AI (không dùng số liệu ảo)
  const aiPracticeTrends = useMemo(() => {
    if (Array.isArray(aiUsage.data) && aiUsage.data.length > 0) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      return aiUsage.data.map((item, idx) => {
        const d = new Date(item.date)
        const dayLabel = !isNaN(d.getDay()) ? days[d.getDay()] : `T${idx + 2}`
        return {
          day: dayLabel,
          requests: Number(item.requests || Math.round((item.tokens || 0) / 400)),
        }
      })
    }
    // Nếu chưa có nhật ký AI riêng biệt, hiển thị theo ngày trong tuần thực tế với 0 lượt
    return [
      { day: 'T2', requests: 0 },
      { day: 'T3', requests: 0 },
      { day: 'T4', requests: 0 },
      { day: 'T5', requests: 0 },
      { day: 'T6', requests: 0 },
      { day: 'T7', requests: 0 },
      { day: 'CN', requests: 0 },
    ]
  }, [aiUsage.data])

  const revenueTotal = revenueByMonth.data?.at(-1)?.revenue ?? revenueStats.data?.monthlyRevenue

  return (
    <div className="space-y-6">
      {/* SECTION 1: 4 KPI CARDS */}
      <section>
        <SectionEyebrow>Tổng quan hoạt động & chỉ số kinh doanh</SectionEyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.isLoading && !kpis.length ? (
            Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          ) : overview.error && !kpis.length ? (
            <ErrorState
              className="lg:col-span-4"
              error={overview.error}
              onRetry={overview.refetch}
            />
          ) : (
            kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)
          )}
        </div>
      </section>

      {/* SECTION 2: XU HƯỚNG & PHÂN TÍCH (BỔ SUNG THÊM BIỂU ĐỒ) */}
      <section>
        <SectionEyebrow>Xu hướng học tập & Tương tác AI</SectionEyebrow>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {/* Biểu đồ 1: Học viên hoạt động (Free vs Premium) */}
          <LineChartCard
            className="flex flex-col justify-between"
            title={<SectionTitle icon={Activity}>Biểu đồ người dùng hoạt động</SectionTitle>}
            data={activeUsers.data}
            dataKeyX="day"
            series={[
              { key: 'free', label: 'Tài khoản Free', color: '#1B3A57' },
              { key: 'premium', label: 'Tài khoản Premium', color: '#29A8E8' },
            ]}
            legendDirection="col"
            isLoading={activeUsers.isLoading}
            error={activeUsers.error}
            onRetry={activeUsers.refetch}
          />

          {/* Biểu đồ 2: Tần suất tương tác học tập với AI theo ngày */}
          <LineChartCard
            className="flex flex-col justify-between"
            title={
              <SectionTitle icon={Sparkles}>
                Lượt tương tác học tập cùng AI
              </SectionTitle>
            }
            data={aiPracticeTrends}
            dataKeyX="day"
            series={[
              { key: 'requests', label: 'Lượt thực hành AI', color: '#D97706' },
            ]}
            isLoading={aiUsage.isLoading}
            error={aiUsage.error}
            onRetry={aiUsage.refetch}
          />

          {/* Biểu đồ 3: Phân bổ tính năng sử dụng nhiều nhất */}
          <DonutCard
            className="flex flex-col justify-between lg:col-span-2 xl:col-span-1"
            title={
              <SectionTitle icon={PieChart}>
                Tính năng được dùng nhiều
              </SectionTitle>
            }
            centerLabel="Top 4"
            centerSubLabel="tính năng"
            data={featureUsage.data?.map((item) => ({ label: item.label, value: item.percent }))}
            isLoading={featureUsage.isLoading}
            error={featureUsage.error}
            onRetry={featureUsage.refetch}
          />
        </div>
      </section>

      {/* SECTION 3: GIÁM SÁT ĐÀO TẠO & HIỆU SUẤT GIẢNG VIÊN - HỌC VIÊN */}
      <section>
        <SectionEyebrow>Giám sát Đào tạo & Hiệu suất Giảng viên - Học viên</SectionEyebrow>
        <Suspense
          fallback={
            <div className="h-64 w-full rounded-2xl bg-slate-50 border border-line animate-pulse flex items-center justify-center text-xs text-slate-400">
              Đang tải biểu đồ phân tích đào tạo...
            </div>
          }
        >
          <TeacherStudentAnalyticsSection />
        </Suspense>
      </section>

      {/* SECTION 4: DOANH THU THEO THÁNG & GIAO DỊCH THÀNH CÔNG GẦN ĐÂY NẰM CÙNG 1 ROW */}
      <section>
        <SectionEyebrow>Tài chính & Dòng tiền</SectionEyebrow>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
          {/* Biểu đồ doanh thu theo tháng (Cột bên trái) */}
          <div className="lg:col-span-7 flex flex-col">
            <BarChartCard
              className="h-full flex flex-col justify-between"
              title={
                <SectionTitle icon={BarChart3}>
                  Doanh thu theo tháng
                </SectionTitle>
              }
              action={
                revenueTotal != null && (
                  <span className="text-xs sm:text-sm text-ink-muted">
                    Tổng tháng này:{' '}
                    <span className="font-bold text-navy-800">
                      {formatCurrency(revenueTotal, { compact: false })}
                    </span>
                  </span>
                )
              }
              data={revenueByMonth.data}
              dataKeyX="label"
              dataKeyY="revenue"
              highlightIndex={revenueByMonth.data ? revenueByMonth.data.length - 1 : undefined}
              valueFormatter={(value) => formatCurrency(value, { compact: true })}
              isLoading={revenueByMonth.isLoading}
              error={revenueByMonth.error}
              onRetry={revenueByMonth.refetch}
            />
          </div>

          {/* Bảng Giao dịch Thành công gần đây (Cột bên phải, cùng 1 row) */}
          <div className="lg:col-span-5 flex flex-col">
            <RecentTransactionsCard
              transactions={recentTransactions.data}
              isLoading={recentTransactions.isLoading}
              error={recentTransactions.error}
              onRetry={recentTransactions.refetch}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: HOẠT ĐỘNG GẦN ĐÂY (FULL WIDTH, PHÂN LOẠI TAB HỌC TẬP & HỆ THỐNG) */}
      <section>
        <SectionEyebrow>Nhật ký & Vận hành Hệ thống</SectionEyebrow>
        <RecentActivityCard
          data={recentActivity.data}
          isLoading={recentActivity.isLoading}
          error={recentActivity.error}
          onRetry={recentActivity.refetch}
        />
      </section>
    </div>
  )
}

// Router chọn dashboard theo role người dùng
function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  // Giáo viên → Teacher Dashboard
  if (user?.role?.toLowerCase() === 'teacher') {
    return <TeacherDashboardPage />
  }

  // Mặc định (admin) → Admin Dashboard
  return <AdminDashboard />
}

export default DashboardPage
