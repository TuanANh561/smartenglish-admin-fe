import { useState } from 'react'
import { Copy, Check, X, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

/**
 * Giao diện xem trước email nhận mã OTP
 * Thiết kế tối giản, thanh lịch, chuẩn thương hiệu SmartEnglish AI (không icon màu mè, không rườm rà)
 */
export default function EmailOtpPreviewModal({
  isOpen,
  onClose,
  otpCode,
  recipientEmail,
  recipientName,
  onApplyOtp,
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    if (!otpCode) return
    navigator.clipboard.writeText(otpCode).catch(() => {})
    setCopied(true)
    toast.success('Đã sao chép mã OTP!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAutoFill = () => {
    if (onApplyOtp && otpCode) {
      onApplyOtp(otpCode)
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-md w-full p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl"
    >
      {/* ── Email Client Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={16} className="text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 truncate">
            Hộp thư đến • SmartEnglish AI
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
          title="Đóng xem thư"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Metadata thư ── */}
      <div className="bg-white px-5 py-3 border-b border-slate-100 text-xs space-y-1">
        <p className="font-bold text-slate-900 text-sm">
          [SmartEnglish AI] Mã xác thực đăng nhập Quản trị
        </p>
        <p className="text-slate-500 text-[11px]">
          Từ: <span className="font-medium text-slate-700">SmartEnglish AI Platform &lt;support@smartenglish.vn&gt;</span>
        </p>
        <p className="text-slate-500 text-[11px]">
          Đến: <span className="font-medium text-slate-700">{recipientEmail}</span>
        </p>
      </div>

      {/* ── Thân email HTML tối giản chuẩn SmartEnglish ── */}
      <div className="p-5 bg-slate-50/50">
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 px-5 py-4 text-center text-white">
            <h4 className="text-sm font-bold tracking-wide">SmartEnglish AI</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">Mã xác thực đăng nhập</p>
          </div>

          {/* Email Body Content */}
          <div className="px-6 py-6 text-center space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {recipientName ? `Xin chào ${recipientName},` : 'Xin chào,'}
              <br />
              Mã xác thực bảo mật 2 bước cho tài khoản của bạn là:
            </p>

            {/* OTP Code Display Box */}
            <div className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-3 font-mono">
              <span className="text-3xl font-extrabold tracking-[8px] text-slate-900 pl-2">
                {otpCode || '------'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                title="Sao chép mã"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
              Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.
            </p>
          </div>

          {/* Email Footer */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center text-[10px] text-slate-400">
            © 2026 SmartEnglish AI Platform • Bảo mật &amp; Phân quyền nội bộ
          </div>
        </div>
      </div>

      {/* ── Footer Thao Tác Nhanh ── */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        {onApplyOtp && (
          <Button size="sm" onClick={handleAutoFill}>
            Tự động điền mã này
          </Button>
        )}
      </div>
    </Modal>
  )
}

