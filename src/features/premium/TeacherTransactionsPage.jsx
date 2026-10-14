import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  RefreshCw,
  FileCheck2,
  RotateCcw,
  QrCode,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  CreditCard,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
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
  const teacherId = user?.id ?? null

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
        getTeacherQuotaStatus(teacherId),
        api.get(`/payment/user/orders?userId=${teacherId}`),
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
      await api.post(`/payment/orders/${selectedRefundOrder.id}/request-refund?userId=${teacherId}`, {
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
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted mb-1">
            <Link to="/app/goi-dich-vu" className="hover:text-brand-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={13} />
              Gói dịch vụ giảng dạy
            </Link>
            <span>/</span>
            <span className="text-navy-700 font-semibold">Quản lý giao dịch & Hóa đơn</span>
          </div>
          <h1 className="text-2xl font-black text-navy-800 tracking-tight flex items-center gap-2">
            <Receipt className="text-brand-600" size={26} />
            Quản Lý Giao Dịch & Hóa Đơn Điện Tử
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Theo dõi dòng tiền mua gói, tra cứu mã đối soát VietQR Napas 24/7 và tải hóa đơn điện tử hợp lệ (NĐ 123/2020/NĐ-CP).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/goi-dich-vu"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-2xs"
          >
            <Sparkles size={14} />
            Nâng cấp / Xem các gói
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loadingOrders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-navy-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingOrders ? 'animate-spin text-brand-600' : 'text-slate-500'} />
            Làm mới
          </button>
        </div>
      </div>

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
        {/* Bộ lọc & Tìm kiếm */}
        <div className="p-4 sm:p-5 border-b border-line bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white border border-line text-slate-600 hover:bg-slate-100'
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

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên gói..."
              className="w-full rounded-xl border border-line bg-white pl-9 pr-3 py-1.5 text-xs text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Nội dung Bảng */}
        {loadingOrders ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-ink-muted">
            <Loader2 size={30} className="animate-spin text-brand-600" />
            <p className="text-xs font-semibold">Đang tải lịch sử giao dịch và hóa đơn...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Receipt size={28} />
            </span>
            <h4 className="font-bold text-navy-700 text-sm">Không tìm thấy giao dịch nào</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Không có đơn hàng nào khớp với điều kiện lọc hiện tại.'
                : 'Khi quý thầy cô hoàn tất thanh toán nâng cấp gói, toàn bộ hóa đơn điện tử và giao dịch VietQR sẽ được lưu trữ tại đây.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="py-3 px-4 sm:px-6">Mã Đơn & Thời Gian</th>
                  <th className="py-3 px-4">Gói Dịch Vụ</th>
                  <th className="py-3 px-4">Số Tiền</th>
                  <th className="py-3 px-4">Phương Thức</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((ord) => {
                  const rawSt = (ord.status || '').toUpperCase()
                  const isSuccess = rawSt === 'SUCCESS' || rawSt === 'COMPLETED' || rawSt === 'PAID'
                  const isPending = rawSt === 'PENDING'
                  const isCancelled = rawSt === 'CANCELLED'
                  const isExpiredRaw = rawSt === 'EXPIRED'
                  const isExpiredByTime =
                    isPending && (ord.expiresAt ? new Date(ord.expiresAt).getTime() < Date.now() : (new Date(ord.createdAt || Date.now()).getTime() + 10 * 60 * 1000) < Date.now())
                  const isExpired = isExpiredRaw || isExpiredByTime

                  // Kiểm tra xem giáo viên đã có gói Pro active chưa
                  const isAlreadyActive = isPending && isTeacherProActive

                  return (
                    <tr key={ord.id || ord.orderCode} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-navy-800 text-xs">
                            {ord.orderCode || `ORD-${ord.id}`}
                          </span>
                          <span className="text-[11px] text-ink-muted mt-0.5">
                            {ord.createdAt ? formatDate(ord.createdAt) : 'Mới cập nhật'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-navy-800">
                            {ord.planName || ord.courseName || 'Gói Giảng Viên Pro'}
                          </span>
                          <span className="text-[11px] text-ink-muted">
                            {ord.planName?.toLowerCase().includes('năm') ? '12 tháng' : '1 tháng'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-navy-800 text-xs sm:text-sm">
                          {formatCurrency(ord.amount || 0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          VietQR Napas
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {ord.refundStatus === 'PENDING_REVIEW' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            Chờ duyệt hoàn tiền
                          </span>
                        ) : ord.status === 'REFUNDED' || ord.refundStatus === 'REFUNDED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                            Đã hoàn tiền
                          </span>
                        ) : ord.refundStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                            Từ chối hoàn tiền
                          </span>
                        ) : isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                            Đã thanh toán
                          </span>
                        ) : isAlreadyActive || isCancelled ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200"
                            title={ord.cancelReason || 'Đã hủy do có gói đã thành công'}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            {ord.cancelReason || 'Đã hủy do có gói đã thành công'}
                          </span>
                        ) : isExpired ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500 border border-slate-200"
                            title="Mã QR đã hết hạn thanh toán (quá 10 phút)"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Đã hết hạn
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            Chờ thanh toán (10p)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                            Thất bại
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Xem Hóa Đơn & Hoàn Ứng */}
                          {isSuccess && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceOrder(ord)
                                setIsInvoiceModalOpen(true)
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-2xs"
                              title="Tải hóa đơn điện tử PDF & MST hoàn ứng"
                            >
                              <FileCheck2 size={13} />
                              <span>Hóa đơn</span>
                            </button>
                          )}

                          {/* Nút Yêu cầu hoàn tiền trong 7 ngày */}
                          {isSuccess &&
                            ord.status !== 'REFUNDED' &&
                            ord.refundStatus !== 'REFUNDED' &&
                            ord.refundStatus !== 'PENDING_REVIEW' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRefundModal(ord)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                                title="Yêu cầu hoàn tiền trong 7 ngày"
                              >
                                <RotateCcw size={13} />
                                <span>Hoàn tiền</span>
                              </button>
                            )}

                          {/* Nút Quét lại QR — CHỈ KHẢ DỤNG KHI CHƯA HẾT HẠN VÀ CHƯA CÓ GÓI PRO */}
                          {isPending && !isExpired && !isAlreadyActive ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSepayOrder(ord)
                                setIsSepayModalOpen(true)
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs animate-pulse"
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
