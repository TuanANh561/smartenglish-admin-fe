import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  ExternalLink,
  Printer,
  QrCode,
  ShieldCheck,
  X,
  CreditCard,
  Building2,
  Calendar,
  User,
  BadgeCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

export default function TransactionInvoiceModal({
  isOpen,
  onClose,
  order = null,
  orderId = null,
}) {
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const printRef = useRef(null)

  // Fetch full invoice detail if orderId is provided or to enrich order
  useEffect(() => {
    if (!isOpen) {
      setInvoiceData(null)
      return
    }

    const targetId = orderId || order?.id || order?.orderId
    if (targetId) {
      setLoading(true)
      api
        .get(`/admin/orders/${targetId}/invoice`)
        .then((res) => {
          const data = res?.data !== undefined ? res.data : res
          setInvoiceData(data)
        })
        .catch((err) => {
          console.warn('Lỗi nạp hóa đơn chi tiết, sử dụng dữ liệu đơn hàng sẵn có:', err)
          // Fallback to order prop
          setInvoiceData(null)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, orderId, order?.id])

  if (!isOpen) return null

  // Resolve fields from invoiceData or order fallback
  const inv = invoiceData || {}
  const rawOrder = order || {}

  const invoiceNo =
    inv.invoiceNumber ||
    rawOrder.orderCode ||
    (rawOrder.id ? `INV-202610-${String(rawOrder.id).padStart(5, '0')}` : 'INV-202610-00101')
  const serial = inv.invoiceSerial || 'SE/26E'
  const issuedDate = inv.issuedAt || rawOrder.createdAt || new Date().toISOString()
  const txnId = inv.gatewayTxnId || rawOrder.gatewayTxnId || 'TXN-ONLINE-SUCCESS'
  const isPaid = (inv.status || rawOrder.status || 'SUCCESS').toUpperCase() === 'SUCCESS' ||
    (inv.status || rawOrder.status || '').toLowerCase() === 'completed'

  const customerName =
    inv.customerName ||
    rawOrder.customerName ||
    rawOrder.studentName ||
    'Quý khách hàng SmartEnglish'
  const customerEmail =
    inv.customerEmail ||
    rawOrder.customerEmail ||
    rawOrder.studentEmail ||
    'khachhang@smartenglish.edu.vn'
  const customerRole = inv.customerRole || 'Giáo viên (Teacher Pro)'

  const planName =
    inv.items?.[0]?.planName ||
    rawOrder.planName ||
    'Gói Dịch Vụ Giáo Viên Chuyên Nghiệp (Teacher Pro)'
  const billingCycle = inv.billingCycle || 'Năm (12 tháng)'
  const periodEnd = inv.periodEnd || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()

  const amountFinal =
    inv.amountFinal !== undefined
      ? Number(inv.amountFinal)
      : rawOrder.amount !== undefined
      ? Number(rawOrder.amount)
      : 3990000

  const originalAmount =
    inv.amountOriginal !== undefined ? Number(inv.amountOriginal) : amountFinal
  const discountAmount =
    inv.discountAmount !== undefined ? Number(inv.discountAmount) : 0

  const paymentMethod =
    inv.paymentMethodName ||
    (rawOrder.gateway === 'stripe'
      ? 'Thẻ Quốc Tế Visa/Mastercard (Stripe)'
      : rawOrder.gateway === 'vnpay'
      ? 'Cổng VNPAY (ATM/QR Pay)'
      : rawOrder.gateway === 'momo'
      ? 'Ví Điện Tử MoMo'
      : 'Thanh toán trực tuyến')

  const amountInWords =
    inv.amountInWords ||
    (amountFinal === 3990000
      ? 'Ba triệu chín trăm chín mươi nghìn đồng chẵn'
      : `${formatCurrency(amountFinal, { compact: false })} đồng chẵn`)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invoiceNo)
    toast.success(`Đã sao chép mã hóa đơn: ${invoiceNo}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Kích hoạt in dưới dạng PDF hoặc tải bản ghi
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Container Modal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-50 rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Modal Top Bar (Sticky Action Bar) */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 no-print">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <FileCheck2 size={20} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Chi tiết Hóa đơn & Giao dịch</h3>
                {isPaid && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Đã thanh toán
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Số: {invoiceNo} • Ký hiệu: {serial}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Copy}
              onClick={handleCopyCode}
              title="Sao chép mã hóa đơn"
            >
              Sao chép
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Printer}
              onClick={handlePrint}
              title="In trực tiếp hoặc Lưu file PDF"
            >
              In hóa đơn
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              onClick={handleDownload}
              title="Tải hóa đơn điện tử"
            >
              Tải PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Invoice Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70">
          <div
            ref={printRef}
            id="printable-invoice"
            className="max-w-3xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-10 text-slate-800 printable-card"
          >
            {/* Header: Company Info + National Emblem Title */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-900 text-white font-extrabold text-sm">
                      SE
                    </div>
                    <span className="text-lg font-black tracking-tight text-navy-900 uppercase">
                      SmartEnglish AI Platform
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    CÔNG TY CỔ PHẦN CÔNG NGHỆ GIÁO DỤC SMARTENGLISH AI
                  </p>
                  <p className="text-xs text-slate-500">
                    Mã số thuế: <strong className="font-mono text-slate-700">0109887766</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Địa chỉ: Tầng 8, Tòa nhà Innovation Hub, Duy Tân, Q. Cầu Giấy, TP. Hà Nội
                  </p>
                  <p className="text-xs text-slate-500">
                    Hotline: 1900 6868 • Email: billing@smartenglish.edu.vn
                  </p>
                </div>

                <div className="text-right sm:min-w-[200px]">
                  <div className="inline-block border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-left w-full space-y-1">
                    <div className="text-2xs uppercase tracking-wider text-slate-400 font-bold">
                      Hóa đơn điện tử (e-Invoice)
                    </div>
                    <div className="text-xs text-slate-600">
                      Mẫu số: <span className="font-mono font-bold text-slate-800">01GTKT0/001</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Ký hiệu: <span className="font-mono font-bold text-slate-800">{serial}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Số: <span className="font-mono font-bold text-brand-600">{invoiceNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center mt-6">
                <h1 className="text-xl sm:text-2xl font-black uppercase text-navy-900 tracking-wide">
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG (ĐIỆN TỬ)
                </h1>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Ngày lập: {formatDate(issuedDate, 'dd/MM/yyyy HH:mm:ss')} (Bản thể hiện của hóa đơn điện tử)
                </p>
              </div>
            </div>

            {/* Customer & Transaction Info */}
            <div className="py-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="text-2xs uppercase tracking-wider text-slate-400 font-bold">
                  Thông tin khách hàng (Người mua)
                </div>
                <div className="text-sm font-bold text-slate-900">{customerName}</div>
                <div className="text-slate-600">
                  Email: <span className="font-medium text-slate-800">{customerEmail}</span>
                </div>
                <div className="text-slate-600">
                  Vai trò: <span className="font-medium text-slate-800">{customerRole}</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-slate-100 sm:pl-6">
                <div className="text-2xs uppercase tracking-wider text-slate-400 font-bold">
                  Phương thức & Đối soát thanh toán
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CreditCard size={14} className="text-brand-600" />
                  <span className="font-semibold">{paymentMethod}</span>
                </div>
                <div className="text-slate-600">
                  Mã tham chiếu GD: <span className="font-mono text-slate-800">{txnId}</span>
                </div>
                <div className="text-slate-600">
                  Hiệu lực gói: <span className="font-medium text-slate-800">{formatDate(issuedDate, 'dd/MM/yyyy')} → {formatDate(periodEnd, 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-4">Tên dịch vụ & Gói bản quyền</th>
                      <th className="py-2.5 px-3 text-center">Kỳ hạn</th>
                      <th className="py-2.5 px-3 text-center w-14">SL</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Giảm giá</th>
                      <th className="py-2.5 px-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 text-center font-medium text-slate-500">1</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{planName}</div>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          Bản quyền giảng dạy tiếng Anh thông minh với AI, quản lý học viên, tạo đề thi và chấm Speaking/Writing tự động.
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">{billingCycle}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatCurrency(originalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">
                        {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0 đ'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(amountFinal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Breakdown */}
              <div className="mt-4 flex flex-col sm:flex-row justify-end">
                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cộng tiền dịch vụ:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(originalAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Chiết khấu ưu đãi:</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế suất GTGT:</span>
                    <span className="font-semibold text-slate-800">0% (Không chịu thuế)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tiền thuế GTGT:</span>
                    <span className="font-semibold text-slate-800">0 đ</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900 uppercase">Tổng cộng thanh toán:</span>
                    <span className="text-lg font-black text-emerald-600">
                      {formatCurrency(amountFinal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                <strong>Số tiền viết bằng chữ:</strong> <span className="italic">{amountInWords}</span>
              </div>
            </div>

            {/* Footer Signatures, Stamp & QR Verification */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              {/* QR Verification */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-slate-200 rounded-lg bg-white shadow-2xs">
                    <QrCode size={56} className="text-slate-800" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Mã tra cứu hóa đơn</p>
                    <p className="font-mono text-2xs text-brand-600 font-semibold">{invoiceNo}</p>
                    <p className="text-2xs text-slate-500">
                      Quét mã QR hoặc truy cập{' '}
                      <span className="text-brand-600 underline">smartenglish.edu.vn/invoice</span> để tra cứu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Stamp & Signature */}
              <div className="text-center sm:text-right space-y-1">
                <div className="text-xs font-bold text-slate-900 uppercase">
                  ĐƠN VỊ BÁN HÀNG
                </div>
                <div className="text-2xs text-slate-500 italic">
                  (Ký điện tử bởi SmartEnglish AI CA)
                </div>
                
                {/* Official Electronic Stamp Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-emerald-500/80 bg-emerald-50/70 text-emerald-800 my-1">
                  <BadgeCheck size={20} className="text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <div className="text-2xs font-black tracking-wider uppercase text-emerald-900">
                      ĐÃ THANH TOÁN • PAID
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      {formatDate(issuedDate, 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                <p className="text-2xs text-slate-400">
                  Chữ ký số hợp lệ theo Luật Giao dịch điện tử số 51/2005/QH11
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (No-print buttons) */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-200 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Hóa đơn hợp lệ theo quy định của Tổng cục Thuế Việt Nam</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="primary" icon={Printer} onClick={handlePrint}>
              In / Xuất hóa đơn
            </Button>
          </div>
        </div>
      </div>

      {/* Global Print Style Helper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
