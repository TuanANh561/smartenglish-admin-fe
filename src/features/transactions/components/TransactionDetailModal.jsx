import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileCheck2,
  Package,
  QrCode,
  ShieldCheck,
  User,
  X,
  XCircle,
  AlertCircle,
  Building2,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { GATEWAY_META, TXN_STATUS_META } from '../transactionsConstants'

export default function TransactionDetailModal({
  isOpen,
  onClose,
  order = null,
  onOpenInvoice = null,
}) {
  const [copiedKey, setCopiedKey] = useState(null)

  if (!isOpen || !order) return null

  const rawStatus = (order.status || 'completed').toLowerCase()
  const isPaid = ['completed', 'success', 'paid', 'matched'].includes(rawStatus)
  const isCancelled = ['cancelled', 'canceled', 'expired', 'failed'].includes(rawStatus)
  const isRefunded = rawStatus === 'refunded'
  const isPending = ['pending', 'processing'].includes(rawStatus)

  const statusMeta = TXN_STATUS_META[rawStatus] || {
    label: isCancelled ? 'Đã hủy' : isRefunded ? 'Đã hoàn tiền' : isPaid ? 'Thành công' : 'Chờ xử lý',
    tone: isCancelled ? 'neutral' : isRefunded ? 'info' : isPaid ? 'success' : 'warning',
  }

  const gatewayVal = (order.gateway || order.paymentGateway || 'vietqr').toLowerCase()
  const gatewayMeta = GATEWAY_META[gatewayVal] || { label: gatewayVal.toUpperCase(), dotClass: 'bg-emerald-500' }

  const displayCode = order.orderCode || (typeof order.id === 'number' ? `ORD-${order.id}` : order.id || 'N/A')
  const customerName = order.customerName || order.studentName || 'Khách vãng lai'
  const customerEmail = order.customerEmail || order.studentEmail || 'Chưa có email'
  const planName = (order.planName || order.plan || 'Gói SmartEnglish Premium').replace(/\s*\([^)]*\)/g, '').trim()
  const amount = Number(order.amount || order.amountFinal || 0)

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Đã sao chép: ${text}`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              isPaid
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : isCancelled
                ? 'bg-slate-100 text-slate-500 border border-slate-200'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              {isPaid ? (
                <CheckCircle2 size={20} />
              ) : isCancelled ? (
                <XCircle size={20} />
              ) : (
                <Clock size={20} />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Chi tiết giao dịch</h3>
                <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã đơn: <span className="font-mono font-semibold text-slate-700">{displayCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Card Số tiền lớn */}
          <div className={`p-4 rounded-xl border text-center ${
            isPaid
              ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-950'
              : isCancelled
              ? 'bg-slate-50 border-slate-200/70 text-slate-700'
              : 'bg-amber-50/50 border-amber-100/80 text-amber-950'
          }`}>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {isPaid ? 'Số tiền thanh toán thực nhận' : isCancelled ? 'Giá trị đơn đã hủy (0đ thực thu)' : 'Số tiền cần thanh toán'}
            </p>
            <p className={`text-2xl font-black ${
              isCancelled ? 'line-through text-slate-400 font-normal' : isPaid ? 'text-emerald-600' : 'text-slate-900'
            }`}>
              {formatCurrency(amount, { compact: false })}
            </p>
            <p className="text-2xs text-slate-400 mt-1">
              Thời gian khởi tạo: {formatDate(order.createdAt, 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>

          {/* Khối 1: Thông tin học viên */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
              <User size={14} className="text-brand-600" />
              <span>Thông tin học viên / Khách hàng</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400 block text-2xs">Họ và tên:</span>
                <span className="font-semibold text-slate-800">{customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Email:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-700 truncate">{customerEmail}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(customerEmail, 'email')}
                    className="text-slate-400 hover:text-brand-600 cursor-pointer"
                    title="Sao chép email"
                  >
                    {copiedKey === 'email' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Khối 2: Gói dịch vụ đăng ký */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
              <Package size={14} className="text-brand-600" />
              <span>Gói đăng ký & Quyền lợi</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tên gói:</span>
                <span className="font-bold text-slate-900">{planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Loại dịch vụ:</span>
                <span className="font-medium text-slate-700">Mở khóa toàn bộ tính năng AI Assistant 24/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái kích hoạt:</span>
                <span className={`font-semibold ${isPaid ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isPaid ? 'Đã kích hoạt quyền Premium' : isCancelled ? 'Chưa kích hoạt (Đã hủy đơn)' : 'Đang chờ thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* Khối 3: Cổng thanh toán & Đối soát ngân hàng (Chuẩn SePay) */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
              <Building2 size={14} className="text-brand-600" />
              <span>Chi tiết cổng & Đối soát ngân hàng (SePay / VietQR)</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cổng thanh toán:</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className={`h-2 w-2 rounded-full ${gatewayMeta.dotClass}`} />
                  {gatewayMeta.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-800">MB Bank (Quân Đội)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Số tài khoản / SĐT nhận:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-slate-900">0963684871</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('0963684871', 'acc')}
                    className="text-slate-400 hover:text-brand-600 cursor-pointer"
                    title="Sao chép STK"
                  >
                    {copiedKey === 'acc' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-semibold text-slate-800 uppercase">NGUYEN TUAN ANH</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cú pháp chuyển khoản:</span>
                <span className="font-mono font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                  {displayCode}
                </span>
              </div>
              {order.refundReason && (
                <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
                  <span className="font-bold block">Lý do hoàn tiền / hủy:</span>
                  <span>{order.refundReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng
          </Button>

          {isPaid && onOpenInvoice && (
            <Button
              size="sm"
              variant="primary"
              icon={FileCheck2}
              onClick={() => {
                onClose?.()
                onOpenInvoice?.(order)
              }}
            >
              Xem / In hóa đơn
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
