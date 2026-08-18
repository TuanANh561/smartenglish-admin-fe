import { useState } from 'react'
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Gift,
  HelpCircle,
  Percent,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Danh sách các gói dành cho giáo viên
const TEACHER_PLANS = [
  {
    id: 'plan_basic',
    name: 'Teacher Starter',
    subtitle: 'Dành cho giáo viên mới bắt đầu thử nghiệm',
    priceMonthly: 0,
    priceYearly: 0,
    isCurrent: false,
    badge: null,
    features: [
      { text: 'Quản lý tối đa 2 lớp học', included: true },
      { text: 'Tối đa 50 học viên', included: true },
      { text: 'Tạo 20 bài đọc/bài kiểm tra AI mỗi tháng', included: true },
      { text: 'Theo dõi điểm số cơ bản', included: true },
      { text: 'Chấm điểm Speaking & Writing chuyên sâu', included: false },
      { text: 'Xuất báo cáo PDF/Excel chi tiết', included: false },
      { text: 'Hỗ trợ kỹ thuật ưu tiên 24/7', included: false },
    ],
  },
  {
    id: 'plan_pro',
    name: 'Teacher Pro',
    subtitle: 'Dành cho giáo viên chuyên nghiệp & luyện thi',
    priceMonthly: 299000,
    priceYearly: 2390000, // Tiết kiệm ~33%
    isCurrent: true,
    badge: 'Đang sử dụng',
    isPopular: true,
    features: [
      { text: 'Quản lý tối đa 15 lớp học', included: true },
      { text: 'Tối đa 400 học viên', included: true },
      { text: 'Sinh bài đọc & trắc nghiệm AI không giới hạn', included: true },
      { text: 'Phân tích bảng điểm & tiến độ học viên chuyên sâu', included: true },
      { text: 'AI hỗ trợ gợi ý chữa bài Speaking & Writing', included: true },
      { text: 'Xuất báo cáo PDF/Excel danh sách & kết quả', included: true },
      { text: 'Hỗ trợ ưu tiên qua Zalo/Email', included: true },
    ],
  },
  {
    id: 'plan_center',
    name: 'School & Center',
    subtitle: 'Dành cho trung tâm ngoại ngữ & nhóm giáo viên',
    priceMonthly: 799000,
    priceYearly: 6990000,
    isCurrent: false,
    badge: 'Doanh nghiệp',
    features: [
      { text: 'Không giới hạn số lớp học & học viên', included: true },
      { text: 'Phân quyền nhiều giáo viên & trợ giảng', included: true },
      { text: 'Toàn bộ tính năng AI Pro không giới hạn', included: true },
      { text: 'Tích hợp kho đề & học liệu độc quyền của trường', included: true },
      { text: 'Tùy chỉnh thương hiệu & logo riêng', included: true },
      { text: 'Chăm sóc & đào tạo triển khai 1-1', included: true },
      { text: 'Hỗ trợ kỹ thuật 24/7 VIP', included: true },
    ],
  },
]

// Các gói mua sỉ theo lớp cho học viên
const CLASS_BUNDLE_PASSES = [
  {
    id: 'bundle-20',
    title: 'Gói Lớp Học Nhỏ (20 Học viên)',
    discount: '30%',
    originalPrice: 199000 * 20,
    discountedPrice: 2790000,
    duration: '6 tháng',
    idealFor: 'Lớp IELTS / TOEIC cấp tốc',
  },
  {
    id: 'bundle-40',
    title: 'Gói Lớp Học Tiêu Chuẩn (40 Học viên)',
    discount: '45%',
    originalPrice: 199000 * 40,
    discountedPrice: 4390000,
    duration: '6 tháng',
    idealFor: 'Lớp phổ thông & trung tâm',
  },
  {
    id: 'bundle-100',
    title: 'Gói Khối / Khóa Học (100 Học viên)',
    discount: '60%',
    originalPrice: 199000 * 100,
    discountedPrice: 7990000,
    duration: '1 năm',
    idealFor: 'Trường học & Trung tâm lớn',
  },
]

function TeacherPackagesPage() {
  const [billingCycle, setBillingCycle] = useState('yearly') // 'monthly' | 'yearly'
  const [copiedCode, setCopiedCode] = useState(false)

  const referralCode = 'TEACHER-MAI20'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {})
    setCopiedCode(true)
    toast.success('Đã sao chép mã ưu đãi độc quyền!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top action: Chu kỳ thanh toán toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={[
              'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
              billingCycle === 'monthly'
                ? 'bg-navy-700 text-white shadow-sm'
                : 'text-ink-muted hover:text-navy-700',
            ].join(' ')}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
              billingCycle === 'yearly'
                ? 'bg-navy-700 text-white shadow-sm'
                : 'text-ink-muted hover:text-navy-700',
            ].join(' ')}
          >
            Theo năm
            <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
              Tiết kiệm 30%
            </span>
          </button>
        </div>
      </div>

      {/* Banner Gói Hiện Tại */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-r from-[#1B3A57] to-[#29A8E8] p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold tracking-wide uppercase">
                Gói Hiện Tại
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Đang kích hoạt
              </span>
            </div>
            <h2 className="text-2xl font-black">Teacher Pro Plan</h2>
            <p className="text-sm text-white/80 max-w-xl">
              Tài khoản của bạn được cấp quyền giảng dạy không giới hạn AI, hỗ trợ quản lý tối đa 15 lớp học và 400 học viên.
            </p>
            <p className="text-xs text-white/70">
              Hạn dùng: <span className="font-semibold text-white">31/12/2026</span> · Tự động gia hạn theo năm
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-white/70">Lớp học</p>
              <p className="text-xl font-bold">4 <span className="text-xs font-normal text-white/60">/ 15</span></p>
            </div>
            <div className="text-center border-x border-white/20 px-3">
              <p className="text-xs text-white/70">Học viên</p>
              <p className="text-xl font-bold">120 <span className="text-xs font-normal text-white/60">/ 400</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">AI Quota</p>
              <p className="text-xl font-bold text-amber-300">∞ <span className="text-xs font-normal text-white/60">Unlimited</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Các Gói Giảng Dạy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TEACHER_PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
          return (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md',
                plan.isCurrent ? 'border-2 border-brand-500 ring-2 ring-brand-500/10' : 'border-line',
              ].join(' ')}
            >
              {/* Badge trên cùng */}
              {plan.badge && (
                <span
                  className={[
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold shadow-sm',
                    plan.isCurrent ? 'bg-brand-500 text-white' : 'bg-navy-700 text-white',
                  ].join(' ')}
                >
                  {plan.badge}
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-navy-700">{plan.name}</h3>
                <p className="mt-1 text-xs text-ink-muted min-h-[32px]">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-6 border-b border-line pb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-navy-700">
                    {price === 0 ? 'Miễn phí' : formatCurrency(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-xs text-ink-muted">
                      / {billingCycle === 'yearly' ? 'năm' : 'tháng'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    Tương đương {formatCurrency(Math.round(price / 12))}/tháng
                  </p>
                )}
              </div>

              {/* Feature List */}
              <div className="flex-1 space-y-3 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Tính năng bao gồm:
                </p>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    {feat.included ? (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                        <Check size={11} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 mt-0.5">
                        –
                      </span>
                    )}
                    <span className={feat.included ? 'text-navy-700 font-medium' : 'text-slate-400'}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {plan.isCurrent ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-sm font-bold text-navy-700 cursor-default"
                >
                  ✓ Gói đang sử dụng
                </button>
              ) : (
                <Button
                  variant={plan.id === 'plan_center' ? 'primary' : 'secondary'}
                  fullWidth
                  onClick={() => toast.success(`Đã gửi yêu cầu đăng ký ${plan.name}`)}
                >
                  {plan.id === 'plan_basic' ? 'Chuyển về gói này' : 'Nâng cấp ngay'}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Phần 2: Mã Giảm Giá Độc Quyền cho Học Sinh của Giáo Viên */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card Mã giới thiệu */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Gift size={20} />
            </span>
            <div>
              <h3 className="font-bold text-navy-700 text-base">Mã Ưu Đãi Của Bạn</h3>
              <p className="text-xs text-ink-muted">Tặng học viên trong lớp khi mua gói</p>
            </div>
          </div>

          <p className="text-xs text-ink leading-relaxed">
            Học viên khi nhập mã của bạn sẽ được <span className="font-bold text-emerald-600">giảm 20%</span> khi nâng cấp gói Premium cá nhân.
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-3">
            <span className="font-mono text-base font-black tracking-widest text-brand-600 flex-1">
              {referralCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-700 shadow-sm hover:bg-slate-50 border border-line"
            >
              <Copy size={13} />
              {copiedCode ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>

          <div className="border-t border-line pt-3 flex items-center justify-between text-xs text-ink-muted">
            <span>Đã có <strong className="text-navy-700">18 học viên</strong> sử dụng</span>
            <span className="text-emerald-600 font-semibold">Tích cực</span>
          </div>
        </div>

        {/* Card Gói Mua Theo Lớp (Bulk Class Pass) */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Users size={20} />
              </span>
              <div>
                <h3 className="font-bold text-navy-700 text-base">Gói Tài Trợ Cho Lớp Học (Class Pass)</h3>
                <p className="text-xs text-ink-muted">Mua sỉ gói Premium cho cả lớp với chiết khấu lên đến 60%</p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
              Tiết kiệm tối đa
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
            {CLASS_BUNDLE_PASSES.map((bundle) => (
              <div
                key={bundle.id}
                onClick={() => toast.success(`Đã chọn ${bundle.title}`)}
                className="flex flex-col justify-between rounded-xl border border-line bg-canvas p-4 hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Giảm {bundle.discount}
                    </span>
                    <span className="text-[10px] text-ink-muted">{bundle.duration}</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-navy-700">{bundle.title}</h4>
                  <p className="mt-1 text-[11px] text-ink-muted">{bundle.idealFor}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-line">
                  <p className="text-sm font-black text-navy-700">
                    {formatCurrency(bundle.discountedPrice)}
                  </p>
                  <p className="text-[10px] text-ink-muted line-through">
                    {formatCurrency(bundle.originalPrice)}
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.success(`Đã chọn ${bundle.title}`)}
                    className="mt-2.5 w-full rounded-lg bg-white border border-line py-1.5 text-xs font-semibold text-navy-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Đăng ký gói
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherPackagesPage
