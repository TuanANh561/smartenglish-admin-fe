import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'

export default function AdminSecurityTab({ settings, onUpdateField }) {
  const security = settings?.security || {
    twoFactorAuth: false,
    sessionTimeoutMinutes: 60,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    ipWhitelist: '',
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Bảo mật & Phiên làm việc</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Thiết lập chính sách bảo vệ tài khoản và kiểm soát phiên làm việc của quản trị viên.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xs space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Xác thực hai yếu tố (2FA) qua Email OTP
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Yêu cầu nhập mã OTP gửi về email mỗi khi đăng nhập vào hệ thống quản trị.
            </p>
          </div>
          <Switch
            checked={Boolean(security.twoFactorAuth)}
            onChange={(checked) => onUpdateField('security', 'twoFactorAuth', checked)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Thời gian tự động đăng xuất khi không hoạt động
            </label>
            <Select
              value={security.sessionTimeoutMinutes}
              onChange={(e) => onUpdateField('security', 'sessionTimeoutMinutes', Number(e.target.value))}
              className="text-xs font-semibold"
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>60 phút (Mặc định)</option>
              <option value={1440}>24 giờ</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Độ dài mật khẩu tối thiểu
            </label>
            <Input
              type="number"
              min={6}
              max={32}
              value={security.minPasswordLength}
              onChange={(e) => onUpdateField('security', 'minPasswordLength', Number(e.target.value))}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Giới hạn số lần đăng nhập sai
            </label>
            <Input
              type="number"
              min={3}
              max={10}
              value={security.maxLoginAttempts}
              onChange={(e) => onUpdateField('security', 'maxLoginAttempts', Number(e.target.value))}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Thời gian khóa tạm thời khi nhập sai (Phút)
            </label>
            <Input
              type="number"
              min={5}
              max={60}
              value={security.lockoutDurationMinutes}
              onChange={(e) => onUpdateField('security', 'lockoutDurationMinutes', Number(e.target.value))}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Danh sách địa chỉ mạng (IP) được phép truy cập (Tùy chọn)
          </label>
          <textarea
            rows={3}
            value={security.ipWhitelist || ''}
            onChange={(e) => onUpdateField('security', 'ipWhitelist', e.target.value)}
            className="w-full rounded-xl border border-line bg-white p-3 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="127.0.0.1&#10;192.168.1.0/24 (để trống nếu cho phép mọi địa chỉ)"
          />
        </div>
      </div>
    </div>
  )
}
