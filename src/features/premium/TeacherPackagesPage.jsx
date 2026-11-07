import { useState, useEffect } from 'react'
import {
  GraduationCap,
  Smartphone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getTeacherQuotaStatus } from '../classes/classApi'
import { getAdminPlans } from './api/premiumApi'
import SepayVietQrPaymentModal from './components/SepayVietQrPaymentModal'
import TeacherPlanCard from './components/TeacherPlanCard'
import AdminAssistedSubscriptionToolbar from './components/AdminAssistedSubscriptionToolbar'
import AdminDirectGrantModal from './components/AdminDirectGrantModal'
import SudoUnlockModal from '@/components/ui/SudoUnlockModal'
import { useSudoMode } from '@/hooks/useSudoMode'
import { DEFAULT_STUDENT_PLANS } from './constants/pricingConstants'
import TeacherQuotaBanner from './components/TeacherQuotaBanner'
import TeacherReferralCard from './components/TeacherReferralCard'
import StudentMobilePreviewSection from './components/StudentMobilePreviewSection'

function TeacherPackagesPage() {
  const user = useAuthStore((s) => s.user)
  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'
  const teacherId = user?.id ?? null

  // Chế độ xem trước dành cho Admin: 'teacher' | 'student'
  const [rolePreviewTab, setRolePreviewTab] = useState('teacher')
  // Giả lập trạng thái Giáo viên: 'starter' (chưa nâng cấp) | 'pro' (đã kích hoạt)
  const [teacherSimMode, setTeacherSimMode] = useState('starter')
  // Giả lập trạng thái Học viên: 'free' (chưa nâng cấp) | 'pro' (đã kích hoạt)
  const [studentSimMode, setStudentSimMode] = useState('free')

  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'
  const [copiedCode, setCopiedCode] = useState(false)
  const [quota, setQuota] = useState(null)
  const [plans, setPlans] = useState([])
  const [studentPlans, setStudentPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribingId, setSubscribingId] = useState(null)
  const [cancellingRenewal, setCancellingRenewal] = useState(false)
  const [isSepayModalOpen, setIsSepayModalOpen] = useState(false)
  const [sepayOrder, setSepayOrder] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDirectGrantModalOpen, setIsDirectGrantModalOpen] = useState(false)

  // Sudo Mode: Lớp bảo mật xác thực danh tính Quản trị viên trước các hành động nhạy cảm
  const {
    isUnlocked: isSudoUnlocked,
    isModalOpen: isSudoModalOpen,
    setIsModalOpen: setIsSudoModalOpen,
    isVerifying: isSudoVerifying,
    unlock: unlockSudo,
    requireSudo,
  } = useSudoMode()

  const referralCode = 'TEACHER-MAI20'

  const loadData = async () => {
    setLoading(true)
    try {
      const [quotaRes, plansRes] = await Promise.allSettled([
        getTeacherQuotaStatus(),
        getAdminPlans(),
      ])

      if (quotaRes.status === 'fulfilled' && quotaRes.value) {
        setQuota(quotaRes.value)
      } else {
        setQuota(null)
      }

      if (plansRes.status === 'fulfilled' && plansRes.value) {
        const val = plansRes.value
        if (Array.isArray(val.teacherPlans) && val.teacherPlans.length > 0) {
          const bePlans = val.teacherPlans.map((bp, idx) => ({
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
        }

        if (Array.isArray(val.studentPlans) && val.studentPlans.length > 0) {
          setStudentPlans(val.studentPlans)
        } else {
          setStudentPlans(DEFAULT_STUDENT_PLANS)
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu gói:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [teacherId])

  // Quota giả lập cho Admin hoặc Quota thực tế cho Giáo viên
  const effectiveQuota = isAdmin
    ? teacherSimMode === 'starter'
      ? {
          planName: 'Teacher Starter (Gói Miễn Phí)',
          isPremium: false,
          status: 'ACTIVE',
          activeClasses: 1,
          maxClasses: 3,
          canCreateMoreClasses: true,
          maxStudentsPerClass: 40,
          maxStudents: 40,
          aiQuotaMonthly: 20,
        }
      : {
          planName: 'Teacher Pro (Gói Chuyên Nghiệp)',
          isPremium: true,
          status: 'ACTIVE',
          activeClasses: 4,
          maxClasses: 15,
          canCreateMoreClasses: true,
          maxStudentsPerClass: 300,
          maxStudents: 300,
          aiQuotaMonthly: 99999,
          autoRenew: true,
          currentPeriodEnd: '2027-10-21T00:00:00Z',
        }
    : quota

  const resolveCurrentPlanId = () => {
    if (isAdmin) {
      return teacherSimMode === 'starter' ? 1 : 2
    }
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
    if (effectiveQuota?.billingCycle) return effectiveQuota.billingCycle.toLowerCase()
    if (effectiveQuota?.currentPeriodStart && effectiveQuota?.currentPeriodEnd) {
      const diffDays = (new Date(effectiveQuota.currentPeriodEnd) - new Date(effectiveQuota.currentPeriodStart)) / (1000 * 60 * 60 * 24)
      return diffDays > 60 ? 'yearly' : 'monthly'
    }
    return 'monthly'
  }

  const currentBillingCycle = resolveCurrentBillingCycle()

  // Bấm đăng ký gói Giáo viên
  const handleSubscribe = async (plan) => {
    if (plan.id === 'plan_center' || plan.id === 'T-PLAN-CENTER') {
      toast(
        'Đội ngũ Chăm sóc Đối tác SmartEnglish sẽ liên hệ trực tiếp với Thầy/Cô trong vòng 24 giờ để tư vấn triển khai!',
        { duration: 5000 },
      )
      return
    }

    const targetPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
    if (isAdmin) {
      // Mở đơn VietQR SePay để admin đăng ký hộ hoặc xem trước trực tiếp
      setSepayOrder({
        orderCode: selectedUser
          ? `SEPAY_TEACHER_${selectedUser.id}_${Date.now().toString().slice(-6)}`
          : `SEPAY_TEACHER_PRO_${Date.now().toString().slice(-6)}`,
        amount: targetPrice || 20000,
        amountFinal: targetPrice || 20000,
        planName: `${plan.name} (${billingCycle === 'yearly' ? 'Theo năm' : 'Theo tháng'})`,
        customerName: selectedUser ? (selectedUser.displayName || selectedUser.username) : undefined,
        customerEmail: selectedUser?.email,
        forRole: 'teacher',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
        bankCode: 'MB',
        accountNumber: '0963684871',
        accountName: 'NGUYEN TUAN ANH',
      })
      setIsSepayModalOpen(true)
      return
    }

    setSubscribingId(plan.id)
    try {
      const planId = Number(plan.numericId || (plan.id.includes('pro') ? 2 : plan.id.includes('center') ? 3 : 1))
      const res = await api.post('/payment/subscriptions/subscribe', {
        data: {
          planId,
          paymentMethod: 'SEPAY',
          billingCycle: billingCycle.toUpperCase(),
          customerName: user?.displayName || user?.name || user?.fullName || 'Giáo viên SmartEnglish',
          customerEmail: user?.email || '',
        },
      })

      const payload = res?.data !== undefined ? res.data : res
      const latestOrder = payload?.latestOrder
      if (!latestOrder) {
        throw new Error('Máy chủ không trả về thông tin đơn hàng thanh toán.')
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

  // Bấm xem thử hoặc đăng ký hộ gói Học viên
  const handleSubscribeStudentPlan = (plan, appliedVoucher = null) => {
    const rawPrice = plan.priceMonthly > 0 ? plan.priceMonthly : plan.priceYearly
    if (!rawPrice || rawPrice <= 0) {
      toast.success('Gói Học Viên Miễn Phí không yêu cầu thanh toán!')
      return
    }

    const price = appliedVoucher
      ? Math.max(2000, Math.round(rawPrice * (1 - appliedVoucher.percent / 100)))
      : rawPrice

    const orderSuffix = Date.now().toString().slice(-6)
    const orderCode = selectedUser
      ? `SEPAY_STUDENT_${selectedUser.id}_${orderSuffix}`
      : `SEPAY_STUDENT_${orderSuffix}`

    setSepayOrder({
      orderCode,
      amount: price,
      amountFinal: price,
      amountOriginal: rawPrice,
      discountAmount: rawPrice - price,
      voucherCode: appliedVoucher?.code,
      planName: `${plan.name} (Học viên)${appliedVoucher ? ` • ${appliedVoucher.label}` : ''}`,
      customerName: selectedUser ? (selectedUser.displayName || selectedUser.username) : undefined,
      customerEmail: selectedUser?.email,
      forRole: 'student',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
      bankCode: 'MB',
      accountNumber: '0963684871',
      accountName: 'NGUYEN TUAN ANH',
    })
    setIsSepayModalOpen(true)
  }

  const handlePaymentSuccess = async () => {
    toast.success('Kích hoạt gói thành công! Quota tài khoản đã được nâng cấp.')
    setIsSepayModalOpen(false)
    if (!isAdmin) await loadData()
  }

  const handleCancelRenewal = async () => {
    if (!confirm('Thầy/Cô có chắc chắn muốn tắt tự động gia hạn? Sau khi hết chu kỳ, tài khoản sẽ về gói Starter.')) return
    if (isAdmin) {
      toast.success('Đã tắt tự động gia hạn (Mô phỏng).')
      return
    }
    setCancellingRenewal(true)
    try {
      await api.post('/payment/subscriptions/cancel-renewal', {})
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
    if (isAdmin) {
      toast.success('Đã bật lại tự động gia hạn (Mô phỏng).')
      return
    }
    setCancellingRenewal(true)
    try {
      await api.post('/payment/subscriptions/resume-renewal', {})
      toast.success('Đã bật lại tự động gia hạn.')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Không thể bật lại gia hạn: ' + (err?.message || 'Lỗi server'))
    } finally {
      setCancellingRenewal(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {})
    setCopiedCode(true)
    toast.success('Đã sao chép mã ưu đãi độc quyền!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu gói dịch vụ từ hệ thống..." size="lg" />
      </div>
    )
  }

  const studentPlansList = studentPlans.length > 0 ? studentPlans : DEFAULT_STUDENT_PLANS

  return (
    <div className="space-y-6">
      {/* ── Admin: Thanh tìm kiếm & Đăng ký hộ ─────────────────────── */}
      {isAdmin && (
        <AdminAssistedSubscriptionToolbar
          selectedUser={selectedUser}
          onSelectUser={(u) => {
            setSelectedUser(u)
            if (u) {
              if (u.role === 'teacher') setRolePreviewTab('teacher')
              if (u.role === 'student') setRolePreviewTab('student')
            }
          }}
          onOpenDirectGrant={() => {
            requireSudo(() => setIsDirectGrantModalOpen(true))
          }}
          isSudoUnlocked={isSudoUnlocked}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOP ACTION BAR: TIÊU ĐỀ & ĐIỀU HƯỚNG GIAO DIỆN / CHU KỲ THANH TOÁN
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 2 nút chuyển đổi: Giao diện Giáo viên / Giao diện Học viên (dành cho Admin preview) */}
          {isAdmin && (
            <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setRolePreviewTab('teacher')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  rolePreviewTab === 'teacher'
                    ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <GraduationCap
                  size={15}
                  className={rolePreviewTab === 'teacher' ? 'text-brand-600' : 'text-slate-400'}
                />
                <span>Giáo viên</span>
              </button>
              <button
                type="button"
                onClick={() => setRolePreviewTab('student')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  rolePreviewTab === 'student'
                    ? 'bg-white text-amber-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <Smartphone
                  size={15}
                  className={rolePreviewTab === 'student' ? 'text-amber-600' : 'text-slate-400'}
                />
                <span>Học viên</span>
              </button>
            </div>
          )}

          {/* Nút Theo tháng / Theo năm (khi ở giao diện Giáo viên) */}
          {rolePreviewTab === 'teacher' && (
            <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Theo tháng
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <span>Theo năm</span>
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Tiết kiệm 30%
                </span>
              </button>
            </div>
          )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GIAO DIỆN GIÁO VIÊN (HIỂN THỊ KHI ROLE LÀ TEACHER HOẶC ADMIN CHỌN TAB TEACHER)
      ───────────────────────────────────────────────────────────── */}
      {(!isAdmin || rolePreviewTab === 'teacher') && (
        <div className="space-y-6">

          {/* Banner Gói: Phân biệt Admin và Giáo viên */}
          <TeacherQuotaBanner
            isAdmin={isAdmin}
            effectiveQuota={effectiveQuota}
            cancellingRenewal={cancellingRenewal}
            onCancelRenewal={handleCancelRenewal}
            onResumeRenewal={handleResumeRenewal}
          />

          {/* Lưới 3 gói Giáo viên */}
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
                isAdmin={isAdmin}
                targetUser={selectedUser}
              />
            ))}
          </div>

          {/* Ưu Đãi Giới Thiệu & Mua Sỉ Cho Lớp Học */}
          <TeacherReferralCard
            referralCode={referralCode}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. GIAO DIỆN HỌC VIÊN (STUDENT PAYWALL SHOWCASE DÀNH CHO ADMIN)
      ───────────────────────────────────────────────────────────── */}
      {isAdmin && rolePreviewTab === 'student' && (
        <StudentMobilePreviewSection
          studentPlansList={studentPlansList}
          isAdmin={isAdmin}
          selectedUser={selectedUser}
          studentSimMode={studentSimMode}
          onSubscribeStudentPlan={handleSubscribeStudentPlan}
        />
      )}

      {/* Modal Quét mã VietQR SePay Napas 24/7 */}
      <SepayVietQrPaymentModal
        isOpen={isSepayModalOpen}
        onClose={() => setIsSepayModalOpen(false)}
        order={sepayOrder}
        onSuccess={handlePaymentSuccess}
      />

      {/* Modal Kích hoạt gói trực tiếp dành cho Admin */}
      {isAdmin && selectedUser && (
        <AdminDirectGrantModal
          isOpen={isDirectGrantModalOpen}
          onClose={() => setIsDirectGrantModalOpen(false)}
          targetUser={selectedUser}
          onSuccess={async (updatedUser) => {
            if (updatedUser) {
              setSelectedUser(updatedUser)
            }
            await loadData()
          }}
        />
      )}

      {/* Modal Xác thực Quản trị viên (Sudo Security Verification) */}
      <SudoUnlockModal
        isOpen={isSudoModalOpen}
        onClose={() => setIsSudoModalOpen(false)}
        onUnlock={unlockSudo}
        isVerifying={isSudoVerifying}
        title="Xác thực Quản trị viên"
        subtitle="Nhập mật khẩu quản trị để kích hoạt hoặc cấp gói dịch vụ trực tiếp"
      />
    </div>
  )
}

export default TeacherPackagesPage
