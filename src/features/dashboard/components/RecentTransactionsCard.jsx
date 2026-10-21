import { useState } from 'react'
import { CheckCircle2, ChevronRight, ShoppingBag, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { SkeletonText } from '@/components/ui/Skeleton'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email || '—'
  const [name, domain] = email.split('@')
  if (!name) return email
  if (name.length <= 2) {
    return `${name}****@${domain}`
  }
  const prefix = name.slice(0, 2)
  const suffix = name.length > 4 ? name.slice(-1) : ''
  return `${prefix}****${suffix}@${domain}`
}

export default function RecentTransactionsCard({
  transactions = [],
  isLoading = false,
  error = null,
  onRetry,
}) {
  // Chỉ lọc các giao dịch thành công
  const successfulList = (Array.isArray(transactions) ? transactions : []).filter((tx) => {
    const s = String(tx.status || '').toLowerCase()
    return s === 'completed' || s === 'success' || s === 'paid'
  })

  const displayList = successfulList.slice(0, 5)

  return (
    <Card className="flex flex-col h-full border border-line bg-white shadow-xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={16} strokeWidth={2.2} />
            </span>
            <span className="font-bold text-navy-800 text-base">Giao dịch Thành công gần đây</span>
            {successfulList.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                {successfulList.length} đơn
              </span>
            )}
          </div>
        }
        action={
          <Link
            to="/app/doi-soat"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="p-5">
            <SkeletonText lines={5} />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : !displayList.length ? (
          <EmptyState
            title="Chưa có giao dịch thành công"
            description="Các đơn hàng thanh toán thành công qua SePay VietQR sẽ hiển thị thời gian thực tại đây."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-canvas border-y border-line text-ink-muted">
                  <th className="px-3 py-2 font-bold uppercase tracking-wider">Khách hàng</th>
                  <th className="px-2.5 py-2 font-bold uppercase tracking-wider">Gói đăng ký</th>
                  <th className="px-2.5 py-2 font-bold uppercase tracking-wider text-right">Số tiền</th>
                  <th className="px-3 py-2 font-bold uppercase tracking-wider text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayList.map((tx) => {
                  const customerName = tx.studentName || tx.customerName || 'Khách hàng'
                  const customerEmail = tx.studentEmail || tx.customerEmail || ''
                  const planTitle = tx.courseName || tx.planName || (String(tx.plan || '').includes('pro') ? 'Teacher Pro' : 'Học Viên Premium')
                  const amount = Number(tx.amount || tx.amountFinal || 0)
                  const occurredAt = tx.createdAt || tx.occurredAt

                  return (
                    <tr key={tx.id || tx.orderCode} className="transition-colors hover:bg-canvas/60">
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            name={customerName}
                            src={tx.studentAvatar}
                            size="xs"
                            className="rounded-full ring-1 ring-line shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate" title={customerName}>
                              {customerName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5" title={customerEmail}>
                              {maskEmail(customerEmail)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50/80 border border-amber-200/70 px-2 py-0.5 text-[11px] font-semibold text-amber-800 max-w-[170px]">
                          <ShoppingBag size={12} className="shrink-0 text-amber-600" />
                          <span className="truncate" title={planTitle}>
                            {planTitle}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="font-extrabold text-emerald-600 text-xs tracking-tight">
                          +{formatCurrency(amount)}
                        </span>
                      </td>

                      <td className="px-3.5 py-3 text-right text-slate-400 text-[11px] whitespace-nowrap">
                        {formatRelativeTime(occurredAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info note */}
        <div className="border-t border-line px-4 py-2.5 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Tự động gạch nợ SePay Napas 24/7</span>
          </div>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            Trạng thái: 100% Thành công
          </span>
        </div>
      </div>
    </Card>
  )
}
