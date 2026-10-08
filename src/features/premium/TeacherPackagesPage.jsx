import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getTeacherQuotaStatus } from '../classes/classApi'
import { getAdminPlans } from './api/premiumApi'

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
  const user = useAuthStore((s) => s.user)
  const teacherId = user?.id ?? null

  const [billingCycle, setBillingCycle] = useState('yearly') // 'monthly' | 'yearly'
  const [copiedCode, setCopiedCode] = useState(false)
  const [quota, setQuota] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [subscribingId, setSubscribingId] = useState(null)
  const [cancellingRenewal, setCancellingRenewal] = useState(false)

  const referralCode = 'TEACHER-MAI20'

  const loadData = async () => {
    setLoading(true)
    setLoadError(null)
    if (!teacherId) {
      setQuota(null)
      setPlans([])
      setLoadError('Không xác định được tài khoản đang đăng nhập.')
      setLoading(false)
      return
    }
    try {
      const [quotaRes, plansRes] = await Promise.allSettled([
        getTeacherQuotaStatus(teacherId),
        getAdminPlans(),
      ])

      if (quotaRes.status === 'fulfilled' && quotaRes.value) {
        setQuota(quotaRes.value)
      } else {
        // Fallback gói Starter mặc định nếu chưa có bản ghi quota trong DB
        setQuota({
          teacherId,
          planId: 1,
          planCode: 'T-PLAN-STARTER',
          planName: 'Teacher Starter',
          isPremium: false,
          status: 'ACTIVE',
          maxClasses: 3,
          maxStudents: 40,
          aiQuotaMonthly: 20,
        })
      }

      if (plansRes.status === 'fulfilled' && plansRes.value?.teacherPlans?.length > 0) {
        const bePlans = plansRes.value.teacherPlans.map((bp, idx) => ({
          id: bp.id || `plan_${idx}`,
          numericId: idx + 1,
          name: bp.name,
          subtitle: bp.badge || (idx === 0 ? 'Dành cho giáo viên mới bắt đầu thử nghiệm' : idx === 1 ? 'Dành cho giáo viên chuyên nghiệp & luyện thi' : 'Dành cho trung tâm & trường học'),
          priceMonthly: Number(bp.priceMonthly) || 0,
          priceYearly: Number(bp.priceYearly) || 0,
          badge: bp.badge,
          isPopular: bp.isPopular || idx === 1,
          features: Array.isArray(bp.features) && bp.features.length > 0
            ? bp.features.map((f) => ({ text: f.label || f.name, included: f.enabled !== false }))
            : [
                { text: `Quản lý tối đa ${bp.maxClasses || (idx === 0 ? 3 : 15)} lớp học`, included: true },
                { text: `Tối đa ${bp.maxStudents || (idx === 0 ? 30 : 100)} học viên mỗi lớp`, included: true },
                { text: `${bp.aiQuotaMonthly || 50} lượt tạo bài giảng AI/tháng`, included: true },
                { text: 'Theo dõi điểm số cơ bản', included: true },
                { text: 'AI hỗ trợ chấm chữa Speaking & Writing', included: idx > 0 },
                { text: 'Xuất báo cáo PDF/Excel chi tiết', included: idx > 0 },
                { text: 'Hỗ trợ kỹ thuật ưu tiên 24/7', included: idx > 1 },
              ],
        }))
        setPlans(bePlans)
      } else {
        // Fallback sang danh sách gói giáo viên tiêu chuẩn TEACHER_PLANS
        setPlans(TEACHER_PLANS)
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu gói giáo viên, dùng cấu hình mặc định:', err)
      setQuota({
        teacherId,
        planId: 1,
        planCode: 'T-PLAN-STARTER',
        planName: 'Teacher Starter',
        isPremium: false,
        status: 'ACTIVE',
        maxClasses: 3,
        maxStudents: 40,
        aiQuotaMonthly: 20,
      })
      setPlans(TEACHER_PLANS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [teacherId])

  const handleSubscribe = async (plan) => {
    setSubscribingId(plan.id)
    try {
      const planId = plan.numericId || (plan.id.includes('pro') ? 2 : plan.id.includes('center') ? 3 : 1)
      await api.post(`/payment/subscriptions/subscribe?userId=${teacherId}`, {
        data: {
          planId,
          paymentMethod: 'STRIPE',
          billingCycle: billingCycle.toUpperCase(),
        },
      })
      toast.success(`Đã cập nhật thành công gói ${plan.name} vào hệ thống!`)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Nâng cấp thất bại: ' + (err?.message || 'Lỗi server'))
    } finally {
      setSubscribingId(null)
    }
  }

  const handleCancelRenewal = async () => {
    setCancellingRenewal(true)
    try {
      await api.post(`/payment/subscriptions/cancel-renewal?userId=${teacherId}`, {})
      toast.success('Đã tắt tự động gia hạn. Gói hiện tại vẫn dùng được đến hết kỳ.')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Không thể tắt gia hạn: ' + (err?.message || 'Lỗi server'))
    } finally {
      setCancellingRenewal(false)
    }
  }

  const handleResumeRenewal = async () => {
    setCancellingRenewal(true)
    try {
      await api.post(`/payment/subscriptions/resume-renewal?userId=${teacherId}`, {})
      toast.success('Đã bật lại tự động gia hạn.')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Không thể bật lại gia hạn: ' + (err?.message || 'Lỗi server'))
    } finally {
      setCancellingRenewal(false)
    }
  }

  const periodEndLabel = quota?.currentPeriodEnd
    ? new Intl.DateTimeFormat('vi-VN').format(new Date(quota.currentPeriodEnd))
    : null

  const renewalLabel = quota?.cancelAtPeriodEnd === true
    ? 'Không tự động gia hạn'
    : quota?.autoRenew === true
      ? 'Tự động gia hạn'
      : 'Trạng thái gia hạn đang được đồng bộ'

  const resolveCurrentPlanId = () => {
    const explicitPlanId = Number(quota?.planId)
    if (Number.isInteger(explicitPlanId) && explicitPlanId >= 1 && explicitPlanId <= 3) return explicitPlanId

    const identity = `${quota?.planCode || ''} ${quota?.planName || ''}`.toUpperCase()
    if (identity.includes('CENTER') || identity.includes('SCHOOL')) return 3
    if (identity.includes('PRO') || identity.includes('LIFETIME') || quota?.isPremium === true) {
      return Number(quota?.maxClasses || 0) > 20 ? 3 : 2
    }
    return 1
  }

  const currentPlanId = resolveCurrentPlanId() || 1

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {})
    setCopiedCode(true)
    toast.success('Đã sao chép mã ưu đãi độc quyền!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu gói dịch vụ giáo viên..." size="lg" />
      </div>
    )
  }

  if (plans.length === 0 && loadError) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
        <h2 className="text-lg font-bold text-navy-700">Chưa thể tải danh sách gói dịch vụ</h2>
        <p className="mt-2 text-sm text-ink-muted">
          {loadError || 'Dữ liệu gói dịch vụ trả về chưa đầy đủ. Vui lòng tải lại.'}
        </p>
        <Button className="mt-5" onClick={loadData}>Thử lại</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top action: Chu kỳ thanh toán toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={[
              'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              billingCycle === 'monthly'
                ? 'bg-navy-700 text-white shadow-xs'
                : 'text-ink-muted hover:text-navy-700',
            ].join(' ')}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              billingCycle === 'yearly'
                ? 'bg-navy-700 text-white shadow-xs'
                : 'text-ink-muted hover:text-navy-700',
            ].join(' ')}
          >
            Theo năm
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Tiết kiệm 30%
            </span>
          </button>
        </div>
      </div>

      {/* Banner Gói Hiện Tại */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 text-white shadow-md transition-all ${
          quota?.isPremium
            ? 'border-brand-200 bg-gradient-to-r from-[#1B3A57] via-[#21557A] to-[#29A8E8]'
            : 'border-slate-300 bg-gradient-to-r from-slate-800 to-slate-900'
        }`}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold tracking-wide uppercase">
                Gói Hiện Tại
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${
                  quota?.isPremium ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    quota?.isPremium ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {quota?.isPremium ? 'Đang kích hoạt gói Premium' : 'Gói Miễn Phí (Starter)'}
              </span>
            </div>
            <h2 className="text-2xl font-black">
              {quota?.planName || 'Gói Khởi Đầu (Teacher Starter)'}
            </h2>
            <p className="text-sm text-white/80 max-w-xl">
              {quota?.isPremium
                ? `Tài khoản của bạn được cấp quyền giảng dạy Premium: tối đa ${quota.maxClasses} lớp học và ${quota.maxStudents ?? quota.maxStudentsPerClass} học viên mỗi lớp.`
                : 'Bạn đang sử dụng gói trải nghiệm miễn phí. Nâng cấp lên Teacher Pro để mở khóa 15 lớp học, 100 học viên/lớp và AI không giới hạn!'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span>
                {quota?.isPremium
                  ? `${periodEndLabel ? `Hạn dùng: ${periodEndLabel}` : 'Ngày hết hạn đang được đồng bộ'} · ${renewalLabel}`
                  : 'Thời hạn: Không giới hạn thời gian (Gói trải nghiệm cơ bản)'}
              </span>
              {quota?.isPremium && quota.autoRenew === true && (
                <button
                  type="button"
                  disabled={cancellingRenewal}
                  onClick={handleCancelRenewal}
                  className="rounded-lg border border-white/30 bg-white/10 px-2.5 py-1 font-semibold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {cancellingRenewal ? 'Đang xử lý...' : 'Tắt tự động gia hạn'}
                </button>
              )}
              {quota?.isPremium && quota.cancelAtPeriodEnd === true && (
                <button
                  type="button"
                  disabled={cancellingRenewal}
                  onClick={handleResumeRenewal}
                  className="rounded-lg border border-white/30 bg-white/10 px-2.5 py-1 font-semibold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {cancellingRenewal ? 'Đang xử lý...' : 'Bật lại gia hạn'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-xs">
            <div className="text-center">
              <p className="text-xs text-white/70">Lớp học</p>
              <p className="text-xl font-bold">
                {quota?.activeClasses ?? 0}{' '}
                <span className="text-xs font-normal text-white/60">
                  / {quota?.maxClasses ?? 3}
                </span>
              </p>
            </div>
            <div className="text-center border-x border-white/20 px-3">
              <p className="text-xs text-white/70">Sĩ số tối đa</p>
              <p className="text-xl font-bold">
                {quota?.maxStudents ?? quota?.maxStudentsPerClass ?? 30}{' '}
                <span className="text-xs font-normal text-white/60">HV/lớp</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/70">AI Quota</p>
              <p className="text-xl font-bold text-amber-300">
                {quota?.isPremium ? '∞ Unlimited' : `${quota?.aiQuotaMonthly ?? 20} lượt/th`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Các Gói Giảng Dạy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan, pIdx) => {
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
          const planId = plan.numericId || pIdx + 1
          const isCurrentPlan = planId === currentPlanId
          const isStarterFallback = planId === 1 && currentPlanId > 1
          const isLowerPaidPlan = planId > 1 && planId < currentPlanId

          return (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-2xl border bg-white p-6 shadow-xs transition-all hover:shadow-md',
                isCurrentPlan ? 'border-2 border-brand-500 ring-2 ring-brand-500/10' : 'border-line',
              ].join(' ')}
            >
              {/* Badge trên cùng */}
              {(plan.badge || (isCurrentPlan && 'Đang sử dụng')) && (
                <span
                  className={[
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold shadow-xs',
                    isCurrentPlan ? 'bg-brand-500 text-white' : 'bg-navy-700 text-white',
                  ].join(' ')}
                >
                  {isCurrentPlan ? 'Đang sử dụng' : plan.badge}
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-navy-700">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-muted min-h-[36px]">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-6 border-b border-line pb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-navy-700">
                    {price === 0 ? 'Miễn phí' : formatCurrency(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-ink-muted">
                      / {billingCycle === 'yearly' ? 'năm' : 'tháng'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="mt-1 text-sm text-emerald-600 font-medium">
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
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    {feat.included ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 mt-0.5">
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
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-sm font-bold text-navy-700 cursor-default"
                >
                  ✓ Gói đang sử dụng
                </button>
              ) : isStarterFallback ? (
                <button
                  disabled
                  className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-semibold text-slate-500"
                >
                  Tự động áp dụng khi hết hạn
                </button>
              ) : isLowerPaidPlan ? (
                <button
                  disabled
                  className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-semibold text-slate-500"
                >
                  Không thể hạ gói giữa kỳ
                </button>
              ) : (
                <Button
                  variant={plan.id === 'plan_center' || pIdx === 2 ? 'primary' : 'secondary'}
                  fullWidth
                  disabled={subscribingId === plan.id}
                  onClick={() => handleSubscribe(plan)}
                >
                  {subscribingId === plan.id ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Đang kích hoạt...
                    </span>
                  ) : (
                    'Nâng cấp ngay'
                  )}
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

        {/* Card Gói Mua Theo Lớp (Bulk Class Pass) — TẠM KHÓA */}
        <div className="lg:col-span-2 relative rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 overflow-hidden">
          {/* Overlay "Sắp ra mắt" */}
          <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center rounded-2xl gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Sắp ra mắt</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-[220px]">Tính năng mua sỉ gói lớp học đang được phát triển và sẽ ra mắt sớm</p>
            </div>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600">
              Coming Soon
            </span>
          </div>

          {/* Nội dung gốc — bị mờ phía sau overlay */}
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
                className="flex flex-col justify-between rounded-xl border border-line bg-canvas p-4"
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
                    disabled
                    className="mt-2.5 w-full rounded-lg bg-white border border-line py-1.5 text-xs font-semibold text-navy-700 shadow-sm cursor-not-allowed opacity-60"
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
