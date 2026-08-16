import { ChevronRight, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { SkeletonText } from '@/components/ui/Skeleton'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

const STATUS_MAP = {
  success: { tone: 'success', label: 'Thành công' },
  done: { tone: 'info', label: 'Đã xong' },
  pending: { tone: 'warning', label: 'Chờ xác thực' },
  failed: { tone: 'danger', label: 'Thất bại' },
}

function RecentActivityCard({ data, isLoading = false, error = null, onRetry }) {
  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <History size={18} strokeWidth={1.75} className="text-brand-400" />
            Hoạt động gần đây
          </span>
        }
        action={
          <Link
            to="/hoc-vien"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Xem tất cả
            <ChevronRight size={18} strokeWidth={1.75} />
          </Link>
        }
      />

      {isLoading ? (
        <SkeletonText lines={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !data?.length ? (
        <EmptyState
          title="Chưa có hoạt động nào"
          description="Hoạt động của học viên sẽ hiện ở đây."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-canvas">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Học viên
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Hành động
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Trạng thái
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Thời gian
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Giao dịch
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((item) => {
                const status = STATUS_MAP[item.status] ?? { tone: 'neutral', label: item.status }
                return (
                  <tr key={item.id} className="transition-colors hover:bg-canvas">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={item.user.displayName}
                          src={item.user.avatarUrl}
                          size="sm"
                          className="rounded-full ring-1 ring-line"
                        />
                        <div>
                          <p className="font-medium text-navy-700">{item.user.displayName}</p>
                          <p className="text-xs text-ink-muted">{item.user.cefrLevel ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink">{item.action}</td>
                    <td className="px-3 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{formatRelativeTime(item.occurredAt)}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {item.amount ? (
                        <span className="text-[#15803D]">+{formatCurrency(item.amount)}</span>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default RecentActivityCard
