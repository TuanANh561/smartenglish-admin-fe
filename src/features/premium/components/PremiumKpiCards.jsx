import { DollarSign, Sparkles, Tag, TrendingUp, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function PremiumKpiCards({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
      <Card className="p-4 border border-line relative overflow-hidden group hover:border-brand-400 hover:shadow-sm transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">Doanh thu tháng</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            <DollarSign size={15} />
          </span>
        </div>
        <p className="text-xl font-bold text-navy-700 mt-2">
          {formatCurrency(stats.monthlyRevenue)}
        </p>
        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
          <TrendingUp size={12} /> +{stats.revenueDelta}% so tháng trước
        </p>
      </Card>

      <Card className="p-4 border border-line relative overflow-hidden group hover:border-indigo-400 hover:shadow-sm transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">Thuê bao hoạt động</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <Users size={15} />
          </span>
        </div>
        <p className="text-xl font-bold text-navy-700 mt-2">
          {formatNumber(stats.activeSubscribers)}
        </p>
        <p className="text-[11px] text-ink-muted mt-1">
          <strong className="text-navy-700">{stats.teacherSubscribers}</strong> GV · <strong className="text-navy-700">{stats.studentSubscribers}</strong> Học viên
        </p>
      </Card>

      <Card className="p-4 border border-line relative overflow-hidden group hover:border-amber-400 hover:shadow-sm transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">Mã ưu đãi</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
            <Tag size={15} />
          </span>
        </div>
        <p className="text-xl font-bold text-navy-700 mt-2">
          {stats.activeCoupons} Mã
        </p>
        <p className="text-[11px] text-amber-600 font-semibold mt-1">
          {stats.couponRedemptions} lượt dùng tuần này
        </p>
      </Card>

      <Card className="p-4 border border-line relative overflow-hidden group hover:border-emerald-400 hover:shadow-sm transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">Tỷ lệ gia hạn</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
            <Sparkles size={15} />
          </span>
        </div>
        <p className="text-xl font-bold text-navy-700 mt-2">
          {stats.retentionRate}%
        </p>
        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
          +12% so với trung bình
        </p>
      </Card>
    </div>
  )
}
