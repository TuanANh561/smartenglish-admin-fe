import Select from '@/components/ui/Select'

export default function TeacherPreferencesTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Ngôn ngữ & Múi giờ làm việc</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Các thiết lập này được lưu trực tiếp vào tài khoản CSDL của bạn trên hệ thống SmartEnglish AI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Ngôn ngữ giao diện (UI Language)
          </label>
          <Select
            value={settings.preferences.uiLanguage}
            onChange={(e) => onUpdateField('preferences', 'uiLanguage', e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="vi">Tiếng Việt (vi-VN)</option>
            <option value="en">English (en-US)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Múi giờ làm việc (Timezone)
          </label>
          <Select
            value={settings.preferences.timezone}
            onChange={(e) => onUpdateField('preferences', 'timezone', e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="Asia/Ho_Chi_Minh">GMT+7 (Asia/Ho_Chi_Minh - Việt Nam)</option>
            <option value="Asia/Bangkok">GMT+7 (Asia/Bangkok)</option>
            <option value="Asia/Tokyo">GMT+9 (Asia/Tokyo)</option>
            <option value="UTC">UTC (Giờ phối hợp quốc tế)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Định dạng hiển thị ngày tháng
          </label>
          <Select
            value={settings.preferences.dateFormat}
            onChange={(e) => onUpdateField('preferences', 'dateFormat', e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (Chuẩn Việt Nam: 31/12/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (Chuẩn Quốc tế ISO: 2026-12-31)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (Chuẩn US: 12/31/2026)</option>
          </Select>
        </div>
      </div>
    </div>
  )
}
