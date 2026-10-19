import { CheckCircle2, Mail, Server } from 'lucide-react'
import Input from '@/components/ui/Input'

export default function AdminEmailTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Email & Thông báo hệ thống</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Cấu hình gửi thư hệ thống và tùy chọn thông báo tự động cho người dùng.
        </p>
      </div>

      {/* THÔNG BÁO TRẠNG THÁI HỆ THỐNG GỬI THƯ */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-emerald-700" />
            <span className="text-xs font-bold text-emerald-900">
              Hệ thống gửi thư: Đang hoạt động
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Đã kết nối
          </span>
        </div>
        <p className="text-[11px] text-emerald-800/90 leading-relaxed">
          Hệ thống gửi thư tự động đã được thiết lập sẵn sàng để gửi email kích hoạt tài khoản và biên lai thanh toán cho học viên.
        </p>
      </div>

      {/* THÔNG TIN MÁY CHỦ GỬI THƯ */}
      <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cấu hình máy chủ gửi thư
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 border border-slate-300">
              Cấu hình mặc định
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 opacity-80">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Địa chỉ máy chủ thư
            </label>
            <Input
              disabled
              value={settings.email.smtpHost || 'smtp.gmail.com'}
              className="font-mono text-xs bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Cổng kết nối
            </label>
            <Input
              disabled
              type="number"
              value={settings.email.smtpPort || 587}
              className="font-mono text-xs bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Địa chỉ email gửi thư
            </label>
            <Input
              disabled
              value="nguyentuananh11a1.lhpt@gmail.com"
              className="text-xs bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Tên hiển thị người gửi
            </label>
            <Input
              disabled
              value={settings.email.senderName || 'SmartEnglish AI System'}
              className="text-xs bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-[11px] text-ink-muted">
          * Email hệ thống hiện đang sử dụng địa chỉ chính thức của SmartEnglish AI.
        </p>
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
