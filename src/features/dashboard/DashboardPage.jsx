import { Activity, BarChart3, Crown, PieChart, UserCheck, Users, Wallet } from 'lucide-react'
import BarChartCard from '@/components/charts/BarChartCard'
import DonutCard from '@/components/charts/DonutCard'
import LineChartCard from '@/components/charts/LineChartCard'
import ErrorState from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import KpiCard from '@/features/dashboard/components/KpiCard'
import RecentActivityCard from '@/features/dashboard/components/RecentActivityCard'
import {
  useActiveUsers,
  useFeatureUsage,
  useOverview,
  useRecentActivity,
  useRevenueByMonth,
} from '@/features/dashboard/hooks/useDashboard'

/** Tiêu đề card kèm icon nhỏ — chỉ áp dụng riêng cho Dashboard, không sửa CardHeader dùng chung. */
function SectionTitle({ icon: Icon, iconClassName, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={18} strokeWidth={1.75} className={iconClassName ?? 'text-brand-500'} />
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

function DashboardPage() {
  const overview = useOverview()
  const activeUsers = useActiveUsers()
  const featureUsage = useFeatureUsage()
  const revenueByMonth = useRevenueByMonth()
  const recentActivity = useRecentActivity()

  const kpis = overview.data
    ? [
        {
          icon: Users,
          tone: 'brand',
          label: 'Người dùng hoạt động ngày (DAU)',
          value: formatNumber(overview.data.dau.value),
          changePercent: overview.data.dau.changePercent,
        },
        {
          icon: UserCheck,
          tone: 'navy',
          label: 'Người dùng hoạt động tháng (MAU)',
          value: formatNumber(overview.data.mau.value),
          changePercent: overview.data.mau.changePercent,
        },
        {
          icon: Wallet,
          tone: 'success',
          label: 'Doanh thu tháng',
          value: formatCurrency(overview.data.monthlyRevenue.value, { compact: true }),
          changePercent: overview.data.monthlyRevenue.changePercent,
        },
        {
          icon: Crown,
          tone: 'gold',
          label: 'Tỷ lệ chuyển đổi Premium',
          value: formatPercent(overview.data.premiumConversionRate.value),
          changePercent: overview.data.premiumConversionRate.changePercent,
        },
      ]
    : []

  const revenueTotal = revenueByMonth.data?.at(-1)?.revenue

  return (
    <>
      <section>
        <SectionEyebrow>Tổng quan</SectionEyebrow>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {overview.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          ) : overview.error ? (
            <ErrorState
              className="xl:col-span-4"
              error={overview.error}
              onRetry={overview.refetch}
            />
          ) : (
            kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)
          )}
        </div>
      </section>

      <section>
        <SectionEyebrow>Xu hướng & phân tích</SectionEyebrow>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <LineChartCard
            className="xl:col-span-2"
            title={<SectionTitle icon={Activity}>Biểu đồ người dùng hoạt động</SectionTitle>}
            data={activeUsers.data}
            dataKeyX="day"
            series={[
              { key: 'free', label: 'Free', color: '#1B3A57' },
              { key: 'premium', label: 'Premium', color: '#29A8E8' },
            ]}
            isLoading={activeUsers.isLoading}
            error={activeUsers.error}
            onRetry={activeUsers.refetch}
          />
          <DonutCard
            title={
              <SectionTitle icon={PieChart} iconClassName="text-navy-700">
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

      <section>
        <SectionEyebrow>Chi tiết</SectionEyebrow>
        <div className="flex flex-col gap-5">
          <BarChartCard
            title={
              <SectionTitle icon={BarChart3} iconClassName="text-[#15803D]">
                Doanh thu theo tháng
              </SectionTitle>
            }
            action={
              revenueTotal != null && (
                <span className="text-sm text-ink-muted">
                  Tổng tháng này:{' '}
                  <span className="font-medium text-navy-700">
                    {formatCurrency(revenueTotal, { compact: true })}
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

          <RecentActivityCard
            data={recentActivity.data}
            isLoading={recentActivity.isLoading}
            error={recentActivity.error}
            onRetry={recentActivity.refetch}
          />
        </div>
      </section>
    </>
  )
}

export default DashboardPage
