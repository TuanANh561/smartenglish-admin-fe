import { Copy, Plus, Search, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import { cn, formatNumber } from '@/lib/utils'

export default function CouponsTab({
  coupons,
  filteredCoupons,
  couponSearch,
  setCouponSearch,
  couponStatusFilter,
  setCouponStatusFilter,
  onOpenCreateModal,
  onCopyCode,
  onDeleteCoupon,
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
            Danh sách mã ưu đãi & Voucher ({filteredCoupons.length})
          </span>
        </div>
        <Button icon={Plus} size="sm" onClick={onOpenCreateModal}>
          Tạo Mã Ưu Đãi Mới
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Tìm mã code hoặc mô tả..."
            value={couponSearch}
            onChange={(e) => setCouponSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>

        <Select
          value={couponStatusFilter}
          onChange={(e) => setCouponStatusFilter(e.target.value)}
          className="w-40 text-xs"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiệu lực</option>
          <option value="expired">Hết hạn</option>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 font-bold text-ink-muted uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Mã Code</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3 text-center">Giảm (%)</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3 text-center">Lượt dùng / Hạn mức</th>
              <th className="px-4 py-3">Hạn dùng</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Xoá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {filteredCoupons.map((c) => {
              const usagePercent = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100))
              const isExhausted = c.usedCount >= c.maxUses

              return (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600 bg-brand-50/50 border border-brand-200/60 px-2 py-0.5 rounded-md w-fit">
                      <span>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(c.code)}
                        className="text-slate-400 hover:text-brand-600 cursor-pointer p-0.5"
                        title="Sao chép mã"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-ink max-w-xs font-medium truncate">
                    {c.description}
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-emerald-600 text-sm">
                    -{c.discountPercent}%
                  </td>

                  <td className="px-4 py-3">
                    {c.target === 'teacher' ? (
                      <Badge tone="warning">Giáo viên</Badge>
                    ) : c.target === 'student' ? (
                      <Badge tone="info">Học viên</Badge>
                    ) : (
                      <Badge tone="neutral">Toàn sàn</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="space-y-1">
                      <span className="font-bold text-navy-700">
                        {formatNumber(c.usedCount)} / {formatNumber(c.maxUses)}
                      </span>
                      <div className="h-1.5 w-20 mx-auto rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            usagePercent > 80 ? 'bg-amber-500' : 'bg-brand-500',
                          )}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-ink-muted">
                    {c.validUntil}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {c.status === 'active' && !isExhausted ? (
                      <Badge tone="success">Hiệu lực</Badge>
                    ) : isExhausted ? (
                      <Badge tone="warning">Hết lượt</Badge>
                    ) : (
                      <Badge tone="neutral">Hết hạn</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteCoupon(c.id)}
                      className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      title="Xoá mã này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
