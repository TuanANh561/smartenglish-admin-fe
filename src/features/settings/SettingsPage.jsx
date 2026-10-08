import {
  Bell,
  CreditCard,
  Globe,
  GraduationCap,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Sliders,
  Wallet,
  Info,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { useSettings } from './hooks/useSettings'
import TeacherTeachingTab from './components/TeacherTeachingTab'
import TeacherNotificationsTab from './components/TeacherNotificationsTab'
import TeacherPreferencesTab from './components/TeacherPreferencesTab'
import TeacherBankingTab from './components/TeacherBankingTab'
import AdminGeneralTab from './components/AdminGeneralTab'
import AdminSecurityTab from './components/AdminSecurityTab'
import AdminPaymentTab from './components/AdminPaymentTab'
import AdminEmailTab from './components/AdminEmailTab'

export default function SettingsPage() {
  const {
    currentUser,
    isTeacher,
    activeTab,
    setActiveTab,
    adminSettings,
    teacherSettings,
    isSaving,
    updateAdminField,
    updateTeacherField,
    handleSave,
    handleReset,
  } = useSettings()

  // Tabs cho Admin
  const adminTabs = [
    { id: 'general', label: 'Cài đặt chung', icon: Sliders },
    { id: 'security', label: 'Bảo mật hệ thống', icon: Lock },
    { id: 'payment', label: 'Cổng thanh toán & Webhook', icon: CreditCard },
    { id: 'email', label: 'Email & Thông báo đẩy', icon: Mail },
  ]

  // Tabs cho Giáo viên
  const teacherTabs = [
    { id: 'teaching', label: 'Lớp học & Giảng dạy', icon: GraduationCap },
    { id: 'notifications', label: 'Thông báo & Nhắc việc', icon: Bell },
    { id: 'preferences', label: 'Ngôn ngữ & Múi giờ', icon: Globe },
    {
      id: 'banking',
      label: 'Tài khoản nhận tiền (Coming Soon)',
      icon: Wallet,
      badge: 'Sắp ra mắt',
    },
  ]

  const tabs = isTeacher ? teacherTabs : adminTabs

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Vertical Menu */}
        <div className="lg:col-span-3 space-y-2">
          <Card className="p-2 border border-line bg-white shadow-xs">
            <div className="p-2.5 pb-2 mb-1 border-b border-line">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isTeacher ? 'Thiết lập Giáo viên' : 'Thiết lập Quản trị'}
              </p>
            </div>

            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-navy-800 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{tab.label.replace(' (Coming Soon)', '')}</span>
                  </div>
                  {tab.badge && (
                    <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </Card>

          {/* Tips Box nhỏ */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs text-ink-muted">
            <p className="font-bold text-navy-800 flex items-center gap-1.5">
              <Info size={14} className="text-brand-600" />
              <span>Ghi chú</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              {isTeacher
                ? 'Các cài đặt lớp học và thông báo được đồng bộ theo từng tài khoản giảng viên riêng biệt.'
                : 'Các thông số thanh toán và bảo mật ảnh hưởng trực tiếp đến toàn bộ người dùng hệ thống.'}
            </p>
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="p-6 border border-line bg-white shadow-xs space-y-6">
            {/* ── TEACHER TABS ────────────────────────────────────────── */}
            {isTeacher && activeTab === 'teaching' && (
              <TeacherTeachingTab
                settings={teacherSettings}
                onUpdateField={updateTeacherField}
              />
            )}

            {isTeacher && activeTab === 'notifications' && (
              <TeacherNotificationsTab
                settings={teacherSettings}
                onUpdateField={updateTeacherField}
              />
            )}

            {isTeacher && activeTab === 'preferences' && (
              <TeacherPreferencesTab
                settings={teacherSettings}
                onUpdateField={updateTeacherField}
              />
            )}

            {isTeacher && activeTab === 'banking' && (
              <TeacherBankingTab
                currentUser={currentUser}
                settings={teacherSettings}
                onUpdateField={updateTeacherField}
              />
            )}

            {/* ── ADMIN TABS ──────────────────────────────────────────── */}
            {!isTeacher && activeTab === 'general' && (
              <AdminGeneralTab
                settings={adminSettings}
                onUpdateField={updateAdminField}
              />
            )}

            {!isTeacher && activeTab === 'security' && (
              <AdminSecurityTab
                settings={adminSettings}
                onUpdateField={updateAdminField}
              />
            )}

            {!isTeacher && activeTab === 'payment' && (
              <AdminPaymentTab
                settings={adminSettings}
                onUpdateField={updateAdminField}
              />
            )}

            {!isTeacher && activeTab === 'email' && (
              <AdminEmailTab
                settings={adminSettings}
                onUpdateField={updateAdminField}
              />
            )}

            {/* ── BOTTOM ACTIONS ──────────────────────────────────────── */}
            {/* Ẩn nút lưu khi ở tab banking coming soon của teacher */}
            {!(isTeacher && activeTab === 'banking') && (
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-line">
                <Button variant="secondary" icon={RefreshCw} onClick={handleReset}>
                  Khôi phục mặc định
                </Button>
                <Button
                  variant="primary"
                  icon={Save}
                  loading={isSaving}
                  onClick={handleSave}
                  className="px-6"
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
