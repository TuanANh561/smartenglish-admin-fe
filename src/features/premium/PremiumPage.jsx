import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ExternalLink,
  GraduationCap,
  Save,
  Tag,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import PremiumKpiCards from './components/PremiumKpiCards'
import TeacherPlansTab from './components/TeacherPlansTab'
import StudentPlansTab from './components/StudentPlansTab'
import ClassBundlesTab from './components/ClassBundlesTab'
import CouponsTab from './components/CouponsTab'
import CreateCouponDrawer from './components/CreateCouponDrawer'
import {
  ADMIN_PREMIUM_STATS,
  INITIAL_CLASS_BUNDLES,
  INITIAL_COUPONS,
  INITIAL_STUDENT_PLANS,
  INITIAL_TEACHER_PLANS,
} from '@/mocks/data/premiumPlans'

const TABS = [
  { value: 'teacher', label: 'Gói Giáo Viên', icon: Users },
  { value: 'student', label: 'Gói Học Viên', icon: GraduationCap },
  { value: 'bundles', label: 'Gói Mua Sỉ Theo Lớp', icon: Building2 },
  { value: 'coupons', label: 'Mã Giảm Giá & Voucher', icon: Tag },
]

function PremiumPage() {
  const [activeTab, setActiveTab] = useState('teacher')
  const [isSaving, setIsSaving] = useState(false)

  // State các gói
  const [teacherPlans, setTeacherPlans] = useState(INITIAL_TEACHER_PLANS)
  const [studentPlans, setStudentPlans] = useState(INITIAL_STUDENT_PLANS)
  const [classBundles, setClassBundles] = useState(INITIAL_CLASS_BUNDLES)
  const [coupons, setCoupons] = useState(INITIAL_COUPONS)

  // Coupon Search & Filter
  const [couponSearch, setCouponSearch] = useState('')
  const [couponStatusFilter, setCouponStatusFilter] = useState('all')

  // Modal tạo coupon mới
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponDesc, setNewCouponDesc] = useState('')
  const [newCouponPercent, setNewCouponPercent] = useState('')
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('')
  const [newCouponValidUntil, setNewCouponValidUntil] = useState('')
  const [newCouponTarget, setNewCouponTarget] = useState('all')

  // Handlers Gói Giáo viên
  const updateTeacherPlan = (id, field, value) => {
    setTeacherPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  const toggleTeacherFeature = (planId, featureKey) => {
    setTeacherPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((f) =>
                f.key === featureKey ? { ...f, enabled: !f.enabled } : f,
              ),
            }
          : plan,
      ),
    )
  }

  const addTeacherFeature = (planId, label) => {
    if (!label.trim()) return
    setTeacherPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: [
                ...plan.features,
                { key: `feat_${Date.now()}`, label: label.trim(), enabled: true },
              ],
            }
          : plan,
      ),
    )
  }

  const removeTeacherFeature = (planId, featureKey) => {
    setTeacherPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.filter((f) => f.key !== featureKey),
            }
          : plan,
      ),
    )
  }

  const addTeacherPlan = () => {
    const newId = `T-PLAN-${Date.now()}`
    const newPlan = {
      id: newId,
      name: 'Gói Mới',
      badge: 'Mới',
      target: 'teacher',
      priceMonthly: 199000,
      priceYearly: 1990000,
      maxClasses: 5,
      maxStudents: 100,
      aiQuotaMonthly: 100,
      isPopular: false,
      isActive: true,
      features: [
        { key: 'classes', label: 'Tối đa 5 lớp học', enabled: true },
        { key: 'students', label: 'Tối đa 100 học viên', enabled: true },
        { key: 'ai_content', label: '100 bài học AI / tháng', enabled: true },
      ],
    }
    setTeacherPlans((prev) => [...prev, newPlan])
    toast.success('Đã thêm gói mới')
  }

  const deleteTeacherPlan = (id) => {
    setTeacherPlans((prev) => prev.filter((p) => p.id !== id))
    toast.success('Đã xoá gói')
  }

  // Handlers Gói Học viên
  const updateStudentPlan = (id, field, value) => {
    setStudentPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  const toggleStudentFeature = (planId, featureKey) => {
    setStudentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((f) =>
                f.key === featureKey ? { ...f, enabled: !f.enabled } : f,
              ),
            }
          : plan,
      ),
    )
  }

  const addStudentPlan = () => {
    const newId = `S-PLAN-${Date.now()}`
    const newPlan = {
      id: newId,
      name: 'Gói Học Viên Mới',
      badge: 'Mới',
      target: 'student',
      priceMonthly: 99000,
      priceYearly: 890000,
      durationMonths: 1,
      isPopular: false,
      isActive: true,
      features: [
        { key: 'daily_lessons', label: 'Luyện tập không giới hạn', enabled: true },
        { key: 'speaking_score', label: 'Chấm phát âm AI', enabled: true },
      ],
    }
    setStudentPlans((prev) => [...prev, newPlan])
    toast.success('Đã thêm gói mới')
  }

  const deleteStudentPlan = (id) => {
    setStudentPlans((prev) => prev.filter((p) => p.id !== id))
    toast.success('Đã xoá gói')
  }

  // Handlers Gói Mua Sỉ
  const updateClassBundle = (id, field, value) => {
    setClassBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    )
  }

  const addClassBundle = () => {
    const newBundle = {
      id: `BUNDLE-${Date.now()}`,
      title: 'Gói 30 Học Viên',
      minStudents: 30,
      discountPercent: 35,
      originalPrice: 5970000,
      discountedPrice: 3880000,
      durationMonths: 6,
      idealFor: 'Lớp ôn thi',
      isActive: true,
    }
    setClassBundles((prev) => [...prev, newBundle])
    toast.success('Đã thêm gói sỉ mới')
  }

  const deleteClassBundle = (id) => {
    setClassBundles((prev) => prev.filter((b) => b.id !== id))
    toast.success('Đã xoá gói sỉ')
  }

  // Handlers Coupon
  const handleCreateCoupon = (e) => {
    e.preventDefault()
    if (!newCouponCode.trim() || !newCouponPercent) {
      toast.error('Vui lòng nhập mã và phần trăm giảm')
      return
    }

    const newCoupon = {
      id: `CPN-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc.trim() || 'Mã ưu đãi',
      discountPercent: Number(newCouponPercent),
      target: newCouponTarget,
      usedCount: 0,
      maxUses: Number(newCouponMaxUses) || 100,
      validUntil: newCouponValidUntil || '2026-12-31',
      status: 'active',
    }

    setCoupons((prev) => [newCoupon, ...prev])
    setIsCouponModalOpen(false)
    setNewCouponCode('')
    setNewCouponDesc('')
    setNewCouponPercent('')
    setNewCouponMaxUses('')
    setNewCouponValidUntil('')
    toast.success(`Đã tạo mã ${newCoupon.code}`)
  }

  const handleDeleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id))
    toast.success('Đã xoá mã')
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã ${code}`)
  }

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch =
        !couponSearch ||
        c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(couponSearch.toLowerCase())

      const matchStatus =
        couponStatusFilter === 'all' || c.status === couponStatusFilter

      return matchSearch && matchStatus
    })
  }, [coupons, couponSearch, couponStatusFilter])

  const handleSaveAll = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Đã lưu cấu hình bảng giá thành công!')
    }, 500)
  }

  return (
    <div className="space-y-5">
      {/* Top Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link
          to="/goi-dich-vu"
          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-navy-700 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-colors"
        >
          <ExternalLink size={13} />
          Xem trang Giáo viên
        </Link>
        <Button icon={Save} loading={isSaving} onClick={handleSaveAll}>
          Lưu Cấu Hình
        </Button>
      </div>

      {/* KPI Overview */}
      <PremiumKpiCards stats={ADMIN_PREMIUM_STATS} />

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Gói Giáo viên */}
      {activeTab === 'teacher' && (
        <TeacherPlansTab
          teacherPlans={teacherPlans}
          onAddPlan={addTeacherPlan}
          onUpdatePlan={updateTeacherPlan}
          onDeletePlan={deleteTeacherPlan}
          onToggleFeature={toggleTeacherFeature}
          onAddFeature={addTeacherFeature}
          onRemoveFeature={removeTeacherFeature}
        />
      )}

      {/* Tab 2: Gói Học viên */}
      {activeTab === 'student' && (
        <StudentPlansTab
          studentPlans={studentPlans}
          onAddPlan={addStudentPlan}
          onUpdatePlan={updateStudentPlan}
          onDeletePlan={deleteStudentPlan}
          onToggleFeature={toggleStudentFeature}
        />
      )}

      {/* Tab 3: Gói Mua Sỉ Theo Lớp */}
      {activeTab === 'bundles' && (
        <ClassBundlesTab
          classBundles={classBundles}
          onAddBundle={addClassBundle}
          onUpdateBundle={updateClassBundle}
          onDeleteBundle={deleteClassBundle}
        />
      )}

      {/* Tab 4: Mã Giảm Giá & Voucher */}
      {activeTab === 'coupons' && (
        <CouponsTab
          coupons={coupons}
          filteredCoupons={filteredCoupons}
          couponSearch={couponSearch}
          setCouponSearch={setCouponSearch}
          couponStatusFilter={couponStatusFilter}
          setCouponStatusFilter={setCouponStatusFilter}
          onOpenCreateModal={() => setIsCouponModalOpen(true)}
          onCopyCode={handleCopyCode}
          onDeleteCoupon={handleDeleteCoupon}
        />
      )}

      {/* Drawer Tạo Mã Giảm Giá */}
      <CreateCouponDrawer
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSubmit={handleCreateCoupon}
        code={newCouponCode}
        setCode={setNewCouponCode}
        description={newCouponDesc}
        setDescription={setNewCouponDesc}
        percent={newCouponPercent}
        setPercent={setNewCouponPercent}
        maxUses={newCouponMaxUses}
        setMaxUses={setNewCouponMaxUses}
        validUntil={newCouponValidUntil}
        setValidUntil={setNewCouponValidUntil}
        target={newCouponTarget}
        setTarget={setNewCouponTarget}
      />
    </div>
  )
}

export default PremiumPage
