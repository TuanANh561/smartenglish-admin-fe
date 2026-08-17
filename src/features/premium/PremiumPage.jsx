import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Layers,
  Plus,
  Radio,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import Tabs from '@/components/ui/Tabs'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
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
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-white shadow-sm">
              <Crown size={17} />
            </span>
            <h1 className="text-xl font-bold text-navy-700">
              Cấu hình Gói Premium & Bảng Giá
            </h1>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Quản lý bảng giá, hạn mức học liệu và chính sách mã ưu đãi.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* KPI Overview with Subtle Accent Tops */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Card className="p-4 border border-line relative overflow-hidden group hover:border-brand-400 hover:shadow-sm transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Doanh thu tháng</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <DollarSign size={15} />
            </span>
          </div>
          <p className="text-xl font-bold text-navy-700 mt-2">
            {formatCurrency(ADMIN_PREMIUM_STATS.monthlyRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +{ADMIN_PREMIUM_STATS.revenueDelta}% so tháng trước
          </p>
        </Card>

        <Card className="p-4 border border-line relative overflow-hidden group hover:border-indigo-400 hover:shadow-sm transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Thuê bao hoạt động</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Users size={15} />
            </span>
          </div>
          <p className="text-xl font-bold text-navy-700 mt-2">
            {formatNumber(ADMIN_PREMIUM_STATS.activeSubscribers)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">
            <strong className="text-navy-700">{ADMIN_PREMIUM_STATS.teacherSubscribers}</strong> GV · <strong className="text-navy-700">{ADMIN_PREMIUM_STATS.studentSubscribers}</strong> Học viên
          </p>
        </Card>

        <Card className="p-4 border border-line relative overflow-hidden group hover:border-amber-400 hover:shadow-sm transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Mã ưu đãi</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <Tag size={15} />
            </span>
          </div>
          <p className="text-xl font-bold text-navy-700 mt-2">
            {ADMIN_PREMIUM_STATS.activeCoupons} Mã
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {ADMIN_PREMIUM_STATS.couponRedemptions} lượt dùng tuần này
          </p>
        </Card>

        <Card className="p-4 border border-line relative overflow-hidden group hover:border-emerald-400 hover:shadow-sm transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Tỷ lệ gia hạn</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <Sparkles size={15} />
            </span>
          </div>
          <p className="text-xl font-bold text-navy-700 mt-2">
            {ADMIN_PREMIUM_STATS.retentionRate}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            +12% so với trung bình
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* ─── TAB 1: GÓI GIÁO VIÊN ────────────────────────────────────────── */}
      {activeTab === 'teacher' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                Các gói dành cho Giáo viên ({teacherPlans.length})
              </span>
            </div>
            <Button icon={Plus} size="sm" onClick={addTeacherPlan}>
              Thêm Gói Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {teacherPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col justify-between border-2 transition-all relative',
                  plan.isPopular
                    ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                    : 'border-line hover:border-slate-300',
                )}
              >
                {/* Popular Pill Highlight */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-navy-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Star size={11} fill="#f59e0b" className="text-amber-400" /> Bán chạy nhất
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  {/* Top Bar: Tên gói & Xoá */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-ink-muted uppercase">Tên gói</label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updateTeacherPlan(plan.id, 'name', e.target.value)}
                        className="font-bold text-navy-700 text-sm mt-0.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTeacherPlan(plan.id)}
                      className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5 transition-colors"
                      title="Xoá gói"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Badge & Popular Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">Nhãn phụ</label>
                      <Input
                        value={plan.badge || ''}
                        onChange={(e) => updateTeacherPlan(plan.id, 'badge', e.target.value)}
                        placeholder="VD: Khuyên dùng"
                        className="text-xs mt-0.5"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.isPopular}
                          onChange={(e) => updateTeacherPlan(plan.id, 'isPopular', e.target.checked)}
                          className="rounded border-line text-brand-500 focus:ring-brand-500"
                        />
                        Đặt làm Nổi bật
                      </label>
                    </div>
                  </div>

                  {/* Giá tháng & năm có Box điểm nhấn */}
                  <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase">Giá / Tháng (đ)</label>
                        <Input
                          type="number"
                          value={plan.priceMonthly}
                          onChange={(e) => updateTeacherPlan(plan.id, 'priceMonthly', Number(e.target.value))}
                          className="font-bold text-navy-700 text-xs mt-0.5"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase">Giá / Năm (đ)</label>
                        <Input
                          type="number"
                          value={plan.priceYearly}
                          onChange={(e) => updateTeacherPlan(plan.id, 'priceYearly', Number(e.target.value))}
                          className="font-bold text-navy-700 text-xs mt-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 font-semibold">
                      <span className="text-ink-muted">Hiển thị giá:</span>
                      <span className="text-brand-600">
                        {plan.priceMonthly === 0 ? 'Miễn phí' : `${formatCurrency(plan.priceMonthly)} / tháng`}
                      </span>
                    </div>
                  </div>

                  {/* Hạn mức cấu hình (Quotas) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide block">
                      Hạn mức tài nguyên
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-line bg-white p-2">
                        <span className="text-ink-muted block text-[10px] font-medium">Lớp tối đa:</span>
                        <Input
                          type="number"
                          value={plan.maxClasses}
                          onChange={(e) => updateTeacherPlan(plan.id, 'maxClasses', Number(e.target.value))}
                          className="mt-0.5 font-bold text-navy-700 text-xs"
                        />
                      </div>
                      <div className="rounded-lg border border-line bg-white p-2">
                        <span className="text-ink-muted block text-[10px] font-medium">Học viên:</span>
                        <Input
                          type="number"
                          value={plan.maxStudents}
                          onChange={(e) => updateTeacherPlan(plan.id, 'maxStudents', Number(e.target.value))}
                          className="mt-0.5 font-bold text-navy-700 text-xs"
                        />
                      </div>
                      <div className="rounded-lg border border-line bg-white p-2">
                        <span className="text-ink-muted block text-[10px] font-medium">AI / tháng:</span>
                        <Input
                          type="number"
                          value={plan.aiQuotaMonthly}
                          onChange={(e) => updateTeacherPlan(plan.id, 'aiQuotaMonthly', Number(e.target.value))}
                          className="mt-0.5 font-bold text-navy-700 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Danh sách Tính năng */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide">
                        Tính năng ({plan.features.filter((f) => f.enabled).length}/{plan.features.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {plan.features.map((feature) => (
                        <div
                          key={feature.key}
                          className={cn(
                            'flex items-center justify-between gap-1.5 rounded-lg border p-2 text-xs transition-colors',
                            feature.enabled
                              ? 'border-line bg-white text-navy-700'
                              : 'border-dashed border-slate-200 bg-slate-50/60 text-slate-400',
                          )}
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {feature.enabled ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <X size={13} className="text-slate-300 shrink-0" />
                            )}
                            <span className={cn('text-[11px] truncate', !feature.enabled && 'line-through')}>
                              {feature.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Switch
                              checked={feature.enabled}
                              onChange={() => toggleTeacherFeature(plan.id, feature.key)}
                            />
                            <button
                              type="button"
                              onClick={() => removeTeacherFeature(plan.id, feature.key)}
                              className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Thêm tính năng nhanh */}
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        id={`new_feat_${plan.id}`}
                        placeholder="+ Thêm tính năng..."
                        className="flex-1 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTeacherFeature(plan.id, e.target.value)
                            e.target.value = ''
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`new_feat_${plan.id}`)
                          if (input && input.value) {
                            addTeacherFeature(plan.id, input.value)
                            input.value = ''
                          }
                        }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-slate-200 cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Switch */}
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Trạng thái mở bán:</span>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <Switch
                      checked={plan.isActive}
                      onChange={(checked) => updateTeacherPlan(plan.id, 'isActive', checked)}
                    />
                    <span className={plan.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                      {plan.isActive ? 'Đang bán' : 'Tạm dừng'}
                    </span>
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: GÓI HỌC VIÊN ─────────────────────────────────────────── */}
      {activeTab === 'student' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                Các gói dành cho Học viên ({studentPlans.length})
              </span>
            </div>
            <Button icon={Plus} size="sm" onClick={addStudentPlan}>
              Thêm Gói Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {studentPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col justify-between border-2 transition-all relative',
                  plan.isPopular
                    ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                    : 'border-line hover:border-slate-300',
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-navy-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Star size={11} fill="#f59e0b" className="text-amber-400" /> Khuyên dùng
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-ink-muted uppercase">Tên gói</label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updateStudentPlan(plan.id, 'name', e.target.value)}
                        className="font-bold text-navy-700 text-sm mt-0.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteStudentPlan(plan.id)}
                      className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">Nhãn phụ</label>
                      <Input
                        value={plan.badge || ''}
                        onChange={(e) => updateStudentPlan(plan.id, 'badge', e.target.value)}
                        className="text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase">Thời hạn (Tháng)</label>
                      <Input
                        type="number"
                        value={plan.durationMonths}
                        onChange={(e) => updateStudentPlan(plan.id, 'durationMonths', Number(e.target.value))}
                        className="text-xs mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Giá bán (VNĐ)</label>
                    <Input
                      type="number"
                      value={plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (plan.durationMonths >= 12) {
                          updateStudentPlan(plan.id, 'priceYearly', val)
                        } else {
                          updateStudentPlan(plan.id, 'priceMonthly', val)
                        }
                      }}
                      className="font-bold text-navy-700 text-sm mt-0.5"
                    />
                    <span className="text-[11px] font-semibold text-brand-600 mt-1 block">
                      {(plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly) === 0
                        ? '0 đ (Miễn phí)'
                        : `${formatCurrency(plan.priceYearly > 0 ? plan.priceYearly : plan.priceMonthly)} / ${plan.durationMonths === 999 ? 'Trọn đời' : `${plan.durationMonths || 1} tháng`}`}
                    </span>
                  </div>

                  {/* Tính năng */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wide block">
                      Quyền lợi ({plan.features.filter((f) => f.enabled).length})
                    </span>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {plan.features.map((feature) => (
                        <div
                          key={feature.key}
                          className="flex items-center justify-between gap-1 rounded-lg border border-line bg-white p-2 text-xs"
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {feature.enabled ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <X size={13} className="text-slate-300 shrink-0" />
                            )}
                            <span className={cn('text-[11px] truncate', !feature.enabled && 'line-through text-slate-400')}>
                              {feature.label}
                            </span>
                          </div>
                          <Switch
                            checked={feature.enabled}
                            onChange={() => toggleStudentFeature(plan.id, feature.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Mở bán:</span>
                  <Switch
                    checked={plan.isActive}
                    onChange={(checked) => updateStudentPlan(plan.id, 'isActive', checked)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: GÓI MUA SỈ THEO LỚP ────────────────────────────────────── */}
      {activeTab === 'bundles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                Bảng giá mua sỉ license theo lớp ({classBundles.length})
              </span>
            </div>
            <Button icon={Plus} size="sm" onClick={addClassBundle}>
              Thêm Gói Sỉ Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {classBundles.map((bundle) => (
              <Card key={bundle.id} className="space-y-3.5 border-2 border-line hover:border-brand-500 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Tên gói sỉ</label>
                    <Input
                      value={bundle.title}
                      onChange={(e) => updateClassBundle(bundle.id, 'title', e.target.value)}
                      className="font-bold text-navy-700 text-sm mt-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteClassBundle(bundle.id)}
                    className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Số học viên</label>
                    <Input
                      type="number"
                      value={bundle.minStudents}
                      onChange={(e) => updateClassBundle(bundle.id, 'minStudents', Number(e.target.value))}
                      className="text-xs font-bold mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Chiết khấu (%)</label>
                    <Input
                      type="number"
                      value={bundle.discountPercent}
                      onChange={(e) => updateClassBundle(bundle.id, 'discountPercent', Number(e.target.value))}
                      className="text-xs font-bold text-emerald-600 mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Giá gốc (đ)</label>
                    <Input
                      type="number"
                      value={bundle.originalPrice}
                      onChange={(e) => updateClassBundle(bundle.id, 'originalPrice', Number(e.target.value))}
                      className="text-xs text-slate-400 line-through mt-0.5"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                      {formatCurrency(bundle.originalPrice)}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase">Giá ưu đãi (đ)</label>
                    <Input
                      type="number"
                      value={bundle.discountedPrice}
                      onChange={(e) => updateClassBundle(bundle.id, 'discountedPrice', Number(e.target.value))}
                      className="text-xs font-bold text-brand-600 mt-0.5"
                    />
                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                      {formatCurrency(bundle.discountedPrice)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase">Áp dụng cho</label>
                  <Input
                    value={bundle.idealFor}
                    onChange={(e) => updateClassBundle(bundle.id, 'idealFor', e.target.value)}
                    className="text-xs mt-0.5"
                  />
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Mở bán:</span>
                  <Switch
                    checked={bundle.isActive}
                    onChange={(checked) => updateClassBundle(bundle.id, 'isActive', checked)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: MÃ GIẢM GIÁ ─────────────────────────────────────────── */}
      {activeTab === 'coupons' && (
        <Card className="space-y-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                Danh sách mã ưu đãi & Voucher ({filteredCoupons.length})
              </span>
            </div>
            <Button icon={Plus} size="sm" onClick={() => setIsCouponModalOpen(true)}>
              Tạo Mã Ưu Đãi Mới
            </Button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Tìm mã code hoặc mô tả..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <Select
              value={couponStatusFilter}
              onChange={(e) => setCouponStatusFilter(e.target.value)}
              className="w-40 text-xs"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiệu lực</option>
              <option value="expired">Hết hạn</option>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-ink-muted uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Mã Code</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3 text-center">Giảm (%)</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3 text-center">Lượt dùng / Hạn mức</th>
                  <th className="px-4 py-3">Hạn dùng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Xoá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {filteredCoupons.map((c) => {
                  const usagePercent = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100))
                  const isExhausted = c.usedCount >= c.maxUses

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600 bg-brand-50/50 border border-brand-200/60 px-2 py-0.5 rounded-md w-fit">
                          <span>{c.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            className="text-slate-400 hover:text-brand-600 cursor-pointer p-0.5"
                            title="Sao chép mã"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-ink max-w-xs font-medium truncate">
                        {c.description}
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-emerald-600 text-sm">
                        -{c.discountPercent}%
                      </td>

                      <td className="px-4 py-3">
                        {c.target === 'teacher' ? (
                          <Badge tone="warning">Giáo viên</Badge>
                        ) : c.target === 'student' ? (
                          <Badge tone="info">Học viên</Badge>
                        ) : (
                          <Badge tone="neutral">Toàn sàn</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="space-y-1">
                          <span className="font-bold text-navy-700">
                            {formatNumber(c.usedCount)} / {formatNumber(c.maxUses)}
                          </span>
                          <div className="h-1.5 w-20 mx-auto rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                usagePercent > 80 ? 'bg-amber-500' : 'bg-brand-500',
                              )}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-ink-muted">
                        {c.validUntil}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {c.status === 'active' && !isExhausted ? (
                          <Badge tone="success">Hiệu lực</Badge>
                        ) : isExhausted ? (
                          <Badge tone="warning">Hết lượt</Badge>
                        ) : (
                          <Badge tone="neutral">Hết hạn</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                          title="Xoá mã này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Drawer Tạo Mã Giảm Giá */}
      <Drawer
        open={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Tạo Mã Ưu Đãi Mới"
        className="max-w-[420px]"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Mã Voucher *
            </label>
            <Input
              placeholder="VD: SUMMER26"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="mt-1 font-mono uppercase font-bold text-navy-700"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Mô tả chiến dịch
            </label>
            <Input
              placeholder="VD: Ưu đãi 20% đầu năm học"
              value={newCouponDesc}
              onChange={(e) => setNewCouponDesc(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-ink-muted">
                Giảm (%) *
              </label>
              <Input
                type="number"
                placeholder="20"
                min="1"
                max="100"
                value={newCouponPercent}
                onChange={(e) => setNewCouponPercent(e.target.value)}
                className="mt-1 font-bold text-emerald-600"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-ink-muted">
                Số lượt tối đa
              </label>
              <Input
                type="number"
                placeholder="500"
                value={newCouponMaxUses}
                onChange={(e) => setNewCouponMaxUses(e.target.value)}
                className="mt-1 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-ink-muted">
                Đối tượng
              </label>
              <Select
                value={newCouponTarget}
                onChange={(e) => setNewCouponTarget(e.target.value)}
                className="mt-1 text-xs"
              >
                <option value="all">Toàn sàn</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học viên</option>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-ink-muted">
                Hạn dùng
              </label>
              <Input
                type="date"
                value={newCouponValidUntil}
                onChange={(e) => setNewCouponValidUntil(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3.5 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsCouponModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" fullWidth icon={Plus}>
              Tạo Mã
            </Button>
          </div>
        </form>
      </Drawer>
    </main>
  )
}

export default PremiumPage
