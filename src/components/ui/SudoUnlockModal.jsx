import { useState } from 'react'
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SudoUnlockModal({
  isOpen,
  onClose,
  onUnlock,
  isVerifying,
}) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!password.trim()) return
    const success = await onUnlock(password)
    if (success) {
      setPassword('')
    }
  }

  const handleClose = () => {
    setPassword('')
    onClose?.()
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      className="max-w-md p-6 rounded-2xl"
      showCloseButton={!isVerifying}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-xs shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Xác thực bảo mật
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập mật khẩu quản trị để chỉnh sửa cấu hình AI
            </p>
          </div>
        </div>

        {/* Thông tin phiên */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-2.5 text-xs text-indigo-950 flex items-center gap-2">
          <Lock size={14} className="text-indigo-600 shrink-0" />
          <span>Phiên làm việc an toàn sẽ duy trì trong <strong>15 phút</strong>.</span>
        </div>

        {/* Form nhập mật khẩu */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Mật khẩu quản trị viên
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn..."
                className="pr-10 text-xs font-medium"
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <KeyRound size={11} className="text-slate-400 shrink-0" />
              <span>Áp dụng cho tài khoản quản trị hệ thống.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isVerifying}
              className="text-xs font-semibold px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isVerifying}
              disabled={!password.trim() || isVerifying}
              className="text-xs font-bold px-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Xác nhận mở khóa
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
