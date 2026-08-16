import { useState } from 'react'
import toast from 'react-hot-toast'
import { Award, LayoutGrid, Plus, Save, Star, Tag } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import { cn, formatNumber } from '@/lib/utils'
import { coupons as initialCoupons, premiumPlans } from '@/mocks/data/premiumPlans'

const PLAN_ICON = { award: Award, star: Star }

function PremiumPage() {
  const [plans, setPlans] = useState(premiumPlans)
  const [coupons, setCoupons] = useState(initialCoupons)
  const [newCode, setNewCode] = useState('')
  const [newPercent, setNewPercent] = useState('')
  const [newMaxUses, setNewMaxUses] = useState('')
  const [newValidUntil, setNewValidUntil] = useState('')

  const updatePlanField = (planId, field, value) => {
    setPlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, [field]: value } : plan)))
  }

  const toggleFeature = (planId, featureKey) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((feature) =>
                feature.key === featureKey ? { ...feature, enabled: !feature.enabled } : feature,
              ),
            }
          : plan,
      ),
    )
  }

  const handleAddPlan = () => {
    const id = `PLAN-${Date.now()}`
    setPlans((prev) => [
      ...prev,
      {
        id,
        name: 'Gói mới',
        icon: 'award',
        price: 0,
        durationMonths: 1,
        isPopular: false,
        features: [
          { key: 'ai_chat', label: 'AI Chat (Không giới hạn)', enabled: false },
          { key: 'speaking_score', label: 'Chấm điểm Speaking', enabled: false },
          { key: 'writing_fix', label: 'Sửa lỗi Writing', enabled: false },
          { key: 'no_ads', label: 'Không quảng cáo', enabled: false },
        ],
      },
    ])
  }

  const handleSaveAll = () => {
    toast.success('Đã lưu thay đổi gói dịch vụ')
  }

  const handleCreateCoupon = () => {
    if (!newCode.trim() || !newPercent) {
      toast.error('Nhập mã và phần trăm giảm giá')
      return
    }
    setCoupons((prev) => [
      ...prev,
      {
        id: `CPN-${Date.now()}`,
        code: newCode.trim().toUpperCase(),
        discountPercent: Number(newPercent),
        usedCount: 0,
        maxUses: Number(newMaxUses) || 0,
        validUntil: newValidUntil || undefined,
      },
    ])
    setNewCode('')
    setNewPercent('')
    setNewMaxUses('')
    setNewValidUntil('')
    toast.success('Đã tạo mã giảm giá mới')
  }

  return (
    <main className="flex-1 bg-canvas p-6">
      <div className="flex items-center justify-end">
        <Button icon={Save} onClick={handleSaveAll}>
          Lưu Thay Đổi
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-700">
              <LayoutGrid size={18} strokeWidth={1.75} />
              Các Gói Dịch Vụ
            </h2>
            <button
              type="button"
              onClick={handleAddPlan}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              <Plus size={16} strokeWidth={1.75} />
              Thêm Gói Mới
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {plans.map((plan) => {
              const Icon = PLAN_ICON[plan.icon]
              return (
                <Card key={plan.id} className={cn('relative', plan.isPopular && 'border-navy-700')}>
                  {plan.isPopular && (
                    <span className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-navy-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      Phổ biến nhất
                    </span>
                  )}

                  <h3 className="flex items-center gap-2 text-base font-semibold text-navy-700">
                    <Icon size={18} strokeWidth={1.75} className="text-brand-500" />
                    {plan.name}
                  </h3>

                  <div className="mt-4">
                    <label className="text-sm text-ink-muted">Tên Gói</label>
                    <Input
                      className="mt-1"
                      value={plan.name}
                      onChange={(event) => updatePlanField(plan.id, 'name', event.target.value)}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-ink-muted">Giá (VND)</label>
                      <Input
                        className="mt-1"
                        type="number"
                        value={plan.price}
                        onChange={(event) => updatePlanField(plan.id, 'price', Number(event.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-ink-muted">Thời hạn (Tháng)</label>
                      <Input
                        className="mt-1"
                        type="number"
                        value={plan.durationMonths}
                        onChange={(event) =>
                          updatePlanField(plan.id, 'durationMonths', Number(event.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Tính năng bao gồm
                    </p>
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between">
                          <span className="text-sm text-ink">{feature.label}</span>
                          <Switch
                            checked={feature.enabled}
                            onChange={() => toggleFeature(plan.id, feature.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-700">
              <Tag size={18} strokeWidth={1.75} />
              Quản lý Mã Giảm Giá
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    <th className="pb-2">Mã Code</th>
                    <th className="pb-2">Giảm</th>
                    <th className="pb-2 text-right">Đã dùng/Hạn mức</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {coupons.map((coupon) => {
                    const exhausted = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses
                    return (
                      <tr key={coupon.id} className={exhausted ? 'opacity-50' : ''}>
                        <td className="py-2.5 font-semibold text-navy-700">{coupon.code}</td>
                        <td className="py-2.5 font-medium text-[#15803D]">{coupon.discountPercent}%</td>
                        <td className="py-2.5 text-right text-ink-muted">
                          {formatNumber(coupon.usedCount)} / {formatNumber(coupon.maxUses)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Plus size={16} strokeWidth={1.75} />
                Tạo Code Mới
              </p>
              <div className="space-y-2.5">
                <Input
                  placeholder="Nhập mã (VD: NEWYEAR25)"
                  value={newCode}
                  onChange={(event) => setNewCode(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input
                    type="number"
                    placeholder="Giảm %"
                    value={newPercent}
                    onChange={(event) => setNewPercent(event.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Số lượt"
                    value={newMaxUses}
                    onChange={(event) => setNewMaxUses(event.target.value)}
                  />
                </div>
                <Input
                  type="date"
                  value={newValidUntil}
                  onChange={(event) => setNewValidUntil(event.target.value)}
                />
                <Button fullWidth onClick={handleCreateCoupon}>
                  Tạo Mã Giảm Giá
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default PremiumPage
