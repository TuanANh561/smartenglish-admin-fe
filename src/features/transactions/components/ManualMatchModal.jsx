import { useState } from 'react'
import { ArrowLeftRight, CheckCircle2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useManualMatch } from '../hooks/useTransactions'

export default function ManualMatchModal({ isOpen, onClose, transaction }) {
  const [orderCode, setOrderCode] = useState('')
  const matchMutation = useManualMatch()

  if (!isOpen || !transaction) return null

  const handleMatch = async (e) => {
    e.preventDefault()
    const cleanCode = orderCode.trim()
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã đơn hàng cần khớp')
      return
    }

    matchMutation.mutate(
      { id: transaction.id, orderCode: cleanCode },
      {
        onSuccess: () => {
          setOrderCode('')
          onClose?.()
        },
      }
    )
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
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <ArrowLeftRight size={18} strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Khớp lệnh đối soát</h3>
              <p className="text-xs text-slate-500">Giao dịch ngân hàng</p>
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

        {/* Form Body */}
        <form onSubmit={handleMatch} className="p-5 space-y-4">
          {/* Thông tin giao dịch ngân hàng */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-semibold text-slate-800">
                {transaction.bankName || 'MBBank'} - {transaction.bankAccount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số tiền nhận:</span>
              <span className="font-bold text-emerald-600 text-sm">
                +{formatCurrency(transaction.amountIn || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian:</span>
              <span className="text-slate-700">
                {formatDate(transaction.transactionTime, 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 block mb-1">Nội dung chuyển khoản:</span>
              <p className="font-mono text-xs bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-words">
                {transaction.transactionContent || '(Không có nội dung)'}
              </p>
            </div>
          </div>

          {/* Ô nhập mã đơn hàng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mã đơn hàng cần gạch nợ:
            </label>
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
              placeholder="VD: SEAI849502 hoặc ORD-102"
              className="w-full text-sm font-mono uppercase px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 placeholder:normal-case focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors shadow-2xs"
              autoFocus
            />
            <p className="mt-1 text-2xs text-slate-400">
              Hệ thống sẽ cập nhật trạng thái đơn sang đã thanh toán và kích hoạt gói học.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onClose}
              disabled={matchMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              icon={CheckCircle2}
              loading={matchMutation.isPending}
            >
              Xác nhận khớp
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
