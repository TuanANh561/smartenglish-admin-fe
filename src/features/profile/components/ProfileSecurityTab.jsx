import { useState } from 'react'
import { KeyRound, Shield, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export default function ProfileSecurityTab({ isChangingPassword, onUpdatePassword }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onUpdatePassword(passwordData)
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 border border-line bg-white shadow-xs space-y-6">
        <div className="border-b border-line pb-4">
          <h3 className="text-base font-bold text-navy-800">Đổi mật khẩu tài khoản</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Để bảo vệ an toàn cho lớp học và dữ liệu cá nhân, hãy sử dụng mật khẩu mạnh kết hợp chữ cái, số và ký tự.
          </p>
        </div>

        <div className="max-w-md space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="Nhập mật khẩu đang sử dụng..."
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Tối thiểu 6 ký tự..."
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Xác nhận lại mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Nhập lại chính xác mật khẩu mới..."
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin bảo mật bổ sung */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-800">
            <Shield size={15} className="text-brand-600" />
            <span>Trạng thái bảo mật phiên đăng nhập</span>
          </div>
          <ul className="text-xs text-ink-muted space-y-1 pl-5 list-disc">
            <li>Phiên đăng nhập được mã hóa JWT 256-bit an toàn.</li>
            <li>Sau khi đổi mật khẩu, bạn vẫn có thể duy trì phiên làm việc hiện tại.</li>
            <li>Hệ thống tự động phát hiện và khóa tài khoản khi có dấu hiệu dò quét mật khẩu.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button
            type="submit"
            variant="primary"
            icon={KeyRound}
            loading={isChangingPassword}
            className="px-6"
          >
            Cập Nhật Mật Khẩu
          </Button>
        </div>
      </Card>
    </form>
  )
}
