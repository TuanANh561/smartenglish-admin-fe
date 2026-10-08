import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'

export default function AdminGeneralTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Cài đặt chung Nền tảng</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Thông tin thương hiệu và thiết lập cơ bản toàn hệ thống SmartEnglish AI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Tên hệ thống (Platform Name)
          </label>
          <Input
            value={settings.general.appName}
            onChange={(e) => onUpdateField('general', 'appName', e.target.value)}
            className="font-semibold text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Slogan / Khẩu hiệu
          </label>
          <Input
            value={settings.general.appSlogan}
            onChange={(e) => onUpdateField('general', 'appSlogan', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Ngôn ngữ mặc định
          </label>
          <Select
            value={settings.general.defaultLanguage}
            onChange={(e) => onUpdateField('general', 'defaultLanguage', e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="vi">Tiếng Việt (vi-VN)</option>
            <option value="en">English (en-US)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Múi giờ hệ thống
          </label>
          <Select
            value={settings.general.timezone}
            onChange={(e) => onUpdateField('general', 'timezone', e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="Asia/Ho_Chi_Minh">GMT+7 (Asia/Ho_Chi_Minh)</option>
            <option value="Asia/Bangkok">GMT+7 (Asia/Bangkok)</option>
            <option value="UTC">UTC (+0:00)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Email hỗ trợ kỹ thuật
          </label>
          <Input
            type="email"
            value={settings.general.supportEmail}
            onChange={(e) => onUpdateField('general', 'supportEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Hotline liên hệ
          </label>
          <Input
            value={settings.general.supportPhone}
            onChange={(e) => onUpdateField('general', 'supportPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">Chế độ bảo trì hệ thống</p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Tạm ngưng truy cập của học viên để nâng cấp máy chủ backend.
            </p>
          </div>
          <Switch
            checked={settings.general.maintenanceMode}
            onChange={(checked) => onUpdateField('general', 'maintenanceMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line p-4 bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-navy-800">
              Cho phép đăng ký tài khoản tự do
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Mở cổng cho học viên mới tự tạo tài khoản trên web/app.
            </p>
          </div>
          <Switch
            checked={settings.general.allowRegistration}
            onChange={(checked) => onUpdateField('general', 'allowRegistration', checked)}
          />
        </div>
      </div>
    </div>
  )
}
