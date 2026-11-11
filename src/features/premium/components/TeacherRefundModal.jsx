import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const EMPTY = { reason: '', bankName: '', accountNumber: '', accountHolderName: '' }

/**
 * Hủy gói đang dùng + yêu cầu hoàn tiền. Gói bị hủy ngay; tiền hoàn do quản trị viên duyệt thủ công.
 */
export default function TeacherRefundModal({ isOpen, onClose, planName, isSubmitting, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleClose = () => {
    setForm(EMPTY)
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountHolderName.trim()) {
      setError('Vui lòng nhập đủ thông tin tài khoản nhận hoàn tiền')
      return
    }
    setError('')
    const ok = await onSubmit(form)
    if (ok) setForm(EMPTY)
  }

  const inputClass =
    'w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Hủy gói & hoàn tiền" className="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-[#FEF3C7] p-3 text-sm text-[#A16207]">
          <AlertTriangle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          <span>
            Gói <strong>{planName || 'hiện tại'}</strong> sẽ bị hủy ngay. Tiền được hoàn sau khi quản trị viên xác nhận.
          </span>
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-muted">Lý do</label>
          <textarea rows={2} value={form.reason} onChange={update('reason')} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Ngân hàng</label>
          <input value={form.bankName} onChange={update('bankName')} placeholder="VD: Vietcombank" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Số tài khoản</label>
          <input value={form.accountNumber} onChange={update('accountNumber')} className={`${inputClass} font-mono`} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-muted">Chủ tài khoản</label>
          <input
            value={form.accountHolderName}
            onChange={update('accountHolderName')}
            placeholder="VD: NGUYEN VAN A"
            className={`${inputClass} uppercase`}
          />
        </div>

        {error && <p className="text-sm text-[#B91C1C]">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button variant="danger" loading={isSubmitting} onClick={handleSubmit}>
            Hủy gói
          </Button>
        </div>
      </div>
    </Modal>
  )
}
