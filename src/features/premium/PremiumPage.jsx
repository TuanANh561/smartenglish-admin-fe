import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  getAdminPlans,
  batchSavePlans,
  deletePlan,
  getAdminStats,
  getCoupons,
  createCoupon,
  deleteCoupon,
} from './api/premiumApi'

const TABS = [
  { value: 'teacher', label: 'Gói Giáo Viên', icon: Users },
  { value: 'student', label: 'Gói Học Viên', icon: GraduationCap },
  { value: 'bundles', label: 'Gói Mua Sỉ Theo Lớp', icon: Building2, disabled: true, comingSoon: true },
  { value: 'coupons', label: 'Mã Giảm Giá & Voucher', icon: Tag },
]

function PremiumPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'teacher'
  const setActiveTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // State các gói & thống kê từ database thật
  const [stats, setStats] = useState(null)
  const [teacherPlans, setTeacherPlans] = useState([])
  const [studentPlans, setStudentPlans] = useState([])
  const [classBundles, setClassBundles] = useState([])
  const [coupons, setCoupons] = useState([])

  // Nạp toàn bộ dữ liệu thật từ Backend Payment Service
  useEffect(() => {
    let mounted = true
    setIsLoading(true)

    Promise.allSettled([
      getAdminPlans(),
      getAdminStats(),
      getCoupons(),
    ]).then(([plansRes, statsRes, couponsRes]) => {
      if (!mounted) return

      if (plansRes.status === 'fulfilled' && plansRes.value) {
        const data = plansRes.value
        if (data.teacherPlans && data.teacherPlans.length > 0) {
          setTeacherPlans(data.teacherPlans)
        }
        if (data.studentPlans && data.studentPlans.length > 0) {
          setStudentPlans(data.studentPlans)
        }
        if (data.classBundles && data.classBundles.length > 0) {
          setClassBundles(data.classBundles)
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value)
      }

      if (couponsRes.status === 'fulfilled' && couponsRes.value) {
        setCoupons(couponsRes.value)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

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

  const deleteTeacherPlan = async (id) => {
    setTeacherPlans((prev) => prev.filter((p) => p.id !== id))
    try {
      await deletePlan(id)
      toast.success('Đã xoá gói giáo viên khỏi cơ sở dữ liệu')
    } catch (err) {
      console.error(err)
      toast.error('Xóa gói thất bại: ' + (err.message || 'Lỗi server'))
    }
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

  const addStudentFeature = (planId, label) => {
    if (!label.trim()) return
    setStudentPlans((prev) =>
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

  const removeStudentFeature = (planId, featureKey) => {
    setStudentPlans((prev) =>
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

  const deleteStudentPlan = async (id) => {
    setStudentPlans((prev) => prev.filter((p) => p.id !== id))
    try {
      await deletePlan(id)
      toast.success('Đã xoá gói học viên khỏi cơ sở dữ liệu')
    } catch (err) {
      console.error(err)
      toast.error('Xóa gói thất bại: ' + (err.message || 'Lỗi server'))
    }
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
      name: 'Gói 30 Học Viên',
      minStudents: 30,
      maxStudents: 30,
      discountPercent: 35,
      originalPrice: 5970000,
      discountedPrice: 3880000,
      priceMonthly: 3880000,
      durationMonths: 6,
      idealFor: 'Lớp ôn thi',
      badge: 'Giảm 35%',
      isActive: true,
      features: [
        { key: 'students', label: 'Bao gồm 30 tài khoản học viên', enabled: true },
        { key: 'duration', label: 'Thời hạn 6 tháng', enabled: true },
      ],
    }
    setClassBundles((prev) => [...prev, newBundle])
    toast.success('Đã thêm gói sỉ mới')
  }

  const deleteClassBundle = async (id) => {
    setClassBundles((prev) => prev.filter((b) => b.id !== id))
    try {
      await deletePlan(id)
      toast.success('Đã xoá gói sỉ khỏi cơ sở dữ liệu')
    } catch (err) {
      console.error(err)
      toast.success('Đã xoá gói sỉ')
    }
  }

  // Handlers Coupon kết nối Backend thật
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!newCouponCode.trim() || !newCouponPercent) {
      toast.error('Vui lòng nhập mã và phần trăm giảm')
      return
    }

    try {
      const payload = {
        code: newCouponCode.trim().toUpperCase(),
        description: newCouponDesc.trim() || `Mã ưu đãi ${newCouponCode.trim().toUpperCase()}`,
        discountType: 'PERCENT',
        discountValue: Number(newCouponPercent),
        target: newCouponTarget,
        maxUses: Number(newCouponMaxUses) || 100,
        validUntil: newCouponValidUntil ? `${newCouponValidUntil}T23:59:59Z` : null,
      }

      const created = await createCoupon(payload)
      setCoupons((prev) => [created, ...prev])
      setIsCouponModalOpen(false)
      setNewCouponCode('')
      setNewCouponDesc('')
      setNewCouponPercent('')
      setNewCouponMaxUses('')
      setNewCouponValidUntil('')
      toast.success(`Đã tạo thành công mã ${payload.code} vào hệ thống!`)
    } catch (err) {
      console.error('Lỗi tạo mã ưu đãi:', err)
      toast.error('Không thể tạo mã ưu đãi: ' + (err.message || 'Lỗi server'))
    }
  }

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCoupon(id)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Đã xoá mã ưu đãi thành công khỏi cơ sở dữ liệu')
    } catch (err) {
      console.error('Lỗi xóa mã ưu đãi:', err)
      toast.error('Xóa mã thất bại: ' + (err.message || 'Lỗi server'))
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã ${code}`)
  }

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch =
        !couponSearch ||
        c.code?.toLowerCase().includes(couponSearch.toLowerCase()) ||
        c.description?.toLowerCase().includes(couponSearch.toLowerCase())

      const matchStatus =
        couponStatusFilter === 'all' || c.status === couponStatusFilter

      return matchSearch && matchStatus
    })
  }, [coupons, couponSearch, couponStatusFilter])

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const allPlansToSave = [
        ...teacherPlans.map((p, idx) => ({ ...p, target: 'teacher', sortOrder: idx + 1 })),
        ...studentPlans.map((p, idx) => ({ ...p, target: 'student', sortOrder: idx + 1 })),
        ...classBundles.map((p, idx) => ({
          ...p,
          target: 'bundle',
          sortOrder: idx + 1,
          name: p.title || p.name,
          maxStudents: p.minStudents || p.maxStudents,
          priceMonthly: p.discountedPrice ?? p.priceMonthly,
        })),
      ]
      await batchSavePlans(allPlansToSave)
      toast.success('Đã lưu cấu hình bảng giá vào cơ sở dữ liệu thật thành công!')
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình gói dịch vụ:', err)
      toast.error('Lưu cấu hình thất bại: ' + (err.message || 'Lỗi kết nối cơ sở dữ liệu'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3.5">
      {/* 1. Compact KPI Metric Strip từ database thật */}
      <PremiumKpiCards stats={stats} />

      {/* 2. Combined Row: Tabs (Left) + Action Buttons (Right) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} className="border-b-0" />
        <div className="flex items-center gap-2 pb-2">
          <Link
            to="/goi-dich-vu"
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 shadow-xs hover:border-brand-500 hover:text-brand-600 transition-colors"
          >
            <ExternalLink size={13} />
            Xem trang Giáo viên
          </Link>
          <Button icon={Save} loading={isSaving} onClick={handleSaveAll} className="py-1.5 px-3.5 text-xs">
            Lưu Cấu Hình
          </Button>
        </div>
      </div>

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
          onAddFeature={addStudentFeature}
          onRemoveFeature={removeStudentFeature}
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
