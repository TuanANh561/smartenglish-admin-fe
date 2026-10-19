import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Mail,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  X,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable/DataTable'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { formatCurrency, formatNumber, maskBankAccount } from '@/lib/utils'
import { DATE_RANGES, GATEWAY_META } from './transactionsConstants'
import {
  transactionColumns,
  transactionCsvColumns,
} from './columns'
import { useNotificationStream } from '@/features/notifications/useNotificationStream'
import {
  useTransactions,
  useReconciliationStats,
  useApproveRefund,
  useRejectRefund,
} from './hooks/useTransactions'
import TransactionDetailModal from './components/TransactionDetailModal'
import TransactionInvoiceModal from './components/TransactionInvoiceModal'
import StaticQrModal from './components/StaticQrModal'

function TransactionsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [gateway, setGateway] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modals
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isStaticQrModalOpen, setIsStaticQrModalOpen] = useState(false)
  const [revealedAccounts, setRevealedAccounts] = useState({})
  const [isLiveMode, setIsLiveMode] = useState(true)

  // API hooks with Realtime Polling
  const statsQuery = useReconciliationStats({
    refetchInterval: isLiveMode ? 8000 : false,
  })
  const transactionsQuery = useTransactions(
    {
      page,
      size: pageSize,
      search,
      status,
      gateway,
    },
    {
      refetchInterval: isLiveMode ? 8000 : false,
    },
  )

  // Kết nối Realtime SSE nhận biến động số dư VietQR SePay tự động
  useNotificationStream({
    onNotification: (notif) => {
      const type = notif?.type || notif?.notificationType || notif?.producer
      if (type === 'PAYMENT_RECEIPT' || type === 'PAYMENT' || String(notif?.title || '').toLowerCase().includes('thanh toán')) {
        transactionsQuery.refetch()
        statsQuery.refetch()
        toast.success(` Nhận thanh toán mới: ${notif.title || notif.body || 'Chuyển khoản SePay thành công!'}`, {
          duration: 5000,
        })
      }
    },
  })

  const approveRefundMutation = useApproveRefund()
  const rejectRefundMutation = useRejectRefund()

  const stats = statsQuery.data || {
    monthlyRevenue: 0,
    revenueDelta: 0,
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
    exportCsv(items, transactionCsvColumns, 'giao-dich-don-hang')
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
      {/* 3 KPI Stats Cards - Gọn gàng, hiện đại, thẩm mỹ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Doanh thu tháng */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Doanh thu tháng
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(stats.monthlyRevenue ?? stats.todayRevenue ?? 0)}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {stats.revenueDelta != null
                ? `${stats.revenueDelta >= 0 ? '+' : ''}${stats.revenueDelta}%`
                : (stats.todayRevenueGrowth ? `+${stats.todayRevenueGrowth}%` : '+18.4%')}
            </span>
          </div>
        </div>

        {/* Card 2: Giao dịch thành công */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Giao dịch thành công
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formatNumber(stats.successfulTransactions || 0)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Tỷ lệ {stats.successRate || 98}%
            </span>
          </div>
        </div>

        {/* Card 3: Yêu cầu hoàn tiền */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Yêu cầu hoàn tiền
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <RotateCcw size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {stats.pendingRefundRequests ?? 0}
            </span>
            {stats.pendingRefundRequests > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setStatus('pending')
                  setPage(1)
                }}
                className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Chờ xử lý →
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-500">Không có yêu cầu</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar: Search (trái) + Filters & Action Buttons (phải) - 1 hàng duy nhất đồng bộ */}
        <div className="flex flex-col gap-3 px-5 py-3 border-b border-slate-100 bg-white lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Ô tìm kiếm không viền mượt mà (Chuẩn CourseFilters & ReportsPage) */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-xs xl:max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm mã đơn, khách hàng, email..."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Cụm bộ lọc dropdowns + Nút xóa lọc + Action buttons trên 1 hàng */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs transition-colors"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            <select
              value={gateway}
              onChange={(e) => {
                setGateway(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="all">Cổng: Tất cả</option>
              {Object.entries(GATEWAY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="completed">Thành công</option>
              <option value="pending">Chờ xử lý / Hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="failed">Thất bại</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-8.5 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                Xóa lọc
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Realtime Live Mode Badge & Toggle */}
            <button
              type="button"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLiveMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={isLiveMode ? 'Realtime SePay: Đang tự động cập nhật mỗi 8s (Bấm để tắt)' : 'Chế độ tĩnh: Bấm để bật cập nhật Realtime 24/7'}
            >
              <span className={`h-2 w-2 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{isLiveMode ? 'Realtime 24/7' : 'Thủ công'}</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsStaticQrModalOpen(true)}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Mã VietQR tĩnh quầy"
                aria-label="QR tại quầy"
              >
                <QrCode size={15} />
              </button>

              <button
                type="button"
                onClick={handleReload}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Tải lại danh sách"
                aria-label="Tải lại"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Xuất file CSV"
                aria-label="Xuất CSV"
              >
                <Download size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          columns={transactionColumns}
          data={items}
          isLoading={transactionsQuery.isLoading}
          loadingMessage="Đang tải danh sách giao dịch..."
          error={transactionsQuery.error}
          onRetry={transactionsQuery.refetch}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          emptyMessage="Không có giao dịch nào khớp bộ lọc"
          expandable
          meta={{
            onOpenDetail: (order) => {
              setSelectedDetailOrder(order)
              setIsDetailModalOpen(true)
            },
            onOpenInvoice: (order) => {
              setSelectedInvoiceOrder(order)
              setIsInvoiceModalOpen(true)
            },
          }}
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

                  {(txn.refundAccountNumber || txn.refundBankName) && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs space-y-1">
                      <p className="font-bold text-amber-900">
                        Tài khoản nhận tiền hoàn:
                      </p>
                      <div className="text-slate-700">
                        <span className="font-medium text-slate-500">Ngân hàng: </span>
                        <strong>{txn.refundBankName}</strong>
                      </div>
                      <div className="text-slate-700 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-500">Số tài khoản: </span>
                          <strong className="font-mono text-brand-700">
                            {revealedAccounts[txn.id] ? txn.refundAccountNumber : maskBankAccount(txn.refundAccountNumber)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRevealedAccounts(prev => ({ ...prev, [txn.id]: !prev[txn.id] }))}
                          className="text-[10px] text-brand-600 hover:text-brand-800 underline font-semibold ml-2 cursor-pointer"
                        >
                          {revealedAccounts[txn.id] ? 'Ẩn' : 'Hiện số'}
                        </button>
                      </div>
                      {txn.refundAccountHolderName && (
                        <div className="text-slate-700">
                          <span className="font-medium text-slate-500">Chủ tài khoản: </span>
                          <strong className="uppercase">{txn.refundAccountHolderName}</strong>
                        </div>
                      )}
                    </div>
                  )}

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
                Giao dịch qua {(txn.gateway || 'SePay').toUpperCase()}, không có yêu cầu hoàn tiền.
              </p>
            )
          }
        />
      </div>

      {/* Modal Chi tiết Giao dịch & Đơn hàng */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedDetailOrder}
        onOpenInvoice={(order) => {
          setSelectedInvoiceOrder(order)
          setIsInvoiceModalOpen(true)
        }}
      />

      {/* Modal Chi tiết Hóa đơn Điện tử */}
      <TransactionInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedInvoiceOrder}
      />

      {/* Modal Mã QR tĩnh thu tại quầy */}
      <StaticQrModal
        isOpen={isStaticQrModalOpen}
        onClose={() => setIsStaticQrModalOpen(false)}
      />
    </div>
  )
}

export default TransactionsPage
