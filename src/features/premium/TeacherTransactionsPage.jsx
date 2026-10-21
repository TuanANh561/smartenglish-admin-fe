import { useState, useEffect, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Receipt,
  RefreshCw,
  FileCheck2,
  RotateCcw,
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  CreditCard,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable/DataTable'
import Badge from '@/components/ui/Badge'
import { getTeacherQuotaStatus } from '../classes/classApi'
import SepayVietQrPaymentModal from './components/SepayVietQrPaymentModal'
import TransactionInvoiceModal from '@/features/transactions/components/TransactionInvoiceModal'

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr) {
  if (!dateStr) return 'Mới cập nhật'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function TeacherTransactionsPage() {
  const user = useAuthStore((s) => s.user)
  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'

  // Trang này chỉ dành riêng cho Giáo viên xem lịch sử mua gói cá nhân.
  // Quản trị viên (Admin) được tự động điều hướng sang trang Quản lý Giao dịch & Đối soát toàn hệ thống.
  if (isAdmin) {
    return <Navigate to="/app/doi-soat" replace />
  }

  const teacherId = user?.id ?? null

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [myOrders, setMyOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [quota, setQuota] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL') // 'ALL' | 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'REFUND'
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)
  const [isSepayModalOpen, setIsSepayModalOpen] = useState(false)
  const [sepayOrder, setSepayOrder] = useState(null)

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [selectedRefundOrder, setSelectedRefundOrder] = useState(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundBank, setRefundBank] = useState('')
  const [refundAcc, setRefundAcc] = useState('')
  const [refundName, setRefundName] = useState('')
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false)

  const loadData = async () => {
    if (!teacherId) {
      setLoadingOrders(false)
      return
    }
    setLoadingOrders(true)
    try {
      const [quotaRes, ordersRes] = await Promise.allSettled([
        getTeacherQuotaStatus(),
        api.get('/payment/user/orders'),
      ])

      if (quotaRes.status === 'fulfilled' && quotaRes.value) {
        setQuota(quotaRes.value)
      }

      if (ordersRes.status === 'fulfilled') {
        const raw = ordersRes.value
        const ordersList = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : []
        setMyOrders(ordersList)
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách giao dịch:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [teacherId])

  // Xử lý mở Modal Hoàn tiền
  const handleOpenRefundModal = (ord) => {
    setSelectedRefundOrder(ord)
    setRefundReason('')
    setRefundBank('')
    setRefundAcc('')
    setRefundName(user?.name || '')
    setIsRefundModalOpen(true)
  }

  const handleSubmitRefund = async (e) => {
    e.preventDefault()
    if (!selectedRefundOrder) return
    if (!refundReason.trim()) {
      alert('Vui lòng nhập lý do yêu cầu hoàn tiền.')
      return
    }
    if (!refundBank.trim() || !refundAcc.trim() || !refundName.trim()) {
      alert('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng thụ hưởng.')
      return
    }

    setIsSubmittingRefund(true)
    try {
      await api.post(`/payment/orders/${selectedRefundOrder.id}/request-refund`, {
        reason: refundReason,
        bankName: refundBank,
        accountNumber: refundAcc,
        accountHolderName: refundName,
      })
      alert('Đã gửi yêu cầu hoàn tiền thành công! Ban Quản Trị sẽ đối soát và xử lý trong vòng 24-48 giờ.')
      setIsRefundModalOpen(false)
      setSelectedRefundOrder(null)
      loadData()
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Không thể gửi yêu cầu hoàn tiền. Vui lòng thử lại sau.')
    } finally {
      setIsSubmittingRefund(false)
    }
  }

  const isTeacherProActive = quota?.isPremium === true

  // Lọc danh sách giao dịch
  const filteredOrders = myOrders.filter((ord) => {
    const rawSt = (ord.status || '').toUpperCase()
    const isSuccess = rawSt === 'SUCCESS' || rawSt === 'COMPLETED' || rawSt === 'PAID'
    const isCancelledRaw = rawSt === 'CANCELLED' || rawSt === 'EXPIRED' || rawSt === 'FAILED'
    const isAlreadyActive = rawSt === 'PENDING' && isTeacherProActive
    const isCancelled = isCancelledRaw || isAlreadyActive
    const isPending = rawSt === 'PENDING' && !isAlreadyActive
    const isRefund = ord.refundStatus || rawSt === 'REFUNDED'

    if (filterStatus === 'SUCCESS' && !isSuccess) return false
    if (filterStatus === 'PENDING' && !isPending) return false
    if (filterStatus === 'CANCELLED' && !isCancelled) return false
    if (filterStatus === 'REFUND' && !isRefund) return false

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      const codeMatch = (ord.orderCode || '').toLowerCase().includes(q)
      const planMatch = (ord.planName || '').toLowerCase().includes(q)
      const invMatch = (ord.invoiceNumber || '').toLowerCase().includes(q)
      if (!codeMatch && !planMatch && !invMatch) return false
    }

    return true
  })

  // Phân trang 10 giao dịch / trang
  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const pagedOrders = useMemo(() => {
    return filteredOrders
      .slice(startIndex, startIndex + PAGE_SIZE)
      .map((ord, idx) => ({
        ...ord,
        id: ord.id ?? ord.orderCode ?? `order-${startIndex + idx}`,
      }))
  }, [filteredOrders, startIndex])

  useEffect(() => {
    if (page > totalPages) {
      setPage(1)
    }
  }, [totalPages, page])

  const columnHelper = useMemo(() => createColumnHelper(), [])

  const columns = useMemo(() => [
    columnHelper.accessor('orderCode', {
      header: 'Mã Đơn & Thời Gian',
      cell: (info) => {
        const ord = info.row.original
        return (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-navy-800 text-xs">
              {ord.orderCode || (ord.id ? `ORD-${ord.id}` : 'ORD-GIAODICH')}
            </span>
            <span className="text-[11px] text-ink-muted mt-0.5">
              {ord.createdAt ? formatDate(ord.createdAt) : 'Mới cập nhật'}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor('planName', {
      header: 'Gói Dịch Vụ',
      cell: (info) => {
        const ord = info.row.original
        const isYearly = ord.planName?.toLowerCase().includes('năm')
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-navy-800 text-xs">
              {ord.planName || ord.courseName || 'Gói Giảng Viên Pro'}
            </span>
            <span className="text-[11px] text-ink-muted">
              {isYearly ? '12 tháng (Năm)' : '1 tháng (Tháng)'}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor('amount', {
      header: 'Số Tiền',
      cell: (info) => (
        <span className="font-extrabold text-navy-800 text-xs sm:text-sm">
          {formatCurrency(info.getValue() || 0)}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'gateway',
      header: 'Phương Thức',
      cell: () => (
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          VietQR Napas
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Trạng Thái',
      cell: (info) => {
        const ord = info.row.original
        const rawSt = (ord.status || '').toUpperCase()
        const isSuccess = rawSt === 'SUCCESS' || rawSt === 'COMPLETED' || rawSt === 'PAID'
        const isPending = rawSt === 'PENDING'
        const isCancelled = rawSt === 'CANCELLED'
        const isExpiredRaw = rawSt === 'EXPIRED'
        const isExpiredByTime =
          isPending && (ord.expiresAt ? new Date(ord.expiresAt).getTime() < Date.now() : (new Date(ord.createdAt || Date.now()).getTime() + 10 * 60 * 1000) < Date.now())
        const isExpired = isExpiredRaw || isExpiredByTime
        const isAlreadyActive = isPending && isTeacherProActive

        if (ord.refundStatus === 'PENDING_REVIEW') {
          return (
            <Badge tone="warning">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse mr-1 inline-block" />
              Chờ duyệt hoàn tiền
            </Badge>
          )
        }
        if (ord.status === 'REFUNDED' || ord.refundStatus === 'REFUNDED') {
          return <Badge tone="danger">Đã hoàn tiền</Badge>
        }
        if (ord.refundStatus === 'REJECTED') {
          return <Badge tone="danger">Từ chối hoàn tiền</Badge>
        }
        if (isSuccess) {
          return <Badge tone="success">Đã thanh toán</Badge>
        }
        if (isAlreadyActive || isCancelled) {
          return (
            <Badge tone="neutral" title={ord.cancelReason || 'Đã hủy do có gói đã thành công'}>
              {ord.cancelReason || 'Đã hủy'}
            </Badge>
          )
        }
        if (isExpired) {
          return (
            <Badge tone="neutral" title="Mã QR đã hết hạn thanh toán (quá 10 phút)">
              Đã hết hạn
            </Badge>
          )
        }
        if (isPending) {
          return (
            <Badge tone="warning">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse mr-1 inline-block" />
              Chờ thanh toán (10p)
            </Badge>
          )
        }
        return <Badge tone="danger">Thất bại</Badge>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right block w-full">Hành Động</span>,
      meta: { align: 'right' },
      cell: (info) => {
        const ord = info.row.original
        const rawSt = (ord.status || '').toUpperCase()
        const isSuccess = rawSt === 'SUCCESS' || rawSt === 'COMPLETED' || rawSt === 'PAID'
        const isPending = rawSt === 'PENDING'
        const isCancelled = rawSt === 'CANCELLED'
        const isExpiredRaw = rawSt === 'EXPIRED'
        const isExpiredByTime =
          isPending && (ord.expiresAt ? new Date(ord.expiresAt).getTime() < Date.now() : (new Date(ord.createdAt || Date.now()).getTime() + 10 * 60 * 1000) < Date.now())
        const isExpired = isExpiredRaw || isExpiredByTime
        const isAlreadyActive = isPending && isTeacherProActive

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isSuccess && (
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoiceOrder(ord)
                  setIsInvoiceModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-2xs active:scale-95 cursor-pointer"
                title="Xem & Tải hóa đơn điện tử (PDF)"
              >
                <FileCheck2 size={13} />
                <span>Hóa đơn</span>
              </button>
            )}

            {isSuccess &&
              ord.status !== 'REFUNDED' &&
              ord.refundStatus !== 'REFUNDED' &&
              ord.refundStatus !== 'PENDING_REVIEW' && (
                <button
                  type="button"
                  onClick={() => handleOpenRefundModal(ord)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-2xs active:scale-95 cursor-pointer"
                  title="Yêu cầu hoàn tiền trong 7 ngày"
                >
                  <RotateCcw size={13} />
                  <span>Hoàn tiền</span>
                </button>
              )}

            {isPending && !isExpired && !isAlreadyActive ? (
              <button
                type="button"
                onClick={() => {
                  setSepayOrder(ord)
                  setIsSepayModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs animate-pulse active:scale-95 cursor-pointer"
              >
                <QrCode size={13} />
                <span>Quét lại QR</span>
              </button>
            ) : isAlreadyActive || isCancelled ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed opacity-75"
                title="Bạn đã kích hoạt gói Pro thành công rồi, không thể quét lại đơn này."
              >
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Đã có gói</span>
              </button>
            ) : isPending ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed opacity-75"
                title="Mã QR đã hết thời hạn 10 phút. Vui lòng tạo giao dịch mới."
              >
                <QrCode size={12} />
                <span>Hết hạn</span>
              </button>
            ) : null}
          </div>
        )
      },
    }),
  ], [isTeacherProActive])

  // Thống kê nhanh
  const totalSpent = myOrders
    .filter((o) => {
      const st = (o.status || '').toUpperCase()
      return st === 'SUCCESS' || st === 'COMPLETED' || st === 'PAID'
    })
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

  const successCount = myOrders.filter((o) => {
    const st = (o.status || '').toUpperCase()
    return st === 'SUCCESS' || st === 'COMPLETED' || st === 'PAID'
  }).length

  const pendingCount = myOrders.filter((o) => {
    const st = (o.status || '').toUpperCase()
    return st === 'PENDING' && !isTeacherProActive
  }).length

  const cancelledCount = myOrders.filter((o) => {
    const s = (o.status || '').toUpperCase()
    return s === 'CANCELLED' || s === 'EXPIRED' || s === 'FAILED' || (s === 'PENDING' && isTeacherProActive)
  }).length

  return (
    <div className="space-y-6">
      {/* 4 Thẻ Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Tổng Chi Phí Nâng Cấp</p>
            <p className="text-lg font-black text-navy-800 mt-0.5">{formatCurrency(totalSpent)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Giao Dịch Thành Công</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{successCount} đơn hàng</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Chờ Thanh Toán (10 phút)</p>
            <p className="text-lg font-black text-amber-700 mt-0.5">{pendingCount} đơn hàng</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Gói Hiện Tại</p>
            <p className="text-sm font-bold text-navy-800 mt-0.5">
              {isTeacherProActive ? 'Giảng Viên Pro (VIP)' : 'Gói Starter (Cơ bản)'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container Bảng Giao Dịch */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        {/* Bộ lọc & Tìm kiếm + Action Buttons đồng bộ trên 1 row */}
        <div className="p-3 sm:p-4 border-b border-line bg-white flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Tabs Filter (Trái) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {[
              { id: 'ALL', label: 'Tất cả', count: myOrders.length },
              { id: 'SUCCESS', label: 'Đã thanh toán', count: successCount },
              { id: 'PENDING', label: 'Chờ thanh toán', count: pendingCount },
              {
                id: 'CANCELLED',
                label: 'Đã hủy / Hết hạn',
                count: cancelledCount,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterStatus(tab.id)
                  setPage(1)
                }}
                className={`h-10 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Cụm Tìm kiếm & Action Buttons (Phải) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Search box với icon kính lúp và nút xóa đồng bộ chiều cao h-10 */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm mã đơn, tên gói..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs sm:text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setPage(1)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Xóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Nút Nâng cấp / Xem các gói */}
            <Link
              to="/app/goi-dich-vu"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 text-xs font-bold text-brand-700 hover:bg-brand-100 hover:border-brand-300 transition shadow-2xs whitespace-nowrap active:scale-95"
            >
              <Sparkles size={15} className="text-brand-600" />
              <span>Nâng cấp / Xem các gói</span>
            </Link>

            {/* Nút Làm mới */}
            <button
              type="button"
              onClick={loadData}
              disabled={loadingOrders}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer whitespace-nowrap active:scale-95"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} className={loadingOrders ? 'animate-spin text-brand-600' : 'text-slate-500'} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Nội dung Bảng qua chuẩn component DataTable */}
        <DataTable
          columns={columns}
          data={pagedOrders}
          isLoading={loadingOrders}
          loadingMessage="Đang tải lịch sử giao dịch..."
          loadingVariant="skeleton"
          emptyMessage={
            searchTerm || filterStatus !== 'ALL'
              ? 'Không có đơn hàng nào khớp với điều kiện lọc hiện tại.'
              : 'Khi quý thầy cô hoàn tất thanh toán nâng cấp gói, toàn bộ hóa đơn điện tử và giao dịch VietQR sẽ được lưu trữ tại đây.'
          }
          pagination={{
            page,
            size: PAGE_SIZE,
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / PAGE_SIZE) || 1,
          }}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Quét mã VietQR SePay Napas 24/7 (10 phút) */}
      <SepayVietQrPaymentModal
        isOpen={isSepayModalOpen}
        onClose={() => setIsSepayModalOpen(false)}
        order={sepayOrder}
        onSuccess={() => {
          setIsSepayModalOpen(false)
          loadData()
        }}
      />

      {/* Modal Chi tiết Giao dịch & Hóa đơn Điện tử (NĐ 123) */}
      <TransactionInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setSelectedInvoiceOrder(null)
        }}
        order={selectedInvoiceOrder}
        onUpdated={loadData}
      />

      {/* Modal Yêu Cầu Hoàn Tiền (Refund) */}
      {isRefundModalOpen && selectedRefundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-800">Yêu Cầu Hoàn Tiền</h3>
                  <p className="text-xs text-ink-muted">Chính sách bảo hành hoàn phí 7 ngày</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-line">
                <div className="flex justify-between text-ink-muted">
                  <span>Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-navy-800">
                    {selectedRefundOrder.orderCode || `ORD-${selectedRefundOrder.id}`}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted mt-1">
                  <span>Số tiền hoàn:</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {formatCurrency(selectedRefundOrder.amount || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1">
                  Lý do yêu cầu hoàn tiền (*):
                </label>
                <textarea
                  rows={2}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ví dụ: Tính năng chưa phù hợp với chương trình giảng dạy của tôi..."
                  className="w-full rounded-xl border border-line p-2.5 text-xs text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1">
                  Ngân hàng nhận tiền hoàn (*):
                </label>
                <input
                  type="text"
                  required
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                  placeholder="Ví dụ: MB Bank, Vietcombank, Techcombank..."
                  className="w-full rounded-xl border border-line px-3 py-2 text-xs text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1">
                  Số tài khoản nhận tiền (*):
                </label>
                <input
                  type="text"
                  required
                  value={refundAcc}
                  onChange={(e) => setRefundAcc(e.target.value)}
                  placeholder="Ví dụ: 0963684871"
                  className="w-full rounded-xl border border-line px-3 py-2 text-xs text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1">
                  Tên chủ tài khoản (In hoa không dấu) (*):
                </label>
                <input
                  type="text"
                  required
                  value={refundName}
                  onChange={(e) => setRefundName(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className="w-full rounded-xl border border-line px-3 py-2 text-xs text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingRefund && <Loader2 size={14} className="animate-spin" />}
                  <span>Gửi yêu cầu hoàn tiền</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
