import { DollarSign, Sparkles, Tag, TrendingUp, Users } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function PremiumKpiCards({ stats = {} }) {
  const data = stats || {}
  const monthlyRevenue = data.monthlyRevenue ?? 0
  const revenueDelta = data.revenueDelta ?? 0
  const activeSubscribers = data.activeSubscribers ?? 0
  const teacherSubscribers = data.teacherSubscribers ?? 0
  const studentSubscribers = data.studentSubscribers ?? 0
  const activeCoupons = data.activeCoupons ?? 0
  const couponRedemptions = data.couponRedemptions ?? 0
  const retentionRate = data.retentionRate ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {/* Doanh thu tháng */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 shadow-xs hover:border-brand-300 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <DollarSign size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-ink-muted">Doanh thu tháng</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={10} /> +{revenueDelta}%
            </span>
          </div>
          <p className="text-sm font-bold text-navy-700 truncate mt-0.5">
            {formatCurrency(monthlyRevenue)}
          </p>
        </div>
      </div>

      {/* Thuê bao hoạt động */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 shadow-xs hover:border-indigo-300 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Users size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-ink-muted">Thuê bao hoạt động</span>
            <span className="text-[10px] text-ink-muted">
              {teacherSubscribers} GV · {studentSubscribers} HV
            </span>
          </div>
          <p className="text-sm font-bold text-navy-700 truncate mt-0.5">
            {formatNumber(activeSubscribers)}
          </p>
        </div>
      </div>

      {/* Mã ưu đãi */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 shadow-xs hover:border-amber-300 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Tag size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-ink-muted">Mã ưu đãi</span>
            <span className="text-[10px] text-amber-600 font-semibold">
              {couponRedemptions} dùng
            </span>
          </div>
          <p className="text-sm font-bold text-navy-700 truncate mt-0.5">
            {activeCoupons} Mã
          </p>
        </div>
      </div>

      {/* Tỷ lệ gia hạn */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 shadow-xs hover:border-emerald-300 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-ink-muted">Tỷ lệ gia hạn</span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              +12% chuẩn
            </span>
          </div>
          <p className="text-sm font-bold text-navy-700 truncate mt-0.5">
            {retentionRate}%
          </p>
        </div>
      </div>
    </div>
  )
}
