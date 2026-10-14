import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  QrCode,
  ShieldCheck,
  X,
  Clock,
  Check,
  Building2,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

export default function SepayVietQrPaymentModal({
  isOpen,
  onClose,
  order = null,
  onSuccess = null,
}) {
  const [copiedField, setCopiedField] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const calculateRemainingSeconds = () => {
    if (order?.expiresAt) {
      const diff = Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 1000)
      return Math.max(0, diff)
    }
    return 10 * 60 // Chuẩn hóa 10 phút
  }
  const [timeLeft, setTimeLeft] = useState(calculateRemainingSeconds)
  const timerRef = useRef(null)
  const pollIntervalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(calculateRemainingSeconds())
    }
  }, [isOpen, order])

  const orderCode = order?.orderCode || ''
  const amount = Number(order?.amount || order?.amountFinal || 20000)
  const planName = order?.planName || 'Gói Giáo Viên Pro (Teacher Pro)'
  const bankInfo = {
    bankName: order?.bankName || 'MB Bank (Ngân hàng TMCP Quân Đội)',
    bankCode: order?.bankCode || 'MB',
    accountNumber: order?.accountNumber || '0963684871',
    accountName: order?.accountName || 'NGUYEN TUAN ANH',
  }

  const qrUrl =
    order?.qrUrl ||
    `https://qr.sepay.vn/img?acc=${bankInfo.accountNumber}&bank=${bankInfo.bankCode}&amount=${amount}&des=${encodeURIComponent(
      orderCode
    )}&template=compact`

  // Phát âm thanh celebration chime bằng Web Audio API thuần (không cần file mp3 ngoài)
  const playSuccessChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.45)
      })
    } catch (e) {
      console.warn('Audio chime warning:', e)
    }
  }

  // Polling tự động kiểm tra trạng thái đơn hàng qua API
  useEffect(() => {
    if (!isOpen || !orderCode || paymentSuccess) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      return
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true)
        const res = await api.get(`/payment/orders/${orderCode}/status`)
        const data = res?.data !== undefined ? res.data : res
        if (data?.isSuccess || data?.status === 'SUCCESS' || data?.status === 'completed') {
          handlePaymentSuccess()
        }
      } catch (err) {
        // Silently retry in background
      } finally {
        setIsChecking(false)
      }
    }

    // Kiểm tra ngay khi vừa mở modal
    checkStatus()

    // Sau đó lặp lại mỗi 2.5 giây
    pollIntervalRef.current = setInterval(checkStatus, 2500)

    // Đếm ngược thời gian thanh toán
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, orderCode, paymentSuccess])

  const handlePaymentSuccess = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    setPaymentSuccess(true)
    playSuccessChime()
    toast.success('🎉 Đã nhận thanh toán thành công qua SePay!')
    try {
      window.dispatchEvent(new Event('smartenglish:notification_update'))
    } catch {}
    if (onSuccess) {
      onSuccess(order)
    }
  }

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép: ${text}`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDownloadQr = () => {
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `VietQR-${orderCode}.png`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Đang mở tải ảnh mã QR')
  }

  if (!isOpen) return null

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <QrCode size={20} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Thanh toán VietQR Napas 24/7
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Tự động gạch nợ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quét mã từ bất kỳ ứng dụng ngân hàng nào • Xác thực tức thì trong 1 - 3 giây
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung khi đã thanh toán thành công */}
        {paymentSuccess ? (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                Thanh toán thành công 100%
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                Chúc mừng bạn đã kích hoạt {planName}!
              </h4>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Hệ thống SePay đã ghi nhận biến động số dư cho đơn{' '}
                <strong className="text-slate-700 font-mono">{orderCode}</strong>. Quyền lợi giáo
                viên và Hóa đơn điện tử đã được phát hành.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 max-w-sm mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-slate-800">{orderCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền thanh toán:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium text-slate-700">VietQR Napas 24/7 (MB Bank)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" onClick={onClose} className="px-6 py-2 text-sm shadow-sm">
                Hoàn tất & Bắt đầu trải nghiệm
              </Button>
            </div>
          </div>
        ) : (
          /* Nội dung khi đang chờ chuyển khoản */
          <div className="p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Cột trái: Ảnh mã QR (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative group p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <img
                    src={qrUrl}
                    alt="Mã VietQR Thanh Toán"
                    className={`w-52 h-52 object-contain rounded-lg transition-all ${
                      timeLeft === 0 ? 'opacity-20 blur-[1px]' : ''
                    }`}
                  />
                  {timeLeft === 0 && (
                    <div className="absolute inset-0 bg-white/85 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                      <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5">
                        <AlertTriangle size={22} />
                      </div>
                      <p className="text-xs font-bold text-rose-600">Mã QR đã hết hạn</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Vui lòng đóng và bấm nâng cấp lại để lấy mã mới
                      </p>
                    </div>
                  )}
                </div>

                {/* Hết hạn & Tải mã */}
                <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                      timeLeft === 0
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200/80'
                    }`}
                  >
                    <Clock size={12} />
                    {timeLeft === 0 ? 'Đã hết hạn' : `Hết hạn sau: ${formatTimer(timeLeft)}`}
                  </span>
                  {timeLeft > 0 && (
                    <button
                      onClick={handleDownloadQr}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md transition shadow-2xs"
                    >
                      <Download size={12} />
                      Lưu QR
                    </button>
                  )}
                </div>

                {/* Radar loading indicator hoặc thông báo hết hạn */}
                {timeLeft > 0 ? (
                  <div className="mt-3.5 w-full py-2 px-3 bg-indigo-50/70 border border-indigo-100/80 text-indigo-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    <span>Đang chờ chuyển khoản từ App...</span>
                  </div>
                ) : (
                  <div className="mt-3.5 w-full py-2 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Giao dịch đã kết thúc (10 phút)</span>
                  </div>
                )}
              </div>

              {/* Cột phải: Thông tin chuyển khoản & Copy (7 cols) */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="mb-1">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Thông tin thanh toán chuyển khoản
                  </h4>
                </div>

                {/* Ngân hàng */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Ngân hàng thụ hưởng</span>
                    <div className="font-semibold text-slate-800 text-xs">
                      {bankInfo.bankName}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {bankInfo.bankCode}
                  </span>
                </div>

                {/* Số tài khoản */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Số tài khoản (STK)</span>
                    <span className="font-mono font-bold text-indigo-600 text-sm tracking-wide">
                      {bankInfo.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(bankInfo.accountNumber, 'acc')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                  >
                    {copiedField === 'acc' ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Chủ tài khoản */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Tên chủ tài khoản</span>
                    <div className="font-semibold text-slate-800 text-xs uppercase">
                      {bankInfo.accountName}
                    </div>
                  </div>
                </div>

                {/* Số tiền cần thanh toán */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Số tiền thanh toán</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Ưu đãi 20.000đ
                  </span>
                </div>

                {/* Nội dung chuyển khoản BẮT BUỘC (Nổi bật nhất - Khóa chống chỉnh sửa) */}
                <div className="p-3 bg-amber-50/80 rounded-xl border-2 border-amber-300 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <Lock size={12} className="text-amber-700" />
                        Nội dung chuyển khoản (BẮT BUỘC CHÍNH XÁC):
                      </span>
                      <span className="font-mono font-black text-amber-900 text-lg tracking-wider">
                        {orderCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(orderCode, 'code')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-xs transition"
                    >
                      {copiedField === 'code' ? (
                        <>
                          <Check size={13} />
                          <span>Đã chép mã</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Sao chép mã</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium">
                    ⚠️ Tuyệt đối giữ nguyên nội dung trên để hệ thống AI tự động đối soát và kích hoạt gói sau 2 giây.
                  </p>
                </div>
              </div>
            </div>

            {/* Lưu ý quan trọng */}
            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo mật & Tự động:</strong> Vui lòng giữ nguyên nội dung chuyển khoản{' '}
                <strong className="text-amber-800 font-mono font-bold">{orderCode}</strong>. Hệ
                thống SePay sẽ tự động đối soát số dư và nâng cấp tài khoản VIP ngay lập tức mà không
                cần can thiệp thủ công.
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer Bar */}
        <div className="px-6 py-3 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Hệ thống Napas 24/7 đang kết nối trực tiếp với SePay</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock size={12} />
            <span>Mã hóa bảo mật SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
