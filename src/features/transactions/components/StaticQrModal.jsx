import { Copy, Download, QrCode, X, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useStaticQr } from '../hooks/useTransactions'

export default function StaticQrModal({ isOpen, onClose }) {
  const { data, isLoading } = useStaticQr()
  const [copiedField, setCopiedField] = useState(null)

  if (!isOpen) return null

  const qrData = data?.data || data || {}
  const accountNumber =
    qrData.accountNumber && qrData.accountNumber !== '0000000000' && qrData.accountNumber !== '0987654321'
      ? qrData.accountNumber
      : '0963684871'
  const accountName =
    qrData.accountName && qrData.accountName !== 'SMARTENGLISH_AI' && qrData.accountName !== 'SMARTENGLISH AI'
      ? qrData.accountName
      : 'NGUYEN TUAN ANH'
  const bankCode = qrData.bankCode || 'MB'
  const qrUrl =
    qrData.qrUrl && !qrData.qrUrl.includes('0000000000') && !qrData.qrUrl.includes('0987654321')
      ? qrData.qrUrl
      : `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&template=compact`

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`Đã sao chép: ${text}`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `VietQR_ThuHocPhi_${bankCode}_${accountNumber}.png`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('Đã tải ảnh mã QR về máy!')
    } catch {
      window.open(qrUrl, '_blank')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <QrCode size={18} strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mã QR thu tại quầy</h3>
              <p className="text-xs text-slate-500">VietQR Napas 24/7</p>
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

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {isLoading ? (
            <div className="w-56 h-56 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Đang tạo mã QR...</span>
            </div>
          ) : (
            <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/20 shadow-md">
              <img
                src={qrUrl}
                alt="VietQR Tĩnh"
                className="w-56 h-56 object-contain rounded-xl"
              />
            </div>
          )}

          {/* Account Details Box */}
          <div className="w-full mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-bold text-slate-800">
                {bankCode === 'MB' ? 'MB Bank (Quân Đội)' : bankCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tài khoản / SĐT:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">{accountNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNumber, 'acc')}
                  className="text-slate-400 hover:text-brand-600 p-0.5 rounded cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'acc' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <span className="font-semibold text-slate-800 uppercase">{accountName}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Quét mã bằng app ngân hàng bất kỳ để chuyển khoản 24/7 qua SePay.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button size="sm" variant="primary" icon={Download} onClick={handleDownloadQr}>
            Tải ảnh QR
          </Button>
        </div>
      </div>
    </div>
  )
}
