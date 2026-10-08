import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'

export default function AdminSecurityTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Bảo mật & Phiên làm việc</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Chính sách kiểm soát phiên làm việc và bảo vệ tài khoản quản trị.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
        <div>
          <p className="text-xs font-bold text-navy-800">
            Xác thực hai yếu tố (2FA / OTP)
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Bắt buộc xác thực qua ứng dụng Authenticator khi đăng nhập vai trò Admin.
          </p>
        </div>
        <Switch
          checked={settings.security.twoFactorAuth}
          onChange={(checked) => onUpdateField('security', 'twoFactorAuth', checked)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Thời hạn phiên làm việc (Session Timeout)
          </label>
          <Select
            value={settings.security.sessionTimeoutMinutes}
            onChange={(e) =>
              onUpdateField('security', 'sessionTimeoutMinutes', Number(e.target.value))
            }
            className="text-xs font-semibold"
          >
            <option value={15}>15 phút</option>
            <option value={30}>30 phút</option>
            <option value={60}>60 phút (Khuyên dùng)</option>
            <option value={1440}>24 giờ</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Độ dài mật khẩu tối thiểu
          </label>
          <Input
            type="number"
            value={settings.security.minPasswordLength}
            onChange={(e) =>
              onUpdateField('security', 'minPasswordLength', Number(e.target.value))
            }
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Giới hạn số lần đăng nhập sai
          </label>
          <Input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) =>
              onUpdateField('security', 'maxLoginAttempts', Number(e.target.value))
            }
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Thời gian khóa tạm thời (Phút)
          </label>
          <Input
            type="number"
            value={settings.security.lockoutDurationMinutes}
            onChange={(e) =>
              onUpdateField('security', 'lockoutDurationMinutes', Number(e.target.value))
            }
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
          Danh sách IP Whitelist cho Quản trị viên
        </label>
        <textarea
          rows={3}
          value={settings.security.ipWhitelist}
          onChange={(e) => onUpdateField('security', 'ipWhitelist', e.target.value)}
          className="w-full rounded-xl border border-line bg-canvas p-3 font-mono text-xs focus:border-brand-500 focus:outline-none"
          placeholder="192.168.1.1&#10;113.161.85.20"
        />
      </div>
    </div>
  )
}
