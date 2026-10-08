import Input from '@/components/ui/Input'

export default function AdminEmailTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Máy chủ Email (SMTP) & Push FCM</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Cấu hình máy chủ gửi thư hệ thống và khóa xác thực Firebase Cloud Messaging.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            SMTP Host
          </label>
          <Input
            value={settings.email.smtpHost}
            onChange={(e) => onUpdateField('email', 'smtpHost', e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            SMTP Port
          </label>
          <Input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => onUpdateField('email', 'smtpPort', Number(e.target.value))}
            className="font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            SMTP Username / Email gửi
          </label>
          <Input
            value={settings.email.smtpUser}
            onChange={(e) => onUpdateField('email', 'smtpUser', e.target.value)}
            className="text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            Tên người gửi (Sender Name)
          </label>
          <Input
            value={settings.email.senderName}
            onChange={(e) => onUpdateField('email', 'senderName', e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-navy-800 uppercase tracking-wider block">
          Kích hoạt thông báo tự động:
        </span>

        <label className="flex items-center gap-2.5 text-xs text-navy-800 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email.notifyNewRegistration}
            onChange={(e) => onUpdateField('email', 'notifyNewRegistration', e.target.checked)}
            className="rounded border-line text-brand-600"
          />
          Gửi email chào mừng khi có học viên đăng ký mới
        </label>

        <label className="flex items-center gap-2.5 text-xs text-navy-800 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email.notifyPaymentSuccess}
            onChange={(e) => onUpdateField('email', 'notifyPaymentSuccess', e.target.checked)}
            className="rounded border-line text-brand-600"
          />
          Gửi hóa đơn điện tử khi thanh toán gói dịch vụ thành công
        </label>

        <label className="flex items-center gap-2.5 text-xs text-navy-800 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email.notifyAssignmentSubmission}
            onChange={(e) =>
              onUpdateField('email', 'notifyAssignmentSubmission', e.target.checked)
            }
            className="rounded border-line text-brand-600"
          />
          Thông báo đẩy tới Giáo viên khi học viên hoàn thành bài tập
        </label>
      </div>
    </div>
  )
}
