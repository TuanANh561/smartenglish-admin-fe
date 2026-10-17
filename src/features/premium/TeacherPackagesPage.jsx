import { useState, useEffect } from 'react'
import {
  Copy,
  Gift,
  Users,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getTeacherQuotaStatus } from '../classes/classApi'
import { getAdminPlans } from './api/premiumApi'
import SepayVietQrPaymentModal from './components/SepayVietQrPaymentModal'
import TeacherPlanCard from './components/TeacherPlanCard'

function TeacherPackagesPage() {
  const user = useAuthStore((s) => s.user)
  const teacherId = user?.id ?? null

  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'
  const [copiedCode, setCopiedCode] = useState(false)
  const [quota, setQuota] = useState(null)
  const [plans, setPlans] = useState([])
  const [classBundles, setClassBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [subscribingId, setSubscribingId] = useState(null)
  const [cancellingRenewal, setCancellingRenewal] = useState(false)
  const [isSepayModalOpen, setIsSepayModalOpen] = useState(false)
  const [sepayOrder, setSepayOrder] = useState(null)

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

        if (Array.isArray(plansRes.value.classBundles) && plansRes.value.classBundles.length > 0) {
          setClassBundles(plansRes.value.classBundles)
        }
      } else {
        setPlans([])
        setLoadError('Không thể tải danh sách gói từ máy chủ. Vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu gói giáo viên:', err)
      setLoadError('Đã có lỗi xảy ra khi kết nối máy chủ dịch vụ thanh toán.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [teacherId])

  const handleSubscribe = async (plan) => {
    if (!teacherId) {
      toast.error('Vui lòng đăng nhập để thực hiện')
      return
    }

    if (plan.id === 'plan_center') {
      toast(
        'Đội ngũ Chăm sóc Đối tác SmartEnglish sẽ liên hệ trực tiếp với Thầy/Cô trong vòng 24 giờ để tư vấn triển khai!',
        { icon: '🏫', duration: 5000 },
      )
      return
    }

    // Kiểm tra nhanh: Nếu đang có đơn hàng PENDING còn hiệu lực (< 10 phút) cho cùng gói/tiền -> Tái sử dụng
    const targetPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
    if (sepayOrder && (sepayOrder.status || '').toUpperCase() === 'PENDING') {
      const orderExpires = sepayOrder.expiresAt
        ? new Date(sepayOrder.expiresAt).getTime()
        : (new Date(sepayOrder.createdAt || Date.now()).getTime() + 10 * 60 * 1000)
      const isStillValid = orderExpires > Date.now()
      const isSameAmount = Number(sepayOrder.amountFinal || sepayOrder.amount) === targetPrice
      if (isStillValid && isSameAmount) {
        setIsSepayModalOpen(true)
        return
      }
    }

    setSubscribingId(plan.id)
    try {
      const planId = Number(plan.numericId || (plan.id.includes('pro') ? 2 : plan.id.includes('center') ? 3 : 1))
      const res = await api.post(`/payment/subscriptions/subscribe?userId=${teacherId}`, {
        data: {
          planId,
          paymentMethod: 'SEPAY',
          billingCycle: billingCycle.toUpperCase(),
          customerName: user?.displayName || user?.name || user?.fullName || 'Thầy Nguyễn Văn Hùng',
          customerEmail: user?.email || 'teacher01@smartenglish.vn',
        },
      })

      const payload = res?.data !== undefined ? res.data : res
      const latestOrder = payload?.latestOrder || {
        id: payload?.orderId || Date.now(),
        orderCode: payload?.orderCode || `SEAI${String(Date.now()).slice(-6)}`,
        planName: plan.name,
        amount: payload?.amountFinal || targetPrice,
        amountFinal: payload?.amountFinal || targetPrice,
        customerName: user?.displayName || user?.name || user?.fullName || 'Thầy Nguyễn Văn Hùng',
        customerEmail: user?.email || 'teacher01@smartenglish.vn',
        customerRole: 'Giáo viên (Teacher)',
        status: 'PENDING',
        gateway: 'SEPAY',
        qrUrl: payload?.qrUrl,
        expiresAt: payload?.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }

      setSepayOrder(latestOrder)
      setIsSepayModalOpen(true)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Khởi tạo thanh toán VietQR thất bại: ' + (err?.message || 'Lỗi server'))
    } finally {
      setSubscribingId(null)
    }
  }

  const handlePaymentSuccess = async () => {
    toast.success('🎉 Kích hoạt gói thành công! Quota giáo viên đã được nâng cấp.')
    setIsSepayModalOpen(false)
    await loadData()
  }

  const handleCancelRenewal = async () => {
    if (!confirm('Thầy/Cô có chắc chắn muốn tắt tự động gia hạn? Sau khi hết chu kỳ, tài khoản sẽ về gói Starter.')) return
    setCancellingRenewal(true)
    try {
      await api.post(`/payment/subscriptions/cancel-renewal?userId=${teacherId}`, {})
      toast.success('Đã tắt tự động gia hạn.')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Không thể hủy gia hạn: ' + (err?.message || 'Lỗi server'))
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

  const resolveCurrentBillingCycle = () => {
    if (quota?.billingCycle) return quota.billingCycle.toLowerCase()
    if (quota?.currentPeriodStart && quota?.currentPeriodEnd) {
      const diffDays = (new Date(quota.currentPeriodEnd) - new Date(quota.currentPeriodStart)) / (1000 * 60 * 60 * 24)
      return diffDays > 60 ? 'yearly' : 'monthly'
    }
    return 'monthly'
  }

  const currentBillingCycle = resolveCurrentBillingCycle()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {})
    setCopiedCode(true)
    toast.success('Đã sao chép mã ưu đãi độc quyền!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu gói dịch vụ giáo viên từ hệ thống..." size="lg" />
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
        {plans.map((plan, pIdx) => (
          <TeacherPlanCard
            key={plan.id}
            plan={plan}
            pIdx={pIdx}
            billingCycle={billingCycle}
            currentPlanId={currentPlanId}
            currentBillingCycle={currentBillingCycle}
            subscribingId={subscribingId}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Ưu Đãi Giới Thiệu & Mua Sỉ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
        <div className="lg:col-span-2 relative rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 overflow-hidden">
          {/* Overlay "Sắp ra mắt" */}
          <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/70 flex flex-col items-center justify-center rounded-2xl gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-2xs">
              <Lock size={26} strokeWidth={2} />
            </span>
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-800">Sắp ra mắt</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-[280px]">Tính năng ưu đãi mua sỉ bản quyền cho lớp học đang được phát triển và sẽ ra mắt sớm</p>
            </div>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600">
              Coming Soon
            </span>
          </div>

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

          {classBundles.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
              {classBundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="flex flex-col justify-between rounded-xl border border-line bg-canvas p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        {bundle.badge || 'Ưu đãi'}
                      </span>
                      <span className="text-[10px] text-ink-muted">{bundle.durationMonths ? `${bundle.durationMonths} tháng` : ''}</span>
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-navy-700">{bundle.name}</h4>
                    <p className="mt-1 text-[11px] text-ink-muted">{bundle.description || ''}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line">
                    <p className="text-sm font-black text-navy-700">
                      {formatCurrency(bundle.priceYearly || bundle.priceMonthly || 0)}
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
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              Tính năng mua sỉ gói lớp học đang được chuẩn bị để tích hợp trực tiếp.
            </div>
          )}
        </div>
      </div>

      {/* Modal Quét mã VietQR SePay Napas 24/7 */}
      <SepayVietQrPaymentModal
        isOpen={isSepayModalOpen}
        onClose={() => setIsSepayModalOpen(false)}
        order={sepayOrder}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default TeacherPackagesPage
