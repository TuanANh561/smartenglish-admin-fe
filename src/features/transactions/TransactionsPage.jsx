import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  RotateCcw,
  Wallet,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import Select from '@/components/ui/Select'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  GATEWAY_META,
  RECONCILIATION_STATS,
  reconciliationTransactions,
} from '@/mocks/data/reconciliationTransactions'
import { transactionColumns } from './columns'

const DATE_RANGES = [
  { value: '7d', label: '7 ngày qua (10/10 - 17/10)' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'month', label: 'Tháng này' },
]

function TransactionsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [gateway, setGateway] = useState('all')
  const [status, setStatus] = useState('all')
  const [transactions, setTransactions] = useState(reconciliationTransactions)

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchGateway = gateway === 'all' || txn.gateway === gateway
      const matchStatus = status === 'all' || txn.status === status
      return matchGateway && matchStatus
    })
  }, [transactions, gateway, status])

  const hasFilters = gateway !== 'all' || status !== 'all'

  const clearFilters = () => {
    setGateway('all')
    setStatus('all')
  }

  const approveRefund = (id) => {
    setTransactions((prev) => prev.map((txn) => (txn.id === id ? { ...txn, status: 'refunded' } : txn)))
    toast.success('Đã phê duyệt hoàn tiền')
  }

  const rejectRefund = (id) => {
    setTransactions((prev) => prev.map((txn) => (txn.id === id ? { ...txn, status: 'success' } : txn)))
    toast.success('Đã từ chối yêu cầu hoàn tiền, email đã được gửi')
  }

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="flex items-start gap-3">
          <span className="rounded-lg bg-navy-700/10 p-2.5 text-navy-700">
            <Wallet size={18} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Doanh thu hôm nay
            </p>
            <p className="mt-1 text-2xl font-bold text-navy-700">
              {formatCurrency(RECONCILIATION_STATS.todayRevenue)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#15803D]">
              +{RECONCILIATION_STATS.todayRevenueGrowth}% so với hôm qua
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-3">
          <span className="rounded-lg bg-[#DCFCE7] p-2.5 text-[#15803D]">
            <CheckCircle2 size={18} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Giao dịch thành công
            </p>
            <p className="mt-1 text-2xl font-bold text-navy-700">
              {formatNumber(RECONCILIATION_STATS.successfulTransactions)}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Tỷ lệ thành công: {RECONCILIATION_STATS.successRate}%
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-3">
          <span className="rounded-lg bg-[#FEE2E2] p-2.5 text-[#B91C1C]">
            <RotateCcw size={18} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Yêu cầu hoàn tiền
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold text-navy-700">
                {RECONCILIATION_STATS.pendingRefundRequests}
              </p>
              <Badge tone="warning">Đang chờ xử lý</Badge>
            </div>
            <button
              type="button"
              onClick={() => setStatus('refund_requested')}
              className="mt-0.5 text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              Xem chi tiết →
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-64">
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
          <Select value={gateway} onChange={(e) => setGateway(e.target.value)} className="w-52">
            <option value="all">Tất cả cổng thanh toán</option>
            {Object.entries(GATEWAY_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-52">
            <option value="all">Trạng thái: Tất cả</option>
            <option value="success">Thành công</option>
            <option value="refund_requested">Yêu cầu hoàn</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="failed">Thất bại</option>
          </Select>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            columns={transactionColumns}
            data={filtered}
            emptyMessage="Không có giao dịch nào khớp bộ lọc"
            expandable
            renderExpandedRow={(txn) =>
              txn.refundReason ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#B91C1C]">
                      <AlertTriangle size={14} strokeWidth={1.75} />
                      Lý do hoàn tiền
                    </p>
                    <p className="mt-2 rounded-lg bg-[#FEE2E2] p-3 text-sm italic text-ink">
                      "{txn.refundReason}"
                    </p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Tiến độ khoá học:</span>
                        <span className="font-medium text-[#15803D]">{txn.courseProgress}% (Hợp lệ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Thời gian mua:</span>
                        <span className="font-medium text-[#15803D]">
                          Dưới {txn.purchaseAgeDays} ngày (Hợp lệ)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Ticket hỗ trợ:</span>
                        <span className="font-medium text-brand-500">{txn.supportTicket}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      <Mail size={14} strokeWidth={1.75} />
                      Nhật ký webhook
                    </p>
                    <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-navy-900 p-3 font-mono text-xs leading-relaxed text-brand-200">
                      {txn.webhookLog}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm text-ink-muted">Số tiền hoàn ({txn.refundPercent}%)</p>
                    <p className="mt-1 text-2xl font-bold text-[#B91C1C]">
                      {formatCurrency(txn.refundAmount)}
                    </p>
                    <div className="mt-3 space-y-2">
                      <Button variant="danger" fullWidth onClick={() => approveRefund(txn.id)}>
                        Phê duyệt hoàn tiền
                      </Button>
                      <Button variant="secondary" fullWidth onClick={() => rejectRefund(txn.id)}>
                        Từ chối &amp; Gửi email
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  Giao dịch qua {GATEWAY_META[txn.gateway].label}, không có yêu cầu hoàn tiền.
                </p>
              )
            }
          />
        </div>
      </Card>
    </main>
  )
}

export default TransactionsPage
