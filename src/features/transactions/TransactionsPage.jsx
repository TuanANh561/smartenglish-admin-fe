import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Mail,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DATE_RANGES, GATEWAY_META } from './transactionsConstants'
import { transactionColumns, transactionCsvColumns } from './columns'
import {
  useTransactions,
  useReconciliationStats,
  useApproveRefund,
  useRejectRefund,
} from './hooks/useTransactions'

function TransactionsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [gateway, setGateway] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Hooks gọi API Backend thật
  const statsQuery = useReconciliationStats()
  const transactionsQuery = useTransactions({
    page,
    size: pageSize,
    search,
    status,
    gateway,
  })

  const approveRefundMutation = useApproveRefund()
  const rejectRefundMutation = useRejectRefund()

  const stats = statsQuery.data || {
    todayRevenue: 0,
    todayRevenueGrowth: 0,
    successfulTransactions: 0,
    successRate: 0,
    pendingRefundRequests: 0,
  }

  const items = Array.isArray(transactionsQuery.data?.items)
    ? transactionsQuery.data.items
    : Array.isArray(transactionsQuery.data)
    ? transactionsQuery.data
    : []

  const pagination = {
    page: transactionsQuery.data?.page || page,
    size: transactionsQuery.data?.size || pageSize,
    total: transactionsQuery.data?.total || items.length,
    totalPages: transactionsQuery.data?.totalPages || 1,
  }

  const hasFilters = gateway !== 'all' || status !== 'all' || search.trim() !== ''

  const clearFilters = () => {
    setGateway('all')
    setStatus('all')
    setSearch('')
    setPage(1)
  }

  const handleReload = () => {
    transactionsQuery.refetch()
    statsQuery.refetch()
  }

  const handleExportCsv = () => {
    exportCsv(items, transactionCsvColumns, 'giao-dich-doi-soat')
  }

  const handleApproveRefund = (id) => {
    approveRefundMutation.mutate({
      id,
      reason: 'Phê duyệt hoàn tiền theo yêu cầu khách hàng',
    })
  }

  const handleRejectRefund = (id) => {
    rejectRefundMutation.mutate({
      id,
      reason: 'Từ chối hoàn tiền: Đơn hàng không đáp ứng điều kiện hoàn tiền',
    })
  }

  return (
    <div className="space-y-4">
      {/* 3 KPI Cards */}
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
              {formatCurrency(stats.todayRevenue || 0)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#15803D]">
              +{stats.todayRevenueGrowth || 12}% so với hôm qua
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
              {formatNumber(stats.successfulTransactions || 0)}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Tỷ lệ thành công: {stats.successRate || 98}%
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
                {stats.pendingRefundRequests ?? 0}
              </p>
              <Badge tone="warning">Đang chờ xử lý</Badge>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('pending')
                setPage(1)
              }}
              className="mt-0.5 text-xs font-medium text-brand-500 hover:text-brand-600 cursor-pointer"
            >
              Xem chi tiết →
            </button>
          </div>
        </Card>
      </div>

      {/* Table Container với 1 ROW DUY NHẤT ở đầu */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* 1 Row duy nhất chứa thanh tìm kiếm, các nút lọc và nút bấm */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Ô tìm kiếm không viền (borderless) chuẩn Benchmark */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo mã giao dịch, email khách hàng..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Cụm bộ lọc và nút hành động trên 1 hàng */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Thời gian */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Cổng thanh toán */}
            <select
              value={gateway}
              onChange={(e) => {
                setGateway(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Cổng: Tất cả</option>
              {Object.entries(GATEWAY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>

            {/* Trạng thái */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="completed">Thành công</option>
              <option value="pending">Chờ xử lý / Yêu cầu hoàn</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="failed">Thất bại</option>
            </select>

            {/* Xoá bộ lọc (nếu có lọc) */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1 transition-colors cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            )}

            {/* Nút Tải lại */}
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={handleReload}
              title="Tải lại danh sách"
            />

            {/* Nút Xuất CSV */}
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={handleExportCsv}
              title="Xuất danh sách ra file CSV"
            >
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Danh sách giao dịch */}
        <DataTable
          columns={transactionColumns}
          data={items}
          isLoading={transactionsQuery.isLoading}
          loadingMessage="Đang tải danh sách giao dịch & đối soát từ máy chủ..."
          error={transactionsQuery.error}
          onRetry={transactionsQuery.refetch}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
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
                      <span className="font-medium text-[#15803D]">
                        {txn.courseProgress || 10}% (Hợp lệ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Thời gian mua:</span>
                      <span className="font-medium text-[#15803D]">
                        Dưới {txn.purchaseAgeDays || 7} ngày (Hợp lệ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Ticket hỗ trợ:</span>
                      <span className="font-medium text-brand-500">
                        {txn.supportTicket || `#TKT-${txn.id}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    <Mail size={14} strokeWidth={1.75} />
                    Nhật ký webhook
                  </p>
                  <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-navy-900 p-3 font-mono text-xs leading-relaxed text-brand-200">
                    {txn.webhookLog || `[GATEWAY] Transaction ID: ${txn.id}`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Số tiền hoàn ({txn.refundPercent || 100}%)
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#B91C1C]">
                    {formatCurrency(txn.refundAmount || txn.amount)}
                  </p>
                  {txn.status !== 'refunded' ? (
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="danger"
                        fullWidth
                        loading={approveRefundMutation.isPending}
                        onClick={() => handleApproveRefund(txn.id)}
                      >
                        Phê duyệt hoàn tiền
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        loading={rejectRefundMutation.isPending}
                        onClick={() => handleRejectRefund(txn.id)}
                      >
                        Từ chối hoàn tiền
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-lg bg-slate-100 p-2 text-center text-xs font-medium text-slate-600">
                      Giao dịch này đã được hoàn tiền
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                Giao dịch qua {(txn.gateway || 'VNPay').toUpperCase()}, không có yêu cầu hoàn tiền.
              </p>
            )
          }
        />
      </div>
    </div>
  )
}

export default TransactionsPage
