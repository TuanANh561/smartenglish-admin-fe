import { useState, useEffect } from 'react'
import {
  Copy,
  Gift,
  Users,
  Lock,
  GraduationCap,
  Smartphone,
  Crown,
  Sparkles,
  Zap,
  Mic,
  FileText,
  ShieldCheck,
  Check,
  CheckCircle2,
  X,
  Star,
  QrCode,
  Layers,
  Infinity as InfinityIcon,
  Bot,
  Camera,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getTeacherQuotaStatus } from '../classes/classApi'
import { getAdminPlans } from './api/premiumApi'
import SepayVietQrPaymentModal from './components/SepayVietQrPaymentModal'
import TeacherPlanCard from './components/TeacherPlanCard'

// Gói học viên mặc định đồng bộ với Paywall Mobile & Database
const DEFAULT_STUDENT_PLANS = [
  {
    id: 'S-PLAN-FREE',
    name: 'Học Viên Miễn Phí',
    badge: 'Cơ bản',
    priceMonthly: 0,
    priceYearly: 0,
    dailyAiChat: 15,
    dailyAiSpeaking: 10,
    weeklyAiWriting: 2,
    dailyAiScan: 5,
    maxClasses: 3,
    isPopular: false,
    features: [
      { label: 'Làm đề thi TOEIC & Mock Test miễn phí', enabled: true },
      { label: 'Học từ vựng Flashcard SRS không giới hạn từ', enabled: true },
      { label: '15 tin nhắn Chat AI thông minh mỗi ngày', enabled: true },
      { label: '10 câu luyện nói & chấm phát âm mỗi ngày', enabled: true },
      { label: '2 bài chấm viết luận AI mỗi tuần', enabled: true },
      { label: 'Tham gia tối đa 3 lớp học của giáo viên', enabled: true },
    ],
  },
  {
    id: 'S-PLAN-MONTHLY',
    name: 'Học Viên Pro Tháng',
    badge: 'Ưu đãi 20k',
    priceMonthly: 20000,
    priceYearly: 0,
    dailyAiChat: 9999,
    dailyAiSpeaking: 9999,
    weeklyAiWriting: 9999,
    dailyAiScan: 9999,
    maxClasses: 9999,
    isPopular: true,
    features: [
      { label: 'AI Gia sư 1-1 Không Giới Hạn (Chat & Voice)', enabled: true },
      { label: 'Chấm Điểm & Sửa Phát Âm Chi Tiết Từng Âm Vị', enabled: true },
      { label: 'Chấm Viết Luận & Đề Thi TOEIC VIP Không Giới Hạn', enabled: true },
      { label: 'Quét ảnh giải đề thi & bài tập không giới hạn', enabled: true },
      { label: 'Tham gia không giới hạn lớp học của giáo viên', enabled: true },
      { label: '100% Không có quảng cáo làm phiền', enabled: true },
    ],
  },
  {
    id: 'S-PLAN-YEARLY',
    name: 'Học Viên Pro Năm',
    badge: 'Tiết kiệm 37%',
    priceMonthly: 0,
    priceYearly: 1490000,
    dailyAiChat: 9999,
    dailyAiSpeaking: 9999,
    weeklyAiWriting: 9999,
    dailyAiScan: 9999,
    maxClasses: 9999,
    isPopular: false,
    features: [
      { label: 'Toàn bộ quyền lợi gói Pro trong suốt 12 tháng', enabled: true },
      { label: 'Chỉ ~124.000đ/tháng (tiết kiệm đến 37%)', enabled: true },
      { label: 'AI Gia sư 1-1 Không Giới Hạn (Chat & Voice)', enabled: true },
      { label: 'Chấm Phát Âm Sóng Âm IPA & Sửa Luận Chi Tiết', enabled: true },
      { label: 'Toàn bộ từ vựng IELTS 8.0 & TOEIC 900+ nâng cao', enabled: true },
      { label: 'Ưu tiên kết nối Server AI tốc độ cao 24/7', enabled: true },
    ],
  },
  {
    id: 'S-PLAN-LIFETIME',
    name: 'Học Viên Trọn Đời (Lifetime)',
    badge: 'Ưu đãi đặc biệt',
    priceMonthly: 0,
    priceYearly: 3990000,
    dailyAiChat: 9999,
    dailyAiSpeaking: 9999,
    weeklyAiWriting: 9999,
    dailyAiScan: 9999,
    maxClasses: 9999,
    isPopular: false,
    features: [
      { label: 'Sở hữu vĩnh viễn tài khoản SmartEnglish Pro VIP', enabled: true },
      { label: 'Thanh toán 1 lần duy nhất — không phí duy trì', enabled: true },
      { label: 'Tự động mở khóa mọi tính năng AI mới trong tương lai', enabled: true },
      { label: 'Toàn bộ đề thi, học liệu & khóa học VIP trọn đời', enabled: true },
      { label: 'Hỗ trợ VIP 1-1 từ đội ngũ kỹ thuật & chuyên gia', enabled: true },
    ],
  },
]

// 4 Quyền lợi cốt lõi của Học viên Pro
const CORE_STUDENT_BENEFITS = [
  {
    icon: Zap,
    title: 'Gia sư AI 1-1 Không Giới Hạn',
    desc: 'Luyện nói Voice & Chat sửa lỗi ngữ pháp, từ vựng theo ngữ cảnh tức thì',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    icon: Mic,
    title: 'Chấm Phát Âm Chuẩn Từng Âm Vị',
    desc: 'Phân tích sóng âm IPA, nhận diện chuẩn xác ngữ điệu và trọng âm câu',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    icon: FileText,
    title: 'Chấm Luận & Đề Thi TOEIC VIP',
    desc: 'Chấm chi tiết Task 1 & 2 kèm gợi ý viết lại câu nâng band điểm 8.0+',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: '100% Không Có Quảng Cáo',
    desc: 'Trải nghiệm học tập liền mạch, tập trung tối đa vào lộ trình phản xạ',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
]

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
        { icon: '🏫', duration: 5000 },
      )
      return
    }

    const targetPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
    if (isAdmin) {
      // Giả lập mở đơn VietQR SePay để admin xem trước trực tiếp
      setSepayOrder({
        orderCode: `SEPAY_TEACHER_PRO_${Date.now().toString().slice(-6)}`,
        amount: targetPrice || 20000,
        amountFinal: targetPrice || 20000,
        planName: `${plan.name} (${billingCycle === 'yearly' ? 'Theo năm' : 'Theo tháng'})`,
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

  // Bấm xem thử luồng thanh toán gói Học viên
  const handleSubscribeStudentPlan = (plan) => {
    const price = plan.priceMonthly > 0 ? plan.priceMonthly : plan.priceYearly
    if (!price || price <= 0) {
      toast.success('Gói Học Viên Miễn Phí không yêu cầu thanh toán!')
      return
    }

    setSepayOrder({
      orderCode: `SEPAY_STUDENT_${Date.now().toString().slice(-6)}`,
      amount: price,
      amountFinal: price,
      planName: `${plan.name} (Học viên)`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
      bankCode: 'MB',
      accountNumber: '0963684871',
      accountName: 'NGUYEN TUAN ANH',
    })
    setIsSepayModalOpen(true)
  }

  const handlePaymentSuccess = async () => {
    toast.success('🎉 Kích hoạt gói thành công! Quota tài khoản đã được nâng cấp.')
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
      {/* ─────────────────────────────────────────────────────────────
          TOP ACTION BAR: TIÊU ĐỀ & ĐIỀU HƯỚNG GIAO DIỆN / CHU KỲ THANH TOÁN
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-navy-900">
            {rolePreviewTab === 'teacher'
              ? 'Bảng gói dịch vụ giảng dạy dành cho Giáo viên'
              : 'Bảng gói dịch vụ học tập dành cho Học viên'}
          </h2>
          <p className="text-xs text-slate-500">
            {rolePreviewTab === 'teacher'
              ? 'Mở rộng quy mô lớp học và giải phóng thời gian chấm chữa bài với trợ lý AI'
              : 'Trực quan hóa gói dịch vụ học viên trên ứng dụng di động'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
                <span>Giao diện Giáo viên</span>
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
                <span>Giao diện Học viên</span>
              </button>
            </div>
          )}

          {/* Nút Theo tháng / Theo năm (khi ở giao diện Giáo viên) */}
          {rolePreviewTab === 'teacher' && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                Theo tháng
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-navy-900'
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
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GIAO DIỆN GIÁO VIÊN (HIỂN THỊ KHI ROLE LÀ TEACHER HOẶC ADMIN CHỌN TAB TEACHER)
      ───────────────────────────────────────────────────────────── */}
      {(!isAdmin || rolePreviewTab === 'teacher') && (
        <div className="space-y-6">

          {/* Banner Gói Hiện Tại Của Giáo Viên */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 text-white shadow-md transition-all ${
              effectiveQuota?.isPremium
                ? 'border-brand-200 bg-gradient-to-r from-[#1B3A57] via-[#21557A] to-[#29A8E8]'
                : 'border-slate-300 bg-gradient-to-r from-slate-800 to-slate-900'
            }`}
          >
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      effectiveQuota?.isPremium ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        effectiveQuota?.isPremium ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    GÓI HIỆN TẠI
                  </span>
                  <span className="text-xs text-white/70">
                    • {effectiveQuota?.isPremium ? 'Đang kích hoạt gói Premium' : 'Gói Miễn Phí (Starter)'}
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {effectiveQuota?.planName || 'Teacher Starter'}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/80">
                  {effectiveQuota?.currentPeriodEnd && (
                    <span>
                      Hết hạn: <strong className="text-white">
                        {new Intl.DateTimeFormat('vi-VN').format(new Date(effectiveQuota.currentPeriodEnd))}
                      </strong>
                    </span>
                  )}
                  {effectiveQuota?.isPremium && (
                    <span>
                      • Trạng thái gia hạn: <strong className="text-white">
                        {effectiveQuota?.autoRenew ? 'Tự động gia hạn' : 'Không tự động gia hạn'}
                      </strong>
                    </span>
                  )}
                </div>

                {effectiveQuota?.isPremium && effectiveQuota.autoRenew === true && (
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={cancellingRenewal}
                      onClick={handleCancelRenewal}
                      className="text-xs text-white/80 underline hover:text-white cursor-pointer transition-colors"
                    >
                      {cancellingRenewal ? 'Đang xử lý...' : 'Tắt tự động gia hạn gói này'}
                    </button>
                  </div>
                )}
                {effectiveQuota?.isPremium && effectiveQuota.autoRenew === false && (
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={cancellingRenewal}
                      onClick={handleResumeRenewal}
                      className="text-xs text-emerald-300 underline hover:text-white cursor-pointer transition-colors"
                    >
                      {cancellingRenewal ? 'Đang xử lý...' : 'Bật lại tự động gia hạn'}
                    </button>
                  </div>
                )}
              </div>

              {/* 3 Đồng hồ Quota */}
              <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 lg:border-t-0 lg:pt-0 sm:gap-6">
                <div className="text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">Lớp học</span>
                  <span className="mt-1 text-xl font-black text-white sm:text-2xl block">
                    {effectiveQuota?.activeClasses ?? 0}
                    <span className="text-sm font-normal text-white/60"> / {effectiveQuota?.maxClasses ?? 3}</span>
                  </span>
                </div>

                <div className="text-center border-x border-white/10 px-2 sm:px-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">Sĩ số tối đa</span>
                  <span className="mt-1 text-xl font-black text-white sm:text-2xl block">
                    {effectiveQuota?.maxStudentsPerClass ?? 40}
                    <span className="text-sm font-normal text-white/60"> HV/lớp</span>
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block">AI Quota</span>
                  <span className="mt-1 text-xl font-black text-white sm:text-2xl block">
                    {effectiveQuota?.isPremium ? '∞ Unlimited' : `${effectiveQuota?.aiQuotaMonthly ?? 20} lượt/th`}
                  </span>
                </div>
              </div>
            </div>
          </div>

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
              />
            ))}
          </div>

          {/* Ưu Đãi Giới Thiệu & Mua Sỉ Cho Lớp Học */}
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
                  className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-700 shadow-sm hover:bg-slate-50 border border-line cursor-pointer"
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

            {/* Card Gói Mua Theo Lớp (Class Pass) */}
            <div className="lg:col-span-2 relative rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 overflow-hidden">
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

              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                Tính năng mua sỉ gói lớp học đang được chuẩn bị để tích hợp trực tiếp.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. GIAO DIỆN HỌC VIÊN (STUDENT PAYWALL SHOWCASE DÀNH CHO ADMIN)
      ───────────────────────────────────────────────────────────── */}
      {isAdmin && rolePreviewTab === 'student' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 p-8 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
              <Crown size={32} />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              <Sparkles size={13} className="text-amber-600" /> SMARTENGLISH PRO CHO HỌC VIÊN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bứt Phá Tiếng Anh Cùng SmartEnglish PRO
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 leading-relaxed">
              Mở khóa gia sư AI 1-1, luyện phản xạ giao tiếp, chấm chữa phát âm sóng âm IPA và kho tài liệu luyện thi VIP không giới hạn
            </p>

            {/* Trạng thái mô phỏng */}
            <div className="mt-5 mx-auto max-w-lg">
              {studentSimMode === 'pro' ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-300/80 px-4 py-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Tài khoản học viên đang kích hoạt gói PRO (Hạn dùng: 21/10/2027)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 border border-blue-300/80 px-4 py-2 text-xs font-bold text-blue-800">
                  <Sparkles size={16} className="text-blue-600 shrink-0" />
                  <span>Tài khoản đang dùng gói Miễn Phí (15 chat AI/ngày, 10 câu nói/ngày)</span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Quyền lợi cốt lõi */}
          <div>
            <div className="text-center mb-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                QUYỀN LỢI NỔI BẬT KHI LÊN PRO
              </h3>
              <p className="text-base font-bold text-slate-900 mt-1">Trải nghiệm sức mạnh công nghệ AI thế hệ mới</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CORE_STUDENT_BENEFITS.map((item, idx) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color} border ${item.border} mb-3.5`}>
                      <IconComponent size={22} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lưới 4 gói Học viên */}
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bảng gói dịch vụ Học viên từ hệ thống</h3>
                <p className="text-xs text-slate-500">Đồng bộ trực tiếp từ cấu hình cơ sở dữ liệu Payment Service</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Tổng cộng: {studentPlansList.length} gói học viên</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {studentPlansList.map((plan) => {
                const isFree = plan.id === 'S-PLAN-FREE' || (!plan.priceMonthly && !plan.priceYearly)
                const isMonthly = plan.id === 'S-PLAN-MONTHLY' || plan.priceMonthly === 20000
                const isYearly = plan.id === 'S-PLAN-YEARLY' || plan.priceYearly === 1490000
                const isLifetime = plan.id === 'S-PLAN-LIFETIME' || plan.priceYearly === 3990000

                const isCurrent = studentSimMode === 'pro'
                  ? (isYearly || isLifetime)
                  : isFree

                const displayPrice = plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all hover:shadow-md ${
                      isCurrent
                        ? 'border-2 border-amber-500 ring-2 ring-amber-500/10'
                        : isMonthly
                          ? 'border-2 border-brand-500 ring-2 ring-brand-500/10'
                          : 'border-slate-200'
                    }`}
                  >
                    {/* Badge góc trên */}
                    {plan.badge && (
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold shadow-xs ${
                        isCurrent
                          ? 'bg-amber-600 text-white'
                          : isMonthly
                            ? 'bg-rose-600 text-white'
                            : 'bg-navy-700 text-white'
                      }`}>
                        {isCurrent ? 'Đang sử dụng' : plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Tiêu đề & giá */}
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(displayPrice)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {isFree ? '' : isMonthly ? '/ tháng' : isYearly ? '/ năm' : 'trọn đời'}
                          </span>
                        </div>
                        {isMonthly && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-slate-400 line-through">199.000đ</span>
                            <span className="rounded-md bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 border border-rose-200">
                              Giảm 90%
                            </span>
                          </div>
                        )}
                        {isYearly && (
                          <p className="text-[11px] text-emerald-600 font-medium mt-1">
                            Chỉ ~124.000đ/tháng (Tiết kiệm 37%)
                          </p>
                        )}
                      </div>

                      {/* Hạn mức tóm tắt */}
                      <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100 font-medium text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Chat AI hội thoại:</span>
                          <span className="font-bold text-slate-900">{plan.dailyAiChat >= 9999 ? '∞ Không giới hạn' : `${plan.dailyAiChat ?? 15} tin/ngày`}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Luyện nói & phát âm:</span>
                          <span className="font-bold text-slate-900">{plan.dailyAiSpeaking >= 9999 ? '∞ Không giới hạn' : `${plan.dailyAiSpeaking ?? 10} câu/ngày`}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Chấm viết luận AI:</span>
                          <span className="font-bold text-slate-900">{plan.weeklyAiWriting >= 9999 ? '∞ Không giới hạn' : `${plan.weeklyAiWriting ?? 2} bài/tuần`}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Quét ảnh giải đề AI:</span>
                          <span className="font-bold text-slate-900">{plan.dailyAiScan >= 9999 ? '∞ Không giới hạn' : `${plan.dailyAiScan ?? 5} ảnh/ngày`}</span>
                        </div>
                      </div>

                      {/* Danh sách tính năng */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {(plan.features || []).slice(0, 5).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-600 leading-snug">{feat.label || feat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="mt-6 pt-3 border-t border-slate-100">
                      {isCurrent ? (
                        <div className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-500">
                          Đang sử dụng gói này
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubscribeStudentPlan(plan)}
                          className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:shadow-md cursor-pointer ${
                            isMonthly
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : isYearly
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-slate-900 hover:bg-slate-800'
                          }`}
                        >
                          <QrCode size={14} />
                          <span>Xem thử VietQR ({formatCurrency(displayPrice)})</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bảng so sánh hạn mức chi tiết giữa các gói học viên */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs overflow-hidden">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Bảng so sánh hạn mức & quyền lợi học viên</h3>
              <p className="text-xs text-slate-500">So sánh chi tiết hạn mức Quota giữa gói Miễn Phí và các gói Nâng Cấp Pro</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                    <th className="py-3 px-4 font-bold">Tính năng / Quyền lợi</th>
                    <th className="py-3 px-4 font-bold text-center">Gói Miễn Phí</th>
                    <th className="py-3 px-4 font-bold text-center text-rose-600">Pro Tháng (20k)</th>
                    <th className="py-3 px-4 font-bold text-center text-amber-600">Pro Năm (1.490k)</th>
                    <th className="py-3 px-4 font-bold text-center text-indigo-600">Trọn Đời (Lifetime)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <Bot size={15} className="text-brand-600" /> AI Chatbot hội thoại thông minh
                    </td>
                    <td className="py-3 px-4 text-center">15 tin nhắn / ngày</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <Mic size={15} className="text-sky-600" /> Luyện nói & Chấm phát âm IPA
                    </td>
                    <td className="py-3 px-4 text-center">10 câu / ngày</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <FileText size={15} className="text-emerald-600" /> Chấm viết luận Writing
                    </td>
                    <td className="py-3 px-4 text-center">2 bài / tuần</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <Camera size={15} className="text-amber-600" /> Quét ảnh giải bài tập AI
                    </td>
                    <td className="py-3 px-4 text-center">5 ảnh / ngày</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <Users size={15} className="text-indigo-600" /> Tham gia lớp học của giáo viên
                    </td>
                    <td className="py-3 px-4 text-center">Tối đa 3 lớp</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">∞ Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <BookOpen size={15} className="text-purple-600" /> Kho đề thi TOEIC & Mock Test
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">Đề thi cơ bản</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">100% Đầy đủ đề mới</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 flex items-center gap-2 font-semibold text-slate-900">
                      <ShieldCheck size={15} className="text-rose-600" /> Trải nghiệm không quảng cáo
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">✓ Có</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
