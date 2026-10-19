import { Lock, Sparkles } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'

export default function AdminSecurityTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy-800">Bảo mật & Phiên làm việc</h3>
            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 border border-amber-300">
              Sắp ra mắt
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Chính sách kiểm soát phiên làm việc và bảo vệ tài khoản quản trị viên.
          </p>
        </div>
      </div>

      {/* BANNER THÔNG BÁO TÍNH NĂNG ĐANG PHÁT TRIỂN */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-yellow-50/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
            <Lock size={20} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-600" />
              Chính sách bảo mật nâng cao đang được cập nhật
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Hệ thống hiện đang áp dụng các chính sách bảo mật tiêu chuẩn để bảo vệ tài khoản quản trị và dữ liệu người dùng. Tính năng tùy chỉnh nâng cao các quy tắc này sẽ sớm được hỗ trợ trong bản cập nhật tới.
            </p>
          </div>
        </div>
      </div>

      {/* FORM GIAO DIỆN XEM TRƯỚC (DISABLED) */}
      <div className="relative rounded-2xl border border-slate-200 p-6 bg-slate-50/40 opacity-75 select-none pointer-events-none space-y-6">
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[0.5px] rounded-2xl z-10">
          <div className="rounded-2xl bg-navy-900/85 text-white px-5 py-3 shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Lock size={18} className="text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              TÍNH NĂNG ĐANG PHÁT TRIỂN
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-white">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Xác thực hai yếu tố (2FA)
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Yêu cầu nhập mã xác thực khi đăng nhập tài khoản quản trị.
            </p>
          </div>
          <Switch
            checked={settings.security.twoFactorAuth}
            disabled
            onChange={() => {}}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Thời gian tự động đăng xuất khi không hoạt động
            </label>
            <Select
              value={settings.security.sessionTimeoutMinutes}
              disabled
              className="text-xs font-semibold"
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>60 phút (Mặc định)</option>
              <option value={1440}>24 giờ (Mặc định)</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Độ dài mật khẩu tối thiểu
            </label>
            <Input
              type="number"
              disabled
              value={settings.security.minPasswordLength}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Giới hạn số lần đăng nhập sai
            </label>
            <Input
              type="number"
              disabled
              value={settings.security.maxLoginAttempts}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Thời gian khóa tạm thời khi nhập sai nhiều lần (Phút)
            </label>
            <Input
              type="number"
              disabled
              value={settings.security.lockoutDurationMinutes}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Danh sách địa chỉ mạng (IP) được phép truy cập quản trị
          </label>
          <textarea
            rows={3}
            disabled
            value={settings.security.ipWhitelist}
            className="w-full rounded-xl border border-line bg-slate-100 p-3 font-mono text-xs cursor-not-allowed"
            placeholder="127.0.0.1&#10;192.168.1.0/24"
          />
        </div>
      </div>
    </div>
  )
}
