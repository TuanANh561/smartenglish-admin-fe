import { useState } from 'react'
import {
  Bell,
  Check,
  CreditCard,
  Globe,
  Key,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Send,
  Server,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  Sliders,
  Smartphone,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import { cn } from '@/lib/utils'
import { INITIAL_SYSTEM_SETTINGS } from '@/mocks/data/systemSettings'

const SETTINGS_TABS = [
  { id: 'general', label: 'Chung', icon: Sliders },
  { id: 'security', label: 'Bảo mật', icon: Lock },
  { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  { id: 'email', label: 'Email / Push', icon: Mail },
]

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState(INITIAL_SYSTEM_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  const updateGeneral = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }))
  }

  const updateSecurity = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value },
    }))
  }

  const updatePayment = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }))
  }

  const updateEmail = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [field]: value },
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Đã lưu cấu hình cài đặt thành công!')
    }, 600)
  }

  const handleReset = () => {
    setSettings(INITIAL_SYSTEM_SETTINGS)
    toast.success('Đã khôi phục cài đặt mặc định')
  }

  return (
    <div className="space-y-4">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Vertical Menu */}
        <div className="lg:col-span-3 space-y-1">
          <Card className="p-2 border border-line">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-navy-700 text-white shadow-sm font-bold'
                      : 'text-ink hover:bg-slate-100 hover:text-navy-700',
                  )}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-ink-muted'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </Card>
        </div>

        {/* Right Settings Content */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="p-6 space-y-6">
            {/* ─── TAB 1: CÀI ĐẶT CHUNG ─────────────────────────────────── */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="border-b border-line pb-3">
                  <h3 className="text-base font-bold text-navy-700">Cài đặt chung</h3>
                  <p className="text-xs text-ink-muted">
                    Thông tin nhận diện thương hiệu và thiết lập cơ bản nền tảng.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Tên hệ thống (Platform Name)
                    </label>
                    <Input
                      value={settings.general.appName}
                      onChange={(e) => updateGeneral('appName', e.target.value)}
                      className="mt-1 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Slogan / Khẩu hiệu
                    </label>
                    <Input
                      value={settings.general.appSlogan}
                      onChange={(e) => updateGeneral('appSlogan', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Ngôn ngữ mặc định
                    </label>
                    <Select
                      value={settings.general.defaultLanguage}
                      onChange={(e) => updateGeneral('defaultLanguage', e.target.value)}
                      className="mt-1 text-xs"
                    >
                      <option value="vi">Tiếng Việt (vi-VN)</option>
                      <option value="en">English (en-US)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Múi giờ hệ thống
                    </label>
                    <Select
                      value={settings.general.timezone}
                      onChange={(e) => updateGeneral('timezone', e.target.value)}
                      className="mt-1 text-xs"
                    >
                      <option value="Asia/Ho_Chi_Minh">GMT+7 (Asia/Ho_Chi_Minh)</option>
                      <option value="Asia/Bangkok">GMT+7 (Asia/Bangkok)</option>
                      <option value="UTC">UTC (+0:00)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Email hỗ trợ kỹ thuật
                    </label>
                    <Input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Hotline liên hệ
                    </label>
                    <Input
                      value={settings.general.supportPhone}
                      onChange={(e) => updateGeneral('supportPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between rounded-xl border border-line p-3.5 bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-navy-700">Chế độ bảo trì hệ thống</p>
                      <p className="text-[11px] text-ink-muted">Tạm ngưng truy cập của học viên để nâng cấp máy chủ.</p>
                    </div>
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onChange={(checked) => updateGeneral('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-line p-3.5 bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-navy-700">Cho phép đăng ký tài khoản tự do</p>
                      <p className="text-[11px] text-ink-muted">Mở cổng cho học viên mới tự tạo tài khoản trên web/app.</p>
                    </div>
                    <Switch
                      checked={settings.general.allowRegistration}
                      onChange={(checked) => updateGeneral('allowRegistration', checked)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: BẢO MẬT ───────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="border-b border-line pb-3">
                  <h3 className="text-base font-bold text-navy-700">Bảo mật & Xác thực</h3>
                  <p className="text-xs text-ink-muted">
                    Chính sách kiểm soát phiên đăng nhập và bảo vệ tài khoản quản trị.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line p-3.5 bg-slate-50/50">
                  <div>
                    <p className="text-xs font-bold text-navy-700">Xác thực hai yếu tố (2FA / OTP)</p>
                    <p className="text-[11px] text-ink-muted">Bắt buộc xác thực qua ứng dụng Authenticator khi đăng nhập vai trò Admin & Giáo viên.</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(checked) => updateSecurity('twoFactorAuth', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Thời hạn phiên làm việc (Session Timeout)
                    </label>
                    <Select
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => updateSecurity('sessionTimeoutMinutes', Number(e.target.value))}
                      className="mt-1 text-xs"
                    >
                      <option value={15}>15 phút không hoạt động</option>
                      <option value={30}>30 phút không hoạt động</option>
                      <option value={60}>60 phút (Khuyên dùng)</option>
                      <option value={1440}>24 giờ</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Độ dài mật khẩu tối thiểu
                    </label>
                    <Input
                      type="number"
                      value={settings.security.minPasswordLength}
                      onChange={(e) => updateSecurity('minPasswordLength', Number(e.target.value))}
                      className="mt-1 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Giới hạn số lần đăng nhập sai
                    </label>
                    <Input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSecurity('maxLoginAttempts', Number(e.target.value))}
                      className="mt-1 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Thời gian khóa tạm thời (Phút)
                    </label>
                    <Input
                      type="number"
                      value={settings.security.lockoutDurationMinutes}
                      onChange={(e) => updateSecurity('lockoutDurationMinutes', Number(e.target.value))}
                      className="mt-1 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Danh sách IP Whitelist cho Quản trị viên (Mỗi dòng một IP / Subnet)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.security.ipWhitelist}
                    onChange={(e) => updateSecurity('ipWhitelist', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-canvas p-3 font-mono text-xs focus:border-brand-500 focus:outline-none"
                    placeholder="192.168.1.1&#10;113.161.85.20"
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 3: THANH TOÁN ─────────────────────────────────────── */}
            {activeTab === 'payment' && (
              <div className="space-y-5">
                <div className="border-b border-line pb-3">
                  <h3 className="text-base font-bold text-navy-700">Cổng thanh toán & Tích hợp</h3>
                  <p className="text-xs text-ink-muted">
                    Cấu hình kết nối cổng thanh toán trực tuyến VNPay, MoMo, Stripe và Webhook.
                  </p>
                </div>

                {/* VNPay Box */}
                <div className="rounded-xl border border-line p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-700 text-sm">Cổng VNPay QR / Thẻ ATM</span>
                      <span className="rounded bg-red-50 text-red-600 font-mono text-[10px] font-bold px-1.5 py-0.5">VNPay</span>
                    </div>
                    <Switch
                      checked={settings.payment.vnpayEnabled}
                      onChange={(checked) => updatePayment('vnpayEnabled', checked)}
                    />
                  </div>

                  {settings.payment.vnpayEnabled && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-line">
                      <div>
                        <label className="text-[11px] font-bold text-ink-muted uppercase">Merchant ID</label>
                        <Input
                          value={settings.payment.vnpayMerchantId}
                          onChange={(e) => updatePayment('vnpayMerchantId', e.target.value)}
                          className="mt-0.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-ink-muted uppercase">Secret Key</label>
                        <Input
                          type="password"
                          value={settings.payment.vnpaySecretKey}
                          onChange={(e) => updatePayment('vnpaySecretKey', e.target.value)}
                          className="mt-0.5 font-mono text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-xs text-navy-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payment.vnpaySandbox}
                            onChange={(e) => updatePayment('vnpaySandbox', e.target.checked)}
                            className="rounded border-line text-brand-500"
                          />
                          Chế độ thử nghiệm Sandbox (Không trừ tiền thật)
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* MoMo Box */}
                <div className="rounded-xl border border-line p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-700 text-sm">Ví Điện Tử MoMo</span>
                      <span className="rounded bg-pink-50 text-pink-600 font-mono text-[10px] font-bold px-1.5 py-0.5">MoMo Pay</span>
                    </div>
                    <Switch
                      checked={settings.payment.momoEnabled}
                      onChange={(checked) => updatePayment('momoEnabled', checked)}
                    />
                  </div>

                  {settings.payment.momoEnabled && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-line">
                      <div>
                        <label className="text-[11px] font-bold text-ink-muted uppercase">Partner Code</label>
                        <Input
                          value={settings.payment.momoPartnerCode}
                          onChange={(e) => updatePayment('momoPartnerCode', e.target.value)}
                          className="mt-0.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-ink-muted uppercase">Access Key</label>
                        <Input
                          type="password"
                          value={settings.payment.momoAccessKey}
                          onChange={(e) => updatePayment('momoAccessKey', e.target.value)}
                          className="mt-0.5 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Webhook */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Payment Webhook IPN Callback URL
                  </label>
                  <Input
                    value={settings.payment.webhookUrl}
                    onChange={(e) => updatePayment('webhookUrl', e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">
                    Đường dẫn nhận thông báo giao dịch thành công để tự động nâng cấp gói Premium cho học viên và giáo viên.
                  </p>
                </div>
              </div>
            )}

            {/* ─── TAB 4: EMAIL / PUSH ──────────────────────────────────── */}
            {activeTab === 'email' && (
              <div className="space-y-5">
                <div className="border-b border-line pb-3">
                  <h3 className="text-base font-bold text-navy-700">Email & Thông báo đẩy (Push)</h3>
                  <p className="text-xs text-ink-muted">
                    Cấu hình máy chủ gửi thư SMTP và thông báo đẩy Firebase Cloud Messaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      SMTP Host
                    </label>
                    <Input
                      value={settings.email.smtpHost}
                      onChange={(e) => updateEmail('smtpHost', e.target.value)}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      SMTP Port
                    </label>
                    <Input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateEmail('smtpPort', Number(e.target.value))}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      SMTP Username / Email
                    </label>
                    <Input
                      value={settings.email.smtpUser}
                      onChange={(e) => updateEmail('smtpUser', e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Tên người gửi (Sender Name)
                    </label>
                    <Input
                      value={settings.email.senderName}
                      onChange={(e) => updateEmail('senderName', e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                    FCM Web Push Server Key
                  </label>
                  <Input
                    type="password"
                    value={settings.email.fcmServerKey}
                    onChange={(e) => updateEmail('fcmServerKey', e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                {/* Auto triggers */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-navy-700 uppercase tracking-wide block">
                    Kích hoạt thông báo tự động:
                  </span>

                  <label className="flex items-center gap-2 text-xs text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email.notifyNewRegistration}
                      onChange={(e) => updateEmail('notifyNewRegistration', e.target.checked)}
                      className="rounded border-line text-brand-500"
                    />
                    Gửi email chào mừng khi có học viên đăng ký mới
                  </label>

                  <label className="flex items-center gap-2 text-xs text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email.notifyPaymentSuccess}
                      onChange={(e) => updateEmail('notifyPaymentSuccess', e.target.checked)}
                      className="rounded border-line text-brand-500"
                    />
                    Gửi hóa đơn điện tử khi thanh toán gói dịch vụ thành công
                  </label>

                  <label className="flex items-center gap-2 text-xs text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email.notifyAssignmentSubmission}
                      onChange={(e) => updateEmail('notifyAssignmentSubmission', e.target.checked)}
                      className="rounded border-line text-brand-500"
                    />
                    Thông báo đẩy tới Giáo viên khi học viên hoàn thành bài tập / bài kiểm tra
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-line">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={handleReset}
              >
                Khôi phục mặc định
              </Button>
              <Button
                variant="primary"
                icon={Save}
                loading={isSaving}
                onClick={handleSave}
              >
                Lưu Thay Đổi
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
