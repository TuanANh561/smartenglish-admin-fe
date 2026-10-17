import React from 'react'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function TeacherRefundModal({
  isOpen,
  onClose,
  selectedOrder,
  refundReason,
  setRefundReason,
  refundBank,
  setRefundBank,
  refundAcc,
  setRefundAcc,
  refundName,
  setRefundName,
  isSubmitting,
  onSubmit,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-line overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <RotateCcw size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-navy-800">Yêu cầu hoàn tiền (7 ngày)</h3>
              <p className="text-[11px] text-ink-muted">Mã đơn: {selectedOrder?.orderCode || selectedOrder?.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Chính sách cam kết hoàn tiền 7 ngày. Số tiền hoàn: <strong>{formatCurrency(selectedOrder?.amount || 0)}</strong>. Sau khi hoàn tất đối soát, quyền lợi gói Pro sẽ được tự động thu hồi.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-navy-700 block mb-1">
              Lý do yêu cầu hoàn tiền <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Ví dụ: Đăng ký nhầm gói hoặc chuyển lớp..."
              className="w-full text-xs p-2.5 rounded-xl border border-line focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-hidden"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-line">
            <p className="text-xs font-bold text-navy-800">Tài khoản nhận tiền hoàn (Napas 24/7):</p>
            <div>
              <label className="text-2xs font-semibold text-ink-muted block mb-0.5">Tên Ngân hàng:</label>
              <input
                type="text"
                value={refundBank}
                onChange={(e) => setRefundBank(e.target.value)}
                placeholder="VD: Vietcombank, MB Bank, Techcombank..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-ink-muted block mb-0.5">Số tài khoản nhận hoàn:</label>
              <input
                type="text"
                value={refundAcc}
                onChange={(e) => setRefundAcc(e.target.value)}
                placeholder="VD: 1029384756"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line font-mono"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-ink-muted block mb-0.5">Tên chủ tài khoản (Viết hoa không dấu):</label>
              <input
                type="text"
                value={refundName}
                onChange={(e) => setRefundName(e.target.value)}
                placeholder="VD: NGUYEN VAN HUNG"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line uppercase"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-line flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="danger"
            loading={isSubmitting}
            onClick={onSubmit}
          >
            Gửi yêu cầu hoàn tiền
          </Button>
        </div>
      </div>
    </div>
  )
}
